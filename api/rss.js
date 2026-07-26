/**
 * RSS Feed Generator — Vercel Serverless Function
 *
 * Reads blog/posts.json and generates a valid RSS 2.0 feed automatically.
 * Hit: GET https://rashid-wep.vercel.app/api/rss
 */

const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://rashid-wep.vercel.app';
const BLOG_URL = SITE_URL + '/blog';

function escapeXml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildRss(posts) {
  const items = posts.map(function(p) {
    const pubDate = new Date(p.date + 'T00:00:00Z').toUTCString();
    const url = BLOG_URL + '/' + p.id + '.html';
    const cats = p.categories.map(function(c) { return '      <category>' + escapeXml(c) + '</category>'; }).join('\n');
    return '    <item>\n' +
      '      <title>' + escapeXml(p.title) + '</title>\n' +
      '      <link>' + escapeXml(url) + '</link>\n' +
      '      <description>' + escapeXml(p.description) + '</description>\n' +
      '      <pubDate>' + pubDate + '</pubDate>\n' +
      '      <guid>' + escapeXml(url) + '</guid>\n' +
      cats + '\n' +
      '    </item>';
  }).join('\n\n');

  const lastBuild = posts.length > 0
    ? new Date(posts[0].date + 'T00:00:00Z').toUTCString()
    : new Date().toUTCString();

  return '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n' +
    '  <channel>\n' +
    '    <title>Rashid Blog</title>\n' +
    '    <link>' + BLOG_URL + '/</link>\n' +
    '    <description>Articles on web development, game dev with Three.js, AI integration, and open-source projects.</description>\n' +
    '    <language>en</language>\n' +
    '    <lastBuildDate>' + lastBuild + '</lastBuildDate>\n' +
    '    <atom:link href="' + SITE_URL + '/api/rss" rel="self" type="application/rss+xml"/>\n\n' +
    items + '\n' +
    '  </channel>\n' +
    '</rss>';
}

module.exports = function(req, res) {
  try {
    const postsPath = path.join(__dirname, '..', 'blog', 'posts.json');
    const raw = fs.readFileSync(postsPath, 'utf-8');
    const posts = JSON.parse(raw);
    posts.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });

    const xml = buildRss(posts);
    res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.status(200).send(xml);
  } catch (err) {
    res.status(500).send('<?xml version="1.0"?><error>Failed to generate RSS feed.</error>');
  }
};
