import {
  executeStreamWithFallback,
  executeResponseWithFallback,
  chooseProviderForMessage,
  getFastestProvider,
  getProviderMetrics,
} from './fallback';
import { Message } from './providers/base';

export type King2Provider = 'gemini' | 'groq' | 'zai' | 'openrouter' | 'huggingface' | 'qwen' | 'auto';

// ─────────────────────────────────────────────────────────
// Content-type classification
// ─────────────────────────────────────────────────────────

export type ContentCategory = 'code' | 'vision' | 'creative' | 'analytical' | 'general' | 'multilingual';

function classifyContent(messages: Message[]): ContentCategory {
  const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
  if (!lastUserMsg) return 'general';

  const content = lastUserMsg.content.toLowerCase();

  // ── Translation / Multilingual detection (early return) ──
  const multilingualKeywords = [
    'translate', 'translation', 'ترجم', 'ترجمة', 'übersetzen', 'übersetzung',
    'traduire', 'traduction', 'traducir', 'traducción', '翻译', '翻译',
    'çevir', 'çeviri', 'ترجمه', 'ترجمہ', 'перевод', 'перевести',
    'what does', 'meaning of', 'معنى', 'bedeutung', 'signification',
    'significado', '意思', 'anlam', 'معنی', 'значение',
  ];
  const multilingualScore = multilingualKeywords.filter((kw) => content.includes(kw)).length;
  if (multilingualScore >= 2) return 'multilingual';
  // Also check for mixed scripts (multiple language systems)
  const hasArabic = /[\u0600-\u06FF]/.test(content);
  const hasCJK = /[\u4e00-\u9fff]/.test(content);
  const hasCyrillic = /[\u0400-\u04FF]/.test(content);
  const hasLatin = /[a-zA-Z]/.test(content);
  const scriptCount = [hasArabic, hasCJK, hasCyrillic, hasLatin].filter(Boolean).length;
  if (scriptCount >= 2) return 'multilingual';

  // Vision
  if (
    content.includes('img') || content.includes('image') ||
    content.includes('صورة') || content.includes('رؤية') ||
    content.includes('vision') || content.includes('ocr') ||
    content.includes('تعرف على') || content.includes('حلل')
  ) return 'vision';

  // Code
  const codeKeywords = [
    'function', 'class ', 'const ', 'let ', 'var ', 'import ',
    'export ', 'def ', 'return ', 'console.log', 'print(',
    '```', '#include', '#define', 'int main', 'void ',
    'interface', 'type ', 'async ', 'await ',
  ];
  const codeScore = codeKeywords.filter((kw) => content.includes(kw)).length;
  if (codeScore >= 2) return 'code';
  if (content.includes('اكتب') && (
    content.includes('كود') || content.includes('برنامج') ||
    content.includes('سكريبت') || content.includes('دالة')
  )) return 'code';

  // Analytical (math, logic, reasoning)
  const analyticalKeywords = [
    'حلل', 'احسب', 'اشرح', 'قارن', 'استنتج',
    'analyze', 'calculate', 'explain', 'compare', 'reason',
    'math', 'equation', 'formula', 'proof', 'theorem',
    'logical', 'therefore', 'because', 'if then',
  ];
  const analyticalScore = analyticalKeywords.filter((kw) => content.includes(kw)).length;
  if (analyticalScore >= 2) return 'analytical';

  // Creative
  const creativeKeywords = [
    'اكتب قصة', 'قصيدة', 'شعر', 'خيال', 'إبداع',
    'write a story', 'poem', 'creative', 'imagine',
    'design', 'draw', 'paint', 'music', 'melody',
    'سيناريو', 'مسرحية', 'رواية',
  ];
  const creativeScore = creativeKeywords.filter((kw) => content.includes(kw)).length;
  if (creativeScore >= 1) return 'creative';

  return 'general';
}

// ─────────────────────────────────────────────────────────
// Provider-to-model mapping
// ─────────────────────────────────────────────────────────

interface ModelConfig {
  providerId: string;
  displayName: string;
  strengths: ContentCategory[];
  priority: number; // lower = preferred for its strengths
}

const MODEL_REGISTRY: ModelConfig[] = [
  { providerId: 'qwen', displayName: 'Qwen3.5-9B (محلي)', strengths: ['analytical', 'vision', 'code', 'general', 'creative'], priority: 0 },
  { providerId: 'openrouter', displayName: 'OpenRouter GLM 4.5 Air', strengths: ['creative', 'analytical', 'general'], priority: 1 },
  { providerId: 'gemini', displayName: 'Gemini 2.5 Flash', strengths: ['vision', 'analytical', 'general'], priority: 1 },
  { providerId: 'groq', displayName: 'Groq', strengths: ['code', 'general'], priority: 2 },
  { providerId: 'zai', displayName: 'Z.ai GLM-5.1', strengths: ['creative', 'general'], priority: 2 },
  { providerId: 'huggingface', displayName: 'HuggingFace Inference', strengths: ['general', 'code', 'multilingual'], priority: 3 },
  { providerId: 'huggingface', displayName: 'HuggingFace Multilingual', strengths: ['multilingual', 'general', 'code'], priority: 3 },
];

// ─────────────────────────────────────────────────────────
// Smart Routing
// ─────────────────────────────────────────────────────────

/**
 * Select the best provider for the given content and context.
 *
 * Strategy:
 * 1. If user explicitly selected a provider, use it.
 * 2. Classify the content type.
 * 3. Filter providers by strength & health.
 * 4. Score by: strength match, avg latency, success rate, current load.
 * 5. Return the best match.
 */
export function resolveProvider(
  modelName: string,
  messages?: Message[],
): King2Provider {
  // 1. Explicit selection
  if (modelName) {
    const explicit = modelName.toLowerCase().trim();
    if (explicit === 'gemini') return 'gemini';
    if (explicit === 'groq') return 'groq';
    if (explicit === 'zai') return 'zai';
    if (explicit === 'openrouter') return 'openrouter';
    if (explicit === 'huggingface') return 'huggingface';
    if (explicit === 'qwen') return 'qwen';
    if (explicit === 'auto') {
      // Will use smart routing below
    } else {
      // Unknown model name → treat as auto
    }
  }

  // 2. No messages? Use fastest healthy provider
  if (!messages || messages.length === 0) {
    const fastest = getFastestProvider();
    return (fastest as King2Provider) || 'openrouter';
  }

  // 3. Classify content
  const category = classifyContent(messages);

  // 4. Score & rank available providers
  const metrics = getProviderMetrics();
  const scored = MODEL_REGISTRY
    .filter((cfg) => {
      const m = metrics[cfg.providerId] as Record<string, any> | undefined;
      return m?.configured === true;
    })
    .map((cfg) => {
      const m = metrics[cfg.providerId] as Record<string, any> | undefined;
      const providerMetrics = m?.metrics as Record<string, any> | undefined;
      const circuitBreaker = m?.circuitBreaker as Record<string, any> | undefined;
      const health = m?.health as Record<string, any> | undefined;

      let score = 0;

      // Strength match: -50 if best category, -25 if general, 0 if none
      if (cfg.strengths.includes(category)) score -= 50;
      else if (category === 'general') score -= 25;

      // Circuit breaker penalty
      if (circuitBreaker?.cooldownUntil && Date.now() < circuitBreaker.cooldownUntil) {
        score += 1000; // strongly disfavoured
      }

      // Health penalty
      if (health && !health.healthy) score += 500;

      // Latency bonus (lower latency = lower score = better)
      const avgLat = providerMetrics?.totalLatencyMs && providerMetrics?.successCount
        ? providerMetrics.totalLatencyMs / providerMetrics.successCount
        : null;
      if (avgLat !== null && avgLat < Infinity) {
        score += avgLat / 100; // 100ms → 1pt
      }

      // Success rate bonus
      const successRate = providerMetrics?.successCount
        ? providerMetrics.successCount / (providerMetrics.successCount + (providerMetrics.failCount || 0))
        : 0;
      if (successRate > 0) {
        score -= (successRate * 20); // 80% → -16pts
      }

      // Multilingual boost (strong priority for multilingual providers when content is multilingual)
      if (category === 'multilingual' && cfg.strengths.includes('multilingual')) {
        score -= 100;
      }

      // Priority bonus
      score += (cfg.priority - 1) * 10;

      return { providerId: cfg.providerId, score };
    })
    .sort((a, b) => a.score - b.score);

  if (scored.length === 0) return 'openrouter';

  return scored[0].providerId as King2Provider;
}

// ─────────────────────────────────────────────────────────
// Route Stream
// ─────────────────────────────────────────────────────────

export async function routeStream(
  model: string,
  messages: { role: string; content: string }[],
  abortSignal?: AbortSignal,
): Promise<Response> {
  const formattedMessages = messages.map((m) => ({
    role: m.role as 'user' | 'assistant' | 'system',
    content: m.content,
  }));

  try {
    const { stream } = await executeStreamWithFallback(
      model,
      formattedMessages,
      { abortSignal },
    );

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('[Models Router] Streaming routing failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────
// Route Generate (non-streaming)
// ─────────────────────────────────────────────────────────

export async function routeGenerate(
  model: string,
  messages: { role: string; content: string }[],
): Promise<string> {
  const formattedMessages = messages.map((m) => ({
    role: m.role as 'user' | 'assistant' | 'system',
    content: m.content,
  }));

  try {
    const { text } = await executeResponseWithFallback(model, formattedMessages);
    return text;
  } catch (error: any) {
    console.error('[Models Router] Non-streaming routing failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────
// Load- Balanced Distribution
// ─────────────────────────────────────────────────────────

/**
 * Weighted round-robin for distributing load among healthy providers.
 * Returns the next provider ID to use for general-purpose requests.
 */
let roundRobinIndex = 0;

export function getNextBalancedProvider(): King2Provider {
  const metrics = getProviderMetrics();
  const healthy = Object.entries(metrics)
    .filter(([, m]) => {
      const meta = m as Record<string, any>;
      return meta.configured === true
        && (!meta.circuitBreaker?.cooldownUntil || Date.now() >= meta.circuitBreaker.cooldownUntil)
        && (!meta.health || meta.health.healthy !== false);
    })
    .map(([id]) => id);

  if (healthy.length === 0) return 'openrouter';

  roundRobinIndex = (roundRobinIndex + 1) % healthy.length;
  return healthy[roundRobinIndex] as King2Provider;
}

// ─────────────────────────────────────────────────────────
// Display name (user-facing)
// ─────────────────────────────────────────────────────────

export function getModelDisplayName(_provider: string): string {
  return 'KING2 AI';
}
