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

  const showOnlineUsers = () => {
    io.emit("getOnlineUsers", users.getOnlineUsers());
  };

  const sendMessage = (data) => {
    const { roomId, message, receiverId } = data;

    if (receiverId && users.has(receiverId)) {
      const receiverSocketId = users.getOne(receiverId);
      io.to(receiverSocketId).emit("receiveMessageNotification", {
        message,
      });
    }

    io.to(roomId).emit("receiveMessage", { message });
  };

  io.on("connection", (socket) => {
    const { userId } = socket.handshake.query;

    console.log(`User ${socket.id} has connected`);

    users.add(userId, socket.id);

    showOnlineUsers();

    socket.on("joinRoom", ({ roomId }) => socket.join(roomId));

    socket.on("leaveRoom", (roomId) => socket.leave(roomId));

    socket.on("sendMessage", (data) => sendMessage(data));

    socket.on("startTypingIndicator", ({ roomId, length }) => {
      socket.to(roomId).emit("startTypingIndicator", { length });
    });

    socket.on("stopTypingIndicator", ({ roomId }) => {
      socket.to(roomId).emit("stopTypingIndicator");
    });

    socket.on("deleteMessage", ({ roomId, messageId }) => {
      socket.to(roomId).emit("deleteMessage", { messageId });
    });

    socket.on("disconnect", () => {
      console.log(`User ${socket.id} has disconnected`);
      users.remove(userId);
      showOnlineUsers();
    });
  });

  return httpServer;
};

export { setupSocket };
