// connect to socket.io server
const socket = io();

// join chat
function join() {
  const username = document.getElementById("username").value.trim();

  if (!username) {
    alert("Enter username");
    return;
  }

  socket.emit("login", username);

  document.getElementById("login").style.display = "none";
  document.getElementById("chat").style.display = "block";
}

// send message
function sendMessage() {
  const input = document.getElementById("messageInput");
  const msg = input.value.trim();

  if (!msg) return;

  socket.emit("message", msg);
  input.value = "";
}

// receive messages
socket.on("message", (data) => {
  const div = document.createElement("div");
  div.textContent = `${data.user}: ${data.text}`;
  document.getElementById("messages").appendChild(div);
});

// debug connection
socket.on("connect", () => {
  console.log("Connected to server");
});
