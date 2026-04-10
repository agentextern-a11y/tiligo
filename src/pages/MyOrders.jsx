import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Edit2, Save, X, Package, ChevronDown, ChevronUp, LogOut, MapPin, Download, User, Lock } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { generateOrderPDF } from "@/lib/pdfGenerator";

const STATUS_LABELS = {
  e_re:"E Re", pranuar:"Pranuar", ne_pergatitje:"Në Përgatitje",
  gati_per_dorezim:"Gati", ne_rruge:"Në Rrugë", dorezuar:"Dorëzuar", anuluar:"Anuluar"
};
const STATUS_STYLE = {
  e_re:      { bg: 'rgba(96,165,250,0.18)',  color: '#60A5FA' },
  pranuar:   { bg: 'rgba(129,140,248,0.18)', color: '#818CF8' },
  ne_pergatitje: { bg: 'rgba(252,211,77,0.18)', color: '#FCD34D' },
  gati_per_dorezim: { bg: 'rgba(251,146,60,0.18)', color: '#FB923C' },
  ne_rruge:  { bg: 'rgba(167,139,250,0.18)', color: '#A78BFA' },
  dorezuar:  { bg: 'rgba(57,255,107,0.18)',  color: '#39FF6B' },
  anuluar:   { bg: 'rgba(239,68,68,0.18)',   color: '#F87171' },
};

export default function MyOrders() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(() => {
    try { return JSON.parse(localStorage.getItem("tiligo_user_profile") || "null"); } catch { return null; }
  });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [editOrder, setEditOrder] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [coupons, setCoupons] = useState([]);

  const loadOrders = async () => {
    setLoading(true);
    const data = await base44.entities.Order.filter({ customer_phone: profile.phone }, "-created_date");
    setOrders(data);
    setLoading(false);
    const c = await base44.entities.Coupon.list();
    setCoupons(c.filter(x => x.code.startsWith("WELCOME-" + profile.phone) && x.is_active));
  };

  useEffect(() => { if (profile) loadOrders(); }, [profile]);

  const logout = () => {
    localStorage.removeItem("tiligo_user_profile");
    setProfile(null);
    setOrders([]);
  };

  const startEdit = (order) => {
    setEditOrder(order.id);
    setEditForm({ customer_name: order.customer_name, customer_phone: order.customer_phone, customer_address: order.customer_address, notes: order.notes || "" });
  };

  const saveEdit = async (order) => {
    await base44.entities.Order.update(order.id, editForm);
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, ...editForm } : o));
    setEditOrder(null);
  };

  const completedOrders = orders.filter(o => o.status === "dorezuar");
  const activeOrders = orders.filter(o => !["dorezuar","anuluar"].includes(o.status));
  const totalSpent = completedOrders.reduce((s, o) => s + (o.total || 0), 0);
  const initials = profile?.name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0,2) || "TG";

  // ─── LOGIN SCREEN ───────────────────────────────────────────
  const [loginForm, setLoginForm] = useState({ phone: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    const results = await base44.entities.Customer.filter({ phone: loginForm.phone });
    if (results.length === 0) { setLoginError("Numri i telefonit nuk u gjet!"); setLoginLoading(false); return; }
    const customer = results[0];
    if (customer.password !== loginForm.password) { setLoginError("Fjalëkalimi është i gabuar!"); setLoginLoading(false); return; }
    const p = { id: customer.id, name: customer.name, phone: customer.phone };
    localStorage.setItem("tiligo_user_profile", JSON.stringify(p));
    setProfile(p);
    setLoginLoading(false);
  };

  if (!profile) return (
    <div className="min-h-screen" style={{ background: 'var(--bg-body)' }}>
      <div className="sticky top-0 z-50" style={{ background: 'var(--nav-bg)', borderBottom: '1px solid var(--nav-border)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => navigate("/")} style={{ color: '#00BFFF' }}><ArrowLeft size={22} /></button>
          <h1 className="font-bold text-sm" style={{ color: 'var(--text-heading)' }}>Llogaria Ime</h1>
        </div>
      </div>
      <div className="max-w-lg mx-auto px-4 py-12">
        {/* Hero */}
        <div className="rounded-3xl overflow-hidden mb-6 relative"
          style={{ background: 'linear-gradient(160deg,#020c1b 0%,#0a2a4a 50%,#001830 100%)', border: '1px solid rgba(0,191,255,0.2)', minHeight: 160 }}>
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-20 pointer-events-none"
            style={{ background: 'radial-gradient(circle,#39FF6B,transparent 70%)', transform: 'translate(30%,-30%)' }} />
          <div className="relative z-10 p-8 text-center">
            <div className="text-5xl mb-3">🛵</div>
            <h2 className="font-black text-2xl mb-1" style={{ color: '#fff' }}>Mirë se vini!</h2>
            <p className="text-sm" style={{ color: 'rgba(125,211,252,0.8)' }}>Hyni për të parë porositë dhe kuponat tuaj</p>
          </div>
        </div>

        {/* Login form */}
        <div className="rounded-3xl p-6" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <h3 className="font-black text-base mb-4" style={{ color: 'var(--text-heading)' }}>Hyrja e Klientit</h3>
          {loginError && (
            <div className="rounded-xl px-4 py-3 mb-4 text-sm font-medium"
              style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#F87171' }}>
              {loginError}
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 mb-1.5" style={{ color: 'var(--text-muted)' }}>
                <User size={12} /> Numri i Telefonit
              </label>
              <input type="tel" value={loginForm.phone} onChange={e => setLoginForm({ ...loginForm, phone: e.target.value })}
                placeholder="+383 44 000 000" required
                className="w-full rounded-2xl px-4 py-3 text-sm outline-none"
                style={{ background: 'var(--input-bg)', border: '1.5px solid var(--card-border)', color: 'var(--text-primary)' }} />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 mb-1.5" style={{ color: 'var(--text-muted)' }}>
                <Lock size={12} /> Fjalëkalimi
              </label>
              <input type="password" value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                placeholder="••••••••" required
                className="w-full rounded-2xl px-4 py-3 text-sm outline-none"
                style={{ background: 'var(--input-bg)', border: '1.5px solid var(--card-border)', color: 'var(--text-primary)' }} />
            </div>
            <button type="submit" disabled={loginLoading}
              className="w-full font-black py-3.5 rounded-2xl text-sm transition-all active:scale-95 mt-1 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#39FF6B,#00BFFF)', color: '#020c1b', boxShadow: '0 0 20px rgba(57,255,107,0.3)' }}>
              {loginLoading ? "Duke hyrë..." : "Vazhdo →"}
            </button>
          </form>
          <p className="text-center text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
            Nuk keni llogari?{" "}
            <Link to="/user/register" className="font-bold" style={{ color: '#39FF6B' }}>Regjistrohu & merr 2€</Link>
          </p>
        </div>
      </div>
    </div>
  );

  // ─── DASHBOARD ──────────────────────────────────────────────
  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--bg-body)' }}>
      {/* Header */}
      <div className="sticky top-0 z-50" style={{ background: 'var(--nav-bg)', borderBottom: '1px solid var(--nav-border)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => navigate("/")} style={{ color: '#00BFFF' }}><ArrowLeft size={22} /></button>
          <div className="flex-1">
            <h1 className="font-black text-sm" style={{ color: 'var(--text-heading)' }}>Llogaria Ime</h1>
          </div>
          <button onClick={logout} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
            style={{ background: 'rgba(255,255,255,0.07)', color: 'var(--text-muted)', border: '1px solid var(--nav-border)' }}>
            <LogOut size={13} /> Dil
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">

        {/* ─── Profile Hero Card ─── */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl overflow-hidden relative"
          style={{ background: 'linear-gradient(160deg,#020c1b 0%,#0a2a4a 50%,#001830 100%)', border: '1px solid rgba(0,191,255,0.2)', minHeight: 140 }}>
          <div className="absolute top-0 right-0 w-44 h-44 rounded-full opacity-20 pointer-events-none"
            style={{ background: 'radial-gradient(circle,#39FF6B,transparent 70%)', transform: 'translate(30%,-30%)' }} />
          <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-15 pointer-events-none"
            style={{ background: 'radial-gradient(circle,#00BFFF,transparent 70%)', transform: 'translate(-30%,30%)' }} />
          <div className="relative z-10 p-5 flex items-center gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 font-black text-xl"
              style={{ background: 'linear-gradient(135deg,#39FF6B33,#00BFFF33)', border: '2px solid rgba(57,255,107,0.5)', color: '#39FF6B', boxShadow: '0 0 20px rgba(57,255,107,0.25)' }}>
              {initials}
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold tracking-widest uppercase mb-0.5" style={{ color: '#00BFFF' }}>TiliGo · Cliente</p>
              <h2 className="font-black text-xl" style={{ color: '#fff' }}>{profile.name}</h2>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(125,211,252,0.7)' }}>{profile.phone}</p>
            </div>
            {activeOrders.length > 0 && (
              <motion.div animate={{ scale: [1,1.05,1] }} transition={{ repeat: Infinity, duration: 2 }}
                className="flex flex-col items-center px-3 py-2 rounded-2xl flex-shrink-0"
                style={{ background: 'rgba(57,255,107,0.15)', border: '1px solid rgba(57,255,107,0.4)' }}>
                <span className="text-xs font-black" style={{ color: '#39FF6B' }}>{activeOrders.length}</span>
                <span className="text-xs" style={{ color: 'rgba(57,255,107,0.7)' }}>Aktive</span>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* ─── Stats ─── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Porosi", value: orders.length, icon: "📦", grad: 'linear-gradient(135deg,#1e3a8a,#2563eb)', glow: 'rgba(37,99,235,0.4)' },
            { label: "Dorëzuara", value: completedOrders.length, icon: "✅", grad: 'linear-gradient(135deg,#065f46,#10b981)', glow: 'rgba(16,185,129,0.4)' },
            { label: "Shpenzuar", value: `${totalSpent.toFixed(0)}€`, icon: "💰", grad: 'linear-gradient(135deg,#78350f,#f59e0b)', glow: 'rgba(245,158,11,0.4)' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="rounded-2xl p-3.5 text-center text-white"
              style={{ background: s.grad, boxShadow: `0 4px 20px ${s.glow}` }}>
              <div className="text-2xl mb-1">{s.icon}</div>
              <p className="font-black text-lg leading-tight">{s.value}</p>
              <p className="text-xs opacity-70 mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* ─── Active order banner ─── */}
        {activeOrders.length > 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl p-4 flex items-center gap-3"
            style={{ background: 'linear-gradient(135deg,rgba(139,92,246,0.15),rgba(57,255,107,0.08))', border: '1.5px solid rgba(139,92,246,0.4)' }}>
            <motion.div animate={{ rotate: [0,15,-15,0] }} transition={{ repeat: Infinity, duration: 2 }} className="text-2xl flex-shrink-0">🛵</motion.div>
            <div className="flex-1">
              <p className="font-black text-sm" style={{ color: '#A78BFA' }}>Porosia Aktive</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>#{activeOrders[0].order_code} · {activeOrders[0].business_name}</p>
            </div>
            <Link to={`/gjurmo/${activeOrders[0].order_code}`}
              className="px-3 py-2 rounded-xl font-bold text-xs"
              style={{ background: 'linear-gradient(135deg,#A78BFA,#7C3AED)', color: '#fff' }}>
              Gjurmo →
            </Link>
          </motion.div>
        )}

        {/* ─── Welcome coupon ─── */}
        {coupons.length > 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl p-4 flex items-center gap-3"
            style={{ background: 'linear-gradient(135deg,rgba(57,255,107,0.12),rgba(0,191,255,0.08))', border: '1.5px solid rgba(57,255,107,0.4)' }}>
            <div className="text-3xl flex-shrink-0">🎁</div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-sm" style={{ color: '#39FF6B' }}>Kuponi Juaj i Mirëseardhjes</p>
              <p className="font-mono font-black text-base tracking-widest" style={{ color: 'var(--text-heading)' }}>{coupons[0].code}</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Zbritje: -{coupons[0].discount_amount?.toFixed(2)}€</p>
            </div>
          </motion.div>
        )}

        {/* ─── Orders ─── */}
        <div>
          <h3 className="font-black text-xs tracking-widest uppercase mb-3 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
            <Package size={13} /> Historia e Porosive
          </h3>
          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="rounded-2xl h-16 animate-pulse" style={{ background: 'var(--card-bg)' }} />)}</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-14">
              <div className="text-5xl mb-3">📭</div>
              <p className="font-bold" style={{ color: 'var(--text-primary)' }}>Nuk keni porosi akoma</p>
              <button onClick={() => navigate("/")}
                className="mt-4 font-bold px-6 py-3 rounded-2xl text-sm"
                style={{ background: 'linear-gradient(135deg,#39FF6B,#00BFFF)', color: '#020c1b' }}>
                Porosit Tani →
              </button>
            </div>
          ) : orders.map((order, i) => {
            const st = STATUS_STYLE[order.status] || STATUS_STYLE.e_re;
            return (
              <motion.div key={order.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="rounded-2xl overflow-hidden mb-3"
                style={{ background: 'var(--card-bg)', border: `1px solid ${expanded === order.id ? st.color + '55' : 'var(--card-border)'}`, transition: 'border-color 0.2s' }}>
                {/* Row */}
                <div className="p-4 flex items-center gap-3 cursor-pointer" onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: st.bg }}>
                    <Package size={16} style={{ color: st.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-black text-sm" style={{ color: '#FBBF24' }}>#{order.order_code}</p>
                      {order.priority && <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(239,68,68,0.15)', color: '#F87171' }}>⚡</span>}
                    </div>
                    <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{order.business_name} · {new Date(order.created_date).toLocaleDateString("sq-AL")}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: st.bg, color: st.color }}>{STATUS_LABELS[order.status]}</span>
                    {expanded === order.id ? <ChevronUp size={14} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />}
                  </div>
                </div>

                <AnimatePresence>
                  {expanded === order.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      style={{ borderTop: `1px solid ${st.color}33` }}>
                      <div className="p-4 space-y-3">
                        {editOrder === order.id ? (
                          <div className="space-y-2">
                            {[
                              { key: "customer_name", label: "Emri", placeholder: "Emri i plotë" },
                              { key: "customer_phone", label: "Telefoni", placeholder: "+383..." },
                              { key: "customer_address", label: "Adresa", placeholder: "Adresa" },
                              { key: "notes", label: "Shënime", placeholder: "Shënime..." },
                            ].map(({ key, label, placeholder }) => (
                              <div key={key}>
                                <label className="text-xs font-bold block mb-1" style={{ color: 'var(--text-muted)' }}>{label}</label>
                                <input value={editForm[key] || ""} onChange={e => setEditForm({ ...editForm, [key]: e.target.value })}
                                  placeholder={placeholder}
                                  className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                                  style={{ background: 'var(--input-bg)', border: '1.5px solid var(--card-border)', color: 'var(--text-primary)' }} />
                              </div>
                            ))}
                            <div className="flex gap-2 pt-1">
                              <button onClick={() => setEditOrder(null)} className="flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-1"
                                style={{ background: 'rgba(255,255,255,0.07)', color: 'var(--text-muted)', border: '1px solid var(--nav-border)' }}>
                                <X size={14} /> Anulo
                              </button>
                              <button onClick={() => saveEdit(order)} className="flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-1"
                                style={{ background: 'linear-gradient(135deg,#39FF6B,#00BFFF)', color: '#020c1b' }}>
                                <Save size={14} /> Ruaj
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="text-sm space-y-1">
                              <p style={{ color: 'var(--text-secondary)' }}><span className="font-bold" style={{ color: 'var(--text-muted)' }}>Adresa: </span>{order.customer_address}</p>
                              {order.notes && <p style={{ color: 'var(--text-secondary)' }}><span className="font-bold" style={{ color: 'var(--text-muted)' }}>Shënime: </span>{order.notes}</p>}
                            </div>
                            <div className="rounded-xl p-3 space-y-1.5" style={{ background: 'rgba(0,40,80,0.4)', border: '1px solid var(--divider)' }}>
                              {order.items?.map((item, j) => (
                                <div key={j} className="flex justify-between text-xs">
                                  <span style={{ color: 'var(--text-secondary)' }}>{item.qty}× {item.name}</span>
                                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{(item.price * item.qty).toFixed(2)}€</span>
                                </div>
                              ))}
                              <div className="flex justify-between font-black text-sm pt-1.5" style={{ borderTop: '1px solid var(--divider)', color: 'var(--text-heading)' }}>
                                <span>Total</span><span style={{ color: '#39FF6B' }}>{order.total?.toFixed(2)}€</span>
                              </div>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              {["e_re","pranuar","ne_pergatitje"].includes(order.status) && (
                                <button onClick={() => startEdit(order)}
                                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl"
                                  style={{ background: 'rgba(0,191,255,0.12)', color: '#00BFFF', border: '1px solid rgba(0,191,255,0.25)' }}>
                                  Ndrysho Info
                                </button>
                              )}
                              <Link to={`/gjurmo/${order.order_code}`}
                                className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl"
                                style={{ background: 'rgba(57,255,107,0.12)', color: '#39FF6B', border: '1px solid rgba(57,255,107,0.25)' }}>
                                <MapPin size={12} /> Gjurmo
                              </Link>
                              <button onClick={() => generateOrderPDF(order)}
                                className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl"
                                style={{ background: 'rgba(251,191,36,0.12)', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.25)' }}>
                                <Download size={12} /> Fatura
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}