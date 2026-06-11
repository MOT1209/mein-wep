import { qs, qsa, on } from '../utils/dom.js?v=1.1';

export function initSettings() {
    const body = document.body;
    const settingsModal = qs('#settings-modal');
    const settingsOverlay = qs('#settings-overlay');
    const settingsBtn = qs('#settings-btn');
    let previousFocus = null;

    /** حصر التركيز داخل المودال */
    function trapFocus(event) {
        if (!settingsModal?.classList.contains('active')) return;
        const focusable = settingsModal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.key === 'Tab') {
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        }
        if (event.key === 'Escape') toggleSettings(false);
    }

    function toggleSettings(show) {
        settingsModal?.classList.toggle('active', show);
        settingsOverlay?.classList.toggle('active', show);
        body.style.overflow = show ? 'hidden' : '';
        if (show) {
            previousFocus = document.activeElement;
            // Focus first focusable element inside modal
            const firstFocusable = settingsModal?.querySelector(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            firstFocusable?.focus();
        } else if (previousFocus) {
            previousFocus.focus();
            previousFocus = null;
        }
    }

    on(settingsBtn, 'click', () => toggleSettings(true));
    on(qs('#close-settings'), 'click', () => toggleSettings(false));
    on(settingsOverlay, 'click', () => toggleSettings(false));
    on(document, 'keydown', trapFocus);

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
