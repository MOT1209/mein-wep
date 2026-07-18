import { supabase } from '@/lib/supabase';

// ── Types ─────────────────────────────────────────────────────────────────

export interface UserProfile {
  userId: string;
  preferences: Record<string, any>;
  interests: string[];
  knowledgeLevel: Record<string, 'beginner' | 'intermediate' | 'advanced'>;
  communicationStyle: string;
  topicsDiscussed: { topic: string; count: number }[];
  lastUpdated: string;
  sentimentTrend: 'positive' | 'neutral' | 'negative';
}

export interface UserStats {
  totalConversations: number;
  totalMessages: number;
  topicsLearned: number;
  preferencesLearned: number;
  lastActive: string;
  learningProgress: number;
}

interface FeedbackEntry {
  userId: string;
  messageId: string;
  rating: 'up' | 'down';
  topic?: string;
  timestamp: string;
}

// ── Stop words (Arabic & English) ─────────────────────────────────────────

const STOP_WORDS = new Set([
  // English
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'shall', 'can', 'need', 'dare', 'ought',
  'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from',
  'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
  'between', 'out', 'off', 'over', 'under', 'again', 'further', 'then',
  'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each',
  'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no',
  'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just',
  'because', 'but', 'and', 'or', 'if', 'while', 'that', 'this', 'these',
  'those', 'it', 'its', 'what', 'which', 'who', 'whom', 'about', 'up',
  'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of',
  'by', 'with', 'from', 'as', 'into', 'through', 'during', 'before',
  'after', 'above', 'below', 'between', 'out', 'off', 'over', 'under',
  'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where',
  'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most',
  'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same',
  'so', 'than', 'too', 'very', 'just', 'because', 'but',
  // Arabic
  'من', 'في', 'إلى', 'عن', 'على', 'مع', 'كان', 'هذا', 'هذه', 'ذلك',
  'تلك', 'هو', 'هي', 'هم', 'أن', 'إن', 'لا', 'ما', 'لم', 'لن', 'هل',
  'بين', 'تحت', 'فوق', 'داخل', 'خارج', 'بعد', 'قبل', 'كل', 'بعض', 'أي',
  'التي', 'الذي', 'الذين', 'اللذين', 'اللواتي', 'إذ', 'حيث', 'أين',
  'كيف', 'متى', 'كم', 'قد', 'لقد', 'سوف', 'ثم', 'أو', 'ولا', 'حتى',
  'لغة', 'عربي', 'لدى', 'لدي', 'عند', 'كانت', 'كانوا', 'كنت',
  'علي', 'عليه', 'عليها', 'لهم', 'له', 'لها', 'لك', 'لكم',
]);

const INTEREST_INDICATORS = [
  'interested in', 'like', 'love', 'enjoy', 'passionate about',
  'اهتمام', 'يعجبني', 'أحب', 'أستمتع', 'شغوف', 'معجب',
];

const KNOWLEDGE_INDICATORS: Record<string, RegExp[]> = {
  beginner: [
    /^(what is|what's|what are|how do i|how can i|تعريف|ما هو|كيف|مبتدئ)/i,
    /explain\s+(like\s+i'?\s*m|simply|basic|easy|beginner)/i,
    /شرح\s+(مبسط|بسيط|للمبتدئين)/i,
    /لا\s+أفهم|ما\s+معنى|لم\s+أفهم/i,
  ],
  advanced: [
    /^(how (does|would|could) you|implement|architect|optimize|benchmark|performance)/i,
    /(design pattern|architecture|scalability|distributed|concurrency|complexity)/i,
    /(كيفية|تطبيق|تحسين|أداء|معمارية|توزيع|تزامن)/i,
    /(deep learning|neural network|transformer|attention mechanism)/i,
  ],
};

// ── Sentiment lexicon ─────────────────────────────────────────────────────

const POSITIVE_WORDS = new Set([
  'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic',
  'perfect', 'beautiful', 'love', 'happy', 'satisfied', 'helpful',
  'رائع', 'ممتاز', 'جميل', 'جيد', 'مذهل', 'أحب', 'سعيد', 'ممتازة',
]);

const NEGATIVE_WORDS = new Set([
  'bad', 'terrible', 'awful', 'horrible', 'hate', 'angry', 'frustrated',
  'disappointed', 'useless', 'worst', 'poor', 'slow',
  'سيئ', 'فظيع', 'مريع', 'كره', 'غاضب', 'مخيب', 'سيئة', 'بطيء',
]);

// ── Batch update support ──────────────────────────────────────────────────

interface PendingUpdate {
  userId: string;
  key: string;
  value: string;
  category: string;
}

const BATCH_QUEUE: PendingUpdate[] = [];
const BATCH_INTERVAL_MS = 5000; // flush every 5 seconds
let batchTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleBatchFlush(): void {
  if (batchTimer) return;
  batchTimer = setTimeout(async () => {
    batchTimer = null;
    await flushBatchUpdates();
  }, BATCH_INTERVAL_MS);
}

async function flushBatchUpdates(): Promise<void> {
  if (BATCH_QUEUE.length === 0) return;

  const batch = BATCH_QUEUE.splice(0, BATCH_QUEUE.length);
  const now = new Date().toISOString();

  try {
    const { error } = await supabase.from('agent_long_term_memory').upsert(
      batch.map((u) => ({
        user_id: u.userId,
        key: u.key,
        value: u.value,
        category: u.category,
        updated_at: now,
      })),
      { onConflict: 'user_id, key' }
    );

    if (error) {
      console.error('[Learning] Batch flush error:', error);
    }
  } catch (err) {
    console.error('[Learning] Batch flush exception:', err);
  }
}

function queueUpdate(userId: string, key: string, value: string, category: string = 'learning'): void {
  BATCH_QUEUE.push({ userId, key, value, category });
  scheduleBatchFlush();
}

// ── Text analysis helpers ─────────────────────────────────────────────────

function extractKeywords(text: string): string[] {
  const tokens = text
    .toLowerCase()
    .replace(/[^\w\s\u0600-\u06FF]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP_WORDS.has(t));

  const freq = new Map<string, number>();
  for (const t of tokens) {
    freq.set(t, (freq.get(t) ?? 0) + 1);
  }

  return Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([k]) => k);
}

function detectInterests(text: string): string[] {
  const lower = text.toLowerCase();
  const found: string[] = [];
  for (const indicator of INTEREST_INDICATORS) {
    const idx = lower.indexOf(indicator);
    if (idx !== -1) {
      const after = text.slice(idx + indicator.length).trim();
      const sentence = after.split(/[.!?،؟\n]/)[0]?.trim();
      if (sentence && sentence.length < 80) {
        found.push(sentence);
      }
    }
  }
  return found;
}

function detectKnowledgeLevel(
  text: string,
  topic: string
): 'beginner' | 'intermediate' | 'advanced' | null {
  for (const level of ['advanced', 'beginner'] as const) {
    const patterns = KNOWLEDGE_INDICATORS[level];
    for (const p of patterns) {
      if (p.test(text)) return level;
    }
  }
  return null;
}

function inferLanguage(text: string): string {
  if (!text || text.trim().length === 0) return 'en';

  // 1. Script detection (fast)
  const hasArabic = /[\u0600-\u06FF]/.test(text);
  const hasCJK = /[\u4e00-\u9fff]/.test(text);
  const hasCyrillic = /[\u0400-\u04FF]/.test(text);
  const hasLatin = /[a-zA-Z]/.test(text);
  const hasDevanagari = /[\u0900-\u097F]/.test(text);

  // Count Arabic characters percentage
  const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
  const totalChars = text.replace(/\s/g, '').length || 1;
  const arabicRatio = arabicChars / totalChars;

  // Arabic script languages
  if (hasArabic && arabicRatio > 0.3) {
    // Differentiate between Arabic, Persian, Urdu
    const persianChars = (text.match(/[\u06AF\u06CC\u0686\u067E\u0698\u06A9]/g) || []).length;
    const urduChars = (text.match(/[\u0679\u067E\u0686\u0688\u0691\u06AF]/g) || []).length;

    // Persian-specific words
    const persianWords = ['و', 'در', 'این', 'که', 'با', 'از', 'برای', 'یک', 'است', 'آن'];
    const persianScore = persianWords.filter(w => text.includes(w)).length;

    // Urdu-specific words
    const urduWords = ['اور', 'ہے', 'میں', 'کا', 'کی', 'کے', 'سے', 'نے', 'کو', 'یہ'];
    const urduScore = urduWords.filter(w => text.includes(w)).length;

    if (persianScore > urduScore && persianScore >= 2) return 'fa';
    if (urduScore > persianScore && urduScore >= 2) return 'ur';
    return 'ar';
  }

  // CJK
  if (hasCJK) return 'zh';

  // Cyrillic
  if (hasCyrillic) {
    const russianWords = ['что', 'как', 'в', 'на', 'с', 'это', 'она', 'они', 'но', 'по'];
    const russianScore = russianWords.filter(w => text.toLowerCase().includes(w)).length;
    if (russianScore >= 2) return 'ru';
    return 'ru'; // default cyrillic
  }

  // Latin script - detect European languages
  if (hasLatin) {
    const lower = text.toLowerCase();

    // German
    const germanWords = ['der', 'die', 'das', 'und', 'ist', 'nicht', 'ein', 'eine', 'sich', 'mit'];
    const germanScore = germanWords.filter(w => new RegExp('\\b' + w + '\\b').test(lower)).length;

    // French
    const frenchWords = ['le', 'la', 'les', 'est', 'sont', 'dans', 'avec', 'pour', 'sur', 'une'];
    const frenchScore = frenchWords.filter(w => new RegExp('\\b' + w + '\\b').test(lower)).length;

    // Spanish
    const spanishWords = ['el', 'la', 'los', 'las', 'es', 'son', 'una', 'para', 'con', 'por'];
    const spanishScore = spanishWords.filter(w => new RegExp('\\b' + w + '\\b').test(lower)).length;

    // Turkish
    const turkishChars = /[ğüşıöçĞÜŞİÖÇ]/.test(text);
    const turkishWords = ['ve', 'bir', 'bu', 'için', 'ile', 'olan', 'çok', 'gibi', 'kadar', 'daha'];
    const turkishScore = turkishWords.filter(w => new RegExp('\\b' + w + '\\b').test(lower)).length;

    // Find the best match
    const scores = [
      { lang: 'de', score: germanScore },
      { lang: 'fr', score: frenchScore },
      { lang: 'es', score: spanishScore },
      { lang: 'tr', score: turkishScore + (turkishChars ? 2 : 0) },
    ];

    const best = scores.reduce((max, s) => s.score > max.score ? s : max, { lang: 'en', score: 0 });
    if (best.score >= 2) return best.lang;

    // English default for Latin script
    return 'en';
  }

  // Devanagari (Hindi, etc.)
  if (hasDevanagari) return 'hi';

  return 'en';
}

function analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
  const words = text.toLowerCase().split(/\s+/);
  let positiveScore = 0;
  let negativeScore = 0;

  for (const word of words) {
    if (POSITIVE_WORDS.has(word)) positiveScore++;
    if (NEGATIVE_WORDS.has(word)) negativeScore++;
  }

  if (positiveScore > negativeScore) return 'positive';
  if (negativeScore > positiveScore) return 'negative';
  return 'neutral';
}

// ── Learning System ───────────────────────────────────────────────────────

export class LearningSystem {
  /**
   * Learn from a conversation using batch updates.
   * Accumulates all updates and flushes them periodically to Supabase.
   */
  static async learnFromConversation(
    userId: string,
    messages: { role: string; content: string }[]
  ): Promise<void> {
    const userMessages = messages.filter((m) => m.role === 'user');
    if (userMessages.length === 0) return;

    const allUserText = userMessages.map((m) => m.content).join(' ');
    const keywords = extractKeywords(allUserText);
    const interests = detectInterests(allUserText);

    // 1. Topic frequency tracking (batched)
    const topicKeywords = keywords.slice(0, 10);
    for (const keyword of topicKeywords) {
      const key = `topic:${keyword}`;
      // We use a counter approach – the batch upsert will overwrite,
      // but we track counts locally. For simplicity, we increment optimistically.
      queueUpdate(userId, key, '1', 'learning');
      // Note: a production system would use Supabase RPC for atomic increments
    }

    // 2. Interests (batched)
    for (const interest of interests) {
      queueUpdate(userId, 'interests', JSON.stringify([interest]), 'learning');
    }

    // 3. Language preference (batched)
    const language = inferLanguage(allUserText);
    queueUpdate(userId, 'preferred_language', language, 'learning');

    // 4. Communication style (batched)
    const style = userMessages.some((m) => m.content.length > 200) ? 'detailed' : 'concise';
    queueUpdate(userId, 'communication_style', style, 'learning');

    // 5. Knowledge level (batched)
    const lastMessage = userMessages[userMessages.length - 1];
    const knowledgeLevel = detectKnowledgeLevel(lastMessage.content, keywords[0] ?? '');
    if (knowledgeLevel && keywords[0]) {
      const key = `knowledge_level:${keywords[0]}`;
      queueUpdate(userId, key, knowledgeLevel, 'learning');
    }

    // 6. Stats (batched)
    queueUpdate(userId, 'learning_stats', JSON.stringify({
      totalMessages: userMessages.length,
      lastActive: new Date().toISOString(),
      sentimentTrend: analyzeSentiment(allUserText),
    }), 'learning');
  }

  /**
   * Learn from user feedback (thumbs up / down).
   */
  static async learnFromFeedback(feedback: FeedbackEntry): Promise<void> {
    try {
      // Store feedback
      const { error } = await supabase.from('user_feedback').insert({
        user_id: feedback.userId,
        message_id: feedback.messageId,
        rating: feedback.rating,
        topic: feedback.topic || null,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      // Update aggregated feedback stats
      const key = `feedback:${feedback.topic || 'general'}`;
      const existing = await supabase
        .from('agent_long_term_memory')
        .select('value')
        .eq('user_id', feedback.userId)
        .eq('key', key)
        .single();

      const current: { up: number; down: number } = existing.data?.value
        ? JSON.parse(existing.data.value)
        : { up: 0, down: 0 };

      if (feedback.rating === 'up') current.up++;
      else current.down++;

      queueUpdate(feedback.userId, key, JSON.stringify(current), 'learning_feedback');
    } catch (err) {
      console.error('[Learning] Feedback error:', err);
    }
  }

  /**
   * Get aggregated feedback statistics for a user.
   */
  static async getFeedbackStats(userId: string): Promise<{
    total: number;
    thumbsUp: number;
    thumbsDown: number;
    byTopic: Record<string, { up: number; down: number }>;
  }> {
    try {
      const { data } = await supabase
        .from('agent_long_term_memory')
        .select('key, value')
        .eq('user_id', userId)
        .eq('category', 'learning_feedback');

      const entries = data ?? [];
      let totalUp = 0;
      let totalDown = 0;
      const byTopic: Record<string, { up: number; down: number }> = {};

      for (const entry of entries) {
        const topic = entry.key.replace('feedback:', '');
        const stats: { up: number; down: number } = JSON.parse(entry.value);
        byTopic[topic] = stats;
        totalUp += stats.up;
        totalDown += stats.down;
      }

      return { total: totalUp + totalDown, thumbsUp: totalUp, thumbsDown: totalDown, byTopic };
    } catch {
      return { total: 0, thumbsUp: 0, thumbsDown: 0, byTopic: {} };
    }
  }

  static async getUserProfile(userId: string): Promise<UserProfile> {
    const { data } = await supabase
      .from('agent_long_term_memory')
      .select('key, value')
      .eq('user_id', userId)
      .eq('category', 'learning');

    const entries = data ?? [];

    const preferences: Record<string, any> = {};
    const interests: string[] = [];
    const knowledgeLevel: Record<string, 'beginner' | 'intermediate' | 'advanced'> = {};
    const topicsDiscussed: { topic: string; count: number }[] = [];
    let sentimentTrend: 'positive' | 'neutral' | 'negative' = 'neutral';

    for (const entry of entries) {
      if (entry.key.startsWith('topic:')) {
        topicsDiscussed.push({
          topic: entry.key.slice(6),
          count: parseInt(entry.value, 10) || 1,
        });
      } else if (entry.key.startsWith('knowledge_level:')) {
        knowledgeLevel[entry.key.slice(16)] = entry.value as any;
      } else if (entry.key === 'interests') {
        try {
          const parsed = JSON.parse(entry.value);
          if (Array.isArray(parsed)) {
            interests.push(...parsed);
          } else {
            interests.push(parsed);
          }
        } catch { /* ignore */ }
      } else if (entry.key === 'learning_stats' || entry.key === 'stats') {
        try {
          const stats = JSON.parse(entry.value);
          if (stats.sentimentTrend) sentimentTrend = stats.sentimentTrend;
        } catch { /* ignore */ }
      } else {
        preferences[entry.key] = entry.value;
      }
    }

    topicsDiscussed.sort((a, b) => b.count - a.count);

    return {
      userId,
      preferences,
      interests: Array.from(new Set(interests)),
      knowledgeLevel,
      communicationStyle: (preferences.communication_style as string) || 'concise',
      topicsDiscussed,
      lastUpdated: new Date().toISOString(),
      sentimentTrend,
    };
  }

  static async getLearnedContext(
    userId: string,
    currentQuery: string
  ): Promise<string> {
    const profile = await LearningSystem.getUserProfile(userId);
    const queryKeywords = extractKeywords(currentQuery);
    const relevantTopics = profile.topicsDiscussed
      .filter((t) => queryKeywords.some((k) => t.topic.includes(k) || k.includes(t.topic)))
      .slice(0, 5);

    const parts: string[] = [];

    if (profile.interests.length > 0) {
      parts.push(`User interests: ${profile.interests.join(', ')}`);
    }

    if (relevantTopics.length > 0) {
      parts.push(
        `Previously discussed: ${relevantTopics.map((t) => `${t.topic} (${t.count}x)`).join(', ')}`
      );
    }

    const lang = profile.preferences.preferred_language;
    if (lang) {
      parts.push(`Preferred language: ${lang}`);
    }

    if (profile.communicationStyle) {
      parts.push(`Communication style: ${profile.communicationStyle}`);
    }

    const relevantKnowledge = Object.entries(profile.knowledgeLevel)
      .filter(([topic]) => queryKeywords.some((k) => topic.includes(k) || k.includes(topic)));
    for (const [topic, level] of relevantKnowledge) {
      parts.push(`Knowledge level on "${topic}": ${level}`);
    }

    if (profile.sentimentTrend !== 'neutral') {
      parts.push(`User sentiment trend: ${profile.sentimentTrend}`);
    }

    return parts.length > 0 ? parts.join('\n') : '';
  }

  static async updateUserPreferences(
    userId: string,
    key: string,
    value: any
  ): Promise<void> {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    queueUpdate(userId, `pref:${key}`, serialized, 'learning');
  }

  static async getUserStats(userId: string): Promise<UserStats> {
    const profile = await LearningSystem.getUserProfile(userId);

    return {
      totalConversations: 0, // calculated on-demand if needed
      totalMessages: profile.topicsDiscussed.reduce((sum, t) => sum + t.count, 0),
      topicsLearned: profile.topicsDiscussed.length,
      preferencesLearned: Object.keys(profile.preferences).length,
      lastActive: profile.lastUpdated,
      learningProgress: Math.min(
        Math.round(
          ((profile.topicsDiscussed.length + Object.keys(profile.preferences).length) / 50) * 100
        ),
        100
      ),
    };
  }

  /**
   * Force-flush any pending batch updates.
   */
  static async flush(): Promise<void> {
    await flushBatchUpdates();
  }
}

export type { FeedbackEntry };
