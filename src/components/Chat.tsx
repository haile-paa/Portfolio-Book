import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LuMessageCircle, LuSend, LuX } from "react-icons/lu";
import { CONTACT, PROJECTS } from "../data";

type Msg = { from: "bot" | "me"; text: string };
const HELLO = "Hey! I'm Haile. Feel free to ask about my projects, the stack I work with, or anything else on the site.";

// Rule-based replies. Swap this function for a call to your own API (for example a Go endpoint) to make the chat live.
function getReply(q: string): string {
  const t = q.toLowerCase();
  const p = PROJECTS.find((x) => t.includes(x.id) || t.includes(x.name.toLowerCase()));
  if (p) return `${p.name}: ${p.desc} Read more at ${p.url}`;
  if (/project|work|app|built|portfolio/.test(t)) return `I've built ${PROJECTS.map((x) => x.name).join(", ")}. Ask me about any of them.`;
  if (/stack|tech|skill|react|golang|go\b|mongo|three|typescript|tailwind/.test(t)) return "I work with React Native, Expo, React JS, TypeScript, Tailwind CSS, Three.js, Golang and MongoDB, plus Git, GitHub and Google Maps.";
  if (/contact|email|hire|reach|available|collab/.test(t)) return `Email me at ${CONTACT.email}. I'm happy to talk about your app idea.`;
  if (/^(hi|hey|hello|yo)\b/.test(t)) return "Hey! What would you like to know?";
  return "Good question. I can talk about my projects, my stack, or how to contact me. Which one?";
}

export default function Chat() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([{ from: "bot", text: HELLO }]);
  const [typing, setTyping] = useState(false);
  const [text, setText] = useState("");
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => end.current?.scrollIntoView({ behavior: "smooth" }), [msgs, typing, open]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    addEventListener("keydown", k); return () => removeEventListener("keydown", k);
  }, []);
  const send = () => {
    const q = text.trim(); if (!q) return;
    setMsgs((m) => [...m, { from: "me", text: q }]); setText(""); setTyping(true);
    setTimeout(() => { setMsgs((m) => [...m, { from: "bot", text: getReply(q) }]); setTyping(false); }, 800);
  };
  return (
    <div className="fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.96 }}
            className="w-[min(92vw,360px)] h-[460px] flex flex-col rounded-2xl border ln shadow-2xl overflow-hidden" style={{ background: "var(--bg)" }} role="dialog" aria-label="Chat with Haile">
            <div className="flex items-center gap-3 px-4 py-3 border-b ln">
              <div className="disp font-extrabold w-9 h-9 grid place-items-center rounded-full text-sm" style={{ background: "var(--ac)", color: "#14201C" }}>HE</div>
              <div className="flex-1"><p className="font-semibold text-sm leading-tight">Chat with Haile</p>
                <p className="text-xs mut flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Online</p></div>
              <button onClick={() => setOpen(false)} aria-label="Close chat" className="p-1 mut hover:opacity-70"><LuX size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 text-sm">
              {msgs.map((m, i) => (
                <motion.p key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={"max-w-[80%] px-3 py-2 rounded-2xl " + (m.from === "me" ? "self-end rounded-br-sm" : "self-start rounded-bl-sm border ln")}
                  style={m.from === "me" ? { background: "var(--fg)", color: "var(--bg)" } : undefined}>{m.text}</motion.p>
              ))}
              {typing && <p className="self-start px-3 py-2 rounded-2xl border ln mut" aria-live="polite">Haile is typing...</p>}
              <div ref={end} />
            </div>
            <div className="flex gap-2 p-3 border-t ln">
              <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Type a message..."
                aria-label="Message" className="flex-1 min-w-0 px-4 py-2 rounded-full border ln bg-transparent text-sm" />
              <button onClick={send} aria-label="Send message" className="w-10 h-10 grid place-items-center rounded-full" style={{ background: "var(--fg)", color: "var(--bg)" }}><LuSend size={16} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="btn flex items-center gap-2 shadow-lg" style={{ background: "var(--fg)", color: "var(--bg)" }}>
        <LuMessageCircle size={18} />Chat with Haile
      </button>
    </div>
  );
}
