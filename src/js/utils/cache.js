/* src/js/utils/cache.js
   Populated once on DOMContentLoaded. All other modules receive this object
   to guarantee zero duplicate queries.
*/
export const createCachedElements = () => {
  // If you need to support IE11, replace with document.getElementById etc.
  const qs = (s) => document.querySelector(s);
  const qsa = (s) => document.querySelectorAll(s);

  return Object.freeze({
    // Layout containers
    body: qs('body'),
    html: qs('html'),
    root: qs(':root'),
    // Navbar / mobile
    navbar: qs('.navbar'),
    hamburger: qs('.hamburger'),
    mobileMenu: qs('.mobile-menu'),
    // Theme controls
    themeToggle: qs('#theme-toggle'),
    perfToggle: qs('#perf-mode'),
    // Accent dots (for colour picker)
    accentDots: qsa('.accent-dot'),
    // Commonly used sections
    hero: qs('#hero'),
    about: qs('#about'),
    projectsSection: qs('#projects'),
    vaultContainer: qs('#vault'), // will be populated by vault modules
    footer: qs('footer'),
    // Utility
    qs,
    qsa,
  });
};