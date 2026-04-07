import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToggleLeft, ToggleRight, LogOut, Bell, CheckCircle, MapPin, Phone } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import TiliGoLogo from "@/components/TiliGoLogo";

const STATUS_LABELS = {
  e_re: "E Re", pranuar: "Pranuar", ne_pergatitje: "Në Përgatitje",
  gati_per_dorezim: "Gati për Dorëzim", ne_rruge: "Në Rrugë",
  dorezuar: "Dorëzuar", anuluar: "Anuluar"
};
const STATUS_COLORS = {
  e_re: "bg-blue-100 text-blue-700",
  pranuar: "bg-indigo-100 text-indigo-700",
  ne_pergatitje: "bg-amber-100 text-amber-700",
  gati_per_dorezim: "bg-orange-100 text-orange-700",
  ne_rruge: "bg-purple-100 text-purple-700",
  dorezuar: "bg-green-100 text-green-700",
  anuluar: "bg-red-100 text-red-700",
};

export default function DeliveryDashboard() {
  const navigate = useNavigate();
  const [driver, setDriver] = useState(() => {
    try { return JSON.parse(localStorage.getItem("tiligo_delivery") || "null"); } catch { return null; }
  });
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState("available");
  const [loading, setLoading] = useState(true);
  const [newOrder, setNewOrder] = useState(false);

  useEffect(() => {
    if (!driver) { navigate("/dorezuesi/login"); return; }
    loadOrders();
  }, [driver]);

  useEffect(() => {
    if (!driver) return;
    const unsub = base44.entities.Order.subscribe((event) => {
      if (event.data?.status === "gati_per_dorezim" && !event.data?.delivery_id) {
        setNewOrder(true);
        setTimeout(() => setNewOrder(false), 5000);
        loadOrders();
      } else if (event.type === "update") {
        loadOrders();
      }
    });
    return unsub;
  }, [driver]);

  const loadOrders = async () => {
    setLoading(true);
    const allOrders = await base44.entities.Order.list("-created_date", 100);
    setOrders(allOrders);
    setLoading(false);
  };

  const toggleAvailable = async () => {
    const updated = { ...driver, is_available: !driver.is_available };
    await base44.entities.Delivery.update(driver.id, { is_available: updated.is_available });
    setDriver(updated);
    localStorage.setItem("tiligo_delivery", JSON.stringify(updated));
  };

  const acceptOrder = async (order) => {
    await base44.entities.Order.update(order.id, {
      status: "ne_rruge",
      delivery_id: driver.id,
      delivery_name: driver.name,
    });
    loadOrders();
  };

  const completeOrder = async (order) => {
    await base44.entities.Order.update(order.id, { status: "dorezuar" });
    loadOrders();
  };

  const logout = () => {
    localStorage.removeItem("tiligo_delivery");
    navigate("/");
  };

  // Orders ready for pickup (not yet assigned)
  const availableOrders = orders.filter(o => o.status === "gati_per_dorezim" && !o.delivery_id);
  // My active orders
  const myOrders = orders.filter(o => o.delivery_id === driver?.id && o.status === "ne_rruge");
  // My history
  const myHistory = orders.filter(o => o.delivery_id === driver?.id && o.status === "dorezuar");

  const todayEarnings = myHistory.filter(o => {
    const d = new Date(o.created_date);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }).reduce((s, o) => s + (o.delivery_fee || 1.5), 0);

  if (!driver) return null;

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TiliGoLogo size="sm" />
            <div>
              <p className="font-bold text-gray-900 text-sm leading-tight">{driver.name}</p>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${driver.is_available ? "bg-green-500 animate-pulse" : "bg-gray-300"}`} />
                <span className="text-xs text-gray-500">{driver.is_available ? "Aktiv" : "Jo aktiv"}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleAvailable}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${driver.is_available ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {driver.is_available ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
              {driver.is_available ? "Aktiv" : "Jo aktiv"}
            </button>
            <button onClick={logout} className="text-gray-400 hover:text-red-500 transition-colors p-1">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* New order notification */}
      <AnimatePresence>
        {newOrder && (
          <motion.div initial={{ y: -60 }} animate={{ y: 0 }} exit={{ y: -60 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-2xl shadow-xl font-bold text-sm flex items-center gap-2">
            🔔 Porosi e re gati për dorëzim!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="max-w-3xl mx-auto px-4 pt-5">
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: "Sot", value: `${todayEarnings.toFixed(2)}€`, emoji: "💰" },
            { label: "Të gjitha", value: myHistory.length, emoji: "📦" },
            { label: "Aktive", value: myOrders.length, emoji: "🛵" },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm text-center">
              <div className="text-2xl mb-1">{s.emoji}</div>
              <p className="font-black text-gray-900 text-lg">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 flex">
          {[
            { key: "available", label: `Gati (${availableOrders.length})` },
            { key: "mine", label: `Të Miat (${myOrders.length})` },
            { key: "history", label: "Historiku" },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-5 py-3.5 text-sm font-semibold border-b-2 transition-colors ${tab === t.key ? "border-green-600 text-green-700" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-5 space-y-4">
        {/* AVAILABLE */}
        {tab === "available" && (
          <>
            {loading ? (
              <div className="space-y-3">{[1,2].map(i => <div key={i} className="bg-white rounded-2xl h-28 animate-pulse" />)}</div>
            ) : availableOrders.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-3">📭</div>
                <p className="text-gray-500 font-medium">Nuk ka porosi gati akoma</p>
                <p className="text-gray-400 text-sm mt-1">Aktivizo statusin tuaj për të marrë porosi</p>
              </div>
            ) : availableOrders.map(order => (
              <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-5 shadow-sm border-l-4 border-orange-400">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="font-black text-lg text-amber-600">{order.order_code}</span>
                    <p className="text-gray-900 font-semibold text-sm mt-0.5">{order.business_name}</p>
                  </div>
                  <span className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full">Gati</span>
                </div>
                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin size={14} className="text-blue-600 flex-shrink-0" />
                    <span>{order.customer_address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone size={14} className="text-green-600 flex-shrink-0" />
                    <span>{order.customer_phone} – {order.customer_name}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-500">Shpërblimi: </span>
                    <span className="font-black text-green-600">{(order.delivery_fee || 1.5).toFixed(2)}€</span>
                  </div>
                  <button onClick={() => acceptOrder(order)}
                    className="bg-green-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-green-700 transition-colors">
                    🛵 Prano Dorëzimin
                  </button>
                </div>
              </motion.div>
            ))}
          </>
        )}

        {/* MY ACTIVE */}
        {tab === "mine" && (
          <>
            {myOrders.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-3">🛵</div>
                <p className="text-gray-500 font-medium">Nuk keni dorëzime aktive</p>
              </div>
            ) : myOrders.map(order => (
              <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-5 shadow-sm border-l-4 border-purple-500">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="font-black text-lg text-amber-600">{order.order_code}</span>
                    <p className="text-gray-900 font-semibold text-sm">{order.business_name}</p>
                  </div>
                  <span className="bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full">Në Rrugë</span>
                </div>
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin size={14} className="text-blue-600 flex-shrink-0" />
                    <span>{order.customer_address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone size={14} className="text-green-600 flex-shrink-0" />
                    <span>{order.customer_phone} – {order.customer_name}</span>
                  </div>
                </div>
                {/* Mini animated route */}
                <div className="bg-gradient-to-r from-purple-50 to-green-50 rounded-xl p-3 mb-3 flex items-center gap-2 text-xs text-gray-500">
                  <span>🏪 {order.business_name}</span>
                  <div className="flex-1 border-t-2 border-dashed border-gray-300 relative">
                    <motion.span
                      animate={{ x: ["0%", "100%", "0%"] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute -top-3 text-base">🛵</motion.span>
                  </div>
                  <span>🏠 Klienti</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-700 font-black">{order.total?.toFixed(2)}€ cash</p>
                    <p className="text-xs text-green-600">+{(order.delivery_fee || 1.5).toFixed(2)}€ shpërblim</p>
                  </div>
                  <button onClick={() => completeOrder(order)}
                    className="bg-green-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2">
                    <CheckCircle size={16} /> U Dorëzua
                  </button>
                </div>
              </motion.div>
            ))}
          </>
        )}

        {/* HISTORY */}
        {tab === "history" && (
          <>
            {myHistory.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-3">📋</div>
                <p className="text-gray-500">Nuk ka historik akoma</p>
              </div>
            ) : myHistory.map(order => (
              <div key={order.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
                <div>
                  <p className="font-bold text-amber-600 text-sm">{order.order_code}</p>
                  <p className="text-gray-700 text-sm">{order.customer_name}</p>
                  <p className="text-gray-500 text-xs">{order.business_name}</p>
                </div>
                <div className="text-right">
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">Dorëzuar</span>
                  <p className="text-green-600 font-black mt-1 text-sm">+{(order.delivery_fee || 1.5).toFixed(2)}€</p>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}