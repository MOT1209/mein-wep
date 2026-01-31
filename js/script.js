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
                {
                    title: 'Farmer Game',
                    category: 'Game',
                    status: 'Public',
                    description: 'A 3D farming simulation game.',
                    project_link: 'farm-game/index.html',
                    image_url: 'fas fa-tractor',
                    tags: ['3D', 'WebGL', 'Simulation']
                },
                {
                    title: 'Quran App',
                    category: 'App',
                    status: 'Public',
                    description: 'Beautiful Quran recitation and reading application.',
                    project_link: 'quran-app/index.html',
                    image_url: 'fas fa-book-open',
                    tags: ['Audio', 'PWA']
                },
                {
                    title: 'Rust Game',
                    category: 'Game',
                    status: 'Public',
                    description: 'An experimental game built with Rust and WebAssembly.',
                    project_link: 'rust-game/index.html',
                    image_url: 'fab fa-rust',
                    tags: ['Rust', 'WASM']
                },
                {
                    title: 'Calculator Vault',
                    category: 'App',
                    status: 'Public',
                    description: 'A privacy-focused calculator that hides secret files.',
                    project_link: 'calculator-vault/index.html',
                    image_url: 'fas fa-user-secret',
                    tags: ['Security', 'Utility']
                },
                {
                    title: 'Quiz App',
                    category: 'App',
                    status: 'Public',
                    description: 'Interactive quiz application to test your skills.',
                    project_link: 'quiz-app/index.html',
                    image_url: 'fas fa-question',
                    tags: ['Education', 'JS']
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

                    const adminLink = document.querySelector('.footer a[href*="admin"]');
                    if (adminLink) {
                        adminLink.innerHTML = 'Portal <span style="color:#2ecc71;">● Online</span>';
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

            // Parse tags
            let tagsArray = [];
            if (typeof p.tags === 'string') {
                tagsArray = p.tags.split(',').map(tag => tag.trim());
            } else if (Array.isArray(p.tags)) {
                tagsArray = p.tags;
            }

            const tagsHTML = tagsArray.map(tag => `<span class="tag">${tag}</span>`).join('');

            // Icon/Image logic
            let visualContent = '';
            if (p.image_url && p.image_url.startsWith('fa')) {
                visualContent = `<i class="${p.image_url}"></i>`;
            } else if (p.image_url) {
                visualContent = `<img src="${p.image_url}" alt="${p.title}" style="width:100%; height:100%; object-fit:cover;">`;
            } else {
                visualContent = `<i class="fas fa-cube"></i>`;
            }

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
                    </div>
                    <a href="${p.project_link}" target="_blank" class="btn btn-primary" style="padding: 10px 20px; font-size: 0.9rem;">
                        ${t.viewProject} <i class="fas fa-external-link-alt" style="font-size: 0.8rem;"></i>
                    </a>
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
