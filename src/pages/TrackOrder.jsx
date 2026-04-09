import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Copy, CheckCircle, Clock, ChefHat, Bike, Package, MapPin, Navigation, Phone, Download } from "lucide-react";
import { generateOrderPDF } from "@/lib/pdfGenerator";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom emoji markers
const makeIcon = (emoji, size = 36) => L.divIcon({
  html: `<div style="font-size:${size}px;line-height:1;filter:drop-shadow(0 2px 6px rgba(0,0,0,0.4))">${emoji}</div>`,
  className: "",
  iconAnchor: [size / 2, size],
  popupAnchor: [0, -size],
});

const STATUS_STEPS = [
  { key: "e_re",           label: "Porosia e Re",       icon: <Package size={16} />,   color: "bg-blue-500",   neon: "shadow-blue-400/60" },
  { key: "pranuar",        label: "Pranuar",             icon: <CheckCircle size={16} />,color: "bg-indigo-500", neon: "shadow-indigo-400/60" },
  { key: "ne_pergatitje",  label: "Në Përgatitje",       icon: <ChefHat size={16} />,   color: "bg-amber-500",  neon: "shadow-amber-400/60" },
  { key: "gati_per_dorezim",label: "Gati për Dorëzim",  icon: <Package size={16} />,   color: "bg-orange-500", neon: "shadow-orange-400/60" },
  { key: "ne_rruge",       label: "Në Rrugë 🛵",         icon: <Bike size={16} />,      color: "bg-purple-500", neon: "shadow-purple-400/60" },
  { key: "dorezuar",       label: "Dorëzuar ✓",          icon: <CheckCircle size={16} />,color: "bg-green-500",  neon: "shadow-green-400/60" },
];

const STATUS_LABELS = {
  e_re: "Porosia e Re", pranuar: "Pranuar", ne_pergatitje: "Në Përgatitje",
  gati_per_dorezim: "Gati për Dorëzim", ne_rruge: "Në Rrugë", dorezuar: "Dorëzuar", anuluar: "Anuluar"
};

// Kosovo bounding box center
const KOSOVO_CENTER = [42.6629, 21.1655];

// Haversine distance in km
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// Estimate ETA based on current status (fallback)
function estimateETA(status) {
  const map = { e_re: 40, pranuar: 35, ne_pergatitje: 25, gati_per_dorezim: 15, ne_rruge: 8, dorezuar: 0 };
  return map[status] ?? null;
}

// Compute GPS-based ETA in seconds (30 km/h avg)
function gpsETA(deliveryCoords, userCoords) {
  if (!deliveryCoords || !userCoords) return null;
  const km = haversineKm(deliveryCoords[0], deliveryCoords[1], userCoords[0], userCoords[1]);
  return Math.round((km / 30) * 3600); // seconds
}

// Smooth map recenter on position change
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 14, { duration: 1.5 });
  }, [center, map]);
  return null;
}

const TILIGO_LOGO = "https://media.base44.com/images/public/69d519273be8cf966434f77a/9ff7c0a46_IMG_0106.jpeg";

const STATUS_MESSAGES = {
  pranuar:          { title: "✅ Porosia u Pranua!",       body: "Biznesi konfirmoi porosinë tuaj. Po përgatitet..." },
  ne_pergatitje:   { title: "👨‍🍳 Duke u Përgatitur!",      body: "Kuzhinieri po punon me porosinë tuaj." },
  gati_per_dorezim:{ title: "📦 Gati për Dorëzim!",       body: "Porosia është gati. Po pritet dorëzuesi..." },
  ne_rruge:        { title: "🛵 Dorëzuesi është Rrugës!",  body: "Porosia juaj po vjen drejt jush tani!" },
  dorezuar:        { title: "🎉 Porosia u Dorëzua!",       body: "Ju urrojmë oreks! Faleminderit që zgjodhët TiliGo 💚" },
  anuluar:         { title: "❌ Porosia u Anulua",          body: "Porosia juaj u anulua. Na kontaktoni për ndihmë." },
};

function requestNotifPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
}

function sendNotif(status) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  const msg = STATUS_MESSAGES[status];
  if (!msg) return;
  const n = new Notification(msg.title, {
    body: msg.body,
    icon: TILIGO_LOGO,
    badge: TILIGO_LOGO,
    image: TILIGO_LOGO,
    vibrate: [200, 100, 200],
    requireInteraction: status === "ne_rruge" || status === "dorezuar",
    tag: "tiligo-order",
  });
  n.onclick = () => { window.focus(); n.close(); };
}

export default function TrackOrder() {
  const { code: urlCode } = useParams();
  const savedCode = localStorage.getItem("tiligo_active_order");
  const code = urlCode || savedCode || "";
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchCode, setSearchCode] = useState(code || "");
  const [copied, setCopied] = useState(false);
  const [userCoords, setUserCoords] = useState(null);
  const [deliveryCoords, setDeliveryCoords] = useState(null);
  const [etaSeconds, setEtaSeconds] = useState(null);
  const [distanceKm, setDistanceKm] = useState(null);
  const countdownRef = useRef(null);
  const prevStatusRef = useRef(null);

  // Delivery "live" simulation — moves toward user
  const deliveryMoveRef = useRef(null);

  useEffect(() => {
    requestNotifPermission();
    if (code) loadOrder(code);
    else setLoading(false);
    // Redirect to tracking URL if loaded from localStorage
    if (!urlCode && savedCode) navigate(`/gjurmo/${savedCode}`, { replace: true });

    // Use order GPS coords if available, else get browser GPS
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setUserCoords([pos.coords.latitude, pos.coords.longitude]),
        () => setUserCoords(KOSOVO_CENTER)
      );
    } else {
      setUserCoords(KOSOVO_CENTER);
    }
  }, [code]);

  useEffect(() => {
    if (!order) return;
    if (order.status === "dorezuar" || order.status === "anuluar") {
      localStorage.removeItem("tiligo_active_order");
    }
    const unsub = base44.entities.Order.subscribe((event) => {
      if (event.data?.order_code === order.order_code) {
        const updated = event.data;
        setOrder(updated);
        // Fire notification only on status change
        if (updated.status !== prevStatusRef.current) {
          sendNotif(updated.status);
          prevStatusRef.current = updated.status;
        }
        if (updated.status === "dorezuar" || updated.status === "anuluar") {
          localStorage.removeItem("tiligo_active_order");
        }
      }
    });
    return unsub;
  }, [order?.order_code, order?.status]);

  // Use order GPS for customer coords if available
  const effectiveUserCoords = (order?.customer_lat && order?.customer_lng)
    ? [order.customer_lat, order.customer_lng]
    : userCoords;

  // Delivery moves toward customer; if order has delivery_lat/lng use those
  useEffect(() => {
    if (order?.status === "ne_rruge" && effectiveUserCoords) {
      // If order has real delivery GPS, use it; otherwise simulate
      if (order.delivery_lat && order.delivery_lng) {
        const dc = [order.delivery_lat, order.delivery_lng];
        setDeliveryCoords(dc);
        const realEta = gpsETA(dc, effectiveUserCoords);
        setEtaSeconds(realEta);
        const km = haversineKm(dc[0], dc[1], effectiveUserCoords[0], effectiveUserCoords[1]);
        setDistanceKm(km);
        return;
      }
      const angle = Math.random() * 2 * Math.PI;
      const startLat = effectiveUserCoords[0] + Math.sin(angle) * 0.015;
      const startLng = effectiveUserCoords[1] + Math.cos(angle) * 0.020;
      setDeliveryCoords([startLat, startLng]);

      let step = 0;
      const totalSteps = 60;
      deliveryMoveRef.current = setInterval(() => {
        step++;
        const t = step / totalSteps;
        const lat = startLat + (effectiveUserCoords[0] - startLat) * t;
        const lng = startLng + (effectiveUserCoords[1] - startLng) * t;
        setDeliveryCoords([lat, lng]);
        const realEta = gpsETA([lat, lng], effectiveUserCoords);
        setEtaSeconds(realEta !== null ? realEta : Math.max(0, Math.round((1 - t) * (estimateETA("ne_rruge") * 60))));
        const km = haversineKm(lat, lng, effectiveUserCoords[0], effectiveUserCoords[1]);
        setDistanceKm(km);
        if (step >= totalSteps) clearInterval(deliveryMoveRef.current);
      }, 3000);
    } else {
      if (deliveryMoveRef.current) clearInterval(deliveryMoveRef.current);
      const eta = estimateETA(order?.status);
      if (eta !== null) setEtaSeconds(eta * 60);
    }
    return () => { if (deliveryMoveRef.current) clearInterval(deliveryMoveRef.current); };
  }, [order?.status, order?.delivery_lat, order?.delivery_lng, effectiveUserCoords]);

  const loadOrder = async (c) => {
    setLoading(true);
    const orders = await base44.entities.Order.filter({ order_code: c.toUpperCase() });
    setOrder(orders[0] || null);
    setLoading(false);
  };

  // Tick countdown every second
  useEffect(() => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (etaSeconds !== null && etaSeconds > 0 && order?.status !== "dorezuar" && order?.status !== "anuluar") {
      countdownRef.current = setInterval(() => {
        setEtaSeconds(s => {
          if (s <= 1) { clearInterval(countdownRef.current); return 0; }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(countdownRef.current);
  }, [order?.status, etaSeconds !== null]);

  const currentStep = STATUS_STEPS.findIndex(s => s.key === order?.status);

  const copyCode = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.order_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatETA = (secs) => {
    if (secs === null || secs === undefined) return null;
    if (secs <= 0) return "Çdo moment";
    const m = Math.ceil(secs / 60);
    return `~${m} min`;
  };

  const routePoints = deliveryCoords && effectiveUserCoords ? [deliveryCoords, effectiveUserCoords] : [];
  const mapCenter = deliveryCoords || effectiveUserCoords || KOSOVO_CENTER;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-body)' }}>
      <div className="flex flex-col items-center gap-4">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 rounded-full" style={{ border: '4px solid rgba(57,255,107,0.2)', borderTopColor: '#39FF6B' }} />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Duke ngarkuar...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-body)' }}>
      {/* Header */}
      <div className="sticky top-0 z-50 shadow-xl" style={{ background: 'var(--nav-bg)', borderBottom: '1px solid var(--nav-border)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => navigate("/")}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid var(--nav-border)' }}>
            <ArrowLeft size={18} style={{ color: 'var(--text-primary)' }} />
          </button>
          <div className="flex-1">
            <h1 className="font-black text-base" style={{ color: 'var(--text-heading)' }}>Gjurmo Porosinë</h1>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>TiliGo Live Tracking</p>
          </div>
          {order?.status === "ne_rruge" && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full"
              style={{ background: 'rgba(57,255,107,0.15)', border: '1px solid rgba(57,255,107,0.4)' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#39FF6B' }} />
              <span className="text-xs font-bold" style={{ color: '#39FF6B' }}>Live</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
        {/* Search */}
        {!code && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-5" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
            <h2 className="font-bold mb-3" style={{ color: 'var(--text-heading)' }}>Fut Kodin e Porosisë</h2>
            <div className="flex gap-2">
              <input
                value={searchCode}
                onChange={e => setSearchCode(e.target.value.toUpperCase())}
                placeholder="p.sh. TG-ABC12"
                className="flex-1 rounded-xl px-4 py-3 text-sm outline-none font-mono"
                style={{ background: 'var(--input-bg)', border: '1.5px solid var(--card-border)', color: 'var(--text-primary)' }}
              />
              <button onClick={() => loadOrder(searchCode)}
                className="px-5 py-3 rounded-xl font-bold text-sm transition-all"
                style={{ background: 'linear-gradient(135deg,#39FF6B,#00BFFF)', color: '#020c1b' }}>
                Kërko
              </button>
            </div>
          </motion.div>
        )}

        {!order && !loading && (
          <div className="text-center py-16">
            <div className="text-7xl mb-4">🔍</div>
            <p className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Porosia nuk u gjet</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Kontrolloni kodin dhe provoni sërisht</p>
          </div>
        )}

        {order && (
          <>
            {/* ─── HERO: Logo circle + Countdown + Receipt ─── */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl overflow-hidden shadow-xl"
              style={{ background: 'linear-gradient(135deg,#020c1b,#0a2a4a)', border: '1.5px solid rgba(0,191,255,0.3)' }}>
              <div className="flex flex-col items-center pt-7 pb-5 px-5">

                {/* Animated TiliGo logo circle */}
                <div className="relative mb-4">
                  {[1,2,3].map((r, i) => (
                    <motion.div key={i}
                      className="absolute rounded-full border"
                      style={{ inset: -(r*10), borderColor: i===0 ? '#39FF6B' : '#00BFFF', opacity: 0.25 - i*0.06 }}
                      animate={{ scale: [1, 1.1, 1], opacity: [0.25-i*0.06, 0.08, 0.25-i*0.06] }}
                      transition={{ repeat: Infinity, duration: 2 + i*0.5, delay: i*0.4 }}
                    />
                  ))}
                  <motion.div
                    className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden relative z-10"
                    style={{ background: 'linear-gradient(135deg,#39FF6B22,#00BFFF22)', border: '2.5px solid #39FF6B', boxShadow: '0 0 28px rgba(57,255,107,0.5)' }}
                    animate={{ rotate: order?.status === "ne_rruge" ? 360 : 0 }}
                    transition={{ repeat: order?.status === "ne_rruge" ? Infinity : 0, duration: 8, ease: "linear" }}
                  >
                    <picture>
                      <source srcSet="https://media.base44.com/images/public/69d519273be8cf966434f77a/9ff7c0a46_IMG_0106.jpeg" media="(prefers-color-scheme: dark)" />
                      <img src="https://media.base44.com/images/public/69d519273be8cf966434f77a/9ff7c0a46_IMG_0106.jpeg" alt="TiliGo" className="w-16 h-16 object-cover rounded-full" />
                    </picture>
                  </motion.div>
                </div>

                {/* Status label */}
                <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: '#00BFFF' }}>
                  {order.status === "dorezuar" ? "✅ Dorëzuar me sukses!" : "⚡ Duke gjurmuar live..."}
                </p>

                {/* Countdown */}
                {etaSeconds !== null && order.status !== "dorezuar" && order.status !== "anuluar" && (
                  <div className="text-center mb-3">
                    <motion.p
                      key={Math.floor(etaSeconds / 60)}
                      initial={{ scale: 1.2, opacity: 0.7 }} animate={{ scale: 1, opacity: 1 }}
                      className="font-black leading-none"
                      style={{ fontSize: 56, color: '#39FF6B', textShadow: '0 0 30px rgba(57,255,107,0.6)', fontVariantNumeric: 'tabular-nums' }}
                    >
                      {etaSeconds <= 0 ? "00:00" : `${String(Math.floor(etaSeconds / 60)).padStart(2,"0")}:${String(etaSeconds % 60).padStart(2,"0")}`}
                    </motion.p>
                    <p className="text-xs font-bold mt-1" style={{ color: 'rgba(125,211,252,0.7)' }}>minuta të mbetur</p>
                  </div>
                )}

                {order.status === "dorezuar" && (
                  <p className="text-4xl mb-2">🎉</p>
                )}

                {/* Receipt download button */}
                <button
                  onClick={() => generateOrderPDF(order)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all hover:scale-105 active:scale-95 mt-1"
                  style={{ background: 'linear-gradient(135deg,#39FF6B,#00BFFF)', color: '#020c1b', boxShadow: '0 0 20px rgba(57,255,107,0.3)' }}
                >
                  <Download size={15} /> Shkarko Faturën PDF
                </button>
              </div>
            </motion.div>

            {/* Order header */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl overflow-hidden" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
              <div className="px-5 py-4" style={{ background: 'linear-gradient(135deg,#020c1b,#0a2a4a)', borderBottom: '1px solid rgba(0,191,255,0.2)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs mb-0.5" style={{ color: 'var(--text-secondary)' }}>Kodi i Porosisë</p>
                    <p className="text-3xl font-black tracking-wide" style={{ color: '#FBBF24' }}>{order.order_code}</p>
                  </div>
                  <button onClick={copyCode}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-colors"
                    style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)', border: '1px solid var(--nav-border)' }}>
                    <Copy size={13} /> {copied ? "✓ Kopjuar" : "Kopjo"}
                  </button>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: order.status === 'dorezuar' ? '#39FF6B' : order.status === 'anuluar' ? '#EF4444' : '#FBBF24' }} />
                  <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{STATUS_LABELS[order.status]}</span>
                  {etaSeconds !== null && order.status !== "dorezuar" && order.status !== "anuluar" && (
                    <span className="ml-auto flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                      style={{ background: 'rgba(57,255,107,0.15)', color: '#39FF6B', border: '1px solid rgba(57,255,107,0.3)' }}>
                      <Clock size={11} /> {formatETA(etaSeconds)}
                    </span>
                  )}
                </div>
              </div>

              {/* Business + Address */}
              <div className="px-5 py-4 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🏪</span>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{order.business_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="flex-shrink-0" style={{ color: '#00BFFF' }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{order.customer_address}</span>
                </div>
                {order.delivery_name && (
                  <div className="flex items-center gap-2">
                    <Bike size={14} className="flex-shrink-0" style={{ color: '#39FF6B' }} />
                    <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>{order.delivery_name} — Dorëzuesi juaj</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* ===== REAL KOSOVO MAP ===== */}
            {userCoords && (
              <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
                className="rounded-2xl overflow-hidden" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
                <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                  <h3 className="font-bold flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
                    <Navigation size={16} style={{ color: '#00BFFF' }} />
                    {order.status === "ne_rruge" ? "Dorëzuesi Juaj · Live" : "Lokacioni Juaj"}
                  </h3>
                  {order.status === "ne_rruge" && deliveryCoords && (
                    <span className="text-xs font-bold flex items-center gap-1 px-2.5 py-1 rounded-full"
                      style={{ background: 'rgba(57,255,107,0.15)', color: '#39FF6B', border: '1px solid rgba(57,255,107,0.3)' }}>
                      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#39FF6B' }} /> Lëviz Drejt Jush
                    </span>
                  )}
                </div>
                <div style={{ height: 340 }}>
                  <MapContainer
                    center={mapCenter}
                    zoom={15}
                    style={{ height: "100%", width: "100%" }}
                    zoomControl={true}
                    scrollWheelZoom={true}
                  >
                    <TileLayer
                      url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                      attribution=""
                    />
                    <MapUpdater center={mapCenter} />

                    {/* User location */}
                    {effectiveUserCoords && (
                      <Marker position={effectiveUserCoords} icon={makeIcon("🏠", 32)}>
                        <Popup>
                          <strong>Lokacioni Juaj</strong><br />
                          {order?.customer_lat ? "📍 GPS i saktë" : "Adresa e dorëzimit"}
                        </Popup>
                      </Marker>
                    )}

                    {/* Delivery scooter */}
                    {order.status === "ne_rruge" && deliveryCoords && (
                      <Marker position={deliveryCoords} icon={makeIcon("🛵", 36)}>
                        <Popup>
                          <strong>{order.delivery_name || "Dorëzuesi"}</strong><br />
                          Po vjen drejt jush!
                        </Popup>
                      </Marker>
                    )}

                    {/* Route line */}
                    {routePoints.length === 2 && (
                      <Polyline
                        positions={routePoints}
                        color="#7c3aed"
                        weight={4}
                        opacity={0.7}
                        dashArray="8 6"
                      />
                    )}
                  </MapContainer>
                </div>

                {/* ETA bar */}
                {order.status === "ne_rruge" && etaSeconds !== null && (
                  <div className="px-4 py-3 flex items-center justify-between" style={{ background: 'rgba(139,92,246,0.1)', borderTop: '1px solid rgba(139,92,246,0.2)' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg,#39FF6B,#00BFFF)' }}>
                        <Bike size={16} style={{ color: '#020c1b' }} />
                      </div>
                      <div>
                        <p className="font-bold text-sm" style={{ color: 'var(--text-heading)' }}>Kohë e mbetur</p>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          {distanceKm ? `${distanceKm.toFixed(1)} km larg · ` : ""}{order.delivery_name} po ju sjell porosinë
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-xl" style={{ color: '#39FF6B' }}>{formatETA(etaSeconds)}</p>
                      {order.delivery_lat && <p className="text-xs font-bold" style={{ color: '#00BFFF' }}>📍 GPS Live</p>}
                    </div>
                  </div>
                )}
                {order.status !== "ne_rruge" && estimateETA(order.status) !== null && estimateETA(order.status) > 0 && (
                  <div className="px-4 py-3 flex items-center justify-between" style={{ background: 'rgba(0,191,255,0.08)', borderTop: '1px solid rgba(0,191,255,0.15)' }}>
                    <div className="flex items-center gap-2">
                      <Clock size={16} style={{ color: '#00BFFF' }} />
                      <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Kohë e vlerësuar</span>
                    </div>
                    <span className="font-black" style={{ color: '#00BFFF' }}>{formatETA(etaSeconds)}</span>
                  </div>
                )}
              </motion.div>
            )}

            {/* Progress steps */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="rounded-2xl p-5" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
              <h3 className="font-bold mb-5" style={{ color: 'var(--text-heading)' }}>Progresi i Porosisë</h3>
              <div className="space-y-1">
                {STATUS_STEPS.map((step, i) => {
                  const isActive = i === currentStep;
                  const isDone = i < currentStep;
                  return (
                    <div key={step.key} className="flex items-center gap-3">
                      <div className="flex flex-col items-center">
                        <motion.div
                          animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                          transition={{ repeat: isActive ? Infinity : 0, duration: 1.5 }}
                          className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-500"
                          style={isDone
                            ? { background: 'linear-gradient(135deg,#39FF6B,#00cc5a)', color: '#020c1b', boxShadow: '0 0 12px rgba(57,255,107,0.4)' }
                            : isActive
                            ? { background: 'linear-gradient(135deg,#00BFFF,#0066FF)', color: '#fff', boxShadow: '0 0 16px rgba(0,191,255,0.5)' }
                            : { background: 'rgba(0,40,80,0.5)', color: 'rgba(125,211,252,0.3)' }}
                        >
                          {isDone ? <CheckCircle size={18} /> : step.icon}
                        </motion.div>
                        {i < STATUS_STEPS.length - 1 && (
                          <div className="w-0.5 h-5 my-0.5 transition-colors duration-500"
                            style={{ background: i < currentStep ? '#39FF6B' : 'rgba(0,60,120,0.5)' }} />
                        )}
                      </div>
                      <div className="flex-1 py-2">
                        <p className="text-sm font-bold transition-colors"
                          style={{ color: isActive ? 'var(--text-heading)' : isDone ? 'var(--text-secondary)' : 'rgba(125,211,252,0.25)' }}>
                          {step.label}
                        </p>
                      </div>
                      {isActive && (
                        <motion.span
                          animate={{ opacity: [1, 0.5, 1] }}
                          transition={{ repeat: Infinity, duration: 1.2 }}
                          className="text-xs px-2.5 py-1 rounded-full font-bold"
                          style={{ background: 'rgba(0,191,255,0.15)', color: '#00BFFF', border: '1px solid rgba(0,191,255,0.3)' }}
                        >
                          Tani
                        </motion.span>
                      )}
                      {isDone && (
                        <span className="text-xs font-bold" style={{ color: '#39FF6B' }}>✓</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Order summary */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="rounded-2xl p-5" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
              <h3 className="font-bold mb-4" style={{ color: 'var(--text-heading)' }}>Detajet e Porosisë</h3>
              <div className="space-y-2 text-sm mb-3">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex justify-between py-1" style={{ borderBottom: '1px solid var(--divider)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{item.qty}× {item.name}</span>
                    <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{(item.price * item.qty).toFixed(2)}€</span>
                  </div>
                ))}
              </div>
              <div className="space-y-1 text-sm pt-2" style={{ borderTop: '1px solid var(--divider)' }}>
                <div className="flex justify-between" style={{ color: 'var(--text-muted)' }}>
                  <span>Nëntotali</span>
                  <span>{(order.total - (order.delivery_fee || 1.5)).toFixed(2)}€</span>
                </div>
                <div className="flex justify-between" style={{ color: 'var(--text-muted)' }}>
                  <span>Dërgesa</span>
                  <span>{(order.delivery_fee || 1.5).toFixed(2)}€</span>
                </div>
                <div className="flex justify-between font-black text-base pt-2" style={{ borderTop: '1px solid var(--divider)', color: 'var(--text-heading)' }}>
                  <span>Totali</span>
                  <span style={{ color: '#39FF6B' }}>{order.total?.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between pt-1" style={{ color: 'var(--text-muted)' }}>
                  <span>Pagesa</span>
                  <span className="font-medium">Cash 💵</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}