/* src/vault/images.js
   Images Section – responsive grid with native lazy loading.
*/
export const initSection = (cached) => {
  const { qs, qsa } = cached;
  const container = qs('#vault-images');
  if (!container) return;

  const render = (images) => {
    container.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'row g-3';
    images.forEach((img) => {
      const col = document.createElement('div');
      col.className = 'col-12 col-sm-6 col-md-4 col-lg-3';
      const figure = document.createElement('figure');
      figure.className = 'mb-0';
      const imgEl = document.createElement('img');
      imgEl.className = 'img-fluid rounded';
      imgEl.src = img.url;
      imgEl.alt = img.description || '';
      imgEl.loading = 'lazy';
      figure.appendChild(imgEl);
      if (img.description) {
        const figcap = document.createElement('figcaption');
        figcap.className = 'text-center mt-1 small text-muted';
        figcap.innerText = img.description;
        figure.appendChild(figcap);
      }
      col.appendChild(figure);
      grid.appendChild(col);
    });
    container.appendChild(grid);
  };

  (async () => {
    const { data, error } = await window.__supabase.fetchPublic('images', {
      order: { column: 'sort_order', ascending: true }
    });
    if (error) {
      console.error('Failed to load images', error);
      container.innerHTML = '<p class="text-danger">Could not load images.</p>';
      return;
    }
    render(data ?? []);
  })();
};

/* Helper utilities */
function qs(s, root = document) { return root.querySelector(s); }
function qsa(s, root = document) { return root.querySelectorAll(s); }