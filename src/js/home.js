/* src/js/home.js
   Homepage behaviour. Everything else on the page is static HTML rendered at
   build time; the shared header (menu, theme toggle, footer year) is wired by
   js/site-nav.js. This module only drives the settings dialog:
     • Light/Dark buttons — delegate to the header's [data-theme-toggle], so
       the theme state and its aria-label stay owned by site-nav.js
     • Accent colour (localStorage `accentColor`)
     • Reduce motion (localStorage `reduceMotion`)
*/
import { initSettings } from './modules/settings.js?v=1.1';
import { qs, qsa, on } from './utils/dom.js?v=1.1';

const root = document.documentElement;

const read = (key) => {
  try { return localStorage.getItem(key); } catch { return null; }
};
const write = (key, value) => {
  try { localStorage.setItem(key, value); } catch { /* private mode */ }
};

const currentTheme = () => (root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');

function syncThemeOptions() {
  qsa('[data-theme-opt]').forEach((btn) => {
    btn.setAttribute('aria-pressed', String(btn.dataset.themeOpt === currentTheme()));
  });
}

function setAccent(color) {
  // --signal is the one accent token in css/tokens.css.
  root.style.setProperty('--signal', color);
  root.style.setProperty('--signal-hover', color);
  qsa('.accent-dot').forEach((dot) => {
    dot.setAttribute('aria-pressed', String(dot.dataset.color === color));
  });
  write('accentColor', color);
}

function setReduceMotion(enabled) {
  document.body.classList.toggle('reduce-motion', enabled);
  const box = qs('#reduce-motion');
  if (box) box.checked = enabled;
  write('reduceMotion', String(enabled));
}

initSettings();

qsa('[data-theme-opt]').forEach((btn) => {
  on(btn, 'click', () => {
    if (btn.dataset.themeOpt !== currentTheme()) qs('[data-theme-toggle]')?.click();
    syncThemeOptions();
  });
});
// site-nav.js loads after this module, so its toggle handler runs after ours:
// read the new theme on the next tick.
qsa('[data-theme-toggle]').forEach((btn) => on(btn, 'click', () => setTimeout(syncThemeOptions)));
syncThemeOptions();

const accents = qsa('.accent-dot').map((dot) => dot.dataset.color);
const savedAccent = read('accentColor');
if (savedAccent && accents.includes(savedAccent)) setAccent(savedAccent);
qsa('.accent-dot').forEach((dot) => on(dot, 'click', () => setAccent(dot.dataset.color)));

setReduceMotion(read('reduceMotion') === 'true');
on(qs('#reduce-motion'), 'change', (e) => setReduceMotion(e.target.checked));
