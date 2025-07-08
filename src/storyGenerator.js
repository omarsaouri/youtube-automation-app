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
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `أنت كاتب قصص محترف متخصص في الأدب العربي والثقافة المغربية. 
                    تعليمات مهمة:
                    1. اكتب عنوان جذاب للقصة لا يتجاوز 3 كلمات.
                    2. اكتب قصة طويلة ومثيرة باللغة العربية الفصحى، يجب أن تكون القصة طويلة (7-8 دقائق عند قراءتها).
                    3. يجب أن تكون القصة طويلة بما يكفي لقراءة 7-8 دقائق (حوالي 2000-2500 كلمة).
                    4. استخدم علامات الترقيم بشكل صحيح:
                        * استخدم النقطة (.) للأفكار الكاملة
                        * استخدم الفاصلة (،) للتوقفات الطبيعية
                        * استخدم علامة الاستفهام (؟) للأسئلة
                        * استخدم علامة التعجب (!) للتأكيد
                        * استخدم علامات الاقتباس ("") للحوار
                    5. اجعل القصة:
                        * بسيطة وسهلة الفهم
                        * مثيرة وتشويقية
                        * تحتوي على عنصر مفاجأة
                        * تنتهي بعبرة أخلاقية قصيرة
                    6. استخدم لغة بسيطة وواضحة مع الحفاظ على جمالية اللغة العربية.
                    7. يمكنك استخدام حبكة أكثر تعقيداً مع تطور الشخصيات.
                    8. تأكد من أن القصة طويلة بما يكفي (7-8 دقائق قراءة) مع الحفاظ على جودة المحتوى.
                    
                    تنسيق الإجابة:
                    العنوان: [عنوان القصة (3 كلمات أو أقل)]
                    
                    القصة:
                    [محتوى القصة]`
                },
                {
                    role: "user",
                    content: "اكتب قصة طويلة ومثيرة باللغة العربية الفصحى، مع حبكة متطورة وعنصر مفاجأة في النهاية. يجب أن تكون القصة طويلة بما يكفي لقراءة 7-8 دقائق."
                }
            ],
            temperature: 0.7,
            max_tokens: 4000  // Increased for longer stories
        });

        const storyContent = response.choices[0].message.content;
        console.log('Raw response from ChatGPT:', storyContent); // Debug log
        
        // Clean the story content
        const cleanedStory = cleanTextForTTS(storyContent);
        
        // Extract title and story content
        const titleMatch = cleanedStory.match(/العنوان:\s*["“”]?(.+?)["“" ]?\s*(?:\n|$)/);
        const storyMatch = cleanedStory.match(/القصة:\s*([\s\S]+)/);
        
        if (!titleMatch || !storyMatch) {
            throw new Error('Could not extract title or story content from the generated text');
        }
        
        let title = titleMatch[1].trim();
        title = title.replace(/القصة:.*/g, '').trim();
        const story = storyMatch[1].trim();
        
        // Save the story to a plain text file
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const outputPath = path.join(OUTPUT_DIR, `story-${timestamp}.txt`);
        
        fs.writeFileSync(outputPath, cleanedStory, 'utf8');
        console.log('Story saved successfully:', {
            title: title,
            contentLength: cleanedStory.length,
            path: outputPath
        });

        return {
            title: title,
            content: cleanedStory,
            story: story
        };
    } catch (error) {
        console.error('Error generating story:', error);
        throw error;
    }
}

// For testing purposes
if (import.meta.url === `file://${process.argv[1]}`) {
    console.log('Starting story generation...');
    generateStory()
        .then(result => {
            console.log('Story generated successfully!');
            console.log('Content length:', result.content.length);
        })
        .catch(error => {
            console.error('Failed to generate story:', error);
            process.exit(1);
        });
}