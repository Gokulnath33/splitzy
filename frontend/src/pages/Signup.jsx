import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

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
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d44 50%, #1a1a2e 100%)' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white rounded-2xl p-8 shadow-lg text-center space-y-4"
        >
          <div className="text-4xl">⏳</div>
          <h1 className="font-display text-2xl font-semibold text-emerald">Account Pending Approval</h1>
          <p className="text-sm leading-relaxed" style={{ color: '#6b7280' }}>
            Your registration was successful! The Administrator will review your account in the dashboard.
          </p>
          <p className="text-xs bg-mint/10 p-3 rounded-lg border border-mint/20" style={{ color: '#9ca3af' }}>
            Once approved by the administrator, you will receive an email notification and be able to log in to Splitzy.
          </p>
          <div className="pt-2">
            <Link to="/login" className="inline-block px-5 py-2.5 bg-emerald text-white rounded-lg font-medium hover:bg-emerald-light transition">
              Go to Login Page
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d44 50%, #1a1a2e 100%)' }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm bg-white rounded-2xl border border-ink/10 p-8 shadow-sm"
      >
        <Link to="/" className="font-display text-xl font-semibold text-emerald">
          splitzy
        </Link>
        <h1 className="font-display text-2xl font-semibold mt-6 mb-1" style={{ color: '#1a1d2e' }}>Create your account</h1>
        <p className="text-sm mb-6" style={{ color: '#6b7280' }}>Start splitting expenses in seconds</p>

        {error && <p className="text-coral text-sm mb-3">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-emerald/30 focus:outline-none focus:ring-2 focus:ring-emerald/40"
            style={{ color: '#1a1d2e' }}
          />
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
          <button
            type="submit"
            className="w-full py-2.5 bg-emerald text-white rounded-lg font-medium hover:bg-emerald-light transition"
          >
            Create account
          </button>
        </form>

        <p className="text-sm mt-5 text-center" style={{ color: '#6b7280' }}>
          Already have an account?{" "}
          <Link to="/login" className="text-emerald font-medium">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
