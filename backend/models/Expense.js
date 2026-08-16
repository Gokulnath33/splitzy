const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    paidBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    category: {
      type: String,
      enum: ["Food", "Transport", "Housing", "Entertainment", "Shopping", "General"],
      default: "General",
    },
    splitType: {
      type: String,
      enum: ["EQUAL", "EXACT", "PERCENTAGE"],
      default: "EQUAL",
    },
    // Members this expense is split across (used for EQUAL split)
    splitAmong: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    // Custom split details (used for EXACT or PERCENTAGE splits)
    splitDetails: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        amount: { type: Number },
        percentage: { type: Number },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);
