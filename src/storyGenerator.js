import OpenAI from 'openai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables with explicit path
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '../.env');
dotenv.config({ path: envPath });

// Verify API key is present
if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not set. Please create a .env file with your API key.');
}

const OUTPUT_DIR = path.join(__dirname, '../output/stories');

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Helper function to clean text for TTS
function cleanTextForTTS(text) {
    return text
        .replace(/\*\*/g, '') // Remove markdown bold
        .replace(/\n\s*\n/g, '\n\n') // Preserve paragraph breaks
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/\.\s*\.\s*\./g, '...') // Standardize ellipsis
        .replace(/\s*,\s*/g, ', ') // Standardize commas
        .replace(/\s*\.\s*/g, '. ') // Standardize periods
        .replace(/\s*\?\s*/g, '? ') // Standardize question marks
        .replace(/\s*!\s*/g, '! ') // Standardize exclamation marks
        .replace(/\s*"\s*/g, '"') // Clean up quotation marks
        .trim();
}

export async function generateStory() {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4.1-nano",
            messages: [
                {
                    role: "system",
                    content: `أنت كاتب قصص محترف متخصص في الأدب العربي والثقافة المغربية. 
                    تعليمات مهمة:
                    1. اكتب عنوان جذاب للقصة لا يتجاوز 3 كلمات.
                    2. اكتب قصة طويلة ومثيرة باللغة العربية الفصحى، يجب أن تكون القصة طويلة (7-8 دقائق عند قراءتها).
                    3. استخدم علامات الترقيم بشكل صحيح:
                        * استخدم النقطة (.) للأفكار الكاملة
                        * استخدم الفاصلة (،) للتوقفات الطبيعية
                        * استخدم علامة الاستفهام (؟) للأسئلة
                        * استخدم علامة التعجب (!) للتأكيد
                        * استخدم علامات الاقتباس ("") للحوار
                    4. اجعل القصة:
                        * بسيطة وسهلة الفهم
                        * مثيرة وتشويقية
                        * تحتوي على عنصر مفاجأة
                        * تنتهي بعبرة أخلاقية قصيرة
                    5. استخدم لغة بسيطة وواضحة مع الحفاظ على جمالية اللغة العربية.
                    6. يمكنك استخدام حبكة أكثر تعقيداً مع تطور الشخصيات.
                    
                    تنسيق الإجابة:
                    العنوان: [عنوان القصة (3 كلمات أو أقل)]
                    
                    القصة:
                    [محتوى القصة]`
                },
                {
                    role: "user",
                    content: "اكتب قصة طويلة ومثيرة باللغة العربية الفصحى، مع حبكة متطورة وعنصر مفاجأة في النهاية."
                }
            ],
            temperature: 0.7,
            max_tokens: 9000  // Increased for longer stories
        });

        const storyContent = response.choices[0].message.content;
        console.log('Raw response from ChatGPT:', storyContent); // Debug log
        
        // Clean the story content
        const cleanedStory = cleanTextForTTS(storyContent);
        
        // Save the story to a plain text file
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const outputPath = path.join(OUTPUT_DIR, `story-${timestamp}.txt`);
        
        fs.writeFileSync(outputPath, cleanedStory, 'utf8');
        console.log('Story saved successfully:', {
            contentLength: cleanedStory.length,
            path: outputPath
        });

        return {
            content: cleanedStory
        };
    } catch (error) {
        console.error('Error generating story:', error);
        throw error;
    }
}

// For testing purposes
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    generateStory().catch(console.error);
}