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

  // ── Game Types ─────────────────────────────────────────────────────
  'gametype.classic':      { en: 'Classic',           ar: 'كلاسيكي',                     de: 'Klassisch' },
  'gametype.letter':       { en: 'Letter Mode',       ar: 'وضع الحرف',                   de: 'Buchstabencode' },
  'gametype.category':     { en: 'Category Mode',     ar: 'وضع التصنيف',                  de: 'Kategoriemodus' },
  'gametype.creative':     { en: 'Creative Challenge', ar: 'تحدي إبداعي',                 de: 'Kreative Herausforderung' },
  'gametype.daily':        { en: 'Daily Challenge',   ar: 'تحدي يومي',                    de: 'Tägliche Herausforderung' },

  // ── Drawing Screen ─────────────────────────────────────────────────
  'draw.round':        { en: 'Round',             ar: 'الجولة',                          de: 'Runde' },
  'draw.drawing':      { en: 'Drawing…',          ar: 'يرسم…',                           de: 'Zeichnen…' },
  'draw.reveal':       { en: 'Reveal Word',       ar: 'كشف الكلمة',                      de: 'Wort enthüllen' },
  'draw.done':         { en: 'Done',              ar: 'تم',                              de: 'Fertig' },
  'draw.timeLeft':     { en: 'Time Left',         ar: 'الوقت المتبقي',                   de: 'Verbleibende Zeit' },
  'draw.wordHint':     { en: 'Draw this word',    ar: 'ارسم هذه الكلمة',                 de: 'Zeichne dieses Wort' },
  'draw.creativeHint': { en: 'Draw this prompt',  ar: 'ارسم هذا الوصف',                  de: 'Zeichne diesen Prompt' },

  // ── Voting Screen ──────────────────────────────────────────────────
  'vote.title':        { en: 'Vote for the Best Drawing', ar: 'صوّت لأفضل رسمة',       de: 'Für die beste Zeichnung abstimmen' },
  'vote.submit':       { en: 'Submit Vote',        ar: 'إرسال التصويت',                   de: 'Stimme abgeben' },
  'vote.waiting':      { en: 'Waiting for votes…', ar: 'بانتظار التصويت…',                 de: 'Warte auf Stimmen…' },
  'vote.ranking':      { en: 'Drag to rank',       ar: 'اسحب للترتيب',                    de: 'Zum Sortieren ziehen' },

  // ── Results Screen ─────────────────────────────────────────────────
  'results.round':     { en: 'Round Results',      ar: 'نتائج الجولة',                    de: 'Ergebnisse der Runde' },
  'results.final':     { en: 'Final Score Breakdown', ar: 'تفصيل النتيجة النهائية',       de: 'Endbewertung im Detail' },
  'results.winner':    { en: 'Winner',             ar: 'الفائز',                          de: 'Gewinner' },
  'results.nextRound': { en: 'Next Round',         ar: 'الجولة التالية',                  de: 'Nächste Runde' },
  'results.playAgain': { en: 'Play Again',         ar: 'العب مرة أخرى',                   de: 'Nochmal spielen' },
  'results.backHome':  { en: 'Back to Home',       ar: 'العودة للرئيسية',                 de: 'Zurück zur Startseite' },

  // ── Leaderboard ────────────────────────────────────────────────────
  'leader.title':      { en: 'Leaderboard',        ar: 'لوحة المتصدرين',                  de: 'Bestenliste' },
  'leader.points':     { en: 'Points',             ar: 'النقاط',                          de: 'Punkte' },
  'leader.wins':       { en: 'Wins',               ar: 'الفوز',                           de: 'Siege' },
  'leader.votes':      { en: 'Votes',              ar: 'الأصوات',                         de: 'Stimmen' },
  'leader.rank':       { en: 'Rank',               ar: 'الترتيب',                         de: 'Rang' },

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
  'settings.signInApple':  { en: 'Sign In with Apple',  ar: 'تسجيل الدخول بأبل',            de: 'Mit Apple anmelden' },

  // ── Setup Screen ───────────────────────────────────────────────────
  'setup.title':       { en: 'Game Setup',         ar: 'إعداد اللعبة',                    de: 'Spieleinstellungen' },
  'setup.players':     { en: 'Number of Players',  ar: 'عدد اللاعبين',                    de: 'Anzahl der Spieler' },
  'setup.rounds':      { en: 'Number of Rounds',   ar: 'عدد الجولات',                     de: 'Anzahl der Runden' },
  'setup.time':        { en: 'Drawing Time',       ar: 'وقت الرسم',                       de: 'Zeichnungszeit' },
  'setup.category':    { en: 'Category',           ar: 'التصنيف',                         de: 'Kategorie' },
  'setup.pickLetter':  { en: 'Pick a Letter',      ar: 'اختر حرفاً',                     de: 'Wähle einen Buchstaben' },
  'setup.startGame':   { en: 'Start Game',         ar: 'ابدأ اللعبة',                     de: 'Spiel starten' },

  // ── Online Lobby ───────────────────────────────────────────────────
  'lobby.title':       { en: 'Online Lobby',       ar: 'غرفة الانتظار',                   de: 'Online-Lobby' },
  'lobby.create':      { en: 'Create Room',        ar: 'إنشاء غرفة',                      de: 'Raum erstellen' },
  'lobby.join':        { en: 'Join Room',          ar: 'الدخول لغرفة',                    de: 'Raum beitreten' },
  'lobby.code':        { en: 'Room Code',          ar: 'كود الغرفة',                      de: 'Raumcode' },
  'lobby.waiting':     { en: 'Waiting for players…', ar: 'بانتظار اللاعبين…',              de: 'Warte auf Spieler…' },
  'lobby.start':       { en: 'Start',              ar: 'ابدأ',                            de: 'Starten' },

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
