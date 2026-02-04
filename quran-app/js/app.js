// ==================== Quran App - Enhanced Version ====================
// Features: Offline Support, Caching, Auto-play, Advanced Search, Beautiful UI

const APP_CONFIG = {
    API_BASE: 'https://api.alquran.cloud/v1',
    CACHE_DURATION: 30 * 24 * 60 * 60 * 1000, // 30 days
    DEFAULT_FONT_SIZE: 2.2,
    MIN_FONT_SIZE: 1.5,
    MAX_FONT_SIZE: 4,
    RECITERS: {
        // القراء العرب (الأكثر شهرة)
        'ar.alafasy': 'مشاري العفاسي',
        'ar.abdulbasitmurattal': 'عبد الباسط عبد الصمد - مرتل',
        'ar.abdulbasitmujawwad': 'عبد الباسط عبد الصمد - مجود',
        'ar.minshawi': 'محمد صديق المنشاوي - مرتل',
        'ar.minshawimujawwad': 'محمد صديق المنشاوي - مجود',
        'ar.husary': 'محمود خليل الحصري - مرتل',
        'ar.husarymujawwad': 'محمود خليل الحصري - مجود',
        'ar.abdurrahmaansudais': 'عبد الرحمن السديس',
        'ar.mahermuaiqly': 'ماهر المعيقلي',
        'ar.yasseraldossari': 'ياسر الدوسري',
        'ar.shaatree': 'أبو بكر الشاطري',
        'ar.ajamy': 'أحمد بن علي العجمي',
        'ar.ahmedneana': 'أحمد نعينع',
        'ar.akhdar': 'إبراهيم الأخضر',
        'ar.jazza': 'جازا الصويلح',
        'ar.jeem': 'جيمس بل - James Blvd',
        'ar.johnabiza': 'جون أبيزا',
        'ar.haniarrifai': 'هاني الرفاعي',
        'ar.harthi': 'الحارثي',
        'ar.khalf': 'خالف',
        'ar.kanoo': 'الكنو',
        'ar.qatami': 'قطمي',
        'ar.leensh': 'لينش',
        'ar.muammar': 'معمر',
        'ar.matrod': 'مطرود',
        'ar.mohsinharthi': 'محسن الحارثي',
        'ar.muhammadjibreel': 'محمد جبريل',
        'ar.muhammadayyoub': 'محمد أيوب',
        'ar.muhammadthubaity': 'محمد الثبيتي',
        'ar.mustafaismail': 'مصطفى إسماعيل',
        'ar.nabilrafa': 'نبيل الرفاعي',
        'ar.nasseralqutami': 'ناصر القطامي',
        'ar.omarwarsh': 'عمر الورش',
        'ar.saadbagh': 'سعد بغدادي',
        'ar.saberabdulhakam': 'صابر عبد الحكم',
        'ar.sahl': 'سهل ياسين',
        'ar.salamah': 'سلامة',
        'ar.salaahbraak': 'صلاح براك',
        'ar.tawfeeq': 'توفيق الصايغ',
        'ar.wadee': 'وديع اليمني',
        'ar.yusufmansur': 'يوسف المنصور',
        
        // قراء أجانب
        'en.walk': 'English - Ibrahim Walk',
        'fr.leclerc': 'Français - Youssouf Leclerc',
        'id.ihfazh': 'Bahasa Indonesia - Ihfazh'
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
        reciter: 'ar.alafasy',
        showTranslation: false
    },
    isPlaying: false,
    isRepeatEnabled: false,
    isAutoPlayEnabled: false,
    audioElement: null,
    searchDebounceTimer: null,
    cache: new Map()
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
        'surah-search', 'auto-play-btn', 'toast-container', 'reading-progress', 'progress-text'
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
        // Check memory cache first
        if (state.cache.has(key)) {
            const cached = state.cache.get(key);
            if (Date.now() - cached.timestamp < APP_CONFIG.CACHE_DURATION) {
                return cached.data;
            }
            state.cache.delete(key);
        }
        
        // Check localStorage
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
        const cacheEntry = {
            data,
            timestamp: Date.now()
        };
        
        state.cache.set(key, cacheEntry);
        
        // Also store in localStorage for persistence
        try {
            localStorage.setItem(`cache_${key}`, JSON.stringify(cacheEntry));
        } catch (e) {
            // localStorage might be full, that's okay
            console.warn('Cache write error:', e);
        }
    },
    
    clear() {
        state.cache.clear();
        // Clear localStorage cache entries
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('cache_')) {
                localStorage.removeItem(key);
            }
        });
    }
};

// ==================== API Functions with Caching ====================
async function fetchWithCache(url, cacheKey) {
    // Try cache first
    const cached = await cacheManager.get(cacheKey);
    if (cached) {
        console.log('Serving from cache:', cacheKey);
        return cached;
    }
    
    // Fetch from network
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        
        // Store in cache
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
        
        const data = await fetchWithCache(
            `${APP_CONFIG.API_BASE}/surah/${surahNumber}`,
            `surah_${surahNumber}`
        );
        
        state.currentSurah = data.data;
        state.currentVerseIndex = 0;
        
        // Update reading progress
        state.readingProgress[surahNumber] = {
            lastRead: Date.now(),
            percentage: 0
        };
        saveReadingProgress();
        
        updateSurahHeader();
        displayVerses();
        highlightActiveSurah(surahNumber);
        updateProgressBar();
        
        // Close sidebar on mobile
        if (window.innerWidth <= 992) {
            elements['sidebar'].classList.remove('active');
        }
        
        showToast(`تم تحميل سورة ${state.currentSurah.name}`, 'success');
        
    } catch (error) {
        console.error('Error loading surah:', error);
        showToast('حدث خطأ في تحميل السورة', 'error');
        elements['verses-container'].innerHTML = `
            <div class="welcome-message">
                <i class="fas fa-exclamation-circle" style="color: var(--error);"></i>
                <h3>خطأ في التحميل</h3>
                <p>تعذر تحميل السورة. تحقق من اتصالك بالإنترنت.</p>
            </div>
        `;
    }
}

// ==================== Update Surah Header ====================
function updateSurahHeader() {
    const surah = state.currentSurah;
    if (!surah) return;
    
    elements['surah-name'].textContent = surah.name;
    elements['surah-details'].textContent = `${surah.englishName} • ${surah.numberOfAyahs} آية • ${surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}`;
    
    // Update badge
    const badge = document.getElementById('surah-badge');
    if (badge) {
        badge.innerHTML = `<span class="surah-number-badge">${surah.number}</span>`;
    }
    
    // Update save button
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
        
        return `
            <span class="verse-item ${isBookmarked ? 'bookmarked' : ''}" 
                  id="verse-${index}" 
                  data-verse-index="${index}" 
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

// ==================== Handle Verse Click ====================
function handleVerseClick(index) {
    playVerse(index);
    if (document.getElementById('tafsir-modal')?.classList.contains('active')) {
        loadTafsir(index);
    }
}

// ==================== Audio Player Functions ====================
let isLoadingAudio = false;

async function playVerse(verseIndex) {
    if (!state.currentSurah) {
        showToast('اختر سورة أولاً', 'warning');
        return;
    }
    
    if (isLoadingAudio) {
        console.log('Already loading audio, please wait...');
        return;
    }
    
    isLoadingAudio = true;
    state.currentVerseIndex = verseIndex;
    const reciter = elements['reciter-select']?.value || state.settings.reciter || 'ar.alafasy';
    const ayah = state.currentSurah.ayahs[verseIndex];
    
    if (!ayah) {
        console.error('Invalid verse index:', verseIndex);
        isLoadingAudio = false;
        return;
    }
    
    try {
        // Show loading state
        if (elements['player-verse']) {
            elements['player-verse'].textContent = `جاري التحميل...`;
        }
        
        console.log(`Loading audio for verse ${ayah.numberInSurah} with reciter ${reciter}`);
        
        const data = await fetchWithCache(
            `${APP_CONFIG.API_BASE}/ayah/${ayah.number}/${reciter}`,
            `audio_${ayah.number}_${reciter}`
        );
        
        if (!data.data || !data.data.audio) {
            throw new Error('No audio URL received');
        }
        
        // Initialize audio element if needed
        if (!state.audioElement) {
            state.audioElement = elements['audio-element'];
            if (!state.audioElement) {
                state.audioElement = new Audio();
                state.audioElement.id = 'audio-element';
                document.body.appendChild(state.audioElement);
            }
            setupAudioListeners();
        }
        
        // Pause current audio
        if (!state.audioElement.paused) {
            state.audioElement.pause();
        }
        
        // Set new audio source
        state.audioElement.src = data.data.audio;
        state.audioElement.preload = 'auto';
        state.audioElement.playbackRate = parseFloat(elements['playback-speed']?.value || 1);
        
        // Load and play
        state.audioElement.load();
        
        // Wait for audio to be ready
        await new Promise((resolve, reject) => {
            const onCanPlay = () => {
                state.audioElement.removeEventListener('canplay', onCanPlay);
                state.audioElement.removeEventListener('error', onError);
                resolve();
            };
            
            const onError = (e) => {
                state.audioElement.removeEventListener('canplay', onCanPlay);
                state.audioElement.removeEventListener('error', onError);
                reject(new Error('Audio load error'));
            };
            
            state.audioElement.addEventListener('canplay', onCanPlay);
            state.audioElement.addEventListener('error', onError);
            
            // Timeout after 10 seconds
            setTimeout(() => {
                state.audioElement.removeEventListener('canplay', onCanPlay);
                state.audioElement.removeEventListener('error', onError);
                reject(new Error('Audio load timeout'));
            }, 10000);
        });
        
        // Play audio
        await state.audioElement.play();
        state.isPlaying = true;
        
        updatePlayerUI();
        elements['audio-player'].classList.add('active');
        updatePlayPauseButton();
        highlightCurrentVerse(verseIndex);
        
        // Scroll to verse
        const verseElement = document.getElementById(`verse-${verseIndex}`);
        if (verseElement) {
            verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        console.log(`Successfully playing verse ${ayah.numberInSurah}`);
        
    } catch (error) {
        console.error('Error playing verse:', error);
        showToast('حدث خطأ في تشغيل الصوت - سيتم المحاولة مرة أخرى', 'error');
        
        // Retry once after 3 seconds
        setTimeout(async () => {
            if (state.currentVerseIndex === verseIndex) {
                console.log('Retrying...');
                isLoadingAudio = false;
                await playVerse(verseIndex);
            }
        }, 3000);
    } finally {
        setTimeout(() => {
            isLoadingAudio = false;
        }, 1000);
    }
}

function updatePlayerUI() {
    if (!state.currentSurah) return;
    
    const ayah = state.currentSurah.ayahs[state.currentVerseIndex];
    elements['player-surah'].textContent = state.currentSurah.name;
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

// ==================== Audio Event Listeners ====================
function setupAudioListeners() {
    if (!state.audioElement) {
        state.audioElement = elements['audio-element'];
    }
    
    if (!state.audioElement) return;
    
    // Remove old listeners to avoid duplicates
    state.audioElement.removeEventListener('timeupdate', onTimeUpdate);
    state.audioElement.removeEventListener('ended', onAudioEnded);
    state.audioElement.removeEventListener('error', onAudioError);
    state.audioElement.removeEventListener('canplay', onCanPlay);
    state.audioElement.removeEventListener('waiting', onWaiting);
    state.audioElement.removeEventListener('playing', onPlaying);
    
    // Add new listeners
    state.audioElement.addEventListener('timeupdate', onTimeUpdate);
    state.audioElement.addEventListener('ended', onAudioEnded);
    state.audioElement.addEventListener('error', onAudioError);
    state.audioElement.addEventListener('canplay', onCanPlay);
    state.audioElement.addEventListener('waiting', onWaiting);
    state.audioElement.addEventListener('playing', onPlaying);
}

function onTimeUpdate() {
    if (!state.audioElement || !state.audioElement.duration) return;
    
    const progress = (state.audioElement.currentTime / state.audioElement.duration) * 100;
    if (elements['progress-bar']) {
        elements['progress-bar'].value = progress || 0;
    }
    if (elements['current-time']) {
        elements['current-time'].textContent = formatTime(state.audioElement.currentTime);
    }
    if (elements['duration'] && state.audioElement.duration) {
        elements['duration'].textContent = formatTime(state.audioElement.duration);
    }
}

async function onAudioEnded() {
    console.log('Audio ended, repeat:', state.isRepeatEnabled, 'autoPlay:', state.settings.autoPlay);
    
    if (state.isRepeatEnabled) {
        // Repeat current verse
        if (state.audioElement) {
            state.audioElement.currentTime = 0;
            try {
                await state.audioElement.play();
                console.log('Repeating verse');
            } catch (e) {
                console.error('Error repeating:', e);
            }
        }
    } else if (state.settings.autoPlay || state.settings.autoNextSurah) {
        // Play next verse with small delay
        console.log('Playing next verse...');
        setTimeout(async () => {
            await playNextVerse();
        }, 500);
    } else {
        // Stop playing
        state.isPlaying = false;
        updatePlayPauseButton();
        document.querySelectorAll('.verse-item').forEach(item => {
            item.classList.remove('playing');
        });
    }
}

function onAudioError(e) {
    console.error('Audio error:', e);
    showToast('خطأ في تحميل الصوت - جاري المحاولة مرة أخرى', 'error');
    
    // Retry once after 2 seconds
    setTimeout(async () => {
        if (state.currentSurah && state.currentVerseIndex >= 0) {
            console.log('Retrying audio...');
            await playVerse(state.currentVerseIndex);
        }
    }, 2000);
}

function onCanPlay() {
    console.log('Audio ready to play');
    if (elements['player-verse']) {
        elements['player-verse'].textContent = `الآية ${state.currentSurah?.ayahs[state.currentVerseIndex]?.numberInSurah || 1}`;
    }
}

function onWaiting() {
    console.log('Audio loading...');
    if (elements['player-verse']) {
        elements['player-verse'].textContent = 'جاري التحميل...';
    }
}

function onPlaying() {
    console.log('Audio playing');
    state.isPlaying = true;
    updatePlayPauseButton();
}

async function playNextVerse() {
    if (!state.currentSurah) {
        console.log('No current surah');
        return;
    }
    
    const currentIndex = state.currentVerseIndex;
    const totalVerses = state.currentSurah.ayahs.length;
    
    console.log(`Playing next verse. Current: ${currentIndex + 1}/${totalVerses}`);
    
    if (currentIndex < totalVerses - 1) {
        // Play next verse in current surah
        await playVerse(currentIndex + 1);
    } else if (state.settings.autoNextSurah && state.currentSurah.number < 114) {
        // Auto-play next surah
        console.log('Loading next surah...');
        showToast('جاري تحميل السورة التالية...', 'info');
        
        try {
            await loadSurah(state.currentSurah.number + 1);
            // Wait for surah to load then play first verse
            setTimeout(async () => {
                if (state.currentSurah && state.currentSurah.ayahs.length > 0) {
                    await playVerse(0);
                }
            }, 1000);
        } catch (error) {
            console.error('Error loading next surah:', error);
            showToast('حدث خطأ في تحميل السورة التالية', 'error');
        }
    } else {
        // Finished playing
        console.log('Finished playing');
        state.isPlaying = false;
        updatePlayPauseButton();
        document.querySelectorAll('.verse-item').forEach(item => {
            item.classList.remove('playing');
        });
        showToast('انتهت التلاوة', 'success');
    }
}

function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
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
    
    // Update sidebar if visible
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
    
    // Sort by date (newest first)
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
    
    // Refresh verses display if needed
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

// ==================== Theme Toggle ====================
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

// ==================== Font Size Controls ====================
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

// ==================== Progress Bar ====================
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

// ==================== Auto Play Toggle ====================
function toggleAutoPlay() {
    state.settings.autoPlay = !state.settings.autoPlay;
    saveSettings();
    
    const btn = elements['auto-play-btn'];
    if (btn) {
        btn.classList.toggle('active', state.settings.autoPlay);
    }
    
    showToast(state.settings.autoPlay ? 'تم تفعيل التلاوة المتواصلة' : 'تم إيقاف التلاوة المتواصلة', 'info');
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
    
    // Audio controls
    elements['play-pause']?.addEventListener('click', () => {
        if (!state.audioElement) return;
        
        if (state.isPlaying) {
            state.audioElement.pause();
            state.isPlaying = false;
        } else {
            state.audioElement.play();
            state.isPlaying = true;
        }
        updatePlayPauseButton();
    });
    
    elements['prev-verse']?.addEventListener('click', async () => {
        if (!state.currentSurah || state.currentVerseIndex <= 0) return;
        await playVerse(state.currentVerseIndex - 1);
    });
    
    elements['next-verse']?.addEventListener('click', playNextVerse);
    
    elements['skip-forward']?.addEventListener('click', () => {
        if (state.audioElement) state.audioElement.currentTime += 10;
    });
    
    elements['skip-back']?.addEventListener('click', () => {
        if (state.audioElement) state.audioElement.currentTime -= 10;
    });
    
    elements['repeat-verse']?.addEventListener('click', () => {
        state.isRepeatEnabled = !state.isRepeatEnabled;
        elements['repeat-verse'].classList.toggle('active', state.isRepeatEnabled);
        showToast(state.isRepeatEnabled ? 'تم تفعيل التكرار' : 'تم إيقاف التكرار', 'info');
    });
    
    elements['playback-speed']?.addEventListener('change', (e) => {
        if (state.audioElement) {
            state.audioElement.playbackRate = parseFloat(e.target.value);
        }
    });
    
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
    
    elements['progress-bar']?.addEventListener('input', (e) => {
        if (state.audioElement) {
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
        
        if (e.code === 'Space' && state.isPlaying && document.activeElement.tagName !== 'INPUT') {
            e.preventDefault();
            elements['play-pause']?.click();
        }
    });
    
    // Reciter select
    elements['reciter-select']?.addEventListener('change', (e) => {
        state.settings.reciter = e.target.value;
        saveSettings();
    });
}

// ==================== Share Function ====================
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
        // Fallback: copy to clipboard
        try {
            await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}`);
            showToast('تم نسخ الرابط', 'success');
        } catch (err) {
            showToast('تعذر المشاركة', 'error');
        }
    }
}

// ==================== Download Function ====================
async function downloadCurrentSurah() {
    if (!state.currentSurah) {
        showToast('اختر سورة أولاً', 'warning');
        return;
    }
    
    showToast('جاري التحضير للتحميل...', 'info');
    
    // Create text content
    let content = `سورة ${state.currentSurah.name}\n`;
    content += `عدد الآيات: ${state.currentSurah.numberOfAyahs}\n`;
    content += `${state.currentSurah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}\n\n`;
    content += `بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\n\n`;
    
    state.currentSurah.ayahs.forEach(ayah => {
        content += `${ayah.text} (${ayah.numberInSurah})\n`;
    });
    
    // Create and download file
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

// ==================== Highlight Active Surah ====================
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

// ==================== Initialize App ====================
function initApp() {
    initializeElements();
    setupEventListeners();
    setupAudioListeners();
    
    // Load saved settings
    if (state.settings.theme === 'light') {
        document.body.classList.remove('dark-mode');
        const icon = elements['theme-toggle']?.querySelector('i');
        if (icon) icon.className = 'fas fa-moon';
    }
    
    // Set initial reciter
    if (elements['reciter-select'] && state.settings.reciter) {
        elements['reciter-select'].value = state.settings.reciter;
    }
    
    // Set auto-play button state
    if (elements['auto-play-btn'] && state.settings.autoPlay) {
        elements['auto-play-btn'].classList.add('active');
    }
    
    // Load surahs
    loadSurahs();
    
    console.log('🕌 Quran App Initialized - Enhanced Version');
    console.log('📖 Features: Offline Support, Caching, Auto-play, Advanced Search');
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
