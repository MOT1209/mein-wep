/**
 * Denkmalen AI Judge — Vercel Serverless Function
 *
 * The game (games/denkmalen-game) is a Next.js *static export*, so the route at
 * its src/app/api/evaluate/route.ts is never deployed — nothing serves it. The
 * client (src/lib/gemini.ts) posts to the root-relative /api/evaluate, which
 * lands here, on the portfolio deployment. Without this file every request 404'd
 * and the client silently fell back to template scores, so the "AI judge" never
 * actually judged anything in production.
 *
 * Keep the response shape in sync with AIEvaluation in the game's gemini.ts.
 * Needs GEMINI_API_KEY in the Vercel environment (shared with api/gemini.js).
 */

const ALLOWED_ORIGINS = [
  'https://rashid-wep.vercel.app',
  'http://localhost:3000',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
];

// Same in-memory limiter as api/gemini.js: per-instance and reset on cold
// start, so it throttles casual abuse rather than enforcing a hard global cap.
const RATE_LIMIT = 20;          // drawings per window (a round can judge several at once)
const WINDOW_MS = 60 * 1000;
const hits = new Map();

// Vercel caps a serverless request body at ~4.5MB; a base64 PNG larger than
// this is rejected here with a clear error rather than failing opaquely.
const MAX_DRAWING_CHARS = 4_000_000;

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

module.exports = async (req, res) => {
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

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim()
    || req.socket?.remoteAddress || 'unknown';
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many requests, slow down.' });
  }

  const { word, drawingData, category, drawingTime, locale = 'en' } = req.body || {};

  if (!word || typeof word !== 'string' || word.length > 100) {
    return res.status(400).json({ error: 'Missing or invalid word' });
  }
  if (!drawingData || typeof drawingData !== 'string') {
    return res.status(400).json({ error: 'Missing drawing' });
  }
  if (drawingData.length > MAX_DRAWING_CHARS) {
    return res.status(400).json({ error: 'Drawing too large' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Deliberately a 200 with a template score: a missing key is an operator
    // problem, and failing the round for the player helps nobody.
    console.error('GEMINI_API_KEY not set in Vercel environment');
    return res.status(200).json(mockEvaluation(locale));
  }

  const base64 = drawingData.replace(/^data:image\/\w+;base64,/, '');

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: `${judgePrompt(locale)}\n\nWord: "${word}" | Category: ${category || 'general'} | Time: ${drawingTime || 60}s\n\nReturn JSON:` },
              { inlineData: { mimeType: 'image/png', data: base64 } },
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
        }),
      }
    );

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      console.error('Gemini evaluate error:', response.status, detail.slice(0, 300));
      return res.status(200).json(mockEvaluation(locale));
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts
      ?.map((p) => p.text)
      .filter(Boolean)
      .join('') || '';

    return res.status(200).json(parseGeminiResponse(text, locale) || mockEvaluation(locale));
  } catch (err) {
    console.error('Evaluate proxy error:', err.message);
    return res.status(200).json(mockEvaluation(locale));
  }
};
