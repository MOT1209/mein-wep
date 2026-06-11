/**
 * Gemini API Proxy - Cloudflare Worker
 * 
 * Hides your Gemini API key from the client-side.
 * Deploy this worker, then set GEMINI_API_KEY as a secret.
 * 
 * wrangler deploy workers/gemini-proxy.js --name gemini-proxy
 * wrangler secret put GEMINI_API_KEY
 */

// This is the ONLY place the API key exists
// Set via: wrangler secret put GEMINI_API_KEY

export default {
  async fetch(request, env) {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Only accept POST
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    try {
      const body = await request.json();
      const { prompt } = body;

      if (!prompt) {
        return new Response(JSON.stringify({ error: 'Missing prompt' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const apiKey = env.GEMINI_API_KEY;
      if (!apiKey) {
        return new Response(JSON.stringify({ error: 'Server misconfigured' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Call Gemini API
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        }),
      });

      const data = await response.json();

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};
