import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToggleLeft, ToggleRight, LogOut, Bell, CheckCircle, MapPin, Phone, TrendingUp, Star, Bike, Clock, Package, Settings, AlertTriangle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import TiliGoLogo from "@/components/TiliGoLogo";

const STATUS_LABELS = {
  e_re: "E Re", pranuar: "Pranuar", ne_pergatitje: "Në Përgatitje",
  gati_per_dorezim: "Gati për Dorëzim", ne_rruge: "Në Rrugë",
  dorezuar: "Dorëzuar", anuluar: "Anuluar"
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
        setTimeout(() => setNewOrder(false), 6000);
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

  const availableOrders = orders.filter(o => o.status === "gati_per_dorezim" && !o.delivery_id);
  const myOrders = orders.filter(o => o.delivery_id === driver?.id && o.status === "ne_rruge");
  const myHistory = orders.filter(o => o.delivery_id === driver?.id && o.status === "dorezuar");

  const todayHistory = myHistory.filter(o => {
    const d = new Date(o.created_date);
    return d.toDateString() === new Date().toDateString();
  });
  const todayEarnings = todayHistory.reduce((s, o) => s + (o.delivery_fee || 1.5), 0);
  const totalEarnings = myHistory.reduce((s, o) => s + (o.delivery_fee || 1.5), 0);

  if (!driver) return null;

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-green-800 text-white sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              {driver.image_url ? (
                <img src={driver.image_url} className="w-10 h-10 rounded-xl object-cover border-2 border-white/30" />
              ) : (
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">🛵</div>
              )}
              <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${driver.is_available ? "bg-green-400" : "bg-gray-400"}`} />
            </div>
            <div>
              <p className="font-black text-white text-sm">{driver.name}</p>
              <p className="text-green-200 text-xs">{driver.vehicle === "motor" ? "🛵 Motor" : driver.vehicle === "biciklete" ? "🚲 Biçikletë" : "🚗 Makinë"} · {driver.is_available ? "Aktiv" : "Jo aktiv"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleAvailable}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all ${driver.is_available ? "bg-white text-green-700" : "bg-white/20 text-white hover:bg-white/30"}`}>
              {driver.is_available ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
              {driver.is_available ? "Aktiv" : "Jo aktiv"}
            </button>
            <button onClick={logout} className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors">
              <LogOut size={16} className="text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* New order notification */}
      <AnimatePresence>
        {newOrder && (
          <motion.div initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -80, opacity: 0 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-orange-500 text-white px-6 py-3.5 rounded-2xl shadow-2xl font-bold text-sm flex items-center gap-3">
            <Bell size={18} className="animate-bounce" /> 🔔 Porosi e re gati për dorëzim!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="max-w-3xl mx-auto px-4 pt-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            { icon: "💰", label: "Sot", value: `${todayEarnings.toFixed(2)}€`, sub: `${todayHistory.length} dërgesa`, color: "from-green-500 to-green-700" },
            { icon: "📦", label: "Totale", value: myHistory.length, sub: "dërgesa", color: "from-blue-500 to-blue-700" },
            { icon: "🛵", label: "Aktive", value: myOrders.length, sub: "tani", color: "from-purple-500 to-purple-700" },
            { icon: "💵", label: "Të ardhura", value: `${totalEarnings.toFixed(2)}€`, sub: "gjithsej", color: "from-amber-500 to-orange-600" },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className={`bg-gradient-to-br ${s.color} text-white rounded-2xl p-4 shadow-md`}>
              <div className="text-2xl mb-1">{s.icon}</div>
              <p className="font-black text-xl">{s.value}</p>
              <p className="text-white/60 text-xs">{s.label}</p>
              <p className="text-white/40 text-xs">{s.sub}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-40">
        <div className="max-w-3xl mx-auto px-4 flex">
          {[
            { key: "available", label: `📦 Gati`, badge: availableOrders.length },
            { key: "mine", label: `🛵 Të Miat`, badge: myOrders.length },
            { key: "history", label: "📋 Historiku" },
            { key: "settings", label: "⚙️ Cilësimet" },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`relative flex items-center gap-1.5 px-5 py-3.5 text-sm font-bold border-b-2 transition-colors ${tab === t.key ? "border-green-600 text-green-700" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
              {t.label}
              {t.badge > 0 && (
                <span className="ml-0.5 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-black text-[10px]">
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-5 space-y-4">
        {/* AVAILABLE */}
        {tab === "available" && (
          <>
            {loading ? (
              <div className="space-y-3">{[1,2].map(i => <div key={i} className="bg-white rounded-2xl h-32 animate-pulse" />)}</div>
            ) : availableOrders.length === 0 ? (
              <div className="text-center py-24">
                <div className="text-7xl mb-4">📭</div>
                <p className="text-gray-600 font-bold text-lg">Nuk ka porosi gati</p>
                <p className="text-gray-400 text-sm mt-1">
                  {driver.is_available ? "Prisni porositë e reja..." : "Aktivizoni statusin për të marrë porosi"}
                </p>
                {!driver.is_available && (
                  <button onClick={toggleAvailable}
                    className="mt-5 bg-green-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-green-700 transition-colors">
                    Aktivizo Tani →
                  </button>
                )}
              </div>
            ) : availableOrders.map((order, idx) => (
              <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-2xl shadow-sm overflow-hidden border-2 border-orange-200">
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-5 py-3 border-b border-orange-100 flex items-center justify-between">
                  <span className="font-black text-xl text-amber-600">#{order.order_code}</span>
                  <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">Gati për Dorëzim</span>
                </div>
                <div className="p-5">
                  <div className="mb-4">
                    <p className="font-bold text-gray-900 mb-1">🏪 {order.business_name}</p>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin size={14} className="text-blue-600 flex-shrink-0" />
                        <span>{order.customer_address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone size={14} className="text-green-600 flex-shrink-0" />
                        <span className="font-medium">{order.customer_name}</span>
                        <a href={`tel:${order.customer_phone}`} className="text-blue-600 font-bold">{order.customer_phone}</a>
                      </div>
                    </div>
                  </div>
                  {/* Items summary */}
                  <div className="bg-gray-50 rounded-xl p-3 mb-4">
                    {order.items?.map((item, i) => (
                      <p key={i} className="text-xs text-gray-500">{item.qty}× {item.name}</p>
                    ))}
                    <p className="font-bold text-gray-900 text-sm mt-1 pt-1 border-t border-gray-200">{order.total?.toFixed(2)}€ cash</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="bg-green-50 px-4 py-2 rounded-xl">
                      <p className="text-xs text-gray-500">Shpërblimi juaj</p>
                      <p className="font-black text-green-600 text-lg">{(order.delivery_fee || 1.5).toFixed(2)}€</p>
                    </div>
                    <button onClick={() => acceptOrder(order)}
                      className="bg-green-600 hover:bg-green-700 text-white font-black px-6 py-3.5 rounded-xl transition-all shadow-lg hover:shadow-green-200 hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2">
                      <Bike size={18} /> Prano Dorëzimin
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </>
        )}

        {/* MY ACTIVE */}
        {tab === "mine" && (
          <>
            {myOrders.length === 0 ? (
              <div className="text-center py-24">
                <div className="text-7xl mb-4">🛵</div>
                <p className="text-gray-600 font-bold text-lg">Nuk keni dorëzime aktive</p>
                <p className="text-gray-400 text-sm mt-1">Pranoni një porosi nga lista "Gati"</p>
              </div>
            ) : myOrders.map((order, idx) => (
              <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-2xl shadow-sm overflow-hidden border-2 border-purple-200">
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-5 py-3 border-b border-purple-100 flex items-center justify-between">
                  <span className="font-black text-xl text-amber-600">#{order.order_code}</span>
                  <span className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> Në Rrugë
                  </span>
                </div>
                <div className="p-5">
                  <p className="font-bold text-gray-900 mb-3">🏪 {order.business_name}</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-xl px-3 py-2">
                      <MapPin size={14} className="text-blue-600 flex-shrink-0" />
                      <span className="font-medium">{order.customer_address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm bg-gray-50 rounded-xl px-3 py-2">
                      <Phone size={14} className="text-green-600 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">{order.customer_name}</span>
                      <a href={`tel:${order.customer_phone}`} className="text-blue-600 font-black">{order.customer_phone}</a>
                    </div>
                  </div>

                  {/* Animated route */}
                  <div className="bg-gradient-to-r from-purple-50 via-gray-50 to-green-50 rounded-xl p-4 mb-4 flex items-center gap-3">
                    <div className="text-center">
                      <div className="text-2xl">🏪</div>
                      <p className="text-xs text-gray-500 mt-1">Biznesi</p>
                    </div>
                    <div className="flex-1 relative h-6 flex items-center">
                      <div className="w-full border-t-2 border-dashed border-gray-300" />
                      <motion.span
                        className="absolute text-xl"
                        animate={{ x: ["0%", "85%", "0%"] }}
                        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                      >🛵</motion.span>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl">🏠</div>
                      <p className="text-xs text-gray-500 mt-1">Klienti</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-700 font-black text-xl">{order.total?.toFixed(2)}€</p>
                      <p className="text-xs text-gray-500">cash + <span className="text-green-600 font-bold">+{(order.delivery_fee || 1.5).toFixed(2)}€</span> shpërblim</p>
                    </div>
                    <button onClick={() => completeOrder(order)}
                      className="bg-green-600 hover:bg-green-700 text-white font-black px-6 py-3.5 rounded-xl transition-all shadow-lg hover:shadow-green-200 flex items-center gap-2">
                      <CheckCircle size={18} /> U Dorëzua!
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </>
        )}

        {/* HISTORY */}
        {tab === "history" && (
          <>
            {myHistory.length === 0 ? (
              <div className="text-center py-24">
                <div className="text-7xl mb-4">📋</div>
                <p className="text-gray-600 font-bold">Nuk ka historik akoma</p>
              </div>
            ) : (
              <>
                <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-2xl p-5 mb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-200 text-sm">Gjithsej të ardhura</p>
                      <p className="font-black text-3xl">{totalEarnings.toFixed(2)}€</p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-200 text-sm">Dërgesa totale</p>
                      <p className="font-black text-3xl">{myHistory.length}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  {myHistory.map((order, i) => (
                    <motion.div key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                      className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <CheckCircle size={18} className="text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-amber-600 text-sm">#{order.order_code}</p>
                        <p className="text-gray-700 text-sm font-medium">{order.customer_name}</p>
                        <p className="text-gray-400 text-xs">{order.business_name} · {new Date(order.created_date).toLocaleDateString("sq-AL")}</p>
                      </div>
                      <div className="text-right">
                        <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">Dorëzuar</span>
                        <p className="text-green-600 font-black mt-1 text-base">+{(order.delivery_fee || 1.5).toFixed(2)}€</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* SETTINGS */}
        {tab === "settings" && (
          <div className="space-y-4 max-w-lg">
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-1">Informacionet e Llogarisë</h3>
              <p className="text-gray-500 text-sm mb-4">Të dhënat e profilit tuaj</p>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Emri</span>
                  <span className="font-bold text-gray-900">{driver.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Telefoni</span>
                  <span className="font-bold text-gray-900">{driver.phone}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Mjeti</span>
                  <span className="font-bold text-gray-900">{driver.vehicle === "motor" ? "🛵 Motor" : driver.vehicle === "biciklete" ? "🚲 Biçikletë" : "🚗 Makinë"}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                <LogOut size={16} className="text-gray-500" /> Dil nga Llogaria
              </h3>
              <p className="text-gray-500 text-sm mb-4">Do të ridrejtoheni në faqen kryesore.</p>
              <button onClick={logout}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-xl transition-colors text-sm">
                Dil nga Llogaria
              </button>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
              <h3 className="font-bold text-red-700 mb-1 flex items-center gap-2">
                <AlertTriangle size={16} /> Fshij Llogarinë
              </h3>
              <p className="text-red-500 text-sm mb-4">Ky veprim është i pakthyeshëm. E gjithë historia dhe të dhënat tuaja do të fshihen.</p>
              <button
                onClick={async () => {
                  if (!confirm("Jeni absolutisht i sigurt? Kjo nuk mund të kthehet mbrapsht!")) return;
                  await base44.entities.Delivery.delete(driver.id);
                  localStorage.removeItem("tiligo_delivery");
                  navigate("/");
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors text-sm">
                🗑️ Fshij Llogarinë Përgjithmonë
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}