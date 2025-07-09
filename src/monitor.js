import { getUploadStats } from './automationRunner.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import winston from 'winston';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configure logger for monitoring
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: path.join(__dirname, '../logs/monitor.log') }),
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ]
});

// Function to get system status
function getSystemStatus() {
    const stats = getUploadStats();
    const now = new Date();
    
    // Check if there were uploads today
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayUploads = stats.recentUploads.filter(upload => 
        new Date(upload.timestamp) >= today
    );
    
    // Check last upload time
    const lastUploadTime = stats.lastUpload ? new Date(stats.lastUpload.timestamp) : null;
    const hoursSinceLastUpload = lastUploadTime ? 
        (now - lastUploadTime) / (1000 * 60 * 60) : null;
    
    return {
        stats,
        todayUploads: todayUploads.length,
        lastUploadTime,
        hoursSinceLastUpload,
        isHealthy: hoursSinceLastUpload === null || hoursSinceLastUpload < 6, // Consider unhealthy if no upload in 6+ hours
        currentTime: now
    };
}

// Function to display real-time dashboard
function displayDashboard() {
    const status = getSystemStatus();
    
    console.clear();
    console.log('🎬 YouTube Automation Monitor');
    console.log('=============================');
    console.log(`📅 ${status.currentTime.toLocaleString()}`);
    console.log('');
    
    // Overall stats
    console.log('📊 Overall Statistics:');
    console.log(`   Total uploads: ${status.stats.total}`);
    console.log(`   Successful: ${status.stats.successful}`);
    console.log(`   Failed: ${status.stats.failed}`);
    console.log(`   Success rate: ${status.stats.successRate}%`);
    console.log('');
    
    // Today's activity
    console.log('📈 Today\'s Activity:');
    console.log(`   Uploads today: ${status.todayUploads}/6`);
    console.log(`   Status: ${status.isHealthy ? '✅ Healthy' : '⚠️  Needs attention'}`);
    
    if (status.lastUploadTime) {
        console.log(`   Last upload: ${status.lastUploadTime.toLocaleString()}`);
        console.log(`   Hours since last: ${status.hoursSinceLastUpload?.toFixed(1)}`);
    } else {
        console.log(`   Last upload: Never`);
    }
    console.log('');
    
    // Recent uploads
    if (status.stats.recentUploads.length > 0) {
        console.log('🎥 Recent Uploads:');
        status.stats.recentUploads.slice(0, 5).forEach((upload, index) => {
            const uploadTime = new Date(upload.timestamp);
            const timeAgo = ((status.currentTime - uploadTime) / (1000 * 60 * 60)).toFixed(1);
            console.log(`   ${index + 1}. ${upload.title}`);
            console.log(`      ${upload.youtubeUrl} (${timeAgo}h ago)`);
        });
    }
    console.log('');
    
    // System health
    console.log('🏥 System Health:');
    if (status.isHealthy) {
        console.log('   ✅ Automation system is running normally');
    } else {
        console.log('   ⚠️  No recent uploads detected');
        console.log('   💡 Check logs for potential issues');
    }
    console.log('');
    
    console.log('Press Ctrl+C to exit | Auto-refresh every 30 seconds');
}

// Function to check for errors in logs
function checkForErrors() {
    const logFiles = [
        path.join(__dirname, '../logs/error.log'),
        path.join(__dirname, '../logs/cron-error.log'),
        path.join(__dirname, '../logs/combined.log')
    ];
    
    const errors = [];
    
    logFiles.forEach(logFile => {
        if (fs.existsSync(logFile)) {
            try {
                const content = fs.readFileSync(logFile, 'utf8');
                const lines = content.split('\n').filter(line => line.trim());
                
                // Get last 10 lines and check for errors
                const recentLines = lines.slice(-10);
                recentLines.forEach(line => {
                    try {
                        const logEntry = JSON.parse(line);
                        if (logEntry.level === 'error') {
                            errors.push({
                                file: path.basename(logFile),
                                message: logEntry.message,
                                timestamp: logEntry.timestamp
                            });
                        }
                    } catch (e) {
                        // Skip non-JSON lines
                    }
                });
            } catch (error) {
                logger.error(`Error reading log file ${logFile}:`, error);
            }
        }
    });
    
    return errors;
}

// Function to display error report
function displayErrorReport() {
    const errors = checkForErrors();
    
    if (errors.length === 0) {
        console.log('✅ No recent errors found');
        return;
    }
    
    console.log('\n❌ Recent Errors:');
    console.log('================');
    
    errors.slice(0, 5).forEach((error, index) => {
        console.log(`${index + 1}. [${error.file}] ${error.message}`);
        console.log(`   Time: ${new Date(error.timestamp).toLocaleString()}`);
        console.log('');
    });
}

// Function to generate daily report
function generateDailyReport() {
    const status = getSystemStatus();
    const errors = checkForErrors();
    
    const report = {
        date: status.currentTime.toISOString().split('T')[0],
        timestamp: status.currentTime.toISOString(),
        stats: status.stats,
        todayUploads: status.todayUploads,
        isHealthy: status.isHealthy,
        errors: errors.length,
        recentErrors: errors.slice(0, 5)
    };
    
    const reportDir = path.join(__dirname, '../logs/reports');
    if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
    }
    
    const reportFile = path.join(reportDir, `daily-report-${report.date}.json`);
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    
    return report;
}

// Main monitoring function
async function startMonitoring() {
    const command = process.argv[2];
    
    switch (command) {
        case 'dashboard':
            console.log('🎬 Starting real-time monitoring dashboard...');
            console.log('Press Ctrl+C to exit');
            
            // Initial display
            displayDashboard();
            
            // Auto-refresh every 30 seconds
            const interval = setInterval(() => {
                displayDashboard();
            }, 30000);
            
            // Handle graceful shutdown
            process.on('SIGINT', () => {
                clearInterval(interval);
                console.log('\n🛑 Monitoring stopped');
                process.exit(0);
            });
            break;
            
        case 'status':
            const status = getSystemStatus();
            console.log('\n📊 System Status Report:');
            console.log('=======================');
            console.log(`Date: ${status.currentTime.toLocaleString()}`);
            console.log(`Today's uploads: ${status.todayUploads}/6`);
            console.log(`System health: ${status.isHealthy ? '✅ Healthy' : '⚠️  Needs attention'}`);
            console.log(`Success rate: ${status.stats.successRate}%`);
            
            if (status.lastUploadTime) {
                console.log(`Last upload: ${status.lastUploadTime.toLocaleString()}`);
                console.log(`Hours since last: ${status.hoursSinceLastUpload?.toFixed(1)}`);
            }
            break;
            
        case 'errors':
            displayErrorReport();
            break;
            
        case 'report':
            const report = generateDailyReport();
            console.log('📋 Daily report generated:');
            console.log(`Date: ${report.date}`);
            console.log(`Uploads today: ${report.todayUploads}/6`);
            console.log(`Success rate: ${report.stats.successRate}%`);
            console.log(`Errors: ${report.errors}`);
            console.log(`Report saved to: logs/reports/daily-report-${report.date}.json`);
            break;
            
        default:
            console.log('YouTube Automation Monitor');
            console.log('========================');
            console.log('');
            console.log('Usage:');
            console.log('  npm run monitor dashboard - Start real-time dashboard');
            console.log('  npm run monitor status   - Show current system status');
            console.log('  npm run monitor errors   - Show recent errors');
            console.log('  npm run monitor report   - Generate daily report');
            break;
    }
}

// Run monitoring
startMonitoring().catch(error => {
    logger.error('❌ Fatal error in monitor:', error);
    process.exit(1);
}); 