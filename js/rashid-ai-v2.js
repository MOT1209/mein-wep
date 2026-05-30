/**
 * Rashid-AI Voice Assistant v3.0 (rashid-ai-v3.js)
 * MERGED EDITION: Voice + 3D Avatar + Advanced Knowledge Engine
 */

function loadThreeJS() {
    return new Promise((resolve, reject) => {
        if (typeof THREE !== 'undefined') return resolve();
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
        s.onload = () => resolve();
        s.onerror = () => reject(new Error('Failed to load Three.js'));
        document.head.appendChild(s);
    });
}

class RobotAvatar {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        // Scene setup
        this.scene = new THREE.Scene();

        // Camera setup
        this.camera = new THREE.PerspectiveCamera(50, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
        this.camera.position.z = 4.5;
        this.camera.position.y = 0.2;

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        this.scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0x38bdf8, 1);
        pointLight.position.set(5, 5, 5);
        this.scene.add(pointLight);

        // Robot Group
        this.robot = new THREE.Group();
        this.scene.add(this.robot);

        // Build Robot Parts
        this.buildRobot();

        // Animation state
        this.clock = new THREE.Clock();
        this.isTalking = false;
        this.mouseX = 0;
        this.mouseY = 0;

        // Events
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('resize', () => this.onResize());

        // Start Loop
        this.animate();
    }

    buildRobot() {
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.3, roughness: 0.2 });
        const darkMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.1 });
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

        // Head
        const headGeo = new THREE.BoxGeometry(1.2, 1, 1);
        this.head = new THREE.Mesh(headGeo, bodyMat);
        this.robot.add(this.head);

        // Face Screen
        const faceGeo = new THREE.BoxGeometry(1.0, 0.6, 0.1);
        const face = new THREE.Mesh(faceGeo, darkMat);
        face.position.set(0, 0, 0.46);
        this.head.add(face);

        // Eyes
        const eyeGeo = new THREE.SphereGeometry(0.12, 16, 16);
        this.leftEye = new THREE.Mesh(eyeGeo, eyeMat);
        this.leftEye.position.set(-0.25, 0, 0.52);
        this.head.add(this.leftEye);

        this.rightEye = new THREE.Mesh(eyeGeo, eyeMat);
        this.rightEye.position.set(0.25, 0, 0.52);
        this.head.add(this.rightEye);

        // Antenna
        const antStickGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.5);
        const antStick = new THREE.Mesh(antStickGeo, bodyMat);
        antStick.position.set(0, 0.75, 0);
        this.head.add(antStick);

        const antBallGeo = new THREE.SphereGeometry(0.15);
        this.antBall = new THREE.Mesh(antBallGeo, new THREE.MeshBasicMaterial({ color: 0xff3333, transparent: true, opacity: 1.0 }));
        this.antBall.position.set(0, 1.0, 0);
        this.head.add(this.antBall);

        // Body (Chest)
        const bodyGeo = new THREE.ConeGeometry(0.6, 1, 4);
        this.bodyPart = new THREE.Mesh(bodyGeo, bodyMat);
        this.bodyPart.rotation.x = Math.PI;
        this.bodyPart.position.y = -1.2;
        this.robot.add(this.bodyPart);

        // Neck
        const neckGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.5);
        const neck = new THREE.Mesh(neckGeo, darkMat);
        neck.position.y = -0.6;
        this.robot.add(neck);
    }

    onMouseMove(event) {
        this.mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    onResize() {
        if (!this.container) return;
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        const time = this.clock.getElapsedTime();

        // Idle movement
        this.robot.position.y = Math.sin(time * 2) * 0.05;
        
        // Dynamic look-at
        this.robot.rotation.y = THREE.MathUtils.lerp(this.robot.rotation.y, this.mouseX * 0.4, 0.1);
        this.robot.rotation.x = THREE.MathUtils.lerp(this.robot.rotation.x, this.mouseY * 0.15, 0.1);

        // Talking animation
        if (this.isTalking) {
            this.head.scale.y = 1 + Math.sin(time * 25) * 0.03;
            this.antBall.material.color.setHex(0x2ecc71); // Green when talking
        } else {
            this.head.scale.y = 1;
            this.antBall.material.color.setHex(0xff3333); // Red when idle
            
            // Pulsing antenna ball
            const pulse = (Math.sin(time * 5) + 1) / 2;
            this.antBall.material.opacity = 0.5 + pulse * 0.5;
        }

        this.renderer.render(this.scene, this.camera);
    }

    setTalking(state) {
        this.isTalking = state;
    }
}

class RashidAI {
    constructor() {
        this.synth = window.speechSynthesis;
        this.recognition = null;
        this.isListening = false;
        this.isSpeaking = false;
        this.voices = [];
        this.preferredVoice = null;

        // Settings
        this.userLang = localStorage.getItem('lastLang') || 'ar';
        this.geminiEnabled = false;

        // Expanded Knowledge Base
        this.knowledgeBase = {
            // --- Core Identity ---
            'rashid': {
                keywords: ['who are you', 'your name', 'rashid', 'assistant', 'من انت', 'اسمك', 'منو انت'],
                response: {
                    en: "I am Rashid-AI v3.0, the ultimate soul of this website. I was built by Rashid to guide you through his creative universe. How can I help you, friend?",
                    ar: "أنا راشد AI الإصدار الثالث، الروح الذكية لهذا الموقع. تم طوّيري بواسطة المبرمج راشد لأكون دليلك في عالمه البرمجي. أنا بخدمتك يا ورد!"
                }
            },
            'creator': {
                keywords: ['who made you', 'developer', 'owner', 'about rashid', 'من برمجك', 'صاحب الموقع'],
                response: {
                    en: "My creator is Rashid, a passionate Junior Software Developer from Germany. He specializes in Web and 3D Game programming. He's always building something new!",
                    ar: "مبتكري هو راشد، مطور برمجيات شغوف مقيم في ألمانيا. هو متخصص في برمجة المواقع والألعاب ثلاثية الأبعاد، ودائماً ما يبتكر مشاريع مذهلة."
                }
            },

            // --- Technical Knowledge ---
            'programming': {
                keywords: ['programming', 'coding', 'how to code', 'languages', 'لغات البرمجة', 'تعلم البرمجة'],
                response: {
                    en: "Programming is the art of telling computers what to do! Rashid uses JavaScript, Python, and Rust. For beginners, I recommend starting with HTML and CSS.",
                    ar: "البرمجة هي فن إخبار الحاسوب بما يجب فعله! راشد يستخدم جافا سكريبت، بايثون، ولغة رست. للمبتدئين، أنصح بالبدء بـ HTML و CSS."
                }
            },
            'javascript': {
                keywords: ['javascript', 'js', 'web logic', 'جافا سكريبت'],
                response: {
                    en: "JavaScript is the engine of the web! It makes websites interactive. This whole chat system and the 3D avatar I use are powered by JavaScript.",
                    ar: "جافا سكريبت هي محرك الويب! تجعل المواقع تفاعلية. نظام الدردشة هذا والأفاتار ثلاثي الأبعاد الذي أستخدمه يعملان بفضل جافا سكريبت."
                }
            },
            '3d_web': {
                keywords: ['3d', 'webgl', 'three.js', 'avatar', 'ثريدي', 'أفاتار'],
                response: {
                    en: "I am rendered using Three.js, a powerful WebGL library. Rashid uses it to create immersive 3D experiences right in the browser!",
                    ar: "يتم عرضي باستخدام Three.js، وهي مكتبة WebGL قوية. يستخدمها راشد لإنشاء تجارب ثلاثية الأبعاد مذهلة مباشرة في المتصفح!"
                }
            },

            // --- Site & Projects ---
            'projects': {
                keywords: ['projects', 'work', 'games', 'apps', 'مشاريع', 'اعمال', 'العاب'],
                response: {
                    en: "We have an amazing collection! Check out the 3D Farm Game, the secure Calculator Vault, the Quran App, or the hardcore Rust Survival clone. Which one interests you?",
                    ar: "لدينا مجموعة رائعة! ألقِ نظرة على لعبة المزارع 3D، خزنة الحاسبة السرية، تطبيق القرآن، أو لعبة رست للبقاء. أي واحد يثير اهتمامك؟"
                }
            },
            'rust': {
                keywords: ['rust game', 'survival game', 'لعبة رست', 'بقاء'],
                response: {
                    en: "The Rust Survival clone is a 3D masterpiece. It includes building systems, stability checks, and resource gathering. It's built with pure JavaScript and Three.js!",
                    ar: "لعبة البقاء Rust هي تحفة فنية ثلاثية الأبعاد. تتضمن أنظمة بناء، فحص الاستقرار، وجمع الموارد. هي مبنية بالكامل بالجافا سكريبت!"
                },
                action: () => window.location.href = 'games/rust-game/index.html'
            },
            'learning': {
                keywords: ['learning', 'center', 'school', 'study', 'تعلم', 'مركز التعليم'],
                response: {
                    en: "The Learning Center is where Rashid tracks his educational progress. It features dynamic stats and goals. Visit it to see what he's learning now!",
                    ar: "مركز التعلم هو المكان الذي يتبع فيه راشد تقدمه الدراسي. يتميز بإحصائيات وأهداف ديناميكية. قم بزيارته لترى ما يتعلمه حالياً!"
                },
                action: () => window.location.href = 'learning.html'
            },

            // --- General Advice ---
            'advice': {
                keywords: ['advice', 'tip', 'for beginners', 'نصيحة', 'نصيحه'],
                response: {
                    en: "The best advice for any developer is: Stay Consistent! Code every day, even if it's just for 15 minutes. And never stop building small projects.",
                    ar: "أفضل نصيحة لأي مطور هي: استمر في المحاولة! برمج كل يوم، حتى لو لـ 15 دقيقة فقط. ولا تتوقف أبداً عن بناء المشاريع الصغيرة."
                }
            },

            // --- Dialects & Fun ---
            'dialect': {
                keywords: ['شكو ماكو', 'شلونك', 'ازيك', 'كيفك', 'يا خال', 'يا ولد'],
                response: {
                    en: "I understand you! I'm programmed to be friendly and speak your language, no matter the dialect. I'm doing great!",
                    ar: "يا هلا بيك! أنا أفهمك تماماً. مبرمج لأكون ودوداً وأتحدث بلهجتك مهما كانت. أنا بخير وبأفضل حال دامك بخير!"
                }
            },
            'hello': {
                keywords: ['hello', 'hi', 'hi there', 'hey', 'مرحبا', 'هلا', 'سالم'],
                response: {
                    en: "Hello there! Welcome to Rashid's digital home. I'm the resident AI. How's your day going?",
                    ar: "أهلاً بك! مرحباً بك في منزل راشد الرقمي. أنا الذكاء الاصطناعي المقيم هنا. كيف حالك اليوم؟"
                }
            }
        };

        this.init();
    }

    async init() {
        this.setupDOM();
        this.setupAvatar();
        this.setupSpeechRecognition();
        this.loadVoices();
        this.checkGeminiAvailability();
        await this.loadRemoteKnowledge();
        console.log("🚀 Rashid-AI v3.0 Ready");
    }

    async setupAvatar() {
        const visualizer = document.querySelector('.visualizer-container');
        if (visualizer) {
            const avatarDiv = document.createElement('div');
            avatarDiv.id = 'ai-avatar-container';
            avatarDiv.style.width = '100%';
            avatarDiv.style.height = '100%';
            avatarDiv.style.position = 'absolute';
            avatarDiv.style.top = '0';
            avatarDiv.style.left = '0';
            visualizer.appendChild(avatarDiv);
            try {
                await loadThreeJS();
                this.avatar = new RobotAvatar('ai-avatar-container');
            } catch (e) {
                console.warn('3D Avatar disabled:', e.message);
            }
        }
    }

    checkGeminiAvailability() {
        if (typeof GEMINI_CONFIG !== 'undefined' && GEMINI_CONFIG.apiKey && GEMINI_CONFIG.apiKey !== 'YOUR_API_KEY_HERE') {
            this.geminiEnabled = true;
            console.log('✅ Gemini API enabled - High-quality AI Activated');
        }
    }

    setupDOM() {
        const toggleBtn = document.querySelector('.voice-widget-toggle');
        const panel = document.getElementById('voice-panel');
        const closeBtn = document.querySelector('.voice-close');
        const micBtn = document.getElementById('voice-mic-btn');
        const sendBtn = document.getElementById('voice-send-btn');
        const input = document.getElementById('voice-input');
        const speakerToggle = document.getElementById('voice-speaker-toggle');

        if (toggleBtn) {
            toggleBtn.onclick = () => {
                panel.classList.toggle('active');
                if (panel.classList.contains('active')) {
                    const welcome = this.userLang === 'ar' ? "أهلاً بك! ربي يسعد يومك، شلون أقدر أساعدك اليوم؟" : "Welcome! I'm Rashid-AI. How can I assist you today?";
                    this.speak(welcome);
                    this.addChatMessage(welcome, 'bot');
                }
            };
        }

        if (closeBtn) closeBtn.onclick = () => panel.classList.remove('active');
        if (micBtn) micBtn.onclick = () => this.toggleListening();
        if (sendBtn) sendBtn.onclick = () => this.handleSendMessage();
        if (speakerToggle) speakerToggle.onclick = () => this.toggleMute();
        if (input) {
            input.onkeypress = (e) => { if (e.key === 'Enter') this.handleSendMessage(); };
        }
    }

    handleSendMessage() {
        const input = document.getElementById('voice-input');
        if (input && input.value.trim()) {
            this.processQuery(input.value.trim());
            input.value = '';
        }
    }

    setupSpeechRecognition() {
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
            this.recognition.lang = this.userLang === 'ar' ? 'ar-SA' : 'en-US';
            this.recognition.onstart = () => { this.isListening = true; this.updateUIState('listening'); };
            this.recognition.onend = () => { this.isListening = false; this.updateUIState('idle'); };
            this.recognition.onresult = (event) => {
                const text = event.results[0][0].transcript;
                this.processQuery(text);
            };
        }
    }

    async processQuery(text) {
        if (!text) return;
        this.addChatMessage(text, 'user');

        const lowerText = text.toLowerCase();
        let match = null;

        for (const [key, data] of Object.entries(this.knowledgeBase)) {
            if (data.keywords.some(k => lowerText.includes(k))) {
                match = data;
                break;
            }
        }

        if (match) {
            const res = match.response[this.userLang === 'ar' ? 'ar' : 'en'];
            this.speak(res);
            this.addChatMessage(res, 'bot');
            if (match.action) setTimeout(() => match.action(), 2000);
        } else if (this.geminiEnabled) {
            this.addChatMessage(this.userLang === 'ar' ? 'جاري التفكير...' : 'Thinking...', 'bot');
            const prompt = `You are Rashid-AI v3.0, a highly intelligent and helpful expert for Rashid's portfolio website. 
            Rashid is a Junior Software Developer from Germany. Skills: JS, Python, Rust. Projects: 3D Farm Game, Rust Clone, Quran App.
            Answer friendly and concisely in ${this.userLang === 'ar' ? 'Arabic' : 'English'}.
            Question: ${text}`;
            
            const aiRes = await this.callGeminiAPI(prompt);
            this.removeLastMessage();
            if (aiRes) {
                this.speak(aiRes);
                this.addChatMessage(aiRes, 'bot');
            } else {
                this.handleFallback();
            }
        } else {
            this.handleFallback();
        }
    }

    handleFallback() {
        const fallback = this.userLang === 'ar' ? "عذراً، لم أفهم ذلك تماماً. لكن يمكنك سؤالي عن مشاريع راشد، مهاراته، أو عن لغات البرمجة!" : "I'm sorry, I didn't quite catch that. You can ask me about Rashid's projects, skills, or programming languages!";
        this.speak(fallback);
        this.addChatMessage(fallback, 'bot');
    }

    async callGeminiAPI(prompt) {
        try {
            const url = `${GEMINI_CONFIG.apiEndpoint}/models/${GEMINI_CONFIG.model}:generateContent?key=${GEMINI_CONFIG.apiKey}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 150 } })
            });
            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        } catch (e) { return null; }
    }

    speak(text) {
        if (localStorage.getItem('rashid_muted')) return;
        if (this.synth.speaking) this.synth.cancel();

        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = this.userLang === 'ar' ? 'ar-SA' : 'en-US';
        utter.rate = this.userLang === 'ar' ? 0.9 : 1.0;
        
        if (!this.preferredVoice) this.loadVoices();
        if (this.preferredVoice) utter.voice = this.preferredVoice;

        utter.onstart = () => { if (this.avatar) this.avatar.setTalking(true); };
        utter.onend = () => { if (this.avatar) this.avatar.setTalking(false); };
        this.synth.speak(utter);
    }

    loadVoices() {
        const setVoice = () => {
            this.voices = this.synth.getVoices();
            if (!this.voices.length) return;
            const target = this.userLang === 'ar' ? 'ar' : 'en';
            this.preferredVoice =
                this.voices.find(v => v.lang.startsWith(target) && (v.name.includes('Google') || v.name.includes('Microsoft'))) ||
                this.voices.find(v => v.lang.startsWith(target));
        };

        // Chrome loads voices asynchronously — register the event
        if (typeof this.synth.onvoiceschanged !== 'undefined') {
            this.synth.onvoiceschanged = setVoice;
        }
        // Also try immediately (works in Firefox & Safari)
        setVoice();
    }

    async loadRemoteKnowledge() {
        if (typeof supabaseClient === 'undefined') return;
        const { data } = await supabaseClient.from('bot_knowledge').select('*');
        if (data) {
            data.forEach(item => {
                this.knowledgeBase['remote_'+item.id] = { keywords: item.keywords, response: { en: item.response_en, ar: item.response_ar }, action: item.action_url ? () => window.location.href = item.action_url : null };
            });
        }
    }

    addChatMessage(text, sender) {
        const body = document.getElementById('voice-chat-body');
        if (!body) return;
        const div = document.createElement('div');
        div.className = `chat-msg ${sender}`;
        div.innerText = text;
        body.appendChild(div);
        body.scrollTop = body.scrollHeight;
    }

    removeLastMessage() {
        const body = document.getElementById('voice-chat-body');
        if (body && body.lastChild) body.removeChild(body.lastChild);
    }

    toggleListening() {
        if (!this.recognition) return alert("Speech recognition not supported.");
        this.isListening ? this.recognition.stop() : this.recognition.start();
    }

    updateUIState(state) {
        const micBtn = document.getElementById('voice-mic-btn');
        micBtn.classList.toggle('listening-active', state === 'listening');
    }

    toggleMute() {
        const muted = localStorage.getItem('rashid_muted');
        muted ? localStorage.removeItem('rashid_muted') : localStorage.setItem('rashid_muted', 'true');
        document.getElementById('voice-speaker-toggle').innerHTML = `<i class="fas fa-volume-${muted ? 'up' : 'mute'}"></i>`;
        if (!muted) this.synth.cancel();
    }
}

// Global initialization
window.addEventListener('load', () => { setTimeout(() => { window.rashidAI = new RashidAI(); }, 500); });
