import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "./models/User.js";

let io = null;

const joinPrivateRooms = async (socket) => {
  const { userId, role } = socket.data;
  if (!userId) return;

  socket.join(`user:${userId}`);
  if (role === "admin") socket.join("admins");
};

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_URL, credentials: true },
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next();

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("role isActive");

      if (user && user.isActive) {
        socket.data.userId = String(user._id);
        socket.data.role = user.role;
      }
      next();
    } catch {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("center:join", (centerId) => {
      if (mongoose.isValidObjectId(centerId)) socket.join(`center:${centerId}`);
    });

    socket.on("center:leave", (centerId) => {
      if (mongoose.isValidObjectId(centerId)) socket.leave(`center:${centerId}`);
    });

    joinPrivateRooms(socket)
      .catch((error) => console.error("Socket room join failed:", error.message))
      .then(() =>
        socket.emit("socket:ready", {
          authenticated: Boolean(socket.data.userId),
          role: socket.data.role || null,
        })
      );
  });

  return io;
};

export const getIO = () => io;