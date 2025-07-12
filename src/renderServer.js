import express from "express";
import { runAutomation, getUploadStats } from "./automationRunner.js";
import { scheduleJobs, displaySchedule } from "./cronScheduler.js";
import winston from "winston";
import path from "path";
import { fileURLToPath } from "url";
import cron from "node-cron";

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

app.use(express.static(path.join(__dirname, "../public")));

// Free tier compatible cron system
let isProduction = process.env.NODE_ENV === "production";
let lastActivity = Date.now();
let cronJobs = [];

// Function to keep service alive (for free tier)
function setupKeepAlive() {
  if (!isProduction) return;

  // Ping the service every 10 minutes to keep it alive
  setInterval(async () => {
    try {
      const response = await fetch(
        `https://${process.env.RENDER_EXTERNAL_HOSTNAME || "localhost"}/health`
      );
      if (response.ok) {
        logger.info("✅ Keep-alive ping successful");
        lastActivity = Date.now();
      }
    } catch (error) {
      logger.warn("⚠️ Keep-alive ping failed:", error.message);
    }
  }, 10 * 60 * 1000); // 10 minutes

  // Also ping external services to keep the service alive
  const pingUrls = [
    "https://uptimerobot.com",
    "https://cron-job.org",
    "https://www.google.com",
  ];

  setInterval(async () => {
    for (const url of pingUrls) {
      try {
        await fetch(url);
        logger.info(`✅ External ping to ${url} successful`);
      } catch (error) {
        logger.warn(`⚠️ External ping to ${url} failed:`, error.message);
      }
    }
  }, 15 * 60 * 1000); // 15 minutes
}

// Function to check if we should run cron jobs
function shouldRunCronJobs() {
  if (!isProduction) return true;

  // Only run jobs if service has been active recently (within last 5 minutes)
  const timeSinceLastActivity = Date.now() - lastActivity;
  return timeSinceLastActivity < 5 * 60 * 1000; // 5 minutes
}

// Modified cron job runner for free tier
function setupFreeTierCron() {
  if (!isProduction) {
    // In development, use normal cron
    logger.info("🔄 Development mode - using normal cron scheduler");
    scheduleJobs();
    return;
  }

  logger.info("🔄 Production mode - using free tier compatible cron system");

  // Schedule jobs to run every hour when service is active
  const hourlyJob = cron.schedule(
    "0 * * * *",
    async () => {
      if (!shouldRunCronJobs()) {
        logger.info("⏸️ Service inactive, skipping cron job");
        return;
      }

      logger.info("🎬 Running hourly automation job (free tier mode)");
      try {
        const result = await runAutomation();
        if (result.success) {
          logger.info("✅ Hourly automation completed successfully", {
            videoId: result.videoId,
            title: result.title,
            youtubeUrl: result.youtubeUrl,
          });
        } else {
          logger.error("❌ Hourly automation failed:", result.error);
        }
      } catch (error) {
        logger.error("❌ Hourly automation error:", error);
      }
    },
    {
      scheduled: true,
      timezone: process.env.TZ || "UTC",
    }
  );

  cronJobs.push(hourlyJob);
  logger.info("✅ Hourly cron job scheduled for free tier");
}

// Start the cron scheduler
logger.info("🚀 Starting YouTube automation system...");
setupKeepAlive();
setupFreeTierCron();

// Health check endpoint
app.get("/health", (req, res) => {
  // Update last activity timestamp
  lastActivity = Date.now();

  const stats = getUploadStats();
  const uptime = process.uptime();
  const timeSinceLastActivity = Date.now() - lastActivity;

  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: uptime,
    lastActivity: new Date(lastActivity).toISOString(),
    timeSinceLastActivity: Math.round(timeSinceLastActivity / 1000),
    isProduction: isProduction,
    shouldRunCronJobs: shouldRunCronJobs(),
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
