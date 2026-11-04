// Calls to the admin API. Every request is same-origin with the CSRF header;
// the session lives in HttpOnly cookies the page never sees.
const LOGIN = '/admin/login.html';

export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function send(path, method, body) {
  let r;
  try {
    r = await fetch(path, {
      method,
      credentials: 'same-origin',
      cache: 'no-store',
      headers: { 'X-Admin-CSRF': '1', ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'network');
  }
  const json = await r.json().catch(() => ({}));
  if (r.status === 401) {
    window.location.replace(`${LOGIN}?expired=1`);
    throw new ApiError(401, json.error || 'Not signed in');
  }
  if (!r.ok) throw new ApiError(r.status, json.error || `Request failed (${r.status})`, json.details);
  return json;
}

/** POST /api/admin/<resource> { action, ...args } -> data */
export async function call(resource, action, args = {}) {
  const json = await send(`/api/admin/${resource}`, 'POST', { action, ...args });
  return json.data;
}

export const session = () => send('/api/admin/session', 'GET');
export const signOut = () => send('/api/admin/session', 'DELETE');
