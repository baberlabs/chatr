import { Server } from "socket.io";
import { createServer } from "http";
import express from "express";

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
  },
});

const userSocketMap = {};

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

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
  });

  socket.on("leaveRoom", (roomId) => {
    socket.leave(roomId);
  });

  socket.on("sendMessage", (data) => {
    const { roomId, message } = data;
    io.to(roomId).emit("receiveMessage", { userId, message });
  });
});

export { io, app, httpServer };
