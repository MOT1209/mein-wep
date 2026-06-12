/* src/vault/prompts.js
   Prompts Section – shows custom AI prompts.
   Features:
     • One‑click copy to clipboard (Navigator.clipboard)
     • Minimal toast notification on success
*/
export const initSection = (cached) => {
  const { qs, qsa } = cached;

  const container = qs('#vault-prompts');
  if (!container) return;

  // Helper to create a toast
  const showToast = (msg) => {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = msg;
    document.body.appendChild(toast);
    // Trigger reflow for animation
    toast.offsetHeight;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
      toast.addEventListener('transitionend', () => toast.remove());
    }, 3000);
  };

  // Render function
  const render = (prompts) => {
    container.innerHTML = ''; // clear
    const grid = document.createElement('div');
    grid.className = 'row g-4';
    prompts.forEach((p) => {
      const col = document.createElement('div');
      col.className = 'col-12 col-sm-6 col-md-4 col-lg-3';
      const card = document.createElement('div');
      card.className = 'card h-100';
      card.innerHTML = `
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${escapeHtml(p.title)}</h5>
          <p class="card-text flex-grow-1">${escapeHtml(p.content)}</p>
          <button class="btn btn-sm btn-outline-secondary mt-2 copy-btn"
                  data-prompt="${escapeHtml(p.content)}">
            📋 Copy
          </button>
        </div>`;
      col.appendChild(card);
      grid.appendChild(col);
    });
    container.appendChild(grid);
    // attach copy listeners
    qsa('.copy-btn', container).forEach((btn) => {
      btn.addEventListener('click', async () => {
        const text = btn.dataset.prompt;
        try {
          await navigator.clipboard.writeText(text);
          showToast('Prompt copied!');
        } catch (err) {
          console.error('Clipboard write failed', err);
          showToast('Copy failed – see console');
        }
      });
    });
  };

  // Fetch from Supabase
  (async () => {
    const { data, error } = await window.__supabase.fetchPublic('prompts', {
      order: { column: 'sort_order', ascending: true }
    });
    if (error) {
      console.error('Failed to load prompts', error);
      container.innerHTML = '<p class="text-danger">Could not load prompts.</p>';
      return;
    }
    render(data ?? []);
  })();
};

/* ---- tiny DOM helpers (should already be on window via main.js, but define locally) ---- */
function qs(s, root = document) {
  return root.querySelector(s);
}
function qsa(s, root = document) {
  return root.querySelectorAll(s);
}
function escapeHtml(str) {
  return str.replace(/[&<>"']/g,
    (m) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;" }[m]));
}