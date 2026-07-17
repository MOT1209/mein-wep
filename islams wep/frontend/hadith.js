const API_URL = (window.location.protocol === 'file:')
    ? 'http://localhost:5000/api'
    : (window.API_BASE_URL || 'http://localhost:5000/api');

let allHadiths = [];
let currentCategory = 'الإيمان والنوايا';
let currentBook = 'all';

document.addEventListener('DOMContentLoaded', () => {
    initHadiths();
});

async function initHadiths() {
    await loadTabs(); // جلب الكتب والتصنيفات ديناميكياً مستقبلاً
    loadHadiths();
}

async function loadTabs() {
    try {
        const [catRes, bookRes] = await Promise.all([
            fetch(`${API_URL}/hadiths/categories`),
            fetch(`${API_URL}/hadiths/books`)
        ]);

        if (catRes.ok) {
            const categories = await catRes.json();
            renderCategoryButtons(categories);
        }
    } catch (err) {
        console.warn('Using default tabs due to connection issues');
    }
}

function renderCategoryButtons(categories) {
    const container = document.getElementById('categories-container');
    container.innerHTML = categories.map(cat => `
        <button class="cat-btn ${cat === currentCategory ? 'active' : ''}" 
                onclick="loadByTopic('${cat}', this)">
            ${cat}
        </button>
    `).join('');
}

async function loadByTopic(category, btnElement) {
    currentCategory = category;
    if (btnElement) {
        document.querySelectorAll('.cat-btn').forEach(btn => btn.classList.remove('active'));
        btnElement.classList.add('active');
    }
    loadHadiths();
}

async function switchBook(book) {
    currentBook = book;
    document.querySelectorAll('#book-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));

    if (book === 'all') document.getElementById('tab-all').classList.add('active');
    else if (book === 'صحيح البخاري') document.getElementById('tab-bukhari').classList.add('active');
    else if (book === 'صحيح مسلم') document.getElementById('tab-muslim').classList.add('active');

    loadHadiths();
}

async function loadHadiths() {
    const container = document.getElementById('hadiths-container');
    const loader = document.getElementById('loader');

    container.innerHTML = '';
    loader.style.display = 'block';

    try {
        const response = await fetch(`${API_URL}/hadiths/category/${encodeURIComponent(currentCategory)}?withRelated=true`);
        
        if (!response.ok) throw new Error('Local API failed');

        allHadiths = await response.json();
        const filtered = filterData(allHadiths);
        
        loader.style.display = 'none';
        renderCards(filtered);

    } catch (error) {
        console.warn('Backend unavailable, switching to external Hadith API fallback...', error);
        loadExternalFallback();
    }
}

async function loadExternalFallback() {
    const container = document.getElementById('hadiths-container');
    // لتبسيط العرض في حالة الـ fallback، سنعرض أحاديث من صحيح البخاري لهذه الفئة
    // نستخدم أحد المصادر المفتوحة مثل fawazahmed0 hadith-api
    const bookSlug = currentBook === 'صحيح مسلم' ? 'ara-muslim' : 'ara-bukhari';
    
    try {
        const res = await fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${bookSlug}.json`);
        const data = await res.json();
        
        // تحويل البيانات لشكل متوافق مع العرض لدينا
        // ملاحظة: المصدر يوفر قائمة ضخمة، سنأخذ عينة مرتبطة بالتصنيف المختار بشكل تقريبي
        // أو ببساطة نعرض الأحاديث الأولى إذا لم نستطع التنقيب في الآلاف
        const sampleHadiths = data.hadiths.slice(0, 15).map(h => ({
            hadith_text: h.text,
            narrator: 'صحابي',
            book_name: bookSlug === 'ara-bukhari' ? 'صحيح البخاري' : 'صحيح مسلم',
            grade: 'صحيح',
            category: currentCategory
        }));

        allHadiths = sampleHadiths;
        const loader = document.getElementById('loader');
        loader.style.display = 'none';
        renderCards(sampleHadiths);

    } catch (err) {
        console.error('Final fallback failed:', err);
        const loader = document.getElementById('loader');
        loader.style.display = 'none';
        container.innerHTML = `
            <div class="glass-panel" style="padding:40px; text-align:center;">
                <p style="color:red;">عذراً، تعذر جلب الأحاديث حالياً. تأكد من اتصالك بالإنترنت.</p>
            </div>
        `;
    }
}

function filterData(data) {
    let filtered = data;
    if (currentBook !== 'all') {
        filtered = data.filter(h => h.book_name === currentBook);
    }
    return filtered;
}

function filterHadiths() {
    const query = document.getElementById('hadith-search-input').value.toLowerCase().trim();
    const bookFiltered = filterData(allHadiths);

    const finalFiltered = bookFiltered.filter(h =>
        h.hadith_text.includes(query) ||
        h.narrator.includes(query) ||
        h.book_name.toLowerCase().includes(query)
    );

    renderCards(finalFiltered);
}

function renderCards(hadiths) {
    const container = document.getElementById('hadiths-container');
    container.innerHTML = '';

    if (hadiths.length === 0) {
        container.innerHTML = '<div class="glass-panel" style="padding:30px; text-align:center;">لا توجد أحاديث تطابق اختياراتك حالياً.</div>';
        return;
    }

    hadiths.forEach(h => {
        let relatedHTML = '';
        if (h.related && h.related.length > 0) {
            relatedHTML = `
                <div class="knowledge-card glass-panel" style="bottom: 110%; right: 0; left: auto; transform: none;">
                    <h4>روابط معرفية</h4>
                    ${h.related.map(rel => `
                        <div class="knowledge-item">
                            <i class="fa-solid fa-link"></i>
                            <div>
                                <span class="knowledge-type">${rel.relation_type === 'explains' ? 'يشرح ' : 'مرتبط بـ'}${rel.target_type.name === 'ayah' ? 'آية' : 'مقال'}</span>
                                <span>اضغط لمزيد من التفاصيل</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        const card = document.createElement('div');
        card.className = 'glass-panel hadith-card';
        card.innerHTML = `
            <div class="hadith-text">
                « ${h.hadith_text} »
                ${h.related && h.related.length > 0 ? '<i class="fa-solid fa-circle-nodes knowledge-trigger"></i>' : ''}
                ${relatedHTML}
            </div>
            <div class="hadith-meta">
                <div><i class="fa-solid fa-user-pen"></i> الراوي: <strong>${h.narrator}</strong></div>
                <div><i class="fa-solid fa-book-bookmark"></i> المصدر: <strong>${h.book_name}</strong></div>
                <div class="grade">${h.grade}</div>
            </div>
        `;
        container.appendChild(card);
    });
}
