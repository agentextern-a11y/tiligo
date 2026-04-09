import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Smartphone, CheckCircle, Share, PlusSquare } from "lucide-react";
import { motion } from "framer-motion";
import TiliGoLogo from "@/components/TiliGoLogo";

export default function DownloadApp() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isAndroid = /android/i.test(navigator.userAgent);
  const isInPWA = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleAndroidInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const result = await installPrompt.userChoice;
    if (result.outcome === "accepted") {
      setInstalled(true);
      setInstallPrompt(null);
    }
  };

  if (isInPWA || installed) {
    return (
      <div className="min-h-screen bg-[#f0f4f8] dark:bg-gray-950 flex items-center justify-center px-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-3xl p-10 max-w-sm w-full text-center shadow-xl">
          <CheckCircle size={56} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-2">TiliGo u instalua!</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Aplikacioni është tashmë në ekranin tuaj kryesor.</p>
          <Link to="/" className="block w-full bg-blue-700 text-white font-bold py-3 rounded-xl hover:bg-blue-800 transition-colors">
            Hap TiliGo
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8] dark:bg-gray-950">
      <div className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-100 dark:border-gray-800 px-4 h-14 flex items-center gap-3">
        <Link to="/" className="text-gray-500 hover:text-gray-700 dark:text-gray-400"><ArrowLeft size={22} /></Link>
        <TiliGoLogo size="sm" />
      </div>

      <div className="max-w-lg mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <TiliGoLogo size="xl" className="justify-center mb-6" />
          <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-3">Instalo TiliGo</h1>
          <p className="text-gray-500 dark:text-gray-400">Shto aplikacionin në telefonin tënd — falas, pa App Store!</p>
        </motion.div>

        <div className="space-y-4">

          {/* Android */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center text-3xl">🤖</div>
              <div>
                <h3 className="font-black text-gray-900 dark:text-gray-100 text-lg">Android</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Chrome · Samsung Internet</p>
              </div>
            </div>

            {installPrompt ? (
              <button onClick={handleAndroidInstall}
                className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white font-black py-4 rounded-xl transition-colors text-base shadow-md">
                <Smartphone size={20} /> Instalo Tani në Android
              </button>
            ) : (
              <>
                <div className="space-y-3 mb-5">
                  {[
                    { step: "1", text: "Hap faqen në Chrome" },
                    { step: "2", text: 'Kliko menunë ⋮ (lart djathtas)' },
                    { step: "3", text: '"Shto në Ekranin Kryesor"' },
                    { step: "4", text: "Kliko Shto dhe TiliGo është gati!" },
                  ].map(s => (
                    <div key={s.step} className="flex items-center gap-3">
                      <span className="w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-black flex-shrink-0">{s.step}</span>
                      <p className="text-gray-700 dark:text-gray-300 text-sm">{s.text}</p>
                    </div>
                  ))}
                </div>
                {isAndroid && (
                  <p className="text-center text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 rounded-xl py-2 px-3">
                    💡 Hap faqen direkt në Chrome për të parë butonin e instalimit automatik
                  </p>
                )}
              </>
            )}
          </motion.div>

          {/* iOS */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-3xl">🍎</div>
              <div>
                <h3 className="font-black text-gray-900 dark:text-gray-100 text-lg">iPhone / iPad</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Safari (i detyrueshëm)</p>
              </div>
            </div>

            <div className="space-y-3 mb-5">
              {[
                { step: "1", icon: <span className="text-base">🧭</span>, text: "Hap faqen tiligo.app në Safari" },
                { step: "2", icon: <Share size={15} className="text-blue-600" />, text: 'Kliko ikonën Shpërnda (poshtë)' },
                { step: "3", icon: <PlusSquare size={15} className="text-blue-600" />, text: '"Shto në Ekranin Kryesor"' },
                { step: "4", icon: <CheckCircle size={15} className="text-green-600" />, text: "Kliko Shto — ikona shfaqet menjëherë!" },
              ].map(s => (
                <div key={s.step} className="flex items-center gap-3">
                  <span className="w-7 h-7 bg-blue-700 text-white rounded-full flex items-center justify-center text-xs font-black flex-shrink-0">{s.step}</span>
                  <div className="flex items-center gap-2">
                    {s.icon}
                    <p className="text-gray-700 dark:text-gray-300 text-sm">{s.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {isIOS && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-center">
                <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                  📱 Je duke e hapur në iPhone — shko te Safari dhe ndiq hapat!
                </p>
              </div>
            )}
          </motion.div>

          {/* Why PWA */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-blue-700 to-green-600 rounded-2xl p-6 text-white">
            <h3 className="font-black text-lg mb-3 text-center">✨ Pse TiliGo si App?</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: "⚡", text: "Hapje e shpejtë" },
                { icon: "📴", text: "Funksionon offline" },
                { icon: "🔔", text: "Njoftimet push" },
                { icon: "💾", text: "Pa hapësirë ruajtjeje" },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-2 bg-white/15 rounded-xl px-3 py-2">
                  <span>{f.icon}</span>
                  <span className="text-sm font-medium">{f.text}</span>
                </div>
              ))}
            </div>
          </motion.div>

        </div>

        <div className="text-center mt-8">
          <Link to="/" className="text-blue-700 dark:text-blue-400 font-semibold hover:underline text-sm">
            ← Kthehu në Faqen Kryesore
          </Link>
        </div>
      </div>
    </div>
  );
}