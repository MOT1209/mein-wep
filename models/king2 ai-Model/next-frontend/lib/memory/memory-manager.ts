import { supabase } from '@/lib/supabase';
import { AgentMessage } from '@/lib/agents/types';
import { executeResponseWithFallback } from '@/lib/fallback';
import { createEmbedding, searchEmbeddings } from '@/lib/vector';
import { createHash } from 'crypto';

// ── Types ─────────────────────────────────────────────────────────────────

interface ConversationMemory {
  conversationId: string;
  messages: AgentMessage[];
  context: string[];
  summary?: string;
  // last summarised message index (for incremental summarisation)
  lastSummaryIndex: number;
}

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

// ── Active conversation cache (in-memory, TTL-based) ───────────────────────

const ACTIVE_CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes

/** Cache for active conversations – avoids hitting Supabase for ongoing chats */
const activeConversationCache = new Map<string, CacheEntry<ConversationMemory>>();

// ── Summary config ─────────────────────────────────────────────────────────

const SUMMARY_THRESHOLD = 30; // was 20, now 30
const SUMMARY_TRIGGER_STEP = 15; // re-summarise every 15 new messages beyond threshold

// ── LRU helper for cache eviction ──────────────────────────────────────────

function getActiveCacheKey(userId: string, conversationId: string): string {
  return `${userId}::${conversationId}`;
}

function setActiveCache(userId: string, conversationId: string, memory: ConversationMemory): void {
  const key = getActiveCacheKey(userId, conversationId);
  activeConversationCache.set(key, {
    data: memory,
    expiresAt: Date.now() + ACTIVE_CACHE_TTL_MS,
  });
  // Evict stale entries if cache grows too large
  if (activeConversationCache.size > 500) {
    const now = Date.now();
    Array.from(activeConversationCache.entries()).forEach(([k, v]) => {
      if (v.expiresAt < now) activeConversationCache.delete(k);
    });
  }
}

function getActiveCache(userId: string, conversationId: string): ConversationMemory | null {
  const key = getActiveCacheKey(userId, conversationId);
  const entry = activeConversationCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    activeConversationCache.delete(key);
    return null;
  }
  return entry.data;
}

function clearActiveCache(userId: string, conversationId?: string): void {
  if (conversationId) {
    activeConversationCache.delete(getActiveCacheKey(userId, conversationId));
  } else {
    const prefix = `${userId}::`;
    Array.from(activeConversationCache.keys()).forEach((key) => {
      if (key.startsWith(prefix)) activeConversationCache.delete(key);
    });
  }
}

// ── Persistence (Supabase) ─────────────────────────────────────────────────

export async function saveConversationMemory(
  userId: string,
  conversationId: string,
  messages: AgentMessage[]
): Promise<void> {
  // Always update in-memory cache first
  const existing = getActiveCache(userId, conversationId) || {
    conversationId,
    messages: [],
    context: [],
    lastSummaryIndex: 0,
  };
  existing.messages = messages;
  setActiveCache(userId, conversationId, existing);

  // Persist to Supabase (fire-and-forget with error logging)
  try {
    const { error } = await supabase.from('agent_memory').upsert(
      {
        user_id: userId,
        conversation_id: conversationId,
        messages: JSON.stringify(messages),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'conversation_id' }
    );
    if (error) throw error;
  } catch (err) {
    console.warn('[Memory] Supabase save failed, keeping in-memory:', err);
    // Data is still in cache – no data loss for active conversations
  }
}

export async function loadConversationMemory(
  userId: string,
  conversationId: string
): Promise<AgentMessage[]> {
  // Try in-memory cache first (fast path)
  const cached = getActiveCache(userId, conversationId);
  if (cached) return cached.messages;

  // Fallback to Supabase
  try {
    const { data, error } = await supabase
      .from('agent_memory')
      .select('messages')
      .eq('user_id', userId)
      .eq('conversation_id', conversationId)
      .single();

    if (error) throw error;
    const messages: AgentMessage[] = data?.messages ? JSON.parse(data.messages) : [];

    // Seed cache
    setActiveCache(userId, conversationId, {
      conversationId,
      messages,
      context: [],
      lastSummaryIndex: messages.length,
    });

    return messages;
  } catch {
    return [];
  }
}

// ── Long-term memory ───────────────────────────────────────────────────────

export async function saveLongTermMemory(
  userId: string,
  key: string,
  value: string,
  category: string = 'general'
): Promise<void> {
  try {
    const { error } = await supabase.from('agent_long_term_memory').upsert(
      {
        user_id: userId,
        key,
        value,
        category,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id, key' }
    );
    if (error) throw error;

    // Store embedding asynchronously (don't block the main operation)
    createEmbedding(`${category}: ${key} ${value}`)
      .then((embedding) =>
        supabase.from('memory_embeddings').upsert(
          { user_id: userId, key, embedding, category, updated_at: new Date().toISOString() },
          { onConflict: 'user_id, key' }
        )
      )
      .catch(() => { /* embedding storage is optional */ });
  } catch (err) {
    console.error('[Memory] Failed to save long-term memory:', err);
  }
}

export async function getLongTermMemory(
  userId: string,
  key: string
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('agent_long_term_memory')
      .select('value')
      .eq('user_id', userId)
      .eq('key', key)
      .single();

    if (error) throw error;
    return data?.value || null;
  } catch {
    return null;
  }
}

export async function searchLongTermMemory(
  userId: string,
  category?: string,
  limit: number = 10
): Promise<{ key: string; value: string; category: string }[]> {
  try {
    let query = supabase
      .from('agent_long_term_memory')
      .select('key, value, category')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (category) {
      query = query.eq('category', category) as any;
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch {
    return [];
  }
}

export async function getUserPreferences(userId: string): Promise<Record<string, any>> {
  const prefs = await searchLongTermMemory(userId, 'preferences', 50);
  return Object.fromEntries(prefs.map((p) => [p.key, p.value]));
}

export async function semanticMemorySearch(
  userId: string,
  query: string,
  limit: number = 5
): Promise<{ key: string; value: string; category: string; similarity: number }[]> {
  try {
    const embedding = await createEmbedding(query);
    const results = await searchEmbeddings('memory_embeddings', embedding, 0.5, limit);

    const keys = results.map((r) => r.id);
    if (keys.length === 0) return [];

    const { data: memories, error } = await supabase
      .from('agent_long_term_memory')
      .select('key, value, category')
      .eq('user_id', userId)
      .in('key', keys);

    if (error) throw error;
    if (!memories) return [];

    const simMap = new Map(results.map((r) => [r.id, r.similarity]));
    return (memories as any[])
      .map((m) => ({
        key: m.key,
        value: m.value,
        category: m.category,
        similarity: simMap.get(m.key) || 0,
      }))
      .sort((a, b) => b.similarity - a.similarity);
  } catch (err) {
    console.error('[Memory] Semantic memory search error:', err);
    return [];
  }
}

// ── Incremental summarisation ──────────────────────────────────────────────

/**
 * Summarises only the *new* messages since the last summary, then merges
 * with the previous summary – dramatically reducing AI call cost.
 */
export async function summarizeConversation(messages: AgentMessage[]): Promise<string> {
  if (messages.length === 0) return '';
  return summarizeMessagesIncremental(messages, 0);
}

async function summarizeMessagesIncremental(
  messages: AgentMessage[],
  lastSummaryIndex: number
): Promise<string> {
  // If no previous summary, summarise from the start
  if (lastSummaryIndex === 0) {
    return doSummarize(messages);
  }

  // Only summarise messages after the last summary point
  const newMessages = messages.slice(lastSummaryIndex);
  if (newMessages.length === 0) {
    // Nothing new – return empty (caller should keep old summary)
    return '';
  }

  return doSummarize(newMessages);
}

async function doSummarize(messages: AgentMessage[]): Promise<string> {
  const conversationText = messages
    .map((m) => `[${m.role}]: ${m.content}`)
    .join('\n');

  const prompt = `قم بتلخيص المحادثة التالية باللغة العربية، مركزاً على:
1. الموضوع الرئيسي
2. القرارات أو الاستنتاجات المهمة
3. أي معلومات شخصية عن المستخدم

المحادثة:
${conversationText}

التلخيص:`;

  try {
    const { text } = await executeResponseWithFallback('auto', [
      { role: 'user', content: prompt },
    ]);
    return text;
  } catch {
    return conversationText.slice(0, 500) + '...';
  }
}

// ── Consolidated save with incremental summarisation ───────────────────────

export async function saveConversationMemoryWithConsolidation(
  userId: string,
  conversationId: string,
  messages: AgentMessage[]
): Promise<void> {
  // Always persist messages first
  await saveConversationMemory(userId, conversationId, messages);

  // Retrieve or create the cached memory state for incremental tracking
  let memory = getActiveCache(userId, conversationId) || {
    conversationId,
    messages,
    context: [],
    lastSummaryIndex: 0,
  };

  const shouldSummarize =
    messages.length > SUMMARY_THRESHOLD &&
    (memory.lastSummaryIndex === 0 ||
      messages.length - memory.lastSummaryIndex >= SUMMARY_TRIGGER_STEP);

  if (shouldSummarize) {
    const newSummary = await summarizeMessagesIncremental(messages, memory.lastSummaryIndex);
    if (newSummary) {
      // Merge with previous summary if available
      const mergedSummary = memory.summary
        ? `[Previous summary]\n${memory.summary}\n\n[New updates]\n${newSummary}`
        : newSummary;

      await saveLongTermMemory(userId, `summary:${conversationId}`, mergedSummary, 'conversation_summary');

      // Update cache with new summary index
      memory.summary = mergedSummary;
      memory.lastSummaryIndex = messages.length;
      setActiveCache(userId, conversationId, memory);
    }
  }
}

// ── Cache management ───────────────────────────────────────────────────────

/** Force-flush a conversation from the active cache */
export function flushConversationCache(userId: string, conversationId: string): void {
  clearActiveCache(userId, conversationId);
}

/** Flush all cached conversations for a user */
export function flushUserCache(userId: string): void {
  clearActiveCache(userId);
}

export type { ConversationMemory };
