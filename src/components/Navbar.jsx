import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, Package, User, Menu, X, ChevronDown } from "lucide-react";
import TiliGoLogo from "./TiliGoLogo";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar({ cart = [], onCartClick }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hyrjaOpen, setHyrjaOpen] = useState(false);
  const location = useLocation();
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/">
          <TiliGoLogo size="md" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <button
            onClick={onCartClick}
            className="relative flex items-center gap-2 text-gray-600 hover:text-blue-700 font-medium transition-colors"
          >
            <ShoppingCart size={20} />
            <span>Shporta</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </button>

          <Link
            to="/porositjet-e-mia"
            className="flex items-center gap-2 text-gray-600 hover:text-blue-700 font-medium transition-colors"
          >
            <Package size={20} />
            <span>Porositë</span>
          </Link>

          <div className="relative">
            <button
              onClick={() => setHyrjaOpen(!hyrjaOpen)}
              className="flex items-center gap-1 bg-blue-700 text-white px-4 py-2 rounded-full font-medium hover:bg-blue-800 transition-colors"
            >
              <User size={18} />
              Hyrja
              <ChevronDown size={16} />
            </button>
            <AnimatePresence>
              {hyrjaOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
                >
                  <Link to="/biznesi/login" onClick={() => setHyrjaOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-700 font-medium transition-colors">
                    🏪 Hyrja Biznesit
                  </Link>
                  <Link to="/dorezuesi/login" onClick={() => setHyrjaOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-700 font-medium transition-colors">
                    🛵 Hyrja Dorëzuesit
                  </Link>
                  <Link to="/admin" onClick={() => setHyrjaOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-700 font-medium transition-colors border-t border-gray-100">
                    🔐 Paneli Admin
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile */}
        <div className="flex md:hidden items-center gap-3">
          <button onClick={onCartClick} className="relative text-gray-600">
            <ShoppingCart size={24} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </button>
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-600">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              <Link to="/porositjet-e-mia" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium">
                <Package size={20} />Porositë e Mia
              </Link>
              <Link to="/biznesi/login" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium">
                🏪 Hyrja Biznesit
              </Link>
              <Link to="/dorezuesi/login" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium">
                🛵 Hyrja Dorëzuesit
              </Link>
              <Link to="/admin" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium border-t border-gray-100">
                🔐 Paneli Admin
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}