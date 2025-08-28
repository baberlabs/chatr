export const startTyping = ({ socket, roomId, length }) => {
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
};

export const stopTyping = ({ socket, roomId }) => {
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
};
