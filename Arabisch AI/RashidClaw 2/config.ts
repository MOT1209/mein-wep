import dotenv from 'dotenv';
dotenv.config();

export const config = {
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  PIXAZO_API_KEY: process.env.PIXAZO_API_KEY,
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  WHITELISTED_USERS: process.env.WHITELISTED_USERS ? process.env.WHITELISTED_USERS.split(',') : []
};
