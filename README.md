# YouTube Automation App

This Node.js application automates the process of creating and uploading YouTube videos with Moroccan Arabic (Darija) content. It generates stories, converts them to speech, creates thumbnails, generates subtitles, and uploads the final video to YouTube.

## Features

- Story generation in Moroccan Arabic using OpenAI
- Text-to-speech conversion using Azure Speech Services
- Thumbnail generation with text overlay
- **Automatic subtitle generation in SRT format**
- Video creation using ffmpeg with subtitle overlay
- Automatic YouTube upload with metadata

## Prerequisites

- Node.js (v14 or higher)
- FFmpeg installed on your system
- API keys for:
  - OpenAI
  - Azure Speech Services
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
AZURE_SPEECH_KEY=your_azure_speech_key
AZURE_SPEECH_REGION=your_azure_region
YOUTUBE_CLIENT_ID=your_youtube_client_id
YOUTUBE_CLIENT_SECRET=your_youtube_client_secret
YOUTUBE_REFRESH_TOKEN=your_youtube_refresh_token
```

4. Install FFmpeg:
- On macOS: `brew install ffmpeg`
- On Ubuntu: `sudo apt-get install ffmpeg`
- On Windows: Download from [ffmpeg.org](https://ffmpeg.org/download.html)

## Usage

### Complete Workflow
Run the complete automation workflow:
```bash
npm start
```

The application will:
1. Generate a story in Moroccan Arabic
2. Convert the story to speech
3. Create a thumbnail
4. **Generate subtitles in SRT format**
5. **Combine the thumbnail, audio, and subtitles into a video**
6. Upload the video to YouTube

### Individual Components

#### Story to Video with Subtitles
```bash
node src/storyToVideo.js
```

#### Test Subtitle Generation
```bash
node src/testSubtitles.js
```

#### Test Complete Workflow
```bash
node src/testCompleteWorkflow.js
```

## Subtitle Feature

The application now includes automatic subtitle generation with the following features:

- **Automatic text segmentation**: Splits the story into appropriate subtitle chunks
- **Proper timing**: Calculates timing based on audio duration
- **Arabic text support**: Optimized for Arabic text display
- **SRT format**: Standard subtitle format compatible with most video players
- **FFmpeg integration**: Automatically overlays subtitles on the video

### Subtitle Styling
Subtitles are styled with:
- Font: Noto Sans Arabic (optimized for Arabic text)
- Font size: 24px
- Color: White text with black outline
- Position: Bottom center with margin
- Shadow: Black shadow for better readability

### Customization
You can modify subtitle styling by editing the `force_style` parameter in `src/videoCreator.js`:

```javascript
force_style='FontName=Noto Sans Arabic,FontSize=24,PrimaryColour=&Hffffff,OutlineColour=&H000000,OutlineWidth=2,ShadowColour=&H000000,ShadowDepth=2,MarginV=50,Alignment=2'
```

## Output

The application creates the following output directories:
- `output/audio`: Contains the generated MP3 files
- `output/thumbnails`: Contains the generated thumbnail images
- `output/subtitles`: Contains the generated SRT subtitle files
- `output/video`: Contains the final MP4 videos with embedded subtitles

## License

MIT 