const mongoose = require("mongoose");

const approvalHistorySchema = new mongoose.Schema(
  {
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    approvedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    approvedUserEmail: { type: String, required: true },
    approvedUserName: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ApprovalHistory", approvalHistorySchema);
