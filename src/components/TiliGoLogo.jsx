import { motion } from "framer-motion";

const sizes = {
  sm: "h-9",
  md: "h-13",
  lg: "h-16",
  xl: "h-24",
};

export default function TiliGoLogo({ size = "md", className = "" }) {
  const h = sizes[size] || sizes.md;

  return (
    <motion.div
      className={`flex items-center select-none ${className}`}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 280, damping: 22, delay: 0.1 }}
    >
      {/* White pill that frames the logo — hides bg seam on any navbar color */}
      <div
        style={{
          background: "rgba(255,255,255,0.97)",
          borderRadius: 14,
          padding: "3px 10px",
          boxShadow: "0 2px 16px rgba(0,191,255,0.18), 0 1px 4px rgba(0,0,0,0.12)",
          display: "flex",
          alignItems: "center",
        }}
      >
        <img
          src="https://media.base44.com/images/public/69d519273be8cf966434f77a/e19f2a0ad_IMG_0107.jpeg"
          alt="TiliGo"
          className={`${h} w-auto object-contain`}
          style={{ maxWidth: 180, display: "block" }}
        />
      </div>
    </motion.div>
  );
}