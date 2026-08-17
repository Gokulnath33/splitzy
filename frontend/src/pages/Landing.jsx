import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import LiveBackground from "../components/LiveBackground";
import SplitzyLogo from "../components/SplitzyLogo";
import SpendingPieChart from "../components/SpendingPieChart";

const strips = [
  { label: "Hotel", who: "Arun", amount: "₹1,200" },
  { label: "Dinner", who: "Priya", amount: "₹800" },
  { label: "Cabs", who: "Ravi", amount: "₹400" },
];

const useCases = [
  {
    img: "/trip-split.png",
    title: "Group Trips",
    desc: "Split hotels, cabs, food, and activities effortlessly on your next vacation.",
    gradient: "from-emerald/20 to-sky/20",
  },
  {
    img: "/roommates-split.png",
    title: "Roommates",
    desc: "Share rent, utilities, groceries, and household expenses without the awkwardness.",
    gradient: "from-violet/20 to-rose/20",
  },
  {
    img: "/realtime-analytics.png",
    title: "Real-Time Tracking",
    desc: "Watch balances update live as expenses are added. Beautiful charts & insights.",
    gradient: "from-amber/20 to-emerald/20",
  },
];

const testimonials = [
  { name: "Arun K.", text: "Finally an app that makes splitting rent painless! The live updates are amazing.", role: "Software Engineer" },
  { name: "Priya M.", text: "Used it on our Goa trip — no more end-of-trip math anxiety!", role: "Travel Blogger" },
  { name: "Ravi S.", text: "The real-time notifications keep everyone accountable. Love it!", role: "College Student" },
];

export default function Landing() {
  return (
    <div className="min-h-screen text-ink landing-page">
      {/* Live animated background */}
      <LiveBackground />

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-6xl mx-auto">
        <SplitzyLogo size="md" animated />
        <div className="flex gap-3">
          <Link to="/login" className="px-4 py-2 text-sm font-medium text-ink-secondary hover:text-emerald hover:scale-105 transition-all duration-300">
            Log in
          </Link>
          <Link
            to="/signup"
            className="px-5 py-2 text-sm font-medium btn-gradient-primary btn-magnetic text-white rounded-full"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-8 pt-8 pb-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-1.5 mb-6"
          >
            <div className="live-badge">New</div>
            <span className="text-xs text-ink-secondary">Real-time expense splitting is here</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-display text-5xl md:text-6xl font-semibold leading-[1.05] mb-6"
          >
            Split the bill.
            <br />
            <span className="text-gradient">Not the friendship.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-ink-secondary mb-8 max-w-md"
          >
            Add an expense from any phone. Everyone's balance updates instantly, live,
            for the whole group — no refreshing, no spreadsheets, no math.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap gap-3"
          >
            <Link
              to="/signup"
              className="inline-block px-7 py-3.5 btn-gradient-primary btn-magnetic text-white rounded-full font-medium"
            >
              Start a group — it's free
            </Link>
            <Link
              to="/login"
              className="inline-block px-7 py-3.5 btn-outline-glow rounded-full font-medium"
            >
              Already a member?
            </Link>
          </motion.div>

          {/* Mini stats */}
          <motion.div
            className="flex gap-6 mt-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {[
              { val: "2,000+", label: "Users" },
              { val: "₹10L+", label: "Split" },
              { val: "98%", label: "Settled" },
            ].map((s, i) => (
              <div key={i}>
                <p className="font-display text-2xl font-bold text-gradient">{s.val}</p>
                <p className="text-xs text-ink-muted">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Hero image + receipt strips */}
        <div className="relative flex items-center justify-center">
          <motion.div
            className="relative landing-img-glow"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <img
              src="/hero-split.png"
              alt="Friends splitting expenses"
              className="landing-img w-full max-w-lg object-cover"
              style={{ aspectRatio: "1/1" }}
            />
          </motion.div>

          {/* Floating receipt strips */}
          <div className="absolute -left-4 top-1/2 -translate-y-1/2 hidden md:block">
            <div className="relative w-48">
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
                  transition={{ duration: 0.7, delay: 0.6 + i * 0.15, ease: "easeOut" }}
                  className="absolute w-full bg-white border border-ink/10 shadow-lg px-4 py-3 rounded-lg"
                  style={{ top: i * 75, zIndex: strips.length - i }}
                >
                  <div className="flex justify-between items-baseline border-b border-dashed border-ink/15 pb-1.5 mb-1.5">
                    <span className="font-mono text-[10px] text-ink-muted">PAID BY {s.who.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-body text-xs" style={{ color: '#1a1d2e' }}>{s.label}</span>
                    <span className="font-mono font-semibold text-emerald text-xs">{s.amount}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Floating pie chart badge */}
          <motion.div
            className="absolute -right-2 bottom-8 glass-card rounded-xl p-3 hidden md:block float-img"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 }}
          >
            <SpendingPieChart size={100} />
          </motion.div>
        </div>
      </section>

      {/* Use Cases with Images */}
      <section className="max-w-6xl mx-auto px-8 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl font-semibold mb-3">Built for every occasion</h2>
          <p className="text-ink-secondary max-w-lg mx-auto">Whether it's a vacation, your apartment, or a night out — Splitzy has you covered.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {useCases.map((uc, i) => (
            <motion.div
              key={uc.title}
              className="showcase-card hover-lift-glow"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
            >
              <div className="overflow-hidden" style={{ height: "220px" }}>
                <img
                  src={uc.img}
                  alt={uc.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="showcase-overlay">
                <h3 className="font-display text-lg font-semibold text-ink mb-1">{uc.title}</h3>
                <p className="text-ink-secondary text-sm">{uc.desc}</p>
              </div>
              {/* Always-visible label below image */}
              <div className="p-4">
                <h3 className="font-display text-lg font-semibold text-ink mb-1">{uc.title}</h3>
                <p className="text-ink-secondary text-sm">{uc.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-8 pb-20">
        <h2 className="font-display text-3xl font-semibold mb-10 text-center">How it works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: "👥",
              title: "Create a group",
              body: "Start a group for a trip, flat, or event, and add your friends by email.",
            },
            {
              icon: "💸",
              title: "Log expenses as they happen",
              body: "Anyone adds what they paid for — the app splits it equally across the group automatically.",
            },
            {
              icon: "⚡",
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
              className="glass-card card-shine rounded-2xl p-6 hover-lift-glow"
            >
              <div className="text-3xl mb-3">{step.icon}</div>
              <span className="font-mono text-sm text-coral font-bold">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="font-display text-xl font-semibold mt-2 mb-2">{step.title}</h3>
              <p className="text-ink-secondary text-sm leading-relaxed">{step.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-6xl mx-auto px-8 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl font-semibold mb-3">Loved by users</h2>
          <p className="text-ink-secondary">See what people are saying about Splitzy.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              className="glass-card card-shine rounded-2xl p-6 hover-lift-glow"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, j) => (
                  <span key={j} className="text-amber text-sm">★</span>
                ))}
              </div>
              <p className="text-ink-secondary text-sm leading-relaxed mb-4 italic">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: ['#10b981', '#8b5cf6', '#f59e0b'][i] }}
                >
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-ink text-sm font-semibold">{t.name}</p>
                  <p className="text-ink-muted text-xs">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-8 pb-20">
        <motion.div
          className="glass-card card-shine rounded-3xl p-10 text-center neon-glow-emerald hover-lift-glow"
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <div className="mb-4">
            <SplitzyLogo size="lg" animated showText={false} />
          </div>
          <h2 className="font-display text-3xl font-semibold mb-3 text-ink">Ready to start splitting?</h2>
          <p className="text-ink-secondary mb-8 max-w-md mx-auto">
            Join thousands of users who never worry about splitting bills again. It's free, fast, and fun.
          </p>
          <Link
            to="/signup"
            className="inline-block px-8 py-4 btn-gradient-primary btn-magnetic text-white rounded-full font-medium text-lg"
          >
            Get started for free
          </Link>
        </motion.div>
      </section>

      <footer className="border-t border-ink/20 py-8 text-center text-sm text-ink-muted">
        <div className="flex items-center justify-center gap-2 mb-3">
          <SplitzyLogo size="sm" showText={false} />
          <span className="font-display text-sm font-semibold text-gradient">splitzy</span>
        </div>
        Built with the MERN stack + Socket.IO — real-time settling, no refresh needed.
      </footer>
    </div>
  );
}
