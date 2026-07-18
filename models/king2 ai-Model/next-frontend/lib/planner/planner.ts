// =============================================================================
// KING2 AI — Hybrid Planner
// =============================================================================
// - Template-based planning للطلبات البسيطة (بدون استدعاء AI)
// - AI-based planning للطلبات المعقدة
// - Flexible JSON extraction مع fallbacks متعددة
// - Partial plans (إذا فشلت خطوة، يكمل من التالية)
// =============================================================================

import { AgentPlan } from '@/lib/agents/types';
import { getToolDefinitionsForLLM } from '@/lib/tools/registry';
import { executeResponseWithFallback } from '@/lib/fallback';

// ── Templates ────────────────────────────────────────────────────────

interface TemplateMatcher {
  name: string;
  test: (request: string) => boolean;
  build: (request: string) => AgentPlan;
}

/**
 * قوالب للطلبات البسيطة التي لا تحتاج إلى AI
 */
const TEMPLATES: TemplateMatcher[] = [
  {
    name: 'calculator',
    test: (r) =>
      /^(?:احسب|حساب|calculate|math|what is|كم\s*|كم\s*ناتج|كم\s*يساوي|2\d|\d+\s*[+\-*/×÷^])/i.test(r.trim()),
    build: (r) => ({
      goal: `حساب: ${r}`,
      steps: [
        {
          step: 1,
          action: `إجراء العملية الحسابية: ${r}`,
          tool: 'calculator',
          expectedOutcome: 'نتيجة العملية الحسابية',
        },
      ],
    }),
  },
  {
    name: 'web_search_simple',
    test: (r) =>
      /^(?:ابحث|بحث|search|what|who|when|where|why|how|متى|أين|من|ما|لماذا|كيف)\s/i.test(r.trim()),
    build: (r) => ({
      goal: `بحث: ${r}`,
      steps: [
        {
          step: 1,
          action: `البحث في الإنترنت عن: ${r}`,
          tool: 'web_search',
          expectedOutcome: 'نتائج البحث ذات الصلة',
        },
        {
          step: 2,
          action: 'تلخيص وتحليل نتائج البحث',
          tool: null,
          expectedOutcome: 'إجابة شاملة بناءً على نتائج البحث',
        },
      ],
    }),
  },
  {
    name: 'image_generation',
    test: (r) =>
      /^(?:ارسم|أنشئ|إنشاء|create|generate|draw|صورة|image of|picture of)\s/i.test(r.trim()) ||
      /(?:صورة|صور|image|picture|رسم|تصميم)\s.*(?:من فضلك|لو سمحت|please)?$/i.test(r.trim()),
    build: (r) => ({
      goal: `إنشاء صورة: ${r}`,
      steps: [
        {
          step: 1,
          action: `إنشاء الصورة بناءً على الوصف: ${r}`,
          tool: 'image_generation',
          expectedOutcome: 'رابط الصورة المولّدة',
        },
      ],
    }),
  },
  {
    name: 'code_analysis',
    test: (r) =>
      /(?:كود|code|برنامج|دالة|function|class\s+\w+|fix\s+bug|explain\s+code|review\s+code)/i.test(r.trim()),
    build: (r) => ({
      goal: `تحليل الكود: ${r}`,
      steps: [
        {
          step: 1,
          action: `تحليل الكود المطلوب: ${r}`,
          tool: 'code_interpreter',
          expectedOutcome: 'تحليل وشرح الكود',
        },
      ],
    }),
  },
  {
    name: 'simple_conversation',
    test: () => true, // catch-all (must be last)
    build: (r) => ({
      goal: r,
      steps: [
        {
          step: 1,
          action: 'تحليل الطلب وتقديم رد مناسب',
          tool: null,
          expectedOutcome: 'رد مفيد ومباشر',
        },
      ],
    }),
  },
];

// ── JSON Extraction ──────────────────────────────────────────────────

/**
 * استخراج JSON من النص بمرونة عالية
 */
function extractJSON(text: string): string | null {
  // Pattern 1: ```json ... ``` block
  const jsonBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonBlockMatch) {
    const candidate = jsonBlockMatch[1].trim();
    if (isValidJSON(candidate)) return candidate;
  }

  // Pattern 2: { ... } object (top-level)
  const braceMatch = text.match(/\{[\s\S]*\}/);
  if (braceMatch) {
    const candidate = braceMatch[0].trim();
    if (isValidJSON(candidate)) return candidate;
  }

  return null;
}

function isValidJSON(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * التحقق من صحة هيكل AgentPlan
 */
function validatePlan(plan: any): plan is AgentPlan {
  if (!plan || typeof plan !== 'object') return false;
  if (typeof plan.goal !== 'string' || plan.goal.trim().length === 0) return false;
  if (!Array.isArray(plan.steps) || plan.steps.length === 0) return false;

  return plan.steps.every(
    (s: any) =>
      typeof s === 'object' &&
      typeof s.step === 'number' &&
      typeof s.action === 'string' &&
      (s.tool === undefined || s.tool === null || typeof s.tool === 'string') &&
      typeof s.expectedOutcome === 'string'
  );
}

// ── AI-based Planning ────────────────────────────────────────────────

async function createPlanWithAI(request: string, context?: string): Promise<AgentPlan | null> {
  const tools = getToolDefinitionsForLLM();
  const toolsDesc = tools
    .map(
      (t) =>
        `- ${t.name}: ${t.description}\n  المدخلات: ${JSON.stringify(t.parameters)}`
    )
    .join('\n\n');

  const prompt = `أنت مخطط مهام ذكي. حلل طلب المستخدم وقرر هل يحتاج إلى أدوات أم لا.

الأدوات المتاحة:
${toolsDesc}

${context ? `سياق إضافي:\n${context}\n` : ''}

طلب المستخدم: "${request}"

تعليمات:
1. إذا كان الطلب بسيطاً (تحية، سؤال عام، محادثة) → اجعل الخطوات خطوة تفكير واحدة فقط بدون أدوات
2. إذا كان الطلب يحتاج أدوات → خطط الخطوات بعناية، كل خطوة تبني على السابقة
3. استخدم أداة واحدة فقط لكل خطوة (أو null للتفكير)
4. لا تتجاوز 5 خطوات كحد أقصى

أعد JSON بالصيغة التالية فقط:
{
  "goal": "الهدف الرئيسي",
  "steps": [
    {
      "step": 1,
      "action": "وصف الخطوة بالتفصيل",
      "tool": "tool_name أو null",
      "expectedOutcome": "النتيجة المتوقعة"
    }
  ]
}`;

  try {
    const { text } = await executeResponseWithFallback('auto', [
      { role: 'user', content: prompt },
    ]);

    const jsonStr = extractJSON(text);
    if (!jsonStr) return null;

    const parsed = JSON.parse(jsonStr);
    if (validatePlan(parsed)) return parsed;

    return null;
  } catch {
    return null;
  }
}

// ── Public API ───────────────────────────────────────────────────────

/**
 * إنشاء خطة عمل بناءً على طلب المستخدم
 * - يستخدم الـ Templates للطلبات البسيطة (بدون استدعاء AI)
 * - يستخدم AI للطلبات المعقدة
 * - لديه fallback في حال فشل أي من المسارين
 */
export async function createPlan(
  userRequest: string,
  context?: string
): Promise<AgentPlan> {
  const trimmed = userRequest.trim();

  // 1. Try template-based planning first (fast, no AI cost)
  for (const template of TEMPLATES) {
    if (template.test(trimmed)) {
      const plan = template.build(trimmed);
      // simple_conversation is the catch-all template — only use it if
      // we are *really* sure it's trivial or AI planning would be wasted
      if (template.name !== 'simple_conversation') {
        return plan;
      }
      // For simple_conversation, fall through to AI for better quality
      break;
    }
  }

  // 2. Try AI-based planning for complex requests
  const aiPlan = await createPlanWithAI(trimmed, context);
  if (aiPlan) return aiPlan;

  // 3. Final fallback: simple reasoning-only plan
  return {
    goal: trimmed,
    steps: [
      {
        step: 1,
        action: 'تحليل الطلب وتقديم إجابة شاملة',
        tool: null,
        expectedOutcome: 'إجابة كاملة ومفصلة',
      },
    ],
  };
}

/**
 * إنشاء خطة جزئية (للاستمرار بعد فشل خطوة)
 */
export function createPartialPlan(
  originalPlan: AgentPlan,
  failedStepIndex: number,
  error: string
): AgentPlan {
  const remainingSteps = originalPlan.steps.slice(failedStepIndex + 1);

  if (remainingSteps.length === 0) {
    // No more steps - create a summary step
    return {
      goal: originalPlan.goal,
      steps: [
        {
          step: 1,
          action: `تخطت الخطوة الفاشلة (${error}) وتقديم النتائج المتاحة`,
          tool: null,
          expectedOutcome: 'ملخص النتائج مع الإشارة للخطأ',
        },
      ],
    };
  }

  return {
    goal: originalPlan.goal,
    steps: [
      {
        step: 1,
        action: `تجاوز الخطأ في الخطوة السابقة (${error}) والاستمرار من الخطوة التالية`,
        tool: null,
        expectedOutcome: `متابعة التنفيذ من: ${remainingSteps[0].action}`,
      },
      ...remainingSteps.map((s, i) => ({
        ...s,
        step: i + 2,
      })),
    ],
  };
}
