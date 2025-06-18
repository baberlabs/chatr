import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import registerRoutes from "./routes/index.js";
import { globalErrorHandler } from "./utils/globalErrorHandler.js";
import { app, httpServer } from "./utils/socket.js";

app.use(
  cors({
    origin: process.env.LOCAL_FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

registerRoutes(app);

app.use(globalErrorHandler);

export { httpServer };
