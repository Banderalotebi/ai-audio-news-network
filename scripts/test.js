import { generateAudioNews } from '../src/services/newsScraper.js';
import dotenv from 'dotenv';
// Load environment variables
dotenv.config();
async function testNewsGeneration() {
    console.log('🧪 Testing AI Audio News Generation...\n');
    try {
        // Test text-only generation
        console.log('1️⃣ Testing text-only news generation...');
        const textResult = await generateAudioNews(false);
        console.log('📰 Headline:', textResult.headline);
        console.log('📝 Script:', textResult.script);
        console.log('⏰ Timestamp:', textResult.timestamp);
        console.log('✅ Text generation successful!\n');
        // Test audio generation
        console.log('2️⃣ Testing audio news generation...');
        const audioResult = await generateAudioNews(true);
        console.log('📰 Headline:', audioResult.headline);
        console.log('📝 Script:', audioResult.script);
        console.log('🔊 Audio URL:', audioResult.audioUrl);
        console.log('⏰ Timestamp:', audioResult.timestamp);
        console.log('✅ Audio generation successful!\n');
        console.log('🎉 All tests passed! Your AI Audio News Network is ready!');
    }
    catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}
testNewsGeneration();
//# sourceMappingURL=test.js.map