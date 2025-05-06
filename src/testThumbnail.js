import { generateThumbnail } from './thumbnailGenerator.js';

async function testThumbnail() {
    try {
        const title = "رحلة، حكمة، وكنز";
        const thumbnailPath = await generateThumbnail(title);
        console.log('Thumbnail generated successfully at:', thumbnailPath);
    } catch (error) {
        console.error('Failed to generate thumbnail:', error);
    }
}

testThumbnail(); 