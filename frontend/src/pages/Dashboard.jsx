import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import LiveBackground from "../components/LiveBackground";
import SpendingPieChart from "../components/SpendingPieChart";
import SplitzyLogo from "../components/SplitzyLogo";

export default function Dashboard() {
  const [groups, setGroups] = useState([]);
  const [name, setName] = useState("");
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.email === "gokulnath2006mg@gmail.com";

  useEffect(() => {
    api.get("/groups").then((res) => setGroups(res.data));
  }, []);

  const createGroup = async () => {
    if (!name.trim()) return;
    const { data } = await api.post("/groups", { name });
    setGroups([data, ...groups]);
    setName("");
  };

  return (
    <div className="dashboard-bg min-h-screen">
      <LiveBackground variant="particles" />
      <div className="grid-overlay"></div>
      <nav className="nav-glass flex items-center justify-between px-8 py-5">
        <Link to="/" className="inline-block">
          <SplitzyLogo size="md" animated />
        </Link>
        <div className="flex items-center gap-4">
          {isAdmin && (
            <Link to="/admin" className="text-sm font-medium text-violet hover:text-violet-light hover:scale-105 transition-all duration-300">
              Admin Panel
            </Link>
          )}
          <span className="text-sm text-ink-secondary">Hi, {user?.name}</span>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="text-sm text-ink/60 hover:text-coral hover:scale-105 transition-all duration-300"
          >
            Log out
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-8 py-12">

        {/* Welcome Banner */}
        <motion.div
          className="glass-card card-shine rounded-2xl p-6 mb-8 flex items-center justify-between hover-lift-glow"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink">Welcome back, {user?.name}!</h1>
            <p className="text-ink-secondary text-sm mt-1">Track and split your expenses with ease.</p>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <div className="live-badge">Live</div>
            <div className="w-10 h-10 rounded-full spin-ring border-2 border-emerald/30 border-t-emerald" />
          </div>
        </motion.div>

        {/* Quick Stats + Pie Chart Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div
            className="stat-card card-shine rounded-2xl p-5 hover-lift-glow border-l-4 border-emerald"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <p className="text-ink-muted text-xs font-medium uppercase tracking-wide">Total Groups</p>
            <p className="font-display text-3xl font-bold text-emerald mt-1 counter-flip">{groups.length}</p>
            <p className="text-ink-muted text-xs mt-1">Active groups</p>
          </motion.div>
          <motion.div
            className="stat-card card-shine rounded-2xl p-5 hover-lift-glow border-l-4 border-violet"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-ink-muted text-xs font-medium uppercase tracking-wide">Members</p>
            <p className="font-display text-3xl font-bold text-violet mt-1 counter-flip">
              {groups.reduce((acc, g) => acc + g.members.length, 0)}
            </p>
            <p className="text-ink-muted text-xs mt-1">Across all groups</p>
          </motion.div>
          <motion.div
            className="stat-card card-shine rounded-2xl p-5 hover-lift-glow border-l-4 border-amber"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-ink-muted text-xs font-medium uppercase tracking-wide">Your Status</p>
            <p className="font-display text-xl font-bold text-amber mt-1">All Settled</p>
            <p className="text-ink-muted text-xs mt-1">No pending dues</p>
          </motion.div>
        </div>

        {/* Create Group */}
        <motion.div
          className="glass-card rounded-2xl p-6 mb-8 hover-lift-glow"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <h2 className="font-display text-xl font-semibold mb-4 text-gradient text-ink">Create a new group</h2>
          <div className="flex gap-3">
            <input
              placeholder="e.g. Goa Trip"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createGroup()}
              className="flex-1 max-w-sm px-4 py-2.5 rounded-lg border border-ink/15 focus:outline-none input-glow"
            />
            <button
              onClick={createGroup}
              className="px-5 py-2.5 btn-gradient-primary btn-magnetic text-white rounded-lg font-medium"
            >
              New group
            </button>
          </div>
        </motion.div>

        {/* Groups Grid */}
        <h2 className="font-display text-xl font-semibold mb-4 text-gradient text-ink">Your groups</h2>

        {groups.length === 0 ? (
          <motion.div
            className="glass-card card-shine rounded-2xl p-12 text-center hover-lift-glow"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <motion.div
              className="text-5xl mb-4"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🏝️
            </motion.div>
            <p className="text-ink-secondary">No groups yet — create one above to get started.</p>
          </motion.div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4 stagger-in">
            {groups.map((g, i) => (
              <motion.div
                key={g._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
              >
                <Link
                  to={`/groups/${g._id}`}
                  className="block gradient-border-card p-6 transition-all duration-300 card-shine hover-lift-glow"
                >
                  <h3 className="font-display text-lg font-semibold mb-3 text-ink">{g.name}</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {g.members.slice(0, 5).map((m) => (
                        <div
                          key={m._id}
                          className="w-7 h-7 rounded-full border-2 border-ink/30 flex items-center justify-center text-xs font-semibold text-white shadow-sm glow-ring"
                          style={{ background: m.color || "#10b981" }}
                          title={m.name}
                        >
                          {m.name[0].toUpperCase()}
                        </div>
                      ))}
                    </div>
                    <span className="text-xs text-ink-muted">{g.members.length} member{g.members.length > 1 ? "s" : ""}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Spending Pie Chart Section */}
        {groups.length > 0 && (
          <motion.div
            className="glass-card card-shine rounded-2xl p-6 mt-8 hover-lift-glow"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="live-badge">Live</div>
              <h3 className="font-display text-lg font-semibold text-ink">Spending Overview</h3>
            </div>
            <SpendingPieChart size={220} />
          </motion.div>
        )}
      </div>
    </div>
  );
}
