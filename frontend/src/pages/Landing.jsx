import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const strips = [
  { label: "Hotel", who: "Arun", amount: "₹1,200" },
  { label: "Dinner", who: "Priya", amount: "₹800" },
  { label: "Cabs", who: "Ravi", amount: "₹400" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-cream text-ink">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-6xl mx-auto">
        <span className="font-display text-2xl font-semibold text-emerald">splitzy</span>
        <div className="flex gap-3">
          <Link to="/login" className="px-4 py-2 text-sm font-medium hover:text-emerald transition">
            Log in
          </Link>
          <Link
            to="/signup"
            className="px-4 py-2 text-sm font-medium bg-emerald text-white rounded-full hover:bg-emerald-light transition"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-8 pt-12 pb-24 grid md:grid-cols-2 gap-16 items-center">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-display text-5xl md:text-6xl font-semibold leading-[1.05] mb-6"
          >
            Split the bill.
            <br />
            <span className="text-emerald">Not the friendship.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-ink/70 mb-8 max-w-md"
          >
            Add an expense from any phone. Everyone's balance updates instantly, live,
            for the whole group — no refreshing, no spreadsheets, no math.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link
              to="/signup"
              className="inline-block px-7 py-3.5 bg-emerald text-white rounded-full font-medium hover:bg-emerald-light transition"
            >
              Start a group — it's free
            </Link>
          </motion.div>
        </div>

        {/* Signature element: a receipt that tears into equal strips on load */}
        <div className="relative h-[420px] flex items-center justify-center">
          <div className="relative w-72">
            {strips.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ y: -20 * i, rotate: 0, opacity: 0 }}
                animate={{
                  y: i * 8,
                  rotate: i === 0 ? -3 : i === 1 ? 2 : -1.5,
                  opacity: 1,
                  x: i === 0 ? -14 : i === 1 ? 10 : -4,
                }}
                transition={{ duration: 0.7, delay: 0.4 + i * 0.15, ease: "easeOut" }}
                className="absolute w-full bg-white border border-ink/10 shadow-lg px-5 py-4"
                style={{ top: i * 90, zIndex: strips.length - i }}
              >
                <div className="flex justify-between items-baseline border-b border-dashed border-ink/15 pb-2 mb-2">
                  <span className="font-mono text-xs text-ink/50">PAID BY {s.who.toUpperCase()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-body text-sm">{s.label}</span>
                  <span className="font-mono font-semibold text-emerald">{s.amount}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-8 pb-24">
        <h2 className="font-display text-3xl font-semibold mb-10 text-center">How it works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Create a group",
              body: "Start a group for a trip, flat, or event, and add your friends by email.",
            },
            {
              title: "Log expenses as they happen",
              body: "Anyone adds what they paid for — the app splits it equally across the group automatically.",
            },
            {
              title: "Watch balances update live",
              body: "The moment an expense is added, everyone's 'who owes who' updates instantly on their screen.",
            },
          ].map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white rounded-2xl p-6 border border-ink/10"
            >
              <span className="font-mono text-sm text-coral">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="font-display text-xl font-semibold mt-2 mb-2">{step.title}</h3>
              <p className="text-ink/70 text-sm leading-relaxed">{step.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="border-t border-ink/10 py-8 text-center text-sm text-ink/50">
        Built with the MERN stack + Socket.IO — real-time settling, no refresh needed.
      </footer>
    </div>
  );
}
