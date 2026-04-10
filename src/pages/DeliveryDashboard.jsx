import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ToggleLeft, ToggleRight, LogOut, Bell, CheckCircle, MapPin, Phone, Bike, AlertTriangle, Navigation, FileText } from "lucide-react";
import StatementGenerator from "@/components/StatementGenerator";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import LiveRouteMap from "@/components/LiveRouteMap";
import "leaflet/dist/leaflet.css";

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2-lat1)*Math.PI/180;
  const dLng = (lng2-lng1)*Math.PI/180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

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
  const [driverCoords, setDriverCoords] = useState(null);
  const gpsWatchRef = useRef(null);

  useEffect(() => {
    if (!driver) { navigate("/dorezuesi/login"); return; }
    loadOrders();
    // Start GPS tracking
    if (navigator.geolocation) {
      gpsWatchRef.current = navigator.geolocation.watchPosition(
        (pos) => setDriverCoords([pos.coords.latitude, pos.coords.longitude]),
        null, { enableHighAccuracy: true, maximumAge: 5000 }
      );
    }
    return () => { if (gpsWatchRef.current) navigator.geolocation.clearWatch(gpsWatchRef.current); };
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
    const updateData = { status: "ne_rruge", delivery_id: driver.id, delivery_name: driver.name };
    if (driverCoords) { updateData.delivery_lat = driverCoords[0]; updateData.delivery_lng = driverCoords[1]; }
    const updated = { ...order, ...updateData };
    setOrders(prev => prev.map(o => o.id === order.id ? updated : o));
    await base44.entities.Order.update(order.id, updateData);
  };

  // Broadcast driver GPS every 10s for active orders
  useEffect(() => {
    if (!driverCoords || myOrders.length === 0) return;
    myOrders.forEach(order => {
      base44.entities.Order.update(order.id, { delivery_lat: driverCoords[0], delivery_lng: driverCoords[1] });
    });
  }, [driverCoords]);

  const completeOrder = async (order) => {
    // Optimistic update
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: "dorezuar" } : o));
    await base44.entities.Order.update(order.id, { status: "dorezuar" });
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
    <div className="min-h-screen" style={{ background: 'var(--bg-body)' }}>
      {/* Header */}
      <div className="sticky top-0 z-50 shadow-xl" style={{ background: 'var(--nav-bg)', borderBottom: '1px solid var(--nav-border)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              {driver.image_url ? (
                <img src={driver.image_url} className="w-11 h-11 rounded-2xl object-cover"
                  style={{ border: '2px solid rgba(57,255,107,0.5)', boxShadow: '0 0 12px rgba(57,255,107,0.3)' }} />
              ) : (
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl"
                  style={{ background: 'linear-gradient(135deg,rgba(57,255,107,0.2),rgba(0,191,255,0.2))', border: '2px solid rgba(57,255,107,0.4)' }}>🛵</div>
              )}
              <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 ${driver.is_available ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`}
                style={{ borderColor: 'var(--bg-body)' }} />
            </div>
            <div>
              <p className="font-black text-sm" style={{ color: 'var(--text-heading)' }}>{driver.name}</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{driver.vehicle === "motor" ? "🛵 Motor" : driver.vehicle === "biciklete" ? "🚲 Biçikletë" : "🚗 Makinë"} · {driver.is_available ? "✅ Aktiv" : "🔴 Jo aktiv"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleAvailable}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all"
              style={driver.is_available
                ? { background: 'linear-gradient(135deg,#39FF6B,#00BFFF)', color: '#020c1b', boxShadow: '0 0 12px rgba(57,255,107,0.4)' }
                : { background: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)', border: '1px solid var(--nav-border)' }}>
              {driver.is_available ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
              {driver.is_available ? "Aktiv" : "Jo aktiv"}
            </button>
            <button onClick={logout} className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid var(--nav-border)' }}>
              <LogOut size={16} style={{ color: 'var(--text-secondary)' }} />
            </button>
          </div>
        </div>
      </div>

      {/* New order notification */}
      <AnimatePresence>
        {newOrder && (
          <motion.div initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -80, opacity: 0 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3.5 rounded-2xl shadow-2xl font-bold text-sm flex items-center gap-3"
            style={{ background: 'linear-gradient(135deg,#39FF6B,#00BFFF)', color: '#020c1b', boxShadow: '0 0 30px rgba(57,255,107,0.5)' }}>
            <Bell size={18} className="animate-bounce" /> 🔔 Porosi e re gati për dorëzim!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="max-w-3xl mx-auto px-4 pt-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            { icon: "💰", label: "Sot", value: `${todayEarnings.toFixed(2)}€`, sub: `${todayHistory.length} dërgesa`, grad: 'from-green-500 to-green-700' },
            { icon: "📦", label: "Totale", value: myHistory.length, sub: "dërgesa", grad: 'from-blue-500 to-blue-700' },
            { icon: "🛵", label: "Aktive", value: myOrders.length, sub: "tani", grad: 'from-purple-500 to-purple-700' },
            { icon: "💵", label: "Të ardhura", value: `${totalEarnings.toFixed(2)}€`, sub: "gjithsej", grad: 'from-amber-500 to-orange-600' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className={`bg-gradient-to-br ${s.grad} text-white rounded-2xl p-4 shadow-lg`}>
              <div className="text-2xl mb-1">{s.icon}</div>
              <p className="font-black text-xl">{s.value}</p>
              <p className="text-white/60 text-xs">{s.label}</p>
              <p className="text-white/40 text-xs">{s.sub}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-16 z-40" style={{ background: 'var(--nav-bg)', borderBottom: '1px solid var(--nav-border)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-3xl mx-auto px-4 flex">
          {[
            { key: "available", label: `📦 Gati`, badge: availableOrders.length },
            { key: "mine", label: `🛵 Të Miat`, badge: myOrders.length },
            { key: "history", label: "📋 Historiku" },
            { key: "statement", label: "📊 Pasqyra" },
            { key: "settings", label: "⚙️ Cilësimet" },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="relative flex items-center gap-1.5 px-5 py-3.5 text-sm font-bold border-b-2 transition-colors"
              style={tab === t.key
                ? { borderColor: '#39FF6B', color: '#39FF6B' }
                : { borderColor: 'transparent', color: 'var(--text-muted)' }}>
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
              <div className="space-y-3">{[1,2].map(i => <div key={i} className="rounded-2xl h-32 animate-pulse" style={{ background: 'var(--card-bg)' }} />)}</div>
            ) : availableOrders.length === 0 ? (
              <div className="text-center py-24">
                <div className="text-7xl mb-4">📭</div>
                <p className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Nuk ka porosi gati</p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                  {driver.is_available ? "Prisni porositë e reja..." : "Aktivizoni statusin për të marrë porosi"}
                </p>
                {!driver.is_available && (
                  <button onClick={toggleAvailable}
                    className="mt-5 font-bold px-6 py-3 rounded-xl transition-colors"
                    style={{ background: 'linear-gradient(135deg,#39FF6B,#00BFFF)', color: '#020c1b' }}>
                    Aktivizo Tani →
                  </button>
                )}
              </div>
            ) : availableOrders.map((order, idx) => (
              <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                className="rounded-2xl shadow-lg overflow-hidden"
                style={{ background: 'var(--card-bg)', border: '1.5px solid rgba(251,146,60,0.4)' }}>
                <div className="px-5 py-3 flex items-center justify-between" style={{ background: 'rgba(251,146,60,0.1)', borderBottom: '1px solid rgba(251,146,60,0.2)' }}>
                  <span className="font-black text-xl" style={{ color: '#FBBF24' }}>#{order.order_code}</span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: 'rgba(251,146,60,0.25)', color: '#FB923C' }}>Gati për Dorëzim</span>
                </div>
                <div className="p-5">
                  <div className="mb-4">
                    <p className="font-bold mb-1" style={{ color: 'var(--text-heading)' }}>🏪 {order.business_name}</p>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        <MapPin size={14} style={{ color: '#00BFFF' }} className="flex-shrink-0" />
                        <span>{order.customer_address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        <Phone size={14} style={{ color: '#39FF6B' }} className="flex-shrink-0" />
                        <span className="font-medium">{order.customer_name}</span>
                        <a href={`tel:${order.customer_phone}`} style={{ color: '#00BFFF' }} className="font-bold">{order.customer_phone}</a>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl p-3 mb-4" style={{ background: 'rgba(0,40,80,0.4)', border: '1px solid var(--divider)' }}>
                    {order.items?.map((item, i) => (
                      <p key={i} className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.qty}× {item.name}</p>
                    ))}
                    <p className="font-bold text-sm mt-1 pt-1" style={{ color: 'var(--text-primary)', borderTop: '1px solid var(--divider)' }}>{order.total?.toFixed(2)}€ cash</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="px-4 py-2 rounded-xl" style={{ background: 'rgba(57,255,107,0.1)', border: '1px solid rgba(57,255,107,0.25)' }}>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Shpërblimi juaj</p>
                      <p className="font-black text-lg" style={{ color: '#39FF6B' }}>{(order.delivery_fee || 1.5).toFixed(2)}€</p>
                    </div>
                    <button onClick={() => acceptOrder(order)}
                      className="font-black px-6 py-3.5 rounded-xl transition-all flex items-center gap-2 active:scale-95"
                      style={{ background: 'linear-gradient(135deg,#39FF6B,#00BFFF)', color: '#020c1b', boxShadow: '0 0 16px rgba(57,255,107,0.4)' }}>
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
                <p className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Nuk keni dorëzime aktive</p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Pranoni një porosi nga lista "Gati"</p>
              </div>
            ) : myOrders.map((order, idx) => (
              <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                className="rounded-2xl shadow-lg overflow-hidden"
                style={{ background: 'var(--card-bg)', border: '1.5px solid rgba(139,92,246,0.4)' }}>
                <div className="px-5 py-3 flex items-center justify-between" style={{ background: 'rgba(139,92,246,0.1)', borderBottom: '1px solid rgba(139,92,246,0.2)' }}>
                  <span className="font-black text-xl" style={{ color: '#FBBF24' }}>#{order.order_code}</span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5"
                    style={{ background: 'rgba(139,92,246,0.25)', color: '#A78BFA' }}>
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" /> Në Rrugë
                  </span>
                </div>
                <div className="p-5">
                  <p className="font-bold mb-3" style={{ color: 'var(--text-heading)' }}>🏪 {order.business_name}</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm rounded-xl px-3 py-2"
                      style={{ background: 'rgba(0,40,80,0.4)', border: '1px solid var(--divider)', color: 'var(--text-secondary)' }}>
                      <MapPin size={14} style={{ color: '#00BFFF' }} className="flex-shrink-0" />
                      <span className="font-medium">{order.customer_address}</span>
                      {order.customer_lat && (
                        <a href={`https://www.google.com/maps/dir/?api=1&destination=${order.customer_lat},${order.customer_lng}`}
                          target="_blank" rel="noopener noreferrer"
                          className="ml-auto text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1"
                          style={{ background: 'linear-gradient(135deg,#39FF6B,#00BFFF)', color: '#020c1b' }}>
                          <Navigation size={10} /> Navigate
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm rounded-xl px-3 py-2"
                      style={{ background: 'rgba(0,40,80,0.4)', border: '1px solid var(--divider)' }}>
                      <Phone size={14} style={{ color: '#39FF6B' }} className="flex-shrink-0" />
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{order.customer_name}</span>
                      <a href={`tel:${order.customer_phone}`} style={{ color: '#00BFFF' }} className="font-black">{order.customer_phone}</a>
                    </div>
                  </div>

                  {/* Live route map */}
                  {order.customer_lat && (
                    <div className="mb-4">
                      <LiveRouteMap
                        driverCoords={driverCoords}
                        customerCoords={[order.customer_lat, order.customer_lng]}
                        customerName={order.customer_name}
                        customerAddress={order.customer_address}
                      />
                    </div>
                  )}
                  {order.customer_lat && driverCoords && (
                    <div className="rounded-xl px-4 py-2 mb-3 flex items-center justify-between text-sm"
                      style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)' }}>
                      <span className="font-medium" style={{ color: '#A78BFA' }}>📍 Distanca nga klienti</span>
                      <span className="font-black" style={{ color: 'var(--text-heading)' }}>{haversineKm(driverCoords[0],driverCoords[1],order.customer_lat,order.customer_lng).toFixed(2)} km · ~{Math.ceil(haversineKm(driverCoords[0],driverCoords[1],order.customer_lat,order.customer_lng)/30*60)} min</span>
                    </div>
                  )}

                  {/* Animated route */}
                  <div className="rounded-xl p-4 mb-4 flex items-center gap-3"
                    style={{ background: 'linear-gradient(135deg,rgba(139,92,246,0.12),rgba(0,40,80,0.3),rgba(57,255,107,0.08))', border: '1px solid var(--divider)' }}>
                    <div className="text-center">
                      <div className="text-2xl">🏪</div>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Biznesi</p>
                    </div>
                    <div className="flex-1 relative h-6 flex items-center">
                      <div className="w-full border-t-2 border-dashed" style={{ borderColor: 'rgba(0,191,255,0.3)' }} />
                      <motion.span
                        className="absolute text-xl"
                        animate={{ x: ["0%", "85%", "0%"] }}
                        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                      >🛵</motion.span>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl">🏠</div>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Klienti</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-black text-xl" style={{ color: '#39FF6B' }}>{order.total?.toFixed(2)}€</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>cash + <span style={{ color: '#39FF6B' }} className="font-bold">+{(order.delivery_fee || 1.5).toFixed(2)}€</span> shpërblim</p>
                    </div>
                    <button onClick={() => completeOrder(order)}
                      className="font-black px-6 py-3.5 rounded-xl transition-all flex items-center gap-2 active:scale-95"
                      style={{ background: 'linear-gradient(135deg,#39FF6B,#00BFFF)', color: '#020c1b', boxShadow: '0 0 16px rgba(57,255,107,0.4)' }}>
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
                <p className="font-bold" style={{ color: 'var(--text-primary)' }}>Nuk ka historik akoma</p>
              </div>
            ) : (
              <>
                <div className="rounded-2xl p-5 mb-2 text-white" style={{ background: 'linear-gradient(135deg,#059669,#10B981)', boxShadow: '0 0 20px rgba(57,255,107,0.2)' }}>
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
                      className="rounded-2xl p-4 flex items-center gap-3" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(57,255,107,0.15)' }}>
                        <CheckCircle size={18} style={{ color: '#39FF6B' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm" style={{ color: '#FBBF24' }}>#{order.order_code}</p>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{order.customer_name}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{order.business_name} · {new Date(order.created_date).toLocaleDateString("sq-AL")}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(57,255,107,0.15)', color: '#39FF6B' }}>Dorëzuar</span>
                        <p className="font-black mt-1 text-base" style={{ color: '#39FF6B' }}>+{(order.delivery_fee || 1.5).toFixed(2)}€</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* STATEMENT */}
        {tab === "statement" && (
          <div className="max-w-2xl">
            <StatementGenerator orders={myHistory.concat(myOrders)} mode="delivery" entityName={driver.name} isAdmin={false} />
          </div>
        )}

        {/* SETTINGS */}
        {tab === "settings" && (
          <div className="space-y-4 max-w-lg">
            <div className="rounded-2xl p-5" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
              {driver.image_url && (
                <div className="flex justify-center mb-4">
                  <img src={driver.image_url} alt={driver.name}
                    className="w-20 h-20 rounded-2xl object-cover"
                    style={{ border: '2.5px solid rgba(57,255,107,0.5)', boxShadow: '0 0 20px rgba(57,255,107,0.3)' }} />
                </div>
              )}
              <h3 className="font-bold mb-1" style={{ color: 'var(--text-heading)' }}>Informacionet e Llogarisë</h3>
              <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Të dhënat e profilit tuaj</p>
              <div className="space-y-3 text-sm">
                {[['Emri', driver.name], ['Telefoni', driver.phone], ['Mjeti', driver.vehicle === 'motor' ? '🛵 Motor' : driver.vehicle === 'biciklete' ? '🚲 Biçikletë' : '🚗 Makinë']].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-2" style={{ borderBottom: '1px solid var(--divider)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                    <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl p-5" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
              <h3 className="font-bold mb-1 flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
                <LogOut size={16} style={{ color: 'var(--text-muted)' }} /> Dil nga Llogaria
              </h3>
              <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Do të ridrejtoheni në faqen kryesore.</p>
              <button onClick={logout}
                className="w-full font-bold py-3 rounded-xl transition-colors text-sm"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--text-primary)', border: '1px solid var(--nav-border)' }}>
                Dil nga Llogaria
              </button>
            </div>

            <div className="rounded-2xl p-5" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <h3 className="font-bold mb-1 flex items-center gap-2" style={{ color: '#EF4444' }}>
                <AlertTriangle size={16} /> Fshij Llogarinë
              </h3>
              <p className="text-sm mb-4" style={{ color: 'rgba(239,68,68,0.8)' }}>Ky veprim është i pakthyeshëm. E gjithë historia dhe të dhënat tuaja do të fshihen.</p>
              <button
                onClick={async () => {
                  if (!confirm("Jeni absolutisht i sigurt? Kjo nuk mund të kthehet mbrapsht!")) return;
                  await base44.entities.Delivery.delete(driver.id);
                  localStorage.removeItem("tiligo_delivery");
                  navigate("/");
                }}
                className="w-full text-white font-bold py-3 rounded-xl transition-colors text-sm"
                style={{ background: '#DC2626' }}>
                🗑️ Fshij Llogarinë Përgjithmonë
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}