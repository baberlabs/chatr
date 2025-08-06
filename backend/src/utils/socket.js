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

  const userSocketMap = {};

  const addUserToSocketMap = (userId, socketId) => {
    if (userId) {
      if (!userSocketMap[userId]) {
        userSocketMap[userId] = socketId;
      } else {
        delete userSocketMap[userId];
        userSocketMap[userId] = socketId;
      }
    }
  };

  const removeUserFromSocketMap = (userId) => {
    if (userId && userSocketMap[userId]) {
      delete userSocketMap[userId];
    }
  };

  const showOnlineUsers = (userSocketMap) => {
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  };

  const sendMessage = (data, userSocketMap) => {
    const { roomId, message, receiverId } = data;

    if (receiverId && userSocketMap[receiverId]) {
      const receiverSocketId = userSocketMap[receiverId];
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
