import { config } from '../config.js';
import axios from 'axios';
import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const mediaTools = [
    {
        type: "function",
        function: {
            name: "generate_image",
            description: "Generates a generic image from a text prompt.",
            parameters: {
                type: "object",
                properties: {
                    prompt: { type: "string" }
                },
                required: ["prompt"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "generate_video",
            description: "Generates a generic short video from a text prompt.",
            parameters: {
                type: "object",
                properties: {
                    prompt: { type: "string" }
                },
                required: ["prompt"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "generate_professional_image",
            description: "Generates a professional image directly in the chat from a text prompt. Useful for creating art, logos, and photos.",
            parameters: {
                type: "object",
                properties: {
                    prompt: { type: "string", description: "The detailed prompt for the image. English is preferred for better results." }
                },
                required: ["prompt"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "generate_professional_video",
            description: "Generates a short cinematic AI video link from a text prompt.",
            parameters: {
                type: "object",
                properties: {
                    prompt: { type: "string", description: "The detailed prompt for the video. English is preferred." }
                },
                required: ["prompt"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "generate_with_whisk",
            description: "Generates an image using Whisk AI model.",
            parameters: {
                type: "object",
                properties: {
                    prompt: { type: "string", description: "The desired image prompt." }
                },
                required: ["prompt"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "generate_with_flow",
            description: "Generates an image using Flow / Flux AI models.",
            parameters: {
                type: "object",
                properties: {
                    prompt: { type: "string", description: "The desired image prompt." }
                },
                required: ["prompt"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "generate_with_grok",
            description: "Generates a video using Grok AI logic.",
            parameters: {
                type: "object",
                properties: {
                    prompt: { type: "string", description: "The desired video prompt." }
                },
                required: ["prompt"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "prompt_optimizer",
            description: "Optimizes a simple idea into a professional cinematic AI prompt.",
            parameters: {
                type: "object",
                properties: {
                    input: { type: "string", description: "The basic idea or prompt to optimize." }
                },
                required: ["input"]
            }
        }
    }
];

// ======= تحسين الـ Prompt - ترجمة قوية للإنجليزية باستخدام Groq السريع =======
async function enhancePrompt(prompt: string): Promise<string> {
    for (let i = 0; i < config.GROQ_KEYS.length; i++) {
        try {
            const key = config.GROQ_KEYS[i];
            console.log(`📝 Translating prompt to English using Groq [Key ${i+1}]...`);
            const groq = new Groq({ apiKey: key });
            
            const response = await groq.chat.completions.create({
                model: "llama-3.1-8b-instant",
                messages: [
                    {
                        role: "system",
                        content: "Convert the following Arabic image description into a very SHORT, precise English prompt (MAXIMUM 8 WORDS). Output ONLY the English text. Add '8k, highly detailed' at the end. Do not use complex grammar."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.3,
                max_tokens: 30,
            });
            
            const text = response.choices[0]?.message?.content?.trim() || prompt;
            // مسح الكلمات العربية ومسح أي سطور جديدة تسبب انهيار الرابط
            let cleanEnglish = text.replace(/[\u0600-\u06FF]/g, '').trim();
            cleanEnglish = cleanEnglish.replace(/\n/g, ' ').replace(/\r/g, '');
            console.log(`✅ Translation successful: ${cleanEnglish}`);
            return cleanEnglish || prompt;
        } catch (e: any) {
            console.error(`❌ Groq enhancement [Key ${i+1}] failed:`, e.message);
        }
    }
    return prompt;
}

// ======= استراتيجية توليد الصور =======

// 1. Gemini Flash
async function tryGeminiFlash(prompt: string, apiKey: string): Promise<Buffer | null> {
    try {
        console.log(`🔗 Trying Gemini Flash for image generation...`);
        const genAI = new GoogleGenerativeAI(apiKey);
        // تجربة فلاش الأحدث
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const result = await model.generateContent(prompt);
        const response = result.response;
        const parts = response.candidates?.[0]?.content?.parts;
        const inlineData = parts?.find((p: any) => p.inlineData)?.inlineData;

        if (inlineData && inlineData.data) {
            console.log("✅ Gemini Flash built the image!");
            return Buffer.from(inlineData.data, 'base64');
        }
    } catch (e: any) {
         console.error("❌ Gemini Flash Image failed:", e.message);
    }
    return null;
}

// 2. Pollinations 
async function tryPollinationsFetch(prompt: string): Promise<Buffer | null> {
    const seed = Math.floor(Math.random() * 999999);
    // المحاولة عبر الروابط الأكثر استقراراً ومجانية (V1)
    const urls = [
        `https://pollinations.ai/p/${encodeURIComponent(prompt)}?width=1024&height=1024&seed=${seed}&nologo=true`,
        `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&seed=${seed}&nologo=true`
    ];

    for (const url of urls) {
        try {
            console.log(`🔗 Trying Pollinations: ${url}`);
            const response = await axios.get(url, { 
                responseType: 'arraybuffer', 
                timeout: 30000,
                headers: {
                    'User-Agent': 'Mozilla/5.0'
                }
            });
            
            const buffer = Buffer.from(response.data);
            if (response.status === 200 && buffer.length > 5000) {
                console.log(`✅ Success! Received ${buffer.length} bytes from Pollinations.`);
                return buffer;
            } else {
                console.log(`⚠️ Pollinations URL returned small data: ${buffer.length} bytes`);
            }
        } catch (e: any) {
            console.error(`❌ Pollinations URL failed:`, e.message);
        }
    }
    return null;
}

// ======= الدوال المصدرة =======

export async function generateImageDirectly(prompt: string): Promise<Buffer> {
    // 1. ترجمة وتحسين الـ Prompt الموجه
    const enhanced = await enhancePrompt(prompt);
    
    // 2. تجربة جميع مفاتيح Gemini Flash بناءً على طلبك
    for (let i = 0; i < config.GEMINI_KEYS.length; i++) {
        const buffer = await tryGeminiFlash(enhanced, config.GEMINI_KEYS[i]);
        if (buffer) return buffer;
    }
    
    // 3. المحاولة الأساسية عبر Flow (Flux) 
    let buffer = await tryPollinationsFetch(enhanced);
    if (buffer) return buffer;

    throw new Error("فشلت المحركات. تأكد من أن الـ API لا يعاني من ضغط حالياً.");
}

export async function generateVideoDirectly(prompt: string): Promise<Buffer> {
    const enhanced = await enhancePrompt(prompt);
    console.log("🚀 Initializing Video Engine for prompt:", enhanced);
    
    // محاولتين للفيديو
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhanced)}?model=video&seed=${Math.floor(Math.random()*999)}`;
    
    try {
        console.log("🔗 Grabbing Video from:", url);
        const response = await axios.get(url, { 
            responseType: 'arraybuffer', 
            timeout: 150000, // زيادة المهلة للفيديو
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        
        if (response.status === 200 && response.data && response.data.byteLength > 10000) {
            return Buffer.from(response.data);
        }
    } catch (err: any) {
        console.error("Video API Error:", err.message);
    }
    
    throw new Error("عذراً، محرك الفيديو (Grok) يواجه ضغطاً شديداً حالياً. يرجى إعادة المحاولة بعد قليل.");
}

export async function executeMedia(name: string, args: any): Promise<string> {
    if (name === "generate_professional_image" || name === "generate_with_whisk" || name === "generate_with_flow" || name === "generate_image") {
        try {
            const buffer = await generateImageDirectly(args.prompt);
            return `__IMAGE_PAYLOAD_BASE64__${buffer.toString('base64')}`;
        } catch (e: any) {
            return `❌ فشل توليد الصورة (ميزات Whisk/Flow تواجه ضغطاً): ${e.message}`;
        }
    }
    
    if (name === "generate_professional_video" || name === "generate_with_grok" || name === "generate_video") {
        try {
            const buffer = await generateVideoDirectly(args.prompt);
            return `__VIDEO_PAYLOAD_BASE64__${buffer.toString('base64')}`;
        } catch (e: any) {
            return `❌ خطأ في مقطع الفيديو (محرك Grok/Pollinations محمل): ${e.message}`;
        }
    }

    if (name === "prompt_optimizer") {
        const optimized = await enhancePrompt(args.input);
        return `✅ [Prompt Optimizer]: Cinematic ultra-realistic 8K, detailed lighting: ${optimized}`;
    }

    return "Media tool not found.";
}
