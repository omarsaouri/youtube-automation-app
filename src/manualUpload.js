import { uploadToYouTube } from './youtubeUploader.js';
import path from 'path';

// === EDIT THESE PATHS AND DETAILS ===
const videoPath = path.resolve('output/video/video-2025-07-06T20-49-20-277Z.mp4'); 
// const thumbnailPath = path.resolve("output/thumbnails/thumbnail-2025-07-06T20-49-20-047Z.png"); // Commented out to skip thumbnail upload
const thumbnailPath = null; // Set to null to skip thumbnail upload
const story = {
  title: 'Test Upload - Arabic Story', // Change to your desired title
  description: 'This is a test upload from the automation app with Arabic content.' // Change to your desired description
};
// ====================================

async function main() {
  try {
    console.log('🚀 Uploading video to YouTube...');
    const videoId = await uploadToYouTube(videoPath, thumbnailPath, story);
    console.log('✅ Video uploaded! Video ID:', videoId);
    console.log(`🎬 Watch: https://youtube.com/watch?v=${videoId}`);
  } catch (err) {
    console.error('❌ Upload failed:', err);
  }
}

main(); 