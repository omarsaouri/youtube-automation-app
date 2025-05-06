import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, '../output/thumbnails');
const BACKGROUNDS_DIR = path.join(__dirname, '../thumbnailsBackgrounds');

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

export async function generateThumbnail(title) {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const outputPath = path.join(OUTPUT_DIR, `thumbnail-${timestamp}.png`);

        // Get all background images
        const backgroundFiles = fs.readdirSync(BACKGROUNDS_DIR)
            .filter(file => file.startsWith('background') && file.endsWith('.png'));
        
        if (backgroundFiles.length === 0) {
            throw new Error('No background images found in thumbnailsBackgrounds directory');
        }

        // Randomly select a background
        const randomBackground = backgroundFiles[Math.floor(Math.random() * backgroundFiles.length)];
        const backgroundPath = path.join(BACKGROUNDS_DIR, randomBackground);

        // Create the image with the selected background
        const image = sharp(backgroundPath);

        // Second composite: Add text
        const textSvg = `
            <svg width="1280" height="720" xmlns="http://www.w3.org/2000/svg">
                <text x="640" y="620" 
                    font-family="Noto Sans Arabic" 
                    font-size="180" 
                    font-weight="900"
                    fill="#ffffff" 
                    stroke="#FFD707"
                    stroke-width="8"
                    text-anchor="middle"
                    dominant-baseline="middle"
                    style="text-shadow: 0px 0px 25px rgba(255, 165, 0, 0.8), 0px 0px 40px rgba(255, 165, 0, 0.6), 0px 0px 60px rgba(255, 165, 0, 0.4);">
                    ${title}
                </text>
            </svg>
        `;

        const textOverlay = await sharp(Buffer.from(textSvg))
            .png()
            .toBuffer();

        // Apply composites in sequence
        await image
            .composite([
                {
                    input: textOverlay,
                    top: 0,
                    left: 0,
                    blend: 'over'
                }
            ])
            .png()
            .toFile(outputPath);

        return outputPath;
    } catch (error) {
        console.error('Error generating thumbnail:', error);
        throw error;
    }
} 