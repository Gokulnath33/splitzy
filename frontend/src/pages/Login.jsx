import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
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

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm bg-white rounded-2xl border border-ink/10 p-8 shadow-sm"
      >
        <Link to="/" className="font-display text-xl font-semibold text-emerald">
          splitzy
        </Link>
        <h1 className="font-display text-2xl font-semibold mt-6 mb-1">Welcome back</h1>
        <p className="text-sm text-ink/60 mb-6">Log in to see your groups</p>

        {error && <p className="text-coral text-sm mb-3">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-ink/15 focus:outline-none focus:ring-2 focus:ring-emerald/40"
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-ink/15 focus:outline-none focus:ring-2 focus:ring-emerald/40"
          />
          <button
            type="submit"
            className="w-full py-2.5 bg-emerald text-white rounded-lg font-medium hover:bg-emerald-light transition"
          >
            Log in
          </button>
        </form>

        <p className="text-sm text-ink/60 mt-5 text-center">
          No account?{" "}
          <Link to="/signup" className="text-emerald font-medium">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
