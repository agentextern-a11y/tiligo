import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, CheckCircle, Mail, Phone, User, Tag, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

const CATEGORIES = [
  { value: "general", label: "Pyetje e Përgjithshme" },
  { value: "order_issue", label: "Problem me Porosinë" },
  { value: "business", label: "Biznes" },
  { value: "courier", label: "Dorëzues" },
  { value: "technical", label: "Problem Teknik" },
  { value: "billing", label: "Pagesë" },
];

export default function TicketForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "", category: "general" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await base44.entities.SupportTicket.create({ ...form, status: "open", priority: "medium" });
    setSubmitted(true);
    setSubmitting(false);
  };

  return (
    <section id="support" className="py-20 px-4" style={{ background: "var(--bg-body)" }}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 text-xs font-bold uppercase tracking-widest"
            style={{ background: "rgba(0,191,255,0.1)", border: "1px solid rgba(0,191,255,0.3)", color: "#00BFFF" }}>
            <MessageSquare size={13} /> Qendra e Mbështetjes
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="font-black text-3xl md:text-4xl mb-3" style={{ color: "var(--text-heading)" }}>
            Si mund t'ju ndihmojmë?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            className="text-base" style={{ color: "var(--text-muted)" }}>
            Dërgoni një mesazh dhe ne do t'ju kontaktojmë brenda 24 orëve.{" "}
            <a href="mailto:Support@tili-go.com" className="font-bold" style={{ color: "#00BFFF" }}>Support@tili-go.com</a>
          </motion.p>
        </div>

        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div key="success"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="rounded-3xl p-12 text-center"
              style={{ background: "rgba(57,255,107,0.06)", border: "1.5px solid rgba(57,255,107,0.3)" }}>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2.5 }}
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ background: "rgba(57,255,107,0.15)", border: "2px solid rgba(57,255,107,0.4)" }}>
                <CheckCircle size={36} style={{ color: "#39FF6B" }} />
              </motion.div>
              <h3 className="font-black text-2xl mb-2" style={{ color: "var(--text-heading)" }}>Kërkesa u Dërgua!</h3>
              <p className="mb-2" style={{ color: "var(--text-muted)" }}>Ekipi ynë do t'ju kontaktojë së shpejti.</p>
              <p className="text-sm font-bold" style={{ color: "#00BFFF" }}>Support@tili-go.com</p>
              <button
                onClick={() => { setSubmitted(false); setForm({ name: "", email: "", phone: "", subject: "", message: "", category: "general" }); }}
                className="mt-6 px-6 py-3 rounded-2xl font-bold text-sm transition-all"
                style={{ background: "rgba(0,191,255,0.12)", color: "#00BFFF", border: "1px solid rgba(0,191,255,0.3)" }}>
                Dërgoni Kërkesë Tjetër
              </button>
            </motion.div>
          ) : (
            <motion.form key="form"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSubmit}
              className="rounded-3xl p-6 md:p-8 space-y-5"
              style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>

              {/* Name + Email */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
                    <User size={11} /> Emri
                  </label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
                    placeholder="Emri i plotë"
                    className="w-full rounded-2xl px-4 py-3.5 text-sm outline-none"
                    style={{ background: "var(--input-bg)", border: "1.5px solid var(--card-border)", color: "var(--text-primary)" }} />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
                    <Mail size={11} /> Email
                  </label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required
                    placeholder="email@juaj.com"
                    className="w-full rounded-2xl px-4 py-3.5 text-sm outline-none"
                    style={{ background: "var(--input-bg)", border: "1.5px solid var(--card-border)", color: "var(--text-primary)" }} />
                </div>
              </div>

              {/* Phone + Category */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
                    <Phone size={11} /> Telefoni (opsional)
                  </label>
                  <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="+383 44 000 000"
                    className="w-full rounded-2xl px-4 py-3.5 text-sm outline-none"
                    style={{ background: "var(--input-bg)", border: "1.5px solid var(--card-border)", color: "var(--text-primary)" }} />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
                    <Tag size={11} /> Kategoria
                  </label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full rounded-2xl px-4 py-3.5 text-sm outline-none"
                    style={{ background: "var(--input-bg)", border: "1.5px solid var(--card-border)", color: "var(--text-primary)" }}>
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
                  <AlertCircle size={11} /> Subjekti
                </label>
                <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required
                  placeholder="Shkurtimisht, çfarë ka ndodhur?"
                  className="w-full rounded-2xl px-4 py-3.5 text-sm outline-none"
                  style={{ background: "var(--input-bg)", border: "1.5px solid var(--card-border)", color: "var(--text-primary)" }} />
              </div>

              {/* Message */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
                  <MessageSquare size={11} /> Mesazhi
                </label>
                <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required rows={5}
                  placeholder="Përshkruani problemin ose pyetjen tuaj në detaje..."
                  className="w-full rounded-2xl px-4 py-3.5 text-sm outline-none resize-none"
                  style={{ background: "var(--input-bg)", border: "1.5px solid var(--card-border)", color: "var(--text-primary)" }} />
              </div>

              <button type="submit" disabled={submitting}
                className="w-full font-black py-4 rounded-2xl text-sm transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70"
                style={{ background: "linear-gradient(135deg, #39FF6B, #00BFFF)", color: "#020c1b", boxShadow: "0 4px 24px rgba(57,255,107,0.3)" }}>
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Duke dërguar...
                  </span>
                ) : (
                  <><Send size={15} /> Dërgo Kërkesën</>
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}