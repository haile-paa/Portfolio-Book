// Chat relay: website widget <-> Go API <-> Telegram bot, with messages stored in MongoDB.
package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Msg struct {
	Session string `bson:"session" json:"-"`
	From    string `bson:"from" json:"from"` // "visitor" or "haile"
	Text    string `bson:"text" json:"text"`
	TS      int64  `bson:"ts" json:"ts"`
}

// Thread maps a Telegram message id to the visitor session it came from.
type Thread struct {
	ID      int64  `bson:"_id"`
	Session string `bson:"session"`
}

var (
	token     = os.Getenv("TELEGRAM_BOT_TOKEN")
	secret    = os.Getenv("WEBHOOK_SECRET")
	origins   = strings.Split(os.Getenv("ALLOWED_ORIGINS"), ",")
	ownerID   int64
	msgs      *mongo.Collection
	threads   *mongo.Collection
	sessionRe = regexp.MustCompile(`^[a-zA-Z0-9-]{8,64}$`)
	hc        = &http.Client{Timeout: 10 * time.Second}
	mu        sync.Mutex
	lastSent  = map[string]time.Time{}
)

func env(k, d string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return d
}

func tg(method string, body any) (json.RawMessage, error) {
	b, _ := json.Marshal(body)
	res, err := hc.Post("https://api.telegram.org/bot"+token+"/"+method, "application/json", bytes.NewReader(b))
	if err != nil {
		return nil, fmt.Errorf("%s", strings.ReplaceAll(err.Error(), token, "***")) // never log the token
	}
	defer res.Body.Close()
	var out struct {
		OK          bool            `json:"ok"`
		Result      json.RawMessage `json:"result"`
		Description string          `json:"description"`
	}
	if err := json.NewDecoder(res.Body).Decode(&out); err != nil {
		return nil, err
	}
	if !out.OK {
		return nil, fmt.Errorf("telegram: %s", out.Description)
	}
	return out.Result, nil
}

func allowed(o string) bool {
	for _, a := range origins {
		if a = strings.TrimSpace(a); a == "*" || (a != "" && a == o) {
			return true
		}
	}
	return false
}

func cors(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if o := r.Header.Get("Origin"); o != "" && allowed(o) {
			w.Header().Set("Access-Control-Allow-Origin", o)
			w.Header().Set("Vary", "Origin")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		}
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// POST /api/chat/send {session, text}: store the visitor message and forward it to Telegram.
func send(w http.ResponseWriter, r *http.Request) {
	var in struct{ Session, Text string }
	r.Body = http.MaxBytesReader(w, r.Body, 8<<10)
	if json.NewDecoder(r.Body).Decode(&in) != nil || !sessionRe.MatchString(in.Session) {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}
	in.Text = strings.TrimSpace(in.Text)
	if in.Text == "" || len([]rune(in.Text)) > 1000 {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}
	ip := strings.TrimSpace(strings.Split(r.Header.Get("X-Forwarded-For"), ",")[0])
	if ip == "" {
		ip = r.RemoteAddr
	}
	mu.Lock()
	if time.Since(lastSent[ip]) < 1500*time.Millisecond {
		mu.Unlock()
		http.Error(w, "slow down", http.StatusTooManyRequests)
		return
	}
	lastSent[ip] = time.Now()
	mu.Unlock()

	ctx := r.Context()
	if _, err := msgs.InsertOne(ctx, Msg{in.Session, "visitor", in.Text, time.Now().UnixMilli()}); err != nil {
		http.Error(w, "server error", http.StatusInternalServerError)
		return
	}
	res, err := tg("sendMessage", map[string]any{
		"chat_id": ownerID,
		"text":    "Visitor " + in.Session[:6] + ":\n\n" + in.Text + "\n\n(swipe-reply to answer)",
	})
	if err != nil {
		log.Println("send:", err)
		http.Error(w, "could not deliver", http.StatusBadGateway)
		return
	}
	var m struct {
		MessageID int64 `json:"message_id"`
	}
	_ = json.Unmarshal(res, &m)
	_, _ = threads.InsertOne(ctx, Thread{m.MessageID, in.Session})
	w.WriteHeader(http.StatusNoContent)
}

// GET /api/chat/poll?session=...&after=<ms>: replies from Haile newer than `after`.
func poll(w http.ResponseWriter, r *http.Request) {
	s := r.URL.Query().Get("session")
	after, _ := strconv.ParseInt(r.URL.Query().Get("after"), 10, 64)
	if !sessionRe.MatchString(s) {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}
	cur, err := msgs.Find(r.Context(), bson.M{"session": s, "from": "haile", "ts": bson.M{"$gt": after}},
		options.Find().SetSort(bson.D{{Key: "ts", Value: 1}}).SetLimit(50))
	out := []Msg{}
	if err == nil {
		err = cur.All(r.Context(), &out)
	}
	if err != nil {
		http.Error(w, "server error", http.StatusInternalServerError)
		return
	}
	if out == nil {
		out = []Msg{}
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{"messages": out})
}

// POST /api/telegram/webhook: called by Telegram when you reply to a visitor message.
func webhook(w http.ResponseWriter, r *http.Request) {
	if r.Header.Get("X-Telegram-Bot-Api-Secret-Token") != secret {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}
	var u struct {
		Message *struct {
			Chat struct {
				ID int64 `json:"id"`
			} `json:"chat"`
			Text    string `json:"text"`
			ReplyTo *struct {
				MessageID int64 `json:"message_id"`
			} `json:"reply_to_message"`
		} `json:"message"`
	}
	r.Body = http.MaxBytesReader(w, r.Body, 64<<10)
	_ = json.NewDecoder(r.Body).Decode(&u)
	w.WriteHeader(http.StatusOK) // always 200 so Telegram doesn't retry
	if u.Message == nil || u.Message.Chat.ID != ownerID || u.Message.Text == "" {
		return
	}
	hint := func(t string) { _, _ = tg("sendMessage", map[string]any{"chat_id": ownerID, "text": t}) }
	if u.Message.ReplyTo == nil {
		hint("Swipe-reply to a visitor message so I know who to send it to.")
		return
	}
	var th Thread
	if err := threads.FindOne(r.Context(), bson.M{"_id": u.Message.ReplyTo.MessageID}).Decode(&th); err != nil {
		hint("I can't match that to a visitor. Reply directly to one of the visitor messages.")
		return
	}
	if _, err := msgs.InsertOne(r.Context(), Msg{th.Session, "haile", u.Message.Text, time.Now().UnixMilli()}); err != nil {
		log.Println("save reply:", err)
	}
}

func main() {
	var err error
	ownerID, err = strconv.ParseInt(os.Getenv("OWNER_CHAT_ID"), 10, 64)
	if err != nil || token == "" || secret == "" {
		log.Fatal("set TELEGRAM_BOT_TOKEN, OWNER_CHAT_ID and WEBHOOK_SECRET")
	}
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()
	cl, err := mongo.Connect(ctx, options.Client().ApplyURI(os.Getenv("MONGODB_URI")))
	if err != nil {
		log.Fatal(err)
	}
	db := cl.Database(env("MONGODB_DB", "portfolio"))
	msgs, threads = db.Collection("messages"), db.Collection("threads")
	_, _ = msgs.Indexes().CreateOne(ctx, mongo.IndexModel{Keys: bson.D{{Key: "session", Value: 1}, {Key: "from", Value: 1}, {Key: "ts", Value: 1}}})

	if pu := os.Getenv("PUBLIC_URL"); pu != "" { // registers the webhook for you on startup
		_, err := tg("setWebhook", map[string]any{"url": strings.TrimRight(pu, "/") + "/api/telegram/webhook", "secret_token": secret, "allowed_updates": []string{"message"}})
		log.Println("setWebhook:", err)
	}
	go func() { // forget old rate-limit entries
		for range time.Tick(10 * time.Minute) {
			mu.Lock()
			for k, t := range lastSent {
				if time.Since(t) > time.Minute {
					delete(lastSent, k)
				}
			}
			mu.Unlock()
		}
	}()

	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, _ *http.Request) { _, _ = w.Write([]byte("ok")) })
	mux.HandleFunc("POST /api/chat/send", send)
	mux.HandleFunc("GET /api/chat/poll", poll)
	mux.HandleFunc("POST /api/telegram/webhook", webhook)
	log.Println("listening on :" + env("PORT", "8080"))
	log.Fatal(http.ListenAndServe(":"+env("PORT", "8080"), cors(mux)))
}
