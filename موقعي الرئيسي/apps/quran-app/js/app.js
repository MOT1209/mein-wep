// ==================== Quran App - Complete Surah Audio System ====================
// Features: Full Surah MP3 Playback, Smooth Audio, No Loading Stops

const APP_CONFIG = {
    API_BASE: 'https://api.alquran.cloud/v1',
    CACHE_DURATION: 30 * 24 * 60 * 60 * 1000,
    DEFAULT_FONT_SIZE: 2.2,
    MIN_FONT_SIZE: 1.5,
    MAX_FONT_SIZE: 4,

    // روابط MP3 كاملة للسور من مصادر موثوقة
    FULL_SURAH_AUDIO: {
        // mp3quran.net - مصدر موثوق بملفات MP3 كاملة
        'alafasy': {
            name: 'مشاري العفاسي',
            baseUrl: 'https://server8.mp3quran.net/afs',
            type: 'full_surah'
        },
        'abdulbasit': {
            name: 'عبد الباسط عبد الصمد - مرتل',
            baseUrl: 'https://server7.mp3quran.net/basit',
            type: 'full_surah'
        },
        'abdulbasit_mujawwad': {
            name: 'عبد الباسط عبد الصمد - مجود',
            baseUrl: 'https://server7.mp3quran.net/basit_mjwd',
            type: 'full_surah'
        },
        'minshawi': {
            name: 'محمد صديق المنشاوي - مرتل',
            baseUrl: 'https://server10.mp3quran.net/minsh',
            type: 'full_surah'
        },
        'minshawi_mujawwad': {
            name: 'محمد صديق المنشاوي - مجود',
            baseUrl: 'https://server10.mp3quran.net/minsh_mjwd',
            type: 'full_surah'
        },
        'husary': {
            name: 'محمود خليل الحصري - مرتل',
            baseUrl: 'https://server13.mp3quran.net/husr',
            type: 'full_surah'
        },
        'husary_mujawwad': {
            name: 'محمود خليل الحصري - مجود',
            baseUrl: 'https://server13.mp3quran.net/husr_mjwd',
            type: 'full_surah'
        },
        'sudais': {
            name: 'عبد الرحمن السديس',
            baseUrl: 'https://server7.mp3quran.net/sds',
            type: 'full_surah'
        },
        'maher': {
            name: 'ماهر المعيقلي',
            baseUrl: 'https://server12.mp3quran.net/maher',
            type: 'full_surah'
        },
        'yasser': {
            name: 'ياسر الدوسري',
            baseUrl: 'https://server11.mp3quran.net/yasser',
            type: 'full_surah'
        },
        'shatri': {
            name: 'أبو بكر الشاطري',
            baseUrl: 'https://server11.mp3quran.net/shatri',
            type: 'full_surah'
        },
        'ajamy': {
            name: 'أحمد بن علي العجمي',
            baseUrl: 'https://server10.mp3quran.net/ajm',
            type: 'full_surah'
        },
        'ayyoub': {
            name: 'محمد أيوب',
            baseUrl: 'https://server8.mp3quran.net/ayyub',
            type: 'full_surah'
        },
        'jibreel': {
            name: 'محمد جبريل',
            baseUrl: 'https://server8.mp3quran.net/jbrl',
            type: 'full_surah'
        },
        'rifai': {
            name: 'هاني الرفاعي',
            baseUrl: 'https://server8.mp3quran.net/rifai',
            type: 'full_surah'
        },
        'qatami': {
            name: 'ناصر القطامي',
            baseUrl: 'https://server6.mp3quran.net/qtm',
            type: 'full_surah'
        },
        'thubaity': {
            name: 'محمد الثبيتي',
            baseUrl: 'https://server6.mp3quran.net/thubti',
            type: 'full_surah'
        },
        'tawfeeq': {
            name: 'توفيق الصايغ',
            baseUrl: 'https://server6.mp3quran.net/twfeeq',
            type: 'full_surah'
        },
        'wadee': {
            name: 'وديع اليمني',
            baseUrl: 'https://server6.mp3quran.net/wdee',
            type: 'full_surah'
        },
        'islam': {
            name: 'إسلام صبحي',
            baseUrl: 'https://server11.mp3quran.net/islam',
            type: 'full_surah'
        }
    },

    // للآيات الفردية (API القديم)
    VERSE_BY_VERSE: {
        'ar.alafasy': 'مشاري العفاسي',
        'ar.abdulbasitmurattal': 'عبد الباسط عبد الصمد',
        'ar.minshawi': 'محمد صديق المنشاوي',
        'ar.husary': 'محمود خليل الحصري',
        'ar.abdurrahmaansudais': 'عبد الرحمن السديس',
        'ar.mahermuaiqly': 'ماهر المعيقلي',
        'ar.yasseraldossari': 'ياسر الدوسري',
        'ar.shaatree': 'أبو بكر الشاطري'
    },

    // بيانات الأجزاء (30 جزء)
    JUZ_DATA: [
        { number: 1, name: 'الجزء الأول', startSurah: 1, startVerse: 1, endSurah: 2, endVerse: 141 },
        { number: 2, name: 'الجزء الثاني', startSurah: 2, startVerse: 142, endSurah: 2, endVerse: 252 },
        { number: 3, name: 'الجزء الثالث', startSurah: 2, startVerse: 253, endSurah: 3, endVerse: 92 },
        { number: 4, name: 'الجزء الرابع', startSurah: 3, startVerse: 93, endSurah: 4, endVerse: 23 },
        { number: 5, name: 'الجزء الخامس', startSurah: 4, startVerse: 24, endSurah: 4, endVerse: 147 },
        { number: 6, name: 'الجزء السادس', startSurah: 4, startVerse: 148, endSurah: 5, endVerse: 81 },
        { number: 7, name: 'الجزء السابع', startSurah: 5, startVerse: 82, endSurah: 6, endVerse: 110 },
        { number: 8, name: 'الجزء الثامن', startSurah: 6, startVerse: 111, endSurah: 7, endVerse: 87 },
        { number: 9, name: 'الجزء التاسع', startSurah: 7, startVerse: 88, endSurah: 8, endVerse: 40 },
        { number: 10, name: 'الجزء العاشر', startSurah: 8, startVerse: 41, endSurah: 9, endVerse: 92 },
        { number: 11, name: 'الجزء الحادي عشر', startSurah: 9, startVerse: 93, endSurah: 11, endVerse: 5 },
        { number: 12, name: 'الجزء الثاني عشر', startSurah: 11, startVerse: 6, endSurah: 12, endVerse: 52 },
        { number: 13, name: 'الجزء الثالث عشر', startSurah: 12, startVerse: 53, endSurah: 14, endVerse: 52 },
        { number: 14, name: 'الجزء الرابع عشر', startSurah: 15, startVerse: 1, endSurah: 16, endVerse: 128 },
        { number: 15, name: 'الجزء الخامس عشر', startSurah: 17, startVerse: 1, endSurah: 18, endVerse: 74 },
        { number: 16, name: 'الجزء السادس عشر', startSurah: 18, startVerse: 75, endSurah: 20, endVerse: 135 },
        { number: 17, name: 'الجزء السابع عشر', startSurah: 21, startVerse: 1, endSurah: 22, endVerse: 78 },
        { number: 18, name: 'الجزء الثامن عشر', startSurah: 23, startVerse: 1, endSurah: 25, endVerse: 20 },
        { number: 19, name: 'الجزء التاسع عشر', startSurah: 25, startVerse: 21, endSurah: 27, endVerse: 55 },
        { number: 20, name: 'الجزء العشرون', startSurah: 27, startVerse: 56, endSurah: 29, endVerse: 45 },
        { number: 21, name: 'الجزء الحادي والعشرون', startSurah: 29, startVerse: 46, endSurah: 33, endVerse: 30 },
        { number: 22, name: 'الجزء الثاني والعشرون', startSurah: 33, startVerse: 31, endSurah: 36, endVerse: 27 },
        { number: 23, name: 'الجزء الثالث والعشرون', startSurah: 36, startVerse: 28, endSurah: 39, endVerse: 31 },
        { number: 24, name: 'الجزء الرابع والعشرون', startSurah: 39, startVerse: 32, endSurah: 41, endVerse: 46 },
        { number: 25, name: 'الجزء الخامس والعشرون', startSurah: 41, startVerse: 47, endSurah: 45, endVerse: 37 },
        { number: 26, name: 'الجزء السادس والعشرون', startSurah: 46, startVerse: 1, endSurah: 51, endVerse: 30 },
        { number: 27, name: 'الجزء السابع والعشرون', startSurah: 51, startVerse: 31, endSurah: 57, endVerse: 29 },
        { number: 28, name: 'الجزء الثامن والعشرون', startSurah: 58, startVerse: 1, endSurah: 66, endVerse: 12 },
        { number: 29, name: 'الجزء التاسع والعشرون', startSurah: 67, startVerse: 1, endSurah: 77, endVerse: 50 },
        { number: 30, name: 'الجزء الثلاثون', startSurah: 78, startVerse: 1, endSurah: 114, endVerse: 6 }
    ]
};

// ==================== State Management ====================
const state = {
    currentSurah: null,
    currentVerseIndex: 0,
    allSurahs: [],
    bookmarks: JSON.parse(localStorage.getItem('quranBookmarks')) || [],
    readingProgress: JSON.parse(localStorage.getItem('quranReadingProgress')) || {},
    settings: JSON.parse(localStorage.getItem('quranSettings')) || {
        fontSize: APP_CONFIG.DEFAULT_FONT_SIZE,
        theme: 'dark',
        autoPlay: false,
        autoNextSurah: true,
        reciter: 'alafasy',
        audioMode: 'full_surah', // 'full_surah' أو 'verse_by_verse'
        showTranslation: false
    },
    isPlaying: false,
    isRepeatEnabled: false,
    audioElement: null,
    searchDebounceTimer: null,
    cache: new Map(),
    verseTimings: [], // توقيت كل آية في الملف الكامل
    currentReciter: 'alafasy'
};

// ==================== DOM Elements ====================
const elements = {};

function initializeElements() {
    const ids = [
        'surah-list', 'verses-container', 'surah-name', 'surah-details',
        'audio-player', 'audio-element', 'play-pause', 'prev-verse', 'next-verse',
        'skip-forward', 'skip-back', 'repeat-verse', 'playback-speed', 'close-player',
        'player-surah', 'player-verse', 'progress-bar', 'current-time', 'duration',
        'theme-toggle', 'menu-toggle', 'sidebar', 'search-btn', 'bookmark-btn',
        'search-modal', 'bookmark-modal', 'tafsir-modal', 'search-input', 'search-results',
        'bookmarks-list', 'reciter-select', 'increase-font', 'decrease-font',
        'save-surah-main', 'last-read-btn', 'tafsir-btn', 'tafsir-select', 'tafsir-content',
        'surah-search', 'auto-play-btn', 'toast-container', 'reading-progress', 'progress-text',
        'audio-mode-toggle', 'juz-list', 'view-toggle'
    ];

    ids.forEach(id => {
        elements[id] = document.getElementById(id);
    });
}

// ==================== Juz (Parts) System ====================
let currentView = 'surahs'; // 'surahs' أو 'juz'

function displayJuzList() {
    const list = elements['juz-list'] || elements['surah-list'];
    if (!list) return;

    list.innerHTML = '';

    APP_CONFIG.JUZ_DATA.forEach(juz => {
        const juzItem = document.createElement('div');
        juzItem.className = 'surah-item juz-item';
        juzItem.dataset.juz = juz.number;
        juzItem.onclick = () => loadJuz(juz.number);

        const numberDiv = document.createElement('div');
        numberDiv.className = 'surah-number juz-number';
        numberDiv.textContent = juz.number;
        juzItem.appendChild(numberDiv);

        const infoCard = document.createElement('div');
        infoCard.className = 'surah-info-card';

        const nameAr = document.createElement('div');
        nameAr.className = 'surah-name-ar';
        nameAr.textContent = juz.name;
        infoCard.appendChild(nameAr);

        const meta = document.createElement('div');
        meta.className = 'surah-meta';

        const startSurah = state.allSurahs.find(s => s.number === juz.startSurah);
        const endSurah = state.allSurahs.find(s => s.number === juz.endSurah);

        if (startSurah && endSurah) {
            const metaItem = document.createElement('span');
            metaItem.className = 'meta-item';
            const icon = document.createElement('i');
            icon.className = 'fas fa-book';
            metaItem.appendChild(icon);
            metaItem.appendChild(document.createTextNode(` من ${startSurah.name} إلى ${endSurah.name}`));
            meta.appendChild(metaItem);
        }

        infoCard.appendChild(meta);
        juzItem.appendChild(infoCard);
        list.appendChild(juzItem);
    });
}

async function loadJuz(juzNumber) {
    const juz = APP_CONFIG.JUZ_DATA.find(j => j.number === juzNumber);
    if (!juz) return;

    showToast(`جاري تحميل ${juz.name}...`, 'info');

    // تحميل السورة الأولى في الجزء
    await loadSurah(juz.startSurah);

    // التمرير إلى الآية البداية
    if (juz.startSurah === juz.endSurah) {
        // نفس السورة
        const verseIndex = juz.startVerse - 1;
        scrollToVerse(verseIndex);
    } else {
        // سورة مختلفة - ابدأ من البداية
        scrollToVerse(0);
    }
}

function scrollToVerse(verseIndex) {
    setTimeout(() => {
        const element = document.getElementById(`verse-${verseIndex}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.classList.add('highlight');
            setTimeout(() => element.classList.remove('highlight'), 2000);
        }
    }, 500);
}

function toggleView() {
    currentView = currentView === 'surahs' ? 'juz' : 'surahs';

    const viewBtn = elements['view-toggle'];
    if (viewBtn) {
        viewBtn.innerHTML = currentView === 'surahs'
            ? '<i class="fas fa-list"></i> السور'
            : '<i class="fas fa-layer-group"></i> الأجزاء';
    }

    if (currentView === 'juz') {
        displayJuzList();
    } else {
        displaySurahs(state.allSurahs);
    }
}

// ==================== Media Session API ====================
function setupMediaSession() {
    if (!('mediaSession' in navigator)) return;

    navigator.mediaSession.metadata = new MediaMetadata({
        title: 'القرآن الكريم',
        artist: 'تلاوة',
        album: 'Quran App',
        artwork: [
            { src: 'icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: 'icons/icon-512x512.png', sizes: '512x512', type: 'image/png' }
        ]
    });

    navigator.mediaSession.setActionHandler('play', () => {
        if (state.audioElement) state.audioElement.play();
    });

    navigator.mediaSession.setActionHandler('pause', () => {
        if (state.audioElement) state.audioElement.pause();
    });

    navigator.mediaSession.setActionHandler('previoustrack', () => {
        if (state.audioElement) state.audioElement.currentTime -= 10;
    });

    navigator.mediaSession.setActionHandler('nexttrack', () => {
        if (state.audioElement) state.audioElement.currentTime += 10;
    });
}

// ==================== PWA Install Prompt ====================
let deferredPrompt = null;

function setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        showInstallBanner();
    });

    window.addEventListener('appinstalled', () => {
        deferredPrompt = null;
        hideInstallBanner();
        showToast('تم تثبيت التطبيق بنجاح', 'success');
    });
}

function showInstallBanner() {
    // Don't show if already dismissed
    if (localStorage.getItem('quranInstallDismissed')) return;

    const banner = document.createElement('div');
    banner.id = 'install-banner';
    banner.className = 'install-banner';
    banner.innerHTML = `
        <div class="install-content">
            <i class="fas fa-mobile-alt"></i>
            <span>تثبيت التطبيق</span>
        </div>
        <div class="install-actions">
            <button class="install-btn" onclick="installApp()">تثبيت</button>
            <button class="dismiss-btn" onclick="dismissInstall()">لاحقاً</button>
        </div>
    `;
    document.body.appendChild(banner);
}

function hideInstallBanner() {
    const banner = document.getElementById('install-banner');
    if (banner) banner.remove();
}

async function installApp() {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
        showToast('جاري تثبيت التطبيق...', 'info');
    }

    deferredPrompt = null;
    hideInstallBanner();
}

function dismissInstall() {
    localStorage.setItem('quranInstallDismissed', 'true');
    hideInstallBanner();
}

function updateMediaSession() {
    if (!('mediaSession' in navigator) || !state.currentSurah) return;

    const ayah = state.currentSurah.ayahs[state.currentVerseIndex];
    navigator.mediaSession.metadata = new MediaMetadata({
        title: `سورة ${state.currentSurah.name}`,
        artist: `الآية ${ayah?.numberInSurah || 1}`,
        album: 'Quran App',
        artwork: [
            { src: 'icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: 'icons/icon-512x512.png', sizes: '512x512', type: 'image/png' }
        ]
    });
}

// ==================== Last Position Save ====================
function saveLastPosition() {
    if (!state.currentSurah) return;

    const position = {
        surahNumber: state.currentSurah.number,
        verseIndex: state.currentVerseIndex,
        timestamp: Date.now()
    };

    localStorage.setItem('quranLastPosition', JSON.stringify(position));
}

function loadLastPosition() {
    try {
        const saved = localStorage.getItem('quranLastPosition');
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.warn('Error loading last position:', e);
    }
    return null;
}

function restoreLastPosition() {
    const position = loadLastPosition();
    if (position) {
        loadSurah(position.surahNumber).then(() => {
            setTimeout(() => {
                scrollToVerse(position.verseIndex);
            }, 500);
        });
    }
}

// ==================== Enhanced Toast Notification ====================

/**
 * عرض إشعار منبثق
 * @param {string} message - الرسالة المراد عرضها
 * @param {'success'|'error'|'info'|'warning'} type - نوع الإشعار
 * @param {number} duration - مدة العرض بالمللي ثانية
 * @returns {void}
 */
function showToast(message, type = 'success', duration = 3000) {
    const container = elements['toast-container'];
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle',
        warning: 'fa-exclamation-triangle'
    };

    const icon = document.createElement('i');
    icon.className = `fas ${icons[type] || icons.success}`;
    toast.appendChild(icon);

    const span = document.createElement('span');
    span.textContent = message;
    toast.appendChild(span);

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px) translateX(-50%)';
        setTimeout(() => toast.remove(), 400);
    }, duration);
}

// ==================== Caching System ====================
const cacheManager = {
    async get(key) {
        if (state.cache.has(key)) {
            const cached = state.cache.get(key);
            if (Date.now() - cached.timestamp < APP_CONFIG.CACHE_DURATION) {
                return cached.data;
            }
            state.cache.delete(key);
        }

        try {
            const stored = localStorage.getItem(`cache_${key}`);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Date.now() - parsed.timestamp < APP_CONFIG.CACHE_DURATION) {
                    state.cache.set(key, parsed);
                    return parsed.data;
                }
                localStorage.removeItem(`cache_${key}`);
            }
        } catch (e) {
            console.warn('Cache read error:', e);
        }

        return null;
    },

    set(key, data) {
        const cacheEntry = { data, timestamp: Date.now() };
        state.cache.set(key, cacheEntry);

        try {
            localStorage.setItem(`cache_${key}`, JSON.stringify(cacheEntry));
        } catch (e) {
            console.warn('Cache write error:', e);
        }
    }
};

// ==================== API Functions with Caching ====================
async function fetchWithCache(url, cacheKey) {
    const cached = await cacheManager.get(cacheKey);
    if (cached) {
        console.log('Serving from cache:', cacheKey);
        return cached;
    }

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        cacheManager.set(cacheKey, data);
        return data;
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}

// ==================== Load Surahs ====================

/**
 * تحميل قائمة السور من API
 * @returns {Promise<void>}
 */
async function loadSurahs() {
    try {
        const data = await fetchWithCache(
            `${APP_CONFIG.API_BASE}/surah`,
            'all_surahs'
        );

        state.allSurahs = data.data;
        displaySurahs(state.allSurahs);
        updateProgressBar();
    } catch (error) {
        console.error('Error loading surahs:', error);
        showToast('حدث خطأ في تحميل السور', 'error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'loading';
        const errorIcon = document.createElement('i');
        errorIcon.className = 'fas fa-exclamation-circle';
        errorIcon.style.color = 'var(--error)';
        errorDiv.appendChild(errorIcon);
        const errorMsg = document.createElement('p');
        errorMsg.textContent = 'حدث خطأ في التحميل. تحقق من اتصالك بالإنترنت.';
        errorDiv.appendChild(errorMsg);
        elements['surah-list'].innerHTML = '';
        elements['surah-list'].appendChild(errorDiv);
    }
}

// ==================== Display Surahs ====================

/**
 * عرض قائمة السور في الواجهة
 * @param {Array<Object>} surahs - مصفوفة بيانات السور
 * @returns {void}
 */
function displaySurahs(surahs) {
    const list = elements['surah-list'];
    if (!list) return;

    if (surahs.length === 0) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'empty-state';
        const searchIcon = document.createElement('i');
        searchIcon.className = 'fas fa-search';
        emptyDiv.appendChild(searchIcon);
        const emptyText = document.createElement('p');
        emptyText.textContent = 'لا توجد نتائج';
        emptyDiv.appendChild(emptyText);
        list.innerHTML = '';
        list.appendChild(emptyDiv);
        return;
    }

    list.innerHTML = '';
    surahs.forEach(surah => {
        const isBookmarked = state.bookmarks.some(b => b.type === 'surah' && b.surah === surah.number);
        const isRead = state.readingProgress[surah.number];

        const surahItem = document.createElement('div');
        surahItem.className = `surah-item ${isRead ? 'read' : ''}`;
        surahItem.dataset.number = surah.number;
        surahItem.onclick = () => loadSurah(surah.number);

        const numberDiv = document.createElement('div');
        numberDiv.className = 'surah-number';
        numberDiv.textContent = surah.number;
        surahItem.appendChild(numberDiv);

        const infoCard = document.createElement('div');
        infoCard.className = 'surah-info-card';

        const nameAr = document.createElement('div');
        nameAr.className = 'surah-name-ar';
        nameAr.textContent = surah.name;
        infoCard.appendChild(nameAr);

        const meta = document.createElement('div');
        meta.className = 'surah-meta';

        const metaItems = [
            { icon: 'fa-globe', text: surah.englishName },
            { icon: 'fa-list-ol', text: `${surah.numberOfAyahs} آية` },
            { icon: surah.revelationType === 'Meccan' ? 'fa-kaaba' : 'fa-mosque', text: surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية' }
        ];

        metaItems.forEach(item => {
            const span = document.createElement('span');
            span.className = 'meta-item';
            const i = document.createElement('i');
            i.className = `fas ${item.icon}`;
            span.appendChild(i);
            span.appendChild(document.createTextNode(` ${item.text}`));
            meta.appendChild(span);
        });

        if (isBookmarked) {
            const starSpan = document.createElement('span');
            starSpan.className = 'meta-item';
            const starIcon = document.createElement('i');
            starIcon.className = 'fas fa-star';
            starIcon.style.color = 'var(--accent-gold)';
            starSpan.appendChild(starIcon);
            meta.appendChild(starSpan);
        }

        infoCard.appendChild(meta);
        surahItem.appendChild(infoCard);
        list.appendChild(surahItem);
    });
}

// ==================== Load Surah ====================

/**
 * تحميل سورة محددة وعرض آياتها
 * @param {number} surahNumber - رقم السورة (1-114)
 * @returns {Promise<void>}
 */
async function loadSurah(surahNumber) {
    try {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading';
        const spinner = document.createElement('div');
        spinner.className = 'spinner';
        loadingDiv.appendChild(spinner);
        const loadingText = document.createElement('p');
        loadingText.textContent = 'جاري تحميل السورة...';
        loadingDiv.appendChild(loadingText);
        elements['verses-container'].innerHTML = '';
        elements['verses-container'].appendChild(loadingDiv);

        // إيقاف الصوت الحالي
        if (state.audioElement) {
            state.audioElement.pause();
            state.isPlaying = false;
        }

        const data = await fetchWithCache(
            `${APP_CONFIG.API_BASE}/surah/${surahNumber}`,
            `surah_${surahNumber}`
        );

        state.currentSurah = data.data;
        state.currentVerseIndex = 0;
        state.verseTimings = []; // إعادة تعيين التوقيتات

        state.readingProgress[surahNumber] = {
            lastRead: Date.now(),
            percentage: 0
        };
        saveReadingProgress();

        updateSurahHeader();
        displayVerses();
        highlightActiveSurah(surahNumber);
        updateProgressBar();

        // تحميل الصوت الكامل تلقائياً إذا كان وضع التشغيل التلقائي مفعل
        if (state.settings.autoPlay) {
            setTimeout(() => {
                playFullSurah();
            }, 1000);
        }

        if (window.innerWidth <= 992) {
            elements['sidebar'].classList.remove('active');
        }

        showToast(`تم تحميل سورة ${state.currentSurah.name}`, 'success');

    } catch (error) {
        console.error('Error loading surah:', error);
        showToast('حدث خطأ في تحميل السورة', 'error');
    }
}

// ==================== Update Surah Header ====================
function updateSurahHeader() {
    const surah = state.currentSurah;
    if (!surah) return;

    elements['surah-name'].textContent = surah.name;
    elements['surah-details'].textContent = `${surah.englishName} • ${surah.numberOfAyahs} آية • ${surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}`;

    const badge = document.getElementById('surah-badge');
    if (badge) {
        badge.innerHTML = '';
        const badgeSpan = document.createElement('span');
        badgeSpan.className = 'surah-number-badge';
        badgeSpan.textContent = surah.number;
        badge.appendChild(badgeSpan);
    }

    const isBookmarked = state.bookmarks.some(b => b.type === 'surah' && b.surah === surah.number);
    updateSaveButton(isBookmarked);
}

function updateSaveButton(isBookmarked) {
    const btn = elements['save-surah-main'];
    if (!btn) return;

    btn.classList.toggle('saved', isBookmarked);
    btn.innerHTML = '';
    const icon = document.createElement('i');
    icon.className = isBookmarked ? 'fas fa-star' : 'far fa-star';
    btn.appendChild(icon);
    btn.appendChild(document.createTextNode(` ${isBookmarked ? 'تم الحفظ' : 'حفظ السورة'}`));
}

// ==================== Display Verses ====================
function displayVerses() {
    if (!state.currentSurah) return;

    const fontSize = state.settings.fontSize;

    const wrapper = document.createElement('div');
    wrapper.className = 'verses-wrapper';
    wrapper.style.fontSize = `${fontSize}rem`;

    // Surah header
    const header = document.createElement('div');
    header.className = 'surah-header-mushaf';
    const sideText1 = document.createElement('span');
    sideText1.className = 'side-text';
    sideText1.textContent = `سُورَةُ ${state.currentSurah.name}`;
    header.appendChild(sideText1);
    const sideText2 = document.createElement('span');
    sideText2.className = 'side-text';
    sideText2.textContent = `الجزء ${state.currentSurah.ayahs[0]?.juz || 1}`;
    header.appendChild(sideText2);
    wrapper.appendChild(header);

    // Bismillah
    if (state.currentSurah.number !== 1 && state.currentSurah.number !== 9) {
        const bismillah = document.createElement('p');
        bismillah.className = 'bismillah';
        bismillah.textContent = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';
        wrapper.appendChild(bismillah);
    }

    // Verses container
    const versesText = document.createElement('div');
    versesText.className = 'verses-text';

    state.currentSurah.ayahs.forEach((ayah, index) => {
        const isBookmarked = state.bookmarks.some(b =>
            b.type === 'verse' && b.surah === state.currentSurah.number && b.verse === ayah.numberInSurah
        );
        const isPlaying = state.currentVerseIndex === index && state.isPlaying;

        const verseSpan = document.createElement('span');
        verseSpan.className = `verse-item ${isBookmarked ? 'bookmarked' : ''} ${isPlaying ? 'playing' : ''}`;
        verseSpan.id = `verse-${index}`;
        verseSpan.dataset.verseIndex = index;
        verseSpan.dataset.verseNumber = ayah.numberInSurah;
        verseSpan.onclick = () => handleVerseClick(index);

        // Verse text
        verseSpan.appendChild(document.createTextNode(ayah.text));

        // Verse number
        const verseNum = document.createElement('span');
        verseNum.className = 'verse-number';
        verseNum.title = isBookmarked ? 'إزالة من المفضلة' : 'إضافة للمفضلة';
        verseNum.onclick = (e) => {
            e.stopPropagation();
            toggleBookmark(state.currentSurah.number, ayah.numberInSurah, ayah.text, state.currentSurah.name);
        };
        verseNum.textContent = ayah.numberInSurah;
        verseSpan.appendChild(verseNum);

        versesText.appendChild(verseSpan);
    });

    wrapper.appendChild(versesText);

    elements['verses-container'].innerHTML = '';
    elements['verses-container'].appendChild(wrapper);
}

// ==================== Safe DOM Helpers ====================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function safeSetText(element, text) {
    if (element) element.textContent = text;
}

function safeSetHTML(element, html) {
    if (element) element.innerHTML = html;
}

function createSafeElement(tag, attrs = {}, children = []) {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => {
        if (key === 'className') el.className = value;
        else if (key === 'textContent') el.textContent = value;
        else if (key === 'innerHTML') el.innerHTML = value;
        else if (key.startsWith('on')) el.addEventListener(key.slice(2).toLowerCase(), value);
        else el.setAttribute(key, value);
    });
    children.forEach(child => {
        if (typeof child === 'string') el.appendChild(document.createTextNode(child));
        else if (child) el.appendChild(child);
    });
    return el;
}

// ==================== NEW: Full Surah Audio System ====================

/**
 * تحويل رقم السورة إلى تنسق ثلاثي الأرقام
 * @param {number} surahNumber - رقم السورة
 * @returns {string} - رقم السورة بتنسيق ثلاثي (001, 002, ...)
 */
function getSurahFileName(surahNumber) {
    return surahNumber.toString().padStart(3, '0');
}

/**
 * تشغيل السورة كاملة مع MP3
 * @param {number} startVerseIndex - فهرس الآية للبدء منها
 * @returns {Promise<void>}
 */
async function playFullSurah(startVerseIndex = 0) {
    if (!state.currentSurah) {
        showToast('اختر سورة أولاً', 'warning');
        return;
    }

    const reciterKey = state.currentReciter;
    const reciter = APP_CONFIG.FULL_SURAH_AUDIO[reciterKey];

    if (!reciter) {
        showToast('القارئ غير متوفر في وضع السورة الكاملة', 'error');
        return;
    }

    // بناء رابط الملف
    const surahFileName = getSurahFileName(state.currentSurah.number);
    const audioUrl = `${reciter.baseUrl}/${surahFileName}.mp3`;

    console.log('Loading full surah audio:', audioUrl);

    try {
        // إظهار حالة التحميل
        if (elements['player-verse']) {
            elements['player-verse'].textContent = 'جاري تحميل السورة...';
        }

        // إعداد عنصر الصوت
        if (!state.audioElement) {
            state.audioElement = elements['audio-element'];
            if (!state.audioElement) {
                state.audioElement = new Audio();
                state.audioElement.id = 'audio-element';
                document.body.appendChild(state.audioElement);
            }
        }

        // إيقاف الصوت الحالي
        state.audioElement.pause();
        state.audioElement.currentTime = 0;

        // إعداد المصدر الجديد
        state.audioElement.src = audioUrl;
        state.audioElement.preload = 'auto';
        state.audioElement.playbackRate = parseFloat(elements['playback-speed']?.value || 1);

        // إضافة event listeners
        setupFullSurahAudioListeners();

        // تحميل وتشغيل
        await new Promise((resolve, reject) => {
            state.audioElement.addEventListener('canplaythrough', resolve, { once: true });
            state.audioElement.addEventListener('error', reject, { once: true });
            state.audioElement.load();

            // timeout بعد 30 ثانية
            setTimeout(() => reject(new Error('Timeout')), 30000);
        });

        await state.audioElement.play();
        state.isPlaying = true;
        state.currentVerseIndex = startVerseIndex;

        // تحديث واجهة المستخدم
        updatePlayerUI();
        elements['audio-player'].classList.add('active');
        updatePlayPauseButton();
        highlightCurrentVerse(startVerseIndex);

        showToast(`جاري تشغيل سورة ${state.currentSurah.name} - ${reciter.name}`, 'success');

    } catch (error) {
        console.error('Error playing full surah:', error);
        showToast('حدث خطأ في تحميل الصوت. جاري المحاولة بآلية بديلة...', 'warning');

        // محاولة استخدام API القديم كبديل
        setTimeout(() => {
            playVerseOld(startVerseIndex);
        }, 2000);
    }
}

// إعداد مستمعي أحداث الصوت للسورة الكاملة
function setupFullSurahAudioListeners() {
    if (!state.audioElement) return;

    // إزالة المستمعين القدامى
    const events = ['timeupdate', 'ended', 'error', 'waiting', 'playing', 'pause'];
    events.forEach(event => {
        state.audioElement.removeEventListener(event, handleAudioEvent);
    });

    // إضافة مستمع جديد
    events.forEach(event => {
        state.audioElement.addEventListener(event, handleAudioEvent);
    });
}

function handleAudioEvent(event) {
    if (!state.audioElement || !state.currentSurah) return;

    switch (event.type) {
        case 'timeupdate':
            updateProgressFromTime();
            break;
        case 'ended':
            handleAudioEnded();
            break;
        case 'error':
            console.error('Audio error:', event);
            break;
        case 'waiting':
            if (elements['player-verse']) {
                elements['player-verse'].textContent = 'جاري التحميل...';
            }
            break;
        case 'playing':
            state.isPlaying = true;
            updatePlayPauseButton();
            break;
        case 'pause':
            state.isPlaying = false;
            updatePlayPauseButton();
            break;
    }
}

// تحديث التقدم من الوقت الحالي
function updateProgressFromTime() {
    if (!state.audioElement || !state.audioElement.duration) return;

    const currentTime = state.audioElement.currentTime;
    const duration = state.audioElement.duration;
    const progress = (currentTime / duration) * 100;

    // تحديث شريط التقدم
    if (elements['progress-bar']) {
        elements['progress-bar'].value = progress || 0;
    }

    // تحديث الوقت
    if (elements['current-time']) {
        elements['current-time'].textContent = formatTime(currentTime);
    }
    if (elements['duration'] && duration) {
        elements['duration'].textContent = formatTime(duration);
    }

    // تحديد الآية الحالية بناءً على الوقت (تقريبي)
    updateCurrentVerseFromTime(currentTime, duration);
}

// تحديث الآية الحالية بناءً على الوقت
function updateCurrentVerseFromTime(currentTime, duration) {
    if (!state.currentSurah) return;

    // حساب تقريبي: قسمة الوقت على عدد الآيات
    const totalVerses = state.currentSurah.ayahs.length;
    const progressRatio = currentTime / duration;
    const estimatedVerseIndex = Math.floor(progressRatio * totalVerses);

    // التأكد من الحدود
    const newIndex = Math.min(estimatedVerseIndex, totalVerses - 1);

    if (newIndex !== state.currentVerseIndex) {
        state.currentVerseIndex = newIndex;
        highlightCurrentVerse(newIndex);

        // التمرير إلى الآية
        const verseElement = document.getElementById(`verse-${newIndex}`);
        if (verseElement) {
            verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        // تحديث نص المشغل
        if (elements['player-verse']) {
            const ayah = state.currentSurah.ayahs[newIndex];
            elements['player-verse'].textContent = `الآية ${ayah?.numberInSurah || 1}`;
        }
    }
}

function handleAudioEnded() {
    console.log('Audio ended');
    state.isPlaying = false;
    updatePlayPauseButton();

    if (state.settings.autoNextSurah && state.currentSurah.number < 114) {
        showToast('جاري الانتقال للسورة التالية...', 'info');
        setTimeout(() => {
            loadSurah(state.currentSurah.number + 1);
        }, 2000);
    } else {
        showToast('انتهت التلاوة', 'success');
    }
}

// التشغيل القديم بالآية (كبديل)
async function playVerseOld(verseIndex) {
    if (!state.currentSurah) return;

    state.currentVerseIndex = verseIndex;
    const reciter = Object.keys(APP_CONFIG.VERSE_BY_VERSE)[0]; // alafasy
    const ayah = state.currentSurah.ayahs[verseIndex];

    try {
        const data = await fetchWithCache(
            `${APP_CONFIG.API_BASE}/ayah/${ayah.number}/${reciter}`,
            `audio_${ayah.number}_${reciter}`
        );

        if (!state.audioElement) {
            state.audioElement = new Audio();
        }

        state.audioElement.src = data.data.audio;
        state.audioElement.load();

        await state.audioElement.play();
        state.isPlaying = true;

        updatePlayerUI();
        elements['audio-player'].classList.add('active');
        updatePlayPauseButton();
        highlightCurrentVerse(verseIndex);

    } catch (error) {
        console.error('Error playing verse:', error);
        showToast('حدث خطأ في تشغيل الصوت', 'error');
    }
}

// ==================== Player Controls ====================
function updatePlayerUI() {
    if (!state.currentSurah) return;

    elements['player-surah'].textContent = state.currentSurah.name;
    const ayah = state.currentSurah.ayahs[state.currentVerseIndex];
    elements['player-verse'].textContent = `الآية ${ayah?.numberInSurah || 1}`;
}

function updatePlayPauseButton() {
    const btn = elements['play-pause'];
    if (!btn) return;

    btn.innerHTML = '';
    const icon = document.createElement('i');
    icon.className = state.isPlaying ? 'fas fa-pause' : 'fas fa-play';
    btn.appendChild(icon);
}

function highlightCurrentVerse(index) {
    document.querySelectorAll('.verse-item').forEach(item => {
        item.classList.remove('playing');
    });

    const currentVerse = document.getElementById(`verse-${index}`);
    if (currentVerse) {
        currentVerse.classList.add('playing');
    }
}

function formatTime(seconds) {
    if (isNaN(seconds) || seconds === Infinity) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ==================== Bookmarks System ====================
function toggleBookmark(surahNumber, verseNumber, verseText, surahName) {
    const existingIndex = state.bookmarks.findIndex(b =>
        b.type === 'verse' && b.surah === surahNumber && b.verse === verseNumber
    );

    if (existingIndex > -1) {
        state.bookmarks.splice(existingIndex, 1);
        showToast('تم إزالة الآية من المفضلة', 'info');
    } else {
        state.bookmarks.push({
            type: 'verse',
            surah: surahNumber,
            verse: verseNumber,
            text: verseText,
            surahName: surahName,
            date: Date.now()
        });
        showToast('تم إضافة الآية للمفضلة', 'success');
    }

    saveBookmarks();

    if (state.currentSurah && state.currentSurah.number === surahNumber) {
        displayVerses();
    }
}

function toggleSurahBookmark(surahNumber, surahName) {
    const existingIndex = state.bookmarks.findIndex(b =>
        b.type === 'surah' && b.surah === surahNumber
    );

    if (existingIndex > -1) {
        state.bookmarks.splice(existingIndex, 1);
        showToast('تم إزالة السورة من المفضلة', 'info');
    } else {
        state.bookmarks.push({
            type: 'surah',
            surah: surahNumber,
            surahName: surahName,
            date: Date.now()
        });
        showToast('تم إضافة السورة للمفضلة', 'success');
    }

    saveBookmarks();
    updateSaveButton(existingIndex === -1);

    const surahItem = document.querySelector(`.surah-item[data-number="${surahNumber}"]`);
    if (surahItem) {
        displaySurahs(state.allSurahs);
    }
}

function saveBookmarks() {
    localStorage.setItem('quranBookmarks', JSON.stringify(state.bookmarks));
}

function saveReadingProgress() {
    localStorage.setItem('quranReadingProgress', JSON.stringify(state.readingProgress));
}

function saveSettings() {
    localStorage.setItem('quranSettings', JSON.stringify(state.settings));
}

// ==================== Display Bookmarks ====================
function displayBookmarks(filter = 'all') {
    const list = elements['bookmarks-list'];
    if (!list) return;

    let filtered = state.bookmarks;
    if (filter !== 'all') {
        filtered = state.bookmarks.filter(b => b.type === filter);
    }

    if (filtered.length === 0) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'empty-state';
        const bookmarkIcon = document.createElement('i');
        bookmarkIcon.className = 'fas fa-bookmark';
        emptyDiv.appendChild(bookmarkIcon);
        const emptyText = document.createElement('p');
        emptyText.textContent = `لا توجد ${filter === 'all' ? 'عناصر' : filter === 'surah' ? 'سور' : 'آيات'} محفوظة بعد`;
        emptyDiv.appendChild(emptyText);
        list.innerHTML = '';
        list.appendChild(emptyDiv);
        return;
    }

    filtered.sort((a, b) => b.date - a.date);
    list.innerHTML = '';

    filtered.forEach((item, index) => {
        const bookmarkItem = document.createElement('div');
        bookmarkItem.className = 'bookmark-item';

        const info = document.createElement('div');
        info.className = 'bookmark-info';

        const title = document.createElement('div');
        title.className = 'bookmark-title';

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-bookmark';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            deleteBookmark(index);
        };
        const trashIcon = document.createElement('i');
        trashIcon.className = 'fas fa-trash';
        deleteBtn.appendChild(trashIcon);

        if (item.type === 'surah') {
            bookmarkItem.onclick = () => loadSurah(item.surah);

            const starIcon = document.createElement('i');
            starIcon.className = 'fas fa-star';
            starIcon.style.color = 'var(--accent-gold)';
            title.appendChild(starIcon);
            title.appendChild(document.createTextNode(` سورة ${item.surahName}`));

            info.appendChild(title);
            bookmarkItem.appendChild(info);
            bookmarkItem.appendChild(deleteBtn);
            list.appendChild(bookmarkItem);
        } else {
            bookmarkItem.onclick = () => loadSurahAndScroll(item.surah, item.verse);

            const bookIcon = document.createElement('i');
            bookIcon.className = 'fas fa-book-open';
            bookIcon.style.color = 'var(--primary)';
            title.appendChild(bookIcon);
            title.appendChild(document.createTextNode(` سورة ${item.surahName} - الآية ${item.verse}`));

            const textDiv = document.createElement('div');
            textDiv.className = 'bookmark-text';
            textDiv.textContent = `${item.text.substring(0, 100)}...`;

            info.appendChild(title);
            info.appendChild(textDiv);
            bookmarkItem.appendChild(info);
            bookmarkItem.appendChild(deleteBtn);
            list.appendChild(bookmarkItem);
        }
    });
}

function deleteBookmark(index) {
    state.bookmarks.splice(index, 1);
    saveBookmarks();
    displayBookmarks();
    showToast('تم الحذف بنجاح', 'success');

    if (state.currentSurah) {
        displayVerses();
    }
}

async function loadSurahAndScroll(surahNumber, verseNumber) {
    await loadSurah(surahNumber);
    elements['bookmark-modal'].classList.remove('active');

    const verseIndex = state.currentSurah.ayahs.findIndex(a => a.numberInSurah === verseNumber);
    if (verseIndex > -1) {
        setTimeout(() => {
            const element = document.getElementById(`verse-${verseIndex}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.classList.add('playing');
                setTimeout(() => element.classList.remove('playing'), 2000);
            }
        }, 300);
    }
}

// ==================== Search Function ====================
function setupSearch() {
    const searchInput = elements['search-input'];
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        clearTimeout(state.searchDebounceTimer);
        const query = e.target.value.trim();

        if (query.length < 2) {
            const hintDiv = document.createElement('div');
            hintDiv.className = 'search-hint';
            const keyboardIcon = document.createElement('i');
            keyboardIcon.className = 'fas fa-keyboard';
            hintDiv.appendChild(keyboardIcon);
            const hintText = document.createElement('p');
            hintText.textContent = 'اكتب كلمة للبحث عنها في القرآن الكريم';
            hintDiv.appendChild(hintText);
            elements['search-results'].innerHTML = '';
            elements['search-results'].appendChild(hintDiv);
            return;
        }

        state.searchDebounceTimer = setTimeout(() => searchQuran(query), 500);
    });
}

async function searchQuran(query) {
    const resultsContainer = elements['search-results'];
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading';
    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    loadingDiv.appendChild(spinner);
    resultsContainer.innerHTML = '';
    resultsContainer.appendChild(loadingDiv);

    try {
        const data = await fetchWithCache(
            `${APP_CONFIG.API_BASE}/search/${encodeURIComponent(query)}/all/ar`,
            `search_${query}`
        );

        if (data.data.matches.length === 0) {
            const noResultsDiv = document.createElement('div');
            noResultsDiv.className = 'search-hint';
            const searchIcon = document.createElement('i');
            searchIcon.className = 'fas fa-search';
            noResultsDiv.appendChild(searchIcon);
            const noResultsText = document.createElement('p');
            noResultsText.textContent = 'لم يتم العثور على نتائج';
            noResultsDiv.appendChild(noResultsText);
            resultsContainer.innerHTML = '';
            resultsContainer.appendChild(noResultsDiv);
            return;
        }

        const results = data.data.matches.slice(0, 20);
        resultsContainer.innerHTML = '';

        results.forEach(match => {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            resultItem.onclick = () => {
                loadSurah(match.surah.number);
                closeModal('search-modal');
            };

            const resultSurah = document.createElement('div');
            resultSurah.className = 'result-surah';
            const bookIcon = document.createElement('i');
            bookIcon.className = 'fas fa-book';
            resultSurah.appendChild(bookIcon);
            resultSurah.appendChild(document.createTextNode(` ${match.surah.name} - الآية ${match.numberInSurah}`));

            const resultText = document.createElement('div');
            resultText.className = 'result-text';
            resultText.textContent = match.text;

            resultItem.appendChild(resultSurah);
            resultItem.appendChild(resultText);
            resultsContainer.appendChild(resultItem);
        });

    } catch (error) {
        console.error('Search error:', error);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'search-hint';
        const errorIcon = document.createElement('i');
        errorIcon.className = 'fas fa-exclamation-circle';
        errorIcon.style.color = 'var(--error)';
        errorDiv.appendChild(errorIcon);
        const errorText = document.createElement('p');
        errorText.textContent = 'حدث خطأ في البحث';
        errorDiv.appendChild(errorText);
        resultsContainer.innerHTML = '';
        resultsContainer.appendChild(errorDiv);
    }
}

// ==================== Tafsir Function ====================
async function loadTafsir(verseIndex) {
    if (!state.currentSurah) return;

    const ayah = state.currentSurah.ayahs[verseIndex];
    const edition = elements['tafsir-select']?.value || 'ar.jalalayn';

    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading';
    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    loadingDiv.appendChild(spinner);
    const loadingText = document.createElement('p');
    loadingText.textContent = 'جاري تحميل التفسير...';
    loadingDiv.appendChild(loadingText);
    elements['tafsir-content'].innerHTML = '';
    elements['tafsir-content'].appendChild(loadingDiv);

    try {
        const data = await fetchWithCache(
            `${APP_CONFIG.API_BASE}/ayah/${ayah.number}/${edition}`,
            `tafsir_${ayah.number}_${edition}`
        );

        elements['tafsir-content'].innerHTML = '';

        const tafsirHeader = document.createElement('div');
        tafsirHeader.className = 'tafsir-header';
        const verseText = document.createElement('div');
        verseText.className = 'tafsir-verse-text';
        verseText.textContent = ayah.text;
        tafsirHeader.appendChild(verseText);
        elements['tafsir-content'].appendChild(tafsirHeader);

        const tafsirText = document.createElement('div');
        tafsirText.className = 'tafsir-text';
        tafsirText.textContent = data.data.text;
        elements['tafsir-content'].appendChild(tafsirText);

        const sourceDiv = document.createElement('div');
        sourceDiv.style.marginTop = '2rem';
        sourceDiv.style.textAlign = 'center';
        sourceDiv.style.color = 'var(--text-muted)';
        sourceDiv.style.fontSize = '0.85rem';
        sourceDiv.textContent = `المصدر: ${data.data.edition.name}`;
        elements['tafsir-content'].appendChild(sourceDiv);

    } catch (error) {
        console.error('Error loading tafsir:', error);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'tafsir-hint';
        const errorIcon = document.createElement('i');
        errorIcon.className = 'fas fa-exclamation-circle';
        errorIcon.style.color = 'var(--error)';
        errorDiv.appendChild(errorIcon);
        const errorText = document.createElement('p');
        errorText.textContent = 'حدث خطأ في تحميل التفسير';
        errorDiv.appendChild(errorText);
        elements['tafsir-content'].innerHTML = '';
        elements['tafsir-content'].appendChild(errorDiv);
    }
}

// ==================== Theme & Settings ====================
function toggleTheme() {
    const body = document.body;
    const isDark = body.classList.toggle('dark-mode');
    state.settings.theme = isDark ? 'dark' : 'light';

    const icon = elements['theme-toggle']?.querySelector('i');
    if (icon) {
        icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    }

    saveSettings();
    showToast(isDark ? 'تم تفعيل الوضع الليلي' : 'تم تفعيل الوضع النهاري', 'info');
}

function changeFontSize(delta) {
    let newSize = state.settings.fontSize + delta;
    newSize = Math.max(APP_CONFIG.MIN_FONT_SIZE, Math.min(APP_CONFIG.MAX_FONT_SIZE, newSize));

    state.settings.fontSize = newSize;
    saveSettings();

    const wrapper = document.querySelector('.verses-wrapper');
    if (wrapper) {
        wrapper.style.fontSize = `${newSize}rem`;
    }

    showToast(`حجم الخط: ${newSize.toFixed(1)}`, 'info');
}

function updateProgressBar() {
    const totalSurahs = 114;
    const readSurahs = Object.keys(state.readingProgress).length;
    const percentage = Math.round((readSurahs / totalSurahs) * 100);

    const progressFill = elements['reading-progress'];
    const progressText = elements['progress-text'];

    if (progressFill) {
        progressFill.style.width = `${percentage}%`;
    }
    if (progressText) {
        progressText.textContent = ` ${readSurahs} من 114 (${percentage}%)`;
    }
}

function toggleAutoPlay() {
    state.settings.autoPlay = !state.settings.autoPlay;
    saveSettings();

    const btn = elements['auto-play-btn'];
    if (btn) {
        btn.classList.toggle('active', state.settings.autoPlay);
    }

    showToast(state.settings.autoPlay ? 'تم تفعيل التشغيل التلقائي' : 'تم إيقاف التشغيل التلقائي', 'info');
}

// ==================== Modal Functions ====================
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ==================== Event Listeners Setup ====================
function setupEventListeners() {
    // Theme toggle
    elements['theme-toggle']?.addEventListener('click', toggleTheme);

    // Menu toggle
    elements['menu-toggle']?.addEventListener('click', () => {
        elements['sidebar'].classList.toggle('active');
    });

    // Search
    elements['search-btn']?.addEventListener('click', () => openModal('search-modal'));
    setupSearch();

    // Bookmarks
    elements['bookmark-btn']?.addEventListener('click', () => {
        displayBookmarks();
        openModal('bookmark-modal');
    });

    // Tafsir
    elements['tafsir-btn']?.addEventListener('click', () => {
        if (state.currentSurah) {
            loadTafsir(state.currentVerseIndex);
        }
        openModal('tafsir-modal');
    });

    elements['tafsir-select']?.addEventListener('change', () => {
        if (state.currentSurah) {
            loadTafsir(state.currentVerseIndex);
        }
    });

    // Font controls
    elements['increase-font']?.addEventListener('click', () => changeFontSize(0.1));
    elements['decrease-font']?.addEventListener('click', () => changeFontSize(-0.1));

    // Save surah
    elements['save-surah-main']?.addEventListener('click', () => {
        if (state.currentSurah) {
            toggleSurahBookmark(state.currentSurah.number, state.currentSurah.name);
        }
    });

    // Last read
    elements['last-read-btn']?.addEventListener('click', () => {
        const lastRead = Object.entries(state.readingProgress)
            .sort((a, b) => b[1].lastRead - a[1].lastRead)[0];

        if (lastRead) {
            loadSurah(parseInt(lastRead[0]));
            showToast('تم تحميل آخر قراءة', 'success');
        } else {
            showToast('لا توجد قراءة سابقة', 'warning');
        }
    });

    // Auto play
    elements['auto-play-btn']?.addEventListener('click', toggleAutoPlay);

    // Audio controls - NEW
    elements['play-pause']?.addEventListener('click', () => {
        if (!state.audioElement) {
            // بدء تشغيل جديد
            if (state.currentSurah) {
                playFullSurah(state.currentVerseIndex);
            }
            return;
        }

        if (state.isPlaying) {
            state.audioElement.pause();
            state.isPlaying = false;
        } else {
            state.audioElement.play();
            state.isPlaying = true;
        }
        updatePlayPauseButton();
    });

    // Reciter select - NEW
    elements['reciter-select']?.addEventListener('change', (e) => {
        state.currentReciter = e.target.value;
        state.settings.reciter = e.target.value;
        saveSettings();

        // إعادة تشغيل إذا كان يعمل
        if (state.isPlaying && state.currentSurah) {
            const currentTime = state.audioElement?.currentTime || 0;
            playFullSurah(state.currentVerseIndex);
        }
    });

    // Skip buttons
    elements['skip-forward']?.addEventListener('click', () => {
        if (state.audioElement) state.audioElement.currentTime += 10;
    });

    elements['skip-back']?.addEventListener('click', () => {
        if (state.audioElement) state.audioElement.currentTime -= 10;
    });

    // Repeat
    elements['repeat-verse']?.addEventListener('click', () => {
        state.isRepeatEnabled = !state.isRepeatEnabled;
        elements['repeat-verse'].classList.toggle('active', state.isRepeatEnabled);
        showToast(state.isRepeatEnabled ? 'تم تفعيل التكرار' : 'تم إيقاف التكرار', 'info');
    });

    // Speed control
    elements['playback-speed']?.addEventListener('change', (e) => {
        if (state.audioElement) {
            state.audioElement.playbackRate = parseFloat(e.target.value);
        }
    });

    // Close player
    elements['close-player']?.addEventListener('click', () => {
        if (state.audioElement) {
            state.audioElement.pause();
            state.isPlaying = false;
        }
        elements['audio-player'].classList.remove('active');
        document.querySelectorAll('.verse-item').forEach(item => {
            item.classList.remove('playing');
        });
    });

    // Progress bar
    elements['progress-bar']?.addEventListener('input', (e) => {
        if (state.audioElement && state.audioElement.duration) {
            const time = (e.target.value / 100) * state.audioElement.duration;
            state.audioElement.currentTime = time;
        }
    });

    // Filter tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            const filter = e.target.dataset.filter;
            if (filter === 'all') {
                displaySurahs(state.allSurahs);
            } else {
                const filtered = state.allSurahs.filter(s =>
                    s.revelationType.toLowerCase() === (filter === 'makkah' ? 'meccan' : 'medinan')
                );
                displaySurahs(filtered);
            }
        });
    });

    // Bookmark tabs
    document.querySelectorAll('.bookmark-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            document.querySelectorAll('.bookmark-tab').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            displayBookmarks(e.target.dataset.tab);
        });
    });

    // Close modals
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modalId = e.currentTarget.dataset.modal;
            closeModal(modalId);
        });
    });

    // Close modal on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });

    // Surah search
    elements['surah-search']?.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = state.allSurahs.filter(s =>
            s.name.includes(query) ||
            s.englishName.toLowerCase().includes(query) ||
            s.number.toString() === query
        );
        displaySurahs(filtered);
    });

    // View toggle (Surahs/Juz)
    elements['view-toggle']?.addEventListener('click', toggleView);

    // Save position on verse change
    document.addEventListener('click', (e) => {
        if (e.target.closest('.verse-item')) {
            setTimeout(saveLastPosition, 100);
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'k') {
            e.preventDefault();
            openModal('search-modal');
            elements['search-input']?.focus();
        }

        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.active').forEach(modal => {
                modal.classList.remove('active');
            });
            document.body.style.overflow = '';
        }

        if (e.code === 'Space' && document.activeElement.tagName !== 'INPUT') {
            e.preventDefault();
            elements['play-pause']?.click();
        }
    });
}

// ==================== Share & Download ====================
async function shareCurrentSurah() {
    if (!state.currentSurah) {
        showToast('اختر سورة أولاً', 'warning');
        return;
    }

    const shareData = {
        title: `سورة ${state.currentSurah.name}`,
        text: `اقرأ سورة ${state.currentSurah.name} في تطبيق القرآن الكريم`,
        url: window.location.href
    };

    if (navigator.share) {
        try {
            await navigator.share(shareData);
            showToast('تمت المشاركة بنجاح', 'success');
        } catch (err) {
            console.log('Share canceled');
        }
    } else {
        try {
            await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}`);
            showToast('تم نسخ الرابط', 'success');
        } catch (err) {
            showToast('تعذر المشاركة', 'error');
        }
    }
}

async function downloadCurrentSurah() {
    if (!state.currentSurah) {
        showToast('اختر سورة أولاً', 'warning');
        return;
    }

    showToast('جاري التحضير للتحميل...', 'info');

    let content = `سورة ${state.currentSurah.name}\n`;
    content += `عدد الآيات: ${state.currentSurah.numberOfAyahs}\n`;
    content += `${state.currentSurah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}\n\n`;
    content += `بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\n\n`;

    state.currentSurah.ayahs.forEach(ayah => {
        content += `${ayah.text} (${ayah.numberInSurah})\n`;
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `سورة_${state.currentSurah.name}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('تم التحميل بنجاح', 'success');
}

function highlightActiveSurah(surahNumber) {
    document.querySelectorAll('.surah-item').forEach(item => {
        item.classList.remove('active');
    });

    const activeItem = document.querySelector(`.surah-item[data-number="${surahNumber}"]`);
    if (activeItem) {
        activeItem.classList.add('active');
        activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

function handleVerseClick(index) {
    // تشغيل السورة كاملة من الآية المختارة
    playFullSurah(index);

    if (document.getElementById('tafsir-modal')?.classList.contains('active')) {
        loadTafsir(index);
    }
}

// ==================== Error Handling ====================

/**
 * معالج الأخطاء العام
 */
class ErrorHandler {
    static init() {
        window.onerror = (msg, url, line, col, error) => {
            console.error('Global Error:', { msg, url, line, col, error });
            ErrorHandler.report('JavaScript Error', { msg, url, line, error });
            return false;
        };

        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled Promise Rejection:', event.reason);
            ErrorHandler.report('Unhandled Promise Rejection', event.reason);
        });
    }

    static report(type, details) {
        // Log to console in development
        if (location.hostname === 'localhost') {
            console.table({ type, details, timestamp: new Date().toISOString() });
        }

        // Store last errors for debugging
        try {
            const errors = JSON.parse(localStorage.getItem('quranAppErrors') || '[]');
            errors.push({ type, details: String(details), timestamp: Date.now() });
            if (errors.length > 50) errors.shift(); // Keep last 50
            localStorage.setItem('quranAppErrors', JSON.stringify(errors));
        } catch (e) {
            // Ignore storage errors
        }
    }

    static getErrors() {
        try {
            return JSON.parse(localStorage.getItem('quranAppErrors') || '[]');
        } catch {
            return [];
        }
    }

    static clearErrors() {
        localStorage.removeItem('quranAppErrors');
    }
}

// Initialize error handler
ErrorHandler.init();

// ==================== Performance Optimization ====================

/**
 * تحميل كسول للآيات باستخدام Intersection Observer
 */
let verseObserver = null;

function setupVerseLazyLoading() {
    if (verseObserver) verseObserver.disconnect();
    
    verseObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const verse = entry.target;
                verse.classList.add('visible');
                verseObserver.unobserve(verse);
            }
        });
    }, {
        rootMargin: '100px',
        threshold: 0.1
    });
}

/**
 * تأخير تنفيذ الدالة
 * @param {Function} func - الدالة المراد تأخيرها
 * @param {number} wait - وقت الانتظار بالمللي ثانية
 * @returns {Function}
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * تقييد تنفيذ الدالة
 * @param {Function} func - الدالة المراد تقييدها
 * @param {number} limit - الحد الأدنى للوقت بين التنفيذات
 * @returns {Function}
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * تغليف الدالة باستخدام requestAnimationFrame
 * @param {Function} func - الدالة المراد تغليفها
 * @returns {Function}
 */
function rafThrottle(func) {
    let ticking = false;
    return function(...args) {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                func.apply(this, args);
                ticking = false;
            });
            ticking = true;
        }
    };
}

// ==================== Initialize App ====================
function initApp() {
    initializeElements();
    setupEventListeners();
    setupVerseLazyLoading();

    // Load saved settings
    if (state.settings.theme === 'light') {
        document.body.classList.remove('dark-mode');
        const icon = elements['theme-toggle']?.querySelector('i');
        if (icon) icon.className = 'fas fa-moon';
    }

    // Set initial reciter
    if (elements['reciter-select'] && state.settings.reciter) {
        elements['reciter-select'].value = state.settings.reciter;
        state.currentReciter = state.settings.reciter;
    }

    // Set auto-play button state
    if (elements['auto-play-btn'] && state.settings.autoPlay) {
        elements['auto-play-btn'].classList.add('active');
    }

    // Initialize audio element
    state.audioElement = elements['audio-element'];
    if (!state.audioElement) {
        state.audioElement = new Audio();
        state.audioElement.id = 'audio-element';
        document.body.appendChild(state.audioElement);
    }

    // Setup Media Session API
    setupMediaSession();

    // Setup PWA Install Prompt
    setupInstallPrompt();

    // Load surahs with lazy loading
    loadSurahs();

    // Add performance monitoring
    if ('performance' in window) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                if (perfData) {
                    console.log(`⚡ Page Load: ${Math.round(perfData.loadEventEnd - perfData.startTime)}ms`);
                    console.log(`⚡ DOM Ready: ${Math.round(perfData.domContentLoadedEventEnd - perfData.startTime)}ms`);
                }
            }, 0);
        });
    }

    console.log('🕌 Quran App v5.0 - Full Featured');
    console.log('📖 Features: 30 Juz, Media Session, Last Position, Lazy Loading');
}

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);

// Global functions for onclick handlers
window.loadSurah = loadSurah;
window.handleVerseClick = handleVerseClick;
window.toggleBookmark = toggleBookmark;
window.deleteBookmark = deleteBookmark;
window.loadSurahAndScroll = loadSurahAndScroll;
window.shareCurrentSurah = shareCurrentSurah;
window.downloadCurrentSurah = downloadCurrentSurah;
window.closeModal = closeModal;
window.playFullSurah = playFullSurah;
window.loadJuz = loadJuz;
window.toggleView = toggleView;
window.installApp = installApp;
window.dismissInstall = dismissInstall;
