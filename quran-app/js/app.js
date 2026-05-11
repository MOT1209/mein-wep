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
    }
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
        'audio-mode-toggle'
    ];

    ids.forEach(id => {
        elements[id] = document.getElementById(id);
    });
}

// ==================== Enhanced Toast Notification ====================
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

    toast.innerHTML = `
        <i class="fas ${icons[type] || icons.success}"></i>
        <span>${message}</span>
    `;

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
        elements['surah-list'].innerHTML = `
            <div class="loading">
                <i class="fas fa-exclamation-circle" style="color: var(--error);"></i>
                <p>حدث خطأ في التحميل. تحقق من اتصالك بالإنترنت.</p>
            </div>
        `;
    }
}

// ==================== Display Surahs ====================
function displaySurahs(surahs) {
    const list = elements['surah-list'];
    if (!list) return;

    if (surahs.length === 0) {
        list.innerHTML = '<div class="empty-state"><i class="fas fa-search"></i><p>لا توجد نتائج</p></div>';
        return;
    }

    list.innerHTML = surahs.map(surah => {
        const isBookmarked = state.bookmarks.some(b => b.type === 'surah' && b.surah === surah.number);
        const isRead = state.readingProgress[surah.number];

        return `
            <div class="surah-item ${isRead ? 'read' : ''}" data-number="${surah.number}" onclick="loadSurah(${surah.number})">
                <div class="surah-number">${surah.number}</div>
                <div class="surah-info-card">
                    <div class="surah-name-ar">${surah.name}</div>
                    <div class="surah-meta">
                        <span class="meta-item"><i class="fas fa-globe"></i> ${surah.englishName}</span>
                        <span class="meta-item"><i class="fas fa-list-ol"></i> ${surah.numberOfAyahs} آية</span>
                        <span class="meta-item"><i class="fas ${surah.revelationType === 'Meccan' ? 'fa-kaaba' : 'fa-mosque'}"></i> ${surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}</span>
                        ${isBookmarked ? '<span class="meta-item"><i class="fas fa-star" style="color: var(--accent-gold);"></i></span>' : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ==================== Load Surah ====================
async function loadSurah(surahNumber) {
    try {
        elements['verses-container'].innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>جاري تحميل السورة...</p>
            </div>
        `;

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
        badge.innerHTML = `<span class="surah-number-badge">${surah.number}</span>`;
    }

    const isBookmarked = state.bookmarks.some(b => b.type === 'surah' && b.surah === surah.number);
    updateSaveButton(isBookmarked);
}

function updateSaveButton(isBookmarked) {
    const btn = elements['save-surah-main'];
    if (!btn) return;

    btn.classList.toggle('saved', isBookmarked);
    btn.innerHTML = isBookmarked
        ? '<i class="fas fa-star"></i> تم الحفظ'
        : '<i class="far fa-star"></i> حفظ السورة';
}

// ==================== Display Verses ====================
function displayVerses() {
    if (!state.currentSurah) return;

    const fontSize = state.settings.fontSize;
    const verses = state.currentSurah.ayahs.map((ayah, index) => {
        const isBookmarked = state.bookmarks.some(b =>
            b.type === 'verse' && b.surah === state.currentSurah.number && b.verse === ayah.numberInSurah
        );
        const isPlaying = state.currentVerseIndex === index && state.isPlaying;

        return `
            <span class="verse-item ${isBookmarked ? 'bookmarked' : ''} ${isPlaying ? 'playing' : ''}" 
                  id="verse-${index}" 
                  data-verse-index="${index}" 
                  data-verse-number="${ayah.numberInSurah}"
                  onclick="handleVerseClick(${index})">
                ${ayah.text}
                <span class="verse-number" 
                      onclick="event.stopPropagation(); toggleBookmark(${state.currentSurah.number}, ${ayah.numberInSurah}, '${escapeHtml(ayah.text)}', '${state.currentSurah.name}')"
                      title="${isBookmarked ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}">
                    ${ayah.numberInSurah}
                </span>
            </span>
        `;
    }).join('');

    const bismillah = state.currentSurah.number !== 1 && state.currentSurah.number !== 9
        ? '<p class="bismillah">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>'
        : '';

    elements['verses-container'].innerHTML = `
        <div class="verses-wrapper" style="font-size: ${fontSize}rem;">
            <div class="surah-header-mushaf">
                <span class="side-text">سُورَةُ ${state.currentSurah.name}</span>
                <span class="side-text">الجزء ${state.currentSurah.ayahs[0]?.juz || 1}</span>
            </div>
            ${bismillah}
            <div class="verses-text">
                ${verses}
            </div>
        </div>
    `;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==================== NEW: Full Surah Audio System ====================

// تحويل رقم السورة إلى تنسق ثلاثي الأرقام (001, 002, ...)
function getSurahFileName(surahNumber) {
    return surahNumber.toString().padStart(3, '0');
}

// تشغيل السورة كاملة مع MP3
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

    btn.innerHTML = state.isPlaying
        ? '<i class="fas fa-pause"></i>'
        : '<i class="fas fa-play"></i>';
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
        list.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-bookmark"></i>
                <p>لا توجد ${filter === 'all' ? 'عناصر' : filter === 'surah' ? 'سور' : 'آيات'} محفوظة بعد</p>
            </div>
        `;
        return;
    }

    filtered.sort((a, b) => b.date - a.date);

    list.innerHTML = filtered.map((item, index) => {
        if (item.type === 'surah') {
            return `
                <div class="bookmark-item" onclick="loadSurah(${item.surah})">
                    <div class="bookmark-info">
                        <div class="bookmark-title">
                            <i class="fas fa-star" style="color: var(--accent-gold);"></i>
                            سورة ${item.surahName}
                        </div>
                    </div>
                    <button class="delete-bookmark" onclick="event.stopPropagation(); deleteBookmark(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        } else {
            return `
                <div class="bookmark-item" onclick="loadSurahAndScroll(${item.surah}, ${item.verse})">
                    <div class="bookmark-info">
                        <div class="bookmark-title">
                            <i class="fas fa-book-open" style="color: var(--primary);"></i>
                            سورة ${item.surahName} - الآية ${item.verse}
                        </div>
                        <div class="bookmark-text">${item.text.substring(0, 100)}...</div>
                    </div>
                    <button class="delete-bookmark" onclick="event.stopPropagation(); deleteBookmark(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        }
    }).join('');
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
            elements['search-results'].innerHTML = `
                <div class="search-hint">
                    <i class="fas fa-keyboard"></i>
                    <p>اكتب كلمة للبحث عنها في القرآن الكريم</p>
                </div>
            `;
            return;
        }

        state.searchDebounceTimer = setTimeout(() => searchQuran(query), 500);
    });
}

async function searchQuran(query) {
    const resultsContainer = elements['search-results'];
    resultsContainer.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

    try {
        const data = await fetchWithCache(
            `${APP_CONFIG.API_BASE}/search/${encodeURIComponent(query)}/all/ar`,
            `search_${query}`
        );

        if (data.data.matches.length === 0) {
            resultsContainer.innerHTML = `
                <div class="search-hint">
                    <i class="fas fa-search"></i>
                    <p>لم يتم العثور على نتائج</p>
                </div>
            `;
            return;
        }

        const results = data.data.matches.slice(0, 20);
        resultsContainer.innerHTML = results.map(match => `
            <div class="search-result-item" onclick="loadSurah(${match.surah.number}); closeModal('search-modal')">
                <div class="result-surah">
                    <i class="fas fa-book"></i>
                    ${match.surah.name} - الآية ${match.numberInSurah}
                </div>
                <div class="result-text">${match.text}</div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Search error:', error);
        resultsContainer.innerHTML = `
            <div class="search-hint">
                <i class="fas fa-exclamation-circle" style="color: var(--error);"></i>
                <p>حدث خطأ في البحث</p>
            </div>
        `;
    }
}

// ==================== Tafsir Function ====================
async function loadTafsir(verseIndex) {
    if (!state.currentSurah) return;

    const ayah = state.currentSurah.ayahs[verseIndex];
    const edition = elements['tafsir-select']?.value || 'ar.jalalayn';

    elements['tafsir-content'].innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>جاري تحميل التفسير...</p>
        </div>
    `;

    try {
        const data = await fetchWithCache(
            `${APP_CONFIG.API_BASE}/ayah/${ayah.number}/${edition}`,
            `tafsir_${ayah.number}_${edition}`
        );

        elements['tafsir-content'].innerHTML = `
            <div class="tafsir-header">
                <div class="tafsir-verse-text">${ayah.text}</div>
            </div>
            <div class="tafsir-text">${data.data.text}</div>
            <div style="margin-top: 2rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
                المصدر: ${data.data.edition.name}
            </div>
        `;
    } catch (error) {
        console.error('Error loading tafsir:', error);
        elements['tafsir-content'].innerHTML = `
            <div class="tafsir-hint">
                <i class="fas fa-exclamation-circle" style="color: var(--error);"></i>
                <p>حدث خطأ في تحميل التفسير</p>
            </div>
        `;
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

// ==================== Initialize App ====================
function initApp() {
    initializeElements();
    setupEventListeners();

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

    // Load surahs
    loadSurahs();

    console.log('🕌 Quran App v3.0 - Full Surah Audio System');
    console.log('📖 Features: Complete Surah MP3, Smooth Playback, 20+ Reciters');
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
