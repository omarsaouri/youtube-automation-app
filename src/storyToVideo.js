import { generateStory } from './storyGenerator.js';
import { createVideo } from './videoCreator.js';
import { generateThumbnail } from './thumbnailGenerator.js';
import { convertToSpeech } from './speechGenerator.js';
import { generateSubtitles } from './subtitleGenerator.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';   

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, '../output');

// Ensure output directories exist
['stories', 'audio', 'video', 'thumbnails', 'subtitles'].forEach(dir => {
    const dirPath = path.join(OUTPUT_DIR, dir);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
});

export async function createStoryVideo() {
    try {
        // Step 1: Generate the story
        console.log('Generating story...');
        const { content: storyContent } = await generateStory();
        
        // Extract title and story content with improved logic
        const titleMatch = storyContent.match(/العنوان:\s*"([^"]+)"|العنوان:\s*([^\n]+)/);
        const storyMatch = storyContent.match(/القصة:\s*([\s\S]+)/);
        
        if (!storyMatch) {
            throw new Error('Could not extract story content from the generated text');
        }
        
        let title = 'قصة عربية جميلة - Story Time'; // Default title
        if (titleMatch) {
            // Try to get the title from quotes first, then from the general match
            const extractedTitle = (titleMatch[1] || titleMatch[2] || '').trim();
            if (extractedTitle && extractedTitle.length > 0 && extractedTitle.length < 100) {
                title = extractedTitle;
            }
        }
        
        const story = storyMatch[1].trim();
        
        // Validate story content
        if (!story || story.length < 50) {
            throw new Error('Generated story content is too short or empty');
        }
        
        console.log(`📝 Extracted title: "${title}"`);
        console.log(`📖 Story length: ${story.length} characters`);
        
        // Save the story
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const storyPath = path.join(OUTPUT_DIR, 'stories', `story-${timestamp}.txt`);
        fs.writeFileSync(storyPath, storyContent, 'utf8');
        
        // Step 2: Generate audio from the story
        console.log('Generating audio...');
        const audioPath = await convertToSpeech(storyPath);
        
        // Step 3: Create thumbnail
        console.log('Creating thumbnail...');
        const thumbnailPath = await generateThumbnail(title);
        
        // Step 4: Generate subtitles
        console.log('Generating subtitles...');
        const subtitlePath = await generateSubtitles(storyPath, 420); // 7 minutes duration
        
        // Step 5: Create video with subtitles
        console.log('Creating video with subtitles...');
        const videoPath = await createVideo(audioPath, subtitlePath);
        
        console.log('Process completed successfully!');
        console.log('Output files:');
        console.log(`- Story: ${storyPath}`);
        console.log(`- Audio: ${audioPath}`);
        console.log(`- Thumbnail: ${thumbnailPath}`);
        console.log(`- Subtitles: ${subtitlePath}`);
        console.log(`- Video: ${videoPath}`);
        console.log(`- Title: ${title}`);
        
        return {
            storyPath,
            audioPath,
            thumbnailPath,
            subtitlePath,
            videoPath,
            title,
            story
        };
    } catch (error) {
        console.error('Error in createStoryVideo:', error);
        throw error;
    }
}

// For testing purposes
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    createStoryVideo().catch(console.error);
} 