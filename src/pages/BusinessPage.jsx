import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Clock, Plus, Minus, ShoppingCart, Tag, Flame, Percent, ChevronRight, Zap } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import { useCart } from "@/lib/useCart";

const MOCK_OFFERS = [
  { id: 1, label: "🎉 20% zbritje për porosinë e parë", color: "from-violet-500 to-indigo-600" },
  { id: 2, label: "🛵 Dërgesa falas mbi 10€", color: "from-emerald-500 to-teal-600" },
  { id: 3, label: "🔥 Combo i ditës: 2+1 falas", color: "from-orange-500 to-red-500" },
];

// Each product card gets a staggered, scroll-triggered fade-up
function ProductCard({ prod, qty, onAdd, onRemove, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.42, delay: (index % 6) * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="tiligo-card rounded-2xl overflow-hidden group"
    >
      <div className="flex items-stretch">
        {prod.image_url ? (
          <div className="w-28 flex-shrink-0 overflow-hidden">
            <img src={prod.image_url} alt={prod.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </div>
        ) : (
          <div className="w-28 flex-shrink-0 flex items-center justify-center text-4xl"
            style={{ background: 'var(--stat-bg)' }}>🍽️</div>
        )}
        <div className="flex-1 p-4 flex flex-col justify-between" style={{ minHeight: 112 }}>
          <div>
            <h3 className="font-bold text-sm leading-snug" style={{ color: 'var(--text-heading)' }}>{prod.name}</h3>
            {prod.description && (
              <p className="text-xs line-clamp-2 mt-0.5" style={{ color: 'var(--text-muted)' }}>{prod.description}</p>
            )}
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="font-black text-base" style={{ color: 'var(--price-color)' }}>
              {prod.price?.toFixed(2)}€
            </span>
            {qty === 0 ? (
              <button onClick={onAdd}
                className="w-9 h-9 rounded-full flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all"
                style={{ background: 'var(--btn-add-bg)', color: 'var(--btn-add-text)' }}>
                <Plus size={18} />
              </button>
            ) : (
              <div className="flex items-center gap-1.5 rounded-full px-1.5 py-1"
                style={{ background: 'var(--pill-inactive-bg)', border: '1px solid var(--pill-inactive-border)' }}>
                <button onClick={onRemove}
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:text-red-500 transition-colors"
                  style={{ background: 'var(--card-bg)', color: 'var(--text-primary)' }}>
                  <Minus size={13} />
                </button>
                <span className="font-black w-5 text-center text-sm" style={{ color: 'var(--price-color)' }}>{qty}</span>
                <button onClick={onAdd}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                  style={{ background: 'var(--btn-add-bg)', color: 'var(--btn-add-text)' }}>
                  <Plus size={13} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function BusinessPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const [business, setBusiness] = useState(null);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeOffer, setActiveOffer] = useState(0);
  const { cart, addToCart, removeFromCart, clearCart } = useCart();

  const { scrollY } = useScroll();
  const heroScale = useTransform(scrollY, [0, 220], [1, 1.12]);
  const heroOpacity = useTransform(scrollY, [0, 180], [1, 0.4]);

  useEffect(() => { loadData(); }, [id]);
  useEffect(() => {
    const t = setInterval(() => setActiveOffer(p => (p + 1) % MOCK_OFFERS.length), 3500);
    return () => clearInterval(t);
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [bizList, prods] = await Promise.all([
      base44.entities.Business.filter({ id }),
      base44.entities.Product.filter({ business_id: id, is_available: true }),
    ]);
    if (bizList.length > 0) setBusiness(bizList[0]);
    setProducts(prods);
    setLoading(false);
  };

  const categories = ["all", ...new Set(products.map(p => p.category).filter(Boolean))];
  const filtered = activeCategory === "all" ? products : products.filter(p => p.category === activeCategory);
  const getQty = (pid) => cart.find(i => i.id === pid)?.qty || 0;
  const featured = products.slice(0, 4);

  if (loading) return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      <Navbar cart={cart} onCartClick={() => setCartOpen(true)} />
      <div className="animate-pulse">
        <div className="h-64 w-full" style={{ background: 'var(--stat-bg)' }} />
        <div className="max-w-3xl mx-auto px-4 pt-4 space-y-3">
          <div className="h-8 rounded-xl w-1/2" style={{ background: 'var(--stat-bg)' }} />
          <div className="h-4 rounded-xl w-full" style={{ background: 'var(--stat-bg)' }} />
          <div className="h-24 rounded-2xl" style={{ background: 'var(--stat-bg)' }} />
        </div>
      </div>
    </div>
  );

  if (!business) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-page)' }}>
      <p style={{ color: 'var(--text-muted)' }}>Biznesi nuk u gjet</p>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      <Navbar cart={cart} onCartClick={() => setCartOpen(true)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)}
        cart={cart} onAdd={addToCart} onRemove={removeFromCart} onClear={clearCart} />

      {/* ── PARALLAX HERO ── */}
      <div ref={heroRef} className="relative h-64 md:h-80 overflow-hidden">
        <motion.img
          style={{ scale: heroScale, opacity: heroOpacity }}
          src={business.image_url || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&q=80"}
          alt={business.name}
          className="w-full h-full object-cover origin-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

        {/* Back button */}
        <button onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-lg hover:bg-white transition">
          <ArrowLeft size={18} className="text-gray-800" />
        </button>

        {/* Open badge */}
        {business.is_open && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.3 }}
            className="absolute top-4 right-4 bg-emerald-500 text-white text-xs font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> Hapur Tani
          </motion.div>
        )}

        {/* Hero info overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-5">
          <motion.h1
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-2xl md:text-3xl font-black text-white drop-shadow-lg mb-1"
          >{business.name}</motion.h1>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-amber-400 font-bold text-sm">
              <Star size={13} fill="currentColor" /> {business.rating?.toFixed(1) || "4.5"}
            </span>
            <span className="text-white/80 text-sm flex items-center gap-1">
              <Clock size={12} /> {business.delivery_time || "20-35 min"}
            </span>
            <span className="text-white/80 text-sm">Dërgesa {business.delivery_fee?.toFixed(2) || "1.50"}€</span>
          </motion.div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4">

        {/* ── FLOATING INFO CARD ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="tiligo-card rounded-2xl -mt-5 relative z-10 p-5 mb-4 shadow-xl"
        >
          {business.description && (
            <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{business.description}</p>
          )}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: <Clock size={15} />, label: business.delivery_time || "20-35 min", sub: "Kohë dorëzimi", accent: "#3b82f6" },
              { icon: <Tag size={15} />,   label: `${business.delivery_fee?.toFixed(2) || "1.50"}€`, sub: "Tarifë dërgese", accent: "#10b981" },
              { icon: <Percent size={15} />,label: `${business.min_order?.toFixed(0) || "3"}€`, sub: "Min. porosi", accent: "#f59e0b" },
            ].map((item, i) => (
              <div key={i} className="rounded-xl p-3 text-center" style={{ background: 'var(--stat-bg)' }}>
                <div className="flex justify-center mb-1" style={{ color: item.accent }}>{item.icon}</div>
                <p className="font-black text-sm" style={{ color: 'var(--text-heading)' }}>{item.label}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.sub}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── OFFERS BANNER ── */}
        <div className="mb-5 rounded-2xl overflow-hidden shadow-md">
          <AnimatePresence mode="wait">
            <motion.div key={activeOffer}
              initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4 }}
              className={`bg-gradient-to-r ${MOCK_OFFERS[activeOffer].color} text-white px-5 py-4 flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                  <Zap size={16} className="text-white" />
                </div>
                <span className="font-bold text-sm">{MOCK_OFFERS[activeOffer].label}</span>
              </div>
              <div className="flex gap-1.5">
                {MOCK_OFFERS.map((_, i) => (
                  <button key={i} onClick={() => setActiveOffer(i)}
                    className={`rounded-full transition-all ${i === activeOffer ? "w-5 h-2 bg-white" : "w-2 h-2 bg-white/40"}`} />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── FEATURED STRIP (horizontal scroll) ── */}
        {featured.length > 0 && (
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Flame size={16} className="text-orange-500" />
              <h2 className="font-black text-base" style={{ color: 'var(--text-heading)' }}>Shumë të kërkuara</h2>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {featured.map((prod, i) => (
                <motion.div key={prod.id}
                  initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                  whileHover={{ y: -4, scale: 1.03 }}
                  className="flex-shrink-0 w-36 tiligo-card rounded-2xl overflow-hidden cursor-pointer shadow-md"
                  onClick={() => { if (getQty(prod.id) === 0) addToCart({ ...prod, delivery_fee: business.delivery_fee }); }}>
                  {prod.image_url ? (
                    <img src={prod.image_url} alt={prod.name} className="w-full h-24 object-cover" />
                  ) : (
                    <div className="w-full h-24 flex items-center justify-center text-3xl" style={{ background: 'var(--stat-bg)' }}>🍽️</div>
                  )}
                  <div className="p-2.5">
                    <p className="font-bold text-xs line-clamp-1" style={{ color: 'var(--text-heading)' }}>{prod.name}</p>
                    <p className="font-black text-sm mt-0.5" style={{ color: 'var(--price-color)' }}>{prod.price?.toFixed(2)}€</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── CATEGORY TABS ── */}
        {categories.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-5 no-scrollbar">
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`category-pill flex-shrink-0 ${activeCategory === cat ? "active" : ""}`}>
                {cat === "all" ? "✨ Të gjitha" : cat}
              </button>
            ))}
          </div>
        )}

        {/* ── PRODUCT LIST ── */}
        <div className="space-y-3 pb-36">
          {filtered.length === 0 ? (
            <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
              <div className="text-5xl mb-3">🍽️</div>
              <p className="font-medium">Nuk ka produkte</p>
            </div>
          ) : filtered.map((prod, i) => (
            <ProductCard
              key={prod.id}
              prod={prod}
              qty={getQty(prod.id)}
              index={i}
              onAdd={() => addToCart({ ...prod, delivery_fee: business.delivery_fee })}
              onRemove={() => removeFromCart(prod.id)}
            />
          ))}
        </div>
      </div>

      {/* ── FLOATING CART BUTTON ── */}
      <AnimatePresence>
        {cart.length > 0 && (
          <motion.button
            initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => setCartOpen(true)}
            className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 font-bold z-40 min-w-[290px]"
            style={{ background: 'linear-gradient(135deg,#059669,#0284c7)', boxShadow: '0 8px 32px rgba(5,150,105,0.4)' }}
          >
            <div className="bg-white/20 rounded-xl px-2.5 py-1 text-sm font-black">
              {cart.reduce((s, i) => s + i.qty, 0)}
            </div>
            <span className="flex-1 text-center">Shiko Shportën</span>
            <span className="text-white/80 font-black text-sm">
              {(cart.reduce((s, i) => s + i.price * i.qty, 0) + (cart[0]?.delivery_fee || 1.5)).toFixed(2)}€
            </span>
            <ChevronRight size={18} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}