// Shared page behaviour: mobile menu, theme toggle, footer year.
//
// Markup contract (used by the homepage and every page built on site.css):
//   <button data-menu-open aria-controls="ID" aria-expanded="false">
//   <div id="ID" data-menu> … <button data-menu-close> … links … </div>
//   <button data-theme-toggle>
// The menu gets both `is-open` (site.css) and `active` (home.css).
(function () {
  'use strict';

  var root = document.documentElement;
  var lastTrigger = null;

  function menuFor(btn) {
    return document.getElementById(btn.getAttribute('aria-controls'));
  }

  function setOpen(menu, open) {
    if (!menu) return;
    menu.classList.toggle('is-open', open);
    menu.classList.toggle('active', open);
    document.body.classList.toggle('menu-open', open);
    document.querySelectorAll('[data-menu-open][aria-controls="' + menu.id + '"]').forEach(function (b) {
      b.setAttribute('aria-expanded', String(open));
    });
    if (open) {
      var first = menu.querySelector('a, button');
      if (first) first.focus();
    } else if (lastTrigger) {
      lastTrigger.focus();
    }
  }

  document.querySelectorAll('[data-menu-open]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var menu = menuFor(btn);
      lastTrigger = btn;
      setOpen(menu, !(menu && menu.classList.contains('is-open')));
    });
  });

  document.querySelectorAll('[data-menu]').forEach(function (menu) {
    menu.querySelectorAll('[data-menu-close]').forEach(function (b) {
      b.addEventListener('click', function () { setOpen(menu, false); });
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { lastTrigger = null; setOpen(menu, false); });
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var open = document.querySelector('[data-menu].is-open');
    if (open) setOpen(open, false);
  });

  // Closing on resize keeps a menu opened on a phone from staying fixed over
  // the desktop layout after rotating a tablet.
  window.addEventListener('resize', function () {
    if (window.innerWidth < 1024) return;
    var open = document.querySelector('[data-menu].is-open');
    if (open) { lastTrigger = null; setOpen(open, false); }
  });

  function currentTheme() {
    return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }
  function labelThemeButtons() {
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    document.querySelectorAll('[data-theme-toggle]').forEach(function (b) {
      b.setAttribute('aria-label', 'Switch to ' + next + ' theme');
    });
  }
  document.querySelectorAll('[data-theme-toggle]').forEach(function (b) {
    b.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) { /* private mode */ }
      labelThemeButtons();
    });
  });
  labelThemeButtons();

  var year = String(new Date().getFullYear());
  document.querySelectorAll('.copyright-year').forEach(function (el) { el.textContent = year; });
})();
