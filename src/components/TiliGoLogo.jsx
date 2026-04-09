import { motion } from "framer-motion";

/* ─── Badge SVG (icon mark) ──────────────────────────────── */
export function TiliGoBadge({ size = 48 }) {
  return (
    <svg width={size} height={size * 0.8} viewBox="0 0 200 160"
      xmlns="http://www.w3.org/2000/svg" aria-label="TiliGo badge">
      <defs>
        <linearGradient id="bBlue" x1="15%" y1="25%" x2="85%" y2="75%">
          <stop offset="0%" stopColor="#00BFFF"/>
          <stop offset="100%" stopColor="#0066FF"/>
        </linearGradient>
        <linearGradient id="bGreen" x1="30%" y1="35%" x2="90%" y2="80%">
          <stop offset="0%" stopColor="#7FFF00"/>
          <stop offset="100%" stopColor="#00FF7F"/>
        </linearGradient>
      </defs>

      {/* Wing shadow */}
      <path d="M32 68 Q10 38 42 26 Q82 20 98 48"
        fill="none" stroke="#0044CC" strokeWidth="21"
        strokeLinecap="round" strokeLinejoin="round"/>
      {/* Wing highlight */}
      <path d="M34 66 Q12 40 44 28 Q84 24 100 50"
        fill="none" stroke="url(#bBlue)" strokeWidth="15"
        strokeLinecap="round" strokeLinejoin="round"/>

      {/* Green swirl shadow */}
      <path d="M102 72 Q135 42 165 56 Q188 84 150 102 Q108 88 102 72"
        fill="none" stroke="#008800" strokeWidth="24"
        strokeLinecap="round" strokeLinejoin="round"/>
      {/* Green swirl highlight */}
      <path d="M105 70 Q138 44 162 55 Q185 82 152 98 Q110 86 105 70"
        fill="none" stroke="url(#bGreen)" strokeWidth="17"
        strokeLinecap="round" strokeLinejoin="round"/>

      {/* Arrow */}
      <path d="M122 58 L148 70 L134 82 Z" fill="#00FFAA"/>
      <path d="M124 59 L146 69 L135 79 Z" fill="#7FFF00"/>

      {/* Pin white circle */}
      <circle cx="163" cy="54" r="15" fill="#FFFFFF"/>
      <circle cx="163" cy="54" r="10.5" fill="#FF3366"/>
      <path d="M163 41 L163 67" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round"/>
    </svg>
  );
}

/* ─── Wordmark SVG ───────────────────────────────────────── */
function WordmarkSVG({ width }) {
  const h = Math.round(width * 0.28);
  return (
    <svg width={width} height={h} viewBox="0 0 320 90"
      xmlns="http://www.w3.org/2000/svg" aria-label="TiliGo">
      <defs>
        <linearGradient id="wBlue" x1="0%" y1="30%" x2="100%" y2="70%">
          <stop offset="0%" stopColor="#00BFFF"/>
          <stop offset="100%" stopColor="#0066FF"/>
        </linearGradient>
        <linearGradient id="wGreen" x1="0%" y1="30%" x2="100%" y2="70%">
          <stop offset="0%" stopColor="#7FFF00"/>
          <stop offset="100%" stopColor="#00FF7F"/>
        </linearGradient>
      </defs>
      <text x="0" y="68"
        fontFamily="Arial Black, Helvetica, sans-serif"
        fontSize="68" fontWeight="900" letterSpacing="-3"
        fill="url(#wBlue)">Tili</text>
      <text x="185" y="68"
        fontFamily="Arial Black, Helvetica, sans-serif"
        fontSize="68" fontWeight="900" letterSpacing="-2.5"
        fill="url(#wGreen)">Go</text>
    </svg>
  );
}

/* ─── Main logo component ────────────────────────────────── */
const widths = { sm: 120, md: 170, lg: 230, xl: 310 };

export default function TiliGoLogo({ size = "md", className = "" }) {
  const w = widths[size] || widths.md;
  const badgeSize = w * 0.32;

  return (
    <motion.div
      className={`flex items-center select-none ${className}`}
      style={{ gap: 8 }}
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
    >
      <TiliGoBadge size={badgeSize} />
      <WordmarkSVG width={w} />
    </motion.div>
  );
}