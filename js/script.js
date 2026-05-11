/**
 * Rashid Portfolio v2.0
 * Main Script - Handles UI, Theme, and Admin Logic
 */

(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {

        // =========================================
        // 1. THEME & ACCENT LOGIC
        // =========================================
        const themeToggle = document.getElementById('theme-toggle');
        const body = document.body;

        function updateThemeIcon() {
            const icon = themeToggle?.querySelector('i');
            if (!icon) return;
            icon.className = body.classList.contains('light-mode') ? 'fas fa-moon' : 'fas fa-sun';
        }

        // Accent Selection
        const accentDots = document.querySelectorAll('.accent-dot');
        accentDots.forEach(dot => {
            dot.addEventListener('click', () => {
                const color = dot.dataset.color;
                document.documentElement.style.setProperty('--accent', color);
                document.documentElement.style.setProperty('--accent-glow', `${color}33`); // Adding alpha

                accentDots.forEach(d => d.classList.remove('active'));
                dot.classList.add('active');
                localStorage.setItem('accentColor', color);
            });
        });

        // Load saved preferences
        const savedAccent = localStorage.getItem('accentColor');
        if (savedAccent) {
            document.documentElement.style.setProperty('--accent', savedAccent);
            const activeDot = Array.from(accentDots).find(d => d.dataset.color === savedAccent);
            if (activeDot) {
                accentDots.forEach(d => d.classList.remove('active'));
                activeDot.classList.add('active');
            }
        }

        if (localStorage.getItem('theme') === 'light') {
            body.classList.add('light-mode');
            updateThemeIcon();
        }

        themeToggle?.addEventListener('click', () => {
            body.classList.toggle('light-mode');
            updateThemeIcon();
            localStorage.setItem('theme', body.classList.contains('light-mode') ? 'light' : 'dark');
        });

        // =========================================
        // 2. PREMIUM UI LOGIC
        // =========================================

        // Sticky Navbar
        const navbar = document.querySelector('.navbar');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) navbar.classList.add('scrolled');
            else navbar.classList.remove('scrolled');
        });

        // Perf Mode
        const perfToggle = document.getElementById('perf-mode');
        const bgMesh = document.querySelector('.bg-mesh');

        perfToggle?.addEventListener('change', () => {
            if (perfToggle.checked) bgMesh.style.display = 'none';
            else bgMesh.style.display = 'block';
            localStorage.setItem('perfMode', perfToggle.checked);
        });

        if (localStorage.getItem('perfMode') === 'true' && perfToggle) {
            perfToggle.checked = true;
            bgMesh.style.display = 'none';
        }

        // =========================================
        // 3. SETTINGS MODAL
        // =========================================
        const settingsBtn = document.getElementById('settings-btn');
        const settingsModal = document.getElementById('settings-modal');
        const settingsOverlay = document.getElementById('settings-overlay');
        const closeSettings = document.getElementById('close-settings');

        function toggleSettings(show) {
            settingsModal?.classList.toggle('active', show);
            settingsOverlay?.classList.toggle('active', show);
            body.style.overflow = show ? 'hidden' : '';
        }

        settingsBtn?.addEventListener('click', () => toggleSettings(true));
        closeSettings?.addEventListener('click', () => toggleSettings(false));
        settingsOverlay?.addEventListener('click', () => toggleSettings(false));

        // Language Picker Logic (Premium Buttons)
        const langBtns = document.querySelectorAll('.lang-btn');
        langBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const langCode = btn.getAttribute('data-lang');
                document.cookie = `googtrans=/en/${langCode}; path=/`;
                localStorage.setItem('lastLang', langCode);

                langBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                setTimeout(() => location.reload(), 300);
            });
        });

        // Legacy Language Picker (Select list)
        const langOptions = document.querySelectorAll('.lang-option');
        langOptions.forEach(opt => {
            opt.addEventListener('click', () => {
                const langCode = opt.getAttribute('data-lang');
                document.cookie = `googtrans=/en/${langCode}; path=/`;
                localStorage.setItem('lastLang', langCode);
                setTimeout(() => location.reload(), 300);
            });
        });

        // =========================================
        // 4. PROJECT FILTERS
        // =========================================
        const filterBtns = document.querySelectorAll('.filter-btn');
        const projectCategories = document.querySelectorAll('.project-category');

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filter = btn.dataset.filter;
                projectCategories.forEach(cat => {
                    const isMatch = filter === 'all' || cat.dataset.category === filter;
                    cat.style.opacity = isMatch ? '1' : '0';
                    cat.style.transform = isMatch ? 'translateY(0)' : 'translateY(20px)';
                    setTimeout(() => cat.style.display = isMatch ? 'block' : 'none', isMatch ? 0 : 300);
                });
            });
        });


        // =========================================
        // 2. MOBILE MENU
        // =========================================
        const hamburger = document.querySelector('.hamburger');
        const mobileMenu = document.querySelector('.mobile-menu');
        const mobileLinks = document.querySelectorAll('.mobile-menu a');
        const bars = document.querySelectorAll('.bar');

        if (hamburger && mobileMenu) {
            hamburger.addEventListener('click', () => {
                mobileMenu.classList.toggle('active');
                if (mobileMenu.classList.contains('active')) {
                    bars[0].style.transform = 'rotate(-45deg) translate(-5px, 6px)';
                    bars[1].style.opacity = '0';
                    bars[2].style.transform = 'rotate(45deg) translate(-5px, -6px)';
                } else {
                    bars[0].style.transform = 'none';
                    bars[1].style.opacity = '1';
                    bars[2].style.transform = 'none';
                }
            });

            mobileLinks.forEach(link => {
                link.addEventListener('click', () => {
                    mobileMenu.classList.remove('active');
                    bars[0].style.transform = 'none';
                    bars[1].style.opacity = '1';
                    bars[2].style.transform = 'none';
                });
            });
        }

        // =========================================
        // 3. SCROLL ANIMATIONS
        // =========================================
        const observerOptions = {
            threshold: 0.15,
            rootMargin: "0px 0px -50px 0px"
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

        // Smooth Scroll
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                if (targetId === '#' || targetId === '') return;
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    const headerOffset = 70;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth"
                    });
                }
            });
        });

        // =========================================
        // 5. DYNAMIC CONTENT & ADMIN SYNC (LOCALSTORAGE)
        // =========================================

        // 1. Maintenance Mode Check
        if (localStorage.getItem('maintenanceMode') === 'true') {
            document.body.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;background:#000;color:#fff;font-family:sans-serif;flex-direction:column;"><h1>System Under Maintenance</h1><p>We will be back shortly.</p></div>';
            return; // Stop execution
        }

        // 2. Load Content Updates
        const savedContent = JSON.parse(localStorage.getItem('siteContent') || '{}');
        if (savedContent.title) {
            // Try to find the hero subtitle/title
            const heroSubtitle = document.querySelector('.hero-subtitle');
            if (heroSubtitle) heroSubtitle.innerText = savedContent.title;
        }
        if (savedContent.about) {
            const aboutP = document.querySelector('#about p') || document.querySelector('.about-text p');
            if (aboutP) aboutP.innerText = savedContent.about;
        }

        // Note: Legacy project visibility logic removed as we migrated to Supabase.

        const savedSettings = JSON.parse(localStorage.getItem('siteSettings') || '{}');
        const contactSpans = document.querySelectorAll('.contact-info span');
        if (savedSettings.email && contactSpans[0]) contactSpans[0].innerText = savedSettings.email;
        if (savedSettings.location && contactSpans[1]) contactSpans[1].innerText = savedSettings.location;


        // ============================================================
        // 5. DYNAMIC CONTENT & VISITORS (SUPABASE)
        // ============================================================

        const translations = {
            ar: {
                viewProject: "عرض المشروع",
                sourceCode: "الكود المصدري"
            },
            en: {
                viewProject: "View Project",
                sourceCode: "Source Code"
            }
        };

        async function loadSiteData() {
            const gamingGrid = document.getElementById('gaming-grid');
            const appsGrid = document.getElementById('apps-grid');

            // Show connecting status
            if (gamingGrid) gamingGrid.innerHTML = '<p style="color:var(--accent); text-align:center; grid-column:1/-1;">Checking connection... (v2.2)</p>';

            // Fallback Data (Local Projects)
            const localProjects = [
                // === GAMES ===
                {
                    title: 'Rust Construction',
                    category: 'Game',
                    status: 'Public',
                    description: '3D building game with physics and resource management. Build structures, manage resources, survive!',
                    link: 'rust-game/index.html',
                    image_url: 'fas fa-cubes',
                    technologies: ['Three.js', '3D', 'Physics']
                },
                {
                    title: 'Farm Empire',
                    category: 'Game',
                    status: 'Public',
                    description: 'Immersive farming simulation with crops, animals, and economy. Grow your farm empire!',
                    link: 'farm-game/index.html',
                    image_url: 'fas fa-tractor',
                    technologies: ['WebGL', 'Simulation', 'Economy']
                },
                // === APPS ===
                {
                    title: 'Rashid AI',
                    category: 'App',
                    status: 'Public',
                    description: 'Advanced conversational AI assistant powered by Gemini & OpenRouter. Multilingual support.',
                    link: 'Rashid-app/index.html',
                    image_url: 'fas fa-robot',
                    technologies: ['Gemini', 'OpenRouter', 'AI']
                },
                {
                    title: 'Quran Pro',
                    category: 'App',
                    status: 'Public',
                    description: 'Complete Quran with tafsir, 40+ reciters, search, and bookmarks. Full offline support.',
                    link: 'quran-app/index.html',
                    image_url: 'fas fa-book-open',
                    technologies: ['Audio', 'PWA', 'Offline']
                },
                {
                    title: 'Calculator Vault',
                    category: 'App',
                    status: 'Public',
                    description: 'Privacy-focused calculator with secret vault. Hide files behind a calculator interface!',
                    link: 'calculator-vault/index.html',
                    image_url: 'fas fa-calculator',
                    technologies: ['Security', 'PWA', 'Privacy']
                },
                {
                    title: 'Quiz Master',
                    category: 'App',
                    status: 'Public',
                    description: 'Interactive quiz platform with multiple categories, scoring, and progress tracking.',
                    link: 'quiz-app/index.html',
                    image_url: 'fas fa-question-circle',
                    technologies: ['Education', 'PWA', 'Gamification']
                },
                // === MODELS ===
                {
                    title: 'Rashid AI v2.0',
                    category: 'Model',
                    status: 'Public',
                    description: 'The flagship AI model of OpenCode. Multilingual conversational AI with advanced capabilities.',
                    link: 'Rashid-app/index.html',
                    image_url: 'fas fa-brain',
                    technologies: ['Gemini API', 'OpenRouter', '10+ Languages']
                },
                {
                    title: 'Game Engine Core',
                    category: 'Model',
                    status: 'Public',
                    description: 'Proprietary 3D game engine built with Three.js. Physics, AI behaviors, procedural generation.',
                    link: '#games',
                    image_url: 'fas fa-cog',
                    technologies: ['Three.js', 'Real-time', '3D']
                }
            ];

            let useFallback = false;

            if (typeof supabaseClient === 'undefined') {
                console.warn("Supabase client missing. Using local fallback.");
                useFallback = true;
            } else {
                try {
                    // 1. Test Fetch (Counting)
                    const { count, error: connError } = await supabaseClient
                        .from('projects')
                        .select('id', { count: 'exact', head: true });

                    if (connError) throw connError;

                    console.log("✅ Connected to Supabase! Projects count:", count);

                    const adminLink = document.querySelector('.admin-link');
                    if (adminLink) {
                        adminLink.innerHTML = 'Internal Access <span style="color:#2ecc71; margin-left: 5px;">● Online</span>';
                    }

                    // 2. Fetch Projects
                    const { data: projects, error: fetchError } = await supabaseClient
                        .from('projects')
                        .select('*')
                        .eq('status', 'Public')
                        .order('created_at', { ascending: false });

                    if (fetchError) throw fetchError;

                    if (projects && projects.length > 0) {
                        console.log("Projects loaded from DB:", projects.map(p => `${p.title} (${p.category})`));
                        renderProjects(projects);
                    } else {
                        console.warn("No public projects found in DB. Using fallback.");
                        useFallback = true;
                    }

                } catch (err) {
                    console.error("Error loading projects from DB:", err);
                    useFallback = true;
                }
            }

            if (useFallback) {
                console.log("Rendering local fallback projects.");
                renderProjects(localProjects);

                // Optional: visual indicator that we are in offline/local mode
                if (gamingGrid) {
                    const status = document.createElement('div');
                    status.style.cssText = "grid-column: 1/-1; text-align: center; font-size: 0.8rem; opacity: 0.6; margin-bottom: 1rem; width: 100%;";
                    status.innerText = "Loaded from Local System (Offline Mode)";
                    gamingGrid.prepend(status);
                }
            }
        }

        function renderProjects(projects) {
            const gamingGrid = document.getElementById('gaming-grid');
            const appsGrid = document.getElementById('apps-grid');

            if (gamingGrid) gamingGrid.innerHTML = '';
            if (appsGrid) appsGrid.innerHTML = '';

            const lang = localStorage.getItem('lastLang') || 'en';

            projects.forEach(project => {
                const cardHTML = createProjectCard(project, lang);
                // Normalize category to lowercase for comparison
                const cat = (project.category || '').toLowerCase().trim();

                // Flexible check: matches 'game', 'games', 'gaming'
                const isGame = cat.includes('game') || cat.includes('gaming');
                const isOpenSource = cat.includes('source') || cat.includes('open');

                // For now, Open Source projects also go to Apps grid unless we create a 3rd one.
                // But the filter will handle showing/hiding them correctly.
                const targetGrid = isGame ? gamingGrid : appsGrid;

                if (targetGrid) {
                    targetGrid.insertAdjacentHTML('beforeend', cardHTML);
                } else {
                    console.error("Target grid not found for category:", cat);
                }
            });

            // Re-trigger reveal animation for new elements
            document.querySelectorAll('.project-card.reveal').forEach(el => {
                el.classList.add('active'); // Force visibility if observer fails
                if (typeof observer !== 'undefined') observer.observe(el);
            });

            // Ensure links are interactive
            document.querySelectorAll('.btn-link').forEach(link => {
                link.addEventListener('click', (e) => {
                    console.log("Opening project:", link.href);
                });
            });
        }

        function createProjectCard(p, lang = 'en') {
            const t = translations[lang] || translations['en'];

            // Parse technologies (standardized name from DB)
            let techArray = [];
            const rawTech = p.technologies || p.tags; // Fallback for old data
            if (typeof rawTech === 'string') {
                techArray = rawTech.split(',').map(tag => tag.trim());
            } else if (Array.isArray(rawTech)) {
                techArray = rawTech;
            }

            const tagsHTML = techArray.map(tag => `<span class="tag">${tag}</span>`).join('');

            // Icon/Image logic
            let visualContent = '';
            if (p.image_url && p.image_url.startsWith('fa')) {
                visualContent = `<i class="${p.image_url}"></i>`;
            } else if (p.image_url) {
                visualContent = `<img src="${p.image_url}" alt="${p.title}" style="width:100%; height:100%; object-fit:cover;">`;
            } else {
                visualContent = `<i class="fas fa-cube"></i>`;
            }

            // Check if project supports PWA install
            const pwaProjects = ['quran-app', 'farm-game', 'rust-game', 'calculator-vault', 'quiz-app'];
            const projectLink = p.link || p.project_link;
            const isPWA = projectLink && pwaProjects.some(proj => projectLink.includes(proj));

            const installBtn = isPWA ? `
                <button class="btn btn-secondary install-btn" 
                        data-project="${projectLink}" 
                        style="padding: 10px 15px; font-size: 0.85rem; margin-right: 10px;"
                        title="تثبيت كتطبيق">
                    <i class="fas fa-mobile-alt"></i> <span class="btn-text">تثبيت</span>
                </button>
            ` : '';

            return `
            <article class="project-card reveal">
                <div class="project-visual">
                    ${visualContent}
                </div>
                <div class="project-info">
                    <h3>${p.title}</h3>
                    <p>${p.description}</p>
                    <div class="project-tags">
                        ${tagsHTML}
                        ${isPWA ? '<span class="tag pwa-tag"><i class="fas fa-download"></i> PWA</span>' : ''}
                    </div>
                    <div class="project-actions" style="margin-top: 15px;">
                        ${installBtn}
                        <a href="${projectLink}" target="_blank" class="btn btn-primary" style="padding: 10px 20px; font-size: 0.9rem;">
                            ${t.viewProject} <i class="fas fa-external-link-alt" style="font-size: 0.8rem;"></i>
                        </a>
                        ${p.github_link ? `
                        <a href="${p.github_link}" target="_blank" class="btn btn-glass" style="padding: 10px 20px; font-size: 0.9rem; margin-top: 10px;">
                            <i class="fab fa-github"></i> ${t.sourceCode}
                        </a>
                        ` : ''}
                    </div>
                </div>
            </article>
            `;
        }

        loadSiteData();


        // =========================================
        // 6. CONTACT FORM
        // =========================================
        const contactForm = document.querySelector('.contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = contactForm.querySelector('input[type="text"]').value;
                const email = contactForm.querySelector('input[type="email"]').value;
                const msg = contactForm.querySelector('textarea').value;

                const messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
                messages.push({
                    name,
                    email,
                    message: msg,
                    date: new Date().toLocaleString()
                });
                localStorage.setItem('contactMessages', JSON.stringify(messages));

                alert('Message Sent! (See Admin Dashboard)');
                contactForm.reset();
            });
        }

        // Visitor Counter (Simple)
        let visits = parseInt(localStorage.getItem('visitorCount') || '0');
        if (!sessionStorage.getItem('logged')) {
            localStorage.setItem('visitorCount', (visits + 1).toString());
            sessionStorage.setItem('logged', 'true');
        }


    });
})();
