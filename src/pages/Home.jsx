import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Star, Clock, ChevronRight, Bike, Shield, Award, MapPin } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
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

const MOTO_POSITIONS = [8, 25, 45, 65, 82];

export default function Home() {
  const [businesses, setBusinesses] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { cart, addToCart, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    loadBusinesses();
  }, []);

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
    <div className="min-h-screen bg-[#f0f4f8]">
      <Navbar cart={cart} onCartClick={() => setCartOpen(true)} />
      <CartDrawer
        open={cartOpen} onClose={() => setCartOpen(false)}
        cart={cart} onAdd={addToCart} onRemove={removeFromCart} onClear={clearCart}
      />

      {/* HERO */}
      <section className="hero-gradient relative overflow-hidden">
        {/* Animated motos */}
        <div className="absolute bottom-10 left-0 right-0 overflow-hidden pointer-events-none">
          {MOTO_POSITIONS.map((pos, i) => (
            <div key={i} className="absolute bottom-0" style={{ left: `${pos}%`, animationDelay: `${i * 1.8}s` }}>
              <span className="text-3xl moto-animate inline-block" style={{ animationDelay: `${i * 1.6}s` }}>🛵</span>
            </div>
          ))}
        </div>

        {/* Floating restaurant chips */}
        <div className="absolute top-6 left-4 hidden md:block">
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3 }}
            className="bg-white/90 backdrop-blur rounded-xl px-3 py-2 flex items-center gap-2 shadow-lg">
            <span className="text-lg">🍔</span>
            <div><p className="text-xs font-bold text-gray-800">Burger House</p><p className="text-xs text-gray-500">25 min</p></div>
          </motion.div>
        </div>
        <div className="absolute top-6 right-4 hidden md:block">
          <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 3.5, delay: 0.5 }}
            className="bg-white/90 backdrop-blur rounded-xl px-3 py-2 flex items-center gap-2 shadow-lg">
            <span className="text-lg">🍕</span>
            <div><p className="text-xs font-bold text-gray-800">Pica Italia</p><p className="text-xs text-gray-500">30 min</p></div>
          </motion.div>
        </div>
        <div className="absolute bottom-16 right-8 hidden md:block">
          <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 2.8, delay: 1 }}
            className="bg-white/90 backdrop-blur rounded-xl px-3 py-2 flex items-center gap-2 shadow-lg">
            <span className="text-lg">☕</span>
            <div><p className="text-xs font-bold text-gray-800">Kafe Coffe</p><p className="text-xs text-gray-500">20 min</p></div>
          </motion.div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 pt-16 pb-28 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 bg-white/20 text-white text-sm px-4 py-1.5 rounded-full mb-6 backdrop-blur">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Aktiv tani · Prishtinë & Kosovë
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-2">
              Çfarë dëshironi
            </h1>
            <h1 className="text-4xl md:text-6xl font-black text-amber-400 leading-tight mb-6">
              sot?
            </h1>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
              Porosit nga restorante dhe dyqane të preferuara. Dërgesa brenda 30 minutash!
            </p>

            {/* Search */}
            <div className="flex gap-3 max-w-lg mx-auto">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && navigate(`/?search=${search}`)}
                  placeholder="Kërko ushqim, restorante..."
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl text-gray-900 bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                />
              </div>
              <button
                onClick={() => {}}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3.5 rounded-xl transition-colors shadow-lg whitespace-nowrap"
              >
                Kërko
              </button>
            </div>

            {/* App download buttons */}
            <div className="flex items-center justify-center gap-3 mt-6">
              <Link to="/shkarko-app"
                className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-900 transition-colors">
                <span className="text-xl">🍎</span>
                <div className="text-left"><p className="text-xs opacity-70">Shkarko për</p><p className="font-semibold">iPhone / iPad</p></div>
              </Link>
              <Link to="/shkarko-app"
                className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors">
                <span className="text-xl">🤖</span>
                <div className="text-left"><p className="text-xs opacity-70">Shkarko për</p><p className="font-semibold">Android</p></div>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature badges */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4 grid grid-cols-3 gap-4">
          {[
            { icon: <Bike size={20} className="text-amber-500" />, title: "Shpejt", sub: "30-45 min" },
            { icon: <Shield size={20} className="text-green-600" />, title: "Siguri", sub: "Certifikuar" },
            { icon: <Award size={20} className="text-blue-700" />, title: "Cilësi", sub: "Top dyqane" },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center">{f.icon}</div>
              <div><p className="font-semibold text-gray-900 text-sm">{f.title}</p><p className="text-xs text-gray-500">{f.sub}</p></div>
            </div>
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
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            Të gjitha Dyqanet
            <span className="ml-2 text-gray-400 font-normal text-base">({filtered.length})</span>
          </h2>
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
              >
                <Link to={`/dyqani/${biz.id}`} className="block">
                  <div className="bg-white rounded-2xl overflow-hidden card-hover shadow-sm">
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={biz.image_url || `https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80`}
                        alt={biz.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3">
                        <span className="bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                          <Star size={10} fill="white" /> {biz.rating?.toFixed(1) || "4.5"}
                        </span>
                      </div>
                      {biz.is_open && (
                        <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          Hapur
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 text-base mb-1">{biz.name}</h3>
                      <p className="text-gray-500 text-sm line-clamp-2 mb-3">{biz.description}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />{biz.delivery_time || "20-35 min"}
                        </span>
                        <span>•</span>
                        <span>Dërgesa {biz.delivery_fee?.toFixed(2) || "1.50"}€</span>
                        <span>•</span>
                        <span>Min. {biz.min_order?.toFixed(0) || "3"}€</span>
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
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            className="hero-gradient rounded-2xl p-7 text-white"
          >
            <div className="text-4xl mb-3">🏪</div>
            <h3 className="text-xl font-bold mb-2">Regjistro Biznesin Tënd</h3>
            <p className="text-white/80 text-sm mb-4">Bashkohu me platformën tonë dhe rrit shitjet tuaja. Mijëra klientë të rinj çdo ditë!</p>
            <Link to="/biznesi/register"
              className="inline-flex items-center gap-2 bg-white text-blue-800 font-bold px-5 py-2.5 rounded-xl hover:bg-gray-100 transition-colors text-sm">
              Regjistrohu Tani <ChevronRight size={16} />
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-7 text-white"
          >
            <div className="text-4xl mb-3">🛵</div>
            <h3 className="text-xl font-bold mb-2">Bëhu Dorëzues</h3>
            <p className="text-white/80 text-sm mb-4">Fiton para duke dorëzuar porositë. Oraret fleksibël, pagesa ditore!</p>
            <Link to="/dorezuesi/register"
              className="inline-flex items-center gap-2 bg-white text-green-800 font-bold px-5 py-2.5 rounded-xl hover:bg-gray-100 transition-colors text-sm">
              Apliko Tani <ChevronRight size={16} />
            </Link>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-12 py-10 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <img
            src="https://media.base44.com/images/public/69d519273be8cf966434f77a/9ac65c451_IMG_0066.png"
            alt="TiliGo" className="h-12 mx-auto mb-4 object-contain"
          />
          <p className="text-gray-400 text-sm">© 2025 TiliGo · Prishtinë, Kosovë · Dorëzimi më i shpejtë</p>
        </div>
      </footer>
    </div>
  );
}