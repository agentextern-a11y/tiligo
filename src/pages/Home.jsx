import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Star, Clock, ChevronRight, Bike, Shield, Award, MapPin, Zap, TrendingUp, RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import MobileBottomNav from "@/components/MobileBottomNav";
import { useCart } from "@/lib/useCart";

const CATEGORIES = [
  { label: "Të gjitha", emoji: "🍽️", key: "all" },
  { label: "Ushqim", emoji: "🥘", key: "Ushqim" },
  { label: "Pica", emoji: "🍕", key: "Pica" },
  { label: "Sushi", emoji: "🍱", key: "Sushi" },
  { label: "Burgera", emoji: "🍔", key: "Burgera" },
  { label: "Kafe & Ëmbëlsira", emoji: "☕", key: "Kafe & Ëmbëlsira" },
  { label: "Farmaci", emoji: "💊", key: "Farmaci" },
  { label: "Supermarket", emoji: "🛒", key: "Supermarket" },
];

// Marketing mottos — high-level, rotate automatically
const MOTTOS = [
  { text: "Shija e Vërtetë, Drejt tek Dera Juaj.", sub: "Nga zemra e kuzhinës, tek tryeza juaj." },
  { text: "Luksi i Dorëzimit — Pa Lëvizur nga Shtëpia.", sub: "Sepse koha juaj vlen më shumë." },
  { text: "Çdo Kafshatë, një Aventurë e Re.", sub: "Zbuloni shijet e Kosovës me një klik." },
  { text: "Ushqim i Freskët. Shpërndarje Fenomenale.", sub: "Besojmë në cilësi pa kompromis." },
  { text: "Nga Restorantet Elitare — Tek Ju.", sub: "Eksperienca gourmet, direkt në shtëpi." },
];

// Scooters with varied params
const SCOOTERS = [
  { delay: 0,   duration: 7,   y: 0,   scale: 1.2,  opacity: 0.95 },
  { delay: 2.5, duration: 9.5, y: -12, scale: 0.85, opacity: 0.7  },
  { delay: 5,   duration: 6.5, y: 6,   scale: 1.05, opacity: 0.9  },
  { delay: 1.2, duration: 11,  y: -20, scale: 0.65, opacity: 0.5  },
  { delay: 3.8, duration: 8,   y: 10,  scale: 1.15, opacity: 0.85 },
];

// Rolling food & fruit items across the hero
const FOOD_ITEMS = [
  { emoji: "🍕", delay: 0,   duration: 12, y: 60,  size: "text-4xl", lane: 1 },
  { emoji: "🍔", delay: 2,   duration: 10, y: 80,  size: "text-3xl", lane: 2 },
  { emoji: "🍣", delay: 4,   duration: 14, y: 45,  size: "text-3xl", lane: 1 },
  { emoji: "🍎", delay: 1,   duration: 11, y: 95,  size: "text-2xl", lane: 3 },
  { emoji: "🍊", delay: 3.5, duration: 13, y: 55,  size: "text-2xl", lane: 2 },
  { emoji: "🍓", delay: 6,   duration: 9,  y: 75,  size: "text-2xl", lane: 3 },
  { emoji: "🍇", delay: 1.5, duration: 15, y: 40,  size: "text-3xl", lane: 1 },
  { emoji: "🥑", delay: 5,   duration: 11, y: 88,  size: "text-2xl", lane: 2 },
  { emoji: "🥐", delay: 2.8, duration: 12, y: 65,  size: "text-3xl", lane: 3 },
  { emoji: "☕", delay: 7,   duration: 10, y: 50,  size: "text-2xl", lane: 1 },
  { emoji: "🍩", delay: 4.5, duration: 13, y: 82,  size: "text-2xl", lane: 2 },
  { emoji: "🥗", delay: 0.8, duration: 14, y: 70,  size: "text-3xl", lane: 3 },
];

// Neon glow colors cycling
const NEON_COLORS = [
  "text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.9)]",
  "text-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.9)]",
  "text-pink-400 drop-shadow-[0_0_20px_rgba(244,114,182,0.9)]",
  "text-green-400 drop-shadow-[0_0_20px_rgba(74,222,128,0.9)]",
  "text-purple-400 drop-shadow-[0_0_20px_rgba(192,132,252,0.9)]",
];

// Pull-to-Refresh hook
function usePullToRefresh(onRefresh) {
  const startY = useRef(0);
  const [pulling, setPulling] = useState(false);
  const [pullDist, setPullDist] = useState(0);
  const threshold = 72;

  const onTouchStart = (e) => { startY.current = e.touches[0].clientY; };
  const onTouchMove = (e) => {
    const dy = e.touches[0].clientY - startY.current;
    if (dy > 0 && window.scrollY === 0) {
      setPulling(true);
      setPullDist(Math.min(dy * 0.45, threshold + 20));
    }
  };
  const onTouchEnd = () => {
    if (pullDist >= threshold) onRefresh();
    setPulling(false);
    setPullDist(0);
  };
  return { pulling, pullDist, threshold, onTouchStart, onTouchMove, onTouchEnd };
}

export default function Home() {
  const [businesses, setBusinesses] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userCity, setUserCity] = useState(null);
  const [mottoIdx, setMottoIdx] = useState(0);
  const [neonIdx, setNeonIdx] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const { cart, addToCart, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    loadBusinesses();
    requestLocation();

    // Auto-rotate mottos
    const mottoTimer = setInterval(() => {
      setMottoIdx(p => (p + 1) % MOTTOS.length);
    }, 4500);

    // Auto-rotate neon colors
    const neonTimer = setInterval(() => {
      setNeonIdx(p => (p + 1) % NEON_COLORS.length);
    }, 1800);

    return () => {
      clearInterval(mottoTimer);
      clearInterval(neonTimer);
    };
  }, []);

  const requestLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await res.json();
          const city = data.address?.city || data.address?.town || data.address?.village;
          if (city) setUserCity(city);
        } catch {}
      },
      () => {}
    );
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBusinesses();
    setRefreshing(false);
  };

  const ptr = usePullToRefresh(handleRefresh);

  const loadBusinesses = async () => {
    setLoading(true);
    const data = await base44.entities.Business.filter({ status: "approved" });
    setBusinesses(data);
    setLoading(false);
  };

  const filtered = businesses.filter(b => {
    const matchSearch = b.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.description?.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "all" || b.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div
      className="min-h-screen bg-[#f0f4f8] dark:bg-gray-950"
      onTouchStart={ptr.onTouchStart}
      onTouchMove={ptr.onTouchMove}
      onTouchEnd={ptr.onTouchEnd}
    >
      {/* Pull to refresh indicator */}
      <AnimatePresence>
        {ptr.pulling && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: ptr.pullDist }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-center bg-blue-50 dark:bg-blue-950 overflow-hidden"
          >
            <RefreshCw size={20} className={`text-blue-600 ${ptr.pullDist >= ptr.threshold ? "animate-spin" : ""}`} />
            <span className="ml-2 text-blue-600 text-sm font-bold">
              {ptr.pullDist >= ptr.threshold ? "Lëshoni për të rifreskuar" : "Tërhiqni për të rifreskuar"}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      <Navbar cart={cart} onCartClick={() => setCartOpen(true)} />
      <CartDrawer
        open={cartOpen} onClose={() => setCartOpen(false)}
        cart={cart} onAdd={addToCart} onRemove={removeFromCart} onClear={clearCart}
      />

      {/* HERO */}
      <section className="hero-gradient relative overflow-hidden" style={{ minHeight: 520 }}>

        {/* ===== ROLLING FOOD & FRUITS (full-hero parallax layers) ===== */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {FOOD_ITEMS.map((item, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{ top: `${item.y}px` }}
              initial={{ x: "-140px", rotate: -30 }}
              animate={{ x: "calc(100vw + 140px)", rotate: 360 }}
              transition={{
                duration: item.duration,
                delay: item.delay,
                repeat: Infinity,
                repeatDelay: item.duration * 0.4 + item.delay * 0.2,
                ease: "linear",
                rotate: { duration: item.duration, ease: "linear", repeat: Infinity },
              }}
            >
              <span className={`${item.size} inline-block opacity-30`}>{item.emoji}</span>
            </motion.div>
          ))}
        </div>

        {/* ===== SCOOTER LANE (bottom) ===== */}
        <div className="absolute bottom-0 left-0 right-0 h-24 overflow-hidden pointer-events-none">
          <div className="absolute bottom-4 left-0 right-0 h-0.5 bg-white/10" />
          {SCOOTERS.map((s, i) => (
            <motion.div key={i} className="absolute"
              style={{ bottom: `${16 + s.y}px`, scale: s.scale, opacity: s.opacity }}
              initial={{ x: "-120px" }}
              animate={{ x: "calc(100vw + 120px)" }}
              transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, repeatDelay: s.duration * 0.3, ease: "linear" }}
            >
              <motion.span className="text-3xl inline-block"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 0.55, repeat: Infinity, ease: "easeInOut" }}>
                🛵
              </motion.span>
            </motion.div>
          ))}
        </div>

        {/* Floating restaurant chips */}
        <div className="absolute top-8 left-4 hidden md:block z-10">
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3 }}
            className="bg-white/95 backdrop-blur rounded-2xl px-4 py-2.5 flex items-center gap-2 shadow-xl border border-white/50">
            <span className="text-xl">🍔</span>
            <div><p className="text-xs font-black text-gray-900">Burger House</p><p className="text-xs text-gray-500 flex items-center gap-0.5"><Clock size={10} /> 25 min</p></div>
          </motion.div>
        </div>
        <div className="absolute top-8 right-4 hidden md:block z-10">
          <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 3.5, delay: 0.5 }}
            className="bg-white/95 backdrop-blur rounded-2xl px-4 py-2.5 flex items-center gap-2 shadow-xl border border-white/50">
            <span className="text-xl">🍕</span>
            <div><p className="text-xs font-black text-gray-900">Pica Italia</p><p className="text-xs text-gray-500 flex items-center gap-0.5"><Clock size={10} /> 30 min</p></div>
          </motion.div>
        </div>
        <div className="absolute top-32 right-16 hidden lg:block z-10">
          <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 2.8, delay: 1 }}
            className="bg-white/95 backdrop-blur rounded-2xl px-4 py-2.5 flex items-center gap-2 shadow-xl border border-white/50">
            <span className="text-xl">🍱</span>
            <div><p className="text-xs font-black text-gray-900">Sushi Zen</p><p className="text-xs text-gray-500 flex items-center gap-0.5"><Clock size={10} /> 40 min</p></div>
          </motion.div>
        </div>

        {/* ===== HERO CONTENT ===== */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 pt-14 pb-28 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>

            {/* Live badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/15 text-white text-sm px-5 py-2 rounded-full mb-7 backdrop-blur border border-white/20 shadow-lg"
            >
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Aktiv tani · {userCity || "Prishtinë & Kosovë"}
              {userCity && <MapPin size={12} className="text-green-300" />}
            </motion.div>

            {/* ===== AUTO-CHANGING NEON MOTTO ===== */}
            <div className="mb-8 min-h-[140px] flex flex-col items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div key={mottoIdx}
                  initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -30, filter: "blur(8px)" }}
                  transition={{ duration: 0.7, ease: "easeInOut" }}
                  className="text-center"
                >
                  <h1 className={`text-3xl md:text-5xl font-black leading-tight mb-3 transition-all duration-700 ${NEON_COLORS[neonIdx]}`}>
                    {MOTTOS[mottoIdx].text}
                  </h1>
                  <p className="text-white/70 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
                    {MOTTOS[mottoIdx].sub}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Motto dots */}
              <div className="flex gap-1.5 mt-5">
                {MOTTOS.map((_, i) => (
                  <button key={i} onClick={() => setMottoIdx(i)}
                    className={`rounded-full transition-all duration-300 ${i === mottoIdx ? "w-6 h-2 bg-amber-400" : "w-2 h-2 bg-white/30"}`} />
                ))}
              </div>
            </div>

            {/* Search */}
            <div className="flex gap-3 max-w-lg mx-auto mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && navigate(`/?search=${search}`)}
                  placeholder="Kërko ushqim, restorante..."
                  className="w-full pl-11 pr-4 py-4 rounded-2xl text-gray-900 bg-white shadow-xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                />
              </div>
              <button
                onClick={() => {}}
                className="bg-amber-500 hover:bg-amber-400 text-white font-black px-7 py-4 rounded-2xl transition-all shadow-xl hover:shadow-amber-400/40 hover:scale-105 active:scale-95 whitespace-nowrap"
              >
                Kërko
              </button>
            </div>

            {/* App download */}
            <div className="flex items-center justify-center gap-3">
              <Link to="/shkarko-app"
                className="flex items-center gap-2 bg-black/70 backdrop-blur text-white px-4 py-3 rounded-xl text-sm font-medium hover:bg-black transition-colors border border-white/10 shadow-lg">
                <span className="text-xl">🍎</span>
                <div className="text-left"><p className="text-xs opacity-60">Shkarko për</p><p className="font-bold">iPhone / iPad</p></div>
              </Link>
              <Link to="/shkarko-app"
                className="flex items-center gap-2 bg-black/70 backdrop-blur text-white px-4 py-3 rounded-xl text-sm font-medium hover:bg-black transition-colors border border-white/10 shadow-lg">
                <span className="text-xl">🤖</span>
                <div className="text-left"><p className="text-xs opacity-60">Shkarko për</p><p className="font-bold">Android</p></div>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 grid grid-cols-3 gap-4">
          {[
            { icon: <Zap size={20} className="text-amber-500" />, title: "Dërgim Express", sub: "20–35 min mesatarisht" },
            { icon: <Shield size={20} className="text-green-600" />, title: "100% i Sigurt", sub: "Biznese të certifikuara" },
            { icon: <TrendingUp size={20} className="text-blue-700" />, title: "10,000+ Porosi", sub: "Klientë të kënaqur" },
          ].map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.1 }}
              className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">{f.icon}</div>
              <div>
                <p className="font-bold text-gray-900 text-sm">{f.title}</p>
                <p className="text-xs text-gray-500">{f.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar mb-8">
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              onClick={() => setCategory(cat.key)}
              className={`category-pill flex-shrink-0 ${category === cat.key ? "active" : "inactive"}`}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>

        {/* Store grid */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-black text-gray-900">
            Të gjitha Dyqanet
            <span className="ml-2 text-gray-400 font-normal text-base">({filtered.length})</span>
          </h2>
          {businesses.length > 0 && (
            <span className="text-xs text-green-600 font-bold flex items-center gap-1 bg-green-50 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> {businesses.filter(b => b.is_open).length} hapur tani
            </span>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="h-44 bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-2/3" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-500 text-lg font-medium">Nuk u gjetën dyqane</p>
            <p className="text-gray-400 mt-1">Provoni një kërkim tjetër</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((biz, i) => (
              <motion.div
                key={biz.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4 }}
              >
                <Link to={`/dyqani/${biz.id}`} className="block">
                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={biz.image_url || `https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80`}
                        alt={biz.name}
                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      <div className="absolute top-3 right-3">
                        <span className="bg-amber-500 text-white text-xs font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                          <Star size={10} fill="white" /> {biz.rating?.toFixed(1) || "4.5"}
                        </span>
                      </div>
                      {biz.is_open ? (
                        <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> Hapur
                        </div>
                      ) : (
                        <div className="absolute top-3 left-3 bg-gray-700/80 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                          Mbyllur
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-black text-gray-900 text-base mb-1">{biz.name}</h3>
                      <p className="text-gray-500 text-sm line-clamp-2 mb-3">{biz.description}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                        <span className="flex items-center gap-1 font-medium text-gray-600">
                          <Clock size={11} />{biz.delivery_time || "20-35 min"}
                        </span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full" />
                        <span>Dërgesa <strong className="text-gray-700">{biz.delivery_fee?.toFixed(2) || "1.50"}€</strong></span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full" />
                        <span>Min. <strong className="text-gray-700">{biz.min_order?.toFixed(0) || "3"}€</strong></span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Register CTA */}
        <div className="mt-16 grid md:grid-cols-2 gap-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="hero-gradient rounded-3xl p-8 text-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="text-5xl mb-4">🏪</div>
            <h3 className="text-2xl font-black mb-2">Rrit Biznesin Tënd</h3>
            <p className="text-white/75 text-sm mb-5 leading-relaxed">Bashkohu me ekipin TiliGo dhe çdo ditë rriti shitjet tuaja. Mijëra klientë të rinj në majë të gishtave.</p>
            <Link to="/biznesi/register"
              className="inline-flex items-center gap-2 bg-white text-blue-800 font-black px-6 py-3 rounded-xl hover:bg-amber-50 transition-colors text-sm shadow-lg">
              Fillo Sot <ChevronRight size={16} />
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-500 to-emerald-700 rounded-3xl p-8 text-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="text-5xl mb-4">🛵</div>
            <h3 className="text-2xl font-black mb-2">Bëhu Dorëzues Elitar</h3>
            <p className="text-white/75 text-sm mb-5 leading-relaxed">Fiton para reale duke bërë diçka të thjeshtë. Oraret tuaja, rrugët tuaja — liri totale.</p>
            <Link to="/dorezuesi/register"
              className="inline-flex items-center gap-2 bg-white text-green-800 font-black px-6 py-3 rounded-xl hover:bg-green-50 transition-colors text-sm shadow-lg">
              Apliko Tani <ChevronRight size={16} />
            </Link>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-950 text-white mt-12 py-12 px-4 pb-24 md:pb-12">
        <div className="max-w-7xl mx-auto text-center">
          <img
            src="https://media.base44.com/images/public/69d519273be8cf966434f77a/9ac65c451_IMG_0066.png"
            alt="TiliGo" className="h-14 mx-auto mb-5 object-contain opacity-90"
          />
          <p className="text-gray-400 text-sm">© 2025 TiliGo · Prishtinë, Kosovë · Dorëzimi më i shpejtë</p>
          <p className="text-gray-600 text-xs mt-2">Bukuria e ushqimit, shpejtësia e teknologjisë.</p>
        </div>
      </footer>
      <MobileBottomNav cart={cart} />
    </div>
  );
}