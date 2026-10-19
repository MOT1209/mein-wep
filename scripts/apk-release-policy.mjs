// APK release policy — single source of truth for what may be published to
// the official `apks-latest` GitHub Release and version.json.
//
// Consumed by .github/workflows/apk-build.yml (CLI) and unit-tested in
// tests/apk-signing-policy.test.mjs. Four gates must ALL pass before an
// artifact is published or a version.json commit is pushed:
//
//   1. mode   — release-keystore secrets present (`release`) vs absent (`test`)
//   2. select — a signed, non-unsigned APK from a release/ output dir was chosen
//   3. verify — apksigner verified the selected file (workflow step)
//   4. meta   — built package name matches the project's capacitor config
//
// A supplementary signer-continuity check compares the signer certificate
// against the historical release-key baseline (report-only) or against the
// optional EXPECTED_SIGNER_SHA256 secret (hard failure on mismatch).
//
// Test-mode builds are still built and verified for debugging, but they are
// uploaded as a clearly labelled, short-retention TEST artifact only — never
// as a release asset, and they never touch version.json.
//
// CLI contract: stdout carries machine-readable output ONLY (key=value lines
// or a raw path) so it can be redirected into $GITHUB_OUTPUT or captured with
// $(...). All human/diagnostic messages go to stderr as workflow commands.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function decideSigningMode({ ksBase64, ksPassword } = {}) {
  const missing = [];
  if (!ksBase64) missing.push('KEYSTORE_BASE64');
  if (!ksPassword) missing.push('KEYSTORE_PASSWORD');
  if (missing.length > 0) {
    return { mode: 'test', reason: `missing ${missing.join(' + ')}` };
  }
  return { mode: 'release', reason: 'release keystore secrets present' };
}

// files: APK paths relative to the build outputs root, any separators.
// Returns { path, reason } — path is null when nothing publishable exists.
export function selectReleaseApk(files = []) {
  const norm = files
    .map((f) => String(f).replace(/\\/g, '/'))
    .filter((f) => /\.apk$/i.test(f));
  if (norm.length === 0) {
    return { path: null, reason: 'no .apk files produced by the build' };
  }
  const inRelease = norm.filter((f) => f.split('/').slice(0, -1).includes('release'));
  if (inRelease.length === 0) {
    return {
      path: null,
      reason: 'no APK under a release/ output directory (debug-only build or missing output)',
    };
  }
  const signed = inRelease.filter((f) => !/unsigned/i.test(f.split('/').pop()));
  if (signed.length === 0) {
    return { path: null, reason: 'only unsigned release APKs found — refusing to select one' };
  }
  const canonical = signed.filter((f) => f.split('/').pop() === 'app-release.apk');
  const pool = canonical.length > 0 ? canonical : signed;
  const chosen = [...pool].sort()[0];
  return {
    path: chosen,
    reason:
      canonical.length > 0
        ? 'canonical signed Gradle output app-release.apk'
        : `signed release APK available: ${chosen.split('/').pop()}`,
  };
}

// Booleans must be strictly true (CLI passes GitHub's string 'true'/'false').
export function canPublish({ mode, apkPath, signatureValid, metaValid } = {}) {
  if (mode !== 'release') {
    return {
      ok: false,
      reason: `build mode is '${mode || 'unknown'}' — test artifacts are never published`,
    };
  }
  if (!apkPath) return { ok: false, reason: 'no APK was selected' };
  if (signatureValid !== true) {
    return { ok: false, reason: 'apksigner verification did not pass' };
  }
  if (metaValid !== true) {
    return { ok: false, reason: 'package identity check did not pass' };
  }
  return {
    ok: true,
    reason: 'release mode + selected APK + verified signature + matching package identity',
  };
}

// Parses `aapt dump badging` output:
//   package: name='com.example.app' versionCode='1' versionName='1.0' ...
export function parseBadging(text = '') {
  const m = String(text).match(
    /package:\s*name='([^']+)'(?:\s+versionCode='([^']*)')?(?:\s+versionName='([^']*)')?/,
  );
  if (!m) return { package: null, versionCode: null, versionName: null };
  return { package: m[1], versionCode: m[2] ?? null, versionName: m[3] ?? null };
}

// appId from the project's Capacitor config. Returns null when there is no
// readable config (caller treats that as "skip comparison", not as failure).
export function readExpectedAppId(projectDir) {
  const file = path.join(projectDir, 'capacitor.config.json');
  try {
    const cfg = JSON.parse(fs.readFileSync(file, 'utf8'));
    return cfg.appId || null;
  } catch {
    return null;
  }
}

// Package-identity check. Package mismatch is fatal (wrong identity = wrong
// app on people's devices). A versionName difference from version.json is
// reported as a warning only: calculator/quiz already diverge today
// (version.json 1.0.1/1.4.1 vs package.json 1.0.0), so failing on it would
// break working builds instead of proving integrity.
export function checkAppIdentity({ expectedAppId = null, badgingText = '', version = '' } = {}) {
  const errors = [];
  const warnings = [];
  const parsed = parseBadging(badgingText);
  if (!parsed.package) {
    errors.push('aapt badging output contained no package name');
  } else if (expectedAppId && parsed.package !== expectedAppId) {
    errors.push(
      `package mismatch: built '${parsed.package}' vs capacitor config '${expectedAppId}'`,
    );
  }
  if (!expectedAppId) {
    warnings.push('no capacitor.config.json appId found — package identity not compared');
  }
  if (version && parsed.versionName && parsed.versionName !== version) {
    warnings.push(
      `versionName '${parsed.versionName}' differs from version.json '${version}' (recorded, not fatal)`,
    );
  }
  return { ok: errors.length === 0, errors, warnings, parsed };
}

// Signer continuity baseline — SHA-256 of the release certificate that signed
// ALL 6 shipped apks/*.apk (verified with `keytool -printcert -jarfile`: one
// identical cert across calculator/farm/kingcraft/quiz/quran/rust builds,
// Owner CN=Rashid, OU=Developer, O=RashidApps, valid 2026-06-16 → 2053).
// Every new release build must keep using this key: Android refuses to
// install an update signed with a different key over an installed app.
export const HISTORICAL_RELEASE_SIGNER_SHA256 =
  'e041bf73dd3a4e0cfeff2c3cecc80a45fe449705aada6dfa8d36e2c6be5cdea9';

// keytool prints `AA:BB:...` (uppercase, colon-separated), apksigner prints
// lowercase hex without separators — normalize both before comparing.
export function normalizeSha256(value) {
  return String(value || '').replace(/[^0-9a-fA-F]/g, '').toLowerCase();
}

// Signer continuity check:
//  - test mode: skipped (signed with an ephemeral key by design) → ok.
//  - release + pinned expectation (EXPECTED_SIGNER_SHA256 secret): hard fail
//    on mismatch (`hard: true` → CLI exits 1 and stops the job).
//  - release, no pin: compared against the historical baseline above —
//    report-only. A mismatch returns ok=false + hard=false so the workflow
//    warns loudly (update-incompatibility risk) without blocking, because
//    setup-keystore.yml can legitimately generate a different key that the
//    maintainer then needs to pin deliberately.
//  - unparseable/missing digest: unknown → ok, never hard (apksigner already
//    passed verification; this guards against output-format drift, not apps).
export function checkSignerContinuity({ signer = '', expected = '', mode = '' } = {}) {
  const actual = normalizeSha256(signer);
  const pinned = normalizeSha256(expected);
  if (mode === 'test') {
    return { ok: true, status: 'skipped-test', pinned: Boolean(pinned), hard: false, actual, expected: pinned };
  }
  if (actual.length !== 64) {
    return { ok: true, status: 'unknown', pinned: Boolean(pinned), hard: false, actual, expected: pinned };
  }
  if (pinned) {
    const match = actual === pinned;
    return {
      ok: match,
      status: match ? 'match-pinned' : 'mismatch-pinned',
      pinned: true,
      hard: !match,
      actual,
      expected: pinned,
    };
  }
  const match = actual === HISTORICAL_RELEASE_SIGNER_SHA256;
  return {
    ok: match,
    status: match ? 'match-baseline' : 'mismatch-baseline',
    pinned: false,
    hard: false,
    actual,
    expected: HISTORICAL_RELEASE_SIGNER_SHA256,
  };
}

function out(lines) {
  process.stdout.write(`${lines.join('\n')}\n`);
}
function notice(msg) {
  process.stderr.write(`::notice::${msg}\n`);
}
function warn(msg) {
  process.stderr.write(`::warning::${msg}\n`);
}
function fail(msg) {
  process.stderr.write(`::error::${msg}\n`);
  process.exit(1);
}

function walkApks(root, dir = root) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const found = [];
  for (const e of [...entries].sort((a, b) => a.name.localeCompare(b.name))) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      found.push(...walkApks(root, full));
    } else if (e.isFile() && /\.apk$/i.test(e.name)) {
      // Relative to the walk ROOT (not the recursion dir), otherwise nested
      // files lose their directory component and release/ detection never matches.
      found.push(path.relative(root, full).split(path.sep).join('/'));
    }
  }
  return found;
}

function parseFlags(argv) {
  const flags = {};
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i];
    const value = argv[i + 1];
    if (!key || !key.startsWith('--') || value === undefined) {
      fail(`expected --flag value pairs, got: ${argv.join(' ')}`);
    }
    flags[key.slice(2)] = value;
  }
  return flags;
}

function main(argv) {
  const [cmd, ...rest] = argv;

  if (cmd === 'mode') {
    const r = decideSigningMode({ ksBase64: process.env.KS_B64, ksPassword: process.env.KS_PASS });
    out([`mode=${r.mode}`, `reason=${r.reason}`]);
    if (r.mode === 'test') {
      warn(
        `TEST-only build (${r.reason}) — this artifact will be uploaded as a labelled TEST artifact, never published to the apks-latest release and never committed to version.json. Configure KEYSTORE_BASE64/KEYSTORE_PASSWORD for publishable builds.`,
      );
    }
    return;
  }

  if (cmd === 'select') {
    const dir = rest[0];
    if (!dir) fail('select requires <dir>');
    const rels = walkApks(dir);
    const listed = rels.map((rel) => `${dir.replace(/\\/g, '/')}/${rel}`);
    const decision = selectReleaseApk(rels);
    if (!decision.path) fail(`no publishable APK under ${dir}: ${decision.reason}`);
    const chosenRel = decision.path;
    const chosen = listed[rels.indexOf(chosenRel)];
    process.stdout.write(`${chosen}\n`);
    process.stderr.write(`selected ${chosen} (${decision.reason})\n`);
    return;
  }

  if (cmd === 'can-publish') {
    const f = parseFlags(rest);
    const r = canPublish({
      mode: f.mode,
      apkPath: f.path,
      signatureValid: f.verify === 'true',
      metaValid: f.meta === 'true',
    });
    out([`publish_ok=${r.ok ? 'true' : 'false'}`, `reason=${r.reason}`]);
    if (!r.ok) notice(`release gate blocked: ${r.reason}`);
    return;
  }

  if (cmd === 'verify-meta') {
    const f = parseFlags(rest);
    if (!f.project || !f.badging) fail('verify-meta requires --project <dir> --badging <file>');
    let badgingText = '';
    try {
      badgingText = fs.readFileSync(f.badging, 'utf8');
    } catch {
      fail(`could not read badging file ${f.badging}`);
    }
    const r = checkAppIdentity({
      expectedAppId: readExpectedAppId(f.project),
      badgingText,
      version: f.version || '',
    });
    for (const w of r.warnings) warn(w);
    out([
      `meta_ok=${r.ok ? 'true' : 'false'}`,
      `reason=${(r.ok ? r.warnings : r.errors).join('; ') || 'identity verified'}`,
      `built_package=${r.parsed.package || ''}`,
      `built_version=${r.parsed.versionName || ''}`,
    ]);
    if (!r.ok) {
      for (const e of r.errors) fail(e);
    }
    return;
  }

  if (cmd === 'continuity') {
    const f = parseFlags(rest);
    const expected = f.expect !== undefined ? f.expect : process.env.EXPECTED_SIGNER_SHA256 || '';
    const r = checkSignerContinuity({ signer: f.signer || '', expected, mode: f.mode || '' });
    out([
      `continuity_ok=${r.ok ? 'true' : 'false'}`,
      `continuity_status=${r.status}`,
      `continuity_pinned=${r.pinned ? 'true' : 'false'}`,
    ]);
    try {
      if (process.env.GITHUB_STEP_SUMMARY) {
        fs.appendFileSync(
          process.env.GITHUB_STEP_SUMMARY,
          `- signer continuity: \`${r.status}\`${r.pinned ? ' (pinned)' : ''}\n`,
        );
      }
    } catch {
      // step summary is best-effort diagnostics only
    }
    if (r.status === 'skipped-test') {
      notice('signer continuity skipped — TEST build is signed with an ephemeral key by design');
    } else if (r.status === 'unknown') {
      warn('could not parse a full signer SHA-256 — continuity not evaluated (apksigner output format changed?)');
    } else if (r.status === 'match-baseline') {
      notice('signer matches the historical release key that signed all 6 shipped apks/*.apk');
    } else if (r.status === 'match-pinned') {
      notice(`signer matches pinned EXPECTED_SIGNER_SHA256 (${r.actual.slice(0, 12)}…)`);
    } else if (r.status === 'mismatch-baseline') {
      warn(
        `signer differs from the historical release key baseline — Android will refuse in-place updates for users who already installed these apps. baseline=${r.expected} actual=${r.actual}. ` +
          'Restore the original keystore, or set the EXPECTED_SIGNER_SHA256 secret to make an intentional key change a hard failure from now on.',
      );
    } else if (r.status === 'mismatch-pinned') {
      fail(`signer does not match pinned EXPECTED_SIGNER_SHA256 — expected ${r.expected}, got ${r.actual} — refusing to continue`);
    }
    return;
  }

  fail(`unknown command '${cmd || ''}' — expected mode | select | can-publish | verify-meta | continuity`);
}

// Only run the CLI when executed directly (tests import the functions above).
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2));
}
