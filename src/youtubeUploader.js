import { google } from 'googleapis';
import fs from 'fs';
import dotenv from 'dotenv';
import sharp from 'sharp';
import path from 'path';

dotenv.config();

const oauth2Client = new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    'http://localhost:3000/oauth2callback'
);

oauth2Client.setCredentials({
    refresh_token: process.env.YOUTUBE_REFRESH_TOKEN
});

const youtube = google.youtube('v3');

// Helper function to compress thumbnail to meet YouTube's 2MB limit
async function compressThumbnail(thumbnailPath) {
    try {
        const stats = fs.statSync(thumbnailPath);
        const fileSizeInBytes = stats.size;
        const fileSizeInMB = fileSizeInBytes / (1024 * 1024);
        
        console.log(`📸 Original thumbnail size: ${fileSizeInMB.toFixed(2)}MB`);
        
        // If thumbnail is already under 2MB, return the original path
        if (fileSizeInMB <= 2) {
            console.log('✅ Thumbnail is already under 2MB limit');
            return thumbnailPath;
        }
        
        // Create compressed thumbnail
        const compressedPath = thumbnailPath.replace('.png', '-compressed.png');
        
        await sharp(thumbnailPath)
            .resize(1280, 720, { fit: 'inside', withoutEnlargement: true })
            .png({ quality: 80, compressionLevel: 9 })
            .toFile(compressedPath);
        
        const compressedStats = fs.statSync(compressedPath);
        const compressedSizeInMB = compressedStats.size / (1024 * 1024);
        
        console.log(`📸 Compressed thumbnail size: ${compressedSizeInMB.toFixed(2)}MB`);
        
        return compressedPath;
    } catch (error) {
        console.error('Error compressing thumbnail:', error);
        return thumbnailPath; // Return original if compression fails
    }
}

export async function uploadToYouTube(videoPath, thumbnailPath, story) {
    try {
        // Upload video
        const videoResponse = await youtube.videos.insert(
            {
                auth: oauth2Client,
                part: ['snippet', 'status'],
                requestBody: {
                    snippet: {
                        title: story.title,
                        description: story.description,
                        tags: ['story', 'moroccan', 'arabic', 'darija'],
                        categoryId: '22' // People & Blogs category
                    },
                    status: {
                        privacyStatus: 'public'
                    }
                },
                media: {
                    body: fs.createReadStream(videoPath)
                }
            }
        );

        const videoId = videoResponse.data.id;
        console.log('✅ Video uploaded successfully!');

        // Compress and upload thumbnail if provided
        if (thumbnailPath && fs.existsSync(thumbnailPath)) {
            try {
                const compressedThumbnailPath = await compressThumbnail(thumbnailPath);
                
                await youtube.thumbnails.set(
                    {
                        auth: oauth2Client,
                        videoId: videoId,
                        media: {
                            body: fs.createReadStream(compressedThumbnailPath)
                        }
                    }
                );
                
                console.log('✅ Thumbnail uploaded successfully!');
                
                // Clean up compressed thumbnail if it was created
                if (compressedThumbnailPath !== thumbnailPath) {
                    fs.unlinkSync(compressedThumbnailPath);
                }
            } catch (thumbnailError) {
                console.warn('⚠️ Thumbnail upload failed, but video was uploaded successfully:', thumbnailError.message);
            }
        }

        return videoId;
    } catch (error) {
        console.error('Error uploading to YouTube:', error);
        throw error;
    }
} 