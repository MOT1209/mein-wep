import { qs, qsa, on, escapeHTML, safeIconClass, safeUrl } from '../utils/dom.js?v=1.1';
import {
    createContentItem,
    deleteContentItem,
    fetchPublicModels,
    fetchPublicVaultItems,
    getSupabaseClient,
    isCurrentUserAdmin,
    subscribeToContent
} from '../services/supabase.js?v=1.5';

const TABLES = {
    models: 'models',
    vault: 'vault_items'
};

const fallbackModels = [
    {
        id: 'static-rashid-ai',
        title: 'Rashid AI v2.0',
        description: 'Flagship conversational AI powered by Gemini & OpenRouter. Multilingual support.',
        icon_class: 'fas fa-brain',
        link: 'Rashid-app/index.html',
        specs: ['Gemini API', '10+ Languages']
    },
    {
        id: 'static-engine',
        title: 'Game Engine Core',
        description: 'Proprietary 3D engine built with Three.js, physics, AI behaviors, and procedural generation.',
        icon_class: 'fas fa-cubes',
        link: '#projects',
        specs: ['Three.js', 'Real-time']
    },
    {
        id: 'static-backend',
        title: 'Backend Infrastructure',
        description: 'Supabase-powered backend with authentication, realtime database, and PWA capabilities.',
        icon_class: 'fas fa-server',
        link: '',
        specs: ['Supabase', 'Realtime']
    }
];

const fallbackVault = [
    { id: 'static-prompts', title: 'Prompts', description: 'Polished command templates and AI prompts', icon_class: 'fas fa-terminal', link: 'vault/prompts/index.html', count_label: '12+ Prompts' },
    { id: 'static-code', title: 'Code Library', description: 'Clean, reusable code snippets', icon_class: 'fas fa-code', link: 'vault/code/index.html', count_label: '50+ Snippets' },
    { id: 'static-archive', title: 'Archive', description: 'Visual assets and design resources', icon_class: 'fas fa-images', link: 'vault/archive/index.html', count_label: '100+ Assets' },
    { id: 'static-media', title: 'Media', description: 'Tutorials, demos and showcases', icon_class: 'fas fa-video', link: 'vault/media/index.html', count_label: '25+ Videos' },
    { id: 'static-docs', title: 'Documentation', description: 'Project docs and technical guides', icon_class: 'fas fa-book', link: 'vault/docs/index.html', count_label: '8+ Docs' },
    { id: 'static-api', title: 'API Reference', description: 'API endpoints and integrations', icon_class: 'fas fa-plug', link: 'vault/api/index.html', count_label: '5+ APIs' }
];

let isAdmin = false;
let subscriptionsReady = false;

export async function initAdminContentControls() {
    await renderSupabaseSections();

    const client = getSupabaseClient();
    if (!client?.auth) return;

    setAdminMode(await isCurrentUserAdmin());

    client.auth.onAuthStateChange(async () => {
        setAdminMode(await isCurrentUserAdmin());
    });

    initRealtime();
}

async function renderSupabaseSections() {
    const [modelsResult, vaultResult] = await Promise.all([
        fetchPublicModels(),
        fetchPublicVaultItems()
    ]);

    renderSection('models', modelsResult.items?.length ? modelsResult.items : fallbackModels);
    renderSection('vault', vaultResult.items?.length ? vaultResult.items : fallbackVault);

    if (modelsResult.error) console.warn('Models loaded from fallback:', modelsResult.error.message);
    if (vaultResult.error) console.warn('Vault loaded from fallback:', vaultResult.error.message);
}

function initRealtime() {
    if (subscriptionsReady) return;
    subscriptionsReady = true;

    subscribeToContent(TABLES.models, renderSupabaseSections);
    subscribeToContent(TABLES.vault, renderSupabaseSections);
}

function setAdminMode(nextIsAdmin) {
    isAdmin = nextIsAdmin;
    document.body.classList.toggle('admin-section-editing', isAdmin);

    ensureSectionToolbar('models');
    ensureSectionToolbar('vault');
    renderSupabaseSections();
}

function sectionConfig(section) {
    if (section === 'models') {
        return {
            grid: qs('.models-grid'),
            itemSelector: '.model-card',
            table: TABLES.models,
            title: 'Model',
            create: createModelCard
        };
    }

    return {
        grid: qs('.vault-grid'),
        itemSelector: '.vault-item',
        table: TABLES.vault,
        title: 'Vault',
        create: createVaultItem
    };
}

function ensureSectionToolbar(section) {
    const config = sectionConfig(section);
    const existing = qs(`[data-admin-toolbar="${section}"]`);

    if (!isAdmin) {
        existing?.remove();
        return;
    }

    if (!config.grid || existing) return;

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

function renderSection(section, items) {
    const config = sectionConfig(section);
    if (!config.grid) return;

    config.grid.innerHTML = items.map(item => config.create(item)).join('');

    qsa(`${config.itemSelector}.reveal`, config.grid).forEach(el => {
        el.classList.add('active');
        window.fromlitenRevealObserver?.observe(el);
    });
}

async function addItem(section) {
    if (!isAdmin) return;

    const config = sectionConfig(section);
    const title = prompt(`New ${config.title} title:`);
    if (!title) return;

    const description = prompt('Description:', '') || '';
    const link = prompt('Link:', section === 'models' ? '#projects' : 'vault/docs/index.html') || '';
    const iconClass = prompt('FontAwesome icon class:', section === 'models' ? 'fas fa-cube' : 'fas fa-folder') || '';
    const meta = section === 'models'
        ? prompt('Specs, comma separated:', 'New, Supabase')
        : prompt('Count label:', 'New');

    const payload = section === 'models'
        ? {
            title,
            description,
            link,
            icon_class: iconClass,
            specs: splitMeta(meta),
            status: 'Public'
        }
        : {
            title,
            description,
            link,
            icon_class: iconClass,
            count_label: meta || 'New',
            status: 'Public'
        };

    const { error } = await createContentItem(config.table, payload);
    if (error) {
        alert(`Could not save ${config.title}: ${error.message}`);
        return;
    }

    await renderSupabaseSections();
}

async function deleteItem(section, item) {
    if (!isAdmin) return;

    const config = sectionConfig(section);
    const title = qs('h3', item)?.textContent?.trim() || 'this item';
    const id = item.dataset.itemId;

    if (!id || id.startsWith('static-')) {
        alert('This fallback item must be seeded in Supabase before it can be deleted.');
        return;
    }

    if (!confirm(`Delete "${title}" from ${config.title}?`)) return;

    const { error } = await deleteContentItem(config.table, id);
    if (error) {
        alert(`Could not delete ${config.title}: ${error.message}`);
        return;
    }

    item.remove();
}

function createDeleteButton(section, title) {
    if (!isAdmin) return '';

    return `
        <button type="button" class="admin-delete-btn" aria-label="Delete ${escapeHTML(title)}" data-admin-delete="${section}">
            <i class="fas fa-trash"></i>
        </button>
    `;
}

function createModelCard(item) {
    const specs = (Array.isArray(item.specs) ? item.specs : splitMeta(item.specs))
        .filter(Boolean)
        .map(spec => `<span><i class="fas fa-check"></i> ${escapeHTML(spec)}</span>`)
        .join('');
    const icon = safeIconClass(item.icon_class || item.icon) || 'fas fa-cube';
    const link = safeUrl(item.link, '');
    const title = item.title || 'Untitled Model';
    const action = link
        ? `<a href="${link}" class="btn btn-primary">Open <i class="fas fa-external-link-alt"></i></a>`
        : '<span class="btn btn-glass disabled-link" aria-disabled="true">Planned</span>';

    return `
        <div class="model-card reveal active" data-item-id="${escapeHTML(item.id)}">
            ${createDeleteButton('models', title)}
            <div class="model-icon"><i class="${icon}"></i></div>
            <h3>${escapeHTML(title)}</h3>
            <p>${escapeHTML(item.description || '')}</p>
            <div class="model-specs">${specs}</div>
            ${action}
        </div>
    `;
}

function createVaultItem(item) {
    const icon = safeIconClass(item.icon_class || item.icon) || 'fas fa-folder';
    const title = item.title || 'Untitled Vault Item';

    return `
        <a href="${safeUrl(item.link)}" class="vault-item reveal active" data-item-id="${escapeHTML(item.id)}">
            ${createDeleteButton('vault', title)}
            <div class="vault-icon">
                <i class="${icon}"></i>
            </div>
            <h3>${escapeHTML(title)}</h3>
            <p>${escapeHTML(item.description || '')}</p>
            <span class="vault-count">${escapeHTML(item.count_label || item.meta || 'New')}</span>
        </a>
    `;
}

function splitMeta(value) {
    if (Array.isArray(value)) return value;
    return String(value || '')
        .split(',')
        .map(item => item.trim())
        .filter(Boolean);
}

on(document, 'click', (event) => {
    const deleteButton = event.target.closest('[data-admin-delete]');
    if (!deleteButton) return;

    event.preventDefault();
    event.stopPropagation();
    deleteItem(deleteButton.dataset.adminDelete, deleteButton.closest('[data-item-id]'));
});
