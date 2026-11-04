# GitHub Integration

King Studio can show any repository of **MOT1209**. GitHub is only ever **read**: no code path writes to GitHub, and removing a project from King Studio never deletes or changes its repository.

## Flow

```
GitHub REST API (read)      api/_lib/github.js  listOwnerRepos()
        │  repos of MOT1209 (owner only, forks of others dropped)
        ▼
kingMatch(): candidate?     "king" at the start of a word in the name or
        │                    description, or topic king / king-studio
        ▼
github_sync_apply()         upsert metadata → github_repositories
        │                    new match: review_state = pending
        ▼
Dashboard → GitHub          owner: Add to King Studio (choose a section) | Ignore
        │
        ▼
studio_projects             a HIDDEN project linked to the repo; the owner
                            edits it and publishes it when ready
```

## What counts as a KING candidate

| Rule | Example that matches | Example that does not |
|---|---|---|
| name has `king` starting a word | `KingAgent`, `King_Browser`, `KINGCODE-IDE`, `king3d-ai`, `kingagent-factory`, `King2-MODLEN`, `KING-SKILLS` | `booking-app`, `walkingdead` |
| description mentions `KING` the same way | "Part of the KING suite" | — |
| topic `king` or `king-studio` | — | — |

A match only puts the repository into **To review**. Nothing is published automatically. Any other repository can still be added by hand: tab **Other repositories → Add to King Studio**, or link it to an existing project.

## Sync

| | Manual | Scheduled |
|---|---|---|
| Trigger | dashboard → GitHub → **Sync now** | Vercel cron, daily at about 03:23 UTC (`vercel.json`) |
| Runs as | the signed-in admin (their JWT) | `api/cron/github-sync.js` with the publishable key + `CRON_SECRET` |
| Authorisation | `requireAdmin()` + `is_admin()` | `Authorization: Bearer CRON_SECRET` (timing-safe), then the hash check in `github_sync_apply()` |
| Afterwards | — | rebuild through the Deploy Hook (unless `CRON_REBUILD=0`) |

- **Duplicates:** prevented by the primary key (GitHub's numeric id), so a renamed repository updates the same row. `studio_projects.github_repo_id` is unique, so a repo appears at most once in the catalogue.
- **Retries:** each GitHub request is tried 3 times with backoff on network errors, 5xx and rate limits. A failed page ends the run as `partial` with the error logged. A partial list never marks repositories missing.
- **Missing or inaccessible repos:** a repo absent from a complete list is marked `missing` and its project stays. Private repos are not marked missing by a token-less (public-only) listing.
- **Archived repos:** flagged in the dashboard, and the public project page shows "archived on GitHub".
- **Logs:** `github_sync_logs`, shown under *Sync history*. Every manual sync is also in the activity log.

## Field-level rules

The sync writes `github_repositories` only. Owner fields (title, descriptions, images, category, section, visibility, order, links, translations) live in `studio_projects` and are never written by the sync; a test covers this. The public page takes from GitHub only the repository link, main language, archived flag, and the description as a fallback when the owner left it empty.

## Tokens

- Without `GITHUB_TOKEN`: public repositories, 60 requests/hour per IP. A sync uses 1 request per 100 repos.
- With `GITHUB_TOKEN`: a fine-grained token, resource owner MOT1209, **Metadata: read-only**. That includes private repositories.

Both are server-side only (Vercel env). The token never reaches the browser or the database.

## Endpoints

`POST /api/admin/github { action }` with action `list | sync | logs | approve {repo_id, section} | ignore | unignore | link {repo_id, project_id} | unlink {project_id} | schedule_status | schedule_enable`.
