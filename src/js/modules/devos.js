/**
 * src/js/modules/devos.js
 * Core logic for the Rashid DevOS experience.
 * Manages view switching, command center, and component integration.
 */

import { qs, on, qsa } from '../utils/dom.js';

export const initDevOS = (cached) => {
    console.log('🚀 DevOS Core Initializing...');
    
    const sidebarItems = qsa('.nav-item[data-view]');
    const mainContent = qs('#main-content');
    const commandInput = qs('.command-search input');
    
    // View Management
    const viewSections = qsa('.view-section');
    
    // Ensure dashboard is active on load
    const initialView = localStorage.getItem('devos-last-view') || 'dashboard';
    
    const switchView = (viewId) => {
        console.log(`[DevOS] Switching to: ${viewId}`);
        
        sidebarItems.forEach(item => {
            item.classList.toggle('active', item.getAttribute('data-view') === viewId);
        });
        
        viewSections.forEach(section => {
            section.classList.toggle('active', section.id === `${viewId}-view`);
        });
        
        if (mainContent) mainContent.scrollTop = 0;
        
        // Persist last view
        localStorage.setItem('devos-last-view', viewId);
        
        // Dispatch event for other modules
        window.dispatchEvent(new CustomEvent('devos-view-changed', { detail: { view: viewId } }));
    };
    
    // Set initial active state
    switchView(initialView);
    
    // Attach Event Listeners
    sidebarItems.forEach(item => {
        on(item, 'click', () => {
            const viewId = item.getAttribute('data-view');
            if (viewId) switchView(viewId);
        });
    });
    
    // Global Search / Command Bar
    if (commandInput) {
        on(commandInput, 'keydown', (e) => {
            if (e.key === 'Enter') {
                const query = commandInput.value.trim();
                if (query) {
                    if (window.rashidAI && typeof window.rashidAI.open === 'function') {
                        window.rashidAI.open();
                        if (typeof window.rashidAI.ask === 'function') {
                            window.rashidAI.ask(query);
                        }
                    }
                    commandInput.value = '';
                }
            }
        });
        
        on(window, 'keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                commandInput.focus();
            }
        });
    }
    
    // AI Workspace Integration
    const aiWsInput = qs('#ai-workspace-input');
    const aiWsChatBody = qs('#ai-view-chat-body');
    
    if (aiWsInput && aiWsChatBody) {
        on(aiWsInput, 'keydown', (e) => {
            if (e.key === 'Enter' && aiWsInput.value.trim()) {
                const msg = aiWsInput.value.trim();
                
                // Add user message
                const userMsg = document.createElement('div');
                userMsg.className = 'chat-msg user';
                userMsg.style.cssText = 'background: rgba(var(--os-accent-rgb), 0.1); padding: 12px 16px; border-radius: 12px; margin-bottom: 16px; border-right: 4px solid var(--os-accent); text-align: right;';
                userMsg.textContent = msg;
                aiWsChatBody.appendChild(userMsg);
                
                // Try to get AI response
                if (window.rashidAI && typeof window.rashidAI.sendMessage === 'function') {
                    window.rashidAI.sendMessage(msg);
                } else {
                    // Fallback response
                    const botMsg = document.createElement('div');
                    botMsg.className = 'chat-msg bot';
                    botMsg.style.cssText = 'background: rgba(255,255,255,0.05); padding: 12px 16px; border-radius: 12px; margin-bottom: 16px; border-left: 4px solid var(--os-accent-secondary);';
                    botMsg.textContent = `Processing: "${msg}". AI integration available once Rashid-AI module is loaded.`;
                    aiWsChatBody.appendChild(botMsg);
                }
                
                aiWsInput.value = '';
                aiWsChatBody.scrollTop = aiWsChatBody.scrollHeight;
            }
        });
    }
    
    // Bento mouse hover effect
    const bentoItems = qsa('.bento-item');
    bentoItems.forEach(item => {
        on(item, 'mousemove', (e) => {
            const rect = item.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            item.style.setProperty('--mouse-x', `${x}%`);
            item.style.setProperty('--mouse-y', `${y}%`);
        });
    });
    
    // Theme & Settings Integration
    const themeBtn = qs('#devos-theme-toggle');
    const settingsBtn = qs('#devos-settings-btn');
    const originalThemeBtn = qs('#theme-toggle');
    const originalSettingsBtn = qs('#settings-btn');

    if (themeBtn && originalThemeBtn) {
        on(themeBtn, 'click', () => originalThemeBtn.click());
    }
    if (settingsBtn && originalSettingsBtn) {
        on(settingsBtn, 'click', () => originalSettingsBtn.click());
    }
    
    // Admin Access via sidebar (Ctrl+Shift+A)
    on(window, 'keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'A') {
            e.preventDefault();
            const link = document.getElementById('admin-access-link');
            if (link) {
                link.style.display = 'inline';
                link.style.opacity = '0.5';
                window.open('admin/login.html', '_blank');
            }
        }
    });
    
    return {
        switchView,
        getCurrentView: () => document.querySelector('.nav-item.active')?.getAttribute('data-view')
    };
};
