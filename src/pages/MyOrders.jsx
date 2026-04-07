import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Search, MapPin } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";

const STATUS_LABELS = {
  e_re:"E Re",pranuar:"Pranuar",ne_pergatitje:"Në Përgatitje",
  gati_per_dorezim:"Gati",ne_rruge:"Në Rrugë",dorezuar:"Dorëzuar",anuluar:"Anuluar"
};
const STATUS_COLORS = {
  e_re:"bg-blue-100 text-blue-700",pranuar:"bg-indigo-100 text-indigo-700",
  ne_pergatitje:"bg-amber-100 text-amber-700",gati_per_dorezim:"bg-orange-100 text-orange-700",
  ne_rruge:"bg-purple-100 text-purple-700",dorezuar:"bg-green-100 text-green-700",
  anuluar:"bg-red-100 text-red-700"
};

export default function MyOrders() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const search = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setNotFound(false);
    const results = await base44.entities.Order.filter({ order_code: code.trim().toUpperCase() });
    if (results.length > 0) setOrder(results[0]);
    else { setOrder(null); setNotFound(true); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <div className="bg-white shadow-sm border-b border-gray-100 px-4 h-14 flex items-center gap-3 sticky top-0 z-50">
        <button onClick={() => navigate("/")} className="text-gray-500 hover:text-gray-700"><ArrowLeft size={22} /></button>
        <h1 className="font-bold text-gray-900 text-lg">Porositë e Mia</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 py-8 space-y-5">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-3">Fut Kodin e Porosisë</h2>
          <div className="flex gap-2">
            <input
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === "Enter" && search()}
              placeholder="p.sh. TG-ABC12"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button onClick={search}
              className="bg-blue-700 text-white px-5 py-3 rounded-xl font-bold hover:bg-blue-800 transition-colors text-sm">
              <Search size={18} />
            </button>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-blue-700 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {notFound && (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">🔍</div>
            <p className="text-gray-500 font-medium">Porosia nuk u gjet</p>
          </div>
        )}

        {order && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Kodi</p>
                <p className="text-2xl font-black text-amber-600">{order.order_code}</p>
              </div>
              <span className={`text-sm font-bold px-4 py-2 rounded-full ${STATUS_COLORS[order.status]}`}>
                {STATUS_LABELS[order.status]}
              </span>
            </div>

            <div className="space-y-1 text-sm">
              <p><span className="text-gray-500">Biznesi:</span> <strong>{order.business_name}</strong></p>
              <p><span className="text-gray-500">Emri:</span> <strong>{order.customer_name}</strong></p>
              <p><span className="text-gray-500">Adresa:</span> <strong>{order.customer_address}</strong></p>
            </div>

            <div className="border-t border-gray-100 pt-3 space-y-1">
              {order.items?.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.qty}x {item.name}</span>
                  <span className="font-medium">{(item.price * item.qty).toFixed(2)}€</span>
                </div>
              ))}
              <div className="flex justify-between font-black text-base pt-1 border-t border-gray-100">
                <span>Totali</span>
                <span className="text-blue-700">{order.total?.toFixed(2)}€</span>
              </div>
            </div>

            <Link to={`/gjurmo/${order.order_code}`}
              className="flex items-center justify-center gap-2 w-full bg-blue-700 text-white font-bold py-3 rounded-xl hover:bg-blue-800 transition-colors text-sm">
              <MapPin size={16} /> Gjurmo në Hartë
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}