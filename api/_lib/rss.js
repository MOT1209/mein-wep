/**
 * RSS 2.0 for the blog, shared by the static feed (blog/rss.njk →
 * /blog/rss.xml, built with _data/rssFeed.js) and the live endpoint
 * (api/rss.js → /api/rss). Posts: { id, title, description, date
 * (YYYY-MM-DD), published_at? (ISO, CMS posts), categories }.
 */
export const SITE_URL = 'https://rashid-wep.vercel.app';
export const BLOG_URL = `${SITE_URL}/blog`;

export function escapeXml(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const when = (p) => new Date(p.published_at || `${p.date}T00:00:00Z`);

/** Newest first; a CMS post never replaces a file post with the same id. */
export function mergePosts(filePosts, cmsPosts = []) {
  const taken = new Set(filePosts.map((p) => p.id));
  return [...filePosts, ...cmsPosts.filter((p) => !taken.has(p.id))]
    .sort((a, b) => when(b) - when(a) || String(a.id).localeCompare(String(b.id)));
}

/**
 * @param {object[]} posts  newest first
 * @param {{ self: string, zone?: 'GMT' | '+0000' }} opts
 */
export function buildRss(posts, { self, zone = 'GMT' }) {
  const fmt = (d) => (zone === 'GMT' ? d.toUTCString() : d.toUTCString().replace(/GMT$/, zone));
  const items = posts.map((p) => {
    const url = `${BLOG_URL}/${p.id}.html`;
    const cats = (p.categories ?? []).map((c) => `      <category>${escapeXml(c)}</category>`).join('\n');
    return '    <item>\n'
      + `      <title>${escapeXml(p.title)}</title>\n`
      + `      <link>${escapeXml(url)}</link>\n`
      + `      <description>${escapeXml(p.description)}</description>\n`
      + `      <pubDate>${fmt(when(p))}</pubDate>\n`
      + `      <guid>${escapeXml(url)}</guid>\n`
      + `${cats}${cats ? '\n' : ''}`
      + '    </item>';
  }).join('\n\n');
  const lastBuild = posts.length ? fmt(when(posts[0])) : fmt(new Date());
  return '<?xml version="1.0" encoding="UTF-8"?>\n'
    + '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n'
    + '  <channel>\n'
    + '    <title>Rashid Blog</title>\n'
    + `    <link>${BLOG_URL}/</link>\n`
    + '    <description>Articles on web development, game dev with Three.js, AI integration, and open-source projects.</description>\n'
    + '    <language>en</language>\n'
    + `    <lastBuildDate>${lastBuild}</lastBuildDate>\n`
    + `    <atom:link href="${self}" rel="self" type="application/rss+xml"/>\n\n`
    + `${items}\n`
    + '  </channel>\n'
    + '</rss>';
}
