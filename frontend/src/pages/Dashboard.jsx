import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const [groups, setGroups] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
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
      <nav className="nav-glass flex items-center justify-between px-8 py-5">
        <Link to="/" className="font-display text-xl font-semibold text-gradient">
          splitzy
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

      <div className="max-w-4xl mx-auto px-8 py-12">


        <h1 className="font-display text-3xl font-semibold mb-8 text-gradient text-ink">Your groups</h1>

        <div className="flex gap-3 mb-10">
          <input
            placeholder="e.g. Goa Trip"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createGroup()}
            className="flex-1 max-w-sm px-4 py-2.5 rounded-lg border border-ink/15 focus:outline-none input-glow"
          />
          <button
            onClick={createGroup}
            className="px-5 py-2.5 btn-gradient-primary text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300"
          >
            New group
          </button>
        </div>

        {groups.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <div className="text-4xl mb-4">🏝️</div>
            <p className="text-ink-secondary">No groups yet — create one above to get started.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {groups.map((g, i) => (
              <motion.div
                key={g._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/groups/${g._id}`}
                  className="block gradient-border-card p-6 transition-all duration-300"
                >
                  <h3 className="font-display text-lg font-semibold mb-2 text-ink">{g.name}</h3>
                  <div className="flex -space-x-2">
                    {g.members.slice(0, 5).map((m) => (
                      <div
                        key={m._id}
                        className="w-7 h-7 rounded-full border-2 border-ink/30 flex items-center justify-center text-xs font-semibold text-white shadow-sm"
                        style={{ background: m.color || "#10b981" }}
                        title={m.name}
                      >
                        {m.name[0].toUpperCase()}
                      </div>
                    ))}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
