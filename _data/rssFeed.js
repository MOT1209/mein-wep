import fs from 'node:fs';
import path from 'node:path';
import { cmsBlogPosts } from '../scripts/cms/source.mjs';
import { SITE_URL, buildRss, mergePosts } from '../api/_lib/rss.js';

/**
 * The static feed at /blog/rss.xml (blog/rss.njk): the posts in
 * blog/posts.json plus the posts published from the admin CMS, built with the
 * same code as the live /api/rss.
 */
export default function () {
  const files = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'blog', 'posts.json'), 'utf8'));
  return buildRss(mergePosts(files, cmsBlogPosts()), { self: `${SITE_URL}/blog/rss.xml`, zone: '+0000' });
}
