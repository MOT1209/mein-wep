// =============================================================================
// KING2 AI — Web Search Tool
// =============================================================================
// - Tavily API primary, DuckDuckGo fallback
// - Built-in timeout
// - Clean result formatting with sources
// =============================================================================

import { ToolDefinition } from '@/lib/agents/types';

const SEARCH_TIMEOUT = 10_000; // 10s

interface SearchResult {
  title: string;
  content: string;
  url: string;
}

/**
 * Search via Tavily API
 */
async function searchTavily(query: string, count: number): Promise<SearchResult[]> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) throw new Error('Tavily API key not configured');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SEARCH_TIMEOUT);

  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        api_key: apiKey,
        query,
        max_results: count,
        search_depth: 'advanced',
        include_answer: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Tavily API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const results: SearchResult[] = (data.results || []).map((r: any) => ({
      title: r.title || 'بدون عنوان',
      content: r.content || '',
      url: r.url || '',
    }));

    // Prepend AI-generated answer if available
    if (data.answer) {
      results.unshift({
        title: '📌 ملخص البحث',
        content: data.answer,
        url: '',
      });
    }

    return results;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Search via DuckDuckGo (free fallback)
 */
async function searchDuckDuckGo(query: string, count: number): Promise<SearchResult[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SEARCH_TIMEOUT);

  try {
    const response = await fetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`,
      { signal: controller.signal }
    );

    if (!response.ok) {
      throw new Error(`DuckDuckGo error: ${response.status}`);
    }

    const data = await response.json();
    const results: SearchResult[] = [];

    // Abstract
    if (data.AbstractText) {
      results.push({
        title: data. Heading || 'ملخص',
        content: data.AbstractText,
        url: data.AbstractURL || '',
      });
    }

    // Related topics
    const topics = data.RelatedTopics || [];
    for (const topic of topics.slice(0, count)) {
      if (topic.Text) {
        results.push({
          title: topic.Text.split(' - ')[0] || 'نتيجة',
          content: topic.Text,
          url: topic.FirstURL || '',
        });
      }
      // Nested topics
      if (topic.Topics) {
        for (const sub of topic.Topics.slice(0, 3)) {
          if (sub.Text) {
            results.push({
              title: sub.Text.split(' - ')[0] || 'نتيجة',
              content: sub.Text,
              url: sub.FirstURL || '',
            });
          }
        }
      }
    }

    return results;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Format search results as text
 */
function formatResults(results: SearchResult[]): string {
  if (results.length === 0) return 'لم يتم العثور على نتائج';

  return results
    .map((r, i) => {
      let entry = `**${i + 1}. ${r.title}**`;
      if (r.content) entry += `\n${r.content}`;
      if (r.url) entry += `\n🔗 ${r.url}`;
      return entry;
    })
    .join('\n\n');
}

// ── Tool Definition ──────────────────────────────────────────────────

export const webSearchTool: ToolDefinition = {
  name: 'web_search',
  description: 'بحث في الإنترنت للحصول على معلومات حديثة من الويب',
  parameters: [
    {
      name: 'query',
      type: 'string',
      description: 'استعلام البحث (مثال: "أخبار الذكاء الاصطناعي 2026")',
      required: true,
    },
    {
      name: 'num_results',
      type: 'number',
      description: 'عدد النتائج المطلوبة (1-15، الافتراضي 7)',
      required: false,
    },
  ],
  parallelSafe: true,
  timeout: 15_000,
  execute: async (args: { query: string; num_results?: number }) => {
    const query = args.query?.trim();
    if (!query) return 'يرجى توفير استعلام بحث';

    const count = Math.min(Math.max(args.num_results || 7, 1), 15);
    let lastError: string | null = null;

    // 1. Try Tavily first
    try {
      const results = await searchTavily(query, count);
      if (results.length > 0) return formatResults(results);
    } catch (error: any) {
      lastError = error.message;
      console.warn(`[WebSearch] Tavily failed, falling back to DuckDuckGo: ${lastError}`);
    }

    // 2. Fallback to DuckDuckGo
    try {
      const results = await searchDuckDuckGo(query, count);
      if (results.length > 0) return formatResults(results);
    } catch (error: any) {
      lastError = error.message;
      console.warn(`[WebSearch] DuckDuckGo also failed: ${lastError}`);
    }

    return lastError
      ? `تعذر إتمام البحث. الرجاء المحاولة لاحقاً.\nالتفاصيل: ${lastError}`
      : 'لم يتم العثور على نتائج للاستعلام المطلوب';
  },
};
