/**
 * Gemini API Proxy — Vercel Serverless Function
 *
 * Keeps GEMINI_API_KEY server-side.
 * Set the key: Vercel Dashboard → Your Project → Settings → Environment Variables
 *   Name: GEMINI_API_KEY
 *   Value: (your Gemini API key)
 *
 * Then redeploy. The client calls /api/gemini, the key never leaves Vercel.
 */

// قائمة بيضاء للأصول المسموح لها باستدعاء البروكسي
const ALLOWED_ORIGINS = [
  'https://rashid-wep.vercel.app',
  'http://localhost:3000',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
];

// rate-limit بسيط في الذاكرة (لكل IP). ملاحظة: يُعاد ضبطه عند cold start وهو
// لكل نسخة serverless على حدة. للإنتاج عبر عدة نسخ، استبدله بـ Upstash Redis.
const RATE_LIMIT = 10;          // عدد الطلبات
const WINDOW_MS = 60 * 1000;    // لكل دقيقة
const hits = new Map();         // ip -> { count, resetAt }

function isRateLimited(ip) {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

module.exports = async (req, res) => {
  // تحقق من Origin: نحظر فقط إذا كان موجوداً وغير مدرج في القائمة البيضاء
  const origin = req.headers.origin;
  if (origin) {
    if (!ALLOWED_ORIGINS.includes(origin)) {
      return res.status(403).json({ error: 'Origin not allowed' });
    }
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // rate-limit بالـ IP
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim()
    || req.socket?.remoteAddress || 'unknown';
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many requests, slow down.' });
  }

  const { prompt } = req.body || {};
  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY not set in Vercel environment');
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
          ],
          generationConfig: { temperature: 0.7, topK: 40, topP: 0.95, maxOutputTokens: 2048 },
        }),
      }
    );

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error('Gemini proxy error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
