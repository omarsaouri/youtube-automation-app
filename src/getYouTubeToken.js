import { google } from 'googleapis';
import readline from 'readline';
import dotenv from 'dotenv';

dotenv.config();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const oauth2Client = new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    'http://localhost:3000/oauth2callback'
);

const scopes = [
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/youtube'
];

async function getRefreshToken() {
    try {
        console.log('🔐 YouTube OAuth2 Authentication Setup');
        console.log('=====================================');
        
        // Check if credentials are set
        if (!process.env.YOUTUBE_CLIENT_ID || !process.env.YOUTUBE_CLIENT_SECRET) {
            console.log('❌ Missing YouTube credentials in .env file');
            console.log('Please add the following to your .env file:');
            console.log('YOUTUBE_CLIENT_ID=your_client_id_here');
            console.log('YOUTUBE_CLIENT_SECRET=your_client_secret_here');
            return;
        }

        // Generate auth URL
        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            prompt: 'consent'
        });

        console.log('\n📋 Follow these steps:');
        console.log('1. Open this URL in your browser:');
        console.log(authUrl);
        console.log('\n2. Sign in with your Google account');
        console.log('3. Grant permissions to upload to YouTube');
        console.log('4. Copy the authorization code from the URL');
        
        const code = await new Promise((resolve) => {
            rl.question('\n🔑 Enter the authorization code: ', (answer) => {
                resolve(answer);
            });
        });

        // Exchange code for tokens
        const { tokens } = await oauth2Client.getToken(code);
        
        console.log('\n✅ Authentication successful!');
        console.log('📝 Add this to your .env file:');
        console.log(`YOUTUBE_REFRESH_TOKEN=${tokens.refresh_token}`);
        
        if (tokens.access_token) {
            console.log(`YOUTUBE_ACCESS_TOKEN=${tokens.access_token}`);
        }

        rl.close();
    } catch (error) {
        console.error('❌ Error getting refresh token:', error);
        rl.close();
    }
}

getRefreshToken(); 