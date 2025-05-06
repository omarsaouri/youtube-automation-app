import dotenv from 'dotenv';
import { generateStory } from './storyGenerator.js';
import { convertToSpeech } from './speechGenerator.js';
import { generateThumbnail } from './thumbnailGenerator.js';
import { createVideo } from './videoCreator.js';
import { uploadToYouTube } from './youtubeUploader.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
    try {
        console.log('🚀 Starting YouTube automation workflow...');

        // 1. Generate Story
        console.log('📝 Generating story...');
        const story = await generateStory();
        console.log('✅ Story generated successfully');

        // Get the latest story file
        const storiesDir = path.join(__dirname, '../output/stories');
        const storyFiles = fs.readdirSync(storiesDir)
            .filter(file => file.startsWith('story-') && file.endsWith('.json'))
            .sort()
            .reverse();
        
        if (storyFiles.length === 0) {
            throw new Error('No story files found');
        }

        const latestStoryPath = path.join(storiesDir, storyFiles[0]);

        // 2. Convert Story to Speech
        console.log('🔊 Converting story to speech...');
        const audioPath = await convertToSpeech(latestStoryPath);
        console.log('✅ Audio generated successfully');

        // 3. Generate Thumbnail
        console.log('🖼️ Generating thumbnail...');
        const thumbnailPath = await generateThumbnail(story.title);
        console.log('✅ Thumbnail generated successfully');

        // 4. Create Video
        console.log('🎥 Creating video...');
        const videoPath = await createVideo(thumbnailPath, audioPath);
        console.log('✅ Video created successfully');

        // 5. Upload to YouTube
        console.log('📤 Uploading to YouTube...');
        const videoId = await uploadToYouTube(videoPath, thumbnailPath, story);
        console.log('✅ Video uploaded successfully');
        console.log(`🎉 Video published! Watch it here: https://youtube.com/watch?v=${videoId}`);

    } catch (error) {
        console.error('❌ Error in workflow:', error);
        process.exit(1);
    }
}

main(); 