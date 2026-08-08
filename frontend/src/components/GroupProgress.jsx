import { motion } from "framer-motion";
import AnimatedNumber from "./AnimatedNumber";

export default function GroupProgress({ stats }) {
  const { totalSpent, totalSettled, amountRemaining, percentSettled, expenseCount, memberCount, fullySettled } =
    stats;

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentSettled / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl border border-ink/10 p-6 mb-10">
      <div className="flex flex-col sm:flex-row items-center gap-8">
        {/* Animated progress ring */}
        <div className="relative w-28 h-28 shrink-0">
          <svg width="112" height="112" className="-rotate-90">
            <circle cx="56" cy="56" r={radius} fill="none" stroke="#EDE9E1" strokeWidth="10" />
            <motion.circle
              cx="56"
              cy="56"
              r={radius}
              fill="none"
              stroke={fullySettled ? "var(--color-mint)" : "var(--color-emerald)"}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center font-display text-xl font-semibold">
            {percentSettled}%
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 flex-1 w-full">
          <div>
            <p className="text-xs text-ink/50 mb-1">Total spent</p>
            <p className="font-mono font-semibold text-lg">
              <AnimatedNumber value={totalSpent} />
            </p>
          </div>
          <div>
            <p className="text-xs text-ink/50 mb-1">Settled so far</p>
            <p className="font-mono font-semibold text-lg text-mint-dark" style={{ color: "var(--color-emerald)" }}>
              <AnimatedNumber value={totalSettled} />
            </p>
          </div>
          <div>
            <p className="text-xs text-ink/50 mb-1">Still pending</p>
            <p className="font-mono font-semibold text-lg" style={{ color: "var(--color-coral)" }}>
              <AnimatedNumber value={amountRemaining} />
            </p>
          </div>
          <div>
            <p className="text-xs text-ink/50 mb-1">Activity</p>
            <p className="font-mono font-semibold text-lg">
              {expenseCount} <span className="text-xs text-ink/40 font-body">exp.</span> · {memberCount}{" "}
              <span className="text-xs text-ink/40 font-body">people</span>
            </p>
          </div>
        </div>
      </div>

      {fullySettled && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 pt-5 border-t border-ink/10 text-sm font-medium text-emerald flex items-center gap-2"
        >
          <span>🎉</span> Everyone's settled up — nothing pending in this group.
        </motion.div>
      )}
    </div>
  );
}
