export const sendMessage = ({ io, socket, userSocketMap, data }) => {
  try {
    const { roomId, message, receiverId } = data;

    if (!roomId || !message || !receiverId) {
      socket.emit("error", { message: "Missing data [message:send]" });
      return;
    }

    if (receiverId && userSocketMap.has(receiverId)) {
      const receiverSocketId = userSocketMap.getOne(receiverId);
      io.to(receiverSocketId).emit("message:notification", { message });
    }

    io.to(roomId).emit("message:received", { message });
  } catch (error) {
    console.error("Error handling message send:", error);
    socket.emit("error", { message: "Failed to send message" });
  }
};

export const deleteMessage = ({ socket, roomId, messageId }) => {
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
};
