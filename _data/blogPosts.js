import fs from 'node:fs';
import path from 'node:path';
import { cmsBlogPosts } from '../scripts/cms/source.mjs';

/**
 * Blog post list, newest first: the posts written as files (blog/posts.json,
 * the same file the blog index and api/rss.js read) plus the posts published
 * from the admin CMS (scripts/cms/source.mjs). The homepage shows the latest
 * few, so it can never link to a post that does not exist.
 */
export default function () {
  const files = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'blog', 'posts.json'), 'utf8'))
    .filter((p) => fs.existsSync(path.join(process.cwd(), 'blog', `${p.id}.njk`)));
  const taken = new Set(files.map((p) => p.id));
  const fromCms = cmsBlogPosts().filter((p) => !taken.has(p.id));
  return [...files, ...fromCms]
    .sort((a, b) => (a.date === b.date ? a.id.localeCompare(b.id) : b.date.localeCompare(a.date)));
}
