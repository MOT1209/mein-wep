export function checkBrowser() {
    const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    const isEdge = /Edg/.test(navigator.userAgent);

    if (!isChrome || isEdge) {
        showChromeWarning();
        // We still return true to allow the site to function after the warning
        return true;
    }
    return true;
}

function showChromeWarning() {
    const overlay = document.createElement('div');
    overlay.className = 'chrome-warning-overlay';
    overlay.innerHTML = `
        <div class="chrome-warning-modal">
            <h2>تنبيه: متصفح غير مدعوم</h2>
            <p>لضمان أفضل أداء للألعاب ثلاثية الأبعاد والتجربة الواقعية، يرجى استخدام متصفح <strong>Google Chrome</strong>.</p>
            <a href="https://www.google.com/chrome/" target="_blank" class="btn btn-primary">تحميل Google Chrome</a>
            <button class="btn btn-secondary" style="margin-top: 1rem;" onclick="this.parentElement.parentElement.classList.remove('show')">متابعة على أي حال</button>
        </div>
    `;
    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add('show'), 100);
}
