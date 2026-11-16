import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
import centerRoutes from "./routes/centerRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import counterRoutes from "./routes/counterRoutes.js";
import tokenRoutes from "./routes/tokenRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import { auditMutations } from "./middleware/auditMiddleware.js";
import auditRoutes from "./routes/auditRoutes.js";

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

app.use("/api", auditMutations);
app.use("/api/auth", authRoutes); 
app.use("/api/centers", centerRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/counters", counterRoutes);
app.use("/api/tokens", tokenRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/audit-logs", auditRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;