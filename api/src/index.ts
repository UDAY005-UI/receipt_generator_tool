import cors from "cors";
import express from "express";
import pdfRoutes from "./routes/pdf.routes";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";
import { startKeepAlive } from "./utils/keepAlive";

const app = express();

const PORT = Number(process.env.PORT) || 4000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:3000";

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    methods: ["GET", "POST", "OPTIONS"],
    exposedHeaders: ["Content-Disposition"],
  })
);

app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/pdf", pdfRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Antariksha PDF backend running on http://localhost:${PORT}`);
  console.log(`Accepting requests from ${FRONTEND_ORIGIN}`);
  startKeepAlive();
});