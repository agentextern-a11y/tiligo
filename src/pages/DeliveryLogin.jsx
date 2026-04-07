import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Bike, Lock, Phone } from "lucide-react";
import { base44 } from "@/api/base44Client";
import TiliGoLogo from "@/components/TiliGoLogo";
import { motion } from "framer-motion";

export default function DeliveryLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const results = await base44.entities.Delivery.filter({ phone: form.phone });
    if (results.length === 0) { setError("Numri i telefonit nuk u gjet!"); setLoading(false); return; }
    const del = results[0];
    if (del.password !== form.password) { setError("Fjalëkalimi është i gabuar!"); setLoading(false); return; }
    if (del.status === "pending") { setError("Llogaria juaj po shqyrtohet nga administratori."); setLoading(false); return; }
    if (del.status === "rejected") { setError("Llogaria juaj u refuzua. Kontaktoni administratorin."); setLoading(false); return; }
    localStorage.setItem("tiligo_delivery", JSON.stringify(del));
    navigate("/dorezuesi/dashboard");
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
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Bike size={28} className="text-green-700" />
            </div>
            <h1 className="text-2xl font-black text-gray-900">Hyrja Dorëzuesit</h1>
            <p className="text-gray-500 text-sm mt-1">Menaxhoni dorëzimet tuaja</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5 mb-1.5">
                <Phone size={14} /> Numri i Telefonit
              </label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                placeholder="+383 44 000 000" required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50" />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5 mb-1.5">
                <Lock size={14} /> Fjalëkalimi
              </label>
              <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                placeholder="••••••••" required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-black py-4 rounded-xl transition-colors">
              {loading ? "Duke hyrë..." : "Hyni"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Nuk keni llogari?{" "}
            <Link to="/dorezuesi/register" className="text-green-700 font-semibold hover:underline">Regjistrohuni</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}