const mongoose = require("mongoose");

const settlementSchema = new mongoose.Schema(
  {
    group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // who paid
    to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // who received
    amount: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settlement", settlementSchema);
