import { qsa, on } from '../utils/dom.js?v=1.1';

export function initAnimations() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        qsa('.reveal').forEach(el => el.classList.add('active'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    qsa('.reveal').forEach(el => observer.observe(el));
    window.fromlitenRevealObserver = observer;
}

export function initSmoothScroll() {
    qsa('a[href^="#"]').forEach(anchor => {
        on(anchor, 'click', (event) => {
            const targetId = anchor.getAttribute('href');
            if (!targetId || targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (!targetElement) return;
            event.preventDefault();
            const top = targetElement.getBoundingClientRect().top + window.pageYOffset - 70;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });
}
