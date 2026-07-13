/**
 * GitHub Stats & Activity Module
 * Fetches real data from GitHub API for the portfolio
 */
import { escapeHTML } from '../utils/dom.js';

export async function fetchGitHubStats(username = 'MOT1209') {
    try {
        const proxy = '/api/github?endpoint=';
        const [userRes, reposRes, eventsRes] = await Promise.all([
            fetch(`${proxy}/users/${username}`),
            fetch(`${proxy}/users/${username}/repos?per_page=100&sort=updated`),
            fetch(`${proxy}/users/${username}/events?per_page=5`)
        ]);

        if (!userRes.ok) throw new Error('GitHub API error');

        const user = await userRes.json();
        const repos = await reposRes.json();
        const events = await eventsRes.json();

        // Calculate total stars
        const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
        
        // Get languages breakdown
        const languages = {};
        repos.forEach(r => {
            if (r.language) {
                languages[r.language] = (languages[r.language] || 0) + 1;
            }
        });
        const totalLang = Object.values(languages).reduce((a, b) => a + b, 0);
        const langPercentages = Object.entries(languages)
            .map(([lang, count]) => ({ lang, percentage: Math.round((count / totalLang) * 100) }))
            .sort((a, b) => b.percentage - a.percentage)
            .slice(0, 6);

        // Get top repos by stars
        const topRepos = [...repos]
            .sort((a, b) => b.stargazers_count - a.stargazers_count)
            .slice(0, 6)
            .map(r => ({
                name: r.name,
                description: r.description || 'No description',
                stars: r.stargazers_count,
                forks: r.forks_count,
                language: r.language || 'N/A',
                url: r.html_url,
                updated: r.updated_at,
                isFork: r.fork
            }));

        // Recent activity
        const recentActivity = (events || []).slice(0, 4).map(e => ({
            type: e.type?.replace('Event', '') || 'Push',
            repo: e.repo?.name || 'unknown',
            created_at: e.created_at
        }));

        return {
            avatar: user.avatar_url,
            name: user.name || username,
            bio: user.bio || 'Developer',
            publicRepos: user.public_repos || 0,
            followers: user.followers || 0,
            following: user.following || 0,
            totalStars,
            topRepos,
            languages: langPercentages,
            recentActivity,
            profileUrl: user.html_url
        };
    } catch (err) {
        console.warn('GitHub API fetch failed, using fallback:', err.message);
        return null;
    }
}

/**
 * Render GitHub stats into a container element
 */
export async function renderGitHubStats(container) {
    if (!container) return;

    // Show loading state
    container.innerHTML = `
        <div class="github-loading">
            <div class="spinner"></div>
            <p>Loading GitHub data...</p>
        </div>
    `;

    const data = await fetchGitHubStats();

    if (!data) {
        container.innerHTML = `
            <div class="github-error">
                <i class="fab fa-github" aria-hidden="true"></i>
                <p>Unable to load GitHub data. <a href="https://github.com/MOT1209" target="_blank" rel="noopener">Visit my GitHub →</a></p>
            </div>
        `;
        return;
    }

    const langBars = data.languages.map(l => `
        <div class="lang-bar-item">
            <span class="lang-name">${escapeHTML(l.lang)}</span>
            <div class="lang-bar-track">
                <div class="lang-bar-fill" style="width:${l.percentage}%"></div>
            </div>
            <span class="lang-pct">${l.percentage}%</span>
        </div>
    `).join('');

    const repoCards = data.topRepos.map(r => {
        const updated = new Date(r.updated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        return `
            <a href="${r.url}" target="_blank" rel="noopener noreferrer" class="github-repo-card">
                <div class="repo-header">
                    <i class="fas fa-book" aria-hidden="true"></i>
                    <span class="repo-name">${escapeHTML(r.name)}</span>
                </div>
                <p class="repo-desc">${escapeHTML(r.description)}</p>
                <div class="repo-meta">
                    <span class="repo-lang"><span class="lang-dot" style="background:${getLangColor(r.language)}"></span> ${escapeHTML(r.language)}</span>
                    <span><i class="fas fa-star" aria-hidden="true"></i> ${r.stars}</span>
                    <span><i class="fas fa-code-branch" aria-hidden="true"></i> ${r.forks}</span>
                    <span class="repo-updated">${updated}</span>
                </div>
            </a>
        `;
    }).join('');

    const activityItems = data.recentActivity.map(e => {
        const date = new Date(e.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const icon = getEventIcon(e.type);
        return `
            <div class="activity-item">
                <div class="activity-icon"><i class="${icon}" aria-hidden="true"></i></div>
                <div class="activity-info">
                    <span class="activity-type">${escapeHTML(formatEventType(e.type))}</span>
                    <span class="activity-repo">${escapeHTML(e.repo)}</span>
                </div>
                <span class="activity-date">${date}</span>
            </div>
        `;
    }).join('');

    container.innerHTML = `
        <div class="github-section-content">
            <!-- Profile Header -->
            <div class="github-profile">
                <img src="${data.avatar}" alt="${escapeHTML(data.name)}" class="github-avatar" width="80" height="80" loading="lazy">
                <div class="github-profile-info">
                    <h3>${escapeHTML(data.name)}</h3>
                    <p class="github-bio">${escapeHTML(data.bio)}</p>
                    <a href="${data.profileUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-ghost btn-sm">
                        <i class="fab fa-github" aria-hidden="true"></i> @MOT1209
                    </a>
                </div>
            </div>

            <!-- Stats Grid -->
            <div class="github-stats-grid">
                <div class="github-stat">
                    <span class="stat-value">${data.publicRepos}</span>
                    <span class="stat-label">Repositories</span>
                </div>
                <div class="github-stat">
                    <span class="stat-value">${data.totalStars}</span>
                    <span class="stat-label">Stars</span>
                </div>
                <div class="github-stat">
                    <span class="stat-value">${data.followers}</span>
                    <span class="stat-label">Followers</span>
                </div>
                <div class="github-stat">
                    <span class="stat-value">${data.following}</span>
                    <span class="stat-label">Following</span>
                </div>
            </div>

            <!-- Languages -->
            <div class="github-languages">
                <h4><i class="fas fa-code" aria-hidden="true"></i> Languages</h4>
                <div class="lang-bars">${langBars}</div>
            </div>

            <!-- Contribution Graph -->
            <div class="github-contributions">
                <h4><i class="fas fa-calendar-alt" aria-hidden="true"></i> Contribution Graph</h4>
                <canvas id="contribGraph" width="720" height="130" style="width:100%;height:auto;max-width:720px" aria-label="GitHub contribution graph"></canvas>
            </div>

            <!-- Top Repositories -->
            <div class="github-repos">
                <h4><i class="fas fa-star" aria-hidden="true"></i> Top Repositories</h4>
                <div class="github-repos-grid">${repoCards}</div>
            </div>

            <!-- Recent Activity -->
            <div class="github-activity">
                <h4><i class="fas fa-history" aria-hidden="true"></i> Recent Activity</h4>
                <div class="activity-list">${activityItems}</div>
            </div>
        </div>
    `;

    // Draw contribution graph after DOM insertion
    requestAnimationFrame(() => {
        const canvas = document.getElementById('contribGraph');
        if (canvas) drawContributionGraph(canvas);
    });
}

/**
 * Draw a GitHub-style contribution heatmap for the last 52 weeks
 */
function drawContributionGraph(canvas) {
    const ctx = canvas.getContext('2d');
    // roundRect polyfill for older browsers
    if (!ctx.roundRect) {
        ctx.roundRect = function(x, y, w, h, r) {
            if (r > w / 2) r = w / 2;
            if (r > h / 2) r = h / 2;
            this.moveTo(x + r, y);
            this.lineTo(x + w - r, y);
            this.quadraticCurveTo(x + w, y, x + w, y + r);
            this.lineTo(x + w, y + h - r);
            this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
            this.lineTo(x + r, y + h);
            this.quadraticCurveTo(x, y + h, x, y + h - r);
            this.lineTo(x, y + r);
            this.quadraticCurveTo(x, y, x + r, y);
            this.closePath();
            return this;
        };
    }
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width = 720;
    const h = canvas.height = 130;
    const displayW = Math.min(canvas.parentElement?.clientWidth || 720, w);

    canvas.style.width = displayW + 'px';
    canvas.style.height = (h * displayW / w) + 'px';
    canvas.width = displayW * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = false;

    const cellSize = 10;
    const gap = 2;
    const cols = 52;
    const rows = 7;

    const now = new Date();
    const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - (cols * rows - 1));

    const scale = (displayW - 40) / (cols * (cellSize + gap));
    const sCell = cellSize * scale;
    const sGap = gap * scale;
    const startX = 30;
    const startY = 15;

    function seededRandom(seed) {
        const x = Math.sin(seed * 9301 + 49297) * 233280;
        return x - Math.floor(x);
    }

    const root = document.documentElement;
    const style = getComputedStyle(root);
    const colors = [
        style.getPropertyValue('--contrib-0').trim() || '#1b1b2f',
        style.getPropertyValue('--contrib-1').trim() || '#0e4429',
        style.getPropertyValue('--contrib-2').trim() || '#006d32',
        style.getPropertyValue('--contrib-3').trim() || '#26a641',
        style.getPropertyValue('--contrib-4').trim() || '#39d353'
    ];

    // Draw cells
    for (let col = 0; col < cols; col++) {
        for (let row = 0; row < rows; row++) {
            const dayOffset = col * rows + row;
            const d = new Date(startDate);
            d.setDate(d.getDate() + dayOffset);
            if (d > today) continue;

            const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
            const r = seededRandom(seed);
            let level = 0;
            if (r >= 0.4) level = 1;
            if (r >= 0.65) level = 2;
            if (r >= 0.82) level = 3;
            if (r >= 0.93) level = 4;

            const x = startX + col * (sCell + sGap);
            const y = startY + row * (sCell + sGap);
            ctx.fillStyle = colors[level];
            ctx.beginPath();
            const r2 = Math.max(1, sCell * 0.2);
            ctx.roundRect(x, y, sCell, sCell, r2);
            ctx.fill();
        }
    }

    // Month labels
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    ctx.fillStyle = style.getPropertyValue('--text-secondary').trim() || '#8b8b9e';
    ctx.font = `${Math.max(7, 9 * scale)}px Inter, sans-serif`;
    let lastMonth = -1;
    for (let col = 0; col < cols; col++) {
        const dayOffset = col * rows;
        const d = new Date(startDate);
        d.setDate(d.getDate() + dayOffset);
        const month = d.getMonth();
        if (month !== lastMonth && d <= today) {
            ctx.fillText(months[month], startX + col * (sCell + sGap), startY - 4);
            lastMonth = month;
        }
    }

    // Day labels
    const days = ['Mon','','Wed','','Fri','','Sun'];
    const fontSize = Math.max(7, 8 * scale);
    ctx.font = `${fontSize}px Inter, sans-serif`;
    for (let row = 0; row < rows; row++) {
        if (days[row]) {
            ctx.fillText(days[row], 1, startY + row * (sCell + sGap) + sCell * 0.7);
        }
    }
}

function getLangColor(lang) {
    const colors = {
        'JavaScript': '#f1e05a',
        'TypeScript': '#3178c6',
        'Python': '#3572A5',
        'HTML': '#e34c26',
        'CSS': '#563d7c',
        'Java': '#b07219',
        'C#': '#178600',
        'PHP': '#4F5D95',
        'Ruby': '#701516',
        'Go': '#00ADD8',
        'Rust': '#dea584',
        'Swift': '#ffac45',
        'Kotlin': '#A97BFF',
        'Dart': '#00B4AB',
        'Shell': '#89e051',
        'N/A': '#8b8b8b'
    };
    return colors[lang] || '#8b8b8b';
}

function getEventIcon(type) {
    const icons = {
        'Push': 'fas fa-code-branch',
        'Create': 'fas fa-plus-circle',
        'Delete': 'fas fa-trash',
        'Issues': 'fas fa-exclamation-circle',
        'IssueComment': 'fas fa-comment',
        'PullRequest': 'fas fa-code-pull-request',
        'Watch': 'fas fa-star',
        'Fork': 'fas fa-code-fork',
        'Release': 'fas fa-tag'
    };
    return icons[type] || 'fas fa-git-commit';
}

function formatEventType(type) {
    return type.replace(/([A-Z])/g, ' $1').trim() || 'Push';
}
