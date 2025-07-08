import { generateSubtitles } from './subtitleGenerator.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function testSubtitles() {
    try {
        console.log('Testing subtitle generation...');
        
        // Create a test story file
        const testStoryContent = `العنوان: رحلة الحكمة

القصة:
كان هناك رجل عجوز يعيش في قرية صغيرة في جبال الأطلس. كان هذا الرجل معروفاً بحكمته وذكائه، وكان الناس يأتون إليه من كل مكان ليستشيروه في أمور حياتهم. كان الرجل العجوز يجلس كل يوم تحت شجرة الزيتون الكبيرة أمام بيته، ويستقبل الزوار بابتسامة هادئة.

في أحد الأيام، جاء إليه شاب غريب وقال له: "أيها الحكيم، لقد سمعت عن حكمتك من بعيد، وأريد أن أسألك سؤالاً مهماً." نظر الرجل العجوز إلى الشاب وقال: "تحدث يا بني، أنا هنا لمساعدتك." قال الشاب: "ما هو سر السعادة الحقيقية؟"

فكر الرجل العجوز قليلاً ثم قال: "السعادة الحقيقية يا بني ليست في جمع المال أو السلطة، بل في ثلاثة أشياء: أولاً، أن تحب ما تفعله. ثانياً، أن تحب من حولك. ثالثاً، أن تكون ممتناً لما لديك." استمع الشاب باهتمام وقال: "هذا جميل، لكن كيف يمكنني تطبيق هذه النصائح؟"

أجاب الرجل العجوز: "ابدأ بالخطوة الأولى. ابحث عن شيء تحب فعله حقاً، واعمل عليه كل يوم. ثم ابدأ في إظهار الحب والاهتمام لمن حولك، وستجد أن الحب يعود إليك مضاعفاً. وأخيراً، كل يوم قبل النوم، فكر في ثلاثة أشياء أنت ممتن لها."

شكر الشاب الرجل العجوز وذهب. بعد سنوات، عاد الشاب إلى القرية وقد أصبح رجلاً ناجحاً وسعيداً. قال للرجل العجوز: "لقد اتبعت نصائحك، والآن أنا سعيد حقاً. شكراً لك على الحكمة التي علمتني إياها."

ابتسم الرجل العجوز وقال: "الحكمة الحقيقية يا بني هي أن تشارك ما تعلمته مع الآخرين. الآن دورك لتصبح حكيماً وتساعد من حولك." فهم الشاب الدرس، وأصبح هو أيضاً مصدر حكمة للآخرين.

ومنذ ذلك اليوم، تعلم الناس في القرية أن السعادة الحقيقية تكمن في العطاء والمشاركة، وأن الحكمة تزداد عندما نشاركها مع الآخرين.`;

        const testStoryPath = path.join(__dirname, '../output/stories', 'test-story.txt');
        fs.writeFileSync(testStoryPath, testStoryContent, 'utf8');
        
        // Generate subtitles
        const subtitlePath = await generateSubtitles(testStoryPath, 420); // 7 minutes
        
        console.log('✅ Subtitle generation test completed successfully!');
        console.log(`📁 Subtitle file created: ${subtitlePath}`);
        
        // Read and display the generated subtitles
        const subtitleContent = fs.readFileSync(subtitlePath, 'utf8');
        console.log('\n📝 Generated subtitles preview:');
        console.log(subtitleContent.substring(0, 500) + '...');
        
    } catch (error) {
        console.error('❌ Error in subtitle test:', error);
    }
}

testSubtitles(); 