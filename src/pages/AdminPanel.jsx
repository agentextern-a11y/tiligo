import { useState, useEffect } from "react";
import {
  Shield, LogOut, Check, X, Edit2, Trash2, ChevronDown, ChevronUp,
  Upload, Package, RefreshCw, Link as LinkIcon, Facebook, Instagram,
  Globe, Save, FileText, Store, Users, Bike, DollarSign, TrendingUp,
  Bell, Search, SlidersHorizontal, CircleDot, MessageSquare, Clock, AlertCircle
} from "lucide-react";
import StatementGenerator from "@/components/StatementGenerator";
import SelectDrawer from "@/components/SelectDrawer";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { isAdminAuthenticated, clearAdminSession } from "@/lib/adminAuth";

const W = "#009DE0";
const G = "#30C48D";

const STATUS_STYLE = {
  e_re:             { bg: "#EBF5FF", color: "#0066CC", dot: "#3B82F6", label: "New" },
  pranuar:          { bg: "#EDE9FE", color: "#5B21B6", dot: "#8B5CF6", label: "Accepted" },
  ne_pergatitje:    { bg: "#FEF3C7", color: "#92400E", dot: "#F59E0B", label: "Preparing" },
  gati_per_dorezim: { bg: "#FFF7ED", color: "#9A3412", dot: "#F97316", label: "Ready" },
  ne_rruge:         { bg: "#F3E8FF", color: "#6B21A8", dot: "#A855F7", label: "On the way" },
  dorezuar:         { bg: "#DCFCE7", color: "#14532D", dot: "#22C55E", label: "Delivered" },
  anuluar:          { bg: "#FEE2E2", color: "#7F1D1D", dot: "#EF4444", label: "Cancelled" },
};

const STATUS_LABELS = Object.fromEntries(Object.entries(STATUS_STYLE).map(([k, v]) => [k, v.label]));

export default function AdminPanel() {
  const [authed, setAuthed] = useState(() => isAdminAuthenticated());
  const [tickets, setTickets] = useState([]);
  const [tab, setTab] = useState("dashboard");
  const [businesses, setBusinesses] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [uploading, setUploading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [appSettings, setAppSettings] = useState([]);
  const [settingsForm, setSettingsForm] = useState({});
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [couponForm, setCouponForm] = useState({ code: "", description: "", discount_amount: "", uses_left: -1 });
  const [showCouponForm, setShowCouponForm] = useState(false);

  useEffect(() => {
    if (!authed) return;
    loadAll(); loadSettings(); loadCoupons(); loadTickets();
    const unsub = base44.entities.Order.subscribe(() => loadAll());
    return unsub;
  }, [authed]);

  const loadTickets = async () => { const d = await base44.entities.SupportTicket.list("-created_date", 100); setTickets(d); };
  const updateTicketStatus = async (id, status) => { await base44.entities.SupportTicket.update(id, { status }); loadTickets(); };
  const deleteTicket = async (id) => { if (!confirm("Delete ticket?")) return; await base44.entities.SupportTicket.delete(id); loadTickets(); };

  const loadCoupons = async () => { const d = await base44.entities.Coupon.list(); setCoupons(d); };
  const saveCoupon = async (e) => {
    e.preventDefault();
    await base44.entities.Coupon.create({ ...couponForm, code: couponForm.code.toUpperCase(), discount_amount: parseFloat(couponForm.discount_amount), uses_left: parseInt(couponForm.uses_left), is_active: true });
    setCouponForm({ code: "", description: "", discount_amount: "", uses_left: -1 });
    setShowCouponForm(false); loadCoupons();
  };
  const toggleCoupon = async (c) => { await base44.entities.Coupon.update(c.id, { is_active: !c.is_active }); loadCoupons(); };
  const deleteCoupon = async (id) => { if (!confirm("Delete coupon?")) return; await base44.entities.Coupon.delete(id); loadCoupons(); };

  const loadSettings = async () => {
    const data = await base44.entities.AppSettings.list();
    setAppSettings(data);
    const form = { facebook: "https://facebook.com/tiligoo", instagram: "", tiktok: "", website: "" };
    data.forEach(s => { form[s.key] = s.value; });
    setSettingsForm(form);
  };

  const saveSettings = async () => {
    setSettingsSaving(true);
    for (const key of ["facebook","instagram","tiktok","website"]) {
      const existing = appSettings.find(s => s.key === key);
      if (existing) await base44.entities.AppSettings.update(existing.id, { value: settingsForm[key] || "" });
      else await base44.entities.AppSettings.create({ key, value: settingsForm[key] || "", label: key });
    }
    await loadSettings(); setSettingsSaving(false); setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  const loadAll = async () => {
    setLoading(true);
    const [b, d, o] = await Promise.all([base44.entities.Business.list(), base44.entities.Delivery.list(), base44.entities.Order.list("-created_date", 200)]);
    setBusinesses(b); setDeliveries(d); setOrders(o); setLoading(false);
  };

  const logout = () => { clearAdminSession(); setAuthed(false); };
  const approveBiz = async (id) => { await base44.entities.Business.update(id, { status: "approved" }); loadAll(); };
  const rejectBiz = async (id) => { await base44.entities.Business.update(id, { status: "rejected" }); loadAll(); };
  const deleteBiz = async (id) => { if (!confirm("Delete?")) return; await base44.entities.Business.delete(id); loadAll(); };
  const approveDriver = async (id) => { await base44.entities.Delivery.update(id, { status: "approved" }); loadAll(); };
  const rejectDriver = async (id) => { await base44.entities.Delivery.update(id, { status: "rejected" }); loadAll(); };
  const deleteDriver = async (id) => { if (!confirm("Delete?")) return; await base44.entities.Delivery.delete(id); loadAll(); };
  const updateOrderStatus = async (id, status) => { await base44.entities.Order.update(id, { status }); loadAll(); };
  const deleteOrder = async (id) => { if (!confirm("Delete?")) return; await base44.entities.Order.delete(id); loadAll(); };
  const startEdit = (item, type) => { setEditItem({ ...item, _type: type }); setEditForm({ ...item }); };
  const saveEdit = async () => {
    const { _type, id } = editItem;
    if (_type === "business") await base44.entities.Business.update(id, editForm);
    else if (_type === "delivery") await base44.entities.Delivery.update(id, editForm);
    setEditItem(null); loadAll();
  };
  const handleImageUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setEditForm(f => ({ ...f, image_url: file_url })); setUploading(false);
  };

  if (!authed) {
    if (typeof window !== "undefined") window.location.replace("/administrator");
    return null;
  }

  const pendingBiz = businesses.filter(b => b.status === "pending").length;
  const pendingDrivers = deliveries.filter(d => d.status === "pending").length;
  const activeOrders = orders.filter(o => !["dorezuar","anuluar"].includes(o.status)).length;
  const todayRevenue = orders.filter(o => o.status === "dorezuar" && new Date(o.created_date).toDateString() === new Date().toDateString()).reduce((s, o) => s + (o.total || 0), 0);
  const filteredOrders = orders.filter(o => {
    const ms = !orderSearch || o.order_code?.toLowerCase().includes(orderSearch.toLowerCase()) || o.customer_name?.toLowerCase().includes(orderSearch.toLowerCase()) || o.business_name?.toLowerCase().includes(orderSearch.toLowerCase());
    return ms && (orderStatusFilter === "all" || o.status === orderStatusFilter);
  });

  const TABS = [
    { key: "dashboard", label: "Dashboard" },
    { key: "businesses", label: "Businesses", badge: pendingBiz },
    { key: "deliveries", label: "Couriers", badge: pendingDrivers },
    { key: "orders", label: "Orders", badge: activeOrders },
    { key: "coupons", label: "Coupons" },
    { key: "tickets", label: "Tickets", badge: tickets.filter(t => t.status === "open").length },
    { key: "statement", label: "Statement" },
    { key: "settings", label: "Settings" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#F5F7FA" }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: W + "15" }}>
              <Shield size={20} style={{ color: W }} />
            </div>
            <div>
              <span className="font-black text-gray-900">Admin Panel</span>
              <p className="text-xs text-gray-400">TiliGo Control Center</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={loadAll} className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors" title="Refresh">
              <RefreshCw size={15} className="text-gray-600" />
            </button>
            <button onClick={logout} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold px-3 py-2 rounded-xl transition-colors">
              <LogOut size={15}/> Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-2">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          {[
            { icon: <Store size={20}/>, label: "Businesses", value: businesses.length, sub: `${businesses.filter(b=>b.status==="approved").length} active`, color: W, bg: W+"15", badge: pendingBiz },
            { icon: <Bike size={20}/>, label: "Couriers", value: deliveries.length, sub: `${deliveries.filter(d=>d.status==="approved").length} approved`, color: G, bg: G+"18", badge: pendingDrivers },
            { icon: <Package size={20}/>, label: "Active Orders", value: activeOrders, sub: `${orders.length} total`, color: "#F59E0B", bg: "#FEF3C7" },
            { icon: <DollarSign size={20}/>, label: "Today's Revenue", value: `${todayRevenue.toFixed(0)}€`, sub: `${orders.filter(o=>o.status==="dorezuar"&&new Date(o.created_date).toDateString()===new Date().toDateString()).length} orders`, color: "#8B5CF6", bg: "#F3E8FF" },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="bg-white rounded-2xl p-5 shadow-sm relative overflow-hidden">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3" style={{ background: s.bg }}>
                <span style={{ color: s.color }}>{s.icon}</span>
              </div>
              <p className="font-black text-2xl text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
              {s.badge > 0 && <span className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">{s.badge} pending</span>}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-40">
        <div className="max-w-6xl mx-auto px-4 flex overflow-x-auto no-scrollbar">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="relative px-5 py-3.5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap"
              style={tab === t.key ? { borderColor: W, color: W } : { borderColor: "transparent", color: "#6B7280" }}>
              {t.label}
              {t.badge > 0 && <span className="ml-1.5 bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5 font-black">{t.badge}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editItem && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center px-4 pb-4 md:pb-0 backdrop-blur-sm">
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="font-bold text-xl text-gray-900 mb-5">Edit Record</h3>
              <div className="space-y-3">
                {Object.keys(editForm).filter(k => !["id","created_date","updated_date","created_by","_type"].includes(k)).map(key => (
                  <div key={key}>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">{key.replace(/_/g," ")}</label>
                    {key === "image_url" ? (
                      <div>
                        <label className="flex items-center gap-2 border-2 border-dashed border-gray-200 hover:border-blue-400 rounded-xl p-3 cursor-pointer text-sm text-gray-500 transition-colors">
                          <Upload size={16} style={{ color: W }} />
                          {uploading ? "Uploading..." : editForm.image_url ? "Change photo" : "Upload photo"}
                          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </label>
                        {editForm.image_url && <img src={editForm.image_url} className="mt-2 h-24 w-full object-cover rounded-xl" />}
                      </div>
                    ) : key === "status" ? (
                      <SelectDrawer value={editForm[key]} onChange={v => setEditForm({...editForm, [key]: v})} label="Status"
                        options={editItem._type === "business" || editItem._type === "delivery"
                          ? [{value:"pending",label:"Pending"},{value:"approved",label:"Approved"},{value:"rejected",label:"Rejected"}]
                          : Object.entries(STATUS_LABELS).map(([v,l]) => ({ value: v, label: l }))} />
                    ) : typeof editForm[key] === "boolean" ? (
                      <SelectDrawer value={String(editForm[key])} onChange={v => setEditForm({...editForm, [key]: v === "true"})}
                        label={key.replace(/_/g," ")} options={[{value:"true",label:"Yes"},{value:"false",label:"No"}]} />
                    ) : (
                      <input value={editForm[key] || ""} onChange={e => setEditForm({...editForm, [key]: e.target.value})}
                        className="w-full border border-gray-200 focus:border-blue-400 rounded-xl px-3 py-2.5 text-sm outline-none transition-colors" />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setEditItem(null)} className="flex-1 bg-gray-100 text-gray-700 font-bold py-3.5 rounded-xl text-sm hover:bg-gray-200">Cancel</button>
                <button onClick={saveEdit} className="flex-1 font-bold py-3.5 rounded-xl text-sm text-white shadow-sm" style={{ background: W }}>Save Changes</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto px-4 py-5 space-y-3">
        {loading ? (
          [1,2,3,4].map(i => <div key={i} className="bg-white rounded-2xl h-20 animate-pulse shadow-sm" />)
        ) : (
          <>
            {/* DASHBOARD */}
            {tab === "dashboard" && (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Package size={18} style={{ color: W }}/> Recent Orders</h3>
                  <div className="space-y-2">
                    {orders.slice(0, 6).map(o => {
                      const st = STATUS_STYLE[o.status];
                      return (
                        <div key={o.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                          <div>
                            <p className="font-bold text-amber-600 text-sm">#{o.order_code}</p>
                            <p className="text-gray-500 text-xs">{o.customer_name} · {o.business_name}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: st?.bg, color: st?.color }}>{st?.label}</span>
                            <p className="font-black text-sm text-gray-900 mt-0.5">{o.total?.toFixed(2)}€</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Bell size={18} style={{ color: "#F59E0B" }}/> Pending Approvals</h3>
                  {pendingBiz === 0 && pendingDrivers === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: "#DCFCE7" }}>
                        <Check size={22} style={{ color: G }} />
                      </div>
                      <p className="text-sm text-gray-500">All caught up!</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {businesses.filter(b => b.status === "pending").map(biz => (
                        <div key={biz.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
                          <div>
                            <p className="font-semibold text-gray-900 text-sm flex items-center gap-1.5"><Store size={14} style={{ color: W }}/> {biz.name}</p>
                            <p className="text-gray-500 text-xs">{biz.phone}</p>
                          </div>
                          <div className="flex gap-1.5">
                            <button onClick={() => approveBiz(biz.id)} className="w-8 h-8 bg-green-100 hover:bg-green-200 rounded-xl flex items-center justify-center transition-colors"><Check size={14} style={{ color: G }}/></button>
                            <button onClick={() => rejectBiz(biz.id)} className="w-8 h-8 bg-red-100 hover:bg-red-200 rounded-xl flex items-center justify-center transition-colors"><X size={14} className="text-red-500"/></button>
                          </div>
                        </div>
                      ))}
                      {deliveries.filter(d => d.status === "pending").map(del => (
                        <div key={del.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
                          <div>
                            <p className="font-semibold text-gray-900 text-sm flex items-center gap-1.5"><Bike size={14} style={{ color: G }}/> {del.name}</p>
                            <p className="text-gray-500 text-xs">{del.phone}</p>
                          </div>
                          <div className="flex gap-1.5">
                            <button onClick={() => approveDriver(del.id)} className="w-8 h-8 bg-green-100 hover:bg-green-200 rounded-xl flex items-center justify-center transition-colors"><Check size={14} style={{ color: G }}/></button>
                            <button onClick={() => rejectDriver(del.id)} className="w-8 h-8 bg-red-100 hover:bg-red-200 rounded-xl flex items-center justify-center transition-colors"><X size={14} className="text-red-500"/></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* BUSINESSES */}
            {tab === "businesses" && (
              <div className="space-y-2">
                {businesses.length === 0 ? <div className="text-center py-16 text-gray-400 bg-white rounded-2xl shadow-sm">No businesses yet</div>
                : businesses.map((biz, i) => (
                  <motion.div key={biz.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="flex items-center gap-4 p-4">
                      {biz.image_url
                        ? <img src={biz.image_url} className="w-14 h-14 rounded-2xl object-cover flex-shrink-0 border border-gray-100" />
                        : <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: W + "15" }}><Store size={22} style={{ color: W }}/></div>
                      }
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <p className="font-semibold text-gray-900">{biz.name}</p>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${biz.status === "approved" ? "bg-green-100 text-green-700" : biz.status === "rejected" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"}`}>
                            {biz.status === "approved" ? "Approved" : biz.status === "rejected" ? "Rejected" : "Pending"}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${biz.is_open ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                            {biz.is_open ? "Open" : "Closed"}
                          </span>
                        </div>
                        <p className="text-gray-500 text-sm">{biz.phone}</p>
                        <p className="text-gray-400 text-xs">{biz.address} · {biz.category}</p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {biz.status === "pending" && <>
                          <button onClick={() => approveBiz(biz.id)} className="w-9 h-9 bg-green-100 hover:bg-green-200 rounded-xl flex items-center justify-center transition-colors"><Check size={16} style={{ color: G }}/></button>
                          <button onClick={() => rejectBiz(biz.id)} className="w-9 h-9 bg-red-100 hover:bg-red-200 rounded-xl flex items-center justify-center transition-colors"><X size={16} className="text-red-500"/></button>
                        </>}
                        <button onClick={() => startEdit(biz, "business")} className="w-9 h-9 bg-blue-50 hover:bg-blue-100 rounded-xl flex items-center justify-center transition-colors"><Edit2 size={15} style={{ color: W }}/></button>
                        <button onClick={() => deleteBiz(biz.id)} className="w-9 h-9 bg-red-50 hover:bg-red-100 rounded-xl flex items-center justify-center transition-colors"><Trash2 size={15} className="text-red-500"/></button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* DELIVERIES */}
            {tab === "deliveries" && (
              <div className="space-y-2">
                {deliveries.length === 0 ? <div className="text-center py-16 text-gray-400 bg-white rounded-2xl shadow-sm">No couriers yet</div>
                : deliveries.map((del, i) => (
                  <motion.div key={del.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className="bg-white rounded-2xl shadow-sm p-4">
                    <div className="flex items-center gap-4">
                      {del.image_url
                        ? <img src={del.image_url} className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2 border-gray-100" />
                        : <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: G + "18" }}><Bike size={20} style={{ color: G }}/></div>
                      }
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <p className="font-semibold text-gray-900">{del.name}</p>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${del.status === "approved" ? "bg-green-100 text-green-700" : del.status === "rejected" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"}`}>
                            {del.status === "approved" ? "Approved" : del.status === "rejected" ? "Rejected" : "Pending"}
                          </span>
                        </div>
                        <p className="text-gray-500 text-sm">{del.phone}</p>
                        <p className="text-gray-400 text-xs">{del.vehicle} · {del.is_available ? <span className="text-green-600">Active</span> : "Inactive"}</p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {del.status === "pending" && <>
                          <button onClick={() => approveDriver(del.id)} className="w-9 h-9 bg-green-100 hover:bg-green-200 rounded-xl flex items-center justify-center transition-colors"><Check size={16} style={{ color: G }}/></button>
                          <button onClick={() => rejectDriver(del.id)} className="w-9 h-9 bg-red-100 hover:bg-red-200 rounded-xl flex items-center justify-center transition-colors"><X size={16} className="text-red-500"/></button>
                        </>}
                        <button onClick={() => startEdit(del, "delivery")} className="w-9 h-9 bg-blue-50 hover:bg-blue-100 rounded-xl flex items-center justify-center transition-colors"><Edit2 size={15} style={{ color: W }}/></button>
                        <button onClick={() => deleteDriver(del.id)} className="w-9 h-9 bg-red-50 hover:bg-red-100 rounded-xl flex items-center justify-center transition-colors"><Trash2 size={15} className="text-red-500"/></button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* ORDERS */}
            {tab === "orders" && (
              <div className="space-y-3">
                <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={orderSearch} onChange={e => setOrderSearch(e.target.value)}
                      placeholder="Search orders, customers, businesses..."
                      className="w-full border border-gray-200 focus:border-blue-400 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none transition-colors" />
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {["all", ...Object.keys(STATUS_LABELS)].map(s => (
                      <button key={s} onClick={() => setOrderStatusFilter(s)}
                        className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all whitespace-nowrap ${orderStatusFilter === s ? "text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                        style={orderStatusFilter === s ? { background: W } : {}}>
                        {s === "all" ? `All (${orders.length})` : STATUS_LABELS[s]}
                      </button>
                    ))}
                  </div>
                </div>
                {filteredOrders.length === 0 ? <div className="text-center py-16 text-gray-400 bg-white rounded-2xl shadow-sm">No orders found</div>
                : filteredOrders.map((order, i) => {
                  const st = STATUS_STYLE[order.status];
                  return (
                    <motion.div key={order.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                      className="bg-white rounded-2xl shadow-sm overflow-hidden">
                      <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: st?.bg }}>
                            <Package size={18} style={{ color: st?.dot }} />
                          </div>
                          <div>
                            <p className="font-bold text-amber-600">#{order.order_code}</p>
                            <p className="text-gray-700 text-sm">{order.customer_name} · <span className="text-gray-400">{order.business_name}</span></p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: st?.bg, color: st?.color }}>
                            <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5" style={{ background: st?.dot }} />{st?.label}
                          </span>
                          <span className="font-black text-gray-900 text-sm">{order.total?.toFixed(2)}€</span>
                          {expandedOrder === order.id ? <ChevronUp size={16} className="text-gray-400"/> : <ChevronDown size={16} className="text-gray-400"/>}
                        </div>
                      </div>
                      <AnimatePresence>
                        {expandedOrder === order.id && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                            className="border-t border-gray-100 px-4 pb-4">
                            <div className="pt-3 space-y-3">
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="bg-gray-50 rounded-xl p-3"><p className="text-gray-400 text-xs mb-0.5">Phone</p><a href={`tel:${order.customer_phone}`} className="font-bold" style={{ color: W }}>{order.customer_phone}</a></div>
                                <div className="bg-gray-50 rounded-xl p-3"><p className="text-gray-400 text-xs mb-0.5">Address</p><p className="font-semibold text-gray-900 text-xs">{order.customer_address}</p></div>
                              </div>
                              {order.delivery_name && <p className="text-sm text-gray-600 bg-purple-50 px-3 py-2 rounded-xl flex items-center gap-2"><Bike size={13} className="text-purple-500"/> <strong>Courier:</strong> {order.delivery_name}</p>}
                              {order.notes && <p className="text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded-xl">Note: {order.notes}</p>}
                              <div className="bg-gray-50 rounded-xl p-3">
                                {order.items?.map((item, i) => <div key={i} className="flex justify-between text-sm py-0.5"><span className="text-gray-600">{item.qty}× {item.name}</span><span className="font-semibold text-gray-900">{(item.price*item.qty).toFixed(2)}€</span></div>)}
                                <div className="border-t border-gray-200 mt-1 pt-1 flex justify-between font-black text-sm"><span>Total</span><span>{order.total?.toFixed(2)}€</span></div>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {Object.entries(STATUS_LABELS).map(([s, l]) => (
                                  <button key={s} onClick={() => updateOrderStatus(order.id, s)}
                                    className="text-xs px-3 py-1.5 rounded-full font-medium transition-all"
                                    style={order.status === s ? { background: STATUS_STYLE[s].bg, color: STATUS_STYLE[s].color, outline: `2px solid ${STATUS_STYLE[s].dot}`, outlineOffset: "2px" } : { background: "#F3F4F6", color: "#6B7280" }}>
                                    {l}
                                  </button>
                                ))}
                                <button onClick={() => deleteOrder(order.id)} className="text-xs px-3 py-1.5 rounded-full font-medium bg-red-100 text-red-600 hover:bg-red-200 flex items-center gap-1">
                                  <Trash2 size={11}/> Delete
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* COUPONS */}
            {tab === "coupons" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="font-bold text-gray-900">Coupons</h2>
                    <p className="text-gray-500 text-sm">{coupons.length} coupons total</p>
                  </div>
                  <button onClick={() => setShowCouponForm(!showCouponForm)}
                    className="flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-xl text-white transition-all" style={{ background: W }}>
                    + New Coupon
                  </button>
                </div>
                {showCouponForm && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-5 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4">Create Coupon</h3>
                    <form onSubmit={saveCoupon} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Code *</label>
                          <input value={couponForm.code} onChange={e => setCouponForm({...couponForm, code: e.target.value.toUpperCase()})} placeholder="e.g. SAVE10" required className="w-full border border-gray-200 focus:border-blue-400 rounded-xl px-3 py-2.5 text-sm outline-none font-mono tracking-widest" />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Discount (€) *</label>
                          <input type="number" step="0.01" min="0" value={couponForm.discount_amount} onChange={e => setCouponForm({...couponForm, discount_amount: e.target.value})} placeholder="2.50" required className="w-full border border-gray-200 focus:border-blue-400 rounded-xl px-3 py-2.5 text-sm outline-none" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Description</label>
                          <input value={couponForm.description} onChange={e => setCouponForm({...couponForm, description: e.target.value})} placeholder="e.g. Welcome discount" className="w-full border border-gray-200 focus:border-blue-400 rounded-xl px-3 py-2.5 text-sm outline-none" />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Uses (-1 = unlimited)</label>
                          <input type="number" value={couponForm.uses_left} onChange={e => setCouponForm({...couponForm, uses_left: e.target.value})} placeholder="-1" className="w-full border border-gray-200 focus:border-blue-400 rounded-xl px-3 py-2.5 text-sm outline-none" />
                        </div>
                      </div>
                      <div className="flex gap-3 pt-1">
                        <button type="button" onClick={() => setShowCouponForm(false)} className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl text-sm">Cancel</button>
                        <button type="submit" className="flex-1 font-bold py-3 rounded-xl text-sm text-white" style={{ background: W }}>Create Coupon</button>
                      </div>
                    </form>
                  </motion.div>
                )}
                {coupons.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
                    <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: W + "15" }}>
                      <FileText size={24} style={{ color: W }} />
                    </div>
                    <p className="text-gray-500">No coupons yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {coupons.map((c, i) => (
                      <motion.div key={c.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                        className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: c.is_active ? "#DCFCE7" : "#F3F4F6" }}>
                            <FileText size={16} style={{ color: c.is_active ? G : "#9CA3AF" }} />
                          </div>
                          <div>
                            <p className="font-black text-gray-900 font-mono tracking-wide">{c.code}</p>
                            <p className="text-sm text-gray-500">{c.description || ""} · <span className="font-bold" style={{ color: G }}>-{c.discount_amount?.toFixed(2)}€</span></p>
                            <p className="text-xs text-gray-400">{c.uses_left === -1 ? "Unlimited uses" : `${c.uses_left} uses left`}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => toggleCoupon(c)} className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${c.is_active ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                            {c.is_active ? "Active" : "Inactive"}
                          </button>
                          <button onClick={() => deleteCoupon(c.id)} className="w-8 h-8 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl flex items-center justify-center transition-colors"><Trash2 size={14}/></button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TICKETS */}
            {tab === "tickets" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <h2 className="font-bold text-gray-900">Support Tickets</h2>
                    <p className="text-gray-500 text-sm">{tickets.filter(t => t.status === "open").length} open · {tickets.length} total</p>
                  </div>
                </div>
                {tickets.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
                    <MessageSquare size={32} className="mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500">No support tickets yet</p>
                  </div>
                ) : tickets.map((t, i) => {
                  const priorityColor = { low: "#6B7280", medium: "#F59E0B", high: "#EF4444", urgent: "#DC2626" }[t.priority] || "#6B7280";
                  const statusColor = { open: "#3B82F6", in_progress: "#F59E0B", resolved: "#22C55E", closed: "#9CA3AF" }[t.status] || "#9CA3AF";
                  const statusBg = { open: "#EBF5FF", in_progress: "#FEF3C7", resolved: "#DCFCE7", closed: "#F3F4F6" }[t.status] || "#F3F4F6";
                  return (
                    <motion.div key={t.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                      className="bg-white rounded-2xl shadow-sm overflow-hidden">
                      <div className="h-1 w-full" style={{ background: priorityColor }} />
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <p className="font-bold text-gray-900">{t.subject}</p>
                              <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: statusBg, color: statusColor }}>{t.status}</span>
                              <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-gray-100 text-gray-600">{t.category}</span>
                            </div>
                            <p className="text-sm text-gray-600 font-medium">{t.name} · <a href={`mailto:${t.email}`} className="text-blue-600 hover:underline">{t.email}</a>{t.phone && ` · ${t.phone}`}</p>
                            <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{t.message}</p>
                            <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1"><Clock size={11}/> {new Date(t.created_date).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex gap-1.5 flex-wrap">
                          {["open","in_progress","resolved","closed"].map(s => (
                            <button key={s} onClick={() => updateTicketStatus(t.id, s)}
                              className="text-xs px-3 py-1.5 rounded-full font-medium transition-all"
                              style={t.status === s ? { background: statusBg, color: statusColor, outline: `2px solid ${statusColor}`, outlineOffset: "2px" } : { background: "#F3F4F6", color: "#6B7280" }}>
                              {s.replace("_"," ")}
                            </button>
                          ))}
                          <button onClick={() => deleteTicket(t.id)} className="text-xs px-3 py-1.5 rounded-full font-medium bg-red-100 text-red-600 hover:bg-red-200 flex items-center gap-1 ml-auto">
                            <Trash2 size={11}/> Delete
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {tab === "statement" && <StatementGenerator orders={orders} mode="admin" entityName="TiliGo Admin" isAdmin={true} />}

            {/* SETTINGS */}
            {tab === "settings" && (
              <div className="max-w-xl space-y-5">
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="font-bold text-gray-900 text-lg mb-1 flex items-center gap-2"><LinkIcon size={18} style={{ color: W }}/> Social Media</h3>
                  <p className="text-gray-400 text-sm mb-5">Manage TiliGo social media links.</p>
                  <div className="space-y-4">
                    {[
                      { key: "facebook", label: "Facebook", icon: <Facebook size={18} className="text-blue-600"/>, placeholder: "https://facebook.com/tiligoo" },
                      { key: "instagram", label: "Instagram", icon: <Instagram size={18} className="text-pink-500"/>, placeholder: "https://instagram.com/tiligo" },
                      { key: "tiktok", label: "TikTok", icon: <span className="text-base">🎵</span>, placeholder: "https://tiktok.com/@tiligo" },
                      { key: "website", label: "Website", icon: <Globe size={18} className="text-gray-600"/>, placeholder: "https://tiligo.app" },
                    ].map(({ key, label, icon, placeholder }) => (
                      <div key={key} className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">{icon}</div>
                        <div className="flex-1">
                          <label className="text-xs font-semibold text-gray-500 block mb-1">{label}</label>
                          <input value={settingsForm[key] || ""} onChange={e => setSettingsForm({...settingsForm, [key]: e.target.value})} placeholder={placeholder}
                            className="w-full border border-gray-200 focus:border-blue-400 rounded-xl px-3 py-2.5 text-sm outline-none transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={saveSettings}
                    className="mt-5 flex items-center gap-2 font-bold px-6 py-3 rounded-xl text-sm text-white transition-all"
                    style={{ background: settingsSaved ? G : W }}>
                    {settingsSaving ? "Saving..." : settingsSaved ? <><Check size={15}/> Saved!</> : <><Save size={15}/> Save Settings</>}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}