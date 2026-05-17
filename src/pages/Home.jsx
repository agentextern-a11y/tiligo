import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Star, Clock, ChevronRight, MapPin, RefreshCw, Heart, Store } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import { useCart } from "@/lib/useCart";

/* ── Brand tokens ─────────────────────────────────────── */
const BLUE = "#00BFFF";
const GREEN = "#39FF6B";
const DARK_BLUE = "#0066FF";

const PROMO_BANNERS = [
{ emoji: "🎁", text: "Krijo llogarinë & merr", highlight: "2€ falas menjëherë!", sub: "Bonusi aplikohet automatikisht — vetëm për klientët e rinj", to: "/user/register", cta: "2€ →" },
{ emoji: "⚡", text: "Pse të presësh? Hyr tani dhe", highlight: "porosia vjen tek ti!", sub: "Login i shpejtë · 10 sekonda · porosi e gatshme", to: "/user/login", cta: "Hyr →" },
{ emoji: "🛵", text: "Jemi rrugës — më shpejt", highlight: "se drita! ☄️", sub: "Dorëzimi ynë nuk njeh vonesa — ndjehu i dashur", to: "/user/register", cta: "Porosit →" },
{ emoji: "💚", text: "Çdo porosi bëhet me", highlight: "dashuri për ty!", sub: "Kuzhinierët tanë punojnë me zemër — të ngrohët e garantuar", to: "/", cta: "Shiko →" },
{ emoji: "🏆", text: "Mbi 1000+ klientë të lumtur —", highlight: "bashkohu sot!", sub: "Komunitetit tonë po rritet çdo ditë — bëhu pjesë", to: "/user/register", cta: "Bashkohu →" },
{ emoji: "🌟", text: "Hyr & porosit — ne jemi", highlight: "gjithmonë këtu për ty!", sub: "24/7 · çdo ditë · çdo orë — TiliGo nuk fle kurrë", to: "/user/login", cta: "Hyr →" },
{ emoji: "🔥", text: "Ushqimi yt i preferuar", highlight: "gati në 20 minuta!", sub: "Real-time tracking · ndiq dorëzuesin live", to: "/", cta: "Shiko →" },
{ emoji: "🎉", text: "Surprizë! Regjistrohu dhe", highlight: "merr kuponin e mirëseardhjes!", sub: "Zbritje direkte — pa kushte — falas!", to: "/user/register", cta: "Merr →" },
{ emoji: "💫", text: "Ti meriton të mirën — ne", highlight: "e sjellim deri te dera!", sub: "Çdo dërgim është me kujdes e me buzëqeshje 😊", to: "/user/login", cta: "Porosit →" },
{ emoji: "🚀", text: "Pse të gatuash sot?", highlight: "Ne jemi vetëm 1 klik larg!", sub: "Hyr · zgjedh · porosit — dhe lëre pjesën tjetër tek ne", to: "/user/login", cta: "Hyr →" }];


function PromoBanner() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => {setIdx((i) => (i + 1) % PROMO_BANNERS.length);setVisible(true);}, 400);
    }, 5000);
    return () => clearInterval(t);
  }, []);
  const b = PROMO_BANNERS[idx];
  return (
    <motion.div
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : -6 }}
      transition={{ duration: 0.35 }}
      onClick={() => navigate(b.to)}
      className="cursor-pointer mx-4 mt-3 rounded-2xl px-4 py-3 flex items-center gap-3"
      style={{ background: 'linear-gradient(135deg,rgba(57,255,107,0.12),rgba(0,191,255,0.1))', border: '1.5px solid rgba(57,255,107,0.4)', boxShadow: '0 0 20px rgba(57,255,107,0.15)' }}>
      <span className="text-2xl flex-shrink-0">{b.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
          {b.text} <span style={{ color: '#39FF6B' }}>{b.highlight}</span>
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{b.sub}</p>
      </div>
      <span className="text-xs font-black px-3 py-1.5 rounded-xl flex-shrink-0"
      style={{ background: 'linear-gradient(135deg,#39FF6B,#00BFFF)', color: '#020c1b' }}>{b.cta}</span>
    </motion.div>);

}

/* ── Hero photos ──────────────────────────────────────── */
const HERO_IMAGES = [
"https://media.base44.com/images/public/69d519273be8cf966434f77a/529b3e7b0_IMG_0101.jpg",
"https://media.base44.com/images/public/69d519273be8cf966434f77a/dfd6fccac_IMG_0099.jpg",
"https://media.base44.com/images/public/69d519273be8cf966434f77a/69cd0276c_IMG_0098.jpg",
"https://media.base44.com/images/public/69d519273be8cf966434f77a/932b72c40_IMG_0100.jpg",
"https://media.base44.com/images/public/69d519273be8cf966434f77a/429928441_IMG_0103.jpg",
"https://media.base44.com/images/public/69d519273be8cf966434f77a/544d787d9_IMG_0102.jpg",
"https://media.base44.com/images/public/69d519273be8cf966434f77a/30aad122e_IMG_0114.jpeg",
"https://media.base44.com/images/public/69d519273be8cf966434f77a/7be6d048a_IMG_0111.jpeg"];


const CATEGORIES = [
{ label: "Pica", emoji: "🍕", key: "Pica" },
{ label: "Burgera", emoji: "🍔", key: "Burgera" },
{ label: "Sushi", emoji: "🍱", key: "Sushi" },
{ label: "Supermarket", emoji: "🛒", key: "Supermarket" },
{ label: "Farmaci", emoji: "💊", key: "Farmaci" },
{ label: "Kafe", emoji: "☕", key: "Kafe & Ëmbëlsira" },
{ label: "Ushqim", emoji: "🥘", key: "Ushqim" },
{ label: "Të gjitha", emoji: "🍽️", key: "all" }];


/* ── Pull-to-refresh ────────────────────────────────────── */
function usePullToRefresh(onRefresh) {
  const startY = useRef(0);
  const [pulling, setPulling] = useState(false);
  const [pullDist, setPullDist] = useState(0);
  const threshold = 72;
  const onTouchStart = (e) => {startY.current = e.touches[0].clientY;};
  const onTouchMove = (e) => {
    const dy = e.touches[0].clientY - startY.current;
    if (dy > 0 && window.scrollY === 0) {setPulling(true);setPullDist(Math.min(dy * 0.45, threshold + 20));}
  };
  const onTouchEnd = () => {if (pullDist >= threshold) onRefresh();setPulling(false);setPullDist(0);};
  return { pulling, pullDist, threshold, onTouchStart, onTouchMove, onTouchEnd };
}

/* ════════════════════════════════════════════════════════
   Main Component
════════════════════════════════════════════════════════ */
export default function Home() {
  const [businesses, setBusinesses] = useState([]);
  const [search, setSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [category, setCategory] = useState("all");
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const { cart, addToCart, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    loadBusinesses();
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') Notification.requestPermission();
    const t = setInterval(() => setImgIdx((p) => (p + 1) % HERO_IMAGES.length), 5000);
    return () => clearInterval(t);
  }, []);

  const loadBusinesses = async () => {
    setLoading(true);
    const data = await base44.entities.Business.filter({ status: "approved" });
    setBusinesses(data);
    setLoading(false);
  };

  const ptr = usePullToRefresh(loadBusinesses);

  const filtered = businesses.filter((b) => {
    const ms = b.name?.toLowerCase().includes(search.toLowerCase()) || b.description?.toLowerCase().includes(search.toLowerCase());
    const mc = category === "all" || b.category === category;
    return ms && mc;
  });

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}
    onTouchStart={ptr.onTouchStart} onTouchMove={ptr.onTouchMove} onTouchEnd={ptr.onTouchEnd}>

      {/* Pull-to-refresh indicator */}
      <AnimatePresence>
        {ptr.pulling &&
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: ptr.pullDist }} exit={{ opacity: 0, height: 0 }}
        className="flex items-center justify-center overflow-hidden" style={{ background: 'var(--stat-bg)' }}>
            <RefreshCw size={18} className={ptr.pullDist >= ptr.threshold ? "animate-spin" : ""} style={{ color: GREEN }} />
          </motion.div>
        }
      </AnimatePresence>

      <Navbar cart={cart} onCartClick={() => setCartOpen(true)} />
      <PromoBanner />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)}
      cart={cart} onAdd={addToCart} onRemove={removeFromCart} onClear={clearCart} />

      {/* ═══════════════════════════════════════════
             HERO
          ═══════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ minHeight: 520 }}>
        {/* Crossfade photos */}
        <div className="absolute inset-0">
          {HERO_IMAGES.map((src, i) =>
          <motion.div key={src} className="absolute inset-0"
          animate={{ opacity: i === imgIdx ? 1 : 0 }}
          transition={{ duration: 2, ease: "easeInOut" }}>
              <img src={src} alt="TiliGo" className="w-full h-full object-cover object-center" />
            </motion.div>
          )}
          {/* Bottom gradient for text legibility */}
          <div className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.15) 45%, rgba(0,0,0,0.72) 100%)' }} />
        </div>

        {/* Image progress dots top-right */}
        <div className="absolute top-4 right-4 z-20 flex gap-1.5">
          {HERO_IMAGES.map((_, i) =>
          <button key={i} onClick={() => setImgIdx(i)} className="rounded-full transition-all duration-500"
          style={{ width: i === imgIdx ? 20 : 6, height: 6, background: i === imgIdx ? GREEN : 'rgba(255,255,255,0.4)' }} />
          )}
        </div>

        {/* Tagline + search */}
        <div className="relative z-10 max-w-2xl mx-auto px-5 pt-24 pb-16 flex flex-col items-center text-center gap-6">

          {/* Sparkle decoration */}
          <div className="absolute top-14 left-1/4 text-lg select-none pointer-events-none animate-pulse" style={{ animationDuration: '2s' }}>✨</div>
          <div className="absolute top-20 right-1/4 text-sm select-none pointer-events-none animate-pulse" style={{ animationDuration: '3s', animationDelay: '1s' }}>✨</div>

          {/* Heart pulse */}
          <motion.div className="text-3xl select-none"
          animate={{ scale: [1, 1.18, 1] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}>
            ❤️
          </motion.div>

          <div>
            <h1 className="text-3xl md:text-5xl font-black text-white leading-tight"
            style={{ textShadow: '0 2px 24px rgba(0,0,0,0.7)', fontFamily: "'Inter', sans-serif", letterSpacing: '-0.02em' }}>
              TiliGo –{" "}
              <span style={{ color: GREEN, textShadow: `0 0 30px ${GREEN}88` }}>Fast,</span>{" "}
              with Love, for You
            </h1>
            <p className="mt-2 text-white/80 text-base font-medium" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.6)' }}>
              Dorëzimi më i shpejtë në Kosovë 🇽🇰
            </p>
          </div>

          {/* Search bar */}
          <div className="w-full max-w-lg relative">
            <div className="relative flex items-center">
              <MapPin className="absolute left-4 z-10 flex-shrink-0" size={18} style={{ color: GREEN }} />
              <input
                value={search}
                onChange={(e) => {setSearch(e.target.value);setShowSuggestions(e.target.value.length > 0);}}
                onFocus={() => search.length > 0 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                onKeyDown={(e) => e.key === "Enter" && (navigate(`/?search=${search}`), setShowSuggestions(false))}
                placeholder="Ku dërgojmë sot? 🛵"
                className="w-full pl-11 pr-32 py-4 rounded-2xl text-sm font-medium outline-none"
                style={{
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(20px)',
                  border: `2px solid ${BLUE}`,
                  color: '#1a1a2e',
                  boxShadow: `0 0 24px ${BLUE}44`
                }} />
              
              <button
                onClick={() => (navigate(`/?search=${search}`), setShowSuggestions(false))}
                className="absolute right-2 px-5 py-2.5 rounded-xl font-black text-sm transition-all hover:scale-105 active:scale-95"
                style={{ background: `linear-gradient(135deg, ${GREEN}, ${BLUE})`, color: '#0a1a0a', boxShadow: `0 4px 16px ${GREEN}55` }}>
                Kërko
              </button>
            </div>
            {/* Suggestions dropdown */}
            {showSuggestions && (() => {
              const suggestions = businesses.filter((b) =>
              b.name?.toLowerCase().includes(search.toLowerCase()) ||
              b.category?.toLowerCase().includes(search.toLowerCase()) ||
              b.description?.toLowerCase().includes(search.toLowerCase())
              ).slice(0, 6);
              return suggestions.length > 0 ?
              <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl overflow-hidden z-50 shadow-2xl"
              style={{ background: 'rgba(255,255,255,0.98)', border: `1.5px solid ${BLUE}44` }}>
                  {suggestions.map((biz) =>
                <button key={biz.id}
                onMouseDown={() => {setSearch(biz.name);setShowSuggestions(false);navigate(`/dyqani/${biz.id}`);}}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left">
                      {biz.image_url ?
                  <img src={biz.image_url} className="w-9 h-9 rounded-xl object-cover flex-shrink-0" /> :
                  <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-lg" style={{ background: BLUE + '18' }}>🍽️</div>
                  }
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-gray-900 truncate">{biz.name}</p>
                        <p className="text-xs text-gray-400 truncate">{biz.category} · {biz.delivery_time || '20-35 min'}</p>
                      </div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: biz.is_open ? GREEN + '20' : '#F3F4F6', color: biz.is_open ? '#16a34a' : '#9CA3AF' }}>
                        {biz.is_open ? 'Open' : 'Closed'}
                      </span>
                    </button>
                )}
                </div> :
              null;
            })()}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
             CATEGORIES
          ═══════════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-xl font-black mb-5 flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
          <span style={{ color: BLUE }}>Popular</span>&nbsp;Categories
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {CATEGORIES.map((cat) =>
          <motion.button
            key={cat.key}
            onClick={() => setCategory(cat.key)}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.93 }}
            className="flex flex-col items-center gap-2 flex-shrink-0 px-4 py-3 rounded-2xl transition-all"
            style={{
              background: category === cat.key ?
              `linear-gradient(135deg, ${GREEN}22, ${BLUE}22)` :
              'var(--stat-bg)',
              border: category === cat.key ?
              `2px solid ${GREEN}` :
              '2px solid transparent',
              boxShadow: category === cat.key ?
              `0 0 16px ${GREEN}44` :
              'none',
              minWidth: 72
            }}>
              <span className="text-2xl">{cat.emoji}</span>
              <span className="text-xs font-bold whitespace-nowrap" style={{ color: category === cat.key ? GREEN : 'var(--text-muted)' }}>
                {cat.label}
              </span>
            </motion.button>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
             FEATURED STORES
          ═══════════════════════════════════════════ */}
      <main className="max-w-7xl mx-auto px-4 pb-8">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-black flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
            <span style={{ color: BLUE }}>Featured</span>&nbsp;Stores
            <span className="font-normal text-sm" style={{ color: 'var(--text-muted)' }}>({filtered.length})</span>
          </h2>
          {businesses.length > 0 &&
          <span className="text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{ background: `${GREEN}18`, color: '#16a34a', border: `1px solid ${GREEN}44` }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: GREEN }} />
              {businesses.filter((b) => b.is_open).length} hapur tani
            </span>
          }
        </div>

        {loading ?
        <div className="biz-grid">
            {[1, 2, 3, 4, 5, 6].map((i) =>
          <div key={i} className={`rounded-2xl overflow-hidden animate-pulse ${i === 0 ? 'biz-featured' : ''}`}
          style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
                <div className="h-44" style={{ background: 'var(--stat-bg)' }} />
                <div className="p-4 space-y-2">
                  <div className="h-5 rounded-lg w-2/3" style={{ background: 'var(--stat-bg)' }} />
                  <div className="h-4 rounded-lg w-1/2" style={{ background: 'var(--stat-bg)' }} />
                </div>
              </div>
          )}
          </div> :
        filtered.length === 0 ?
        <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-lg font-medium" style={{ color: 'var(--text-muted)' }}>Nuk u gjetën dyqane</p>
          </div> :

        <div className="biz-grid">
            {filtered.map((biz, i) =>
          <motion.div key={biz.id}
          className={i === 0 || i % 7 === 3 ? 'biz-featured' : ''}
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-30px' }}
          transition={{ duration: 0.5, delay: i % 4 * 0.07 }}
          whileHover={{ y: -5, scale: 1.015 }}>
                <Link to={`/dyqani/${biz.id}`} className="block h-full group">
                  <div className="rounded-2xl overflow-hidden h-full flex flex-col"
              style={{
                background: 'var(--card-bg)',
                border: '1.5px solid var(--card-border)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                transition: 'border-color 0.3s, box-shadow 0.3s'
              }}
              onMouseEnter={(e) => {e.currentTarget.style.borderColor = `${GREEN}66`;e.currentTarget.style.boxShadow = `0 12px 40px ${GREEN}22`;}}
              onMouseLeave={(e) => {e.currentTarget.style.borderColor = 'var(--card-border)';e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';}}>

                    {/* Image */}
                    <div className="relative overflow-hidden" style={{ height: i === 0 || i % 7 === 3 ? 220 : 175 }}>
                      <img src={biz.image_url || `https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80`}
                  alt={biz.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg,transparent 45%,rgba(0,0,0,0.6) 100%)' }} />

                      {/* Category */}
                      <span className="absolute top-2.5 left-2.5 text-[11px] font-bold px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(0,0,0,0.55)', color: '#e0f2fe', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.15)' }}>
                        {biz.category || "Ushqim"}
                      </span>

                      {/* Rating */}
                      <span className="absolute top-2.5 right-2.5 flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(251,191,36,0.95)', color: '#78350f' }}>
                        <Star size={9} fill="currentColor" /> {biz.rating?.toFixed(1) || "4.8"}
                      </span>

                      {/* Open/Closed */}
                      {biz.is_open ?
                  <span className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full"
                  style={{ background: `${GREEN}dd`, color: '#0a1a0a' }}>
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> Hapur
                        </span> :

                  <span className="absolute bottom-2.5 left-2.5 text-[11px] font-bold px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(0,0,0,0.7)', color: 'rgba(255,255,255,0.5)' }}>Mbyllur</span>
                  }
                    </div>

                    {/* Info */}
                    <div className="p-3.5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-black text-sm leading-tight mb-1" style={{ color: 'var(--text-heading)' }}>{biz.name}</h3>
                        <p className="text-xs line-clamp-1 italic" style={{ color: 'var(--text-muted)' }}>
                          {biz.description || "The best taste in town! 🌟"}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-2.5">
                        <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: `${GREEN}18`, color: '#16a34a', border: `1px solid ${GREEN}44` }}>
                          <Clock size={9} /> {biz.delivery_time || "20-35 min"}
                        </span>
                        <span className="text-[11px] font-bold" style={{ color: BLUE }}>
                          {biz.delivery_fee?.toFixed(2) || "1.50"}€ dërgesa
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
          )}
          </div>
        }

        {/* ═══ CTA Buttons ═══ */}
        <div className="mt-16 grid md:grid-cols-2 gap-5">
          



















          

          



















          
        </div>
      </main>

      {/* ═══ AI AGENTS ═══ */}
      <AgentChatButton agentName="shopping_assistant" label="Shopping Assistant" emoji="🛒" accentColor="#39FF6B" position="right" />
      <AgentChatButton agentName="delivery_tracker" label="Gjurmo Porosinë" emoji="🛵" accentColor="#00BFFF" position="left" />

      {/* ═══ STAFF PORTAL ═══ */}
      <StaffPortalSection />

      {/* ═══ SUPPORT TICKET ═══ */}
      <TicketForm />

      {/* ═══ FOOTER ═══ */}
      <footer className="mt-12 pb-28 md:pb-0" style={{ background: 'var(--bg-body)', borderTop: '1px solid var(--divider)' }}>
        <div className="max-w-2xl mx-auto px-6 py-12 text-center">
          <picture>
            <source srcSet="https://media.base44.com/images/public/69d519273be8cf966434f77a/51149fad3_IMG_0106.jpeg" media="(prefers-color-scheme: dark)" />
            <img src="https://media.base44.com/images/public/69d519273be8cf966434f77a/f678192b5_IMG_0105.jpeg"
            alt="TiliGo" className="h-14 mx-auto mb-6 object-contain rounded-xl" />
          </picture>
          <SocialLinks />
          <div className="mt-8">
            <p className="text-[10px] font-bold tracking-[0.25em] uppercase mb-4" style={{ color: 'var(--text-muted)' }}>Sponsorët Tanë</p>
            <div className="flex items-center justify-center gap-5 flex-wrap">
              {[
              { light: 'https://media.base44.com/images/public/69d519273be8cf966434f77a/e0dddd653_IMG_0144.jpeg', dark: 'https://media.base44.com/images/public/69d519273be8cf966434f77a/781629bd0_IMG_0143.jpeg', name: 'Tili Cleaning' },
              { light: 'https://media.base44.com/images/public/69d519273be8cf966434f77a/8e198f96c_IMG_0146.jpg', dark: 'https://media.base44.com/images/public/69d519273be8cf966434f77a/4a190bf33_IMG_0145.jpg', name: 'Free Shop Tili' }].
              map((s) =>
              <div key={s.name} className="overflow-hidden" style={{
                borderRadius: 20,
                boxShadow: '0 8px 28px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.12)',
                transform: 'perspective(400px) rotateX(3deg)',
                opacity: 1
              }}>
                  <picture>
                    <source srcSet={s.dark} media="(prefers-color-scheme: dark)" />
                    <img src={s.light} alt={s.name} style={{ height: 56, maxWidth: 160, objectFit: 'contain', display: 'block' }} />
                  </picture>
                </div>
              )}

            </div>
          </div>
          <div className="mt-8 space-y-1 text-xs" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>
            <p className="font-black text-sm" style={{ opacity: 0.8, color: 'var(--text-secondary)' }}>TiliGo — Platforma #1 e Dorëzimit në Kosovë</p>
            <p>Themeluar në Vushtrri · Shërbim 24/7 në të gjithë Kosovën</p>
            <p>📍 Vushtrri, Kosovë &nbsp;·&nbsp; 📧 support@tili-go.com &nbsp;·&nbsp; ☎️ +383 44 000 000</p>
            <p className="mt-2 opacity-50">© 2026 TiliGo · Të gjitha të drejtat e rezervuara · tili-go.com</p>
          </div>
        </div>
      </footer>
    </div>);

}

/* ── Social links ─────────────────────────────────────── */
import { Facebook, Instagram, Globe } from "lucide-react";
import StaffPortalSection from "@/components/StaffPortalSection";
import TicketForm from "@/components/TicketForm";
import AgentChatButton from "@/components/AgentChatButton";
function SocialLinks() {
  const [links, setLinks] = useState({ facebook: "https://facebook.com/tiligoo", instagram: "", tiktok: "", website: "" });
  useEffect(() => {
    base44.entities.AppSettings.list().then((data) => {
      const map = {};
      data.forEach((s) => {map[s.key] = s.value;});
      setLinks((prev) => ({ ...prev, ...map }));
    });
  }, []);
  const ICONS = [
  { key: "facebook", icon: <Facebook size={20} />, color: "#1877f2", bg: "rgba(24,119,242,0.12)", border: "rgba(24,119,242,0.3)" },
  { key: "instagram", icon: <Instagram size={20} />, color: "#e1306c", bg: "rgba(225,48,108,0.1)", border: "rgba(225,48,108,0.25)" },
  { key: "tiktok", icon: <span className="text-lg leading-none">🎵</span>, color: "#ffffff", bg: "rgba(255,255,255,0.07)", border: "rgba(255,255,255,0.15)" },
  { key: "website", icon: <Globe size={20} />, color: BLUE, bg: `${BLUE}18`, border: `${BLUE}44` }].
  filter((item) => links[item.key]);
  if (!ICONS.length) return null;
  return (
    <div className="flex items-center justify-center gap-3">
      {ICONS.map(({ key, icon, color, bg, border }) =>
      <motion.a key={key} href={links[key]} target="_blank" rel="noopener noreferrer"
      whileHover={{ scale: 1.15, y: -3 }} whileTap={{ scale: 0.95 }}
      className="w-12 h-12 rounded-2xl flex items-center justify-center"
      style={{ background: bg, color, border: `1px solid ${border}` }}>
          {icon}
        </motion.a>
      )}
    </div>);

}