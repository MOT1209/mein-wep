// Comprehensive Question Database
// Structure: quizDatabase[category] = [ level0[], level1[], ... ]
// Each level holds 10 questions: { question, options[], answer (index) }
const quizDatabase = {
    programming: [
        // LEVEL 1 (Base Questions)
        [
            { question: "ما هي لغة البرمجة التي تستخدم لإضافة التفاعلية للمواقع؟", options: ["HTML", "CSS", "JavaScript", "SQL"], answer: 2 },
            { question: "أي خاصية CSS تستخدم لتغيير لون الخلفية؟", options: ["color", "background-color", "bg-color", "fill"], answer: 1 },
            { question: "ماذا يرمز اختصار HTML؟", options: ["Hyper Text Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyperlink Text Management Language"], answer: 0 },
            { question: "أي رمز يستخدم لتعريف الـ ID في CSS؟", options: [".", "#", "*", "@"], answer: 1 },
            { question: "كيف تقوم بتعريف مصفوفة في JavaScript؟", options: ["let arr = {}", "let arr = []", "let arr = ()", "let arr = <>"], answer: 1 },
            { question: "ما هو الوسم الصحيح لإضافة رابط؟", options: ["<link>", "<a>", "<href>", "<url>"], answer: 1 },
            { question: "أي شركة قامت بتطوير لغة Java؟", options: ["Microsoft", "Google", "Sun Microsystems", "Apple"], answer: 2 },
            { question: "ما هي الوظيفة الأساسية لـ Git؟", options: ["تحرير الصور", "تنسيق النصوص", "نظام مراقبة النسخ (Version Control)", "استضافة قواعد البيانات"], answer: 2 },
            { question: "أي خاصية تستخدم لجعل النص عريضاً (Bold)؟", options: ["font-style", "font-weight", "text-decoration", "boldness"], answer: 1 },
            { question: "ماذا تعني SQL؟", options: ["Simple Query Language", "Standard Quiz Layer", "Structured Query Language", "Solution Query List"], answer: 2 }
        ],
        // LEVEL 2 (More Questions...)
        [
            { question: "ما هو محرك جافا سكريبت في متصفح Chrome؟", options: ["SpiderMonkey", "Chakra", "V8", "Nitro"], answer: 2 },
            { question: "أي عنصر HTML يستخدم لتضمين ملف JS خارجي؟", options: ["<javascript>", "<scripting>", "<script>", "<js>"], answer: 2 },
            { question: "ما هي القيمة الافتراضية للـ position في CSS؟", options: ["absolute", "relative", "static", "fixed"], answer: 2 },
            { question: "ما هي طريقة دمج مصفوفتين في JS؟", options: ["concat()", "combine()", "merge()", "append()"], answer: 0 },
            { question: "ماذا تعني API؟", options: ["Application Program Interface", "Advanced Programming Intel", "Apple Program Info", "Automated Process Ink"], answer: 0 },
            { question: "ما هو الخطأ في تسمية المتغير: let 1user؟", options: ["استخدام let", "بدء الاسم برقم", "استخدام كلمة user", "لا يوجد خطأ"], answer: 1 },
            { question: "أي نوع بيانات يمثله: true / false؟", options: ["String", "Number", "Boolean", "Undefined"], answer: 2 },
            { question: "ما هو الـ DOM؟", options: ["Document Object Model", "Data Object Management", "Digital Orbit Mode", "Desktop Output Monitor"], answer: 0 },
            { question: "أي مكتبة JS تستخدم لبناء واجهات مستخدم بأسلوب المكونات؟", options: ["jQuery", "React", "Django", "Laravel"], answer: 1 },
            { question: "كيف نكتب تعليقاً في CSS؟", options: ["// comment", "<!-- comment -->", "/* comment */", "# comment"], answer: 2 }
        ],
        // LEVEL 3 (Intermediate)
        [
            { question: "ما هي الطريقة الصحيحة لمنع تصرف النموذج (Form) الافتراضي؟", options: ["stop()", "end()", "preventDefault()", "halt()"], answer: 2 },
            { question: "أي محرك قواعد بيانات يستخدم 'Collection' بدلاً من 'Table'؟", options: ["MySQL", "PostgreSQL", "MongoDB", "Oracle"], answer: 2 },
            { question: "ما هو الـ 'Hoisting' في JavaScript؟", options: ["ضغط الكود", "رفع تعريفات المتغيرات للأعلى", "حذف الذاكرة غير المستخدمة", "دمج الملفات"], answer: 1 },
            { question: "أي جزء من الـ Box Model هو الأقرب للمحتوى؟", options: ["Border", "Margin", "Padding", "Outline"], answer: 2 },
            { question: "ما هي نتيجة: typeof []؟", options: ["array", "list", "object", "undefined"], answer: 2 },
            { question: "أي كلمة مفتاحية تستخدم لوراثة كلاس في JS؟", options: ["inherits", "extends", "implements", "from"], answer: 1 },
            { question: "ماذا يرمز اختصار JSON؟", options: ["JavaScript Object Notation", "Java Serialized Object Node", "Joint System Online Network", "Just Standard Object Name"], answer: 0 },
            { question: "أي دالة تستخدم لتحويل JSON إلى Object؟", options: ["JSON.parse()", "JSON.stringify()", "JSON.toObject()", "JSON.convert()"], answer: 0 },
            { question: "ما هي الوحدة التي تسمى: Viewport Width؟", options: ["vpw", "vw", "%", "px"], answer: 1 },
            { question: "أي كلمة مفتاحية تستخدم للانتظار داخل دالة async؟", options: ["wait", "delay", "await", "hold"], answer: 2 }
        ]
    ],
    general: [
        // LEVEL 1
        [
            { question: "ما هو أطول نهر في العالم؟", options: ["النيل", "الأمازون", "اليانغتسي", "المسيسيبي"], answer: 0 },
            { question: "كم عدد قارات العالم؟", options: ["5", "6", "7", "8"], answer: 2 },
            { question: "ما هي عاصمة اليابان؟", options: ["أوساكا", "طوكيو", "كيوتو", "ناغويا"], answer: 1 },
            { question: "ما هو أكبر كوكب في المجموعة الشمسية؟", options: ["زحل", "الأرض", "المشتري", "نبتون"], answer: 2 },
            { question: "من رسم لوحة الموناليزا؟", options: ["بيكاسو", "ليوناردو دافنشي", "فان جوخ", "مايكل أنجلو"], answer: 1 },
            { question: "ما هو العنصر الكيميائي الذي رمزه O؟", options: ["الذهب", "الأكسجين", "الحديد", "الأوزون"], answer: 1 },
            { question: "كم عدد أيام السنة الكبيسة؟", options: ["364", "365", "366", "367"], answer: 2 },
            { question: "ما هي أكبر دولة في العالم من حيث المساحة؟", options: ["كندا", "الصين", "روسيا", "أمريكا"], answer: 2 },
            { question: "ما هو الحيوان الذي يُلقب بسفينة الصحراء؟", options: ["الحصان", "الجمل", "الفيل", "الحمار"], answer: 1 },
            { question: "كم لوناً في قوس قزح؟", options: ["5", "6", "7", "8"], answer: 2 }
        ],
        // LEVEL 2
        [
            { question: "في أي عام بدأت الحرب العالمية الثانية؟", options: ["1914", "1939", "1945", "1929"], answer: 1 },
            { question: "ما هو أصغر كوكب في المجموعة الشمسية؟", options: ["المريخ", "عطارد", "الزهرة", "بلوتو"], answer: 1 },
            { question: "ما هي عملة المملكة المتحدة؟", options: ["اليورو", "الدولار", "الجنيه الإسترليني", "الفرنك"], answer: 2 },
            { question: "من هو مخترع المصباح الكهربائي؟", options: ["نيوتن", "أديسون", "أينشتاين", "تسلا"], answer: 1 },
            { question: "ما هو أكبر محيط في العالم؟", options: ["الأطلسي", "الهندي", "الهادئ", "المتجمد الشمالي"], answer: 2 },
            { question: "كم عدد عظام جسم الإنسان البالغ؟", options: ["196", "206", "216", "300"], answer: 1 },
            { question: "ما هي اللغة الأكثر تحدثاً في العالم؟", options: ["الإنجليزية", "الإسبانية", "الصينية (الماندرين)", "العربية"], answer: 2 },
            { question: "في أي قارة تقع مصر؟", options: ["آسيا", "أفريقيا", "أوروبا", "أستراليا"], answer: 1 },
            { question: "ما هو الكوكب الأحمر؟", options: ["الزهرة", "المريخ", "المشتري", "زحل"], answer: 1 },
            { question: "ما هي أعلى قمة جبلية في العالم؟", options: ["كي 2", "إيفرست", "كليمنجارو", "مونت بلان"], answer: 1 }
        ],
        // LEVEL 3
        [
            { question: "من كتب رواية 'البؤساء'؟", options: ["فيكتور هوغو", "تشارلز ديكنز", "تولستوي", "همنغواي"], answer: 0 },
            { question: "ما هو الغاز الأكثر وفرة في الغلاف الجوي للأرض؟", options: ["الأكسجين", "ثاني أكسيد الكربون", "النيتروجين", "الهيدروجين"], answer: 2 },
            { question: "في أي عام هبط الإنسان على القمر لأول مرة؟", options: ["1965", "1969", "1972", "1959"], answer: 1 },
            { question: "ما هي عاصمة أستراليا؟", options: ["سيدني", "ملبورن", "كانبيرا", "بيرث"], answer: 2 },
            { question: "كم عدد أوتار جسم القلب (حجراته)؟", options: ["2", "3", "4", "5"], answer: 2 },
            { question: "من هو مؤسس شركة مايكروسوفت؟", options: ["ستيف جوبز", "بيل غيتس", "مارك زوكربيرغ", "إيلون ماسك"], answer: 1 },
            { question: "ما هو المعدن السائل في درجة حرارة الغرفة؟", options: ["الرصاص", "الزئبق", "الألمنيوم", "الفضة"], answer: 1 },
            { question: "أي حضارة بنت الأهرامات؟", options: ["الرومانية", "اليونانية", "المصرية القديمة", "البابلية"], answer: 2 },
            { question: "ما هي سرعة الضوء تقريباً؟", options: ["300 ألف كم/ث", "150 ألف كم/ث", "1000 كم/ث", "30 ألف كم/ث"], answer: 0 },
            { question: "ما هو أكبر عضو في جسم الإنسان؟", options: ["الكبد", "الجلد", "الرئة", "الدماغ"], answer: 1 }
        ]
    ]
};

// State Variables
let currentCategory = '';
let currentLevel = 0;
let currentQuestionIndex = 0;
let score = 0;
let timeLeft = 15;
let timerInterval;
let canAnswer = true;
let currentQuestions = []; // shuffled questions for the active level

const PASS_THRESHOLD = 7; // out of 10 to advance
const QUESTION_TIME = 15;

// DOM Elements
const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const nextBtn = document.getElementById('next-btn');
const restartBtn = document.getElementById('restart-btn');

const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const timerDisplay = document.getElementById('time-left');
const progressBar = document.getElementById('progress-bar');
const currentQDisplay = document.getElementById('current-q');
const totalQDisplay = document.getElementById('total-q');
const finalScoreDisplay = document.getElementById('final-score');
const maxScoreDisplay = document.getElementById('max-score');
const resultMessage = document.getElementById('result-message');

// ── Progress persistence (localStorage) ──
function progressKey(cat) { return `quiz_progress_${cat}`; }
function bestScoreKey(cat) { return `quiz_best_${cat}`; }
const SOUND_KEY = 'quiz_sound_enabled';

function getUnlockedLevel(cat) {
    const v = parseInt(localStorage.getItem(progressKey(cat)), 10);
    return Number.isFinite(v) && v >= 0 ? v : 0;
}

function unlockLevel(cat, level) {
    if (level > getUnlockedLevel(cat)) {
        localStorage.setItem(progressKey(cat), String(level));
    }
}

function getBestScore(cat) {
    const v = parseInt(localStorage.getItem(bestScoreKey(cat)), 10);
    return Number.isFinite(v) ? v : 0;
}

function saveBestScore(cat, value) {
    if (value > getBestScore(cat)) {
        localStorage.setItem(bestScoreKey(cat), String(value));
    }
}

function resetProgress() {
    Object.keys(quizDatabase).forEach(cat => {
        localStorage.removeItem(progressKey(cat));
        localStorage.removeItem(bestScoreKey(cat));
    });
}

// ── Sound engine (Web Audio API — no external files, works offline) ──
function isSoundEnabled() {
    return localStorage.getItem(SOUND_KEY) !== 'false'; // default ON
}

function setSoundEnabled(on) {
    localStorage.setItem(SOUND_KEY, on ? 'true' : 'false');
}

let audioCtx = null;
function playSound(type) {
    if (!isSoundEnabled()) return;
    try {
        audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const now = audioCtx.currentTime;
        // tone presets: [frequencies], duration, wave
        const presets = {
            correct: { freqs: [523.25, 783.99], dur: 0.18, wave: 'sine' },   // C5 → G5
            wrong:   { freqs: [196.00, 138.59], dur: 0.30, wave: 'sawtooth' }, // G3 → C#3
            click:   { freqs: [440.00], dur: 0.06, wave: 'triangle' }
        };
        const p = presets[type] || presets.click;
        p.freqs.forEach((f, i) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = p.wave;
            const t = now + i * (p.dur / p.freqs.length);
            osc.frequency.setValueAtTime(f, t);
            gain.gain.setValueAtTime(0.0001, t);
            gain.gain.exponentialRampToValueAtTime(0.2, t + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + p.dur / p.freqs.length);
            osc.connect(gain).connect(audioCtx.destination);
            osc.start(t);
            osc.stop(t + p.dur / p.freqs.length);
        });
    } catch (e) {
        /* audio unavailable — fail silently */
    }
}

// Public API for the UI layer (mobile nav, settings, sound toggle)
window.QuizApp = {
    categories: () => Object.keys(quizDatabase),
    totalLevels: (cat) => (quizDatabase[cat] ? quizDatabase[cat].length : 0),
    getUnlockedLevel,
    getBestScore,
    resetProgress,
    isSoundEnabled,
    setSoundEnabled,
    playSound
};

// Fisher–Yates shuffle that keeps the correct answer index in sync
function shuffleQuestion(q) {
    const indices = q.options.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return {
        question: q.question,
        options: indices.map(i => q.options[i]),
        answer: indices.indexOf(q.answer)
    };
}

// Global Function for selection
window.selectCategory = function (category) {
    if (!quizDatabase[category]) return;
    currentCategory = category;
    currentLevel = 0;
    startQuiz();
};

// Event Listeners
nextBtn.addEventListener('click', () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < currentQuestions.length) {
        showQuestion();
    } else {
        showLevelComplete();
    }
});

restartBtn.addEventListener('click', () => {
    startQuiz();
});

// Functions
function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;

    // Build a shuffled copy of the current level's questions
    const levelQuestions = quizDatabase[currentCategory][currentLevel] || [];
    currentQuestions = levelQuestions.map(shuffleQuestion);

    startScreen.classList.remove('active');
    resultScreen.classList.remove('active');
    quizScreen.classList.add('active');

    totalQDisplay.textContent = currentQuestions.length;
    showQuestion();
}

function showQuestion() {
    canAnswer = true;
    timeLeft = QUESTION_TIME;
    nextBtn.disabled = true;
    timerDisplay.textContent = timeLeft;

    const q = currentQuestions[currentQuestionIndex];

    questionText.textContent = q.question;
    currentQDisplay.textContent = currentQuestionIndex + 1;

    const progress = ((currentQuestionIndex + 1) / currentQuestions.length) * 100;
    progressBar.style.width = `${progress}%`;

    optionsContainer.innerHTML = '';
    q.options.forEach((option, index) => {
        const div = document.createElement('div');
        div.className = 'option';
        div.innerHTML = `<span>${option}</span><i class="far fa-circle"></i>`;
        div.addEventListener('click', () => selectOption(index, div));
        optionsContainer.appendChild(div);
    });

    startTimer();
}

function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            autoHandleTimeout();
        }
    }, 1000);
}

function selectOption(index, element) {
    if (!canAnswer) return;

    clearInterval(timerInterval);
    canAnswer = false;
    const correctIndex = currentQuestions[currentQuestionIndex].answer;

    if (index === correctIndex) {
        score++;
        element.classList.add('correct');
        element.querySelector('i').className = 'fas fa-check-circle';
        playSound('correct');
    } else {
        element.classList.add('wrong');
        element.querySelector('i').className = 'fas fa-times-circle';
        optionsContainer.children[correctIndex].classList.add('correct');
        optionsContainer.children[correctIndex].querySelector('i').className = 'fas fa-check-circle';
        playSound('wrong');
    }

    Array.from(optionsContainer.children).forEach(opt => opt.classList.add('disabled'));
    nextBtn.disabled = false;
}

function autoHandleTimeout() {
    canAnswer = false;
    playSound('wrong');
    const correctIndex = currentQuestions[currentQuestionIndex].answer;
    optionsContainer.children[correctIndex].classList.add('correct');
    optionsContainer.children[correctIndex].querySelector('i').className = 'fas fa-check-circle';
    Array.from(optionsContainer.children).forEach(opt => opt.classList.add('disabled'));
    nextBtn.disabled = false;
}

async function showLevelComplete() {
    clearInterval(timerInterval);
    quizScreen.classList.remove('active');
    resultScreen.classList.add('active');
    finalScoreDisplay.textContent = score;
    maxScoreDisplay.textContent = `/ ${currentQuestions.length}`;
    saveBestScore(currentCategory, score);

    // Save to Leaderboard (Simple Prompter for name)
    if (score >= 5) {
        const playerName = prompt("رائع! ادخل اسمك للوحة المتصدرين:") || "لاعب مجهول";
        saveHighScore(playerName, score, currentCategory, currentLevel + 1);
    }

    const totalLevels = quizDatabase[currentCategory].length;
    const isLastLevel = currentLevel + 1 >= totalLevels;

    if (score >= PASS_THRESHOLD) {
        // Unlock the next level for this category
        unlockLevel(currentCategory, currentLevel + 1);

        if (isLastLevel) {
            resultMessage.innerHTML = `🏆 مذهل! لقد أكملت <b>جميع المستويات المتوفرة</b> في هذا التصنيف!`;
            restartBtn.textContent = "العودة للرئيسية";
            restartBtn.onclick = () => window.location.reload();
        } else {
            resultMessage.innerHTML = `مستوى رائع! لقد أكملت <b>المستوى ${currentLevel + 1}</b> بنجاح. هل أنت جاهز للمستوى التالي؟`;
            restartBtn.textContent = "المستوى التالي";
            restartBtn.onclick = () => {
                currentLevel++;
                startQuiz();
            };
        }
    } else {
        resultMessage.innerHTML = `نقاطك غير كافية للمرور (تحتاج ${PASS_THRESHOLD}/${currentQuestions.length}). حاول مرة أخرى!`;
        restartBtn.textContent = "إعادة المحاولة";
        restartBtn.onclick = () => startQuiz();
    }
}

async function saveHighScore(name, score, cat, lvl) {
    try {
        if (typeof supabaseClient !== 'undefined') {
            await supabaseClient.from('quiz_leaderboard').insert([
                { player_name: name, score: score, category: cat, level: lvl }
            ]);
            console.log("Score saved to Supabase");
        }
    } catch (e) {
        console.warn("Failed to save score:", e);
    }
}
