import { google } from 'googleapis';
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

async function testYouTubeAuth() {
    try {
        console.log('🧪 Testing YouTube API Authentication...');
        
        // Check if credentials are set
        if (!process.env.YOUTUBE_CLIENT_ID) {
            console.log('❌ YOUTUBE_CLIENT_ID is not set');
            return;
        }
        if (!process.env.YOUTUBE_CLIENT_SECRET) {
            console.log('❌ YOUTUBE_CLIENT_SECRET is not set');
            return;
        }
        if (!process.env.YOUTUBE_REFRESH_TOKEN) {
            console.log('❌ YOUTUBE_REFRESH_TOKEN is not set');
            return;
        }

        console.log('✅ All YouTube credentials are set');
        
        // Test API call - get channel info
        const response = await youtube.channels.list({
            auth: oauth2Client,
            part: ['snippet'],
            mine: true
        });

        if (response.data.items && response.data.items.length > 0) {
            const channel = response.data.items[0];
            console.log('✅ YouTube API authentication successful!');
            console.log(`📺 Channel: ${channel.snippet.title}`);
            console.log(`🆔 Channel ID: ${channel.id}`);
        } else {
            console.log('⚠️  Authentication successful but no channel found');
        }

    } catch (error) {
        console.error('❌ YouTube API authentication failed:', error.message);
        
        if (error.message.includes('No access, refresh token')) {
            console.log('\n💡 Solution:');
            console.log('1. Run: node src/getYouTubeToken.js');
            console.log('2. Follow the instructions to get a refresh token');
            console.log('3. Add the refresh token to your .env file');
        }
    }
}

testYouTubeAuth(); 