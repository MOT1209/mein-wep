import { supabase } from '@/lib/supabase';
import {
  createEmbedding,
  generateAndSearchEmbeddings,
  cosineSimilarity,
  SearchResult,
} from '@/lib/vector';
import { createHash } from 'crypto';

// ── Types ─────────────────────────────────────────────────────────────────

export interface KnowledgeResult {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  similarity: number;
  metadata: Record<string, any>;
}

// ── Cache for repeated queries ────────────────────────────────────────────

interface CacheEntry {
  results: KnowledgeResult[];
  expiresAt: number;
}

const QUERY_CACHE_TTL_MS = 1000 * 60 * 10; // 10 minutes
const queryCache = new Map<string, CacheEntry>();

function getCacheKey(query: string): string {
  return createHash('sha256').update(query.toLowerCase().trim()).digest('hex');
}

function getCachedResults(query: string): KnowledgeResult[] | null {
  const key = getCacheKey(query);
  const entry = queryCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    queryCache.delete(key);
    return null;
  }
  return entry.results;
}

function setCachedResults(query: string, results: KnowledgeResult[]): void {
  const key = getCacheKey(query);
  queryCache.set(key, { results, expiresAt: Date.now() + QUERY_CACHE_TTL_MS });
  if (queryCache.size > 500) {
    const now = Date.now();
    Array.from(queryCache.entries()).forEach(([k, v]) => {
      if (v.expiresAt < now) queryCache.delete(k);
    });
  }
}

// ── Helper ────────────────────────────────────────────────────────────────

function toKnowledgeResult(row: any, similarity = 0): KnowledgeResult {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    category: row.category,
    tags: row.tags || [],
    similarity,
    metadata: {
      views: row.views ?? 0,
      helpful: row.helpful ?? 0,
      is_published: row.is_published ?? false,
      is_featured: row.is_featured ?? false,
      created_at: row.created_at,
      updated_at: row.updated_at,
    },
  };
}

// ── Knowledge Base ────────────────────────────────────────────────────────

export class KnowledgeBase {
  // ── CRUD ──────────────────────────────────────────────────────────────

  async addKnowledge(
    title: string,
    content: string,
    category: string,
    tags: string[] = [],
    userId?: string
  ): Promise<void> {
    if (!title?.trim()) throw new Error('عنوان المعرفة مطلوب');
    if (!content?.trim()) throw new Error('محتوى المعرفة مطلوب');
    if (!category?.trim()) throw new Error('التصنيف مطلوب');

    const { data, error } = await supabase
      .from('knowledge_base')
      .insert({
        title: title.trim(),
        content: content.trim(),
        category: category.trim(),
        tags,
        user_id: userId || null,
        is_published: true,
      })
      .select('id')
      .single();

    if (error) throw new Error(`فشل إضافة المعرفة: ${error.message}`);
    if (!data) throw new Error('فشل إضافة المعرفة: لم يتم إرجاع معرف');

    // Store embedding asynchronously (don't block the response)
    this._storeEmbedding(data.id, title, content, tags, category).catch((err) =>
      console.warn('[KnowledgeBase] فشل تخزين التضمين:', err)
    );

    console.log(`[KnowledgeBase] تم إضافة المعرفة: "${title}" (${data.id})`);
  }

  /**
   * Search knowledge using semantic (vector) search first,
   * then fall back to keyword search.
   * Results are cached for 10 minutes.
   */
  async searchKnowledge(query: string, limit = 5): Promise<KnowledgeResult[]> {
    if (!query?.trim()) return [];

    // Check cache first
    const cached = getCachedResults(query);
    if (cached) return cached;

    let results: KnowledgeResult[] = [];

    // 1. Try vector search
    try {
      const vectorResults = await generateAndSearchEmbeddings(
        'knowledge_embeddings',
        query,
        0.5,
        limit
      );

      if (vectorResults.length > 0) {
        const ids = vectorResults.map((r) => r.id);
        const { data: rows, error } = await supabase
          .from('knowledge_base')
          .select('*')
          .in('id', ids)
          .eq('is_published', true);

        if (!error && rows && rows.length > 0) {
          const idToResult = new Map(
            vectorResults.map((vr) => [vr.id, vr.similarity])
          );
          results = rows
            .map((row) => {
              const sim = idToResult.get(row.id) || 0;
              return toKnowledgeResult(row, sim);
            })
            .sort((a, b) => b.similarity - a.similarity);
        }
      }
    } catch (err) {
      console.warn('[KnowledgeBase] Vector search failed, using keyword fallback:', err);
    }

    // 2. Fallback to keyword search if vector search returned nothing
    if (results.length === 0) {
      results = await this.keywordSearch(query, limit);
    }

    // Cache results
    if (results.length > 0) {
      setCachedResults(query, results);
    }

    return results;
  }

  async deleteKnowledge(id: string): Promise<void> {
    if (!id) throw new Error('معرف المعرفة مطلوب');

    const { error: embedError } = await supabase
      .from('knowledge_embeddings')
      .delete()
      .eq('knowledge_id', id);

    if (embedError) {
      console.warn('[KnowledgeBase] فشل حذف التضمين:', embedError.message);
    }

    const { error } = await supabase
      .from('knowledge_base')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`فشل حذف المعرفة: ${error.message}`);

    // Clear cache
    queryCache.clear();

    console.log(`[KnowledgeBase] تم حذف المعرفة: ${id}`);
  }

  async updateKnowledge(
    id: string,
    updates: Partial<{
      title: string;
      content: string;
      category: string;
      tags: string[];
    }>
  ): Promise<void> {
    if (!id) throw new Error('معرف المعرفة مطلوب');

    const updateData: Record<string, any> = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    if (updateData.title) updateData.title = updateData.title.trim();
    if (updateData.content) updateData.content = updateData.content.trim();
    if (updateData.category) updateData.category = updateData.category.trim();

    const { error } = await supabase
      .from('knowledge_base')
      .update(updateData)
      .eq('id', id);

    if (error) throw new Error(`فشل تحديث المعرفة: ${error.message}`);

    // Re-generate embedding if content changed
    if (updates.title || updates.content || updates.tags) {
      try {
        const { data: row } = await supabase
          .from('knowledge_base')
          .select('title, content, category, tags')
          .eq('id', id)
          .single();

        if (row) {
          await this._storeEmbedding(id, row.title, row.content, row.tags || [], row.category);
        }
      } catch (err) {
        console.warn('[KnowledgeBase] فشل إعادة إنشاء التضمين:', err);
      }
    }

    // Clear cache
    queryCache.clear();

    console.log(`[KnowledgeBase] تم تحديث المعرفة: ${id}`);
  }

  async getRelevantContext(query: string, maxResults = 5): Promise<string> {
    if (!query?.trim()) return '';

    const results = await this.searchKnowledge(query, maxResults);

    if (results.length === 0) return '';

    return results
      .map(
        (r, i) =>
          `[${i + 1}] ${r.title} (${r.category})\n${r.content.slice(0, 1000)}${
            r.content.length > 1000 ? '...' : ''
          }`
      )
      .join('\n\n---\n\n');
  }

  // ── Keyword search (fallback) ─────────────────────────────────────────

  private async keywordSearch(query: string, limit: number): Promise<KnowledgeResult[]> {
    try {
      // Simplified query: use individual ILIKE conditions via `or` but
      // only with the full query string (not complex tag conditions)
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .eq('is_published', true)
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .order('is_featured', { ascending: false })
        .order('helpful', { ascending: false })
        .limit(limit * 2);

      if (error) throw error;
      if (!data || data.length === 0) return [];

      const queryWords = this.extractKeywords(query);
      const scored = data
        .map((row: any) => {
          const relevance = this.calculateRelevance(query, queryWords, row);
          return toKnowledgeResult(row, relevance);
        })
        .filter((r) => r.similarity > 0)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

      return scored;
    } catch (err) {
      console.error('[KnowledgeBase] فشل البحث النصي:', err);
      return [];
    }
  }

  // ── Embedding storage ─────────────────────────────────────────────────

  private async _storeEmbedding(
    id: string,
    title: string,
    content: string,
    tags: string[],
    category: string
  ): Promise<void> {
    const text = `${title} ${content} ${tags.join(' ')} ${category}`;
    const embedding = await createEmbedding(text);

    const { error: embedError } = await supabase
      .from('knowledge_embeddings')
      .upsert(
        {
          knowledge_id: id,
          embedding,
          created_at: new Date().toISOString(),
        },
        { onConflict: 'knowledge_id' }
      );

    if (embedError) {
      throw new Error(`فشل تخزين التضمين: ${embedError.message}`);
    }
  }

  // ── Relevance scoring ─────────────────────────────────────────────────

  private extractKeywords(text: string): string[] {
    const stopWords = new Set([
      'في', 'من', 'إلى', 'على', 'عن', 'مع', 'هذا', 'هذه', 'التي', 'الذي',
      'كان', 'غير', 'ما', 'كل', 'حتى', 'بعض', 'ثم', 'بين', 'أو', 'لا',
      'هل', 'لم', 'لن', 'إن', 'أن', 'إذا', 'قد', 'لقد', 'سوف', 'كانت',
      'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
      'should', 'may', 'might', 'how', 'what', 'why', 'when', 'where', 'which',
      'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'it', 'its',
      'also', 'very', 'just', 'not', 'no', 'but', 'and', 'for', 'nor', 'or',
      'yet', 'so', 'if', 'as', 'at', 'by', 'in', 'of', 'on', 'to', 'up',
    ]);

    return Array.from(
      new Set(
        text
          .toLowerCase()
          .replace(/[^\w\sء-ي]/g, ' ')
          .split(/\s+/)
          .filter((w) => w.length > 2 && !stopWords.has(w))
      )
    ).slice(0, 10);
  }

  private calculateRelevance(
    query: string,
    queryWords: string[],
    row: any
  ): number {
    if (queryWords.length === 0) return 0;

    const searchText = `${row.title} ${row.content} ${(row.tags || []).join(' ')} ${row.category}`.toLowerCase();
    const matches = queryWords.filter((w) => searchText.includes(w)).length;

    let score = matches / queryWords.length;
    const queryLower = query.toLowerCase().trim();

    // Title match bonus (strong signal)
    if (row.title?.toLowerCase().includes(queryLower)) {
      score += 0.4;
    } else if (row.title && queryWords.some((w) => row.title.toLowerCase().includes(w))) {
      score += 0.2;
    }

    // Content exact match bonus
    if (row.content?.toLowerCase().includes(queryLower)) {
      score += 0.15;
    }

    // Tag match bonus
    const tagBonus = (row.tags || []).filter((t: string) =>
      queryWords.some((qw) => t.toLowerCase().includes(qw))
    ).length * 0.1;
    score += tagBonus;

    // Category match bonus
    if (row.category && queryWords.some((w) => row.category.toLowerCase().includes(w))) {
      score += 0.1;
    }

    return Math.min(1, score);
  }

  /**
   * Clear the query cache (useful after updates).
   */
  clearCache(): void {
    queryCache.clear();
  }

  /**
   * Remove all knowledge-base entries (used in test teardown).
   * Requires admin privileges.
   */
  async clearAll(): Promise<void> {
    const { error: embedError } = await supabase
      .from('knowledge_embeddings')
      .delete()
      .neq('knowledge_id', '');

    if (embedError) {
      console.warn('[KnowledgeBase] فشل حذف التضمينات:', embedError.message);
    }

    const { error } = await supabase
      .from('knowledge_base')
      .delete()
      .neq('id', '');

    if (error) throw new Error(`فشل حذف كل المعرفة: ${error.message}`);

    queryCache.clear();
    console.log('[KnowledgeBase] تم حذف جميع المعرفة');
  }
}

export const knowledgeBase = new KnowledgeBase();
