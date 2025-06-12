import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import registerRoutes from "./routes/index.js";
import { globalErrorHandler } from "./utils/globalErrorHandler.js";

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

app.use(globalErrorHandler);

export default app;
