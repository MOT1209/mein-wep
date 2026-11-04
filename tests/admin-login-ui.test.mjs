// The sign-in page scripts (admin/js/login.js, password-toggle.js), run in a
// minimal fake browser with fake Supabase answers. Checks what the owner sees:
// the real reason when a reset email or a sign-in is refused, success only when
// Supabase accepted the request, and the show/hide password control.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const loginSrc = read('admin/js/login.js');
const toggleSrc = read('admin/js/password-toggle.js');

const settle = async () => { for (let i = 0; i < 30; i += 1) await new Promise((r) => setImmediate(r)); };
const res = (status, body) => ({ status, ok: status >= 200 && status < 300, json: async () => body });

function fakeEl(id, extra = {}) {
  const classes = new Set();
  return {
    id, value: '', textContent: '', hidden: false, disabled: false, type: 'text', handlers: {}, attrs: {},
    classList: { toggle: (c, on) => (on ? classes.add(c) : classes.delete(c)), has: (c) => classes.has(c) },
    addEventListener(t, f) { this.handlers[t] = f; },
    setAttribute(k, v) { this.attrs[k] = v; },
    getAttribute(k) { return this.attrs[k] ?? null; },
    focus() { this.focused = true; },
    ...extra,
  };
}

/** Boots login.js with a fake DOM. `supabase` answers the Supabase calls. */
function bootLogin({ search = '', supabase, session = () => res(401, {}) }) {
  const els = {};
  const get = (id) => (els[id] ??= fakeEl(id));
  const calls = [];
  const out = { redirected: null };
  const ctx = {
    document: { getElementById: get },
    window: { location: { search, origin: 'https://rashid-wep.vercel.app', replace: (u) => { out.redirected = u; } } },
    localStorage: {},
    URLSearchParams, encodeURIComponent, Promise, Object, console,
    fetch: async (url, init = {}) => {
      const u = String(url);
      calls.push({ url: u, init });
      if (u.endsWith('/api/admin/config')) return res(200, { supabaseUrl: 'https://p.supabase.co', anonKey: 'anon' });
      if (u.endsWith('/api/admin/session')) return session(init);
      return supabase(u, init);
    },
  };
  ctx.window.window = ctx.window;
  vm.createContext(ctx);
  vm.runInContext(loginSrc, ctx);
  return { get, calls, out };
}

const notice = (page) => page.get('login-notice');

async function submitSignIn(page, { email = 'owner@example.com', password = 'x' } = {}) {
  page.get('login-email').value = email;
  page.get('login-password').value = password;
  page.get('login-form').handlers.submit({ preventDefault() {} });
  await settle();
}

async function clickForgot(page, email = 'owner@example.com') {
  page.get('login-email').value = email;
  page.get('forgot-password').handlers.click();
  await settle();
}

test('forgot password: success message only when Supabase accepted the request', async () => {
  const page = bootLogin({ supabase: () => res(200, {}) });
  await clickForgot(page);
  assert.match(notice(page).textContent, /reset link is on its way/);
  assert.equal(notice(page).classList.has('notice-ok'), true);
  assert.equal(notice(page).hidden, false);
  const call = page.calls.find((c) => c.url.includes('/auth/v1/recover'));
  assert.match(call.url, /redirect_to=https%3A%2F%2Frashid-wep\.vercel\.app%2Fadmin%2Freset-password\.html/);
  assert.equal(JSON.parse(call.init.body).email, 'owner@example.com');
  assert.equal(page.get('forgot-password').disabled, false, 'button is usable again');
});

test('forgot password: a refusal is shown with its reason, never as success', async () => {
  const cases = [
    [400, { error_code: 'email_address_not_authorized', msg: 'Email address not authorized' }, /built-in mail service.*SMTP/],
    [429, { error_code: 'over_email_send_rate_limit', msg: 'rate' }, /Too many reset emails/],
    [500, { error_code: 'unexpected_failure', msg: 'Error sending recovery email' }, /could not send the email/],
    [503, {}, /could not send the email/],
    [422, { error_code: 'validation_failed' }, /not sent \(validation_failed\)/],
  ];
  for (const [status, body, expected] of cases) {
    const page = bootLogin({ supabase: () => res(status, body) });
    await clickForgot(page);
    assert.match(notice(page).textContent, expected, `${status}`);
    assert.equal(notice(page).classList.has('notice-ok'), false, `${status} must not look like success`);
    assert.ok(!/on its way/.test(notice(page).textContent), `${status}`);
  }
});

test('forgot password: needs an email first', async () => {
  const page = bootLogin({ supabase: () => res(200, {}) });
  await clickForgot(page, '');
  assert.match(notice(page).textContent, /Enter your email above first/);
  assert.ok(!page.calls.some((c) => c.url.includes('/recover')));
});

test('sign-in: wrong credentials, unconfirmed account, rate limit and outage say different things', async () => {
  const cases = [
    [400, { error_code: 'invalid_credentials' }, /Email or password is wrong/],
    [400, { error_code: 'email_not_confirmed' }, /not confirmed yet.*Authentication/],
    [400, { error_code: 'user_banned' }, /disabled/],
    [429, { error_code: 'over_request_rate_limit' }, /Too many attempts/],
    [502, {}, /sign-in service had a problem/],
    [400, null, /Email or password is wrong/],
  ];
  for (const [status, body, expected] of cases) {
    const page = bootLogin({ supabase: () => res(status, body) });
    await submitSignIn(page);
    assert.match(notice(page).textContent, expected, `${status} ${JSON.stringify(body)}`);
    assert.equal(page.out.redirected, null);
    assert.equal(page.get('login-submit').disabled, false);
  }
});

test('sign-in: success hands the tokens to the server once, clears the field and opens the dashboard', async () => {
  const sent = [];
  const page = bootLogin({
    supabase: () => res(200, { access_token: 'a'.repeat(40), refresh_token: 'r'.repeat(20), expires_in: 3600 }),
    session: (init) => { if (init.method === 'POST') sent.push(JSON.parse(init.body)); return init.method === 'POST' ? res(200, { authenticated: true }) : res(401, {}); },
  });
  await submitSignIn(page, { password: 'correct horse' });
  assert.equal(page.out.redirected, '/admin/app.html');
  assert.equal(page.get('login-password').value, '');
  assert.deepEqual(Object.keys(sent[0]).sort(), ['access_token', 'expires_in', 'refresh_token']);
});

test('sign-in: a non-admin is told so', async () => {
  const page = bootLogin({
    supabase: () => res(200, { access_token: 'a'.repeat(40), refresh_token: 'r'.repeat(20), expires_in: 3600 }),
    session: (init) => (init.method === 'POST' ? res(403, { error: 'Not an administrator' }) : res(401, {})),
  });
  await submitSignIn(page);
  assert.match(notice(page).textContent, /not an administrator/);
});

test('show/hide password: toggles every listed field, the label and the pressed state', () => {
  const login = fakeEl('login-password', { type: 'password' });
  const confirm = fakeEl('reset-confirm', { type: 'password' });
  const btn = fakeEl('btn', { attrs: { 'data-toggle-password': 'login-password reset-confirm', 'aria-pressed': 'false', 'aria-label': 'Show password' } });
  const windowHandlers = {};
  const ctx = {
    document: {
      querySelectorAll: () => [btn],
      getElementById: (id) => ({ 'login-password': login, 'reset-confirm': confirm })[id] ?? null,
    },
    window: { addEventListener: (t, f) => { windowHandlers[t] = f; } },
    Array, String,
  };
  vm.createContext(ctx);
  vm.runInContext(toggleSrc, ctx);

  btn.handlers.click();
  assert.equal(login.type, 'text');
  assert.equal(confirm.type, 'text');
  assert.equal(btn.getAttribute('aria-pressed'), 'true');
  assert.equal(btn.getAttribute('aria-label'), 'Hide password');
  assert.equal(login.focused, true);

  btn.handlers.click();
  assert.equal(login.type, 'password');
  assert.equal(btn.getAttribute('aria-label'), 'Show password');

  // Leaving the page, or coming back from the back/forward cache, hides it again.
  btn.handlers.click();
  assert.equal(login.type, 'text');
  windowHandlers.pagehide();
  assert.equal(login.type, 'password');
  assert.equal(confirm.type, 'password');
  assert.equal(btn.getAttribute('aria-pressed'), 'false');
});

test('both password pages carry the control, wired to real password inputs', () => {
  for (const [page, ids] of [['admin/login.html', ['login-password']], ['admin/reset-password.html', ['reset-password', 'reset-confirm']]]) {
    const html = read(page);
    assert.match(html, /<script src="\/admin\/js\/password-toggle\.js"><\/script>/, page);
    const wired = html.match(/data-toggle-password="([^"]+)"/);
    assert.ok(wired, `${page} has no show-password button`);
    assert.deepEqual(wired[1].split(' '), ids, page);
    for (const id of ids) assert.match(html, new RegExp(`id="${id}"[^>]*type="password"`), `${page}#${id}`);
    assert.match(html, /class="pw-toggle"[^>]*aria-label="Show password" aria-pressed="false"/, page);
    assert.ok(!/\sstyle=|\son[a-z]+=/.test(html), `${page} must stay free of inline style and handlers (strict CSP)`);
  }
  const css = read('admin/admin-auth.css');
  assert.match(css, /\.pw-toggle\s*\{[^}]*inline-size:\s*var\(--tap\)/s, 'touch target is the standard 44px');
});
