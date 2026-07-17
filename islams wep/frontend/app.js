// ملف التفاعلات الرئيسية للصفحة الأمامية (Frontend App Logic)

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. Dark Mode Toggle
    // ==========================================
    const themeToggleBtn = document.getElementById('theme-toggle');
    const body = document.body;

    // Check local storage for saved theme or use time-based adaptive theme
    const savedTheme = localStorage.getItem('theme');
    const currentHour = new Date().getHours();
    const isNightTime = currentHour >= 18 || currentHour < 6;

    if (savedTheme === 'dark' || (!savedTheme && isNightTime)) {
        body.classList.add('dark-mode');
        themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
    }

    themeToggleBtn.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        const theme = body.classList.contains('dark-mode') ? 'dark' : 'light';
        localStorage.setItem('theme', theme);
        themeToggleBtn.innerHTML = theme === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
    });

    // ==========================================
    // 2. Mobile Menu Toggle
    // ==========================================
    const menuToggleBtn = document.getElementById('menu-toggle');
    const mainNav = document.querySelector('.main-nav');

    menuToggleBtn.addEventListener('click', () => {
        mainNav.classList.toggle('nav-open');
    });

    // ==========================================
    // 3. Global Knowledge Search & Overlay Logic
    // ==========================================
    const searchOverlay = document.getElementById('search-overlay');
    const overlayInput = document.getElementById('overlay-search-input');
    const searchResults = document.getElementById('search-results');
    const globalSearchInput = document.getElementById('global-search');

    window.toggleSearchOverlay = (show = null) => {
        if (!searchOverlay) return;
        const isActive = show !== null ? show : !searchOverlay.classList.contains('active');
        searchOverlay.classList.toggle('active', isActive);
        if (isActive) {
            setTimeout(() => overlayInput.focus(), 100);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    };

    // Open on search input click
    if (globalSearchInput) {
        globalSearchInput.addEventListener('click', (e) => {
            e.preventDefault();
            toggleSearchOverlay(true);
        });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') toggleSearchOverlay(false);
    });

    // Mock/Simulated Global Search Logic
    if (overlayInput) {
        overlayInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            if (query.length < 2) {
                searchResults.innerHTML = `
                    <div style="text-align: center; color: var(--text-muted); padding: 40px;">
                        <i class="fa-solid fa-keyboard" style="font-size: 3rem; margin-bottom: 20px; display: block;"></i>
                        ابدأ الكتابة للبحث الشامل...
                    </div>`;
                return;
            }

            // Simulated Results
            const mockResults = [
                { cat: 'قرآن', title: 'سورة البقرة', snippet: 'الآية 255: الله لا إله إلا هو الحي القيوم...' },
                { cat: 'حديث', title: 'صحيح البخاري', snippet: 'إنما الأعمال بالنيات وإنما لكل امرئ ما نوى...' },
                { cat: 'أسماء الله', title: 'الرحمن', snippet: 'كثير الرحمة، وهو اسم مقصور على الله عز وجل...' },
                { cat: 'مقالات', title: 'فضل العلم', snippet: 'يتحدث المقال عن أهمية طلب العلم في الإسلام...' }
            ].filter(r => r.title.includes(query) || r.snippet.includes(query));

            if (mockResults.length === 0) {
                searchResults.innerHTML = '<div style="text-align: center; padding: 40px;">لم يتم العثور على نتائج.</div>';
                return;
            }

            renderOverlayResults(mockResults);
        });
    }

    function renderOverlayResults(results) {
        searchResults.innerHTML = results.map(r => `
            <div class="search-result-item" onclick="window.location.href='knowledge.html?query=${r.title}'">
                <div class="result-category">${r.cat}</div>
                <div class="result-title">${r.title}</div>
                <div class="result-snippet">${r.snippet}</div>
            </div>
        `).join('');
    }

    // إعداد Base URL لطلبات الـ API المحلية الخاصة بنا
    window.API_BASE_URL = '/api';
});
