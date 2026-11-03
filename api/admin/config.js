/**
 * GET /api/admin/config -> { supabaseUrl, anonKey }
 *
 * The admin sign-in page needs the Supabase project URL and the publishable
 * (anon) key to sign in directly against Supabase Auth. Serving them from the
 * same env vars the server uses keeps one source of truth. Both values are
 * public by design; nothing secret is returned.
 */
import { supabaseEnv } from '../_lib/admin-auth.js';
import { noStore, sendError } from '../_lib/http.js';

export default function handler(req, res) {
  noStore(res);
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return sendError(res, 405, 'Method not allowed');
  }
  const env = supabaseEnv();
  if (!env) {
    console.error('SUPABASE_URL / SUPABASE_ANON_KEY not set');
    return sendError(res, 500, 'Server misconfigured');
  }
  return res.status(200).json({ supabaseUrl: env.url, anonKey: env.anonKey });
}
