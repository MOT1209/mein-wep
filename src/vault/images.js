const FALLBACK_IMAGES = [
  { url: 'images/screenshots/kingcraft.svg', description: 'KingCraft — 3D voxel sandbox world' },
  { url: 'images/screenshots/rust-construction.svg', description: 'Rust Construction — physics sandbox' },
  { url: 'images/screenshots/farm-empire.svg', description: 'Farm Empire — farming simulation' },
  { url: 'images/screenshots/rashid-ai.svg', description: 'Rashid AI — conversational assistant' },
  { url: 'images/screenshots/default.svg', description: 'Project showcase placeholder' },
];

export const initSection = async (cached) => {
  const { qs } = cached;
  const container = qs('#vault-images');
  if (!container) return;

  const render = (images) => {
    container.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'vault-section-grid vault-images-grid';
    images.forEach((img) => {
      const figure = document.createElement('figure');
      figure.className = 'vault-image-figure';
      figure.innerHTML = `
        <img src="${escapeAttr(img.url)}" alt="${escapeAttr(img.description || '')}" loading="lazy" class="vault-img">
        ${img.description ? `<figcaption>${escapeHtml(img.description)}</figcaption>` : ''}`;
      grid.appendChild(figure);
    });
    container.appendChild(grid);
  };

  try {
    const { data, error } = await window.__supabase.fetchPublic('images', {
      order: { column: 'sort_order', ascending: true }
    });
    if (error || !data?.length) { render(FALLBACK_IMAGES); return; }
    render(data);
  } catch { render(FALLBACK_IMAGES); }
};

function escapeHtml(str) {
  return str.replace(/[&<>"']/g,
    (m) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;" }[m]));
}
function escapeAttr(str) {
  return String(str || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
