/**
 * Input validation for the admin API. Each entity has an allow-list of fields
 * with a type; anything not on the list is rejected, never passed through.
 * The database enforces the same rules again with CHECK constraints.
 */

export class InputError extends Error {
  constructor(message) {
    super(message);
    this.status = 400;
  }
}

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
// https:// or a site-relative path with no scheme (mirrors cms_safe_url in SQL).
export function safeUrl(u) {
  if (typeof u !== 'string' || u.length > 2048 || /\s/.test(u)) return false;
  if (/^https:\/\/[a-z0-9.-]+(:\d+)?(\/|$|\?|#)/i.test(u)) return true;
  return !u.includes(':') && /^(\/[^/]|[a-z0-9#])/i.test(u);
}

const T = {
  str: (max, { min = 0 } = {}) => (v, k) => {
    if (typeof v !== 'string') throw new InputError(`${k} must be text`);
    const s = v.trim();
    if (s.length < min || s.length > max) throw new InputError(`${k} must be ${min}–${max} characters`);
    return s;
  },
  optStr: (max) => (v, k) => (v === null || v === '' ? null : T.str(max)(v, k)),
  slug: (max) => (v, k) => {
    const s = T.str(max, { min: 1 })(v, k);
    if (!SLUG.test(s)) throw new InputError(`${k} may only use a-z, 0-9 and single dashes`);
    return s;
  },
  url: (v, k) => {
    if (v === null || v === '') return null;
    if (!safeUrl(v)) throw new InputError(`${k} must be an https:// link or a site path`);
    return v;
  },
  httpsUrl: (v, k) => {
    if (v === null || v === '') return null;
    if (!safeUrl(v) || !/^https:\/\//i.test(v)) throw new InputError(`${k} must be an https:// link`);
    return v;
  },
  bool: (v, k) => {
    if (typeof v !== 'boolean') throw new InputError(`${k} must be true or false`);
    return v;
  },
  int: (min, max) => (v, k) => {
    if (!Number.isInteger(v) || v < min || v > max) throw new InputError(`${k} must be a whole number ${min}–${max}`);
    return v;
  },
  oneOf: (...vals) => (v, k) => {
    if (!vals.includes(v)) throw new InputError(`${k} must be one of: ${vals.join(', ')}`);
    return v;
  },
  list: (maxItems, maxLen) => (v, k) => {
    if (!Array.isArray(v) || v.length > maxItems) throw new InputError(`${k} must be a list of at most ${maxItems}`);
    return v.map((x, i) => T.str(maxLen, { min: 1 })(x, `${k}[${i}]`));
  },
  uuid: (v, k) => {
    if (v === null) return null;
    if (typeof v !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)) {
      throw new InputError(`${k} must be an id`);
    }
    return v;
  },
  date: (v, k) => {
    if (v === null) return null;
    if (typeof v !== 'string' || Number.isNaN(Date.parse(v))) throw new InputError(`${k} must be a date`);
    return new Date(v).toISOString();
  },
};
export const types = T;

/** Per-language overrides on a project: only these keys, only de/ar. */
function projectI18n(v, k) {
  if (v === null || typeof v !== 'object' || Array.isArray(v)) throw new InputError(`${k} must be an object`);
  const out = {};
  for (const [lang, t] of Object.entries(v)) {
    if (!['de', 'ar'].includes(lang)) throw new InputError(`${k}: unknown language ${lang}`);
    if (t === null || typeof t !== 'object' || Array.isArray(t)) throw new InputError(`${k}.${lang} must be an object`);
    const o = {};
    for (const [f, val] of Object.entries(t)) {
      if (val === null || val === '') continue;
      if (f === 'description') o.description = T.str(400)(val, `${k}.${lang}.description`);
      else if (f === 'longDescription') o.longDescription = T.str(20000)(val, `${k}.${lang}.longDescription`);
      else if (f === 'imageAlt') o.imageAlt = T.str(300)(val, `${k}.${lang}.imageAlt`);
      else if (f === 'features') o.features = T.list(20, 200)(val, `${k}.${lang}.features`);
      else throw new InputError(`${k}.${lang}: unknown field ${f}`);
    }
    if (Object.keys(o).length) out[lang] = o;
  }
  return out;
}

export const SCHEMAS = {
  studio_projects: {
    slug: T.slug(80),
    section: T.oneOf('games', 'apps', 'labs'),
    title: T.str(120, { min: 1 }),
    short_description: T.str(400),
    description: T.optStr(20000),
    project_type: T.oneOf('App', 'Game', 'AI', 'Tool', 'Website', 'Library'),
    category_id: T.uuid,
    platforms: T.list(12, 40),
    technologies: T.list(30, 60),
    features: T.list(20, 200),
    status: T.oneOf('Available', 'In Development', 'Experimental', 'Coming Soon'),
    featured: T.bool,
    visibility: T.oneOf('public', 'hidden'),
    sort_order: T.int(-100000, 100000),
    cover_image: T.url,
    image_alt: T.optStr(300),
    launch_url: T.url,
    demo_url: T.httpsUrl,
    download_url: T.httpsUrl,
    apk_id: (v, k) => {
      if (v === null || v === '') return null;
      if (typeof v !== 'string' || !/^[a-z][a-z0-9_.]{2,100}$/.test(v)) throw new InputError(`${k} must look like com.example.app`);
      return v;
    },
    i18n: projectI18n,
  },
  project_categories: {
    slug: T.slug(60),
    name: T.str(80, { min: 1 }),
    name_de: T.optStr(80),
    name_ar: T.optStr(80),
    sort_order: T.int(-100000, 100000),
  },
  navigation_items: {
    nav_key: (v, k) => {
      const s = T.str(41, { min: 2 })(v, k);
      if (!/^[a-z][a-z0-9_-]{1,40}$/.test(s)) throw new InputError(`${k} may only use a-z, 0-9, - and _`);
      return s;
    },
    label: T.str(40, { min: 1 }),
    label_de: T.optStr(40),
    label_ar: T.optStr(40),
    href: (v, k) => {
      if (v === '') return ''; // the home page
      const u = T.url(v, k);
      if (!u) throw new InputError(`${k} is required`);
      return u;
    },
    sort_order: T.int(-100000, 100000),
    visible: T.bool,
  },
  blog_posts: {
    slug: T.slug(100),
    locale: T.oneOf('en', 'de', 'ar'),
    title: T.str(200, { min: 1 }),
    description: T.str(400),
    body_md: T.str(200000),
    cover_image: T.url,
    cover_alt: T.optStr(300),
    categories: T.list(10, 60),
    tags: T.list(20, 40),
    seo_title: T.optStr(200),
    seo_description: T.optStr(400),
    published_at: T.date,
  },
};

/**
 * Validates `input` against an entity schema. With `partial` (updates) only
 * the given fields are checked; otherwise every `required` field must exist.
 */
export function validate(entity, input, { partial = false, required = [] } = {}) {
  const schema = SCHEMAS[entity];
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new InputError('Expected an object');
  const out = {};
  for (const [k, v] of Object.entries(input)) {
    if (!Object.hasOwn(schema, k)) throw new InputError(`Unknown field: ${k}`);
    out[k] = schema[k](v, k);
  }
  if (!partial) {
    for (const k of required) if (out[k] === undefined || out[k] === null || out[k] === '') throw new InputError(`${k} is required`);
  }
  if (!Object.keys(out).length) throw new InputError('Nothing to save');
  return out;
}

export function requireUuid(v, k = 'id') {
  return T.uuid(v, k) ?? (() => { throw new InputError(`${k} is required`); })();
}

export function slugify(s) {
  return String(s).toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'project';
}
