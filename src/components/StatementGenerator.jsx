import { useState } from "react";
import { FileText, Download, FileSpreadsheet, Calendar, TrendingUp, Package, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { generateStatementPDF } from "@/lib/statementPDF";

function exportXLS(orders, dateFrom, dateTo, label) {
  const filtered = filterByDate(orders, dateFrom, dateTo);
  const completed = filtered.filter(o => o.status === "dorezuar");
  const totalRevenue = completed.reduce((s, o) => s + (o.total || 0), 0);
  const totalDelivery = completed.reduce((s, o) => s + (o.delivery_fee || 1.5), 0);

  let html = `
    <html><head><meta charset="utf-8">
    <style>
      body { font-family: Arial, sans-serif; }
      table { border-collapse: collapse; width: 100%; }
      th { background: #030d1a; color: #39FF6B; padding: 8px; border: 1px solid #ccc; }
      td { padding: 6px 8px; border: 1px solid #ddd; font-size: 12px; }
      tr:nth-child(even) td { background: #f5f5f5; }
      .header { background: #030d1a; color: white; padding: 16px; margin-bottom: 12px; }
      .summary { margin: 10px 0; padding: 8px; background: #e8f5e9; border-left: 4px solid #39FF6B; }
    </style>
    </head><body>
    <div class="header">
      <h2 style="margin:0;color:#39FF6B">TiliGo · Pasqyra Financiare</h2>
      <p style="margin:4px 0;color:#aaa;font-size:13px">${label} · ${dateFrom} → ${dateTo}</p>
    </div>
    <div class="summary">
      <strong>Porosi Totale:</strong> ${filtered.length} &nbsp;|&nbsp;
      <strong>Dorëzuara:</strong> ${completed.length} &nbsp;|&nbsp;
      <strong>Të ardhura:</strong> ${totalRevenue.toFixed(2)}€ &nbsp;|&nbsp;
      <strong>Dërgesa:</strong> ${totalDelivery.toFixed(2)}€
    </div>
    <table>
      <thead><tr>
        <th>#</th><th>Kodi</th><th>Data</th><th>Klienti</th>
        <th>Biznesi</th><th>Dorëzuesi</th><th>Statusi</th>
        <th>Artikuj</th><th>Nëntotali</th><th>Dërgesa</th><th>Totali</th>
      </tr></thead>
      <tbody>`;

  const STATUS_AL = {
    e_re:"E Re", pranuar:"Pranuar", ne_pergatitje:"Në Përgatitje",
    gati_per_dorezim:"Gati", ne_rruge:"Në Rrugë", dorezuar:"Dorëzuar", anuluar:"Anuluar"
  };

  filtered.forEach((o, idx) => {
    const sub = (o.total || 0) - (o.delivery_fee || 1.5);
    const items = o.items?.map(i => `${i.qty}x ${i.name}`).join(", ") || "-";
    html += `<tr>
      <td>${idx + 1}</td>
      <td>${o.order_code || "-"}</td>
      <td>${new Date(o.created_date).toLocaleDateString("sq-AL")}</td>
      <td>${o.customer_name || "-"}</td>
      <td>${o.business_name || "-"}</td>
      <td>${o.delivery_name || "-"}</td>
      <td>${STATUS_AL[o.status] || o.status}</td>
      <td style="font-size:10px">${items}</td>
      <td>${sub.toFixed(2)}€</td>
      <td>${(o.delivery_fee || 1.5).toFixed(2)}€</td>
      <td><strong>${(o.total || 0).toFixed(2)}€</strong></td>
    </tr>`;
  });

  html += `</tbody></table></body></html>`;

  const blob = new Blob([html], { type: "application/vnd.ms-excel" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `TiliGo-Pasqyra-${dateFrom}-${dateTo}.xls`;
  a.click();
  URL.revokeObjectURL(url);
}

function filterByDate(orders, from, to) {
  if (!from && !to) return orders;
  const f = from ? new Date(from) : null;
  const t = to ? new Date(to + "T23:59:59") : null;
  return orders.filter(o => {
    const d = new Date(o.created_date);
    if (f && d < f) return false;
    if (t && d > t) return false;
    return true;
  });
}

// mode: "business" | "delivery" | "admin"
export default function StatementGenerator({ orders = [], mode = "business", entityName = "TiliGo", isAdmin = false }) {
  const today = new Date().toISOString().split("T")[0];
  const monthStart = today.slice(0, 7) + "-01";
  const [dateFrom, setDateFrom] = useState(monthStart);
  const [dateTo, setDateTo] = useState(today);
  const [generating, setGenerating] = useState(false);

  const filtered = filterByDate(orders, dateFrom, dateTo);
  const completed = filtered.filter(o => o.status === "dorezuar");
  const cancelled = filtered.filter(o => o.status === "anuluar");
  const active = filtered.filter(o => !["dorezuar","anuluar"].includes(o.status));
  const totalRevenue = completed.reduce((s, o) => s + (o.total || 0), 0);
  const totalDelivery = completed.reduce((s, o) => s + (o.delivery_fee || 1.5), 0);
  const avgOrder = completed.length ? totalRevenue / completed.length : 0;
  const netRevenue = mode === "delivery" ? totalDelivery : totalRevenue;

  const handlePDF = async () => {
    setGenerating(true);
    await generateStatementPDF({ orders: filtered, dateFrom, dateTo, mode, entityName });
    setGenerating(false);
  };

  const handleXLS = () => {
    exportXLS(orders, dateFrom, dateTo, entityName);
  };

  const quickRanges = [
    { label: "Sot", from: today, to: today },
    { label: "7 ditë", from: new Date(Date.now() - 7*864e5).toISOString().split("T")[0], to: today },
    { label: "Muaji", from: monthStart, to: today },
    { label: "30 ditë", from: new Date(Date.now() - 30*864e5).toISOString().split("T")[0], to: today },
  ];

  return (
    <div className="space-y-5">
      {/* Date Picker Card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl overflow-hidden"
        style={{ background: 'linear-gradient(160deg,#020c1b 0%,#0a2a4a 50%,#001830 100%)', border: '1px solid rgba(0,191,255,0.25)' }}>
        {/* Header */}
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(0,191,255,0.15)', border: '1px solid rgba(0,191,255,0.35)' }}>
              <FileText size={18} style={{ color: '#00BFFF' }} />
            </div>
            <div>
              <h3 className="font-black text-base" style={{ color: '#fff' }}>Pasqyra Financiare</h3>
              <p className="text-xs" style={{ color: 'rgba(125,211,252,0.7)' }}>Zgjidhni periudhën kohore</p>
            </div>
          </div>

          {/* Quick ranges */}
          <div className="flex gap-2 flex-wrap mb-4">
            {quickRanges.map(r => (
              <button key={r.label} onClick={() => { setDateFrom(r.from); setDateTo(r.to); }}
                className="text-xs font-bold px-3 py-1.5 rounded-full transition-all"
                style={dateFrom === r.from && dateTo === r.to
                  ? { background: 'linear-gradient(135deg,#39FF6B,#00BFFF)', color: '#020c1b' }
                  : { background: 'rgba(255,255,255,0.08)', color: 'rgba(125,211,252,0.8)', border: '1px solid rgba(0,191,255,0.2)' }}>
                {r.label}
              </button>
            ))}
          </div>

          {/* Date inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wide block mb-1.5" style={{ color: 'rgba(125,211,252,0.6)' }}>
                <Calendar size={10} className="inline mr-1" />Nga
              </label>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                className="w-full rounded-2xl px-3 py-2.5 text-sm outline-none"
                style={{ background: 'rgba(0,40,80,0.7)', border: '1px solid rgba(0,191,255,0.3)', color: '#e0f2fe' }} />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wide block mb-1.5" style={{ color: 'rgba(125,211,252,0.6)' }}>
                <Calendar size={10} className="inline mr-1" />Deri
              </label>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                className="w-full rounded-2xl px-3 py-2.5 text-sm outline-none"
                style={{ background: 'rgba(0,40,80,0.7)', border: '1px solid rgba(0,191,255,0.3)', color: '#e0f2fe' }} />
            </div>
          </div>
        </div>

        {/* Accent divider */}
        <div style={{ height: 2, background: 'linear-gradient(90deg,#39FF6B,#00BFFF,transparent)' }} />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0" style={{ borderBottom: '1px solid rgba(0,60,120,0.4)' }}>
          {[
            { label: "Porosi", value: filtered.length, icon: "📦", color: '#60A5FA' },
            { label: mode === "delivery" ? "Fitim" : "Të ardhura", value: `${netRevenue.toFixed(2)}€`, icon: "💰", color: '#39FF6B' },
            { label: "Dorëzuara", value: completed.length, icon: "✅", color: '#39FF6B' },
            { label: "Anuluara", value: cancelled.length, icon: "❌", color: '#F87171' },
          ].map((s, i) => (
            <div key={i} className="px-4 py-3 text-center" style={{ borderRight: i < 3 ? '1px solid rgba(0,60,120,0.3)' : 'none' }}>
              <div className="text-xl mb-0.5">{s.icon}</div>
              <p className="font-black text-lg" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs" style={{ color: 'rgba(125,211,252,0.6)' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Download buttons */}
        <div className="p-4 flex flex-col sm:flex-row gap-2.5">
          <button onClick={handlePDF} disabled={generating || filtered.length === 0}
            className="flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-black text-sm transition-all active:scale-95 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#39FF6B,#00BFFF)', color: '#020c1b', boxShadow: '0 0 20px rgba(57,255,107,0.3)' }}>
            <Download size={16} />
            {generating ? "Duke gjeneruar..." : "Shkarko PDF"}
          </button>
          {isAdmin && (
            <button onClick={handleXLS} disabled={filtered.length === 0}
              className="flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-black text-sm transition-all active:scale-95 disabled:opacity-50"
              style={{ background: 'rgba(34,197,94,0.2)', color: '#4ADE80', border: '1.5px solid rgba(34,197,94,0.4)' }}>
              <FileSpreadsheet size={16} />
              Shkarko XLS
            </button>
          )}
        </div>
      </motion.div>

      {/* Transaction list preview */}
      {filtered.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-3xl overflow-hidden"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--divider)' }}>
            <h4 className="font-black text-sm flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
              <TrendingUp size={15} style={{ color: '#00BFFF' }} />
              Transaksionet · {filtered.length}
            </h4>
            <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: 'rgba(57,255,107,0.15)', color: '#39FF6B' }}>
              Total: {netRevenue.toFixed(2)}€
            </span>
          </div>

          {/* Summary rows */}
          <div className="divide-y" style={{ borderColor: 'var(--divider)' }}>
            {/* Average */}
            <div className="px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(0,191,255,0.12)' }}>
                  <Package size={14} style={{ color: '#00BFFF' }} />
                </div>
                <div>
                  <p className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>Mesatare për porosi</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Bazuar në {completed.length} porosi të dorëzuara</p>
                </div>
              </div>
              <span className="font-black text-sm" style={{ color: '#00BFFF' }}>{avgOrder.toFixed(2)}€</span>
            </div>

            {/* Transaction rows - last 10 */}
            {filtered.slice(0, 15).map((o) => {
              const isDone = o.status === "dorezuar";
              const isCancelled = o.status === "anuluar";
              const amount = mode === "delivery" ? o.delivery_fee || 1.5 : o.total || 0;
              return (
                <div key={o.id} className="px-5 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: isDone ? 'rgba(57,255,107,0.12)' : isCancelled ? 'rgba(239,68,68,0.12)' : 'rgba(251,191,36,0.12)' }}>
                    {isDone ? <CheckCircle2 size={14} style={{ color: '#39FF6B' }} /> :
                     isCancelled ? <span style={{ color: '#F87171', fontSize: 12 }}>✕</span> :
                     <Package size={14} style={{ color: '#FBBF24' }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black" style={{ color: '#FBBF24' }}>#{o.order_code}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                      {o.customer_name} · {new Date(o.created_date).toLocaleDateString("sq-AL")}
                    </p>
                  </div>
                  <span className="font-black text-sm" style={{ color: isCancelled ? '#F87171' : isDone ? '#39FF6B' : '#FBBF24' }}>
                    {isCancelled ? "-" : "+"}{amount.toFixed(2)}€
                  </span>
                </div>
              );
            })}
            {filtered.length > 15 && (
              <div className="px-5 py-3 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                +{filtered.length - 15} transaksione të tjera · shkarko PDF/XLS për listën e plotë
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}