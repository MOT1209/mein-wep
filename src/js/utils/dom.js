export const qs = (selector, root = document) => root.querySelector(selector);
export const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

export function on(target, eventName, handler, options) {
    target?.addEventListener(eventName, handler, options);
}

export function escapeHTML(value) {
    const div = document.createElement('div');
    div.textContent = value == null ? '' : String(value);
    return div.innerHTML;
}

export function safeUrl(value, fallback = '#') {
    const url = String(value || '').trim();
    if (!url) return fallback;

    try {
        const parsed = new URL(url, window.location.href);
        if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return parsed.href;
    } catch (err) {
        // Relative paths are validated below.
    }

    if (/^(?!.*(?:^|\/)\.\.(?:\/|$))[a-zA-Z0-9._~!$&'()*+,;=:@%/-]+(?:#[\w-]+)?$/.test(url)) {
        return url;
    }
    return fallback;
}

export function safeIconClass(value) {
    const icon = String(value || '').trim();
    return /^fa[bsrl]?\s+fa-[a-z0-9-]+$/i.test(icon) ? icon : '';
}

export function scheduleFrame(callback) {
    let frame = null;
    return (...args) => {
        if (frame) return;
        frame = requestAnimationFrame(() => {
            frame = null;
            callback(...args);
        });
    };
}
