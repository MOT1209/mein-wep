/**
 * Reads the owner's repositories from the GitHub REST API for the sync.
 *
 * GITHUB_TOKEN (optional, server-side only): a fine-grained token with
 * read-only "Metadata" access. With it the list includes private repos and
 * the rate limit is per token; without it only public repos are listed.
 */

export const GITHUB_OWNER = 'MOT1209';
const API = 'https://api.github.com';
const MAX_PAGES = 10;
const ATTEMPTS = 3;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Why a repository looks like a KING project, or null. A candidate is only a
 * suggestion: it waits in "pending" until the owner approves it. "king" must
 * start a word, so "booking" or "walking" never match.
 */
export function kingMatch(repo) {
  const word = /(^|[^a-z])king/i;
  if (word.test(repo.name || '')) return 'name contains KING';
  if (word.test(repo.description || '')) return 'description mentions KING';
  if ((repo.topics || []).some((t) => /^king(-studio)?$/i.test(t))) return 'has a KING topic';
  return null;
}

export function normalizeRepo(r) {
  const repo = {
    id: r.id,
    full_name: r.full_name,
    name: r.name,
    description: r.description ?? null,
    html_url: r.html_url,
    homepage: r.homepage || null,
    language: r.language ?? null,
    topics: Array.isArray(r.topics) ? r.topics.slice(0, 30) : [],
    default_branch: r.default_branch ?? null,
    is_private: !!r.private,
    is_archived: !!r.archived,
    is_fork: !!r.fork,
    stars: r.stargazers_count ?? 0,
    gh_created_at: r.created_at ?? null,
    gh_pushed_at: r.pushed_at ?? null,
    gh_updated_at: r.updated_at ?? null,
  };
  repo.match_reason = kingMatch(repo);
  return repo;
}

async function ghFetch(url, token) {
  let last;
  for (let i = 0; i < ATTEMPTS; i += 1) {
    try {
      const r = await fetch(url, {
        headers: {
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'User-Agent': 'rashid-wep-cms-sync',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        signal: AbortSignal.timeout(8000),
      });
      if (r.ok) return r;
      const limited = r.status === 429 || (r.status === 403 && r.headers.get('x-ratelimit-remaining') === '0');
      if (r.status >= 500 || limited) {
        last = new Error(limited ? 'GitHub rate limit reached' : `GitHub ${r.status}`);
        await sleep(400 * 2 ** i);
        continue;
      }
      throw Object.assign(new Error(`GitHub ${r.status}`), { fatal: true });
    } catch (err) {
      if (err.fatal) throw err;
      last = err;
      await sleep(400 * 2 ** i);
    }
  }
  throw last;
}

/**
 * All repositories owned by GITHUB_OWNER. Returns { repos, complete, error }:
 * `complete` is false when a page failed, so the sync never marks repos
 * "missing" from a partial list.
 */
export async function listOwnerRepos({ token = process.env.GITHUB_TOKEN } = {}) {
  const repos = [];
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const url = token
      ? `${API}/user/repos?affiliation=owner&per_page=100&page=${page}&sort=full_name`
      : `${API}/users/${GITHUB_OWNER}/repos?type=owner&per_page=100&page=${page}&sort=full_name`;
    let r;
    try {
      r = await ghFetch(url, token);
    } catch (err) {
      return { repos, complete: false, error: err.message };
    }
    const batch = await r.json();
    if (!Array.isArray(batch)) return { repos, complete: false, error: 'Unexpected GitHub response' };
    for (const item of batch) {
      if (item?.owner?.login?.toLowerCase() === GITHUB_OWNER.toLowerCase()) repos.push(normalizeRepo(item));
    }
    if (batch.length < 100) return { repos, complete: true, error: null };
  }
  return { repos, complete: false, error: `More than ${MAX_PAGES * 100} repositories` };
}
