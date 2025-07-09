import dotenv from 'dotenv';
import { createStoryVideo } from './storyToVideo.js';
import { uploadToYouTube } from './youtubeUploader.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import winston from 'winston';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configure Winston logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: 'youtube-automation' },
    transports: [
        new winston.transports.File({ filename: path.join(__dirname, '../logs/error.log'), level: 'error' }),
        new winston.transports.File({ filename: path.join(__dirname, '../logs/combined.log') }),
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ]
});

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Track upload history
const UPLOAD_HISTORY_FILE = path.join(__dirname, '../logs/upload-history.json');

function loadUploadHistory() {
    try {
        if (fs.existsSync(UPLOAD_HISTORY_FILE)) {
            const data = fs.readFileSync(UPLOAD_HISTORY_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        logger.error('Error loading upload history:', error);
    }
    return [];
}

function saveUploadHistory(history) {
    try {
        fs.writeFileSync(UPLOAD_HISTORY_FILE, JSON.stringify(history, null, 2));
    } catch (error) {
        logger.error('Error saving upload history:', error);
    }
}

function addToUploadHistory(videoData) {
    const history = loadUploadHistory();
    history.push({
        ...videoData,
        timestamp: new Date().toISOString()
    });
    
    // Keep only last 100 entries
    if (history.length > 100) {
        history.splice(0, history.length - 100);
    }
    
    saveUploadHistory(history);
}

export async function runAutomation() {
    const startTime = new Date();
    const sessionId = `session-${startTime.getTime()}`;
    
    logger.info(`🚀 Starting automation session: ${sessionId}`, { sessionId });
    
    try {
        // Step 1: Generate complete video
        logger.info('📝 Step 1: Generating story and video...', { sessionId });
        const videoResult = await createStoryVideo();
        logger.info('✅ Video generation completed', { 
            sessionId, 
            videoPath: videoResult.videoPath,
            title: videoResult.title 
        });

        // Step 2: Prepare YouTube metadata with proper title sanitization
        const sanitizedTitle = sanitizeTitle(videoResult.title);
        const youtubeMetadata = {
            title: sanitizedTitle,
            description: `قصة عربية جميلة: ${sanitizedTitle}\n\n${videoResult.story.substring(0, 200)}...\n\n#قصة #عربية #مغربية #حكمة #قصص #عربية #حكايات`
        };

        // Validate title before proceeding
        if (!sanitizedTitle || sanitizedTitle.trim().length === 0) {
            throw new Error('Generated title is empty or invalid after sanitization');
        }

        logger.info('📝 Step 2: Uploading to YouTube...', { 
            sessionId, 
            originalTitle: videoResult.title,
            sanitizedTitle: sanitizedTitle 
        });
        
        // Step 3: Upload to YouTube
        const videoId = await uploadToYouTube(videoResult.videoPath, videoResult.thumbnailPath, youtubeMetadata);
        logger.info('✅ YouTube upload completed', { 
            sessionId, 
            videoId,
            url: `https://youtube.com/watch?v=${videoId}` 
        });

        // Step 4: Record successful upload
        const uploadData = {
            sessionId,
            videoId,
            title: sanitizedTitle,
            originalTitle: videoResult.title,
            videoPath: videoResult.videoPath,
            thumbnailPath: videoResult.thumbnailPath,
            youtubeUrl: `https://youtube.com/watch?v=${videoId}`,
            duration: new Date() - startTime
        };
        
        addToUploadHistory(uploadData);
        
        logger.info('🎉 Automation completed successfully', {
            sessionId,
            videoId,
            duration: uploadData.duration,
            youtubeUrl: uploadData.youtubeUrl
        });

        return {
            success: true,
            videoId,
            title: sanitizedTitle,
            youtubeUrl: uploadData.youtubeUrl,
            duration: uploadData.duration
        };

    } catch (error) {
        const errorData = {
            sessionId,
            error: error.message,
            stack: error.stack,
            duration: new Date() - startTime
        };
        
        logger.error('❌ Automation failed', errorData);
        
        // Save error to history
        const history = loadUploadHistory();
        history.push({
            ...errorData,
            timestamp: new Date().toISOString(),
            success: false
        });
        saveUploadHistory(history);
        
        return {
            success: false,
            error: error.message,
            sessionId,
            duration: errorData.duration
        };
    }
}

// Function to sanitize title for YouTube
function sanitizeTitle(title) {
    if (!title || typeof title !== 'string') {
        return 'قصة عربية جميلة - Story Time';
    }
    
    // Remove quotes and other problematic characters
    let sanitized = title
        .replace(/["""'']/g, '') // Remove quotes
        .replace(/[<>]/g, '') // Remove angle brackets
        .replace(/[|\\]/g, '') // Remove pipes and backslashes
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .trim();
    
    // Ensure minimum length
    if (sanitized.length < 3) {
        sanitized = 'قصة عربية جميلة - Story Time';
    }
    
    // Ensure maximum length (YouTube limit is 100 characters)
    if (sanitized.length > 100) {
        sanitized = sanitized.substring(0, 97) + '...';
    }
    
    // Add fallback if title is still empty after sanitization
    if (!sanitized || sanitized.trim().length === 0) {
        sanitized = 'قصة عربية جميلة - Story Time';
    }
    
    return sanitized;
}

// Function to get upload statistics
export function getUploadStats() {
    const history = loadUploadHistory();
    const successful = history.filter(entry => entry.success !== false);
    const failed = history.filter(entry => entry.success === false);
    
    return {
        total: history.length,
        successful: successful.length,
        failed: failed.length,
        successRate: history.length > 0 ? (successful.length / history.length * 100).toFixed(2) : 0,
        lastUpload: successful.length > 0 ? successful[successful.length - 1] : null,
        recentUploads: successful.slice(-5) // Last 5 successful uploads
    };
}

// Function to clean up old files
export function cleanupOldFiles() {
    const outputDir = path.join(__dirname, '../output');
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    const now = Date.now();
    
    ['stories', 'audio', 'video', 'thumbnails', 'subtitles'].forEach(subdir => {
        const dirPath = path.join(outputDir, subdir);
        if (fs.existsSync(dirPath)) {
            const files = fs.readdirSync(dirPath);
            files.forEach(file => {
                const filePath = path.join(dirPath, file);
                const stats = fs.statSync(filePath);
                if (now - stats.mtime.getTime() > maxAge) {
                    try {
                        fs.unlinkSync(filePath);
                        logger.info(`Cleaned up old file: ${filePath}`);
                    } catch (error) {
                        logger.error(`Error cleaning up file ${filePath}:`, error);
                    }
                }
            });
        }
    });
}

// If run directly, execute automation
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    runAutomation()
        .then(result => {
            if (result.success) {
                console.log(`✅ Automation completed successfully!`);
                console.log(`📺 Video: ${result.youtubeUrl}`);
                console.log(`⏱️ Duration: ${result.duration}ms`);
            } else {
                console.log(`❌ Automation failed: ${result.error}`);
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('❌ Unexpected error:', error);
            process.exit(1);
        });
} 