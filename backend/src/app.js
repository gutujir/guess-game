import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRouter from "./routes/auth.route.js";
import gameRouter from "./routes/game.route.js";
import messageRouter from "./routes/message.route.js";
import dashboardRouter from "./routes/dashboard.route.js";

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/games", gameRouter);
app.use("/api/messages", messageRouter);
app.use("/api/dashboard", dashboardRouter);

export default app;
