import { initAnimations, initSmoothScroll } from './modules/animations.js?v=1.1';
import { initAdminContentControls } from './modules/admin-content.js?v=1.1';
import { initMobileMenu } from './modules/mobile.js?v=1.1';
import { initNavbar } from './modules/navbar.js?v=1.1';
import { initProjectFilters, initProjects } from './modules/projects.js?v=1.5';
import { initSettings } from './modules/settings.js?v=1.1';
import { initTheme } from './modules/theme.js?v=1.1';
import { initAnalytics, trackContactFormSubmit } from './services/analytics.js?v=1.0';
import { incrementVisitorCount } from './services/supabase.js?v=1.5';
import { qs, qsa, on } from './utils/dom.js?v=1.1';
import {
    initTypewriter,
    initTechStackMarquee,
    initLiveStats,
    initTestimonials,
    initProjectModal,
    initCustomPwaInstall,
    initScrollProgress
} from './modules/enhancements.js?v=1.0';
import { initLatestUpdates } from './modules/updates.js?v=1.0';
import { initStatistics } from './modules/statistics.js?v=1.0';
import { initVaultSearch } from './modules/vault.js?v=1.0';

function initLegacyLocalSettings() {
    if (localStorage.getItem('maintenanceMode') === 'true') {
        document.body.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;background:#000;color:#fff;font-family:sans-serif;flex-direction:column;"><h1>System Under Maintenance</h1><p>We will be back shortly.</p></div>';
        return false;
    }

    const savedContent = JSON.parse(localStorage.getItem('siteContent') || '{}');
    if (savedContent.title) {
        const heroSubtitle = qs('.hero-subtitle');
        if (heroSubtitle) heroSubtitle.innerText = savedContent.title;
    }
    if (savedContent.about) {
        const aboutP = qs('#about p') || qs('.about-text p');
        if (aboutP) aboutP.innerText = savedContent.about;
    }

    const savedSettings = JSON.parse(localStorage.getItem('siteSettings') || '{}');
    const contactSpans = qsa('.contact-info span');
    if (savedSettings.email && contactSpans[0]) contactSpans[0].innerText = savedSettings.email;
    if (savedSettings.location && contactSpans[1]) contactSpans[1].innerText = savedSettings.location;
    return true;
}

function initContactForm() {
    const contactForm = qs('.contact-form');
    if (!contactForm) return;

    on(contactForm, 'submit', (event) => {
        event.preventDefault();
        const name = contactForm.querySelector('input[type="text"]')?.value || '';
        const email = contactForm.querySelector('input[type="email"]')?.value || '';
        const msg = contactForm.querySelector('textarea')?.value || '';
        const messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
        messages.push({ name, email, message: msg, date: new Date().toLocaleString() });
        localStorage.setItem('contactMessages', JSON.stringify(messages));
        alert('Message Sent! (See Admin Dashboard)');
        trackContactFormSubmit();
        contactForm.reset();
    });
}

function initVisitorCounter() {
    const visits = parseInt(localStorage.getItem('visitorCount') || '0', 10);
    if (sessionStorage.getItem('logged')) return;
    localStorage.setItem('visitorCount', String(visits + 1));
    sessionStorage.setItem('logged', 'true');
    incrementVisitorCount();
}

async function boot() {
    initAnalytics();
    initTheme();
    initNavbar();
    initSettings();
    initProjectFilters();
    initMobileMenu();
    initAnimations();
    initSmoothScroll();
    initAdminContentControls();
    
    // Rashid Web v4.0 Enhancements
    initTypewriter();
    initTechStackMarquee();
    initLiveStats();
    initTestimonials();
    initProjectModal();
    initCustomPwaInstall();
    initScrollProgress();

    // Latest Updates & Statistics
    initLatestUpdates();
    initStatistics();

    // Vault Search & Filters
    initVaultSearch();

    if (!initLegacyLocalSettings()) return;

    await initProjects();
    initContactForm();
    initVisitorCounter();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
} else {
    boot();
}
