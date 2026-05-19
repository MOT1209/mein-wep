/**
 * PWA Install Manager
 * Manages install buttons for PWA projects
 */

(function() {
    'use strict';

    // Store deferred prompts for each project
    const deferredPrompts = {};

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .catch(err => console.warn('Service Worker registration failed:', err));
        });
    }

    // Listen for beforeinstallprompt events
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();
        
        // Store the event for later use
        const projectPath = getProjectPathFromManifest();
        if (projectPath) {
            deferredPrompts[projectPath] = e;
            showInstallButton(projectPath);
        }
    });

    // Get a stable key for the current page so we can store its deferred prompt.
    function getProjectPathFromManifest() {
        // Use the pathname (e.g. '/quiz-app/index.html') as the key.
        // Fall back to '/' for the root site.
        const path = window.location.pathname;
        return path && path !== '/' ? path : 'root';
    }

    // Show install button for a project
    function showInstallButton(projectPath) {
        const installBtns = document.querySelectorAll(`[data-project="${projectPath}"]`);
        installBtns.forEach(btn => {
            btn.style.display = 'inline-flex';
        });
    }

    // Global install function
    window.installPWA = async function(projectPath, btn) {
        const storedPrompt = deferredPrompts[projectPath];

        if (!storedPrompt) {
            // No install prompt available — the app may already be installed,
            // or the browser hasn't triggered beforeinstallprompt yet.
            if (projectPath && projectPath !== 'root') {
                window.open(projectPath, '_blank');
            }
            return;
        }

        // Guard: prompt can only be used once
        delete deferredPrompts[projectPath];

        try {
            storedPrompt.prompt();
            const { outcome } = await storedPrompt.userChoice;

            if (outcome === 'accepted') {
                console.log('[PWA] User accepted the install prompt');
                btn.innerHTML = '<i class="fas fa-check"></i> تم التثبيت';
                btn.disabled = true;
            } else {
                console.log('[PWA] User dismissed the install prompt');
            }
        } catch (err) {
            console.warn('[PWA] Install prompt error:', err);
        }
    };

    // Check if app is installed
    window.addEventListener('appinstalled', (e) => {
        console.log('PWA was installed');
        // Hide all install buttons
        document.querySelectorAll('.install-btn').forEach(btn => {
            btn.style.display = 'none';
        });
    });

    // Check if running in standalone mode (already installed)
    if (window.matchMedia('(display-mode: standalone)').matches || 
        window.navigator.standalone === true) {
        console.log('Running in standalone mode');
        document.body.classList.add('pwa-standalone');
    }

    // Install buttons are rendered dynamically, so use one delegated listener.
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.install-btn');
        if (!btn) return;

        e.preventDefault();
        e.stopPropagation();
        const projectPath = btn.dataset.project;
        if (projectPath) {
            installPWA(projectPath, btn);
        }
    });

})();
