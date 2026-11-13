/**
 * RSS Feed Generator — Vercel Serverless Function
 *
 * Reads blog/posts.json plus the posts published from the admin CMS and
 * generates a valid RSS 2.0 feed (format shared with /blog/rss.xml).
 * Hit: GET https://rashid-wep.vercel.app/api/rss
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE_URL, buildRss, mergePosts } from './_lib/rss.js';
import { supabaseEnv } from './_lib/admin-auth.js';

const API_DIR = path.dirname(fileURLToPath(import.meta.url));

// Posts published from the admin CMS are added at request time: published,
// not deleted, publish date passed (Row Level Security + filters, publishable
// key only). If Supabase is slow or not set up, the feed lists the file
// posts as before.
async function cmsPosts() {
  const env = supabaseEnv();
  if (!env) return [];
  try {
    const now = encodeURIComponent(new Date().toISOString());
    const r = await fetch(`${env.url}/rest/v1/blog_posts?select=slug,title,description,published_at,categories&status=eq.published&deleted_at=is.null&published_at=lte.${now}&order=published_at.desc&limit=50`, {
      headers: { apikey: env.anonKey, Accept: 'application/json' },
      signal: AbortSignal.timeout(2500),
    });
    if (!r.ok) {
      console.warn('rss: CMS posts unavailable, status', r.status);
      return [];
    }
    const rows = await r.json();
    return rows
      .filter((p) => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.slug ?? ''))
      .map((p) => ({ id: p.slug, title: p.title, description: p.description ?? '', published_at: p.published_at, date: String(p.published_at).slice(0, 10), categories: p.categories ?? [] }));
  } catch (err) {
    console.warn('rss: CMS posts unavailable:', err.name);
    return [];
  }
}

export default async function(req, res) {
  try {
    const postsPath = path.join(API_DIR, '..', 'blog', 'posts.json');
    const posts = JSON.parse(fs.readFileSync(postsPath, 'utf-8'));
    const xml = buildRss(mergePosts(posts, await cmsPosts()), { self: SITE_URL + '/api/rss', zone: 'GMT' });

    res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.status(200).send(xml);
  } catch (err) {
    console.error('rss: feed generation failed:', err.message);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.status(500).send('<?xml version="1.0"?><error>Failed to generate RSS feed.</error>');
  }
};
