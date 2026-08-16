const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    color: { type: String, default: () => randomColor() },
    isApproved: { type: Boolean, default: false },
    resetCode: { type: String },
    resetCodeExpires: { type: Date },
  },
  { timestamps: true }
);

function randomColor() {
  const colors = ["#0B4F4A", "#FF6B5E", "#5FD9B4", "#E8A33D", "#6C63FF", "#FF8FA3"];
  return colors[Math.floor(Math.random() * colors.length)];
}

module.exports = mongoose.model("User", userSchema);
