// Site content: page texts, navigation, website settings, blog.
import { call } from './api.js';
import { t } from './i18n.js';
import { badge, busy, commas, confirmDialog, el, empty, field, formatDate, readForm, toast } from './ui.js';
import { pickImage } from './views-media.js';

// Which texts each page takes from the CMS (mirrors _data/cms.js). Lists are
// one item per line.
export const PAGE_FIELDS = {
  home: [['eyebrow', 'text'], ['headline', 'text'], ['lede', 'textarea'], ['availability', 'text'], ['ctaWork', 'text'], ['ctaStudio', 'text']],
  studio: [['eyebrow', 'text'], ['headline', 'text'], ['tagline', 'text'], ['lede', 'textarea']],
  footer: [['text', 'text']],
};
const LOCALES = ['ar', 'en', 'de'];

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------
export async function pagesView(params) {
  const page = PAGE_FIELDS[params[0]] ? params[0] : 'home';
  const rows = await call('content', 'pages_get', { page_key: page });
  const byLocale = Object.fromEntries(rows.map((r) => [r.locale, r.content]));
  const pagePicker = el('div', { class: 'chips', role: 'group', 'aria-label': t('pages.page') },
    Object.keys(PAGE_FIELDS).map((k) => el('a', { class: 'chip', href: `#/pages/${k}`, 'aria-current': k === page ? 'page' : false }, t(`pages.${k}`))));

  const forms = LOCALES.map((loc) => {
    const c = byLocale[loc] ?? {};
    const dir = loc === 'ar' ? 'rtl' : 'ltr';
    const form = el('form', { class: 'card form', novalidate: true, lang: loc, dir },
      el('h2', {}, t(`lang.${loc}`)),
      PAGE_FIELDS[page].map(([k, kind]) => field({
        label: t(`pages.f.${k}`), name: k, dir,
        type: kind === 'text' ? 'text' : 'textarea',
        rows: kind === 'list' ? 6 : 3,
        value: kind === 'list' ? (c[k] ?? []).join('\n') : c[k],
      })),
      el('div', { class: 'form-actions' }, el('button', { type: 'submit', class: 'btn btn-primary' }, t('action.save'))));
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const v = readForm(form);
      const content = {};
      for (const [k, kind] of PAGE_FIELDS[page]) {
        const val = kind === 'list' ? v[k].split('\n').map((x) => x.trim()).filter(Boolean) : v[k].trim();
        if (Array.isArray(val) ? val.length : val) content[k] = val;
      }
      await busy(form.querySelector('[type=submit]'), () => call('content', 'pages_set', { page_key: page, locale: loc, content }), t('state.saved')).catch(() => {});
    });
    return form;
  });

  return el('div', { class: 'view' },
    el('h1', {}, t('pages.title')),
    pagePicker,
    el('p', { class: 'muted' }, t('pages.hint'), ' ', t('publish.hint')),
    el('div', { class: 'grid-3' }, forms));
}

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------
export async function navigationView(_params, ctx) {
  const items = await call('content', 'nav_list');
  const row = (n, i) => {
    const form = el('form', { class: 'nav-row', novalidate: true },
      field({ label: t('navigation.label'), name: 'label', value: n?.label, required: true }),
      field({ label: t('navigation.labelAr'), name: 'label_ar', value: n?.label_ar, dir: 'rtl' }),
      field({ label: t('navigation.labelDe'), name: 'label_de', value: n?.label_de }),
      field({ label: t('navigation.href'), name: 'href', value: n?.href ?? '', dir: 'ltr', hint: t('navigation.hrefHint') }),
      n ? null : field({ label: t('navigation.key'), name: 'nav_key', value: '', dir: 'ltr', required: true }),
      field({ label: t('navigation.visible'), name: 'visible', type: 'checkbox', value: n ? n.visible : true }),
      el('div', { class: 'cat-actions' },
        el('button', { type: 'submit', class: 'btn btn-primary btn-sm' }, n ? t('action.save') : t('action.add')),
        n ? [
          el('button', { type: 'button', class: 'btn btn-sm btn-icon', 'aria-label': `${t('action.moveUp')}: ${n.label}`, disabled: i === 0, onclick: () => reorder(i, -1) }, '↑'),
          el('button', { type: 'button', class: 'btn btn-sm btn-icon', 'aria-label': `${t('action.moveDown')}: ${n.label}`, disabled: i === items.length - 1, onclick: () => reorder(i, 1) }, '↓'),
          el('button', {
            type: 'button', class: 'btn btn-sm btn-danger-ghost',
            onclick: async (e) => {
              const btn = e.currentTarget;
              if (await confirmDialog({ title: t('navigation.confirmDelete', { name: n.label }), confirmLabel: t('action.remove'), danger: true })) {
                await busy(btn, () => call('content', 'nav_delete', { id: n.id }), t('state.saved')).catch(() => {});
                ctx.rerender();
              }
            },
          }, t('action.remove')),
        ] : null));
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const v = readForm(form);
      const fields = { label: v.label, label_ar: v.label_ar || null, label_de: v.label_de || null, href: v.href.trim(), visible: v.visible };
      if (!n) { fields.nav_key = v.nav_key.trim(); fields.sort_order = (items.length + 1) * 10; }
      try {
        await busy(form.querySelector('[type=submit]'), () => (n ? call('content', 'nav_update', { id: n.id, fields }) : call('content', 'nav_create', { fields })), t('state.saved'));
        if (!n) ctx.rerender();
      } catch { /* toast shown */ }
    });
    return el('li', { class: 'card' }, form);
  };
  async function reorder(i, dir) {
    const ids = items.map((x) => x.id);
    [ids[i], ids[i + dir]] = [ids[i + dir], ids[i]];
    await busy(null, () => call('content', 'nav_reorder', { ids }), t('studio.orderSaved')).catch(() => {});
    ctx.rerender();
  }
  return el('div', { class: 'view' },
    el('h1', {}, t('navigation.title')),
    el('p', { class: 'muted' }, t('publish.hint')),
    items.length ? el('ul', { class: 'cards' }, items.map(row)) : empty(),
    el('h2', {}, t('navigation.add')),
    el('ul', { class: 'cards' }, row(null, items.length)));
}

// ---------------------------------------------------------------------------
// Website settings
// ---------------------------------------------------------------------------
export async function settingsView() {
  const rows = await call('content', 'settings_list');
  const get = (k) => rows.find((r) => r.key === k)?.value?.value;
  const social = (get('social.links') ?? []).map((s) => `${s.label} | ${s.url}`).join('\n');
  const form = el('form', { class: 'card form', novalidate: true },
    field({ label: t('settings.siteName'), name: 'site.name', value: get('site.name') }),
    field({ label: t('settings.contactEmail'), name: 'contact.email', value: get('contact.email'), type: 'email', dir: 'ltr' }),
    field({ label: t('settings.social'), name: 'social.links', value: social, type: 'textarea', rows: 5, hint: t('settings.socialHint'), dir: 'ltr' }),
    el('div', { class: 'form-actions' }, el('button', { type: 'submit', class: 'btn btn-primary' }, t('action.save'))));
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const v = readForm(form);
    const links = [];
    const linesIn = v['social.links'].split('\n').map((x) => x.trim()).filter(Boolean);
    for (const [i, line] of linesIn.entries()) {
      const [label, url] = line.split('|').map((x) => x.trim());
      if (!label || !/^https:\/\/\S+$/i.test(url ?? '')) { toast(t('settings.badSocial', { n: i + 1 }), 'error'); return; }
      links.push({ label, url });
    }
    const saves = [
      ['site.name', v['site.name'].trim()],
      ['contact.email', v['contact.email'].trim()],
      ['social.links', links],
    ];
    await busy(form.querySelector('[type=submit]'), async () => {
      for (const [key, value] of saves) {
        const empty = Array.isArray(value) ? !value.length : !value;
        if (empty && !rows.some((r) => r.key === key)) continue;
        if (empty) await call('content', 'settings_delete', { key });
        else await call('content', 'settings_set', { key, value: { value }, is_public: true });
      }
    }, t('settings.saved')).catch(() => {});
  });
  return el('div', { class: 'view' }, el('h1', {}, t('settings.title')), el('p', { class: 'muted' }, t('publish.hint')), form);
}

// ---------------------------------------------------------------------------
// Blog
// ---------------------------------------------------------------------------
const postState = (p) => {
  if (p.deleted_at) return ['trash', 'danger'];
  if (p.status === 'published' && new Date(p.published_at) > new Date()) return ['scheduled', 'warn'];
  if (p.status === 'published') return ['published', 'ok'];
  return ['draft', ''];
};

export async function blogView(params, ctx) {
  if (params[0]) return postEditor(params[0], ctx);
  const posts = await call('blog', 'list');
  const live = posts.filter((p) => !p.deleted_at);
  const trash = posts.filter((p) => p.deleted_at);
  const item = (p) => {
    const [s, tone] = postState(p);
    return el('li', { class: 'row' },
      el('div', { class: 'row-main' }, el('div', {},
        el('p', { class: 'row-title' }, p.title),
        el('p', { class: 'row-meta' }, badge(t(`blog.${s}`), tone), ' ', badge(p.locale.toUpperCase()), el('span', { class: 'muted' }, ` · ${formatDate(p.published_at || p.updated_at)}`)))),
      el('div', { class: 'row-actions' }, p.deleted_at
        ? [
          el('button', { type: 'button', class: 'btn btn-sm', onclick: async (e) => { await busy(e.currentTarget, () => call('blog', 'restore', { id: p.id }), t('studio.toastRestored')).catch(() => {}); ctx.rerender(); } }, t('action.restore')),
          el('button', { type: 'button', class: 'btn btn-sm btn-danger', onclick: async (e) => {
            const btn = e.currentTarget;
            if (await confirmDialog({ title: t('blog.confirmPurge', { name: p.title }), confirmLabel: t('action.purge'), danger: true })) {
              await busy(btn, () => call('blog', 'purge', { id: p.id }), t('studio.toastPurged')).catch(() => {});
              ctx.rerender();
            }
          } }, t('action.purge')),
        ]
        : el('a', { class: 'btn btn-sm btn-primary', href: `#/blog/${p.id}` }, t('action.edit'))));
  };
  return el('div', { class: 'view' },
    el('div', { class: 'view-head' }, el('h1', {}, t('blog.title')), el('a', { class: 'btn btn-primary', href: '#/blog/new' }, t('blog.new'))),
    el('p', { class: 'muted' }, t('blog.filePosts'), ' ', t('publish.hint')),
    live.length ? el('ul', { class: 'rows' }, live.map(item)) : empty(t('blog.none')),
    trash.length ? [el('h2', {}, t('blog.trash')), el('ul', { class: 'rows' }, trash.map(item))] : null);
}

const toLocalInput = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

async function postEditor(id, ctx) {
  const isNew = id === 'new';
  const p = isNew ? { locale: 'en', categories: [], tags: [], status: 'draft' } : await call('blog', 'get', { id });
  const [s, tone] = isNew ? ['draft', ''] : postState(p);
  const cover = el('input', { type: 'text', name: 'cover_image', value: p.cover_image ?? '', dir: 'ltr', id: 'f-cover' });
  const form = el('form', { class: 'form', novalidate: true },
    el('div', { class: 'grid-2' },
      field({ label: t('blog.fTitle'), name: 'title', value: p.title, required: true }),
      field({ label: t('blog.fSlug'), name: 'slug', value: p.slug, dir: 'ltr', hint: t('studio.fSlugHint') })),
    el('div', { class: 'grid-3' },
      field({ label: t('blog.fLocale'), name: 'locale', type: 'select', value: p.locale, options: ['en', 'de', 'ar'].map((l) => ({ value: l, label: t(`lang.${l}`) })) }),
      field({ label: t('blog.fCategories'), name: 'categories', value: (p.categories ?? []).join(', '), hint: t('studio.commaHint') }),
      field({ label: t('blog.fTags'), name: 'tags', value: (p.tags ?? []).join(', '), hint: t('studio.commaHint') })),
    field({ label: t('blog.fDescription'), name: 'description', value: p.description, type: 'textarea', rows: 2 }),
    field({ label: t('blog.fBody'), name: 'body_md', value: p.body_md, type: 'textarea', rows: 18, hint: t('blog.fBodyHint') }),
    el('div', { class: 'field' }, el('label', { for: 'f-cover' }, t('blog.fCover')),
      el('div', { class: 'input-row' }, cover, el('button', { type: 'button', class: 'btn', onclick: async () => { const u = await pickImage(); if (u) cover.value = u; } }, t('action.choose')))),
    field({ label: t('blog.fCoverAlt'), name: 'cover_alt', value: p.cover_alt }),
    el('div', { class: 'grid-2' },
      field({ label: t('blog.fSeoTitle'), name: 'seo_title', value: p.seo_title }),
      field({ label: t('blog.fSeoDescription'), name: 'seo_description', value: p.seo_description })));

  const fieldsFrom = () => {
    const v = readForm(form);
    const f = {
      title: v.title, locale: v.locale, description: v.description, body_md: v.body_md,
      cover_image: v.cover_image.trim() || null, cover_alt: v.cover_alt.trim() || null,
      categories: commas(v.categories), tags: commas(v.tags),
      seo_title: v.seo_title.trim() || null, seo_description: v.seo_description.trim() || null,
    };
    if (v.slug.trim()) f.slug = v.slug.trim();
    return f;
  };
  const save = async () => (isNew ? call('blog', 'create', { fields: fieldsFrom() }) : call('blog', 'update', { id, fields: fieldsFrom() }));
  const saveBtn = el('button', { type: 'submit', class: 'btn btn-primary' }, t('action.save'));
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const row = await busy(saveBtn, save, t('state.saved')).catch(() => null);
    if (row && isNew) location.hash = `#/blog/${row.id}`;
  });

  const when = el('input', { type: 'datetime-local', id: 'f-when', value: toLocalInput(p.published_at) });
  const publishBox = isNew ? null : el('section', { class: 'card' },
    el('p', {}, badge(t(`blog.${s}`), tone), p.published_at ? ` · ${formatDate(p.published_at)}` : ''),
    el('div', { class: 'toolbar' },
      el('button', { type: 'button', class: 'btn btn-primary', onclick: async (e) => {
        await busy(e.currentTarget, async () => { await save(); await call('blog', 'publish', { id }); }, t('state.saved')).catch(() => {});
        ctx.rerender();
      } }, t('blog.publishNow')),
      el('label', { for: 'f-when' }, t('blog.scheduleAt')), when,
      el('button', { type: 'button', class: 'btn', onclick: async (e) => {
        if (!when.value) { toast(t('blog.scheduleAt'), 'error'); return; }
        await busy(e.currentTarget, async () => { await save(); await call('blog', 'publish', { id, published_at: new Date(when.value).toISOString() }); }, t('state.saved')).catch(() => {});
        ctx.rerender();
      } }, t('blog.schedule')),
      p.status === 'published' ? el('button', { type: 'button', class: 'btn', onclick: async (e) => {
        await busy(e.currentTarget, () => call('blog', 'unpublish', { id }), t('state.saved')).catch(() => {});
        ctx.rerender();
      } }, t('blog.unpublish')) : null,
      el('button', { type: 'button', class: 'btn btn-danger-ghost', onclick: async (e) => {
        const btn = e.currentTarget;
        if (await confirmDialog({ title: t('blog.confirmTrash', { name: p.title }), confirmLabel: t('action.delete'), danger: true })) {
          await busy(btn, () => call('blog', 'delete', { id }), t('studio.toastTrash')).catch(() => {});
          location.hash = '#/blog';
        }
      } }, t('action.delete'))));

  form.append(el('div', { class: 'form-actions' }, saveBtn, el('a', { class: 'btn', href: '#/blog' }, t('action.back'))));
  return el('div', { class: 'view' },
    el('div', { class: 'view-head' }, el('h1', {}, isNew ? t('blog.new') : p.title), el('a', { class: 'btn', href: '#/blog' }, t('action.back'))),
    publishBox,
    form);
}

