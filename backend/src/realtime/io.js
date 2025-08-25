import { Server } from "socket.io";
import { createServer } from "http";
import { UserSocketMap } from "./userSocketMap.js";

let io;

const setupSocket = (app) => {
  const httpServer = createServer(app);
  io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
    },
  });

  const users = new UserSocketMap();

  const sendMessage = (data) => {
    const { roomId, message, receiverId } = data;

    if (receiverId && users.has(receiverId)) {
      const receiverSocketId = users.getOne(receiverId);
      io.to(receiverSocketId).emit("message:notification", { message });
    }

    io.to(roomId).emit("message:received", { message });
  };

  const emitOnlineUsers = () => {
    io.emit("users:online", users.getOnlineUsers());
  };

  io.on("connection", (socket) => {
    const { userId } = socket.handshake.query;

    users.add(userId, socket.id);
    emitOnlineUsers();

    socket.on("chat:join", ({ roomId }) => socket.join(roomId));

    socket.on("chat:leave", (roomId) => socket.leave(roomId));

    socket.on("message:send", (data) => sendMessage(data));

    socket.on("typing:start", ({ roomId, length }) => {
      socket.to(roomId).emit("typing:started", { length });
    });

    socket.on("typing:stop", ({ roomId }) => {
      socket.to(roomId).emit("typing:stopped");
    });

    socket.on("message:delete", ({ roomId, messageId }) => {
      socket.to(roomId).emit("message:deleted", { messageId });
    });

    socket.on("disconnect", () => {
      users.remove(userId);
      emitOnlineUsers();
    });
  });

  return httpServer;
};

export { setupSocket };
