import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ToggleLeft, ToggleRight, LogOut, Bell, CheckCircle, MapPin,
  Phone, AlertTriangle, Navigation, FileText, DollarSign,
  Package, Clock, TrendingUp, Bike, User, Settings, ArrowRight
} from "lucide-react";
import StatementGenerator from "@/components/StatementGenerator";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import LiveRouteMap from "@/components/LiveRouteMap";
import "leaflet/dist/leaflet.css";

const W = "#009DE0";
const G = "#30C48D";

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371, dLat = (lat2-lat1)*Math.PI/180, dLng = (lng2-lng1)*Math.PI/180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

const VEHICLE_LABEL = { motor: "Motorcycle", biciklete: "Bicycle", makine: "Car" };
const VEHICLE_ICON = { motor: "🛵", biciklete: "🚲", makine: "🚗" };

export default function DeliveryDashboard() {
  const navigate = useNavigate();
  const [driver, setDriver] = useState(() => {
    try { return JSON.parse(localStorage.getItem("tiligo_delivery") || "null"); } catch { return null; }
  });
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState("available");
  const [loading, setLoading] = useState(true);
  const [newOrderAlert, setNewOrderAlert] = useState(false);
  const [driverCoords, setDriverCoords] = useState(null);
  const gpsRef = useRef(null);

  useEffect(() => {
    if (!driver) { navigate("/dorezuesi/login"); return; }
    loadOrders();
    if (navigator.geolocation) {
      gpsRef.current = navigator.geolocation.watchPosition(
        pos => setDriverCoords([pos.coords.latitude, pos.coords.longitude]),
        null, { enableHighAccuracy: true, maximumAge: 5000 }
      );
    }
    return () => { if (gpsRef.current) navigator.geolocation.clearWatch(gpsRef.current); };
  }, [driver]);

  useEffect(() => {
    if (!driver) return;
    const unsub = base44.entities.Order.subscribe((event) => {
      if (event.data?.status === "gati_per_dorezim" && !event.data?.delivery_id) {
        setNewOrderAlert(true); setTimeout(() => setNewOrderAlert(false), 6000);
      }
      if (event.type === "update") loadOrders();
    });
    return unsub;
  }, [driver]);

  // Broadcast GPS to active orders
  useEffect(() => {
    if (!driverCoords || myOrders.length === 0) return;
    myOrders.forEach(o => base44.entities.Order.update(o.id, { delivery_lat: driverCoords[0], delivery_lng: driverCoords[1] }));
  }, [driverCoords]);

  const loadOrders = async () => {
    setLoading(true);
    const data = await base44.entities.Order.list("-created_date", 100);
    setOrders(data); setLoading(false);
  };

  const toggleAvailable = async () => {
    const upd = { ...driver, is_available: !driver.is_available };
    await base44.entities.Delivery.update(driver.id, { is_available: upd.is_available });
    setDriver(upd); localStorage.setItem("tiligo_delivery", JSON.stringify(upd));
  };

  const acceptOrder = async (order) => {
    const upd = { status: "ne_rruge", delivery_id: driver.id, delivery_name: driver.name };
    if (driverCoords) { upd.delivery_lat = driverCoords[0]; upd.delivery_lng = driverCoords[1]; }
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, ...upd } : o));
    await base44.entities.Order.update(order.id, upd);
  };

  const completeOrder = async (order) => {
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: "dorezuar" } : o));
    await base44.entities.Order.update(order.id, { status: "dorezuar" });
  };

  const logout = () => { localStorage.removeItem("tiligo_delivery"); navigate("/"); };
  if (!driver) return null;

  const availableOrders = orders.filter(o => o.status === "gati_per_dorezim" && !o.delivery_id);
  const myOrders = orders.filter(o => o.delivery_id === driver?.id && o.status === "ne_rruge");
  const myHistory = orders.filter(o => o.delivery_id === driver?.id && o.status === "dorezuar");
  const todayHistory = myHistory.filter(o => new Date(o.created_date).toDateString() === new Date().toDateString());
  const todayEarnings = todayHistory.reduce((s, o) => s + (o.delivery_fee || 1.5), 0);
  const totalEarnings = myHistory.reduce((s, o) => s + (o.delivery_fee || 1.5), 0);

  const TABS = [
    { key: "available", label: "Available", badge: availableOrders.length },
    { key: "mine", label: "Active", badge: myOrders.length },
    { key: "history", label: "History" },
    { key: "statement", label: "Statement" },
    { key: "settings", label: "Settings" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#F5F7FA" }}>
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              {driver.image_url
                ? <img src={driver.image_url} className="w-10 h-10 rounded-full object-cover border-2 border-gray-100" />
                : <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl bg-gray-100">{VEHICLE_ICON[driver.vehicle] || "🛵"}</div>
              }
              <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${driver.is_available ? "bg-green-400 animate-pulse" : "bg-gray-300"}`} />
            </div>
            <div>
              <p className="font-bold text-sm text-gray-900">{driver.name}</p>
              <p className="text-xs text-gray-500">{VEHICLE_LABEL[driver.vehicle]} · {driver.is_available ? <span style={{ color: G }}>Active</span> : "Inactive"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleAvailable}
              className="flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl transition-all"
              style={driver.is_available ? { background: G, color: "#fff" } : { background: "#F3F4F6", color: "#374151" }}>
              {driver.is_available ? <ToggleRight size={16}/> : <ToggleLeft size={16}/>}
              {driver.is_available ? "Active" : "Go Active"}
            </button>
            <button onClick={logout} className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
              <LogOut size={16} className="text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      {/* New order notification */}
      <AnimatePresence>
        {newOrderAlert && (
          <motion.div initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -60, opacity: 0 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-xl font-bold text-sm text-white flex items-center gap-3"
            style={{ background: W }}>
            <Bell size={18} className="animate-bounce" /> New order ready for pickup!
          </motion.div>
        )}
      </AnimatePresence>

      {/* KPIs */}
      <div className="max-w-3xl mx-auto px-4 pt-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            { icon: <DollarSign size={20}/>, label: "Today's Earnings", value: `${todayEarnings.toFixed(2)}€`, color: G, bg: G+"18" },
            { icon: <Package size={20}/>, label: "Today's Deliveries", value: todayHistory.length, color: W, bg: W+"15" },
            { icon: <TrendingUp size={20}/>, label: "Total Earnings", value: `${totalEarnings.toFixed(2)}€`, color: "#8B5CF6", bg: "#F3E8FF" },
            { icon: <CheckCircle size={20}/>, label: "All Deliveries", value: myHistory.length, color: "#F59E0B", bg: "#FEF3C7" },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: s.bg }}>
                <span style={{ color: s.color }}>{s.icon}</span>
              </div>
              <p className="font-black text-xl text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-16 z-40 bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 flex overflow-x-auto no-scrollbar">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="relative flex items-center gap-1.5 px-4 py-3.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap"
              style={tab === t.key ? { borderColor: W, color: W } : { borderColor: "transparent", color: "#6B7280" }}>
              {t.label}
              {t.badge > 0 && <span className="ml-1 bg-red-500 text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center">{t.badge}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-5 space-y-3">

        {/* AVAILABLE */}
        {tab === "available" && (
          loading ? [1,2].map(i => <div key={i} className="bg-white rounded-2xl h-36 animate-pulse shadow-sm" />) :
          availableOrders.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-2xl shadow-sm">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: W + "15" }}>
                <Package size={28} style={{ color: W }} />
              </div>
              <p className="font-bold text-gray-900">No orders available</p>
              <p className="text-sm text-gray-400 mt-1">{driver.is_available ? "Waiting for new orders..." : "Go active to receive orders"}</p>
              {!driver.is_available && (
                <button onClick={toggleAvailable} className="mt-4 font-bold px-6 py-2.5 rounded-xl text-white text-sm" style={{ background: G }}>
                  Go Active
                </button>
              )}
            </div>
          ) : availableOrders.map((order, idx) => (
            <motion.div key={order.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="h-1 w-full" style={{ background: "#F97316" }} />
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-black text-lg text-gray-900">#{order.order_code}</p>
                    <p className="font-semibold text-gray-700">{order.business_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-xl" style={{ color: G }}>+{(order.delivery_fee || 1.5).toFixed(2)}€</p>
                    <p className="text-xs text-gray-400">your earnings</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                    <MapPin size={14} style={{ color: W }} />
                    <span className="text-sm text-gray-700">{order.customer_address}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                    <User size={14} style={{ color: G }} />
                    <span className="text-sm font-medium text-gray-800">{order.customer_name}</span>
                    <a href={`tel:${order.customer_phone}`} className="ml-auto text-sm font-bold" style={{ color: W }}>{order.customer_phone}</a>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 mb-4 space-y-1">
                  {order.items?.map((item, i) => <p key={i} className="text-xs text-gray-600">{item.qty}× {item.name}</p>)}
                  <p className="font-bold text-sm pt-1 border-t border-gray-200 text-gray-900">{order.total?.toFixed(2)}€ cash</p>
                </div>
                <button onClick={() => acceptOrder(order)}
                  className="w-full font-bold py-3 rounded-xl text-white flex items-center justify-center gap-2 text-sm active:scale-98 transition-all"
                  style={{ background: G }}>
                  <Bike size={16}/> Accept Delivery <ArrowRight size={15}/>
                </button>
              </div>
            </motion.div>
          ))
        )}

        {/* MY ACTIVE */}
        {tab === "mine" && (
          myOrders.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-2xl shadow-sm">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: "#F3E8FF" }}>
                <Bike size={28} className="text-purple-500" />
              </div>
              <p className="font-bold text-gray-900">No active deliveries</p>
              <p className="text-sm text-gray-400 mt-1">Accept an order from the Available tab</p>
            </div>
          ) : myOrders.map((order, idx) => (
            <motion.div key={order.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="h-1 w-full" style={{ background: "#8B5CF6" }} />
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-black text-lg text-gray-900">#{order.order_code}</p>
                    <p className="font-semibold text-gray-700">{order.business_name}</p>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: "#F3E8FF", color: "#6B21A8" }}>
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse mr-1.5" />On the way
                  </span>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                    <MapPin size={14} style={{ color: W }} />
                    <span className="text-sm text-gray-700 flex-1">{order.customer_address}</span>
                    {order.customer_lat && (
                      <a href={`https://www.google.com/maps/dir/?api=1&destination=${order.customer_lat},${order.customer_lng}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg text-white" style={{ background: W }}>
                        <Navigation size={11}/> Navigate
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                    <Phone size={14} style={{ color: G }} />
                    <span className="text-sm font-medium text-gray-800">{order.customer_name}</span>
                    <a href={`tel:${order.customer_phone}`} className="ml-auto font-bold text-sm" style={{ color: W }}>{order.customer_phone}</a>
                  </div>
                </div>
                {order.customer_lat && <div className="mb-4"><LiveRouteMap driverCoords={driverCoords} customerCoords={[order.customer_lat, order.customer_lng]} customerName={order.customer_name} customerAddress={order.customer_address} vehicle={driver.vehicle} /></div>}
                {order.customer_lat && driverCoords && (
                  <div className="bg-purple-50 rounded-xl px-4 py-2 mb-3 flex items-center justify-between text-sm">
                    <span className="text-purple-700 font-medium">Distance to customer</span>
                    <span className="font-black text-gray-900">{haversineKm(driverCoords[0],driverCoords[1],order.customer_lat,order.customer_lng).toFixed(1)} km · ~{Math.ceil(haversineKm(driverCoords[0],driverCoords[1],order.customer_lat,order.customer_lng)/30*60)} min</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-black text-xl text-gray-900">{order.total?.toFixed(2)}€</p>
                    <p className="text-xs text-gray-500">cash + <span className="font-bold" style={{ color: G }}>+{(order.delivery_fee||1.5).toFixed(2)}€ earnings</span></p>
                  </div>
                  <button onClick={() => completeOrder(order)}
                    className="font-bold px-6 py-3 rounded-xl text-white flex items-center gap-2 text-sm active:scale-98 transition-all"
                    style={{ background: G }}>
                    <CheckCircle size={16}/> Delivered!
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}

        {/* HISTORY */}
        {tab === "history" && (
          myHistory.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-2xl shadow-sm">
              <Clock size={36} className="mx-auto mb-3 text-gray-300" />
              <p className="font-bold text-gray-900">No deliveries yet</p>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-2xl p-5 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total earnings</p>
                  <p className="font-black text-3xl text-gray-900">{totalEarnings.toFixed(2)}€</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total deliveries</p>
                  <p className="font-black text-3xl text-gray-900">{myHistory.length}</p>
                </div>
              </div>
              {myHistory.map((order, i) => (
                <motion.div key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#DCFCE7" }}>
                    <CheckCircle size={18} style={{ color: G }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-900">#{order.order_code}</p>
                    <p className="text-sm text-gray-600">{order.customer_name}</p>
                    <p className="text-xs text-gray-400">{order.business_name} · {new Date(order.created_date).toLocaleDateString()}</p>
                  </div>
                  <p className="font-black text-base" style={{ color: G }}>+{(order.delivery_fee||1.5).toFixed(2)}€</p>
                </motion.div>
              ))}
            </>
          )
        )}

        {tab === "statement" && <StatementGenerator orders={myHistory.concat(myOrders)} mode="delivery" entityName={driver.name} isAdmin={false} />}

        {/* SETTINGS */}
        {tab === "settings" && (
          <div className="space-y-4 max-w-lg">
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              {driver.image_url && <img src={driver.image_url} className="w-20 h-20 rounded-full object-cover mb-4 border border-gray-100" />}
              <h3 className="font-bold text-gray-900 mb-3">Account Info</h3>
              {[["Name", driver.name], ["Phone", driver.phone], ["Vehicle", `${VEHICLE_ICON[driver.vehicle]} ${VEHICLE_LABEL[driver.vehicle]}`]].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2 border-b border-gray-50 text-sm">
                  <span className="text-gray-500">{k}</span>
                  <span className="font-semibold text-gray-900">{v}</span>
                </div>
              ))}
            </div>
            <button onClick={logout} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2 transition-colors">
              <LogOut size={16}/> Sign Out
            </button>
            <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
              <h3 className="font-bold text-red-700 mb-1 flex items-center gap-2"><AlertTriangle size={16}/> Delete Account</h3>
              <p className="text-red-500 text-sm mb-4">Irreversible. All data will be permanently deleted.</p>
              <button onClick={async () => {
                if (!confirm("Are you absolutely sure?")) return;
                await base44.entities.Delivery.delete(driver.id);
                localStorage.removeItem("tiligo_delivery"); navigate("/");
              }} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl text-sm transition-colors">
                Delete Account Permanently
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}