import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, LogOut, Check, X, Edit2, Trash2, Store, Bike, Package, Users, ChevronDown, ChevronUp, Upload } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import TiliGoLogo from "@/components/TiliGoLogo";

const ADMIN_USER = "root";
const ADMIN_PASS = "Jari!!2018";

const STATUS_COLORS = {
  e_re: "bg-blue-100 text-blue-700", pranuar: "bg-indigo-100 text-indigo-700",
  ne_pergatitje: "bg-amber-100 text-amber-700", gati_per_dorezim: "bg-orange-100 text-orange-700",
  ne_rruge: "bg-purple-100 text-purple-700", dorezuar: "bg-green-100 text-green-700",
  anuluar: "bg-red-100 text-red-700",
};
const STATUS_LABELS = {
  e_re:"E Re",pranuar:"Pranuar",ne_pergatitje:"Në Përgatitje",
  gati_per_dorezim:"Gati",ne_rruge:"Në Rrugë",dorezuar:"Dorëzuar",anuluar:"Anuluar"
};

export default function AdminPanel() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(() => localStorage.getItem("tiligo_admin") === "1");
  const [loginForm, setLoginForm] = useState({ user: "", pass: "" });
  const [loginError, setLoginError] = useState("");
  const [tab, setTab] = useState("businesses");
  const [businesses, setBusinesses] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [uploading, setUploading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    if (authed) loadAll();
  }, [authed]);

  const loadAll = async () => {
    setLoading(true);
    const [b, d, o] = await Promise.all([
      base44.entities.Business.list(),
      base44.entities.Delivery.list(),
      base44.entities.Order.list("-created_date", 200),
    ]);
    setBusinesses(b);
    setDeliveries(d);
    setOrders(o);
    setLoading(false);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginForm.user === ADMIN_USER && loginForm.pass === ADMIN_PASS) {
      localStorage.setItem("tiligo_admin", "1");
      setAuthed(true);
    } else {
      setLoginError("Kredencialet janë të gabuara!");
    }
  };

  const logout = () => {
    localStorage.removeItem("tiligo_admin");
    setAuthed(false);
  };

  const approveBiz = async (id) => {
    await base44.entities.Business.update(id, { status: "approved" });
    loadAll();
  };
  const rejectBiz = async (id) => {
    await base44.entities.Business.update(id, { status: "rejected" });
    loadAll();
  };
  const deleteBiz = async (id) => {
    if (!confirm("Jeni i sigurt?")) return;
    await base44.entities.Business.delete(id);
    loadAll();
  };
  const approveDriver = async (id) => {
    await base44.entities.Delivery.update(id, { status: "approved" });
    loadAll();
  };
  const rejectDriver = async (id) => {
    await base44.entities.Delivery.update(id, { status: "rejected" });
    loadAll();
  };
  const deleteDriver = async (id) => {
    if (!confirm("Jeni i sigurt?")) return;
    await base44.entities.Delivery.delete(id);
    loadAll();
  };
  const updateOrderStatus = async (id, status) => {
    await base44.entities.Order.update(id, { status });
    loadAll();
  };
  const deleteOrder = async (id) => {
    if (!confirm("Jeni i sigurt?")) return;
    await base44.entities.Order.delete(id);
    loadAll();
  };

  const startEdit = (item, type) => {
    setEditItem({ ...item, _type: type });
    setEditForm({ ...item });
  };

  const saveEdit = async () => {
    const { _type, id, ...data } = editItem;
    if (_type === "business") await base44.entities.Business.update(id, editForm);
    else if (_type === "delivery") await base44.entities.Delivery.update(id, editForm);
    setEditItem(null);
    loadAll();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setEditForm(f => ({ ...f, image_url: file_url }));
    setUploading(false);
  };

  // Login screen
  if (!authed) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl">
        <div className="text-center mb-6">
          <TiliGoLogo size="md" className="justify-center mb-3" />
          <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Shield size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-gray-900">Paneli Admin</h1>
          <p className="text-gray-500 text-sm mt-1">Hyrja e administratorit</p>
        </div>
        {loginError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">{loginError}</div>
        )}
        <form onSubmit={handleLogin} className="space-y-4">
          <input value={loginForm.user} onChange={e => setLoginForm({...loginForm, user: e.target.value})}
            placeholder="Përdoruesi" required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
          <input type="password" value={loginForm.pass} onChange={e => setLoginForm({...loginForm, pass: e.target.value})}
            placeholder="Fjalëkalimi" required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
          <button type="submit"
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-black py-4 rounded-xl transition-colors">
            Hyr si Admin
          </button>
        </form>
      </motion.div>
    </div>
  );

  const pendingBiz = businesses.filter(b => b.status === "pending").length;
  const pendingDrivers = deliveries.filter(d => d.status === "pending").length;
  const activeOrders = orders.filter(o => !["dorezuar","anuluar"].includes(o.status)).length;

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      {/* Header */}
      <div className="bg-gray-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield size={20} className="text-amber-400" />
            <span className="font-black text-lg">Admin Panel · TiliGo</span>
          </div>
          <button onClick={logout} className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-sm">
            <LogOut size={16} /> Dil
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Biznese Totale", value: businesses.length, emoji: "🏪", color: "blue" },
            { label: "Dorëzues", value: deliveries.length, emoji: "🛵", color: "green" },
            { label: "Porosi Aktive", value: activeOrders, emoji: "📦", color: "amber" },
            { label: "Aprovime Pritëse", value: pendingBiz + pendingDrivers, emoji: "⏳", color: "red" },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm text-center">
              <div className="text-3xl mb-2">{s.emoji}</div>
              <p className="font-black text-2xl text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {[
            { key: "businesses", label: `🏪 Biznese (${businesses.length})`, badge: pendingBiz },
            { key: "deliveries", label: `🛵 Dorëzuesit (${deliveries.length})`, badge: pendingDrivers },
            { key: "orders", label: `📦 Porositë (${orders.length})`, badge: activeOrders },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`relative px-4 py-3.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${tab === t.key ? "border-gray-900 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
              {t.label}
              {t.badge > 0 && (
                <span className="ml-1.5 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">{t.badge}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editItem && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="font-black text-lg mb-4">Ndrysho</h3>
              <div className="space-y-3">
                {Object.keys(editForm).filter(k => !["id","created_date","updated_date","created_by"].includes(k)).map(key => (
                  <div key={key}>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block capitalize">{key}</label>
                    {key === "image_url" ? (
                      <div>
                        <label className="flex items-center gap-2 border border-dashed border-gray-300 rounded-xl p-3 cursor-pointer hover:border-blue-400 text-sm text-gray-500">
                          <Upload size={16} />
                          {uploading ? "Duke ngarkuar..." : editForm.image_url ? "Ndrysho foton" : "Ngarko foto"}
                          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </label>
                        {editForm.image_url && <img src={editForm.image_url} className="mt-2 h-24 w-full object-cover rounded-xl" />}
                      </div>
                    ) : key === "status" && editItem._type === "business" ? (
                      <select value={editForm[key]} onChange={e => setEditForm({...editForm, [key]: e.target.value})}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        {["pending","approved","rejected"].map(s => <option key={s}>{s}</option>)}
                      </select>
                    ) : key === "status" && editItem._type === "delivery" ? (
                      <select value={editForm[key]} onChange={e => setEditForm({...editForm, [key]: e.target.value})}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        {["pending","approved","rejected"].map(s => <option key={s}>{s}</option>)}
                      </select>
                    ) : typeof editForm[key] === "boolean" ? (
                      <select value={String(editForm[key])} onChange={e => setEditForm({...editForm, [key]: e.target.value === "true"})}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="true">Po</option><option value="false">Jo</option>
                      </select>
                    ) : (
                      <input value={editForm[key] || ""} onChange={e => setEditForm({...editForm, [key]: e.target.value})}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setEditItem(null)}
                  className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 text-sm">Anulo</button>
                <button onClick={saveEdit}
                  className="flex-1 bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-gray-800 text-sm">Ruaj</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl h-20 animate-pulse" />)}</div>
        ) : (
          <>
            {/* BUSINESSES */}
            {tab === "businesses" && (
              <div className="space-y-3">
                {businesses.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">Nuk ka biznese</div>
                ) : businesses.map(biz => (
                  <div key={biz.id} className="bg-white rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-4">
                      {biz.image_url && <img src={biz.image_url} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-gray-900">{biz.name}</p>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${biz.status === "approved" ? "bg-green-100 text-green-700" : biz.status === "rejected" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"}`}>
                            {biz.status === "approved" ? "Aprovuar" : biz.status === "rejected" ? "Refuzuar" : "Pritje"}
                          </span>
                        </div>
                        <p className="text-gray-500 text-sm">{biz.phone} · {biz.address}</p>
                        <p className="text-gray-400 text-xs">{biz.category} · {biz.is_open ? "🟢 Hapur" : "🔴 Mbyllur"}</p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {biz.status === "pending" && (
                          <>
                            <button onClick={() => approveBiz(biz.id)}
                              className="w-8 h-8 bg-green-100 hover:bg-green-200 text-green-700 rounded-full flex items-center justify-center transition-colors" title="Aprovo">
                              <Check size={15} />
                            </button>
                            <button onClick={() => rejectBiz(biz.id)}
                              className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center transition-colors" title="Refuzo">
                              <X size={15} />
                            </button>
                          </>
                        )}
                        <button onClick={() => startEdit(biz, "business")}
                          className="w-8 h-8 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full flex items-center justify-center transition-colors">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => deleteBiz(biz.id)}
                          className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* DELIVERIES */}
            {tab === "deliveries" && (
              <div className="space-y-3">
                {deliveries.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">Nuk ka dorëzues</div>
                ) : deliveries.map(del => (
                  <div key={del.id} className="bg-white rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-4">
                      {del.image_url ? (
                        <img src={del.image_url} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-xl">🛵</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-gray-900">{del.name}</p>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${del.status === "approved" ? "bg-green-100 text-green-700" : del.status === "rejected" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"}`}>
                            {del.status === "approved" ? "Aprovuar" : del.status === "rejected" ? "Refuzuar" : "Pritje"}
                          </span>
                        </div>
                        <p className="text-gray-500 text-sm">{del.phone} · {del.vehicle === "motor" ? "🛵 Motor" : del.vehicle === "biciklete" ? "🚲 Biçikletë" : "🚗 Makinë"}</p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {del.status === "pending" && (
                          <>
                            <button onClick={() => approveDriver(del.id)}
                              className="w-8 h-8 bg-green-100 hover:bg-green-200 text-green-700 rounded-full flex items-center justify-center transition-colors">
                              <Check size={15} />
                            </button>
                            <button onClick={() => rejectDriver(del.id)}
                              className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center transition-colors">
                              <X size={15} />
                            </button>
                          </>
                        )}
                        <button onClick={() => startEdit(del, "delivery")}
                          className="w-8 h-8 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full flex items-center justify-center transition-colors">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => deleteDriver(del.id)}
                          className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ORDERS */}
            {tab === "orders" && (
              <div className="space-y-3">
                {orders.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">Nuk ka porosi</div>
                ) : orders.map(order => (
                  <div key={order.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div
                      className="p-4 flex items-center justify-between cursor-pointer"
                      onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-black text-amber-600">{order.order_code}</p>
                          <p className="text-gray-700 text-sm font-medium">{order.customer_name} · {order.business_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${STATUS_COLORS[order.status]}`}>
                          {STATUS_LABELS[order.status]}
                        </span>
                        <span className="font-black text-blue-700 text-sm">{order.total?.toFixed(2)}€</span>
                        {expandedOrder === order.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                      </div>
                    </div>
                    <AnimatePresence>
                      {expandedOrder === order.id && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          className="border-t border-gray-100 px-4 pb-4">
                          <div className="pt-3 space-y-2">
                            <p className="text-sm text-gray-600"><strong>Telefoni:</strong> {order.customer_phone}</p>
                            <p className="text-sm text-gray-600"><strong>Adresa:</strong> {order.customer_address}</p>
                            {order.delivery_name && <p className="text-sm text-gray-600"><strong>Dorëzuesi:</strong> {order.delivery_name}</p>}
                            <div className="pt-2">
                              {order.items?.map((item, i) => (
                                <p key={i} className="text-xs text-gray-500">{item.qty}x {item.name} – {(item.price * item.qty).toFixed(2)}€</p>
                              ))}
                            </div>
                            <div className="flex flex-wrap gap-2 pt-2">
                              {["e_re","pranuar","ne_pergatitje","gati_per_dorezim","ne_rruge","dorezuar","anuluar"].map(s => (
                                <button key={s} onClick={() => updateOrderStatus(order.id, s)}
                                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${order.status === s ? STATUS_COLORS[s] + " font-black" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                                  {STATUS_LABELS[s]}
                                </button>
                              ))}
                              <button onClick={() => deleteOrder(order.id)}
                                className="text-xs px-3 py-1.5 rounded-full font-medium bg-red-100 text-red-600 hover:bg-red-200 transition-colors flex items-center gap-1">
                                <Trash2 size={12} /> Fshi
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}