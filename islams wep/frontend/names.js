const NAMES_DATA = [
    { name: "الله", meaning: "الاسم الأجمع للذات المستجمع لجميع صفات الكمال.", evidence: "هُوَ اللَّهُ الَّذي لا إِلٰهَ إِلّا هُوَ" },
    { name: "الرحمن", meaning: "كثير الرحمة، وهو اسم مقصور على الله عز وجل ولا يجوز لغيره.", evidence: "الرَّحْمٰنِ الرَّحِيمِ" },
    { name: "الرحيم", meaning: "المنعم بنعم دقيقة، والرحيم خاص بالمؤمنين.", evidence: "وَكانَ بِالْمُؤْمِنِينَ رَحِيماً" },
    { name: "الملك", meaning: "التصرف في جميع الكائنات كما يشاء.", evidence: "الْمَلِكُ الْقُدُّوسُ" },
    { name: "القدوس", meaning: "المنزه عن كل نقص، والمقدس عن كل عيب.", evidence: "الْمَلِكُ الْقُدُّوسُ" },
    { name: "السلام", meaning: "الذي سلمت ذاته من كل عيب وصفاته من كل نقص.", evidence: "السَّلَامُ الْمُؤْمِنُ" },
    { name: "المؤمن", meaning: "المصدق نفسه بآياته المصدق لرسله فيما جاؤوا به.", evidence: "السَّلَامُ الْمُؤْمِنُ" },
    { name: "المهيمن", meaning: "المطلع على خفايا الأمور، والحافظ لكل شيء.", evidence: "الْمُؤْمِنُ الْمُهَيْمِنُ" },
    { name: "العزيز", meaning: "الغالب الذي لا يغلب، والقوي الذي لا يرام.", evidence: "الْمُهَيْمِنُ الْعَزِيزُ" },
    { name: "الجبار", meaning: "الذي يجبر كسر القلوب، والقهار الذي تنفذ مشيئته.", evidence: "الْعَزِيزُ الْجَبَّارُ" },
    { name: "المتكبر", meaning: "المنفرد بالعظمة والكبرياء، المتعالي عن صفات الخلق.", evidence: "الْجَبَّارُ الْمُتَكَبِّرُ" },
    { name: "الخالق", meaning: "الموجد للأشياء من العدم على مقتضى علمه.", evidence: "هُوَ اللَّهُ الْخالِقُ" },
    { name: "البارئ", meaning: "المبدع لما أراد إيجاده، المبرئ له من كل عيب.", evidence: "الْخالِقُ الْبارِئُ" },
    { name: "المصور", meaning: "الذي أعطى لكل مخلوق صورة خاصة يتميز بها.", evidence: "الْباريُ الْمُصَوِّرُ" },
    { name: "الغفار", meaning: "كثير المغفرة والستر لذنوب عباده.", evidence: "رَبُّ السَّمَاوَاتِ وَالْأَرْضِ وَمَا بَيْنَهُمَا الْعَزِيزُ الْغَفَّارُ" },
    { name: "القهار", meaning: "الغالب الذي خضعت له الرقاب وذلت له الجبابرة.", evidence: "وَهُوَ الْواحِدُ الْقَهّارُ" },
    { name: "الوهاب", meaning: "كثير الهبات والعطايا بدون مقابل.", evidence: "إِنَّكَ أَنْتَ الْوَهَّابُ" },
    { name: "الرزاق", meaning: "المتكفل بالرزق لجميع المخلوقات.", evidence: "إِنَّ اللهَ هُوَ الرَّزَّاقُ" },
    { name: "الفتاح", meaning: "الذي يفتح خزائن رحمته ويسهل كل عسير.", evidence: "وَهُوَ الْفَتَّاحُ الْعَلِيمُ" },
    { name: "العليم", meaning: "المحيط بكل شيء علماً ما كان وما يكون.", evidence: "وَهُوَ الْفَتَّاحُ الْعَلِيمُ" }
];

let allNames = [...NAMES_DATA];

document.addEventListener('DOMContentLoaded', () => {
    renderNames(allNames);
});

function renderNames(names) {
    const grid = document.getElementById('names-grid');
    grid.innerHTML = '';

    if (names.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; padding: 40px; color: var(--text-muted);">لم يتم العثور على اسم بهذا الوصف.</div>';
        return;
    }

    names.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'glass-panel name-card';
        card.innerHTML = `
            <div class="name-ar">${item.name}</div>
            <div class="name-meaning">${item.meaning}</div>
            <div class="name-evidence">${item.evidence}</div>
        `;
        card.onclick = () => showNameDetail(item);
        grid.appendChild(card);
    });
}

function showNameDetail(item) {
    const modal = document.getElementById('name-modal');
    document.getElementById('detail-name').innerText = item.name;
    document.getElementById('detail-meaning').innerText = item.meaning;
    document.getElementById('detail-evidence').innerText = `قال تعالى: "${item.evidence}"`;
    
    const knowledgeLink = document.getElementById('name-knowledge-link');
    knowledgeLink.innerHTML = `
        <button class="btn btn-secondary" onclick="window.location.href='knowledge.html?topic=${item.name}'">
            <i class="fa-solid fa-book-open"></i> استكشف أدلة ومقالات عن اسم "${item.name}"
        </button>
    `;

    modal.classList.add('active');
}

function closeNameModal() {
    document.getElementById('name-modal').classList.remove('active');
}

function filterNames() {
    const query = document.getElementById('name-search').value.trim().toLowerCase();
    const filtered = NAMES_DATA.filter(n => 
        n.name.includes(query) || 
        n.meaning.toLowerCase().includes(query)
    );
    renderNames(filtered);
}
