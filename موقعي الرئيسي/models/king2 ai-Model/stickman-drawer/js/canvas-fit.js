// Sizes a canvas to fill its parent box reliably, retrying with rAF until
// layout has actually settled (parent width can read 0 for a frame or two
// right after page load), then keeps it in sync via ResizeObserver + window
// resize/orientationchange (belt-and-suspenders: some environments don't
// fire the observer's first callback).
export function fitCanvasToParent(canvas, onResize) {
  let destroyed = false;

  function apply() {
    if (destroyed) return;
    const box = canvas.parentElement.getBoundingClientRect();
    if (box.width < 1 || box.height < 1) return false;
    const dpr = window.devicePixelRatio || 1;
    const cssW = Math.round(box.width);
    const cssH = Math.round(box.height);
    const prevW = canvas.width;
    const prevH = canvas.height;
    canvas.style.width = cssW + 'px';
    canvas.style.height = cssH + 'px';
    canvas.width = cssW * dpr;
    canvas.height = cssH * dpr;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (onResize) onResize({ cssW, cssH, dpr, resized: prevW !== canvas.width || prevH !== canvas.height });
    return true;
  }

  function ensureFit(attempt = 0) {
    if (destroyed) return;
    if (apply()) return;
    if (attempt < 40) requestAnimationFrame(() => ensureFit(attempt + 1));
  }

  const ro = new ResizeObserver(apply);
  ro.observe(canvas.parentElement);
  const onResizeHandler = apply;
  const onOrientHandler = apply;
  window.addEventListener('resize', onResizeHandler);
  window.addEventListener('orientationchange', onOrientHandler);
  ensureFit();

  return function destroy() {
    destroyed = true;
    ro.disconnect();
    window.removeEventListener('resize', onResizeHandler);
    window.removeEventListener('orientationchange', onOrientHandler);
  };
}
