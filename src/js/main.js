/* src/js/main.js
   Bootstraps the whole application:
     1. Creates the immutable DOM cache
     2. Initialises Supabase (client + auth listener)
     3. Starts theme, navbar, mobile, animations
     4. Lazy‑loads the four Vault sections
     5. Handles contact form, visitor counter, etc.
*/
import { createCachedElements } from './utils/cache.js';
import { initSupabase, onAuthStateChange, fetchPublic, subscribe } from './modules/supabase.js';
import { initTheme } from './modules/theme.js';
import { initNavbar } from './modules/navbar.js';
import { initMobileMenu } from './modules/mobile.js';
import { initAnimations } from './modules/animations.js';
import { initProjectFilters, initProjects } from './modules/projects.js';
import { initSettings } from './modules/settings.js';
import { initAnalytics, trackContactFormSubmit } from './services/analytics.js';
import { incrementVisitorCount, submitContactMessage } from './services/supabase.js';
import { qs, qsa, on } from './utils/dom.js';
import {
  initTypewriter,
  initTechStackMarquee,
  initLiveStats,
  initTestimonials,
  initProjectModal,
  initCustomPwaInstall,
  initScrollProgress,
} from './modules/enhancements.js';
import { initLatestUpdates } from './modules/updates.js';
import { initStatistics } from './modules/statistics.js';
import { initVaultSearch } from './modules/vault.js';
import { renderGitHubStats } from './modules/github.js';

let cached = null; // will be filled once DOM is ready
let authUnsubscribe = null;

/** Bootstrap after DOM is ready */
const boot = async () => {
  // 1️⃣ Build cache
  cached = createCachedElements();

  // 2️⃣ Supabase (client + auth)
  initSupabase(); // creates singleton client
  // expose a lightweight API for vault sections
  window.__supabase = { fetchPublic, subscribe };

  authUnsubscribe = onAuthStateChange((session) => {
    // React to auth state – e.g., show/hide admin UI
    document.documentElement.classList.toggle('user-logged-in', !!session);
    // You could also reload private data here if needed
  });

  // 3️⃣ Core UI
  initTheme(cached);
  initNavbar(cached);
  // initMobileMenu(cached); — handled by inline script for new HTML structure
  initAnimations(cached);

  // 4️⃣ Optional enhancements (keep existing)
  initAnalytics();
  initSettings();
  initProjectFilters();
  initProjects(); // fetches & renders projects

  // 5️⃣ Vault – lazy load each section when it enters viewport
  //    We'll use a simple IntersectionObserver for each container.
  const vaultContainers = {
    prompts: qs('#vault-prompts'),
    images: qs('#vault-images'),
    codes: qs('#vault-codes'),
    media: qs('#vault-media'),
  };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const section = entry.target.dataset.section; // we set this in HTML
      if (section && !window[`_${section}Loaded`]) {
        // Dynamically import the matching init function
        import(`../vault/${section}.js`)
          .then((mod) => mod.initSection(cached))
          .catch((err) => console.error(`Failed to load ${section} section`, err));
        window[`_${section}Loaded`] = true;
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -100px 0px' });

  Object.values(vaultContainers).forEach((el) => {
    if (el) {
      el.dataset.section = el.id.replace('vault-', ''); // e.g., prompts
      observer.observe(el);
    }
  });

  // 6️⃣ Misc
  initTypewriter();
  initTechStackMarquee();
  initLiveStats();
  initTestimonials();
  initProjectModal();
  initCustomPwaInstall();
  initScrollProgress();
  initLatestUpdates();
  initStatistics();
  initVaultSearch();
  const githubContainer = qs('#github-stats');
  if (githubContainer) {
    (window.requestIdleCallback
      ? window.requestIdleCallback.bind(window)
      : (cb) => setTimeout(cb, 1000))(() => renderGitHubStats(githubContainer), {
      timeout: 3000,
    });
  }

  // 7️⃣ Contact form & visitor counter
  const contactForm = qs('.ct-form');
  if (contactForm) {
    on(contactForm, 'submit', async (e) => {
      e.preventDefault();
      const nameVal = contactForm.querySelector('#ct-name')?.value ?? '';
      const emailVal = contactForm.querySelector('#ct-email')?.value ?? '';
      const msgVal = contactForm.querySelector('#ct-msg')?.value ?? '';
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending...'; }
      const { error } = await submitContactMessage(nameVal, emailVal, msgVal);
      if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = 'Send Message <i class="fas fa-paper-plane"></i>'; }
      if (error) {
        alert('Failed to send. Your message was saved locally.');
        const msgs = JSON.parse(localStorage.getItem('contactMessages') ?? '[]');
        msgs.push({ name: nameVal, email: emailVal, message: msgVal, date: new Date().toLocaleString() });
        localStorage.setItem('contactMessages', JSON.stringify(msgs));
      } else {
        alert('Message sent! I\'ll get back to you soon.');
        trackContactFormSubmit();
        contactForm.reset();
      }
    });
  }

  // Visitor counter (unchanged)
  const visits = parseInt(localStorage.getItem('visitorCount') ?? '0', 10);
  if (!sessionStorage.getItem('logged')) {
    localStorage.setItem('visitorCount', String(visits + 1));
    sessionStorage.setItem('logged', 'true');
    incrementVisitorCount();
  }
};

/** Run on ready state */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

/** Cleanup on page hide (e.g., SPA navigation) */
window.addEventListener('pagehide', () => {
  if (authUnsubscribe) authUnsubscribe();
});