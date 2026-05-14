import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Store, Bike, ChevronRight, Mail } from "lucide-react";

export default function StaffPortalSection() {
  const navigate = useNavigate();

  return (
    <section className="py-20 px-4 relative overflow-hidden"
    style={{ background: "linear-gradient(180deg, var(--bg-body) 0%, rgba(0,40,80,0.3) 50%, var(--bg-body) 100%)" }}>

      {/* Background deco */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full opacity-5"
        style={{ background: "radial-gradient(ellipse, #00BFFF, transparent 70%)" }} />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 text-xs font-bold uppercase tracking-widest hidden"
            style={{ background: "rgba(0,191,255,0.08)", border: "1px solid rgba(0,191,255,0.25)", color: "#00BFFF" }}>
            🚀 Bashkohu me TiliGo
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="font-black text-4xl md:text-5xl mb-3" style={{ color: "var(--text-heading)", letterSpacing: "-0.02em" }}>
            Porta e <span style={{ color: "#39FF6B" }}>Partnerëve</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            className="text-lg max-w-lg mx-auto" style={{ color: "var(--text-muted)" }}>
            Zgjedh rolin tënd dhe fillo të fitosh me TiliGo — platforma nr. 1 në Kosovë
          </motion.p>
        </div>

        {/* Two portal cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">

          {/* Business Portal */}
          <motion.div
            initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="group relative rounded-3xl overflow-hidden"
            style={{ background: "linear-gradient(160deg, rgba(0,102,255,0.12) 0%, rgba(0,191,255,0.06) 100%)", border: "1.5px solid rgba(0,191,255,0.3)" }}>

            {/* Animated top bar */}
            <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #0066FF, #00BFFF)" }} />

            <div className="p-8 opacity-100">
              {/* Icon */}
              <motion.div
                whileHover={{ rotate: [0, -5, 5, 0], scale: 1.05 }}
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                style={{ background: "rgba(0,191,255,0.12)", border: "1px solid rgba(0,191,255,0.3)" }}>
                <Store size={28} style={{ color: "#00BFFF" }} />
              </motion.div>

              


              
              <h3 className="font-black text-2xl mb-2" style={{ color: "var(--text-heading)" }}>Rrit Biznesin Tënd</h3>
              <p className="text-sm leading-relaxed mb-8" style={{ color: "var(--text-muted)" }}>
                Lidhuni me mijëra klientë të rinj çdo ditë. Menaxhoni menunë, ndiqni porositë dhe rritni të ardhurat tuaja me platformën tonë.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-8">
                {[{ val: "1000+", label: "Klientë" }, { val: "20min", label: "Dorëzim" }, { val: "0€", label: "Tarifë Hyrje" }].map((s, i) =>
                <div key={i} className="text-center p-2.5 rounded-xl" style={{ background: "rgba(0,40,80,0.4)" }}>
                    <p className="font-black text-base" style={{ color: "#00BFFF" }}>{s.val}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{s.label}</p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/biznesi/login")}
                className="w-full font-black py-4 rounded-2xl text-sm flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #0066FF, #00BFFF)", color: "#fff", boxShadow: "0 4px 20px rgba(0,102,255,0.3)" }}>
                  Hyr si Biznes <ChevronRight size={16} />
                </motion.button>
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/biznesi/register")}
                className="w-full font-bold py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2"
                style={{ background: "rgba(0,191,255,0.08)", color: "#00BFFF", border: "1px solid rgba(0,191,255,0.25)" }}>
                  Regjistro Biznesin Tënd
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Courier Portal */}
          <motion.div
            initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            className="group relative rounded-3xl overflow-hidden"
            style={{ background: "linear-gradient(160deg, rgba(57,255,107,0.08) 0%, rgba(0,191,255,0.04) 100%)", border: "1.5px solid rgba(57,255,107,0.3)" }}>

            <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #39FF6B, #00BFFF)" }} />

            <div className="p-8">
              <motion.div
                whileHover={{ rotate: [0, -5, 5, 0], scale: 1.05 }}
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                style={{ background: "rgba(57,255,107,0.12)", border: "1px solid rgba(57,255,107,0.3)" }}>
                <Bike size={28} style={{ color: "#39FF6B" }} />
              </motion.div>

              


              
              <h3 className="font-black text-2xl mb-2" style={{ color: "var(--text-heading)" }}>Fito çdo Ditë</h3>
              <p className="text-sm leading-relaxed mb-8" style={{ color: "var(--text-muted)" }}>
                Bëhu pjesë e ekipit tonë dhe fito para reale. Oraret tuaja, rrugët tuaja. Liri totale me të ardhura të garantuara.
              </p>

              <div className="grid grid-cols-3 gap-3 mb-8">
                {[{ val: "Flex", label: "Orar" }, { val: "1.50€+", label: "Për Dorëzim" }, { val: "100%", label: "Liri" }].map((s, i) =>
                <div key={i} className="text-center p-2.5 rounded-xl" style={{ background: "rgba(0,40,80,0.4)" }}>
                    <p className="font-black text-base" style={{ color: "#39FF6B" }}>{s.val}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{s.label}</p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/dorezuesi/login")}
                className="w-full font-black py-4 rounded-2xl text-sm flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #39FF6B, #00BFFF)", color: "#020c1b", boxShadow: "0 4px 20px rgba(57,255,107,0.3)" }}>
                  Hyr si Dorëzues <ChevronRight size={16} />
                </motion.button>
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/dorezuesi/register")}
                className="w-full font-bold py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2"
                style={{ background: "rgba(57,255,107,0.06)", color: "#39FF6B", border: "1px solid rgba(57,255,107,0.2)" }}>
                  Apliko si Dorëzues
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Contact strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="flex items-center justify-center gap-3 py-4 px-6 rounded-2xl"
          style={{ background: "rgba(0,191,255,0.06)", border: "1px solid rgba(0,191,255,0.15)" }}>
          <Mail size={16} style={{ color: "#00BFFF" }} />
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Pyetje? Na shkruani në{" "}
            <a href="mailto:Support@tili-go.com" className="font-bold" style={{ color: "#00BFFF" }}>
              Support@tili-go.com
            </a>
          </p>
        </motion.div>
      </div>
    </section>);

}