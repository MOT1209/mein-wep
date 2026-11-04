// Contact messages and app update notices (moved from the older dashboard).
import { call } from './api.js';
import { t } from './i18n.js';
import { badge, busy, confirmDialog, el, empty, field, formatDate, readForm } from './ui.js';

export async function messagesView(_params, ctx) {
  const rows = await call('messages', 'list');
  return el('div', { class: 'view' },
    el('h1', {}, t('messages.title')),
    el('p', { class: 'muted' }, t('messages.hint')),
    rows.length ? el('ul', { class: 'rows' }, rows.map((m) => el('li', { class: 'row row-stack' },
      el('div', { class: 'row-main' }, el('div', {},
        el('p', { class: 'row-title' }, el('bdi', {}, m.name), ' · ', el('a', { href: `mailto:${encodeURIComponent(m.email)}`, dir: 'ltr' }, m.email)),
        el('p', { class: 'muted' }, formatDate(m.created_at)),
        el('p', { class: 'message-body', dir: 'auto' }, m.message))),
      el('div', { class: 'row-actions' },
        el('a', { class: 'btn btn-sm btn-primary', href: `mailto:${encodeURIComponent(m.email)}?subject=${encodeURIComponent('Re: your message')}` }, t('messages.reply')),
        el('button', {
          type: 'button', class: 'btn btn-sm btn-danger-ghost',
          onclick: async (e) => {
            const btn = e.currentTarget;
            if (await confirmDialog({ title: t('messages.confirmDelete', { name: m.name }), body: t('messages.confirmDeleteBody'), confirmLabel: t('action.purge'), danger: true })) {
              await busy(btn, () => call('messages', 'delete', { id: m.id }), t('state.saved')).catch(() => {});
              ctx.rerender();
            }
          },
        }, t('action.purge'))))))
      : empty(t('messages.none')));
}

const APPS = [
  ['com.rashid.kingcraft', 'KingCraft'], ['com.rashid.rustsurvival', 'Rust Construction'],
  ['com.rashid.farmempire', 'Farm Empire'], ['com.rashid.quranpro', 'Quran Pro'],
  ['com.rashid.smartvault', 'Calculator Vault'], ['com.rashid.quizmaster', 'Quiz Master'],
];

export async function updatesView(_params, ctx) {
  const rows = await call('updates', 'list');
  const byId = Object.fromEntries(rows.map((r) => [r.app_id, r]));
  const ids = [...new Set([...APPS.map(([id]) => id), ...rows.map((r) => r.app_id)])];
  const nameOf = (id) => byId[id]?.name || APPS.find(([a]) => a === id)?.[1] || id;
  const form = (id) => {
    const r = byId[id] ?? {};
    const f = el('form', { class: 'card form', novalidate: true },
      el('h2', {}, nameOf(id), ' ', r.version ? badge(`v${r.version}`, 'ok') : badge(t('updates.none'))),
      el('p', { class: 'muted mono', dir: 'ltr' }, id),
      el('div', { class: 'grid-2' },
        field({ label: t('updates.version'), name: 'version', value: r.version, dir: 'ltr', required: true }),
        field({ label: t('updates.date'), name: 'release_date', value: r.release_date, type: 'date' })),
      field({ label: t('updates.url'), name: 'url', value: r.url, dir: 'ltr', hint: t('updates.urlHint') }),
      field({ label: t('updates.notes'), name: 'notes', value: r.notes, type: 'textarea', rows: 3, hint: t('studio.linesHint'), dir: 'auto' }),
      el('div', { class: 'form-actions' }, el('button', { type: 'submit', class: 'btn btn-primary' }, t('updates.publish'))));
    f.addEventListener('submit', async (e) => {
      e.preventDefault();
      const v = readForm(f);
      await busy(f.querySelector('[type=submit]'), () => call('updates', 'save', {
        app_id: id, name: nameOf(id), version: v.version.trim(), url: v.url.trim() || null,
        notes: v.notes.trim() || null, release_date: v.release_date || null,
      }), t('updates.saved')).catch(() => {});
      ctx.rerender();
    });
    return f;
  };
  return el('div', { class: 'view' },
    el('h1', {}, t('updates.title')),
    el('p', { class: 'muted' }, t('updates.hint')),
    el('div', { class: 'grid-2' }, ids.map(form)));
}
