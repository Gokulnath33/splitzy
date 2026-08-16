import { motion } from "framer-motion";
import AnimatedNumber from "./AnimatedNumber";
import { getCurrencySymbol } from "../utils/currency";

export default function GroupProgress({ stats, currency = "INR" }) {
  const { totalSpent, totalSettled, amountRemaining, percentSettled, expenseCount, memberCount, fullySettled } =
    stats;

  const symbol = getCurrencySymbol(currency);
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentSettled / 100) * circumference;

  return (
    <div className="glass-card rounded-2xl p-6 mb-10">
      <div className="flex flex-col sm:flex-row items-center gap-8">
        {/* Animated progress ring */}
        <div className="relative w-28 h-28 shrink-0">
          <svg width="112" height="112" className="-rotate-90">
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--color-emerald)" />
                <stop offset="50%" stopColor="var(--color-mint)" />
                <stop offset="100%" stopColor="var(--color-amber)" />
              </linearGradient>
            </defs>
            <circle cx="56" cy="56" r={radius} fill="none" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="10" />
            <motion.circle
              cx="56"
              cy="56"
              r={radius}
              fill="none"
              stroke={fullySettled ? "var(--color-mint)" : "url(#progressGradient)"}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center font-display text-xl font-semibold text-gradient text-ink">
            {percentSettled}%
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 flex-1 w-full">
          <div className="stat-cell">
            <p className="text-xs text-ink-secondary mb-1">Total spent</p>
            <p className="font-mono font-semibold text-lg text-ink">
              {symbol}<AnimatedNumber value={totalSpent} />
            </p>
          </div>
          <div className="stat-cell">
            <p className="text-xs text-ink-secondary mb-1">Settled so far</p>
            <p className="font-mono font-semibold text-lg text-mint-dark" style={{ color: "var(--color-emerald)" }}>
              {symbol}<AnimatedNumber value={totalSettled} />
            </p>
          </div>
          <div className="stat-cell">
            <p className="text-xs text-ink-secondary mb-1">Still pending</p>
            <p className="font-mono font-semibold text-lg" style={{ color: "var(--color-coral)" }}>
              {symbol}<AnimatedNumber value={amountRemaining} />
            </p>
          </div>
          <div className="stat-cell">
            <p className="text-xs text-ink-secondary mb-1">Activity</p>
            <p className="font-mono font-semibold text-lg text-ink">
              {expenseCount} <span className="text-xs text-ink-muted font-body">exp.</span> · {memberCount}{" "}
              <span className="text-xs text-ink-muted font-body">people</span>
            </p>
          </div>
        </div>
      </div>

      {fullySettled && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 pt-5 border-t border-ink/20 text-sm font-medium text-emerald flex items-center gap-2 text-ink"
        >
          <span>🎉</span> Everyone's settled up — nothing pending in this group.
        </motion.div>
      )}
    </div>
  );
}
