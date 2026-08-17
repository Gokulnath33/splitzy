import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import LiveBackground from "../components/LiveBackground";
import SpendingPieChart from "../components/SpendingPieChart";
import SplitzyLogo from "../components/SplitzyLogo";

const features = [
  { icon: "💸", title: "Split Expenses Instantly", desc: "Add expenses and split them equally or custom among friends.", color: "rgba(16,185,129,0.15)" },
  { icon: "👥", title: "Group Management", desc: "Create groups for trips, roommates, or any shared activity.", color: "rgba(139,92,246,0.15)" },
  { icon: "📊", title: "Real-Time Analytics", desc: "Track spending patterns with beautiful charts and insights.", color: "rgba(245,158,11,0.15)" },
  { icon: "🔔", title: "Live Notifications", desc: "Get instant updates when someone settles up or adds expenses.", color: "rgba(14,165,233,0.15)" },
  { icon: "🔒", title: "Secure & Private", desc: "Your data is encrypted and protected with industry standards.", color: "rgba(244,63,94,0.15)" },
];

const liveStats = [
  { value: "₹2.4L+", label: "Split this month", color: "#10b981" },
  { value: "1,200+", label: "Active users", color: "#8b5cf6" },
  { value: "98%", label: "Settled on time", color: "#f59e0b" },
];

export default function Login() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email: "", password: "" });
  const [resetForm, setResetForm] = useState({ email: "", code: "", newPassword: "" });
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/auth/login", form);
      login(data.token, data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    if (!resetForm.email.trim()) return setError("Please enter your email address.");
    try {
      const { data } = await api.post("/auth/forgot-password", { email: resetForm.email });
      setSuccessMsg(data.message);
      setMode("reset");
    } catch (err) {
      setError(err.response?.data?.message || "Request failed");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    try {
      const { data } = await api.post("/auth/reset-password", resetForm);
      setSuccessMsg(data.message);
      setMode("login");
      setForm({ email: resetForm.email, password: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed");
    }
  };

  return (
    <div className="auth-bg min-h-screen flex">
      {/* Live animated background */}
      <LiveBackground />

      {/* Floating decorative dots */}
      <div className="auth-dots">
        <span></span><span></span><span></span><span></span><span></span><span></span>
      </div>

      {/* ── Left Panel: Branding, Features & Pie Chart ── */}
      <div className="hidden lg:flex flex-col justify-center w-1/2 px-12 py-12 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link to="/" className="inline-block">
            <SplitzyLogo size="lg" animated />
          </Link>
          <h2 className="font-display text-4xl font-bold text-ink mt-4 mb-3 leading-tight">
            Split expenses,<br />
            <span className="text-gradient">not friendships.</span>
          </h2>
          <p className="text-ink-secondary text-lg mb-8 max-w-md leading-relaxed">
            The simplest way to share costs with friends, roommates, and travel buddies. Track everything in real-time.
          </p>

          {/* Live stats row */}
          <div className="flex gap-4 mb-8">
            {liveStats.map((stat, i) => (
              <motion.div
                key={i}
                className="glass-card card-shine rounded-xl px-4 py-3 text-center flex-1 hover-lift-glow cursor-default"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
              >
                <p className="font-display text-xl font-bold counter-flip" style={{ color: stat.color }}>{stat.value}</p>
                <p className="text-ink-muted text-[10px] mt-0.5">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Pie Chart */}
          <motion.div
            className="glass-card rounded-2xl p-5 mb-8 hover-lift-glow"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="live-badge">Live</div>
              <h4 className="text-ink text-sm font-semibold">Spending Analytics</h4>
            </div>
            <SpendingPieChart size={180} />
          </motion.div>

          {/* Features */}
          <div className="space-y-1">
            {features.map((f, i) => (
              <motion.div
                key={i}
                className="feature-item card-shine"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.6 + i * 0.08 }}
              >
                <div className="feature-icon" style={{ background: f.color }}>
                  {f.icon}
                </div>
                <div>
                  <h4 className="text-ink font-semibold text-sm">{f.title}</h4>
                  <p className="text-ink-muted text-xs leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex -space-x-2">
              {["🟢","🟣","🟡","🔵"].map((c, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-dark-bg flex items-center justify-center text-xs glow-ring" style={{ background: ['rgba(16,185,129,0.3)','rgba(139,92,246,0.3)','rgba(245,158,11,0.3)','rgba(14,165,233,0.3)'][i] }}>
                  {c}
                </div>
              ))}
            </div>
            <p className="text-ink-muted text-sm">
              <span className="text-emerald font-semibold">2,000+</span> users already splitting smarter
            </p>
          </div>
        </motion.div>
      </div>

      {/* ── Right Panel: Login Form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="glass-card card-shine rounded-2xl p-8 neon-glow-emerald">
            {/* Mobile-only branding */}
            <div className="lg:hidden mb-6">
              <Link to="/" className="inline-block">
                <SplitzyLogo size="md" animated />
              </Link>
              <p className="text-ink-secondary text-sm mt-1">Split expenses, not friendships.</p>
              {/* Mobile pie chart */}
              <div className="mt-4">
                <SpendingPieChart size={140} />
              </div>
            </div>

            {successMsg && (
              <div className="mb-4 p-3 bg-mint/20 border border-mint text-emerald rounded-lg text-xs leading-relaxed">
                {successMsg}
              </div>
            )}

            {error && <p className="text-coral text-sm mb-3">{error}</p>}

            <AnimatePresence mode="wait">
              {mode === "login" && (
                <motion.div
                  key="login"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <h1 className="font-display text-2xl font-semibold mb-1 text-ink">Welcome back</h1>
                  <p className="text-sm mb-6 text-ink-secondary">Log in to see your groups</p>

                  <form onSubmit={handleLogin} className="space-y-3">
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

                    <div className="text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setError("");
                          setSuccessMsg("");
                          setResetForm({ ...resetForm, email: form.email });
                          setMode("forgot");
                        }}
                        className="text-xs text-emerald font-medium hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 btn-gradient-primary btn-magnetic text-white rounded-lg font-bold"
                    >
                      Log in
                    </button>
                  </form>

                  <p className="text-sm mt-5 text-center text-ink-secondary">
                    No account?{" "}
                    <Link to="/signup" className="text-emerald font-medium hover:underline">
                      Sign up
                    </Link>
                  </p>
                </motion.div>
              )}

              {mode === "forgot" && (
                <motion.div
                  key="forgot"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <h1 className="font-display text-2xl font-semibold mb-1 text-ink">Forgot Password</h1>
                  <p className="text-sm mb-6 text-ink-secondary">Enter your email to receive a 6-digit verification code</p>

                  <form onSubmit={handleRequestCode} className="space-y-4">
                    <input
                      type="email"
                      placeholder="Your Email Address"
                      value={resetForm.email}
                      onChange={(e) => setResetForm({ ...resetForm, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-dark-border input-glow focus:outline-none focus:ring-2 focus:ring-emerald/40"
                    />
                    <button
                      type="submit"
                      className="w-full py-2.5 btn-gradient-primary btn-magnetic text-white rounded-lg font-bold"
                    >
                      Send Verification Code
                    </button>
                  </form>

                  <p className="text-sm mt-5 text-center text-ink-secondary">
                    Remember your password?{" "}
                    <button
                      onClick={() => { setError(""); setMode("login"); }}
                      className="text-emerald font-medium hover:underline"
                    >
                      Back to Login
                    </button>
                  </p>
                </motion.div>
              )}

              {mode === "reset" && (
                <motion.div
                  key="reset"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <h1 className="font-display text-2xl font-semibold mb-1 text-ink">Reset Password</h1>
                  <p className="text-sm mb-6 text-ink-secondary">Enter the 6-digit code sent to {resetForm.email}</p>

                  <form onSubmit={handleResetPassword} className="space-y-3">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="6-Digit Verification Code"
                      value={resetForm.code}
                      onChange={(e) => setResetForm({ ...resetForm, code: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-dark-border input-glow font-mono text-center tracking-widest text-lg focus:outline-none focus:ring-2 focus:ring-emerald/40"
                    />
                    <input
                      type="password"
                      placeholder="New Password (min 6 chars)"
                      value={resetForm.newPassword}
                      onChange={(e) => setResetForm({ ...resetForm, newPassword: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-dark-border input-glow focus:outline-none focus:ring-2 focus:ring-emerald/40"
                    />
                    <button
                      type="submit"
                      className="w-full py-2.5 btn-gradient-primary btn-magnetic text-white rounded-lg font-bold"
                    >
                      Update Password & Log In
                    </button>
                  </form>

                  <p className="text-sm mt-5 text-center text-ink-secondary">
                    Didn't get code?{" "}
                    <button
                      onClick={() => { setError(""); setMode("forgot"); }}
                      className="text-emerald font-medium hover:underline"
                    >
                      Resend Code
                    </button>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
