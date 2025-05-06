import { createVideo } from './videoCreator.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const audioPath = path.join(__dirname, '../output/audio/story-2025-04-30T12-18-03-727Z.txt.mp3');

async function testVideoCreation() {
    try {
        console.log('Starting video creation test...');
        const videoPath = await createVideo(audioPath);
        console.log('Video created successfully at:', videoPath);
    } catch (error) {
        console.error('Error in video creation test:', error);
    }
}

testVideoCreation(); 