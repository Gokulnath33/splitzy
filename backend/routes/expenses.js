const express = require("express");
const Group = require("../models/Group");
const Expense = require("../models/Expense");
const Settlement = require("../models/Settlement");
const User = require("../models/User");
const auth = require("../middleware/auth");
const { calculateBalances, simplifyDebts } = require("../utils/settleUp");

const router = express.Router();

// Get expenses, settlements, computed balances, and live progress stats
router.get("/:groupId/summary", auth, async (req, res) => {
  const group = await Group.findById(req.params.groupId).populate("members", "name email color");
  if (!group) return res.status(404).json({ message: "Group not found" });

  const expenses = await Expense.find({ group: group._id })
    .populate("paidBy", "name email color")
    .sort({ createdAt: -1 });
  const settlements = await Settlement.find({ group: group._id })
    .populate("from", "name color")
    .populate("to", "name color")
    .sort({ createdAt: -1 });

  const balances = calculateBalances(group.members, expenses, settlements);
  const transactions = simplifyDebts(balances);

  // Live "how much of this group is settled" progress stats
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalSettled = settlements.reduce((sum, s) => sum + s.amount, 0);
  // "amount that still needs to change hands" = sum of all outstanding debts
  const amountRemaining = transactions.reduce((sum, t) => sum + t.amount, 0);
  const amountToSettleOriginally = amountRemaining + totalSettled;
  const percentSettled =
    amountToSettleOriginally > 0
      ? Math.round((totalSettled / amountToSettleOriginally) * 100)
      : 100;

  res.json({
    group,
    expenses,
    settlements,
    balances,
    transactions,
    stats: {
      totalSpent,
      totalSettled,
      amountRemaining,
      percentSettled,
      expenseCount: expenses.length,
      memberCount: group.members.length,
      fullySettled: transactions.length === 0 && expenses.length > 0,
    },
  });
});

// Add a new expense — broadcasts live to everyone viewing the group
router.post("/:groupId/expenses", auth, async (req, res) => {
  const { description, amount, paidBy, splitAmong } = req.body;
  if (!description || !amount || !paidBy) {
    return res.status(400).json({ message: "description, amount, and paidBy are required" });
  }

  const expense = await Expense.create({
    group: req.params.groupId,
    description,
    amount: Number(amount),
    paidBy,
    splitAmong: splitAmong && splitAmong.length ? splitAmong : undefined,
  });
  const populated = await expense.populate("paidBy", "name email color");

  const io = req.app.get("io");
  io.to(req.params.groupId).emit("expense:added", populated);

  res.status(201).json(populated);
});

// Mark a debt as settled — broadcasts live to the group AND sends a
// personal "you got paid" notification straight to the recipient
router.post("/:groupId/settle", auth, async (req, res) => {
  const { from, to, amount } = req.body;
  if (!from || !to || !amount) {
    return res.status(400).json({ message: "from, to, and amount are required" });
  }

  const settlement = await Settlement.create({
    group: req.params.groupId,
    from,
    to,
    amount: Number(amount),
  });
  const populated = await settlement.populate([
    { path: "from", select: "name color" },
    { path: "to", select: "name color" },
  ]);

  const group = await Group.findById(req.params.groupId).select("name");

  const io = req.app.get("io");
  io.to(req.params.groupId).emit("settlement:added", populated);

  // Targeted, personal notification to whoever just got paid
  io.to(`user:${to}`).emit("notification:paymentReceived", {
    fromName: populated.from.name,
    fromColor: populated.from.color,
    amount: populated.amount,
    groupName: group?.name,
    groupId: req.params.groupId,
  });

  res.status(201).json(populated);
});

module.exports = router;
