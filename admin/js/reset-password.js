/**
 * Password reset, step 2. Supabase sends the reset link here with a one-time
 * recovery session in the URL fragment. The fragment is removed from the
 * address bar at once, the new password is saved with that session, and the
 * recovery session is then ended; the owner signs in normally afterwards.
 */
(function () {
  'use strict';

  var MIN = 12;
  var form = document.getElementById('reset-form');
  var pass = document.getElementById('reset-password');
  var confirm = document.getElementById('reset-confirm');
  var submit = document.getElementById('reset-submit');
  var notice = document.getElementById('reset-notice');

  function say(text, ok) {
    notice.textContent = text;
    notice.classList.toggle('notice-ok', !!ok);
    notice.hidden = !text;
  }

  var hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  var query = new URLSearchParams(window.location.search);
  var token = hash.get('access_token');
  var type = hash.get('type');
  var linkError = hash.get('error_description') || query.get('error_description');

  // Keep the one-time token out of history, bookmarks and screenshots.
  if (window.location.hash) {
    history.replaceState(null, '', window.location.pathname);
  }

  if (linkError || !token || type !== 'recovery') {
    say('This reset link is invalid or has expired. Request a new one from the sign-in page.');
    return;
  }
  form.hidden = false;
  pass.focus();

  var configPromise = fetch('/api/admin/config', { cache: 'no-store' }).then(function (r) {
    if (!r.ok) throw new Error('config');
    return r.json();
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (pass.value.length < MIN) {
      say('Use at least ' + MIN + ' characters.');
      pass.focus();
      return;
    }
    if (pass.value !== confirm.value) {
      say('The two passwords do not match.');
      confirm.focus();
      return;
    }
    say('');
    submit.disabled = true;
    var c;
    configPromise.then(function (cfg) {
      c = cfg;
      return fetch(c.supabaseUrl + '/auth/v1/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', apikey: c.anonKey, Authorization: 'Bearer ' + token },
        body: JSON.stringify({ password: pass.value }),
      });
    }).then(function (r) {
      if (!r.ok) {
        return r.json().catch(function () { return {}; }).then(function (j) {
          throw new Error(j.msg || j.message || 'The password could not be saved. The link may have expired.');
        });
      }
      pass.value = '';
      confirm.value = '';
      return fetch(c.supabaseUrl + '/auth/v1/logout?scope=local', {
        method: 'POST',
        headers: { apikey: c.anonKey, Authorization: 'Bearer ' + token },
      }).catch(function () {});
    }).then(function () {
      token = null;
      window.location.replace('/admin/login.html?reset=1');
    }).catch(function (err) {
      submit.disabled = false;
      say(err && err.message && err.message !== 'config' ? err.message : 'The reset service is unavailable right now.');
    });
  });
})();
