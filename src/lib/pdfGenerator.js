import jsPDF from "jspdf";

export function generateOrderPDF(order) {
  const doc = new jsPDF({ format: "a5" });
  const pageW = doc.internal.pageSize.getWidth();

  // Header gradient bar
  doc.setFillColor(29, 78, 216);
  doc.rect(0, 0, pageW, 28, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("TiliGo", pageW / 2, 12, { align: "center" });
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Porosia Juaj", pageW / 2, 20, { align: "center" });
  doc.text("tiligo.app · Prishtine, Kosove", pageW / 2, 26, { align: "center" });

  // Order code box
  doc.setFillColor(245, 158, 11);
  doc.roundedRect(10, 33, pageW - 20, 16, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`Kodi i Porosise: ${order.order_code}`, pageW / 2, 44, { align: "center" });

  let y = 58;
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Detajet e Porosise", 12, y);
  y += 6;
  doc.setDrawColor(220, 220, 220);
  doc.line(12, y, pageW - 12, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  const details = [
    ["Emri:", order.customer_name],
    ["Telefoni:", order.customer_phone],
    ["Adresa:", order.customer_address],
    ["Biznesi:", order.business_name],
    ["Data:", new Date().toLocaleString("sq-AL")],
    ["Pagesa:", "Cash"],
  ];

  details.forEach(([label, val]) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, 12, y);
    doc.setFont("helvetica", "normal");
    doc.text(val || "-", 45, y);
    y += 7;
  });

  y += 4;
  doc.setFont("helvetica", "bold");
  doc.text("Artikujt:", 12, y);
  y += 6;
  doc.line(12, y, pageW - 12, y);
  y += 6;

  order.items?.forEach((item) => {
    doc.setFont("helvetica", "normal");
    doc.text(`${item.qty}x ${item.name}`, 12, y);
    doc.text(`${(item.price * item.qty).toFixed(2)}EUR`, pageW - 12, y, { align: "right" });
    y += 7;
  });

  y += 3;
  doc.line(12, y, pageW - 12, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.text("Dergesa:", 12, y);
  doc.text(`${(order.delivery_fee || 1.5).toFixed(2)}EUR`, pageW - 12, y, { align: "right" });
  y += 7;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("TOTALI:", 12, y);
  doc.setTextColor(29, 78, 216);
  doc.text(`${order.total?.toFixed(2)}EUR`, pageW - 12, y, { align: "right" });

  y += 14;
  doc.setFillColor(240, 244, 248);
  doc.roundedRect(10, y, pageW - 20, 20, 3, 3, "F");
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Faleminderit per porosine! Porosia juaj eshte duke u pergatitur.", pageW / 2, y + 8, { align: "center" });
  doc.text("Per cdo pyetje: +383 44 000 000", pageW / 2, y + 15, { align: "center" });

  doc.save(`TiliGo-Porosia-${order.order_code}.pdf`);
}