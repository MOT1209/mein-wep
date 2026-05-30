import { trackProjectClick } from '../services/analytics.js?v=1.0';
import { qs, qsa, on, escapeHTML, safeIconClass, safeUrl } from '../utils/dom.js?v=1.1';
import { countProjects, fetchPublicProjects } from '../services/supabase.js?v=1.3';
import { getCurrentLanguage, t } from './translations.js?v=1.1';
import { generateThumbnail, getThumbnailData } from '../utils/thumbnails.js?v=1.0';

let activeFilter = 'all';
let searchQuery = '';

const fallbackProjects = [
    // ── GitHub Repositories (MOT1209) ──
    { title: 'Alking', category: 'App', description: 'Full-stack community-driven application built with Next.js 14 and Supabase. A free-to-use platform to connect and help others.', link: 'https://github.com/MOT1209/Alking', github_link: 'https://github.com/MOT1209/Alking', image_url: 'fas fa-users', technologies: ['Next.js', 'Supabase', 'Full-Stack'] },
    { title: 'FromLiten', category: 'App', description: 'Personal AI workspace and command center — the operating hub for all Rashid projects, vault, games, and creative systems.', link: 'https://github.com/MOT1209/fromliten', github_link: 'https://github.com/MOT1209/fromliten', image_url: 'fas fa-terminal', technologies: ['JavaScript', 'PWA', 'Supabase'] },
    { title: 'Gem-PRO', category: 'App', description: 'AI-powered productivity tool leveraging the Gemini API for intelligent automation and creative assistance.', link: 'https://github.com/MOT1209/Gem-PRO', github_link: 'https://github.com/MOT1209/Gem-PRO', image_url: 'fas fa-gem', technologies: ['JavaScript', 'Gemini API', 'AI'] },
    { title: 'islams-wep', category: 'App', description: 'Islamic web platform featuring Quran, prayers, and educational resources with a clean modern interface.', link: 'https://github.com/MOT1209/islams-wep', github_link: 'https://github.com/MOT1209/islams-wep', image_url: 'fas fa-mosque', technologies: ['HTML', 'CSS', 'JavaScript'] },
    { title: 'BOTTIKTOK2', category: 'App', description: 'Social media automation bot for TikTok — streamlining content workflows and engagement.', link: 'https://github.com/MOT1209/BOTTIKTOK2', github_link: 'https://github.com/MOT1209/BOTTIKTOK2', image_url: 'fas fa-robot', technologies: ['JavaScript', 'Automation', 'Bot'] },
    { title: 'nicht-projekt-vergessen', category: 'App', description: 'Task management & reminder app in TypeScript — never forget a project again! Organize and track all your work.', link: 'https://github.com/MOT1209/nicht-projekt-vergessen', github_link: 'https://github.com/MOT1209/nicht-projekt-vergessen', image_url: 'fas fa-tasks', technologies: ['TypeScript', 'Productivity', 'PWA'] },
    { title: 'RashidClaw', category: 'App', description: 'Utility toolkit by Rashid — a collection of developer tools and CLI helpers for rapid prototyping.', link: 'https://github.com/MOT1209/RashidClaw', github_link: 'https://github.com/MOT1209/RashidClaw', image_url: 'fas fa-toolbox', technologies: ['Utility', 'CLI', 'Tools'] },
    { title: 'bara-Alsalfhe', category: 'App', description: 'Creative web project featuring cultural content and interactive experiences built with JavaScript.', link: 'https://github.com/MOT1209/bara-Alsalfhe', github_link: 'https://github.com/MOT1209/bara-Alsalfhe', image_url: 'fas fa-palette', technologies: ['JavaScript', 'Creative', 'Web'] },
    // ── Local Workspace Projects ──
    { title: 'Rust Construction', category: 'Game', description: '3D building game with physics and resource management. Build structures, manage resources, survive!', link: 'games/rust-game/index.html', image_url: 'fas fa-cubes', technologies: ['Three.js', '3D', 'Physics'] },
    { title: 'Farm Empire', category: 'Game', description: 'Immersive farming simulation with crops, animals, and economy. Grow your farm empire!', link: 'games/farm-game/index.html', image_url: 'fas fa-tractor', technologies: ['WebGL', 'Simulation', 'Economy'] },
    { title: 'Rashid AI', category: 'Model', description: 'Advanced conversational AI assistant powered by Gemini & OpenRouter. Multilingual support with 10+ languages.', link: 'models/Rashid-app/index.html', image_url: 'fas fa-brain', technologies: ['Gemini API', 'OpenRouter', 'AI'] },
    { title: 'Quran Pro', category: 'App', description: 'Complete Quran with tafsir, 40+ reciters, search, and bookmarks. Full offline support.', link: 'apps/quran-app/index.html', image_url: 'fas fa-book-open', technologies: ['Audio', 'PWA', 'Offline'] },
    { title: 'Calculator Vault', category: 'App', description: 'Privacy-focused calculator with secret vault. Hide files behind a calculator interface!', link: 'apps/calculator-vault/index.html', image_url: 'fas fa-calculator', technologies: ['Security', 'PWA', 'Privacy'] },
    { title: 'Quiz Master', category: 'App', description: 'Interactive quiz platform with multiple categories, scoring, and progress tracking.', link: 'apps/quiz-app/index.html', image_url: 'fas fa-question-circle', technologies: ['Education', 'PWA', 'Gamification'] }
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
            adminLink.innerHTML = 'Internal Access <span style="color:#2ecc71; margin-left: 5px;">● Online</span>';
        }
    }

    if (error || !projects?.length) {
        if (error) console.warn('Error loading projects from DB. Using local fallback:', error);
        return;
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
        const targetGrid = category.includes('game') ? gamingGrid : (appsGrid || gamingGrid);
        targetGrid?.insertAdjacentHTML('beforeend', createProjectCard(project, lang));
    });

    qsa('.project-card.reveal').forEach(el => {
        el.classList.add('active');
        window.RashidRevealObserver?.observe(el);
    });

    filterProjects();

    initThumbnails();

    qsa('.project-card .btn-primary').forEach(btn => {
        on(btn, 'click', () => {
            const title = btn.closest('.project-card')?.querySelector('h3')?.textContent || 'Unknown';
            const cat = btn.closest('.project-card')?.dataset?.category || 'unknown';
            trackProjectClick(title, cat);
        });
    });
}

function initThumbnails() {
    if (typeof generateThumbnail !== 'function') return;
    requestIdleCallback(() => {
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
    const categoryKey = category.includes('game') ? 'games' : (category.includes('model') ? 'model' : 'app');
    const iconClass = safeIconClass(project.image_url);
    const title = escapeHTML(project.title || 'Untitled Project');
    const description = escapeHTML(project.description || '');
    const pwaProjects = ['quran-app', 'farm-game', 'rust-game', 'calculator-vault', 'quiz-app'];
    const isPWA = pwaProjects.some(slug => projectLink.includes(slug));
    const visualContent = project.image_url && !project.image_url.startsWith('fas ')
        ? `<img src="${safeUrl(project.image_url, '')}" alt="${title}" loading="lazy" style="width:100%; height:100%; object-fit:cover;">`
        : `<img src="" alt="${title}" data-project-thumb="${escapeHTML(title)}" loading="lazy" style="width:100%; height:100%; object-fit:cover; background: linear-gradient(135deg, #1e293b, #0f172a);">`;
    const isOpenSource = !!project.github_link;
    const isLocal = project.link && /^(games|apps|models)\//.test(project.link);
    const statusBadge = isOpenSource
        ? '<div class="project-status-badge" style="background:rgba(56,189,248,0.15);color:#38bdf8;border-color:rgba(56,189,248,0.3);">\u25CF Open Source</div>'
        : isLocal
            ? '<div class="project-status-badge" style="background:rgba(251,191,36,0.15);color:#fbbf24;border-color:rgba(251,191,36,0.3);">\u25CF Live Demo</div>'
            : '<div class="project-status-badge" style="background:rgba(52,211,153,0.15);color:#34d399;border-color:rgba(52,211,153,0.3);">\u25CF Active</div>';
    const tagsHTML = techArray.filter(Boolean).map(tag => `<span class="tag">${escapeHTML(tag)}</span>`).join('');
    const installBtn = isPWA ? `
        <button class="btn btn-secondary install-btn" data-project="${projectLink}" style="padding: 10px 15px; font-size: 0.85rem; margin-right: 10px;" title="${escapeHTML(labels.installTitle)}" aria-label="${escapeHTML(labels.installTitle)}">
            <i class="fas fa-mobile-alt"></i> <span class="btn-text">${escapeHTML(labels.install)}</span>
        </button>
    ` : '';

    return `
        <article class="project-card reveal" data-category="${categoryKey}">
            <div class="project-visual" style="position:relative;overflow:hidden;">${visualContent}${statusBadge}</div>
            <div class="project-info">
                <h3>${title}</h3>
                <p>${description}</p>
                <div class="project-tags">${tagsHTML}${isPWA ? '<span class="tag pwa-tag"><i class="fas fa-download"></i> PWA</span>' : ''}</div>
                <div class="project-actions" style="margin-top: 15px;">
                    ${installBtn}
                    <a href="${projectLink}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="padding: 10px 20px; font-size: 0.9rem;">${escapeHTML(labels.viewProject)} <i class="fas fa-external-link-alt" style="font-size: 0.8rem;"></i></a>
                    ${githubLink ? `<a href="${githubLink}" target="_blank" rel="noopener noreferrer" class="btn btn-glass" style="padding: 10px 20px; font-size: 0.9rem; margin-top: 10px;"><i class="fab fa-github"></i> ${escapeHTML(labels.sourceCode)}</a>` : ''}
                </div>
            </div>
        </article>
    `;
}
