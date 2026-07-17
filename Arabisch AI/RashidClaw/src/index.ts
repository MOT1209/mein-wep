import { Bot, Context, InputFile } from 'grammy';
import { hydrateFiles } from '@grammyjs/files';
import { config } from './config.js';
import { addMemory, getMemory } from './db/database.js';
import { generateResponse } from './llm/client.js';
import { generateImageDirectly, generateVideoDirectly } from './tools/media.js';
import axios from 'axios';

if (!config.TELEGRAM_BOT_TOKEN || config.TELEGRAM_BOT_TOKEN === 'REPLACE_WITH_YOURS') {
    console.error("TELEGRAM_BOT_TOKEN is missing!");
    process.exit(1);
}

const bot = new Bot(config.TELEGRAM_BOT_TOKEN);

// تعيين نمط التحليل الافتراضي إلى HTML كما يوصي دليل المهندس لتجنب أخطاء الرموز الخاصة
bot.api.config.use((prev, method, payload, signal) => {
    if (method.startsWith("send") && "caption" in payload && !("parse_mode" in payload)) {
        (payload as any).parse_mode = "HTML";
    }
    if (method === "sendMessage" && !("parse_mode" in payload)) {
        (payload as any).parse_mode = "HTML";
    }
    return prev(method, payload, signal);
});

bot.api.config.use(hydrateFiles(bot.token));

// Security: Whitelist
bot.use(async (ctx: Context, next) => {
    const userId = ctx.from?.id;
    if (!userId || !config.ALLOWED_USERS.includes(userId)) return;
    await next();
});

const SYSTEM_PROMPT = `أنت RashidClaw، وكيل ذكاء اصطناعي عربي متقدم وخبير.
مهمتك: فهم أفكار المستخدم وتنفيذها باحترافية والرد بأسلوب طبيعي ومفيد.
**تحذير هام:** لا تستخدم أداة توليد الصور (generate_professional_image) أبداً إذا كانت رسالة المستخدم مجرد تحية (مثل: مرحبا، أهلا) أو سؤالاً عادياً. لا تستدعي هذه الأداة إلا إذا قال لك صراحة: ارسم لي، صمم صورة كذا، تخيل صورة، الخ.`;

// الكلمات المفتاحية
const IMAGE_KEYWORDS = [
    'صورة', 'صوره', 'صمم', 'ارسم', 'تصميم', 'ولد', 'أنشئ', 'اصنع',
    'منظر', 'رسم', 'لوحة', 'لوحه', 'خلفية', 'خلفيه', 'شعار',
    'image', 'photo', 'draw', 'picture', 'generate', 'create', 'design', 'logo'
];

const VIDEO_KEYWORDS = [
    'فيديو', 'فيلم', 'مقطع', 'متحرك', 'حرك',
    'video', 'movie', 'clip', 'animate'
];

function isVideoRequest(text: string): boolean {
    const lower = text.toLowerCase();
    return VIDEO_KEYWORDS.some(k => lower.includes(k));
}

function isImageRequest(text: string): boolean {
    const lower = text.toLowerCase();
    if (isVideoRequest(text)) return false; // إذا كان طلب فيديو، لا تعامله كصورة
    return IMAGE_KEYWORDS.some(k => lower.includes(k));
}

// دالة للهروب من أحرف HTML لتيليجرام
function escapeHTML(text: string): string {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// إرسال صورة بطريقة آمنة مع Buffer validation
async function sendPhotoSafe(ctx: Context, buffer: Buffer, caption: string) {
    try {
        const isPNG = buffer[0] === 0x89 && buffer[1] === 0x50;
        const isJPEG = buffer[0] === 0xFF && buffer[1] === 0xD8;
        const ext = isPNG ? "png" : "jpg";
        
        if (!isPNG && !isJPEG) {
            await ctx.reply("❌ حدث خطأ في توليد الصورة. الملف ليس صالحة.");
            return;
        }

        console.log(`📤 Sending ${ext.toUpperCase()} image (${buffer.length} bytes) to Telegram...`);
        // تغليف الوصف في HTML آمن
        await ctx.replyWithPhoto(new InputFile(buffer, `photo.${ext}`), { caption: escapeHTML(caption), parse_mode: 'HTML' });
        console.log("✅ Photo sent successfully!");
    } catch (err: any) {
        console.error("❌ Failed to send photo:", err.message);
        await ctx.reply(`❌ حدث خطأ أثناء إرسال الصورة: ${escapeHTML(err.message)}`);
    }
}

// إرسال فيديو بطريقة آمنة
async function sendVideoSafe(ctx: Context, buffer: Buffer, caption: string) {
    try {
        console.log(`📤 Sending VIDEO (${buffer.length} bytes) to Telegram...`);
        await ctx.replyWithVideo(new InputFile(buffer, 'video.mp4'), { caption: escapeHTML(caption), parse_mode: 'HTML' });
        console.log("✅ Video sent successfully!");
    } catch (err: any) {
        console.error("❌ Failed to send video:", err.message);
        await ctx.reply(`❌ حدث خطأ أثناء رفع الفيديو: ${escapeHTML(err.message)}`);
    }
}

// ======================== الأوامر السريعة المباشرة ========================

// استخدام hears مع Regex لتجاوز مشكلة الأحرف الكبيرة والصغيرة (Case Insensitive)
bot.hears(/^\/(flow|whisk)(?:\s+(.*))?/i, async (ctx) => {
    const commandMatch = ctx.match[1].toUpperCase();
    const prompt = ctx.match[2];
    
    if (!prompt || prompt.trim() === '') return ctx.reply(`❌ يرجى كتابة الوصف بعد الأمر.\nمثال: /${commandMatch.toLowerCase()} سيارة رياضية حمراء في دبي`);
    
    console.log(`🎯 Command /${commandMatch} triggered! Bypassing LLM...`);
    await ctx.reply(`⏳ جاري رسم وتوليد صورتك عبر محرك ${commandMatch} الخارق... انتظر قليلاً!`);

    const typingInterval = setInterval(() => { ctx.replyWithChatAction('typing').catch(() => {}); }, 4000);

    try {
        const buffer = await generateImageDirectly(prompt);
        clearInterval(typingInterval);
        console.log(`🖼️ Image generated: ${buffer?.length} bytes`);
        if (buffer) {
            await sendPhotoSafe(ctx, buffer, `🎨 صورتك الاحترافية بواسطة ${commandMatch}`);
        } else {
             throw new Error("بيانات الصورة فارغة.");
        }
    } catch (imgErr: any) {
        clearInterval(typingInterval);
        console.error(`❌ ${commandMatch} image generation failed:`, imgErr.message);
        await ctx.reply(`❌ فشل الاتصال بمحرك ${commandMatch}:\n ${imgErr.message}\n\n💡 خوادم التصميم مضغوطة حالياً، جرب لاحقاً.`);
    }
});

bot.hears(/^\/(grok)(?:\s+(.*))?/i, async (ctx) => {
    const prompt = ctx.match[2];
    if (!prompt || prompt.trim() === '') return ctx.reply("❌ يرجى كتابة الوصف بعد الأمر.\nمثال: /Grok نمر يركض في غابة ثلجية بجودة سينمائية");
    
    console.log("🎯 Command /Grok triggered! Bypassing LLM...");
    await ctx.reply("🎥 مرحباً بك في محرك Grok للفيديو!\nجاري إنتاج المشهد الخاص بك...\n⏳ تستغرق العملية بين دقيقة إلى دقيقتين، يرجى الانتظار!");

    const typingInterval = setInterval(() => { ctx.replyWithChatAction('upload_video').catch(() => {}); }, 6000);

    try {
        const buffer = await generateVideoDirectly(prompt);
        clearInterval(typingInterval);
        if (buffer) {
            await sendVideoSafe(ctx, buffer, "🎥 المشهد السينمائي جاهز من محرك Grok!");
        } else {
            throw new Error("بيانات الفيديو فارغة.");
        }
    } catch (vidErr: any) {
        clearInterval(typingInterval);
        console.error("❌ Grok Video gen failed:", vidErr.message);
        await ctx.reply(`❌ فشل توليد الفيديو عبر Grok:\n ${vidErr.message}\n\n💡 قد تعاني الخوادم من ضغط بسبب الطلبات الكثيفة.`);
    }
});

// ======================== معالجة الرسائل النصية العامة ========================

bot.on('message:text', async (ctx) => {
    const userId = ctx.from.id;
    const text = ctx.message.text;
    console.log(`\n━━━ Incoming from ${userId}: ${text} ━━━`);

    await addMemory(userId, 'user', text);
    await ctx.replyWithChatAction('typing');

    try {
        // === كشف مباشر لطلبات الفيديو ===
        if (isVideoRequest(text)) {
            console.log("🎯 Direct video request detected!");
            await ctx.reply("🎥 جاري إنتاج الفيديو الإبداعي الخاص بك...\n⏳ هذه العملية تستغرق وقتاً طويلاً (حوالي دقيقة)، يرجى الانتظار!");

            const typingInterval = setInterval(() => {
                ctx.replyWithChatAction('upload_video').catch(() => {});
            }, 6000);

            try {
                const buffer = await generateVideoDirectly(text);
                clearInterval(typingInterval);
                if (buffer) {
                    await sendVideoSafe(ctx, buffer, "🎥 المقطع جاهز للإبداع الحركي العالي الدقة!");
                    await addMemory(userId, 'assistant', '🎥 تم إرسال فيديو لك.');
                    return;
                }
            } catch (vidErr: any) {
                clearInterval(typingInterval);
                console.error("❌ Video gen failed:", vidErr.message);
                await ctx.reply(`❌ لم أتمكن من توليد الفيديو حالياً: ${vidErr.message}\n\n💡 الخوادم الفنية مضغوطة. جرب لاحقاً.`);
                return;
            }
        }

        // === كشف مباشر لطلبات الصور ===
        if (isImageRequest(text)) {
            console.log("🎯 Direct image request detected! Bypassing LLM...");
            await ctx.reply("⏳ جاري رسم وتوليد صورتك الآن... انتظر قليلاً!");

            const typingInterval = setInterval(() => {
                ctx.replyWithChatAction('typing').catch(() => {});
            }, 4000);

            try {
                const buffer = await generateImageDirectly(text);
                clearInterval(typingInterval);
                console.log(`🖼️ Image generated: ${buffer.length} bytes`);
                await sendPhotoSafe(ctx, buffer, "🎨 تفضل تحفتك الفنية الاحترافية!");
                await addMemory(userId, 'assistant', '🎨 تم إرسال صورة احترافية لك.');
                return;
            } catch (imgErr: any) {
                clearInterval(typingInterval);
                console.error("❌ All image generation methods failed:", imgErr.message);
                await ctx.reply(`❌ لم أتمكن من توليد الصورة حالياً: ${imgErr.message}\n\n💡 جرب مرة ثانية بعد دقيقة.`);
                return;
            }
        }

        // === الرد العادي عبر LLM ===
        const history = await getMemory(userId, 10);
        const messages = [{ role: 'system', content: SYSTEM_PROMPT }, ...history];
        const responseText = await generateResponse(messages);
        console.log(`LLM Response: ${responseText.substring(0, 100)}...`);
        await addMemory(userId, 'assistant', responseText);

        // معالجة الصور والبيانات من base64 (إذا استدعاها LLM عبر الأدوات)
        if (responseText.includes('__IMAGE_PAYLOAD_BASE64__')) {
            const parts = responseText.split('__IMAGE_PAYLOAD_BASE64__');
            if (parts.length > 1) {
                const base64Str = parts[1].split('\n')[0].trim();
                try {
                    const buffer = Buffer.from(base64Str, 'base64');
                    if (buffer.length > 500) await sendPhotoSafe(ctx, buffer, "🎨 إليك صورتك!");
                    else await ctx.reply("❌ الصورة المُولّدة تالفة. حاول مرة أخرى.");
                } catch (decodeErr) {
                    await ctx.reply("❌ خطأ في فك ترميز الصورة.");
                }
            }
        } else if (responseText.includes('__VIDEO_PAYLOAD_BASE64__')) {
            const parts = responseText.split('__VIDEO_PAYLOAD_BASE64__');
            if (parts.length > 1) {
                const base64Str = parts[1].split('\n')[0].trim();
                try {
                    const buffer = Buffer.from(base64Str, 'base64');
                    if (buffer.length > 5000) await sendVideoSafe(ctx, buffer, "🎥 تفضل مقطع الفيديو الاحترافي!");
                    else await ctx.reply("❌ الفيديو المولد تالف. الرجاء المحاولة مجدداً.");
                } catch (decodeErr) {
                    await ctx.reply("❌ خطأ في فك ترميز الفيديو.");
                }
            }
        } else {
            await ctx.reply(escapeHTML(responseText), { parse_mode: 'HTML' });
        }
    } catch (err: any) {
        console.error("Failed:", err);
        await ctx.reply(`حدث خطأ: ${escapeHTML(err.message || 'خطأ غير محدد')}`);
    }
});

bot.on('message:voice', async (ctx) => {
    await ctx.reply("🎧 تم استلام الصوت. ميزة التحليل الصوتي قيد التطوير.");
});

bot.catch((err) => {
    console.error(`Error: ${err.error}`);
});

console.log("🚀 RashidClaw is starting up...");
bot.start().catch((err) => {
    console.error("❌ CRITICAL: Failed to start the bot:", err.message);
    if (err.message.includes("409")) {
        console.error("💡 السبب المحتمل: هناك نسخة أخرى من البوت تعمل حالياً بنفس التوجين. يرجى إغلاقها.");
    }
});
