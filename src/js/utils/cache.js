/* src/js/utils/cache.js
   Populated once on DOMContentLoaded. All other modules receive this object
   to guarantee zero duplicate queries.
*/
export const createCachedElements = () => {
  const qs = (s) => document.querySelector(s);
  const qsa = (s) => document.querySelectorAll(s);
  const on = (target, evt, handler, opts) => {
    if (target && typeof target.addEventListener === 'function') {
      target.addEventListener(evt, handler, opts);
    }
  };

  return Object.freeze({
    body: qs('body'),
    html: qs('html'),
    root: qs(':root'),
    navbar: qs('.navbar'),
    hamburger: qs('.hamburger'),
    mobileMenu: qs('.mobile-menu'),
    themeToggle: qs('#theme-toggle'),
    perfToggle: qs('#perf-mode'),
    accentDots: qsa('.accent-dot'),
    hero: qs('#hero'),
    about: qs('#about'),
    projectsSection: qs('#projects'),
    vaultContainer: qs('#vault'),
    footer: qs('footer'),
    qs,
    qsa,
    on,
  });
};