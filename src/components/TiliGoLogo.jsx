import { motion } from "framer-motion";

const sizes = { sm: "h-9", md: "h-11", lg: "h-16", xl: "h-22" };

export default function TiliGoLogo({ size = "md", className = "" }) {
  const h = sizes[size] || sizes.md;
  return (
    <motion.div
      className={`flex items-center select-none ${className}`}
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}>
      
      {/* Light mode logo */}
      <img src="https://media.base44.com/images/public/69d519273be8cf966434f77a/5ef16eb14_logo.png"

      alt="TiliGo"
      className={`${h} w-auto object-contain block dark:hidden`}
      style={{ maxWidth: 180 }} />
      
      {/* Dark mode logo */}
      <img
        src="https://media.base44.com/images/public/69d519273be8cf966434f77a/9ff7c0a46_IMG_0106.jpeg"
        alt="TiliGo"
        className={`${h} w-auto object-contain hidden dark:block`}
        style={{ maxWidth: 180 }} />
      
    </motion.div>);

}