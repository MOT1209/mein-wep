// Overview, security and activity views.
import { call } from './api.js';
import { t } from './i18n.js';
import { badge, busy, el, empty, formatDate } from './ui.js';

const stat = (label, value, href) => el(href ? 'a' : 'div', { class: 'stat', href },
  el('span', { class: 'stat-value' }, String(value)), el('span', { class: 'stat-label' }, label));

export async function overviewView() {
  const [d, siteUp] = await Promise.all([
    call('overview', 'get'),
    fetch('/', { method: 'HEAD', cache: 'no-store' }).then((r) => r.ok).catch(() => false),
  ]);
  const p = d.projects;
  const sync = d.github.lastSync;
  return el('div', { class: 'view' },
    el('h1', {}, t('overview.title')),
    el('div', { class: 'stats' },
      stat(t('overview.total'), p.total, '#/studio'),
      stat(t('overview.published'), p.published, '#/studio'),
      stat(t('overview.hidden'), p.hidden, '#/studio'),
      stat(t('overview.inDevelopment'), p.inDevelopment, '#/studio'),
      stat(t('overview.featured'), p.featured, '#/studio'),
      stat(t('overview.trash'), p.trash, '#/studio'),
      stat(t('overview.pending'), d.github.pending, '#/github'),
      stat(t('overview.posts'), d.posts.published, '#/blog'),
      stat(t('overview.drafts'), d.posts.drafts, '#/blog')),
    el('div', { class: 'grid-2' },
      el('section', { class: 'card' },
        el('h2', {}, t('overview.siteStatus')),
        el('dl', { class: 'facts' },
          el('div', {}, el('dt', {}, t('overview.siteStatus')), el('dd', {}, siteUp ? badge(t('overview.siteUp'), 'ok') : badge(t('overview.siteDown'), 'danger'))),
          el('div', {}, el('dt', {}, t('overview.lastPublish')), el('dd', {}, d.lastPublish ? formatDate(d.lastPublish.created_at) : t('overview.never'))),
          el('div', {}, el('dt', {}, t('overview.lastSync')), el('dd', {},
            sync ? [formatDate(sync.started_at), ' ', badge(sync.status, sync.status === 'success' ? 'ok' : 'warn')] : t('overview.never'))))),
      el('section', { class: 'card' },
        el('h2', {}, t('overview.config')),
        el('ul', { class: 'checklist' },
          [['configDeployHook', d.config.deployHook], ['configGithubToken', d.config.githubToken], ['configCron', d.config.cronSecret]]
            .map(([k, on]) => el('li', {}, badge(on ? t('overview.ok') : t('overview.missing'), on ? 'ok' : 'warn'), ' ', t(`overview.${k}`)))))),
    el('div', { class: 'grid-2' },
      el('section', { class: 'card' },
        el('h2', {}, t('overview.recent')),
        d.recentlyChanged.length
          ? el('ul', { class: 'plain-list' }, d.recentlyChanged.map((r) => el('li', {},
            el('a', { href: `#/studio/${r.id}` }, r.title), ' ', badge(r.visibility === 'public' ? t('studio.public') : t('studio.hidden'), r.visibility === 'public' ? 'ok' : ''),
            el('span', { class: 'muted' }, ` · ${formatDate(r.updated_at)}`))))
          : empty()),
      el('section', { class: 'card' },
        el('h2', {}, t('overview.activity')),
        d.activity.length ? activityList(d.activity) : empty(t('activity.none')))));
}

function activityList(rows) {
  return el('ul', { class: 'plain-list' }, rows.map((a) => el('li', {},
    el('span', { class: 'mono' }, a.action), ' · ', a.entity, a.details?.slug ? ` · ${a.details.slug}` : '',
    el('span', { class: 'muted' }, ` · ${formatDate(a.created_at)}`))));
}

export async function securityView(_params, { me }) {
  const sendReset = async (e) => {
    const btn = e.currentTarget;
    await busy(btn, async () => {
      const cfg = await fetch('/api/admin/config', { cache: 'no-store' }).then((r) => r.json());
      const redirect = `${location.origin}/admin/reset-password.html`;
      const r = await fetch(`${cfg.supabaseUrl}/auth/v1/recover?redirect_to=${encodeURIComponent(redirect)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: cfg.anonKey },
        body: JSON.stringify({ email: me.email }),
      });
      if (r.status === 429) throw new Error('429');
    }, t('security.resetSent'));
  };
  return el('div', { class: 'view' },
    el('h1', {}, t('security.title')),
    el('p', { class: 'lede' }, t('security.howProtected')),
    el('div', { class: 'grid-2' },
      el('section', { class: 'card' },
        el('h2', {}, t('security.account')),
        el('dl', { class: 'facts' },
          el('div', {}, el('dt', {}, t('app.signedInAs')), el('dd', { dir: 'ltr' }, me?.email ?? '—')),
          el('div', {}, el('dt', {}, t('security.expires')), el('dd', {}, me?.expiresAt ? formatDate(new Date(me.expiresAt * 1000).toISOString()) : '—'))),
        el('h3', {}, t('security.reset')),
        el('p', { class: 'muted' }, t('security.resetBody')),
        el('button', { type: 'button', class: 'btn', onclick: sendReset }, t('security.reset'))),
      el('section', { class: 'card' },
        el('h2', {}, t('security.checklist')),
        el('ul', { class: 'checklist' }, ['c1', 'c2', 'c3', 'c4'].map((k) => el('li', {}, t(`security.${k}`)))))));
}

export async function activityView() {
  const rows = await call('activity', 'list', { limit: 50 });
  const body = el('tbody');
  const addRows = (list) => {
    for (const a of list) {
      body.append(el('tr', {},
        el('td', {}, formatDate(a.created_at)),
        el('td', { dir: 'ltr' }, a.actor_email ?? '—'),
        el('td', {}, el('span', { class: 'mono' }, a.action)),
        el('td', {}, `${a.entity}${a.details?.slug ? ` · ${a.details.slug}` : a.entity_id ? ` · ${String(a.entity_id).slice(0, 40)}` : ''}`)));
    }
  };
  addRows(rows);
  let last = rows.at(-1)?.id;
  const more = el('button', {
    type: 'button', class: 'btn', hidden: rows.length < 50,
    onclick: async (e) => {
      const next = await busy(e.currentTarget, () => call('activity', 'list', { limit: 50, before: last }));
      addRows(next);
      last = next.at(-1)?.id;
      if (next.length < 50) e.currentTarget.hidden = true;
    },
  }, t('activity.more'));
  return el('div', { class: 'view' },
    el('h1', {}, t('activity.title')),
    rows.length
      ? el('div', { class: 'table-wrap' }, el('table', { class: 'table' },
        el('thead', {}, el('tr', {}, ['when', 'who', 'what', 'item'].map((k) => el('th', { scope: 'col' }, t(`activity.${k}`))))), body))
      : empty(t('activity.none')),
    more);
}
