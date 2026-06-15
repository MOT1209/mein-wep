import { qs, qsa, on } from '../utils/dom.js';
import { fetchVaultItems, saveVaultItemToDB, deleteVaultItemFromDB } from '../services/supabase.js';

/* ── Supabase field mapper ── */
function fromDB(item) {
  return {
    id: item.sort_order || Date.now(),
    supabaseId: item.id,
    title: item.title || '',
    description: item.description || '',
    category: item.category || 'prompts',
    tags: item.tags || [],
    content: item.content || '',
    fileUrl: item.file_url || '',
    fileType: item.file_type || '',
    icon: item.icon_class || 'fas fa-folder',
    locked: item.locked || false,
    sort_order: item.sort_order || 100,
    _fromDB: true,
  };
}

/* ── Vault Data Store ── */
const vaultStore = {
  items: [],
  nextId: 1,
  _loading: false,
  _loaded: false,

  async init(data) {
    this.items = data;
    this.nextId = data.length > 0 ? Math.max(...data.map(i => i.id)) + 1 : 1;
    this.save();
  },

  async loadFromSupabase() {
    this._loading = true;
    const { items, error } = await fetchVaultItems();
    if (!error && items && items.length > 0) {
      const mapped = items.map(fromDB);
      this.items = mapped;
      this.nextId = Math.max(...mapped.map(i => i.id), 0) + 1;
      this.save();
      this._loaded = true;
      this._loading = false;
      return true;
    }
    this._loading = false;
    return false;
  },

  add(item) {
    item.id = this.nextId++;
    const now = new Date().toISOString();
    item.createdAt = now;
    item.updatedAt = now;
    this.items.push(item);
    this.save();
    /* Try Supabase (async, non-blocking) */
    saveVaultItemToDB(item).then(result => {
      if (result.data && result.data.id) {
        item.supabaseId = result.data.id;
      }
    }).catch(() => {});
    return item;
  },

  update(id, data) {
    const idx = this.items.findIndex(i => i.id === id);
    if (idx === -1) return null;
    const item = this.items[idx];
    this.items[idx] = { ...item, ...data, updatedAt: new Date().toISOString() };
    this.save();
    /* Try Supabase */
    saveVaultItemToDB(this.items[idx]).catch(() => {});
    return this.items[idx];
  },

  delete(id) {
    const item = this.items.find(i => i.id === id);
    this.items = this.items.filter(i => i.id !== id);
    this.save();
    /* Try Supabase */
    if (item && item.supabaseId) {
      deleteVaultItemFromDB(item.supabaseId).catch(() => {});
    }
  },

  save() {
    try { localStorage.setItem('vault_items', JSON.stringify(this.items)); } catch {}
  },

  load() {
    try {
      const raw = localStorage.getItem('vault_items');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) {
          this.items = parsed;
          this.nextId = Math.max(...parsed.map(i => i.id), 0) + 1;
          return true;
        }
      }
    } catch {}
    return false;
  },

  getByCategory(cat) {
    if (cat === 'all') return [...this.items];
    return this.items.filter(i => i.category === cat);
  },

  search(query, cat) {
    const q = query.toLowerCase();
    let list = cat === 'all' ? [...this.items] : this.items.filter(i => i.category === cat);
    if (!q) return list;
    return list.filter(i =>
      i.title.toLowerCase().includes(q) ||
      i.description.toLowerCase().includes(q) ||
      (i.content || '').toLowerCase().includes(q) ||
      (i.tags || []).some(t => t.toLowerCase().includes(q))
    );
  }
};

/* ── Initial Data ── */
const FALLBACK_DATA = [
  { id: 0, title: 'System Prompt Engineer', description: 'Expert-level system prompt for coding assistants.', category: 'prompts', tags: ['gemini', 'system', 'coding'], content: 'You are a senior full-stack engineer with deep expertise in JavaScript, TypeScript, React, Node.js, and modern web APIs. Analyze the problem step by step, consider edge cases, and provide clean, well-structured solutions with proper error handling.', icon: 'fas fa-message', locked: false, createdAt: '', updatedAt: '' },
  { id: 0, title: 'Code Review Prompt', description: 'Review code for bugs, performance, and best practices.', category: 'prompts', tags: ['chatgpt', 'code-review', 'best-practices'], content: 'Review the following code for: 1) Logic errors and edge cases 2) Performance bottlenecks 3) Security vulnerabilities 4) Adherence to best practices. Provide specific line-by-line feedback.', icon: 'fas fa-code-review', locked: false, createdAt: '', updatedAt: '' },
  { id: 0, title: 'useDebounce Hook', description: 'React hook for debouncing values.', category: 'code', tags: ['react', 'hooks', 'javascript'], content: 'export function useDebounce(value, delay = 300) {\n  const [debounced, setDebounced] = useState(value);\n  useEffect(() => {\n    const id = setTimeout(() => setDebounced(value), delay);\n    return () => clearTimeout(id);\n  }, [value, delay]);\n  return debounced;\n}', icon: 'fas fa-code', locked: false, createdAt: '', updatedAt: '' },
  { id: 0, title: 'Fetch Wrapper', description: 'Typed fetch wrapper with error handling.', category: 'code', tags: ['typescript', 'api', 'utility'], content: 'export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {\n  const res = await fetch(url, {\n    headers: { "Content-Type": "application/json", ...init?.headers },\n    ...init\n  });\n  if (!res.ok) throw new Error(\`API error: \${res.status}\`);\n  return res.json();\n}', icon: 'fas fa-code', locked: false, createdAt: '', updatedAt: '' },
  { id: 0, title: 'Hero Gradient', description: 'Background gradient for hero sections.', category: 'media', tags: ['screenshots', 'brand', 'dark-mode'], content: '', fileUrl: '', fileType: 'image', icon: 'fas fa-image', locked: false, createdAt: '', updatedAt: '' },
  { id: 0, title: 'Logo Pack', description: 'Brand logos in multiple sizes.', category: 'media', tags: ['icons', 'brand', 'vector'], content: '', fileUrl: '', fileType: 'image', icon: 'fas fa-images', locked: false, createdAt: '', updatedAt: '' },
  { id: 0, title: 'Supabase Schema Guide', description: 'How to design RLS policies and tables.', category: 'docs', tags: ['supabase', 'database', 'guide'], content: '1. Define tables with proper foreign keys\n2. Enable RLS on every table\n3. Create policies with `security definer` where needed\n4. Use `auth.uid()` for user-specific access\n5. Test policies with anon and authenticated roles', icon: 'fas fa-book', locked: false, createdAt: '', updatedAt: '' },
  { id: 0, title: 'Deployment Checklist', description: 'Pre-deployment verification steps.', category: 'docs', tags: ['devops', 'vercel', 'pwa'], content: '□ Environment variables set\n□ Build passes\n□ Lighthouse > 90\n□ PWA manifest valid\n□ Sitemap submitted\n□ Analytics configured\n□ CSP headers correct', icon: 'fas fa-list-check', locked: false, createdAt: '', updatedAt: '' },
  { id: 0, title: 'Portfolio v1 Assets', description: 'Original design files from v1.', category: 'archives', tags: ['backup', 'legacy', 'v1'], content: '', fileUrl: '', fileType: 'zip', icon: 'fas fa-archive', locked: false, createdAt: '', updatedAt: '' },
  { id: 0, title: 'Old Blog Export', description: 'Blog posts archive from 2022-2023.', category: 'archives', tags: ['backup', 'blog', 'export'], content: '', fileUrl: '', fileType: 'zip', icon: 'fas fa-file-zipper', locked: false, createdAt: '', updatedAt: '' },
];

/* ── Render ── */
function escapeHtml(str) {
  if (!str) return '';
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function truncate(str, len = 120) {
  if (!str || str.length <= len) return str || '';
  return str.slice(0, len) + '…';
}

/* ── Copy to clipboard ── */
function copyText(text, label) {
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    showFlash(label || 'Copied!');
  }).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed'; ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showFlash(label || 'Copied!');
  });
}

function showFlash(msg) {
  const el = document.createElement('div');
  el.className = 'vault-flash';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1800);
}

/* ── Create item card ── */
function createCard(item) {
  const card = document.createElement('div');
  card.className = 'vault-card';
  card.dataset.category = item.category || 'prompts';
  card.dataset.itemId = item.id;

  let contentPreview = '';
  let actionBtn = '';

  switch (item.category) {
    case 'prompts':
      contentPreview = `<div class="vault-content-preview">${escapeHtml(truncate(item.content, 150))}</div>`;
      actionBtn = `<button class="vault-action-btn vault-copy-btn" data-copy="${escapeHtml(item.content || '')}"><i class="fas fa-copy"></i> Copy Prompt</button>`;
      break;
    case 'code':
      contentPreview = `<pre class="vault-code-preview">${escapeHtml(truncate(item.content, 130))}</pre>`;
      actionBtn = `<button class="vault-action-btn vault-copy-btn" data-copy="${escapeHtml(item.content || '')}"><i class="fas fa-copy"></i> Copy Code</button>`;
      break;
    case 'media':
      contentPreview = `<div class="vault-media-preview"><i class="fas fa-file-image"></i> <span>${escapeHtml(item.fileUrl || 'No file attached')}</span></div>`;
      actionBtn = item.fileUrl ? `<a href="${escapeHtml(item.fileUrl)}" class="vault-action-btn vault-download-btn" download target="_blank" rel="noopener"><i class="fas fa-download"></i> Download</a>` : '';
      break;
    case 'docs':
      contentPreview = `<div class="vault-content-preview">${escapeHtml(truncate(item.content, 150))}</div>`;
      actionBtn = item.content ? `<button class="vault-action-btn vault-copy-btn" data-copy="${escapeHtml(item.content)}"><i class="fas fa-copy"></i> Copy Content</button>` : '';
      break;
    case 'archives':
      actionBtn = item.fileUrl ? `<a href="${escapeHtml(item.fileUrl)}" class="vault-action-btn vault-download-btn" download target="_blank" rel="noopener"><i class="fas fa-download"></i> Download Archive</a>` : '';
      break;
  }

  /* Admin edit/delete buttons */
  const adminActions = window.__admin?.user
    ? `<div class="vault-card-actions admin-only">
        <button class="vault-card-btn" data-action="edit-vault" title="Edit"><i class="fas fa-pen"></i></button>
        <button class="vault-card-btn vault-card-btn-danger" data-action="delete-vault" title="Delete"><i class="fas fa-trash"></i></button>
      </div>`
    : '';

  card.innerHTML = `
    <div class="vault-card-icon"><i class="${escapeHtml(item.icon || 'fas fa-folder')}"></i></div>
    <div class="vault-card-body">
      <h4>${escapeHtml(item.title)}</h4>
      <p>${escapeHtml(item.description)}</p>
      <div class="vault-tags">${(item.tags || []).map(t => `<span class="vt">${escapeHtml(t)}</span>`).join('')}</div>
      ${contentPreview}
      <div class="vault-card-footer">${actionBtn}</div>
    </div>
    ${adminActions}`;

  if (item.locked) {
    const badge = document.createElement('div');
    badge.className = 'vault-lock-badge';
    badge.innerHTML = '<i class="fas fa-lock"></i>';
    card.appendChild(badge);
  }

  /* Copy button handler */
  const copyBtn = card.querySelector('.vault-copy-btn');
  if (copyBtn) {
    on(copyBtn, 'click', (e) => {
      e.stopPropagation();
      const text = copyBtn.dataset.copy;
      copyText(text, copyBtn.querySelector('span')?.textContent || 'Copied!');
    });
  }

  return card;
}

/* ── Render grid ── */
let currentFilter = 'prompts';
let currentQuery = '';

function renderGrid() {
  const grid = qs('#vault-grid');
  if (!grid) return;

  const items = vaultStore.search(currentQuery, currentFilter);
  grid.innerHTML = '';

  if (items.length === 0) {
    grid.innerHTML = `<div class="vault-empty">No items found in <strong>${currentFilter}</strong>. Click <strong>+ Add</strong> to add one.</div>`;
    return;
  }

  items.forEach(item => grid.appendChild(createCard(item)));

  /* Update section description */
  const desc = qs('#vault-section-desc');
  if (desc) {
    const labels = { prompts: 'Click Copy to save a prompt.', code: 'Click Copy to save a code snippet.', media: 'Download images and assets.', docs: 'Copy documentation content.', archives: 'Download archived files.' };
    desc.textContent = labels[currentFilter] || 'Click an item to copy, view, or download.';
  }

  /* Lock state re-apply */
  applyLockState();
}

/* ── Lock state ── */
function applyLockState() {
  const unlocked = sessionStorage.getItem('vault_unlocked') === 'true';
  qsa('.vault-card').forEach(card => {
    const lockBadge = card.querySelector('.vault-lock-badge');
    if (!lockBadge) return;
    card.style.position = 'relative';
    if (unlocked) {
      lockBadge.style.display = 'none';
      card.style.opacity = '1';
      card.style.pointerEvents = 'auto';
    } else {
      card.style.opacity = '0.5';
      card.style.pointerEvents = 'none';
    }
  });
}

/* ── Tab switching ── */
function switchTab(category) {
  currentFilter = category;
  const btns = qsa('.vault-filter');
  btns.forEach(b => {
    const isActive = b.dataset.filter === category;
    b.classList.toggle('active', isActive);
    b.setAttribute('aria-selected', isActive);
  });
  renderGrid();
}

/* ── Vault Modal ── */
let vaultModal = null;

function initVaultModal() {
  if (qs('#vault-modal')) return;
  vaultModal = document.createElement('div');
  vaultModal.id = 'vault-modal';
  vaultModal.className = 'admin-modal';
  vaultModal.innerHTML = `
    <div class="admin-modal-overlay"></div>
    <div class="admin-modal-content">
      <div class="admin-modal-header">
        <h3 id="vault-modal-title">Add to Vault</h3>
        <button class="admin-modal-close" data-action="close-modal"><i class="fas fa-xmark"></i></button>
      </div>
      <form class="admin-modal-form" id="vault-form">
        <div class="admin-field">
          <label for="vf-icon">Icon</label>
          <input type="text" id="vf-icon" class="admin-input" value="fas fa-folder" required>
        </div>
        <div class="admin-field">
          <label for="vf-title">Title</label>
          <input type="text" id="vf-title" class="admin-input" required placeholder="e.g. My Prompt">
        </div>
        <div class="admin-field">
          <label for="vf-desc">Description</label>
          <textarea id="vf-desc" class="admin-input" rows="2" placeholder="What is this?"></textarea>
        </div>
        <div class="admin-field">
          <label for="vf-tags">Tags <small>(comma separated)</small></label>
          <input type="text" id="vf-tags" class="admin-input" placeholder="js, react, api">
        </div>
        <div class="admin-field" id="vf-content-field">
          <label for="vf-content">Content <small>(for prompts, code, docs)</small></label>
          <textarea id="vf-content" class="admin-input" rows="4" placeholder="Paste text here..."></textarea>
        </div>
        <div class="admin-field" id="vf-file-field" style="display:none;">
          <label for="vf-file-url">File URL <small>(for media, archives)</small></label>
          <input type="text" id="vf-file-url" class="admin-input" placeholder="https://example.com/file.zip">
        </div>
        <div class="admin-field admin-only" id="vf-locked-field">
          <label class="admin-check">
            <input type="checkbox" id="vf-locked"> <span>Locked <i class="fas fa-lock"></i></span>
          </label>
        </div>
        <div class="admin-field">
          <label for="vf-category">Category</label>
          <select id="vf-category" class="admin-input">
            <option value="prompts">Prompts</option>
            <option value="code">Code</option>
            <option value="media">Media</option>
            <option value="docs">Docs</option>
            <option value="archives">Archives</option>
          </select>
        </div>
        <div class="admin-modal-actions">
          <button type="button" class="admin-btn" data-action="close-modal">Cancel</button>
          <button type="submit" class="admin-btn admin-btn-primary">Save to Vault</button>
        </div>
      </form>
    </div>`;
  document.body.appendChild(vaultModal);

  /* Category toggle */
  const catSelect = vaultModal.querySelector('#vf-category');
  on(catSelect, 'change', () => {
    const val = catSelect.value;
    vaultModal.querySelector('#vf-content-field').style.display = (val === 'media' || val === 'archives') ? 'none' : '';
    vaultModal.querySelector('#vf-file-field').style.display = (val === 'media' || val === 'archives') ? '' : 'none';
  });

  /* Close */
  on(vaultModal.querySelector('[data-action="close-modal"]'), 'click', () => vaultModal.classList.remove('open'));
  on(vaultModal.querySelector('.admin-modal-overlay'), 'click', () => vaultModal.classList.remove('open'));
  on(vaultModal.querySelector('#vault-form'), 'submit', saveVaultItemForm);
}

function openVaultModal() {
  if (!vaultModal) initVaultModal();
  vaultModal.querySelector('#vault-modal-title').textContent = 'Add to Vault';
  vaultModal.querySelector('#vault-form').reset();
  vaultModal.querySelector('#vf-icon').value = 'fas fa-folder';
  delete vaultModal.dataset.editId;
  vaultModal.querySelector('#vf-category').value = 'prompts';
  vaultModal.querySelector('#vf-content-field').style.display = '';
  vaultModal.querySelector('#vf-file-field').style.display = 'none';
  vaultModal.classList.add('open');
}

function saveVaultItemForm(e) {
  e.preventDefault();
  const cat = vaultModal.querySelector('#vf-category').value;
  const data = {
    icon: vaultModal.querySelector('#vf-icon').value.trim() || 'fas fa-folder',
    title: vaultModal.querySelector('#vf-title').value.trim(),
    description: vaultModal.querySelector('#vf-desc').value.trim(),
    tags: vaultModal.querySelector('#vf-tags').value.split(',').map(t => t.trim()).filter(Boolean),
    category: cat,
    locked: vaultModal.querySelector('#vf-locked')?.checked || false,
    content: (cat === 'media' || cat === 'archives') ? '' : vaultModal.querySelector('#vf-content').value.trim(),
    fileUrl: (cat === 'media' || cat === 'archives') ? vaultModal.querySelector('#vf-file-url').value.trim() : '',
    fileType: cat === 'media' ? 'image' : cat === 'archives' ? 'zip' : '',
  };
  if (!data.title) { showFlash('Enter a title'); return; }

  const editId = vaultModal.dataset.editId;
  if (editId) {
    updateVaultItem(Number(editId), data);
    showFlash('Updated!');
  } else {
    addVaultItem(data);
    showFlash('Added to vault!');
  }
  vaultModal.classList.remove('open');
}

export function openEditVaultModal(item) {
  if (!vaultModal) initVaultModal();
  vaultModal.querySelector('#vault-modal-title').textContent = 'Edit Vault Item';
  vaultModal.querySelector('#vf-icon').value = item.icon || 'fas fa-folder';
  vaultModal.querySelector('#vf-title').value = item.title || '';
  vaultModal.querySelector('#vf-desc').value = item.description || '';
  vaultModal.querySelector('#vf-tags').value = (item.tags || []).join(', ');
  vaultModal.querySelector('#vf-content').value = item.content || '';
  vaultModal.querySelector('#vf-file-url').value = item.fileUrl || '';
  vaultModal.querySelector('#vf-category').value = item.category || 'prompts';
  const cat = item.category || 'prompts';
  vaultModal.querySelector('#vf-content-field').style.display = (cat === 'media' || cat === 'archives') ? 'none' : '';
  vaultModal.querySelector('#vf-file-field').style.display = (cat === 'media' || cat === 'archives') ? '' : 'none';
  if (vaultModal.querySelector('#vf-locked')) {
    vaultModal.querySelector('#vf-locked').checked = !!item.locked;
    vaultModal.querySelector('#vf-locked').closest('.admin-field')?.classList.remove('admin-only');
  }
  vaultModal.dataset.editId = item.id;
  vaultModal.classList.add('open');
}

/* ── Init ── */
export async function initVaultSearch() {
  if (!qs('#vault-grid')) return;

  /* Load from Supabase first, fall back to localStorage */
  const loadedFromDB = await vaultStore.loadFromSupabase();

  if (!loadedFromDB) {
    if (!vaultStore.load()) {
      vaultStore.init(FALLBACK_DATA);
    }
  }

  /* Tab clicks */
  const filterBtns = qsa('.vault-filter');
  filterBtns.forEach(btn => {
    on(btn, 'click', () => {
      switchTab(btn.dataset.filter);
    });
  });

  /* Search */
  const searchInput = qs('.vault-toolbar .vault-search');
  if (searchInput) {
    on(searchInput, 'input', () => {
      currentQuery = searchInput.value.toLowerCase();
      renderGrid();
    });
  }

  /* Add button (always visible) */
  const addBtn = qs('#vault-add-btn');
  if (addBtn) {
    on(addBtn, 'click', openVaultModal);
  }

  /* Initial render */
  switchTab('prompts');
}

/* ── Store API for admin ── */
export function getVaultStore() {
  return vaultStore;
}

export function addVaultItem(data) {
  const item = vaultStore.add(data);
  if (currentFilter === 'all' || currentFilter === item.category) {
    renderGrid();
  }
  return item;
}

export function updateVaultItem(id, data) {
  const item = vaultStore.update(id, data);
  renderGrid();
  return item;
}

export function deleteVaultItem(id) {
  vaultStore.delete(id);
  renderGrid();
}

export function refreshVaultGrid() {
  renderGrid();
}
