import { config } from 'dotenv';
import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

config(); // Load .env

console.log("Testing Groq...");
try {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", // Use a fast tiny model for testing
      messages: [{role: "user", content: "Say hello"}],
  });
  console.log("Groq SUCCESS:", response.choices[0].message.content);
} catch (e: any) {
  console.error("Groq FAILED:", e.message);
}

console.log("\\nTesting Gemini...");
try {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const result = await model.generateContent("Say hello");
  console.log("Gemini SUCCESS:", result.response.text());
} catch (e: any) {
  console.error("Gemini FAILED:", e.message);
}
