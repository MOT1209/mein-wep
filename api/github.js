/**
 * GitHub API Proxy — Vercel Serverless Function
 *
 * Keeps GITHUB_TOKEN server-side to avoid rate limits.
 * Set the token: Vercel Dashboard → Project → Environment Variables
 *   Name: GITHUB_TOKEN
 *   Value: (classic GitHub PAT with public_repo scope)
 */

const GITHUB_API = 'https://api.github.com';
const ALLOWED = ['/users/MOT1209', '/users/MOT1209/repos', '/users/MOT1209/events'];

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const endpoint = req.query.endpoint;
  if (!endpoint || !ALLOWED.includes(endpoint)) {
    return res.status(400).json({ error: 'Invalid endpoint' });
  }

  const token = process.env.GITHUB_TOKEN;
  const headers = { 'Accept': 'application/vnd.github.v3+json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const response = await fetch(`${GITHUB_API}${endpoint}`, { headers });
    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
