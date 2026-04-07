import { Link } from "react-router-dom";
import { ArrowLeft, Smartphone, Download } from "lucide-react";
import { motion } from "framer-motion";
import TiliGoLogo from "@/components/TiliGoLogo";

export default function DownloadApp() {
  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <div className="bg-white shadow-sm border-b border-gray-100 px-4 h-14 flex items-center gap-3">
        <Link to="/" className="text-gray-500 hover:text-gray-700"><ArrowLeft size={22} /></Link>
        <TiliGoLogo size="sm" />
      </div>

      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <TiliGoLogo size="xl" className="justify-center mb-6" />
          <h1 className="text-3xl font-black text-gray-900 mb-3">Shkarko TiliGo</h1>
          <p className="text-gray-500 mb-10">Instalo aplikacionin dhe porosit nga kudo!</p>

          <div className="space-y-4">
            {/* Android APK */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center">
                  <span className="text-3xl">🤖</span>
                </div>
                <div className="text-left">
                  <h3 className="font-black text-gray-900 text-lg">Android APK</h3>
                  <p className="text-gray-500 text-sm">TiliGo v1.0 · 15.2 MB</p>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-left">
                <p className="text-xs text-amber-800 font-medium">📋 Udhëzime instalimi:</p>
                <ol className="text-xs text-amber-700 mt-1 space-y-1 list-decimal list-inside">
                  <li>Shkarko skedarin APK</li>
                  <li>Shko te Cilësimet → Siguria</li>
                  <li>Aktivizo "Burime të Panjohura"</li>
                  <li>Hap APK dhe instalo</li>
                </ol>
              </div>
              <a
                href="/"
                className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition-colors"
                onClick={e => { e.preventDefault(); alert("APK shkarkimi do të jetë i disponueshëm së shpejti!"); }}
              >
                <Download size={18} /> Shkarko APK
              </a>
            </div>

            {/* iOS IPA */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <span className="text-3xl">🍎</span>
                </div>
                <div className="text-left">
                  <h3 className="font-black text-gray-900 text-lg">iPhone / iPad (IPA)</h3>
                  <p className="text-gray-500 text-sm">TiliGo v1.0 · 18.7 MB</p>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 text-left">
                <p className="text-xs text-blue-800 font-medium">📋 Udhëzime instalimi:</p>
                <ol className="text-xs text-blue-700 mt-1 space-y-1 list-decimal list-inside">
                  <li>Shkarko skedarin IPA</li>
                  <li>Përdor AltStore ose Sideloadly</li>
                  <li>Instalo me Apple ID tuaj</li>
                  <li>Beso profilin te Cilësimet</li>
                </ol>
              </div>
              <a
                href="/"
                className="flex items-center justify-center gap-2 w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3.5 rounded-xl transition-colors"
                onClick={e => { e.preventDefault(); alert("IPA shkarkimi do të jetë i disponueshëm së shpejti!"); }}
              >
                <Download size={18} /> Shkarko IPA
              </a>
            </div>

            {/* PWA option */}
            <div className="bg-gradient-to-br from-blue-700 to-green-600 rounded-2xl p-6 text-white">
              <Smartphone size={32} className="mx-auto mb-3" />
              <h3 className="font-black text-lg mb-2">Instalo si App (PWA)</h3>
              <p className="text-white/80 text-sm mb-4">Shto TiliGo direkt në ekranin kryesor të telefonit — nuk nevojitet instalim!</p>
              <div className="text-left space-y-2">
                <p className="text-xs text-white/90"><strong>iPhone:</strong> Safari → Shperndaje → Shto ne Ekranin Kryesor</p>
                <p className="text-xs text-white/90"><strong>Android:</strong> Chrome → Menu (⋮) → Shto ne Ekranin Kryesor</p>
              </div>
            </div>
          </div>

          <Link to="/" className="inline-block mt-8 text-blue-700 font-semibold hover:underline text-sm">
            ← Kthehu në Faqen Kryesore
          </Link>
        </motion.div>
      </div>
    </div>
  );
}