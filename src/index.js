import dotenv from 'dotenv';
import { generateStory } from './storyGenerator.js';
import { convertToSpeech } from './speechGenerator.js';
import { generateThumbnail } from './thumbnailGenerator.js';
import { createVideo } from './videoCreator.js';
import { generateSubtitles } from './subtitleGenerator.js';
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
        const storyResult = await generateStory();
        console.log('✅ Story generated successfully');

        // Get the latest story file
        const storiesDir = path.join(__dirname, '../output/stories');
        const storyFiles = fs.readdirSync(storiesDir)
            .filter(file => file.startsWith('story-') && file.endsWith('.txt'))
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
        const thumbnailPath = await generateThumbnail(storyResult.title);
        console.log('✅ Thumbnail generated successfully');

        // 4. Generate Subtitles
        console.log('📝 Generating subtitles...');
        const subtitlePath = await generateSubtitles(latestStoryPath, 420); // 7 minutes duration
        console.log('✅ Subtitles generated successfully');

        // 5. Create Video with Subtitles
        console.log('🎥 Creating video with subtitles...');
        const videoPath = await createVideo(audioPath, subtitlePath);
        console.log('✅ Video created successfully');

        // 6. Prepare story object for YouTube upload
        const storyForYouTube = {
            title: storyResult.title.replace(/"/g, ''),
            description: `قصة عربية جميلة: ${storyResult.title}\n\n${storyResult.story.substring(0, 200)}...\n\n#قصة #عربية #مغربية #حكمة`
        };

        // 7. Upload to YouTube
        console.log('📤 Uploading to YouTube...');
        const videoId = await uploadToYouTube(videoPath, thumbnailPath, storyForYouTube);
        console.log('✅ Video uploaded successfully');
        console.log(`🎉 Video published! Watch it here: https://youtube.com/watch?v=${videoId}`);

    } catch (error) {
        console.error('❌ Error in workflow:', error);
        process.exit(1);
    }
}

main(); 