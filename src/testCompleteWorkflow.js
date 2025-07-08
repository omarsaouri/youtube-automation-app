import { createStoryVideo } from './storyToVideo.js';

async function testCompleteWorkflow() {
    try {
        console.log('🚀 Testing complete workflow with subtitles...');
        
        const result = await createStoryVideo();
        
        console.log('\n✅ Complete workflow test successful!');
        console.log('📁 Generated files:');
        console.log(`   Story: ${result.storyPath}`);
        console.log(`   Audio: ${result.audioPath}`);
        console.log(`   Thumbnail: ${result.thumbnailPath}`);
        console.log(`   Subtitles: ${result.subtitlePath}`);
        console.log(`   Video: ${result.videoPath}`);
        console.log(`   Title: ${result.title}`);
        
    } catch (error) {
        console.error('❌ Error in complete workflow test:', error);
    }
}

testCompleteWorkflow(); 