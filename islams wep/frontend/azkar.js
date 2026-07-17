const API_URL = (window.location.protocol === 'file:')
    ? 'http://localhost:5000/api'
    : (window.API_BASE_URL || 'http://localhost:5000/api');

let allAzkar = [];
let currentCategory = 'أذكار الصباح والمساء';

// بيانات المسند (حصن المسلم) للاحتياط وللدقة العالية
const AUTHENTIC_AZKAR_FALLBACK = [
    {
        zekr_text: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
        count: 1,
        category: "أذكار الصباح والمساء",
        fadl: "من قاله حين يصبح أُجير من الجن حتى يمسي",
        source: "رواه مسلم"
    },
    {
        zekr_text: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ...",
        count: 1,
        category: "أذكار الصباح والمساء",
        fadl: "سيد الاستغفار، من قاله موقناً به فمات من يومه دخل الجنة",
        source: "رواه البخاري"
    },
    {
        zekr_text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
        count: 100,
        category: "أذكار الصباح والمساء",
        fadl: "حطت خطاياه وإن كانت مثل زبد البحر",
        source: "متفق عليه"
    },
    {
        zekr_text: "أستغفر الله",
        count: 33,
        category: "أذكار الصلاة",
        fadl: "بعد الصلاة المكتوبة",
        source: "رواه مسلم"
    },
    {
        zekr_text: "بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ، فَإِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا...",
        count: 1,
        category: "أذكار النوم والاستيقاظ",
        fadl: "من قاله حين يأوي إلى فراشه حفظه الله",
        source: "متفق عليه"
    }
];

document.addEventListener('DOMContentLoaded', () => {
    loadAzkar(currentCategory);
});

async function switchAzkarTab(category) {
    currentCategory = category;
    document.querySelectorAll('#azkar-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));

    // تحديد الزر النشط بناءً على النص أو تخزينه في خاصية
    const tabs = document.querySelectorAll('#azkar-tabs .tab-btn');
    tabs.forEach(tab => {
        if (tab.innerText.includes(category.split(' ')[0])) tab.classList.add('active');
    });

    loadAzkar(category);
}

async function loadAzkar(category) {
    const container = document.getElementById('azkar-container');
    const loader = document.getElementById('loader');

    container.innerHTML = '';
    loader.style.display = 'block';

    try {
        const response = await fetch(`${API_URL}/azkar/${encodeURIComponent(category)}`);

        if (!response.ok) throw new Error('Local API failed');

        allAzkar = await response.json();

        // التحقق من جودة البيانات المحلية أو إكمالها من المسند
        if (allAzkar.length === 0) throw new Error('Empty data');

        loader.style.display = 'none';
        renderAzkarCards(allAzkar);

    } catch (error) {
        console.warn('Backend unavailable or empty, using authentic fallback for Azkar:', error.message);
        const fallbackData = AUTHENTIC_AZKAR_FALLBACK.filter(a => a.category === category);
        allAzkar = fallbackData.length > 0 ? fallbackData : AUTHENTIC_AZKAR_FALLBACK;

        loader.style.display = 'none';
        renderAzkarCards(allAzkar);
    }
}

function filterAzkar() {
    const query = document.getElementById('azkar-search-input').value.trim().toLowerCase();
    const filtered = allAzkar.filter(z =>
        z.zekr_text.includes(query) ||
        (z.fadl && z.fadl.includes(query))
    );
    renderAzkarCards(filtered);
}

function renderAzkarCards(azkarList) {
    const container = document.getElementById('azkar-container');
    container.innerHTML = '';

    if (azkarList.length === 0) {
        container.innerHTML = '<div class="glass-panel" style="padding:30px; text-align:center;">لا توجد أذكار تطابق بحثك حالياً.</div>';
        return;
    }

    azkarList.forEach((z, index) => {
        const card = document.createElement('div');
        card.className = 'glass-panel zekr-card';
        card.innerHTML = `
            <div class="zekr-text">${z.zekr_text}</div>
            <div class="zekr-meta">
                ${z.fadl ? `<div class="zekr-fadl"><i class="fa-solid fa-circle-info"></i> ${z.fadl}</div>` : ''}
                <div class="zekr-footer">
                    <div class="zekr-source">${z.source || z.read_time || 'حصن المسلم'}</div>
                    <div class="zekr-count" onclick="handleCounter(this, ${z.count})">
                        العدد: <span>${z.count}</span>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function handleCounter(btn, max) {
    if (btn.classList.contains('done')) return;

    const span = btn.querySelector('span');
    let current = parseInt(span.innerText);

    if (current > 0) {
        current--;
        span.innerText = current;

        // إضافة نبضة خفيفة (Micro-interaction)
        btn.style.transform = 'scale(0.92)';
        setTimeout(() => btn.style.transform = 'scale(1)', 100);
    }

    if (current === 0) {
        btn.classList.add('done');
        btn.innerHTML = '<i class="fa-solid fa-check"></i> تم';
        btn.closest('.zekr-card').classList.add('completed');

        // تشغيل صوت خفيف أو اهتزاز إذا كان متاحاً
        if (window.navigator.vibrate) window.navigator.vibrate(50);
    }
}
