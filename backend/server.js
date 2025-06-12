import dotenv from "dotenv";

import app from "./src/app.js";
import { connectDB } from "./src/db.js";

dotenv.config();

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Connected to Server >> localhost:${PORT}`);
  });
};

startServer();
