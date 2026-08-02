/* ============================================
   RashidClaw - مساعد الذكاء الاصطناعي
   ============================================ */

// تحميل المفاتيح من config.js
const API_KEYS = typeof API_KEYS !== 'undefined' ? API_KEYS : {
    gemini: 'YOUR_GEMINI_API_KEY_HERE',
    openRouter: 'YOUR_OPENROUTER_API_KEY_HERE',
    pexels: 'YOUR_PEXELS_API_KEY_HERE',
    supabase: {
        url: 'YOUR_SUPABASE_URL_HERE',
        key: 'YOUR_SUPABASE_KEY_HERE'
    }
};

const GEMINI_API_KEY = API_KEYS.gemini;
const OPENROUTER_API_KEY = API_KEYS.openRouter;
const PEXELS_API_KEY = API_KEYS.pexels;
const SUPABASE_URL = API_KEYS.supabase.url;
const SUPABASE_KEY = API_KEYS.supabase.key;

// Get API key from localStorage or use the default
function getGeminiAPIKey() {
    return localStorage.getItem('gemini_api_key') || GEMINI_API_KEY;
}

// Validate API key
function hasValidAPIKey() {
    return getGeminiAPIKey() && getGeminiAPIKey().trim() !== '';
}

/* ============================================
   Utility Functions
   ============================================ */

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showError(elementId, message) {
    const errorEl = document.getElementById(elementId);
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.add('visible');
        // إخفاء الرسالة بعد 5 ثوانٍ
        setTimeout(() => {
            errorEl.classList.remove('visible');
        }, 5000);
    }
}

function hideError(elementId) {
    const errorEl = document.getElementById(elementId);
    if (errorEl) {
        errorEl.classList.remove('visible');
    }
}

// دالة عامة لعرض رسائل خطأ قابلة للإغلاق
function showTemporaryMessage(message, type = 'error', duration = 3000) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message-${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-size: 14px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        background: ${type === 'error' ? 'var(--accent-red)' : type === 'success' ? 'var(--accent-green)' : 'var(--accent-orange)'};
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            messageDiv.remove();
        }, 300);
    }, duration);
}

// إضافة أنيميشن للرسائل
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

function showLoading(loadingId) {
    const loading = document.getElementById(loadingId);
    if (loading) {
        loading.style.display = 'block';
    }
}

function hideLoading(loadingId) {
    const loading = document.getElementById(loadingId);
    if (loading) {
        loading.style.display = 'none';
    }
}

/* ============================================
    Navigation
    ============================================ */

function initNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.section');
    const sidebar = document.getElementById('sidebar');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const page = btn.dataset.page;
            
            navButtons.forEach(nav => nav.classList.remove('active'));
            btn.classList.add('active');
            
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === `${page}-page`) {
                    section.classList.add('active');
                }
            });
            
            // Close mobile menu if open
            if (window.innerWidth <= 900 && sidebar) {
                sidebar.classList.remove('open');
            }
        });
    });

    // Mobile menu toggle
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }
}

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    const sidebar = document.getElementById('sidebar');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    if (window.innerWidth <= 900 && sidebar && mobileMenuBtn &&
        !sidebar.contains(e.target) && 
        !mobileMenuBtn.contains(e.target) &&
        sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
    }
});


let recognition = null;
let isListening = false;

function toggleSpeechToText() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        showTemporaryMessage('عذراً، متصفحك لا يدعم التعرف على الكلام!', 'error');
        return;
    }

    if (isListening) {
        if (recognition) recognition.stop();
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = 'ar-SA';
    recognition.interimResults = true;
    recognition.continuous = true;

    const micBtn = document.getElementById('micBtn');
    if (micBtn) {
        micBtn.style.background = 'var(--accent-green)';
        micBtn.innerHTML = '<i class="fas fa-microphone"></i>';
    }

    recognition.onstart = function() {
        isListening = true;
        if (micBtn) {
            micBtn.style.background = 'var(--accent-green)';
            micBtn.innerHTML = '<i class="fas fa-microphone"></i> جاري الاستماع...';
        }
    };

    recognition.onresult = function(event) {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
                transcript += event.results[i][0].transcript;
            }
        }
        const chatInput = document.getElementById('chatInput');
        if (transcript && chatInput) {
            chatInput.value = transcript;
        }
    };

    recognition.onerror = function(event) {
        console.error('Speech recognition error:', event.error);
        stopListening();
        showTemporaryMessage('حدث خطأ في التعرف على الكلام: ' + event.error, 'error');
    };

    recognition.onend = function() {
        stopListening();
    };

    recognition.start();
}

function stopListening() {
    isListening = false;
    const micBtn = document.getElementById('micBtn');
    if (micBtn) {
        micBtn.style.background = 'linear-gradient(135deg,#ef4444,#dc2626)';
        micBtn.innerHTML = '<i class="fas fa-microphone"></i>';
    }
}

// Ensure toggleSpeechToText is globally accessible
window.toggleSpeechToText = toggleSpeechToText;

/* ============================================
    Chat Helper (Gemini API)
    Get your free API key from: https://aistudio.google.com/app/apikey
    ============================================ */

const questionInput = document.getElementById('chatInput');
const sendQuestionBtn = document.getElementById('sendBtn');
const chatMessages = document.getElementById('chatMessages');

async function sendQuestion() {
    const question = questionInput.value.trim();
    if (!question) return;
    
    hideError('chatError');
    
    addMessage(question, 'user');
    questionInput.value = '';
    sendQuestionBtn.disabled = true;
    
    addLoadingMessage();
    
    try {
        // Check if we have a valid API key
        if (!hasValidAPIKey()) {
            throw new Error('لم يتم إعداد مفتاح API. الرجاء إضافة مفتاح Gemini في الكود.');
        }
        
        const apiKey = getGeminiAPIKey();
        const prompt = `أنت مساعد RashidClaw ذكي ومتعدد المهارات. أجب على السؤال التالي بإجابة مفصلة ودقيقة باللغة العربية:\n\nالسؤال: ${question}`;
        
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        maxOutputTokens: 1000,
                        temperature: 0.7
                    }
                })
            }
        );
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `فشل الاتصال: ${response.status}`);
        }
        
        const data = await response.json();
        const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || 'عذراً، لم أستطع توليد إجابة.';
        
        removeLoadingMessage();
        addMessage(answer, 'bot');
        
    } catch (error) {
        removeLoadingMessage();
        let errorMessage = 'حدث خطأ غير معروف';
        
        if (error.message.includes('API')) {
            errorMessage = '⚠️ خطأ في إعداد API: ' + error.message;
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
            errorMessage = '🌐 فشل في الاتصال بالإنترنت. يرجى التحقق من اتصالك.';
        } else if (error.message.includes('مفتاح API')) {
            errorMessage = '🔑 ' + error.message;
        } else {
            errorMessage = '❌ عذراً، حدث خطأ أثناء معالجة سؤالك: ' + error.message;
        }
        
        addMessage(errorMessage, 'bot', true);
    } finally {
        sendQuestionBtn.disabled = false;
    }
}

function addMessage(text, sender, isError = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const iconClass = sender === 'bot' ? 'fa-robot' : 'fa-user';
    const icon = sender === 'bot' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';
    
    messageDiv.innerHTML = `
        <div class="message-icon">${icon}</div>
        <div class="message-content">
            <p style="${isError ? 'color: #ef4444;' : ''}">${escapeHtml(text)}</p>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addLoadingMessage() {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message bot loading-message';
    loadingDiv.id = 'loadingMessage';
    loadingDiv.innerHTML = `
        <div class="message-icon"><i class="fas fa-robot"></i></div>
        <div class="message-content">
            <p><i class="fas fa-spinner fa-spin"></i> جاري التفكير...</p>
        </div>
    `;
    chatMessages.appendChild(loadingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeLoadingMessage() {
    const loadingMsg = document.getElementById('loadingMessage');
    if (loadingMsg) {
        loadingMsg.remove();
    }
}

sendQuestionBtn.addEventListener('click', sendQuestion);
questionInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendQuestion();
    }
});

/* ============================================
    Image Generation (Pollinations.ai)
    ============================================ */

const imagePrompt = document.getElementById('imagePrompt');
const generateBtn = document.getElementById('generateBtn');
const imageResult = document.getElementById('imageResult');

// حفظ الصور في localStorage
let generatedImages = JSON.parse(localStorage.getItem('rashid_images') || '[]');

function saveImageToGallery(imageUrl, prompt) {
    const imageData = {
        url: imageUrl,
        prompt: prompt,
        date: new Date().toLocaleDateString('ar-EG')
    };
    generatedImages.unshift(imageData);
    if (generatedImages.length > 50) generatedImages.pop();
    localStorage.setItem('rashid_images', JSON.stringify(generatedImages));
    showTemporaryMessage('تم حفظ الصورة في المعرض!', 'success');
}

function renderImageGallery() {
    const gallery = document.getElementById('imageGallery');
    if (!gallery || generatedImages.length === 0) return;
    
    gallery.innerHTML = generatedImages.slice(0, 8).map((img, i) => `
        <div style="position:relative;cursor:pointer;" onclick="showImageInResult('${img.url}')">
            <img src="${img.url}" style="width:100%;height:80px;object-fit:cover;border-radius:8px;">
            <div style="position:absolute;bottom:0;left:0;right:0;background:rgba(0,0,0,0.7);padding:4px;font-size:10px;text-align:center;border-radius:0 0 8px 8px;">${img.date}</div>
        </div>
    `).join('');
}

function showImageInResult(url) {
    imageResult.innerHTML = `<div style="text-align:center;"><img src="${url}" alt="Generated Image" style="max-width:100%;max-height:500px;border-radius:16px;box-shadow:0 12px 40px rgba(0,0,0,0.4);"><div style="margin-top:20px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;"><a href="${url}" download="rashid-image-${Date.now()}.png" style="background:var(--gradient-main);color:#fff;padding:12px 24px;border-radius:12px;text-decoration:none;font-weight:600;">💾 تحميل الصورة</a></div></div>`;
}

generateBtn.addEventListener('click', async () => {
    const prompt = imagePrompt.value.trim();
    const style = document.getElementById('imageStyle')?.value || '';
    const size = document.getElementById('imageSize')?.value || '1920:1080';
    
    if (!prompt) {
        showTemporaryMessage('الرجاء إدخال وصف للصورة', 'error');
        return;
    }
    
    const [width, height] = size.split(':');
    const fullPrompt = `${prompt} ${style}`;
    
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التوليد...';
    
    imageResult.innerHTML = '<div style="text-align:center;padding:40px;"><div style="width:60px;height:60px;border:4px solid var(--accent-purple);border-top-color:transparent;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto;"></div><p style="margin-top:20px;color:var(--text-secondary);">🎨 جاري توليد صورتك...</p></div><style>@keyframes spin { to { transform: rotate(360deg); } }</style>';
    
    try {
        const encodedPrompt = encodeURIComponent(fullPrompt);
        
        // استخدام URL مختلف - بدون seed
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=true&seed=${Date.now()}`;
        
        console.log('Generating image:', imageUrl);
        
        // تحقق من الصورة
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = () => reject(new Error('فشل في تحميل الصورة'));
            img.src = imageUrl;
        });
        
        // حفظ في المعرض
        saveImageToGallery(imageUrl, prompt);
        
        // عرض الصورة
        imageResult.innerHTML = `<div style="text-align:center;"><img src="${imageUrl}" alt="Generated Image" style="max-width:100%;max-height:500px;border-radius:16px;box-shadow:0 12px 40px rgba(0,0,0,0.4);"><div style="margin-top:20px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;"><a href="${imageUrl}" download="rashid-image-${Date.now()}.png" style="background:var(--gradient-main);color:#fff;padding:12px 24px;border-radius:12px;text-decoration:none;font-weight:600;">💾 تحميل الصورة</a><button onclick="navigator.clipboard.writeText('${imageUrl}').then(()=>showTemporaryMessage('تم نسخ الرابط!','success'))" style="background:var(--bg-tertiary);color:var(--text-primary);padding:12px 24px;border-radius:12px;border:1px solid var(--border-subtle);cursor:pointer;">📋 نسخ الرابط</button></div></div>`;
        
        // تحديث المعرض
        renderImageGallery();
        
        showTemporaryMessage('تم توليد الصورة بنجاح!', 'success');
        
    } catch (error) {
        console.error('Image generation error:', error);
        imageResult.innerHTML = `<div style="text-align:center;padding:30px;"><p style="color:var(--accent-red);font-size:18px;margin-bottom:15px;">❌ فشل توليد الصورة</p><p style="color:var(--text-muted);">حاول مرة أخرى أو غير الوصف</p><p style="color:var(--text-muted);font-size:12px;margin-top:10px;">${error.message}</p></div>`;
        showTemporaryMessage('فشل توليد الصورة', 'error');
    } finally {
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="fas fa-magic"></i> 🎨 توليد الصورة';
    }
});

// تحميل معرض الصور عند البدء
renderImageGallery();

/* ============================================
   Video Generation
   ============================================ */

const videoProgress = document.getElementById('videoProgress');
const videoComingSoon = document.getElementById('videoComingSoon');
const progressPercent = document.getElementById('progressPercent');
const progressSteps = document.querySelectorAll('.step');

let progressValue = 0;
let progressInterval;
let currentStep = 0;

function runProgressAnimation() {
    progressValue = 0;
    currentStep = 0;
    
    progressSteps.forEach((step, index) => {
        step.classList.remove('active');
    });
    
    videoProgress.style.display = 'flex';
    videoComingSoon.classList.remove('visible');
    
    progressInterval = setInterval(() => {
        progressValue += 2;
        progressPercent.textContent = `${progressValue}%`;
        
        const circle = document.querySelector('.progress-bar');
        const circumference = 283;
        const offset = circumference - (progressValue / 100) * circumference;
        circle.style.strokeDashoffset = offset;
        
        if (progressValue >= (currentStep + 1) * 33) {
            if (currentStep < progressSteps.length) {
                progressSteps[currentStep].classList.add('active');
                currentStep++;
            }
        }
        
        if (progressValue >= 100) {
            clearInterval(progressInterval);
            setTimeout(() => {
                videoProgress.style.display = 'none';
                videoComingSoon.classList.add('visible');
            }, 500);
        }
    }, 80);
}

runProgressAnimation();

document.querySelector('[data-section="video"]').addEventListener('click', () => {
    setTimeout(() => {
        if (!videoComingSoon.classList.contains('visible')) {
            runProgressAnimation();
        }
    }, 500);
});

/* ============================================
   Charts (Chart.js)
   ============================================ */

const chartType = document.getElementById('chartType');
const chartData = document.getElementById('chartData');
const chartTitle = document.getElementById('chartTitle');
const createChartBtn = document.getElementById('createChartBtn');
const chartError = document.getElementById('chartError');
let myChart = null;

function parseChartData(dataText) {
    const lines = dataText.trim().split('\n').filter(line => line.trim());
    const labels = [];
    const values = [];
    
    for (const line of lines) {
        const parts = line.split(':');
        if (parts.length >= 2) {
            const label = parts[0].trim();
            const value = parseFloat(parts[1].trim());
            
            if (label && !isNaN(value)) {
                labels.push(label);
                values.push(value);
            }
        }
    }
    
    return { labels, values };
}

function createChart() {
    const type = chartType.value;
    const dataText = chartData.value.trim();
    const title = chartTitle.value.trim() || 'الرسم البياني';
    
    if (!dataText) {
        showError('chartError', 'الرجاء إدخال بيانات الرسم البياني');
        return;
    }
    
    hideError('chartError');
    
    const { labels, values } = parseChartData(dataText);
    
    if (labels.length === 0 || values.length === 0) {
        showError('chartError', 'تنسيق البيانات غير صحيح. استخدم التنسيق: اسم:قيمة');
        return;
    }
    
    const ctx = document.getElementById('myChart').getContext('2d');
    
    if (myChart) {
        myChart.destroy();
    }
    
    const colors = [
        'rgba(99, 102, 241, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(34, 197, 94, 0.8)'
    ];
    
    const borderColors = colors.map(c => c.replace('0.8', '1'));
    
    const chartConfig = {
        type: type,
        data: {
            labels: labels,
            datasets: [{
                label: title,
                data: values,
                backgroundColor: type === 'pie' ? colors : colors[0],
                borderColor: type === 'pie' ? borderColors : borderColors[0],
                borderWidth: 2,
                fill: type === 'line',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#f1f5f9',
                        font: {
                            family: 'Cairo',
                            size: 12
                        }
                    }
                },
                title: {
                    display: true,
                    text: title,
                    color: '#f1f5f9',
                    font: {
                        family: 'Cairo',
                        size: 16,
                        weight: 'bold'
                    }
                }
            },
            scales: type !== 'pie' ? {
                x: {
                    ticks: {
                        color: '#94a3b8',
                        font: {
                            family: 'Cairo'
                        }
                    },
                    grid: {
                        color: 'rgba(45, 45, 58, 0.5)'
                    }
                },
                y: {
                    ticks: {
                        color: '#94a3b8',
                        font: {
                            family: 'Cairo'
                        }
                    },
                    grid: {
                        color: 'rgba(45, 45, 58, 0.5)'
                    }
                }
            } : {}
        }
    };
    
    myChart = new Chart(ctx, chartConfig);
}

createChartBtn.addEventListener('click', createChart);

// Allow Enter key to create chart
chartData.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
        createChart();
    }
});

// Validate chart data on input
chartData.addEventListener('input', () => {
    const data = chartData.value.trim();
    if (data && data.includes(':')) {
        hideError('chartError');
    }
});

// Create sample data for demonstration
function createSampleData() {
    const sampleData = [
        { label: 'يناير', value: 65 },
        { label: 'فبراير', value: 45 },
        { label: 'مارس', value: 80 },
        { label: 'أبريل', value: 55 },
        { label: 'مايو', value: 70 }
    ];
    
    chartData.value = sampleData.map(item => `${item.label}:${item.value}`).join('\n');
    chartTitle.value = 'مبيعات الشهرية';
}

/* ============================================
    Text to Speech (Web Speech API)
    ============================================ */

let voices = [];
let currentUtterance = null;
let isPaused = false;

function initTTS() {
    const ttsText = document.getElementById('ttsText');
    const voiceSelect = document.getElementById('voiceSelect');
    const speedSelect = document.getElementById('speedSelect');
    const pitchSelect = document.getElementById('pitchSelect');
    const playBtn = document.getElementById('playBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const stopBtn = document.getElementById('stopBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    
    if (!voiceSelect) return; // Not on TTS page
    
    // Update speed display
    if (speedSelect) {
        speedSelect.addEventListener('input', () => {
            const speedVal = document.getElementById('speedVal');
            if (speedVal) speedVal.textContent = speedSelect.value;
        });
    }
    
    // Update pitch display
    if (pitchSelect) {
        pitchSelect.addEventListener('input', () => {
            const pitchVal = document.getElementById('pitchVal');
            if (pitchVal) pitchVal.textContent = pitchSelect.value;
        });
    }
    
    function loadBrowserVoices() {
        voices = speechSynthesis.getVoices();
        
        if (!voiceSelect) return;
        
        voiceSelect.innerHTML = '';
        
        const arabicVoices = voices.filter(v => v.lang.startsWith('ar'));
        const englishVoices = voices.filter(v => v.lang.startsWith('en'));
        const otherVoices = voices.filter(v => !v.lang.startsWith('ar') && !v.lang.startsWith('en'));
        
        function addVoiceGroup(label, voiceList) {
            if (voiceList.length > 0) {
                const groupLabel = document.createElement('option');
                groupLabel.textContent = label;
                groupLabel.disabled = true;
                voiceSelect.appendChild(groupLabel);
                
                voiceList.forEach((voice, index) => {
                    const option = document.createElement('option');
                    option.value = index;
                    option.textContent = `${voice.name} (${voice.lang}) ${voice.default ? '⭐' : ''}`;
                    voiceSelect.appendChild(option);
                });
            }
        }
        
        addVoiceGroup('─ الأصوات العربية ─', arabicVoices);
        addVoiceGroup('─ English Voices ─', englishVoices);
        addVoiceGroup('─ Other Languages ─', otherVoices);
        
        if (voiceSelect.options.length === 0) {
            const option = document.createElement('option');
            option.textContent = 'لا توجد أصوات متاحة';
            voiceSelect.appendChild(option);
        }
        
        // Auto-select first Arabic voice if available
        if (arabicVoices.length > 0) {
            voiceSelect.selectedIndex = 1;
        }
        
        console.log(`تم تحميل ${voices.length} صوت`);
    }
    
    if ('speechSynthesis' in window) {
        loadBrowserVoices();
        
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = loadBrowserVoices;
        }
        
        if (playBtn) {
            playBtn.addEventListener('click', () => {
                const text = ttsText?.value?.trim();
                if (!text) return;
                
                if (isPaused && currentUtterance) {
                    speechSynthesis.resume();
                    isPaused = false;
                    return;
                }
                
                speechSynthesis.cancel();
                
                currentUtterance = new SpeechSynthesisUtterance(text);
                
                const selectedVoiceIndex = parseInt(voiceSelect?.value);
                if (selectedVoiceIndex >= 0 && voices[selectedVoiceIndex]) {
                    currentUtterance.voice = voices[selectedVoiceIndex];
                }
                
                currentUtterance.rate = parseFloat(speedSelect?.value) || 1;
                currentUtterance.pitch = parseFloat(pitchSelect?.value) || 1;
                
                speechSynthesis.speak(currentUtterance);
                isPaused = false;
            });
        }
        
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                if (speechSynthesis.speaking && !isPaused) {
                    speechSynthesis.pause();
                    isPaused = true;
                }
            });
        }
        
        if (stopBtn) {
            stopBtn.addEventListener('click', () => {
                speechSynthesis.cancel();
                isPaused = false;
            });
        }
        
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                const text = ttsText?.value?.trim();
                if (!text) return;
                
                const blob = new Blob([text], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `tts-text-${Date.now()}.txt`;
                a.click();
                URL.revokeObjectURL(url);
            });
        }
    }
}

// Export loadVoices for HTML button
function loadVoices() {
    initTTS();
}

function updateStatus(status) {
    const ttsStatus = document.getElementById('ttsStatus');
    if (ttsStatus) ttsStatus.textContent = status;
}

function showTtsError(message) {
    const ttsError = document.getElementById('ttsError');
    if (ttsError) {
        ttsError.textContent = message;
        ttsError.classList.add('visible');
    }
}

function hideTtsError() {
    const ttsError = document.getElementById('ttsError');
    if (ttsError) ttsError.classList.remove('visible');
}

/* ============================================
    Theme & UI Functions
    ============================================ */

function toggleTheme() {
    document.body.classList.toggle('light');
    const themeIcon = document.querySelector('.theme-toggle i');
    if (document.body.classList.contains('light')) {
        themeIcon.className = 'fas fa-sun';
    } else {
        themeIcon.className = 'fas fa-moon';
    }
}

function toggleMenu() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.toggle('open');
}

function copyPrompt(prompt, event) {
    navigator.clipboard.writeText(prompt).then(() => {
        if (event && event.target) {
            const clickedElement = event.target;
            const originalText = clickedElement.textContent;
            clickedElement.textContent = '✓ النسخ!';
            clickedElement.style.background = 'var(--accent-green)';
            setTimeout(() => {
                clickedElement.textContent = originalText;
                clickedElement.style.background = '';
            }, 1000);
        }
        showTemporaryMessage('تم النسخ!', 'success');
    }).catch(err => {
        console.error('Failed to copy: ', err);
        showTemporaryMessage('فشل النسخ', 'error');
    });
}

/* ============================================
    Feature Functions
    ============================================ */

async function generateVideo() {
    const prompt = document.getElementById('videoPrompt').value.trim();
    if (!prompt) return;
    
    const videoResult = document.getElementById('videoResult');
    videoResult.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p>جاري توليد الفيديو...</p>
        </div>
    `;
    
    try {
        // استخدام خدمة توليد الفيديو (مثل Runway أو Pika)
        // مؤقتاً: إضافة فيديو عشوائي كعرض توضيحي
        setTimeout(() => {
            videoResult.innerHTML = `
                <div style="text-align:center;">
                    <video controls width="100%" height="300" style="border-radius:12px;">
                        <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4">
                        متصفحك لا يدعم الفيديو.
                    </video>
                    <p style="margin-top:10px;color:var(--text-secondary);font-size:14px;">
                        ⚠️ هذا فيديو تجريبي - قم بإضافة مفتاح API لتوليد فيديو حقيقي
                    </p>
                </div>
            `;
        }, 2000);
        
    } catch (error) {
        videoResult.innerHTML = '<p style="color:var(--accent-red);">حدث خطأ أثناء توليد الفيديو</p>';
    }
}

function summarizeText() {
    const text = document.getElementById('summarizeText').value.trim();
    const length = document.getElementById('summarizeLength').value;
    const result = document.getElementById('summarizeResult');
    
    if (!text) {
        result.innerHTML = '<p style="color:var(--accent-red);">الرجاء إدخال النص المراد تلخيصه</p>';
        return;
    }
    
    result.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>جاري تلخيص النص...</p></div>';
    
    setTimeout(() => {
        // تلخيص بسيط للمحتوى
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        let summary = '';
        
        switch(length) {
            case 'short':
                summary = sentences[0] + '.';
                break;
            case 'medium':
                summary = sentences.slice(0, Math.min(3, sentences.length)).join('. ') + '.';
                break;
            case 'long':
                summary = sentences.slice(0, Math.min(5, sentences.length)).join('. ') + '.';
                break;
        }
        
        result.innerHTML = `
            <div style="background:var(--bg-tertiary);padding:15px;border-radius:12px;">
                <p style="color:var(--text-primary);white-space:pre-wrap;">${summary}</p>
            </div>
        `;
    }, 1500);
}

/* ============================================
    Initialize
    ============================================ */

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log('RashidClaw initialized successfully!');
    
    // Initialize Navigation
    initNavigation();
    
    // Initialize TTS
    initTTS();
    
    // Set initial active section
    const sections = document.querySelectorAll('.section');
    const activeNav = document.querySelector('.nav-btn.active');
    if (activeNav) {
        const page = activeNav.dataset.page;
        sections.forEach(section => {
            section.classList.remove('active');
            if (section.id === `${page}-page`) {
                section.classList.add('active');
            }
        });
    }
    
    // Initialize theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light');
        document.querySelector('.theme-toggle i').className = 'fas fa-sun';
    }
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + K for search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            if (document.getElementById('chatInput')) {
                document.getElementById('chatInput').focus();
            }
        }
        
        // Escape to close mobile menu
        if (e.key === 'Escape') {
            const sidebar = document.getElementById('sidebar');
            if (sidebar) sidebar.classList.remove('open');
        }
    });
    
    // Add smooth scrolling for internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    // Add loading state for all buttons
    document.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', function() {
            if (!this.disabled) {
                const originalText = this.innerHTML;
                this.disabled = true;
                this.innerHTML = `<i class="fas fa-spinner fa-spin"></i> جاري المعالجة...`;
                
                // Re-enable after 2 seconds if no response
                setTimeout(() => {
                    this.disabled = false;
                    this.innerHTML = originalText;
                }, 2000);
            }
        });
    });
});

// Save user preferences and data
function saveUserData() {
    const speedSelect = document.getElementById('speedSelect');
    const pitchSelect = document.getElementById('pitchSelect');
    const voiceSelect = document.getElementById('voiceSelect');
    
    const userData = {
        theme: document.body.classList.contains('light') ? 'light' : 'dark',
        lastUsed: new Date().toISOString(),
        preferences: {
            ttsSpeed: speedSelect?.value || 1,
            ttsPitch: pitchSelect?.value || 1,
            defaultVoice: voiceSelect?.value || '',
            chatHistory: [],
            savedPrompts: []
        }
    };
    
    localStorage.setItem('rashidclaw_user_data', JSON.stringify(userData));
}

// Load user data
function loadUserData() {
    const savedData = localStorage.getItem('rashidclaw_user_data');
    if (savedData) {
        try {
            const userData = JSON.parse(savedData);
            
            // Restore theme
            if (userData.theme === 'light') {
                document.body.classList.add('light');
                document.querySelector('.theme-toggle i').className = 'fas fa-sun';
            }
            
            const speedSelect = document.getElementById('speedSelect');
            const pitchSelect = document.getElementById('pitchSelect');
            const voiceSelect = document.getElementById('voiceSelect');
            
            // Restore TTS preferences
            if (userData.preferences.ttsSpeed && speedSelect) {
                speedSelect.value = userData.preferences.ttsSpeed;
                const speedVal = document.getElementById('speedVal');
                if (speedVal) speedVal.textContent = userData.preferences.ttsSpeed;
            }
            
            if (userData.preferences.ttsPitch && pitchSelect) {
                pitchSelect.value = userData.preferences.ttsPitch;
                const pitchVal = document.getElementById('pitchVal');
                if (pitchVal) pitchVal.textContent = userData.preferences.ttsPitch;
            }
            
            if (userData.preferences.defaultVoice && voiceSelect) {
                voiceSelect.value = userData.preferences.defaultVoice;
            }
            
            showTemporaryMessage('تم استرجاع إعداداتك', 'success', 2000);
            
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }
}

// Save theme preference and user data
window.addEventListener('beforeunload', () => {
    saveUserData();
});

// Auto-save user data periodically
setInterval(saveUserData, 30000); // Save every 30 seconds

// Initialize user data on load
document.addEventListener('DOMContentLoaded', () => {
    loadUserData();
});

// Add utility functions
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

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/* ============================================
    Translation Functions
    ============================================ */

async function translateText() {
    const fromText = document.getElementById('fromText').value.trim();
    const fromLang = document.getElementById('fromLang').value;
    const toLang = document.getElementById('toLang').value;
    
    if (!fromText) {
        showTemporaryMessage('الرجاء إدخال النص للترجمة', 'error');
        return;
    }
    
    const resultContainer = document.getElementById('translateResult') || document.createElement('div');
    resultContainer.id = 'translateResult';
    resultContainer.style.cssText = `
        margin-top: 20px;
        padding: 15px;
        background: var(--bg-tertiary);
        border-radius: 12px;
        border: 1px solid var(--border-subtle);
    `;
    
    resultContainer.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p>جاري الترجمة...</p>
        </div>
    `;
    
    // Find the translate page and append result
    const translatePage = document.getElementById('translate-page');
    if (translatePage) {
        // Remove existing result
        const existingResult = document.getElementById('translateResult');
        if (existingResult) {
            existingResult.remove();
        }
        translatePage.appendChild(resultContainer);
    }
    
    try {
        // Using Google Translate API (free tier)
        const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${fromLang}&tl=${toLang}&dt=t&q=${encodeURIComponent(fromText)}`);
        
        if (!response.ok) {
            throw new Error('فشل الاتصال بخدمة الترجمة');
        }
        
        const data = await response.json();
        const translatedText = data[0]?.[0]?.[0] || 'فشلت الترجمة';
        
        resultContainer.innerHTML = `
            <div style="display: grid; gap: 15px;">
                <div>
                    <h4 style="color: var(--accent-cyan); margin-bottom: 8px; font-size: 14px;">النص الأصلي (${fromLang})</h4>
                    <p style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; margin: 0;">${fromText}</p>
                </div>
                <div style="text-align: center; margin: 10px 0;">
                    <i class="fas fa-exchange-alt" style="color: var(--accent-purple); font-size: 20px;"></i>
                </div>
                <div>
                    <h4 style="color: var(--accent-green); margin-bottom: 8px; font-size: 14px;">الترجمة (${toLang})</h4>
                    <p style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; margin: 0;">${translatedText}</p>
                </div>
                <div style="text-align: center; margin-top: 15px;">
                    <button onclick="navigator.clipboard.writeText('${translatedText.replace(/'/g, "\\'")}')" 
                            style="background: var(--gradient-main); color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 12px;">
                        <i class="fas fa-copy"></i> نسخ الترجمة
                    </button>
                </div>
            </div>
        `;
        
        showTemporaryMessage('تم الترجمة بنجاح!', 'success');
        
    } catch (error) {
        resultContainer.innerHTML = `
            <p style="color: var(--accent-red); text-align: center; padding: 20px;">
                ❌ ${error.message || 'حدث خطأ أثناء الترجمة'}
            </p>
        `;
        showTemporaryMessage('فشل الترجمة، حاول مرة أخرى', 'error');
    }
}

// Auto-translate on Enter key
document.addEventListener('DOMContentLoaded', () => {
    const fromText = document.getElementById('fromText');
    const translateBtn = document.querySelector('[onclick*="translateText"]');
    
    if (fromText && translateBtn) {
        fromText.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                translateText();
            }
        });
    }
    
    // Add swap languages button
    const translatePage = document.getElementById('translate-page');
    if (translatePage) {
        const swapBtn = document.createElement('button');
        swapBtn.type = 'button';
        swapBtn.className = 'btn';
        swapBtn.style.cssText = 'background: var(--accent-purple); margin: 10px auto; display: block; width: fit-content;';
        swapBtn.innerHTML = '<i class="fas fa-exchange-alt"></i> تبديل اللغات';
        swapBtn.onclick = () => {
            const fromLang = document.getElementById('fromLang');
            const toLang = document.getElementById('toLang');
            const fromText = document.getElementById('fromText');
            const toText = document.getElementById('toText');
            
            // Swap languages
            const tempLang = fromLang.value;
            fromLang.value = toLang.value;
            toLang.value = tempLang;
            
            // Swap text if exists
            if (toText) {
                const tempText = fromText.value;
                fromText.value = toText.value;
                toText.value = tempText;
            }
            
            showTemporaryMessage('تم تبديل اللغات', 'success');
        };
        
        translatePage.appendChild(swapBtn);
    }
});