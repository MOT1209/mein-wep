import { qs, qsa, on } from '../utils/dom.js?v=1.1';

export function initTheme() {
    const themeToggle = qs('#theme-toggle');
    const body = document.body;

    function updateThemeIcon() {
        const icon = themeToggle?.querySelector('i');
        if (!icon) return;
        icon.className = body.classList.contains('light-mode') ? 'fas fa-moon' : 'fas fa-sun';
    }

    qsa('.accent-dot').forEach(dot => {
        on(dot, 'click', () => {
            const color = dot.dataset.color;
            if (!color) return;
            document.documentElement.style.setProperty('--accent', color);
            document.documentElement.style.setProperty('--accent-glow', `${color}33`);
            qsa('.accent-dot').forEach(item => item.classList.remove('active'));
            dot.classList.add('active');
            localStorage.setItem('accentColor', color);
        });
    });

    const savedAccent = localStorage.getItem('accentColor');
    if (savedAccent) {
        document.documentElement.style.setProperty('--accent', savedAccent);
        qsa('.accent-dot').find(dot => dot.dataset.color === savedAccent)?.classList.add('active');
    }

    if (localStorage.getItem('theme') === 'light') body.classList.add('light-mode');
    updateThemeIcon();

    on(themeToggle, 'click', () => {
        body.classList.toggle('light-mode');
        updateThemeIcon();
        localStorage.setItem('theme', body.classList.contains('light-mode') ? 'light' : 'dark');
    });

    const perfToggle = qs('#perf-mode');

    /** إيقاف / استئناف محرك Three.js لتوفير طاقة المعالج */
    function toggleThreeJs(enabled) {
        const avatar = window.__rashidAvatar;
        if (avatar) {
            if (enabled) {
                avatar.resume();
            } else {
                avatar.stop();
            }
        }
    }

    on(perfToggle, 'change', () => {
        const isPerf = perfToggle.checked;
        document.body.classList.toggle('performance-mode', isPerf);
        toggleThreeJs(!isPerf); // أوقف Three.js عند تشغيل وضع الأداء
        localStorage.setItem('perfMode', String(isPerf));
    });

    if (localStorage.getItem('perfMode') === 'true' && perfToggle) {
        perfToggle.checked = true;
        document.body.classList.add('performance-mode');
        toggleThreeJs(false);
    }
}
