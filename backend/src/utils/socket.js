import { Server } from "socket.io";
import { createServer } from "http";
import express from "express";

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.LOCAL_FRONTEND_URL || "http://localhost:5173",
  },
});

const userSocketMap = {}; // { userId: socketId }

io.on("connection", (socket) => {
  const { userId } = socket.handshake.query;
  console.log(`Welcome ${userId}, you've connected with socket "${socket.id}"`);

  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));
  socket.on("disconnect", () => {
    console.log(`User ${userId} has disconnected from socket "${socket.id}"`);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, httpServer };
