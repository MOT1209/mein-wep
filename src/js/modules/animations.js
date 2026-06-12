/* src/js/modules/animations.js
   • Scroll‑based reveal using Intersection Observer (unchanged)
   • All time‑based UI transitions (e.g., fading modals) are driven by
     requestAnimationFrame to keep 60 fps even under load.
   • Prefers‑reduced‑motion respected.
*/
import { qsa, on } from '../utils/dom.js?v=1.1';

export const initAnimations = (cached) => {
  const { qsa } = cached;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    qsa('.reveal').forEach((el) => el.classList.add('active'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
  );
  qsa('.reveal').forEach((el) => observer.observe(el));
  // expose for debugging if needed
  window.RashidRevealObserver = observer;
};

/**
 * Generic rAF‑based tween utility.
 * @param {number} durationMs – total time
 * @param {Function} stepFn – called with progress (0‑1) on each frame
 * @param {Function} [doneFn] – called when finished
 */
export const animate = (durationMs, stepFn, doneFn) => {
  const start = performance.now();
  const frame = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / durationMs, 1);
    stepFn(progress);
    if (progress < 1) requestAnimationFrame(frame);
    else if (doneFn) doneFn();
  };
  requestAnimationFrame(frame);
};