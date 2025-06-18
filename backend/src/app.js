import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import registerRoutes from "./routes/index.js";
import { globalErrorHandler } from "./utils/globalErrorHandler.js";
import { app, httpServer } from "./utils/socket.js";

const __dirname = path.resolve();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

registerRoutes(app);

app.use(globalErrorHandler);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("/{*splat}", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend", "dist", "index.html"));
  });
}

export { httpServer };
