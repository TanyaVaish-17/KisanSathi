import { io } from "socket.io-client";

const [token, centerId] = process.argv.slice(2);
const url = process.env.SOCKET_URL || "http://localhost:5000";

const socket = io(url, {
  auth: token && token !== "none" ? { token } : {},
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("Connected as", socket.id);
  if (centerId) {
    socket.emit("center:join", centerId);
    console.log("Joined center room", centerId);
  }
});

socket.onAny((event, payload) => {
  console.log(new Date().toLocaleTimeString(), event, JSON.stringify(payload));
});

socket.on("connect_error", (error) => {
  console.error("Connection failed:", error.message);
  process.exit(1);
});