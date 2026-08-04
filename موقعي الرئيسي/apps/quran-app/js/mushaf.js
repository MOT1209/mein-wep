// ==================== Mushaf Reader — engine (STEP 3: REAL QCF Mushaf) ====================
// Fully verified decisions (tested against live endpoints, not guessed):
//  - Page data: quran.com API v4 /verses/by_page/{n}?words=true  (CORS *).
//    Every word carries `code_v1` (the QCF glyph codepoint) and `line_number` (1..15).
//    Line breaks therefore come from the OFFICIAL Madani mushaf data, not from
//    text wrapping — identical on any screen by construction.
//  - Fonts: per-page King Fahd Complex fonts `QCF_PNNN.woff2` (the same files
//    quran.com uses). Local folder fonts/qcf/ first, then public CDN mirror.
//  - Rendering: quran.com's own proportions for code_v1: line-width 54vh at
//    font-size 3.5vh (ratio ~15.43). We reproduce that ratio inside a FIXED
//    400x620 reference page that is scale-transformed to fit the viewport, so
//    the printed line breaks hold at 360dp AND 430dp.
// Requirement 8 (memory): fonts lazy-load per page, cached current ± 1 only;
// a report is exposed on window.__mushafReport after every page turn.
(function () {
    'use strict';

    const REF = { w: 400, h: 620 };
    const CONTENT_W = REF.w - 28.8;            // matches .mushaf-page__lines padding
    const LINES_PER_PAGE = 15;
    const LINE_H = REF.h / LINES_PER_PAGE;     // 41.33px
    // quran.com code_v1 scale-1 ratio: line-width 54vh / font-size 3.5vh
    const FONT_RATIO = 54 / 3.5;               // ~15.43 → font-px = CONTENT_W / 15.43 ≈ 24px
    const PAGE_TOTAL = 604;
    const PAGE_API = p => `https://api.quran.com/api/v4/verses/by_page/${p}?words=true&per_page=50&fields=text_uthmani`;
    const CACHE_KEY = p => `mushaf_page_${p}`;
    const FALLBACK_FAMILY = "'Amiri Quran', 'Scheherazade New', serif";

    const QCF = {
        local: 'fonts/qcf/',
        cdn: 'https://cdn.jsdelivr.net/gh/nuqayah/qpc-fonts@f93bf5f3/mushaf-woff2/',
        file: p => 'QCF_P' + String(p).padStart(3, '0') + '.woff2',
        basmala: 'QCF_BSML.woff2'
    };

    const readerEl = document.getElementById('mushaf-reader');
    if (!readerEl) return;

    const els = {
        close: document.getElementById('mushaf-close'),
        toggle: document.getElementById('mushaf-toggle'),
        surahName: document.getElementById('mushaf-surah-name'),
        juz: document.getElementById('mushaf-juz'),
        pageNum: document.getElementById('mushaf-page-num'),
        pageArea: document.getElementById('mushaf-page-area'),
        page: document.getElementById('mushaf-page'),
        lines: document.getElementById('mushaf-lines'),
        prev: readerEl.querySelector('[data-action="prev-page"]'),
        next: readerEl.querySelector('[data-action="next-page"]')
    };

    // Single source of truth for the reader.
    const mushafState = {
        page: 1,
        verses: [],
        linesByNumber: {},
        pageCache: new Map(),
        fontCache: new Map(),    // page -> { face, family, url, bytes }
        qcfEnabled: null,        // lazily probed once
        fontPx: Math.round(CONTENT_W / FONT_RATIO), // ≈24px
        scale: 1
    };

    // ---------- page data (memory -> localStorage -> network) ----------
    function readCache(p) {
        try {
            const raw = localStorage.getItem(CACHE_KEY(p));
            if (!raw) return null;
            const o = JSON.parse(raw);
            if (Date.now() - o.ts < 30 * 24 * 60 * 60 * 1000) return o.verses;
            localStorage.removeItem(CACHE_KEY(p));
        } catch (e) { /* corrupted entry — ignore */ }
        return null;
    }

    function writeCache(p, verses) {
        try { localStorage.setItem(CACHE_KEY(p), JSON.stringify({ ts: Date.now(), verses })); }
        catch (e) { /* quota exceeded — memory cache still holds it */ }
    }

    async function loadPage(p) {
        if (mushafState.pageCache.has(p)) return mushafState.pageCache.get(p);
        const cached = readCache(p);
        if (cached) { mushafState.pageCache.set(p, cached); return cached; }
        const res = await fetch(PAGE_API(p));
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const json = await res.json();
        const verses = (json.verses || []).map(v => ({
            number: v.verse_number,
            key: v.verse_key,
            juz: v.juz_number,
            words: (v.words || []).map(w => ({
                code: w.code_v1 || w.text || '',
                line: w.line_number,
                type: w.char_type_name || 'word'
            }))
        }));
        if (!verses.length) throw new Error('empty page');
        mushafState.pageCache.set(p, verses);
        writeCache(p, verses);
        trimCaches(); // requirement 8: bounded memory & storage
        return verses;
    }

    function trimCaches() {
        const MAX_MEM = 8, MAX_LS = 40;
        const keys = [...mushafState.pageCache.keys()];
        while (keys.length > MAX_MEM) mushafState.pageCache.delete(keys.shift());
        try {
            const all = [];
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (!k || !k.startsWith('mushaf_page_')) continue;
                try { all.push({ k, ts: JSON.parse(localStorage.getItem(k)).ts || 0 }); } catch (e) { /* skip */ }
            }
            all.sort((a, b) => b.ts - a.ts).slice(MAX_LS).forEach(e => localStorage.removeItem(e.k));
        } catch (e) { /* storage unavailable */ }
    }

    // ---------- fonts: local QCF first, CDN mirror, Amiri as last resort ----------
    async function probeQcf() {
        if (mushafState.qcfEnabled !== null) return mushafState.qcfEnabled;
        try {
            const res = await fetch(QCF.local + QCF.file(1));
            mushafState.qcfEnabled = res.ok;
        } catch (e) {
            mushafState.qcfEnabled = false;
        }
        return mushafState.qcfEnabled;
    }

    async function ensureFont(p) {
        if (!(await probeQcf())) return FALLBACK_FAMILY;
        const cached = mushafState.fontCache.get(p);
        if (cached) return cached.family;
        const family = 'qcf-p' + p;
        const urls = [QCF.local + QCF.file(p), QCF.cdn + QCF.file(p)];
        let lastErr = null;
        for (const url of urls) {
            try {
                const face = new FontFace(family, `url(${url})`);
                await face.load();
                document.fonts.add(face);
                const bytes = performance.getEntriesByName(url)[0]?.transferSize || 0;
                mushafState.fontCache.set(p, { face, family, url, bytes });
                evictFonts(p); // requirement 8: cache current ± 1 only
                return family;
            } catch (e) { lastErr = e; }
        }
        console.warn('QCF font failed for page', p, lastErr);
        return FALLBACK_FAMILY;
    }

    function evictFonts(current) {
        for (const [p, entry] of mushafState.fontCache) {
            if (Math.abs(Number(p) - current) > 1) {
                try { document.fonts.delete(entry.face); } catch (e) { /* ignore */ }
                mushafState.fontCache.delete(p);
            }
        }
    }

    // ---------- rendering ----------
    // Group flattened words into lines 1..15 (from the OFFICIAL mushaf data).
    function groupLines(verses) {
        const lines = {};
        verses.forEach(v => {
            v.words.forEach(w => {
                if (!w.line) return;
                if (!lines[w.line]) lines[w.line] = [];
                lines[w.line].push({ code: w.code, type: w.type, verseKey: v.key, verseNum: v.number });
            });
        });
        return lines;
    }

    // Build one fixed line: its words rendered with the QCF font, evenly justified
    // across the full width. Words are the ONLY flex items (no text nodes between
    // them, so the browser distributes identical gaps — like the printed mushaf).
    function buildLine(words) {
        const line = document.createElement('div');
        line.className = 'mushaf-line';
        line.style.height = LINE_H + 'px';
        words.forEach(w => {
            const word = document.createElement('span');
            word.className = 'mushaf-word';
            word.dataset.verse = w.verseKey;
            word.dataset.type = w.type;
            word.textContent = w.code;
            line.appendChild(word);
        });
        return line;
    }

    function buildSurahHeader(verses) {
        const first = verses[0];
        if (!first || first.number !== 1) return null; // only when a surah starts on this page
        const surahNum = parseInt(String(first.key).split(':')[0], 10);
        let name = '';
        if (typeof state !== 'undefined' && Array.isArray(state.allSurahs)) {
            const s = state.allSurahs.find(x => x.number === surahNum);
            if (s) name = s.name;
        }
        const header = document.createElement('div');
        header.className = 'mushaf-surah-header';
        const label = document.createElement('span');
        label.className = 'mushaf-surah-header__name';
        label.textContent = name || ('سُورَة ' + surahNum);
        header.appendChild(label);
        return header;
    }

    function buildPageHtml(verses) {
        mushafState.linesByNumber = groupLines(verses);
        const frag = document.createDocumentFragment();

        // Decorative surah header: it OCCUPIES the empty top rows of the page
        // (in the official data, surah-start pages leave lines 1–2 empty exactly
        // where the printed ornament sits). Counting the leading empty rows keeps
        // the total height = 15 × LINE_H so nothing is ever clipped.
        const surahHeader = buildSurahHeader(verses);
        let leadingEmpty = 0;
        while (leadingEmpty < LINES_PER_PAGE && (!mushafState.linesByNumber[leadingEmpty + 1] || !mushafState.linesByNumber[leadingEmpty + 1].length)) {
            leadingEmpty++;
        }
        if (surahHeader) {
            surahHeader.style.height = (Math.max(1, leadingEmpty) * LINE_H) + 'px';
            frag.appendChild(surahHeader);
        }

        for (let ln = 1; ln <= LINES_PER_PAGE; ln++) {
            const words = mushafState.linesByNumber[ln];
            if (!words || !words.length) {
                if (surahHeader && ln <= leadingEmpty) continue; // header already fills these rows
                // Empty printed row (e.g. page margins) — reserve its height so
                // the 15-line grid stays true to the printed layout.
                const empty = document.createElement('div');
                empty.className = 'mushaf-line mushaf-line--empty';
                empty.style.height = LINE_H + 'px';
                frag.appendChild(empty);
                continue;
            }
            frag.appendChild(buildLine(words));
        }
        return frag;
    }

    // Fit the REAL rendered layout into the page: shrink the font size until every
    // line fits CONTENT_W. No probe — immune to font-timing skew.
    function fitToPage() {
        let px = mushafState.fontPx;
        for (let i = 0; i < 12; i++) {
            els.lines.style.setProperty('--mushaf-font-px', px + 'px');
            let widest = 0;
            els.lines.querySelectorAll('.mushaf-line').forEach(l => {
                if (l.scrollWidth > widest) widest = l.scrollWidth;
            });
            if (widest <= CONTENT_W + 1 || px <= 12) break;
            px = Math.max(12, px - 1);
        }
        mushafState.fontPx = px;
    }

    function computeScale() {
        const r = els.pageArea.getBoundingClientRect();
        const availW = Math.max(80, r.width - 16);
        const availH = Math.max(120, r.height - 16);
        mushafState.scale = Math.max(0.4, Math.min(1.4, Math.min(availW / REF.w, availH / REF.h)));
        els.page.style.setProperty('--mushaf-scale', String(mushafState.scale));
    }

    let renderSeq = 0; // guards against stale renders (rapid navigation / close-reopen)

    async function renderPage() {
        const seq = ++renderSeq;
        const p = mushafState.page;
        els.lines.textContent = '';
        const loading = document.createElement('span');
        loading.className = 'mushaf-line-loading';
        loading.textContent = 'جاري تحميل الصفحة…';
        els.lines.appendChild(loading);

        // Requirement 8: lazy-load current page font + one ahead.
        const family = await ensureFont(p);
        if (seq !== renderSeq || readerEl.hidden) return;
        void ensureFont(Math.min(p + 1, PAGE_TOTAL));

        let verses;
        try {
            verses = await loadPage(p);
        } catch (e) {
            if (seq !== renderSeq) return;
            console.error('Mushaf page load failed:', e);
            els.lines.textContent = 'تعذّر تحميل الصفحة — تحقق من الاتصال ثم أعد المحاولة';
            return;
        }
        if (seq !== renderSeq || readerEl.hidden) return;

        mushafState.verses = verses;
        // Make sure the Arabic font is actually loaded before we measure.
        try { await document.fonts.load(`${mushafState.fontPx}px ${family}`); } catch (e) { /* fallback metrics */ }
        try { await document.fonts.ready; } catch (e) { /* ignore */ }
        if (seq !== renderSeq || readerEl.hidden) return;

        els.lines.textContent = '';
        els.lines.appendChild(buildPageHtml(verses));
        els.lines.style.fontFamily = family;
        fitToPage(); // measures the real layout, shrinks until every line fits

        updateHeader(verses);
        updateBounds();
        reportMemory(p);
    }

    function updateHeader(verses) {
        const first = verses[0];
        const surahNum = parseInt(String(first.key).split(':')[0], 10);
        let name = 'صفحة ' + mushafState.page;
        if (typeof state !== 'undefined' && Array.isArray(state.allSurahs)) {
            const s = state.allSurahs.find(x => x.number === surahNum);
            if (s) name = s.name;
        }
        if (els.surahName) els.surahName.textContent = name;
        if (els.juz) els.juz.textContent = 'الجزء ' + (first.juz || 1);
        if (els.pageNum) els.pageNum.textContent = mushafState.page;
    }

    function updateBounds() {
        if (els.prev) els.prev.disabled = mushafState.page <= 1;
        if (els.next) els.next.disabled = mushafState.page >= PAGE_TOTAL;
    }

    async function goTo(p) {
        const next = Math.max(1, Math.min(PAGE_TOTAL, p));
        if (next === mushafState.page) return;
        mushafState.page = next; // scale unchanged (fixed reference page)
        await renderPage();
    }

    // ---------- memory report (requirement 8) ----------
    function reportMemory(p) {
        const cachedFonts = [...mushafState.fontCache.entries()].map(([n, e]) => ({ page: n, bytes: e.bytes || null }));
        const usedJSHeapKB = performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1024) : null;
        const report = {
            page: p,
            mode: mushafState.qcfEnabled ? 'qcf' : 'fallback',
            fontFamily: mushafState.qcfEnabled ? 'qcf-per-page' : 'Amiri Quran',
            cachedFonts,
            usedJSHeapKB
        };
        window.__mushafReport = report;
        console.info('[Mushaf] memory:', JSON.stringify(report));
    }

    // ---------- open / close + wiring ----------
    function open() {
        let start = 1;
        if (typeof state !== 'undefined' && state.currentSurah && state.currentSurah.ayahs && state.currentSurah.ayahs[0]) {
            const p = state.currentSurah.ayahs[0].page;
            if (Number.isInteger(p) && p >= 1 && p <= PAGE_TOTAL) start = p;
        }
        mushafState.page = start;
        readerEl.hidden = false;
        document.body.classList.add('mushaf-open');
        if (els.toggle) els.toggle.setAttribute('aria-expanded', 'true');
        computeScale();
        void renderPage();
        els.close?.focus();
    }

    function close() {
        readerEl.hidden = true;
        document.body.classList.remove('mushaf-open');
        if (els.toggle) {
            els.toggle.setAttribute('aria-expanded', 'false');
            els.toggle.focus();
        }
    }

    if (els.toggle) els.toggle.addEventListener('click', () => readerEl.hidden ? open() : close());
    if (els.close) els.close.addEventListener('click', close);
    if (els.prev) els.prev.addEventListener('click', () => void goTo(mushafState.page - 1));
    if (els.next) els.next.addEventListener('click', () => void goTo(mushafState.page + 1));

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => { if (!readerEl.hidden) computeScale(); }, 150);
    });

    // Verse highlight (requirement 5): rounded box, height = line box, no bleed.
    els.lines.addEventListener('click', (e) => {
        const verse = e.target.closest('.mushaf-line');
        if (!verse) return;
        verse.classList.toggle('is-highlight');
    });
})();
