import dotenv from "dotenv";
import { connectDB } from "./src/db.js";
import app from "./src/app.js";
import { setupSocket } from "./src/utils/socket.js";

dotenv.config();

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  await connectDB();
  const httpServer = setupSocket(app);
  httpServer.listen(PORT, () => {
    console.log(`Connected to Server >> localhost:${PORT}`);
  });
};

startServer();
