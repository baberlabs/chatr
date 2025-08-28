import { Server } from "socket.io";
import { createServer } from "http";
import { authenticateUser } from "../middleware/auth.socket.middleware.js";
import { UserSocketMap } from "./userSocketMap.js";
import { EventRegistry } from "./eventRegistry.js";

export class SocketManager {
  constructor() {
    this.io = null;
    this.httpServer = null;
    this.userSocketMap = null;
  }

  async initialise(app) {
    this.httpServer = createServer(app);
    this.io = new Server(this.httpServer, {
      cors: {
        origin: "http://localhost:5173",
        credentials: true,
      },
    });

    this.setupMiddleware();
    this.initialiseServices();
    this.registerConnectionHandling();

    return this.httpServer;
  }

  setupMiddleware() {
    this.io.use(authenticateUser);
  }

  initialiseServices() {
    this.userSocketMap = new UserSocketMap();
    this.eventRegistry = new EventRegistry(this.io, this.userSocketMap);
  }

  registerConnectionHandling() {
    this.io.on("connection", (socket) => {
      this.handleConnection(socket);
    });
  }

  handleConnection(socket) {
    try {
      const userId = socket.user?._id;

      if (!userId) {
        console.error("No userId found on socket");
        socket.disconnect();
        return;
      }

      this.userSocketMap.add(userId, socket.id);
      this.emitOnlineUsers();

      this.eventRegistry.registerEvents(socket);

      socket.on("disconnect", () => {
        this.handleDisconnection(userId, socket);
      });

      socket.on("error", (error) => {
        console.error(`Socket error for user ${userId}:`, error);
      });
    } catch (error) {
      console.error("Error handling socket connection", error);
      socket.disconnect();
    }
  }

  handleDisconnection(userId, socket) {
    try {
      this.userSocketMap.remove(userId, socket.id);
      this.emitOnlineUsers();
    } catch (error) {
      console.error("Error handling disconnection", error);
    }
  }

  emitOnlineUsers() {
    const onlineUsers = this.userSocketMap.getOnlineUsers();
    this.io.emit("users:online", onlineUsers);
  }
}
