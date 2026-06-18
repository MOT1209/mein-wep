/**
 * محرك حقن المعرفة من HuggingFace Datasets
 * ----------------------------------------
 * يسحب datasets من HuggingFace Hub، يعالجها، ويحقنها في Knowledge Base
 * لدعم الفهم المتعدد اللغات (5-10 لغات) مع العربية كلغة أساسية.
 */

import { knowledgeBase, KnowledgeResult } from '@/lib/knowledge';
import { supabase } from '@/lib/supabase';
import { searchDatasets, HFDataset } from './client';
import { createLogger } from '@/lib/logger';

const log = createLogger('HFDataInjector');

// ── أنواع البيانات ─────────────────────────────────────────────────────────

export type DatasetType = 'translation' | 'monolingual' | 'qa' | 'general';

export interface DatasetTarget {
  datasetId: string;
  type: DatasetType;
  displayName: string;
  description: string;
  category: string;
  tags: string[];
  /** عدد الصفوف القصوى للسحب (0 = كلها) */
  maxRows?: number;
  /** حجم القطعة (token) */
  chunkSize?: number;
  /** التهيئات المستهدفة (مثل أزواج اللغات) */
  configs?: string[];
  /** دالة استخراج النص من الصف حسب نوع البيانات */
  extractor?: (row: Record<string, any>) => ExtractedEntry[];
}

export interface ExtractedEntry {
  title: string;
  content: string;
  category: string;
  tags: string[];
  sourceLanguage?: string;
  targetLanguage?: string;
}

export interface InjectResult {
  datasetId: string;
  type: DatasetType;
  rowsProcessed: number;
  entriesCreated: number;
  errors: string[];
  durationMs: number;
}

// ── اللغات المستهدفة ───────────────────────────────────────────────────────

export const TARGET_LANGUAGES = [
  { code: 'ar', name: 'العربية' },
  { code: 'en', name: 'English' },
  { code: 'de', name: 'Deutsch' },
  { code: 'fr', name: 'Français' },
  { code: 'es', name: 'Español' },
  { code: 'zh', name: '中文' },
  { code: 'tr', name: 'Türkçe' },
  { code: 'fa', name: 'فارسی' },
  { code: 'ur', name: 'اردو' },
  { code: 'ru', name: 'Русский' },
];

/** كود اللغة → اسم الملف */
const LANG_MAP: Record<string, string> = Object.fromEntries(
  TARGET_LANGUAGES.map((l) => [l.code, l.name])
);

// ── إعدادات الـ Datasets المستهدفة ─────────────────────────────────────────

/**
 * قائمة datasets المستهدفة للحقن في Knowledge Base.
 * كل dataset له extractor خاص يستخرج النصوص حسب بنيته.
 */
export const TARGET_DATASETS: DatasetTarget[] = [
  // ── Tatoeba: جمل مترجمة بين 400+ لغة ──────────────────────
  {
    datasetId: 'tatoeba',
    type: 'translation',
    displayName: 'Tatoeba Translation Sentences',
    description: 'مجموعة ضخمة من الجمل المترجمة بين مئات اللغات، تغطي جميع اللغات المستهدفة',
    category: 'multilingual',
    tags: ['translation', 'sentences', 'multilingual', 'tatoeba'],
    maxRows: 10000,
    extractor: (row) => {
      const langs: string[] = [];
      const texts: string[] = [];
      // Tatoeba: كل عمود هو لغة مع الجملة
      for (const [key, val] of Object.entries(row)) {
        if (key !== 'id' && typeof val === 'string' && val.trim()) {
          langs.push(key);
          texts.push(val.trim());
        }
      }
      return langs.length >= 2
        ? [
            {
              title: `ترجمة (${langs.join('→')}): ${texts[0].slice(0, 80)}`,
              content: `[lang:${langs[0]}]\n${texts[0]}\n\n[lang:${langs[1]}]\n${texts[1]}`,
              category: 'multilingual',
              tags: ['translation', 'tatoeba', ...langs.map((l) => `lang:${l}`)],
              sourceLanguage: langs[0],
              targetLanguage: langs[1],
            },
          ]
        : [];
    },
  },

  // ── OPUS Books: ترجمة كتب بين لغات ────────────────────────
  {
    datasetId: 'opus_books',
    type: 'translation',
    displayName: 'OPUS Books Translation',
    description: 'جمل مترجمة من الكتب بين أزواج لغوية مختلفة، تغطي العربية والإنجليزية والألمانية وغيرها',
    category: 'multilingual',
    tags: ['translation', 'books', 'multilingual', 'opus'],
    maxRows: 5000,
    extractor: (row) => {
      const translation = row.translation;
      if (!translation || typeof translation !== 'object') return [];
      const langs = Object.keys(translation);
      const texts = Object.values(translation) as string[];
      if (langs.length < 2 || !texts.every((t) => typeof t === 'string' && t.trim())) return [];
      return [
        {
          title: `كتاب مترجم (${langs.join('→')}): ${texts[0].slice(0, 80)}`,
          content: `[lang:${langs[0]}]\n${texts[0]}\n\n[lang:${langs[1]}]\n${texts[1]}`,
          category: 'multilingual',
          tags: ['translation', 'opus_books', ...langs.map((l) => `lang:${l}`)],
          sourceLanguage: langs[0],
          targetLanguage: langs[1],
        },
      ];
    },
  },

  // ── FLORES-200: تقييم الترجمة بـ200 لغة ──────────────────
  {
    datasetId: 'flores',
    type: 'translation',
    displayName: 'FLORES-200 Translation Benchmark',
    description: 'مجموعة تقييم الترجمة لـ200 لغة، جمل قصيرة مع ترجمات دقيقة',
    category: 'multilingual',
    tags: ['translation', 'evaluation', 'flores', 'multilingual'],
    maxRows: 3000,
    extractor: (row) => {
      const sentence = row.sentence;
      if (!sentence || typeof sentence !== 'string') return [];
      // FLORES لها configs منفصلة لكل لغة، لذا نجيب بجملة واحدة
      return [
        {
          title: `FLORES: ${sentence.slice(0, 80)}`,
          content: sentence.trim(),
          category: 'multilingual',
          tags: ['flores', 'translation_benchmark'],
        },
      ];
    },
  },

  // ── TyDi QA: أسئلة وأجوبة متعددة اللغات ──────────────────
  {
    datasetId: 'tydi_qa',
    type: 'qa',
    displayName: 'TyDi QA Multilingual Questions',
    description: 'أسئلة وأجوبة بـ11 لغة (عربي، إنجليزي، وغيرهما) لتطوير الفهم اللغوي',
    category: 'multilingual',
    tags: ['qa', 'questions', 'multilingual', 'tydi_qa'],
    maxRows: 5000,
    extractor: (row) => {
      const question = (row.question || row.question_text || '').trim();
      const answer = (row.answer || row.answer_text || row.plaintext || '').trim();
      if (!question || !answer) return [];
      return [
        {
          title: `سؤال: ${question.slice(0, 80)}`,
          content: `س: ${question}\nج: ${answer}`,
          category: 'multilingual',
          tags: ['qa', 'tydi_qa', `lang:${row.language || ''}`],
        },
      ];
    },
  },

  // ── XNLI: استدلال لغوي متعدد اللغات ──────────────────────
  {
    datasetId: 'xnli',
    type: 'general',
    displayName: 'XNLI Cross-lingual NLI',
    description: 'بيانات الاستدلال اللغوي الطبيعي عبر 15 لغة، تفيد في فهم العلاقات المنطقية بين اللغات',
    category: 'multilingual',
    tags: ['nli', 'reasoning', 'multilingual', 'xnli'],
    maxRows: 3000,
    extractor: (row) => {
      const premise = (row.premise || '').trim();
      const hypothesis = (row.hypothesis || '').trim();
      const label = (row.label || row.gold_label || '').trim();
      if (!premise || !hypothesis) return [];
      return [
        {
          title: `NLI (${label}): ${premise.slice(0, 60)}`,
          content: `المقدمة: ${premise}\nالفرضية: ${hypothesis}\nالعلاقة: ${label}`,
          category: 'multilingual',
          tags: ['nli', 'xnli', 'reasoning', `lang:${row.language || ''}`],
        },
      ];
    },
  },

  // ── Arabic SQUAD: أسئلة عربية ────────────────────────────
  {
    datasetId: 'arabic_squad',
    type: 'qa',
    displayName: 'Arabic SQuAD',
    description: 'أسئلة وأجوبة بالعربية لتطوير الفهم القرائي باللغة العربية',
    category: 'multilingual',
    tags: ['qa', 'arabic', 'reading_comprehension'],
    maxRows: 5000,
    extractor: (row) => {
      const question = (row.question || '').trim();
      const context = (row.context || '').trim();
      const answer = (row.answers?.text?.[0] || row.answer || '').trim();
      if (!question || !context) return [];
      return [
        {
          title: `عربي: ${question.slice(0, 80)}`,
          content: `السياق: ${context}\nالسؤال: ${question}\nالإجابة: ${answer || 'غير متوفرة'}`,
          category: 'multilingual',
          tags: ['qa', 'arabic_squad', 'arabic', 'lang:ar'],
        },
      ];
    },
  },

  // ── Common Crawl (Arabic): محتوى ويب عربي ──────────────
  {
    datasetId: 'mc4',
    type: 'monolingual',
    displayName: 'mC4 Arabic Web Corpus',
    description: 'نصوص ويب ضخمة بالعربية من Common Crawl لتعزيز الفهم العربي',
    category: 'monolingual',
    tags: ['web', 'arabic', 'mc4', 'common_crawl', 'lang:ar'],
    maxRows: 2000,
    configs: ['ar'],
    extractor: (row) => {
      const text = (row.text || '').trim();
      if (!text || text.length < 50) return [];
      // تقسيم النص إلى قطع أصغر
      const chunks = chunkText(text, 512);
      return chunks.map((chunk, i) => ({
        title: `محتوى ويب عربي (${i + 1}/${chunks.length}): ${chunk.slice(0, 60)}`,
        content: chunk,
        category: 'monolingual',
        tags: ['web', 'arabic', 'mc4', 'lang:ar'],
      }));
    },
  },

  // ── Oscar: كورپس ويب متعدد اللغات ────────────────────────
  {
    datasetId: 'oscar',
    type: 'monolingual',
    displayName: 'OSCAR Multilingual Web Corpus',
    description: 'كورپس ويب ضخم متعدد اللغات يغطي العربية والإنجليزية والفرنسية وغيرها',
    category: 'monolingual',
    tags: ['web', 'multilingual', 'oscar'],
    maxRows: 2000,
    configs: ['ar', 'en', 'de', 'fr', 'es', 'zh', 'tr', 'fa', 'ur', 'ru'],
    extractor: (row) => {
      const text = (row.text || row.content || '').trim();
      if (!text || text.length < 50) return [];
      const chunks = chunkText(text, 512);
      return chunks.map((chunk, i) => ({
        title: `OSCAR (${row.meta?.lang || 'unknown'}): ${chunk.slice(0, 60)}`,
        content: chunk,
        category: 'monolingual',
        tags: ['web', 'oscar', `lang:${row.meta?.lang || ''}`],
      }));
    },
  },
];

// ── دوال مساعدة ────────────────────────────────────────────────────────────

/** تقسيم نص طويل إلى قطع متساوية */
function chunkText(text: string, maxChars: number): string[] {
  const chunks: string[] = [];
  const words = text.split(/\s+/);
  let current = '';

  for (const word of words) {
    if ((current + ' ' + word).length > maxChars && current) {
      chunks.push(current.trim());
      current = word;
    } else {
      current += (current ? ' ' : '') + word;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

/** هل سبق حقن هذا الـ dataset من قبل (بواسطة الـ tag)؟ */
async function isAlreadyInjected(datasetId: string): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('knowledge_base')
      .select('id')
      .eq('category', 'multilingual')
      .contains('tags', [datasetId])
      .limit(1);
    return !!(data && data.length > 0);
  } catch {
    return false;
  }
}

/** الحصول على معلومات الـ dataset من HF Datasets Server */
async function fetchDatasetInfo(datasetId: string): Promise<any | null> {
  try {
    const url = `https://datasets-server.huggingface.co/info?dataset=${encodeURIComponent(datasetId)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    log.error(`فشل جلب معلومات ${datasetId}`, err);
    return null;
  }
}

/** جلب صفوف من dataset عبر HF Datasets Server API */
async function fetchRows(
  datasetId: string,
  config: string,
  split: string,
  offset: number,
  length: number
): Promise<{ rows: { row: Record<string, any>; row_idx: number }[]; num_rows_total: number } | null> {
  try {
    const url =
      `https://datasets-server.huggingface.co/rows` +
      `?dataset=${encodeURIComponent(datasetId)}` +
      `&config=${encodeURIComponent(config)}` +
      `&split=${encodeURIComponent(split)}` +
      `&offset=${offset}&length=${length}`;
    
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) {
      if (res.status === 404) return null;
      return null;
    }
    return await res.json();
  } catch (err) {
    log.error(`فشل جلب صفوف ${datasetId}/${config}`, err);
    return null;
  }
}

/** تحويل اسم لغة (code) إلى معرف معياري */
function normalizeLangCode(code: string): string {
  const map: Record<string, string> = {
    'ar': 'ar', 'ara': 'ar',
    'en': 'en', 'eng': 'en',
    'de': 'de', 'deu': 'de', 'ger': 'de',
    'fr': 'fr', 'fra': 'fr', 'fre': 'fr',
    'es': 'es', 'spa': 'es',
    'zh': 'zh', 'zho': 'zh', 'chi': 'zh', 'cmn': 'zh',
    'tr': 'tr', 'tur': 'tr',
    'fa': 'fa', 'fas': 'fa', 'per': 'fa',
    'ur': 'ur', 'urd': 'ur',
    'ru': 'ru', 'rus': 'ru',
  };
  return map[code.toLowerCase()] || code;
}

/** هل اللغة ضمن المستهدفات؟ */
function isTargetLanguage(code: string): boolean {
  const norm = normalizeLangCode(code);
  return TARGET_LANGUAGES.some((l) => l.code === norm);
}

// ── المحرك الرئيسي ─────────────────────────────────────────────────────────

export class HFDataInjector {
  private totalEntriesCreated = 0;
  private errors: string[] = [];

  /**
   * حقن dataset واحد في Knowledge Base.
   * @param target إعدادات الـ dataset المستهدف
   * @param options.limit حد أقصى لعدد الصفوف
   */
  async injectDataset(
    target: DatasetTarget,
    options?: { limit?: number }
  ): Promise<InjectResult> {
    const startTime = Date.now();
    const datasetId = target.datasetId;
    const maxRows = options?.limit || target.maxRows || 5000;
    let rowsProcessed = 0;
    let entriesCreated = 0;
    const errors: string[] = [];

    log.info(`بدء حقن ${datasetId} (${target.displayName})`);

    try {
      // ── 1. جلب معلومات الـ dataset ─────────────────
      const info = await fetchDatasetInfo(datasetId);
      if (!info) {
        errors.push(`لا يمكن الوصول إلى ${datasetId} في HF Datasets Server`);
        return this._result(datasetId, target.type, rowsProcessed, entriesCreated, errors, startTime);
      }

      // ── 2. اكتشاف الـ configs المتاحة ─────────────
      const availableConfigs = info.dataset?.configs || [];
      const configsToProcess = target.configs && target.configs.length > 0
        ? target.configs.filter((c) => availableConfigs.some((ac: any) => ac.config_name === c))
        : availableConfigs.map((c: any) => c.config_name).slice(0, 5);

      if (configsToProcess.length === 0) {
        // بعض الـ datasets ما عندهم configs (مثل tatoeba)
        configsToProcess.push('default');
      }

      // ── 3. معالجة كل config ───────────────────────
      for (const config of configsToProcess) {
        if (rowsProcessed >= maxRows) break;

        // جلب الصفوف
        const batchSize = 100;
        let offset = 0;
        let hasMore = true;

        while (hasMore && rowsProcessed < maxRows) {
          const remaining = maxRows - rowsProcessed;
          const length = Math.min(batchSize, remaining);

          const batch = await fetchRows(datasetId, config, 'train', offset, length);
          if (!batch || !batch.rows || batch.rows.length === 0) {
            // جرب split تاني
            const batchTest = await fetchRows(datasetId, config, 'test', 0, length);
            if (batchTest?.rows?.length) {
              hasMore = false; // test is usually last
              offset = 0;
              // process test rows
              for (const { row } of batchTest.rows.slice(0, remaining)) {
                rowsProcessed++;
                const entries = this._extractEntries(target, row);
                for (const entry of entries) {
                  await this._injectEntry(entry, datasetId);
                  entriesCreated++;
                }
              }
              break;
            }
            break;
          }

          for (const { row } of batch.rows) {
            rowsProcessed++;
            const entries = this._extractEntries(target, row);
            for (const entry of entries) {
              await this._injectEntry(entry, datasetId);
              entriesCreated++;
            }
          }

          offset += batch.rows.length;
          if (batch.rows.length < batchSize) hasMore = false;

          // تأخير بسيط لتفادي الـ rate limit
          if (hasMore) await new Promise((r) => setTimeout(r, 200));
        }
      }

      log.info(`تم حقن ${datasetId}: ${entriesCreated} entry من ${rowsProcessed} صف`);
    } catch (err: any) {
      const msg = `خطأ في ${datasetId}: ${err.message}`;
      errors.push(msg);
      log.error(msg, err);
    }

    return this._result(datasetId, target.type, rowsProcessed, entriesCreated, errors, startTime);
  }

  /**
   * حقن جميع الـ datasets المستهدفة.
   */
  async injectAllTargets(options?: { limit?: number }): Promise<InjectResult[]> {
    const results: InjectResult[] = [];
    for (const target of TARGET_DATASETS) {
      const result = await this.injectDataset(target, options);
      results.push(result);
      // تأخير بين الـ datasets
      await new Promise((r) => setTimeout(r, 500));
    }
    return results;
  }

  /**
   * حقن datasets حسب topic (بحث ديناميكي في HF Hub).
   */
  async injectByTopic(topic: string, options?: { limit?: number }): Promise<InjectResult[]> {
    const results: InjectResult[] = [];

    // بحث في HF Hub عن datasets مناسبة
    const hfDatasets = await searchDatasets(topic, 5);
    if (hfDatasets.length === 0) {
      log.warn(`لا توجد datasets لـ "${topic}" في HuggingFace`);
      return results;
    }

    for (const hfDs of hfDatasets) {
      // إنشاء target ديناميكي
      const target: DatasetTarget = {
        datasetId: hfDs.id,
        type: 'general',
        displayName: hfDs.id,
        description: hfDs.description,
        category: 'multilingual',
        tags: ['hf_auto', topic, ...hfDs.id.split('/')],
        maxRows: options?.limit || 1000,
        extractor: (row: Record<string, any>) => {
          // محاولة استخراج النص من أي أعمدة نصية
          const textCols = Object.entries(row)
            .filter(([k, v]) => typeof v === 'string' && (v as string).length > 20)
            .slice(0, 2);
          if (textCols.length === 0) return [];
          return textCols.map(([key, val]) => ({
            title: `${topic}: ${(val as string).slice(0, 80)}`,
            content: val as string,
            category: topic,
            tags: ['hf_auto', topic, key],
          }));
        },
      };

      const result = await this.injectDataset(target, options);
      results.push(result);
    }

    return results;
  }

  // ── دوال داخلية ─────────────────────────────────

  private _extractEntries(target: DatasetTarget, row: Record<string, any>): ExtractedEntry[] {
    try {
      if (target.extractor) {
        return target.extractor(row);
      }
      // extractor افتراضي: بحث عن أعمدة نصية
      const entries: ExtractedEntry[] = [];
      for (const [key, val] of Object.entries(row)) {
        if (typeof val === 'string' && val.trim().length > 30) {
          entries.push({
            title: `${target.displayName}: ${val.slice(0, 80)}`,
            content: val.trim(),
            category: target.category,
            tags: [...target.tags, `col:${key}`],
          });
        }
      }
      return entries.slice(0, 2); // حد أقصى 2 entries لكل صف
    } catch {
      return [];
    }
  }

  private async _injectEntry(entry: ExtractedEntry, datasetId: string): Promise<void> {
    try {
      await knowledgeBase.addKnowledge(
        entry.title.slice(0, 255),
        entry.content,
        entry.category,
        Array.from(new Set([...entry.tags, datasetId])),
        undefined // عام لجميع المستخدمين
      );
      this.totalEntriesCreated++;
    } catch (err: any) {
      this.errors.push(`فشل حقن: ${err.message}`);
    }
  }

  private _result(
    datasetId: string,
    type: DatasetType,
    rowsProcessed: number,
    entriesCreated: number,
    errors: string[],
    startTime: number
  ): InjectResult {
    return {
      datasetId,
      type,
      rowsProcessed,
      entriesCreated,
      errors,
      durationMs: Date.now() - startTime,
    };
  }

  get stats(): { totalEntriesCreated: number; errors: string[] } {
    return {
      totalEntriesCreated: this.totalEntriesCreated,
      errors: [...this.errors],
    };
  }
}

// ── API العام ──────────────────────────────────────────────────────────────

export const hfDataInjector = new HFDataInjector();

/**
 * دالة مساعدة للحقن السريع من أي مكان في الكود.
 */
export async function injectHFDatasets(
  options?: {
    datasets?: string[];
    topics?: string[];
    limit?: number;
  }
): Promise<InjectResult[]> {
  const results: InjectResult[] = [];

  // حقن datasets محددة
  if (options?.datasets && options.datasets.length > 0) {
    for (const dsId of options.datasets) {
      const target = TARGET_DATASETS.find((t) => t.datasetId === dsId);
      if (target) {
        results.push(await hfDataInjector.injectDataset(target, { limit: options.limit }));
      } else {
        // بحث ديناميكي
        const dynTarget: DatasetTarget = {
          datasetId: dsId,
          type: 'general',
          displayName: dsId,
          description: `Dataset ${dsId} من HuggingFace`,
          category: 'multilingual',
          tags: ['hf_auto', dsId],
          maxRows: options.limit || 1000,
        };
        results.push(await hfDataInjector.injectDataset(dynTarget, { limit: options.limit }));
      }
    }
  }

  // حقن حسب المواضيع
  if (options?.topics && options.topics.length > 0) {
    for (const topic of options.topics) {
      const topicResults = await hfDataInjector.injectByTopic(topic, { limit: options.limit });
      results.push(...topicResults);
    }
  }

  // حقن كل الـ datasets المستهدفة
  if (!options?.datasets && !options?.topics) {
    results.push(...(await hfDataInjector.injectAllTargets({ limit: options?.limit })));
  }

  return results;
}
