import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChefHat, Bike, ShieldCheck } from "lucide-react";

export default function StaffHub() {
  const navigate = useNavigate();

  const options = [
    {
      icon: "🏪",
      title: "Biznesi",
      desc: "Hyr në panelin e biznesit tënd",
      color: "rgba(0,191,255,0.15)",
      border: "rgba(0,191,255,0.4)",
      textColor: "#00BFFF",
      loginPath: "/biznesi/login",
      registerPath: "/biznesi/register",
      loginLabel: "Hyr si Biznes",
      registerLabel: "Regjistro Biznesin",
    },
    {
      icon: "🛵",
      title: "Dorëzuesi",
      desc: "Hyr në panelin e dorëzuesit",
      color: "rgba(57,255,107,0.15)",
      border: "rgba(57,255,107,0.4)",
      textColor: "#39FF6B",
      loginPath: "/dorezuesi/login",
      registerPath: "/dorezuesi/register",
      loginLabel: "Hyr si Dorëzues",
      registerLabel: "Regjistro si Dorëzues",
    },
  ];

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--bg-body)' }}>
      {/* Header */}
      <div className="sticky top-0 z-50" style={{ background: 'var(--nav-bg)', borderBottom: '1px solid var(--nav-border)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <ShieldCheck size={20} style={{ color: '#00BFFF' }} />
          <h1 className="font-black text-sm tracking-wide" style={{ color: 'var(--text-heading)' }}>PORTALI I STAFIT</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-8 space-y-5">
        {/* Info */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-5 text-center"
          style={{ background: 'linear-gradient(135deg,rgba(0,191,255,0.1),rgba(57,255,107,0.08))', border: '1px solid rgba(0,191,255,0.2)' }}>
          <div className="text-4xl mb-2">🚀</div>
          <h2 className="font-black text-lg" style={{ color: 'var(--text-heading)' }}>Mirë se vini në TiliGo Staff</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Zgjidhni llojin e llogarisë suaj për të vazhduar</p>
        </motion.div>

        {options.map((opt, i) => (
          <motion.div key={opt.title}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.1 }}
            className="rounded-3xl overflow-hidden"
            style={{ background: 'var(--card-bg)', border: `1px solid ${opt.border}` }}>
            {/* Card header */}
            <div className="px-5 py-4 flex items-center gap-4"
              style={{ background: opt.color, borderBottom: `1px solid ${opt.border}` }}>
              <div className="text-4xl">{opt.icon}</div>
              <div>
                <h3 className="font-black text-xl" style={{ color: opt.textColor }}>{opt.title}</h3>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{opt.desc}</p>
              </div>
            </div>
            {/* Buttons */}
            <div className="p-4 flex flex-col gap-2.5">
              <button onClick={() => navigate(opt.loginPath)}
                className="w-full font-black py-3.5 rounded-2xl text-sm transition-all active:scale-95"
                style={{ background: `linear-gradient(135deg,${opt.textColor},${i === 0 ? '#0066FF' : '#00BFFF'})`, color: '#020c1b', boxShadow: `0 0 18px ${opt.textColor}44` }}>
                {opt.loginLabel}
              </button>
              <button onClick={() => navigate(opt.registerPath)}
                className="w-full font-bold py-3 rounded-2xl text-sm transition-all active:scale-95"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', border: '1px solid var(--nav-border)' }}>
                {opt.registerLabel}
              </button>
            </div>
          </motion.div>
        ))}


      </div>
    </div>
  );
}