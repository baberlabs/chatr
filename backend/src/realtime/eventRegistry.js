import { joinChat, leaveChat } from "./handlers/chat.handlers.js";
import { sendMessage, deleteMessage } from "./handlers/message.handlers.js";
import { startTyping, stopTyping } from "./handlers/typing.handlers.js";

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
      joinChat({ socket, roomId });
    });

    socket.on("chat:leave", (roomId) => {
      leaveChat({ socket, roomId });
    });
  }

  handleMessageEvents(socket) {
    socket.on("message:send", (data) => {
      sendMessage({
        io: this.io,
        socket,
        userSocketMap: this.userSocketMap,
        data,
      });
    });

    socket.on("message:delete", ({ roomId, messageId }) => {
      deleteMessage({ socket, roomId, messageId });
    });
  }

  handleTypingEvents(socket) {
    socket.on("typing:start", ({ roomId, length }) => {
      startTyping({ socket, roomId, length });
    });

    socket.on("typing:stop", ({ roomId }) => {
      stopTyping({ socket, roomId });
    });
  }
}
