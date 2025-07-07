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

  io.on("connection", (socket) => {
    const { userId } = socket.handshake.query;
    console.log(
      `Welcome ${userId}, you've connected with socket "${socket.id}"`
    );

    if (userId) {
      userSocketMap[userId] = socket.id;
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    socket.on("disconnect", () => {
      console.log(`User ${userId} has disconnected from socket "${socket.id}"`);
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });

    socket.on("joinRoom", ({ roomId, receiverId }) => {
      // const receiverSocketId = userSocketMap[receiverId];
      // console.log({
      //   userId,
      //   receiverId,
      //   roomId,
      // });
      // if (receiverSocketId) {
      //   io.to(receiverSocketId).emit("userJoined", {
      //     userId,
      //     roomId,
      //     senderId: receiverId,
      //   });
      // }
      socket.join(roomId);
    });

    socket.on("leaveRoom", (roomId) => {
      socket.leave(roomId);
    });

    socket.on("sendMessage", (data) => {
      const { roomId, message, receiverId } = data;

      const receiverSocketId = userSocketMap[receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receiveMessageNotification", {
          message,
        });
      }
      io.to(roomId).emit("receiveMessage", { message });
    });
  });

  return httpServer;
};

export { setupSocket };
