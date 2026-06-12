/* src/js/modules/navbar.js
   Toggles .scrolled class on the navbar using a scheduled animation frame
   to avoid layout thrash.
*/
export const initNavbar = (cached) => {
  const { navbar, on } = cached;
  if (!navbar) return;

  let ticking = false;
  const update = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
    ticking = false;
  };
  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  };
  on(window, 'scroll', onScroll, { passive: true });
  update();
};