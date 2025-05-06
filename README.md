# YouTube Automation App

This Node.js application automates the process of creating and uploading YouTube videos with Moroccan Arabic (Darija) content. It generates stories, converts them to speech, creates thumbnails, and uploads the final video to YouTube.

## Features

- Story generation in Moroccan Arabic using OpenAI
- Text-to-speech conversion using Amazon Polly
- Thumbnail generation with text overlay
- Video creation using ffmpeg
- Automatic YouTube upload with metadata

## Prerequisites

- Node.js (v14 or higher)
- FFmpeg installed on your system
- API keys for:
  - OpenAI
  - Amazon AWS (Polly)
  - YouTube API

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd youtube-automation-app
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
OPENAI_API_KEY=your_openai_api_key
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
YOUTUBE_CLIENT_ID=your_youtube_client_id
YOUTUBE_CLIENT_SECRET=your_youtube_client_secret
YOUTUBE_REFRESH_TOKEN=your_youtube_refresh_token
```

4. Install FFmpeg:
- On macOS: `brew install ffmpeg`
- On Ubuntu: `sudo apt-get install ffmpeg`
- On Windows: Download from [ffmpeg.org](https://ffmpeg.org/download.html)

## Usage

Run the application:
```bash
npm start
```

The application will:
1. Generate a story in Moroccan Arabic
2. Convert the story to speech
3. Create a thumbnail
4. Combine the thumbnail and audio into a video
5. Upload the video to YouTube

## Output

The application creates the following output directories:
- `output/audio`: Contains the generated MP3 files
- `output/thumbnails`: Contains the generated thumbnail images
- `output/video`: Contains the final MP4 videos

## License

MIT 