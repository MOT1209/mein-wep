/**
 * Rashid-AI Voice Assistant v2.1 (rashid-ai-v2.js)
 * Handles Text-to-Speech (TTS), Speech-to-Text (STT), and Deep Knowledge Engine.
 * Enhanced Arabic Voice Support
 */

class RashidAI {
    constructor() {
        this.synth = window.speechSynthesis;
        this.recognition = null;
        this.isListening = false;
        this.isSpeaking = false;
        this.voices = [];
        this.preferredVoice = null;

        // Force Arabic language for better voice support
        // Auto-detect language from browser or use saved preference
        const browserLang = navigator.language || navigator.userLanguage;
        const isArabicBrowser = browserLang.startsWith('ar');

        // Default to Arabic for this website
        this.userLang = localStorage.getItem('lastLang') || 'ar';

        console.log(`🌍 Rashid-AI v2.1 Initialized`);
        console.log(`📍 Browser Language: ${browserLang}`);
        console.log(`🗣️ Selected Language: ${this.userLang}`);


        // ============================================================
        // KNOWLEDGE BASE (EXPANDED)
        // ============================================================
        this.knowledgeBase = {
            // --- Projects ---
            'farmer': {
                keywords: ['farm', 'farmer', 'tractor', 'agriculture', 'game', 'play farm'],
                response: {
                    en: "The 3D Farm Game is my favorite! You can drive tractors, plant wheat, and sell crops. Would you like to play it?",
                    ar: "لعبة المزارع ثلاثية الابعاد هي المفضلة لدي! يمكنك قيادة الجرارات وزراعة القمح وبيع المحاصيل. هل تود تجربتها؟"
                },
                action: () => window.location.href = 'farm-game/index.html'
            },
            'quran': {
                keywords: ['quran', 'islam', 'holy', 'allah', 'recite', 'listen quran'],
                response: {
                    en: "The Quran App provides a peaceful environment with beautiful recitations and verse highlighting. Opening it for you.",
                    ar: "تطبيق القرآن الكريم يوفر بيئة هادئة مع تلاوات جميلة وتظليل للآيات. سأفتحه لك الآن."
                },
                action: () => window.location.href = 'quran-app/index.html'
            },
            'calculator': {
                keywords: ['calc', 'math', 'count', 'numbers', 'vault', 'secret'],
                response: {
                    en: "It looks like a normal calculator, but it hides a secret vault. Enter the magic code to see what's inside!",
                    ar: "تبدو كآلة حاسبة عادية، لكنها تخفي خزنة سرية. أدخل الرمز السحرى لترى ما بداخلها!"
                },
                action: () => window.location.href = 'calculator-vault/index.html'
            },
            'quiz': {
                keywords: ['quiz', 'test', 'question', 'ask me', 'challenge', 'game'],
                response: {
                    en: "Ready for a challenge? The Quiz App tests your programming knowledge. Let's see how much you score.",
                    ar: "جاهز للتحدي؟ تطبيق 'اسألني' يختبر معلوماتك البرمجية. لنر كم ستحقق من نقاط."
                },
                action: () => window.location.href = 'quiz-app/index.html'
            },
            'rust': {
                keywords: ['rust', 'survival', '3d game', 'build', 'shoot'],
                response: {
                    en: "The Rust Survival clone is a hardcore 3D game. You can gather resources and build bases. It's technically impressive!",
                    ar: "لعبة البقاء Rust هي لعبة ثلاثية الأبعاد قوية. يمكنك جمع الموارد وبناء القواعد. إنها مذهلة تقنياً!"
                },
                action: () => window.location.href = 'rust-game/index.html'
            },

            // --- Personal / Bio ---
            'rashid': {
                keywords: ['who are you', 'your name', 'rashid', 'bot', 'assistant'],
                response: {
                    en: "I am Rashid-AI, a virtual assistant created by Rashid. I live inside this website to help visitors like you.",
                    ar: "أنا راشد AI، مساعد افتراضي ابتكره المبرمج راشد. أنا أعيش داخل هذا الموقع لمساعدة الزوار مثلك."
                }
            },
            'creator': {
                keywords: ['who made you', 'developer', 'owner', 'author', 'about rashid'],
                response: {
                    en: "I was created by Rashid, a talented Junior Software Developer based in Germany. He loves coding and gaming.",
                    ar: "تم تطويري بواسطة راشد، وهو مطور برمجيات واعد مقيم في ألمانيا. هو يعشق البرمجة والألعاب."
                }
            },
            'skills': {
                keywords: ['skills', 'stack', 'technologies', 'language', 'code'],
                response: {
                    en: "Rashid is skilled in HTML, CSS, JavaScript, and Python. He is also learning Game Development with Unity and 3D WebGL.",
                    ar: "راشد يتقن HTML و CSS و JavaScript و Python. كما أنه يتعلم تطوير الألعاب باستخدام Unity و 3D WebGL."
                }
            },
            'contact': {
                keywords: ['contact', 'email', 'message', 'reach', 'talk to rashid'],
                response: {
                    en: "You can contact Rashid via the form below or email him at zwnt45602@gmail.com.",
                    ar: "يمكنك التواصل مع راشد عبر النموذج في الأسفل أو مراسلته على بريده الإلكتروني."
                },
                action: () => {
                    document.querySelector('#contact').scrollIntoView({ behavior: 'smooth' });
                }
            },

            // --- Fun / General ---
            'joke': {
                keywords: ['joke', 'funny', 'laugh', 'tell me something'],
                response: {
                    en: "Why do programmers prefer dark mode? Because light attracts bugs! Haha.",
                    ar: "لماذا يفضل المبرمجون الوضع الليلي؟ لأن الضوء يجذب الحشرات (Bugs)! هاهاها."
                }
            },
            'hello': {
                keywords: ['hello', 'hi', 'salam', 'hey', 'greetings'],
                response: {
                    en: "Hello! It's great to see you here. Everything on this site is built with passion.",
                    ar: "أهلاً بك! من الرائع رؤيتك هنا. كل شيء في هذا الموقع تم بناؤه بشغف."
                }
            },
            'how_are_you': {
                keywords: ['how are you', 'doing', 'status'],
                response: {
                    en: "I'm functioning perfectly at 100% efficiency. Thanks for asking!",
                    ar: "أعمل بكفاءة 100% وأنظمتي ممتازة. شكراً لسؤالك!"
                }
            },

            // --- Admin Logic ---
            'admin': {
                keywords: ['admin', 'login', 'dashboard', 'panel', 'command', 'control'],
                response: {
                    en: "Opening Command Center. Please authenticate.",
                    ar: "جاري فتح مركز القيادة. يرجى إثبات الهوية."
                },
                action: () => {
                    const btn = document.getElementById('admin-trigger');
                    if (btn) btn.click(); // Simulate click on footer link (handles modal logic)
                }
            }
        };

        // Initialize
        this.init();
    }

    async init() {
        this.setupDOM();
        this.setupSpeechRecognition();
        this.loadVoices();

        // Fetch Dynamic Knowledge from Supabase
        await this.loadRemoteKnowledge();

        // Check Gemini API availability
        this.checkGeminiAvailability();

        // Voice greeting removed - will only speak when user opens panel manually
        // This complies with browser autoplay policies
    }

    checkGeminiAvailability() {
        if (typeof GEMINI_CONFIG !== 'undefined' && GEMINI_CONFIG.apiKey && GEMINI_CONFIG.apiKey !== 'YOUR_API_KEY_HERE') {
            this.geminiEnabled = true;
            this.geminiRequestCount = 0;
            this.lastGeminiRequest = 0;
            console.log('✅ Gemini API enabled - High-quality AI responses activated');
        } else {
            this.geminiEnabled = false;
            console.log('ℹ️ Gemini API not configured - Using local knowledge base');
        }
    }

    async callGeminiAPI(prompt) {
        if (!this.geminiEnabled) {
            return null;
        }

        // Rate limiting check
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastGeminiRequest;

        if (timeSinceLastRequest < 1000) {
            console.warn('⚠️ Rate limit: Please wait before next request');
            return null;
        }

        this.lastGeminiRequest = now;
        this.geminiRequestCount++;

        try {
            const url = `${GEMINI_CONFIG.apiEndpoint}/models/${GEMINI_CONFIG.model}:generateContent?key=${GEMINI_CONFIG.apiKey}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 200,
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`Gemini API error: ${response.status}`);
            }

            const data = await response.json();
            const text = data.candidates[0].content.parts[0].text;

            console.log(`🤖 Gemini Response (${this.geminiRequestCount} requests)`);
            return text;

        } catch (error) {
            console.error('❌ Gemini API Error:', error);
            return null;
        }
    }

    async loadRemoteKnowledge() {
        if (typeof supabaseClient === 'undefined') return;

        const { data, error } = await supabaseClient
            .from('bot_knowledge')
            .select('*');

        if (error) {
            console.error("Error loading bot knowledge:", error);
            return;
        }

        if (data && data.length > 0) {
            data.forEach(item => {
                // Merge into local KnowledgeBase
                // 'id' is used as key or generic 'dynamic_id'
                const key = 'dynamic_' + item.id;
                this.knowledgeBase[key] = {
                    keywords: item.keywords,
                    response: {
                        en: item.response_en,
                        ar: item.response_ar
                    },
                    action: item.action_url ? () => window.location.href = item.action_url : null
                };
            });
            console.log(`RashidAI: Loaded ${data.length} new topics from Cloud.`);
        }
    }

    setupDOM() {
        // --- 1. Float Button Click Logic (Modified) ---
        const toggleBtn = document.querySelector('.voice-widget-toggle');
        if (toggleBtn) {
            toggleBtn.onclick = (e) => {
                // Determine if we are OPENING or CLOSING
                const panel = document.getElementById('voice-panel');
                const isOpening = !panel.classList.contains('active');

                // Toggle UI
                panel.classList.toggle('active');

                if (isOpening) {
                    // "Just click on it and it talks to you"
                    // We greet immediately when opened manually
                    const greeting = this.userLang === 'ar' ? "كيف يمكنني مساعدتك؟" : "How can I help you?";
                    this.speak(greeting);

                    // Optional: Auto-start listening after speaking? 
                    // Browsers might block this sequence, but we can try or just wait for user to click mic.
                    // Let's stick to speaking to invite interaction.
                }
            };
        }

        // --- 2. Inner Buttons ---
        document.addEventListener('click', (e) => {
            if (e.target.closest('#voice-mic-btn')) {
                this.toggleListening();
            }
            if (e.target.closest('#voice-send-btn')) {
                const input = document.getElementById('voice-input');
                if (input && input.value.trim()) {
                    this.processQuery(input.value.trim());
                    input.value = '';
                }
            }
            if (e.target.closest('#voice-speaker-toggle')) {
                this.toggleMute();
            }
            // Close button inside header
            if (e.target.closest('.voice-close')) {
                document.getElementById('voice-panel').classList.remove('active');
            }
        });

        // --- 3. Input Enter Key ---
        const input = document.getElementById('voice-input');
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.processQuery(input.value);
                    input.value = '';
                }
            });
        }
    }

    setupSpeechRecognition() {
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;

            this.recognition.lang = this.userLang === 'ar' ? 'ar-SA' : 'en-US';

            this.recognition.onstart = () => {
                this.isListening = true;
                this.updateUIState('listening');
            };

            this.recognition.onend = () => {
                this.isListening = false;
                this.updateUIState('idle');
            };

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                document.getElementById('voice-input').value = transcript;
                this.processQuery(transcript);
            };

            this.recognition.onerror = (event) => {
                console.error('Speech error', event.error);
                this.speak(this.userLang === 'ar' ? "عذراً لم أسمع." : "Sorry, come again?");
            };
        }
    }

    loadVoices() {
        window.speechSynthesis.onvoiceschanged = () => {
            this.voices = this.synth.getVoices();

            // Log all available voices for debugging
            console.log(`📢 Total voices available: ${this.voices.length}`);

            // List all Arabic voices
            const arabicVoices = this.voices.filter(v => v.lang.startsWith('ar') || v.lang.includes('ar-'));
            console.log(`🇸🇦 Arabic voices found: ${arabicVoices.length}`);
            arabicVoices.forEach(v => {
                console.log(`  - ${v.name} (${v.lang}) ${v.localService ? '[Local]' : '[Remote]'}`);
            });

            this.setVoiceInternal();
        };
    }

    setVoiceInternal() {
        const langTarget = this.userLang === 'ar' ? 'ar' : 'en';

        // Enhanced Voice Selection Logic for Better Arabic Support
        if (langTarget === 'ar') {
            // Priority 1: Microsoft Arabic voices (best quality for Arabic)
            this.preferredVoice = this.voices.find(v =>
                (v.lang.startsWith('ar') || v.lang.includes('ar-')) &&
                (v.name.includes('Microsoft') || v.name.includes('Hoda') || v.name.includes('Naayf'))
            );

            // Priority 2: Google Arabic voices
            if (!this.preferredVoice) {
                this.preferredVoice = this.voices.find(v =>
                    (v.lang.startsWith('ar') || v.lang.includes('ar-')) &&
                    v.name.includes('Google')
                );
            }

            // Priority 3: Any Arabic voice
            if (!this.preferredVoice) {
                this.preferredVoice = this.voices.find(v =>
                    v.lang.startsWith('ar') || v.lang.includes('ar-')
                );
            }

            // Log selected voice for debugging
            if (this.preferredVoice) {
                console.log(`✅ Arabic Voice Selected: ${this.preferredVoice.name} (${this.preferredVoice.lang})`);
            } else {
                console.warn('⚠️ No Arabic voice found! Using default voice.');
            }
        } else {
            // English voice selection
            this.preferredVoice = this.voices.find(v => v.lang.includes('en') && v.name.includes('Google'))
                || this.voices.find(v => v.lang.includes('en'));
        }

        // Final fallback
        if (!this.preferredVoice) {
            this.preferredVoice = this.voices[0];
        }
    }

    greetUser() {
        const customMsg = localStorage.getItem('bot_welcome_msg');
        let msg = "";

        if (customMsg) {
            msg = customMsg;
        } else {
            msg = this.userLang === 'ar'
                ? "أهلاً بك في عالم راشد. أنا مساعدك الذكي."
                : "Welcome to Rashid's World. I am your AI assistant.";
        }

        this.speak(msg);
        this.addChatMessage(msg, 'bot');
    }

    async processQuery(text) {
        if (!text) return;

        this.addChatMessage(text, 'user');

        const lowerText = text.toLowerCase();
        let matchedKey = null;

        // Smart Matching in local knowledge base
        for (const [key, data] of Object.entries(this.knowledgeBase)) {
            if (data.keywords.some(k => lowerText.includes(k))) {
                matchedKey = key;
                break;
            }
        }

        // If matched in knowledge base, use it
        if (matchedKey) {
            const response = this.knowledgeBase[matchedKey].response[this.userLang === 'ar' ? 'ar' : 'en'];
            this.speak(response);
            this.addChatMessage(response, 'bot');

            if (this.knowledgeBase[matchedKey].action) {
                setTimeout(() => {
                    this.knowledgeBase[matchedKey].action();
                }, 2000);
            }
        } else if (this.geminiEnabled) {
            // Use Gemini AI for intelligent responses
            this.addChatMessage('جاري التفكير...', 'bot');

            const contextPrompt = this.userLang === 'ar'
                ? `أنت راشد AI، مساعد ذكي لموقع راشد للبرمجة. أجب بالعربية بشكل ودود ومختصر (2-3 جمل فقط).

معلومات عن راشد:
- مطور برمجيات واعد من ألمانيا
- يتقن HTML, CSS, JavaScript, Python
- يطور ألعاب ومواقع ويب
- لديه مشاريع: لعبة المزرعة 3D، تطبيق القرآن، لعبة Rust 3D، تطبيق اسألني

السؤال: ${text}

الجواب:`
                : `You are Rashid AI, an intelligent assistant for Rashid's programming website. Answer in English, friendly and concise (2-3 sentences).

About Rashid:
- Junior Software Developer from Germany
- Skills: HTML, CSS, JavaScript, Python
- Develops games and websites
- Projects: 3D Farm Game, Quran App, Rust 3D, Quiz App

Question: ${text}

Answer:`;

            const geminiResponse = await this.callGeminiAPI(contextPrompt);

            // Remove "thinking" message
            const chatBody = document.getElementById('voice-chat-body');
            if (chatBody && chatBody.lastChild) {
                chatBody.removeChild(chatBody.lastChild);
            }

            if (geminiResponse) {
                this.speak(geminiResponse);
                this.addChatMessage(geminiResponse, 'bot');
            } else {
                // Fallback to default response
                const fallback = this.userLang === 'ar'
                    ? "يمكنك سؤالي عن: المشاريع، من هو راشد، أو حتى أن تطلب مني نكتة!"
                    : "You can ask me about: Projects, Who is Rashid, or even ask for a joke!";

                this.speak(fallback);
                this.addChatMessage(fallback, 'bot');
            }
        } else {
            // Default General Response (no Gemini, no match)
            const fallback = this.userLang === 'ar'
                ? "يمكنك سؤالي عن: المشاريع، من هو راشد، أو حتى أن تطلب مني نكتة!"
                : "You can ask me about: Projects, Who is Rashid, or even ask for a joke!";

            this.speak(fallback);
            this.addChatMessage(fallback, 'bot');
        }
    }

    speak(text) {
        // Check if muted
        if (localStorage.getItem('rashid_muted')) {
            console.log('🔇 Voice is muted');
            return;
        }

        if (this.synth.speaking) {
            // Cancel previous speech to avoid overlap
            this.synth.cancel();
        }

        if (text !== '') {
            const utterThis = new SpeechSynthesisUtterance(text);

            // Set voice
            if (!this.preferredVoice) this.setVoiceInternal();
            if (this.preferredVoice) {
                utterThis.voice = this.preferredVoice;
                console.log(`🗣️ Speaking with: ${this.preferredVoice.name}`);
            }

            // Set language explicitly for better pronunciation
            utterThis.lang = this.userLang === 'ar' ? 'ar-SA' : 'en-US';

            // Adjust pitch/rate for better clarity
            utterThis.pitch = 1.0;
            utterThis.rate = this.userLang === 'ar' ? 0.9 : 1.0; // Slightly slower for Arabic

            utterThis.onstart = () => {
                this.isSpeaking = true;
                this.toggleVisualizer(true);
            };

            utterThis.onend = () => {
                this.isSpeaking = false;
                this.toggleVisualizer(false);
            };

            utterThis.onerror = (event) => {
                console.error('Speech synthesis error:', event);
                this.isSpeaking = false;
                this.toggleVisualizer(false);
            };

            this.synth.speak(utterThis);
        }
    }

    toggleListening() {
        if (!this.recognition) {
            alert("Upgrade your browser to use Voice features.");
            return;
        }
        if (this.isListening) {
            this.recognition.stop();
        } else {
            this.recognition.start();
        }
    }

    toggleMute() {
        const isMuted = localStorage.getItem('rashid_muted');
        if (isMuted) {
            localStorage.removeItem('rashid_muted');
            document.getElementById('voice-speaker-toggle').innerHTML = '<i class="fas fa-volume-up"></i>';
        } else {
            localStorage.setItem('rashid_muted', 'true');
            this.synth.cancel();
            document.getElementById('voice-speaker-toggle').innerHTML = '<i class="fas fa-volume-mute"></i>';
        }
    }

    updateUIState(state) {
        const micBtn = document.getElementById('voice-mic-btn');
        const glowRing = document.querySelector('.voice-glow-ring');

        if (state === 'listening') {
            micBtn.classList.add('listening-active');
            if (glowRing) glowRing.classList.add('active');
        } else {
            micBtn.classList.remove('listening-active');
            if (glowRing) glowRing.classList.remove('active');
        }
    }

    toggleVisualizer(active) {
        const visualizer = document.getElementById('voice-visualizer');
        if (visualizer) {
            visualizer.style.opacity = active ? '1' : '0';
        }
    }

    addChatMessage(text, sender) {
        const chatBody = document.getElementById('voice-chat-body');
        if (!chatBody) return;

        const msgDiv = document.createElement('div');
        msgDiv.classList.add('chat-msg', sender);
        msgDiv.innerText = text;

        chatBody.appendChild(msgDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    }
}

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => {
    // Check maintenance mode from Admin
    const isMaintenance = localStorage.getItem('bot_maintenance') === 'true';
    if (!isMaintenance) {
        window.rashidAI = new RashidAI();
    } else {
        const widget = document.getElementById('voice-widget');
        if (widget) widget.style.display = 'none';
    }
});
