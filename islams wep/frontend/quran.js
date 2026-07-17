// ملف quran.js: إدارة جلب بيانات القرآن والمشغل الصوتي
const API_URL = (window.location.protocol === 'file:')
    ? 'http://localhost:5000/api'
    : (window.API_BASE_URL || 'http://localhost:5000/api');

let allSurahs = [];
let allJuz = [];
let currentView = 'surah';
let currentAudioId = null;
let currentReciter = localStorage.getItem('selectedReciter') || 'ar.alafasy';

// DOM Elements for Audio Player
let audio = null;
let playPauseBtn = null;
let progressBar = null;
let currentTimeSpan = null;
let totalTimeSpan = null;
let volumeSlider = null;
let playerContainer = null;

document.addEventListener('DOMContentLoaded', () => {
    initAudioPlayer();
    loadQuranData();
    // ضبط القارئ المختار في القائمة
    document.getElementById('reciter-select').value = currentReciter;
});

function initAudioPlayer() {
    audio = document.getElementById('quran-audio');
    playPauseBtn = document.getElementById('play-pause-btn');
    progressBar = document.getElementById('progress-bar');
    currentTimeSpan = document.getElementById('current-time');
    totalTimeSpan = document.getElementById('total-time');
    volumeSlider = document.getElementById('volume-slider');
    playerContainer = document.getElementById('audio-player-container');

    playPauseBtn.onclick = togglePlay;

    audio.ontimeupdate = updateProgress;
    audio.onloadedmetadata = () => {
        totalTimeSpan.innerText = formatTime(audio.duration);
        progressBar.max = Math.floor(audio.duration);
    };

    progressBar.oninput = () => {
        audio.currentTime = progressBar.value;
    };

    volumeSlider.oninput = () => {
        audio.volume = volumeSlider.value / 100;
    };

    audio.onended = () => {
        playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    };
}

async function loadQuranData() {
    const loader = document.getElementById('loader');
    try {
        let response = await fetch(`${API_URL}/quran/surahs`);
        if (response.ok) {
            allSurahs = await response.json();
            if (allSurahs.length === 0) throw new Error('Empty');
        } else throw new Error('Fail');

        renderSurahs(allSurahs);
        loadJuzData();
        loader.style.display = 'none';

    } catch (error) {
        console.warn('Fallback to external API...');
        const extRes = await fetch('https://api.alquran.cloud/v1/surah');
        const extData = await extRes.json();
        allSurahs = extData.data.map(s => ({
            surah_number: s.number,
            surah_name: s.name,
            english_name: s.englishName,
            ayahs_count: s.numberOfAyahs,
            revelation_type: s.revelationType === 'Meccan' ? 'مكية' : 'مدنية'
        }));
        renderSurahs(allSurahs);
        loadJuzData();
        loader.style.display = 'none';
    }
}

function renderSurahs(surahs) {
    const grid = document.getElementById('surah-grid');
    grid.innerHTML = '';
    surahs.forEach(surah => {
        let displayName = surah.surah_name.replace(/^سُورَةُ\s+/g, '').replace(/^سورة\s+/g, '').trim();
        const card = document.createElement('div');
        card.className = 'surah-card glass-panel';
        card.innerHTML = `
            <div class="surah-number-badge">${surah.surah_number}</div>
            <div class="surah-main-info">
                <div class="surah-name-ar">سورة ${displayName}</div>
                <div class="surah-meta">
                    <span><i class="fa-solid fa-file-lines"></i> ${surah.ayahs_count || '?'} آية</span>
                    <span><i class="fa-solid fa-mosque"></i> ${surah.revelation_type || ''}</span>
                </div>
            </div>
            <div class="surah-play-btn" onclick="playFullSurah(event, ${surah.surah_number}, '${displayName}')">
                <i class="fa-solid fa-play"></i>
            </div>
        `;
        card.onclick = (e) => {
            if (!e.target.closest('.surah-play-btn')) loadSurahContent(surah.surah_number, displayName);
        };
        grid.appendChild(card);
    });
}

async function playFullSurah(event, number, name) {
    if (event) event.stopPropagation();

    const reciter = document.getElementById('reciter-select').value;
    const reciterName = document.getElementById('reciter-select').selectedOptions[0].text;

    // API لملفات الصوت (Server-side streaming preferred, but direct link is faster)
    // نستخدم الجودة العالية من alquran.cloud
    const audioUrl = `https://cdn.islamic.network/quran/audio-surah/128/${reciter}/${number}.mp3`;

    audio.src = audioUrl;
    document.getElementById('player-surah-name').innerText = `سورة ${name}`;
    document.getElementById('player-reciter-name').innerText = reciterName;

    playerContainer.classList.add('active');
    togglePlay();
}

function togglePlay() {
    if (audio.paused) {
        audio.play();
        playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
    } else {
        audio.pause();
        playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    }
}

function updateProgress() {
    progressBar.value = Math.floor(audio.currentTime);
    currentTimeSpan.innerText = formatTime(audio.currentTime);
}

function formatTime(seconds) {
    if (isNaN(seconds)) return '00:00';
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min < 10 ? '0' : ''}${min}:${sec < 10 ? '0' : ''}${sec}`;
}

function changeReciter() {
    const val = document.getElementById('reciter-select').value;
    localStorage.setItem('selectedReciter', val);
}

function closePlayer() {
    audio.pause();
    audio.currentTime = 0;
    playerContainer.classList.remove('active');
    playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
}

// ... بقية الوظائف السابقة (loadSurahContent, renderAyahs, الخ)

async function loadSurahContent(surahNumber, surahName) {
    const cleanTitle = surahName.replace(/^سورة\s+/g, '').replace(/^سُورَةُ\s+/g, '').trim();
    showContentView(`سورة ${cleanTitle}`);
    const ayahsContainer = document.getElementById('ayahs-container');
    ayahsContainer.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري التحميل...';

    // زر تشغيل السورة من الداخل
    const controls = document.createElement('div');
    controls.style.textAlign = 'center';
    controls.style.marginBottom = '20px';
    controls.innerHTML = `
        <button class="btn btn-primary" onclick="playFullSurah(null, ${surahNumber}, '${cleanTitle}')">
            <i class="fa-solid fa-play"></i> تشغيل السورة بصوت القارئ المختار
        </button>
    `;
    ayahsContainer.before(controls);

    try {
        let response = await fetch(`${API_URL}/quran/surahs/${surahNumber}?withRelated=true`);
        if (response.ok) {
            const ayahs = await response.json();
            renderAyahs(ayahs, surahNumber);
        } else throw new Error();
    } catch (error) {
        const extRes = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`);
        const extData = await extRes.json();
        const ayahs = extData.data.ayahs.map(a => ({ ayah_number: a.numberInSurah, ayah_text: a.text, id: a.number }));
        renderAyahs(ayahs, surahNumber);
    }
}

function renderAyahs(ayahs, surahNumber, isJuz = false) {
    const ayahsContainer = document.getElementById('ayahs-container');
    ayahsContainer.innerHTML = '';

    let contentHTML = '';
    const validAyahs = ayahs.filter(a => a.ayah_number > 0);

    if (!isJuz && surahNumber !== 1 && surahNumber !== 9) {
        contentHTML += `<div style="text-align:center; font-size:2rem; margin-bottom:20px; font-family:'Amiri', serif;">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>`;
    }

    validAyahs.forEach(ayah => {
        contentHTML += `
            <span class="ayah" id="ayah-${ayah.id}" onclick="showTafsir(${surahNumber}, ${ayah.ayah_number}, '${surahName}')">
                ${isJuz ? `<span style="font-size:0.8rem; color:var(--primary-color);">[${ayah.surah_name || ''}]</span> ` : ''}
                ${ayah.ayah_text}
                <span class="ayah-number">${ayah.ayah_number}</span> 
            </span>
        `;
    });
    ayahsContainer.innerHTML = contentHTML;
}

async function showTafsir(surah, ayah, surahName) {
    const modal = document.getElementById('tafsir-modal');
    const title = document.getElementById('tafsir-ayah-title');
    const text = document.getElementById('tafsir-text');

    modal.classList.add('active');
    title.innerText = `تفسير سورة ${surahName} - الآية ${ayah}`;
    text.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري تحميل التفسير...';

    try {
        const response = await fetch(`${API_URL}/quran/tafsir/${surah}/${ayah}`);
        const data = await response.json();
        if (data.text) {
            text.innerText = data.text;
        } else {
            throw new Error();
        }
    } catch (err) {
        text.innerText = 'عذراً، تعذر جلب التفسير لهذه الآية حالياً.';
    }
}

function closeTafsirModal() {
    document.getElementById('tafsir-modal').classList.remove('active');
}

function showContentView(title) {
    document.getElementById('surahs-list-view').style.display = 'none';
    document.getElementById('surah-content-view').style.display = 'block';
    document.getElementById('current-surah-title').innerText = title;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function backToSurahs() {
    const controls = document.querySelector('.btn-primary[onclick*="playFullSurah"]');
    if (controls) controls.parentElement.remove();
    document.getElementById('surah-content-view').style.display = 'none';
    document.getElementById('surahs-list-view').style.display = 'block';
}

function switchQuranView(view) {
    currentView = view;
    document.getElementById('tab-surah').classList.toggle('active', view === 'surah');
    document.getElementById('tab-juz').classList.toggle('active', view === 'juz');
    document.getElementById('surah-grid').style.display = view === 'surah' ? 'grid' : 'none';
    document.getElementById('juz-grid').style.display = view === 'juz' ? 'grid' : 'none';
}

function filterQuran() {
    const query = document.getElementById('quran-search-input').value.trim().toLowerCase();
    if (currentView === 'surah') {
        const filtered = allSurahs.filter(s => s.surah_name.includes(query) || s.surah_number.toString() === query);
        renderSurahs(filtered);
    }
}

async function loadJuzData() {
    const juzGrid = document.getElementById('juz-grid');
    juzGrid.innerHTML = '';
    const juzList = Array.from({ length: 30 }, (_, i) => i + 1);
    juzList.forEach(num => {
        const card = document.createElement('div');
        card.className = 'surah-card glass-panel';
        card.innerHTML = `<div class="surah-number-badge">${num}</div><div class="surah-main-info"><div class="surah-name-ar">الجزء ${num}</div></div>`;
        card.onclick = () => loadJuzContent(num);
        juzGrid.appendChild(card);
    });
}

async function loadJuzContent(juzNumber) {
    showContentView(`الجزء ${juzNumber}`);
    const ayahsContainer = document.getElementById('ayahs-container');
    try {
        const res = await fetch(`https://api.alquran.cloud/v1/juz/${juzNumber}/quran-uthmani`);
        const data = await res.json();
        const ayahs = data.data.ayahs.map(a => ({ ayah_number: a.numberInSurah, ayah_text: a.text, surah_name: a.surah.name }));
        renderAyahs(ayahs, null, true);
    } catch (e) {
        ayahsContainer.innerHTML = 'خطأ';
    }
}
