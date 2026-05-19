import { qs, on, scheduleFrame } from '../utils/dom.js?v=1.1';

export function initNavbar() {
    const navbar = qs('.navbar');
    if (!navbar) return;

    const updateNavbar = scheduleFrame(() => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });

    on(window, 'scroll', updateNavbar, { passive: true });
    updateNavbar();
}
