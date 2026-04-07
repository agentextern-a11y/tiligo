import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Upload, Store } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import TiliGoLogo from "@/components/TiliGoLogo";

const CATEGORIES = ["Ushqim", "Pica", "Sushi", "Burgera", "Kafe & Ëmbëlsira", "Farmaci", "Supermarket", "Tjeter"];

export default function BusinessRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", phone: "", address: "", password: "", confirmPassword: "",
    description: "", category: "Ushqim", image_url: ""
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, image_url: file_url }));
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) { setError("Fjalëkalimet nuk përputhen!"); return; }
    if (form.password.length < 6) { setError("Fjalëkalimi duhet të ketë minimum 6 karaktere!"); return; }
    setLoading(true);
    const { confirmPassword, ...data } = form;
    await base44.entities.Business.create({ ...data, status: "pending", is_open: false, rating: 4.5 });
    setDone(true);
    setLoading(false);
  };

  if (done) return (
    <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center px-4">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-xl">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Regjistrimi u bë!</h2>
        <p className="text-gray-500 text-sm mb-2">Aplikimi juaj po shqyrtohet nga administratori.</p>
        <p className="text-gray-500 text-sm mb-6">Do të njoftoheni kur biznesi juaj të aprovohet.</p>
        <Link to="/biznesi/login"
          className="block w-full bg-blue-700 text-white font-bold py-3 rounded-xl hover:bg-blue-800 transition-colors">
          Shko tek Hyrja
        </Link>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <div className="bg-white shadow-sm border-b border-gray-100 px-4 h-14 flex items-center gap-3 sticky top-0 z-50">
        <Link to="/" className="text-gray-500 hover:text-gray-700"><ArrowLeft size={22} /></Link>
        <TiliGoLogo size="sm" />
        <h1 className="font-bold text-gray-900">Regjistro Biznesin</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
              <Store size={24} className="text-blue-700" />
            </div>
            <div>
              <h2 className="font-black text-xl text-gray-900">Krijoni Llogarinë</h2>
              <p className="text-gray-500 text-sm">Bashkohuni me TiliGo sot</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Emri i Biznesit *</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                placeholder="p.sh. Pizzeria Prishtina" required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Telefoni *</label>
                <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                  placeholder="+383 44 000 000" required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Kategoria *</label>
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Adresa *</label>
              <input value={form.address} onChange={e => setForm({...form, address: e.target.value})}
                placeholder="Rruga, qyteti" required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Përshkrimi</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                placeholder="Përshkruani biznesin tuaj..." rows={2}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 resize-none" />
            </div>

            {/* Image upload */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Foto e Biznesit</label>
              <label className="flex items-center gap-3 border-2 border-dashed border-gray-200 rounded-xl p-4 cursor-pointer hover:border-blue-400 transition-colors">
                <Upload size={20} className="text-gray-400" />
                <span className="text-sm text-gray-500">{uploading ? "Duke ngarkuar..." : form.image_url ? "Foto u ngarkua ✓" : "Kliko për të ngarkuar foton"}</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
              {form.image_url && (
                <img src={form.image_url} alt="preview" className="mt-2 w-full h-32 object-cover rounded-xl" />
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Fjalëkalimi *</label>
                <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                  placeholder="Min. 6 karaktere" required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Konfirmo *</label>
                <input type="password" value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword: e.target.value})}
                  placeholder="Përsërit fjalëkalimin" required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white font-black py-4 rounded-xl transition-colors mt-2">
              {loading ? "Duke regjistruar..." : "Regjistrohu"}
            </button>

            <p className="text-center text-sm text-gray-500">
              Keni llogari?{" "}
              <Link to="/biznesi/login" className="text-blue-700 font-semibold hover:underline">Hyni këtu</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}