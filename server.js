const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// ✅ Serve public folder
app.use(express.static(path.join(__dirname, "public")));

// ✅ Force index.html on "/"
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const users = {};

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  socket.on("login", (username) => {
    users[socket.id] = username;
    io.emit("users", Object.values(users));
  });

  socket.on("message", (msg) => {
    io.emit("message", {
      user: users[socket.id],
      text: msg
    });
  });

  socket.on("disconnect", () => {
    delete users[socket.id];
    io.emit("users", Object.values(users));
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
