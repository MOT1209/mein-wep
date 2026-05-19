import { qs, qsa, on } from '../utils/dom.js?v=1.1';

export function initSettings() {
    const body = document.body;
    const settingsModal = qs('#settings-modal');
    const settingsOverlay = qs('#settings-overlay');

    function toggleSettings(show) {
        settingsModal?.classList.toggle('active', show);
        settingsOverlay?.classList.toggle('active', show);
        body.style.overflow = show ? 'hidden' : '';
    }

    on(qs('#settings-btn'), 'click', () => toggleSettings(true));
    on(qs('#close-settings'), 'click', () => toggleSettings(false));
    on(settingsOverlay, 'click', () => toggleSettings(false));

    const setLanguage = (langCode) => {
        if (!langCode) return;
        document.cookie = `googtrans=/en/${langCode}; path=/`;
        localStorage.setItem('lastLang', langCode);
        setTimeout(() => location.reload(), 300);
    };

    qsa('.lang-btn').forEach(btn => {
        on(btn, 'click', () => {
            qsa('.lang-btn').forEach(item => item.classList.remove('active'));
            btn.classList.add('active');
            setLanguage(btn.getAttribute('data-lang'));
        });
    });

    qsa('.lang-option').forEach(option => {
        on(option, 'click', () => setLanguage(option.getAttribute('data-lang')));
    });
}
