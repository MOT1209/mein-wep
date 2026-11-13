/**
 * Denkmalen AI judge (Vercel serverless function).
 *
 * POST /api/evaluate  { word, drawingData, category?, drawingTime?, locale? }
 *   -> { score, accuracy, creativity, clarity, comment }
 *
 * The Denkmalen game is a Next.js static export whose client posts to the
 * root-relative /api/evaluate. Its build is kept in denkmalen/ but excluded
 * from this site's dist/ (eleventy.config.mjs), so it is served elsewhere;
 * this endpoint stays because that client may run on this origin. Keep the
 * response shape in sync with AIEvaluation in the game's gemini.ts.
 *
 * GEMINI_API_KEY is shared with api/gemini.js, and so is the site-wide daily
 * cap GEMINI_DAILY_LIMIT. Per IP: 20/min and 200/day (api/_lib/public-api.js).
 * Without a key, or when Gemini fails, it answers with a template score so a
 * round never stalls.
 */

import { allowOrigin, callGemini, checkLimits, jsonBody } from './_lib/public-api.js';

// Vercel caps a serverless request body at ~4.5MB; a base64 PNG larger than
// this is rejected here with a clear error rather than failing opaquely.
const MAX_DRAWING_CHARS = 4_000_000;
const LOCALES = new Set(['en', 'de', 'ar']);
const DATA_URL = /^data:image\/(png|jpeg|webp);base64,/;
const BASE64 = /^[A-Za-z0-9+/]+={0,2}$/;

const MOCK_COMMENTS = {
  en: [
    'Great effort! Keep drawing! 🎨',
    'Nice try! I can see what you were going for! ✨',
    'Creative interpretation! Well done! 🌟',
    'Good job! Every drawing tells a story! 🎭',
  ],
  ar: [
    'مجهود رائع! واصل الرسم! 🎨',
    'محاولة جميلة! فهمت ما كنت تقصده! ✨',
    'تفسير مبدع! أحسنت! 🌟',
    'عمل جيد! كل رسمة تحكي قصة! 🎭',
  ],
  de: [
    'Tolle Leistung! Zeichne weiter! 🎨',
    'Guter Versuch! Ich sehe, was du wolltest! ✨',
    'Kreative Interpretation! Gut gemacht! 🌟',
    'Gute Arbeit! Jede Zeichnung erzählt eine Geschichte! 🎭',
  ],
};

function clamp(v, min, max) {
  return Math.min(Math.max(v, min), max);
}

// Mirrors defaultEvaluation() in the game's gemini.ts — used when the model is
// unavailable, so a round always resolves instead of stalling.
function mockEvaluation(locale) {
  const base = 60 + Math.floor(Math.random() * 20);
  const comments = MOCK_COMMENTS[locale] || MOCK_COMMENTS.en;
  return {
    score: base,
    accuracy: clamp(base - 5 + Math.floor(Math.random() * 10), 0, 100),
    creativity: clamp(base + Math.floor(Math.random() * 15), 0, 100),
    clarity: clamp(base - 10 + Math.floor(Math.random() * 20), 0, 100),
    comment: comments[Math.floor(Math.random() * comments.length)],
  };
}

function judgePrompt(locale) {
  const base = 'You are a friendly and encouraging art judge for a drawing game.'
    + ' Evaluate drawings based on: accuracy, creativity, clarity.'
    + ' Score 0-100 for each. Be positive and constructive.';

  const byLocale = {
    en: ' Respond in English. Be witty and fun!',
    de: ' Antworte auf Deutsch. Sei lustig und locker!',
    ar: ' اكتب تعليقك باللغة العربية بأسلوب بسيط وواضح. كن مرحاً وخفيف الظل!',
  };

  return base + (byLocale[locale] || byLocale.en)
    + ' Return JSON: {"score":N,"accuracy":N,"creativity":N,"clarity":N,"comment":"text"}';
}

function parseGeminiResponse(text, locale) {
  try {
    const match = text.match(/\{[\s\S]*?\}/);
    if (!match) return null;

    const data = JSON.parse(match[0]);
    return {
      score: clamp(Number(data.score) || 50, 0, 100),
      accuracy: clamp(Number(data.accuracy) || 50, 0, 100),
      creativity: clamp(Number(data.creativity) || 50, 0, 100),
      clarity: clamp(Number(data.clarity) || 50, 0, 100),
      comment: typeof data.comment === 'string'
        ? data.comment.slice(0, 500)
        : mockEvaluation(locale).comment,
    };
  } catch {
    return null;
  }
}

export default async (req, res) => {
  if (!allowOrigin(req, res)) {
    return res.status(403).json({ error: 'Origin not allowed' });
  }
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!jsonBody(req)) {
    return res.status(415).json({ error: 'Send JSON' });
  }

  const { word, drawingData, category, drawingTime } = req.body;
  const locale = LOCALES.has(req.body.locale) ? req.body.locale : 'en';

  if (typeof word !== 'string' || !word.trim() || word.length > 100) {
    return res.status(400).json({ error: 'Missing or invalid word' });
  }
  if (category !== undefined && (typeof category !== 'string' || category.length > 60)) {
    return res.status(400).json({ error: 'Invalid category' });
  }
  if (drawingTime !== undefined && !(Number.isFinite(Number(drawingTime)) && Number(drawingTime) >= 0 && Number(drawingTime) <= 3600)) {
    return res.status(400).json({ error: 'Invalid drawing time' });
  }
  if (typeof drawingData !== 'string' || !drawingData) {
    return res.status(400).json({ error: 'Missing drawing' });
  }
  if (drawingData.length > MAX_DRAWING_CHARS) {
    return res.status(400).json({ error: 'Drawing too large' });
  }
  const mime = (drawingData.match(DATA_URL) || [, 'png'])[1];
  const base64 = drawingData.replace(DATA_URL, '');
  if (!BASE64.test(base64)) {
    return res.status(400).json({ error: 'Drawing is not a base64 image' });
  }

  // Over a limit: a plain 429/503. The game's client already falls back to
  // its own template score on any non-OK answer, so a round still resolves.
  const limited = await checkLimits(req, 'evaluate', {
    perMinute: 20, perDay: 200, dailyEnv: 'GEMINI_DAILY_LIMIT', dailyDefault: 500,
  });
  if (limited) {
    return res.status(limited.status).json({ error: limited.error });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Deliberately a 200 with a template score: a missing key is an operator
    // problem, and failing the round for the player helps nobody.
    console.error('GEMINI_API_KEY not set in Vercel environment');
    return res.status(200).json(mockEvaluation(locale));
  }

  try {
    const text = await callGemini(apiKey, {
      contents: [{
        parts: [
          { text: `${judgePrompt(locale)}\n\nWord: "${word.trim()}" | Category: ${category || 'general'} | Time: ${Number(drawingTime) || 60}s\n\nReturn JSON:` },
          { inlineData: { mimeType: `image/${mime}`, data: base64 } },
        ],
      }],
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800,
        responseMimeType: 'application/json',
        // gemini-2.5-flash reasons before answering and bills that against
        // maxOutputTokens, so leaving it on can consume the whole budget and
        // return empty text. The judge needs a verdict, not deliberation.
        thinkingConfig: { thinkingBudget: 0 },
      },
    });
    return res.status(200).json(parseGeminiResponse(text, locale) || mockEvaluation(locale));
  } catch (err) {
    console.error('Evaluate proxy error:', err.message);
    return res.status(200).json(mockEvaluation(locale));
  }
};
