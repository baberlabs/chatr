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
    socket.on("chat:join", ({ roomId }) => socket.join(roomId));
    socket.on("chat:leave", (roomId) => socket.leave(roomId));
  }

  handleMessageEvents(socket) {
    socket.on("message:send", (data) => {
      const { roomId, message, receiverId } = data;
      if (receiverId && this.userSocketMap.has(receiverId)) {
        const receiverSocketId = this.userSocketMap.getOne(receiverId);
        this.io.to(receiverSocketId).emit("message:notification", { message });
      }
      this.io.to(roomId).emit("message:received", { message });
    });

    socket.on("message:delete", ({ roomId, messageId }) => {
      socket.to(roomId).emit("message:deleted", { messageId });
    });
  }

  handleTypingEvents(socket) {
    socket.on("typing:start", ({ roomId, length }) => {
      socket.to(roomId).emit("typing:started", { length });
    });

    socket.on("typing:stop", ({ roomId }) => {
      socket.to(roomId).emit("typing:stopped");
    });
  }
}
