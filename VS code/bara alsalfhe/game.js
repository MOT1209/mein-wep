// ======================================
// برا السالفة — Game Engine
// ======================================

// ===== Game State =====
const GameState = {
    // Settings
    mode: 'questions', // questions is now default
    category: 'random',
    turnTime: 15,
    totalRounds: 3,
    currentRound: 1,
    soundEnabled: true,
    vibrationEnabled: true,

    // Players
    playerCount: 4,
    players: [], // { name, score, isSpy, hint, voted }
    currentPlayerIndex: 0,
    spyIndex: -1,

    // Game Data
    currentWord: '',
    hints: [],
    votes: {},
    votingComplete: false,
    allPlayersRevealed: false,

    // Timer
    timerInterval: null,
    timeRemaining: 15,

    // Phase: setup, reveal, hints, voting, results
    phase: 'setup',

    // Custom words
    customWords: JSON.parse(localStorage.getItem('customWords') || '[]'),

    // Leaderboard
    leaderboard: JSON.parse(localStorage.getItem('leaderboard') || '{}'),

    // Session Stats (for awards)
    sessionStats: {},

    // Achievements
    achievements: JSON.parse(localStorage.getItem('achievements') || '{}'),
};

// ===== Audio System (Musical & Fun) =====
const AudioSystem = {
    ctx: null,

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    // Helper: create a note with smooth envelope
    _note(freq, type, startTime, duration, volume = 0.12) {
        const ctx = this.ctx;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        osc.connect(gain);
        gain.connect(ctx.destination);
        // Smooth ADSR
        const attack = 0.02;
        const release = duration * 0.3;
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(volume, startTime + attack);
        gain.gain.setValueAtTime(volume, startTime + duration - release);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.start(startTime);
        osc.stop(startTime + duration);
    },

    // Helper: play a chord (multiple notes together)
    _chord(freqs, type, startTime, duration, volume = 0.07) {
        freqs.forEach(f => this._note(f, type, startTime, duration, volume));
    },

    play(type) {
        if (!GameState.soundEnabled) return;
        this.init();
        const t = this.ctx.currentTime;

        switch (type) {
            case 'click': {
                // Soft pop — xylophone-like tap
                this._note(1200, 'sine', t, 0.08, 0.1);
                this._note(1800, 'sine', t, 0.05, 0.05);
                break;
            }
            case 'start': {
                // Cheerful ascending fanfare melody (C-E-G-C5)
                const melody = [
                    { f: 523, d: 0.15 },  // C5
                    { f: 659, d: 0.15 },  // E5
                    { f: 784, d: 0.15 },  // G5
                    { f: 1047, d: 0.35 }, // C6 (long)
                ];
                let offset = 0;
                melody.forEach(n => {
                    this._note(n.f, 'sine', t + offset, n.d, 0.13);
                    this._note(n.f * 0.5, 'triangle', t + offset, n.d, 0.05); // octave below
                    offset += n.d * 0.85;
                });
                // Final sparkle chord
                this._chord([1047, 1318, 1568], 'sine', t + offset, 0.4, 0.06);
                break;
            }
            case 'reveal': {
                // Mysterious reveal — ascending shimmer + gentle chime
                this._note(392, 'sine', t, 0.2, 0.1);        // G4
                this._note(523, 'triangle', t + 0.1, 0.2, 0.08); // C5
                this._note(659, 'sine', t + 0.2, 0.25, 0.12);   // E5
                // Sparkle on top
                this._note(1318, 'sine', t + 0.3, 0.15, 0.06);
                this._note(1568, 'sine', t + 0.35, 0.2, 0.05);
                break;
            }
            case 'spy_reveal': {
                // Dramatic spy reveal — suspenseful descending
                this._note(600, 'sine', t, 0.15, 0.12);
                this._note(550, 'sine', t + 0.15, 0.15, 0.1);
                this._note(400, 'triangle', t + 0.3, 0.3, 0.14);
                this._note(200, 'sine', t + 0.45, 0.4, 0.08);
                // Eerie shimmer
                this._note(300, 'sine', t + 0.6, 0.5, 0.04);
                this._note(303, 'sine', t + 0.6, 0.5, 0.04); // slight detune for mystery
                break;
            }
            case 'vote': {
                // Satisfying stamp/pop
                this._note(880, 'sine', t, 0.06, 0.12);
                this._note(1100, 'sine', t + 0.03, 0.08, 0.08);
                this._note(660, 'triangle', t + 0.05, 0.1, 0.06);
                break;
            }
            case 'win': {
                // Joyful victory fanfare — major chord arpeggiated up + celebration
                const winMelody = [
                    { f: 523, d: 0.12 },   // C5
                    { f: 659, d: 0.12 },   // E5
                    { f: 784, d: 0.12 },   // G5
                    { f: 1047, d: 0.2 },   // C6
                    { f: 1175, d: 0.12 },  // D6
                    { f: 1318, d: 0.12 },  // E6
                    { f: 1568, d: 0.4 },   // G6 (sustained)
                ];
                let off = 0;
                winMelody.forEach((n, i) => {
                    this._note(n.f, 'sine', t + off, n.d, 0.11);
                    if (i >= 3) this._note(n.f * 0.5, 'triangle', t + off, n.d, 0.04);
                    off += n.d * 0.75;
                });
                // Final triumph chord
                this._chord([1047, 1318, 1568], 'sine', t + off, 0.5, 0.07);
                this._chord([523, 784, 1047], 'triangle', t + off, 0.6, 0.04);
                break;
            }
            case 'lose': {
                // Sad trombone — descending "wah wah wah wahhh"
                const loseMelody = [
                    { f: 493, d: 0.25 },  // B4
                    { f: 466, d: 0.25 },  // Bb4
                    { f: 440, d: 0.25 },  // A4
                    { f: 349, d: 0.6 },   // F4 (long sad note)
                ];
                let lOff = 0;
                loseMelody.forEach(n => {
                    this._note(n.f, 'triangle', t + lOff, n.d, 0.1);
                    this._note(n.f * 0.5, 'sine', t + lOff, n.d, 0.05);
                    lOff += n.d * 0.9;
                });
                break;
            }
            case 'tick': {
                // Gentle clock tick — soft woodblock
                this._note(1600, 'sine', t, 0.03, 0.06);
                this._note(800, 'triangle', t, 0.04, 0.04);
                break;
            }
            case 'tick_urgent': {
                // Urgent tick — slightly louder, higher pitch
                this._note(2000, 'sine', t, 0.04, 0.09);
                this._note(1000, 'square', t, 0.03, 0.03);
                break;
            }
            case 'timeout': {
                // Time's up — descending alarm with gentle buzz
                this._note(880, 'sine', t, 0.12, 0.12);
                this._note(660, 'sine', t + 0.12, 0.12, 0.1);
                this._note(440, 'triangle', t + 0.24, 0.2, 0.12);
                // Double buzz
                this._note(440, 'sine', t + 0.5, 0.1, 0.08);
                this._note(440, 'sine', t + 0.65, 0.1, 0.08);
                break;
            }
            case 'pass': {
                // Phone pass — swoosh whoosh
                this._note(400, 'sine', t, 0.15, 0.08);
                this._note(800, 'sine', t + 0.05, 0.15, 0.06);
                this._note(1200, 'sine', t + 0.1, 0.1, 0.04);
                break;
            }
            case 'hint': {
                // Hint submitted — bubbly confirmation
                this._note(880, 'sine', t, 0.1, 0.1);
                this._note(1100, 'sine', t + 0.08, 0.12, 0.08);
                this._note(1320, 'sine', t + 0.16, 0.15, 0.07);
                break;
            }
            case 'countdown': {
                // Countdown beep (3, 2, 1)
                this._note(600, 'sine', t, 0.1, 0.1);
                this._note(300, 'triangle', t, 0.1, 0.05);
                break;
            }
            case 'round_start': {
                // New round — upbeat jingle
                const jingle = [523, 587, 659, 784, 880, 1047];
                jingle.forEach((f, i) => {
                    this._note(f, 'sine', t + i * 0.08, 0.12, 0.09);
                });
                this._chord([1047, 1318, 1568], 'sine', t + jingle.length * 0.08, 0.3, 0.05);
                break;
            }
            case 'join': {
                // Player joined — friendly ding-dong
                this._note(784, 'sine', t, 0.15, 0.1);
                this._note(1047, 'sine', t + 0.15, 0.2, 0.1);
                break;
            }
            case 'error': {
                // Error — short buzz
                this._note(200, 'triangle', t, 0.15, 0.08);
                this._note(180, 'triangle', t + 0.15, 0.15, 0.06);
                break;
            }
        }
    },

    vibrate(pattern) {
        if (GameState.vibrationEnabled && navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    },

    // Text-to-Speech
    speak(text) {
        if (!GameState.soundEnabled || !window.speechSynthesis) return;

        // Cancel any current speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ar-SA'; // Arabic
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        // Try to find a good Arabic voice
        const voices = window.speechSynthesis.getVoices();
        const arabicVoice = voices.find(v => v.lang.includes('ar'));
        if (arabicVoice) utterance.voice = arabicVoice;

        window.speechSynthesis.speak(utterance);
    }
};

// ===== Screen Management =====
function showScreen(screenId) {
    AudioSystem.play('click');
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = document.getElementById(screenId);
    if (screen) screen.classList.add('active');

    // If going back to main menu, reset theme
    if (screenId === 'main-menu') {
        document.body.className = document.body.className.replace(/theme-\w+/g, '');
    }
}

function applyTheme(category) {
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${category}`);
}

// ===== Splash Screen =====
window.addEventListener('DOMContentLoaded', () => {
    initSetupScreen();
    generateRoomCode();
    initCodeInputs();
    loadCustomWords();

    // Check for room code in URL
    const urlParams = new URLSearchParams(window.location.search);
    const roomCode = urlParams.get('room');
    if (roomCode && roomCode.length === 5) {
        // Auto-fill join inputs
        const inputs = document.querySelectorAll('#join-room-screen .code-input');
        for (let i = 0; i < 5; i++) {
            if (inputs[i]) inputs[i].value = roomCode[i];
        }
        // Jump to join screen after splash
        setTimeout(() => {
            showScreen('join-room-screen');
        }, 3200);
    }

    // Splash screen timeout
    setTimeout(() => {
        if (!roomCode) showScreen('main-menu');
        // Initialize online connection
        if (typeof OnlineGame !== 'undefined') {
            OnlineGame.connect();
        }
    }, 3000);
});

// ===== Setup Screen Initialization =====
function initSetupScreen() {
    updatePlayerInputs();
    renderCategories();
}

function updatePlayerInputs() {
    const container = document.getElementById('player-names-container');
    container.innerHTML = '';
    for (let i = 0; i < GameState.playerCount; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'player-name-input';
        input.placeholder = `اسم اللاعب ${i + 1}`;
        input.id = `player-${i}`;
        input.value = GameState.players[i]?.name || '';
        input.maxLength = 20;
        container.appendChild(input);
    }
    document.getElementById('player-count-display').textContent = GameState.playerCount;
}

function changePlayerCount(delta) {
    AudioSystem.play('click');
    const newCount = GameState.playerCount + delta;
    if (newCount >= 3 && newCount <= 12) {
        GameState.playerCount = newCount;
        updatePlayerInputs();
    }
}

function renderCategories() {
    const grid = document.getElementById('category-grid');
    grid.innerHTML = '';
    CATEGORIES.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = `category-btn${GameState.category === cat.id ? ' active' : ''}`;
        btn.innerHTML = `
            <span class="category-emoji">${cat.emoji}</span>
            <span class="category-name">${cat.name}</span>
        `;
        btn.addEventListener('click', () => selectCategory(cat.id));
        grid.appendChild(btn);
    });
}

function selectCategory(catId) {
    AudioSystem.play('click');
    GameState.category = catId;
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');
}

function selectMode(mode) {
    AudioSystem.play('click');
    GameState.mode = mode;
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active');

    // Quick mode auto-sets timer to 30s
    if (mode === 'quick') {
        selectTimer(30);
    }
}

function selectTimer(time) {
    AudioSystem.play('click');
    GameState.turnTime = time;
    document.querySelectorAll('.timer-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.timer-btn[data-time="${time}"]`)?.classList.add('active');
}

function selectRounds(rounds) {
    AudioSystem.play('click');
    GameState.totalRounds = rounds;
    document.querySelectorAll('.round-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.round-btn[data-rounds="${rounds}"]`)?.classList.add('active');
}

// ===== Quick Play =====
function startQuickPlay() {
    AudioSystem.play('start');
    // Default 4 players, random category, classic mode
    GameState.playerCount = 4;
    GameState.mode = 'questions';
    GameState.category = 'random';
    GameState.turnTime = 15;
    GameState.totalRounds = 3;
    GameState.currentRound = 1;
    showScreen('setup-screen');
}

// ===== Start Game =====
function startGame() {
    // Apply theme
    applyTheme(GameState.category);

    // Validate player names
    const players = [];
    for (let i = 0; i < GameState.playerCount; i++) {
        const input = document.getElementById(`player-${i}`);
        const name = input?.value.trim() || `لاعب ${i + 1}`;
        players.push({
            name,
            score: GameState.leaderboard[name] || 0,
            isSpy: false,
            hint: '',
            voted: null,
            avatar: AVATARS[i % AVATARS.length]
        });
    }

    GameState.players = players;
    GameState.currentPlayerIndex = 0;
    GameState.hints = [];
    GameState.votes = {};
    GameState.votingComplete = false;
    GameState.allPlayersRevealed = false;

    // Choose random word
    chooseWord();

    // Choose spy
    GameState.spyIndex = Math.floor(Math.random() * GameState.playerCount);
    GameState.players[GameState.spyIndex].isSpy = true;

    AudioSystem.play('round_start');
    AudioSystem.vibrate([100, 50, 100]);

    // Start player reveal phase
    GameState.phase = 'reveal';

    // Initialize session stats if first round
    if (GameState.currentRound === 1) {
        GameState.sessionStats = {};
        GameState.players.forEach(p => {
            GameState.sessionStats[p.name] = {
                votesReceivedAsInnocent: 0,
                votesReceivedAsSpy: 0,
                totalVotesReceived: 0,
                timesSpy: 0,
                spyWins: 0
            };
        });
    } else {
        // Ensure new players are added to stats if joined mid-game (though not possible in current UI flow)
        GameState.players.forEach(p => {
            if (!GameState.sessionStats[p.name]) {
                GameState.sessionStats[p.name] = {
                    votesReceivedAsInnocent: 0,
                    votesReceivedAsSpy: 0,
                    totalVotesReceived: 0,
                    timesSpy: 0,
                    spyWins: 0
                };
            }
        });
    }

    showPassPhone(0);
}

function chooseWord() {
    let wordPool = [];

    if (GameState.category === 'random') {
        // Mix all categories
        Object.values(WORDS).forEach(words => {
            wordPool = wordPool.concat(words);
        });
    } else {
        wordPool = WORDS[GameState.category] || [];
    }

    // Add custom words
    if (GameState.customWords.length > 0) {
        wordPool = wordPool.concat(GameState.customWords);
    }

    GameState.currentWord = wordPool[Math.floor(Math.random() * wordPool.length)];
}

// ===== Pass Phone Phase =====
function showPassPhone(playerIndex) {
    GameState.currentPlayerIndex = playerIndex;
    const player = GameState.players[playerIndex];

    document.getElementById('pass-player-name').textContent = player.name;

    // Reset pass phone screen to defaults
    document.querySelector('.pass-title').textContent = 'مرر الهاتف إلى';
    document.querySelector('.pass-hint').textContent = 'تأكد أن لا أحد يرى الشاشة!';
    const btn = document.getElementById('btn-show-role');
    btn.innerHTML = '👁️ اضغط لرؤية دورك';
    btn.onclick = showRole;

    AudioSystem.play('pass');
    showScreen('pass-phone-screen');
}

function showRole() {
    const player = GameState.players[GameState.currentPlayerIndex];
    AudioSystem.play(player.isSpy ? 'spy_reveal' : 'reveal');
    AudioSystem.vibrate(player.isSpy ? [100, 50, 100, 50, 200] : [50]);

    const roleCard = document.getElementById('role-card');
    const roleIcon = document.getElementById('role-icon');
    const roleTitle = document.getElementById('role-title');
    const roleWord = document.getElementById('role-word');
    const roleHint = document.getElementById('role-hint');

    roleCard.classList.remove('spy');

    if (player.isSpy) {
        roleCard.classList.add('spy');
        roleIcon.textContent = '🕵️';
        roleTitle.textContent = 'أنت المخفي! 🤫';
        roleWord.textContent = '؟؟؟';
        roleHint.textContent = 'حاول معرفة الكلمة من تلميحات الآخرين دون أن يُكشف أمرك!';
    } else {
        roleIcon.textContent = '🎯';
        roleTitle.textContent = 'أنت تعرف الكلمة!';
        roleWord.textContent = GameState.currentWord;
        roleHint.textContent = 'قدّم تلميحاً ذكياً دون فضح الكلمة!';
    }

    // Start timer display
    GameState.timeRemaining = GameState.turnTime;
    updateTimerDisplay();

    showScreen('role-screen');
}

function updateTimerDisplay() {
    const text = document.getElementById('timer-text');
    const progress = document.getElementById('timer-progress');
    const circumference = 2 * Math.PI * 54; // r=54 from SVG

    text.textContent = GameState.timeRemaining;

    const ratio = GameState.timeRemaining / GameState.turnTime;
    progress.style.strokeDasharray = circumference;
    progress.style.strokeDashoffset = circumference * (1 - ratio);

    // Color changes
    progress.classList.remove('warning', 'danger');
    if (ratio <= 0.3) {
        progress.classList.add('danger');
    } else if (ratio <= 0.5) {
        progress.classList.add('warning');
    }
}

function nextPlayer() {
    AudioSystem.play('click');
    const nextIndex = GameState.currentPlayerIndex + 1;

    if (nextIndex < GameState.playerCount) {
        showPassPhone(nextIndex);
    } else {
        // All players have seen their roles, move to hints/questions phase
        GameState.allPlayersRevealed = true;
        startHintPhase();
    }
}

// ===== Hint/Question Phase =====
function startHintPhase() {
    GameState.phase = 'hints';
    GameState.currentPlayerIndex = 0;
    GameState.hints = [];

    const title = document.getElementById('hint-screen-title');
    const instruction = document.getElementById('hint-instruction');

    if (GameState.mode === 'questions') {
        // Pick a random question for everyone this round? 
        // Or pick a random question PER player?
        // User request: "Questions about it like how tall..."
        // Let's pick ONE question per player to keep it dynamic.
        title.textContent = 'دور الأسئلة ❓';
        instruction.textContent = 'أجب على السؤال التالي:';
    } else {
        title.textContent = 'دور التلميحات 💡';
        instruction.textContent = 'حان دورك لتقديم تلميح!';
    }

    document.getElementById('hints-list').innerHTML = '';
    showCurrentHintPlayer();
}

function showCurrentHintPlayer() {
    const player = GameState.players[GameState.currentPlayerIndex];
    document.getElementById('current-hint-player').textContent = `${player.avatar} ${player.name}`;
    const input = document.getElementById('hint-input');
    input.value = '';

    // Reset any previous question text if any (we might need a container for it)
    const instruction = document.getElementById('hint-instruction');

    if (GameState.mode === 'questions') {
        // Verbal Questioning: X asks Y
        // Pick a target who isn't the current player
        const sourceIndex = GameState.currentPlayerIndex;
        let targetIndex;
        do {
            targetIndex = Math.floor(Math.random() * GameState.players.length);
        } while (targetIndex === sourceIndex);

        const target = GameState.players[targetIndex];
        player.askedTarget = target.name;

        instruction.textContent = `يا ${player.name}.. اسأل ${target.name} سؤالاً!`;
        input.style.display = 'none'; // Hide input for verbal mode
        document.getElementById('btn-submit-hint').textContent = 'تم ✓';
        input.placeholder = '';

        // Speak the task
        setTimeout(() => {
            AudioSystem.speak(`يا ${player.name}.. اسأل ${target.name}`);
        }, 600);

    } else {
        instruction.textContent = 'حان دورك لتقديم تلميح!';
        input.style.display = 'block';
        input.placeholder = 'اكتب تلميحك هنا...';
        document.getElementById('btn-submit-hint').textContent = 'إرسال ✓';
    }

    showScreen('hint-screen');
    input.focus();

    // Start turn timer
    startTurnTimer();
}

function startTurnTimer() {
    clearInterval(GameState.timerInterval);
    GameState.timeRemaining = GameState.turnTime;

    GameState.timerInterval = setInterval(() => {
        GameState.timeRemaining--;

        if (GameState.timeRemaining <= 3 && GameState.timeRemaining > 0) {
            AudioSystem.play('tick_urgent');
        } else if (GameState.timeRemaining <= 5) {
            AudioSystem.play('tick');
        }

        if (GameState.timeRemaining <= 0) {
            clearInterval(GameState.timerInterval);
            AudioSystem.play('timeout');
            AudioSystem.vibrate([200, 100, 200]);
            // Auto-submit empty hint
            autoSubmitHint();
        }
    }, 1000);
}

function autoSubmitHint() {
    const input = document.getElementById('hint-input');
    if (!input.value.trim()) {
        input.value = GameState.mode === 'questions' ? 'لم يسأل' : 'لم يلمّح';
    }
    submitHint();
}

function submitHint() {
    clearInterval(GameState.timerInterval);
    AudioSystem.play('hint');

    const input = document.getElementById('hint-input');
    const player = GameState.players[GameState.currentPlayerIndex];
    let hintText = input.value.trim();

    if (GameState.mode === 'questions') {
        hintText = `سأل ${player.askedTarget || 'أحد اللاعبين'}`;
    } else {
        hintText = hintText || 'لم يلمّح';
    }

    const hintData = {
        playerName: player.name,
        avatar: player.avatar,
        text: hintText
    };

    GameState.hints.push(hintData);

    // Add to hints list display
    const hintsList = document.getElementById('hints-list');
    const hintItem = document.createElement('div');
    hintItem.className = 'hint-item';

    let textDisplay = hintText;
    if (hintData.question) {
        textDisplay = `<span style="font-weight:bold;display:block;font-size:0.9em;margin-bottom:2px;">${hintData.question}</span>${hintText}`;
    }

    hintItem.innerHTML = `
        <span class="hint-player">${player.avatar} ${player.name}</span>
        <span class="hint-text">${textDisplay}</span>
    `;
    hintsList.appendChild(hintItem);

    // Next player
    GameState.currentPlayerIndex++;

    if (GameState.currentPlayerIndex < GameState.playerCount) {
        showCurrentHintPlayer();
    } else {
        // All hints given, move to voting
        startVotingPhase();
    }
}

// ===== Voting Phase =====
function startVotingPhase() {
    GameState.phase = 'voting';
    GameState.votes = {};
    GameState.votingComplete = false;
    currentVotingPlayer = 0;

    showVotingPassPhone();
}

function showVotingPassPhone() {
    const player = GameState.players[currentVotingPlayer];

    document.getElementById('pass-player-name').textContent = player.name;
    document.querySelector('.pass-title').textContent = 'حان وقت التصويت! مرر الهاتف إلى:';
    document.querySelector('.pass-hint').textContent = 'لا تجعل أحداً يرى تصويتك 🤫';

    const btn = document.getElementById('btn-show-role');
    btn.innerHTML = '👁️ اضغط لبدء التصويت';
    btn.onclick = () => renderVotingScreenForPlayer();

    showScreen('pass-phone-screen');
}

function renderVotingScreenForPlayer() {
    const voter = GameState.players[currentVotingPlayer];
    const votingPlayers = document.getElementById('voting-players');
    votingPlayers.innerHTML = '';

    // Set the specific question
    const questionEl = document.querySelector('.voting-question');
    questionEl.textContent = `يا ${voter.name}.. من هو المخفي في رأيك؟ 🕵️`;

    // TTS
    AudioSystem.speak(`يا ${voter.name}.. من هو المخفي؟`);

    // Add hints review first
    let hintsHTML = `<div class="hints-review"><h3 style="text-align:center;margin-bottom:16px;">${GameState.mode === 'questions' ? 'مراجعة الأسئلة 🗣️' : 'مراجعة التلميحات 💡'}</h3>`;

    GameState.hints.forEach(hint => {
        hintsHTML += `
            <div class="hint-item">
                <span class="hint-player">${hint.avatar} ${hint.playerName}</span>
                <span class="hint-text">${hint.text}</span>
            </div>
        `;
    });
    hintsHTML += '</div><div style="margin:24px 0;text-align:center;"><h3>اختر اللاعب الذي تشك به:</h3></div>';

    const reviewDiv = document.createElement('div');
    reviewDiv.innerHTML = hintsHTML;
    votingPlayers.appendChild(reviewDiv);

    // Add vote buttons for OTHER players
    GameState.players.forEach((player, index) => {
        if (player.name === voter.name) return; // Skip self

        const btn = document.createElement('button');
        btn.className = 'vote-btn';
        btn.innerHTML = `
            <span class="vote-avatar">${player.avatar}</span>
            <span>${player.name}</span>
            <span class="vote-count" style="display:none;">0 أصوات</span>
        `;
        btn.addEventListener('click', () => castVote(index, btn));
        votingPlayers.appendChild(btn);
    });

    document.getElementById('spy-guess-section').classList.add('hidden');
    showScreen('voting-screen');
}

let currentVotingPlayer = 0;

function castVote(votedForIndex, btn) {
    if (GameState.votingComplete) return;

    AudioSystem.play('vote');
    AudioSystem.vibrate([30]);

    // Record vote
    if (!GameState.votes[votedForIndex]) {
        GameState.votes[votedForIndex] = 0;
    }
    GameState.votes[votedForIndex]++;

    currentVotingPlayer++;

    if (currentVotingPlayer >= GameState.playerCount) {
        // All votes cast
        revealVotes();
    } else {
        showVotingPassPhone();
    }
}

function revealVotes() {
    GameState.votingComplete = true;

    // Switch to voting screen for reveal
    showScreen('voting-screen');
    document.querySelector('.voting-question').textContent = 'النتائج النهائية للتصويت 📊';

    const votingPlayers = document.getElementById('voting-players');
    votingPlayers.innerHTML = '';

    // Show everyone's vote count in a summary list
    GameState.players.forEach((player, index) => {
        const count = GameState.votes[index] || 0;

        const resultItem = document.createElement('div');
        resultItem.style.cssText = "display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.05); padding:15px; border-radius:12px; margin-bottom:10px; border:1px solid rgba(255,255,255,0.1);";

        resultItem.innerHTML = `
            <div style="display:flex; align-items:center; gap:12px;">
                <span style="font-size:1.5rem;">${player.avatar}</span>
                <span style="font-weight:bold; font-size:1.1rem;">${player.name}</span>
            </div>
            <div style="display:flex; gap:10px; align-items:center;">
                <span style="background:#6C5CE7; color:white; padding:4px 12px; border-radius:20px; font-size:0.9rem;">${count} أصوات</span>
            </div>
        `;
        votingPlayers.appendChild(resultItem);
    });

    // Find most voted (handling ties)
    let maxVotes = 0;
    let ties = [];
    Object.entries(GameState.votes).forEach(([index, count]) => {
        const idx = parseInt(index);
        if (count > maxVotes) {
            maxVotes = count;
            ties = [idx];
        } else if (count === maxVotes && maxVotes > 0) {
            ties.push(idx);
        }
    });

    const spyCaught = ties.includes(GameState.spyIndex);

    if (spyCaught) {
        AudioSystem.play('reveal');
        showToast('🎯 تم كشف المخفي!');
        setTimeout(() => {
            document.getElementById('spy-guess-section').classList.remove('hidden');
            document.getElementById('spy-guess-input').value = '';
            document.getElementById('spy-guess-input').focus();
            AudioSystem.play('spy_reveal');
        }, 1500);
    } else {
        AudioSystem.play('lose');
        showToast('🕵️ المخفي نجا من التصويت!');
        setTimeout(() => showResults(false, false), 2000);
    }
}

function submitSpyGuess() {
    const guess = document.getElementById('spy-guess-input').value.trim();
    const correct = guess === GameState.currentWord;

    AudioSystem.play(correct ? 'win' : 'lose');
    showResults(true, correct);
}

// ===== Results Phase =====
function showResults(spyCaught, spyGuessedCorrectly) {
    GameState.phase = 'results';

    const resultIcon = document.getElementById('result-icon');
    const resultTitle = document.getElementById('result-title');
    const spyName = document.getElementById('spy-name');
    const resultWordText = document.getElementById('result-word-text');

    spyName.textContent = GameState.players[GameState.spyIndex].name;
    resultWordText.textContent = GameState.currentWord;

    // Calculate scores
    if (spyCaught && !spyGuessedCorrectly) {
        // Others win
        resultIcon.textContent = '🎉';
        resultTitle.textContent = 'تم كشف المخفي!';
        resultTitle.classList.remove('spy-wins');
        AudioSystem.play('win');

        GameState.players.forEach((player, i) => {
            if (i !== GameState.spyIndex) {
                player.score += 2;
            }
        });
    } else if (spyCaught && spyGuessedCorrectly) {
        // Spy guessed the word even after being caught
        resultIcon.textContent = '😱';
        resultTitle.textContent = 'المخفي عرف الكلمة!';
        resultTitle.classList.add('spy-wins');
        AudioSystem.play('lose');

        GameState.players[GameState.spyIndex].score += 3;
    } else {
        // Spy wasn't caught
        resultIcon.textContent = '🕵️';
        resultTitle.textContent = 'المخفي نجا! 😈';
        resultTitle.classList.add('spy-wins');
        AudioSystem.play('lose');

        GameState.players[GameState.spyIndex].score += 3;
    }

    // Update leaderboard
    GameState.players.forEach(p => {
        GameState.leaderboard[p.name] = p.score;
    });
    localStorage.setItem('leaderboard', JSON.stringify(GameState.leaderboard));

    // Display scores
    renderScores();

    // Show/hide next round button
    const nextRndBtn = document.getElementById('btn-next-round');
    if (GameState.currentRound >= GameState.totalRounds) {
        nextRndBtn.querySelector('.btn-text').textContent = 'النتائج النهائية 🏆';
    } else {
        nextRndBtn.querySelector('.btn-text').textContent = `الجولة ${GameState.currentRound + 1} 🔄`;
    }

    // confetti if winners
    if (spyCaught && !spyGuessedCorrectly) {
        launchConfetti();
    }

    // Update session stats for awards
    updateSessionStats(spyCaught, spyGuessedCorrectly);

    AudioSystem.vibrate([100, 50, 100, 50, 200]);
    showScreen('results-screen');
}

function updateSessionStats(spyCaught, spyGuessedCorrectly) {
    if (!GameState.sessionStats) GameState.sessionStats = {};

    // Track votes
    Object.entries(GameState.votes).forEach(([targetIndex, count]) => {
        const target = GameState.players[targetIndex];
        if (target && GameState.sessionStats[target.name]) {
            GameState.sessionStats[target.name].totalVotesReceived += count;
            if (target.isSpy) {
                GameState.sessionStats[target.name].votesReceivedAsSpy += count;
            } else {
                GameState.sessionStats[target.name].votesReceivedAsInnocent += count;
            }
        }
    });

    // Track spy stats
    const spy = GameState.players[GameState.spyIndex];
    if (spy && GameState.sessionStats[spy.name]) {
        GameState.sessionStats[spy.name].timesSpy++;
        if (!spyCaught || spyGuessedCorrectly) {
            GameState.sessionStats[spy.name].spyWins++;
        }
    }
}

function renderScores() {
    const scoresList = document.getElementById('scores-list');
    scoresList.innerHTML = '';

    const sorted = [...GameState.players].sort((a, b) => b.score - a.score);
    sorted.forEach((player, i) => {
        const item = document.createElement('div');
        item.className = 'score-item';
        item.style.animationDelay = `${i * 0.1}s`;

        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
        const spyBadge = player.isSpy ? ' 🕵️' : '';

        item.innerHTML = `
            <span style="font-size:1.3rem;min-width:30px;text-align:center;">${medal}</span>
            <span class="score-name">${player.avatar} ${player.name}${spyBadge}</span>
            <span class="score-points">${player.score}</span>
        `;
        scoresList.appendChild(item);
    });
}

// ===== Next Round / End Game =====
function nextRound() {
    AudioSystem.play('click');

    if (GameState.currentRound >= GameState.totalRounds) {
        // Show final leaderboard
        renderLeaderboard();
        showScreen('leaderboard-screen');
        return;
    }

    GameState.currentRound++;

    // Reset for new round
    GameState.players.forEach(p => {
        p.isSpy = false;
        p.hint = '';
        p.voted = null;
        p.currentQuestion = null;
    });

    GameState.currentPlayerIndex = 0;
    GameState.hints = [];
    GameState.votes = {};
    GameState.votingComplete = false;
    GameState.allPlayersRevealed = false;
    currentVotingPlayer = 0;

    // New word and spy
    chooseWord();
    GameState.spyIndex = Math.floor(Math.random() * GameState.playerCount);
    GameState.players[GameState.spyIndex].isSpy = true;

    GameState.phase = 'reveal';
    showPassPhone(0);
}

function backToMenu() {
    AudioSystem.play('click');
    clearInterval(GameState.timerInterval);
    GameState.currentRound = 1;
    currentVotingPlayer = 0;
    showScreen('main-menu');
}

// ===== Leaderboard =====
function renderLeaderboard() {
    const podium = document.getElementById('leaderboard-podium');
    const list = document.getElementById('leaderboard-list');

    const sorted = [...GameState.players].sort((a, b) => b.score - a.score);

    // Render Awards
    renderAwards();

    // Podium (top 3)
    podium.innerHTML = '';
    const podiumOrder = [1, 0, 2]; // Silver, Gold, Bronze display order

    podiumOrder.forEach(rank => {
        if (sorted[rank]) {
            const player = sorted[rank];
            const heights = [120, 90, 60];
            const medals = ['🥇', '🥈', '🥉'];

            const item = document.createElement('div');
            item.className = 'podium-item';
            item.innerHTML = `
                <span class="podium-avatar" style="font-size:2.5rem;">${player.avatar}</span>
                <span class="podium-name">${player.name}</span>
                <span class="podium-score">${player.score} نقطة</span>
                <div class="podium-bar" style="height:${heights[rank]}px">${medals[rank]}</div>
            `;
            podium.appendChild(item);
        }
    });

    // Full list
    list.innerHTML = '';
    sorted.forEach((player, i) => {
        const item = document.createElement('div');
        item.className = 'leaderboard-item';
        item.innerHTML = `
            <span class="leaderboard-rank">${i + 1}</span>
            <span style="font-size:1.3rem;">${player.avatar}</span>
            <span class="leaderboard-name">${player.name}</span>
            <span class="leaderboard-points">${player.score} نقطة</span>
        `;
        list.appendChild(item);
    });

    launchConfetti();

    // Render achievements
    renderMyAchievements();
}

function renderMyAchievements() {
    const list = document.getElementById('achievements-list');
    if (!list) return;
    list.innerHTML = '';
    
    const myName = (typeof OnlineGame !== 'undefined' && OnlineGame.myName) || 'المستخدم';
    const myAchievements = (GameState.achievements && GameState.achievements[myName]) || [];

    if (myAchievements.length === 0) {
        list.innerHTML = '<p class="no-achievements" style="text-align:center; color:rgba(255,255,255,0.4); grid-column: 1/-1;">لا توجد أوسمة بعد. العب المزيد لفتحها!</p>';
        return;
    }

    myAchievements.forEach(a => {
        const badge = document.createElement('div');
        badge.className = 'achievement-badge';
        badge.title = a.desc;
        badge.innerHTML = `
            <div class="badge-icon">${a.title.split(' ')[0]}</div>
            <div class="badge-name">${a.title.split(' ').slice(1).join(' ')}</div>
            <div class="badge-date">${a.date}</div>
        `;
        list.appendChild(badge);
    });
}

function renderAwards() {
    const stats = GameState.sessionStats;
    if (!stats || Object.keys(stats).length === 0) return;

    // Find winners for categories
    let maxInnocentVotes = -1;
    let victimName = null;

    let maxSpyWins = -1;
    let mastermindName = null;

    let minVotes = 999;
    let ghostName = null;

    Object.entries(stats).forEach(([name, s]) => {
        // Scapegoat: Most votes received as innocent
        if (s.votesReceivedAsInnocent > maxInnocentVotes && s.votesReceivedAsInnocent > 0) {
            maxInnocentVotes = s.votesReceivedAsInnocent;
            victimName = name;
        }

        // Mastermind: Most spy wins
        if (s.spyWins > maxSpyWins && s.spyWins > 0) {
            maxSpyWins = s.spyWins;
            mastermindName = name;
        }

        // Ghost: Least total votes (must have played)
        if (s.totalVotesReceived < minVotes) {
            minVotes = s.totalVotesReceived;
            ghostName = name;
        }
    });

    // Build HTML
    const container = document.getElementById('leaderboard-podium');
    // We will inject awards BEFORE the podium or AFTER? 
    // Let's create a dedicated section inside leaderboard-content

    let awardsHTML = '<div class="awards-container" style="display:flex;justify-content:center;gap:10px;margin-bottom:20px;flex-wrap:wrap;">';

    if (victimName) {
        awardsHTML += `
            <div class="award-card" style="background:rgba(255,107,107,0.2);padding:10px;border-radius:10px;text-align:center;border:1px solid #FF6B6B;">
                <div style="font-size:2rem;">🥺</div>
                <div style="font-weight:bold;font-size:0.9rem;">البريء المظلوم</div>
                <div style="font-size:0.8rem;">${victimName}</div>
            </div>`;
    }
    if (mastermindName) {
        awardsHTML += `
            <div class="award-card" style="background:rgba(108,92,231,0.2);padding:10px;border-radius:10px;text-align:center;border:1px solid #6C5CE7;">
                <div style="font-size:2rem;">😈</div>
                <div style="font-weight:bold;font-size:0.9rem;">الداهية</div>
                <div style="font-size:0.8rem;">${mastermindName}</div>
            </div>`;
    }
    if (ghostName && minVotes === 0) {
        awardsHTML += `
            <div class="award-card" style="background:rgba(178,190,195,0.2);padding:10px;border-radius:10px;text-align:center;border:1px solid #b2bec3;">
                <div style="font-size:2rem;">👻</div>
                <div style="font-weight:bold;font-size:0.9rem;">الشبح</div>
                <div style="font-size:0.8rem;">${ghostName}</div>
            </div>`;
    }

    awardsHTML += '</div>';

    // Insert before podium
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = awardsHTML;

    // Clear previous awards if we are re-rendering?
    // Actually renderLeaderboard clears podium.innerHTML.
    // So we can append awards to podium first, or insert them separately.
    // Let's append to podium container but styled differently?
    // A separate container is better.

    // Check if we already added an awards container
    const existing = document.querySelector('.awards-container');
    if (existing) existing.remove();

    container.parentNode.insertBefore(tempDiv.firstChild, container);
}

// ===== Room System =====
function generateRoomCode() {
    const code = Math.floor(10000 + Math.random() * 90000).toString();
    document.getElementById('room-code').textContent = code;
}

function copyRoomCode() {
    const code = document.getElementById('room-code').textContent;
    const url = window.location.origin + window.location.pathname + '?room=' + code;
    navigator.clipboard.writeText(url).then(() => {
        showToast('🔗 تم نسخ رابط الغرفة!');
    }).catch(() => {
        navigator.clipboard.writeText(code);
        showToast('📋 تم نسخ الرمز: ' + code);
    });
}

// ===== Code Input System =====
function initCodeInputs() {
    const inputs = document.querySelectorAll('.code-input');
    inputs.forEach((input, i) => {
        input.addEventListener('input', (e) => {
            if (e.target.value && i < inputs.length - 1) {
                inputs[i + 1].focus();
            }
        });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !e.target.value && i > 0) {
                inputs[i - 1].focus();
            }
        });
    });
}

// ===== Settings =====
function toggleSound() {
    GameState.soundEnabled = document.getElementById('sound-toggle').checked;
    if (GameState.soundEnabled) AudioSystem.play('click');
}

function toggleDarkMode() {
    // Currently only dark mode, but can expand
    const enabled = document.getElementById('dark-mode-toggle').checked;
    if (!enabled) {
        document.body.style.background = 'linear-gradient(135deg, #f0f0f5 0%, #e0e0e8 100%)';
        showToast('🌞 الوضع الفاتح (تجريبي)');
    } else {
        document.body.style.background = '';
        showToast('🌙 الوضع الداكن');
    }
}

function toggleVibration() {
    GameState.vibrationEnabled = document.getElementById('vibration-toggle').checked;
}

function resetScores() {
    if (confirm('هل أنت متأكد من مسح جميع النقاط؟')) {
        GameState.leaderboard = {};
        localStorage.removeItem('leaderboard');
        GameState.players.forEach(p => p.score = 0);
        showToast('🗑️ تم مسح النقاط');
    }
}

// ===== Custom Words =====
function loadCustomWords() {
    renderCustomWords();
}

function addCustomWord() {
    const input = document.getElementById('custom-word-input');
    const word = input.value.trim();
    if (word && !GameState.customWords.includes(word)) {
        GameState.customWords.push(word);
        localStorage.setItem('customWords', JSON.stringify(GameState.customWords));
        input.value = '';
        renderCustomWords();
        AudioSystem.play('click');
        showToast(`✅ تمت إضافة "${word}"`);
    }
}

function removeCustomWord(word) {
    GameState.customWords = GameState.customWords.filter(w => w !== word);
    localStorage.setItem('customWords', JSON.stringify(GameState.customWords));
    renderCustomWords();
}

function renderCustomWords() {
    const list = document.getElementById('custom-words-list');
    list.innerHTML = '';
    GameState.customWords.forEach(word => {
        const tag = document.createElement('div');
        tag.className = 'custom-word-tag';
        tag.innerHTML = `
            <span>${word}</span>
            <button onclick="removeCustomWord('${word}')">✕</button>
        `;
        list.appendChild(tag);
    });
}

// ===== Localization System =====
const Translations = {
    ar: {
        game_title: "برا السالفة",
        quick_play: "لعب سريع",
        one_phone: "هاتف واحد",
        create_room: "إنشاء غرفة",
        join_room: "دخول غرفة",
        settings: "الإعدادات",
        how_to_play: "كيف تلعب؟",
        leaderboard: "المتصدرين",
        start_game: "ابدأ اللعبة!",
        pass_phone: "مرر الهاتف إلى",
        show_role: "اضغط لرؤية دورك",
        role_known: "أنت تعرف الكلمة!",
        role_spy: "أنت المخفي! 🤫",
        next_player: "التالي ➡️",
        voting: "التصويت 🗳️",
        spy_guess: "المخفي يخمن الكلمة!",
        results: "النتائج 🏆",
        lang_changed: "🌐 تم تغيير اللغة إلى العربية",
        label_sound: "المؤثرات الصوتية",
        label_dark_mode: "الوضع الداكن",
        label_vibration: "الاهتزاز",
        label_language: "اللغة",
        label_custom_words: "كلمات مخصصة",
        label_reset_scores: "مسح النقاط",
    },
    en: {
        game_title: "Undercover",
        quick_play: "Quick Play",
        one_phone: "One Phone",
        create_room: "Create Room",
        join_room: "Join Room",
        settings: "Settings",
        how_to_play: "How to Play?",
        leaderboard: "Leaderboard",
        start_game: "Start Game!",
        pass_phone: "Pass phone to",
        show_role: "Tap to see role",
        role_known: "You know the word!",
        role_spy: "You are Undercover! 🤫",
        next_player: "Next ➡️",
        voting: "Voting 🗳️",
        spy_guess: "Undercover is guessing!",
        results: "Results 🏆",
        lang_changed: "🌐 Language changed to English",
        label_sound: "Sound Effects",
        label_dark_mode: "Dark Mode",
        label_vibration: "Vibration",
        label_language: "Language",
        label_custom_words: "Custom Words",
        label_reset_scores: "Reset Scores",
    },
    de: {
        game_title: "Undercover",
        quick_play: "Schnelles Spiel",
        one_phone: "Ein Handy",
        create_room: "Raum erstellen",
        join_room: "Raum beitreten",
        settings: "Einstellungen",
        how_to_play: "Wie man spielt?",
        leaderboard: "Bestenliste",
        start_game: "Spiel starten!",
        pass_phone: "Handy weitergeben an",
        show_role: "Tippen, um Rolle zu sehen",
        role_known: "Du kennst das Wort!",
        role_spy: "Du bist der Spion! 🤫",
        next_player: "Weiter ➡️",
        voting: "Abstimmung 🗳️",
        spy_guess: "Spion rät das Wort!",
        results: "Ergebnisse 🏆",
        lang_changed: "🌐 Sprache auf Deutsch geändert",
        label_sound: "Soundeffekte",
        label_dark_mode: "Dunkelmodus",
        label_vibration: "Vibration",
        label_language: "Sprache",
        label_custom_words: "Eigene Wörter",
        label_reset_scores: "Punkte zurücksetzen",
    },
    fr: {
        game_title: "Undercover",
        quick_play: "Jeu Rapide",
        one_phone: "Un Téléphone",
        create_room: "Créer une Salle",
        join_room: "Rejoindre une Salle",
        settings: "Paramètres",
        how_to_play: "Comment jouer ?",
        leaderboard: "Classement",
        start_game: "Commencer !",
        pass_phone: "Passez le téléphone à",
        show_role: "Appuyez pour voir le rôle",
        role_known: "Vous connaissez le mot !",
        role_spy: "Vous êtes l'Espion ! 🤫",
        next_player: "Suivant ➡️",
        voting: "Vote 🗳️",
        spy_guess: "L'Espion devine le mot !",
        results: "Résultats 🏆",
        lang_changed: "🌐 Langue changée en Français",
        label_sound: "Effets Sonores",
        label_dark_mode: "Mode Sombre",
        label_vibration: "Vibration",
        label_language: "Langue",
        label_custom_words: "Mots Personnalisés",
        label_reset_scores: "Réinitialiser les scores",
    },
    es: {
        game_title: "Undercover",
        quick_play: "Juego Rápido",
        one_phone: "Un Teléfono",
        create_room: "Crear Sala",
        join_room: "Unirse a Sala",
        settings: "Ajustes",
        how_to_play: "¿Cómo jugar?",
        leaderboard: "Clasificación",
        start_game: "¡Empezar!",
        pass_phone: "Pasar el teléfono a",
        show_role: "Toca para ver rol",
        role_known: "¡Conoces la palabra!",
        role_spy: "¡Eres el Espía! 🤫",
        next_player: "Siguiente ➡️",
        voting: "Votación 🗳️",
        spy_guess: "¡El Espía está adivinando!",
        results: "Resultados 🏆",
        lang_changed: "🌐 Idioma cambiado a Español",
        label_sound: "Efectos de Sonido",
        label_dark_mode: "Modo Oscuro",
        label_vibration: "Vibración",
        label_language: "Idioma",
        label_custom_words: "Palabras Personalizadas",
        label_reset_scores: "Borrar Puntuaciones",
    }
};

function changeLanguage() {
    const lang = document.getElementById('language-select').value;
    const t = Translations[lang];
    if (!t) return;

    // Update UI Elements
    const elements = {
        'menu-title': t.game_title,
        'btn-quick-play .btn-text': t.quick_play,
        'btn-one-phone .btn-text': t.one_phone,
        'btn-create-room .btn-text': t.create_room,
        'btn-join-room .btn-text': t.join_room,
        'btn-start-game span': t.start_game,
        'pass-title': t.pass_phone,
        'btn-show-role span': t.show_role,
        'btn-next-player span': t.next_player,
        'label-sound': t.label_sound,
        'label-dark-mode': t.label_dark_mode,
        'label-vibration': t.label_vibration,
        'label-language': t.label_language,
        'label-custom-words': t.label_custom_words,
        'label-reset-scores': t.label_reset_scores,
    };

    // Update each element if it exists
    for (const [idOrQuery, text] of Object.entries(elements)) {
        const el = document.getElementById(idOrQuery) || document.querySelector(`#${idOrQuery.replace(/ /g, ' #')}`) || document.querySelector(`.${idOrQuery}`) || document.querySelector(idOrQuery);
        if (el) el.textContent = text;
    }

    // Special case for some IDs
    if (document.querySelector('.menu-title')) document.querySelector('.menu-title').textContent = t.game_title;
    
    // Update direction for Arabic vs Others
    document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;

    showToast(t.lang_changed);
    AudioSystem.play('click');
}

// ===== Tutorial System =====
const TutorialSteps = [
    { title: "🎭 ما هي اللعبة؟", text: "لعبة تعتمد على الذكاء، الجميع يعرف الكلمة السرية إلا شخص واحد هو 'الجاسوس'.", icon: "🕵️" },
    { title: "💡 التلميحات", text: "كل لاعب يعطي تلميحاً عن الكلمة دون فضحها، الجاسوس يحاول التظاهر بأنه يعرف الكلمة.", icon: "💬" },
    { title: "🗳️ التصويت", text: "بعد التلميحات، يتم التصويت على من تعتقدون أنه الجاسوس.", icon: "🗳️" },
    { title: "🎯 كشف الكلمة", text: "إذا تم كشف الجاسوس، لديه فرصة أخيرة لتخمين الكلمة ليفوز!", icon: "✨" }
];

let currentTutorialStep = 0;

function startTutorial() {
    currentTutorialStep = 0;
    showTutorialStep();
}

function showTutorialStep() {
    const step = TutorialSteps[currentTutorialStep];
    const overlay = document.createElement('div');
    overlay.id = 'tutorial-overlay';
    overlay.className = 'tutorial-overlay';
    overlay.innerHTML = `
        <div class="tutorial-card">
            <div class="tutorial-icon">${step.icon}</div>
            <h3>${step.title}</h3>
            <p>${step.text}</p>
            <div class="tutorial-footer">
                <span class="step-count">${currentTutorialStep + 1}/${TutorialSteps.length}</span>
                <button onclick="nextTutorialStep()">${currentTutorialStep === TutorialSteps.length - 1 ? 'فهمت! 👍' : 'التالي ➡️'}</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    AudioSystem.play('click');
}

function nextTutorialStep() {
    document.getElementById('tutorial-overlay').remove();
    currentTutorialStep++;
    if (currentTutorialStep < TutorialSteps.length) {
        showTutorialStep();
    } else {
        showToast('🎓 أنت الآن جاهز للعب!');
        showScreen('main-menu');
    }
}
function showToast(message) {
    let toast = document.querySelector('.toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

function launchConfetti() {
    const container = document.createElement('div');
    container.className = 'confetti-container';
    document.body.appendChild(container);

    const colors = ['#6C5CE7', '#FF6B6B', '#00D2D3', '#FECA57', '#55EFC4', '#FFA07A', '#A29BFE'];

    for (let i = 0; i < 50; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = Math.random() * 100 + '%';
        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDelay = Math.random() * 2 + 's';
        piece.style.animationDuration = (2 + Math.random() * 2) + 's';

        // Random shapes
        if (Math.random() > 0.5) {
            piece.style.borderRadius = '50%';
        } else {
            piece.style.width = '8px';
            piece.style.height = '14px';
        }

        container.appendChild(piece);
    }

    setTimeout(() => container.remove(), 5000);
}

// ===== Keyboard shortcuts =====
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const activeScreen = document.querySelector('.screen.active');
        if (activeScreen) {
            if (activeScreen.id === 'hint-screen') {
                submitHint();
            } else if (activeScreen.id === 'pass-phone-screen') {
                showRole();
            }
        }
    }
});

// Prevent zoom on double tap (mobile)
document.addEventListener('touchstart', (e) => {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
}, { passive: false });

let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, false);
