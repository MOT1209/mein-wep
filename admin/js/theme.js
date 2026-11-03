// Applies the site's saved theme before first paint (same `theme` key the
// public site's toggle writes). Kept as a file so admin pages need no inline
// script under their strict Content-Security-Policy.
try {
  var t = localStorage.getItem('theme');
  if (t === 'dark' || t === 'light') document.documentElement.setAttribute('data-theme', t);
} catch (e) { /* storage blocked: the OS setting applies */ }
