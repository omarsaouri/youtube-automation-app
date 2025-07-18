import cron from "node-cron";
import cronParser from "cron-parser";
console.log("cron-parser import:", cronParser);
import {
  runAutomation,
  getUploadStats,
  cleanupOldFiles,
} from "./automationRunner.js";
import winston from "winston";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Detect if running on Render
const isRender = process.env.RENDER || process.env.NODE_ENV === "production";

// Get local timezone or use UTC as fallback
const getLocalTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch (error) {
    return "UTC";
  }
};

const LOCAL_TIMEZONE = getLocalTimezone();

// Configure Winston logger for cron scheduler
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: "cron-scheduler" },
  transports: [
    new winston.transports.File({
      filename: path.join(__dirname, "../logs/cron-error.log"),
      level: "error",
    }),
    new winston.transports.File({
      filename: path.join(__dirname, "../logs/cron-combined.log"),
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

// Ensure logs directory exists
const logsDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Cron schedule configuration
const CRON_SCHEDULES = [
  // 6 videos per day - starting at 18:00 local time, then every 4 hours
  "0 18 * * *", // 6:00 PM (18:00) - TODAY
  "0 22 * * *", // 10:00 PM (22:00)
  "0 2 * * *", // 2:00 AM (next day)
  "0 6 * * *", // 6:00 AM
  "0 10 * * *", // 10:00 AM
  "0 14 * * *", // 2:00 PM (14:00)
];

// Alternative schedules (uncomment to use different intervals)
const ALTERNATIVE_SCHEDULES = {
  // 3 videos per day
  threePerDay: [
    "0 8 * * *", // 8:00 AM
    "0 14 * * *", // 2:00 PM
    "0 20 * * *", // 8:00 PM
  ],
  // 4 videos per day
  fourPerDay: [
    "0 6 * * *", // 6:00 AM
    "0 12 * * *", // 12:00 PM
    "0 18 * * *", // 6:00 PM
    "0 0 * * *", // 12:00 AM
  ],
  // 8 videos per day (every 3 hours)
  eightPerDay: [
    "0 6 * * *", // 6:00 AM
    "0 9 * * *", // 9:00 AM
    "0 12 * * *", // 12:00 PM
    "0 15 * * *", // 3:00 PM
    "0 18 * * *", // 6:00 PM
    "0 21 * * *", // 9:00 PM
    "0 0 * * *", // 12:00 AM
    "0 3 * * *", // 3:00 AM
  ],
};

// Get schedule from environment variable or use default
function getSchedule() {
  const scheduleType = process.env.CRON_SCHEDULE_TYPE || "sixPerDay";

  switch (scheduleType) {
    case "threePerDay":
      return ALTERNATIVE_SCHEDULES.threePerDay;
    case "fourPerDay":
      return ALTERNATIVE_SCHEDULES.fourPerDay;
    case "eightPerDay":
      return ALTERNATIVE_SCHEDULES.eightPerDay;
    default:
      return CRON_SCHEDULES;
  }
}

// Function to run automation with retry logic
async function runAutomationWithRetry(maxRetries = 3) {
  let attempt = 1;

  while (attempt <= maxRetries) {
    try {
      logger.info(`🔄 Attempt ${attempt}/${maxRetries} - Starting automation`);
      const result = await runAutomation();

      if (result.success) {
        logger.info(
          `✅ Automation completed successfully on attempt ${attempt}`,
          {
            videoId: result.videoId,
            title: result.title,
            duration: result.duration,
          }
        );
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      logger.error(`❌ Attempt ${attempt}/${maxRetries} failed:`, error);

      if (attempt === maxRetries) {
        logger.error(`💥 All ${maxRetries} attempts failed. Giving up.`);
        throw error;
      }

      // Wait before retry (exponential backoff)
      const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 30000); // Max 30 seconds
      logger.info(`⏳ Waiting ${waitTime}ms before retry...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      attempt++;
    }
  }
}

// Function to schedule all cron jobs
export function scheduleJobs() {
  const schedules = getSchedule();

  logger.info(`📅 Scheduling ${schedules.length} cron jobs:`, schedules);

  schedules.forEach((schedule, index) => {
    const jobName = `video-${index + 1}`;

    cron.schedule(
      schedule,
      async () => {
        const jobStartTime = new Date();
        logger.info(`🎬 Starting scheduled job: ${jobName}`, {
          jobName,
          schedule,
          startTime: jobStartTime.toISOString(),
        });

        try {
          logger.info(`🔄 Executing automation for job: ${jobName}`);
          const result = await runAutomationWithRetry();
          const duration = new Date() - jobStartTime;

          logger.info(`✅ Scheduled job ${jobName} completed successfully`, {
            jobName,
            videoId: result.videoId,
            title: result.title,
            duration,
            youtubeUrl: result.youtubeUrl,
          });
        } catch (error) {
          const duration = new Date() - jobStartTime;
          logger.error(`❌ Scheduled job ${jobName} failed`, {
            jobName,
            error: error.message,
            stack: error.stack,
            duration,
          });
        }
      },
      {
        scheduled: true,
        timezone: process.env.TZ || LOCAL_TIMEZONE,
      }
    );

    logger.info(`✅ Scheduled job ${jobName} with cron: ${schedule}`);
  });
}

// Function to display current schedule
export function displaySchedule() {
  const schedules = getSchedule();
  console.log("\n📅 Current Cron Schedule:");
  console.log("========================");

  schedules.forEach((schedule, index) => {
    try {
      const interval = cronParser.parseExpression(schedule, {
        tz: process.env.TZ || LOCAL_TIMEZONE,
      });
      const nextRun = interval.next().toDate();
      console.log(
        `${index + 1}. ${schedule} (Next: ${nextRun.toLocaleString()})`
      );
    } catch (error) {
      console.log(
        `${index + 1}. ${schedule} (Error parsing schedule: ${error.message})`
      );
    }
  });

  console.log(`\nTotal videos per day: ${schedules.length}`);
  console.log(`Timezone: ${process.env.TZ || LOCAL_TIMEZONE}`);
}

// Function to display statistics
function displayStats() {
  const stats = getUploadStats();
  console.log("\n📊 Upload Statistics:");
  console.log("===================");
  console.log(`Total uploads: ${stats.total}`);
  console.log(`Successful: ${stats.successful}`);
  console.log(`Failed: ${stats.failed}`);
  console.log(`Success rate: ${stats.successRate}%`);

  if (stats.lastUpload) {
    console.log(`\nLast upload: ${stats.lastUpload.title}`);
    console.log(`URL: ${stats.lastUpload.youtubeUrl}`);
    console.log(
      `Time: ${new Date(stats.lastUpload.timestamp).toLocaleString()}`
    );
  }

  if (stats.recentUploads.length > 0) {
    console.log("\nRecent uploads:");
    stats.recentUploads.forEach((upload, index) => {
      console.log(`${index + 1}. ${upload.title} - ${upload.youtubeUrl}`);
    });
  }
}

// Function to run cleanup
async function runCleanup() {
  logger.info("🧹 Starting cleanup of old files...");
  try {
    cleanupOldFiles();
    logger.info("✅ Cleanup completed successfully");
  } catch (error) {
    logger.error("❌ Cleanup failed:", error);
  }
}

// Main function
async function main() {
  const command = process.argv[2];

  // Log environment information
  logger.info("🌍 Environment Info", {
    nodeEnv: process.env.NODE_ENV,
    isRender: isRender,
    timezone: process.env.TZ || LOCAL_TIMEZONE,
    cronScheduleType: process.env.CRON_SCHEDULE_TYPE || "sixPerDay",
    platform: process.platform,
    nodeVersion: process.version,
  });

  switch (command) {
    case "start":
      logger.info("🚀 Starting YouTube automation cron scheduler...");

      if (isRender) {
        logger.info("🏗️ Running on Render - Production mode enabled");
      }

      displaySchedule();
      scheduleJobs();

      // Schedule daily cleanup at 3 AM
      cron.schedule("0 3 * * *", runCleanup, {
        scheduled: true,
        timezone: process.env.TZ || LOCAL_TIMEZONE,
      });

      logger.info("✅ Cron scheduler started successfully");
      logger.info("📝 Logs will be saved to logs/ directory");

      if (isRender) {
        logger.info("☁️ Running on Render - Service will stay active");
      } else {
        logger.info(
          "🔄 Scheduler will run continuously. Press Ctrl+C to stop."
        );
      }

      // Graceful shutdown handling
      const gracefulShutdown = (signal) => {
        logger.info(`🛑 Received ${signal}. Shutting down gracefully...`);

        // Stop all cron jobs
        cron.getTasks().forEach((task) => {
          task.stop();
        });

        logger.info("✅ All cron jobs stopped");
        process.exit(0);
      };

      // Handle different shutdown signals
      process.on("SIGINT", () => gracefulShutdown("SIGINT"));
      process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
      process.on("SIGQUIT", () => gracefulShutdown("SIGQUIT"));

      // Handle uncaught exceptions
      process.on("uncaughtException", (error) => {
        logger.error("💥 Uncaught Exception:", error);
        gracefulShutdown("uncaughtException");
      });

      process.on("unhandledRejection", (reason, promise) => {
        logger.error("💥 Unhandled Rejection at:", promise, "reason:", reason);
        gracefulShutdown("unhandledRejection");
      });

      // Keep the process running
      if (!isRender) {
        // Only show this message in development
        console.log("\n🔄 Cron scheduler is running. Press Ctrl+C to stop.");
      }

      break;

    case "stats":
      displayStats();
      break;

    case "schedule":
      displaySchedule();
      break;

    case "run":
      logger.info("🎬 Running single automation job...");
      try {
        const result = await runAutomationWithRetry();
        console.log(`✅ Automation completed: ${result.youtubeUrl}`);
      } catch (error) {
        console.error(`❌ Automation failed: ${error.message}`);
        process.exit(1);
      }
      break;

    case "cleanup":
      await runCleanup();
      break;

    default:
      console.log("YouTube Automation Cron Scheduler");
      console.log("================================");
      console.log("");
      console.log("Usage:");
      console.log("  npm run cron start    - Start the cron scheduler");
      console.log("  npm run cron stats    - Show upload statistics");
      console.log("  npm run cron schedule - Show current schedule");
      console.log("  npm run cron run      - Run single automation job");
      console.log("  npm run cron cleanup  - Clean up old files");
      console.log("");
      console.log("Environment variables:");
      console.log(
        "  CRON_SCHEDULE_TYPE - Schedule type (sixPerDay, threePerDay, fourPerDay, eightPerDay)"
      );
      console.log("  TZ                 - Timezone (default: local timezone)");
      console.log(
        "  NODE_ENV           - Environment (development/production)"
      );
      break;
  }
}

// Run main function
main().catch((error) => {
  logger.error("❌ Fatal error in cron scheduler:", error);
  process.exit(1);
});
