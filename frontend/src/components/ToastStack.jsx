import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "../context/NotificationContext";

export default function ToastStack() {
  const { toasts, dismissToast } = useNotifications();

  return (
    <div className="fixed top-5 right-5 z-[100] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            onClick={() => dismissToast(t.id)}
            className="pointer-events-auto bg-white border border-ink/10 rounded-2xl shadow-lg p-4 flex items-start gap-3 cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 400 }}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
              style={{ background: t.color || "var(--color-mint)" }}
            >
              ✓
            </motion.div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-ink">{t.title}</p>
              <p className="text-sm text-ink/60">{t.message}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
