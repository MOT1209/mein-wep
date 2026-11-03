// Admin dashboard shell: session check, navigation, language, theme, publish.
import { session, signOut, call } from './api.js';
import { LANGS, applyLang, lang, setLang, t } from './i18n.js';
import { busy, clear, confirmDialog, el, failure, loading } from './ui.js';
import { overviewView, securityView, activityView } from './views-core.js';
import { projectsView, categoriesView } from './views-studio.js';
import { githubView } from './views-github.js';
import { mediaView } from './views-media.js';
import { pagesView, navigationView, settingsView, blogView } from './views-content.js';

const ROUTES = [
  ['overview', overviewView],
  ['studio', projectsView],
  ['github', githubView],
  ['categories', categoriesView],
  ['media', mediaView],
  ['pages', pagesView],
  ['navigation', navigationView],
  ['blog', blogView],
  ['settings', settingsView],
  ['security', securityView],
  ['activity', activityView],
];

const state = { me: null };

const $ = (id) => document.getElementById(id);

function currentRoute() {
  const [name, ...rest] = location.hash.replace(/^#\/?/, '').split('/');
  return { name: ROUTES.some(([n]) => n === name) ? name : 'overview', params: rest };
}

function renderNav() {
  const nav = clear($('nav'));
  const { name } = currentRoute();
  const list = el('ul', { class: 'nav-list' },
    ROUTES.map(([key]) => el('li', {},
      el('a', { href: `#/${key}`, class: 'nav-link', 'aria-current': key === name ? 'page' : false }, t(`nav.${key}`)))),
    el('li', { class: 'nav-sep' }, el('a', { href: '/admin/dashboard.html', class: 'nav-link nav-link-muted' }, t('nav.legacy'))));
  nav.append(el('nav', { 'aria-label': t('app.menu') }, list));
}

function renderHeader() {
  $('brand').textContent = t('app.brand');
  $('skip').textContent = t('app.skip');
  $('who').textContent = state.me?.email ? `${t('app.signedInAs')} ${state.me.email}` : '';
  $('view-site').textContent = t('app.viewSite');
  $('menu-btn').setAttribute('aria-label', t('app.menu'));
  $('theme-btn').setAttribute('aria-label', t('app.theme'));
  $('theme-btn').title = t('app.theme');
  $('publish-btn').textContent = t('publish.button');
  $('publish-btn').title = t('publish.hint');
  $('signout-btn').textContent = t('app.signOut');
  const sel = clear($('lang-select'));
  sel.setAttribute('aria-label', t('app.language'));
  for (const l of LANGS) sel.append(el('option', { value: l.code, selected: l.code === lang() }, l.label));
}

let renderId = 0;
async function render() {
  const id = (renderId += 1);
  const { name, params } = currentRoute();
  const main = clear($('main'));
  renderNav();
  document.body.classList.remove('nav-open');
  $('menu-btn').setAttribute('aria-expanded', 'false');
  const view = ROUTES.find(([n]) => n === name)[1];
  main.append(loading());
  document.title = `${t(`nav.${name}`)} · ${t('app.brand')}`;
  try {
    const content = await view(params, { rerender: render, me: state.me });
    if (id !== renderId) return;
    clear(main).append(content);
  } catch (err) {
    if (id !== renderId) return;
    clear(main).append(failure(err, render));
  }
  main.focus({ preventScroll: true });
}

function setupChrome() {
  $('lang-select').addEventListener('change', (e) => {
    setLang(e.target.value);
    applyLang();
    renderHeader();
    render();
  });
  $('theme-btn').addEventListener('click', () => {
    const root = document.documentElement;
    const dark = root.getAttribute('data-theme') === 'dark'
      || (!root.hasAttribute('data-theme') && matchMedia('(prefers-color-scheme: dark)').matches);
    const next = dark ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch { /* ignore */ }
  });
  $('menu-btn').addEventListener('click', () => {
    const open = document.body.classList.toggle('nav-open');
    $('menu-btn').setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('nav-open')) {
      document.body.classList.remove('nav-open');
      $('menu-btn').setAttribute('aria-expanded', 'false');
      $('menu-btn').focus();
    }
  });
  $('signout-btn').addEventListener('click', async (e) => {
    await busy(e.currentTarget, () => signOut()).catch(() => {});
    location.replace('/admin/login.html?signed_out=1');
  });
  $('publish-btn').addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    const ok = await confirmDialog({ title: t('publish.confirmTitle'), body: t('publish.confirmBody'), confirmLabel: t('publish.button') });
    if (ok) await busy(btn, () => call('publish', 'run'), t('publish.started')).catch(() => {});
  });
  window.addEventListener('hashchange', render);
}

async function start() {
  applyLang();
  let me;
  try {
    me = await session();
  } catch {
    location.replace('/admin/login.html');
    return;
  }
  state.me = me;
  setupChrome();
  renderHeader();
  document.body.classList.add('ready');
  render();
}

start();
