/**
 * Rashid Portfolio v2.0
 * Main Script - Handles UI, Theme, and Admin Logic
 */

(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {

        // =========================================
        // 1. THEME TOGGLE
        // =========================================
        const themeToggle = document.getElementById('theme-toggle');
        const body = document.body;
        const icon = themeToggle ? themeToggle.querySelector('i') : null;

        function updateIcon() {
            if (!icon) return;
            if (body.classList.contains('light-mode')) {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            } else {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            }
        }

        // Check for saved theme
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            body.classList.add('light-mode');
            updateIcon();
        }

        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                body.classList.toggle('light-mode');
                updateIcon();
                localStorage.setItem('theme', body.classList.contains('light-mode') ? 'light' : 'dark');
            });
        }

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

        // 3. Project Visibility Sync
        const projectStates = JSON.parse(localStorage.getItem('projectStates') || '{}');
        const projectCards = document.querySelectorAll('.project-card');

        function applyVisibility(titleKeyword, keyInStorage) {
            projectCards.forEach(card => {
                if (card.innerText.toLowerCase().includes(titleKeyword)) {
                    const state = projectStates[keyInStorage];
                    if (state && state.visible === false) {
                        card.style.display = 'none';
                    } else {
                        card.style.display = 'block';
                    }
                }
            });
        }

        if (projectCards.length > 0) {
            applyVisibility('farm', 'farm');
            applyVisibility('quran', 'quran');
            applyVisibility('calculator', 'calc');
        }

        const savedSettings = JSON.parse(localStorage.getItem('siteSettings') || '{}');
        const contactSpans = document.querySelectorAll('.contact-info span');
        if (savedSettings.email && contactSpans[0]) contactSpans[0].innerText = savedSettings.email;
        if (savedSettings.location && contactSpans[1]) contactSpans[1].innerText = savedSettings.location;


        // ============================================================
        // 5. DYNAMIC CONTENT & VISITORS (SUPABASE)
        // ============================================================

        async function loadSiteData() {
            if (typeof supabaseClient === 'undefined') {
                console.log("Supabase client missing.");
                return;
            }

            // Test Connection by fetching count (lightweight)
            const { count, error } = await supabaseClient
                .from('projects')
                .select('*', { count: 'exact', head: true });

            const adminLink = document.querySelector('.footer a[href*="admin"]');

            if (!error) {
                console.log("✅ Connected to Supabase!");
                if (adminLink) {
                    adminLink.innerHTML = 'Admin Portal <span style="color:#2ecc71; font-weight:bold;">● Online</span>';
                    adminLink.title = "Connected to Database";
                }

                // 1. Increment Visitor Count
                await supabaseClient.rpc('increment_visitor_count');

                // 2. Fetch Projects logic...
                const { data: projects } = await supabaseClient
                    .from('projects')
                    .select('*')
                    .eq('status', 'Public');

                if (projects) console.log(`Loaded ${projects.length} projects from DB.`);

            } else {
                console.error("❌ Connection Failed:", error.message);
                if (adminLink) {
                    adminLink.innerHTML = 'Admin Portal <span style="color:#e74c3c;">● Offline</span>';
                    adminLink.title = "Check Console for Errors";
                }
            }
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

        // =========================================
        // 7. SETTINGS MODAL (Main Site)
        // =========================================
        const settingsBtn = document.getElementById('settings-btn');
        const settingsModal = document.getElementById('settings-modal');
        const settingsOverlay = document.getElementById('settings-overlay');
        const closeSettings = document.getElementById('close-settings');

        function toggleSettings(show) {
            if (show) {
                settingsModal?.classList.add('active');
                settingsOverlay?.classList.add('active');
            } else {
                settingsModal?.classList.remove('active');
                settingsOverlay?.classList.remove('active');
            }
        }

        if (settingsBtn) settingsBtn.addEventListener('click', () => toggleSettings(true));
        if (closeSettings) closeSettings.addEventListener('click', () => toggleSettings(false));
        if (settingsOverlay) settingsOverlay.addEventListener('click', () => toggleSettings(false));

        // Language Picker Logic
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
        // 8. PROJECT FILTERS
        // =========================================
        const filterBtns = document.querySelectorAll('.filter-btn');
        const projectCategories = document.querySelectorAll('.project-category');

        if (filterBtns.length > 0 && projectCategories.length > 0) {
            filterBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    // Update active state
                    filterBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');

                    const filter = btn.dataset.filter;

                    // Show/hide categories with smooth transition
                    projectCategories.forEach(category => {
                        const categoryType = category.dataset.category;

                        if (filter === 'all') {
                            category.style.display = 'block';
                            setTimeout(() => {
                                category.style.opacity = '1';
                                category.style.transform = 'translateY(0)';
                            }, 10);
                        } else if (filter === categoryType) {
                            category.style.display = 'block';
                            setTimeout(() => {
                                category.style.opacity = '1';
                                category.style.transform = 'translateY(0)';
                            }, 10);
                        } else {
                            category.style.opacity = '0';
                            category.style.transform = 'translateY(20px)';
                            setTimeout(() => {
                                category.style.display = 'none';
                            }, 300);
                        }
                    });
                });
            });
        }


    });
})();
