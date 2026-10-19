/**
 * Contact Form API — Vercel Serverless Function
 *
 * Receives POST from the contact form, validates input,
 * and inserts into Supabase contact_messages table.
 *
 * POST /api/contact  { name, email, message, website (honeypot) }
 *
 * Environment variables (set in Vercel dashboard):
 *   SUPABASE_URL       — Supabase project URL
 *   SUPABASE_ANON_KEY  — Supabase anon/public key
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// Rate limiting — 5 رسائل لكل دقيقة لكل IP
const RATE_LIMIT = 5;
const WINDOW_MS = 60 * 1000;
const hits = new Map();

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

export default async (req, res) => {
  // CORS
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://rashid-wep.vercel.app',
    'http://localhost:3000',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
  ];
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://rashid-wep.vercel.app');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting — after the method check so CORS preflights don't use up the quota
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
  if (isRateLimited(clientIp)) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  const { name, email, message, website } = req.body || {};

  // Honeypot check — إذا ملأ الحقل المخفي فالبوت مكتشف
  if (website && website.length > 0) {
    // نُرجع 201 كأنها نجحت لكي لا يعرف البوت أنه اكتُشف
    return res.status(201).json({ success: true, message: 'Message sent successfully!' });
  }

  // Validation
  if (!name || typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
    return res.status(400).json({ error: 'Name is required (2-100 characters)' });
  }
  if (!email || typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'A valid email is required' });
  }
  if (!message || typeof message !== 'string' || message.trim().length < 10) {
    return res.status(400).json({ error: 'Message is required (min 10 characters)' });
  }

  // Check message max length
  if (message.trim().length > 2000) {
    return res.status(400).json({ error: 'Message is too long (max 2000 characters)' });
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('SUPABASE_URL / SUPABASE_ANON_KEY not set in Vercel environment');
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/contact_messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error('Supabase insert failed:', response.status, errBody);
      return res.status(500).json({ error: 'Failed to send message. Please try again later.' });
    }

    return res.status(201).json({ success: true, message: 'Message sent successfully!' });
  } catch (err) {
    console.error('Contact API error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
