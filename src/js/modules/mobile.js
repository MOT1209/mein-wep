/* src/js/modules/mobile.js
   • Hamburger ↔ mobile menu toggle with ARIA and animated bars
   • Prevents iOS “jump” caused by address bar showing/hiding
     by setting 100vh to the actual viewport height via CSS custom property.
*/
export const initMobileMenu = (cached) => {
  const { hamburger, mobileMenu, qsa, qs } = cached;
  if (!hamburger || !mobileMenu) return;

  const bars = qsa('.bar');

  const setOpen = (open) => {
    mobileMenu.classList.toggle('active', open);
    hamburger.setAttribute('aria-expanded', String(open));
    if (bars.length >= 3) {
      bars[0].style.transform = open ? 'rotate(-45deg) translate(-5px,6px)' : 'none';
      bars[1].style.opacity = open ? '0' : '1';
      bars[2].style.transform = open ? 'rotate(45deg) translate(-5px,-6px)' : 'none';
    }
  };

  hamburger.addEventListener('click', () => setOpen(!mobileMenu.classList.contains('active')));
  qsa('.mobile-menu a').forEach((link) =>
    link.addEventListener('click', () => setOpen(false))
  );

  // ---------- viewport height unit fix (iOS Safari) ----------
  const setVhProperty = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };
  setVhProperty();
  window.addEventListener('resize', setVhProperty);
  window.addEventListener('orientationchange', setVhProperty);
};