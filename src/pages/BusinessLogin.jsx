import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Store, Lock, Phone } from "lucide-react";
import { base44 } from "@/api/base44Client";
import TiliGoLogo from "@/components/TiliGoLogo";
import { motion } from "framer-motion";

export default function BusinessLogin() {
  const navigate = useNavigate();
  const saved = (() => { try { return JSON.parse(localStorage.getItem("tiligo_biz_remember") || "null"); } catch { return null; } })();
  const [form, setForm] = useState({ phone: saved?.phone || "", password: saved?.password || "" });
  const [remember, setRemember] = useState(!!saved);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const results = await base44.entities.Business.filter({ phone: form.phone });
    if (results.length === 0) { setError("Numri i telefonit nuk u gjet!"); setLoading(false); return; }
    const biz = results[0];
    if (biz.password !== form.password) { setError("Fjalëkalimi është i gabuar!"); setLoading(false); return; }
    if (biz.status === "pending") { setError("Llogaria juaj po shqyrtohet nga administratori."); setLoading(false); return; }
    if (biz.status === "rejected") { setError("Llogaria juaj u refuzua. Kontaktoni administratorin."); setLoading(false); return; }
    if (remember) localStorage.setItem("tiligo_biz_remember", JSON.stringify({ phone: form.phone, password: form.password }));
    else localStorage.removeItem("tiligo_biz_remember");
    localStorage.setItem("tiligo_business", JSON.stringify(biz));
    navigate("/biznesi/dashboard");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex flex-col">
      <div className="bg-white shadow-sm border-b border-gray-100 px-4 h-14 flex items-center gap-3">
        <Link to="/" className="text-gray-500 hover:text-gray-700"><ArrowLeft size={22} /></Link>
        <TiliGoLogo size="sm" />
      </div>

      <div className="flex-1 flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-xl">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Store size={28} className="text-blue-700" />
            </div>
            <h1 className="text-2xl font-black text-gray-900">Hyrja Biznesit</h1>
            <p className="text-gray-500 text-sm mt-1">Menaxhoni restorantin tuaj</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5 mb-1.5">
                <Phone size={14} /> Numri i Telefonit
              </label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                placeholder="+383 44 000 000" required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5 mb-1.5">
                <Lock size={14} /> Fjalëkalimi
              </label>
              <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                placeholder="••••••••" required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" />
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <div onClick={() => setRemember(!remember)}
                className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all"
                style={{ background: remember ? '#1d4ed8' : 'transparent', border: remember ? '2px solid #1d4ed8' : '2px solid #d1d5db' }}>
                {remember && <span className="text-white text-xs font-black">✓</span>}
              </div>
              <span className="text-sm text-gray-600 font-medium">Mbaj mend të dhënat e hyrjes</span>
            </label>

            <button type="submit" disabled={loading}
              className="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white font-black py-4 rounded-xl transition-colors">
              {loading ? "Duke hyrë..." : "Hyni"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Nuk keni llogari?{" "}
            <Link to="/biznesi/register" className="text-blue-700 font-semibold hover:underline">Regjistrohuni</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}