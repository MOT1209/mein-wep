// GitHub: sync, review queue, approved/linked repos, other and ignored repos.
import { call } from './api.js';
import { t } from './i18n.js';
import { badge, busy, clear, el, empty, formatDate, toast } from './ui.js';

const SECTIONS = ['labs', 'apps', 'games'];
// Reasons as written by api/_lib/github.js kingMatch().
const REASONS = {
  'name contains KING': 'github.rName',
  'description mentions KING': 'github.rDescription',
  'has a KING topic': 'github.rTopic',
};
const TABS = [
  ['pending', (r) => r.review_state === 'pending' && !r.project],
  ['approved', (r) => !!r.project || r.review_state === 'approved'],
  ['other', (r) => r.review_state === 'unmatched' && !r.project],
  ['ignored', (r) => r.review_state === 'ignored' && !r.project],
];

export async function githubView(_params, ctx) {
  const [repos, schedule, logs] = await Promise.all([
    call('github', 'list'),
    call('github', 'schedule_status'),
    call('github', 'logs'),
  ]);
  let tab = repos.some(TABS[0][1]) ? 'pending' : 'approved';
  const listBox = el('div');
  const tabBar = el('div', { class: 'tabs', role: 'tablist', 'aria-label': t('github.title') });

  function repoCard(r) {
    const sectionSel = el('select', { class: 'input input-sm', 'aria-label': t('github.approveAs') },
      SECTIONS.map((s) => el('option', { value: s }, t(`section.${s}`))));
    const act = (fn, msg) => async (e) => {
      await busy(e.currentTarget, fn, msg).catch(() => {});
      ctx.rerender();
    };
    const actions = [];
    if (r.project) {
      actions.push(el('a', { class: 'btn btn-sm btn-primary', href: `#/studio/${r.project.id}` }, `${t('github.inStudio')} ${r.project.slug}`));
    } else if (r.review_state === 'ignored') {
      actions.push(el('button', { type: 'button', class: 'btn btn-sm', onclick: act(() => call('github', 'unignore', { repo_id: r.id })) }, t('github.unignore')));
    } else {
      actions.push(sectionSel,
        el('button', { type: 'button', class: 'btn btn-sm btn-primary', onclick: act(() => call('github', 'approve', { repo_id: r.id, section: sectionSel.value }), t('github.approved')) }, t('github.approve')),
        el('button', { type: 'button', class: 'btn btn-sm', onclick: act(() => call('github', 'ignore', { repo_id: r.id })) }, t('github.ignore')));
    }
    return el('li', { class: 'row' },
      el('div', { class: 'row-main' },
        el('div', {},
          el('p', { class: 'row-title' }, el('a', { href: r.html_url, target: '_blank', rel: 'noopener', dir: 'ltr' }, r.full_name)),
          r.description ? el('p', { class: 'muted' }, r.description) : null,
          el('p', { class: 'row-meta' },
            r.language ? badge(r.language) : null, ' ',
            r.is_private ? badge(t('github.private')) : null, ' ',
            r.is_fork ? badge(t('github.fork')) : null, ' ',
            r.is_archived ? badge(t('github.archived'), 'warn') : null, ' ',
            r.status === 'missing' ? badge(t('github.missing'), 'danger') : null, ' ',
            r.match_reason ? el('span', { class: 'muted' }, `${t('github.reason')}: ${REASONS[r.match_reason] ? t(REASONS[r.match_reason]) : r.match_reason}`) : null, ' ',
            el('span', { class: 'muted' }, `· ${t('github.updated')} ${formatDate(r.gh_pushed_at)}`)))),
      el('div', { class: 'row-actions' }, actions));
  }

  function draw() {
    clear(tabBar);
    for (const [key, test] of TABS) {
      const n = repos.filter(test).length;
      tabBar.append(el('button', {
        type: 'button', role: 'tab', class: 'tab', 'aria-selected': String(key === tab),
        onclick: () => { tab = key; draw(); },
      }, `${t(`github.tab${key[0].toUpperCase()}${key.slice(1)}`)} (${n})`));
    }
    const rows = repos.filter(TABS.find(([k]) => k === tab)[1]);
    clear(listBox).append(rows.length ? el('ul', { class: 'rows', role: 'tabpanel' }, rows.map(repoCard)) : empty(t('github.noRepos')));
  }

  const syncBtn = el('button', {
    type: 'button', class: 'btn btn-primary',
    onclick: async (e) => {
      const r = await busy(e.currentTarget, () => call('github', 'sync')).catch(() => null);
      if (r) {
        const msg = t('github.synced', { seen: r.repos_seen, fresh: r.new_candidates, missing: r.missing });
        toast(r.error ? `${msg} (${r.error})` : msg, r.error ? 'error' : 'ok');
        ctx.rerender();
      }
    },
  }, t('github.sync'));

  const scheduleOn = schedule.storedSecret?.configured && schedule.cronSecret;
  const scheduleBox = el('section', { class: 'card' },
    el('h2', {}, t('github.schedule')),
    el('p', {}, badge(scheduleOn ? t('github.scheduleOn') : t('github.scheduleOff'), scheduleOn ? 'ok' : 'warn')),
    !schedule.cronSecret ? el('p', { class: 'muted' }, t('github.scheduleNeedsSecret')) : null,
    schedule.cronSecret ? el('button', {
      type: 'button', class: 'btn',
      onclick: async (e) => { await busy(e.currentTarget, () => call('github', 'schedule_enable'), t('state.saved')).catch(() => {}); ctx.rerender(); },
    }, t('github.scheduleEnable')) : null,
    el('h3', {}, t('github.token')),
    el('p', {}, badge(schedule.githubToken ? t('github.tokenOn') : t('github.tokenOff'), schedule.githubToken ? 'ok' : '')));

  const last = logs[0];
  const logBox = el('section', { class: 'card' },
    el('h2', {}, t('github.logs')),
    logs.length ? el('ul', { class: 'plain-list' }, logs.slice(0, 8).map((l) => el('li', {},
      badge(l.status, l.status === 'success' ? 'ok' : 'warn'), ' ', formatDate(l.started_at), ` · ${l.trigger} · ${l.repos_seen} / +${l.new_candidates} / −${l.missing}`,
      l.error ? el('span', { class: 'muted' }, ` · ${l.error}`) : null))) : empty(t('overview.never')));

  draw();
  return el('div', { class: 'view' },
    el('div', { class: 'view-head' }, el('h1', {}, t('github.title')), syncBtn),
    el('p', { class: 'lede' }, t('github.intro')),
    el('p', { class: 'muted' }, `${t('github.lastSync')}: ${last ? formatDate(last.started_at) : t('overview.never')}`),
    tabBar,
    listBox,
    el('div', { class: 'grid-2' }, scheduleBox, logBox));
}
