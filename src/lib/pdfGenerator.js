import jsPDF from "jspdf";

// Fetch image as base64 for embedding in PDF
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
  } catch {
    return null;
  }
}

export async function generateOrderPDF(order) {
  const doc = new jsPDF({ format: "a5", unit: "mm" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  // ── BACKGROUND ────────────────────────────────────────────
  // Deep navy base
  doc.setFillColor(3, 13, 26);
  doc.rect(0, 0, W, H, "F");

  // Subtle card area (slightly lighter)
  doc.setFillColor(8, 22, 48);
  doc.roundedRect(6, 6, W - 12, H - 12, 6, 6, "F");

  // ── HEADER ────────────────────────────────────────────────
  // Gradient header bar (simulate with two rects)
  doc.setFillColor(0, 102, 255);
  doc.roundedRect(6, 6, W - 12, 32, 6, 6, "F");
  doc.setFillColor(3, 13, 26);
  doc.rect(6, 28, W - 12, 10, "F"); // square bottom corners

  // Decorative accent strip
  doc.setFillColor(57, 255, 107);
  doc.rect(6, 36, (W - 12) * 0.4, 2, "F");
  doc.setFillColor(0, 191, 255);
  doc.rect(6 + (W - 12) * 0.4, 36, (W - 12) * 0.6, 2, "F");

  // Try to embed logo image
  const logoUrl = "https://media.base44.com/images/public/69d519273be8cf966434f77a/9ff7c0a46_IMG_0106.jpeg";
  const logoData = await fetchBase64(logoUrl);
  if (logoData) {
    // Small square logo on left side of header
    doc.addImage(logoData, "JPEG", 10, 9, 18, 18);
  }

  // Brand name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text("TiliGo", logoData ? 32 : W / 2, 20, { align: logoData ? "left" : "center" });

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150, 200, 255);
  doc.text("Express Delivery · Kosovo", logoData ? 32 : W / 2, 28, { align: logoData ? "left" : "center" });

  // ── ORDER CODE BOX ────────────────────────────────────────
  doc.setFillColor(251, 191, 36);
  doc.roundedRect(10, 44, W - 20, 14, 3, 3, "F");
  doc.setTextColor(3, 13, 26);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(`FATURA  #${order.order_code}`, W / 2, 53, { align: "center" });

  // ── DATE & STATUS ROW ─────────────────────────────────────
  let y = 68;
  const dateStr = new Date(order.created_date || Date.now()).toLocaleString("sq-AL", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 180, 220);
  doc.text(dateStr, 12, y);
  doc.setTextColor(57, 255, 107);
  doc.text("● Dorëzuar me Sukses", W - 12, y, { align: "right" });

  y += 4;
  // Divider
  doc.setDrawColor(0, 60, 120);
  doc.setLineWidth(0.3);
  doc.line(10, y, W - 10, y);

  // ── CLIENT INFO ────────────────────────────────────────────
  y += 7;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(0, 191, 255);
  doc.text("KLIENTI", 12, y);

  y += 5;
  const clientFields = [
    ["Emri", order.customer_name],
    ["Telefoni", order.customer_phone],
    ["Adresa", order.customer_address],
    ["Biznesi", order.business_name],
    ...(order.delivery_name ? [["Dorëzuesi", order.delivery_name]] : []),
  ];

  clientFields.forEach(([label, value]) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(125, 200, 230);
    doc.text(label + ":", 12, y);
    doc.setTextColor(224, 242, 254);
    doc.setFont("helvetica", "bold");
    const text = String(value || "-");
    const maxWidth = W - 12 - 38;
    doc.text(text, 40, y, { maxWidth });
    y += 6;
  });

  y += 2;
  doc.setLineWidth(0.3);
  doc.setDrawColor(0, 60, 120);
  doc.line(10, y, W - 10, y);

  // ── ITEMS TABLE ────────────────────────────────────────────
  y += 7;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(0, 191, 255);
  doc.text("ARTIKUJT", 12, y);

  y += 4;
  // Table header
  doc.setFillColor(0, 40, 80);
  doc.roundedRect(10, y, W - 20, 7, 1, 1, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(150, 210, 255);
  doc.text("Artikulli", 13, y + 4.5);
  doc.text("Sasia", W - 40, y + 4.5, { align: "center" });
  doc.text("Çmimi", W - 12, y + 4.5, { align: "right" });
  y += 9;

  order.items?.forEach((item, idx) => {
    // Alternating row bg
    if (idx % 2 === 0) {
      doc.setFillColor(8, 28, 58);
      doc.rect(10, y - 3, W - 20, 7, "F");
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(200, 230, 255);
    doc.text(item.name || "-", 13, y + 1, { maxWidth: W - 55 });
    doc.setTextColor(180, 200, 240);
    doc.text(`${item.qty}x`, W - 40, y + 1, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.setTextColor(224, 242, 254);
    doc.text(`${(item.price * item.qty).toFixed(2)}€`, W - 12, y + 1, { align: "right" });
    y += 7;
  });

  y += 2;
  doc.setLineWidth(0.3);
  doc.setDrawColor(0, 80, 160);
  doc.line(10, y, W - 10, y);
  y += 5;

  // ── TOTALS ─────────────────────────────────────────────────
  const subtotal = order.total - (order.delivery_fee || 1.5);

  const rows = [
    ["Nëntotali", subtotal.toFixed(2) + "€", false],
    ["Dërgesa", (order.delivery_fee || 1.5).toFixed(2) + "€", false],
  ];
  if (order.priority) rows.splice(1, 0, ["Prioritet (+)", "1.50€", false]);

  rows.forEach(([label, val]) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 180, 220);
    doc.text(label, 12, y);
    doc.setTextColor(200, 230, 255);
    doc.text(val, W - 12, y, { align: "right" });
    y += 6;
  });

  // Total row
  y += 1;
  doc.setFillColor(0, 50, 100);
  doc.roundedRect(10, y - 4, W - 20, 11, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(57, 255, 107);
  doc.text("TOTALI", 14, y + 3.5);
  doc.text(`${order.total?.toFixed(2)}€`, W - 12, y + 3.5, { align: "right" });
  y += 14;

  // Payment method
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 180, 220);
  doc.text("Pagesa: ", 12, y);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(200, 230, 255);
  doc.text("Cash 💵", 12 + 16, y);

  // ── FOOTER ─────────────────────────────────────────────────
  const footerY = H - 18;
  doc.setFillColor(3, 13, 26);
  doc.rect(6, footerY - 4, W - 12, 18, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(57, 255, 107);
  doc.text("Faleminderit që zgjodhët TiliGo! 💚", W / 2, footerY + 1, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 160, 200);
  doc.text("Shërbimi i dorëzimit nr. 1 në Kosovë", W / 2, footerY + 7, { align: "center" });

  // Bottom accent line
  doc.setFillColor(57, 255, 107);
  doc.rect(6, H - 8, (W - 12) * 0.5, 1.5, "F");
  doc.setFillColor(0, 191, 255);
  doc.rect(6 + (W - 12) * 0.5, H - 8, (W - 12) * 0.5, 1.5, "F");

  doc.save(`TiliGo-${order.order_code}.pdf`);
}