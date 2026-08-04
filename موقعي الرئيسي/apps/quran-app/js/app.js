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

    // التوقيتات اختيارية: لا تُقبل إلا إذا ذكرت رابط ملف الصوت نفسه.
    // لا نستخدم تقديراً زمنياً، حتى لا نُظهر آية غير مطابقة للتلاوة.
    AUDIO_TIMINGS: {
        manifestBaseUrl: './audio-timestamps',
        requestTimeoutMs: 5000,
        audioTimeoutMs: 30000
    },

    VERSE_RECITER_BY_FULL: {
        alafasy: 'ar.alafasy',
        abdulbasit: 'ar.abdulbasitmurattal',
        minshawi: 'ar.minshawi',
        husary: 'ar.husary',
        sudais: 'ar.abdurrahmaansudais',
        maher: 'ar.mahermuaiqly',
        yasser: 'ar.yasseraldossari',
        shatri: 'ar.shaatree'
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
function safeParseLocalStorage(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
        console.warn(`Corrupted localStorage value for ${key}:`, e);
        return fallback;
    }
}

const state = {
    currentSurah: null,
    currentVerseIndex: 0,
    allSurahs: [],
    bookmarks: safeParseLocalStorage('quranBookmarks', []),
    readingProgress: safeParseLocalStorage('quranReadingProgress', {}),
    settings: safeParseLocalStorage('quranSettings', {
        fontSize: APP_CONFIG.DEFAULT_FONT_SIZE,
        theme: 'dark',
        autoPlay: false,
        autoNextSurah: true,
        reciter: 'alafasy',
        audioMode: 'full_surah', // 'full_surah' أو 'verse_by_verse'
        showTranslation: false
    }),
    isPlaying: false,
    isRepeatEnabled: false,
    audioElement: null,
    searchDebounceTimer: null,
    cache: new Map(),
    verseTimings: [], // لا تُملأ إلا ببيانات مرتبطة بنفس ملف الصوت
    verseTimingSource: 'none', // 'none' أو 'exact'
    audioPlaybackKind: 'full_surah', // 'full_surah' أو 'verse'
    audioRequestId: 0,
    surahRequestId: 0,
    audioSeekVersion: 0,
    searchRequestId: 0,
    currentReciter: 'alafasy'
};

// ==================== DOM Elements ====================
const elements = {};

function initializeElements() {
    const ids = [
        'surah-list', 'verses-container', 'surah-name', 'surah-details',
        'audio-player', 'audio-element', 'play-pause', 'prev-verse', 'next-verse',
        'expand-player', 'player-mini-bar', 'player-full-panel',
        'skip-forward', 'skip-back', 'repeat-verse', 'playback-speed', 'close-player',
        'player-surah', 'player-verse', 'progress-bar', 'current-time', 'duration',
        'theme-toggle', 'menu-toggle', 'sidebar', 'continue-reading-card', 'back-to-list-btn',
        'search-modal', 'bookmark-modal', 'tafsir-modal', 'search-input', 'search-results',
        'bookmarks-list', 'reciter-select', 'increase-font', 'decrease-font',
        'save-surah-main', 'tafsir-btn', 'tafsir-select', 'tafsir-content',
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

    list.textContent = '';

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
        viewBtn.textContent = '';
        const icon = document.createElement('i');
        icon.className = currentView === 'surahs' ? 'fas fa-list' : 'fas fa-layer-group';
        viewBtn.appendChild(icon);
        viewBtn.appendChild(document.createTextNode(' ' + (currentView === 'surahs' ? 'السور' : 'الأجزاء')));
    }

    if (currentView === 'juz') {
        displayJuzList();
    } else {
        displaySurahs(state.allSurahs);
    }
}

// ==================== Media Session API ====================
function setMediaSessionAction(action, handler) {
    if (!('mediaSession' in navigator) || typeof navigator.mediaSession.setActionHandler !== 'function') return;

    try {
        navigator.mediaSession.setActionHandler(action, handler);
    } catch (error) {
        // Chrome Android/WebView may expose Media Session but not every action.
        console.debug(`Media Session action not supported: ${action}`, error);
    }
}

async function resumeAudioFromMediaSession() {
    if (!state.audioElement) return;

    try {
        await state.audioElement.play();
    } catch (error) {
        state.isPlaying = false;
        updatePlayPauseButton();
        showToast('اضغط تشغيل من داخل التطبيق للسماح بالتلاوة', 'info');
    }
}

function setupMediaSession() {
    if (!('mediaSession' in navigator) || typeof MediaMetadata === 'undefined') return;

    try {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: 'القرآن الكريم',
            artist: 'تلاوة',
            album: 'Quran Pro',
            artwork: [
                { src: 'icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
                { src: 'icons/icon-512x512.png', sizes: '512x512', type: 'image/png' }
            ]
        });
    } catch (error) {
        console.debug('Media Session metadata is unavailable', error);
    }

    setMediaSessionAction('play', () => { void resumeAudioFromMediaSession(); });
    setMediaSessionAction('pause', () => state.audioElement?.pause());
    setMediaSessionAction('seekbackward', details => {
        if (state.audioElement) state.audioElement.currentTime = Math.max(0, state.audioElement.currentTime - (details.seekOffset || 10));
    });
    setMediaSessionAction('seekforward', details => {
        if (state.audioElement) state.audioElement.currentTime = Math.min(state.audioElement.duration || Infinity, state.audioElement.currentTime + (details.seekOffset || 10));
    });
    setMediaSessionAction('seekto', details => {
        if (!state.audioElement || !Number.isFinite(details.seekTime)) return;
        if (details.fastSeek && typeof state.audioElement.fastSeek === 'function') state.audioElement.fastSeek(details.seekTime);
        else state.audioElement.currentTime = details.seekTime;
    });
    setMediaSessionAction('previoustrack', () => playAdjacentVerse(-1));
    setMediaSessionAction('nexttrack', () => playAdjacentVerse(1));
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

    const installContent = document.createElement('div');
    installContent.className = 'install-content';
    const installIcon = document.createElement('i');
    installIcon.className = 'fas fa-mobile-alt';
    installContent.appendChild(installIcon);
    const installLabel = document.createElement('span');
    installLabel.textContent = 'تثبيت التطبيق';
    installContent.appendChild(installLabel);
    banner.appendChild(installContent);

    const installActions = document.createElement('div');
    installActions.className = 'install-actions';
    const installAcceptBtn = document.createElement('button');
    installAcceptBtn.className = 'install-btn';
    installAcceptBtn.textContent = 'تثبيت';
    installAcceptBtn.addEventListener('click', installApp);
    installActions.appendChild(installAcceptBtn);
    const dismissBtn = document.createElement('button');
    dismissBtn.className = 'dismiss-btn';
    dismissBtn.textContent = 'لاحقاً';
    dismissBtn.addEventListener('click', dismissInstall);
    installActions.appendChild(dismissBtn);
    banner.appendChild(installActions);

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
    if (!('mediaSession' in navigator) || !state.currentSurah || typeof MediaMetadata === 'undefined') return;

    const ayah = state.currentSurah.ayahs[state.currentVerseIndex];
    const reciter = APP_CONFIG.FULL_SURAH_AUDIO[state.currentReciter];
    const hasExactVerse = state.audioPlaybackKind === 'verse' || state.verseTimingSource === 'exact';
    const artist = hasExactVerse
        ? `${reciter?.name || 'تلاوة'} · الآية ${ayah?.numberInSurah || 1}`
        : (reciter?.name || 'تلاوة');

    try {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: `سورة ${state.currentSurah.name}`,
            artist,
            album: 'Quran Pro',
            artwork: [
                { src: 'icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
                { src: 'icons/icon-512x512.png', sizes: '512x512', type: 'image/png' }
            ]
        });
    } catch (error) {
        console.debug('Media Session metadata update failed', error);
    }
}

function updateMediaSessionPosition() {
    if (!('mediaSession' in navigator) || typeof navigator.mediaSession.setPositionState !== 'function' || !state.audioElement) return;

    const { duration, currentTime, playbackRate } = state.audioElement;
    if (!Number.isFinite(duration) || duration <= 0 || !Number.isFinite(currentTime)) return;

    try {
        navigator.mediaSession.setPositionState({
            duration,
            position: Math.min(Math.max(currentTime, 0), duration),
            playbackRate: Number.isFinite(playbackRate) && playbackRate > 0 ? playbackRate : 1
        });
    } catch (error) {
        console.debug('Media Session position update failed', error);
    }
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

        // Keep the full Quran edition in memory only; it is too large for
        // reliable persistence across browsers with small localStorage quotas.
        if (key === 'quran_uthmani') return;

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
        renderContinueReadingCard();
        showMobileHome();
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
        elements['surah-list'].textContent = '';
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
        list.textContent = '';
        list.appendChild(emptyDiv);
        return;
    }

    list.textContent = '';
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
    const requestId = ++state.surahRequestId;

    try {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading';
        const spinner = document.createElement('div');
        spinner.className = 'spinner';
        loadingDiv.appendChild(spinner);
        const loadingText = document.createElement('p');
        loadingText.textContent = 'جاري تحميل السورة...';
        loadingDiv.appendChild(loadingText);
        elements['verses-container'].textContent = '';
        elements['verses-container'].appendChild(loadingDiv);

        // إلغاء أي طلب صوت سابق حتى لا يبدأ بعد تغيير السورة.
        state.audioRequestId += 1;
        state.audioSeekVersion += 1;
        if (state.audioElement) {
            state.audioElement.pause();
            state.isPlaying = false;
        }

        const data = await fetchWithCache(
            `${APP_CONFIG.API_BASE}/surah/${surahNumber}`,
            `surah_${surahNumber}`
        );
        if (requestId !== state.surahRequestId) return;

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
                if (requestId === state.surahRequestId && state.currentSurah?.number === surahNumber) {
                    void playFullSurah();
                }
            }, 1000);
        }

        if (window.innerWidth <= 992) {
            elements['sidebar'].classList.remove('active');
        }
        if (window.innerWidth <= 768) {
            elements['sidebar'].classList.remove('mobile-full');
            document.querySelector('.content')?.classList.add('mobile-full');
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
        badge.textContent = '';
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
    btn.textContent = '';
    const icon = document.createElement('i');
    icon.className = isBookmarked ? 'fas fa-star' : 'far fa-star';
    btn.appendChild(icon);
    btn.appendChild(document.createTextNode(` ${isBookmarked ? 'تم الحفظ' : 'حفظ السورة'}`));
}

// ==================== Display Verses ====================
// نص المصحف القادم من الـ API يبدأ الآية الأولى بالبسملة في كل سورة عدا
// الفاتحة والتوبة، فلو عُرضت البسملة المستقلة فوقها لتكرّرت مرّتين.
const BASMALA_WORD_COUNT = 4;

function stripLeadingBasmala(text) {
    const expected = normalizeArabicSearchText('بسم الله الرحمن الرحيم').replace(/\s+/g, '');
    const tokens = text.split(/(\s+)/);

    const words = [];
    let consumed = 0;
    for (let i = 0; i < tokens.length && words.length < BASMALA_WORD_COUNT; i++) {
        consumed = i + 1;
        if (tokens[i].trim()) words.push(tokens[i]);
    }

    if (words.length < BASMALA_WORD_COUNT) return text;
    if (normalizeArabicSearchText(words.join('')).replace(/\s+/g, '') !== expected) return text;

    return tokens.slice(consumed).join('').trimStart();
}

function displayVerses() {
    if (!state.currentSurah) return;

    const fontSize = state.settings.fontSize;

    const wrapper = document.createElement('div');
    wrapper.className = 'verses-wrapper';
    wrapper.style.fontSize = `${fontSize}rem`;

    // Surah header — طُرّة المصحف: اسم السورة داخل إطار مزخرف، ورقم الجزء جانبه
    const header = document.createElement('div');
    header.className = 'surah-header-mushaf';

    const cartouche = document.createElement('div');
    cartouche.className = 'surah-cartouche';
    const cartoucheName = document.createElement('span');
    cartoucheName.className = 'surah-cartouche-name';
    // الاسم القادم من الـ API يتضمن كلمة «سُورَةُ» أصلاً، فلا تُضَف مرة ثانية.
    cartoucheName.textContent = state.currentSurah.name;
    cartouche.appendChild(cartoucheName);
    header.appendChild(cartouche);

    const juzBadge = document.createElement('span');
    juzBadge.className = 'side-text';
    juzBadge.textContent = `الجزء ${state.currentSurah.ayahs[0]?.juz || 1}`;
    header.appendChild(juzBadge);

    wrapper.appendChild(header);

    // Bismillah — الفاتحة تعدّها آية، والتوبة لا بسملة لها
    const hasStandaloneBasmala =
        state.currentSurah.number !== 1 && state.currentSurah.number !== 9;
    if (hasStandaloneBasmala) {
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
        const verseText = (index === 0 && hasStandaloneBasmala)
            ? stripLeadingBasmala(ayah.text)
            : ayah.text;
        verseSpan.appendChild(document.createTextNode(verseText));

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

    elements['verses-container'].textContent = '';
    elements['verses-container'].appendChild(wrapper);
}

// ==================== Safe DOM Helpers ====================
//
// SECURITY NOTE: All dynamic text MUST go through `textContent` or
// `createSafeElement({ textContent })`. Never use `.innerHTML` for
// untrusted data — it allows XSS. The legacy `escapeHtml` /
// `safeSetHTML` helpers have been removed because they encouraged the
// wrong pattern (round-tripping text through innerHTML).
//
function safeSetText(element, text) {
    if (element) element.textContent = text;
}

function createSafeElement(tag, attrs = {}, children = []) {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => {
        if (key === 'className') el.className = value;
        else if (key === 'textContent') el.textContent = value;
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
 * تحويل رقم السورة إلى تنسيق ثلاثي الأرقام.
 * @param {number} surahNumber - رقم السورة
 * @returns {string} رقم السورة بتنسيق 001، 002...
 */
function getSurahFileName(surahNumber) {
    return String(surahNumber).padStart(3, '0');
}

function getAudioElement() {
    if (state.audioElement) return state.audioElement;
    state.audioElement = elements['audio-element'] || new Audio();
    state.audioElement.id = 'audio-element';
    if (!state.audioElement.parentNode) document.body.appendChild(state.audioElement);
    return state.audioElement;
}

function getAudioErrorMessage(error) {
    const code = error?.code || state.audioElement?.error?.code;
    if (code === 1) return 'تم إلغاء تحميل الصوت';
    if (code === 2) return 'تعذر الاتصال بمصدر الصوت';
    if (code === 3) return 'ملف الصوت تالف أو غير مدعوم';
    if (code === 4) return 'صيغة ملف الصوت غير مدعومة على هذا الهاتف';
    if (error?.message === 'Audio timeout') return 'انتهت مهلة تحميل الصوت';
    if (error?.name === 'NotAllowedError') return 'اضغط تشغيل من داخل التطبيق للسماح بالتلاوة';
    return 'تعذر تشغيل ملف الصوت. تحقق من الاتصال وحاول مرة أخرى.';
}

function waitForAudioReady(audio, timeoutMs = APP_CONFIG.AUDIO_TIMINGS.audioTimeoutMs) {
    if (audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) return Promise.resolve();

    return new Promise((resolve, reject) => {
        let settled = false;
        const cleanup = () => {
            clearTimeout(timeoutId);
            audio.removeEventListener('canplay', onReady);
            audio.removeEventListener('loadedmetadata', onMetadata);
            audio.removeEventListener('error', onError);
        };
        const finish = (callback, value) => {
            if (settled) return;
            settled = true;
            cleanup();
            callback(value);
        };
        const onReady = () => finish(resolve);
        const onMetadata = () => {
            // Metadata is enough to reveal a valid source; canplay normally follows on mobile.
            if (audio.readyState >= HTMLMediaElement.HAVE_METADATA) updateMediaSessionPosition();
        };
        const onError = () => finish(reject, new Error('Audio source error'));
        const timeoutId = setTimeout(() => finish(reject, new Error('Audio timeout')), timeoutMs);

        audio.addEventListener('canplay', onReady, { once: true });
        audio.addEventListener('loadedmetadata', onMetadata);
        audio.addEventListener('error', onError, { once: true });
        audio.load();
    });
}

function normalizeAudioUrl(url) {
    try {
        return new URL(url, window.location.href).href;
    } catch {
        return String(url || '');
    }
}

function isValidExactTimings(payload, audioUrl, verseCount) {
    if (!payload || !Array.isArray(payload.timings) || payload.timings.length !== verseCount) return false;
    if (normalizeAudioUrl(payload.audioUrl) !== normalizeAudioUrl(audioUrl)) return false;

    return payload.timings.every((timing, index, timings) => {
        const start = Number(timing.start);
        const end = Number(timing.end);
        const previousEnd = index > 0 ? Number(timings[index - 1].end) : 0;
        const verseIndex = Number.isInteger(timing.verseIndex) ? timing.verseIndex : index;
        return verseIndex === index && Number.isFinite(start) && Number.isFinite(end)
            && start >= 0 && end > start && start >= previousEnd;
    });
}

async function loadExactVerseTimings(reciterKey, surahNumber, audioUrl, requestId) {
    // Optional local manifest format:
    // { audioUrl: "exact MP3 URL", timings: [{ start, end, verseIndex }] }
    // A manifest is ignored unless it matches the selected MP3 exactly.
    const manifestUrl = `${APP_CONFIG.AUDIO_TIMINGS.manifestBaseUrl}/${encodeURIComponent(reciterKey)}/${getSurahFileName(surahNumber)}.json`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), APP_CONFIG.AUDIO_TIMINGS.requestTimeoutMs);

    try {
        const response = await fetch(manifestUrl, { signal: controller.signal, cache: 'force-cache' });
        if (!response.ok) return false;
        const payload = await response.json();
        if (requestId !== state.audioRequestId) return false;
        if (!isValidExactTimings(payload, audioUrl, state.currentSurah?.ayahs.length || 0)) return false;
        if (requestId !== state.audioRequestId) return false;
        state.verseTimings = payload.timings.map(timing => ({ start: Number(timing.start), end: Number(timing.end) }));
        state.verseTimingSource = 'exact';
        return true;
    } catch {
        // Missing optional manifests must never block playback.
        return false;
    } finally {
        clearTimeout(timeoutId);
    }
}

function setPlayerStatus(text) {
    if (elements['player-verse']) elements['player-verse'].textContent = text;
}

function resetAudioProgress() {
    if (elements['progress-bar']) elements['progress-bar'].value = 0;
    if (elements['current-time']) elements['current-time'].textContent = '0:00';
    if (elements['duration']) elements['duration'].textContent = '0:00';
}

/**
 * تشغيل السورة كاملة مع MP3.
 * لا يتم تخمين الآية الحالية؛ التظليل يكون فقط عند توفر manifest مطابق للصوت.
 */
async function playFullSurah(startVerseIndex = 0, resumeTimeSeconds = null) {
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

    const audio = getAudioElement();
    const requestId = ++state.audioRequestId;
    state.audioSeekVersion += 1;
    const audioUrl = `${reciter.baseUrl}/${getSurahFileName(state.currentSurah.number)}.mp3`;
    state.audioPlaybackKind = 'full_surah';
    state.currentVerseIndex = Math.max(0, Math.min(startVerseIndex, state.currentSurah.ayahs.length - 1));
    state.isPlaying = false;
    state.verseTimings = [];
    state.verseTimingSource = 'none';
    setPlayerStatus('جاري تحميل السورة...');
    resetAudioProgress();

    try {
        audio.pause();
        audio.removeAttribute('src');
        audio.load();
        audio.src = audioUrl;
        audio.preload = 'auto';
        audio.playbackRate = parseFloat(elements['playback-speed']?.value || 1);
        setupFullSurahAudioListeners();

        // التوقيت الاختياري لا يحجب بدء الصوت؛ ملف MP3 يبدأ فور جاهزيته.
        const timingsPromise = loadExactVerseTimings(reciterKey, state.currentSurah.number, audioUrl, requestId);
        await waitForAudioReady(audio);
        if (requestId !== state.audioRequestId) return;

        await audio.play();
        const seekVersionAtPlaybackStart = state.audioSeekVersion;
        state.isPlaying = true;
        updatePlayerUI();
        elements['audio-player']?.classList.add('active');
        updatePlayPauseButton();
        updateMediaSession();
        updateMediaSessionPosition();
        highlightCurrentVerse(-1);
        setPlayerStatus('تلاوة السورة · جارٍ التحقق من مزامنة الآيات');
        showToast(`جاري تشغيل سورة ${state.currentSurah.name} - ${reciter.name}`, 'success');

        const hasExactTimings = await timingsPromise;
        if (requestId !== state.audioRequestId) return;
        if (hasExactTimings && Number.isFinite(audio.duration)) {
            const finalTiming = state.verseTimings[state.verseTimings.length - 1];
            if (!finalTiming || finalTiming.end > audio.duration + 0.25) {
                state.verseTimings = [];
                state.verseTimingSource = 'none';
            }
        }
        if (state.verseTimingSource === 'exact') {
            const startTiming = state.verseTimings[state.currentVerseIndex];
            if (startTiming && state.audioSeekVersion === seekVersionAtPlaybackStart) audio.currentTime = startTiming.start;
            highlightCurrentVerse(state.currentVerseIndex);
            updatePlayerUI();
            setPlayerStatus(`الآية ${state.currentSurah.ayahs[state.currentVerseIndex]?.numberInSurah || 1}`);
            updateMediaSession();
            updateMediaSessionPosition();
        } else {
            state.currentVerseIndex = 0;
            if (resumeTimeSeconds && Number.isFinite(audio.duration) && state.audioSeekVersion === seekVersionAtPlaybackStart) {
                audio.currentTime = Math.min(resumeTimeSeconds, Math.max(0, audio.duration - 0.25));
            }
            setPlayerStatus('تلاوة السورة · بدون مزامنة آيات');
        }
    } catch (error) {
        if (requestId !== state.audioRequestId) return;
        state.isPlaying = false;
        updatePlayPauseButton();
        console.error('Error playing full surah:', error);

        // If the selected reciter also has ayah files, use the exact single-ayah
        // endpoint as a safe fallback instead of mixing another full-surah recording.
        if (APP_CONFIG.VERSE_RECITER_BY_FULL[reciterKey]) {
            showToast('تعذر ملف السورة الكاملة؛ سيتم تشغيل الآية الحالية بدقة', 'warning');
            await playVerseOld(state.currentVerseIndex);
            return;
        }

        showToast(getAudioErrorMessage(error), 'error');
    }
}

function setupFullSurahAudioListeners() {
    const audio = getAudioElement();
    const events = ['timeupdate', 'loadedmetadata', 'durationchange', 'seeking', 'ended', 'error', 'stalled', 'waiting', 'canplay', 'playing', 'pause'];
    events.forEach(event => audio.removeEventListener(event, handleAudioEvent));
    events.forEach(event => audio.addEventListener(event, handleAudioEvent));
}

function handleAudioEvent(event) {
    if (!state.audioElement || !state.currentSurah) return;

    switch (event.type) {
        case 'timeupdate':
        case 'loadedmetadata':
        case 'durationchange':
            updateProgressFromTime();
            updateMediaSessionPosition();
            break;
        case 'seeking':
            state.audioSeekVersion += 1;
            break;
        case 'ended':
            handleAudioEnded();
            break;
        case 'error':
            state.isPlaying = false;
            updatePlayPauseButton();
            setPlayerStatus(getAudioErrorMessage());
            break;
        case 'stalled':
        case 'waiting':
            setPlayerStatus('جاري تحميل الصوت...');
            break;
        case 'canplay':
            if (!state.isPlaying) {
                const hasExactVerse = state.audioPlaybackKind === 'verse' || state.verseTimingSource === 'exact';
                setPlayerStatus(hasExactVerse
                    ? `الآية ${state.currentSurah.ayahs[state.currentVerseIndex]?.numberInSurah || 1}`
                    : 'تلاوة السورة');
            }
            break;
        case 'playing':
            state.isPlaying = true;
            updatePlayPauseButton();
            updateMediaSession();
            break;
        case 'pause':
            state.isPlaying = false;
            updatePlayPauseButton();
            break;
    }
}

function updateProgressFromTime() {
    const audio = state.audioElement;
    if (!audio || !Number.isFinite(audio.duration) || audio.duration <= 0) return;

    const currentTime = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
    const progress = (currentTime / audio.duration) * 100;
    if (elements['progress-bar']) elements['progress-bar'].value = Math.min(100, Math.max(0, progress));
    if (elements['current-time']) elements['current-time'].textContent = formatTime(currentTime);
    if (elements['duration']) elements['duration'].textContent = formatTime(audio.duration);
    updateCurrentVerseFromTime(currentTime, audio.duration);
}

function updateCurrentVerseFromTime(currentTime, duration) {
    if (!state.currentSurah) return;

    let newIndex = state.currentVerseIndex;
    if (state.verseTimingSource === 'exact' && state.verseTimings.length === state.currentSurah.ayahs.length) {
        const foundIndex = state.verseTimings.findIndex(timing => currentTime >= timing.start && currentTime < timing.end);
        if (foundIndex === -1) return;
        newIndex = foundIndex;
    } else if (state.audioPlaybackKind === 'verse') {
        // A single-ayah file is exact by construction; never infer from full-surah duration.
        newIndex = state.currentVerseIndex;
    } else {
        // No matching timestamps: keep the UI honest and do not guess the ayah.
        return;
    }

    if (newIndex !== state.currentVerseIndex) {
        state.currentVerseIndex = newIndex;
        highlightCurrentVerse(newIndex);
        const verseElement = document.getElementById(`verse-${newIndex}`);
        verseElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        updatePlayerUI();
        updateMediaSession();
        saveLastPosition();
    }
}

function handleAudioEnded() {
    state.isPlaying = false;
    updatePlayPauseButton();

    if (state.audioPlaybackKind === 'verse' && state.isRepeatEnabled) {
        const audio = state.audioElement;
        audio.currentTime = 0;
        void audio.play().catch(error => showToast(getAudioErrorMessage(error), 'error'));
        return;
    }

    if (state.audioPlaybackKind === 'full_surah' && state.isRepeatEnabled) {
        const audio = state.audioElement;
        audio.currentTime = 0;
        state.isPlaying = true;
        updatePlayPauseButton();
        void audio.play().catch(error => showToast(getAudioErrorMessage(error), 'error'));
        return;
    }

    if (state.settings.autoNextSurah && state.currentSurah.number < 114 && state.audioPlaybackKind === 'full_surah') {
        showToast('جاري الانتقال للسورة التالية...', 'info');
        setTimeout(() => loadSurah(state.currentSurah.number + 1), 1200);
    } else {
        showToast('انتهت التلاوة', 'success');
    }
}

function playAdjacentVerse(delta) {
    if (!state.currentSurah || !state.audioElement) return;

    if (state.audioPlaybackKind === 'full_surah' && state.verseTimingSource !== 'exact') {
        const offset = delta * 10;
        state.audioElement.currentTime = Math.max(0, Math.min(state.audioElement.duration || Infinity, state.audioElement.currentTime + offset));
        return;
    }

    const nextIndex = state.currentVerseIndex + delta;
    if (nextIndex < 0 || nextIndex >= state.currentSurah.ayahs.length) return;

    if (state.audioPlaybackKind === 'full_surah' && state.verseTimingSource === 'exact') {
        const timing = state.verseTimings[nextIndex];
        if (timing) {
            state.currentVerseIndex = nextIndex;
            state.audioElement.currentTime = timing.start;
            highlightCurrentVerse(nextIndex);
            updatePlayerUI();
            updateMediaSession();
            saveLastPosition();
            return;
        }
    }

    // Separate ayah files are exact by construction and are the safe fallback.
    void playVerseOld(nextIndex);
}

// تشغيل آية منفردة: التزامن هنا دقيق لأن الملف الصوتي يحتوي آية واحدة فقط.
async function playVerseOld(verseIndex) {
    if (!state.currentSurah?.ayahs[verseIndex]) return;

    const ayah = state.currentSurah.ayahs[verseIndex];
    const reciter = APP_CONFIG.VERSE_RECITER_BY_FULL[state.currentReciter];
    if (!reciter) {
        showToast('هذا القارئ متوفر للسورة الكاملة فقط؛ اختر قارئاً يدعم الآيات', 'info');
        return;
    }
    const audio = getAudioElement();
    const requestId = ++state.audioRequestId;
    state.audioSeekVersion += 1;
    state.currentVerseIndex = verseIndex;
    state.audioPlaybackKind = 'verse';
    state.verseTimings = [];
    state.verseTimingSource = 'exact';
    setPlayerStatus(`جاري تحميل الآية ${ayah.numberInSurah}...`);
    resetAudioProgress();

    try {
        const data = await fetchWithCache(
            `${APP_CONFIG.API_BASE}/ayah/${ayah.number}/${reciter}`,
            `audio_${ayah.number}_${reciter}`
        );
        if (requestId !== state.audioRequestId || !data?.data?.audio) throw new Error('Audio source error');

        audio.pause();
        audio.src = data.data.audio;
        audio.preload = 'auto';
        audio.playbackRate = parseFloat(elements['playback-speed']?.value || 1);
        setupFullSurahAudioListeners();
        await waitForAudioReady(audio);
        if (requestId !== state.audioRequestId) return;
        await audio.play();

        state.isPlaying = true;
        updatePlayerUI();
        elements['audio-player']?.classList.add('active');
        updatePlayPauseButton();
        highlightCurrentVerse(verseIndex);
        updateMediaSession();
        showToast(`جاري تشغيل الآية ${ayah.numberInSurah}`, 'success');
    } catch (error) {
        if (requestId !== state.audioRequestId) return;
        state.isPlaying = false;
        updatePlayPauseButton();
        setPlayerStatus(getAudioErrorMessage(error));
        console.error('Error playing verse:', error);
        showToast(getAudioErrorMessage(error), 'error');
    }
}

// ==================== Player Controls ====================
function updatePlayerUI() {
    if (!state.currentSurah) return;

    elements['player-surah'].textContent = state.currentSurah.name;
    const ayah = state.currentSurah.ayahs[state.currentVerseIndex];
    const hasExactVerse = state.audioPlaybackKind === 'verse' || state.verseTimingSource === 'exact';
    elements['player-verse'].textContent = hasExactVerse
        ? `الآية ${ayah?.numberInSurah || 1}`
        : 'تلاوة السورة';
}

function updatePlayPauseButton() {
    const btn = elements['play-pause'];
    if (!btn) return;

    btn.textContent = '';
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
    try {
        localStorage.setItem('quranBookmarks', JSON.stringify(state.bookmarks));
    } catch (e) {
        console.warn('Bookmark save failed:', e);
    }
    if (typeof SupabaseSync !== 'undefined') SupabaseSync.syncToCloud();
}

function saveReadingProgress() {
    try {
        localStorage.setItem('quranReadingProgress', JSON.stringify(state.readingProgress));
    } catch (e) {
        console.warn('Reading progress save failed:', e);
    }
    if (typeof SupabaseSync !== 'undefined') SupabaseSync.syncToCloud();
    renderContinueReadingCard();
}

function renderContinueReadingCard() {
    const card = elements['continue-reading-card'];
    if (!card) return;

    const lastRead = Object.entries(state.readingProgress)
        .sort((a, b) => b[1].lastRead - a[1].lastRead)[0];

    card.textContent = '';
    if (!lastRead) {
        card.style.display = 'none';
        card.onclick = null;
        return;
    }

    const surahNumber = parseInt(lastRead[0]);
    const surah = state.allSurahs.find(s => s.number === surahNumber);

    const icon = document.createElement('i');
    icon.className = 'fas fa-history';
    const text = document.createElement('div');
    text.className = 'continue-reading-text';
    const label = document.createElement('span');
    label.className = 'continue-reading-label';
    label.textContent = 'متابعة القراءة';
    const name = document.createElement('span');
    name.className = 'continue-reading-name';
    name.textContent = surah ? surah.name : `سورة ${surahNumber}`;
    text.appendChild(label);
    text.appendChild(name);
    card.appendChild(icon);
    card.appendChild(text);

    card.style.display = 'flex';
    card.onclick = () => loadSurah(surahNumber);
}

function saveSettings() {
    try {
        localStorage.setItem('quranSettings', JSON.stringify(state.settings));
    } catch (e) {
        console.warn('Settings save failed:', e);
    }
    if (typeof SupabaseSync !== 'undefined') SupabaseSync.syncToCloud();
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
        list.textContent = '';
        list.appendChild(emptyDiv);
        return;
    }

    filtered.sort((a, b) => b.date - a.date);
    list.textContent = '';

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
            elements['search-results'].textContent = '';
            elements['search-results'].appendChild(hintDiv);
            return;
        }

        state.searchDebounceTimer = setTimeout(() => searchQuran(query), 500);
    });
}

function normalizeArabicSearchText(text) {
    return text
        .normalize('NFKD')
        .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
        // \u0627\u0644\u0645\u0635\u062D\u0641 \u064A\u0631\u0633\u0645 \u0623\u0644\u0641 \u0627\u0644\u0648\u0635\u0644 \u0648\u0627\u0644\u0647\u0645\u0632\u0627\u062A \u0628\u0623\u0634\u0643\u0627\u0644 \u0644\u0627 \u064A\u0643\u062A\u0628\u0647\u0627 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0639\u0627\u062F\u0629\u064B\u060C
        // \u0641\u0646\u0648\u062D\u0651\u062F\u0647\u0627 \u0645\u0639 \u0627\u0644\u062A\u0627\u0621 \u0627\u0644\u0645\u0631\u0628\u0648\u0637\u0629 \u0648\u0627\u0644\u0623\u0644\u0641 \u0627\u0644\u0645\u0642\u0635\u0648\u0631\u0629 \u0642\u0628\u0644 \u0627\u0644\u0645\u0642\u0627\u0631\u0646\u0629.
        .replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627')
        .replace(/\u0629/g, '\u0647')
        // \u0646\u0635 \u0627\u0644\u0645\u0635\u062D\u0641 \u064A\u062E\u0644\u0637 \u0627\u0644\u064A\u0627\u0621 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0628\u0627\u0644\u0641\u0627\u0631\u0633\u064A\u0629 (U+06CC) \u0648\u0627\u0644\u0643\u0627\u0641 \u0643\u0630\u0644\u0643\u060C
        // \u0641\u0646\u0648\u062D\u0651\u062F\u0647\u0627 \u0645\u0639 \u0627\u0644\u0623\u0644\u0641 \u0627\u0644\u0645\u0642\u0635\u0648\u0631\u0629 \u062D\u062A\u0649 \u062A\u062A\u0637\u0627\u0628\u0642 \u0627\u0644\u0645\u0642\u0627\u0631\u0646\u0629.
        .replace(/[\u0649\u06CC\u064A]/g, '\u064A')
        .replace(/[\u06A9\u0643]/g, '\u0643')
        .replace(/ـ/g, '')
        .trim();
}

async function searchQuran(query) {
    const requestId = ++state.searchRequestId;
    const resultsContainer = elements['search-results'];
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading';
    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    loadingDiv.appendChild(spinner);
    resultsContainer.textContent = '';
    resultsContainer.appendChild(loadingDiv);

    try {
        // The API's `search/{keyword}/all/ar` route currently returns HTTP 500.
        // Fetch the canonical Arabic edition once and filter it locally instead.
        const data = await fetchWithCache(
            `${APP_CONFIG.API_BASE}/quran/quran-uthmani`,
            'quran_uthmani'
        );
        if (requestId !== state.searchRequestId) return;

        const normalizedQuery = normalizeArabicSearchText(query);
        const matches = data.data.surahs.flatMap(surah =>
            surah.ayahs
                .filter(ayah => normalizeArabicSearchText(ayah.text).includes(normalizedQuery))
                .map(ayah => ({
                    surah: { number: surah.number, name: surah.name },
                    numberInSurah: ayah.numberInSurah,
                    text: ayah.text
                }))
        );

        if (matches.length === 0) {
            const noResultsDiv = document.createElement('div');
            noResultsDiv.className = 'search-hint';
            const searchIcon = document.createElement('i');
            searchIcon.className = 'fas fa-search';
            noResultsDiv.appendChild(searchIcon);
            const noResultsText = document.createElement('p');
            noResultsText.textContent = 'لم يتم العثور على نتائج';
            noResultsDiv.appendChild(noResultsText);
            resultsContainer.textContent = '';
            resultsContainer.appendChild(noResultsDiv);
            return;
        }

        const results = matches.slice(0, 20);
        resultsContainer.textContent = '';

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
        if (requestId !== state.searchRequestId) return;
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
        resultsContainer.textContent = '';
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
    elements['tafsir-content'].textContent = '';
    elements['tafsir-content'].appendChild(loadingDiv);

    try {
        const data = await fetchWithCache(
            `${APP_CONFIG.API_BASE}/ayah/${ayah.number}/${edition}`,
            `tafsir_${ayah.number}_${edition}`
        );

        elements['tafsir-content'].textContent = '';

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
        elements['tafsir-content'].textContent = '';
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

// ==================== Mobile Mini-Player ====================
function toggleMiniPlayer() {
    const expanded = elements['audio-player'].classList.toggle('expanded');
    elements['expand-player']?.setAttribute('aria-expanded', String(expanded));
}

// ==================== Mobile Bottom Navigation ====================
function showMobileHome() {
    const sidebar = elements['sidebar'];
    const content = document.querySelector('.content');
    if (state.currentSurah) {
        sidebar.classList.remove('mobile-full');
        content?.classList.add('mobile-full');
    } else {
        content?.classList.remove('mobile-full');
        sidebar.classList.add('mobile-full');
    }
}

function switchTab(tabName, event) {
    document.querySelectorAll('.mobile-nav-item').forEach(item => item.classList.remove('active'));
    event?.currentTarget?.classList.add('active');

    closeModal('search-modal');
    closeModal('bookmark-modal');
    closeModal('settings-modal');

    switch (tabName) {
        case 'search':
            openModal('search-modal');
            break;
        case 'bookmarks':
            displayBookmarks();
            openModal('bookmark-modal');
            break;
        case 'settings':
            openModal('settings-modal');
            break;
        case 'home':
        default:
            showMobileHome();
            break;
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

    // Back to surah list (mobile)
    elements['back-to-list-btn']?.addEventListener('click', () => {
        document.querySelector('.content')?.classList.remove('mobile-full');
        elements['sidebar'].classList.add('mobile-full');
    });

    setupSearch();

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

    // Auto play
    elements['auto-play-btn']?.addEventListener('click', toggleAutoPlay);

    // Audio controls - NEW
    elements['play-pause']?.addEventListener('click', async () => {
        if (!state.audioElement?.src) {
            if (state.currentSurah) await playFullSurah(state.currentVerseIndex);
            return;
        }

        if (state.isPlaying) {
            state.audioElement.pause();
            state.isPlaying = false;
        } else {
            try {
                await state.audioElement.play();
                state.isPlaying = true;
            } catch (error) {
                state.isPlaying = false;
                showToast(getAudioErrorMessage(error), 'error');
            }
        }
        updatePlayPauseButton();
        updateMediaSessionPosition();
    });

    // Reciter select - NEW
    elements['reciter-select']?.addEventListener('change', (e) => {
        state.currentReciter = e.target.value;
        state.settings.reciter = e.target.value;
        saveSettings();

        // إعادة تشغيل إذا كان يعمل
        if (state.isPlaying && state.currentSurah) {
            const currentTime = state.audioElement?.currentTime || 0;
            playFullSurah(state.currentVerseIndex, currentTime);
        }
    });

    // Verse navigation: exact timing when available, otherwise exact single-ayah audio.
    elements['prev-verse']?.addEventListener('click', () => playAdjacentVerse(-1));
    elements['next-verse']?.addEventListener('click', () => playAdjacentVerse(1));

    // Skip buttons
    elements['skip-forward']?.addEventListener('click', () => {
        if (state.audioElement) state.audioElement.currentTime = Math.min(state.audioElement.duration || Infinity, state.audioElement.currentTime + 10);
    });

    elements['skip-back']?.addEventListener('click', () => {
        if (state.audioElement) state.audioElement.currentTime = Math.max(0, state.audioElement.currentTime - 10);
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
        state.audioRequestId += 1;
        state.audioSeekVersion += 1;
        if (state.audioElement) {
            state.audioElement.pause();
            state.audioElement.removeAttribute('src');
            state.audioElement.load();
            state.isPlaying = false;
        }
        state.verseTimings = [];
        state.verseTimingSource = 'none';
        elements['close-player'].blur();
        elements['audio-player'].classList.remove('active');
        elements['audio-player'].classList.remove('expanded');
        document.querySelectorAll('.verse-item').forEach(item => {
            item.classList.remove('playing');
        });
    });

    // Mini-player expand/collapse (mobile)
    elements['expand-player']?.addEventListener('click', toggleMiniPlayer);
    elements['player-mini-bar']?.addEventListener('click', (e) => {
        if (e.target.closest('#play-pause') || e.target.closest('#close-player') || e.target.closest('#expand-player')) return;
        toggleMiniPlayer();
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

            // "الأجزاء" is handled exclusively by toggleView() (its own listener below),
            // which owns currentView and the list render — skip the surah-filter logic here.
            if (e.target.id === 'view-toggle') return;

            currentView = 'surahs';
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
        const rawQuery = e.target.value.trim();

        if (!rawQuery) {
            displaySurahs(state.allSurahs);
            return;
        }

        const arabicQuery = normalizeArabicSearchText(rawQuery);
        const englishQuery = rawQuery.toLowerCase();
        const filtered = state.allSurahs.filter(s =>
            normalizeArabicSearchText(s.name).includes(arabicQuery) ||
            s.englishName.toLowerCase().includes(englishQuery) ||
            s.number.toString() === rawQuery
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
    // ملف الآية المنفردة يضمن تطابقاً دقيقاً؛ لا نستخدم تقديراً من مدة السورة.
    void playVerseOld(index);

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

                }
            }, 0);
        });
    }


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
window.switchTab = switchTab;
window.playFullSurah = playFullSurah;
window.loadJuz = loadJuz;
window.toggleView = toggleView;
window.installApp = installApp;
window.dismissInstall = dismissInstall;

// Mushaf Reader engine moved to js/mushaf.js (step 2).
