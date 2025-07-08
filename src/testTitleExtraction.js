import { generateStory } from './storyGenerator.js';

async function testTitleExtraction() {
    try {
        console.log('🧪 Testing title extraction from story generator...');
        
        const result = await generateStory();
        
        console.log('✅ Story generation successful!');
        console.log('📋 Extracted data:');
        console.log(`   Title: "${result.title}"`);
        console.log(`   Content length: ${result.content.length} characters`);
        console.log(`   Story length: ${result.story.length} characters`);
        
        // Verify title is not undefined
        if (result.title && result.title.trim()) {
            console.log('✅ Title extraction working correctly!');
        } else {
            console.log('❌ Title extraction failed - title is empty or undefined');
        }
        
    } catch (error) {
        console.error('❌ Error in title extraction test:', error);
    }
}

testTitleExtraction(); 