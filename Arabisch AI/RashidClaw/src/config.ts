import dotenv from 'dotenv';
dotenv.config();

export const config = {
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '',
    
    // إمبراطورية مفاتيح Groq
    GROQ_KEYS: [
        process.env.GROQ_API_KEY,
        process.env.GROQ_API_KEY_2,
        process.env.GROQ_API_KEY_3
    ].filter(Boolean) as string[],

    // إمبراطورية مفاتيح Gemini
    GEMINI_KEYS: [
        process.env.GEMINI_API_KEY,
        process.env.GEMINI_API_KEY_2,
        process.env.GEMINI_API_KEY_3
    ].filter(Boolean) as string[],

    // إمبراطورية مفاتيح OpenRouter
    OPENROUTER_KEYS: [
        process.env.OPENROUTER_API_KEY,
        process.env.OPENROUTER_API_KEY_2,
        process.env.OPENROUTER_API_KEY_3
    ].filter(Boolean) as string[],

    DB_PATH: process.env.DB_PATH || './memory.db',
    GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS || './service-account.json',
    ALLOWED_USERS: (process.env.ALLOWED_USER_IDS || '').split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id)),
};
