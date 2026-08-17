import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api";
import socket from "../utils/socket";
import { useAuth } from "../context/AuthContext";
import AnimatedNumber from "../components/AnimatedNumber";
import PresenceAvatars from "../components/PresenceAvatars";
import GroupProgress from "../components/GroupProgress";
import CategoryAnalytics from "../components/CategoryAnalytics";
import LiveBackground from "../components/LiveBackground";
import SplitzyLogo from "../components/SplitzyLogo";
import { getCurrencySymbol } from "../utils/currency";

const CATEGORIES = [
  { name: "General", icon: "🧾" },
  { name: "Food", icon: "🍔" },
  { name: "Transport", icon: "🚗" },
  { name: "Housing", icon: "🏠" },
  { name: "Entertainment", icon: "🎬" },
  { name: "Shopping", icon: "🛍️" },
];

export default function GroupView() {
  const { id } = useParams();
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState({});
  const [stats, setStats] = useState(null);
  const [presence, setPresence] = useState([]);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");

  const [expenseForm, setExpenseForm] = useState({
    description: "",
    amount: "",
    paidBy: "",
    category: "General",
    splitType: "EQUAL",
    customSplits: {}, // userId -> amount or percentage
  });

  const loadSummary = () => {
    api.get(`/groups/${id}/summary`).then((res) => {
      setGroup(res.data.group);
      setExpenses(res.data.expenses);
      setBalances(res.data.balances);
      setTransactions(res.data.transactions);
      setCategories(res.data.categories || {});
      setStats(res.data.stats);
      if (!expenseForm.paidBy) {
        setExpenseForm((f) => ({ ...f, paidBy: user?.id }));
      }
    });
  };

  useEffect(() => {
    loadSummary();
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

  const updateCurrency = async (newCurrency) => {
    try {
      const { data } = await api.put(`/groups/${id}`, { currency: newCurrency });
      setGroup(data);
    } catch (err) {
      alert("Could not update currency");
    }
  };

  const handleCustomSplitChange = (userId, value) => {
    setExpenseForm((prev) => ({
      ...prev,
      customSplits: {
        ...prev.customSplits,
        [userId]: value,
      },
    }));
  };

  const addExpense = async (e) => {
    e.preventDefault();
    if (!expenseForm.description.trim() || !expenseForm.amount) return;

    let splitDetails = undefined;
    if (expenseForm.splitType !== "EQUAL") {
      splitDetails = group.members.map((m) => ({
        user: m._id,
        amount: expenseForm.splitType === "EXACT" ? Number(expenseForm.customSplits[m._id] || 0) : undefined,
        percentage: expenseForm.splitType === "PERCENTAGE" ? Number(expenseForm.customSplits[m._id] || 0) : undefined,
      }));
    }

    try {
      await api.post(`/groups/${id}/expenses`, {
        description: expenseForm.description,
        amount: Number(expenseForm.amount),
        paidBy: expenseForm.paidBy,
        category: expenseForm.category,
        splitType: expenseForm.splitType,
        splitDetails,
      });

      setExpenseForm({
        description: "",
        amount: "",
        paidBy: expenseForm.paidBy,
        category: "General",
        splitType: "EQUAL",
        customSplits: {},
      });
      setShowAddExpense(false);
    } catch (err) {
      alert(err.response?.data?.message || "Could not add expense");
    }
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
    setTransactions((prev) => prev.filter((x) => !(x.from === t.from && x.to === t.to)));
    try {
      await api.post(`/groups/${id}/settle`, t);
    } catch (err) {
      alert(err.response?.data?.message || "Could not mark as paid");
      loadSummary();
    }
  };

  const nameOf = (userId) => group?.members.find((m) => m._id === userId)?.name || "Someone";
  const currencySym = getCurrencySymbol(group?.currency);

  if (!group) return <div className="dashboard-bg min-h-screen flex items-center justify-center"><p className="text-gradient font-display text-xl">Loading…</p></div>;

  return (
    <div className="dashboard-bg min-h-screen">
      <LiveBackground variant="particles" />
      <div className="grid-overlay"></div>
      <nav className="nav-glass flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="inline-block">
            <SplitzyLogo size="sm" animated />
          </Link>
          <span className="text-ink-muted">/</span>
          <span className="font-medium">{group.name}</span>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={group.currency || "INR"}
            onChange={(e) => updateCurrency(e.target.value)}
            className="text-xs font-mono bg-cream/30 px-2 py-1 rounded border border-ink/20 text-ink focus:outline-none"
            title="Group Currency"
          >
            <option value="INR">INR (₹)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
          </select>
          <PresenceAvatars people={presence} />
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-10">
        {stats && <GroupProgress stats={stats} currency={group.currency} />}

        {/* Category Breakdown Chart */}
        <CategoryAnalytics categories={categories} currency={group.currency} totalSpent={stats?.totalSpent || 0} />

        {/* Balances */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          {group.members.map((m) => {
            const bal = balances[m._id] || 0;
            const isYou = m._id === user?.id;
            return (
              <div key={m._id} className="stat-card rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-7 h-7 rounded-full border-2 border-ink/30 flex items-center justify-center text-xs font-semibold text-white"
                    style={{ background: m.color }}
                  >
                    {m.name[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-ink">{isYou ? "You" : m.name}</span>
                </div>
                <div
                  className="text-xl font-semibold"
                  style={{ color: bal >= 0 ? "var(--color-mint)" : "var(--color-coral)" }}
                >
                  {bal >= 0 ? "+" : "-"}
                  {currencySym}
                  <AnimatedNumber value={Math.abs(bal)} />
                </div>
                <p className="text-xs text-ink-secondary mt-1">{bal >= 0 ? "is owed" : "owes overall"}</p>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 mb-10">
          <button
            onClick={() => setShowAddExpense(true)}
            className="px-5 py-2.5 btn-gradient-primary text-white rounded-lg font-medium"
          >
            + Add expense
          </button>
          <button
            onClick={() => setShowAddMember(true)}
            className="px-5 py-2.5 btn-outline-glow rounded-lg font-medium"
          >
            + Add member
          </button>
        </div>

        {/* Settle up */}
        {transactions.length > 0 && (
          <div className="mb-10">
            <h2 className="font-display text-xl font-semibold mb-4 text-gradient text-ink">Settle up</h2>
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
                    className="flex items-center justify-between interactive-row rounded-xl px-5 py-3 overflow-hidden"
                  >
                    <span className="text-sm text-ink">
                      <strong>{nameOf(t.from)}</strong> pays <strong>{nameOf(t.to)}</strong>
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-semibold text-emerald">
                        {currencySym}{t.amount.toFixed(2)}
                      </span>
                      <motion.button
                        whileTap={{ scale: 0.92 }}
                        onClick={() => settle(t)}
                        className="text-xs px-3 py-1.5 bg-mint/30 text-emerald rounded-full font-medium hover:bg-mint/50 transition text-white"
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
          <h2 className="font-display text-xl font-semibold mb-4 text-gradient text-ink">Activity</h2>
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {expenses.map((exp) => {
                const catObj = CATEGORIES.find((c) => c.name === (exp.category || "General")) || CATEGORIES[0];
                return (
                  <motion.div
                    key={exp._id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between interactive-row rounded-xl px-5 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full border-2 border-ink/30 flex items-center justify-center text-xs font-semibold text-white"
                        style={{ background: exp.paidBy.color }}
                      >
                        {exp.paidBy.name[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm text-ink">
                          <strong>{exp.paidBy.name}</strong> added <strong>{exp.description}</strong>
                        </div>
                        <div className="text-xs text-ink-muted flex items-center gap-1.5 mt-0.5">
                          <span>{catObj.icon} {exp.category || "General"}</span>
                          <span>•</span>
                          <span>{exp.splitType || "EQUAL"} split</span>
                        </div>
                      </div>
                    </div>
                    <span className="font-mono font-semibold text-ink">
                      {currencySym}{exp.amount.toFixed(2)}
                    </span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {expenses.length === 0 && <p className="text-ink-secondary text-sm">No expenses yet.</p>}
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
              className="glass-card rounded-2xl p-6 w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <h3 className="font-display text-xl font-semibold text-white">Add an expense</h3>
              <input
                placeholder="What was it for?"
                value={expenseForm.description}
                onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-ink/15 focus:outline-none input-glow bg-white/80"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-ink-secondary font-medium mb-1 block">Amount ({currencySym})</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-ink/15 focus:outline-none input-glow"
                  />
                </div>
                <div>
                  <label className="text-xs text-ink-secondary font-medium mb-1 block">Category</label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-ink/15 focus:outline-none input-glow"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-ink-secondary font-medium mb-1 block">Paid by</label>
                <select
                  value={expenseForm.paidBy}
                  onChange={(e) => setExpenseForm({ ...expenseForm, paidBy: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-ink/15 focus:outline-none input-glow"
                >
                  {group.members.map((m) => (
                    <option key={m._id} value={m._id}>
                      Paid by {m._id === user?.id ? "You" : m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-ink-secondary font-medium mb-1 block">Split Method</label>
                <select
                  value={expenseForm.splitType}
                  onChange={(e) => setExpenseForm({ ...expenseForm, splitType: e.target.value, customSplits: {} })}
                  className="w-full px-4 py-2.5 rounded-lg border border-ink/15 focus:outline-none input-glow"
                >
                  <option value="EQUAL">Split Equally</option>
                  <option value="EXACT">Exact Amounts</option>
                  <option value="PERCENTAGE">Percentages (%)</option>
                </select>
              </div>

              {/* Custom Split Details inputs */}
              {expenseForm.splitType !== "EQUAL" && (
                <div className="p-3 bg-cream/30 rounded-xl space-y-2 border border-ink/20">
                  <div className="text-xs font-semibold text-ink-secondary">
                    {expenseForm.splitType === "EXACT" ? `Enter Exact Amount (${currencySym})` : "Enter Share Percentage (%)"}
                  </div>
                  {group.members.map((m) => (
                    <div key={m._id} className="flex items-center justify-between gap-3 text-sm text-ink">
                      <span>{m._id === user?.id ? "You" : m.name}</span>
                      <input
                        type="number"
                        step="0.01"
                        placeholder={expenseForm.splitType === "EXACT" ? "0.00" : "0%"}
                        value={expenseForm.customSplits[m._id] || ""}
                        onChange={(e) => handleCustomSplitChange(m._id, e.target.value)}
                        className="w-28 px-3 py-1.5 rounded border border-ink/20 bg-cream/20 text-right focus:outline-none text-ink"
                      />
                    </div>
                  ))}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 btn-gradient-primary text-white rounded-lg font-medium"
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
              className="glass-card rounded-2xl p-6 w-full max-w-sm space-y-3"
            >
              <h3 className="font-display text-xl font-semibold mb-2 text-white">Add a member</h3>
              <input
                type="email"
                placeholder="Their email (must already have an account)"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-ink/15 focus:outline-none input-glow"
              />
              <button
                type="submit"
                className="w-full py-2.5 btn-gradient-primary text-white rounded-lg font-medium"
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
