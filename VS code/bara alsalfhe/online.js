// ======================================
// برا السالفة — Online Client (Socket.IO)
// ======================================

const OnlineGame = {
    socket: null,
    roomCode: null,
    isHost: false,
    myName: '',
    myRole: null, // 'spy' or 'normal'
    myWord: null,
    hintSubmitted: false,
    voteSubmitted: false,

    // ===== Connection =====
    connect() {
        if (this.socket && this.socket.connected) return;

        // Connect to server (auto-detect URL)
        const serverUrl = window.location.origin;
        this.socket = io(serverUrl, {
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });

        this.socket.on('connect', () => {
            console.log('🔌 متصل بالسيرفر');
            this.updateConnectionStatus(true);
            AudioSystem.play('join');
        });

        this.socket.on('disconnect', () => {
            console.log('🔌 انقطع الاتصال');
            this.updateConnectionStatus(false);
        });

        this.socket.on('connect_error', (err) => {
            console.log('❌ خطأ في الاتصال:', err.message);
            this.updateConnectionStatus(false);
            showToast('❌ لا يمكن الاتصال بالسيرفر');
        });

        // ===== Room Events =====
        this.socket.on('player-joined', (data) => {
            AudioSystem.play('join');
            showToast(`🚪 ${data.player.name} دخل الغرفة!`);
            this.updateRoomUI(data.room);
        });

        this.socket.on('player-left', (data) => {
            showToast(`👋 ${data.playerName} غادر الغرفة`);
            this.updateRoomUI(data.room);
        });

        this.socket.on('room-updated', (data) => {
            this.updateRoomUI(data.room);
        });

        this.socket.on('error-msg', (data) => {
            AudioSystem.play('error');
            showToast(`❌ ${data.message}`);
        });

        // ===== Game Events =====
        this.socket.on('round-start', (data) => {
            AudioSystem.play('round_start');
            AudioSystem.vibrate([100, 50, 100]);
            this.onRoundStart(data);
        });

        this.socket.on('phase-change', (data) => {
            this.onPhaseChange(data);
        });

        this.socket.on('hint-submitted', (data) => {
            AudioSystem.play('hint');
            this.onHintReceived(data);
        });

        this.socket.on('vote-cast', (data) => {
            AudioSystem.play('vote');
            this.onVoteCast(data);
        });

        this.socket.on('spy-chance', (data) => {
            this.onSpyChance(data);
        });

        this.socket.on('round-results', (data) => {
            this.onRoundResults(data);
        });

        this.socket.on('game-over', (data) => {
            this.onGameOver(data);
        });

        this.socket.on('chat-message', (data) => {
            this.onChatMessage(data);
        });

        this.socket.on('receive-reaction', (data) => {
            this.showFloatingEmoji(data.emoji, data.playerName);
        });

        // Add input listener for chat
        document.getElementById('online-chat-input')?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
    },

    updateConnectionStatus(connected) {
        const statuses = document.querySelectorAll('.connection-status');
        statuses.forEach(el => {
            const dot = el.querySelector('.status-dot');
            const text = el.querySelector('.status-text');
            if (dot) {
                dot.classList.toggle('online', connected);
                dot.classList.toggle('offline', !connected);
            }
            if (text) text.textContent = connected ? 'متصل ✓' : 'غير متصل';
        });
    },

    // ===== Create Room =====
    createRoom() {
        const nameInput = document.getElementById('create-player-name');
        const name = nameInput?.value.trim();
        if (!name) {
            AudioSystem.play('error');
            showToast('❌ أدخل اسمك أولاً!');
            nameInput?.focus();
            return;
        }

        this.myName = name;
        this.isHost = true;
        this.connect();

        // Wait for connection
        const tryCreate = () => {
            if (!this.socket?.connected) {
                showToast('⏳ جاري الاتصال...');
                setTimeout(tryCreate, 1000);
                return;
            }

            this.socket.emit('create-room', { playerName: name }, (response) => {
                if (response.success) {
                    this.roomCode = response.code;
                    AudioSystem.play('start');

                    // Update UI
                    document.getElementById('room-code').textContent = response.code;
                    document.getElementById('create-name-step').classList.add('hidden');
                    document.getElementById('create-lobby-step').classList.remove('hidden');

                    this.updateRoomUI(response.room);
                    showToast(`🏠 تم إنشاء الغرفة: ${response.code}`);
                } else {
                    AudioSystem.play('error');
                    showToast(`❌ ${response.error || 'فشل إنشاء الغرفة'}`);
                }
            });
        };

        setTimeout(tryCreate, 500);
    },

    // ===== Join Room =====
    joinRoom() {
        const nameInput = document.getElementById('join-player-name');
        const name = nameInput?.value.trim();
        if (!name) {
            AudioSystem.play('error');
            showToast('❌ أدخل اسمك أولاً!');
            nameInput?.focus();
            return;
        }

        // Get code from inputs
        const codeInputs = document.querySelectorAll('#join-room-screen .code-input');
        let code = '';
        codeInputs.forEach(input => code += input.value);

        if (code.length !== 5) {
            AudioSystem.play('error');
            showToast('❌ أدخل رمز الغرفة كاملاً (5 أرقام)');
            return;
        }

        this.myName = name;
        this.isHost = false;
        this.connect();

        const tryJoin = () => {
            if (!this.socket?.connected) {
                showToast('⏳ جاري الاتصال...');
                setTimeout(tryJoin, 1000);
                return;
            }

            this.socket.emit('join-room', { code, playerName: name }, (response) => {
                if (response.success) {
                    this.roomCode = code;
                    AudioSystem.play('join');

                    // Switch to lobby view
                    document.getElementById('join-form-step').classList.add('hidden');
                    document.getElementById('join-lobby-step').classList.remove('hidden');
                    document.getElementById('join-room-code-display').textContent = code;

                    this.updateRoomUI(response.room, 'join');
                    showToast('✅ تم الدخول للغرفة!');
                } else {
                    AudioSystem.play('error');
                    showToast(`❌ ${response.error || 'فشل دخول الغرفة'}`);
                }
            });
        };

        setTimeout(tryJoin, 500);
    },

    // ===== Toggle Ready =====
    toggleReady() {
        if (!this.socket || !this.roomCode) return;
        AudioSystem.play('click');
        this.socket.emit('toggle-ready', { code: this.roomCode });

        const btn = document.getElementById('ready-btn-text');
        if (btn.textContent.includes('جاهز')) {
            btn.textContent = '⏸️ مش جاهز';
        } else {
            btn.textContent = '✋ أنا جاهز!';
        }
    },

    // ===== Update Settings (Host) =====
    updateSettings() {
        if (!this.socket || !this.isHost || !this.roomCode) return;

        const settings = {
            mode: document.getElementById('room-mode-select')?.value || 'classic',
            category: document.getElementById('room-category-select')?.value || 'random',
            totalRounds: parseInt(document.getElementById('room-rounds-select')?.value || '3'),
            blitzMode: document.getElementById('room-blitz-toggle')?.checked || false,
            doubleSpy: document.getElementById('room-double-spy-toggle')?.checked || false,
        };

        this.socket.emit('update-settings', { code: this.roomCode, settings });
    },

    // ===== Start Game (Host) =====
    startGame() {
        if (!this.socket || !this.isHost || !this.roomCode) return;
        AudioSystem.play('start');
        this.socket.emit('start-game', { code: this.roomCode });
    },

    // ===== Submit Hint =====
    submitHint() {
        if (this.hintSubmitted) return;
        const input = document.getElementById('online-hint-input');
        const hint = input?.value.trim() || 'لم يلمّح';

        this.hintSubmitted = true;
        AudioSystem.play('hint');
        this.socket.emit('submit-hint', { code: this.roomCode, hint });

        input.disabled = true;
        document.getElementById('online-hint-status').textContent = '✅ تم إرسال تلميحك! بانتظار الباقين...';
    },

    // ===== Submit Vote (Online) =====
    submitVote(playerName) {
        if (this.voteSubmitted) return;
        this.voteSubmitted = true;
        AudioSystem.play('vote');
        AudioSystem.vibrate([30]);
        this.socket.emit('submit-vote', { code: this.roomCode, votedForName: playerName });

        // Disable all vote buttons
        document.querySelectorAll('#online-voting-players .vote-btn').forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.5';
        });
        showToast('✅ تم تصويتك!');
    },

    // ===== Spy Guess =====
    submitSpyGuess() {
        const input = document.getElementById('online-spy-guess-input');
        const guess = input?.value.trim();
        if (!guess) {
            showToast('❌ اكتب تخمينك!');
            return;
        }
        this.socket.emit('spy-guess', { code: this.roomCode, guess });
    },

    // ===== Next Round =====
    nextRound() {
        if (!this.isHost) return;
        this.socket.emit('next-round', { code: this.roomCode });
    },

    // ===== Leave Room =====
    leaveRoom() {
        if (this.socket && this.roomCode) {
            this.socket.emit('leave-room', { code: this.roomCode });
        }
        this.roomCode = null;
        this.isHost = false;
        this.myRole = null;
        this.myWord = null;
        this.hintSubmitted = false;
        this.voteSubmitted = false;

        // Reset UI
        document.getElementById('create-name-step')?.classList.remove('hidden');
        document.getElementById('create-lobby-step')?.classList.add('hidden');
        document.getElementById('join-form-step')?.classList.remove('hidden');
        document.getElementById('join-lobby-step')?.classList.add('hidden');
    },

    // ===== UI Updates =====
    updateRoomUI(room, context = 'create') {
        // Determine which player list to update
        const isCreateScreen = context === 'create' || this.isHost;

        if (isCreateScreen) {
            const container = document.getElementById('room-players');
            const countEl = document.getElementById('room-player-count');
            if (container) {
                container.innerHTML = '';
                room.players.forEach(p => {
                    container.innerHTML += `
                        <div class="room-player${p.isHost ? ' host' : ''}">
                            <span class="player-avatar">${p.isHost ? '👑' : p.avatar}</span>
                            <span>${p.name}${p.isHost ? ' (صاحب الغرفة)' : ''}</span>
                            <span class="ready-badge ${p.ready ? 'ready' : 'not-ready'}">${p.ready ? 'جاهز ✓' : 'غير جاهز'}</span>
                        </div>
                    `;
                });
            }
            if (countEl) countEl.textContent = room.players.length;
        }

        // Join screen
        const joinContainer = document.getElementById('join-room-players');
        const joinCountEl = document.getElementById('join-player-count');
        if (joinContainer) {
            joinContainer.innerHTML = '';
            room.players.forEach(p => {
                joinContainer.innerHTML += `
                    <div class="room-player${p.isHost ? ' host' : ''}">
                        <span class="player-avatar">${p.isHost ? '👑' : p.avatar}</span>
                        <span>${p.name}${p.isHost ? ' (صاحب الغرفة)' : ''}</span>
                        <span class="ready-badge ${p.ready ? 'ready' : 'not-ready'}">${p.ready ? 'جاهز ✓' : 'غير جاهز'}</span>
                    </div>
                `;
            });
        }
        if (joinCountEl) joinCountEl.textContent = room.players.length;
    },

    // ===== Game Event Handlers =====
    // ===== Chat =====
    sendMessage() {
        if (!this.socket || !this.roomCode) return;
        const input = document.getElementById('online-chat-input');
        const message = input.value.trim();
        if (!message) return;

        this.socket.emit('chat-message', { code: this.roomCode, message });
        input.value = '';
    },

    sendReaction(emoji) {
        if (!this.socket || !this.roomCode) return;
        this.socket.emit('send-reaction', { code: this.roomCode, emoji });
        AudioSystem.play('click');
    },

    showFloatingEmoji(emoji, playerName) {
        const container = document.body;
        const el = document.createElement('div');
        el.className = 'floating-reaction';
        el.innerHTML = `<span class="reaction-emoji">${emoji}</span><span class="reaction-name">${playerName}</span>`;
        
        // Random horizontal position
        const x = Math.random() * 80 + 10;
        el.style.left = `${x}%`;
        el.style.bottom = '20px';
        
        container.appendChild(el);
        
        // Remove after animation
        setTimeout(() => el.remove(), 3000);
    },

    onChatMessage(data) {
        const container = document.getElementById('online-chat-messages');
        if (!container) return;

        const isMine = data.playerName === this.myName;
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-msg ${isMine ? 'mine' : 'others'}`;
        msgDiv.innerHTML = `
            <span class="msg-sender">${isMine ? 'أنت' : data.avatar + ' ' + data.playerName}</span>
            <span class="msg-text">${data.message}</span>
        `;
        container.appendChild(msgDiv);
        container.scrollTop = container.scrollHeight;

        if (!isMine) AudioSystem.play('tick'); // Play soft sound for incoming message
    },

    applyTheme(category) {
        // Remove existing themes
        document.body.className = document.body.className.replace(/theme-\w+/g, '');
        document.body.classList.add(`theme-${category}`);
    },

    onRoundStart(data) {
        this.myRole = data.role;
        this.myWord = data.word;
        this.hintSubmitted = false;
        this.voteSubmitted = false;

        // Apply theme based on category
        this.applyTheme(data.category);

        // Update online game screen
        document.getElementById('online-game-title').textContent = `الجولة ${data.round} 🎮`;
        document.getElementById('online-round-info').textContent = `${data.round}/${data.totalRounds}`;

        const card = document.getElementById('online-role-card');
        card.classList.remove('spy');

        if (data.role === 'spy') {
            card.classList.add('spy');
            document.getElementById('online-role-icon').textContent = '🕵️';
            document.getElementById('online-role-title').textContent = 'أنت المخفي! 🤫';
            document.getElementById('online-role-word').textContent = '؟؟؟';
            document.getElementById('online-role-hint').textContent = 'حاول معرفة الكلمة من تلميحات الآخرين!';
            AudioSystem.play('spy_reveal');
        } else {
            document.getElementById('online-role-icon').textContent = '🎯';
            document.getElementById('online-role-title').textContent = 'أنت تعرف الكلمة!';
            document.getElementById('online-role-word').textContent = data.word;
            
            let hintText = 'قدّم تلميحاً ذكياً دون فضح الكلمة!';
            if (data.forbiddenWord) {
                hintText = `<span style="color: #ff6b6b; font-weight: 800;">⚠️ تحدي: لا تستخدم كلمة "${data.forbiddenWord}" في تلميحك!</span>`;
            }
            document.getElementById('online-role-hint').innerHTML = hintText;
            AudioSystem.play('reveal');
        }

        // Show role, hide others
        document.getElementById('online-role-section').classList.remove('hidden');
        document.getElementById('online-hint-section').classList.add('hidden');
        document.getElementById('online-voting-section').classList.add('hidden');
        document.getElementById('online-spy-guess-section').classList.add('hidden');
        document.getElementById('emoji-reactions-bar').classList.remove('hidden');

        showScreen('online-game-screen');
    },

    onPhaseChange(data) {
        if (data.phase === 'hints') {
            // Show hint input
            document.getElementById('online-role-section').classList.add('hidden');
            document.getElementById('online-hint-section').classList.remove('hidden');
            document.getElementById('online-hints-list').innerHTML = '';

            const input = document.getElementById('online-hint-input');
            const status = document.getElementById('online-hint-status');

            input.disabled = false;
            input.value = '';

            // Check if there's a target for me to ask
            const myId = this.socket.id;
            const btn = document.getElementById('online-submit-hint-btn');
            
            if (data.targets && data.targets[myId]) {
                const targetName = data.targets[myId];
                status.textContent = `يا ${this.myName}.. اسأل ${targetName} سؤالاً!`;
                input.style.display = 'none'; // Verbal mode
                if (btn) btn.textContent = 'تم ✓';

                // Speak the task
                setTimeout(() => {
                    AudioSystem.speak(`يا ${this.myName}.. اسأل ${targetName}`);
                }, 600);
            } else {
                status.textContent = 'قدّم تلميحك الآن!';
                input.style.display = 'block';
                input.placeholder = 'اكتب تلميحك هنا...';
                if (btn) btn.textContent = 'إرسال ✓';
            }

            this.hintSubmitted = false;
            AudioSystem.play('start');
        } else if (data.phase === 'voting') {
            // Show voting
            document.getElementById('online-hint-section').classList.add('hidden');
            document.getElementById('online-voting-section').classList.remove('hidden');

            // Show all hints
            if (data.hints) {
                const hintList = document.getElementById('online-hints-list');
                hintList.innerHTML = '';
                data.hints.forEach(h => {
                    let textDisplay = h.text;

                    hintList.innerHTML += `
                        <div class="hint-item">
                            <span class="hint-player">${h.avatar} ${h.playerName}</span>
                            <span class="hint-text">${textDisplay}</span>
                        </div>
                    `;
                });
                // Move hints list to voting section temporarily
                document.getElementById('online-voting-section').insertBefore(
                    hintList.cloneNode(true),
                    document.getElementById('online-voting-players')
                );
            }

            // Build voting buttons
            const container = document.getElementById('online-voting-players');
            container.innerHTML = '';
            // Use players from available data
            if (data.hints) {
                const uniquePlayers = [...new Set(data.hints.map(h => JSON.stringify({ name: h.playerName, avatar: h.avatar })))].map(s => JSON.parse(s));
                uniquePlayers.forEach(p => {
                    const btn = document.createElement('button');
                    btn.className = 'vote-btn';
                    btn.innerHTML = `
                        <span class="vote-avatar">${p.avatar}</span>
                        <span>${p.name}</span>
                    `;
                    btn.addEventListener('click', () => this.submitVote(p.name));
                    container.appendChild(btn);
                });
            }

            this.voteSubmitted = false;
            AudioSystem.play('countdown');
        }
    },

    onHintReceived(data) {
        const list = document.getElementById('online-hints-list');
        if (!list) return;

        list.innerHTML += `
            <div class="hint-item">
                <span class="hint-player">${data.avatar} ${data.playerName}</span>
                <span class="hint-text">${data.hint}</span>
            </div>
        `;
        document.getElementById('online-hint-status').textContent = `تلميحات: ${data.total}/${data.needed}`;
    },

    onVoteCast(data) {
        showToast(`🗳️ تصويت: ${data.total}/${data.needed}`);
    },

    onSpyChance(data) {
        // Show spy guess section if I'm the spy
        if (this.myRole === 'spy') {
            document.getElementById('online-voting-section').classList.add('hidden');
            document.getElementById('online-spy-guess-section').classList.remove('hidden');
            document.getElementById('online-spy-guess-input').value = '';
            document.getElementById('online-spy-guess-input').focus();
            AudioSystem.play('spy_reveal');
            showToast('🕵️ أنت المخفي! خمّن الكلمة الآن!');
        } else {
            showToast(`🎯 تم كشف المخفي: ${data.spyName}! لديه فرصة للتخمين...`);
        }
    },

    onRoundResults(data) {
        // Reuse the existing results screen
        const resultIcon = document.getElementById('result-icon');
        const resultTitle = document.getElementById('result-title');
        const spyNameEl = document.getElementById('spy-name');
        const resultWordText = document.getElementById('result-word-text');

        spyNameEl.textContent = data.spyName;
        resultWordText.textContent = data.word;

        if (data.spyCaught && !data.spyGuessedCorrectly) {
            resultIcon.textContent = '🎉';
            resultTitle.textContent = 'تم كشف المخفي!';
            resultTitle.classList.remove('spy-wins');
            AudioSystem.play('win');
            launchConfetti();
        } else if (data.spyCaught && data.spyGuessedCorrectly) {
            resultIcon.textContent = '😱';
            resultTitle.textContent = 'المخفي عرف الكلمة!';
            resultTitle.classList.add('spy-wins');
            AudioSystem.play('lose');
        } else {
            resultIcon.textContent = '🕵️';
            resultTitle.textContent = 'المخفي نجا! 😈';
            resultTitle.classList.add('spy-wins');
            AudioSystem.play('lose');
        }

        // Render scores
        const scoresList = document.getElementById('scores-list');
        scoresList.innerHTML = '';
        const sorted = [...data.players].sort((a, b) => b.score - a.score);
        sorted.forEach((player, i) => {
            const item = document.createElement('div');
            item.className = 'score-item';
            item.style.animationDelay = `${i * 0.1}s`;
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
            const spyBadge = player.name === data.spyName ? ' 🕵️' : '';
            item.innerHTML = `
                <span style="font-size:1.3rem;min-width:30px;text-align:center;">${medal}</span>
                <span class="score-name">${player.avatar} ${player.name}${spyBadge}</span>
                <span class="score-points">${player.score}</span>
            `;
            scoresList.appendChild(item);
        });

        // Next round button
        const nextRndBtn = document.getElementById('btn-next-round');
        if (data.round >= data.totalRounds) {
            nextRndBtn.querySelector('.btn-text').textContent = 'النتائج النهائية 🏆';
        } else {
            nextRndBtn.querySelector('.btn-text').textContent = `الجولة ${data.round + 1} 🔄`;
        }

        // Only host can advance
        if (this.isHost) {
            nextRndBtn.onclick = () => this.nextRound();
        } else {
            nextRndBtn.onclick = null;
            nextRndBtn.querySelector('.btn-text').textContent += ' (بانتظار صاحب الغرفة)';
        }

        AudioSystem.vibrate([100, 50, 100, 50, 200]);
        showScreen('results-screen');
    },

    onGameOver(data) {
        // Use leaderboard screen
        const podium = document.getElementById('leaderboard-podium');
        const list = document.getElementById('leaderboard-list');
        const sorted = [...data.players].sort((a, b) => b.score - a.score);

        podium.innerHTML = '';
        const podiumOrder = [1, 0, 2];
        const heights = [120, 90, 60];
        const medals = ['🥇', '🥈', '🥉'];

        podiumOrder.forEach(rank => {
            if (sorted[rank]) {
                const player = sorted[rank];
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

        AudioSystem.play('win');
        launchConfetti();
        document.getElementById('emoji-reactions-bar').classList.add('hidden');
        
        // Show summary in leaderboard screen
        const summary = data.summary;
        if (summary) {
            const container = document.getElementById('leaderboard-players');
            if (container) {
                const summaryHTML = `
                    <div class="match-summary">
                        <h3>📊 ملخص المباراة</h3>
                        <p>الفائز الأول: 👑 ${summary.topScorer}</p>
                        <p>الجواسيس المقبوض عليهم: 🕵️ ${summary.totalSpiesCaught} من ${summary.totalRounds}</p>
                        <div class="round-history-list">
                            ${summary.history.map(h => `
                                <div class="history-item">
                                    الجولة ${h.round}: الجاسوس كان ${h.spyNames.join(', ')} - الكلمة: ${h.word}
                                    <span class="${h.spyCaught ? 'caught' : 'escaped'}">
                                        (${h.spyCaught ? 'تم القبض عليه' : 'هرب'})
                                    </span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
                container.innerHTML = summaryHTML + container.innerHTML;
             }
         }

         // Grant achievements
         this.grantAchievements(data.players, data.summary);

         showScreen('leaderboard-screen');
    },

    grantAchievements(players, summary) {
        if (!summary) return;
        const achievements = JSON.parse(localStorage.getItem('achievements') || '{}');
        const myName = this.myName;
        const me = players.find(p => p.name === myName);
        if (!me) return;

        if (!achievements[myName]) achievements[myName] = [];

        // 1. Winner Badge
        if (summary.topScorer === myName) {
            this.addAchievement(achievements, myName, '🏆 بطل السالفة', 'فزت بالمركز الأول في مباراة!');
        }

        // 2. Spy Catcher
        if (summary.totalSpiesCaught >= 3) {
            this.addAchievement(achievements, myName, '🕵️ صائد الجواسيس', 'كشفت 3 جواسيس في مباراة واحدة!');
        }

        // 3. Master of Deception
        const myRounds = summary.history.filter(h => h.spyNames.includes(myName));
        const escapedRounds = myRounds.filter(h => !h.spyCaught).length;
        if (escapedRounds >= 2) {
            this.addAchievement(achievements, myName, '🤫 سيد الخداع', 'هربت كجاسوس مرتين في مباراة واحدة!');
        }

        localStorage.setItem('achievements', JSON.stringify(achievements));
    },

    addAchievement(achievements, name, title, desc) {
        if (!achievements[name].some(a => a.title === title)) {
            achievements[name].push({ title, desc, date: new Date().toLocaleDateString() });
            showToast(`🎖️ وسام جديد: ${title}!`);
        }
    }
};
