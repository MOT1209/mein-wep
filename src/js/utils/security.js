export function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return str.replace(/[&<>"']/g, c => map[c]);
}

export function escapeAttr(str) {
  return escapeHtml(str).replace(/"/g, '&quot;');
}

export function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const allowed = ['https://', 'http://', 'mailto:', 'tel:', '#', '/'];
  return allowed.some(p => url.startsWith(p)) ? url : '';
}

export function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '').trim();
}

export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const CSP_META = {
  'http-equiv': 'Content-Security-Policy',
  content: "default-src 'self'; script-src 'self' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://www.googletagmanager.com https://www.google-analytics.com https://*.supabase.co 'unsafe-inline' 'unsafe-eval'; style-src 'self' https://fonts.googleapis.com https://cdnjs.cloudflare.com 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com data:; connect-src 'self' https://*.supabase.co https://*.vercel.app wss://*.supabase.co https://www.google-analytics.com https://generativelanguage.googleapis.com https://openrouter.ai; frame-src 'self' https://*.supabase.co; media-src 'self' https:; manifest-src 'self'"
};
