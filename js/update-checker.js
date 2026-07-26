/*
 * Rashid OTA Update Checker (in-app)
 * --------------------------------------------------------------
 * Per app, set the config BEFORE loading this file:
 *   <script>window.RASHID_APP={id:'com.rashid.kingcraft',version:'0.6.0',name:'KingCraft'};</script>
 *   <script src="https://rashid-wep.vercel.app/js/update-checker.js" defer></script>
 *
 * On launch (inside the installed Capacitor app) it asks the backend for the
 * latest version, compares it to the installed one, and — only if newer — shows
 * a dismissible dialog with the release notes. The owner publishes updates from
 * the Admin dashboard (Supabase `app_updates`); a static updates.json is used as
 * a fallback. The user chooses Update / Later.
 *
 * Web testing:  ?updatecheck=1  → run the real check on the website
 *               ?demoupdate=1   → preview the dialog UI with sample data
 */
(function () {
  'use strict';

  var SITE = 'https://rashid-wep.vercel.app';
  var FALLBACK = SITE + '/apks/updates.json';
  var SB_URL = 'https://kcltollasghlvuoxvjqa.supabase.co';
  var SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjbHRvbGxhc2dobHZ1b3h2anFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyODI5NDksImV4cCI6MjA5Njg1ODk0OX0.w-op2d4THYCrKjql9t1j7BiBZM2krDEkw-vdOwFzXFE';

  var cfg = window.RASHID_APP || {};
  var search = location.search || '';
  var FORCE = search.indexOf('updatecheck=1') > -1;
  var DEMO = search.indexOf('demoupdate=1') > -1;

  // Only run inside the native (Capacitor) app — never nag website visitors,
  // unless explicitly forced for testing.
  var isNative = !!(window.Capacitor &&
    (typeof window.Capacitor.isNativePlatform === 'function' ? window.Capacitor.isNativePlatform() : true));
  if (!isNative && !FORCE && !DEMO) return;
  if ((!cfg.id || !cfg.version) && !DEMO) return;

  function cmp(a, b) { // semver: 1 if a>b, -1 if a<b, 0 if equal
    var pa = String(a).split('.').map(Number), pb = String(b).split('.').map(Number);
    for (var i = 0; i < Math.max(pa.length, pb.length); i++) {
      var x = pa[i] || 0, y = pb[i] || 0;
      if (x > y) return 1;
      if (x < y) return -1;
    }
    return 0;
  }
  function bump(v) { var p = String(v).split('.').map(Number); p[p.length - 1] = (p[p.length - 1] || 0) + 1; return p.join('.'); }
  function key() { return 'rashid_upd_dismissed_' + (cfg.id || 'app'); }
  function esc(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; }
  function toNotes(n) {
    if (!n) return [];
    if (Array.isArray(n)) return n;
    return String(n).split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
  }
  function abs(u) { return (u && u.charAt(0) === '/') ? SITE + u : (u || SITE + '/downloads.html'); }

  function show(info) {
    if (document.getElementById('rashid-update-modal')) return;
    injectStyles();
    var notes = toNotes(info.notes).map(function (n) {
      return '<li><svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path fill="currentColor" d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg><span>' + esc(n) + '</span></li>';
    }).join('');
    var initial = esc((info.name || cfg.name || 'A').charAt(0)).toUpperCase();
    var wrap = document.createElement('div');
    wrap.id = 'rashid-update-modal';
    wrap.innerHTML =
      '<div class="ruc-overlay"></div>' +
      '<div class="ruc-card" role="dialog" aria-modal="true" aria-labelledby="ruc-title">' +
        '<div class="ruc-head">' +
          '<div class="ruc-icon">' + (info.icon ? '<img src="' + esc(info.icon).replace(/"/g, '&quot;') + '" alt="">' : initial) + '</div>' +
          '<div class="ruc-headtext">' +
            '<div class="ruc-badge">تحديث جديد متوفّر</div>' +
            '<h3 id="ruc-title">' + esc(info.name || cfg.name || 'التطبيق') + '</h3>' +
          '</div>' +
        '</div>' +
        '<div class="ruc-vrow"><span class="ruc-vnew">v' + esc(info.version) + '</span>' +
          (info.date ? '<span class="ruc-vdate">' + esc(info.date) + '</span>' : '') + '</div>' +
        (notes ? '<ul class="ruc-notes">' + notes + '</ul>' : '<p class="ruc-notes-empty">تحسينات وإصلاحات عامة.</p>') +
        '<div class="ruc-actions">' +
          '<button class="ruc-later" type="button">لاحقاً</button>' +
          '<a class="ruc-update" href="' + esc(info.url).replace(/"/g, '&quot;') + '" target="_blank" rel="noopener">⬇ تحديث الآن</a>' +
        '</div>' +
        '<p class="ruc-current">إصدارك الحالي: v' + esc(cfg.version || '—') + '</p>' +
      '</div>';
    document.body.appendChild(wrap);

    function close() { wrap.classList.add('ruc-closing'); setTimeout(function () { wrap.remove(); }, 200); }
    wrap.querySelector('.ruc-overlay').addEventListener('click', close);
    wrap.querySelector('.ruc-later').addEventListener('click', function () {
      try { localStorage.setItem(key(), info.version); } catch (e) {}
      close();
    });
    wrap.querySelector('.ruc-update').addEventListener('click', function () {
      try {
        if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Browser) {
          window.Capacitor.Plugins.Browser.open({ url: info.url });
        }
      } catch (e) {}
    });
  }

  function present(info) {
    if (!info || !info.version) return false;
    if (cmp(info.version, cfg.version) <= 0) return false;            // not newer
    var dismissed = '';
    try { dismissed = localStorage.getItem(key()); } catch (e) {}
    if (dismissed === info.version && !FORCE) return false;           // "Later" for this version
    show({ name: info.name, version: info.version, url: abs(info.url), date: info.date, notes: info.notes, icon: info.icon });
    return true;
  }

  function fromSupabase() {
    var url = SB_URL + '/rest/v1/app_updates?app_id=eq.' + encodeURIComponent(cfg.id) + '&select=*';
    return fetch(url, { headers: { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY }, cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (rows) {
        var row = rows && rows[0];
        if (!row) return false;
        return present({ name: row.name, version: row.version, url: row.url, date: row.release_date, notes: row.notes, icon: row.icon });
      });
  }

  function fromJson() {
    return fetch(FALLBACK, { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var info = ((data && data.apps) || {})[cfg.id];
        return present(info || null);
      });
  }

  function run() {
    if (DEMO) {
      show({ name: cfg.name, version: bump(cfg.version || '1.0.0'), url: SITE + '/downloads.html', date: '',
        notes: ['هذه معاينة لشكل نافذة التحديث (وضع تجريبي).', 'ميزات جديدة وتحسينات في الأداء.'] });
      return;
    }
    // Supabase first (owner publishes from Admin); fall back to static updates.json.
    fromSupabase().then(function (shown) { if (!shown) return fromJson(); }).catch(function () {
      fromJson().catch(function () { /* offline → silent */ });
    });
  }

  function injectStyles() {
    if (document.getElementById('ruc-styles')) return;
    var css =
      '#rashid-update-modal{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:flex-end;justify-content:center;font-family:system-ui,-apple-system,"Segoe UI",Tahoma,sans-serif}' +
      '#rashid-update-modal.ruc-closing .ruc-card{animation:ruc-down .2s ease forwards}' +
      '#rashid-update-modal.ruc-closing .ruc-overlay{opacity:0}' +
      '#rashid-update-modal .ruc-overlay{position:absolute;inset:0;background:rgba(3,3,8,.6);backdrop-filter:blur(4px);transition:opacity .2s}' +
      '#rashid-update-modal .ruc-card{position:relative;width:min(440px,94vw);margin:0 auto calc(14px + env(safe-area-inset-bottom,0px));background:linear-gradient(180deg,#15151f,#0e0e16);color:#f1f5f9;border:1px solid rgba(129,140,248,.18);border-radius:22px;padding:22px;box-shadow:0 -12px 60px rgba(0,0,0,.55);animation:ruc-up .32s cubic-bezier(.2,.8,.2,1);direction:rtl;text-align:right}' +
      '@keyframes ruc-up{from{transform:translateY(48px);opacity:0}to{transform:translateY(0);opacity:1}}' +
      '@keyframes ruc-down{to{transform:translateY(48px);opacity:0}}' +
      '#rashid-update-modal .ruc-head{display:flex;align-items:center;gap:12px;margin-bottom:14px}' +
      '#rashid-update-modal .ruc-icon{flex:none;width:46px;height:46px;border-radius:13px;background:linear-gradient(135deg,#6366f1,#22d3ee);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:1.2rem;color:#fff;overflow:hidden}' +
      '#rashid-update-modal .ruc-icon img{width:100%;height:100%;object-fit:cover}' +
      '#rashid-update-modal .ruc-badge{font-size:.7rem;font-weight:700;color:#818cf8;margin-bottom:2px}' +
      '#rashid-update-modal h3{margin:0;font-size:1.15rem;font-weight:700}' +
      '#rashid-update-modal .ruc-vrow{display:flex;align-items:center;gap:10px;margin-bottom:12px}' +
      '#rashid-update-modal .ruc-vnew{font-size:.8rem;font-weight:700;color:#34d399;background:rgba(52,211,153,.13);padding:3px 10px;border-radius:100px}' +
      '#rashid-update-modal .ruc-vdate{font-size:.75rem;color:#8596b0}' +
      '#rashid-update-modal .ruc-notes{list-style:none;margin:0 0 16px;padding:0;font-size:.88rem;color:#c7d2e0;line-height:1.5}' +
      '#rashid-update-modal .ruc-notes li{display:flex;gap:8px;align-items:flex-start;padding:4px 0}' +
      '#rashid-update-modal .ruc-notes li svg{flex:none;color:#34d399;margin-top:2px}' +
      '#rashid-update-modal .ruc-notes-empty{margin:0 0 16px;font-size:.88rem;color:#c7d2e0}' +
      '#rashid-update-modal .ruc-actions{display:flex;gap:10px}' +
      '#rashid-update-modal .ruc-update{flex:1.4;text-align:center;background:linear-gradient(135deg,#6366f1,#4f46e5);color:#fff;text-decoration:none;padding:13px;border-radius:13px;font-weight:700;font-size:.95rem;box-shadow:0 8px 24px -8px rgba(99,102,241,.7)}' +
      '#rashid-update-modal .ruc-later{flex:1;background:rgba(255,255,255,.04);color:#a8b5c9;border:1px solid rgba(255,255,255,.12);padding:13px;border-radius:13px;font-weight:600;font-size:.95rem;cursor:pointer;font-family:inherit}' +
      '#rashid-update-modal .ruc-later:active{background:rgba(255,255,255,.08)}' +
      '#rashid-update-modal .ruc-current{margin:13px 0 0;font-size:.72rem;color:#6b7c99;text-align:center}';
    var st = document.createElement('style'); st.id = 'ruc-styles'; st.textContent = css;
    document.head.appendChild(st);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(run, 800); });
  } else {
    setTimeout(run, 800);
  }
})();
