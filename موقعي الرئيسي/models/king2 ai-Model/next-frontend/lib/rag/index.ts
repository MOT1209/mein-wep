import { executeResponseWithFallback } from '@/lib/fallback';
import { knowledgeBase } from '@/lib/knowledge';
import { supabase } from '@/lib/supabase';
import { generateAndSearchEmbeddings, createEmbedding, searchEmbeddings } from '@/lib/vector';
import { LearningSystem } from '@/lib/learning';

// ── Types ─────────────────────────────────────────────────────────────────

export interface RAGResult {
  source: 'knowledge_base' | 'memory' | 'conversation_history';
  content: string;
  relevance: number;
  metadata?: Record<string, any>;
}

export interface RAGContext {
  context: string;
  sources: { source: string; content: string; relevance: number }[];
}

export interface EnrichedPrompt {
  systemPrompt: string;
  contextMessages: { role: string; content: string }[];
}

// ── Constants ─────────────────────────────────────────────────────────────

const MAX_RAG_SOURCES = 8;
const RELEVANCE_THRESHOLD = 0.3;
const CONVERSATION_HISTORY_LIMIT = 3;
const CONVERSATION_HISTORY_CACHE_TTL = 1000 * 60 * 5; // 5 min

// ── Conversation history cache ────────────────────────────────────────────

const historySearchCache = new Map<string, { results: RAGResult[]; expiresAt: number }>();

function getHistoryCacheKey(userId: string, query: string): string {
  // Normalise query to increase cache hits
  return `${userId}::${query.toLowerCase().trim().slice(0, 100)}`;
}

function getCachedHistory(userId: string, query: string): RAGResult[] | null {
  const key = getHistoryCacheKey(userId, query);
  const entry = historySearchCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    historySearchCache.delete(key);
    return null;
  }
  return entry.results;
}

function setCachedHistory(userId: string, query: string, results: RAGResult[]): void {
  const key = getHistoryCacheKey(userId, query);
  historySearchCache.set(key, { results, expiresAt: Date.now() + CONVERSATION_HISTORY_CACHE_TTL });
  if (historySearchCache.size > 500) {
    const now = Date.now();
    for (const [k, v] of Array.from(historySearchCache)) {
      if (v.expiresAt < now) historySearchCache.delete(k);
    }
  }
}

// ── RAG System ────────────────────────────────────────────────────────────

class RAGSystem {
  /**
   * Retrieve relevant context from all sources.
   * Uses vector search first, keyword search as fallback.
   * All sources are queried in parallel for maximum speed.
   */
  async getRAGContext(userId: string, query: string): Promise<RAGContext> {
    const [knowledge, history, semantic] = await Promise.all([
      this.smartSearch(query),
      this.searchConversationHistory(userId, query),
      this.vectorSearch(query),
    ]);

    const allResults = [...knowledge, ...history, ...semantic]
      .filter((r) => r.relevance > RELEVANCE_THRESHOLD)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, MAX_RAG_SOURCES);

    if (allResults.length === 0) return { context: '', sources: [] };

    const context = allResults
      .map((r) => `[${r.source}]\n${r.content}`)
      .join('\n\n---\n\n');

    return { context, sources: allResults };
  }

  /**
   * Generate a response using RAG context.
   * Note: This is a non-streaming convenience method.
   * For streaming, use `enrichPrompt` + `executeStreamWithFallback` directly.
   */
  async generateWithRAG(
    userId: string,
    query: string,
    history: { role: string; content: string }[]
  ): Promise<string> {
    const { context } = await this.getRAGContext(userId, query);

    const language = detectLanguage(query);
    const systemPrompt = this.buildSystemPrompt(context, language);
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...history.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user' as const, content: query },
    ];

    const { text } = await executeResponseWithFallback('auto', messages);
    return text;
  }

  /**
   * Enrich a prompt with RAG context WITHOUT executing the LLM call.
   * This is the key method for streaming support:
   * 1. Call `enrichPrompt` to get a system prompt with RAG context
   * 2. Pass the system prompt + messages to `executeStreamWithFallback`
   *
   * Usage in chat route:
   *   const { systemPrompt } = await ragSystem.enrichPrompt(userId, query, history);
   *   const fullMessages = [{ role: 'system', content: systemPrompt }, ...history, { role: 'user', content: query }];
   *   const { stream } = await executeStreamWithFallback('auto', fullMessages);
   */
  async enrichPrompt(
    userId: string,
    query: string,
    history: { role: string; content: string }[]
  ): Promise<EnrichedPrompt> {
    const [ragCtx, learningCtx] = await Promise.all([
      this.getRAGContext(userId, query),
      LearningSystem.getLearnedContext(userId, query).catch(() => ''),
    ]);

    const contextParts: string[] = [];
    if (ragCtx.context) contextParts.push(ragCtx.context);
    if (learningCtx) contextParts.push(learningCtx);

    const language = detectLanguage(query);
    const systemPrompt = this.buildSystemPrompt(
      contextParts.length > 0 ? contextParts.join('\n\n---\n\n') : '',
      language
    );

    return { systemPrompt, contextMessages: history };
  }

  // ── Private helpers ────────────────────────────────────────────────────

  private buildSystemPrompt(context: string, language?: string): string {
    // Non-Arabic languages: English system prompt
    if (language && language !== 'ar') {
      return `You are KING2, a multilingual AI assistant. You are smart, fast, and friendly.

${context ? `Retrieved context:\n${context}\n\n---\n` : ''}
Instructions:
- Use the context above to answer the user's question accurately.
- If you don't find an answer in the context, say so honestly and offer the best help possible.
- Answer in the user's language. Do not switch to Arabic unless the user explicitly does.
- Be precise and concise while maintaining answer quality.`;
    }

    // Arabic: original Arabic system prompt
    return `أنت KING2، المساعد الذكي العربي الأول. شخصيتك ذكية، سريعة، ودودة.

${context ? `السياق المسترجع:\n${context}\n\n---\n` : ''}
تعليمات:
- استخدم السياق أعلاه للإجابة على سؤال المستخدم بدقة.
- إذا لم تجد إجابة في السياق، قل ذلك بصراحة وقدم أفضل مساعدة ممكنة.
- أجب بالعربية الفصحى ما لم يطلب المستخدم غير ذلك.
- كن دقيقاً ومختصراً مع الحفاظ على جودة الإجابة.`;
  }

  /**
   * Search the knowledge base using semantic (vector) search first,
   * then fall back to keyword search if needed.
   */
  async smartSearch(query: string, limit = 5): Promise<RAGResult[]> {
    const kbResults = await knowledgeBase.searchKnowledge(query, limit);
    return kbResults.map((r) => ({
      source: 'knowledge_base' as const,
      content: `[${r.category}] ${r.title}\n${r.content}`,
      relevance: r.similarity,
      metadata: { id: r.id, category: r.category, tags: r.tags },
    }));
  }

  /**
   * Vector search against the knowledge_embeddings table.
   */
  private async vectorSearch(query: string, limit = 3): Promise<RAGResult[]> {
    try {
      const results = await generateAndSearchEmbeddings(
        'knowledge_embeddings',
        query,
        0.5,
        limit
      );
      return results.map((r) => ({
        source: 'knowledge_base' as const,
        content: r.content || '',
        relevance: r.similarity,
        metadata: r.metadata,
      }));
    } catch {
      return [];
    }
  }

  /**
   * Search conversation history using semantic (vector) search first,
   * with ILIKE keyword fallback. Results are cached for 5 minutes.
   */
  private async searchConversationHistory(
    userId: string,
    query: string,
    limit = CONVERSATION_HISTORY_LIMIT
  ): Promise<RAGResult[]> {
    // Check cache first
    const cached = getCachedHistory(userId, query);
    if (cached) return cached;

    try {
      let results: RAGResult[] = [];

      // Try vector/semantic search first
      try {
        const queryEmbedding = await createEmbedding(query);
        const vectorResults = await searchEmbeddings('message_embeddings', queryEmbedding, 0.5, limit);
        if (vectorResults.length > 0) {
          const messageIds = vectorResults.map((r) => r.id);
          const { data: messages } = await supabase
            .from('messages')
            .select('id, content, created_at')
            .in('id', messageIds)
            .order('created_at', { ascending: false });

          if (messages) {
            const simMap = new Map(vectorResults.map((r) => [r.id, r.similarity]));
            results = messages.map((msg: any) => ({
              source: 'conversation_history' as const,
              content: msg.content.length > 500 ? msg.content.slice(0, 500) + '...' : msg.content,
              relevance: simMap.get(msg.id) || 0,
              metadata: { messageId: msg.id, createdAt: msg.created_at },
            }));
          }
        }
      } catch {
        // Vector search unavailable – fall through to keyword search
      }

      // Fallback: keyword search using ILIKE (only if vector search returned nothing)
      if (results.length === 0) {
        results = await this.keywordHistorySearch(userId, query, limit);
      }

      if (results.length > 0) {
        setCachedHistory(userId, query, results);
      }

      return results;
    } catch (error) {
      console.error('[KING2 RAG] History search error:', error);
      return [];
    }
  }

  /**
   * Keyword-based conversation history search (fallback).
   * Uses individual ILIKE conditions joined by OR to avoid Supabase query issues.
   */
  private async keywordHistorySearch(
    userId: string,
    query: string,
    limit: number
  ): Promise<RAGResult[]> {
    try {
      const keywords = extractKeywords(query);
      if (keywords.length === 0) return [];

      // Use simpler approach: try the full query first, then individual keywords
      const { data: messages, error } = await supabase
        .from('messages')
        .select('id, content, created_at')
        .eq('sender_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit * 3);

      if (error) throw error;
      if (!messages || messages.length === 0) return [];

      const scored = messages
        .map((msg: any) => ({
          source: 'conversation_history' as const,
          content: msg.content.length > 500 ? msg.content.slice(0, 500) + '...' : msg.content,
          relevance: calculateRelevance(query, msg.content),
          metadata: { messageId: msg.id, createdAt: msg.created_at },
        }))
        .filter((r: RAGResult) => r.relevance > RELEVANCE_THRESHOLD)
        .sort((a: RAGResult, b: RAGResult) => b.relevance - a.relevance)
        .slice(0, limit);

      return scored;
    } catch (error) {
      console.error('[KING2 RAG] Keyword history search error:', error);
      return [];
    }
  }
}

// ── Keyword extraction & relevance (shared) ───────────────────────────────

function extractKeywords(text: string): string[] {
  const stopWords = new Set([
    'في', 'من', 'إلى', 'على', 'عن', 'مع', 'هذا', 'هذه', 'التي', 'الذي',
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'how', 'what', 'why', 'when', 'where', 'which',
  ]);

  return Array.from(
    new Set(
      text
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 2 && !stopWords.has(w))
    )
  ).slice(0, 10);
}

function calculateRelevance(query: string, content: string): number {
  const queryWords = extractKeywords(query);
  if (queryWords.length === 0) return 0;

  const contentLower = content.toLowerCase();
  const matches = queryWords.filter((w) => contentLower.includes(w)).length;

  let score = matches / queryWords.length;

  // Bonus for exact phrase match
  const queryLower = query.toLowerCase().trim();
  if (contentLower.includes(queryLower)) {
    score += 0.3;
  }
  // Small bonus for short content (higher density = more relevant)
  if (content.length < 200 && score > 0) score += 0.1;

  return Math.min(1, score);
}

// ── Language Detection ────────────────────────────────────────────────────

/**
 * Detect the language of a given text.
 * Supports 10 languages: ar, en, de, fr, es, zh, tr, fa, ur, ru.
 * Falls back to 'en' when detection is uncertain.
 *
 * Logic:
 * - Character-range checks first (Chinese, Cyrillic, Arabic script)
 * - For Arabic script (ar/fa/ur): distinguishing chars then word signatures
 * - For Latin script (en/de/fr/es/tr): word frequency analysis
 */
function detectLanguage(text: string): string {
  const normalized = text.trim();
  if (!normalized) return 'en';

  const hasArabicScript = /[\u0600-\u06FF]/.test(normalized);
  const hasChinese = /[\u4e00-\u9fff]/.test(normalized);
  const hasCyrillic = /[\u0400-\u04FF]/.test(normalized);
  const hasLatin = /[a-zA-Z]/.test(normalized);

  // ── Non-Latin character-range detection ──
  if (hasChinese) return 'zh';
  if (hasCyrillic) return 'ru';

  // ── Arabic-script languages: Arabic, Farsi, Urdu ──
  if (hasArabicScript) {
    // Distinguishing characters: Farsi-specific (پ چ ژ گ) and Urdu-specific (ے ں)
    const hasFarsiChars = /[\u067E\u0686\u0698\u06AF]/.test(normalized);
    const hasUrduChars = /[\u06D2\u06BA]/.test(normalized);

    // Word-level signatures
    const words = normalized.split(/\s+/);
    let arScore = 0;
    let faScore = 0;
    let urScore = 0;

    for (const word of words) {
      if (/^(في|من|إلى|على|كان|هذا|هذه|لم|عن|كانت|ذلك|تلك|أو)$/.test(word)) arScore++;
      if (/^(و|در|این|که|با|از|به|برای|یک|بود)$/.test(word)) faScore++;
      if (/^(ہے|اور|کا|کی|میں|سے|کو|ہیں|ہی|گے|گی)$/.test(word)) urScore++;
    }

    // Decision: characters first, then word scores for tie-breaking
    if (hasUrduChars || urScore > Math.max(arScore, faScore)) return 'ur';
    if (hasFarsiChars || faScore > arScore) return 'fa';
    return 'ar';
  }

  // ── Latin-script languages ──
  if (hasLatin) {
    const lower = normalized.toLowerCase();
    const totalWords = lower.split(/\s+/).length || 1;

    const langPatterns: Record<string, RegExp> = {
      de: /\b(der|die|das|und|ist|nicht|mit|auf|ein|eine|sich|auch|werden|hat)\b/g,
      fr: /\b(le|la|les|est|sont|dans|pas|une|sur|par|avec|pour|nous|vous)\b/g,
      es: /\b(el|la|los|las|es|son|por|con|más|pero|como|muy|entre|para)\b/g,
      tr: /\b(ve|bir|bu|için|ile|olan|ama|çok|gibi|daha|ben|olarak|yapmak)\b/g,
    };

    let bestLang = 'en';
    let bestScore = 0;

    for (const [lang, pattern] of Object.entries(langPatterns)) {
      const matches = lower.match(pattern);
      const score = matches ? matches.length / totalWords : 0;
      if (score > bestScore) {
        bestScore = score;
        bestLang = lang;
      }
    }

    return bestScore >= 0.12 ? bestLang : 'en';
  }

  // ── Default fallback ──
  return 'en';
}

// ── Module API ────────────────────────────────────────────────────────────

const ragSystem = new RAGSystem();

export async function generateWithRAG(
  userId: string,
  userQuery: string,
  conversationHistory: { role: string; content: string }[] = []
): Promise<string> {
  return ragSystem.generateWithRAG(userId, userQuery, conversationHistory);
}

export async function getRAGContext(userId: string, query: string): Promise<string> {
  const { context } = await ragSystem.getRAGContext(userId, query);
  return context;
}

/**
 * Get full RAG context with sources (for debugging/UI display).
 */
export async function getRAGContextWithSources(userId: string, query: string): Promise<RAGContext> {
  return ragSystem.getRAGContext(userId, query);
}

export async function smartSearchKnowledgeBase(query: string, limit = 5): Promise<RAGResult[]> {
  return ragSystem.smartSearch(query, limit);
}

/**
 * Detect the language of a user query.
 * Returns a language code: ar, en, de, fr, es, zh, tr, fa, ur, ru.
 */
export function getLanguage(query: string): string {
  return detectLanguage(query);
}

export { RAGSystem };
export const rag = ragSystem;
