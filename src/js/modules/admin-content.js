import { qs, qsa, on, escapeHTML, safeIconClass, safeUrl } from '../utils/dom.js?v=1.1';
import { getSupabaseClient } from '../services/supabase.js?v=1.3';

const STORAGE_KEY = 'fromlitenAdminSections';

const defaultState = {
    models: [],
    vault: [],
    deleted: {
        models: [],
        vault: []
    }
};

export async function initAdminContentControls() {
    const client = getSupabaseClient();
    if (!client?.auth) return;

    const { data } = await client.auth.getSession();
    setAdminMode(Boolean(data?.session));

    client.auth.onAuthStateChange((_event, session) => {
        setAdminMode(Boolean(session));
    });
}

function setAdminMode(isAdmin) {
    document.body.classList.toggle('admin-section-editing', isAdmin);
    if (!isAdmin) return;

    renderStoredItems('models');
    renderStoredItems('vault');
    applyDeletedItems('models');
    applyDeletedItems('vault');
    ensureSectionToolbar('models');
    ensureSectionToolbar('vault');
    ensureDeleteButtons('models');
    ensureDeleteButtons('vault');
}

function loadState() {
    try {
        return { ...defaultState, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') };
    } catch (error) {
        return structuredClone(defaultState);
    }
}

function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function sectionConfig(section) {
    if (section === 'models') {
        return {
            grid: qs('.models-grid'),
            itemSelector: '.model-card',
            title: 'Model',
            create: createModelCard
        };
    }

    return {
        grid: qs('.vault-grid'),
        itemSelector: '.vault-item',
        title: 'Vault',
        create: createVaultItem
    };
}

function ensureSectionToolbar(section) {
    const config = sectionConfig(section);
    if (!config.grid || qs(`[data-admin-toolbar="${section}"]`)) return;

    const toolbar = document.createElement('div');
    toolbar.className = 'admin-section-toolbar';
    toolbar.dataset.adminToolbar = section;
    toolbar.innerHTML = `
        <button type="button" class="admin-section-btn" data-admin-add="${section}">
            <i class="fas fa-plus"></i> Add ${config.title}
        </button>
    `;
    config.grid.before(toolbar);

    on(qs(`[data-admin-add="${section}"]`, toolbar), 'click', () => addItem(section));
}

function ensureDeleteButtons(section) {
    const config = sectionConfig(section);
    if (!config.grid) return;

    qsa(config.itemSelector, config.grid).forEach(item => {
        if (qs('.admin-delete-btn', item)) return;

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'admin-delete-btn';
        button.setAttribute('aria-label', `Delete ${config.title}`);
        button.innerHTML = '<i class="fas fa-trash"></i>';
        on(button, 'click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            deleteItem(section, item);
        });
        item.appendChild(button);
    });
}

function addItem(section) {
    const title = prompt(`New ${sectionConfig(section).title} title:`);
    if (!title) return;

    const description = prompt('Description:', '');
    const link = prompt('Link:', '#') || '#';
    const icon = prompt('FontAwesome icon class:', section === 'models' ? 'fas fa-cube' : 'fas fa-folder') || '';
    const meta = section === 'models'
        ? prompt('Specs, comma separated:', 'New, Admin')
        : prompt('Count label:', 'New');

    const item = {
        id: `admin-${Date.now()}`,
        title,
        description,
        link,
        icon,
        meta
    };

    const state = loadState();
    state[section] = [...(state[section] || []), item];
    saveState(state);
    renderStoredItems(section);
    ensureDeleteButtons(section);
}

function deleteItem(section, item) {
    const title = qs('h3', item)?.textContent?.trim() || 'this item';
    if (!confirm(`Delete "${title}" from ${sectionConfig(section).title}?`)) return;

    const state = loadState();
    const itemId = item.dataset.adminItemId;

    if (itemId) {
        state[section] = (state[section] || []).filter(saved => saved.id !== itemId);
    } else {
        state.deleted[section] = Array.from(new Set([...(state.deleted[section] || []), title]));
    }

    saveState(state);
    item.remove();
}

function renderStoredItems(section) {
    const config = sectionConfig(section);
    if (!config.grid) return;

    qsa('[data-admin-item-id]', config.grid).forEach(item => item.remove());
    const state = loadState();
    (state[section] || []).forEach(item => {
        config.grid.insertAdjacentHTML('beforeend', config.create(item));
    });
}

function applyDeletedItems(section) {
    const config = sectionConfig(section);
    if (!config.grid) return;

    const deleted = new Set(loadState().deleted?.[section] || []);
    qsa(config.itemSelector, config.grid).forEach(item => {
        const title = qs('h3', item)?.textContent?.trim();
        if (title && deleted.has(title)) item.remove();
    });
}

function createModelCard(item) {
    const specs = String(item.meta || '')
        .split(',')
        .map(spec => spec.trim())
        .filter(Boolean)
        .map(spec => `<span><i class="fas fa-check"></i> ${escapeHTML(spec)}</span>`)
        .join('');
    const icon = safeIconClass(item.icon) || 'fas fa-cube';

    return `
        <div class="model-card reveal active" data-admin-item-id="${escapeHTML(item.id)}">
            <div class="model-icon"><i class="${icon}"></i></div>
            <h3>${escapeHTML(item.title)}</h3>
            <p>${escapeHTML(item.description || '')}</p>
            <div class="model-specs">${specs}</div>
            <a href="${safeUrl(item.link)}" class="btn btn-primary">Open <i class="fas fa-external-link-alt"></i></a>
        </div>
    `;
}

function createVaultItem(item) {
    const icon = safeIconClass(item.icon) || 'fas fa-folder';

    return `
        <a href="${safeUrl(item.link)}" class="vault-item reveal active" data-admin-item-id="${escapeHTML(item.id)}">
            <div class="vault-icon">
                <i class="${icon}"></i>
            </div>
            <h3>${escapeHTML(item.title)}</h3>
            <p>${escapeHTML(item.description || '')}</p>
            <span class="vault-count">${escapeHTML(item.meta || 'New')}</span>
        </a>
    `;
}
