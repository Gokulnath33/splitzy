import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api";
import socket from "../utils/socket";
import { useAuth } from "../context/AuthContext";
import AnimatedNumber from "../components/AnimatedNumber";
import PresenceAvatars from "../components/PresenceAvatars";
import GroupProgress from "../components/GroupProgress";

export default function GroupView() {
  const { id } = useParams();
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [presence, setPresence] = useState([]);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");
  const [expenseForm, setExpenseForm] = useState({ description: "", amount: "", paidBy: "" });

  const loadSummary = () => {
    api.get(`/groups/${id}/summary`).then((res) => {
      setGroup(res.data.group);
      setExpenses(res.data.expenses);
      setBalances(res.data.balances);
      setTransactions(res.data.transactions);
      setStats(res.data.stats);
      if (!expenseForm.paidBy) {
        setExpenseForm((f) => ({ ...f, paidBy: user?.id }));
      }
    });
  };

  useEffect(() => {
    loadSummary();
    // The socket connection itself is managed app-wide by NotificationProvider
    // (so personal notifications work on every page) — here we just join this
    // group's room and listen for updates to it.
    socket.emit("group:join", { groupId: id, userName: user?.name, color: user?.color });

    const onPresence = (people) => setPresence(people);
    const onExpenseAdded = () => loadSummary();
    const onSettlementAdded = () => loadSummary();

    socket.on("group:presence", onPresence);
    socket.on("expense:added", onExpenseAdded);
    socket.on("settlement:added", onSettlementAdded);

    return () => {
      socket.off("group:presence", onPresence);
      socket.off("expense:added", onExpenseAdded);
      socket.off("settlement:added", onSettlementAdded);
    };
  }, [id]);

  const addExpense = async (e) => {
    e.preventDefault();
    if (!expenseForm.description.trim() || !expenseForm.amount) return;
    await api.post(`/groups/${id}/expenses`, expenseForm);
    setExpenseForm({ description: "", amount: "", paidBy: expenseForm.paidBy });
    setShowAddExpense(false);
  };

  const addMember = async (e) => {
    e.preventDefault();
    if (!memberEmail.trim()) return;
    try {
      const { data } = await api.post(`/groups/${id}/members`, { email: memberEmail });
      setGroup(data);
      setMemberEmail("");
      setShowAddMember(false);
    } catch (err) {
      alert(err.response?.data?.message || "Could not add member");
    }
  };

  const settle = async (t) => {
    // Optimistic: remove this row immediately for whoever clicked it,
    // the server broadcast will confirm/refresh it for everyone shortly after.
    setTransactions((prev) => prev.filter((x) => !(x.from === t.from && x.to === t.to)));
    try {
      await api.post(`/groups/${id}/settle`, t);
    } catch (err) {
      alert(err.response?.data?.message || "Could not mark as paid");
      loadSummary(); // roll back the optimistic removal on failure
    }
  };

  const nameOf = (userId) => group?.members.find((m) => m._id === userId)?.name || "Someone";
  const colorOf = (userId) => group?.members.find((m) => m._id === userId)?.color || "#0B4F4A";

  if (!group) return <div className="min-h-screen bg-cream flex items-center justify-center">Loading…</div>;

  return (
    <div className="min-h-screen bg-cream">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-ink/10 bg-white">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="font-display text-xl font-semibold text-emerald">
            splitzy
          </Link>
          <span className="text-ink/30">/</span>
          <span className="font-medium">{group.name}</span>
        </div>
        <PresenceAvatars people={presence} />
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-10">
        {stats && <GroupProgress stats={stats} />}

        {/* Balances */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          {group.members.map((m) => {
            const bal = balances[m._id] || 0;
            const isYou = m._id === user?.id;
            return (
              <div key={m._id} className="bg-white rounded-2xl border border-ink/10 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                    style={{ background: m.color }}
                  >
                    {m.name[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-medium">{isYou ? "You" : m.name}</span>
                </div>
                <div
                  className="text-xl font-semibold"
                  style={{ color: bal >= 0 ? "var(--color-mint)" : "var(--color-coral)" }}
                >
                  {bal >= 0 ? "+" : "-"}
                  <AnimatedNumber value={bal} />
                </div>
                <p className="text-xs text-ink/50 mt-1">{bal >= 0 ? "is owed" : "owes overall"}</p>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 mb-10">
          <button
            onClick={() => setShowAddExpense(true)}
            className="px-5 py-2.5 bg-emerald text-white rounded-lg font-medium hover:bg-emerald-light transition"
          >
            + Add expense
          </button>
          <button
            onClick={() => setShowAddMember(true)}
            className="px-5 py-2.5 border border-ink/15 rounded-lg font-medium hover:border-emerald/40 transition"
          >
            + Add member
          </button>
        </div>

        {/* Settle up */}
        {transactions.length > 0 && (
          <div className="mb-10">
            <h2 className="font-display text-xl font-semibold mb-4">Settle up</h2>
            <div className="space-y-2">
              <AnimatePresence initial={false}>
                {transactions.map((t) => (
                  <motion.div
                    key={`${t.from}-${t.to}`}
                    layout
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center justify-between bg-white rounded-xl border border-ink/10 px-5 py-3 overflow-hidden"
                  >
                    <span className="text-sm">
                      <strong>{nameOf(t.from)}</strong> pays <strong>{nameOf(t.to)}</strong>
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-semibold text-emerald">₹{t.amount.toFixed(2)}</span>
                      <motion.button
                        whileTap={{ scale: 0.92 }}
                        onClick={() => settle(t)}
                        className="text-xs px-3 py-1.5 bg-mint/20 text-emerald rounded-full font-medium hover:bg-mint/40 transition"
                      >
                        Mark paid
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Activity feed */}
        <div>
          <h2 className="font-display text-xl font-semibold mb-4">Activity</h2>
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {expenses.map((exp) => (
                <motion.div
                  key={exp._id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between bg-white rounded-xl border border-ink/10 px-5 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                      style={{ background: exp.paidBy.color }}
                    >
                      {exp.paidBy.name[0].toUpperCase()}
                    </div>
                    <span className="text-sm">
                      <strong>{exp.paidBy.name}</strong> added <strong>{exp.description}</strong>
                    </span>
                  </div>
                  <span className="font-mono font-semibold">₹{exp.amount.toFixed(2)}</span>
                </motion.div>
              ))}
            </AnimatePresence>
            {expenses.length === 0 && <p className="text-ink/50 text-sm">No expenses yet.</p>}
          </div>
        </div>
      </div>

      {/* Add expense modal */}
      <AnimatePresence>
        {showAddExpense && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink/40 flex items-center justify-center px-6 z-50"
            onClick={() => setShowAddExpense(false)}
          >
            <motion.form
              onSubmit={addExpense}
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-3"
            >
              <h3 className="font-display text-xl font-semibold mb-2">Add an expense</h3>
              <input
                placeholder="What was it for?"
                value={expenseForm.description}
                onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-ink/15 focus:outline-none focus:ring-2 focus:ring-emerald/40"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Amount (₹)"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-ink/15 focus:outline-none focus:ring-2 focus:ring-emerald/40"
              />
              <select
                value={expenseForm.paidBy}
                onChange={(e) => setExpenseForm({ ...expenseForm, paidBy: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-ink/15 focus:outline-none focus:ring-2 focus:ring-emerald/40"
              >
                {group.members.map((m) => (
                  <option key={m._id} value={m._id}>
                    Paid by {m._id === user?.id ? "You" : m.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-ink/50">Split equally across all {group.members.length} members.</p>
              <button
                type="submit"
                className="w-full py-2.5 bg-emerald text-white rounded-lg font-medium hover:bg-emerald-light transition"
              >
                Add expense
              </button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add member modal */}
      <AnimatePresence>
        {showAddMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink/40 flex items-center justify-center px-6 z-50"
            onClick={() => setShowAddMember(false)}
          >
            <motion.form
              onSubmit={addMember}
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-3"
            >
              <h3 className="font-display text-xl font-semibold mb-2">Add a member</h3>
              <input
                type="email"
                placeholder="Their email (must already have an account)"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-ink/15 focus:outline-none focus:ring-2 focus:ring-emerald/40"
              />
              <button
                type="submit"
                className="w-full py-2.5 bg-emerald text-white rounded-lg font-medium hover:bg-emerald-light transition"
              >
                Add to group
              </button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
