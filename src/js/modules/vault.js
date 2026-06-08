import { trackVaultItemClick } from '../services/analytics.js?v=1.0';
import { qs, qsa, on } from '../utils/dom.js?v=1.1';

export function initVaultSearch() {
  const vaultGrid = qs('.vault-grid');
  if (!vaultGrid) return;

  const searchBar = document.createElement('input');
  searchBar.type = 'text';
  searchBar.className = 'vault-search';
  searchBar.placeholder = 'Search vault items...';
  searchBar.setAttribute('aria-label', 'Search knowledge vault');
  vaultGrid.parentNode.insertBefore(searchBar, vaultGrid);

  const categories = ['All', 'Prompts', 'Code', 'Archive', 'Media', 'Docs', 'API'];
  const filterContainer = document.createElement('div');
  filterContainer.className = 'vault-filters';
  filterContainer.innerHTML = categories.map(cat => 
    `<button class="vault-filter-btn ${cat === 'All' ? 'active' : ''}" data-filter="${cat.toLowerCase()}">${cat}</button>`
  ).join('');
  vaultGrid.parentNode.insertBefore(filterContainer, vaultGrid);

  let favorites = JSON.parse(localStorage.getItem('vaultFavorites') || '[]');
  
  const favBtn = document.createElement('button');
  favBtn.className = 'vault-fav-toggle';
  favBtn.innerHTML = '<i class="fas fa-heart"></i> Favorites';
  favBtn.setAttribute('aria-label', 'Toggle favorites view');
  filterContainer.appendChild(favBtn);

  let showFavoritesOnly = false;

  on(searchBar, 'input', () => {
    filterItems();
  });

  qsa('.vault-filter-btn').forEach(btn => {
    on(btn, 'click', () => {
      qsa('.vault-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterItems();
    });
  });

  on(favBtn, 'click', () => {
    showFavoritesOnly = !showFavoritesOnly;
    favBtn.classList.toggle('active');
    filterItems();
  });

  qsa('.vault-item').forEach(item => {
    const link = item.getAttribute('href');
    const isFav = favorites.includes(link);
    
    const starBtn = document.createElement('button');
    starBtn.className = `vault-star ${isFav ? 'active' : ''}`;
    starBtn.innerHTML = '<i class="fas fa-star"></i>';
    starBtn.setAttribute('aria-label', isFav ? 'Remove from favorites' : 'Add to favorites');
    starBtn.setAttribute('data-link', link);
    item.style.position = 'relative';
    item.appendChild(starBtn);

    on(starBtn, 'click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const href = starBtn.dataset.link;
      const idx = favorites.indexOf(href);
      if (idx > -1) {
        favorites.splice(idx, 1);
        starBtn.classList.remove('active');
        starBtn.setAttribute('aria-label', 'Add to favorites');
      } else {
        favorites.push(href);
        starBtn.classList.add('active');
        starBtn.setAttribute('aria-label', 'Remove from favorites');
      }
      localStorage.setItem('vaultFavorites', JSON.stringify(favorites));
    });
  });

  qsa('.vault-item').forEach(item => {
    on(item, 'click', () => {
      const name = item.querySelector('h3')?.textContent || 'Unknown';
      const category = item.querySelector('h3')?.textContent?.toLowerCase() || 'unknown';
      trackVaultItemClick(name, category);
    });
  });

  function filterItems() {
    const query = searchBar.value.toLowerCase();
    const activeFilter = qs('.vault-filter-btn.active')?.dataset?.filter || 'all';
    
    qsa('.vault-item').forEach(item => {
      const title = item.querySelector('h3')?.textContent?.toLowerCase() || '';
      const desc = item.querySelector('p')?.textContent?.toLowerCase() || '';
      const text = title + ' ' + desc;
      const matchesSearch = text.includes(query);
      const matchesCategory = activeFilter === 'all' || title.includes(activeFilter);
      const isFav = favorites.includes(item.getAttribute('href'));
      const matchesFav = !showFavoritesOnly || isFav;

      if (matchesSearch && matchesCategory && matchesFav) {
        item.style.display = '';
      } else {
        item.style.display = 'none';
      }
    });
  }
}
