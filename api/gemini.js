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

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
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
