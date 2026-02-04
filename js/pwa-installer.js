/**
 * PWA Install Manager
 * Manages install buttons for PWA projects
 */

(function() {
    'use strict';

    // Store deferred prompts for each project
    const deferredPrompts = {};

    // Listen for beforeinstallprompt events
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();
        
        // Store the event for later use
        const projectPath = getProjectPathFromManifest(e);
        if (projectPath) {
            deferredPrompts[projectPath] = e;
            showInstallButton(projectPath);
        }
    });

    // Get project path from manifest or URL
    function getProjectPathFromManifest(event) {
        // Try to determine which project this prompt is for
        // This is a simplified version - in production, you'd parse the manifest
        return null; // We'll handle this differently
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
        const prompt = deferredPrompts[projectPath];
        
        if (!prompt) {
            // If no prompt, open the project in new tab
            window.open(projectPath, '_blank');
            return;
        }

        // Show the install prompt
        prompt.prompt();
        
        // Wait for the user to respond to the prompt
        const { outcome } = await prompt.userChoice;
        
        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
            btn.innerHTML = '<i class="fas fa-check"></i> تم التثبيت';
            btn.disabled = true;
        } else {
            console.log('User dismissed the install prompt');
        }
        
        // Clear the deferred prompt
        delete deferredPrompts[projectPath];
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

    // Initialize install buttons on page load
    document.addEventListener('DOMContentLoaded', () => {
        // Add click handlers to all install buttons
        document.querySelectorAll('.install-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const projectPath = btn.dataset.project;
                if (projectPath) {
                    installPWA(projectPath, btn);
                }
            });
        });
    });

})();