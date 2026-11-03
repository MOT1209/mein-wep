import fs from 'node:fs';
import path from 'node:path';

/**
 * Blog post list, read at build time from blog/posts.json (the same file the
 * blog index and api/rss.js read), newest first. The homepage shows the
 * latest few, so it can never link to a post that does not exist.
 */
export default function () {
  const posts = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'blog', 'posts.json'), 'utf8'));
  return posts
    .filter((p) => fs.existsSync(path.join(process.cwd(), 'blog', `${p.id}.njk`)))
    .sort((a, b) => (a.date === b.date ? a.id.localeCompare(b.id) : b.date.localeCompare(a.date)));
}
