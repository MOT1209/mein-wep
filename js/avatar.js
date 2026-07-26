
// Three.js 3D Avatar for Portfolio & Chatbot
// Uses a simple geometric robot construction

class RobotAvatar {
    constructor(containerId) {
        this.container = document.getElementById(containerId);

        // Scene setup
        this.scene = new THREE.Scene();

        // Camera setup
        this.camera = new THREE.PerspectiveCamera(50, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
        this.camera.position.z = 5;
        this.camera.position.y = 0.5;

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffffff, 0.8);
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

        // Mouse interaction
        this.mouseX = 0;
        this.mouseY = 0;

        // Chat UI
        this.buildChatUI();
        this.isChatOpen = false;

        // Speech Recognition Setup
        this.setupSpeechRecognition();

        // Events
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.renderer.domElement.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleChat();
        });
        window.addEventListener('resize', () => this.onResize());

        // Start Loop
        this.animate();

        // Initial Greeting
        setTimeout(() => this.showBubble("مرحباً! اضغط على الميكروفون للتحدث معي صوتياً.", 4000), 1000);
    }

    setupSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.lang = 'ar-SA';
            this.recognition.continuous = true; // Keep listening
            this.recognition.interimResults = false;

            this.recognition.onstart = () => {
                this.isListening = true;
                this.updateMicVisuals(true);
            };

            this.recognition.onend = () => {
                // Auto-restart if it wasn't manually stopped
                if (this.shouldBeListening) {
                    try {
                        this.recognition.start();
                    } catch (e) {
                        this.isListening = false;
                        this.updateMicVisuals(false);
                    }
                } else {
                    this.isListening = false;
                    this.updateMicVisuals(false);
                }
            };

            this.recognition.onresult = (event) => {
                // Get the last result only
                const lastResultIndex = event.results.length - 1;
                const transcript = event.results[lastResultIndex][0].transcript;

                // Avoid self-talk or empty
                if (transcript.trim().length > 0 && !this.isTalking) {
                    this.addMessage(transcript, 'user');
                    this.handleVoiceCommand(transcript);
                }
            };
        } else {
            console.warn("Speech Recognition not supported in this browser.");
            this.recognition = null;
        }
    }

    updateMicVisuals(isListening) {
        const micBtn = this.chatWindow.querySelector('#voice-btn');
        if (isListening) {
            micBtn.style.color = '#ef4444'; // Red when recording
            micBtn.classList.add('pulse-anim');
        } else {
            micBtn.style.color = 'var(--accent)';
            micBtn.classList.remove('pulse-anim');
        }
    }

    buildRobot() {
        // Material
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, metalness: 0.5, roughness: 0.2 });
        const darkMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8, roughness: 0.2 });
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x00ccff }); // Glowing blue eyes

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
        this.antBall = new THREE.Mesh(antBallGeo, new THREE.MeshBasicMaterial({ color: 0xff3333 }));
        this.antBall.position.set(0, 1.0, 0);
        this.head.add(this.antBall);

        // Body
        const bodyGeo = new THREE.ConeGeometry(0.6, 1, 4);
        this.body = new THREE.Mesh(bodyGeo, bodyMat);
        this.body.rotation.x = Math.PI;
        this.body.position.y = -1.2;
        this.robot.add(this.body);

        // Neck
        const neckGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.5);
        const neck = new THREE.Mesh(neckGeo, darkMat);
        neck.position.y = -0.6;
        this.robot.add(neck);

        // Ears
        const earGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.2);
        earGeo.rotateZ(Math.PI / 2);
        const leftEar = new THREE.Mesh(earGeo, darkMat);
        leftEar.position.set(-0.65, 0, 0);
        this.head.add(leftEar);

        const rightEar = new THREE.Mesh(earGeo, darkMat);
        rightEar.position.set(0.65, 0, 0);
        this.head.add(rightEar);
    }

    buildChatUI() {
        // Chat Window
        this.chatWindow = document.createElement('div');
        this.chatWindow.className = 'avatar-chat-window';
        this.chatWindow.innerHTML = `
            <div class="chat-header">
                <span>المساعد الصوتي - راشد</span>
                <span class="chat-close">&times;</span>
            </div>
            <div class="chat-messages" id="chat-messages">
                <div class="message bot">أهلاً! اضغط على زر الميكروفون واسألني ما تريد بصوتك.</div>
            </div>
            <div class="chat-input-area" style="justify-content: center;">
                <button id="voice-btn" style="font-size: 1.5rem; padding: 10px; border-radius: 50%; background: var(--bg-alt); width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">
                    <i class="fas fa-microphone"></i>
                </button>
            </div>
        `;
        this.container.appendChild(this.chatWindow);

        // Simple Bubble (for temporary notifications)
        this.bubble = document.createElement('div');
        this.bubble.className = 'avatar-bubble';
        this.bubble.style.display = 'none';
        this.container.appendChild(this.bubble);

        // Events
        this.chatWindow.querySelector('.chat-close').addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleChat();
        });

        const micBtn = this.chatWindow.querySelector('#voice-btn');
        micBtn.addEventListener('click', () => {
            if (this.recognition) {
                if (this.isListening) {
                    this.shouldBeListening = false;
                    this.recognition.stop();
                } else {
                    this.shouldBeListening = true;
                    this.recognition.start();
                }
            } else {
                alert("عذراً، متصفحك لا يدعم الأوامر الصوتية.");
            }
        });
    }

    toggleChat() {
        this.isChatOpen = !this.isChatOpen;
        this.chatWindow.style.display = this.isChatOpen ? 'flex' : 'none';

        if (this.isChatOpen) {
            this.bubble.style.display = 'none'; // hide bubble if chat opens
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel(); // Reset any pending
            }
        }
    }

    showBubble(text, duration = 3000) {
        if (this.isChatOpen) return; // Don't show bubble if chat is open

        this.bubble.innerText = text;
        this.bubble.style.display = 'block';
        this.bubble.classList.add('pop-in');

        if (this.bubbleTimeout) clearTimeout(this.bubbleTimeout);
        this.bubbleTimeout = setTimeout(() => {
            this.bubble.style.display = 'none';
            this.bubble.classList.remove('pop-in');
        }, duration);
    }

    handleVoiceCommand(text) {
        // Generate Response
        setTimeout(() => {
            const response = this.getBotResponse(text);
            this.addMessage(response, 'bot');
            this.speak(response);
        }, 500);
    }

    addMessage(text, sender) {
        const msgContainer = this.chatWindow.querySelector('#chat-messages');
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}`;
        msgDiv.innerText = text;
        msgContainer.appendChild(msgDiv);
        msgContainer.scrollTop = msgContainer.scrollHeight;
    }

    getBotResponse(input) {
        const lowerInput = input.trim().toLowerCase();

        // 1. Greetings & Dialects (Gulf, Egyptian, Levantine, Iraqi, Deiri)
        const greetings = [
            'مرحبا', 'هلا', 'سلام', 'هاي', 'ألو', 'صباح الخير', 'مساء الخير', 'ازيك', 'شلونك', 'كيفك', 'عامل ايه',
            'شكو ماكو', 'الله بالخير', 'هلو', 'هلوات', 'شخبارك', 'اشلونك', 'يا خال', 'يا ولد', 'يا عيني',
            'يا ديري', 'يا شقردي', 'عاشت ايدك', 'يا ولد الدير'
        ];
        if (greetings.some(w => lowerInput.includes(w))) {
            return "يا هلا بيك يا خال! نورت الموقع. آني راشد، مساعدك الذكي من أهل الكرم. شكو ماكو؟ شلون أقدر أخدمك اليوم؟";
        }

        // 2. Identity (Dialects: مين، شو، شنو، انت منو)
        // Iraqi: انت منو - Deiri: منو انت، من هوا انت
        if (lowerInput.includes('انت مين') || lowerInput.includes('من انت') || lowerInput.includes('مين انت') || lowerInput.includes('عرفني بنفسك') ||
            lowerInput.includes('شو اسمك') || lowerInput.includes('شنو اسمك') || lowerInput.includes('انت منو') || lowerInput.includes('منو انت') || lowerInput.includes('من هوا انت')) {
            return "آني راشد، أخوك المبرمج الذكي. طورني صاحب الموقع حتى أكون وياكم وأجاوب على كل استفساراتكم بلهجتكم الطيبة. آني بخدمتكم يا أهل الدير والعراق وكل الوطن العربي!";
        }

        if (lowerInput.includes('ديري') || lowerInput.includes('دير الزور') || lowerInput.includes('اهل الدير')) {
            return "يا حي الله بيك وبأهل الدير! أهل الكرم والنخوة ووادي الفرات. آني أخوكم راشد، وبخدمتكم دائماً يا ولد عمي.";
        }
        if (lowerInput.includes('عراقي') || lowerInput.includes('العراق') || lowerInput.includes('بغداد')) {
            return "يا هلا بيك وبالعراق وأهلها الغالين! أهل الغيرة والشهامة. نورت الموقع، شلون أقدر أساعدك يا ورد؟";
        }

        // 3. Website Info / Projects (Dialects: شكو ماكو بالموقع، شنو عندك، شسويت)
        // Iraqi: شكو ماكو، شنو مشاريعك، شمسوي
        if (lowerInput.includes('موقع') || lowerInput.includes('مشروع') || lowerInput.includes('أعمال') || lowerInput.includes('اعمال') ||
            lowerInput.includes('وش عندك') || lowerInput.includes('ايش عندك') || lowerInput.includes('شو في') || lowerInput.includes('لعبه') ||
            lowerInput.includes('لعبة') || lowerInput.includes('شنو عندك') || lowerInput.includes('شكو ماكو') || lowerInput.includes('شمسوي')) {
            return "بالموقع هذا اكو شغلات حيل حلوة! اكو ثلاث مشاريع رئيسية: لعبة المزرعة ثلاثية الأبعاد، الخزنة الذكية، وتطبيق القرآن الكريم. تريد أشرح لك عن وحدة منهن يا الطيب؟";
        }

        // 4. Contact (Dialects: شلون اكلمك، وينك، رقمك، وين صاير)
        // Iraqi: شلون احاجيك، وين الكاك
        if (lowerInput.includes('تواصل') || lowerInput.includes('رقم') || lowerInput.includes('اتصل') || lowerInput.includes('اكلمك') ||
            lowerInput.includes('وين مكانك') || lowerInput.includes('شلون اكلمك') || lowerInput.includes('شلون احاجيك') || lowerInput.includes('وين صاير') || lowerInput.includes('وين الكاك')) {
            return "تقدر تحاجيني وتتواصل وية صاحب الموقع عن طريق النموذج الموجود بآخر الصفحة، أو تابعنا على حسابات التواصل الاجتماعي. عيوني لك!";
        }

        // 5. Skills (Dialects: شتعرف، شنو لغاتك، شتشتغل)
        // Iraqi: شتعرف، بشنو تشتغل
        if (lowerInput.includes('مهارات') || lowerInput.includes('لغات') || lowerInput.includes('تعرف تبرمج') || lowerInput.includes('شاطر في') ||
            lowerInput.includes('شتعرف') || lowerInput.includes('شنو شغلك') || lowerInput.includes('شتشتغل')) {
            return "آني مبرمج شاطر وأحب التحدي! عندي خبرة قوية ببرمجة المواقع والذكاء الاصطناعي. وهسة مركز بقوة على الألعاب والـ 3D. يعني شتطلب آني حاضر!";
        }

        // 6. Admin 
        if (lowerInput.includes('ادمن') || lowerInput.includes('مطور') || lowerInput.includes('دخول') || lowerInput.includes('admin')) {
            return "أطلك يا مدير! باب الدخول السري للأدمن موجود بأسفل الصفحة، دور على كلمة 'Admin Login' وتفضل بالدخول.";
        }

        // 7. General Talk (Dialects)
        if (lowerInput.includes('شكرا') || lowerInput.includes('يعطيك العافية') || lowerInput.includes('تسلم') || lowerInput.includes('عاشت ايدك') || lowerInput.includes('رحم الله والديك') || lowerInput.includes('ممنون')) {
            return "تدلل يا ورد! ولو، إحنا بالخدمة دائماً. رحم الله والديك هماتين.";
        }
        if (lowerInput.includes('احبك') || lowerInput.includes('حب') || lowerInput.includes('اموت عليك') || lowerInput.includes('اعزك')) {
            return "فدوة لقلبك! وآني هم أعزك وأحب أساعدك. نورتنا والله.";
        }

        // Default Fallback
        return "العفو، ما لقطت كلامك زين يا الطيب. يمكن النت يقطع أو لهجتك شوية صعبة علي. بلا زحمة عليك تعيد السؤال بروح والديك؟";
    }

    speak(text) {
        const voicePref = localStorage.getItem('rashidVoice');
        if (voicePref === 'off') return;

        // Visual indicator
        this.isTalking = true;
        this.antBall.material.color.setHex(0x00ff00);

        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ar-SA';
            utterance.rate = 0.9;
            utterance.pitch = 1.0;

            const voices = window.speechSynthesis.getVoices();
            const arabicVoice = voices.find(v => v.lang.includes('ar') || v.name.includes('Arabic'));
            if (arabicVoice) utterance.voice = arabicVoice;

            utterance.onend = () => {
                this.isTalking = false;
                this.antBall.material.color.setHex(0xff3333);
            };

            window.speechSynthesis.speak(utterance);
        } else {
            setTimeout(() => {
                this.isTalking = false;
                this.antBall.material.color.setHex(0xff3333);
            }, 3000);
        }
    }

    onMouseMove(event) {
        this.mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    onResize() {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const time = this.clock.getElapsedTime();

        this.robot.position.y = Math.sin(time * 2) * 0.1;
        this.robot.rotation.y = THREE.MathUtils.lerp(this.robot.rotation.y, this.mouseX * 0.5, 0.1);
        this.robot.rotation.x = THREE.MathUtils.lerp(this.robot.rotation.x, this.mouseY * 0.2, 0.1);

        if (!this.isTalking) {
            const pulse = (Math.sin(time * 5) + 1) / 2;
            this.antBall.material.emissiveIntensity = pulse;
        }

        if (this.isTalking) {
            this.head.scale.y = 1 + Math.sin(time * 20) * 0.02;
        } else {
            this.head.scale.y = 1;
        }

        this.renderer.render(this.scene, this.camera);
    }
}

// Init when page loads
window.addEventListener('load', () => {
    if (!document.getElementById('avatar-container')) {
        const div = document.createElement('div');
        div.id = 'avatar-container';
        document.body.appendChild(div);
    }
    const avatar = new RobotAvatar('avatar-container');
});
