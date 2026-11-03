// King Studio: theme toggle, footer year and catalogue filtering.
// Cards are fully rendered in HTML; this only hides/shows them, so the pages
// work without JavaScript.
(function () {
  'use strict';

  var root = document.documentElement;

  function readTheme() {
    return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  function paintToggle() {
    var btn = document.getElementById('ks-theme');
    if (!btn) return;
    btn.setAttribute('aria-label', readTheme() === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
  }

  var toggle = document.getElementById('ks-theme');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = readTheme() === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) { /* private mode */ }
      paintToggle();
    });
    paintToggle();
  }

  var year = document.getElementById('ks-year');
  if (year) year.textContent = String(new Date().getFullYear());

  document.querySelectorAll('[data-ks-controls]').forEach(function (controls) {
    var grid = document.getElementById(controls.getAttribute('data-ks-controls'));
    if (!grid) return;
    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-ks-item]'));
    var empty = grid.parentNode.querySelector('[data-ks-empty]');
    var count = controls.querySelector('[data-ks-count]');
    var search = controls.querySelector('[data-ks-search]');
    var chips = Array.prototype.slice.call(controls.querySelectorAll('[data-ks-filter]'));
    var filter = '';

    function matchesFilter(card) {
      if (!filter) return true;
      var parts = filter.split(':');
      var kind = parts.shift();
      var value = parts.join(':');
      if (kind === 'status') return card.getAttribute('data-status') === value;
      return card.getAttribute('data-platforms').split('|').indexOf(value) !== -1;
    }

    function apply() {
      var q = search ? search.value.trim().toLowerCase() : '';
      var shown = 0;
      cards.forEach(function (card) {
        var ok = matchesFilter(card) && (!q || card.getAttribute('data-search').indexOf(q) !== -1);
        card.hidden = !ok;
        if (ok) shown += 1;
      });
      if (empty) empty.hidden = shown !== 0;
      if (count) count.textContent = shown + (shown === 1 ? ' project shown' : ' projects shown');
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        filter = chip.getAttribute('data-ks-filter');
        chips.forEach(function (c) { c.setAttribute('aria-pressed', c === chip ? 'true' : 'false'); });
        apply();
      });
    });
    if (search) search.addEventListener('input', apply);
  });
})();
