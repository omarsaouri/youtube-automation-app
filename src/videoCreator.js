import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, '../output/video');
const VIDEO_SNIPPET_PATH = path.join(__dirname, '../src/videoSnippets/video.mp4');

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

export async function createVideo(audioPath) {
    return new Promise((resolve, reject) => {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const outputPath = path.join(OUTPUT_DIR, `video-${timestamp}.mp4`);

        // First, get the duration of the audio
        ffmpeg.ffprobe(audioPath, (err, metadata) => {
            if (err) {
                reject(err);
                return;
            }

            const audioDuration = metadata.format.duration;
            const targetDuration = 420; // 7 minutes in seconds
            const speedFactor = audioDuration / targetDuration;

            ffmpeg()
                .input(VIDEO_SNIPPET_PATH)
                .inputOptions(['-stream_loop -1']) // Loop the video
                .input(audioPath)
                .outputOptions([
                    '-c:v libx264',
                    '-c:a aac',
                    '-b:a 192k',
                    '-pix_fmt yuv420p',
                    '-t', targetDuration.toString(), // Set exact duration to 7 minutes
                    '-filter_complex', `[0:v]setpts=${speedFactor}*PTS[v];[v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2[vout]`,
                    '-map', '[vout]',
                    '-map', '1:a'
                ])
                .output(outputPath)
                .on('end', () => {
                    console.log('Video processing finished');
                    resolve(outputPath);
                })
                .on('error', (err) => {
                    console.error('Error processing video:', err);
                    reject(err);
                })
                .run();
        });
    });
} 