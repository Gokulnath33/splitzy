import { motion } from "framer-motion";
import { getCurrencySymbol } from "../utils/currency";

const CATEGORY_CONFIG = {
  Food: { color: "#f43f5e", icon: "🍔" },
  Transport: { color: "#f59e0b", icon: "🚗" },
  Housing: { color: "#8b5cf6", icon: "🏠" },
  Entertainment: { color: "#ec4899", icon: "🎬" },
  Shopping: { color: "#14b8a6", icon: "🛍️" },
  General: { color: "#10b981", icon: "🧾" },
};

export default function CategoryAnalytics({ categories = {}, currency = "INR", totalSpent = 0 }) {
  const symbol = getCurrencySymbol(currency);
  const entries = Object.entries(categories).filter(([_, amt]) => amt > 0);

  if (totalSpent === 0 || entries.length === 0) {
    return null;
  }

  return (
    <div className="glass-card rounded-2xl p-6 mb-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-semibold text-gradient text-ink">Category Breakdown</h3>
        <span className="text-xs font-mono text-ink-secondary">Total: {symbol}{totalSpent.toFixed(2)}</span>
      </div>

      {/* Multi-segment progress bar */}
      <div className="h-3 w-full bg-ink/10 rounded-full overflow-hidden flex mb-6">
        {entries.map(([cat, amt]) => {
          const pct = ((amt / totalSpent) * 100).toFixed(1);
          const config = CATEGORY_CONFIG[cat] || CATEGORY_CONFIG.General;
          return (
            <div
              key={cat}
              style={{ width: `${pct}%`, backgroundColor: config.color }}
              className="h-full transition-all duration-500"
              title={`${cat}: ${symbol}${amt.toFixed(2)} (${pct}%)`}
            />
          );
        })}
      </div>

      {/* Category Pills & Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {entries.map(([cat, amt]) => {
          const pct = Math.round((amt / totalSpent) * 100);
          const config = CATEGORY_CONFIG[cat] || CATEGORY_CONFIG.General;
          return (
            <motion.div
              key={cat}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-3 rounded-xl border border-ink/20 bg-cream/20 analytics-pill"
            >
              <span className="text-xl" role="img" aria-label={cat}>
                {config.icon}
              </span>
              <div>
                <div className="text-xs font-medium text-ink-secondary">{cat}</div>
                <div className="text-sm font-semibold font-mono text-ink">
                  {symbol}{amt.toFixed(2)} <span className="text-xs text-ink-muted">({pct}%)</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
