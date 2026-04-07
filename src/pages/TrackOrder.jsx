import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Copy, CheckCircle, Clock, ChefHat, Bike, Package, MapPin } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";

const STATUS_STEPS = [
  { key: "e_re", label: "Porosia e Re", icon: <Package size={18} />, color: "bg-blue-500" },
  { key: "pranuar", label: "Pranuar", icon: <CheckCircle size={18} />, color: "bg-indigo-500" },
  { key: "ne_pergatitje", label: "Në Përgatitje", icon: <ChefHat size={18} />, color: "bg-amber-500" },
  { key: "gati_per_dorezim", label: "Gati", icon: <Package size={18} />, color: "bg-orange-500" },
  { key: "ne_rruge", label: "Në Rrugë", icon: <Bike size={18} />, color: "bg-purple-500" },
  { key: "dorezuar", label: "Dorëzuar ✓", icon: <CheckCircle size={18} />, color: "bg-green-500" },
];

const STATUS_LABELS = {
  e_re: "Porosia e Re", pranuar: "Pranuar", ne_pergatitje: "Në Përgatitje",
  gati_per_dorezim: "Gati për Dorëzim", ne_rruge: "Në Rrugë", dorezuar: "Dorëzuar", anuluar: "Anuluar"
};

// Animated delivery path
const PATH_POINTS = [
  { x: 60, y: 200 }, { x: 160, y: 150 }, { x: 280, y: 180 },
  { x: 380, y: 120 }, { x: 480, y: 160 }, { x: 560, y: 100 }
];

export default function TrackOrder() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchCode, setSearchCode] = useState(code || "");
  const [copied, setCopied] = useState(false);
  const [bikePos, setBikePos] = useState(0);

  useEffect(() => {
    if (code) loadOrder(code);
    else setLoading(false);
  }, [code]);

  useEffect(() => {
    if (!order) return;
    const unsub = base44.entities.Order.subscribe((event) => {
      if (event.data?.order_code === order.order_code) {
        setOrder(event.data);
      }
    });
    return unsub;
  }, [order?.order_code]);

  // Animate bike when in delivery
  useEffect(() => {
    if (order?.status === "ne_rruge") {
      const interval = setInterval(() => {
        setBikePos(p => (p + 1) % PATH_POINTS.length);
      }, 800);
      return () => clearInterval(interval);
    }
  }, [order?.status]);

  const loadOrder = async (c) => {
    setLoading(true);
    const orders = await base44.entities.Order.filter({ order_code: c.toUpperCase() });
    setOrder(orders[0] || null);
    setLoading(false);
  };

  const currentStep = STATUS_STEPS.findIndex(s => s.key === order?.status);

  const copyCode = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.order_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-700 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <div className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => navigate("/")} className="text-gray-500 hover:text-gray-700">
            <ArrowLeft size={22} />
          </button>
          <h1 className="font-bold text-gray-900 text-lg">Gjurmo Porosinë</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* Search */}
        {!code && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-3">Fut Kodin e Porosisë</h2>
            <div className="flex gap-2">
              <input
                value={searchCode}
                onChange={e => setSearchCode(e.target.value.toUpperCase())}
                placeholder="p.sh. TG-ABC12"
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button onClick={() => loadOrder(searchCode)}
                className="bg-blue-700 text-white px-5 py-3 rounded-xl font-bold hover:bg-blue-800 transition-colors text-sm">
                Kërko
              </button>
            </div>
          </div>
        )}

        {!order && !loading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-500 font-medium">Porosia nuk u gjet</p>
            <p className="text-gray-400 text-sm">Kontrolloni kodin dhe provoni sërisht</p>
          </div>
        )}

        {order && (
          <>
            {/* Order code */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Kodi i Porosisë</p>
                  <p className="text-2xl font-black text-amber-600">{order.order_code}</p>
                </div>
                <button onClick={copyCode}
                  className="flex items-center gap-1.5 text-sm text-blue-700 hover:text-blue-800 font-medium bg-blue-50 px-3 py-1.5 rounded-xl">
                  <Copy size={14} />
                  {copied ? "Kopjuar!" : "Kopjo"}
                </button>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${order.status === "dorezuar" ? "bg-green-500" : order.status === "anuluar" ? "bg-red-500" : "bg-amber-400 animate-pulse"}`} />
                <span className="text-sm font-semibold text-gray-700">{STATUS_LABELS[order.status] || order.status}</span>
              </div>
            </div>

            {/* Animated Map */}
            {order.status === "ne_rruge" && (
              <div className="bg-white rounded-2xl p-4 shadow-sm overflow-hidden">
                <h3 className="font-bold text-gray-900 mb-3 text-sm">🗺️ Dorëzuesi në Rrugë</h3>
                <div className="relative bg-gradient-to-br from-blue-50 to-green-50 rounded-xl overflow-hidden" style={{ height: 200 }}>
                  <svg width="100%" height="100%" viewBox="0 0 600 240" className="absolute inset-0">
                    {/* Road */}
                    <path d="M 60 200 Q 160 150 280 180 Q 380 120 480 160 Q 540 140 560 100"
                      fill="none" stroke="#cbd5e1" strokeWidth="8" strokeLinecap="round" />
                    <path d="M 60 200 Q 160 150 280 180 Q 380 120 480 160 Q 540 140 560 100"
                      fill="none" stroke="#e2e8f0" strokeWidth="4" strokeDasharray="10 8" strokeLinecap="round" />
                    {/* Origin */}
                    <circle cx="60" cy="200" r="10" fill="#1d4ed8" />
                    <text x="60" y="225" textAnchor="middle" fontSize="11" fill="#1d4ed8" fontWeight="bold">🏪</text>
                    {/* Destination */}
                    <circle cx="560" cy="100" r="10" fill="#16a34a" />
                    <text x="560" y="78" textAnchor="middle" fontSize="11" fill="#16a34a" fontWeight="bold">🏠</text>
                    {/* Bike */}
                    <motion.text
                      x={PATH_POINTS[bikePos]?.x || 60}
                      y={PATH_POINTS[bikePos]?.y || 200}
                      animate={{ x: PATH_POINTS[bikePos]?.x, y: PATH_POINTS[bikePos]?.y }}
                      transition={{ duration: 0.6 }}
                      textAnchor="middle" fontSize="20" dominantBaseline="middle"
                    >🛵</motion.text>
                  </svg>
                </div>
                <p className="text-xs text-center text-gray-500 mt-2">
                  {order.delivery_name ? `${order.delivery_name} po ju sjell porosinë` : "Dorëzuesi po vjen drejt jush"}
                </p>
              </div>
            )}

            {/* Steps */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">Statusi i Porosisë</h3>
              <div className="space-y-3">
                {STATUS_STEPS.map((step, i) => {
                  const isActive = i === currentStep;
                  const isDone = i < currentStep;
                  return (
                    <div key={step.key} className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all
                        ${isDone ? "bg-green-500 text-white" : isActive ? `${step.color} text-white scale-110 shadow-md` : "bg-gray-100 text-gray-400"}`}>
                        {isDone ? <CheckCircle size={16} /> : step.icon}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-semibold ${isActive ? "text-gray-900" : isDone ? "text-gray-600" : "text-gray-400"}`}>
                          {step.label}
                        </p>
                      </div>
                      {isActive && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium animate-pulse">
                          Tani
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order details */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-3">Detajet</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Biznesi</span><span className="font-medium">{order.business_name}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Adresa</span><span className="font-medium text-right max-w-[60%]">{order.customer_address}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Pagesa</span><span className="font-medium">Cash 💵</span></div>
                <div className="flex justify-between font-bold text-base pt-1 border-t border-gray-100">
                  <span>Totali</span><span className="text-blue-700">{order.total?.toFixed(2)}€</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}