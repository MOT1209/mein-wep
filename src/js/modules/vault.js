import { trackVaultItemClick } from '../services/analytics.js';
import { qs, qsa, on } from '../utils/dom.js';

export function initVaultSearch() {
  const vaultGrid = qs('.vault-grid');
  if (!vaultGrid) return;

  const searchInput = qs('.vault-toolbar .vault-search');
  const filterBtns = qsa('.vault-filter');

  if (!filterBtns.length && !searchInput) return;

  if (searchInput) {
    on(searchInput, 'input', filterItems);
  }

  filterBtns.forEach(btn => {
    on(btn, 'click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterItems();
    });
  });

  vaultGrid.querySelectorAll('.vault-card').forEach(card => {
    on(card, 'click', () => {
      const name = card.querySelector('h4')?.textContent || 'Unknown';
      const cat = card.dataset.category || 'unknown';
      trackVaultItemClick(name, cat);
    });
  });

  function filterItems() {
    const query = searchInput ? searchInput.value.toLowerCase() : '';
    const activeFilter = (qs('.vault-filter.active') || filterBtns[0])?.dataset?.filter || 'all';

    vaultGrid.querySelectorAll('.vault-card').forEach(card => {
      const title = card.querySelector('h4')?.textContent?.toLowerCase() || '';
      const desc = card.querySelector('p')?.textContent?.toLowerCase() || '';
      const category = card.dataset.category || '';
      const text = title + ' ' + desc;
      const matchesSearch = !query || text.includes(query);
      const matchesCategory = activeFilter === 'all' || category === activeFilter;
      const show = matchesSearch && matchesCategory;
      card.style.display = show ? '' : 'none';
    });
  }
}
