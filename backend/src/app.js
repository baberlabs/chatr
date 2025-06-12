import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import registerRoutes from "./routes/index.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

registerRoutes(app);

app.use((error, req, res, next) => {
  console.error(`Error: ${error}`);
  res
    .status(error.status || 500)
    .json({ message: error.message | "Internal Server Error" });
});

export default app;
