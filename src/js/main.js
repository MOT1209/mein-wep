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
import { incrementVisitorCount, submitContactMessage, countProjects } from './services/supabase.js';
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
import { initAdmin, initVaultLock } from './modules/admin.js';

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

  // 3️⃣ Admin (session based)
  initAdmin();

  // 4️⃣ Core UI
  initTheme(cached);
  initNavbar(cached);
  // initMobileMenu(cached); — handled by inline script for new HTML structure
  initAnimations(cached);

  // 5️⃣ Optional enhancements (keep existing)
  initAnalytics();
  initSettings();
  initProjectFilters();
  initProjects(); // fetches & renders projects

  // 6️⃣ Vault (now rendered by vault.js module)
  initVaultSearch();
  initVaultLock();

  // 6b️⃣ Animate skills progress bars when section is visible
  const skillsSection = qs('#skills');
  if (skillsSection) {
    const fills = skillsSection.querySelectorAll('.sk-progress-fill');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      fills.forEach((f) => { f.style.width = f.style.width || '0%'; });
    } else {
      const skillsObs = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            skillsObs.disconnect();
            fills.forEach((f, i) => {
              const target = f.getAttribute('data-width') || '0%';
              setTimeout(() => { f.style.width = target; }, i * 60);
            });
          }
        });
      }, { threshold: 0.3 });
      skillsObs.observe(skillsSection);
      fills.forEach((f) => {
        const w = f.style.width || '0%';
        f.setAttribute('data-width', w);
        f.style.width = '0';
      });
    }
  }

  // 7️⃣ Misc
  initTypewriter();
  initTechStackMarquee();
  initLiveStats();
  initTestimonials();
  initProjectModal();
  initCustomPwaInstall();
  initScrollProgress();
  initLatestUpdates();
  initStatistics();
  const githubContainer = qs('#github-stats');
  if (githubContainer) {
    (window.requestIdleCallback
      ? window.requestIdleCallback.bind(window)
      : (cb) => setTimeout(cb, 1000))(() => renderGitHubStats(githubContainer), {
      timeout: 3000,
    });
  }

  // 8️⃣ Contact form & visitor counter
  const showToast = (message, type = 'success') => {
    const existing = qs('.ct-toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = `ct-toast ct-toast-${type}`;
    toast.textContent = message;
    toast.setAttribute('role', 'alert');
    const form = qs('.ct-form');
    if (form) form.parentNode.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  };

  const contactForm = qs('.ct-form');
  if (contactForm) {
    on(contactForm, 'submit', async (e) => {
      e.preventDefault();
      // Spam honeypot: real users never see/fill #ct-website. If filled, silently drop.
      if (contactForm.querySelector('#ct-website')?.value) {
        contactForm.reset();
        showToast('Message sent! I\'ll get back to you soon.', 'success');
        return;
      }
      const nameVal = contactForm.querySelector('#ct-name')?.value ?? '';
      const emailVal = contactForm.querySelector('#ct-email')?.value ?? '';
      const msgVal = contactForm.querySelector('#ct-msg')?.value ?? '';
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending...'; }
      // Deliver to owner's inbox via FormSubmit (no backend/API key) AND persist to Supabase.
      const emailDelivery = fetch('https://formsubmit.co/ajax/zwnt45602@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: nameVal,
          email: emailVal,
          message: msgVal,
          _subject: `New message from ${nameVal} — rashid-wep`,
          _template: 'table',
          _captcha: 'false'
        })
      }).then(r => r.ok).catch(() => false);
      const [{ error }, emailed] = await Promise.all([
        submitContactMessage(nameVal, emailVal, msgVal),
        emailDelivery
      ]);
      if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = 'Send Message <i class="fas fa-paper-plane"></i>'; }
      if (error && !emailed) {
        showToast('Saved locally — will sync when available.', 'info');
        const msgs = JSON.parse(localStorage.getItem('contactMessages') ?? '[]');
        msgs.push({ name: nameVal, email: emailVal, message: msgVal, date: new Date().toLocaleString() });
        localStorage.setItem('contactMessages', JSON.stringify(msgs));
        trackContactFormSubmit();
        contactForm.reset();
      } else {
        showToast('Message sent! I\'ll get back to you soon.', 'success');
        trackContactFormSubmit();
        contactForm.reset();
      }
    });
  }

  // 9️⃣ Dynamic numbers — replace hardcoded stats
  (async () => {
    const { count } = await countProjects();
    const repoCountEls = document.querySelectorAll('.hero-status-item:nth-child(3) span:last-child, .stat-box:nth-child(1) .stat-num');
    const projectCountEls = document.querySelectorAll('.hero-status-item:nth-child(2) span:last-child, .stat-box:nth-child(2) .stat-num');
    if (count !== null && count > 0) {
      projectCountEls.forEach(el => el.textContent = count + '+');
    }
    try {
      const r = await fetch('/api/github?endpoint=/users/MOT1209');
      if (r.ok) {
        const user = await r.json();
        if (user.public_repos) {
          repoCountEls.forEach(el => el.textContent = (user.public_repos > 15 ? user.public_repos : 15) + '+');
        }
      }
    } catch (_) {}
  })();

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