/* src/vault/codes.js
   Codes Section – shows programming snippets.
   Features:
     • Code wrapped in <pre><code> with overflow-x:auto
     • Optional language class for highlighting (if you use Prism/Highlight.js)
*/
export const initSection = (cached) => {
  const { qs, qsa } = cached;
  const container = qs('#vault-codes');
  if (!container) return;

  const render = (snippets) => {
    container.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'row g-4';
    snippets.forEach((snip) => {
      const col = document.createElement('div');
      col.className = 'col-12 col-sm-6 col-md-4 col-lg-3';
      const card = document.createElement('div');
      card.className = 'card h-100';
      const body = document.createElement('div');
      body.className = 'card-body d-flex flex-column';

      const title = document.createElement('h5');
      title.className = 'card-title';
      title.innerText = snip.title;
      body.appendChild(title);

      const codeWrapper = document.createElement('div');
      codeWrapper.className = 'ratio ratio-1x1 mb-2';
      codeWrapper.innerHTML = `
        <pre class="mb-0"><code class="language-${snip.language || 'plaintext'} p-2">${escapeHtml(snip.code)}</code></pre>`;
      body.appendChild(codeWrapper);

      if (snip.description) {
        const desc = document.createElement('p');
        desc.className = 'card-text small text-muted';
        desc.innerText = snip.description;
        body.appendChild(desc);
      }

      card.appendChild(body);
      col.appendChild(card);
      grid.appendChild(col);
    });
    container.appendChild(grid);
  };

  (async () => {
    const { data, error } = await window.__supabase.fetchPublic('codes', {
      order: { column: 'sort_order', ascending: true }
    });
    if (error) {
      console.error('Failed to load codes', error);
      container.innerHTML = '<p class="text-danger">Could not load code snippets.</p>';
      return;
    }
    render(data ?? []);
  })();
};

/* Helper utilities */
function qs(s, root = document) { return root.querySelector(s); }
function qsa(s, root = document) { return root.querySelectorAll(s); }
function escapeHtml(str) {
  return str.replace(/[&<>"']/g,
    (m) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;" }[m]));
}