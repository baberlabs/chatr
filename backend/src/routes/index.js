import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import chatRoutes from "./chat.routes.js";
import messageRoutes from "./message.routes.js";

const registerRoutes = (app) => {
  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/users", userRoutes);
  app.use("/api/v1/chats", chatRoutes);
  app.use("/api/v1/messages", messageRoutes);
};

export default registerRoutes;
