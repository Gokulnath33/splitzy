const express = require("express");
const Group = require("../models/Group");
const Expense = require("../models/Expense");
const Settlement = require("../models/Settlement");
const User = require("../models/User");
const auth = require("../middleware/auth");
const { validateBody, expenseSchema, settlementSchema } = require("../middleware/validation");
const { calculateBalances, simplifyDebts } = require("../utils/settleUp");
const { sendPaymentReceivedEmail, sendExpenseAddedEmail } = require("../utils/email");

const router = express.Router();

const CURRENCY_SYMBOLS = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

// Get expenses, settlements, computed balances, category breakdown, and live progress stats
router.get("/:groupId/summary", auth, async (req, res) => {
  const group = await Group.findById(req.params.groupId).populate("members", "name email color");
  if (!group) return res.status(404).json({ message: "Group not found" });

  const expenses = await Expense.find({ group: group._id })
    .populate("paidBy", "name email color")
    .sort({ createdAt: -1 });
  const settlements = await Settlement.find({ group: group._id })
    .populate("from", "name color email")
    .populate("to", "name color email")
    .sort({ createdAt: -1 });

  const balances = calculateBalances(group.members, expenses, settlements);
  const transactions = simplifyDebts(balances);

  // Category breakdown analytics
  const categories = { Food: 0, Transport: 0, Housing: 0, Entertainment: 0, Shopping: 0, General: 0 };
  expenses.forEach((exp) => {
    const cat = exp.category || "General";
    categories[cat] = (categories[cat] || 0) + exp.amount;
  });

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalSettled = settlements.reduce((sum, s) => sum + s.amount, 0);
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
    categories,
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

// Add a new expense — broadcasts live & sends email alert to group members
router.post("/:groupId/expenses", auth, validateBody(expenseSchema), async (req, res) => {
  const { description, amount, paidBy, category, splitType, splitAmong, splitDetails } = req.body;

  const group = await Group.findById(req.params.groupId).populate("members", "name email");
  if (!group) return res.status(404).json({ message: "Group not found" });

  const expense = await Expense.create({
    group: req.params.groupId,
    description,
    amount: Number(amount),
    paidBy,
    category: category || "General",
    splitType: splitType || "EQUAL",
    splitAmong: splitAmong && splitAmong.length ? splitAmong : undefined,
    splitDetails: splitDetails && splitDetails.length ? splitDetails : undefined,
  });
  const populated = await expense.populate("paidBy", "name email color");

  const io = req.app.get("io");
  io.to(req.params.groupId).emit("expense:added", populated);

  // Send Email Alert to group members (except the payer)
  const recipientEmails = group.members
    .filter((m) => m._id.toString() !== paidBy.toString())
    .map((m) => m.email);

  sendExpenseAddedEmail({
    memberEmails: recipientEmails,
    payerName: populated.paidBy.name,
    description,
    amount: Number(amount),
    groupName: group.name,
    currencySymbol: CURRENCY_SYMBOLS[group.currency] || "₹",
  });

  res.status(201).json(populated);
});

// Mark a debt as settled — broadcasts live AND sends email alert + socket notification
router.post("/:groupId/settle", auth, validateBody(settlementSchema), async (req, res) => {
  const { from, to, amount } = req.body;

  const settlement = await Settlement.create({
    group: req.params.groupId,
    from,
    to,
    amount: Number(amount),
  });
  const populated = await settlement.populate([
    { path: "from", select: "name color email" },
    { path: "to", select: "name color email" },
  ]);

  const group = await Group.findById(req.params.groupId).select("name currency");

  const io = req.app.get("io");
  io.to(req.params.groupId).emit("settlement:added", populated);

  const currencySym = CURRENCY_SYMBOLS[group?.currency] || "₹";

  // Targeted, personal socket notification to whoever just got paid
  io.to(`user:${to}`).emit("notification:paymentReceived", {
    fromName: populated.from.name,
    fromColor: populated.from.color,
    amount: populated.amount,
    groupName: group?.name,
    groupId: req.params.groupId,
    currencySymbol: currencySym,
  });

  // Targeted Email Alert to recipient
  if (populated.to && populated.to.email) {
    sendPaymentReceivedEmail({
      toEmail: populated.to.email,
      recipientName: populated.to.name,
      payerName: populated.from.name,
      amount: populated.amount,
      groupName: group?.name || "Group",
      currencySymbol: currencySym,
    });
  }

  res.status(201).json(populated);
});

module.exports = router;
