/**
 * Gemini AI widget configuration (public, client-side).
 *
 * Only a same-origin proxy path — never a real key. The API key stays
 * server-side in api/gemini.js (process.env.GEMINI_API_KEY on Vercel).
 */
const GEMINI_CONFIG = {
    proxyUrl: '/api/gemini'
};
