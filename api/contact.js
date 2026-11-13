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

import { checkLimits, PUBLIC_ORIGINS } from './_lib/public-api.js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

export default async (req, res) => {
  // CORS. The form posts from this site; a foreign site's page cannot.
  // (Origin is not authentication: the rate limits below bound scripts.)
  const origin = req.headers.origin;
  if (origin && !PUBLIC_ORIGINS.includes(origin)) {
    return res.status(403).json({ error: 'Origin not allowed' });
  }
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 5 per minute and 20 per day per IP, shared across instances when the
  // database limiter is available (api/_lib/public-api.js).
  const limited = await checkLimits(req, 'contact', { perMinute: 5, perDay: 20 });
  if (limited) return res.status(429).json({ error: 'Too many requests. Please try again later.' });

  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ error: 'Send the form as JSON' });
  }
  const { name, email, message, website } = req.body || {};

  // Honeypot check — إذا ملأ الحقل المخفي فالبوت مكتشف
  if (typeof website === 'string' && website.length > 0) {
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
        'Prefer': 'return=minimal',
      },
      signal: AbortSignal.timeout(8000),
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
      }),
    });

    if (!response.ok) {
      const errBody = await response.text().catch(() => '');
      console.error('Supabase insert failed:', response.status, errBody.slice(0, 300));
      return res.status(500).json({ error: 'Failed to send message. Please try again later.' });
    }

    return res.status(201).json({ success: true, message: 'Message sent successfully!' });
  } catch (err) {
    console.error('Contact API error:', err.name, err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
