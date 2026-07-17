import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config.js';
import { tools, executeTool } from '../tools/index.js';
import axios from 'axios';

// دالة لاستدعاء OpenRouter
async function executeOpenRouter(messages: any[], apiKey: string): Promise<any> {
    const formattedMessages = messages.map(m => ({
        role: m.role,
        content: m.content
    }));

    try {
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: "google/gemini-2.0-flash-lite-preview-02-05:free", 
            messages: formattedMessages,
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'https://rashid-claw.ai',
                'X-Title': 'RashidClaw IMMORTAL Agent',
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });
        
        return response.data.choices[0].message;
    } catch (e: any) {
        throw new Error(`OpenRouter API Error: ${e.response?.data?.error?.message || e.message}`);
    }
}

// دالة أساسية للمحرك المدمج الذي يجرب كل مفتاح متاح
export async function generateResponse(messages: any[], iterationLimit = 3): Promise<string> {
    let currentMessages = [...messages];
    let iterations = 0;

    while (iterations < iterationLimit) {
        
        // 1. تجربة كل مفاتيح Groq (Llama 3.3 70B & Llama 3.1 8B)
        for (let i = 0; i < config.GROQ_KEYS.length; i++) {
            const key = config.GROQ_KEYS[i];
            const groq = new Groq({ apiKey: key });
            
            // تجربة العقل الأكبر أولا
            try {
                console.log(`🔄 Trying [Groq Key ${i+1}] Llama 3.3 70B...`);
                const response = await groq.chat.completions.create({
                    model: "llama-3.3-70b-versatile",
                    messages: currentMessages,
                    tools: tools as any,
                    tool_choice: "auto"
                });
                const message = response.choices[0].message;
                
                if (message.tool_calls && message.tool_calls.length > 0) {
                    console.log(`🔧 Tool calls: ${message.tool_calls.map(t => t.function.name).join(', ')}`);
                    currentMessages.push(message);
                    for (const toolCall of message.tool_calls) {
                        const result = await executeTool(toolCall.function.name, JSON.parse(toolCall.function.arguments || '{}'));
                        currentMessages.push({ role: "tool", tool_call_id: toolCall.id, name: toolCall.function.name, content: result });
                        if (result.includes('__IMAGE_')) return result;
                    }
                    iterations++;
                    break; // يكسر حلقة الفور للرجوع للـ while بعد إضافة الأدوات
                }
                if (message.content) {
                    console.log(`✅ Groq [Key ${i+1}] Llama 3.3 responded!`);
                    return message.content;
                }
            } catch (err: any) {
                console.error(`❌ Groq [Key ${i+1}] Llama 3.3 failed.`);
                
                // تجربة العقل الخفيف السريع على نفس المفتاح (للطوارئ)
                try {
                    console.log(`🔄 Trying [Groq Key ${i+1}] Llama 3.1 8B...`);
                    const fastResp = await groq.chat.completions.create({ 
                        model: "llama-3.1-8b-instant", 
                        messages: currentMessages 
                    });
                    if (fastResp.choices[0].message.content) {
                        console.log(`✅ Groq [Key ${i+1}] Llama 8B responded!`);
                        return fastResp.choices[0].message.content;
                    }
                } catch (err8b) {
                    console.error(`❌ Groq [Key ${i+1}] Llama 8B also failed.`);
                }
            }
        } // نهاية التلوب على مفاتيح Groq

        // 2. تجربة كل مفاتيح OpenRouter
        for (let i = 0; i < config.OPENROUTER_KEYS.length; i++) {
            const key = config.OPENROUTER_KEYS[i];
            try {
                console.log(`🔄 Trying [OpenRouter Key ${i+1}] API...`);
                const message = await executeOpenRouter(currentMessages, key);
                if (message.content) {
                    console.log(`✅ OpenRouter [Key ${i+1}] responded!`);
                    return message.content;
                }
            } catch (err: any) {
                console.error(`❌ OpenRouter [Key ${i+1}] failed.`);
            }
        }

        // 3. تجربة كل مفاتيح Gemini
        for (let i = 0; i < config.GEMINI_KEYS.length; i++) {
            const key = config.GEMINI_KEYS[i];
            try {
                console.log(`🔗 Trying [Gemini Key ${i+1}] Pro for text...`);
                const genAI = new GoogleGenerativeAI(key);
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" }); // Pro is better for complex text
                
                const prompt = currentMessages
                    .filter(m => m.content)
                    .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
                    .join('\n');
                
                const result = await model.generateContent(prompt);
                const text = result.response.text();
                if (text) {
                    console.log(`✅ Gemini [Key ${i+1}] responded!`);
                    return text;
                }
            } catch (err: any) {
                console.error(`❌ Gemini [Key ${i+1}] failed:`, err.message);
            }
        }

        // إذا كانت هناك أدوات قيد المعالجة، دعها تستمر
        if (iterations > 0) continue;
        break; // كسر لعدم وجود المزيد
    }

    return "🚨 عذراً، جميع المحركات وكل المفاتيح مشغولة حالياً أو استنفدت الحد المسموح. أنت تستنزف قدرات السيرفر بالكامل! يرجى الانتظار لدقيقتين والمحاولة مرة أخرى.";
}
