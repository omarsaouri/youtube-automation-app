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

export async function createVideo(audioPath, subtitlePath = null) {
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

            // Build the filter complex string
            let filterComplex = `[0:v]setpts=${speedFactor}*PTS[v];[v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2[vout]`;
            
            // Add subtitle overlay if subtitle path is provided
            if (subtitlePath && fs.existsSync(subtitlePath)) {
                filterComplex = `[0:v]setpts=${speedFactor}*PTS[v];[v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2[vout];[vout]subtitles=${subtitlePath}:force_style='FontName=Noto Sans Arabic,FontSize=24,PrimaryColour=&Hffffff,OutlineColour=&H000000,OutlineWidth=2,ShadowColour=&H000000,ShadowDepth=2,MarginV=50,Alignment=2'[final]`;
            }

            const command = ffmpeg()
                .input(VIDEO_SNIPPET_PATH)
                .inputOptions(['-stream_loop -1']) // Loop the video
                .input(audioPath)
                .outputOptions([
                    '-c:v libx264',
                    '-c:a aac',
                    '-b:a 192k',
                    '-pix_fmt yuv420p',
                    '-t', targetDuration.toString(), // Set exact duration to 7 minutes
                    '-filter_complex', filterComplex
                ]);

            // Map the output streams
            if (subtitlePath && fs.existsSync(subtitlePath)) {
                command.outputOptions(['-map', '[final]', '-map', '1:a']);
            } else {
                command.outputOptions(['-map', '[vout]', '-map', '1:a']);
            }

            command
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