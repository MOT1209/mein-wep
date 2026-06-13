const FALLBACK_CODES = [
  { title: 'fetchWrapper.js', language: 'javascript', code: 'const fetchWrapper = async (url, options = {}) => {\n  const res = await fetch(url, {\n    headers: { "Content-Type": "application/json", ...options.headers },\n    ...options\n  });\n  if (!res.ok) throw new Error(`HTTP ${res.status}`);\n  return res.json();\n};', description: 'Reusable fetch wrapper with error handling' },
  { title: 'debounce util', language: 'javascript', code: 'function debounce(fn, delay = 300) {\n  let timer;\n  return (...args) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), delay);\n  };\n}', description: 'Performance utility for input/search handlers' },
  { title: 'css-glassmorphism', language: 'css', code: '.glass {\n  background: rgba(255,255,255,0.05);\n  backdrop-filter: blur(16px);\n  -webkit-backdrop-filter: blur(16px);\n  border: 1px solid rgba(255,255,255,0.1);\n  border-radius: 16px;\n}', description: 'Glassmorphism card component' },
  { title: 'throttle util', language: 'javascript', code: 'function throttle(fn, limit = 100) {\n  let inThrottle;\n  return (...args) => {\n    if (!inThrottle) {\n      fn(...args);\n      inThrottle = true;\n      setTimeout(() => { inThrottle = false; }, limit);\n    }\n  };\n}', description: 'Limits function calls for scroll/resize events' },
];

export const initSection = async (cached) => {
  const { qs, qsa } = cached;
  const container = qs('#vault-codes');
  if (!container) return;

  const render = (snippets) => {
    container.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'vault-section-grid';
    snippets.forEach((snip) => {
      const card = document.createElement('div');
      card.className = 'vault-card vault-code-card';
      card.innerHTML = `
        <div class="vault-card-body">
          <div class="vault-code-header">
            <h4>${escapeHtml(snip.title)}</h4>
            <span class="vault-lang-badge">${escapeHtml(snip.language || 'text')}</span>
          </div>
          <pre class="vault-pre"><code>${escapeHtml(snip.code)}</code></pre>
          ${snip.description ? `<p class="vault-desc">${escapeHtml(snip.description)}</p>` : ''}
          <button class="vault-copy-btn" data-copy="${escapeHtml(snip.code)}">
            <i class="fas fa-copy"></i> Copy Code
          </button>
        </div>`;
      grid.appendChild(card);
    });
    container.appendChild(grid);
    qsa('.vault-copy-btn', container).forEach((btn) => {
      btn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(btn.dataset.copy);
          btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
          setTimeout(() => { btn.innerHTML = '<i class="fas fa-copy"></i> Copy Code'; }, 2000);
        } catch { /* fallback */ }
      });
    });
  };

  try {
    const { data, error } = await window.__supabase.fetchPublic('codes', {
      order: { column: 'sort_order', ascending: true }
    });
    if (error || !data?.length) { render(FALLBACK_CODES); return; }
    render(data);
  } catch { render(FALLBACK_CODES); }
};

function escapeHtml(str) {
  return str.replace(/[&<>"']/g,
    (m) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;" }[m]));
}
