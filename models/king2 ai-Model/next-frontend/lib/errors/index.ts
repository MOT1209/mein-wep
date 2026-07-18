// =============================================================================
// KING2 AI — Professional Error System
// =============================================================================
// - فئات أخطاء متقدمة مع رموز تتبع
// - رسائل عربية ديناميكية مع دعم المتغيرات
// - دعم CORS في createErrorResponse
// - توثيق وتتبّع كامل (stack traces, traceId, metadata)
// - متوافق مع الإصدارات السابقة
// =============================================================================

//#region --- Error Codes ---

/**
 * رموز موحّدة لكل خطأ حسب نوعه ومصدره
 */
export const ErrorCode = {
  // شبكة
  NETWORK_GENERIC: 'NET_001',
  NETWORK_DNS: 'NET_002',
  NETWORK_REFUSED: 'NET_003',
  NETWORK_TIMEOUT: 'NET_004',

  // التوقيت
  TIMEOUT_REQUEST: 'TMO_001',
  TIMEOUT_STREAM: 'TMO_002',

  // تحديد المعدّل
  RATE_LIMIT_GENERIC: 'RAT_001',
  RATE_LIMIT_GUEST: 'RAT_002',
  RATE_LIMIT_USER: 'RAT_003',

  // المصادقة
  AUTH_UNAUTHORIZED: 'AUTH_001',
  AUTH_FORBIDDEN: 'AUTH_002',
  AUTH_SESSION_EXPIRED: 'AUTH_003',

  // التحقق
  VALIDATION_INPUT: 'VAL_001',
  VALIDATION_MISSING: 'VAL_002',
  VALIDATION_FORMAT: 'VAL_003',

  // البث
  STREAM_PARSE_FAILED: 'STR_001',
  STREAM_ABORTED: 'STR_002',
  STREAM_CHUNK_ERROR: 'STR_003',
  STREAM_DISCONNECTED: 'STR_004',

  // الإعدادات
  CONFIG_MISSING_KEY: 'CFG_001',
  CONFIG_INVALID_VALUE: 'CFG_002',

  // المزوّد
  PROVIDER_ERROR: 'PRV_001',
  PROVIDER_EMPTY: 'PRV_002',
  PROVIDER_UNAVAILABLE: 'PRV_003',

  // غير معروف
  UNKNOWN: 'UNK_001',
} as const;

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode];

//#endregion

//#region --- Message Templates (Arabic) ---

/**
 * قوالب رسائل الخطأ العربية مع دعم المتغيرات
 * تستخدم {{variable}} للاستبدال الديناميكي
 */
const AR_MESSAGES: Record<string, string> = {
  // الشبكة
  [ErrorCode.NETWORK_GENERIC]: 'حدث خطأ في الاتصال بالشبكة. يرجى التحقق من اتصالك بالإنترنت',
  [ErrorCode.NETWORK_DNS]: 'تعذّر العثور على الخادم (DNS). يرجى التحقق من اسم النطاق',
  [ErrorCode.NETWORK_REFUSED]: 'الخادم يرفض الاتصال. قد يكون الخادم متوقفاً أو محجوباً',
  [ErrorCode.NETWORK_TIMEOUT]: 'انتهت مهلة الاتصال بالخادم. يرجى المحاولة مرة أخرى',

  // التوقيت
  [ErrorCode.TIMEOUT_REQUEST]: 'انتهت مهلة الطلب. يُرجى المحاولة لاحقاً',
  [ErrorCode.TIMEOUT_STREAM]: 'انقطع الاتصال أثناء البث. جارٍ إعادة المحاولة...',

  // تحديد المعدّل
  [ErrorCode.RATE_LIMIT_GENERIC]: 'لقد تجاوزت الحد المسموح من الطلبات. يُرجى الانتظار {{seconds}} ثانية ثم المحاولة',
  [ErrorCode.RATE_LIMIT_GUEST]: 'لقد وصلت إلى الحد المسموح للضيوف. يُرجى إنشاء حساب للمتابعة أو الانتظار {{seconds}} ثانية',
  [ErrorCode.RATE_LIMIT_USER]: 'لقد تجاوزت حدّ الطلبات. يرجى الانتظار {{seconds}} ثانية',

  // المصادقة
  [ErrorCode.AUTH_UNAUTHORIZED]: 'غير مصرّح. يُرجى تسجيل الدخول للمتابعة',
  [ErrorCode.AUTH_FORBIDDEN]: 'ليس لديك صلاحية للوصول إلى هذا المورد',
  [ErrorCode.AUTH_SESSION_EXPIRED]: 'انتهت صلاحية الجلسة. يُرجى تسجيل الدخول مرة أخرى',

  // التحقق
  [ErrorCode.VALIDATION_INPUT]: 'بيانات غير صالحة: {{detail}}',
  [ErrorCode.VALIDATION_MISSING]: 'الحقل المطلوب مفقود: {{field}}',
  [ErrorCode.VALIDATION_FORMAT]: 'تنسيق غير صحيح: {{field}}',

  // البث
  [ErrorCode.STREAM_PARSE_FAILED]: 'فشل في تحليل بيانات البث. قد يكون التنسيق غير متوافق',
  [ErrorCode.STREAM_ABORTED]: 'تم إلغاء الطلب',
  [ErrorCode.STREAM_CHUNK_ERROR]: 'حدث خطأ أثناء قراءة مقطع من البيانات',
  [ErrorCode.STREAM_DISCONNECTED]: 'انقطع الاتصال أثناء البث. جارٍ إعادة المحاولة...',

  // الإعدادات
  [ErrorCode.CONFIG_MISSING_KEY]: 'مفتاح API غير مضبوط: {{key}}. يرجى ضبطه في الإعدادات',
  [ErrorCode.CONFIG_INVALID_VALUE]: 'قيمة إعداد غير صالحة: {{key}}',

  // المزوّد
  [ErrorCode.PROVIDER_ERROR]: 'خطأ من مزود الخدمة ({{provider}}): {{detail}}',
  [ErrorCode.PROVIDER_EMPTY]: 'المزوّد ({{provider}}) أرجع رداً فارغاً',
  [ErrorCode.PROVIDER_UNAVAILABLE]: 'مزوّد الخدمة ({{provider}}) غير متاح حالياً',

  // غير معروف
  [ErrorCode.UNKNOWN]: 'حدث خطأ غير متوقع. يُرجى المحاولة مرة أخرى',
};

/**
 * استبدال المتغيرات في قالب الرسالة
 * @example interpolate('مرحباً {{name}}', { name: 'أحمد' }) → 'مرحباً أحمد'
 */
function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const val = vars[key];
    return val !== undefined ? String(val) : `{{${key}}}`;
  });
}

function getArabicMessage(code: ErrorCodeType, vars?: Record<string, string | number>): string {
  const template = AR_MESSAGES[code] ?? AR_MESSAGES[ErrorCode.UNKNOWN];
  return interpolate(template, vars);
}

//#endregion

//#region --- Error Classes ---

/**
 * **الواجهة الأساسية لبيانات الخطأ الإضافية**
 */
export interface ErrorMetadata {
  /** معرّف تتبّع فريد */
  traceId?: string;
  /** اسم المكوّن الذي نشأ منه الخطأ */
  component?: string;
  /** معلومات إضافية حسب السياق */
  [key: string]: unknown;
}

export interface SerializedError {
  name: string;
  message: string;
  code: ErrorCodeType;
  category: ErrorCategory;
  provider?: string;
  statusCode?: number;
  traceId?: string;
  component?: string;
  stack?: string;
  retryAfterMs?: number;
  transient: boolean;
}

/**
 * الخطأ الأساسي لجميع أخطاء KING2
 */
export class BaseAIError extends Error {
  public code: ErrorCodeType;
  public readonly traceId: string;
  public readonly component?: string;
  public readonly timestamp: string;

  constructor(
    message: string,
    code: ErrorCodeType = ErrorCode.UNKNOWN,
    options?: {
      provider?: string;
      statusCode?: number;
      rawError?: unknown;
      metadata?: ErrorMetadata;
    }
  ) {
    super(message);
    this.name = 'BaseAIError';
    this.code = code;
    this.traceId = options?.metadata?.traceId ?? crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    this.component = options?.metadata?.component;
    this.timestamp = new Date().toISOString();

    // ربط السبب الأصلي
    if (options?.rawError instanceof Error) {
      this.cause = options.rawError;
      // دمج الـ stack traces إذا أمكن
      if (!this.stack?.includes(options.rawError.stack ?? '')) {
        this.stack = `${this.stack}\nCaused by: ${options.rawError.stack}`;
      }
    }

    Object.setPrototypeOf(this, new.target.prototype);
  }

  /** تحويل الخطأ إلى كائن JSON للتسلسل */
  toJSON(): SerializedError {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      category: getErrorCategory(this),
      stack: this.stack,
      traceId: this.traceId,
      component: this.component,
      transient: isTransientError(this),
    };
  }

  /** الحصول على رسالة مترجمة ديناميكية */
  getLocalizedMessage(vars?: Record<string, string | number>): string {
    return getArabicMessage(this.code, vars);
  }
}

// ---- أخطاء الشبكة ----
export class NetworkError extends BaseAIError {
  declare public statusCode?: number;

  constructor(
    message: string,
    provider?: string,
    rawError?: unknown,
    metadata?: ErrorMetadata
  ) {
    const code = message.includes('ENOTFOUND')
      ? ErrorCode.NETWORK_DNS
      : message.includes('ECONNREFUSED')
        ? ErrorCode.NETWORK_REFUSED
        : ErrorCode.NETWORK_GENERIC;

    super(message, code, { provider, rawError, metadata });
    this.name = 'NetworkError';
    this.statusCode = undefined;
  }
}

// ---- أخطاء التوقيت ----
export class TimeoutError extends BaseAIError {
  public readonly statusCode = 408;

  constructor(
    message: string,
    provider?: string,
    metadata?: ErrorMetadata
  ) {
    super(message, ErrorCode.TIMEOUT_REQUEST, {
      provider,
      statusCode: 408,
      metadata,
    });
    this.name = 'TimeoutError';
  }
}

// ---- أخطاء تحديد المعدل ----
export class RateLimitError extends BaseAIError {
  public readonly statusCode = 429;
  public readonly retryAfterMs: number;

  constructor(
    message: string,
    provider?: string,
    rawError?: unknown,
    retryAfterMs?: number,
    metadata?: ErrorMetadata
  ) {
    super(message, ErrorCode.RATE_LIMIT_GENERIC, {
      provider,
      statusCode: 429,
      rawError,
      metadata,
    });
    this.name = 'RateLimitError';
    this.retryAfterMs = retryAfterMs ?? 60000;
  }
}

export class GuestLimitError extends RateLimitError {
  constructor(
    message: string,
    provider?: string,
    rawError?: unknown,
    retryAfterMs?: number,
    metadata?: ErrorMetadata
  ) {
    super(message, provider, rawError, retryAfterMs, metadata);
    this.code = ErrorCode.RATE_LIMIT_GUEST;
    this.name = 'GuestLimitError';
  }
}

// ---- أخطاء المصادقة ----
export class AuthError extends BaseAIError {
  public readonly statusCode = 401;

  constructor(
    message: string,
    provider?: string,
    rawError?: unknown,
    metadata?: ErrorMetadata
  ) {
    super(message, ErrorCode.AUTH_UNAUTHORIZED, {
      provider,
      statusCode: 401,
      rawError,
      metadata,
    });
    this.name = 'AuthError';
  }
}

// ---- أخطاء التحقق ----
export class ValidationError extends BaseAIError {
  public readonly statusCode = 400;

  constructor(
    message: string,
    provider?: string,
    metadata?: ErrorMetadata
  ) {
    super(message, ErrorCode.VALIDATION_INPUT, {
      provider,
      statusCode: 400,
      metadata,
    });
    this.name = 'ValidationError';
  }
}

// ---- أخطاء مزود الخدمة ----
export class ProviderError extends BaseAIError {
  public readonly statusCode: number | undefined;

  constructor(
    message: string,
    provider?: string,
    statusCode?: number,
    rawError?: unknown,
    metadata?: ErrorMetadata
  ) {
    const code = statusCode === 429
      ? ErrorCode.RATE_LIMIT_GENERIC
      : statusCode === 401 || statusCode === 403
        ? ErrorCode.AUTH_UNAUTHORIZED
        : ErrorCode.PROVIDER_ERROR;

    super(message, code, { provider, statusCode, rawError, metadata });
    this.name = 'ProviderError';
    this.statusCode = statusCode;
  }
}

// ---- أخطاء البث ----
export class StreamError extends BaseAIError {
  constructor(
    message: string,
    provider?: string,
    rawError?: unknown,
    metadata?: ErrorMetadata
  ) {
    super(message, ErrorCode.STREAM_PARSE_FAILED, {
      provider,
      rawError,
      metadata,
    });
    this.name = 'StreamError';
  }
}

export class StreamAbortedError extends StreamError {
  constructor(
    provider?: string,
    metadata?: ErrorMetadata
  ) {
    super('تم إلغاء البث', provider, undefined, metadata);
    this.code = ErrorCode.STREAM_ABORTED;
    this.name = 'StreamAbortedError';
  }
}

export class StreamDisconnectedError extends StreamError {
  constructor(
    provider?: string,
    metadata?: ErrorMetadata
  ) {
    super('انقطع اتصال البث', provider, undefined, metadata);
    this.code = ErrorCode.STREAM_DISCONNECTED;
    this.name = 'StreamDisconnectedError';
  }
}

// ---- أخطاء الإعدادات ----
export class ConfigurationError extends BaseAIError {
  public readonly statusCode = 500;

  constructor(
    message: string,
    provider?: string,
    metadata?: ErrorMetadata
  ) {
    super(message, ErrorCode.CONFIG_MISSING_KEY, {
      provider,
      statusCode: 500,
      metadata,
    });
    this.name = 'ConfigurationError';
  }
}

//#endregion

//#region --- Error Classification ---

export type ErrorCategory =
  | 'network'
  | 'timeout'
  | 'rate_limit'
  | 'auth'
  | 'validation'
  | 'stream'
  | 'configuration'
  | 'provider'
  | 'guest_limit'
  | 'unknown';

const CATEGORY_MAP: Record<string, ErrorCategory> = {
  NetworkError: 'network',
  TimeoutError: 'timeout',
  RateLimitError: 'rate_limit',
  GuestLimitError: 'guest_limit',
  AuthError: 'auth',
  ValidationError: 'validation',
  StreamError: 'stream',
  StreamAbortedError: 'stream',
  StreamDisconnectedError: 'stream',
  ConfigurationError: 'configuration',
};

export function getErrorCategory(error: unknown): ErrorCategory {
  if (!error || typeof error !== 'object') return 'unknown';

  const mapped = CATEGORY_MAP[(error as any).name];
  if (mapped) return mapped;

  if (error instanceof ProviderError) {
    const status = error.statusCode;
    if (status && status >= 500) return 'provider';
    if (status === 429) return 'rate_limit';
    if (status === 401 || status === 403) return 'auth';
    return 'provider';
  }

  return 'unknown';
}

/**
 * هل الخطأ عابر (يمكن إعادة المحاولة) أم لا؟
 */
export function isTransientError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;

  const name = (error as any).name;
  const transientNames = new Set([
    'NetworkError',
    'TimeoutError',
    'RateLimitError',
    'GuestLimitError',
    'StreamError',
    'StreamDisconnectedError',
  ]);
  if (transientNames.has(name)) return true;

  if (error instanceof ProviderError) {
    const status = error.statusCode;
    if (status && status >= 500 && status < 600) return true;
    if (status === 429) return true;
  }

  return false;
}

//#endregion

//#region --- Message Formatting ---

/**
 * تنسيق رسالة الخطأ للمستخدم النهائي
 */
export function formatErrorMessage(
  error: unknown,
  vars?: Record<string, string | number>
): string {
  if (error instanceof BaseAIError) {
    return error.getLocalizedMessage(vars);
  }

  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    // كشف أخطاء الشبكة المعروفة
    if (/fetch|network|enotfound|econnrefused|econnreset|econnaborted/i.test(msg)) {
      return getArabicMessage(ErrorCode.NETWORK_GENERIC);
    }
    if (/abort|timeout/i.test(msg)) {
      return getArabicMessage(ErrorCode.TIMEOUT_REQUEST);
    }
    return error.message;
  }

  if (typeof error === 'string') return error;
  return getArabicMessage(ErrorCode.UNKNOWN);
}

//#endregion

//#region --- Utility Helpers ---

/**
 * لفّ خطأ غير معروف داخل نظام الأخطاء الموحّد
 */
export function wrapError(
  error: unknown,
  options?: {
    provider?: string;
    code?: ErrorCodeType;
    metadata?: ErrorMetadata;
  }
): BaseAIError {
  if (error instanceof BaseAIError) {
    // إضافة metadata إذا وُجدت
    if (options?.metadata && !error.traceId) {
      Object.assign(error, options.metadata);
    }
    return error;
  }

  if (error instanceof Error) {
    return new BaseAIError(error.message, options?.code ?? ErrorCode.UNKNOWN, {
      provider: options?.provider,
      rawError: error,
      metadata: options?.metadata,
    });
  }

  const msg = typeof error === 'string' ? error : 'خطأ غير معروف';
  return new BaseAIError(msg, ErrorCode.UNKNOWN, {
    provider: options?.provider,
    rawError: error,
    metadata: options?.metadata,
  });
}

//#endregion

//#region --- Response Helpers ---

export interface CreateErrorResponseOptions {
  status?: number;
  /** رؤوس CORS إضافية */
  cors?: {
    origin?: string;
    methods?: string;
    headers?: string;
    maxAge?: number;
  };
  /** متغيرات الرسالة */
  messageVars?: Record<string, string | number>;
}

/**
 * إنشاء Response خطأ مع دعم CORS
 */
export function createErrorResponse(
  error: unknown,
  options?: CreateErrorResponseOptions
): Response {
  const category = getErrorCategory(error);
  const message = formatErrorMessage(error, options?.messageVars);

  // استخراج كود الحالة
  let status = options?.status ?? 500;
  if (!options?.status) {
    if (error instanceof BaseAIError) {
      const sc = (error as any).statusCode;
      if (typeof sc === 'number') status = sc;
    }
  }

  // بناء جسم الاستجابة
  const body: Record<string, unknown> = {
    error: { message, category },
    success: false,
  };

  // معلومات إضافية
  if (error instanceof RateLimitError) {
    (body.error as Record<string, unknown>).retryAfterMs = error.retryAfterMs;
  }

  if (error instanceof BaseAIError) {
    (body.error as Record<string, unknown>).code = error.code;
    (body.error as Record<string, unknown>).traceId = error.traceId;
  }

  // رؤوس CORS
  const corsOrigin = options?.cors?.origin ?? '*';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Methods': options?.cors?.methods ?? 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': options?.cors?.headers ?? 'Content-Type, Authorization',
  };

  if (options?.cors?.maxAge != null) {
    headers['Access-Control-Max-Age'] = String(options.cors.maxAge);
  }

  return new Response(JSON.stringify(body), {
    status,
    headers,
  });
}

//#endregion
