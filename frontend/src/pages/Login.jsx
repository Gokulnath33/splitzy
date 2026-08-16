import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [mode, setMode] = useState("login"); // 'login' | 'forgot' | 'reset'
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
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d44 50%, #1a1a2e 100%)' }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm bg-white rounded-2xl p-8 shadow-lg"
      >
        <Link to="/" className="font-display text-xl font-semibold text-emerald">
          splitzy
        </Link>

        {successMsg && (
          <div className="mt-4 p-3 bg-mint/20 border border-mint text-emerald rounded-lg text-xs leading-relaxed">
            {successMsg}
          </div>
        )}

        {error && <p className="text-coral text-sm mt-4 mb-2">{error}</p>}

        <AnimatePresence mode="wait">
          {mode === "login" && (
            <motion.div
              key="login"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h1 className="font-display text-2xl font-semibold mt-4 mb-1" style={{ color: '#1a1d2e' }}>Welcome back</h1>
              <p className="text-sm mb-6" style={{ color: '#6b7280' }}>Log in to see your groups</p>

              <form onSubmit={handleLogin} className="space-y-3">
                <input
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-emerald/30 focus:outline-none focus:ring-2 focus:ring-emerald/40"
                  style={{ color: '#1a1d2e' }}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-emerald/30 focus:outline-none focus:ring-2 focus:ring-emerald/40"
                  style={{ color: '#1a1d2e' }}
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
                  className="w-full py-2.5 bg-emerald text-white rounded-lg font-medium hover:bg-emerald-light transition"
                >
                  Log in
                </button>
              </form>

              <p className="text-sm mt-5 text-center" style={{ color: '#6b7280' }}>
                No account?{" "}
                <Link to="/signup" className="text-emerald font-medium">
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
              <h1 className="font-display text-2xl font-semibold mt-4 mb-1" style={{ color: '#1a1d2e' }}>Forgot Password</h1>
              <p className="text-sm mb-6" style={{ color: '#6b7280' }}>Enter your email to receive a 6-digit verification code</p>

              <form onSubmit={handleRequestCode} className="space-y-4">
                <input
                  type="email"
                  placeholder="Your Email Address"
                  value={resetForm.email}
                  onChange={(e) => setResetForm({ ...resetForm, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-emerald/30 focus:outline-none focus:ring-2 focus:ring-emerald/40"
                  style={{ color: '#1a1d2e' }}
                />

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald text-white rounded-lg font-medium hover:bg-emerald-light transition"
                >
                  Send Verification Code
                </button>
              </form>

              <p className="text-sm mt-5 text-center" style={{ color: '#6b7280' }}>
                Remember your password?{" "}
                <button
                  onClick={() => {
                    setError("");
                    setMode("login");
                  }}
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
              <h1 className="font-display text-2xl font-semibold mt-4 mb-1" style={{ color: '#1a1d2e' }}>Reset Password</h1>
              <p className="text-sm mb-6" style={{ color: '#6b7280' }}>Enter the 6-digit code sent to {resetForm.email}</p>

              <form onSubmit={handleResetPassword} className="space-y-3">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="6-Digit Verification Code"
                  value={resetForm.code}
                  onChange={(e) => setResetForm({ ...resetForm, code: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-emerald/30 font-mono text-center tracking-widest text-lg focus:outline-none focus:ring-2 focus:ring-emerald/40"
                  style={{ color: '#1a1d2e' }}
                />
                <input
                  type="password"
                  placeholder="New Password (min 6 chars)"
                  value={resetForm.newPassword}
                  onChange={(e) => setResetForm({ ...resetForm, newPassword: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-emerald/30 focus:outline-none focus:ring-2 focus:ring-emerald/40"
                  style={{ color: '#1a1d2e' }}
                />

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald text-white rounded-lg font-medium hover:bg-emerald-light transition"
                >
                  Update Password & Log In
                </button>
              </form>

              <p className="text-sm mt-5 text-center" style={{ color: '#6b7280' }}>
                Didn't get code?{" "}
                <button
                  onClick={() => {
                    setError("");
                    setMode("forgot");
                  }}
                  className="text-emerald font-medium hover:underline"
                >
                  Resend Code
                </button>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
