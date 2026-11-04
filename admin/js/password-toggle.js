/**
 * Show/hide password. A button with data-toggle-password="<input id> [<input id>…]"
 * switches those fields between type=password and type=text, so a typo can be
 * seen. One button may control several fields (the reset page has two).
 * The fields go back to hidden when the page is left or restored from the
 * back/forward cache, so a shown password never stays on screen.
 */
(function () {
  'use strict';

  var buttons = document.querySelectorAll('[data-toggle-password]');

  function fields(btn) {
    return String(btn.getAttribute('data-toggle-password') || '')
      .split(/\s+/)
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);
  }

  function set(btn, show) {
    fields(btn).forEach(function (input) { input.type = show ? 'text' : 'password'; });
    btn.setAttribute('aria-pressed', show ? 'true' : 'false');
    btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
  }

  Array.prototype.forEach.call(buttons, function (btn) {
    btn.addEventListener('click', function () {
      var first = fields(btn)[0];
      set(btn, !!first && first.type === 'password');
      if (first) first.focus();
    });
  });

  function hideAll() {
    Array.prototype.forEach.call(buttons, function (btn) { set(btn, false); });
  }
  window.addEventListener('pagehide', hideAll);
  window.addEventListener('pageshow', hideAll);
})();
