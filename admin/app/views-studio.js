// King Studio: project list, project editor, categories.
import { call } from './api.js';
import { t } from './i18n.js';
import { badge, busy, clear, commas, confirmDialog, el, empty, field, formatDate, lines, readForm } from './ui.js';
import { pickImage } from './views-media.js';

const SECTIONS = ['games', 'apps', 'labs'];
const STATUSES = ['Available', 'In Development', 'Experimental', 'Coming Soon'];
const TYPES = ['App', 'Game', 'AI', 'Tool', 'Website', 'Library'];

const visBadge = (p) => (p.deleted_at
  ? badge(t('studio.filterTrash'), 'danger')
  : p.visibility === 'public' ? badge(t('studio.public'), 'ok') : badge(t('studio.hidden')));

// ---------------------------------------------------------------------------
// List
// ---------------------------------------------------------------------------
export async function projectsView(params, ctx) {
  if (params[0]) return projectEditor(params[0], ctx);
  const all = await call('projects', 'list');
  const view = el('div', { class: 'view' });
  const state = { filter: 'all', q: '', section: '' };
  const listBox = el('div');

  const filters = ['all', 'public', 'hidden', 'trash'];
  const chips = el('div', { class: 'chips', role: 'group', 'aria-label': t('studio.visibility') },
    filters.map((f) => el('button', {
      type: 'button', class: 'chip', 'aria-pressed': String(f === state.filter), dataset: { f },
      onclick: () => {
        state.filter = f;
        chips.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.f === f)));
        draw();
      },
    }, t(`studio.filter${f[0].toUpperCase()}${f.slice(1)}`))));
  const search = el('input', { type: 'search', class: 'input', 'aria-label': t('studio.search'), placeholder: t('studio.search'), oninput: (e) => { state.q = e.target.value.toLowerCase(); draw(); } });
  const sectionSel = el('select', { class: 'input', 'aria-label': t('studio.section'), onchange: (e) => { state.section = e.target.value; draw(); } },
    el('option', { value: '' }, `${t('studio.section')}: ${t('studio.filterAll')}`),
    SECTIONS.map((s) => el('option', { value: s }, t(`section.${s}`))));

  function visible() {
    return all.filter((p) => {
      if (state.filter === 'trash' ? !p.deleted_at : p.deleted_at) return false;
      if (state.filter === 'public' && p.visibility !== 'public') return false;
      if (state.filter === 'hidden' && p.visibility !== 'hidden') return false;
      if (state.section && p.section !== state.section) return false;
      if (state.q && !`${p.title} ${p.slug} ${p.category?.name ?? ''} ${p.repo?.full_name ?? ''}`.toLowerCase().includes(state.q)) return false;
      return true;
    });
  }

  async function act(btn, fn, msg) {
    await busy(btn, fn, msg).catch(() => {});
    ctx.rerender();
  }

  async function move(p, dir) {
    const order = all.filter((x) => !x.deleted_at && x.section === p.section).sort((a, b) => a.sort_order - b.sort_order);
    const i = order.findIndex((x) => x.id === p.id);
    const j = i + dir;
    if (j < 0 || j >= order.length) return;
    [order[i], order[j]] = [order[j], order[i]];
    // Keep other sections' relative order: send the full list, this section reordered in place.
    const others = all.filter((x) => !x.deleted_at && x.section !== p.section);
    const ids = [...order, ...others].map((x) => x.id);
    await busy(null, () => call('projects', 'reorder', { ids }), t('studio.orderSaved')).catch(() => {});
    ctx.rerender();
  }

  function row(p) {
    const actions = p.deleted_at
      ? [
        el('button', { type: 'button', class: 'btn btn-sm', onclick: (e) => act(e.currentTarget, () => call('projects', 'restore', { id: p.id }), t('studio.toastRestored')) }, t('action.restore')),
        el('button', {
          type: 'button', class: 'btn btn-sm btn-danger',
          onclick: async (e) => {
            const btn = e.currentTarget;
            if (await confirmDialog({ title: t('studio.confirmPurgeTitle', { name: p.title }), body: t('studio.confirmPurgeBody'), confirmLabel: t('action.purge'), danger: true })) {
              act(btn, () => call('projects', 'purge', { id: p.id }), t('studio.toastPurged'));
            }
          },
        }, t('action.purge')),
      ]
      : [
        el('a', { class: 'btn btn-sm btn-primary', href: `#/studio/${p.id}` }, t('action.edit')),
        p.visibility === 'public'
          ? el('button', { type: 'button', class: 'btn btn-sm', onclick: (e) => act(e.currentTarget, () => call('projects', 'set_visibility', { id: p.id, visibility: 'hidden' }), t('studio.toastHidden')) }, t('action.hide'))
          : el('button', { type: 'button', class: 'btn btn-sm', onclick: (e) => act(e.currentTarget, () => call('projects', 'set_visibility', { id: p.id, visibility: 'public' }), t('studio.toastPublished')) }, t('action.publish')),
        el('button', { type: 'button', class: 'btn btn-sm', 'aria-pressed': String(!!p.featured), onclick: (e) => act(e.currentTarget, () => call('projects', 'set_featured', { id: p.id, featured: !p.featured })) }, p.featured ? t('action.unfeature') : t('action.feature')),
        el('button', { type: 'button', class: 'btn btn-sm btn-icon', 'aria-label': `${t('action.moveUp')}: ${p.title}`, title: t('action.moveUp'), onclick: () => move(p, -1) }, '↑'),
        el('button', { type: 'button', class: 'btn btn-sm btn-icon', 'aria-label': `${t('action.moveDown')}: ${p.title}`, title: t('action.moveDown'), onclick: () => move(p, 1) }, '↓'),
        el('button', {
          type: 'button', class: 'btn btn-sm btn-danger-ghost',
          onclick: async (e) => {
            const btn = e.currentTarget;
            if (await confirmDialog({ title: t('studio.confirmTrashTitle', { name: p.title }), body: t('studio.confirmTrashBody'), confirmLabel: t('action.delete'), danger: true })) {
              act(btn, () => call('projects', 'delete', { id: p.id }), t('studio.toastTrash'));
            }
          },
        }, t('action.delete')),
      ];
    return el('li', { class: 'row' },
      el('div', { class: 'row-main' },
        p.cover_image && /^https:\/\//.test(p.cover_image) ? el('img', { class: 'row-thumb', src: p.cover_image, alt: '' })
          : el('span', { class: 'row-thumb row-mono', 'aria-hidden': 'true' }, (p.title || '?').slice(0, 1)),
        el('div', {},
          el('p', { class: 'row-title' }, p.title, p.featured ? el('span', { class: 'star', title: t('studio.featured') }, ' ★') : null),
          el('p', { class: 'row-meta' },
            visBadge(p), ' ', badge(t(`section.${p.section}`)), ' ', badge(t(`status.${p.status}`)),
            p.category ? [' ', badge(p.category.name)] : null,
            p.repo ? [' ', el('a', { href: p.repo.html_url, target: '_blank', rel: 'noopener', dir: 'ltr' }, p.repo.full_name)] : null))),
      el('div', { class: 'row-actions' }, actions));
  }

  function draw() {
    const rows = visible();
    clear(listBox).append(rows.length
      ? el('ul', { class: 'rows' }, rows.map(row))
      : empty(state.filter === 'trash' ? t('studio.trashEmpty') : t('studio.noProjects')));
  }

  view.append(
    el('div', { class: 'view-head' },
      el('h1', {}, t('studio.title')),
      el('a', { class: 'btn btn-primary', href: '#/studio/new' }, t('studio.new'))),
    el('p', { class: 'muted' }, t('publish.hint')),
    el('div', { class: 'toolbar' }, chips, search, sectionSel),
    listBox);
  draw();
  return view;
}

// ---------------------------------------------------------------------------
// Editor
// ---------------------------------------------------------------------------
function imageField({ label, name, value, altName, altValue, altLabel }) {
  const input = el('input', { type: 'text', name, value: value ?? '', dir: 'ltr', inputmode: 'url', id: `f-${name}` });
  const preview = el('img', { class: 'img-preview', alt: '', hidden: !/^https:\/\//.test(value ?? '') , src: /^https:\/\//.test(value ?? '') ? value : null });
  input.addEventListener('input', () => {
    const ok = /^https:\/\//.test(input.value);
    preview.hidden = !ok;
    if (ok) preview.src = input.value;
  });
  return el('div', { class: 'field-group' },
    el('div', { class: 'field' },
      el('label', { for: `f-${name}` }, label),
      el('div', { class: 'input-row' }, input,
        el('button', { type: 'button', class: 'btn', onclick: async () => {
          const url = await pickImage();
          if (url) { input.value = url; input.dispatchEvent(new Event('input')); }
        } }, t('action.choose'))),
      preview),
    altName ? field({ label: altLabel, name: altName, value: altValue }) : null);
}

function galleryEditor(images) {
  const list = el('ul', { class: 'gallery-edit' });
  const add = (im = { url: '', alt: '' }) => {
    const url = el('input', { type: 'text', value: im.url, dir: 'ltr', 'aria-label': 'URL', class: 'input', dataset: { g: 'url' } });
    const alt = el('input', { type: 'text', value: im.alt, 'aria-label': t('studio.galleryAlt'), placeholder: t('studio.galleryAlt'), class: 'input', dataset: { g: 'alt' } });
    const li = el('li', { class: 'gallery-row' },
      el('img', { class: 'img-preview img-preview-sm', alt: '', src: /^https:\/\//.test(im.url) ? im.url : null, hidden: !/^https:\/\//.test(im.url) }),
      url, alt,
      el('button', { type: 'button', class: 'btn btn-sm', onclick: async () => { const u = await pickImage(); if (u) { url.value = u; li.querySelector('img').src = u; li.querySelector('img').hidden = false; } } }, t('action.choose')),
      el('button', { type: 'button', class: 'btn btn-sm btn-icon', 'aria-label': t('action.moveUp'), onclick: () => li.previousElementSibling && list.insertBefore(li, li.previousElementSibling) }, '↑'),
      el('button', { type: 'button', class: 'btn btn-sm btn-danger-ghost', onclick: () => li.remove() }, t('action.remove')));
    list.append(li);
  };
  images.forEach(add);
  const read = () => [...list.children].map((li) => ({
    url: li.querySelector('[data-g=url]').value.trim(),
    alt: li.querySelector('[data-g=alt]').value.trim(),
  })).filter((g) => g.url);
  return { node: el('div', {}, list, el('button', { type: 'button', class: 'btn', onclick: () => add() }, t('studio.addImage'))), read };
}

async function projectEditor(id, ctx) {
  const isNew = id === 'new';
  const [p, cats] = await Promise.all([
    isNew ? Promise.resolve({ section: 'labs', status: 'In Development', project_type: 'App', visibility: 'hidden', platforms: [], technologies: [], features: [], i18n: {}, images: [] }) : call('projects', 'get', { id }),
    call('categories', 'list'),
  ]);
  const gallery = galleryEditor(p.images ?? []);
  const tr = (l, k) => p.i18n?.[l]?.[k] ?? '';
  const form = el('form', { class: 'form', novalidate: true });

  const transl = ['ar', 'de'].map((l) => el('fieldset', { class: 'fieldset' },
    el('legend', {}, t(`lang.${l}`)),
    el('p', { class: 'hint' }, t('studio.tHint')),
    field({ label: t('studio.tDescription'), name: `i18n.${l}.description`, value: tr(l, 'description'), type: 'textarea', rows: 2, dir: l === 'ar' ? 'rtl' : 'ltr' }),
    field({ label: t('studio.tLong'), name: `i18n.${l}.longDescription`, value: tr(l, 'longDescription'), type: 'textarea', rows: 5, dir: l === 'ar' ? 'rtl' : 'ltr' }),
    field({ label: t('studio.tFeatures'), name: `i18n.${l}.features`, value: (p.i18n?.[l]?.features ?? []).join('\n'), type: 'textarea', rows: 3, hint: t('studio.linesHint'), dir: l === 'ar' ? 'rtl' : 'ltr' }),
    field({ label: t('studio.tAlt'), name: `i18n.${l}.imageAlt`, value: tr(l, 'imageAlt'), dir: l === 'ar' ? 'rtl' : 'ltr' })));

  form.append(
    el('div', { class: 'grid-2' },
      field({ label: t('studio.fTitle'), name: 'title', value: p.title, required: true }),
      field({ label: t('studio.fSlug'), name: 'slug', value: p.slug, hint: t('studio.fSlugHint'), dir: 'ltr' })),
    el('div', { class: 'grid-3' },
      field({ label: t('studio.section'), name: 'section', type: 'select', value: p.section, options: SECTIONS.map((s) => ({ value: s, label: t(`section.${s}`) })) }),
      field({ label: t('studio.status'), name: 'status', type: 'select', value: p.status, options: STATUSES.map((s) => ({ value: s, label: t(`status.${s}`) })) }),
      field({ label: t('studio.type'), name: 'project_type', type: 'select', value: p.project_type, options: TYPES.map((s) => ({ value: s, label: s })) }),
      field({ label: t('studio.category'), name: 'category_id', type: 'select', value: p.category_id ?? '', options: [{ value: '', label: t('studio.none') }, ...cats.map((c) => ({ value: c.id, label: c.name }))] }),
      field({ label: t('studio.visibility'), name: 'visibility', type: 'select', value: p.visibility, options: [{ value: 'hidden', label: t('studio.hidden') }, { value: 'public', label: t('studio.public') }] }),
      field({ label: t('studio.featured'), name: 'featured', type: 'checkbox', value: p.featured })),
    field({ label: t('studio.fShort'), name: 'short_description', value: p.short_description, type: 'textarea', rows: 2 }),
    field({ label: t('studio.fLong'), name: 'description', value: p.description, type: 'textarea', rows: 6, hint: t('studio.fLongHint') }),
    el('div', { class: 'grid-2' },
      field({ label: t('studio.fPlatforms'), name: 'platforms', value: (p.platforms ?? []).join(', '), hint: t('studio.commaHint'), dir: 'ltr' }),
      field({ label: t('studio.fTech'), name: 'technologies', value: (p.technologies ?? []).join(', '), hint: t('studio.commaHint'), dir: 'ltr' })),
    field({ label: t('studio.fFeatures'), name: 'features', value: (p.features ?? []).join('\n'), type: 'textarea', rows: 4, hint: t('studio.linesHint') }),
    imageField({ label: t('studio.fCover'), name: 'cover_image', value: p.cover_image, altName: 'image_alt', altValue: p.image_alt, altLabel: t('studio.fCoverAlt') }),
    el('div', { class: 'grid-2' },
      field({ label: t('studio.fLaunch'), name: 'launch_url', value: p.launch_url, hint: t('studio.fLaunchHint'), dir: 'ltr' }),
      field({ label: t('studio.fDemo'), name: 'demo_url', value: p.demo_url, dir: 'ltr', type: 'url' }),
      field({ label: t('studio.fDownload'), name: 'download_url', value: p.download_url, dir: 'ltr', type: 'url' }),
      field({ label: t('studio.fApk'), name: 'apk_id', value: p.apk_id, dir: 'ltr' })),
    el('fieldset', { class: 'fieldset' }, el('legend', {}, t('studio.gallery')), gallery.node),
    el('details', { class: 'details', open: !!(p.i18n?.ar || p.i18n?.de) }, el('summary', {}, t('studio.translations')), transl));

  const repoBox = p.repo ? el('section', { class: 'card' },
    el('h2', {}, t('studio.repo')),
    el('p', {}, el('a', { href: p.repo.html_url, target: '_blank', rel: 'noopener', dir: 'ltr' }, p.repo.full_name)),
    el('p', { class: 'muted' }, p.repo.description ?? ''),
    el('p', {}, p.repo.language ? badge(`${t('studio.repoLanguage')}: ${p.repo.language}`) : null, ' ',
      p.repo.is_archived ? badge(t('studio.repoArchived'), 'warn') : null, ' ',
      p.repo.status === 'missing' ? badge(t('studio.repoMissing'), 'danger') : null),
    el('button', { type: 'button', class: 'btn', onclick: async (e) => {
      const btn = e.currentTarget;
      if (await confirmDialog({ title: t('studio.unlink'), body: t('studio.unlinkConfirm'), confirmLabel: t('studio.unlink') })) {
        await busy(btn, () => call('github', 'unlink', { project_id: p.id }), t('state.saved')).catch(() => {});
        ctx.rerender();
      }
    } }, t('studio.unlink'))) : null;

  const saveBtn = el('button', { type: 'submit', class: 'btn btn-primary' }, t('action.save'));
  form.append(el('div', { class: 'form-actions' }, saveBtn, el('a', { class: 'btn', href: '#/studio' }, t('action.back'))));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const v = readForm(form);
    const i18n = {};
    for (const l of ['ar', 'de']) {
      const o = {
        description: v[`i18n.${l}.description`].trim(),
        longDescription: v[`i18n.${l}.longDescription`].trim(),
        features: lines(v[`i18n.${l}.features`]),
        imageAlt: v[`i18n.${l}.imageAlt`].trim(),
      };
      Object.keys(o).forEach((k) => ((Array.isArray(o[k]) ? !o[k].length : !o[k]) && delete o[k]));
      if (Object.keys(o).length) i18n[l] = o;
    }
    const fields = {
      title: v.title, section: v.section, status: v.status, project_type: v.project_type,
      category_id: v.category_id || null, visibility: v.visibility, featured: v.featured,
      short_description: v.short_description, description: v.description || null,
      platforms: commas(v.platforms), technologies: commas(v.technologies), features: lines(v.features),
      cover_image: v.cover_image.trim() || null, image_alt: v.image_alt.trim() || null,
      launch_url: v.launch_url.trim() || null, demo_url: v.demo_url.trim() || null,
      download_url: v.download_url.trim() || null, apk_id: v.apk_id.trim() || null, i18n,
    };
    if (v.slug.trim()) fields.slug = v.slug.trim();
    try {
      const saved = await busy(saveBtn, async () => {
        const row = isNew ? await call('projects', 'create', { fields }) : await call('projects', 'update', { id, fields });
        await call('projects', 'set_images', { id: row.id, images: gallery.read() });
        return row;
      }, t('state.saved'));
      if (isNew) location.hash = `#/studio/${saved.id}`;
    } catch { /* toast shown */ }
  });

  return el('div', { class: 'view' },
    el('div', { class: 'view-head' },
      el('h1', {}, isNew ? t('studio.newTitle') : `${t('studio.editTitle')}: ${p.title}`),
      el('a', { class: 'btn', href: '#/studio' }, t('action.back'))),
    !isNew ? el('p', { class: 'muted' }, visBadge(p), ` · ${formatDate(p.updated_at)} · `, t('publish.hint')) : null,
    repoBox,
    form);
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------
export async function categoriesView(_params, ctx) {
  const cats = await call('categories', 'list');
  const row = (c) => {
    const form = el('form', { class: 'cat-row', novalidate: true },
      field({ label: t('categories.name'), name: 'name', value: c?.name, required: true }),
      field({ label: t('categories.nameAr'), name: 'name_ar', value: c?.name_ar, dir: 'rtl' }),
      field({ label: t('categories.nameDe'), name: 'name_de', value: c?.name_de }),
      field({ label: t('categories.slug'), name: 'slug', value: c?.slug, dir: 'ltr' }),
      field({ label: t('categories.order'), name: 'sort_order', value: c?.sort_order ?? 0, type: 'number' }),
      el('div', { class: 'cat-actions' },
        c ? el('span', { class: 'muted' }, `${t('categories.projects')}: ${c.projects}`) : null,
        el('button', { type: 'submit', class: 'btn btn-primary btn-sm' }, c ? t('action.save') : t('action.add')),
        c ? el('button', {
          type: 'button', class: 'btn btn-sm btn-danger-ghost',
          onclick: async (e) => {
            const btn = e.currentTarget;
            if (await confirmDialog({ title: t('categories.confirmDelete', { name: c.name }), body: t('categories.confirmDeleteBody', { n: c.projects }), confirmLabel: t('action.purge'), danger: true })) {
              await busy(btn, () => call('categories', 'delete', { id: c.id }), t('state.saved')).catch(() => {});
              ctx.rerender();
            }
          },
        }, t('action.purge')) : null));
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const v = readForm(form);
      const fields = { name: v.name, name_de: v.name_de || null, name_ar: v.name_ar || null, sort_order: Number.parseInt(v.sort_order, 10) || 0 };
      if (v.slug.trim()) fields.slug = v.slug.trim();
      try {
        await busy(form.querySelector('[type=submit]'), () => (c ? call('categories', 'update', { id: c.id, fields }) : call('categories', 'create', { fields })), t('state.saved'));
        if (!c) ctx.rerender();
      } catch { /* toast shown */ }
    });
    return el('li', { class: 'card' }, form);
  };
  return el('div', { class: 'view' },
    el('h1', {}, t('categories.title')),
    el('section', {}, el('h2', {}, t('categories.add')), el('ul', { class: 'cards' }, row(null))),
    cats.length ? el('ul', { class: 'cards' }, cats.map(row)) : empty());
}

