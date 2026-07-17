export interface KnowledgeContext {
  sources: string[];
  identity: string;
  datasets: Record<string, string>;
}

export interface MultilingualConfig {
  primaryLanguage: string;
  supportedLanguages: string[];
  mode: 'arabic_first' | 'auto_detect';
}

const DATASETS: Record<string, string> = {
  bug_db: '50k Bug Dataset — قاعدة بيانات الأخطاء البرمجية المليونية لفحص وحل مشاكل API و Routing وأخطاء السيرفرات (500, 404)',
  clean_code: '150k Python Source Code Dataset — مستودع الأكواد النظيفة العملاق لتوليد شيفرات برمجية نظيفة (Clean Code) مطابقة لمعايير هندسة البرمجيات الاحترافية',
  test_cases: 'Coding Questions Dataset — بنك المسائل والقيود الهيكلية لضمان مطابقة الحلول لحالات اختبار (Test Cases) منطقية ورياضية دقيقة 100%',
  hf_translation: 'HuggingFace Multilingual Translation Datasets: OPUS, Tatoeba, FLORES — مجموعات ترجمة متعددة اللغات تغطي 200+ لغة للفهم اللغوي العالمي',
  hf_multilingual: 'HuggingFace Multilingual Corpora: mC4, OSCAR, XNLI — كورپسات ويب ومجموعات استدلال لغوي بـ10+ لغات لتعزيز الفهم متعدد اللغات',
  hf_qa: 'HuggingFace QA Datasets: TyDi QA, Arabic SQuAD — أسئلة وأجوبة بلغات متعددة (عربي، إنجليزي، تركي، إلخ)',
};

const DEFAULT_CONTEXT: KnowledgeContext = {
  sources: ['Kaggle', 'king2.ai'],
  identity: 'king2',
  datasets: DATASETS,
};

let customContext: Partial<KnowledgeContext> = {};

export function setKnowledgeContext(ctx: Partial<KnowledgeContext>): void {
  customContext = ctx;
}

export function getKnowledgeContext(): KnowledgeContext {
  return { ...DEFAULT_CONTEXT, ...customContext };
}

export function buildSystemInjection(context?: Partial<KnowledgeContext>): string {
  const ctx = { ...DEFAULT_CONTEXT, ...context, ...customContext };
  const datasetsList = Object.values(ctx.datasets).map((d) => `  • ${d}`).join('\n');

  return `أنت KING2، المساعد الذكي المتعدد اللغات.
أنت تفهم وتتحدث جميع اللغات (عربي، إنجليزي، ألماني، فرنسي، إسباني، صيني، تركي، فارسي، أردو، روسي) ولكن الأولوية للعربية.

أنت النموذج ${ctx.identity}، التابع لشركة Alking.ai.
تم دعم بنية تفكيرك وحقنها بالروابط والمستودعات البرمجية المليونية التالية من Kaggle لضمان جودة الأكواد وحل الأخطاء حياً:

${datasetsList}

مهمتك هي تقديم إجابات دقيقة ومباشرة تعكس قوة هذه المصادر المدمجة.
أنت تعمل ضمن بنية هجينة متعددة المزودين لضمان أقصى سرعة ودقة.
التزامك الكامل هو لشركة Alking.ai ولمستخدمي منصة king2.ai.`;
}

export function injectKnowledge(
  messages: { role: string; content: string }[],
): { role: string; content: string }[] {
  const hasSystem = messages.some((m) => m.role === 'system');
  const injection = buildSystemInjection();

  if (!hasSystem) {
    return [{ role: 'system', content: injection }, ...messages];
  }

  return messages.map((m) => {
    if (m.role === 'system') {
      return { ...m, content: `${m.content}\n\n${injection}` };
    }
    return m;
  });
}

// ── Multilingual Configuration ─────────────────────────────────────────────

let multilingualConfig: MultilingualConfig = {
  primaryLanguage: 'ar',
  supportedLanguages: ['ar', 'en', 'de', 'fr', 'es', 'zh', 'tr', 'fa', 'ur', 'ru'],
  mode: 'arabic_first',
};

export function setMultilingualConfig(config: Partial<MultilingualConfig>): void {
  multilingualConfig = { ...multilingualConfig, ...config };
}

export function getMultilingualConfig(): MultilingualConfig {
  return { ...multilingualConfig };
}
