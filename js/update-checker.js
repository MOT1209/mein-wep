/*
 * Rashid OTA Update Checker (in-app)
 * --------------------------------------------------------------
 * Per app, set the config BEFORE loading this file:
 *   <script>window.RASHID_APP={id:'com.rashid.kingcraft',version:'0.6.0',name:'KingCraft'};</script>
 *   <script src="https://rashid-wep.vercel.app/js/update-checker.js" defer></script>
 *
 * On launch (inside the installed Capacitor app) it fetches the central manifest,
 * compares the installed version to the latest, and — only if newer — shows a
 * dismissible dialog with the release notes. The user chooses Update / Later.
 *
 * Web testing:  ?updatecheck=1  → run the real check on the website
 *               ?demoupdate=1   → preview the dialog UI with sample data
 */
(function () {
  'use strict';

  var SITE = 'https://rashid-wep.vercel.app';
  var MANIFEST = SITE + '/apks/updates.json';
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

  function cmp(a, b) { // semver: returns 1 if a>b, -1 if a<b, 0 if equal
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

  function show(info) {
    if (document.getElementById('rashid-update-modal')) return;
    injectStyles();
    var notes = (info.notes || []).map(function (n) { return '<li>' + esc(n) + '</li>'; }).join('');
    var wrap = document.createElement('div');
    wrap.id = 'rashid-update-modal';
    wrap.innerHTML =
      '<div class="ruc-overlay"></div>' +
      '<div class="ruc-card" role="dialog" aria-modal="true" aria-labelledby="ruc-title">' +
        '<div class="ruc-badge"><i></i> تحديث جديد متوفّر</div>' +
        '<h3 id="ruc-title">' + esc(info.name || cfg.name || 'التطبيق') + ' <span>v' + esc(info.version) + '</span></h3>' +
        (info.date ? '<p class="ruc-date">' + esc(info.date) + '</p>' : '') +
        (notes ? '<ul class="ruc-notes">' + notes + '</ul>' : '<p class="ruc-notes-empty">تحسينات وإصلاحات عامة.</p>') +
        '<div class="ruc-actions">' +
          '<button class="ruc-later" type="button">لاحقاً</button>' +
          '<a class="ruc-update" href="' + esc(info.url).replace(/"/g, '&quot;') + '" target="_blank" rel="noopener">تحديث الآن</a>' +
        '</div>' +
        '<p class="ruc-current">إصدارك الحالي: v' + esc(cfg.version || '—') + '</p>' +
      '</div>';
    document.body.appendChild(wrap);

    function close() { wrap.remove(); }
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
      // let the anchor's default open the download too
    });
  }

  function run() {
    if (DEMO) {
      show({
        name: cfg.name, version: bump(cfg.version || '1.0.0'), url: SITE + '/downloads.html', date: '',
        notes: ['هذه معاينة لشكل نافذة التحديث (وضع تجريبي).', 'ميزات جديدة وتحسينات في الأداء.']
      });
      return;
    }
    fetch(MANIFEST, { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var apps = (data && data.apps) || {};
        var info = apps[cfg.id];
        if (!info || !info.version) return;
        if (cmp(info.version, cfg.version) <= 0) return;                 // not newer → nothing
        var dismissed = '';
        try { dismissed = localStorage.getItem(key()); } catch (e) {}
        if (dismissed === info.version && !FORCE) return;               // user chose "Later" for this version
        var url = (info.url && info.url.charAt(0) === '/') ? SITE + info.url : (info.url || SITE + '/downloads.html');
        show({ name: info.name, version: info.version, url: url, date: info.date, notes: info.notes });
      })
      .catch(function () { /* offline / no manifest → stay silent */ });
  }

  function injectStyles() {
    if (document.getElementById('ruc-styles')) return;
    var css =
      '#rashid-update-modal{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:flex-end;justify-content:center;font-family:system-ui,-apple-system,"Segoe UI",sans-serif}' +
      '#rashid-update-modal .ruc-overlay{position:absolute;inset:0;background:rgba(0,0,0,.55);backdrop-filter:blur(3px)}' +
      '#rashid-update-modal .ruc-card{position:relative;width:min(440px,94vw);margin:0 auto calc(16px + env(safe-area-inset-bottom,0px));background:#101018;color:#f1f5f9;border:1px solid rgba(255,255,255,.08);border-radius:20px;padding:22px;box-shadow:0 -10px 50px rgba(0,0,0,.5);animation:ruc-up .3s ease;direction:rtl;text-align:right}' +
      '@keyframes ruc-up{from{transform:translateY(40px);opacity:0}to{transform:translateY(0);opacity:1}}' +
      '#rashid-update-modal .ruc-badge{display:inline-flex;align-items:center;gap:6px;font-size:.72rem;font-weight:700;color:#818cf8;background:rgba(99,102,241,.15);padding:4px 10px;border-radius:100px;margin-bottom:10px}' +
      '#rashid-update-modal .ruc-badge i{width:7px;height:7px;border-radius:50%;background:#6366f1;display:inline-block}' +
      '#rashid-update-modal h3{margin:0 0 4px;font-size:1.15rem;font-weight:700}' +
      '#rashid-update-modal h3 span{color:#818cf8}' +
      '#rashid-update-modal .ruc-date{margin:0 0 10px;font-size:.78rem;color:#8596b0}' +
      '#rashid-update-modal .ruc-notes{margin:8px 0 14px;padding-inline-start:18px;font-size:.88rem;color:#c7d2e0;line-height:1.7}' +
      '#rashid-update-modal .ruc-notes-empty{margin:8px 0 14px;font-size:.88rem;color:#c7d2e0}' +
      '#rashid-update-modal .ruc-actions{display:flex;gap:10px;margin-top:6px}' +
      '#rashid-update-modal .ruc-update{flex:1;text-align:center;background:#6366f1;color:#fff;text-decoration:none;padding:12px;border-radius:12px;font-weight:700;font-size:.95rem}' +
      '#rashid-update-modal .ruc-later{flex:1;background:transparent;color:#a8b5c9;border:1px solid rgba(255,255,255,.14);padding:12px;border-radius:12px;font-weight:600;font-size:.95rem;cursor:pointer;font-family:inherit}' +
      '#rashid-update-modal .ruc-current{margin:12px 0 0;font-size:.72rem;color:#6b7c99;text-align:center}';
    var st = document.createElement('style'); st.id = 'ruc-styles'; st.textContent = css;
    document.head.appendChild(st);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(run, 800); });
  } else {
    setTimeout(run, 800);
  }
})();
