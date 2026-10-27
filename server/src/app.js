import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  const dbStates = ["disconnected", "connected", "connecting", "disconnecting"];
  res.json({
    success: true,
    app: "KisanSathi API",
    database: dbStates[mongoose.connection.readyState],
    time: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes); 

app.use(notFound);
app.use(errorHandler);

export default app;