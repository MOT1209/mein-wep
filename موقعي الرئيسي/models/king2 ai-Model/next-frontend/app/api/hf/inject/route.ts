/**
 * API endpoint لحقن المعرفة من HuggingFace Datasets
 * POST /api/hf/inject
 * GET  /api/hf/inject?status
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createLogger } from '@/lib/logger';
import { injectHFDatasets, hfDataInjector, TARGET_DATASETS } from '@/lib/huggingface/data-injector';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const log = createLogger('HFInjectAPI');

// ── Admin check ────────────────────────────────────────────────────────────

function isAdmin(session: any): boolean {
  const user = session?.user as any;
  return user?.email === 'rashid2010@gmail.com' || user?.name === 'Rashid2010';
}

// ── POST: بدء الحقن ───────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    // تحقق من الصلاحية
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }
    if (!isAdmin(session)) {
      return NextResponse.json({ error: 'غير مسموح إلا للمشرف' }, { status: 403 });
    }

    // قراءة الطلب
    const body = await req.json().catch(() => ({}));
    const {
      datasets,    // مصفوفة أسماء datasets محددة
      topics,      // مواضيع للبحث الديناميكي
      limit,       // حد أقصى للصفوف لكل dataset
    } = body;

    // بدء الحقن في الخلفية
    const promise = injectHFDatasets({ datasets, topics, limit: limit || 2000 });

    // إرجاع قبول الطلب فوراً
    return NextResponse.json({
      accepted: true,
      message: 'بدء حقن المعرفة من HuggingFace في الخلفية',
      config: {
        datasets: datasets || 'جميع المستهدفة',
        topics: topics || [],
        limit: limit || 2000,
      },
      // ننتظر النتيجة (لأن العملية قد تطول)
      results: await promise,
    });
  } catch (error: any) {
    log.error('POST /api/hf/inject error', error);
    return NextResponse.json(
      { error: error?.message || 'حدث خطأ غير متوقع' },
      { status: 500 }
    );
  }
}

// ── GET: معلومات عن الـ datasets المتوفرة ─────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    if (status === 'stats') {
      return NextResponse.json({
        stats: hfDataInjector.stats,
        configuredDatasets: TARGET_DATASETS.length,
      });
    }

    // إرجاع قائمة الـ datasets المستهدفة
    return NextResponse.json({
      availableDatasets: TARGET_DATASETS.map((d) => ({
        id: d.datasetId,
        name: d.displayName,
        type: d.type,
        description: d.description,
        maxRows: d.maxRows,
        tags: d.tags,
      })),
      targetLanguages: [
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
      ],
    });
  } catch (error: any) {
    log.error('GET /api/hf/inject error', error);
    return NextResponse.json(
      { error: error?.message || 'حدث خطأ غير متوقع' },
      { status: 500 }
    );
  }
}
