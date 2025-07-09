import express from 'express';
import { runAutomation, getUploadStats } from './automationRunner.js';
import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configure Winston logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    defaultMeta: { service: 'ping-server' },
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ]
});

const app = express();
const PORT = process.env.PORT || 3000;

// Health check endpoint
app.get('/health', (req, res) => {
    const stats = getUploadStats();
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        stats: {
            total: stats.total,
            successful: stats.successful,
            failed: stats.failed,
            successRate: stats.successRate
        }
    });
});

// Manual trigger endpoint
app.post('/trigger', async (req, res) => {
    try {
        logger.info('Manual trigger requested');
        const result = await runAutomation();
        res.json({
            success: result.success,
            message: result.success ? 'Automation completed successfully' : 'Automation failed',
            data: result
        });
    } catch (error) {
        logger.error('Manual trigger failed:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Status endpoint
app.get('/status', (req, res) => {
    const stats = getUploadStats();
    res.json({
        stats,
        lastUpload: stats.lastUpload,
        recentUploads: stats.recentUploads
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'YouTube Automation Server',
        endpoints: {
            health: '/health',
            status: '/status',
            trigger: '/trigger (POST)'
        },
        uptime: process.uptime()
    });
});

// Start server
app.listen(PORT, () => {
    logger.info(`🚀 Ping server running on port ${PORT}`);
    logger.info(`📊 Health check: http://localhost:${PORT}/health`);
    logger.info(`📈 Status: http://localhost:${PORT}/status`);
});

export default app; 