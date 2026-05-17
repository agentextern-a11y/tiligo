import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, MessageCircle, Bot } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ReactMarkdown from "react-markdown";

export default function AgentChatButton({ agentName, label, emoji, accentColor = "#00BFFF", position = "right" }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [conversation, setConversation] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!open || conversation) return;
    // Create a new conversation when chat opens
    base44.agents.createConversation({ agent_name: agentName, metadata: { name: "Customer Chat" } })
      .then(c => {
        setConversation(c);
        setMessages(c.messages || []);
      });
  }, [open]);

  useEffect(() => {
    if (!conversation?.id) return;
    const unsub = base44.agents.subscribeToConversation(conversation.id, (data) => {
      setMessages(data.messages || []);
      setSending(false);
    });
    return unsub;
  }, [conversation?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !conversation || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);
    await base44.agents.addMessage(conversation, { role: "user", content: text });
  };

  const posStyle = position === "left"
    ? { left: 20, right: "auto" }
    : { right: 20, left: "auto" };

  return (
    <>
      {/* FAB Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(true)}
        className="fixed bottom-24 z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl text-xl"
        style={{ ...posStyle, background: `linear-gradient(135deg, ${accentColor}, ${accentColor}bb)`, boxShadow: `0 4px 24px ${accentColor}66` }}>
        {open ? "✕" : emoji}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 28, stiffness: 350 }}
            className="fixed z-50 w-[340px] max-w-[92vw] rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            style={{
              bottom: 100,
              ...(position === "left" ? { left: 16 } : { right: 16 }),
              height: 480,
              background: "#030d1a",
              border: `1.5px solid ${accentColor}44`,
              boxShadow: `0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px ${accentColor}22`
            }}>

            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3.5 flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${accentColor}22, transparent)`, borderBottom: `1px solid ${accentColor}22` }}>
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: `${accentColor}22`, border: `1px solid ${accentColor}44` }}>
                <Bot size={18} style={{ color: accentColor }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-sm text-white truncate">{label}</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs" style={{ color: `${accentColor}aa` }}>Online · TiliGo AI</span>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-white/10">
                <X size={16} style={{ color: accentColor }} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 no-scrollbar">
              {messages.length === 0 && !sending && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">{emoji}</div>
                  <p className="text-sm font-bold text-white">{label}</p>
                  <p className="text-xs mt-1" style={{ color: `${accentColor}88` }}>Si mund t'ju ndihmoj sot?</p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
                    msg.role === "user"
                      ? "text-white rounded-br-sm"
                      : "text-white rounded-bl-sm"
                  }`}
                  style={msg.role === "user"
                    ? { background: `linear-gradient(135deg, ${accentColor}, ${accentColor}bb)` }
                    : { background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    {msg.role === "assistant"
                      ? <ReactMarkdown className="prose prose-sm prose-invert max-w-none text-xs leading-relaxed [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">{msg.content}</ReactMarkdown>
                      : <p className="text-sm leading-snug">{msg.content}</p>
                    }
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex justify-start">
                  <div className="px-4 py-3 rounded-2xl rounded-bl-sm" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <div className="flex gap-1.5">
                      {[0,1,2].map(i => (
                        <motion.div key={i} className="w-1.5 h-1.5 rounded-full"
                          style={{ background: accentColor }}
                          animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                          transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-3 pb-3 pt-2 flex-shrink-0" style={{ borderTop: `1px solid ${accentColor}22` }}>
              <div className="flex gap-2 items-end">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Shkruaj këtu..."
                  className="flex-1 rounded-2xl px-3.5 py-2.5 text-sm outline-none resize-none"
                  style={{ background: "rgba(255,255,255,0.07)", border: `1px solid ${accentColor}33`, color: "#e0f2fe" }}
                />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={sendMessage}
                  disabled={!input.trim() || sending}
                  className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 disabled:opacity-40"
                  style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}bb)` }}>
                  <Send size={15} style={{ color: "#020c1b" }} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}