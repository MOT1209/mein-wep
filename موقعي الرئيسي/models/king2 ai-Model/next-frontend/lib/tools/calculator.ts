// =============================================================================
// KING2 AI — Calculator Tool
// =============================================================================
// - Strict input sanitisation (allow only safe math expressions)
// - Supports basic ops, trig, log, sqrt, powers
// - Falls back to step-by-step evaluation
// =============================================================================

import { ToolDefinition } from '@/lib/agents/types';

// ── Safe Math ─────────────────────────────────────────────────────────

// Characters allowed in math expressions (after Math.* replacements)
const SAFE_PATTERN = /^[\d\s+\-*/.(),%\^]+$/;

// Additional allowed patterns after replacements
const ALLOWED_FUNCTIONS = [
  'Math.sin', 'Math.cos', 'Math.tan', 'Math.sqrt', 'Math.log',
  'Math.abs', 'Math.round', 'Math.floor', 'Math.ceil', 'Math.pow',
  'Math.min', 'Math.max', 'Math.PI', 'Math.E', '**',
];

function isMathSafe(expr: string): boolean {
  // Check for dangerous patterns
  const dangerous = [
    /['"]/, // strings
    /[a-zA-Z_$](?!ath\.|[a-zA-Z]*\s*\()/, // variable names (allow Math.*)
    /(import|export|require|eval|fetch|XMLHttpRequest|Function|setTimeout|setInterval|process|global|window|document)/i,
    /=>/, // arrow functions
    /`/, // template literals
    /\${/, // template expressions
    /\/\*/, // block comments
    /\/\//, // line comments
  ];

  for (const pattern of dangerous) {
    if (pattern.test(expr)) return false;
  }

  return true;
}

/**
 * Evaluate a math expression safely
 */
function evaluateMath(expression: string): { result: number; steps: string[] } {
  const steps: string[] = [];
  let expr = expression;

  // Replace Arabic/Unicode math symbols (order matters!)
  const replacements: [RegExp, string][] = [
    // 1. Unicode operators first
    [/×/g, '*'],
    [/÷/g, '/'],
    [/\^/g, '**'],
    // 2. π → Math.PI (must be before general pi replacement)
    [/π/g, 'Math.PI'],
    // 3. √expression → Math.sqrt(expression)
    [/√\s*\(/g, 'Math.sqrt('],
    [/√\s*(\d+\.?\d*)/g, 'Math.sqrt($1)'],
    [/√/g, 'Math.sqrt'],
    // 4. Named math functions (word boundaries ensure exact match)
    [/\bsin\b/g, 'Math.sin'],
    [/\bcos\b/g, 'Math.cos'],
    [/\btan\b/g, 'Math.tan'],
    [/\bsqrt\b(?!\s*\()/g, 'Math.sqrt'],
    [/\blog\b/g, 'Math.log10'],
    [/\bln\b/g, 'Math.log'],
    [/\babs\b/g, 'Math.abs'],
    [/\bfloor\b/g, 'Math.floor'],
    [/\bceil\b/g, 'Math.ceil'],
    [/\bround\b/g, 'Math.round'],
    [/\bpow\b/g, 'Math.pow'],
    [/\bmin\b/g, 'Math.min'],
    [/\bmax\b/g, 'Math.max'],
    // 5. pi literal (but not Math.PI again)
    [/\bpi\b(?!\.)/gi, 'Math.PI'],
    // 6. Mathematical constant e (careful not to match Math. or words starting with e)
    [/(?<![a-zA-Z.])e\b(?!xpect|rror|vent|very|xam|nd|arly|asy|xport)/gi, 'Math.E'],
  ];

  for (const [pattern, replacement] of replacements) {
    const before = expr;
    expr = expr.replace(pattern, replacement as string);
    if (before !== expr) {
      steps.push(`↻ ${before} → ${expr}`);
    }
  }

  // Final safety check
  if (!isMathSafe(expr)) {
    throw new Error('التعبير يحتوي على أحرف غير مسموح بها');
  }

  if (!SAFE_PATTERN.test(expr.replace(/Math\.\w+/g, '').replace(/\*\*/g, ''))) {
    // Allow Math.* patterns
    const cleaned = expr.replace(/Math\.\w+/g, '').replace(/\s/g, '');
    if (!SAFE_PATTERN.test(cleaned)) {
      throw new Error('التعبير يحتوي على أحرف غير مسموح بها');
    }
  }

  // Evaluate
  try {
    // eslint-disable-next-line no-new-func
    const result = Function(`"use strict"; return (${expr})`)();
    if (typeof result !== 'number' || !isFinite(result)) {
      throw new Error('النتيجة غير صالحة (قد تكون قسمة على صفر)');
    }
    return { result, steps };
  } catch (err: any) {
    throw new Error(`خطأ في الحساب: ${err.message}`);
  }
}

// ── Tool Definition ──────────────────────────────────────────────────

export const calculatorTool: ToolDefinition = {
  name: 'calculator',
  description: 'إجراء عمليات حسابية (جمع، طرح، ضرب، قسمة، جذر، قوى، مثلثات، لوغاريتمات)',
  parameters: [
    {
      name: 'expression',
      type: 'string',
      description: 'التعبير الرياضي (مثال: 2 + 2, sqrt(16), 3^4, sin(30), log(100))',
      required: true,
    },
  ],
  parallelSafe: true,
  timeout: 5_000,
  execute: async (args: { expression: string }) => {
    const expr = args.expression?.trim();
    if (!expr) return 'يرجى إدخال تعبير رياضي';

    const { result, steps } = evaluateMath(expr);

    let output = '';
    if (steps.length > 1) {
      output += '📝 خطوات الحل:\n' + steps.join('\n') + '\n\n';
    }

    // Format result
    const formatted = Number.isInteger(result) ? result.toString() : result.toFixed(6);
    output += `✅ النتيجة: ${formatted}`;

    return output;
  },
};
