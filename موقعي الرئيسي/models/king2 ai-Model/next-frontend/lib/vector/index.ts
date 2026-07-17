import { supabase } from '@/lib/supabase';
import { createHash } from 'crypto';

// ── Types ─────────────────────────────────────────────────────────────────

export interface SearchResult {
  id: string;
  content: string;
  metadata: Record<string, any>;
  similarity: number;
}

interface EmbeddingCacheEntry {
  embedding: number[];
  timestamp: number;
}

// ── LRU Cache for embeddings ──────────────────────────────────────────────

const EMBEDDING_DIMENSION = 768;
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour
const LRU_MAX_SIZE = 2000;

class LRUCache {
  private cache = new Map<string, EmbeddingCacheEntry>();
  private readonly maxSize: number;
  private readonly ttl: number;

  constructor(maxSize: number, ttl: number) {
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  get(key: string): number[] | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return undefined;
    }
    // LRU: move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.embedding;
  }

  set(key: string, embedding: number[]): void {
    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) this.cache.delete(oldestKey);
    }
    this.cache.set(key, { embedding, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}

const embeddingCache = new LRUCache(LRU_MAX_SIZE, CACHE_TTL_MS);

// ── API key ───────────────────────────────────────────────────────────────

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
  if (!key) {
    throw new Error('GEMINI_API_KEY غير موجود. يرجى تعيينه في ملف .env');
  }
  return key;
}

// ── Normalisation & cache key ─────────────────────────────────────────────

function normalizeText(text: string): string {
  return text.toLowerCase().trim().replace(/\s+/g, ' ');
}

function getCacheKey(text: string): string {
  const normalized = normalizeText(text);
  return createHash('sha256').update(normalized).digest('hex');
}

// ── Embedding API call ────────────────────────────────────────────────────

async function embedContent(text: string): Promise<number[]> {
  const apiKey = getApiKey();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'models/text-embedding-004',
      content: { parts: [{ text }] },
    }),
  });

  if (!response.ok) {
    let errorMsg = response.statusText;
    try {
      const errData = await response.json();
      errorMsg = errData.error?.message || errorMsg;
    } catch {}
    throw new Error(`فشل إنشاء التضمين: ${errorMsg}`);
  }

  const data = await response.json();
  const values = data.embedding?.values;
  if (!values || !Array.isArray(values) || values.length !== EMBEDDING_DIMENSION) {
    throw new Error('استجابة التضمين من Gemini غير صالحة');
  }
  return values;
}

// ── Public embedding API ──────────────────────────────────────────────────

export async function createEmbedding(text: string): Promise<number[]> {
  if (!text || text.trim().length === 0) {
    throw new Error('لا يمكن إنشاء تضمين لنص فارغ');
  }

  const cacheKey = getCacheKey(text);
  const cached = embeddingCache.get(cacheKey);
  if (cached) return cached;

  const embedding = await embedContent(text);
  embeddingCache.set(cacheKey, embedding);
  return embedding;
}

/**
 * Batch embedding with concurrency control.
 * Processes in batches of `batchSize` to avoid rate limits.
 */
export async function createEmbeddings(
  texts: string[],
  batchSize: number = 10
): Promise<number[][]> {
  const results: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    // Check cache first for each text
    const uncached: { index: number; text: string }[] = [];
    const batchResults: (number[] | null)[] = new Array(batch.length).fill(null);

    for (let j = 0; j < batch.length; j++) {
      const cacheKey = getCacheKey(batch[j]);
      const cached = embeddingCache.get(cacheKey);
      if (cached) {
        batchResults[j] = cached;
      } else {
        uncached.push({ index: j, text: batch[j] });
      }
    }

    // Fetch uncached embeddings in parallel
    if (uncached.length > 0) {
      const fetched = await Promise.all(
        uncached.map((item) => embedContent(item.text).then((emb) => ({ index: item.index, emb })))
      );
      for (const { index, emb } of fetched) {
        batchResults[index] = emb;
        embeddingCache.set(getCacheKey(batch[index]), emb);
      }
    }

    for (const r of batchResults) {
      if (r) results.push(r);
    }
  }

  return results;
}

// ── Cosine similarity (optimised) ─────────────────────────────────────────

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('أبعاد التضمين غير متطابقة');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denomA = Math.sqrt(normA);
  const denomB = Math.sqrt(normB);
  if (denomA === 0 || denomB === 0) return 0;

  return dotProduct / (denomA * denomB);
}

/**
 * Pre-compute vector norm for repeated use.
 * Useful when the same embedding is compared against many others.
 */
export function precomputeNorm(v: number[]): number {
  let norm = 0;
  for (let i = 0; i < v.length; i++) {
    norm += v[i] * v[i];
  }
  return Math.sqrt(norm);
}

export function cosineSimilarityNormalized(
  a: number[],
  normA: number,
  b: number[],
  normB: number
): number {
  if (normA === 0 || normB === 0) return 0;
  let dotProduct = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
  }
  return dotProduct / (normA * normB);
}

// ── Store / search ────────────────────────────────────────────────────────

const VECTOR_TABLES = new Set([
  'knowledge_embeddings',
  'memory_embeddings',
  'message_embeddings',
]);

export async function storeEmbedding(
  table: string,
  id: string,
  embedding: number[],
  metadata: Record<string, any>
): Promise<void> {
  if (!VECTOR_TABLES.has(table)) {
    throw new Error(`جدول متجهات غير معروف: ${table}. المتاح: ${Array.from(VECTOR_TABLES).join(', ')}`);
  }
  if (embedding.length !== EMBEDDING_DIMENSION) {
    throw new Error(`بعد التضمين يجب أن يكون ${EMBEDDING_DIMENSION}`);
  }

  const { error } = await supabase.from(table).upsert(
    {
      id,
      embedding,
      metadata,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' }
  );

  if (error) {
    throw new Error(`فشل تخزين التضمين في ${table}: ${error.message}`);
  }
}

export async function searchEmbeddings(
  table: string,
  queryEmbedding: number[],
  matchThreshold: number,
  matchCount: number
): Promise<SearchResult[]> {
  if (!VECTOR_TABLES.has(table)) {
    throw new Error(`جدول متجهات غير معروف: ${table}`);
  }
  if (queryEmbedding.length !== EMBEDDING_DIMENSION) {
    throw new Error(`بعد التضمين يجب أن يكون ${EMBEDDING_DIMENSION}`);
  }

  const { data, error } = await supabase.rpc('match_embeddings', {
    query_embedding: queryEmbedding,
    match_threshold: matchThreshold,
    match_count: matchCount,
    table_name: table,
  });

  if (error) {
    if (error.message?.includes('function "match_embeddings" does not exist')) {
      return searchEmbeddingsFallback(table, queryEmbedding, matchThreshold, matchCount);
    }
    throw new Error(`فشل البحث عن التضمينات: ${error.message}`);
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    content: row.content || '',
    metadata: row.metadata || {},
    similarity: row.similarity || 0,
  }));
}

/**
 * Client-side fallback search when the pgvector RPC is not available.
 * Uses pre-computed norms for efficiency.
 */
async function searchEmbeddingsFallback(
  table: string,
  queryEmbedding: number[],
  matchThreshold: number,
  matchCount: number
): Promise<SearchResult[]> {
  const { data, error } = await supabase
    .from(table)
    .select('*');

  if (error) throw new Error(`فشل البحث المحلي: ${error.message}`);
  if (!data || data.length === 0) return [];

  // Pre-compute query norm once
  const queryNorm = precomputeNorm(queryEmbedding);

  const results: SearchResult[] = [];

  for (const row of data) {
    const storedEmbedding = row.embedding;
    if (!storedEmbedding || !Array.isArray(storedEmbedding)) continue;

    const storedNorm = precomputeNorm(storedEmbedding);
    const similarity = cosineSimilarityNormalized(queryEmbedding, queryNorm, storedEmbedding, storedNorm);
    if (similarity >= matchThreshold) {
      results.push({
        id: row.id,
        content: row.content || '',
        metadata: row.metadata || {},
        similarity,
      });
    }
  }

  return results
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, matchCount);
}

// ── Convenience ───────────────────────────────────────────────────────────

export async function generateAndStoreEmbedding(
  table: string,
  id: string,
  text: string,
  metadata: Record<string, any>
): Promise<void> {
  const embedding = await createEmbedding(text);
  await storeEmbedding(table, id, embedding, { ...metadata, original_text: text });
}

export async function generateAndSearchEmbeddings(
  table: string,
  query: string,
  matchThreshold: number,
  matchCount: number
): Promise<SearchResult[]> {
  const embedding = await createEmbedding(query);
  return searchEmbeddings(table, embedding, matchThreshold, matchCount);
}

export function clearEmbeddingCache(): void {
  embeddingCache.clear();
}

export { VECTOR_TABLES, LRUCache };
