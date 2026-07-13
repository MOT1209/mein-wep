import { getSupabaseClient, isCurrentUserAdmin } from '../services/supabase.js';
import { qs, qsa, on, escapeHTML } from '../utils/dom.js';
import { addVaultItem, updateVaultItem, deleteVaultItem, getVaultStore, openEditVaultModal } from './vault.js';

const VAULT_PIN_KEY = 'rashid_vault_pin';

let isAdmin = false;
let adminUser = null;

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
    <span class="admin-bar-user">${escapeHTML(adminUser?.email || '')}</span>
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

/* ── Secure: Admin registration disabled ── */
/* 
   Security fix: removed self-registration of admin users.
   Only the database owner (Supabase Dashboard) can add admins.
   The old add_admin_user() RPC was revoked from authenticated users.
   See SUPABASE_SECURITY_FIX.sql for details.
*/
function injectRegisterPrompt() {
  // No-op: admin registration is now manual via Supabase Dashboard only
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

  /* Delegate: edit/delete vault cards */
  on(document, 'click', (e) => {
    const editBtn = e.target.closest('.vault-card-btn[data-action="edit-vault"]');
    if (editBtn) {
      const card = editBtn.closest('.vault-card');
      if (card) {
        const store = getVaultStore();
        const id = Number(card.dataset.itemId);
        const item = store.items.find(i => i.id === id);
        if (item) openEditVaultModal(item);
      }
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
    const pinBtn = e.target.closest('[data-action="set-vault-pin"]');
    if (pinBtn) {
      const current = localStorage.getItem(VAULT_PIN_KEY) || '1234';
      const pin = prompt('Enter new 4-6 digit PIN:', current);
      if (pin && pin.length >= 4) {
        localStorage.setItem(VAULT_PIN_KEY, pin);
        showToast('PIN updated');
      }
      return;
    }
  });
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

  /* Poll until cards rendered (up to 8s for async Supabase load) */
  let attempts = 0;
  const iv = setInterval(() => {
    attempts++;
    if (lockedCards().length > 0 || attempts > 40) {
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
