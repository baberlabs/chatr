export class EventRegistry {
  constructor(io, userSocketMap) {
    this.io = io;
    this.userSocketMap = userSocketMap;
  }

  registerEvents(socket) {
    this.handleChatEvents(socket);
    this.handleMessageEvents(socket);
    this.handleTypingEvents(socket);
  }

  handleChatEvents(socket) {
    socket.on("chat:join", ({ roomId }) => {
      try {
        if (!roomId) {
          socket.emit("error", { message: "Missing data [chat:join]" });
          return;
        }
        socket.join(roomId);
      } catch (error) {
        console.error("Error handling chat join:", error);
        socket.emit("error", { message: "Failed to join chat room" });
      }
    });

    socket.on("chat:leave", (roomId) => {
      try {
        if (!roomId) {
          socket.emit("error", { message: "Missing data [chat:leave]" });
          return;
        }
        socket.leave(roomId);
      } catch (error) {
        console.error("Error handling chat leave:", error);
        socket.emit("error", { message: "Failed to leave chat room" });
      }
    });
  }

  handleMessageEvents(socket) {
    socket.on("message:send", (data) => {
      try {
        const { roomId, message, receiverId } = data;

        if (!roomId || !message || !receiverId) {
          socket.emit("error", { message: "Missing data [message:send]" });
          return;
        }

        if (receiverId && this.userSocketMap.has(receiverId)) {
          const receiverSocketId = this.userSocketMap.getOne(receiverId);
          this.io
            .to(receiverSocketId)
            .emit("message:notification", { message });
        }

        this.io.to(roomId).emit("message:received", { message });
      } catch (error) {
        console.error("Error handling message send:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    socket.on("message:delete", ({ roomId, messageId }) => {
      try {
        if (!roomId || !messageId) {
          socket.emit("error", { message: "Missing data [message:delete]" });
          return;
        }
        socket.to(roomId).emit("message:deleted", { messageId });
      } catch (error) {
        console.error("Error handling message delete:", error);
        socket.emit("error", { message: "Failed to delete message" });
      }
    });
  }

  handleTypingEvents(socket) {
    socket.on("typing:start", ({ roomId, length }) => {
      try {
        if (!roomId) {
          socket.emit("error", { message: "Missing data [typing:start]" });
          return;
        }

        socket.to(roomId).emit("typing:started", { length });
      } catch (error) {
        console.error("Error handling typing start:", error);
        socket.emit("error", { message: "Failed to indicate typing start" });
      }
    });

    socket.on("typing:stop", ({ roomId }) => {
      try {
        if (!roomId) {
          socket.emit("error", { message: "Missing data [typing:stop]" });
          return;
        }

        socket.to(roomId).emit("typing:stopped");
      } catch (error) {
        console.error("Error handling typing stop:", error);
        socket.emit("error", { message: "Failed to indicate typing stop" });
      }
    });
  }
}
