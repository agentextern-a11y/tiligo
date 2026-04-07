import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Clock, Plus, Minus, ShoppingCart } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import { useCart } from "@/lib/useCart";

export default function BusinessPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { cart, addToCart, removeFromCart, clearCart } = useCart();

  useEffect(() => {
    loadData();
  }, [id]);

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

  if (loading) return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <Navbar cart={cart} onCartClick={() => setCartOpen(true)} />
      <div className="animate-pulse">
        <div className="h-56 bg-gray-200 w-full" />
        <div className="max-w-3xl mx-auto px-4 pt-4 space-y-3">
          <div className="h-8 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-full" />
        </div>
      </div>
    </div>
  );

  if (!business) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Biznesi nuk u gjet</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <Navbar cart={cart} onCartClick={() => setCartOpen(true)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)}
        cart={cart} onAdd={addToCart} onRemove={removeFromCart} onClear={clearCart} />

      {/* Hero image */}
      <div className="relative h-52 md:h-64 overflow-hidden">
        <img
          src={business.image_url || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80"}
          alt={business.name} className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <button onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-md hover:bg-white transition-colors">
          <ArrowLeft size={18} className="text-gray-700" />
        </button>
      </div>

      {/* Business info card */}
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-md -mt-8 relative z-10 p-5 mb-5">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{business.name}</h1>
              <p className="text-gray-500 text-sm mt-1">{business.description}</p>
            </div>
            {business.is_open && (
              <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full flex-shrink-0 ml-3">
                Hapur
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 flex-wrap">
            <span className="flex items-center gap-1 text-amber-500 font-semibold">
              <Star size={14} fill="currentColor" /> {business.rating?.toFixed(1) || "4.5"}
            </span>
            <span className="flex items-center gap-1"><Clock size={14} />{business.delivery_time || "20-35 min"}</span>
            <span>Dërgesa: <strong className="text-gray-700">{business.delivery_fee?.toFixed(2) || "1.50"}€</strong></span>
            <span>Min. porosi: <strong className="text-gray-700">{business.min_order?.toFixed(0) || "3"}€</strong></span>
          </div>
        </div>

        {/* Category tabs */}
        {categories.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`category-pill flex-shrink-0 ${activeCategory === cat ? "active" : "inactive"}`}>
                {cat === "all" ? "Të gjitha" : cat}
              </button>
            ))}
          </div>
        )}

        {/* Products */}
        <div className="space-y-3 pb-28">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-5xl mb-3">🍽️</div>
              <p>Nuk ka produkte</p>
            </div>
          ) : filtered.map((prod, i) => {
            const qty = getQty(prod.id);
            return (
              <motion.div key={prod.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="bg-white rounded-2xl p-4 flex gap-4 items-center shadow-sm card-hover">
                {prod.image_url && (
                  <img src={prod.image_url} alt={prod.name}
                    className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900">{prod.name}</h3>
                  <p className="text-gray-500 text-sm line-clamp-2 mt-0.5">{prod.description}</p>
                  <p className="text-blue-700 font-bold mt-1">{prod.price?.toFixed(2)}€</p>
                </div>
                <div className="flex-shrink-0">
                  {qty === 0 ? (
                    <button
                      onClick={() => addToCart({ ...prod, delivery_fee: business.delivery_fee })}
                      className="w-9 h-9 rounded-full bg-blue-700 text-white flex items-center justify-center hover:bg-blue-800 transition-colors shadow-md">
                      <Plus size={18} />
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button onClick={() => removeFromCart(prod.id)}
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-colors">
                        <Minus size={14} />
                      </button>
                      <span className="font-bold text-gray-900 w-5 text-center">{qty}</span>
                      <button onClick={() => addToCart({ ...prod, delivery_fee: business.delivery_fee })}
                        className="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center hover:bg-blue-800 transition-colors">
                        <Plus size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Floating cart button */}
      <AnimatePresence>
        {cart.length > 0 && (
          <motion.button
            initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }}
            onClick={() => setCartOpen(true)}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-blue-700 text-white px-6 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 font-bold z-40 hover:bg-blue-800 transition-colors"
          >
            <ShoppingCart size={20} />
            <span>{cart.reduce((s, i) => s + i.qty, 0)} artikuj</span>
            <span className="bg-white/20 px-2 py-0.5 rounded-lg text-sm">
              {(cart.reduce((s, i) => s + i.price * i.qty, 0) + (cart[0]?.delivery_fee || 1.5)).toFixed(2)}€
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}