import { motion, AnimatePresence } from "framer-motion";

export default function PresenceAvatars({ people }) {
  return (
    <div className="flex -space-x-2">
      <AnimatePresence>
        {people.map((p, i) => (
          <motion.div
            key={p.name + i}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="w-8 h-8 rounded-full border-2 border-ink/30 flex items-center justify-center text-xs font-semibold text-white"
            style={{ background: p.color || "#10b981" }}
            title={p.name}
          >
            {p.name?.[0]?.toUpperCase()}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
