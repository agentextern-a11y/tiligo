import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ReactMarkdown from "react-markdown";

const LOGO_DARK = "https://media.base44.com/images/public/69d519273be8cf966434f77a/9ac65c451_IMG_0066.png";
const LOGO_LIGHT = "https://media.base44.com/images/public/69d519273be8cf966434f77a/9ac65c451_IMG_0066.png";

// Detect mobile
function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth < 640);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 640);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return mobile;
}

export default function AgentChatButton({
  agentName,
  label,
  sublabel,
  emoji,
  accentColor = "#00BFFF",
  secondColor,
  position = "right",
  quickReplies = []
}) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const isMobile = useIsMobile();
  const grad = `linear-gradient(135deg, ${accentColor}, ${secondColor || accentColor + "bb"})`;

  useEffect(() => {
    if (!open || conversation) return;
    setLoading(true);
    base44.agents.createConversation({ agent_name: agentName, metadata: { name: label } }).
    then((c) => {setConversation(c);setMessages(c.messages || []);setLoading(false);});
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

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || !conversation || sending) return;
    setInput("");
    setSending(true);
    await base44.agents.addMessage(conversation, { role: "user", content: msg });
  };

  // FAB position
  const fabPos = position === "left" ?
  { left: 16, right: "auto" } :
  { right: 16, left: "auto" };

  // Chat window: full screen on mobile, floating on desktop
  const chatStyle = isMobile ?
  { inset: 0, borderRadius: 0, width: "100%", height: "100%" } :
  {
    bottom: 88,
    ...(position === "left" ? { left: 16 } : { right: 16 }),
    width: 360,
    height: 540,
    borderRadius: 28
  };

  return (
    <>
      {/* FAB */}
      <AnimatePresence>
        {!open &&
        <motion.button
          key="fab"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.12, y: -3 }}
          whileTap={{ scale: 0.93 }}
          onClick={() => setOpen(true)}
          className="fixed z-40 flex flex-col items-center gap-1"
          style={{ bottom: 88, ...fabPos }}>
            {/* Ripple ring */}
            <motion.div
            className="absolute inset-0 rounded-full"
            animate={{ scale: [1, 1.5, 1.5], opacity: [0.5, 0, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeOut" }}
            style={{ background: accentColor }} />
          
            <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl relative overflow-hidden"
          style={{ background: grad, boxShadow: `0 6px 28px ${accentColor}66` }}>
              {/* Logo watermark inside FAB */}
              <img src="https://media.base44.com/images/public/69d519273be8cf966434f77a/696d759d4_logo.ico" alt="" className="w-8 h-8 object-contain" style={{ filter: "brightness(0) invert(1)" }} />
            </div>
            {/* Tooltip label */}
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full whitespace-nowrap shadow-lg"
          style={{ background: grad, color: "#020c1b", maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis" }}>
              {label}
            </span>
          </motion.button>
        }
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {open &&
        <motion.div
          key="chat"
          initial={isMobile ? { y: "100%" } : { opacity: 0, scale: 0.88, y: 24 }}
          animate={isMobile ? { y: 0 } : { opacity: 1, scale: 1, y: 0 }}
          exit={isMobile ? { y: "100%" } : { opacity: 0, scale: 0.88, y: 24 }}
          transition={{ type: "spring", damping: 30, stiffness: 320 }}
          className="fixed z-50 flex flex-col overflow-hidden"
          style={{
            ...chatStyle,
            background: "linear-gradient(175deg, #020c1b 0%, #0a1f3a 60%, #030d1a 100%)",
            border: isMobile ? "none" : `1.5px solid ${accentColor}33`,
            boxShadow: isMobile ? "none" : `0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px ${accentColor}18`
          }}>

            {/* Decorative blobs */}
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none opacity-20"
          style={{ background: `radial-gradient(circle, ${accentColor}, transparent 70%)`, transform: "translate(30%,-30%)" }} />
            <div className="absolute bottom-16 left-0 w-32 h-32 rounded-full pointer-events-none opacity-10"
          style={{ background: `radial-gradient(circle, ${secondColor || accentColor}, transparent 70%)`, transform: "translate(-30%,30%)" }} />

            {/* ── HEADER ── */}
            <div className="relative z-10 flex items-center gap-3 px-4 pt-4 pb-3 flex-shrink-0"
          style={{ borderBottom: `1px solid ${accentColor}20` }}>
              {/* Logo avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-11 h-11 rounded-2xl overflow-hidden flex items-center justify-center shadow-lg"
              style={{ background: grad }}>
                  <img src={LOGO_DARK} alt="TiliGo" className="w-8 h-8 object-contain" style={{ filter: "brightness(0) invert(1)" }} />
                </div>
                {/* Online dot */}
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#020c1b] bg-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-sm text-white leading-tight truncate">{label}</p>
                <p className="text-xs font-medium truncate" style={{ color: `${accentColor}99` }}>
                  {sublabel || "TiliGo AI · Gjithmonë online"}
                </p>
              </div>
              {/* Emoji badge */}
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-lg flex-shrink-0"
            style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}33` }}>
                {emoji}
              </div>
              <button onClick={() => setOpen(false)}
            className="w-9 h-9 rounded-2xl flex items-center justify-center transition-all hover:bg-white/10 active:scale-90 flex-shrink-0"
            style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                <X size={16} className="text-white/70" />
              </button>
            </div>

            {/* ── MESSAGES ── */}
            <div className="relative z-10 flex-1 overflow-y-auto px-4 py-4 space-y-3 no-scrollbar opacity-80 rounded-[48px]">
              {/* Welcome state */}
              {messages.length === 0 && !loading &&
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center py-6">
                  <motion.div
                animate={{ scale: [1, 1.06, 1] }} transition={{ repeat: Infinity, duration: 3 }}
                className="w-16 h-16 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-xl"
                style={{ background: grad }}>
                    <img src={LOGO_DARK} alt="TiliGo" className="w-11 h-11 object-contain" style={{ filter: "brightness(0) invert(1)" }} />
                  </motion.div>
                  <p className="font-black text-base text-white mb-1">{label}</p>
                  <p className="text-xs mb-4" style={{ color: `${accentColor}88` }}>
                    {sublabel || "Si mund t'ju ndihmoj sot? 😊"}
                  </p>
                  {/* Quick reply chips */}
                  {quickReplies.length > 0 &&
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                      {quickReplies.map((q, i) =>
                <motion.button key={i} whileTap={{ scale: 0.95 }}
                onClick={() => sendMessage(q)}
                className="text-xs font-bold px-3 py-1.5 rounded-full transition-all"
                style={{ background: `${accentColor}18`, color: accentColor, border: `1px solid ${accentColor}44` }}>
                          {q}
                        </motion.button>
                )}
                    </div>
              }
                </motion.div>
            }

              {/* Loading skeleton */}
              {loading &&
            <div className="flex justify-start gap-2">
                  {[1, 2, 3].map((i) =>
              <div key={i} className="w-2 h-2 rounded-full animate-pulse" style={{ background: accentColor, animationDelay: `${i * 0.15}s` }} />
              )}
                </div>
            }

              {/* Messages */}
              {messages.map((msg, i) => {
              const isUser = msg.role === "user";
              return (
                <motion.div key={i}
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
                    {!isUser &&
                  <div className="w-7 h-7 rounded-xl flex-shrink-0 flex items-center justify-center mb-0.5"
                  style={{ background: grad }}>
                        <img src={LOGO_DARK} alt="" className="w-5 h-5 object-contain" style={{ filter: "brightness(0) invert(1)" }} />
                      </div>
                  }
                    <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 ${isUser ? "rounded-br-sm" : "rounded-bl-sm"}`}
                  style={isUser ?
                  { background: grad, boxShadow: `0 4px 16px ${accentColor}44` } :
                  { background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.09)", backdropFilter: "blur(10px)" }}>
                      {msg.role === "assistant" ?
                    <ReactMarkdown className="prose prose-sm prose-invert max-w-none text-xs leading-relaxed [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_strong]:text-white [&_a]:text-sky-300">{msg.content}</ReactMarkdown> :
                    <p className="text-sm text-white leading-snug">{msg.content}</p>
                    }
                    </div>
                  </motion.div>);

            })}

              {/* Typing indicator */}
              {sending &&
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-end gap-2 justify-start">
                  <div className="w-7 h-7 rounded-xl flex-shrink-0 flex items-center justify-center"
              style={{ background: grad }}>
                    <img src={LOGO_DARK} alt="" className="w-5 h-5 object-contain" style={{ filter: "brightness(0) invert(1)" }} />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-bl-sm"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.09)" }}>
                    <div className="flex gap-1.5 items-center">
                      {[0, 1, 2].map((i) =>
                  <motion.div key={i} className="w-2 h-2 rounded-full"
                  style={{ background: accentColor }}
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }} />
                  )}
                    </div>
                  </div>
                </motion.div>
            }
              <div ref={bottomRef} />
            </div>

            {/* ── INPUT ── */}
            <div className="relative z-10 px-3 pb-4 pt-2 flex-shrink-0"
          style={{ borderTop: `1px solid ${accentColor}18` }}>
              <div className="flex gap-2 items-center">
                <div className="flex-1 flex items-center rounded-2xl overflow-hidden"
              style={{ background: "rgba(255,255,255,0.06)", border: `1.5px solid ${accentColor}30` }}>
                  <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Shkruaj mesazhin..."
                  className="flex-1 bg-transparent px-4 py-3 text-sm outline-none"
                  style={{ color: "#e0f2fe" }} />
                
                  {/* Sparkle icon inside input */}
                  <Sparkles size={14} className="mr-3 flex-shrink-0 opacity-30" style={{ color: accentColor }} />
                </div>
                <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => sendMessage()}
                disabled={!input.trim() || sending}
                className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg disabled:opacity-30 transition-opacity"
                style={{ background: grad, boxShadow: `0 4px 18px ${accentColor}55` }}>
                  <Send size={16} style={{ color: "#020c1b" }} />
                </motion.button>
              </div>
              {/* Branding */}
              <p className="text-center text-[10px] mt-2 font-semibold" style={{ color: `${accentColor}44` }}>
                Powered by TiliGo AI
              </p>
            </div>
          </motion.div>
        }
      </AnimatePresence>
    </>);

}