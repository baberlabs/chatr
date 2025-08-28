import dotenv from "dotenv";
import { connectDB } from "./src/db.js";
import app from "./src/app.js";
// import { setupSocket } from "./src/realtime/io.js";
import { SocketManager } from "./src/realtime/socketManager.js";

dotenv.config();

const PORT = process.env.PORT || 5001;
const socketManager = new SocketManager();

const startServer = async () => {
  await connectDB();
  const httpServer = await socketManager.initialise(app);
  httpServer.listen(PORT, () => {
    console.log(`Connected to Server >> localhost:${PORT}`);
  });
};

startServer();
