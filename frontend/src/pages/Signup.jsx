import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import LiveBackground from "../components/LiveBackground";
import SplitzyLogo from "../components/SplitzyLogo";

const steps = [
  { icon: "📝", text: "Create your account", color: "rgba(16,185,129,0.15)" },
  { icon: "✅", text: "Admin approves you", color: "rgba(139,92,246,0.15)" },
  { icon: "🎉", text: "Start splitting!", color: "rgba(245,158,11,0.15)" },
];

const benefits = [
  "No more awkward money conversations",
  "Real-time expense tracking & analytics",
  "Settle up with one tap",
  "Free forever for personal use",
  "Beautiful charts to track spending",
];

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [pendingApproval, setPendingApproval] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/auth/signup", form);
      if (data.isApproved) {
        login(data.token, data.user);
        navigate("/dashboard");
      } else {
        setPendingApproval(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    }
  };

  if (pendingApproval) {
    return (
      <div className="auth-bg min-h-screen flex items-center justify-center px-6">
        <LiveBackground />
        <div className="auth-dots">
          <span></span><span></span><span></span><span></span><span></span><span></span>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md glass-card rounded-2xl p-8 text-center space-y-4 neon-glow-emerald"
        >
          <motion.div
            className="text-5xl"
            animate={{ rotate: [0, 10, -10, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            ⏳
          </motion.div>
          <h1 className="font-display text-2xl font-semibold text-gradient">Account Pending Approval</h1>
          <p className="text-sm leading-relaxed text-ink-secondary">
            Your registration was successful! The Administrator will review your account in the dashboard.
          </p>
          <p className="text-xs bg-emerald/10 p-3 rounded-lg border border-emerald/20 text-ink-muted">
            Once approved by the administrator, you will receive an email notification and be able to log in to Splitzy.
          </p>
          <div className="pt-2">
            <Link to="/login" className="inline-block px-6 py-2.5 btn-gradient-primary btn-magnetic text-white rounded-lg font-bold">
              Go to Login Page
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="auth-bg min-h-screen flex">
      {/* Live animated background */}
      <LiveBackground />

      {/* Floating decorative dots */}
      <div className="auth-dots">
        <span></span><span></span><span></span><span></span><span></span><span></span>
      </div>

      {/* ── Left Panel: How It Works ── */}
      <div className="hidden lg:flex flex-col justify-center w-1/2 px-12 py-12">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link to="/" className="inline-block">
            <SplitzyLogo size="lg" animated />
          </Link>
          <h2 className="font-display text-4xl font-bold text-ink mt-4 mb-3 leading-tight">
            Join the smartest way<br />
            <span className="text-gradient-violet">to share expenses.</span>
          </h2>
          <p className="text-ink-secondary text-lg mb-10 max-w-md leading-relaxed">
            Create your account, get approved, and start splitting costs with your friends in seconds.
          </p>

          {/* Steps */}
          <div className="space-y-4 mb-8">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                className="feature-item card-shine"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.15 }}
              >
                <div className="feature-icon" style={{ background: step.color }}>
                  {step.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald font-bold text-sm">Step {i + 1}</span>
                  </div>
                  <p className="text-ink-secondary text-sm">{step.text}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Benefits card */}
          <motion.div
            className="glass-card card-shine rounded-xl p-5 max-w-sm hover-lift-glow"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <h4 className="text-ink font-semibold text-sm mb-3 flex items-center gap-2">
              <span className="text-emerald">✨</span> Why Splitzy?
            </h4>
            <div className="space-y-2.5">
              {benefits.map((b, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + i * 0.08 }}
                >
                  <span className="text-emerald text-xs flex-shrink-0">✓</span>
                  <span className="text-ink-muted text-xs">{b}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Trust badges */}
          <div className="mt-8 flex gap-3">
            {["🔒 Encrypted", "⚡ Real-time", "🌍 Free"].map((badge, i) => (
              <motion.div
                key={i}
                className="glass-card rounded-full px-3 py-1.5 text-xs text-ink-secondary hover-lift-glow cursor-default"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 + i * 0.1 }}
              >
                {badge}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Right Panel: Signup Form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="glass-card card-shine rounded-2xl p-8 neon-glow-violet">
            {/* Mobile-only branding */}
            <div className="lg:hidden mb-6">
              <Link to="/" className="inline-block">
                <SplitzyLogo size="md" animated />
              </Link>
              <p className="text-ink-secondary text-sm mt-1">Join the smartest way to share expenses.</p>
            </div>

            <h1 className="font-display text-2xl font-semibold mb-1 text-ink">Create your account</h1>
            <p className="text-sm mb-6 text-ink-secondary">Start splitting expenses in seconds</p>

            {error && <p className="text-coral text-sm mb-3">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-dark-border input-glow focus:outline-none focus:ring-2 focus:ring-emerald/40"
              />
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-dark-border input-glow focus:outline-none focus:ring-2 focus:ring-emerald/40"
              />
              <input
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-dark-border input-glow focus:outline-none focus:ring-2 focus:ring-emerald/40"
              />
              <button
                type="submit"
                className="w-full py-2.5 btn-gradient-primary btn-magnetic text-white rounded-lg font-bold"
              >
                Create account
              </button>
            </form>

            <p className="text-sm mt-5 text-center text-ink-secondary">
              Already have an account?{" "}
              <Link to="/login" className="text-emerald font-medium hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
