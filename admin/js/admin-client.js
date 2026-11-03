/**
 * Admin dashboard client.
 *
 * Replaces the supabase-js client the dashboard used to create in the
 * browser. The Supabase session now lives in HttpOnly cookies that page
 * scripts cannot read, so every call goes through the admin API, which checks
 * the session and the admin role on the server for each request:
 *
 *   /api/admin/session  who is signed in, sign out
 *   /api/admin/rest     table reads and writes, run as the admin under RLS
 *
 * It keeps the small part of the supabase-js query API that js/admin.js and
 * the dashboard already use (from().select/insert/update/delete/upsert, eq,
 * order, single; auth.getSession/signOut; rpc('is_admin')), so those scripts
 * work unchanged.
 *
 * Load it with a plain <script> before js/admin.js. It also guards the page:
 * without a valid admin session it sends the visitor to the sign-in page.
 */
(function () {
  'use strict';

  var LOGIN = '/admin/login.html';

  function call(path, method, body) {
    var init = {
      method: method,
      credentials: 'same-origin',
      cache: 'no-store',
      headers: { 'X-Admin-CSRF': '1' },
    };
    if (body !== undefined) {
      init.headers['Content-Type'] = 'application/json';
      init.body = JSON.stringify(body);
    }
    return fetch(path, init).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (json) {
        if (r.status === 401) {
          window.location.replace(LOGIN + '?expired=1');
        }
        return { status: r.status, json: json };
      });
    });
  }

  function Query(table) {
    this.body = { table: table, filters: [] };
  }
  Query.prototype.select = function (columns, opts) {
    if (!this.body.action) this.body.action = 'select';
    if (columns) this.body.columns = columns;
    if (opts && opts.count) this.body.count = opts.count;
    if (opts && opts.head) this.body.head = true;
    return this;
  };
  Query.prototype.insert = function (values) {
    this.body.action = 'insert';
    this.body.values = values;
    return this;
  };
  Query.prototype.update = function (values) {
    this.body.action = 'update';
    this.body.values = values;
    return this;
  };
  Query.prototype.upsert = function (values, opts) {
    this.body.action = 'upsert';
    this.body.values = values;
    if (opts && opts.onConflict) this.body.onConflict = opts.onConflict;
    return this;
  };
  Query.prototype.delete = function () {
    this.body.action = 'delete';
    return this;
  };
  Query.prototype.eq = function (column, value) {
    this.body.filters.push({ column: column, value: value });
    return this;
  };
  Query.prototype.order = function (column, opts) {
    this.body.order = { column: column, ascending: !(opts && opts.ascending === false) };
    return this;
  };
  Query.prototype.single = function () {
    this.body.single = true;
    return this;
  };
  Query.prototype.then = function (resolve, reject) {
    if (!this.body.action) this.body.action = 'select';
    return call('/api/admin/rest', 'POST', this.body).then(function (r) {
      var j = r.json || {};
      return {
        data: j.data === undefined ? null : j.data,
        count: j.count === undefined ? null : j.count,
        error: j.error || (r.status >= 400 ? { message: 'Request failed (' + r.status + ')' } : null),
      };
    }, function () {
      return { data: null, count: null, error: { message: 'Network error' } };
    }).then(resolve, reject);
  };

  var sessionPromise = null;
  function session() {
    if (!sessionPromise) {
      sessionPromise = call('/api/admin/session', 'GET').then(function (r) {
        return r.status === 200 && r.json && r.json.authenticated ? r.json : null;
      }, function () { return null; });
    }
    return sessionPromise;
  }

  window.supabaseClient = {
    from: function (table) { return new Query(table); },
    rpc: function (name) {
      if (name !== 'is_admin') return Promise.resolve({ data: null, error: { message: 'Unsupported' } });
      return session().then(function (s) { return { data: !!s, error: null }; });
    },
    auth: {
      getSession: function () {
        return session().then(function (s) {
          return { data: { session: s ? { user: { email: s.email } } : null }, error: null };
        });
      },
      signOut: function () {
        return call('/api/admin/session', 'DELETE').then(function () {
          window.location.replace(LOGIN + '?signed_out=1');
          return { error: null };
        });
      },
      onAuthStateChange: function () {
        return { data: { subscription: { unsubscribe: function () {} } } };
      },
    },
  };

  // Page guard. The dashboard HTML itself holds no data; every read and write
  // is authorised on the server, so this only spares a visitor an empty page.
  session().then(function (s) {
    if (!s) {
      window.location.replace(LOGIN);
      return;
    }
    function show() {
      document.body.classList.add('auth-ok');
      var who = document.querySelector('[data-admin-email]');
      if (who) who.textContent = s.email || '';
    }
    if (document.body) show();
    else document.addEventListener('DOMContentLoaded', show);
  });
})();
