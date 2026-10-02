import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LuMessageCircle, LuSend, LuX } from "react-icons/lu";
import { CONTACT, PROJECTS } from "../data";

type Msg = { from: "bot" | "me"; text: string };
const HELLO =
  "Hey! I'm Haile. Feel free to ask about my projects, the stack I work with, or anything else on the site.";
// Set VITE_CHAT_API to your chat relay server (see server/README.md). Without it the widget answers with the demo rules below.
const API = (import.meta.env.VITE_CHAT_API as string | undefined)?.replace(
  /\/$/,
  "",
);

const store = {
  get: (k: string) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set: (k: string, v: string) => {
    try {
      localStorage.setItem(k, v);
    } catch {
      /* storage unavailable */
    }
  },
};
const sessionId = () => {
  let s = store.get("chat_session");
  if (!s) {
    s = (
      crypto.randomUUID?.() ??
      Math.random().toString(36).slice(2) + Date.now().toString(36)
    ).replace(/[^a-zA-Z0-9-]/g, "");
    store.set("chat_session", s);
  }
  return s;
};

function getReply(q: string): string {
  const t = q.toLowerCase();
  const p = PROJECTS.find(
    (x) => t.includes(x.id) || t.includes(x.name.toLowerCase()),
  );
  if (p) return `${p.name}: ${p.desc} Read more at ${p.url}`;
  if (/project|work|app|built|portfolio/.test(t))
    return `I've built ${PROJECTS.map((x) => x.name).join(", ")}. Ask me about any of them.`;
  if (
    /stack|tech|skill|react|golang|go\b|mongo|three|typescript|tailwind/.test(t)
  )
    return "I work with React Native, Expo, React JS, TypeScript, Tailwind CSS, Three.js, Golang and MongoDB, plus Git, GitHub and Google Maps.";
  if (/contact|email|hire|reach|available|collab/.test(t))
    return `Email me at ${CONTACT.email}. I'm happy to talk about your app idea.`;
  if (/^(hi|hey|hello|yo)\b/.test(t))
    return "Hey! What would you like to know?";
  return "Good question. I can talk about my projects, my stack, or how to contact me. Which one?";
}

export default function Chat() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>(() => {
    try {
      return (
        (JSON.parse(store.get("chat_msgs") ?? "null") as Msg[] | null) ?? [
          { from: "bot", text: HELLO },
        ]
      );
    } catch {
      return [{ from: "bot", text: HELLO }];
    }
  });
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const [text, setText] = useState("");
  const end = useRef<HTMLDivElement>(null);
  const openRef = useRef(open);
  const lastTs = useRef(Number(store.get("chat_last") ?? 0));

  useEffect(() => {
    openRef.current = open;
    if (open) setUnread(0);
  }, [open]);
  useEffect(() => {
    store.set("chat_msgs", JSON.stringify(msgs.slice(-60)));
  }, [msgs]);
  useEffect(
    () => end.current?.scrollIntoView({ behavior: "smooth" }),
    [msgs, typing, open],
  );
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    addEventListener("keydown", k);
    return () => removeEventListener("keydown", k);
  }, []);

  // Live mode: check every 3 seconds for replies from Haile (only after the visitor has sent a message).
  useEffect(() => {
    if (!API) return;
    const id = setInterval(async () => {
      if (document.hidden || !store.get("chat_sent")) return;
      try {
        const r = await fetch(
          `${API}/api/chat/poll?session=${sessionId()}&after=${lastTs.current}`,
        );
        if (!r.ok) return;
        const d = (await r.json()) as {
          messages: { text: string; ts: number }[];
        };
        if (!d.messages.length) return;
        lastTs.current = d.messages[d.messages.length - 1].ts;
        store.set("chat_last", String(lastTs.current));
        setMsgs((m) => [
          ...m,
          ...d.messages.map((x) => ({ from: "bot" as const, text: x.text })),
        ]);
        if (!openRef.current) setUnread((u) => u + d.messages.length);
      } catch {
        /* offline, try again next tick */
      }
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const send = async () => {
    const q = text.trim();
    if (!q) return;
    setMsgs((m) => [...m, { from: "me", text: q }]);
    setText("");
    if (!API) {
      // demo mode
      setTyping(true);
      setTimeout(() => {
        setMsgs((m) => [...m, { from: "bot", text: getReply(q) }]);
        setTyping(false);
      }, 800);
      return;
    }
    try {
      const r = await fetch(`${API}/api/chat/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session: sessionId(), text: q }),
      });
      if (!r.ok) throw new Error(String(r.status));
      if (!store.get("chat_sent")) {
        store.set("chat_sent", "1");
        setMsgs((m) => [
          ...m,
          {
            from: "bot",
            text: "Thanks! I'll reply right here as soon as I can.",
          },
        ]);
      }
    } catch {
      setMsgs((m) => [
        ...m,
        {
          from: "bot",
          text: `I couldn't send that. Please email me at ${CONTACT.email}.`,
        },
      ]);
    }
  };

  return (
    <div className='fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-50 flex flex-col items-end gap-3'>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            className='w-[min(92vw,360px)] h-[460px] flex flex-col rounded-2xl border ln shadow-2xl overflow-hidden'
            style={{ background: "var(--bg)" }}
            role='dialog'
            aria-label='Chat with Haile'
          >
            <div className='flex items-center gap-3 px-4 py-3 border-b ln'>
              <div
                className='disp font-extrabold w-9 h-9 grid place-items-center rounded-full text-sm'
                style={{ background: "var(--ac)", color: "#14201C" }}
              >
                HE
              </div>
              <div className='flex-1'>
                <p className='font-semibold text-sm leading-tight'>
                  Chat with Haile
                </p>
                <p className='text-xs mut flex items-center gap-1'>
                  <span className='w-1.5 h-1.5 rounded-full bg-emerald-500' />
                  Online
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label='Close chat'
                className='p-1 mut hover:opacity-70'
              >
                <LuX size={18} />
              </button>
            </div>
            <div
              className='flex-1 overflow-y-auto p-4 flex flex-col gap-2 text-sm'
              aria-live='polite'
            >
              {msgs.map((m, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={
                    "max-w-[80%] px-3 py-2 rounded-2xl whitespace-pre-wrap break-words " +
                    (m.from === "me"
                      ? "self-end rounded-br-sm"
                      : "self-start rounded-bl-sm border ln")
                  }
                  style={
                    m.from === "me"
                      ? { background: "var(--fg)", color: "var(--bg)" }
                      : undefined
                  }
                >
                  {m.text}
                </motion.p>
              ))}
              {typing && (
                <p className='self-start px-3 py-2 rounded-2xl border ln mut'>
                  Haile is typing...
                </p>
              )}
              <div ref={end} />
            </div>
            <div className='flex gap-2 p-3 border-t ln'>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder='Type a message...'
                maxLength={1000}
                aria-label='Message'
                className='flex-1 min-w-0 px-4 py-2 rounded-full border ln bg-transparent text-sm'
              />
              <button
                onClick={send}
                aria-label='Send message'
                className='w-10 h-10 grid place-items-center rounded-full'
                style={{ background: "var(--fg)", color: "var(--bg)" }}
              >
                <LuSend size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className='btn relative flex items-center gap-2 shadow-lg'
        style={{ background: "var(--fg)", color: "var(--bg)" }}
      >
        <LuMessageCircle size={18} />
        Chat with Haile
        {unread > 0 && (
          <span
            className='absolute -top-1 -right-1 min-w-5 h-5 px-1 grid place-items-center rounded-full text-xs font-bold'
            style={{ background: "var(--ac)", color: "#14201C" }}
            aria-label={`${unread} new replies`}
          >
            {unread}
          </span>
        )}
      </button>
    </div>
  );
}
