require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const groupRoutes = require("./routes/groups");
const expenseRoutes = require("./routes/expenses");

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/groups", expenseRoutes);

connectDB();

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
