import { trackProjectClick } from '../services/analytics.js?v=1.0';
import { qs, qsa, on, escapeHTML, safeIconClass, safeUrl } from '../utils/dom.js?v=1.1';
import { countProjects, fetchPublicProjects } from '../services/supabase.js?v=1.5';
import { getCurrentLanguage, t } from './translations.js?v=1.1';
import { generateThumbnail, getThumbnailData } from '../utils/thumbnails.js?v=1.0';

let activeFilter = 'all';
let searchQuery = '';

// Project screenshots (SVG placeholder images for projects without real screenshots)
const projectScreenshots = {
    'game': '../images/screenshots/default.svg',
    'app': '../images/screenshots/default.svg',
    'model': '../images/screenshots/default.svg',
    'KingCraft': '../images/screenshots/kingcraft.svg',
    'Rust Construction': '../images/screenshots/rust-construction.svg',
    'Farm Empire': '../images/screenshots/farm-empire.svg',
    'Rashid AI': '../images/screenshots/rashid-ai.svg',
    'KING2 AI v4.0': '../images/screenshots/king2-ai.svg'
};

// Projects that have Android APK builds
const apkProjects = {
    'KingCraft': { url: '/apks/kingcraft-game-v0.6.0.apk', version: '0.6.0' },
    'Rust Construction': { url: '/apks/rust-game-v1.1.0.apk', version: '1.1.0' },
    'Farm Empire': { url: '/apks/farm-game-v2.0.0.apk', version: '2.0.0' },
    'Quran Pro': { url: '/apks/quran-app-v1.0.0.apk', version: '1.0.0' },
    'Calculator App': { url: '/apks/calculator-app-v1.0.0.apk', version: '1.0.0' },
    'Quiz Master': { url: '/apks/quiz-app-v1.4.0.apk', version: '1.4.0' }
};

const fallbackProjects = [
    // ── GitHub Repositories (MOT1209) ──
    { title: 'Gem-PRO', category: 'App', description: 'AI-powered productivity tool leveraging the Gemini API for intelligent automation and creative assistance.', link: 'https://github.com/MOT1209/Gem-PRO', github_link: 'https://github.com/MOT1209/Gem-PRO', image_url: '../images/screenshots/default.svg', technologies: ['JavaScript', 'Gemini API', 'AI'] },
    { title: 'islams-wep', category: 'App', description: 'Islamic web platform featuring Quran, prayers, and educational resources with a clean modern interface.', link: 'https://github.com/MOT1209/islams-wep', github_link: 'https://github.com/MOT1209/islams-wep', image_url: '../images/screenshots/default.svg', technologies: ['HTML', 'CSS', 'JavaScript'] },
    // ── Local Workspace Projects ──
    { title: 'Maarifah', category: 'App', description: 'منصة تعليمية ومعرفية متكاملة مبنية بـ Flutter (Clean Architecture) — دورات، مقالات، اختبارات، ومساعد ذكي. Educational platform built with Flutter.', link: 'apps/maarifah-web/index.html', image_url: '../images/screenshots/default.svg', technologies: ['Flutter', 'Dart', 'Clean Architecture'] },
    { title: 'KingCraft', category: 'Game', description: '3D voxel sandbox kingdom builder. Mine, craft, build, fight mobs, and survive! Built with Three.js chunk-based rendering.', link: 'games/kingcraft-game/showcase.html', image_url: '../images/screenshots/kingcraft.svg', technologies: ['Three.js', '3D', 'Sandbox'] },
    { title: 'Rust Construction', category: 'Game', description: '3D building game with physics and resource management. Build structures, manage resources, survive!', link: 'games/rust-game/index.html', image_url: '../images/screenshots/rust-construction.svg', technologies: ['Three.js', '3D', 'Physics'] },
    { title: 'Farm Empire', category: 'Game', description: 'Immersive farming simulation with crops, animals, and economy. Grow your farm empire!', link: 'games/farm-game/index.html', image_url: '../images/screenshots/farm-empire.svg', technologies: ['WebGL', 'Simulation', 'Economy'] },
    { title: 'Rashid AI', category: 'Model', description: 'Advanced conversational AI assistant powered by Gemini & OpenRouter. Multilingual support with 10+ languages.', link: 'models/Rashid-Model/index.html', image_url: '../images/screenshots/rashid-ai.svg', technologies: ['Gemini API', 'OpenRouter', 'AI'] },
    { title: 'KING2 AI v4.0', category: 'Model', description: 'Fine-tuned Qwen2.5-3B-Instruct with QLoRA — Arabic-first AI assistant trained on 142 examples. متخصص بالعربية، البرمجة، الرياضيات، والسلام.', link: 'models/king2-ai/index.html', image_url: '../images/screenshots/king2-ai.svg', technologies: ['Qwen2.5-3B', 'QLoRA', 'Arabic AI', 'Fine-tuned'] },
    { title: 'Quran Pro', category: 'App', description: 'Complete Quran with tafsir, 40+ reciters, search, and bookmarks. Full offline support.', link: 'apps/quran-app/index.html', image_url: '../images/screenshots/default.svg', technologies: ['Audio', 'PWA', 'Offline'] },
    { title: 'Calculator App', category: 'App', description: 'Privacy-focused calculator with secret vault. Hide files behind a calculator interface!', link: 'apps/calculator-app/index.html', image_url: '../images/screenshots/default.svg', technologies: ['Security', 'PWA', 'Privacy'] },
    { title: 'Quiz Master', category: 'App', description: 'Interactive quiz platform with multiple categories, scoring, and progress tracking.', link: 'apps/quiz-app/index.html', image_url: '../images/screenshots/default.svg', technologies: ['Education', 'PWA', 'Gamification'] }
];

export function initProjectFilters() {
    qsa('.filter-btn').forEach(btn => {
        on(btn, 'click', () => {
            qsa('.filter-btn').forEach(item => item.classList.remove('active'));
            btn.classList.add('active');
            activeFilter = btn.dataset.filter;
            filterProjects();
        });
    });
}

function filterProjects() {
    qsa('.project-card')?.forEach(card => {
        const isFilterMatch = activeFilter === 'all' || card.dataset.category === activeFilter;
        const title = card.querySelector('h3')?.textContent?.toLowerCase() || '';
        const desc = card.querySelector('p')?.textContent?.toLowerCase() || '';
        const isSearchMatch = !searchQuery || title.includes(searchQuery) || desc.includes(searchQuery);
        const isMatch = isFilterMatch && isSearchMatch;
        card.style.opacity = isMatch ? '1' : '0';
        card.style.transform = isMatch ? 'translateY(0)' : 'translateY(20px)';
        clearTimeout(card._filterTimeout);
        card._filterTimeout = setTimeout(() => {
            card.style.display = isMatch ? 'block' : 'none';
        }, isMatch ? 0 : 300);
    });
}

export async function initProjects() {
    const gamingGrid = qs('#gaming-grid');
    if (!gamingGrid) return;

    const filterGroup = qs('.filter-group');
    if (filterGroup && !qs('.project-search')) {
        const searchBar = document.createElement('input');
        searchBar.type = 'text';
        searchBar.className = 'project-search';
        searchBar.placeholder = 'Search projects...';
        searchBar.setAttribute('aria-label', 'Search projects');
        const filterBar = document.createElement('div');
        filterBar.className = 'filter-bar';
        filterGroup.parentNode?.insertBefore(filterBar, filterGroup);
        filterBar.appendChild(filterGroup);
        filterBar.appendChild(searchBar);
        on(searchBar, 'input', (e) => {
            searchQuery = e.target.value.toLowerCase();
            filterProjects();
        });
    }

    renderFallback();
    let count = null;
    let projects = null;
    let error = null;

    try {
        const countResult = await countProjects();
        count = countResult.count;
        if (countResult.error) {
            error = countResult.error;
        } else {
            const projectResult = await fetchPublicProjects();
            projects = projectResult.projects;
            error = projectResult.error;
        }
    } catch (err) {
        error = err;
    }

    if (!error && count != null) {
        const adminLink = qs('.admin-link');
        if (adminLink) {
            adminLink.style.display = 'none';
        }
    }

    if (error || !projects?.length) {
        if (error) console.warn('Error loading projects from DB. Using local fallback:', error);
        return;
    }

    // Dedupe the offline fallback against DB rows by BOTH normalized title and
    // normalized link (folder), so the same project isn't shown twice when the DB
    // and the fallback use different names (e.g. "Farmer Game" vs "Farm Empire").
    const norm = (s) => String(s || '').toLowerCase().replace(/^\/+/, '').replace(/\/index\.html$/, '').replace(/\/+$/, '').trim();
    const dbKeys = new Set();
    projects.forEach(p => {
        if (p.title) dbKeys.add('t:' + norm(p.title));
        const l = norm(p.link || p.project_link);
        if (l) dbKeys.add('l:' + l);
    });
    const extra = fallbackProjects.filter(f => !dbKeys.has('t:' + norm(f.title)) && !dbKeys.has('l:' + norm(f.link)));
    if (extra.length > 0) {
        projects = [...projects, ...extra];
    }

    renderProjects(projects);
}

function renderFallback() {
    const gamingGrid = qs('#gaming-grid');
    renderProjects(fallbackProjects);
    if (!gamingGrid) return;
    const status = document.createElement('div');
    status.style.cssText = 'grid-column: 1/-1; text-align: center; font-size: 0.8rem; opacity: 0.6; margin-bottom: 1rem; width: 100%;';
    status.innerText = 'Loaded from Local System (Offline Mode)';
    gamingGrid.prepend(status);
}

function renderProjects(projects) {
    const gamingGrid = qs('#gaming-grid');
    const appsGrid = qs('#apps-grid');
    if (gamingGrid) gamingGrid.innerHTML = '';
    if (appsGrid) appsGrid.innerHTML = '';

    const lang = getCurrentLanguage();

    const featured = projects.slice(0, 3);
    const regular = projects.slice(3);

    const oldFeatured = qs('.featured-projects');
    if (oldFeatured) oldFeatured.remove();

    if (featured.length > 0) {
        const wrapper = document.createElement('div');
        wrapper.className = 'featured-projects';
        featured.forEach(project => {
            wrapper.insertAdjacentHTML('beforeend', createProjectCard(project, lang));
        });
        wrapper.querySelectorAll('.project-card').forEach(card => {
            const badge = document.createElement('div');
            badge.className = 'featured-badge';
            badge.textContent = 'Featured \u2B50';
            card.querySelector('.project-info')?.prepend(badge);
        });
        const ref = qs('.filter-bar') || qs('.filter-group') || gamingGrid?.parentNode;
        if (ref) ref.after(wrapper);
    }

    regular.forEach(project => {
        const category = String(project.category || '').toLowerCase();
        const targetGrid = category.includes('game') || category.includes('model') || category.includes('tool') ? gamingGrid : (appsGrid || gamingGrid);
        targetGrid?.insertAdjacentHTML('beforeend', createProjectCard(project, lang));
    });

    qsa('.project-card.reveal').forEach(el => {
        el.classList.add('active');
        window.RashidRevealObserver?.observe(el);
    });

    filterProjects();

    initThumbnails();

    verifyApkButtons();

    qsa('.project-card .btn-primary').forEach(btn => {
        on(btn, 'click', () => {
            const title = btn.closest('.project-card')?.querySelector('h3')?.textContent || 'Unknown';
            const cat = btn.closest('.project-card')?.dataset?.category || 'unknown';
            trackProjectClick(title, cat);
        });
    });
}

// Reveal an APK "Install" button only when its file actually exists.
// Mirrors the HEAD-check used on downloads.html so missing builds never 404.
function verifyApkButtons() {
    qsa('.apk-install-btn').forEach(async (btn) => {
        const url = btn.dataset.apkUrl;
        if (!url) return;
        try {
            const res = await fetch(url, { method: 'HEAD' });
            if (res.ok) btn.style.display = '';
        } catch {
            /* file unavailable — leave the button hidden */
        }
    });
}

function initThumbnails() {
    if (typeof generateThumbnail !== 'function') return;
    const scheduleIdle = window.requestIdleCallback
        ? (cb, opts) => window.requestIdleCallback(cb, opts)
        : (cb) => setTimeout(cb, 1);
    scheduleIdle(() => {
        qsa('[data-project-thumb]').forEach(img => {
            const title = img.dataset.projectThumb;
            if (!title) return;
            const src = generateThumbnail(title, 600);
            if (src) img.src = src;
            img.removeAttribute('data-project-thumb');
        });
    }, { timeout: 500 });
}

function createProjectCard(project, lang) {
    const labels = t(lang);
    const rawTech = project.technologies || project.tags || [];
    const techArray = Array.isArray(rawTech) ? rawTech : String(rawTech).split(',').map(tag => tag.trim());
    const projectLink = safeUrl(project.link || project.project_link);
    const githubLink = safeUrl(project.github_link, '');
    const category = String(project.category || '').toLowerCase();
    const categoryKey = category.includes('game') ? 'games' : (category.includes('model') ? 'model' : (category.includes('tool') ? 'tool' : 'app'));
    const iconClass = safeIconClass(project.image_url);
    const title = escapeHTML(project.title || 'Untitled Project');
    const description = escapeHTML(project.description || '');
    const hasAPK = apkProjects[title];
    const visualContent = project.image_url && !project.image_url.startsWith('fas ')
        ? `<img src="${safeUrl(project.image_url, '')}" alt="${title}" loading="lazy" style="width:100%; height:100%; object-fit:cover; background: linear-gradient(135deg, #1e293b, #0f172a);">`
        : `<img src="../images/screenshots/default.svg" alt="${title}" loading="lazy" style="width:100%; height:100%; object-fit:cover; background: linear-gradient(135deg, #1e293b, #0f172a);">`;
    const isOpenSource = !!project.github_link;
    const isLocal = project.link && /^(games|apps|models)\//.test(project.link);
    const statusBadge = isOpenSource
        ? '<div class="project-status-badge" style="background:rgba(56,189,248,0.15);color:#38bdf8;border-color:rgba(56,189,248,0.3);">\u25CF Open Source</div>'
        : isLocal
            ? '<div class="project-status-badge" style="background:rgba(251,191,36,0.15);color:#fbbf24;border-color:rgba(251,191,36,0.3);">\u25CF Live Demo</div>'
            : '<div class="project-status-badge" style="background:rgba(52,211,153,0.15);color:#34d399;border-color:rgba(52,211,153,0.3);">\u25CF Active</div>';
    const tagsHTML = techArray.filter(Boolean).map(tag => `<span class="tag">${escapeHTML(tag)}</span>`).join('');
    const apkTag = hasAPK ? '<span class="tag apk-tag"><i class="fas fa-android"></i> APK</span>' : '';
    // APK button is hidden by default and only revealed after verifyApkButtons()
    // confirms the file exists — prevents broken 404 links when a build is missing.
    const installBtn = hasAPK
        ? `<a href="${escapeHTML(apkProjects[title].url)}" download class="btn btn-secondary apk-install-btn" data-apk-url="${escapeHTML(apkProjects[title].url)}" style="display:none; padding: 10px 15px; font-size: 0.85rem; margin-right: 10px;" title="${escapeHTML(labels.installTitle)}" aria-label="${escapeHTML(labels.installTitle)}">
            <i class="fab fa-android"></i> <span class="btn-text">${escapeHTML(labels.install)}</span>
        </a>`
        : '';

    return `
        <article class="project-card reveal" data-category="${categoryKey}">
            <div class="project-visual" style="position:relative;overflow:hidden;">${visualContent}${statusBadge}</div>
            <div class="project-info">
                <h3>${title}</h3>
                <p>${description}</p>
                <div class="project-tags">${tagsHTML}${apkTag}</div>
                <div class="project-actions" style="margin-top: 15px;">
                    ${installBtn}
                    <a href="${projectLink}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="padding: 10px 20px; font-size: 0.9rem;">${escapeHTML(labels.viewProject)} <i class="fas fa-external-link-alt" style="font-size: 0.8rem;"></i></a>
                    ${githubLink ? `<a href="${githubLink}" target="_blank" rel="noopener noreferrer" class="btn btn-glass" style="padding: 10px 20px; font-size: 0.9rem; margin-top: 10px;"><i class="fab fa-github"></i> ${escapeHTML(labels.sourceCode)}</a>` : ''}
                </div>
            </div>
        </article>
    `;
}
