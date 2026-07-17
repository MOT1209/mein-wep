 { 
   "thought": "المستخدم يسأل لماذا تمت إضافة الـ API مباشرة في الكود. الحقيقة أنها كانت غلطة في جملة الاستيراد (import) حيث تم وضع التوكن بدلاً من اسم المكتبة 'node-telegram-bot-api'. قمت بتصحيحها فوراً لأن وضع المفاتيح البرمجية في الكود يمثل خطراً أمنياً كبيراً.", 
   "action": "none", 
   "input": "", 
   "final_answer": "اعتذر بشدة، كان هناك خطأ في جملة الاستيراد (import) في ملف [main.ts](file:///c%3A/Users/aihmo/%D8%AC%D9%85%D9%8I%D8%B9%20%D9%85%D9%84%D9%81%D8%A7%D8%AA%20%D8%A7%D9%84%D8%A8%D8%B1%D9%85%D8%AC%D9%87/Arabisch%20AI/RashidClaw%202/main.ts) حيث تم وضع توكن البوت بدلاً من اسم المكتبة المطلوبة. \n\n**لماذا قمت بإزالته؟**\n1. **الأمان**: لا يجب أبداً وضع مفاتيح الـ API أو التوكنات داخل ملفات الكود المصدرية. إذا قمت برفع هذا الكود على GitHub مثلاً، سيتمكن أي شخص من سرقة التوكن والتحكم في بوت التليجرام الخاص بك.\n2. **التنظيم**: الطريقة الصحيحة هي وضع التوكن في ملف `.env` واستدعاؤه عبر ملف [config.ts](file:///c%3A/Users/aihmo/%D8%AC%D9%85%D9%8I%D8%B9%20%D9%85%D9%84%D9%81%D8%A7%D8%AA%20%D8%A7%D9%84%D8%A8%D8%B1%D9%85%D8%AC%D9%87/Arabisch%20AI/RashidClaw%202/config.ts)، وهو ما فعلناه الآن.\n\nلقد أصلحت الملف الآن وأصبح الكود يستورد المكتبة بشكل صحيح ويستخدم التوكن من ملف الإعدادات المحمي." 
 }import TelegramBot from 'node-telegram-bot-api';
import { config } from './config';
import { RashidClawAgent } from './agent';

const bot = new TelegramBot(config.TELEGRAM_BOT_TOKEN!, { polling: true });
const agent = new RashidClawAgent();

// Mock LLM function (should be replaced with actual GROQ/GEMINI call)
const mockLLM = async (prompt: string) => {
  // This is a simplified mock. In a real scenario, you'd call Groq/Gemini
  // and parse the JSON response.
  return {
    thought: "Thinking about the user request...",
    action: "none",
    input: "",
    final_answer: `Received: ${prompt}. (Mock response)`
  };
};

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from?.id.toString();

  // Security check: whitelisted users only
  if (!userId || !config.WHITELISTED_USERS.includes(userId)) {
    bot.sendMessage(chatId, "Unauthorized user.");
    return;
  }

  if (msg.text) {
    const finalAnswer = await agent.run(msg.text, mockLLM);
    bot.sendMessage(chatId, finalAnswer);
  }
});

console.log("RashidClaw Agent is running...");
