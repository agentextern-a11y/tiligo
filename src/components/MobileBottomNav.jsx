import { Link, useLocation } from "react-router-dom";
import { Home, Package, User } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "@/lib/useCart";

const TABS = [
  { path: "/", label: "Kryefaqja", icon: Home },
  { path: "/porositjet-e-mia", label: "Porositë", icon: Package },
  { path: "/biznesi/login", label: "Profili", icon: User },
];

export default function MobileBottomNav() {
  const location = useLocation();
  const { cart } = useCart();
  const cartCount = (cart || []).reduce((s, i) => s + i.qty, 0);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md dark:bg-gray-900/95 border-t border-orange-100 dark:border-gray-800"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="flex">
        {TABS.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <Link key={path} to={path}
              className="flex-1 flex flex-col items-center justify-center py-3 relative select-none">
              <div className="relative">
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 -m-2 rounded-xl"
                    style={{ background: 'linear-gradient(135deg,rgba(249,115,22,0.15),rgba(251,191,36,0.15))' }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon size={22}
                  className={`relative z-10 transition-all duration-300 ${isActive ? "scale-110" : "scale-100"}`}
                  style={{ color: isActive ? '#f97316' : undefined }}
                />
                {path === "/porositjet-e-mia" && cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center z-20">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 font-bold transition-colors ${isActive ? "text-orange-500" : "text-gray-400 dark:text-gray-500"}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}