import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Edit2, Package, ToggleLeft, ToggleRight, Upload, LogOut, Bell, TrendingUp, Clock, CheckCircle2, XCircle, ChefHat, Bike, BarChart2, Settings, AlertTriangle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import TiliGoLogo from "@/components/TiliGoLogo";

const ORDER_STATUS_MAP = {
  e_re: { label: "E Re", color: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
  pranuar: { label: "Pranuar", color: "bg-indigo-100 text-indigo-700", dot: "bg-indigo-500" },
  ne_pergatitje: { label: "Në Përgatitje", color: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  gati_per_dorezim: { label: "Gati", color: "bg-orange-100 text-orange-700", dot: "bg-orange-500" },
  ne_rruge: { label: "Në Rrugë", color: "bg-purple-100 text-purple-700", dot: "bg-purple-500" },
  dorezuar: { label: "Dorëzuar", color: "bg-green-100 text-green-700", dot: "bg-green-500" },
  anuluar: { label: "Anuluar", color: "bg-red-100 text-red-700", dot: "bg-red-500" },
};

const NEXT_STATUS = {
  e_re: "pranuar",
  pranuar: "ne_pergatitje",
  ne_pergatitje: "gati_per_dorezim",
};

const NEXT_LABEL = {
  e_re: "✓ Prano Porosinë",
  pranuar: "🍳 Fillo Përgatitjen",
  ne_pergatitje: "✅ Gati për Dorëzim",
};

export default function BusinessDashboard() {
  const navigate = useNavigate();
  const [biz, setBiz] = useState(() => {
    try { return JSON.parse(localStorage.getItem("tiligo_business") || "null"); } catch { return null; }
  });
  const [tab, setTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [newOrder, setNewOrder] = useState(false);
  const [productForm, setProductForm] = useState({ name: "", description: "", price: "", category: "", image_url: "" });

  useEffect(() => {
    if (!biz) { navigate("/biznesi/login"); return; }
    loadData();
  }, [biz]);

  useEffect(() => {
    if (!biz) return;
    const unsub = base44.entities.Order.subscribe((event) => {
      if (event.data?.business_id === biz.id && event.type === "create") {
        setNewOrder(true);
        setTimeout(() => setNewOrder(false), 6000);
        loadOrders();
      } else if (event.type === "update" && event.data?.business_id === biz.id) {
        loadOrders();
      }
    });
    return unsub;
  }, [biz]);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([loadOrders(), loadProducts()]);
    setLoading(false);
  };

  const loadOrders = async () => {
    const data = await base44.entities.Order.filter({ business_id: biz.id }, "-created_date");
    setOrders(data);
  };

  const loadProducts = async () => {
    const data = await base44.entities.Product.filter({ business_id: biz.id });
    setProducts(data);
  };

  const toggleOpen = async () => {
    await base44.entities.Business.update(biz.id, { is_open: !biz.is_open });
    const newBiz = { ...biz, is_open: !biz.is_open };
    setBiz(newBiz);
    localStorage.setItem("tiligo_business", JSON.stringify(newBiz));
  };

  const updateOrderStatus = async (order) => {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    await base44.entities.Order.update(order.id, { status: next });
    loadOrders();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setProductForm(f => ({ ...f, image_url: file_url }));
    setUploading(false);
  };

  const saveProduct = async (e) => {
    e.preventDefault();
    const data = { ...productForm, price: parseFloat(productForm.price), business_id: biz.id, business_name: biz.name, is_available: true };
    if (editProduct) {
      await base44.entities.Product.update(editProduct.id, data);
    } else {
      await base44.entities.Product.create(data);
    }
    setShowProductForm(false);
    setEditProduct(null);
    setProductForm({ name: "", description: "", price: "", category: "", image_url: "" });
    loadProducts();
  };

  const deleteProduct = async (id) => {
    if (!confirm("A jeni i sigurt?")) return;
    await base44.entities.Product.delete(id);
    loadProducts();
  };

  const openEditProduct = (prod) => {
    setEditProduct(prod);
    setProductForm({ name: prod.name, description: prod.description || "", price: String(prod.price), category: prod.category || "", image_url: prod.image_url || "" });
    setShowProductForm(true);
  };

  const logout = () => {
    localStorage.removeItem("tiligo_business");
    navigate("/");
  };

  if (!biz) return null;

  const pendingOrders = orders.filter(o => ["e_re", "pranuar", "ne_pergatitje", "gati_per_dorezim"].includes(o.status));
  const completedOrders = orders.filter(o => o.status === "dorezuar");
  const cancelledOrders = orders.filter(o => o.status === "anuluar");
  const todayRevenue = completedOrders.filter(o => {
    const d = new Date(o.created_date);
    return d.toDateString() === new Date().toDateString();
  }).reduce((s, o) => s + (o.total || 0), 0);
  const totalRevenue = completedOrders.reduce((s, o) => s + (o.total || 0), 0);

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-900 text-white sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <ChefHat size={20} className="text-white" />
            </div>
            <div>
              <p className="font-black text-white text-sm leading-tight">{biz.name}</p>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${biz.is_open ? "bg-green-400 animate-pulse" : "bg-gray-400"}`} />
                <span className="text-xs text-blue-200">{biz.is_open ? "I hapur · Pranon porosi" : "I mbyllur"}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleOpen}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all ${biz.is_open ? "bg-green-500 hover:bg-green-600 text-white" : "bg-white/20 hover:bg-white/30 text-white"}`}>
              {biz.is_open ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
              {biz.is_open ? "Hapur" : "Mbyllur"}
            </button>
            {pendingOrders.length > 0 && (
              <div className="relative">
                <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center">
                  <Bell size={18} className="text-white" />
                </div>
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-black">
                  {pendingOrders.length}
                </span>
              </div>
            )}
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
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3.5 rounded-2xl shadow-2xl font-bold text-sm flex items-center gap-3">
            <Bell size={18} className="animate-bounce" /> 🔔 Porosi e re ka ardhur!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="max-w-5xl mx-auto px-4 pt-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            { icon: "📦", label: "Porosi Aktive", value: pendingOrders.length, color: "text-blue-700", bg: "bg-blue-50" },
            { icon: "💰", label: "Sot", value: `${todayRevenue.toFixed(2)}€`, color: "text-green-700", bg: "bg-green-50" },
            { icon: "✅", label: "Të Dorëzuara", value: completedOrders.length, color: "text-indigo-700", bg: "bg-indigo-50" },
            { icon: "🍽️", label: "Produkte", value: products.length, color: "text-orange-700", bg: "bg-orange-50" },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl p-4 shadow-sm">
              <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center text-xl mb-2`}>{s.icon}</div>
              <p className={`font-black text-xl ${s.color}`}>{s.value}</p>
              <p className="text-gray-500 text-xs">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-40">
        <div className="max-w-5xl mx-auto px-4 flex">
          {[
            { key: "orders", icon: <Package size={15} />, label: `Porositë`, badge: pendingOrders.length },
            { key: "products", icon: <ChefHat size={15} />, label: `Produktet` },
            { key: "analytics", icon: <BarChart2 size={15} />, label: "Analitika" },
            { key: "history", icon: <Clock size={15} />, label: "Historiku" },
            { key: "settings", icon: <Settings size={15} />, label: "Cilësimet" },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`relative flex items-center gap-1.5 px-4 py-3.5 text-xs font-bold border-b-2 transition-colors ${tab === t.key ? "border-blue-700 text-blue-700" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
              {t.icon} {t.label}
              {t.badge > 0 && (
                <span className="ml-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-black text-[10px]">
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-5">

        {/* ORDERS TAB */}
        {tab === "orders" && (
          <div className="space-y-4">
            {loading ? (
              <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl p-5 animate-pulse h-32" />)}</div>
            ) : pendingOrders.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-gray-600 font-bold text-lg">Nuk ka porosi aktive</p>
                <p className="text-gray-400 text-sm mt-1">Porositë e reja do të shfaqen këtu</p>
              </div>
            ) : pendingOrders.map((order, idx) => (
              <motion.div key={order.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                {/* Status bar */}
                <div className={`h-1.5 ${ORDER_STATUS_MAP[order.status]?.dot}`} />
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-black text-xl text-amber-600">#{order.order_code}</span>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${ORDER_STATUS_MAP[order.status]?.color}`}>
                          {ORDER_STATUS_MAP[order.status]?.label}
                        </span>
                      </div>
                      <p className="text-gray-900 font-bold">{order.customer_name}</p>
                      <p className="text-gray-500 text-sm">{order.customer_phone}</p>
                      <p className="text-gray-400 text-xs">{order.customer_address}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-blue-700 text-xl">{order.total?.toFixed(2)}€</p>
                      <p className="text-gray-400 text-xs">cash</p>
                    </div>
                  </div>
                  {/* Items */}
                  <div className="bg-gray-50 rounded-xl p-3 mb-3">
                    {order.items?.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm py-0.5">
                        <span className="text-gray-700">{item.qty}× {item.name}</span>
                        <span className="text-gray-900 font-semibold">{(item.price * item.qty).toFixed(2)}€</span>
                      </div>
                    ))}
                    {order.notes && (
                      <p className="text-amber-600 text-xs mt-2 border-t border-gray-200 pt-2">📝 {order.notes}</p>
                    )}
                  </div>
                  {NEXT_STATUS[order.status] && (
                    <button onClick={() => updateOrderStatus(order)}
                      className="w-full bg-blue-700 hover:bg-blue-800 text-white font-black py-3 rounded-xl transition-all text-sm hover:shadow-lg active:scale-95">
                      {NEXT_LABEL[order.status]}
                    </button>
                  )}
                  {order.status === "gati_per_dorezim" && (
                    <div className="bg-orange-50 border border-orange-200 rounded-xl py-3 text-center text-orange-700 font-bold text-sm">
                      <Bike size={16} className="inline mr-2" />
                      Gati · Pret dorëzuesin
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* PRODUCTS TAB */}
        {tab === "products" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="font-black text-gray-900">Produktet Tuaja</h2>
                <p className="text-gray-500 text-sm">{products.length} produkte aktive</p>
              </div>
              <button onClick={() => { setEditProduct(null); setProductForm({ name: "", description: "", price: "", category: "", image_url: "" }); setShowProductForm(true); }}
                className="flex items-center gap-2 bg-blue-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-blue-800 transition-colors shadow-md">
                <Plus size={16} /> Shto Produkt
              </button>
            </div>

            <AnimatePresence>
              {showProductForm && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4 backdrop-blur-sm">
                  <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
                    <h3 className="font-black text-xl text-gray-900 mb-5">
                      {editProduct ? "✏️ Ndrysho Produktin" : "➕ Produkt i Ri"}
                    </h3>
                    <form onSubmit={saveProduct} className="space-y-4">
                      <div>
                        <label className="text-sm font-bold text-gray-700 mb-1.5 block">Emri *</label>
                        <input value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})}
                          placeholder="p.sh. Pizza Margherita" required
                          className="w-full border-2 border-gray-100 focus:border-blue-500 rounded-xl px-4 py-3 text-sm outline-none transition-colors" />
                      </div>
                      <div>
                        <label className="text-sm font-bold text-gray-700 mb-1.5 block">Përshkrimi</label>
                        <textarea value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})}
                          placeholder="Përshkruani produktin..." rows={2}
                          className="w-full border-2 border-gray-100 focus:border-blue-500 rounded-xl px-4 py-3 text-sm outline-none transition-colors resize-none" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm font-bold text-gray-700 mb-1.5 block">Çmimi (€) *</label>
                          <input type="number" step="0.01" min="0" value={productForm.price}
                            onChange={e => setProductForm({...productForm, price: e.target.value})}
                            placeholder="0.00" required
                            className="w-full border-2 border-gray-100 focus:border-blue-500 rounded-xl px-4 py-3 text-sm outline-none" />
                        </div>
                        <div>
                          <label className="text-sm font-bold text-gray-700 mb-1.5 block">Kategoria</label>
                          <input value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})}
                            placeholder="p.sh. Pizza"
                            className="w-full border-2 border-gray-100 focus:border-blue-500 rounded-xl px-4 py-3 text-sm outline-none" />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-bold text-gray-700 mb-1.5 block">Foto</label>
                        <label className="flex items-center gap-3 border-2 border-dashed border-gray-200 hover:border-blue-400 rounded-xl p-4 cursor-pointer transition-colors">
                          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                            <Upload size={18} className="text-blue-600" />
                          </div>
                          <span className="text-sm text-gray-500">
                            {uploading ? "Duke ngarkuar..." : productForm.image_url ? "✓ Foto u ngarkua" : "Ngarko foto produkti"}
                          </span>
                          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </label>
                        {productForm.image_url && (
                          <img src={productForm.image_url} alt="preview" className="mt-2 w-full h-32 object-cover rounded-xl" />
                        )}
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setShowProductForm(false)}
                          className="flex-1 bg-gray-100 text-gray-700 font-bold py-3.5 rounded-xl hover:bg-gray-200 transition-colors">
                          Anulo
                        </button>
                        <button type="submit"
                          className="flex-1 bg-blue-700 text-white font-bold py-3.5 rounded-xl hover:bg-blue-800 transition-colors shadow-md">
                          {editProduct ? "Ruaj Ndryshimet" : "Shto Produktin"}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {products.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🍽️</div>
                <p className="text-gray-600 font-bold">Nuk keni shtuar produkte akoma</p>
                <p className="text-gray-400 text-sm mt-1">Shtoni produktin e parë tani</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {products.map((prod, i) => (
                  <motion.div key={prod.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="bg-white rounded-2xl shadow-sm flex items-center gap-0 overflow-hidden hover:shadow-md transition-shadow">
                    {prod.image_url ? (
                      <img src={prod.image_url} alt={prod.name} className="w-24 h-24 object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-24 h-24 bg-gray-100 flex items-center justify-center flex-shrink-0 text-3xl">🍽️</div>
                    )}
                    <div className="flex-1 px-4 py-3 min-w-0">
                      <p className="font-bold text-gray-900 text-sm">{prod.name}</p>
                      {prod.category && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">{prod.category}</span>}
                      <p className="text-gray-400 text-xs line-clamp-1 mt-0.5">{prod.description}</p>
                      <p className="text-blue-700 font-black text-base mt-1">{prod.price?.toFixed(2)}€</p>
                    </div>
                    <div className="flex flex-col items-center gap-2 pr-3">
                      <button onClick={() => openEditProduct(prod)}
                        className="w-9 h-9 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 flex items-center justify-center transition-colors">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => deleteProduct(prod.id)}
                        className="w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ANALYTICS TAB */}
        {tab === "analytics" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Të ardhura Totale", value: `${totalRevenue.toFixed(2)}€`, icon: "💰", color: "from-green-400 to-green-600" },
                { label: "Porosi Dorëzuara", value: completedOrders.length, icon: "✅", color: "from-blue-400 to-blue-600" },
                { label: "Të Anuluara", value: cancelledOrders.length, icon: "❌", color: "from-red-400 to-red-600" },
                { label: "Mesatare/Porosi", value: completedOrders.length ? `${(totalRevenue / completedOrders.length).toFixed(2)}€` : "—", icon: "📊", color: "from-purple-400 to-purple-600" },
              ].map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                  className={`bg-gradient-to-br ${s.color} text-white rounded-2xl p-5`}>
                  <div className="text-3xl mb-2">{s.icon}</div>
                  <p className="font-black text-2xl">{s.value}</p>
                  <p className="text-white/70 text-xs mt-1">{s.label}</p>
                </motion.div>
              ))}
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp size={18} className="text-blue-600" /> Statusi i Biznesit
              </h3>
              <div className="space-y-3">
                {[
                  { label: "Produktet aktive", val: products.length, max: Math.max(products.length, 10), color: "bg-blue-500" },
                  { label: "Porosi të dorëzuara", val: completedOrders.length, max: Math.max(orders.length, 1), color: "bg-green-500" },
                  { label: "Porosi të anuluara", val: cancelledOrders.length, max: Math.max(orders.length, 1), color: "bg-red-400" },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{item.label}</span>
                      <span className="font-bold text-gray-900">{item.val}</span>
                    </div>
                    <div className="bg-gray-100 rounded-full h-2">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((item.val / item.max) * 100, 100)}%` }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className={`${item.color} h-2 rounded-full`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* HISTORY TAB */}
        {tab === "history" && (
          <div className="space-y-3">
            {orders.filter(o => ["dorezuar", "anuluar"].includes(o.status)).length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📋</div>
                <p className="text-gray-600 font-bold">Nuk ka historik akoma</p>
              </div>
            ) : orders.filter(o => ["dorezuar", "anuluar"].includes(o.status)).map((order, i) => (
              <motion.div key={order.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${order.status === "dorezuar" ? "bg-green-100" : "bg-red-100"}`}>
                      {order.status === "dorezuar" ? <CheckCircle2 size={18} className="text-green-600" /> : <XCircle size={18} className="text-red-500" />}
                    </div>
                    <div>
                      <p className="font-bold text-amber-600 text-sm">#{order.order_code}</p>
                      <p className="text-gray-700 text-sm font-medium">{order.customer_name}</p>
                      <p className="text-gray-400 text-xs">{order.items?.length} artikuj · {new Date(order.created_date).toLocaleDateString("sq-AL")}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${ORDER_STATUS_MAP[order.status]?.color}`}>
                      {ORDER_STATUS_MAP[order.status]?.label}
                    </span>
                    <p className="text-blue-700 font-black mt-1">{order.total?.toFixed(2)}€</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* SETTINGS TAB */}
        {tab === "settings" && (
          <div className="space-y-4 max-w-lg">
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-1">Informacionet e Llogarisë</h3>
              <p className="text-gray-500 text-sm mb-4">Të dhënat e biznesit tuaj</p>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Emri</span>
                  <span className="font-bold text-gray-900">{biz.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Telefoni</span>
                  <span className="font-bold text-gray-900">{biz.phone}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Adresa</span>
                  <span className="font-bold text-gray-900 text-right max-w-[60%]">{biz.address}</span>
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
              <p className="text-red-500 text-sm mb-4">Ky veprim është i pakthyeshëm. Të gjitha të dhënat tuaja do të fshihen përgjithmonë.</p>
              <button
                onClick={async () => {
                  if (!confirm("Jeni absolutisht i sigurt? Kjo nuk mund të kthehet mbrapsht!")) return;
                  await base44.entities.Business.delete(biz.id);
                  localStorage.removeItem("tiligo_business");
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