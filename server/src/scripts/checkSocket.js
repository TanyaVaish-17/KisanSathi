import { io } from "socket.io-client";

const token = process.argv[2];
const url = process.env.SOCKET_URL || "http://localhost:5000";

const socket = io(url, {
  auth: token ? { token } : {},
  transports: ["websocket"],
});

const timer = setTimeout(() => {
  console.error("No response from the server within 5 seconds");
  process.exit(1);
}, 5000);

socket.on("socket:ready", (info) => {
  clearTimeout(timer);
  console.log("Connected with id:", socket.id);
  console.log("Server says:", info);
  socket.close();
});

socket.on("connect_error", (error) => {
  clearTimeout(timer);
  console.error("Connection failed:", error.message);
  process.exit(1);
});