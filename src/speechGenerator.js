import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, '../output/audio');

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const envPath = path.join(__dirname, '../.env');
dotenv.config({ path: envPath });

export async function convertToSpeech(storyFilePath) {
    try {
        // Read the story file as text
        const storyContent = fs.readFileSync(storyFilePath, 'utf8');
        
        // Extract the story content from the file
        const storyMatch = storyContent.match(/القصة:\s*([\s\S]+)/);
        if (!storyMatch) {
            throw new Error('Could not extract story content from the file');
        }
        
        const storyText = storyMatch[1].trim();

        // Create speech configuration
        const speechConfig = sdk.SpeechConfig.fromSubscription(
            process.env.AZURE_SPEECH_KEY,
            process.env.AZURE_SPEECH_REGION
        );

        // Set the voice
        speechConfig.speechSynthesisVoiceName = "ar-MA-JamalNeural";

        // Create audio config
        const timestamp = path.basename(storyFilePath).replace('story-', '').replace('.txt', '');
        const outputPath = path.join(OUTPUT_DIR, `story-${timestamp}.mp3`);
        const audioConfig = sdk.AudioConfig.fromAudioFileOutput(outputPath);

        // Create speech synthesizer
        const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

        // Synthesize the text
        const result = await new Promise((resolve, reject) => {
            synthesizer.speakTextAsync(
                storyText,
                result => {
                    synthesizer.close();
                    if (result) {
                        resolve(result);
                    } else {
                        reject(new Error('No speech result received'));
                    }
                },
                error => {
                    synthesizer.close();
                    reject(error);
                }
            );
        });

        return outputPath;
    } catch (error) {
        console.error('Error converting text to speech:', error);
        throw error;
    }
}

// For testing purposes
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const storyPath = path.join(__dirname, '../output/stories', process.argv[2] || 'story-2025-04-28T19-06-13-415Z.json');
    convertToSpeech(storyPath).catch(console.error);
}