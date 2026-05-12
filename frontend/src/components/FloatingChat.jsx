import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { api } from "@/lib/api";

const STORAGE_KEY = "sunya_chat_session";

const FloatingChat = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm Sunya Assist 🌱 — ask me about our dried fruits, pricing, delivery, or anything else.",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  const sessionId = (() => {
    let s = localStorage.getItem(STORAGE_KEY);
    if (!s) {
      s = `s-${Math.random().toString(36).slice(2, 11)}-${Date.now()}`;
      localStorage.setItem(STORAGE_KEY, s);
    }
    return s;
  })();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setSending(true);
    try {
      const res = await api.post("/chat", { session_id: sessionId, message: text });
      setMessages((m) => [...m, { role: "assistant", content: res.data.reply }]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: "Sorry, I had trouble connecting. Please try again, or email hello@sunya.com.np.",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <motion.button
        initial={{ scale: 0, rotate: -90 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 1, type: "spring", stiffness: 200 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-[80] w-16 h-16 rounded-full bg-sunya-green text-white shadow-2xl shadow-sunya-green/40 flex items-center justify-center hover:bg-sunya-green-dark transition group"
        data-testid="floating-chat-btn"
        aria-label="Open chat"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="msg" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <MessageCircle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
        {!open && (
          <span className="absolute inset-0 rounded-full bg-sunya-green animate-ping opacity-30 pointer-events-none" />
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed bottom-28 right-6 z-[80] w-[calc(100vw-3rem)] sm:w-96 h-[70vh] sm:h-[560px] flex flex-col bg-white rounded-3xl shadow-2xl border border-sunya-ink/5 overflow-hidden"
            data-testid="chat-window"
          >
            <div className="p-5 bg-gradient-to-br from-sunya-green-dark to-sunya-green text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="font-serif-display text-lg font-bold leading-none">Sunya Assist</div>
                <div className="text-xs text-white/80 mt-1">Powered by Claude · Online</div>
              </div>
              <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center" data-testid="chat-close-btn">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-sunya-ivory/60 no-scrollbar" data-testid="chat-messages">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  data-testid={`chat-msg-${m.role}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${
                      m.role === "user"
                        ? "bg-sunya-green text-white rounded-br-md"
                        : "bg-white text-sunya-ink rounded-bl-md border border-sunya-ink/5"
                    }`}
                  >
                    {m.content}
                  </div>
                </motion.div>
              ))}
              {sending && (
                <div className="flex justify-start" data-testid="chat-typing">
                  <div className="bg-white px-4 py-3 rounded-2xl border border-sunya-ink/5 flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        animate={{ y: [0, -4, 0] }}
                        transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.15 }}
                        className="w-2 h-2 rounded-full bg-sunya-green-dark/60"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); send(); }}
              className="p-4 border-t border-sunya-ink/5 flex items-center gap-2 bg-white"
              data-testid="chat-input-form"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything about Sunya..."
                className="flex-1 px-4 py-3 rounded-full bg-sunya-ivory border border-transparent focus:border-sunya-green-dark outline-none text-sm transition"
                data-testid="chat-input"
              />
              <button
                type="submit"
                disabled={!input.trim() || sending}
                className="w-11 h-11 rounded-full bg-sunya-green text-white flex items-center justify-center disabled:opacity-50 hover:bg-sunya-green-dark transition"
                data-testid="chat-send-btn"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingChat;
