import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const [groups, setGroups] = useState([]);
  const [name, setName] = useState("");
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-cream">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-ink/10 bg-white">
        <Link to="/" className="font-display text-xl font-semibold text-emerald">
          splitzy
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-ink/70">Hi, {user?.name}</span>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="text-sm text-ink/60 hover:text-coral transition"
          >
            Log out
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-12">
        <h1 className="font-display text-3xl font-semibold mb-8">Your groups</h1>

        <div className="flex gap-3 mb-10">
          <input
            placeholder="e.g. Goa Trip"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createGroup()}
            className="flex-1 max-w-sm px-4 py-2.5 rounded-lg border border-ink/15 focus:outline-none focus:ring-2 focus:ring-emerald/40 bg-white"
          />
          <button
            onClick={createGroup}
            className="px-5 py-2.5 bg-emerald text-white rounded-lg font-medium hover:bg-emerald-light transition"
          >
            New group
          </button>
        </div>

        {groups.length === 0 ? (
          <p className="text-ink/50">No groups yet — create one above to get started.</p>
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
                  className="block bg-white rounded-2xl border border-ink/10 p-6 hover:border-emerald/40 hover:shadow-md transition"
                >
                  <h3 className="font-display text-lg font-semibold mb-2">{g.name}</h3>
                  <div className="flex -space-x-2">
                    {g.members.slice(0, 5).map((m) => (
                      <div
                        key={m._id}
                        className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-xs font-semibold text-white"
                        style={{ background: m.color || "#0B4F4A" }}
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
