import { motion, useAnimationControls } from "framer-motion";
import { useEffect } from "react";

const LETTERS = ["T", "i", "l", "i", "G", "o"];
const LETTER_COLORS = ["#00BFFF", "#00BFFF", "#00BFFF", "#00BFFF", "#39FF6B", "#39FF6B"];

const sizes = {
  sm: { imgH: "h-7",  font: 14, moto: 17 },
  md: { imgH: "h-9",  font: 18, moto: 21 },
  lg: { imgH: "h-14", font: 30, moto: 34 },
  xl: { imgH: "h-20", font: 44, moto: 48 },
};

export default function TiliGoLogo({ size = "md", className = "" }) {
  const s = sizes[size] || sizes.md;
  const motoCtrl = useAnimationControls();

  // Continuous bounce/float loop for the moto + flag
  useEffect(() => {
    motoCtrl.start({
      y: [0, -4, 0, -3, 0],
      transition: { duration: 1.8, repeat: Infinity, ease: "easeInOut" },
    });
  }, [motoCtrl]);

  return (
    <div className={`flex items-center gap-2 ${className}`}>

      {/* ── Static logo image ── */}
      <picture className="flex-shrink-0">
        <source
          srcSet="https://media.base44.com/images/public/69d519273be8cf966434f77a/51149fad3_IMG_0106.jpeg"
          media="(prefers-color-scheme: dark)"
        />
        <img
          src="https://media.base44.com/images/public/69d519273be8cf966434f77a/f678192b5_IMG_0105.jpeg"
          alt="TiliGo"
          className={`${s.imgH} w-auto object-contain rounded-lg`}
        />
      </picture>

      {/* ── Moto + flag unit ── */}
      <motion.div
        controls={motoCtrl}
        animate={motoCtrl}
        className="flex items-center"
        style={{ transformOrigin: "center bottom" }}
      >
        {/* Flag banner — letters trail BEHIND the moto (to the right since moto faces left) */}
        <div className="flex items-center relative" style={{ marginRight: 2 }}>
          {/* Flag pole connector line */}
          <motion.div
            animate={{ scaleX: [1, 0.92, 1, 0.95, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            style={{
              width: 28,
              height: 2,
              background: "linear-gradient(90deg, #39FF6B, #00BFFF)",
              borderRadius: 2,
              transformOrigin: "left center",
            }}
          />

          {/* Letters wave like a flag */}
          <div className="flex items-center" style={{ gap: 0 }}>
            {LETTERS.map((letter, i) => (
              <motion.span
                key={i}
                animate={{
                  y: [0, -(2 + i * 0.7), 0, -(1.5 + i * 0.5), 0],
                  rotate: [0, i % 2 === 0 ? 3 : -3, 0, i % 2 === 0 ? -2 : 2, 0],
                  opacity: [1, 1, 1],
                }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.08,
                }}
                style={{
                  fontSize: s.font,
                  fontWeight: 900,
                  fontFamily: "'Poppins','Inter',sans-serif",
                  color: LETTER_COLORS[i],
                  lineHeight: 1,
                  textShadow: `0 0 12px ${LETTER_COLORS[i]}cc`,
                  letterSpacing: "0.01em",
                  display: "inline-block",
                  transformOrigin: "bottom center",
                }}
              >
                {letter}
              </motion.span>
            ))}
          </div>
        </div>

        {/* 🛵 facing left — scale(-1,1) flips it */}
        <motion.span
          animate={{
            rotate: [0, -2, 0, 2, 0],
            scale: [1, 1.04, 1, 1.02, 1],
          }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          style={{
            fontSize: s.moto,
            lineHeight: 1,
            display: "inline-block",
            transform: "scaleX(-1)",   /* face left */
            filter: `drop-shadow(0 0 6px #39FF6B88)`,
          }}
        >
          🛵
        </motion.span>
      </motion.div>
    </div>
  );
}