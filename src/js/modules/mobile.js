import { qs, qsa, on } from '../utils/dom.js?v=1.1';

export function initMobileMenu() {
    const hamburger = qs('.hamburger');
    const mobileMenu = qs('.mobile-menu');
    const bars = qsa('.bar');
    if (!hamburger || !mobileMenu) return;

    function setOpen(open) {
        mobileMenu.classList.toggle('active', open);
        hamburger.setAttribute('aria-expanded', String(open));
        if (bars.length >= 3) {
            bars[0].style.transform = open ? 'rotate(-45deg) translate(-5px, 6px)' : 'none';
            bars[1].style.opacity = open ? '0' : '1';
            bars[2].style.transform = open ? 'rotate(45deg) translate(-5px, -6px)' : 'none';
        }
    }

    on(hamburger, 'click', () => setOpen(!mobileMenu.classList.contains('active')));
    qsa('.mobile-menu a').forEach(link => on(link, 'click', () => setOpen(false)));
}
