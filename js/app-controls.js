/**
 * APP CONTROLS SYSTEM v1.0
 * Controls and enhancements for installed PWA applications.
 * Features: Back button, navigation gestures, app-like UI, standalone detection.
 * 
 * Usage:
 *   Include this script and call AppControls.init({ appName: 'My App', onBack: () => {} });
 */

const AppControls = (() => {
    let config = {
        appName: 'My App',
        primaryColor: '#6366f1',
        onBack: null,  // Callback when back button is pressed
        onMenu: null,  // Callback when menu button is pressed
        showBackButton: true,
        showMenuButton: false,
        hideElements: [] // Selectors to hide in standalone mode
    };

    let headerEl, isStandalone = false;

    // --- INITIALIZATION ---
    function init(options) {
        config = { ...config, ...options };

        // Detect standalone mode (installed app)
        isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
            window.navigator.standalone === true;

        document.body.classList.toggle('is-standalone', isStandalone);

        if (isStandalone) {
            createAppHeader();
            setupGestures();
        }

        // Add meta tags for iOS
        addIOSMeta();
    }

    // --- CREATE APP HEADER (for standalone mode) ---
    function createAppHeader() {
        headerEl = document.createElement('div');
        headerEl.id = 'app-header';
        headerEl.innerHTML = `
            <style>
                #app-header {
                    position: fixed;
                    top: 0; left: 0; right: 0;
                    height: 50px;
                    background: linear-gradient(135deg, ${config.primaryColor}, ${adjustColor(config.primaryColor, -20)});
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 15px;
                    z-index: 9000;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                    font-family: 'Segoe UI', 'Cairo', sans-serif;
                }
                #app-header .header-btn {
                    background: rgba(255,255,255,0.15);
                    border: none;
                    color: white;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    font-size: 16px;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                #app-header .header-btn:active {
                    background: rgba(255,255,255,0.3);
                }
                #app-header .app-title {
                    color: white;
                    font-size: 18px;
                    font-weight: 600;
                }
                #app-header .header-left, #app-header .header-right {
                    display: flex;
                    gap: 10px;
                }
                /* Adjust body padding to account for header */
                body.is-standalone {
                    padding-top: 60px !important;
                }
                body.is-standalone .container {
                    padding-top: 0;
                }
                /* Safe area padding for newer phones */
                body.is-standalone {
                    padding-bottom: env(safe-area-inset-bottom) !important;
                }
            </style>
            <div class="header-left">
                ${config.showBackButton ? `<button class="header-btn" id="app-back-btn"><i class="fas fa-arrow-left"></i></button>` : ''}
            </div>
            <span class="app-title">${config.appName}</span>
            <div class="header-right">
                ${config.showMenuButton ? `<button class="header-btn" id="app-menu-btn"><i class="fas fa-bars"></i></button>` : ''}
            </div>
        `;
        document.body.insertBefore(headerEl, document.body.firstChild);

        // Hide specific elements if requested
        if (config.hideElements && config.hideElements.length > 0) {
            config.hideElements.forEach(selector => {
                const els = document.querySelectorAll(selector);
                els.forEach(el => el.style.display = 'none');
            });
        }

        // Event Listeners
        const backBtn = document.getElementById('app-back-btn');
        const menuBtn = document.getElementById('app-menu-btn');

        if (backBtn) {
            backBtn.addEventListener('click', () => {
                if (config.onBack) config.onBack();
                else window.history.back();
            });
        }
        if (menuBtn && config.onMenu) {
            menuBtn.addEventListener('click', config.onMenu);
        }
    }

    // --- SWIPE GESTURES ---
    function setupGestures() {
        let startX = 0;
        let startY = 0;

        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const dx = endX - startX;
            const dy = endY - startY;

            // Swipe right from left edge = back
            if (startX < 30 && dx > 100 && Math.abs(dy) < 50) {
                if (config.onBack) config.onBack();
                else window.history.back();
            }
        }, { passive: true });
    }

    // --- iOS META TAGS ---
    function addIOSMeta() {
        const metas = [
            { name: 'apple-mobile-web-app-capable', content: 'yes' },
            { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
            { name: 'apple-mobile-web-app-title', content: config.appName }
        ];
        metas.forEach(m => {
            if (!document.querySelector(`meta[name="${m.name}"]`)) {
                const meta = document.createElement('meta');
                meta.name = m.name;
                meta.content = m.content;
                document.head.appendChild(meta);
            }
        });
    }

    // --- HELPER: Adjust color brightness ---
    function adjustColor(hex, amount) {
        let r = parseInt(hex.slice(1, 3), 16);
        let g = parseInt(hex.slice(3, 5), 16);
        let b = parseInt(hex.slice(5, 7), 16);
        r = Math.max(0, Math.min(255, r + amount));
        g = Math.max(0, Math.min(255, g + amount));
        b = Math.max(0, Math.min(255, b + amount));
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    // --- PUBLIC API ---
    return { init, isStandalone: () => isStandalone };
})();
