// downloads.html: install-guide dialog, SHA-256 copy buttons and the phone
// preview. The cards themselves are rendered at build time.
(function () {
  'use strict';

  // ---- Install guide ----
  var overlay = document.getElementById('guide-overlay');
  var closeBtn = document.getElementById('guide-close');
  var opener = null;

  function openGuide(trigger) {
    if (!overlay) return;
    opener = trigger || null;
    overlay.hidden = false;
    document.body.classList.add('menu-open');
    if (closeBtn) closeBtn.focus();
  }
  function closeGuide() {
    if (!overlay || overlay.hidden) return;
    overlay.hidden = true;
    document.body.classList.remove('menu-open');
    if (opener) opener.focus();
  }

  var openBtn = document.getElementById('open-guide-btn');
  if (openBtn) openBtn.addEventListener('click', function () { openGuide(openBtn); });
  if (closeBtn) closeBtn.addEventListener('click', closeGuide);
  if (overlay) overlay.addEventListener('click', function (e) { if (e.target === overlay) closeGuide(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeGuide(); });

  // ---- SHA-256 copy ----
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!navigator.clipboard) return;
      var label = btn.firstChild;
      navigator.clipboard.writeText(btn.getAttribute('data-copy')).then(function () {
        label.nodeValue = 'Copied';
        btn.classList.add('is-copied');
        setTimeout(function () { label.nodeValue = 'Copy'; btn.classList.remove('is-copied'); }, 2000);
      }).catch(function () {});
    });
  });

  // ---- Phone preview ----
  // The iframe starts empty and loads only when the section scrolls near the
  // viewport, so phones do not boot a whole app just by opening this page.
  var iframe = document.getElementById('preview-iframe');
  var loader = document.getElementById('phone-loader');
  var frame = document.getElementById('phone-frame');
  var fullBtn = document.getElementById('preview-open');
  var buttons = document.querySelectorAll('.preview-app');
  if (!iframe) return;

  function load(src) {
    if (loader) loader.classList.remove('is-hidden');
    iframe.src = src;
    if (fullBtn) fullBtn.href = src;
    if (frame) frame.classList.toggle('landscape', src.indexOf('games/') === 0);
  }
  iframe.addEventListener('load', function () { if (loader) loader.classList.add('is-hidden'); });

  buttons.forEach(function (b) {
    b.addEventListener('click', function () {
      buttons.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      load(b.getAttribute('data-src'));
    });
  });

  var initial = iframe.getAttribute('data-src');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      if (entries.some(function (e) { return e.isIntersecting; })) { io.disconnect(); load(initial); }
    }, { rootMargin: '200px' });
    io.observe(iframe);
  } else {
    load(initial);
  }
})();
