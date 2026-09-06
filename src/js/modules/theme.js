/* src/js/modules/theme.js
   Handles:
     • Light/Dark toggle (stores preference in localStorage)
     • Accent colour selection (stores in localStorage)
     • Performance mode (disables heavy Three.js avatar)
     • Dynamic blur reduction on mobile (via CSS variables)
     • Caches computed CSS variables to avoid repeated getComputedStyle calls
*/
import { createCachedElements } from '../utils/cache.js';

export const initTheme = (cached) => {
  const { body, root, themeToggle, perfToggle, accentDots, qs, qsa } = cached;

  // ---------- helpers ----------
  const setTheme = (isLight) => {
    // Two theming mechanisms run side by side during the redesign:
    // body.light-mode is what css/style.css understands (every page that has
    // not been redesigned yet), and data-theme on <html> is what
    // css/tokens.css understands. Writing both keeps old and new pages in
    // sync off one toggle.
    body.classList.toggle('light-mode', isLight);
    document.documentElement.setAttribute('data-theme', isLight ? 'light' : 'dark');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    updateThemeIcon();
    updateThemeOptions();
  };
  // Resolved theme. Redesigned pages declare data-theme on <html> (set before
  // paint by an inline script); pages still on css/style.css only have the
  // body class, so fall back to it there.
  const currentTheme = () =>
    document.documentElement.getAttribute('data-theme') ||
    (body.classList.contains('light-mode') ? 'light' : 'dark');

  const updateThemeIcon = () => {
    const icon = themeToggle?.querySelector('i');
    if (!icon) return;
    icon.className = currentTheme() === 'light' ? 'fas fa-moon' : 'fas fa-sun';
  };
  // Sync the Dark/Light buttons inside the settings modal
  const updateThemeOptions = () => {
    const current = currentTheme();
    qsa('.theme-opt').forEach((opt) => {
      opt.classList.toggle('active', opt.dataset.theme === current);
    });
  };
  const setAccent = (color) => {
    root.style.setProperty('--accent', color);
    root.style.setProperty('--accent-glow', `${color}33`); // 20% opacity
    // --signal is the redesigned pages' accent token. Without this the
    // picker is a dead control on any page built on css/tokens.css.
    root.style.setProperty('--signal', color);
    root.style.setProperty('--signal-hover', color);
    qsa('.accent-dot').forEach((dot) => dot.classList.remove('active'));
    const activeDot = qs(`.accent-dot[data-color="${color}"]`);
    if (activeDot) activeDot.classList.add('active');
    localStorage.setItem('accentColor', color);
  };
  const setPerfMode = (enabled) => {
    body.classList.toggle('performance-mode', enabled);
    if (perfToggle) perfToggle.checked = enabled;
    localStorage.setItem('perfMode', String(enabled));
    // If you have a Three.js avatar, pause/resume here:
    // if (window.__rashidAvatar) window.__rashidAvatar[enabled ? 'pause' : 'resume']();
  };

  // ---------- Reduce Motion ----------
  const motionToggle = qs('#reduce-motion');
  const setReduceMotion = (enabled) => {
    body.classList.toggle('reduce-motion', enabled);
    if (motionToggle) motionToggle.checked = enabled;
    localStorage.setItem('reduceMotion', String(enabled));
  };

  // ---------- Nano Banana 2 ----------
  const bananaToggle = qs('#nano-banana-toggle');
  const setNanoBanana = (enabled) => {
    body.classList.toggle('nano-banana', enabled);
    if (bananaToggle) bananaToggle.checked = enabled;
    localStorage.setItem('nanoBanana', String(enabled));
  };

  // ---------- initialization from storage ----------
  const storedTheme = localStorage.getItem('theme');
  const savedAccent = localStorage.getItem('accentColor');
  const savedPerf = localStorage.getItem('perfMode') === 'true';
  const savedMotion = localStorage.getItem('reduceMotion') === 'true';
  const savedBanana = localStorage.getItem('nanoBanana') === 'true';

  if (savedBanana) setNanoBanana(true);
  if (savedAccent) setAccent(savedAccent);
  if (storedTheme) {
    setTheme(storedTheme === 'light');
  } else {
    // No explicit choice yet. Deliberately leave both switches alone:
    // css/tokens.css already defaults to light and follows the OS via
    // prefers-color-scheme, while pages still on css/style.css keep their
    // existing dark default. Forcing either one here would flip a set of
    // pages into a theme they were not designed for.
    updateThemeIcon();
    updateThemeOptions();
  }
  setPerfMode(savedPerf);
  setReduceMotion(savedMotion);

  // ---------- event listeners ----------
  themeToggle?.addEventListener('click', () => setTheme(currentTheme() !== 'light'));

  // Dark/Light buttons inside the settings modal
  qsa('.theme-opt').forEach((opt) => {
    opt.addEventListener('click', () => setTheme(opt.dataset.theme === 'light'));
  });

  motionToggle?.addEventListener('change', (e) => setReduceMotion(e.target.checked));

  accentDots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const color = dot.dataset.color;
      if (color) setAccent(color);
    });
  });

  perfToggle?.addEventListener('change', (e) => setPerfMode(e.target.checked));
  bananaToggle?.addEventListener('change', (e) => setNanoBanana(e.target.checked));

  // ---------- mobile‑specific blur reduction ----------
  // We expose a CSS variable --mobile-blur that components.css reads.
  const updateMobileBlur = () => {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    root.style.setProperty('--mobile-blur', isMobile ? '8px' : '20px');
    // Increase background alpha to compensate for less blur
    root.style.setProperty('--mobile-bg-alpha', isMobile ? '0.85' : '0.7');
  };
  // Run on load and resize
  updateMobileBlur();
  window.addEventListener('resize', updateMobileBlur);
};