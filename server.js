const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

/*
  users structure:
  {
    socketId1: "alice",
    socketId2: "bob"
  }
*/
const users = {};

// helper: get username -> socketId
function getSocketIdByUsername(username) {
  return Object.keys(users).find(
    (id) => users[id] === username
  );
}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // =========================
  // LOGIN / JOIN
  // =========================
  socket.on("login", (username) => {
    users[socket.id] = username;

    console.log("LOGIN:", username);

    // send updated online users list
    io.emit("user_list", Object.values(users));
  });

  // =========================
  // PRIVATE 1-to-1 MESSAGE
  // =========================
  socket.on("private_message", ({ to, message }) => {
    const from = users[socket.id];
    if (!from) return;

    const toSocketId = getSocketIdByUsername(to);
    if (!toSocketId) return;

    // room id is deterministic
    const room = [from, to].sort().join("_");

    // both users join same room
    socket.join(room);
    io.to(toSocketId).socketsJoin(room);

    // send message ONLY to this room
    io.to(room).emit("receive_private", {
      from,
      message
    });
  });

  // =========================
  // LOGOUT / DISCONNECT
  // =========================
  socket.on("disconnect", () => {
    const username = users[socket.id];
    console.log("Disconnected:", username);

    delete users[socket.id];

    // update online users list
    io.emit("user_list", Object.values(users));
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});