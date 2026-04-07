import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Edit2, Package, ToggleLeft, ToggleRight, Upload, LogOut, Bell } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import TiliGoLogo from "@/components/TiliGoLogo";

const ORDER_STATUS_MAP = {
  e_re: { label: "E Re", color: "bg-blue-100 text-blue-700" },
  pranuar: { label: "Pranuar", color: "bg-indigo-100 text-indigo-700" },
  ne_pergatitje: { label: "Në Përgatitje", color: "bg-amber-100 text-amber-700" },
  gati_per_dorezim: { label: "Gati", color: "bg-orange-100 text-orange-700" },
  ne_rruge: { label: "Në Rrugë", color: "bg-purple-100 text-purple-700" },
  dorezuar: { label: "Dorëzuar", color: "bg-green-100 text-green-700" },
  anuluar: { label: "Anuluar", color: "bg-red-100 text-red-700" },
};

const NEXT_STATUS = {
  e_re: "pranuar", pranuar: "ne_pergatitje", ne_pergatitje: "gati_per_dorezim"
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
  const [productForm, setProductForm] = useState({
    name: "", description: "", price: "", category: "", image_url: ""
  });

  useEffect(() => {
    if (!biz) { navigate("/biznesi/login"); return; }
    loadData();
  }, [biz]);

  useEffect(() => {
    if (!biz) return;
    const unsub = base44.entities.Order.subscribe((event) => {
      if (event.data?.business_id === biz.id && event.type === "create") {
        setNewOrder(true);
        setTimeout(() => setNewOrder(false), 5000);
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
    const updated = await base44.entities.Business.update(biz.id, { is_open: !biz.is_open });
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
    const data = {
      ...productForm,
      price: parseFloat(productForm.price),
      business_id: biz.id,
      business_name: biz.name,
      is_available: true,
    };
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

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TiliGoLogo size="sm" />
            <div>
              <p className="font-bold text-gray-900 text-sm leading-tight">{biz.name}</p>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${biz.is_open ? "bg-green-500" : "bg-gray-300"}`} />
                <span className="text-xs text-gray-500">{biz.is_open ? "I hapur" : "I mbyllur"}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleOpen}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${biz.is_open ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {biz.is_open ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
              {biz.is_open ? "Hapur" : "Mbyllur"}
            </button>
            {pendingOrders.length > 0 && (
              <div className="relative">
                <Bell size={20} className="text-amber-500" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {pendingOrders.length}
                </span>
              </div>
            )}
            <button onClick={logout} className="text-gray-400 hover:text-red-500 transition-colors p-1">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* New order notification */}
      <AnimatePresence>
        {newOrder && (
          <motion.div initial={{ y: -60 }} animate={{ y: 0 }} exit={{ y: -60 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-2xl shadow-xl font-bold text-sm flex items-center gap-2">
            🔔 Porosi e re ka ardhur!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 flex gap-1">
          {[
            { key: "orders", label: `Porositë (${pendingOrders.length})` },
            { key: "products", label: `Produktet (${products.length})` },
            { key: "history", label: "Historiku" },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-5 py-3.5 text-sm font-semibold border-b-2 transition-colors ${tab === t.key ? "border-blue-700 text-blue-700" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* ORDERS TAB */}
        {tab === "orders" && (
          <div className="space-y-4">
            {loading ? (
              <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl p-5 animate-pulse h-28" />)}</div>
            ) : pendingOrders.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-3">📭</div>
                <p className="text-gray-500 font-medium">Nuk ka porosi aktive</p>
              </div>
            ) : pendingOrders.map(order => (
              <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-5 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="font-black text-lg text-amber-600">{order.order_code}</span>
                    <p className="text-gray-900 font-semibold text-sm">{order.customer_name}</p>
                    <p className="text-gray-500 text-xs">{order.customer_phone} · {order.customer_address}</p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${ORDER_STATUS_MAP[order.status]?.color}`}>
                    {ORDER_STATUS_MAP[order.status]?.label}
                  </span>
                </div>
                <div className="space-y-1 mb-3">
                  {order.items?.map((item, i) => (
                    <p key={i} className="text-sm text-gray-600">{item.qty}x {item.name} – {(item.price * item.qty).toFixed(2)}€</p>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-black text-blue-700">{order.total?.toFixed(2)}€ cash</span>
                  {NEXT_STATUS[order.status] && (
                    <button onClick={() => updateOrderStatus(order)}
                      className="bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-blue-800 transition-colors">
                      {{
                        e_re: "✓ Prano",
                        pranuar: "🍳 Fillo Përgatitjen",
                        ne_pergatitje: "✅ Gati për Dorëzim",
                      }[order.status]}
                    </button>
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
              <h2 className="font-bold text-gray-900">Produktet Tuaja</h2>
              <button onClick={() => { setEditProduct(null); setProductForm({ name: "", description: "", price: "", category: "", image_url: "" }); setShowProductForm(true); }}
                className="flex items-center gap-2 bg-blue-700 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-blue-800 transition-colors">
                <Plus size={16} /> Shto Produkt
              </button>
            </div>

            {/* Product Form Modal */}
            <AnimatePresence>
              {showProductForm && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
                    <h3 className="font-black text-lg text-gray-900 mb-4">
                      {editProduct ? "Ndrysho Produktin" : "Shto Produkt të Ri"}
                    </h3>
                    <form onSubmit={saveProduct} className="space-y-4">
                      <div>
                        <label className="text-sm font-semibold text-gray-700 mb-1 block">Emri *</label>
                        <input value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})}
                          placeholder="p.sh. Pizza Margherita" required
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-700 mb-1 block">Përshkrimi</label>
                        <textarea value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})}
                          placeholder="Përshkruani produktin..." rows={2}
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm font-semibold text-gray-700 mb-1 block">Çmimi (€) *</label>
                          <input type="number" step="0.01" min="0" value={productForm.price}
                            onChange={e => setProductForm({...productForm, price: e.target.value})}
                            placeholder="0.00" required
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-700 mb-1 block">Kategoria</label>
                          <input value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})}
                            placeholder="p.sh. Pizza"
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-700 mb-1 block">Foto</label>
                        <label className="flex items-center gap-3 border-2 border-dashed border-gray-200 rounded-xl p-3 cursor-pointer hover:border-blue-400 transition-colors">
                          <Upload size={18} className="text-gray-400" />
                          <span className="text-sm text-gray-500">{uploading ? "Duke ngarkuar..." : productForm.image_url ? "Foto u ngarkua ✓" : "Ngarko foto"}</span>
                          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </label>
                        {productForm.image_url && (
                          <img src={productForm.image_url} alt="preview" className="mt-2 w-full h-28 object-cover rounded-xl" />
                        )}
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setShowProductForm(false)}
                          className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors text-sm">
                          Anulo
                        </button>
                        <button type="submit"
                          className="flex-1 bg-blue-700 text-white font-bold py-3 rounded-xl hover:bg-blue-800 transition-colors text-sm">
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
                <div className="text-5xl mb-3">🍽️</div>
                <p className="text-gray-500 font-medium">Nuk keni shtuar produkte akoma</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map(prod => (
                  <div key={prod.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4">
                    {prod.image_url && (
                      <img src={prod.image_url} alt={prod.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm">{prod.name}</p>
                      <p className="text-gray-500 text-xs line-clamp-1">{prod.description}</p>
                      <p className="text-blue-700 font-black mt-1">{prod.price?.toFixed(2)}€</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => openEditProduct(prod)}
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-blue-100 hover:text-blue-700 flex items-center justify-center transition-colors">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => deleteProduct(prod.id)}
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* HISTORY TAB */}
        {tab === "history" && (
          <div className="space-y-3">
            {orders.filter(o => ["dorezuar", "anuluar"].includes(o.status)).map(order => (
              <div key={order.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
                <div>
                  <p className="font-bold text-amber-600 text-sm">{order.order_code}</p>
                  <p className="text-gray-700 text-sm font-medium">{order.customer_name}</p>
                  <p className="text-gray-500 text-xs">{order.items?.length} artikuj</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${ORDER_STATUS_MAP[order.status]?.color}`}>
                    {ORDER_STATUS_MAP[order.status]?.label}
                  </span>
                  <p className="text-blue-700 font-black mt-1 text-sm">{order.total?.toFixed(2)}€</p>
                </div>
              </div>
            ))}
            {orders.filter(o => ["dorezuar", "anuluar"].includes(o.status)).length === 0 && (
              <div className="text-center py-20">
                <div className="text-5xl mb-3">📋</div>
                <p className="text-gray-500">Nuk ka historik akoma</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}