/**
 * i18n – lightweight translation helper for Denkmalen.
 *
 * Usage:
 *   import { t } from '@/lib/i18n'
 *   const label = t('menu.offline', settings.language)
 */

export type Lang = 'en' | 'ar' | 'de'

// ── Translation dictionary ──────────────────────────────────────────
const translations: Record<string, Record<Lang, string>> = {
  // ── Main Menu ──────────────────────────────────────────────────────
  'menu.title':        { en: 'Denkmalen',           ar: 'دنكمالن',                          de: 'Denkmalen' },
  'menu.offline':      { en: 'Offline Mode',        ar: 'وضع بدون إنترنت',                   de: 'Offline-Modus' },
  'menu.online':       { en: 'Online Mode',         ar: 'وضع إنترنت',                        de: 'Online-Modus' },
  'menu.leaderboard':  { en: 'Leaderboard',         ar: 'لوحة المتصدرين',                    de: 'Bestenliste' },
  'menu.statistics':   { en: 'Statistics',          ar: 'الإحصائيات',                        de: 'Statistiken' },
  'menu.settings':     { en: 'Settings',            ar: 'الإعدادات',                         de: 'Einstellungen' },
  'menu.play':         { en: 'Play',                ar: 'العب',                              de: 'Spielen' },
  'menu.headline':     { en: 'Draw words, challenge friends, and let AI judge your art!', ar: 'ارسم الكلمات، تحدَّ أصدقاءك، ودع الذكاء الاصطناعي يحكم على فنك!', de: 'Zeichne Wörter, fordere Freunde heraus und lass die KI deine Kunst bewerten!' },
  'menu.subline':      { en: 'Powered by AI that gives instant, fun feedback on every drawing 🤖', ar: 'مدعوم بذكاء اصطناعي يقدّم ملاحظات فورية وممتعة على كل رسمة 🤖', de: 'Angetrieben von KI, die sofortiges, unterhaltsames Feedback zu jeder Zeichnung gibt 🤖' },
  'menu.demoSoon':     { en: 'Demo video coming soon', ar: 'فيديو تجريبي قريبًا', de: 'Demo-Video kommt bald' },
  'menu.demoLength':   { en: '6 seconds of gameplay', ar: '6 ثوانٍ من اللعب', de: '6 Sekunden Gameplay' },
  'menu.playNow':      { en: 'Play Now',             ar: 'العب الآن',                         de: 'Jetzt spielen' },
  'menu.noDownload':   { en: 'No download needed • Works on any device', ar: 'بدون تحميل • يعمل على أي جهاز', de: 'Kein Download nötig • Funktioniert auf jedem Gerät' },
  'menu.playOnline':   { en: 'Play Online with Friends', ar: 'العب أونلاين مع الأصدقاء',       de: 'Online mit Freunden spielen' },
  'menu.games':        { en: 'Games',                ar: 'ألعاب',                             de: 'Spiele' },
  'menu.wins':         { en: 'Wins',                 ar: 'انتصارات',                          de: 'Siege' },
  'menu.best':         { en: 'Best:',                ar: 'الأفضل:',                           de: 'Beste:' },
  'menu.signInGoogle': { en: 'Sign in with Google',  ar: 'تسجيل الدخول بجوجل',                de: 'Mit Google anmelden' },

  // ── Auth Widget ────────────────────────────────────────────────────
  'auth.signOut':      { en: 'Sign out',             ar: 'تسجيل الخروج',                     de: 'Abmelden' },

  // ── Error Boundary ─────────────────────────────────────────────────
  'error.title':       { en: 'Oops! Something went wrong', ar: 'عذرًا! حدث خطأ ما',            de: 'Hoppla! Etwas ist schiefgelaufen' },
  'error.message':     { en: "We encountered an unexpected error. Don't worry, it's not your fault!", ar: 'واجهنا خطأ غير متوقع. لا تقلق، الأمر ليس خطأك!', de: 'Ein unerwarteter Fehler ist aufgetreten. Keine Sorge, das ist nicht deine Schuld!' },
  'error.tryAgain':    { en: 'Try Again',             ar: 'أعد المحاولة',                     de: 'Erneut versuchen' },
  'error.goHome':      { en: 'Go Home',               ar: 'العودة للرئيسية',                  de: 'Zur Startseite' },

  // ── Game Types ─────────────────────────────────────────────────────
  'gametype.classic':      { en: 'Classic',           ar: 'كلاسيكي',                     de: 'Klassisch' },
  'gametype.letter':       { en: 'Letter Mode',       ar: 'وضع الحرف',                   de: 'Buchstabencode' },
  'gametype.category':     { en: 'Category Mode',     ar: 'وضع التصنيف',                  de: 'Kategoriemodus' },
  'gametype.creative':     { en: 'Creative Challenge', ar: 'تحدي إبداعي',                 de: 'Kreative Herausforderung' },
  'gametype.daily':        { en: 'Daily Challenge',   ar: 'تحدي يومي',                    de: 'Tägliche Herausforderung' },
  'gametype.classic.desc':  { en: 'Draw the secret word!', ar: 'ارسم الكلمة السرية!', de: 'Zeichne das geheime Wort!' },
  'gametype.letter.desc':   { en: 'Draw anything starting with a letter!', ar: 'ارسم أي شيء يبدأ بحرف معين!', de: 'Zeichne etwas, das mit einem Buchstaben beginnt!' },
  'gametype.category.desc': { en: 'Draw from a specific category!', ar: 'ارسم من تصنيف معين!', de: 'Zeichne aus einer bestimmten Kategorie!' },
  'gametype.daily.desc':    { en: 'Same prompt for everyone today!', ar: 'نفس التحدي للجميع اليوم!', de: 'Der gleiche Prompt für alle heute!' },
  'gametype.creative.desc': { en: 'AI-generated creative prompts!', ar: 'تحديات إبداعية من الذكاء الاصطناعي!', de: 'KI-generierte kreative Prompts!' },

  // ── Drawing Screen ─────────────────────────────────────────────────
  'draw.round':        { en: 'Round',             ar: 'الجولة',                          de: 'Runde' },
  'draw.drawing':      { en: 'Drawing…',          ar: 'يرسم…',                           de: 'Zeichnen…' },
  'draw.reveal':       { en: 'Reveal Word',       ar: 'كشف الكلمة',                      de: 'Wort enthüllen' },
  'draw.done':         { en: 'Done',              ar: 'تم',                              de: 'Fertig' },
  'draw.timeLeft':     { en: 'Time Left',         ar: 'الوقت المتبقي',                   de: 'Verbleibende Zeit' },
  'draw.wordHint':     { en: 'Draw this word',    ar: 'ارسم هذه الكلمة',                 de: 'Zeichne dieses Wort' },
  'draw.creativeHint': { en: 'Draw this prompt',  ar: 'ارسم هذا الوصف',                  de: 'Zeichne diesen Prompt' },
  'draw.letter':       { en: 'Letter:',           ar: 'الحرف:',                          de: 'Buchstabe:' },
  'draw.challenge':    { en: 'Challenge:',        ar: 'التحدي:',                         de: 'Herausforderung:' },
  'draw.label':        { en: 'Drawing:',          ar: 'يرسم:',                           de: 'Zeichnet:' },
  'draw.onlyPlayer':   { en: 'should look!',      ar: 'يجب أن ينظر فقط!',               de: 'sollte schauen!' },
  'draw.passDevice':   { en: 'Pass the device to the current player', ar: 'أعِد الجهاز للاعب الحالي', de: 'Gib das Gerät an den aktuellen Spieler weiter' },
  'draw.submitted':    { en: 'Drawing submitted!', ar: 'تم إرسال الرسمة!',                de: 'Zeichnung eingereicht!' },
  'draw.waitingOthers':{ en: 'Waiting for other players', ar: 'بانتظار اللاعبين الآخرين',  de: 'Warte auf andere Spieler' },
  'draw.drawStartsWith': { en: 'Draw something starting with', ar: 'ارسم شيئاً يبدأ بـ',     de: 'Zeichne etwas das beginnt mit' },
  'draw.selectColor':  { en: 'Select Color',      ar: 'اختر اللون',                      de: 'Farbe wählen' },
  'draw.brushSize':    { en: 'Brush Size',        ar: 'حجم الفرشاة',                     de: 'Pinselgröße' },
  'draw.clearCanvas':  { en: 'Clear Canvas?',     ar: 'مسح اللوحة؟',                     de: 'Leinwand löschen?' },
  'draw.clearWarning': { en: 'This action cannot be undone. Your current drawing will be erased.', ar: 'لا يمكن التراجع عن هذا الإجراء. سيتم مسح رسمتك الحالية.', de: 'Diese Aktion kann nicht rückgängig gemacht werden. Deine aktuelle Zeichnung wird gelöscht.' },
  'draw.clear':        { en: 'Clear',             ar: 'مسح',                             de: 'Löschen' },

  // Accessible names for the icon-only drawing tools (no visible text label).
  'tool.undo':         { en: 'Undo',              ar: 'تراجع',                           de: 'Rückgängig' },
  'tool.redo':         { en: 'Redo',              ar: 'إعادة',                           de: 'Wiederholen' },
  'tool.pencil':       { en: 'Pencil',            ar: 'قلم رصاص',                        de: 'Bleistift' },
  'tool.brush':        { en: 'Brush',             ar: 'فرشاة',                           de: 'Pinsel' },
  'tool.marker':       { en: 'Marker',            ar: 'قلم تحديد',                       de: 'Marker' },
  'tool.fill':         { en: 'Fill',              ar: 'تعبئة',                           de: 'Füllen' },
  'tool.eraser':       { en: 'Eraser',            ar: 'ممحاة',                           de: 'Radierer' },
  'tool.zoomIn':       { en: 'Zoom in',           ar: 'تكبير',                           de: 'Vergrößern' },
  'tool.zoomOut':      { en: 'Zoom out',          ar: 'تصغير',                           de: 'Verkleinern' },
  'tool.clearCanvas':  { en: 'Clear canvas',      ar: 'مسح اللوحة',                      de: 'Leinwand löschen' },
  'tool.currentColor': { en: 'Current color',     ar: 'اللون الحالي',                    de: 'Aktuelle Farbe' },
  'tool.colorNamed':   { en: 'Color',             ar: 'لون',                             de: 'Farbe' },

  // ── Voting Screen ──────────────────────────────────────────────────
  'vote.title':        { en: 'Vote for the Best Drawing', ar: 'صوّت لأفضل رسمة',       de: 'Für die beste Zeichnung abstimmen' },
  'vote.submit':       { en: 'Submit Vote',        ar: 'إرسال التصويت',                   de: 'Stimme abgeben' },
  'vote.waiting':      { en: 'Waiting for votes…', ar: 'بانتظار التصويت…',                 de: 'Warte auf Stimmen…' },
  'vote.ranking':      { en: 'Drag to rank',       ar: 'اسحب للترتيب',                    de: 'Zum Sortieren ziehen' },
  'vote.startVoting':  { en: 'Start Voting',       ar: 'ابدأ التصويت',                    de: 'Abstimmung starten' },
  'vote.allVotesIn':   { en: 'All votes are in!',  ar: 'جميع الأصوات وصلت!',              de: 'Alle Stimmen sind da!' },
  'vote.calculating':  { en: 'Calculating results...', ar: 'حساب النتائج…',               de: 'Ergebnisse werden berechnet…' },
  'vote.seeResults':   { en: 'See Results',        ar: 'عرض النتائج',                     de: 'Ergebnisse ansehen' },
  'vote.votesCollected': { en: 'Votes Collected',  ar: 'الأصوات المجمعة',                 de: 'Stimmen gesammelt' },
  'vote.yourDrawing':  { en: 'Your Drawing',       ar: 'رسمتك',                           de: 'Deine Zeichnung' },
  'vote.turnToVote':   { en: "{name}'s turn to vote!", ar: 'دور {name} للتصويت!',          de: '{name} ist mit Abstimmen dran!' },
  'vote.drawingAlt':   { en: "A player's drawing",  ar: 'رسمة أحد اللاعبين',                de: 'Zeichnung eines Spielers' },
  'vote.creativeLabel':{ en: 'Creative Challenge',  ar: 'تحدٍ إبداعي',                      de: 'Kreative Herausforderung' },
  'vote.tapFavorite':  { en: 'Tap on your favorite drawing to vote', ar: 'اضغط على رسمتك المفضلة للتصويت', de: 'Tippe auf deine Lieblingszeichnung, um abzustimmen' },
  'vote.voteFor':      { en: 'vote for the best drawing starting with', ar: 'صوّت لأفضل رسمة تبدأ بـ',  de: 'stimme für die beste Zeichnung, die beginnt mit' },
  'vote.voteForCreative': { en: 'vote for the best creative drawing!', ar: 'صوّت لأفضل رسمة إبداعية!', de: 'stimme für die beste kreative Zeichnung!' },

  // ── Results Screen ─────────────────────────────────────────────────
  'results.round':     { en: 'Round Results',      ar: 'نتائج الجولة',                    de: 'Ergebnisse der Runde' },
  'results.final':     { en: 'Final Score Breakdown', ar: 'تفصيل النتيجة النهائية',       de: 'Endbewertung im Detail' },
  'results.winner':    { en: 'Winner',             ar: 'الفائز',                          de: 'Gewinner' },
  'results.nextRound': { en: 'Next Round',         ar: 'الجولة التالية',                  de: 'Nächste Runde' },
  'results.playAgain': { en: 'Play Again',         ar: 'العب مرة أخرى',                   de: 'Nochmal spielen' },
  'results.backHome':  { en: 'Back to Home',       ar: 'العودة للرئيسية',                 de: 'Zurück zur Startseite' },
  'results.aiAnalyzing': { en: 'AI Judge is Analyzing Drawings...', ar: 'الحكم الذكي يحلل الرسمات…', de: 'KI-Richter analysiert Zeichnungen…' },
  'results.evaluating': { en: 'Evaluating accuracy, creativity, and clarity', ar: 'تقييم الدقة والإبداع والوضوح', de: 'Bewertung von Genauigkeit, Kreativität und Klarheit' },
  'results.winnerWins': { en: 'wins this round!',  ar: 'فاز بهذه الجولة!',                de: 'hat diese Runde gewonnen!' },
  'results.points':    { en: 'points',             ar: 'نقطة',                            de: 'Punkte' },
  'results.aiScore':   { en: 'AI:',                ar: 'ذكاء اصطناعي:',                   de: 'KI:' },
  'results.aiUnavailable': { en: 'AI score unavailable', ar: 'نتيجة الذكاء الاصطناعي غير متاحة', de: 'KI-Bewertung nicht verfügbar' },
  'results.aiEvalUnavailable': { en: 'AI evaluation was unavailable for this round. Score is based on votes only.', ar: 'تقييم الذكاء الاصطناعي غير متاح لهذه الجولة. النتيجة مبنية على الأصوات فقط.', de: 'KI-Bewertung war für diese Runde nicht verfügbar. Bewertung basiert nur auf Stimmen.' },
  'results.classicMode': { en: 'Classic Mode',      ar: 'الوضع الكلاسيكي',                de: 'Klassischer Modus' },
  'results.letterMode': { en: 'Letter:',           ar: 'الحرف:',                          de: 'Buchstabe:' },
  'results.creativeChallenge': { en: 'Creative Challenge', ar: 'تحدي إبداعي',             de: 'Kreative Herausforderung' },
  'results.categoryMode': { en: 'Category Mode',   ar: 'وضع التصنيف',                     de: 'Kategoriemodus' },
  'results.fromVotes':  { en: 'from Votes (70%)', ar: 'من التصويت (70%)',                de: 'von Stimmen (70%)' },
  'results.fromAI':     { en: 'from AI (30%)',    ar: 'من الذكاء الاصطناعي (30%)',        de: 'von KI (30%)' },
  'results.finalScoreShort': { en: 'Final Score', ar: 'النتيجة النهائية',                de: 'Endergebnis' },

  // ── Leaderboard ────────────────────────────────────────────────────
  'leader.title':      { en: 'Leaderboard',        ar: 'لوحة المتصدرين',                  de: 'Bestenliste' },
  'leader.points':     { en: 'Points',             ar: 'النقاط',                          de: 'Punkte' },
  'leader.wins':       { en: 'Wins',               ar: 'الفوز',                           de: 'Siege' },
  'leader.votes':      { en: 'Votes',              ar: 'الأصوات',                         de: 'Stimmen' },
  'leader.rank':       { en: 'Rank',               ar: 'الترتيب',                         de: 'Rang' },
  'leader.noPlayers':  { en: 'No players yet',     ar: 'لا يوجد لاعبون بعد',              de: 'Noch keine Spieler' },
  'leader.playToSee':  { en: 'Play a game to see the leaderboard!', ar: 'العب لعبة لرؤية لوحة المتصدرين!', de: 'Spiele ein Spiel um die Bestenliste zu sehen!' },
  'leader.startPlaying': { en: 'Start Playing',    ar: 'ابدأ اللعب',                      de: 'Jetzt spielen' },
  'leader.round':      { en: 'Round',              ar: 'الجولة',                          de: 'Runde' },
  'leader.pts':        { en: 'pts',                ar: 'نقطة',                            de: 'Pkt' },

  // ── Settings ───────────────────────────────────────────────────────
  'settings.title':        { en: 'Settings',            ar: 'الإعدادات',                    de: 'Einstellungen' },
  'settings.appearance':   { en: 'Appearance',          ar: 'المظهر',                       de: 'Erscheinungsbild' },
  'settings.darkMode':     { en: 'Dark Mode',           ar: 'الوضع الداكن',                 de: 'Dunkelmodus' },
  'settings.language':     { en: 'Language',            ar: 'اللغة',                        de: 'Sprache' },
  'settings.sound':        { en: 'Sound Effects',       ar: 'المؤثرات الصوتية',             de: 'Soundeffekte' },
  'settings.music':        { en: 'Background Music',    ar: 'موسيقى خلفية',                 de: 'Hintergrundmusik' },
  'settings.vibration':    { en: 'Vibration',           ar: 'الاهتزاز',                     de: 'Vibration' },
  'settings.account':      { en: 'Account',             ar: 'الحساب',                       de: 'Konto' },
  'settings.guest':        { en: 'Continue as Guest',   ar: 'المتابعة كضيف',                de: 'Als Gast fortfahren' },
  'settings.noAccount':    { en: 'No account needed',   ar: 'لا حاجة لحساب',                 de: 'Kein Konto nötig' },
  'settings.signInGoogle': { en: 'Sign In with Google', ar: 'تسجيل الدخول بجوجل',           de: 'Mit Google anmelden' },
  'settings.signedIn':     { en: 'Signed in',           ar: 'تم تسجيل الدخول',              de: 'Angemeldet' },

  // ── Setup Screen ───────────────────────────────────────────────────
  'setup.title':       { en: 'Game Setup',         ar: 'إعداد اللعبة',                    de: 'Spieleinstellungen' },
  'setup.players':     { en: 'Number of Players',  ar: 'عدد اللاعبين',                    de: 'Anzahl der Spieler' },
  'setup.rounds':      { en: 'Number of Rounds',   ar: 'عدد الجولات',                     de: 'Anzahl der Runden' },
  'setup.time':        { en: 'Drawing Time',       ar: 'وقت الرسم',                       de: 'Zeichnungszeit' },
  'setup.category':    { en: 'Category',           ar: 'التصنيف',                         de: 'Kategorie' },
  'setup.pickLetter':  { en: 'Pick a Letter',      ar: 'اختر حرفاً',                     de: 'Wähle einen Buchstaben' },
  'setup.startGame':   { en: 'Start Game',         ar: 'ابدأ اللعبة',                     de: 'Spiel starten' },
  'setup.offlineMode': { en: 'Offline Mode',       ar: 'وضع بدون إنترنت',                 de: 'Offline-Modus' },
  'setup.sameDevice':  { en: 'Same Device - Pass the phone between players', ar: 'جهاز واحد - مرر الهاتف بين اللاعبين', de: 'Ein Gerät - Gib das Telefon zwischen den Spielern weiter' },
  'setup.playersCount': { en: 'Players',           ar: 'اللاعبون',                        de: 'Spieler' },
  'setup.enterNames':  { en: 'Enter names of players who will share this phone', ar: 'أدخل أسماء اللاعبين الذين سيشاركون هذا الهاتف', de: 'Gib die Namen der Spieler ein, die dieses Telefon teilen' },
  'setup.chooseGameType': { en: 'Choose Game Type', ar: 'اختر نوع اللعبة',                de: 'Wähle den Spieltyp' },
  'setup.selectHow':   { en: 'Select how you want to play', ar: 'اختر الطريقة التي تريد اللعب بها', de: 'Wähle wie du spielen möchtest' },
  'setup.gameSettings': { en: 'Game Settings',     ar: 'إعدادات اللعبة',                  de: 'Spieleinstellungen' },
  'setup.gameMode':    { en: 'Game Mode',          ar: 'وضع اللعبة',                      de: 'Spielmodus' },
  'setup.selectCategory': { en: 'Select Category', ar: 'اختر التصنيف',                    de: 'Kategorie wählen' },
  'setup.chooseCategory': { en: 'Choose a category for this game', ar: 'اختر تصنيفاً لهذه اللعبة', de: 'Wähle eine Kategorie für dieses Spiel' },
  'setup.chooseLetter': { en: 'Choose a Letter',   ar: 'اختر حرفاً',                      de: 'Wähle einen Buchstaben' },
  'setup.letterHint':  { en: 'Every word you draw must start with this letter', ar: 'كل كلمة ترسمها يجب أن تبدأ بهذا الحرف', de: 'Jedes Wort das du zeichnest muss mit diesem Buchstaben beginnen' },
  'setup.nextGameType': { en: 'Next: Game Type →', ar: 'التالي: نوع اللعبة →',             de: 'Weiter: Spieltyp →' },
  'setup.gameType':    { en: 'Game Type',          ar: 'نوع اللعبة',                       de: 'Spieltyp' },
  'setup.minPlayersWarning': { en: 'Add at least 2 players to start', ar: 'أضف لاعبين اثنين على الأقل للبدء', de: 'Füge mindestens 2 Spieler hinzu, um zu starten' },
  'setup.playerName':  { en: 'Player',             ar: 'اللاعب',                           de: 'Spieler' },
  'setup.addPlayer':   { en: 'Add player',         ar: 'إضافة لاعب',                       de: 'Spieler hinzufügen' },
  'setup.removePlayer':{ en: 'Remove player',      ar: 'حذف لاعب',                         de: 'Spieler entfernen' },
  'setup.gameModeLabel': { en: 'Game Mode:',       ar: 'وضع اللعبة:',                     de: 'Spielmodus:' },
  'setup.playersLabel': { en: 'Players:',          ar: 'اللاعبون:',                       de: 'Spieler:' },

  // ── Online Lobby ───────────────────────────────────────────────────
  'lobby.title':       { en: 'Online Lobby',       ar: 'غرفة الانتظار',                   de: 'Online-Lobby' },
  'lobby.create':      { en: 'Create Room',        ar: 'إنشاء غرفة',                      de: 'Raum erstellen' },
  'lobby.join':        { en: 'Join Room',          ar: 'الدخول لغرفة',                    de: 'Raum beitreten' },
  'lobby.code':        { en: 'Room Code',          ar: 'كود الغرفة',                      de: 'Raumcode' },
  'lobby.waiting':     { en: 'Waiting for players…', ar: 'بانتظار اللاعبين…',              de: 'Warte auf Spieler…' },
  'lobby.start':       { en: 'Start',              ar: 'ابدأ',                            de: 'Starten' },
  'lobby.onlineMode':  { en: 'Online Mode',        ar: 'وضع إنترنت',                      de: 'Online-Modus' },
  'lobby.differentDevices': { en: 'Different Devices - Use QR Code or Room Code', ar: 'أجهزة مختلفة - استخدم رمز QR أو كود الغرفة', de: 'Verschiedene Geräte - Nutze QR-Code oder Raumcode' },
  'lobby.shareCode':   { en: 'Share this code with friends:', ar: 'شارك هذا الكود مع الأصدقاء:', de: 'Teile diesen Code mit Freunden:' },
  'lobby.copied':      { en: '✓ Copied!',          ar: '✓ تم النسخ!',                     de: '✓ Kopiert!' },
  'lobby.copyCode':    { en: 'Copy Code',          ar: 'نسخ الكود',                       de: 'Code kopieren' },
  'lobby.shareLink':   { en: 'Share Link',         ar: 'مشاركة الرابط',                   de: 'Link teilen' },
  'lobby.orScanQR':    { en: 'Or scan QR Code to join:', ar: 'أو امسح رمز QR للانضمام:',   de: 'Oder QR-Code scannen um beizutreten:' },
  'lobby.players':     { en: 'Players',            ar: 'اللاعبون',                        de: 'Spieler' },
  'lobby.waitingJoin': { en: 'Waiting for players to join...', ar: 'بانتظار اللاعبين للانضمام…', de: 'Warte auf Spieler zum Beitreten…' },
  'lobby.shareCodeQR': { en: 'Share the code or QR code above', ar: 'شارك الكود أو رمز QR أعلاه', de: 'Teile den Code oder QR-Code oben' },
  'lobby.hostGame':    { en: 'Host a Game',        ar: 'إنشاء لعبة',                      de: 'Spiel hosten' },
  'lobby.joinGame':    { en: 'Join a Game',        ar: 'الانضمام للعبة',                  de: 'Spiel beitreten' },
  'lobby.enterCodeFriend': { en: 'Enter the room code from your friend\'s screen', ar: 'أدخل كود الغرفة من شاشة صديقك', de: 'Gib den Raumcode vom Bildschirm deines Freundes ein' },
  'lobby.yourName':    { en: 'Your Name',          ar: 'اسمك',                            de: 'Dein Name' },
  'lobby.enterRoomCode': { en: 'Enter Room Code',  ar: 'أدخل كود الغرفة',                 de: 'Raumcode eingeben' },
  'lobby.gameSettings': { en: 'Game Settings',     ar: 'إعدادات اللعبة',                  de: 'Spieleinstellungen' },
  'lobby.gameMode':    { en: 'Game Mode',          ar: 'وضع اللعبة',                      de: 'Spielmodus' },
  'lobby.startingLetter': { en: 'Starting Letter', ar: 'الحرف الأول',                     de: 'Anfangsbuchstabe' },
  'lobby.rounds':      { en: 'Rounds',             ar: 'الجولات',                         de: 'Runden' },
  'lobby.drawingTime': { en: 'Drawing Time',       ar: 'وقت الرسم',                       de: 'Zeichnungszeit' },
  'lobby.category':    { en: 'Category',           ar: 'التصنيف',                         de: 'Kategorie' },
  'lobby.creatingRoom': { en: 'Creating Room...',  ar: 'إنشاء غرفة…',                     de: 'Raum wird erstellt…' },
  'lobby.joiningRoom': { en: 'Joining Room...',    ar: 'الدخول للغرفة…',                  de: 'Raum wird betreten…' },
  'lobby.connecting':  { en: 'Connecting to game server...', ar: 'الاتصال بخادم اللعبة…',   de: 'Verbindung zum Spielserver…' },
  'lobby.startGamePlayers': { en: 'Start Game',    ar: 'ابدأ اللعبة',                     de: 'Spiel starten' },
  'lobby.waitingHost': { en: 'Waiting for the host to start the game...', ar: 'بانتظار المضيف لبدء اللعبة…', de: 'Warte auf den Host um das Spiel zu starten…' },
  'lobby.host':        { en: 'Host',               ar: 'المضيف',                          de: 'Host' },

  // ── Common ─────────────────────────────────────────────────────────
  'common.back':       { en: 'Back',               ar: 'رجوع',                            de: 'Zurück' },
  'common.next':       { en: 'Next',               ar: 'التالي',                          de: 'Weiter' },
  'common.start':      { en: 'Start',              ar: 'ابدأ',                            de: 'Starten' },
  'common.home':       { en: 'Home',               ar: 'الرئيسية',                        de: 'Startseite' },
  'common.playAgain':  { en: 'Play Again',         ar: 'العب مرة أخرى',                   de: 'Nochmal spielen' },
  'common.cancel':     { en: 'Cancel',             ar: 'إلغاء',                           de: 'Abbrechen' },
  'common.confirm':    { en: 'Confirm',            ar: 'تأكيد',                           de: 'Bestätigen' },
  'common.loading':    { en: 'Loading…',           ar: 'جاري التحميل…',                   de: 'Laden…' },
  'common.or':         { en: 'or',                 ar: 'أو',                              de: 'oder' },
  'common.startGame':  { en: 'Start Game!',        ar: 'ابدأ اللعبة!',                    de: 'Spiel starten!' },

  // ── PWA / Connectivity ─────────────────────────────────────────────
  'pwa.offlineBadge':  { en: 'No connection',      ar: 'لا يوجد اتصال',                   de: 'Keine Verbindung' },

  // ── Category Names ─────────────────────────────────────────────────
  'category.food':       { en: 'Food',           ar: 'طعام',          de: 'Essen' },
  'category.animals':    { en: 'Animals',        ar: 'حيوانات',       de: 'Tiere' },
  'category.nature':     { en: 'Nature',         ar: 'طبيعة',         de: 'Natur' },
  'category.objects':    { en: 'Objects',        ar: 'أشياء',         de: 'Objekte' },
  'category.vehicles':   { en: 'Vehicles',       ar: 'مركبات',        de: 'Fahrzeuge' },
  'category.sports':     { en: 'Sports',         ar: 'رياضة',         de: 'Sport' },
  'category.jobs':       { en: 'Jobs',           ar: 'وظائف',         de: 'Berufe' },
  'category.fantasy':    { en: 'Fantasy',        ar: 'خيال',          de: 'Fantasie' },
  'category.technology': { en: 'Technology',     ar: 'تكنولوجيا',     de: 'Technologie' },
  'category.space':      { en: 'Space',          ar: 'فضاء',          de: 'Weltraum' },
  'category.history':    { en: 'History',        ar: 'تاريخ',         de: 'Geschichte' },
  'category.random':     { en: 'Random',         ar: 'عشوائي',        de: 'Zufällig' },
  'category.custom':     { en: 'Custom',         ar: 'مخصص',          de: 'Benutzerdefiniert' },

  // ── Misc ───────────────────────────────────────────────────────────
  'misc.version':     { en: 'Denkmalen v1.0.0',   ar: 'دنكمالن v1.0.0',                  de: 'Denkmalen v1.0.0' },
  'misc.madeWith':    { en: 'Made with ❤️ for creative minds', ar: 'صنع بـ ❤️ للأذهان الإبداعية', de: 'Mit ❤️ für kreative Köpfe gemacht' },

  // ── AI Judge ────────────────────────────────────────────────────────
  'ai.evaluating':   { en: 'AI Judge is evaluating...', ar: 'الحكم الذكي يقيّم…',              de: 'KI-Richter bewertet…' },
  'ai.analyzing':    { en: 'Analyzing your drawing ✨', ar: 'يحلّل رسمتك ✨',                  de: 'Deine Zeichnung wird analysiert ✨' },
  'ai.judgeScore':   { en: 'AI Judge Score',            ar: 'نتيجة الحكم الذكي',              de: 'KI-Richter-Bewertung' },
  'ai.outOf100':     { en: 'out of 100',                ar: 'من 100',                          de: 'von 100' },
  'ai.accuracy':     { en: 'Accuracy',                  ar: 'الدقة',                           de: 'Genauigkeit' },
  'ai.creativity':   { en: 'Creativity',                ar: 'الإبداع',                         de: 'Kreativität' },
  'ai.clarity':      { en: 'Clarity',                   ar: 'الوضوح',                          de: 'Klarheit' },

  // ── Result Card ─────────────────────────────────────────────────────
  'result.share':      { en: 'Share',    ar: 'مشاركة', de: 'Teilen' },
  'result.download':   { en: 'Download', ar: 'تحميل',  de: 'Herunterladen' },
  'result.shareTitle': { en: 'Denkmalen Result', ar: 'نتيجة دنكمالن', de: 'Denkmalen-Ergebnis' },
  'result.shareText':  { en: 'I scored {score} points drawing "{word}" in Denkmalen! 🎨', ar: 'حصلت على {score} نقطة برسم "{word}" في دنكمالن! 🎨', de: 'Ich habe {score} Punkte für "{word}" in Denkmalen bekommen! 🎨' },

  // ── Lobby sharing ───────────────────────────────────────────────────
  'lobby.shareTitle': { en: 'Denkmalen - Join My Game!', ar: 'دنكمالن - انضم للعبتي!', de: 'Denkmalen - Tritt meinem Spiel bei!' },
  'lobby.shareText':  { en: 'Join my Denkmalen game! Use code: {code}', ar: 'انضم للعبتي في دنكمالن! استخدم الكود: {code}', de: 'Tritt meinem Denkmalen-Spiel bei! Code: {code}' },

  // ── Accessibility ───────────────────────────────────────────────────
  'a11y.skipToContent': { en: 'Skip to main content', ar: 'تخطَّ إلى المحتوى الرئيسي', de: 'Zum Hauptinhalt springen' },

  // ── Socket / server errors ──────────────────────────────────────────
  'socket.connectionFailed': { en: 'Could not reach the game server. Check your connection and try again.', ar: 'تعذّر الوصول إلى خادم اللعبة. تحقق من اتصالك وحاول مرة أخرى.', de: 'Der Spielserver ist nicht erreichbar. Prüfe deine Verbindung und versuche es erneut.' },
  'socket.tooManyRooms':     { en: 'Too many rooms created. Please wait a moment.', ar: 'تم إنشاء غرف كثيرة. انتظر لحظة من فضلك.', de: 'Zu viele Räume erstellt. Bitte warte einen Moment.' },
  'socket.nameRequired':     { en: 'A valid player name is required', ar: 'يجب إدخال اسم لاعب صالح', de: 'Ein gültiger Spielername ist erforderlich' },
  'socket.invalidCode':      { en: 'Invalid room code',    ar: 'كود الغرفة غير صالح',      de: 'Ungültiger Raumcode' },
  'socket.roomNotFound':     { en: 'Room not found',       ar: 'الغرفة غير موجودة',        de: 'Raum nicht gefunden' },
  'socket.roomFull':         { en: 'Room is full',         ar: 'الغرفة ممتلئة',            de: 'Raum ist voll' },
  'socket.gameInProgress':   { en: 'Game already in progress', ar: 'اللعبة بدأت بالفعل',   de: 'Spiel läuft bereits' },

  // ── Statistics ──────────────────────────────────────────────────────
  'stats.yourJourney':  { en: 'Your drawing journey', ar: 'رحلتك في الرسم',              de: 'Deine Zeichenreise' },
  'stats.winRate':      { en: 'Win Rate',             ar: 'نسبة الفوز',                   de: 'Gewinnrate' },
  'stats.gamesPlayed':  { en: 'Games Played',         ar: 'الألعاب الملعوبة',             de: 'Gespielte Spiele' },
  'stats.highestScore': { en: 'Highest Score',        ar: 'أعلى نتيجة',                   de: 'Höchste Bewertung' },
  'stats.totalVotes':   { en: 'Total Votes Given',    ar: 'إجمالي الأصوات',               de: 'Abgegebene Stimmen gesamt' },
  'stats.drawingTime':  { en: 'Drawing Time (s)',     ar: 'وقت الرسم (ث)',                de: 'Zeichnungszeit (s)' },
  'stats.favoriteGameType': { en: 'Favorite Game Type', ar: 'نوع اللعبة المفضل',          de: 'Lieblingsspieltyp' },
  'stats.favoriteCategory': { en: 'Favorite Category', ar: 'التصنيف المفضل',               de: 'Lieblingskategorie' },

  // ── Plugins ──────────────────────────────────────────────────────
  'plugins.title':      { en: 'Plugin Manager',     ar: 'مدير الإضافات',                  de: 'Plugin-Manager' },
  'plugins.subtitle':   { en: 'Enable or disable game features', ar: 'تفعيل أو تعطيل ميزات اللعبة', de: 'Spielefunktionen aktivieren oder deaktivieren' },
  'plugins.status.active': { en: 'Active',           ar: 'نشط',                           de: 'Aktiv' },
  'plugins.status.inactive': { en: 'Inactive',       ar: 'غير نشط',                       de: 'Inaktiv' },
  'plugins.status.error': { en: 'Error',             ar: 'خطأ',                           de: 'Fehler' },
  'plugins.status.loading': { en: 'Loading',         ar: 'جاري التحميل',                  de: 'Lädt' },
  'plugins.ai.name':    { en: 'AI Judge',            ar: 'حكم الذكاء الاصطناعي',          de: 'KI-Richter' },
  'plugins.challenges.name': { en: 'Challenges',     ar: 'تحديات',                        de: 'Herausforderungen' },
  'plugins.cosmetics.name': { en: 'Cosmetics',       ar: 'التجهيزات',                     de: 'Kosmetik' },
  'plugins.replay.name': { en: 'Replay',             ar: 'إعادة تشغيل',                   de: 'Wiederholung' },
  'plugins.tournaments.name': { en: 'Tournaments',   ar: 'بطولات',                        de: 'Turniere' },
  'plugins.teams.name': { en: 'Teams',               ar: 'فرق',                           de: 'Teams' },
  'plugins.statistics.name': { en: 'Statistics',     ar: 'إحصائيات',                      de: 'Statistiken' },
  'plugins.audio.name': { en: 'Audio',               ar: 'صوت',                           de: 'Audio' },
  'plugins.community.name': { en: 'Community',       ar: 'المجتمع',                       de: 'Community' },
  'plugins.settings.name': { en: 'Settings',         ar: 'الإعدادات',                     de: 'Einstellungen' },
}

// ── Helper ──────────────────────────────────────────────────────────

/**
 * Look up a translation key for the given language.
 * Falls back to English if the key or language is missing.
 */
export function t(key: string, lang: Lang = 'en'): string {
  const entry = translations[key]
  if (!entry) return key            // unknown key → return key itself
  return entry[lang] ?? entry.en ?? key
}

/**
 * Get an array of all available language option objects (for dropdowns).
 */
export const LANGUAGE_OPTIONS = [
  { code: 'en' as Lang, label: 'English',        flag: '🇬🇧' },
  { code: 'ar' as Lang, label: 'العربية',         flag: '🇸🇦' },
  { code: 'de' as Lang, label: 'Deutsch',         flag: '🇩🇪' },
]
