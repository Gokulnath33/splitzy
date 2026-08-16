const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const User = require("../models/User");
const ApprovalHistory = require("../models/ApprovalHistory");
const {
  validateBody,
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require("../middleware/validation");
const {
  ADMIN_EMAIL,
  sendUserApprovedEmail,
  sendPasswordResetCodeEmail,
  sendAdminApprovalRequestEmail,
} = require("../utils/email");
const authMiddleware = require("../middleware/auth");
const Group = require("../models/Group");

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Too many authentication requests, please try again after 15 minutes." },
});

// Signup Route
router.post("/signup", authLimiter, validateBody(signupSchema), async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const lowerEmail = email.toLowerCase();
    console.log(`[Signup] Attempt: ${lowerEmail}`);

    const existing = await User.findOne({ email: lowerEmail });
    if (existing) {
      console.log(`[Signup] Already exists: ${lowerEmail} | isApproved: ${existing.isApproved}`);
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const isApproved = lowerEmail === ADMIN_EMAIL.toLowerCase();
    console.log(`[Signup] New user | isAdmin: ${isApproved}`);

    const user = await User.create({
      name,
      email: lowerEmail,
      password: hashed,
      isApproved,
    });

    if (isApproved) {
      console.log(`[Signup] Admin auto-approved: ${lowerEmail}`);
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
      return res.status(201).json({
        token,
        isApproved: true,
        user: { id: user._id, name: user.name, email: user.email, color: user.color },
      });
    }

    // Admin notification email disabled - admin will check dashboard for pending approvals
    // const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    // sendAdminApprovalRequestEmail({
    //   newUser: { name: user.name, email: user.email },
    //   approveUrl: `${clientUrl}/admin`,
    // });

    res.status(201).json({
      isApproved: false,
      message: "Registration successful! Your account is pending admin approval.",
    });
  } catch (err) {
    console.error(`[Signup] Error: ${err.message}`);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Login Route
router.post("/login", authLimiter, validateBody(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    if (!user.isApproved) {
      return res.status(403).json({
        message: "Your account is pending admin approval. Please wait for admin confirmation before logging in.",
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, color: user.color },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Forgot Password Route: Generates 6-digit verification code
router.post("/forgot-password", authLimiter, validateBody(forgotPasswordSchema), async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Security best practice: don't disclose whether email exists
      return res.json({ message: "If an account exists with that email, a verification code has been sent." });
    }

    // Generate 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes validity

    user.resetCode = code;
    user.resetCodeExpires = expires;
    await user.save();

    // Send email with code
    sendPasswordResetCodeEmail({
      toEmail: user.email,
      userName: user.name,
      code,
    });

    res.json({ message: "Verification code sent to your email address." });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Reset Password Route: Verifies 6-digit code and updates password
router.post("/reset-password", authLimiter, validateBody(resetPasswordSchema), async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || !user.resetCode || !user.resetCodeExpires) {
      return res.status(400).json({ message: "Invalid or expired verification request." });
    }

    if (user.resetCode !== code) {
      return res.status(400).json({ message: "Invalid 6-digit verification code." });
    }

    if (new Date() > new Date(user.resetCodeExpires)) {
      return res.status(400).json({ message: "Verification code has expired. Please request a new code." });
    }

    // Hash new password and clear reset code
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    user.resetCode = undefined;
    user.resetCodeExpires = undefined;
    await user.save();

    res.json({ message: "Password updated successfully! You can now log in with your new password." });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Admin Approval Endpoint (API)
router.post("/approve/:userId", authMiddleware, async (req, res) => {
  try {
    const adminUser = await User.findById(req.userId);
    if (!adminUser || adminUser.email !== ADMIN_EMAIL) {
      return res.status(403).json({ message: "Forbidden: Admin only" });
    }

    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isApproved) {
      return res.json({ message: "Already approved" });
    }

    console.log(`[Admin] Approving user: ${user.email}`);
    user.isApproved = true;
    await user.save();

    console.log(`[Admin] Recording approval history for: ${user.email}`);
    await ApprovalHistory.create({
      admin: adminUser._id,
      approvedUser: user._id,
      approvedUserEmail: user.email,
      approvedUserName: user.name,
    });

    console.log(`[Admin] Creating default group for user: ${user.email}`);
    await Group.create({
      name: `${user.name}'s Personal Group`,
      owner: user._id,
      members: [user._id]
    });

    console.log(`[Admin] Sending user approved email to: ${user.email}`);
    const emailSent = await sendUserApprovedEmail({ userEmail: user.email, userName: user.name });
    if (emailSent) {
      console.log(`[Admin] Successfully sent user approved email to: ${user.email}`);
    } else {
      console.error(`[Admin] Failed to send approval email to: ${user.email} (check server logs)`);
    }

    res.json({
      success: true,
      message: "User approved and default group created!",
      emailSent,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Pending Users Endpoint
router.get("/pending", authMiddleware, async (req, res) => {
  try {
    const adminUser = await User.findById(req.userId);
    if (!adminUser || adminUser.email !== ADMIN_EMAIL) {
      return res.status(403).json({ message: "Forbidden: Admin only" });
    }
    const pendingUsers = await User.find({ isApproved: false }).select("name email createdAt");
    res.json(pendingUsers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Approval History Endpoint
router.get("/approvals", authMiddleware, async (req, res) => {
  try {
    const adminUser = await User.findById(req.userId);
    if (!adminUser || adminUser.email !== ADMIN_EMAIL) {
      return res.status(403).json({ message: "Forbidden: Admin only" });
    }
    const history = await ApprovalHistory.find()
      .populate("admin", "name email")
      .sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Approved Users Endpoint
router.get("/approved-users", authMiddleware, async (req, res) => {
  try {
    const adminUser = await User.findById(req.userId);
    if (!adminUser || adminUser.email !== ADMIN_EMAIL) {
      return res.status(403).json({ message: "Forbidden: Admin only" });
    }
    const approvedUsers = await User.find({ isApproved: true, email: { $ne: ADMIN_EMAIL } })
      .select("name email createdAt")
      .sort({ createdAt: -1 });
    res.json(approvedUsers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Reject / Delete Pending User Endpoint
router.delete("/reject/:userId", authMiddleware, async (req, res) => {
  try {
    const adminUser = await User.findById(req.userId);
    if (!adminUser || adminUser.email !== ADMIN_EMAIL) {
      return res.status(403).json({ message: "Forbidden: Admin only" });
    }
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isApproved) {
      return res.status(400).json({ message: "Cannot reject an already approved user" });
    }

    console.log(`[Admin] Rejecting user: ${user.email}`);
    await User.findByIdAndDelete(req.params.userId);

    res.json({ success: true, message: "User rejected and deleted." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/find", async (req, res) => {
  const { email } = req.query;
  const user = await User.findOne({ email: email?.toLowerCase() }).select("name email color");
  if (!user) return res.status(404).json({ message: "No user with that email" });
  res.json(user);
});

module.exports = router;
