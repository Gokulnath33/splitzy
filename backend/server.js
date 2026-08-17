require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const bcrypt = require("bcryptjs");

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const groupRoutes = require("./routes/groups");
const expenseRoutes = require("./routes/expenses");
const User = require("./models/User");

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/groups", expenseRoutes);

// Admin seeding function
async function seedAdmin() {
  try {
    const ADMIN_EMAIL = 'gokulnath2006mg@gmail.com';
    const ADMIN_PASSWORD = 'gokul_gh2006';
    const ADMIN_NAME = 'Gokulnath M';

    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
    if (existingAdmin) {
      console.log('✅ Admin account already exists');
      return;
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
      isApproved: true,
      color: '#10b981'
    });
    console.log('✅ Admin account created successfully');
  } catch (error) {
    console.error('❌ Error seeding admin:', error.message);
  }
}

// Connect to database and seed admin if needed
connectDB().then(() => {
  seedAdmin();
});

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: process.env.CLIENT_URL } });
app.set("io", io);

// groupId -> Map(socketId -> {name, color})  used for "who's online" presence
const presence = new Map();

io.on("connection", (socket) => {
  // Personal room — lets the server send a notification straight to one
  // specific user, no matter which page they're on.
  socket.on("user:register", ({ userId }) => {
    if (userId) socket.join(`user:${userId}`);
  });

  socket.on("group:join", ({ groupId, userName, color }) => {
    socket.join(groupId);
    socket.data.groupId = groupId;

    if (!presence.has(groupId)) presence.set(groupId, new Map());
    presence.get(groupId).set(socket.id, { name: userName, color });

    io.to(groupId).emit("group:presence", Array.from(presence.get(groupId).values()));
  });

  socket.on("disconnect", () => {
    const groupId = socket.data.groupId;
    if (groupId && presence.has(groupId)) {
      presence.get(groupId).delete(socket.id);
      io.to(groupId).emit("group:presence", Array.from(presence.get(groupId).values()));
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
