const express = require("express");
const Group = require("../models/Group");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/", auth, async (req, res) => {
  const groups = await Group.find({ members: req.userId }).populate("members", "name email color");
  res.json(groups);
});

router.post("/", auth, async (req, res) => {
  const { name, currency } = req.body;
  const group = await Group.create({
    name: name || "New Group",
    currency: currency || "INR",
    owner: req.userId,
    members: [req.userId],
  });
  const populated = await group.populate("members", "name email color");
  res.status(201).json(populated);
});

router.get("/:id", auth, async (req, res) => {
  const group = await Group.findById(req.params.id).populate("members", "name email color");
  if (!group) return res.status(404).json({ message: "Group not found" });
  res.json(group);
});

router.put("/:id", auth, async (req, res) => {
  const { currency } = req.body;
  const group = await Group.findById(req.params.id);
  if (!group) return res.status(404).json({ message: "Group not found" });

  if (currency) group.currency = currency;
  await group.save();
  const populated = await group.populate("members", "name email color");
  res.json(populated);
});

router.post("/:id/members", auth, async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "No user with that email" });

  const group = await Group.findById(req.params.id);
  if (!group) return res.status(404).json({ message: "Group not found" });

  if (!group.members.includes(user._id)) {
    group.members.push(user._id);
    await group.save();
  }
  const populated = await group.populate("members", "name email color");
  res.json(populated);
});

module.exports = router;
