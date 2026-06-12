/* src/vault/media.js
   Media Section – responsive embeds for video/audio.
   Uses native <video> and <audio> controls with preload="metadata".
*/
export const initSection = (cached) => {
  const { qs, qsa } = cached;
  const container = qs('#vault-media');
  if (!container) return;

  const render = (items) => {
    container.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'row g-4';
    items.forEach((it) => {
      const col = document.createElement('div');
      col.className = 'col-12 col-sm-6 col-md-4';
      let mediaEl = '';
      if (it.type === 'video') {
        mediaEl = `
          <video controls preload="metadata" class="w-100 rounded" poster="${it.thumbnail || ''}">
            <source src="${it.url}" type="${it.mimeType || 'video/mp4'}">
            Your browser does not support the video tag.
          </video>`;
      } else if (it.type === 'audio') {
        mediaEl = `
          <audio controls preload="metadata" class="w-100">
            <source src="${it.url}" type="${it.mimeType || 'audio/mpeg'}">
            Your browser does not support the audio element.
          </audio>`;
      }
      const card = document.createElement('div');
      card.className = 'card h-100';
      card.innerHTML = `
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${escapeHtml(it.title)}</h5>
          <div class="flex-grow-1">${mediaEl}</div>
          ${it.description ? `<p class="card-text small text-muted mt-2">${escapeHtml(it.description)}</p>` : ''}
        </div>`;
      col.appendChild(card);
      grid.appendChild(col);
    });
    container.appendChild(grid);
  };

  (async () => {
    const { data, error } = await window.__supabase.fetchPublic('media', {
      order: { column: 'sort_order', ascending: true }
    });
    if (error) {
      console.error('Failed to load media', error);
      container.innerHTML = '<p class="text-danger">Could not load media.</p>';
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