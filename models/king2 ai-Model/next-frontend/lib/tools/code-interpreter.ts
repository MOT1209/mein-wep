// =============================================================================
// KING2 AI — Code Interpreter Tool
// =============================================================================
// - تحليل وشرح ومراجعة وترجمة وتحسين الكود
// - يستخدم نظام الـ Fallback عوضاً عن ربط مباشر بمزوّد واحد
// - يدعم أوضاع متعددة: explain, review, translate, optimize, fix
// =============================================================================

import { ToolDefinition } from '@/lib/agents/types';
import { executeResponseWithFallback } from '@/lib/fallback';

const CODE_MAX_LENGTH = 8_000; // Max code length before truncation

export const codeInterpreterTool: ToolDefinition = {
  name: 'code_interpreter',
  description: 'تحليل وشرح ومراجعة وتحسين وإصلاح الكود البرمجي. يدعم جميع اللغات.',
  parameters: [
    {
      name: 'code',
      type: 'string',
      description: 'الكود المراد تحليله (نص الكود الكامل)',
      required: true,
    },
    {
      name: 'task',
      type: 'string',
      description: 'المهمة: explain (شرح), review (مراجعة), translate (ترجمة), optimize (تحسين), fix (إصلاح)',
      required: false,
    },
    {
      name: 'language',
      type: 'string',
      description: 'لغة البرمجة (اختياري - مثال: Python, JavaScript, TypeScript, Rust)',
      required: false,
    },
  ],
  timeout: 45_000,
  execute: async (args: { code: string; task?: string; language?: string }) => {
    const code = args.code?.trim();
    if (!code) return 'يرجى توفير الكود المراد تحليله';

    const task = args.task || 'explain';
    const lang = args.language || '';

    // Truncate if too long
    const truncatedCode = code.length > CODE_MAX_LENGTH
      ? code.slice(0, CODE_MAX_LENGTH) + `\n\n// ... [اقتطاع: الكود الأصلي طوله ${code.length} حرف]`
      : code;

    // Build the prompt based on task type
    const taskPrompts: Record<string, string> = {
      explain: `قم بشرح الكود التالي باللغة العربية شرحاً مفصلاً:
- اشرح وظيفة كل جزء
- وضح المفاهيم المستخدمة
- اذكر اللغات والتقنيات

${lang ? `اللغة: ${lang}` : ''}

\`\`\`
${truncatedCode}
\`\`\``,

      review: `قم بمراجعة الكود التالي باللغة العربية:
- تحديد المشاكل والأخطاء المحتملة
- اقتراح تحسينات في الأداء والأمان
- نصائح حول أفضل الممارسات

${lang ? `اللغة: ${lang}` : ''}

\`\`\`
${truncatedCode}
\`\`\``,

      translate: `قم بترجمة الكود التالي ${
        lang ? `من ${lang}` : ''
      } إلى لغة برمجة أخرى مناسبة، مع شرح التغييرات:

\`\`\`
${truncatedCode}
\`\`\``,

      optimize: `قم بتحسين أداء وكفاءة الكود التالي باللغة العربية:
- اقتراح تحسينات الأداء
- تحسين استهلاك الذاكرة
- تبسيط التعقيد
- إظهار الكود المحسّن

${lang ? `اللغة: ${lang}` : ''}

\`\`\`
${truncatedCode}
\`\`\``,

      fix: `قم بتحليل وإصلاح الأخطاء في الكود التالي باللغة العربية:
- تحديد موقع ونوع كل خطأ
- شرح سبب الخطأ
- تقديم الكود المُصحَح

${lang ? `اللغة: ${lang}` : ''}

\`\`\`
${truncatedCode}
\`\`\``,
    };

    const prompt = taskPrompts[task] || taskPrompts.explain;

    try {
      const { text } = await executeResponseWithFallback('auto', [
        { role: 'user', content: prompt },
      ]);

      // Add header with task type
      const taskLabels: Record<string, string> = {
        explain: '🔍 تحليل الكود',
        review: '📋 مراجعة الكود',
        translate: '🔄 ترجمة الكود',
        optimize: '⚡ تحسين الكود',
        fix: '🔧 إصلاح الكود',
      };

      return `## ${taskLabels[task] || 'تحليل الكود'}\n\n${text}`;
    } catch (error: any) {
      return `❌ خطأ في تحليل الكود: ${error.message}`;
    }
  },
};
