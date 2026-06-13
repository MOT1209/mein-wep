const FALLBACK_MEDIA = [
  { title: 'Platform Overview', type: 'video', url: '', description: 'Overview of the Rashid ecosystem and features (video coming soon)' },
  { title: 'KingCraft Gameplay', type: 'video', url: '', description: 'Walkthrough of KingCraft 3D voxel sandbox (video coming soon)' },
  { title: 'Rashid AI Demo', type: 'video', url: '', description: 'AI assistant features and capabilities demo (video coming soon)' },
];

export const initSection = async (cached) => {
  const { qs } = cached;
  const container = qs('#vault-media');
  if (!container) return;

  const render = (items) => {
    container.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'vault-section-grid vault-media-grid';
    items.forEach((it) => {
      const card = document.createElement('div');
      card.className = 'vault-card vault-media-card';
      const hasSource = it.type === 'video' && it.url;
      card.innerHTML = `
        <div class="vault-card-body">
          <h4>${escapeHtml(it.title)}</h4>
          ${hasSource ? `
            <div class="vault-media-wrapper">
              <video controls preload="metadata" poster="${escapeAttr(it.thumbnail || '')}" class="vault-video">
                <source src="${escapeAttr(it.url)}" type="${escapeAttr(it.mimeType || 'video/mp4')}">
              </video>
            </div>` : `
            <div class="vault-media-placeholder">
              <i class="fas fa-video"></i>
              <span>${escapeHtml(it.description || 'Content coming soon')}</span>
            </div>`}
          ${it.description && !hasSource ? '' : it.description ? `<p class="vault-desc">${escapeHtml(it.description)}</p>` : ''}
        </div>`;
      grid.appendChild(card);
    });
    container.appendChild(grid);
  };

  try {
    const { data, error } = await window.__supabase.fetchPublic('media', {
      order: { column: 'sort_order', ascending: true }
    });
    if (error || !data?.length) { render(FALLBACK_MEDIA); return; }
    render(data);
  } catch { render(FALLBACK_MEDIA); }
};

function escapeHtml(str) {
  return str.replace(/[&<>"']/g,
    (m) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;" }[m]));
}
function escapeAttr(str) {
  return String(str || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
