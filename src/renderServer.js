import express from "express";
import { runAutomation, getUploadStats } from "./automationRunner.js";
import { scheduleJobs, displaySchedule } from "./cronScheduler.js";
import winston from "winston";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configure Winston logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: "render-server" },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));

// Start the cron scheduler
logger.info("🚀 Starting YouTube automation cron scheduler...");
scheduleJobs();

// Health check endpoint
app.get("/health", (req, res) => {
  const stats = getUploadStats();
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    stats: {
      total: stats.total,
      successful: stats.successful,
      failed: stats.failed,
      successRate: stats.successRate,
    },
  });
});

// Manual trigger endpoint
app.post("/trigger", async (req, res) => {
  try {
    logger.info("Manual trigger requested");
    const result = await runAutomation();
    res.json({
      success: result.success,
      message: result.success
        ? "Automation completed successfully"
        : "Automation failed",
      data: result,
    });
  } catch (error) {
    logger.error("Manual trigger failed:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Status endpoint
app.get("/status", (req, res) => {
  const stats = getUploadStats();
  res.json({
    stats,
    lastUpload: stats.lastUpload,
    recentUploads: stats.recentUploads,
  });
});

// Schedule endpoint
app.get("/schedule", (req, res) => {
  try {
    // Capture console output for schedule display
    const originalLog = console.log;
    let scheduleOutput = "";
    console.log = (...args) => {
      scheduleOutput += args.join(" ") + "\n";
    };

    displaySchedule();

    console.log = originalLog;

    res.json({
      schedule: scheduleOutput,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// Root endpoint
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "index.html"));
});

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Render server running on port ${PORT}`);
  logger.info(`📊 Health check: http://localhost:${PORT}/health`);
  logger.info(`📈 Status: http://localhost:${PORT}/status`);
  logger.info(`📅 Schedule: http://localhost:${PORT}/schedule`);
});

export default app;
