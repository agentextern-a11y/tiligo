import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, ShoppingBag, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CartDrawer({ open, onClose, cart, onAdd, onRemove, onClear }) {
  const navigate = useNavigate();
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const deliveryFee = cart.length > 0 ? (cart[0]?.delivery_fee ?? 1.5) : 0;

  const handleCheckout = () => {
    onClose();
    navigate("/checkout");
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-sm bg-white z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ShoppingBag size={22} className="text-blue-700" />
                <h2 className="text-lg font-bold text-gray-900">Shporta</h2>
                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
                  {cart.reduce((s, i) => s + i.qty, 0)} artikuj
                </span>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
                <X size={22} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="text-6xl mb-4">🛒</div>
                  <p className="text-gray-500 font-medium">Shporta juaj është bosh</p>
                  <p className="text-gray-400 text-sm mt-1">Shtoni disa produkte nga restorantet</p>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <motion.div
                    key={idx}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="flex items-center gap-3 bg-gray-50 rounded-xl p-3"
                  >
                    {item.image_url && (
                      <img src={item.image_url} alt={item.name}
                        className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{item.name}</p>
                      <p className="text-blue-700 font-bold text-sm">{(item.price * item.qty).toFixed(2)}€</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => onRemove(item.id)}
                        className="w-7 h-7 rounded-full bg-gray-200 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-colors">
                        <Minus size={14} />
                      </button>
                      <span className="w-6 text-center font-bold text-sm">{item.qty}</span>
                      <button onClick={() => onAdd(item)}
                        className="w-7 h-7 rounded-full bg-blue-700 text-white hover:bg-blue-800 flex items-center justify-center transition-colors">
                        <Plus size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="px-5 py-4 border-t border-gray-100 space-y-3 bg-white">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Nëntotali</span>
                    <span>{total.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Dërgesa</span>
                    <span>{deliveryFee.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 text-base pt-1 border-t border-gray-100">
                    <span>Totali</span>
                    <span className="text-blue-700">{(total + deliveryFee).toFixed(2)}€</span>
                  </div>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3.5 rounded-xl transition-colors text-sm"
                >
                  Vazhdo me Porositjen →
                </button>
                <button onClick={onClear}
                  className="w-full flex items-center justify-center gap-2 text-red-500 hover:text-red-600 text-sm font-medium py-1">
                  <Trash2 size={14} /> Pastro shportën
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}