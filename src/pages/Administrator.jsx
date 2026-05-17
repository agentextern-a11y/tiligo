import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Eye, EyeOff, Lock, User, AlertTriangle } from "lucide-react";
import { verifySecurityKeyword, verifyAdminCredentials, setAdminSession } from "@/lib/adminAuth";

export default function Administrator() {
  const navigate = useNavigate();
  const [step, setStep] = useState("security"); // security | login | blocked
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [securityError, setSecurityError] = useState("");
  const [loginForm, setLoginForm] = useState({ user: "", pass: "" });
  const [loginError, setLoginError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [attempted, setAttempted] = useState(false);

  const handleSecuritySubmit = (e) => {
    e.preventDefault();
    if (verifySecurityKeyword(securityAnswer)) {
      setStep("login");
    } else {
      if (attempted) {
        setStep("blocked");
      } else {
        setAttempted(true);
        setSecurityError("Qasja u bllokua. Ju nuk jeni i autorizuar.");
        setStep("blocked");
      }
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (verifyAdminCredentials(loginForm.user, loginForm.pass)) {
      setAdminSession();
      navigate("/admin");
    } else {
      setLoginError("Kredencialet janë të pasakta.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #020c1b 0%, #0a1a2e 40%, #051020 100%)" }}>

      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ backgroundImage: "linear-gradient(rgba(0,191,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,191,255,0.3) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(0,191,255,0.08) 0%, transparent 70%)" }} />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(57,255,107,0.06) 0%, transparent 70%)" }} />

      <div className="relative z-10 w-full max-w-md px-6">
        <AnimatePresence mode="wait">

          {/* BLOCKED */}
          {step === "blocked" && (
            <motion.div key="blocked"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="rounded-3xl p-8 text-center"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", backdropFilter: "blur(20px)" }}>
              <motion.div
                animate={{ rotate: [0, -5, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)" }}>
                <AlertTriangle size={36} style={{ color: "#EF4444" }} />
              </motion.div>
              <h2 className="font-black text-2xl mb-2 text-white">Qasja u Bllokua</h2>
              <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.5)" }}>
                Ky sistem ka zbuluar një tentim të paautorizuar. Aksesi është mohuar.
              </p>
              <div className="text-xs font-mono px-4 py-3 rounded-xl" style={{ background: "rgba(239,68,68,0.12)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)" }}>
                ACCESS_DENIED · UNAUTHORIZED_ATTEMPT_LOGGED
              </div>
            </motion.div>
          )}

          {/* SECURITY GATE */}
          {step === "security" && (
            <motion.div key="security"
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>

              {/* Logo */}
              <div className="text-center mb-8">
                <motion.div
                  animate={{ boxShadow: ["0 0 20px rgba(0,191,255,0.3)", "0 0 40px rgba(57,255,107,0.3)", "0 0 20px rgba(0,191,255,0.3)"] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: "linear-gradient(135deg, rgba(0,191,255,0.15), rgba(57,255,107,0.1))", border: "1px solid rgba(0,191,255,0.3)" }}>
                  <Shield size={36} style={{ color: "#00BFFF" }} />
                </motion.div>
                <h1 className="font-black text-3xl text-white mb-1">Sistem i Mbrojtur</h1>
                <p className="text-sm" style={{ color: "rgba(125,211,252,0.6)" }}>Zona e Administratorit · TiliGo</p>
              </div>

              {/* Security Card */}
              <div className="rounded-3xl p-6"
                style={{ background: "rgba(8,22,48,0.9)", border: "1px solid rgba(0,191,255,0.2)", backdropFilter: "blur(20px)" }}>
                <div className="flex items-center gap-3 mb-5 p-3 rounded-2xl" style={{ background: "rgba(0,191,255,0.08)", border: "1px solid rgba(0,191,255,0.15)" }}>
                  <Lock size={16} style={{ color: "#00BFFF" }} />
                  <p className="text-sm font-semibold" style={{ color: "#7DD3FC" }}>Pyetje Sigurie</p>
                </div>

                <p className="text-lg font-bold text-white mb-2">Kush jeni ju?</p>
                <p className="text-sm mb-5" style={{ color: "rgba(125,211,252,0.6)" }}>
                  Vetëm personeli i autorizuar mund të vazhdojë.
                </p>

                {securityError && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    className="mb-4 px-4 py-3 rounded-xl text-sm font-semibold"
                    style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#F87171" }}>
                    {securityError}
                  </motion.div>
                )}

                <form onSubmit={handleSecuritySubmit} className="space-y-4">
                  <input
                    value={securityAnswer}
                    onChange={e => setSecurityAnswer(e.target.value)}
                    placeholder="Shkruani fjalën kyçe..."
                    autoComplete="off"
                    required
                    className="w-full rounded-2xl px-4 py-4 text-sm font-medium outline-none"
                    style={{ background: "rgba(0,40,80,0.6)", border: "1.5px solid rgba(0,191,255,0.25)", color: "#e0f2fe" }}
                  />
                  <button type="submit"
                    className="w-full font-black py-4 rounded-2xl text-sm transition-all active:scale-95"
                    style={{ background: "linear-gradient(135deg, #00BFFF, #0066FF)", color: "#fff", boxShadow: "0 4px 20px rgba(0,191,255,0.3)" }}>
                    Vazhdo →
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* LOGIN */}
          {step === "login" && (
            <motion.div key="login"
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>

              <div className="text-center mb-8">
                <motion.div
                  animate={{ boxShadow: ["0 0 20px rgba(57,255,107,0.3)", "0 0 40px rgba(0,191,255,0.3)", "0 0 20px rgba(57,255,107,0.3)"] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: "linear-gradient(135deg, rgba(57,255,107,0.12), rgba(0,191,255,0.1))", border: "1px solid rgba(57,255,107,0.3)" }}>
                  <User size={36} style={{ color: "#39FF6B" }} />
                </motion.div>
                <h1 className="font-black text-3xl text-white mb-1">Control Center</h1>
                <p className="text-sm" style={{ color: "rgba(125,211,252,0.6)" }}>Autentifikimi i Administratorit</p>
              </div>

              <div className="rounded-3xl p-6"
                style={{ background: "rgba(8,22,48,0.9)", border: "1px solid rgba(57,255,107,0.2)", backdropFilter: "blur(20px)" }}>

                {loginError && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    className="mb-4 px-4 py-3 rounded-xl text-sm font-semibold"
                    style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#F87171" }}>
                    {loginError}
                  </motion.div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest mb-2 block" style={{ color: "rgba(125,211,252,0.6)" }}>Username</label>
                    <input
                      value={loginForm.user}
                      onChange={e => setLoginForm({ ...loginForm, user: e.target.value })}
                      placeholder="Emri i përdoruesit"
                      required
                      className="w-full rounded-2xl px-4 py-4 text-sm font-medium outline-none"
                      style={{ background: "rgba(0,40,80,0.6)", border: "1.5px solid rgba(0,191,255,0.25)", color: "#e0f2fe" }}
                    />
                  </div>
                  <div className="relative">
                    <label className="text-xs font-bold uppercase tracking-widest mb-2 block" style={{ color: "rgba(125,211,252,0.6)" }}>Password</label>
                    <input
                      type={showPass ? "text" : "password"}
                      value={loginForm.pass}
                      onChange={e => setLoginForm({ ...loginForm, pass: e.target.value })}
                      placeholder="••••••••••"
                      required
                      className="w-full rounded-2xl px-4 py-4 pr-12 text-sm font-medium outline-none"
                      style={{ background: "rgba(0,40,80,0.6)", border: "1.5px solid rgba(0,191,255,0.25)", color: "#e0f2fe" }}
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-4 bottom-4"
                      style={{ color: "rgba(125,211,252,0.5)" }}>
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <button type="submit"
                    className="w-full font-black py-4 rounded-2xl text-sm transition-all active:scale-95 mt-2"
                    style={{ background: "linear-gradient(135deg, #39FF6B, #00BFFF)", color: "#020c1b", boxShadow: "0 4px 24px rgba(57,255,107,0.3)" }}>
                    Hyr në Dashboard →
                  </button>
                </form>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}