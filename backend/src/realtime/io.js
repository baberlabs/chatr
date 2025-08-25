import { Server } from "socket.io";
import { createServer } from "http";

let io;

const setupSocket = (app) => {
  const httpServer = createServer(app);
  io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
    },
  });

  const userSocketMap = new Map();

  const addUserToSocketMap = (userId, socketId) => {
    if (userId && socketId) userSocketMap.set(userId, socketId);
  };

  const removeUserFromSocketMap = (userId) => {
    if (userId && userSocketMap.has(userId)) userSocketMap.delete(userId);
  };

  const showOnlineUsers = (userSocketMap) => {
    const onlineUserIds = Array.from(userSocketMap.keys());
    io.emit("getOnlineUsers", onlineUserIds);
  };

  const sendMessage = (data, userSocketMap) => {
    const { roomId, message, receiverId } = data;

    if (receiverId && userSocketMap.has(receiverId)) {
      const receiverSocketId = userSocketMap.get(receiverId);
      io.to(receiverSocketId).emit("receiveMessageNotification", {
        message,
      });
    }

    io.to(roomId).emit("receiveMessage", { message });
  };

  io.on("connection", (socket) => {
    const { userId } = socket.handshake.query;

    console.log(`User ${socket.id} has connected`);

    addUserToSocketMap(userId, socket.id);

    showOnlineUsers(userSocketMap);

    socket.on("joinRoom", ({ roomId }) => socket.join(roomId));

    socket.on("leaveRoom", (roomId) => socket.leave(roomId));

    socket.on("sendMessage", (data) => sendMessage(data, userSocketMap));

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
      removeUserFromSocketMap(userId);
      showOnlineUsers(userSocketMap);
    });
  });

  return httpServer;
};

export { setupSocket };
