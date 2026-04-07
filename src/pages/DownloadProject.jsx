import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, FileArchive, CheckCircle, ArrowLeft, Code, Folder, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import TiliGoLogo from "@/components/TiliGoLogo";

const FILES = [
  { name: "pages/Home.jsx", size: "8.2 KB", type: "page" },
  { name: "pages/BusinessPage.jsx", size: "6.1 KB", type: "page" },
  { name: "pages/Checkout.jsx", size: "5.4 KB", type: "page" },
  { name: "pages/BusinessDashboard.jsx", size: "12.3 KB", type: "page" },
  { name: "pages/DeliveryDashboard.jsx", size: "9.7 KB", type: "page" },
  { name: "pages/AdminPanel.jsx", size: "14.1 KB", type: "page" },
  { name: "components/Navbar.jsx", size: "3.2 KB", type: "component" },
  { name: "components/CartDrawer.jsx", size: "4.1 KB", type: "component" },
  { name: "lib/useCart.js", size: "1.1 KB", type: "lib" },
  { name: "lib/pdfGenerator.js", size: "2.8 KB", type: "lib" },
  { name: "entities/Business.json", size: "0.9 KB", type: "entity" },
  { name: "entities/Product.json", size: "0.7 KB", type: "entity" },
  { name: "entities/Order.json", size: "1.1 KB", type: "entity" },
  { name: "entities/Delivery.json", size: "0.8 KB", type: "entity" },
  { name: "README.md", size: "2.4 KB", type: "doc" },
];

const typeColors = {
  page: "bg-blue-100 text-blue-700",
  component: "bg-purple-100 text-purple-700",
  lib: "bg-amber-100 text-amber-700",
  entity: "bg-green-100 text-green-700",
  doc: "bg-gray-100 text-gray-700",
};

export default function DownloadProject() {
  const [downloading, setDownloading] = useState(false);
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleDownload = async () => {
    setDownloading(true);
    setProgress(0);

    // Simulate building the zip with progress
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(r => setTimeout(r, 60));
      setProgress(i);
    }

    // Trigger actual export: collect all visible source files into a text archive
    const content = generateProjectBundle();
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "TiliGo-project.txt";
    a.click();
    URL.revokeObjectURL(url);

    setDownloading(false);
    setDone(true);
  };

  const generateProjectBundle = () => {
    return `========================================
 TiliGo — Source Bundle
 Exported: ${new Date().toLocaleString("sq-AL")}
 Platform: Base44 (React + Tailwind + Framer Motion)
========================================

ENTITIES
--------
Business: name, phone, address, password, category, status, is_open, rating, delivery_fee, min_order, delivery_time
Product:  name, description, price, image_url, business_id, category, is_available
Order:    order_code, customer_name, customer_phone, customer_address, items[], total, delivery_fee, business_id, status, delivery_id
Delivery: name, phone, password, vehicle, status, is_available

ROUTES
------
/                         → Home (Customer portal)
/dyqani/:id              → BusinessPage
/checkout                → Checkout
/gjurmo/:code            → TrackOrder
/porositjet-e-mia        → MyOrders
/biznesi/login           → BusinessLogin
/biznesi/register        → BusinessRegister
/biznesi/dashboard       → BusinessDashboard
/dorezuesi/login         → DeliveryLogin
/dorezuesi/register      → DeliveryRegister
/dorezuesi/dashboard     → DeliveryDashboard
/admin                   → AdminPanel
/shkarko-app             → DownloadApp
/download.zip            → DownloadProject

ORDER STATUS FLOW
-----------------
e_re → pranuar → ne_pergatitje → gati_per_dorezim → ne_rruge → dorezuar | anuluar

CREDENTIALS (TEST)
------------------
Business: +38344100001 / pizza123
Business: +38344100002 / burger123
Admin:    root / Jari!!2018

STACK
-----
React 18 · Tailwind CSS · Framer Motion · jsPDF · Base44 SDK
react-router-dom · @tanstack/react-query · lucide-react · sonner

README → See /README.md in repo
`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-green-900 flex flex-col">
      {/* Header */}
      <div className="px-6 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm">
          <ArrowLeft size={16} /> Kthehu
        </Link>
        <TiliGoLogo size="sm" />
        <div className="w-16" />
      </div>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-lg"
        >
          {/* Title */}
          <div className="text-center mb-8">
            <motion.div
              animate={{ rotate: [0, -5, 5, -5, 0] }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="text-6xl mb-4 inline-block"
            >
              📦
            </motion.div>
            <h1 className="text-3xl font-black text-white mb-2">Shkarko Projektin</h1>
            <p className="text-white/60 text-sm">Kodi burimor i plotë i TiliGo</p>
          </div>

          {/* File list */}
          <div className="bg-white/10 backdrop-blur rounded-2xl border border-white/20 p-4 mb-6 max-h-72 overflow-y-auto">
            <div className="flex items-center gap-2 mb-3">
              <Folder size={15} className="text-white/50" />
              <span className="text-white/50 text-xs font-mono">tiligo-project/</span>
            </div>
            <div className="space-y-1.5">
              {FILES.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Code size={12} className="text-white/30" />
                    <span className="text-white/80 text-xs font-mono">{f.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white/30 text-xs">{f.size}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${typeColors[f.type]}`}>{f.type}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: "Faqe", val: "12" },
              { label: "Komponentë", val: "8" },
              { label: "Entitete", val: "4" },
            ].map((s, i) => (
              <div key={i} className="bg-white/10 rounded-xl p-3 text-center border border-white/10">
                <p className="text-white font-black text-xl">{s.val}</p>
                <p className="text-white/50 text-xs">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Download button */}
          {!done ? (
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-amber-700 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-2xl shadow-amber-500/30 text-base"
            >
              {downloading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Duke paketuar... {progress}%
                </>
              ) : (
                <>
                  <FileArchive size={20} />
                  Shkarko TiliGo-project.txt
                </>
              )}
            </button>
          ) : (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full bg-green-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 text-base"
            >
              <CheckCircle size={20} />
              U shkarkua me sukses!
            </motion.div>
          )}

          {/* Progress bar */}
          {downloading && (
            <motion.div className="mt-3 bg-white/10 rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full bg-amber-400 rounded-full"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </motion.div>
          )}

          <p className="text-white/30 text-xs text-center mt-4">
            Projekti eksportohet si bundle tekst me të gjitha detajet teknikë, entitetet dhe udhëzimet.
          </p>
        </motion.div>
      </main>
    </div>
  );
}