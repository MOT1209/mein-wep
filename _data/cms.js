import { cmsBlogPosts, cmsCache } from '../scripts/cms/source.mjs';

/**
 * Editable site content from the admin dashboard, for the templates.
 * Every value is optional: a template uses it when present and falls back to
 * the text built into the site (_data/i18n, site.json) otherwise, so a build
 * without the CMS renders exactly the old pages.
 *
 *   cms.pages.<page>.<locale>.<field>   page texts (home, studio, about, contact, footer)
 *   cms.nav                             menu items, or null -> site.siteNav
 *   cms.siteName, cms.contactEmail, cms.social
 *   cms.blog                            published database posts
 */
const LOCALES = ['en', 'de', 'ar'];
const PAGES = ['home', 'studio', 'about', 'contact', 'footer'];
const https = (u) => typeof u === 'string' && /^https:\/\/[a-z0-9.-]+(:\d+)?(\/|$|\?|#)/i.test(u) && !/\s/.test(u);
const sitePath = (u) => u === '' || (typeof u === 'string' && !u.includes(':') && !u.startsWith('//') && !/\s/.test(u));

export default function () {
  const c = cmsCache();
  const pages = Object.fromEntries(PAGES.map((p) => [p, Object.fromEntries(LOCALES.map((l) => [l, {}]))]));
  for (const row of c?.pages ?? []) {
    if (pages[row.page_key]?.[row.locale] && row.content && typeof row.content === 'object') {
      pages[row.page_key][row.locale] = row.content;
    }
  }
  // Homepage extras, prepared here because Nunjucks cannot build lists in a
  // loop: up to four "What I do" cards from serviceNTitle/serviceNText, and a
  // photo that is only used when it is an https:// link or a site path.
  for (const l of LOCALES) {
    const h = { ...pages.home[l] };
    h.services = [
      ['service1Title', 'service1Text'], ['service2Title', 'service2Text'],
      ['service3Title', 'service3Text'], ['service4Title', 'service4Text'],
    ]
      .map(([title, text]) => ({ title: h[title], text: h[text] }))
      .filter((s) => typeof s.title === 'string' && s.title.trim());
    if (h.photo !== undefined && !(https(h.photo) || (sitePath(h.photo) && h.photo !== '' && !h.photo.startsWith('/')))) delete h.photo;
    if (h.skills !== undefined && !Array.isArray(h.skills)) delete h.skills;
    pages.home[l] = h;
  }
  // One photo for every language: a language without its own uses the first
  // one set (English, then Arabic, then German). photoExternal tells the
  // template whether to prefix the site root, using the same (case-
  // insensitive) https test as the check above.
  const sharedPhoto = ['en', 'ar', 'de'].map((l) => pages.home[l].photo).find(Boolean);
  for (const l of LOCALES) {
    const h = pages.home[l];
    if (!h.photo && sharedPhoto) h.photo = sharedPhoto;
    h.photoExternal = !!h.photo && https(h.photo);
  }

  const nav = c?.nav?.length
    ? c.nav
      .filter((n) => sitePath(n.href) || https(n.href))
      .map((n) => ({ key: n.nav_key, href: n.href, labels: { en: n.label, de: n.label_de || null, ar: n.label_ar || null } }))
    : null;

  const setting = (k) => c?.settings?.[k]?.value;
  const email = setting('contact.email');
  const social = (Array.isArray(setting('social.links')) ? setting('social.links') : [])
    .filter((s) => s && typeof s.label === 'string' && s.label.trim() && https(s.url))
    .slice(0, 12)
    .map((s) => ({ label: s.label.trim().slice(0, 40), url: s.url }));

  return {
    live: !!c,
    pages,
    nav,
    siteName: typeof setting('site.name') === 'string' && setting('site.name').trim() ? setting('site.name').trim().slice(0, 60) : null,
    contactEmail: typeof email === 'string' && /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(email) ? email : null,
    social,
    blog: cmsBlogPosts(),
  };
}
