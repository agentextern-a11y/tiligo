import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Phone, User, Banknote, CheckCircle, Copy, Crosshair, Loader } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { useCart } from "@/lib/useCart";
import { generateOrderPDF } from "@/lib/pdfGenerator";

function generateCode() {
  return "TG-" + Math.random().toString(36).substring(2, 7).toUpperCase();
}

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const [form, setForm] = useState({ name: "", phone: "", address: "", notes: "" });
  const [gpsCoords, setGpsCoords] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  const captureGPS = () => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      setGpsCoords({ lat: latitude, lng: longitude });
      // Reverse geocode to fill address
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
        const data = await res.json();
        const addr = data.address;
        const street = [addr.road, addr.house_number].filter(Boolean).join(" ");
        const city = addr.city || addr.town || addr.village || "";
        if (street || city) setForm(f => ({ ...f, address: [street, city].filter(Boolean).join(", ") }));
      } catch {}
      setGpsLoading(false);
    }, () => setGpsLoading(false));
  };
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(null);
  const [copied, setCopied] = useState(false);

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const deliveryFee = cart.length > 0 ? (cart[0]?.delivery_fee ?? 1.5) : 1.5;
  const total = subtotal + deliveryFee;

  const handleOrder = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address) return;
    if (cart.length === 0) return;
    setLoading(true);

    const code = generateCode();
    const businessId = cart[0]?.business_id || "";
    const businessName = cart[0]?.business_name || "";

    const order = {
      order_code: code,
      customer_name: form.name,
      customer_phone: form.phone,
      customer_address: form.address,
      ...(gpsCoords ? { customer_lat: gpsCoords.lat, customer_lng: gpsCoords.lng } : {}),
      notes: form.notes,
      items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
      total,
      delivery_fee: deliveryFee,
      business_id: businessId,
      business_name: businessName,
      status: "e_re",
      payment_method: "cash",
    };

    const saved = await base44.entities.Order.create(order);
    clearCart();
    setDone({ ...order, id: saved.id });

    // Auto-download PDF
    setTimeout(() => generateOrderPDF({ ...order }), 800);
    setLoading(false);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(done.order_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (done) return (
    <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center px-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-xl"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <CheckCircle size={40} className="text-green-600" />
        </motion.div>
        <h2 className="text-2xl font-black text-gray-900 mb-1">Porosia u dërgua! 🎉</h2>
        <p className="text-gray-500 text-sm mb-6">Biznesi do ta konfirmojë porosinë shumë shpejt.</p>

        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 mb-6">
          <p className="text-xs text-amber-700 font-medium mb-1">Kodi i Porosisë</p>
          <p className="text-3xl font-black text-amber-600 tracking-wider">{done.order_code}</p>
          <button onClick={copyCode}
            className="mt-2 flex items-center gap-1.5 text-xs text-amber-700 hover:text-amber-800 mx-auto font-medium">
            <Copy size={12} />
            {copied ? "U kopjua!" : "Kopjo kodin"}
          </button>
        </div>

        <div className="text-left space-y-2 mb-6 bg-gray-50 rounded-xl p-4">
          <p className="text-sm"><span className="font-semibold">Emri:</span> {done.customer_name}</p>
          <p className="text-sm"><span className="font-semibold">Telefoni:</span> {done.customer_phone}</p>
          <p className="text-sm"><span className="font-semibold">Adresa:</span> {done.customer_address}</p>
          <p className="text-sm font-bold text-blue-700">Totali: {done.total?.toFixed(2)}€ (Cash)</p>
        </div>

        <p className="text-xs text-gray-400 mb-4">PDF u shkarkua automatikisht</p>

        <div className="space-y-2">
          <button
            onClick={() => navigate(`/gjurmo/${done.order_code}`)}
            className="w-full bg-blue-700 text-white font-bold py-3 rounded-xl hover:bg-blue-800 transition-colors"
          >
            🗺️ Gjurmo Porosinë
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
          >
            Kthehu në Faqen Kryesore
          </button>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <div className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">
            <ArrowLeft size={22} />
          </button>
          <h1 className="font-bold text-gray-900 text-lg">Finalizoni Porosinë</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* Order summary */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">Artikujt e Porosisë</h2>
          <div className="space-y-3">
            {cart.map(item => (
              <div key={item.id} className="flex items-center gap-3">
                {item.image_url && (
                  <img src={item.image_url} alt={item.name} className="w-12 h-12 rounded-xl object-cover" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                  <p className="text-gray-500 text-xs">x{item.qty}</p>
                </div>
                <p className="font-bold text-blue-700 text-sm">{(item.price * item.qty).toFixed(2)}€</p>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 mt-4 pt-3 space-y-1">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Nëntotali</span><span>{subtotal.toFixed(2)}€</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Dërgesa</span><span>{deliveryFee.toFixed(2)}€</span>
            </div>
            <div className="flex justify-between font-black text-base text-gray-900 pt-1">
              <span>Totali</span><span className="text-blue-700">{total.toFixed(2)}€</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleOrder} className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900 mb-2">Të Dhënat Tuaja</h2>

          <div>
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5 mb-1.5">
              <User size={14} /> Emri i Plotë *
            </label>
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              placeholder="p.sh. Arben Krasniqi"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              required />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5 mb-1.5">
              <Phone size={14} /> Numri i Telefonit *
            </label>
            <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
              placeholder="+383 44 000 000"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              required />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5 mb-1.5">
              <MapPin size={14} /> Adresa e Dorëzimit *
            </label>
            <div className="flex gap-2">
              <input value={form.address} onChange={e => setForm({...form, address: e.target.value})}
                placeholder="Rruga, numri, qyteti"
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                required />
              <button type="button" onClick={captureGPS} disabled={gpsLoading}
                title="Përdor GPS"
                className="flex items-center gap-1.5 px-3 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors disabled:opacity-60 flex-shrink-0">
                {gpsLoading ? <Loader size={16} className="animate-spin" /> : <Crosshair size={16} />}
              </button>
            </div>
            {gpsCoords && (
              <p className="text-xs text-green-600 font-medium mt-1 flex items-center gap-1">
                <MapPin size={10} /> GPS i ruajtur · {gpsCoords.lat.toFixed(5)}, {gpsCoords.lng.toFixed(5)}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Shënime (opsionale)</label>
            <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
              placeholder="Instruksione të veçanta..."
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 resize-none" />
          </div>

          {/* Payment */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
            <Banknote size={20} className="text-green-600" />
            <div>
              <p className="font-semibold text-green-800 text-sm">Pagesa me Cash</p>
              <p className="text-green-600 text-xs">Paguani kur dorëzuesi të arrijë</p>
            </div>
          </div>

          <button type="submit" disabled={loading || cart.length === 0}
            className="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white font-black py-4 rounded-xl transition-colors text-base">
            {loading ? "Duke dërguar..." : `Porosit Tani · ${total.toFixed(2)}€`}
          </button>
        </form>
      </div>
    </div>
  );
}