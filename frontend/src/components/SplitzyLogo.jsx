import { motion } from "framer-motion";

export default function SplitzyLogo({ size = "md", animated = false, showText = true }) {
  const sizes = {
    sm: { icon: 28, text: "text-lg", dot: 6 },
    md: { icon: 36, text: "text-xl", dot: 8 },
    lg: { icon: 48, text: "text-2xl", dot: 10 },
    xl: { icon: 64, text: "text-3xl", dot: 12 },
  };

  const s = sizes[size] || sizes.md;

  const iconContent = (
    <svg width={s.icon} height={s.icon} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logo-g-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="50%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#14b8a6" />
        </linearGradient>
        <linearGradient id="logo-bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="url(#logo-bg-grad)" />
      <rect x="1.5" y="1.5" width="61" height="61" rx="12.5" fill="none" stroke="url(#logo-g-grad)" strokeWidth="1.5" opacity="0.35" />
      <text x="32" y="46" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="800" fontSize="42" fill="url(#logo-g-grad)">G</text>
      <circle cx="49" cy="15" r="5" fill="#10b981" opacity="0.5" />
      <circle cx="49" cy="15" r="2.5" fill="#34d399" />
    </svg>
  );

  return (
    <div className="flex items-center gap-2">
      {animated ? (
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {iconContent}
        </motion.div>
      ) : (
        iconContent
      )}
      {showText && (
        <span className={`font-display ${s.text} font-semibold text-gradient`}>
          splitzy
        </span>
      )}
    </div>
  );
}
