import { google } from 'googleapis';
import fs from 'fs';
import dotenv from 'dotenv';

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

        // Upload thumbnail
        await youtube.thumbnails.set(
            {
                auth: oauth2Client,
                videoId: videoId,
                media: {
                    body: fs.createReadStream(thumbnailPath)
                }
            }
        );

        return videoId;
    } catch (error) {
        console.error('Error uploading to YouTube:', error);
        throw error;
    }
} 