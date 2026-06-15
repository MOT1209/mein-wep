import { getSupabaseClient, isCurrentUserAdmin, createContentItem } from '../services/supabase.js';
import { qs, qsa, on } from '../utils/dom.js';
import { escapeHtml, sanitizeInput } from '../utils/security.js';
import { addVaultItem, updateVaultItem, deleteVaultItem, getVaultStore } from './vault.js';

const VAULT_PIN_KEY = 'rashid_vault_pin';

let isAdmin = false;
let adminUser = null;
let vaultModal = null;

/* ── Init Admin Mode ── */
export async function initAdmin() {
  const client = getSupabaseClient();
  if (!client) return;
  const { data: { session } } = await client.auth.getSession();
  if (!session) return;

  adminUser = session.user;
  window.__admin = { user: session.user };

  const admin = await isCurrentUserAdmin();
  if (admin) {
    isAdmin = true;
    document.body.classList.add('admin-logged-in');
    injectAdminBar();
    initVaultAdmin();
    return;
  }

  injectRegisterPrompt();
}

/* ── Admin Bar ── */
function injectAdminBar() {
  if (qs('.admin-bar')) return;
  const bar = document.createElement('div');
  bar.className = 'admin-bar';
  bar.innerHTML = `
    <span class="admin-bar-icon"><i class="fas fa-shield-halved"></i></span>
    <span class="admin-bar-label">Admin</span>
    <span class="admin-bar-user">${escapeHtml(adminUser?.email || '')}</span>
    <span class="admin-bar-sep"></span>
    <button class="admin-bar-btn" data-action="logout" title="Sign out"><i class="fas fa-right-from-bracket"></i></button>
  `;
  document.body.prepend(bar);
  on(bar.querySelector('[data-action="logout"]'), 'click', async () => {
    const c = getSupabaseClient();
    if (c) await c.auth.signOut();
    document.body.classList.remove('admin-logged-in');
    isAdmin = false;
    bar.remove();
    location.reload();
  });
}

/* ── Register Admin Prompt ── */
function injectRegisterPrompt() {
  const existing = qs('.admin-register-prompt');
  if (existing) return;
  const prompt = document.createElement('div');
  prompt.className = 'admin-register-prompt';
  prompt.innerHTML = `
    <div class="admin-register-box">
      <span class="admin-register-icon"><i class="fas fa-shield-halved"></i></span>
      <h4>Admin Access</h4>
      <p>You're logged in as <strong>${escapeHtml(adminUser?.email || '')}</strong> but not registered as admin.</p>
      <button class="admin-btn admin-btn-primary" id="register-admin-btn">
        <i class="fas fa-user-shield"></i> Register as Admin
      </button>
      <button class="admin-btn" id="admin-logout-btn">Logout</button>
    </div>`;
  document.body.appendChild(prompt);

  on(prompt.querySelector('#register-admin-btn'), 'click', async () => {
    const client = getSupabaseClient();
    if (!client) return;
    try {
      const { error } = await client.rpc('add_admin_user');
      if (error) {
        injectRegisterSql(prompt);
        return;
      }
      prompt.innerHTML = `<div class="admin-register-box"><p style="color:#22c55e;">✅ Registered! Refreshing...</p></div>`;
      setTimeout(() => location.reload(), 1000);
    } catch (err) {
      injectRegisterSql(prompt);
    }
  });

  on(prompt.querySelector('#admin-logout-btn'), 'click', async () => {
    const client = getSupabaseClient();
    if (client) await client.auth.signOut();
    location.reload();
  });
}

/* ── Register SQL Prompt ── */
function injectRegisterSql(promptEl) {
  const sql = `create or replace function public.add_admin_user()
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.admin_users (user_id, email)
  values ((select auth.uid()), (select email from auth.users where id = (select auth.uid())))
  on conflict (user_id) do nothing;
$$;

revoke all on function public.add_admin_user() from public;
grant execute on function public.add_admin_user() to authenticated;`;

  promptEl.innerHTML = `<div class="admin-register-box">
    <h4>🔧 Create Admin Function</h4>
    <p>The database function <code>add_admin_user</code> doesn't exist yet.</p>
    <p style="font-size:0.85em;color:#94a3b8;">Open your Supabase SQL Editor and run:</p>
    <pre style="background:#1e293b;color:#e2e8f0;padding:1em;border-radius:8px;font-size:0.8em;overflow-x:auto;white-space:pre-wrap;text-align:left;direction:ltr;" id="admin-sql-code">${escapeHtml(sql)}</pre>
    <button class="admin-btn" id="copy-sql-btn" style="margin-top:6px;"><i class="fas fa-copy"></i> Copy SQL</button>
    <p style="font-size:0.85em;color:#94a3b8;margin-top:8px;">After running, click below to retry:</p>
    <button class="admin-btn admin-btn-primary" id="retry-admin-register"><i class="fas fa-rotate"></i> Check & Retry</button>
    <button class="admin-btn" onclick="this.closest('.admin-register-prompt').remove()">Dismiss</button>
  </div>`;

  on(promptEl.querySelector('#copy-sql-btn'), 'click', () => {
    navigator.clipboard.writeText(sql).then(() => showToast('SQL copied!')).catch(() => showToast('Copy failed'));
  });
  on(promptEl.querySelector('#retry-admin-register'), 'click', async () => {
    const c = getSupabaseClient();
    if (!c) return;
    try {
      const { error } = await c.rpc('add_admin_user');
      if (!error) {
        promptEl.innerHTML = `<div class="admin-register-box"><p style="color:#22c55e;">✅ Registered! Refreshing...</p></div>`;
        setTimeout(() => location.reload(), 1000);
        return;
      }
    } catch {}
    try {
      const { error: directError } = await c.from('admin_users').insert({
        user_id: (await c.auth.getSession()).data.session?.user?.id,
        email: (await c.auth.getSession()).data.session?.user?.email
      });
      if (!directError) {
        promptEl.innerHTML = `<div class="admin-register-box"><p style="color:#22c55e;">✅ Registered! Refreshing...</p></div>`;
        setTimeout(() => location.reload(), 1000);
        return;
      }
    } catch {}
    showToast('Need the DB function. Run the SQL above first.', 'error');
  });
}

/* ── Vault Admin ── */
function initVaultAdmin() {
  const vaultSection = qs('#vault');
  if (!vaultSection) return;
  const container = vaultSection.querySelector('.container');
  if (!container) return;

  const panel = document.createElement('div');
  panel.className = 'vault-admin-panel admin-only';
  panel.innerHTML = `
    <div class="vault-admin-header">
      <h3><i class="fas fa-screwdriver-wrench"></i> Vault Manager</h3>
      <div class="vault-admin-actions">
        <button class="admin-btn" data-action="set-vault-pin">
          <i class="fas fa-key"></i> Set PIN
        </button>
        <button class="admin-btn admin-btn-primary" data-action="add-vault-item">
          <i class="fas fa-plus"></i> Add Item
        </button>
      </div>
    </div>`;
  vaultSection.parentNode.insertBefore(panel, vaultSection.nextSibling);

  initModal();
}

/* ── Modal ── */
function initModal() {
  if (qs('#vault-modal')) return;
  vaultModal = document.createElement('div');
  vaultModal.id = 'vault-modal';
  vaultModal.className = 'admin-modal';
  vaultModal.innerHTML = `
    <div class="admin-modal-overlay"></div>
    <div class="admin-modal-content">
      <div class="admin-modal-header">
        <h3 id="vault-modal-title">Vault Item</h3>
        <button class="admin-modal-close" data-action="close-modal"><i class="fas fa-xmark"></i></button>
      </div>
      <form class="admin-modal-form" id="vault-form">
        <div class="admin-field">
          <label for="vf-icon">Icon</label>
          <input type="text" id="vf-icon" class="admin-input" value="fas fa-folder" required>
        </div>
        <div class="admin-field">
          <label for="vf-title">Title</label>
          <input type="text" id="vf-title" class="admin-input" required>
        </div>
        <div class="admin-field">
          <label for="vf-desc">Description</label>
          <textarea id="vf-desc" class="admin-input" rows="2"></textarea>
        </div>
        <div class="admin-field">
          <label for="vf-tags">Tags <small>(comma separated)</small></label>
          <input type="text" id="vf-tags" class="admin-input" placeholder="js, react, api">
        </div>
        <div class="admin-field" id="vf-content-field">
          <label for="vf-content">Content <small>(for prompts, code, docs)</small></label>
          <textarea id="vf-content" class="admin-input" rows="4" placeholder="Paste the prompt text, code, or documentation content here..."></textarea>
        </div>
        <div class="admin-field" id="vf-file-field" style="display:none;">
          <label for="vf-file-url">File URL <small>(for media, archives)</small></label>
          <input type="text" id="vf-file-url" class="admin-input" placeholder="https://example.com/file.zip">
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
        <div class="admin-field-row">
          <label class="admin-check">
            <input type="checkbox" id="vf-locked"> <span>Locked <i class="fas fa-lock"></i></span>
          </label>
        </div>
        <div class="admin-modal-actions">
          <button type="button" class="admin-btn" data-action="close-modal">Cancel</button>
          <button type="submit" class="admin-btn admin-btn-primary">Save</button>
        </div>
      </form>
    </div>`;
  document.body.appendChild(vaultModal);

  /* Show/hide content/file fields based on category */
  const catSelect = vaultModal.querySelector('#vf-category');
  on(catSelect, 'change', () => toggleCategoryFields(catSelect.value));
  toggleCategoryFields(catSelect.value);

  on(vaultModal.querySelector('[data-action="close-modal"]'), 'click', () => vaultModal.classList.remove('open'));
  on(vaultModal.querySelector('.admin-modal-overlay'), 'click', () => vaultModal.classList.remove('open'));
  on(vaultModal.querySelector('#vault-form'), 'submit', saveVaultItem);

  on(document, 'click', (e) => {
    const addBtn = e.target.closest('[data-action="add-vault-item"]');
    if (addBtn) {
      vaultModal.querySelector('#vault-modal-title').textContent = 'Add Vault Item';
      vaultModal.querySelector('#vault-form').reset();
      vaultModal.querySelector('#vf-icon').value = 'fas fa-folder';
      delete vaultModal.dataset.editId;
      toggleCategoryFields(vaultModal.querySelector('#vf-category').value);
      vaultModal.classList.add('open');
    }
    const pinBtn = e.target.closest('[data-action="set-vault-pin"]');
    if (pinBtn) {
      const current = localStorage.getItem(VAULT_PIN_KEY) || '1234';
      const pin = prompt('Enter new 4-6 digit PIN:', current);
      if (pin && pin.length >= 4) {
        localStorage.setItem(VAULT_PIN_KEY, pin);
        showToast('PIN updated');
      }
    }
  });

  /* Edit/delete on vault cards */
  on(document, 'click', (e) => {
    const editBtn = e.target.closest('.vault-card-btn[data-action="edit-vault"]');
    if (editBtn) {
      const card = editBtn.closest('.vault-card');
      if (card) openEditModal(card);
      return;
    }
    const delBtn = e.target.closest('.vault-card-btn[data-action="delete-vault"]');
    if (delBtn) {
      const card = delBtn.closest('.vault-card');
      if (card && confirm('Delete this vault item?')) {
        const id = Number(card.dataset.itemId);
        deleteVaultItem(id);
        showToast('Deleted');
      }
      return;
    }
  });
}

function toggleCategoryFields(cat) {
  const contentField = vaultModal.querySelector('#vf-content-field');
  const fileField = vaultModal.querySelector('#vf-file-field');
  if (!contentField || !fileField) return;
  if (cat === 'media' || cat === 'archives') {
    contentField.style.display = 'none';
    fileField.style.display = '';
  } else {
    contentField.style.display = '';
    fileField.style.display = 'none';
  }
}

function openEditModal(card) {
  const store = getVaultStore();
  const id = Number(card.dataset.itemId);
  const item = store.items.find(i => i.id === id);
  if (!item) return;

  vaultModal.querySelector('#vault-modal-title').textContent = 'Edit Vault Item';
  vaultModal.querySelector('#vf-icon').value = item.icon || 'fas fa-folder';
  vaultModal.querySelector('#vf-title').value = item.title || '';
  vaultModal.querySelector('#vf-desc').value = item.description || '';
  vaultModal.querySelector('#vf-tags').value = (item.tags || []).join(', ');
  vaultModal.querySelector('#vf-content').value = item.content || '';
  vaultModal.querySelector('#vf-file-url').value = item.fileUrl || '';
  vaultModal.querySelector('#vf-category').value = item.category || 'prompts';
  vaultModal.querySelector('#vf-locked').checked = !!item.locked;
  toggleCategoryFields(item.category);
  vaultModal.dataset.editId = id;
  vaultModal.classList.add('open');
}

async function saveVaultItem(e) {
  e.preventDefault();
  const cat = vaultModal.querySelector('#vf-category').value;
  const data = {
    icon: sanitizeInput(vaultModal.querySelector('#vf-icon').value) || 'fas fa-folder',
    title: sanitizeInput(vaultModal.querySelector('#vf-title').value),
    description: sanitizeInput(vaultModal.querySelector('#vf-desc').value),
    tags: vaultModal.querySelector('#vf-tags').value.split(',').map(t => sanitizeInput(t.trim())).filter(Boolean),
    category: cat,
    locked: vaultModal.querySelector('#vf-locked').checked,
    content: cat === 'media' || cat === 'archives' ? '' : sanitizeInput(vaultModal.querySelector('#vf-content').value),
    fileUrl: cat === 'media' || cat === 'archives' ? sanitizeInput(vaultModal.querySelector('#vf-file-url').value) : '',
    fileType: cat === 'media' ? 'image' : cat === 'archives' ? 'zip' : '',
  };
  if (!data.title) return;

  const editId = vaultModal.dataset.editId;

  /* Try Supabase sync */
  const client = getSupabaseClient();
  if (client) {
    const { error } = await createContentItem('vault_items', {
      title: data.title, description: data.description, icon_class: data.icon,
      link: data.fileUrl || null, status: 'Public', sort_order: 100,
    });
    if (error) console.warn('Supabase save:', error.message);
  }

  if (editId) {
    updateVaultItem(Number(editId), data);
    showToast('Updated');
  } else {
    addVaultItem(data);
    showToast('Added');
  }

  vaultModal.classList.remove('open');
}

function showToast(msg, type) {
  const t = document.createElement('div');
  t.className = 'admin-toast' + (type === 'error' ? ' admin-toast--error' : '');
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

/* ── Vault Lock System ── */
export function initVaultLock() {
  const grid = qs('#vault-grid');
  if (!grid) return;

  const isUnlocked = sessionStorage.getItem('vault_unlocked') === 'true';
  const lockedCards = () => qsa('.vault-card .vault-lock-badge', grid);

  if (isUnlocked) {
    applyLockState(true);
    return;
  }

  /* Wait for cards to render, then check */
  const check = () => {
    const badges = lockedCards();
    if (badges.length === 0) return;
    applyLockState(false);
    showUnlockPrompt();
  };

  /* Poll until cards rendered */
  let attempts = 0;
  const iv = setInterval(() => {
    attempts++;
    if (lockedCards().length > 0 || attempts > 20) {
      clearInterval(iv);
      check();
    }
  }, 200);
}

function applyLockState(unlocked) {
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

function showUnlockPrompt() {
  if (qs('.vault-unlock-prompt')) return;
  const prompt = document.createElement('div');
  prompt.className = 'vault-unlock-prompt admin-only';
  prompt.innerHTML = `
    <div class="vault-unlock-box">
      <i class="fas fa-lock"></i>
      <h4>Vault Locked</h4>
      <p>Enter PIN to access locked items</p>
      <div class="vault-unlock-input-row">
        <input type="password" id="vault-pin-input" class="admin-input" placeholder="Enter PIN" maxlength="6" inputmode="numeric">
        <button class="admin-btn admin-btn-primary" id="vault-unlock-btn">Unlock</button>
      </div>
      <button class="vault-unlock-skip" id="vault-skip-lock">Skip</button>
    </div>`;
  const grid = qs('#vault-grid');
  if (grid) grid.parentNode.insertBefore(prompt, grid);

  const existingPrompt = qs('.vault-unlock-prompt');
  if (existingPrompt) {
    on(existingPrompt.querySelector('#vault-unlock-btn'), 'click', () => {
      const pin = existingPrompt.querySelector('#vault-pin-input').value;
      const stored = localStorage.getItem(VAULT_PIN_KEY) || '1234';
      if (pin === stored) {
        sessionStorage.setItem('vault_unlocked', 'true');
        location.reload();
      } else {
        showToast('Wrong PIN', 'error');
      }
    });
    on(existingPrompt.querySelector('#vault-skip-lock'), 'click', () => {
      existingPrompt.remove();
    });
  }
}

export function setVaultPin(pin) {
  if (pin && pin.length >= 4) {
    localStorage.setItem(VAULT_PIN_KEY, pin);
    return true;
  }
  return false;
}

export function getVaultPin() {
  return localStorage.getItem(VAULT_PIN_KEY) || '1234';
}
