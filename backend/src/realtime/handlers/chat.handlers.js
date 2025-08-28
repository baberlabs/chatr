export const joinChat = ({ socket, roomId }) => {
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
};

export const leaveChat = ({ socket, roomId }) => {
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
};
