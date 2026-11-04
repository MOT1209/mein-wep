/**
 * Admin sign-in.
 *
 * 1. The password goes straight to Supabase Auth (it rate-limits per client IP).
 * 2. The returned tokens are handed once to POST /api/admin/session, which
 *    checks the admin role and stores them in HttpOnly cookies. They are then
 *    dropped from this page; no token is kept in localStorage.
 */
(function () {
  'use strict';

  var form = document.getElementById('login-form');
  var email = document.getElementById('login-email');
  var password = document.getElementById('login-password');
  var submit = document.getElementById('login-submit');
  var notice = document.getElementById('login-notice');
  var forgot = document.getElementById('forgot-password');
  var DASHBOARD = '/admin/app.html';
  var config = null;

  function say(text, ok) {
    notice.textContent = text;
    notice.classList.toggle('notice-ok', !!ok);
    notice.hidden = !text;
  }

  // Sessions from the old in-browser login sat in localStorage. Remove them.
  try {
    Object.keys(localStorage).forEach(function (k) {
      if (/^sb-.*-auth-token$/.test(k)) localStorage.removeItem(k);
    });
  } catch (e) { /* storage blocked */ }

  var params = new URLSearchParams(window.location.search);
  if (params.has('expired')) say('Your session ended. Sign in again.');
  if (params.has('signed_out')) say('You are signed out.', true);
  if (params.has('reset')) say('Password changed. Sign in with the new password.', true);

  function api(path, method, body) {
    return fetch(path, {
      method: method,
      credentials: 'same-origin',
      cache: 'no-store',
      headers: body ? { 'Content-Type': 'application/json', 'X-Admin-CSRF': '1' } : { 'X-Admin-CSRF': '1' },
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  function loadConfig() {
    if (config) return Promise.resolve(config);
    return fetch('/api/admin/config', { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('config'); return r.json(); })
      .then(function (c) { config = c; return c; });
  }

  // Already signed in? Go straight to the dashboard.
  api('/api/admin/session', 'GET').then(function (r) {
    if (r.status === 200) window.location.replace(DASHBOARD);
  }).catch(function () {});

  // Supabase Auth error bodies: { error_code, msg } (older servers: { error, error_description }).
  function errorBody(r) {
    return r.json().catch(function () { return {}; });
  }
  function codeOf(body) {
    return String((body && (body.error_code || body.code || body.error)) || '');
  }
  function textOf(body) {
    return String((body && (body.msg || body.message || body.error_description)) || '');
  }

  // Say what actually went wrong. The password is checked before the account's
  // confirmation state, so "not confirmed" is only ever shown to someone who
  // knows the password; an unknown address and a wrong password look the same.
  function signInProblem(r, body) {
    var code = codeOf(body);
    if (r.status === 429 || code === 'over_request_rate_limit') return 'Too many attempts. Wait a few minutes and try again.';
    if (code === 'email_not_confirmed') return 'This account\u2019s email address is not confirmed yet. In Supabase open Authentication \u2192 Users and confirm it.';
    if (code === 'user_banned') return 'This account is disabled.';
    if (r.status >= 500) return 'The sign-in service had a problem. Try again in a minute.';
    return 'Email or password is wrong.';
  }

  function resetProblem(r, body) {
    var code = codeOf(body);
    var text = textOf(body);
    if (r.status === 429 || code === 'over_email_send_rate_limit' || code === 'over_request_rate_limit') {
      return 'Too many reset emails were requested. Wait a while (the limit resets within the hour) and try again.';
    }
    if (code === 'email_address_not_authorized') {
      return 'Supabase\u2019s built-in mail service does not send to this address. Set up your own mail service (SMTP) in Supabase \u2192 Authentication \u2192 SMTP Settings.';
    }
    if (r.status >= 500 || /sending .*email|smtp/i.test(text)) {
      return 'Supabase could not send the email. Check Authentication \u2192 SMTP Settings and the Auth logs in Supabase.';
    }
    return 'The reset email was not sent (' + (code || r.status) + ').';
  }

  function busy(on) {
    submit.disabled = on;
    submit.textContent = on ? 'Signing in…' : 'Sign in';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var address = email.value.trim();
    if (!address || !password.value) {
      say('Enter your email and password.');
      (address ? password : email).focus();
      return;
    }
    say('');
    busy(true);
    loadConfig().then(function (c) {
      return fetch(c.supabaseUrl + '/auth/v1/token?grant_type=password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: c.anonKey },
        body: JSON.stringify({ email: address, password: password.value }),
      });
    }).then(function (r) {
      if (r.ok) return r.json();
      return errorBody(r).then(function (body) { throw new Error(signInProblem(r, body)); });
    }).then(function (s) {
      password.value = '';
      return api('/api/admin/session', 'POST', {
        access_token: s.access_token,
        refresh_token: s.refresh_token,
        expires_in: s.expires_in,
      });
    }).then(function (r) {
      if (r.status === 200) {
        window.location.replace(DASHBOARD);
        return;
      }
      if (r.status === 403) throw new Error('This account is not an administrator.');
      if (r.status === 429) throw new Error('Too many attempts. Wait a minute and try again.');
      throw new Error('Sign-in failed. Try again.');
    }).catch(function (err) {
      busy(false);
      var msg = err && err.message && err.message !== 'config' ? err.message : 'The sign-in service is unavailable right now.';
      if (err instanceof TypeError) msg = 'Network error. Check your connection.';
      say(msg);
      password.focus();
    });
  });

  forgot.addEventListener('click', function () {
    var address = email.value.trim();
    if (!address) {
      say('Enter your email above first, then choose “Forgot password?”.');
      email.focus();
      return;
    }
    forgot.disabled = true;
    loadConfig().then(function (c) {
      var redirect = window.location.origin + '/admin/reset-password.html';
      return fetch(c.supabaseUrl + '/auth/v1/recover?redirect_to=' + encodeURIComponent(redirect), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: c.anonKey },
        body: JSON.stringify({ email: address }),
      });
    }).then(function (r) {
      if (r.ok) {
        // Same message whether or not the address exists: no account probing.
        say('If an admin account uses that address, a reset link is on its way. It can take a few minutes; check the spam folder too.', true);
        return null;
      }
      // Anything else means Supabase did not accept the request: say so instead
      // of pretending the email was sent.
      return errorBody(r).then(function (body) { throw new Error(resetProblem(r, body)); });
    }).catch(function (err) {
      say(err && err.message && err.message !== 'config' ? err.message : 'The reset service is unavailable right now.');
    }).then(function () {
      forgot.disabled = false;
    });
  });
})();
