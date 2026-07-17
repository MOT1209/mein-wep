// ======================================
// برا السالفة — Online Server
// Express + Socket.IO for Real-time Rooms
// ======================================

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*' }
});

// Serve static files
app.use(express.static(path.join(__dirname)));

// Root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check
app.get('/health', (req, res) => res.send('OK'));

// ===== Room Storage =====
const rooms = new Map();

// Room structure
function createRoom(hostId, hostName) {
    const code = generateCode();
    const room = {
        code,
        hostId,
        players: [{
            id: hostId,
            name: hostName,
            avatar: '😎',
            score: 0,
            ready: true,
            isHost: true
        }],
        settings: {
            mode: 'questions',
            category: 'random',
            turnTime: 15,
            totalRounds: 3,
            blitzMode: false,
            doubleSpy: false,
        },
        gameState: null, // null = lobby, object = in-game
        currentRound: 0,
        history: [], // Track results of each round
    };
    rooms.set(code, room);
    return room;
}

function generateCode() {
    let code;
    do {
        code = Math.floor(10000 + Math.random() * 90000).toString();
    } while (rooms.has(code));
    return code;
}

const AVATARS = ['😎', '🤠', '😈', '🤓', '😺', '🦊', '🐵', '🦁', '🐯', '🐻', '🐼', '🐸'];

// ===== Words (server copy for online mode) =====
const WORDS = {
    animals: ['أسد', 'نمر', 'فيل', 'زرافة', 'قرد', 'دب', 'ذئب', 'ثعلب', 'أرنب', 'غزال', 'حصان', 'جمل', 'بقرة', 'خروف', 'دجاجة', 'بطة', 'نسر', 'صقر', 'بومة', 'ببغاء', 'تمساح', 'سلحفاة', 'ثعبان', 'سحلية', 'ضفدع', 'دلفين', 'حوت', 'قرش', 'أخطبوط', 'فراشة', 'نحلة', 'عنكبوت', 'عقرب', 'نملة', 'خنفساء', 'فهد', 'وحيد القرن', 'فرس النهر', 'باندا', 'كوالا', 'كنغر', 'بطريق', 'لاما', 'طاووس', 'حمار', 'قط', 'كلب', 'حمامة', 'غراب', 'نعامة'],
    countries: ['مصر', 'السعودية', 'الإمارات', 'الكويت', 'قطر', 'البحرين', 'عمان', 'العراق', 'الأردن', 'لبنان', 'سوريا', 'فلسطين', 'اليمن', 'ليبيا', 'تونس', 'الجزائر', 'المغرب', 'السودان', 'موريتانيا', 'الصومال', 'أمريكا', 'بريطانيا', 'فرنسا', 'ألمانيا', 'إيطاليا', 'إسبانيا', 'البرازيل', 'الأرجنتين', 'اليابان', 'الصين', 'كوريا', 'الهند', 'تركيا', 'إيران', 'روسيا', 'كندا', 'أستراليا', 'المكسيك', 'تايلاند', 'ماليزيا'],
    food: ['كبسة', 'مندي', 'برياني', 'شاورما', 'فلافل', 'حمص', 'كشري', 'محشي', 'ملوخية', 'مسخن', 'منسف', 'كنافة', 'بقلاوة', 'بسبوسة', 'شوكولاتة', 'آيس كريم', 'كيك', 'بيتزا', 'برجر', 'هوت دوج', 'سوشي', 'نودلز', 'رز', 'مكرونة', 'سلطة', 'شوربة', 'سندويش', 'فطيرة', 'كرواسون', 'دونات'],
    football: ['ميسي', 'رونالدو', 'نيمار', 'مبابي', 'هالاند', 'صلاح', 'بنزيما', 'مودريتش', 'كروس', 'راموس', 'بيكهام', 'رونالدينيو', 'زيدان', 'هنري', 'ماردونا', 'بيليه', 'نوير', 'ليفاندوفسكي', 'دي بروين', 'فان دايك'],
    movies: ['تيتانيك', 'أفاتار', 'الأسد الملك', 'علاء الدين', 'فروزن', 'سبايدرمان', 'باتمان', 'سوبرمان', 'هاري بوتر', 'سيد الخواتم', 'المنتقمون', 'أيرون مان', 'جوكر', 'إنسبشن', 'إنترستيلر', 'ماتريكس', 'جون ويك', 'ستار وورز', 'كارز', 'نيمو'],
    celebrities: ['محمد عبده', 'عبدالمجيد عبدالله', 'أم كلثوم', 'فيروز', 'كاظم الساهر', 'نانسي عجرم', 'تامر حسني', 'عمرو دياب', 'ذا روك', 'ويل سميث', 'ليوناردو دي كابريو', 'إيلون ماسك', 'بيل غيتس', 'عادل إمام', 'ناصر القصبي'],
    jobs: ['طبيب', 'مهندس', 'معلم', 'محامي', 'طيار', 'رائد فضاء', 'شرطي', 'إطفائي', 'طباخ', 'حلاق', 'نجار', 'كهربائي', 'سائق', 'صيدلي', 'مبرمج', 'مصمم', 'محاسب', 'مخرج', 'صحفي', 'قاضي'],
    clothes: ['ثوب', 'شماغ', 'بشت', 'عباية', 'فستان', 'تنورة', 'قميص', 'بنطلون', 'جينز', 'تيشيرت', 'جاكيت', 'معطف', 'حذاء', 'قبعة', 'نظارة', 'ساعة', 'حقيبة', 'بيجامة', 'كرافتة', 'شورت'],
    cartoons: ['سبونج بوب', 'توم وجيري', 'كابتن ماجد', 'المحقق كونان', 'دراغون بول', 'ناروتو', 'ون بيس', 'بن تن', 'ميكي ماوس', 'سكوبي دو', 'بوكيمون', 'لوني تونز', 'غامبول', 'باغز باني', 'ليدي باغ'],
    games: ['ماينكرافت', 'فورتنايت', 'ببجي', 'كول أوف ديوتي', 'فيفا', 'فالورانت', 'أمونق أس', 'روبلوكس', 'ماريو', 'زيلدا', 'كلاش أوف كلانز', 'جنشن إمباكت', 'غود أوف وور', 'أساسنز كريد', 'ريزدنت إيفل'],
    things: ['هاتف', 'لابتوب', 'تلفزيون', 'ثلاجة', 'سيارة', 'طائرة', 'كاميرا', 'ساعة', 'نظارة', 'حقيبة', 'مفتاح', 'قلم', 'كتاب', 'كرسي', 'مرآة', 'مظلة', 'حذاء', 'خاتم', 'عطر', 'سماعة'],
    random: ['مدرسة', 'مستشفى', 'مطار', 'مسجد', 'ملعب', 'شاطئ', 'جبل', 'صحراء', 'بحر', 'جزيرة', 'قمر', 'كرة قدم', 'شطرنج', 'يوتيوب', 'واتساب', 'حفلة', 'عرس', 'عيد', 'رمضان', 'قوس قزح'],
};

const ATTRIBUTE_QUESTIONS = [
    'ما هو لونه؟', 'كم حجمه تقريباً؟', 'أين تجده عادة؟', 'من يستخدمه؟', 'ما هي فائدته الأساسية؟',
    'هل هو غالي الثمن؟', 'ما هي مادته (خشب، حديد...)؟', 'متى نستخدمه؟', 'هل تحبه؟ ولماذا؟',
    'أين يوضع في البيت؟', 'هل له صوت؟ وكيف صوته؟', 'هل هو خطير؟', 'كم عمره الافتراضي؟',
    'هل هو ثقيل أم خفيف؟', 'كيف رائحته؟', 'هل يعمل بالكهرباء؟', 'هل يحتاج صيانة؟',
    'ماذا تفعل به؟', 'هل يمكن شراؤه من السوبرماركت؟', 'هل هو للأطفال أم للكبار؟',
];

function getRandomWord(category) {
    let pool = [];
    if (category === 'random') {
        Object.values(WORDS).forEach(w => pool = pool.concat(w));
    } else {
        pool = WORDS[category] || WORDS.random;
    }
    return pool[Math.floor(Math.random() * pool.length)];
}

// ===== Socket.IO Events =====
io.on('connection', (socket) => {
    console.log(`🔌 متصل: ${socket.id}`);

    // === Create Room ===
    socket.on('create-room', ({ playerName }, callback) => {
        const room = createRoom(socket.id, playerName);
        socket.join(room.code);
        console.log(`🏠 غرفة جديدة: ${room.code} بواسطة ${playerName}`);
        callback({ success: true, code: room.code, room: sanitizeRoom(room) });
    });

    // === Join Room ===
    socket.on('join-room', ({ code, playerName }, callback) => {
        const room = rooms.get(code);

        if (!room) {
            callback({ success: false, error: 'الغرفة غير موجودة' });
            return;
        }

        if (room.players.length >= 12) {
            callback({ success: false, error: 'الغرفة ممتلئة (الحد الأقصى 12)' });
            return;
        }

        if (room.gameState) {
            callback({ success: false, error: 'اللعبة بدأت بالفعل' });
            return;
        }

        // Check duplicate name
        if (room.players.some(p => p.name === playerName)) {
            playerName = playerName + ' ' + Math.floor(Math.random() * 100);
        }

        const avatarIndex = room.players.length % AVATARS.length;
        room.players.push({
            id: socket.id,
            name: playerName,
            avatar: AVATARS[avatarIndex],
            score: 0,
            ready: false,
            isHost: false
        });

        socket.join(code);
        console.log(`🚪 ${playerName} دخل الغرفة ${code}`);

        callback({ success: true, room: sanitizeRoom(room) });

        // Notify all in room
        socket.to(code).emit('player-joined', {
            player: { name: playerName, avatar: AVATARS[avatarIndex], ready: false },
            room: sanitizeRoom(room)
        });
    });

    // === Toggle Ready ===
    socket.on('toggle-ready', ({ code }) => {
        const room = rooms.get(code);
        if (!room) return;

        const player = room.players.find(p => p.id === socket.id);
        if (player) {
            player.ready = !player.ready;
            io.to(code).emit('room-updated', { room: sanitizeRoom(room) });
        }
    });

    // === Update Settings (Host Only) ===
    socket.on('update-settings', ({ code, settings }) => {
        const room = rooms.get(code);
        if (!room) return;
        if (room.hostId !== socket.id) return;

        room.settings = { ...room.settings, ...settings };
        io.to(code).emit('room-updated', { room: sanitizeRoom(room) });
    });

    // === Start Game (Host Only) ===
    socket.on('start-game', ({ code }) => {
        const room = rooms.get(code);
        if (!room) return;
        if (room.hostId !== socket.id) return;
        if (room.players.length < 3) {
            socket.emit('error-msg', { message: 'يجب أن يكون هناك 3 لاعبين على الأقل' });
            return;
        }

        // Start round
        startOnlineRound(room);
    });

    // === Submit Hint (Online) ===
    socket.on('submit-hint', ({ code, hint }) => {
        const room = rooms.get(code);
        if (!room || !room.gameState) return;

        const gs = room.gameState;
        const player = room.players.find(p => p.id === socket.id);
        if (!player) return;

        let hintText = hint;
        if (room.settings.mode === 'questions') {
            hintText = `سأل ${player.askedTarget || 'أحد اللاعبين'}`;
        }

        // Check for forbidden word
        if (gs.forbiddenWord && hint.includes(gs.forbiddenWord) && !gs.spyIds.includes(socket.id)) {
            hintText = '🚫 [تلميح محذوف لاستخدام كلمة محظورة!]';
            player.score -= 1; // Penalty
        }

        gs.hints.push({ playerName: player.name, avatar: player.avatar, text: hintText });
        gs.hintsReceived++;

        io.to(code).emit('hint-submitted', {
            playerName: player.name,
            avatar: player.avatar,
            hint: hintText,
            question: question,
            total: gs.hintsReceived,
            needed: room.players.length
        });

        // All hints received → move to voting
        if (gs.hintsReceived >= room.players.length) {
            gs.phase = 'voting';
            io.to(code).emit('phase-change', { phase: 'voting', hints: gs.hints });
        }
    });

    // === Submit Vote (Online) ===
    socket.on('submit-vote', ({ code, votedForName }) => {
        const room = rooms.get(code);
        if (!room || !room.gameState) return;

        const gs = room.gameState;

        // Prevent double voting
        if (gs.votedPlayers.has(socket.id)) return;
        gs.votedPlayers.add(socket.id);

        if (!gs.votes[votedForName]) gs.votes[votedForName] = 0;
        gs.votes[votedForName]++;

        io.to(code).emit('vote-cast', {
            total: gs.votedPlayers.size,
            needed: room.players.length
        });

        // All votes in
        if (gs.votedPlayers.size >= room.players.length) {
            resolveOnlineRound(room);
        }
    });

    // === Spy Guess (Online) ===
    socket.on('spy-guess', ({ code, guess }) => {
        const room = rooms.get(code);
        if (!room || !room.gameState) return;

        const gs = room.gameState;
        const correct = guess === gs.word;

        finalizeOnlineResults(room, true, correct);
    });

    // === Next Round (Host) ===
    socket.on('next-round', ({ code }) => {
        const room = rooms.get(code);
        if (!room) return;
        if (room.hostId !== socket.id) return;

        if (room.currentRound >= room.settings.totalRounds) {
            // Game over → show final leaderboard + summary
            const summary = {
                totalRounds: room.settings.totalRounds,
                topScorer: room.players.sort((a, b) => b.score - a.score)[0].name,
                spies: room.players.filter(p => p.isHost).name, // This is wrong, I need to track spies better
            };

            io.to(code).emit('game-over', {
                players: room.players.map(p => ({ name: p.name, avatar: p.avatar, score: p.score })),
                summary: generateSummary(room)
            });
            room.gameState = null;
            room.currentRound = 0;
        } else {
            startOnlineRound(room);
        }
    });

    // === Leave Room ===
    socket.on('leave-room', ({ code }) => {
        handleLeave(socket, code);
    });

    // === Disconnect ===
    socket.on('disconnect', () => {
        console.log(`🔌 مفصول: ${socket.id}`);
        // Find and leave any rooms
        rooms.forEach((room, code) => {
            handleLeave(socket, code);
        });
    });

    // === Chat Message ===
    socket.on('chat-message', ({ code, message }) => {
        const room = rooms.get(code);
        if (!room) return;
        const player = room.players.find(p => p.id === socket.id);
        if (!player) return;

        io.to(code).emit('chat-message', {
            playerName: player.name,
            avatar: player.avatar,
            message
        });
    });

    // === Emoji Reaction ===
    socket.on('send-reaction', ({ code, emoji }) => {
        const room = rooms.get(code);
        if (!room) return;
        const player = room.players.find(p => p.id === socket.id);
        if (!player) return;

        io.to(code).emit('receive-reaction', {
            playerName: player.name,
            emoji
        });
    });
});

// ===== Game Logic =====
function startOnlineRound(room) {
    room.currentRound++;
    const word = getRandomWord(room.settings.category);
    
    // Choose spy indices
    const spyIndices = [];
    const spyCount = (room.settings.doubleSpy && room.players.length >= 5) ? 2 : 1;
    
    while (spyIndices.length < spyCount) {
        const idx = Math.floor(Math.random() * room.players.length);
        if (!spyIndices.includes(idx)) spyIndices.push(idx);
    }

    // Blitz Mode adjustments
    const baseTime = room.settings.blitzMode ? 7 : 15;

    // Forbidden word challenge (1 in 3 rounds)
    let forbiddenWord = null;
    if (Math.random() < 0.33) {
        do {
            forbiddenWord = getRandomWord(room.settings.category);
        } while (forbiddenWord === word);
    }

    // Assign questions if in questions mode
    const targetsMap = {};
    if (room.settings.mode === 'questions') {
        room.players.forEach((p, idx) => {
            let targetIdx;
            do {
                targetIdx = Math.floor(Math.random() * room.players.length);
            } while (targetIdx === idx);
            p.askedTarget = room.players[targetIdx].name;
            targetsMap[p.id] = p.askedTarget;
        });
    }

    room.gameState = {
        word,
        forbiddenWord,
        spyIds: spyIndices.map(idx => room.players[idx].id),
        spyNames: spyIndices.map(idx => room.players[idx].name),
        phase: 'reveal', // reveal → hints → voting → results
        hints: [],
        hintsReceived: 0,
        votes: {},
        votedPlayers: new Set(),
    };

    // Send roles to each player (only reveal their own role)
    room.players.forEach((player, i) => {
        const isSpy = spyIndices.includes(i);
        io.to(player.id).emit('round-start', {
            round: room.currentRound,
            totalRounds: room.settings.totalRounds,
            role: isSpy ? 'spy' : 'normal',
            word: isSpy ? null : word,
            forbiddenWord: isSpy ? null : forbiddenWord, // Spies don't know it
            category: room.settings.category,
            turnTime: baseTime,
            mode: room.settings.mode,
            players: room.players.map(p => ({ name: p.name, avatar: p.avatar })),
        });
    });

    // If mode is questions, pick a target for each player to ask
    if (room.settings.mode === 'questions') {
        room.players.forEach((p, idx) => {
            let targetIdx;
            do {
                targetIdx = Math.floor(Math.random() * room.players.length);
            } while (targetIdx === idx);
            p.askedTarget = room.players[targetIdx].name;
        });
    } else {
        room.players.forEach(p => p.askedTarget = null);
    }

    // After a delay, move to hints phase
    setTimeout(() => {
        if (room.gameState) {
            room.gameState.phase = 'hints';

            io.to(room.code).emit('phase-change', {
                phase: 'hints',
                targets: room.players.reduce((acc, p) => {
                    acc[p.id] = p.askedTarget;
                    return acc;
                }, {})
            });
        }
    }, (baseTime + 3) * 1000);
}

function resolveOnlineRound(room) {
    const gs = room.gameState;

    // Find most voted
    let maxVotes = 0;
    let mostVoted = '';
    Object.entries(gs.votes).forEach(([name, count]) => {
        if (count > maxVotes) {
            maxVotes = count;
            mostVoted = name;
        }
    });

    const spyCaught = gs.spyNames.includes(mostVoted);

    if (spyCaught) {
        // Give the caught spy a chance to guess
        io.to(room.code).emit('spy-chance', {
            spyName: mostVoted,
            votes: gs.votes
        });
        // Spy has 15 seconds to guess
        setTimeout(() => {
            if (room.gameState && room.gameState.phase === 'voting') {
                finalizeOnlineResults(room, true, false, mostVoted);
            }
        }, 15000);
    } else {
        finalizeOnlineResults(room, false, false);
    }
}

function finalizeOnlineResults(room, spyCaught, spyGuessedCorrectly, caughtSpyName = null) {
    const gs = room.gameState;
    if (!gs) return;
    gs.phase = 'results';

    // Calculate scores
    if (spyCaught && !spyGuessedCorrectly) {
        // Only the caught spy loses if there are two spies? Or all spies?
        // Let's say: if any spy caught, all non-spies get 2 points.
        room.players.forEach(p => {
            if (!gs.spyIds.includes(p.id)) p.score += 2;
        });
    } else {
        // Spies win if no one caught or spy guessed correctly
        room.players.forEach(p => {
            if (gs.spyIds.includes(p.id)) p.score += 3;
        });
    }

    io.to(room.code).emit('round-results', {
        spyCaught,
        spyGuessedCorrectly,
        spyName: gs.spyNames.join(' و '), // Show all spies
        word: gs.word,
        votes: gs.votes,
        players: room.players.map(p => ({ name: p.name, avatar: p.avatar, score: p.score })),
        round: room.currentRound,
        totalRounds: room.settings.totalRounds,
    });

    // Save history
    room.history.push({
        round: room.currentRound,
        spyNames: gs.spyNames,
        spyCaught,
        spyGuessedCorrectly,
        word: gs.word
    });
}

function generateSummary(room) {
    const summary = {
        totalRounds: room.settings.totalRounds,
        topScorer: room.players.sort((a, b) => b.score - a.score)[0].name,
        history: room.history,
        totalSpiesCaught: room.history.filter(h => h.spyCaught).length,
    };
    return summary;
}

function handleLeave(socket, code) {
    const room = rooms.get(code);
    if (!room) return;

    const playerIndex = room.players.findIndex(p => p.id === socket.id);
    if (playerIndex === -1) return;

    const leaving = room.players[playerIndex];
    room.players.splice(playerIndex, 1);
    socket.leave(code);

    console.log(`🚪 ${leaving.name} غادر الغرفة ${code}`);

    if (room.players.length === 0) {
        rooms.delete(code);
        console.log(`🗑️ حذف الغرفة الفارغة ${code}`);
        return;
    }

    // If host left, assign new host
    if (leaving.isHost && room.players.length > 0) {
        room.players[0].isHost = true;
        room.hostId = room.players[0].id; // Fix: Update hostId on the room object
        io.to(code).emit('room-updated', { room: sanitizeRoom(room) }); // Notify update
    }

    io.to(code).emit('player-left', {
        playerName: leaving.name,
        room: sanitizeRoom(room)
    });

    // Check game progression if in game
    if (room.gameState) {
        const gs = room.gameState;

        // If a spy left, end round immediately
        if (gs.spyIds.includes(leaving.id)) {
            io.to(code).emit('error-msg', { message: 'أحد الجواسيس غادر اللعبة! انتهت الجولة.' });
            room.gameState = null; 
            return;
        }

        // Check if we can advance phases based on new player count
        if (gs.phase === 'hints') {
            if (gs.hintsReceived >= room.players.length) {
                gs.phase = 'voting';
                io.to(code).emit('phase-change', { phase: 'voting', hints: gs.hints });
            }
        } else if (gs.phase === 'voting') {
            if (gs.votedPlayers.size >= room.players.length) {
                resolveOnlineRound(room);
            }
        }
    }
}

function sanitizeRoom(room) {
    return {
        code: room.code,
        players: room.players.map(p => ({
            id: p.id, // Include ID for client-side checks if needed
            name: p.name,
            avatar: p.avatar,
            score: p.score,
            ready: p.ready,
            isHost: p.isHost // room.hostId === p.id
        })),
        settings: room.settings,
        currentRound: room.currentRound,
        isInGame: !!room.gameState,
        hostId: room.hostId // Send host ID
    };
}

// ===== Cleanup stale rooms every 30 minutes =====
setInterval(() => {
    const now = Date.now();
    rooms.forEach((room, code) => {
        if (room.players.length === 0) {
            rooms.delete(code);
        }
    });
}, 30 * 60 * 1000);

// ===== Start Server =====
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`
    ╔══════════════════════════════════════╗
    ║   🎭 برا السالفة — Server Running    ║
    ║   📡 http://localhost:${PORT}           ║
    ╚══════════════════════════════════════╝
    `);
});
