import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingCart, Package, User, Menu, X, ChevronDown, ArrowLeft } from "lucide-react";
import TiliGoLogo from "./TiliGoLogo";
import { motion, AnimatePresence } from "framer-motion";

// Root screens show logo; child screens show back button on mobile
const ROOT_PATHS = ["/", "/porositjet-e-mia", "/biznesi/login", "/dorezuesi/login",
  "/biznesi/register", "/dorezuesi/register", "/admin", "/shkarko-app"];

export default function Navbar({ cart = [], onCartClick }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hyrjaOpen, setHyrjaOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const isRoot = ROOT_PATHS.includes(location.pathname);

  return (
    <nav className="sticky top-0 z-50 shadow-xl"
      style={{ background: 'var(--nav-bg)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--nav-border)', paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/">
          <TiliGoLogo size="md" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <button
            onClick={onCartClick}
            className="relative flex items-center gap-2 font-medium transition-colors hover:opacity-80"
            style={{ color: 'var(--text-primary)' }}
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
            className="flex items-center gap-2 font-medium transition-colors hover:opacity-80"
            style={{ color: 'var(--text-primary)' }}
          >
            <Package size={20} />
            <span>Porositë</span>
          </Link>

          <div className="relative">
            <button
              onClick={() => setHyrjaOpen(!hyrjaOpen)}
              className="flex items-center gap-1 px-4 py-2 rounded-full font-bold hover:scale-105 transition-all shadow-md text-[#020c1b]"
              style={{ background: 'linear-gradient(135deg,#00ff87,#00b4d8)', boxShadow: '0 0 16px rgba(0,255,135,0.4)' }}
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
                  className="absolute right-0 mt-2 w-52 rounded-xl shadow-2xl overflow-hidden z-50"
                  style={{ background: 'var(--nav-bg)', border: '1px solid var(--nav-border)', backdropFilter: 'blur(20px)' }}
                >
                  <Link to="/biznesi/login" onClick={() => setHyrjaOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 font-medium transition-colors hover:bg-white/10"
                    style={{ color: 'var(--text-primary)' }}>
                    🏪 Hyrja Biznesit
                  </Link>
                  <Link to="/dorezuesi/login" onClick={() => setHyrjaOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 font-medium transition-colors hover:bg-white/10"
                    style={{ color: 'var(--text-primary)' }}>
                    🛵 Hyrja Dorëzuesit
                  </Link>
                  <Link to="/admin" onClick={() => setHyrjaOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 font-medium transition-colors hover:bg-white/10 border-t"
                    style={{ color: 'var(--text-primary)', borderColor: 'var(--nav-border)' }}>
                    🔐 Paneli Admin
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile */}
        <div className="flex md:hidden items-center gap-3">
          {!isRoot && (
            <button onClick={() => navigate(-1)}
              className="w-9 h-9 flex items-center justify-center rounded-xl transition-colors -ml-1 hover:bg-white/10"
              style={{ color: 'var(--text-primary)' }}>
              <ArrowLeft size={22} />
            </button>
          )}
          <button onClick={onCartClick} className="relative" style={{ color: 'var(--text-primary)' }}>
            <ShoppingCart size={24} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </button>
          {isRoot && (
            <button onClick={() => setMenuOpen(!menuOpen)} style={{ color: 'var(--text-primary)' }}>
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden"
          style={{ background: 'var(--nav-bg)', borderTop: '1px solid var(--nav-border)' }}
          >
            <div className="px-4 py-3 space-y-1">
              <Link to="/porositjet-e-mia" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/10 font-medium"
                style={{ color: 'var(--text-primary)' }}>
                <Package size={20} />Porositë e Mia
              </Link>
              <Link to="/biznesi/login" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/10 font-medium"
                style={{ color: 'var(--text-primary)' }}>
                🏪 Hyrja Biznesit
              </Link>
              <Link to="/dorezuesi/login" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/10 font-medium"
                style={{ color: 'var(--text-primary)' }}>
                🛵 Hyrja Dorëzuesit
              </Link>
              <Link to="/admin" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/10 font-medium border-t"
                style={{ color: 'var(--text-primary)', borderColor: 'var(--nav-border)' }}>
                🔐 Paneli Admin
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}