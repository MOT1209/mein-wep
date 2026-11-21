# APK hosting — migrating off Git

## Why
`apks/*.apk` is tracked in Git. Every APK version added to the repo stays in `.git` history
forever — binaries don't delta-compress, so `.git` only grows. As of 2026-09-21 the tree holds
6 current APKs (~31MB) and `.git` itself is ~110MB. GitHub Releases hosts binaries outside the
Git object store with stable download URLs, at no history cost.

Git LFS was considered and rejected for this repo: it still requires a history rewrite to
reclaim the space already spent, forces a disruptive force-push, and adds a fetch dependency to
every checkout/build. Releases needs none of that.

## One-time setup (do this, then tell Claude the release exists)
This step needs a human with push access. Claude Code's *interactive session* has no
release-creation or asset-upload tool in this environment (verified — only read tools like
`list_releases`/`get_release_by_tag` exist); only `gh`/the REST API can do it, and a human has
that. CI's own token can (see "Every future app update" below) — but that only covers builds
`apk-build.yml` triggers going forward, not this one-time migration of the 6 files already
sitting in `apks/` today.

1. Go to **github.com/MOT1209/mein-wep → Releases → Draft a new release**.
2. Tag: `apks-latest` (not tied to a git ref/branch — this is just an asset bucket, not a
   version marker for the repo itself).
3. Title: `APK downloads`. Body: link back to `downloads.html` for context.
4. Upload all 6 current files from `apks/` as release assets, unchanged filenames:
   - `calculator-app-v1.0.1.apk`
   - `farm-game-v2.5.0.apk`
   - `kingcraft-game-v0.6.0.apk`
   - `quiz-app-v1.4.1.apk`
   - `quran-app-v1.0.1.apk`
   - `rust-game-v1.1.0.apk`
5. Publish the release (not a draft — draft assets aren't publicly downloadable).

Resulting asset URLs follow this fixed pattern:
```
https://github.com/MOT1209/mein-wep/releases/download/apks-latest/<filename>.apk
```

## Every future app update — now automatic
`.github/workflows/apk-build.yml` used to `git commit`+push each freshly built APK straight
into `apks/`, which is exactly what re-grew the repo after every cleanup. As of the
`apk-build.yml` fix, its "Publish APK to GitHub Release" step instead runs
`gh release upload apks-latest <file> --clobber` (creating the `apks-latest` release first if
it doesn't exist yet) and writes the resulting Release URL into that project's own
`version.json` (`apkUrl` + `buildNumber`). **No `.apk` file reaches git from that workflow any
more.** This uses the workflow's own `GITHUB_TOKEN` (`gh` is preinstalled on GitHub-hosted
runners, and the token already has the `contents: write` permission Releases need) — a
capability Claude Code does not have from this environment (see below).

**What this does NOT do automatically**, so don't assume it: it doesn't touch
`apks/updates.json` or `downloads.html`'s hardcoded `apkUrl`/`sha256` values — those still
need a manual update (or a future automation) to point at the new asset and its recomputed
hash before a new version shows up for site visitors. Check `<project>/version.json` after a
build to get the live URL to copy in.

## Release gating — only fully qualified builds get published
`scripts/apk-release-policy.mjs` (covered by `tests/apk-signing-policy.test.mjs`) decides what
a build is allowed to become. The workflow runs its checks as steps —
`policy → select → verify → continuity → meta → gate` — and only a build that passes **all** of
these reaches the `apks-latest` release and gets its `version.json` committed:

1. **mode=release** — `KEYSTORE_BASE64` + `KEYSTORE_PASSWORD` secrets are configured.
   Without them the build runs in **test mode**: signed with an ephemeral key and a random
   (masked) password, uploaded as a 7-day `TEST-BUILD-…` workflow artifact only, and
   **never** published or committed.
2. **Selected APK** — the candidate must be a signed, non-`unsigned` APK from a `release/`
   output directory. No fallback to "whatever `find` listed first"; no eligible APK fails the
   job.
3. **apksigner verification** — `apksigner verify --verbose --print-certs`; the signer's
   SHA-256 fingerprint is logged and written to the job summary.
4. **Package identity** — `aapt dump badging` package name must equal the `appId` in that
   project's `capacitor.config.json`. A mismatch fails the build (wrong app on people's
   devices); a `versionName` mismatch only warns (some projects already drift from
   `version.json`).
5. **Signer continuity** *(report-only by default)* — every release-mode build's signer
   certificate is compared with the historical release key that signed all 6 shipped
   `apks/*.apk` (baseline: SHA-256
   `e041bf73dd3a4e0cfeff2c3cecc80a45fe449705aada6dfa8d36e2c6be5cdea9`,
   Owner `CN=Rashid, OU=Developer, O=RashidApps`, valid 2026-06-16 → 2053). A match logs a
   notice; a mismatch logs a loud **warning** — Android refuses in-place updates for users
   who already installed these apps — but never blocks the job, because
   `.github/workflows/setup-keystore.yml` generates a *different* key and that can be
   intentional. To make an intentional key change (or an accidental one) a hard failure from
   now on, add the expected digest as the optional **`EXPECTED_SIGNER_SHA256`**
   repository secret: with it set, a mismatch fails the job before anything is published.
   TEST-mode builds are always skipped (ephemeral key by design).

Blocked builds still succeed as jobs (the gate exits 0 with `publish_ok=false`) so the TEST
artifact remains downloadable for review.

## The switch-over (do not apply until step 4 above is done for all 6 files)
Once the release is published and all 6 assets are confirmed live, two files change:

- **`apks/updates.json`** — each `url` field changes from `/apks/<file>.apk` to
  `https://github.com/MOT1209/mein-wep/releases/download/apks-latest/<file>.apk`.
- **`downloads.html`** — each `apkUrl` in the `projects` array changes from
  `BASE + '/apks/<file>.apk'` to the same Release URL (drop the `BASE +` prefix — the file no
  longer lives on `rashid-wep.vercel.app`).

Then:
- Add `apks/*.apk` to `.gitignore` (keep `apks/updates.json` tracked — it's metadata, not a
  binary).
- `git rm --cached apks/*.apk` to stop tracking the 6 files without deleting them locally, commit.
- The `checkApkExists()` HEAD-request check in `downloads.html` keeps working unchanged — a
  GitHub Release asset responds to `HEAD` like any other static URL.

**Do this switch-over only after confirming the assets are live** (a maintainer can check with
`GET /repos/MOT1209/mein-wep/releases/tags/apks-latest` or by clicking each link on the Releases
page). Flipping the links before the assets exist turns every "Download APK" button into a 404.

## Integrity note
`downloads.html` already records a `sha256` per APK for its "verify download" UI. Recompute
these against the uploaded Release assets before switching — GitHub does not alter file bytes on
upload, so the hashes should be unchanged, but verify once rather than assume.
