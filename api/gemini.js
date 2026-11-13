/**
 * Gemini API proxy (Vercel serverless function).
 *
 * POST /api/gemini  { prompt }  ->  { candidates: [{ content: { parts: [{ text }] } }] }
 *
 * The key stays on the server: GEMINI_API_KEY in the Vercel project settings.
 * Only the answer text is returned (in the shape the clients read), never the
 * provider's raw response or error text.
 *
 * Abuse protection (api/_lib/public-api.js): Origin allow-list (browsers only,
 * not authentication), 10/min and 100/day per IP shared across instances, and
 * a site-wide daily cap GEMINI_DAILY_LIMIT (default 500 requests).
 */
import { allowOrigin, callGemini, checkLimits, jsonBody } from './_lib/public-api.js';

const MAX_PROMPT = 8000;

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

  const { prompt } = req.body;
  if (typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ error: 'Missing prompt' });
  }
  if (prompt.length > MAX_PROMPT) {
    return res.status(400).json({ error: 'Invalid or too long prompt' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY not set in Vercel environment');
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  const limited = await checkLimits(req, 'gemini', {
    perMinute: 10, perDay: 100, dailyEnv: 'GEMINI_DAILY_LIMIT', dailyDefault: 500,
  });
  if (limited) return res.status(limited.status).json({ error: limited.error });

  try {
    const text = await callGemini(apiKey, {
      contents: [{ parts: [{ text: prompt }] }],
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
      ],
      generationConfig: { temperature: 0.7, topK: 40, topP: 0.95, maxOutputTokens: 2048, thinkingConfig: { thinkingBudget: 0 } },
    });
    return res.status(200).json({ candidates: [{ content: { parts: [{ text }] } }] });
  } catch (err) {
    console.error('Gemini proxy error:', err.message);
    return res.status(err.code === 'timeout' ? 504 : 502).json({ error: 'AI service unavailable' });
  }
};
