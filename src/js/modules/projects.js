import { qs, qsa, on, escapeHTML, safeIconClass, safeUrl } from '../utils/dom.js?v=1.1';
import { countProjects, fetchPublicProjects } from '../services/supabase.js?v=1.3';
import { getCurrentLanguage, t } from './translations.js?v=1.1';

const fallbackProjects = [
    { title: 'Rust Construction', category: 'Game', description: '3D building game with physics and resource management. Build structures, manage resources, survive!', link: 'rust-game/index.html', image_url: 'fas fa-cubes', technologies: ['Three.js', '3D', 'Physics'] },
    { title: 'Farm Empire', category: 'Game', description: 'Immersive farming simulation with crops, animals, and economy. Grow your farm empire!', link: 'farm-game/index.html', image_url: 'fas fa-tractor', technologies: ['WebGL', 'Simulation', 'Economy'] },
    { title: 'Rashid AI', category: 'App', description: 'Advanced conversational AI assistant powered by Gemini & OpenRouter. Multilingual support.', link: 'Rashid-app/index.html', image_url: 'fas fa-robot', technologies: ['Gemini', 'OpenRouter', 'AI'] },
    { title: 'Quran Pro', category: 'App', description: 'Complete Quran with tafsir, 40+ reciters, search, and bookmarks. Full offline support.', link: 'quran-app/index.html', image_url: 'fas fa-book-open', technologies: ['Audio', 'PWA', 'Offline'] },
    { title: 'Calculator Vault', category: 'App', description: 'Privacy-focused calculator with secret vault. Hide files behind a calculator interface!', link: 'calculator-vault/index.html', image_url: 'fas fa-calculator', technologies: ['Security', 'PWA', 'Privacy'] },
    { title: 'Quiz Master', category: 'App', description: 'Interactive quiz platform with multiple categories, scoring, and progress tracking.', link: 'quiz-app/index.html', image_url: 'fas fa-question-circle', technologies: ['Education', 'PWA', 'Gamification'] },
    { title: 'Rashid AI v2.0', category: 'Model', description: 'The flagship AI model of Rashid. Multilingual conversational AI with advanced capabilities.', link: 'Rashid-app/index.html', image_url: 'fas fa-brain', technologies: ['Gemini API', 'OpenRouter', '10+ Languages'] },
    { title: 'Game Engine Core', category: 'Model', description: 'Proprietary 3D game engine built with Three.js. Physics, AI behaviors, procedural generation.', link: '#projects', image_url: 'fas fa-cog', technologies: ['Three.js', 'Real-time', '3D'] }
];

export function initProjectFilters() {
    qsa('.filter-btn').forEach(btn => {
        on(btn, 'click', () => {
            qsa('.filter-btn').forEach(item => item.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;
            qsa('.project-card').forEach(card => {
                const isMatch = filter === 'all' || card.dataset.category === filter;
                card.style.opacity = isMatch ? '1' : '0';
                card.style.transform = isMatch ? 'translateY(0)' : 'translateY(20px)';
                setTimeout(() => {
                    card.style.display = isMatch ? 'block' : 'none';
                }, isMatch ? 0 : 300);
            });
        });
    });
}

export async function initProjects() {
    const gamingGrid = qs('#gaming-grid');
    if (!gamingGrid) return;

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
    projects.forEach(project => {
        const category = String(project.category || '').toLowerCase();
        const targetGrid = category.includes('game') ? gamingGrid : (appsGrid || gamingGrid);
        targetGrid?.insertAdjacentHTML('beforeend', createProjectCard(project, lang));
    });

    qsa('.project-card.reveal').forEach(el => {
        el.classList.add('active');
        window.RashidRevealObserver?.observe(el);
    });
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
    const visualContent = iconClass
        ? `<i class="${iconClass}"></i>`
        : project.image_url
            ? `<img src="${safeUrl(project.image_url, '')}" alt="${title}" loading="lazy" style="width:100%; height:100%; object-fit:cover;">`
            : '<i class="fas fa-cube"></i>';
    const tagsHTML = techArray.filter(Boolean).map(tag => `<span class="tag">${escapeHTML(tag)}</span>`).join('');
    const installBtn = isPWA ? `
        <button class="btn btn-secondary install-btn" data-project="${projectLink}" style="padding: 10px 15px; font-size: 0.85rem; margin-right: 10px;" title="${escapeHTML(labels.installTitle)}" aria-label="${escapeHTML(labels.installTitle)}">
            <i class="fas fa-mobile-alt"></i> <span class="btn-text">${escapeHTML(labels.install)}</span>
        </button>
    ` : '';

    return `
        <article class="project-card reveal" data-category="${categoryKey}">
            <div class="project-visual">${visualContent}</div>
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
