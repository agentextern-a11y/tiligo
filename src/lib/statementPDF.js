import jsPDF from "jspdf";

async function fetchBase64(url) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch { return null; }
}

const STATUS_AL = {
  e_re:"E Re", pranuar:"Pranuar", ne_pergatitje:"Në Përgatitje",
  gati_per_dorezim:"Gati", ne_rruge:"Në Rrugë", dorezuar:"Dorëzuar", anuluar:"Anuluar"
};

export async function generateStatementPDF({ orders, dateFrom, dateTo, mode, entityName }) {
  const doc = new jsPDF({ format: "a4", unit: "mm" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const MARGIN = 14;

  // ── BG ──
  doc.setFillColor(3, 13, 26);
  doc.rect(0, 0, W, H, "F");

  // ── HEADER GRADIENT BAR ──
  doc.setFillColor(0, 50, 120);
  doc.rect(0, 0, W, 40, "F");
  doc.setFillColor(3, 13, 26);
  doc.rect(0, 30, W, 12, "F"); // blend bottom

  // Accent line
  doc.setFillColor(57, 255, 107);
  doc.rect(0, 40, W * 0.55, 2.5, "F");
  doc.setFillColor(0, 191, 255);
  doc.rect(W * 0.55, 40, W * 0.45, 2.5, "F");

  // Logo
  const logoData = await fetchBase64("https://media.base44.com/images/public/69d519273be8cf966434f77a/9ff7c0a46_IMG_0106.jpeg");
  if (logoData) doc.addImage(logoData, "JPEG", MARGIN, 8, 22, 22);

  // Brand
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text("TiliGo", logoData ? MARGIN + 26 : W / 2, 19, { align: logoData ? "left" : "center" });
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150, 210, 255);
  doc.text("Express Delivery · Kosovo", logoData ? MARGIN + 26 : W / 2, 26, { align: logoData ? "left" : "center" });

  // Right side: doc type
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(57, 255, 107);
  doc.text("PASQYRA FINANCIARE", W - MARGIN, 17, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 180, 220);
  doc.text(`${entityName}`, W - MARGIN, 24, { align: "right" });
  doc.text(`Periudha: ${dateFrom} → ${dateTo}`, W - MARGIN, 30, { align: "right" });

  // ── META BOX ──
  let y = 52;
  doc.setFillColor(8, 22, 48);
  doc.roundedRect(MARGIN, y, W - MARGIN * 2, 18, 3, 3, "F");
  doc.setDrawColor(0, 80, 160);
  doc.setLineWidth(0.3);
  doc.roundedRect(MARGIN, y, W - MARGIN * 2, 18, 3, 3, "S");

  const completedOrders = orders.filter(o => o.status === "dorezuar");
  const cancelledOrders = orders.filter(o => o.status === "anuluar");
  const totalRevenue = completedOrders.reduce((s, o) => s + (o.total || 0), 0);
  const totalDelivery = completedOrders.reduce((s, o) => s + (o.delivery_fee || 1.5), 0);
  const netRevenue = mode === "delivery" ? totalDelivery : totalRevenue;
  const avgOrder = completedOrders.length ? totalRevenue / completedOrders.length : 0;

  const metaItems = [
    ["Porosi Totale", String(orders.length)],
    ["Dorëzuara", String(completedOrders.length)],
    ["Anuluara", String(cancelledOrders.length)],
    [mode === "delivery" ? "Fitimi Total" : "Të ardhura", netRevenue.toFixed(2) + "€"],
    ["Mesatare/Porosi", avgOrder.toFixed(2) + "€"],
    ["Dërgesa Totale", totalDelivery.toFixed(2) + "€"],
  ];

  const colW = (W - MARGIN * 2) / metaItems.length;
  metaItems.forEach(([label, val], i) => {
    const cx = MARGIN + i * colW + colW / 2;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(57, 255, 107);
    doc.text(val, cx, y + 8, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 180, 220);
    doc.text(label, cx, y + 14, { align: "center" });
  });

  y += 26;

  // ── TABLE HEADER ──
  const cols = mode === "admin"
    ? ["#", "Kodi", "Data", "Klienti", "Biznesi", "Dorëzuesi", "Statusi", "Totali"]
    : ["#", "Kodi", "Data", "Klienti", mode === "delivery" ? "Biznesi" : "Adresa", "Statusi", mode === "delivery" ? "Fitimi" : "Totali"];

  const colWidths = mode === "admin"
    ? [8, 22, 20, 34, 32, 28, 22, 20]
    : [8, 24, 22, 44, 52, 22, 24];

  // Header row
  doc.setFillColor(0, 40, 100);
  doc.roundedRect(MARGIN, y, W - MARGIN * 2, 8, 1.5, 1.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(0, 191, 255);

  let cx = MARGIN + 2;
  cols.forEach((col, i) => {
    doc.text(col, cx, y + 5.5);
    cx += colWidths[i];
  });
  y += 10;

  // ── ROWS ──
  orders.forEach((order, idx) => {
    // Page break
    if (y > H - 28) {
      doc.addPage();
      doc.setFillColor(3, 13, 26);
      doc.rect(0, 0, W, H, "F");
      y = 14;
    }

    const isEven = idx % 2 === 0;
    if (isEven) {
      doc.setFillColor(8, 22, 48);
      doc.rect(MARGIN, y - 2.5, W - MARGIN * 2, 7.5, "F");
    }

    const isDone = order.status === "dorezuar";
    const isCancelled = order.status === "anuluar";
    const amount = mode === "delivery"
      ? (order.delivery_fee || 1.5)
      : (order.total || 0);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);

    const rowData = mode === "admin"
      ? [
          String(idx + 1),
          order.order_code || "-",
          new Date(order.created_date).toLocaleDateString("sq-AL"),
          (order.customer_name || "-").slice(0, 16),
          (order.business_name || "-").slice(0, 14),
          (order.delivery_name || "-").slice(0, 12),
          STATUS_AL[order.status] || order.status,
          (order.total || 0).toFixed(2) + "€",
        ]
      : [
          String(idx + 1),
          order.order_code || "-",
          new Date(order.created_date).toLocaleDateString("sq-AL"),
          (order.customer_name || "-").slice(0, 18),
          mode === "delivery"
            ? (order.business_name || "-").slice(0, 20)
            : (order.customer_address || "-").slice(0, 20),
          STATUS_AL[order.status] || order.status,
          amount.toFixed(2) + "€",
        ];

    cx = MARGIN + 2;
    rowData.forEach((val, i) => {
      const isLast = i === rowData.length - 1;
      if (isLast) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(isDone ? 57 : isCancelled ? 239 : 251, isDone ? 255 : isCancelled ? 68 : 191, isDone ? 107 : isCancelled ? 68 : 36);
      } else if (i === 1) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(251, 191, 36);
      } else {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(180, 210, 240);
      }
      doc.text(val, cx, y + 2.5);
      cx += colWidths[i];
    });

    y += 8;
  });

  // ── TOTALS ROW ──
  y += 3;
  doc.setDrawColor(0, 80, 160);
  doc.setLineWidth(0.4);
  doc.line(MARGIN, y, W - MARGIN, y);
  y += 5;

  doc.setFillColor(0, 50, 100);
  doc.roundedRect(MARGIN, y, W - MARGIN * 2, 10, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text("TOTALI I PERIUDHËS:", MARGIN + 3, y + 6.5);
  doc.setTextColor(57, 255, 107);
  doc.setFontSize(12);
  doc.text(`${netRevenue.toFixed(2)}€`, W - MARGIN - 3, y + 6.5, { align: "right" });

  // ── FOOTER ──
  const footY = H - 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 160, 200);
  doc.text(`TiliGo · Pasqyrë e gjeneruar: ${new Date().toLocaleString("sq-AL")}`, MARGIN, footY);
  doc.text("Dokument zyrtar financiar", W - MARGIN, footY, { align: "right" });

  // Bottom gradient bar
  doc.setFillColor(57, 255, 107);
  doc.rect(0, H - 4, W * 0.5, 4, "F");
  doc.setFillColor(0, 191, 255);
  doc.rect(W * 0.5, H - 4, W * 0.5, 4, "F");

  doc.save(`TiliGo-Pasqyra-${dateFrom}-${dateTo}.pdf`);
}