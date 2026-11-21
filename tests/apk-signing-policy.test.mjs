// Tests for scripts/apk-release-policy.mjs — the decision logic that gates
// publishing to the official apks-latest release (mission scenario coverage
// in parentheses; scenarios that need a real Gradle/Android SDK run are
// exercised in CI and reported as such).

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import {
  decideSigningMode,
  selectReleaseApk,
  canPublish,
  parseBadging,
  readExpectedAppId,
  checkAppIdentity,
  checkSignerContinuity,
  normalizeSha256,
  HISTORICAL_RELEASE_SIGNER_SHA256,
} from '../scripts/apk-release-policy.mjs';

const SCRIPT = fileURLToPath(new URL('../scripts/apk-release-policy.mjs', import.meta.url));
const WORKFLOW = fileURLToPath(new URL('../.github/workflows/apk-build.yml', import.meta.url));

function runCli(args, env = {}) {
  return execFileSync(process.execPath, [SCRIPT, ...args], {
    encoding: 'utf8',
    env: { ...process.env, KS_B64: '', KS_PASS: '', EXPECTED_SIGNER_SHA256: '', ...env },
  });
}

function runCliExpectFail(args, env = {}) {
  try {
    runCli(args, env);
  } catch (err) {
    return err;
  }
  throw new Error(`expected CLI to fail: ${args.join(' ')}`);
}

function parseKeyValues(text) {
  const out = {};
  for (const line of text.trim().split('\n')) {
    const i = line.indexOf('=');
    if (i > 0) out[line.slice(0, i)] = line.slice(i + 1);
  }
  return out;
}

function tmpProject(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'apk-policy-'));
  for (const [rel, content] of Object.entries(files)) {
    const full = path.join(dir, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
  }
  return dir;
}

// --- decideSigningMode ------------------------------------------------------

test('scenario 1: both keystore secrets missing -> test mode', () => {
  assert.equal(decideSigningMode({}).mode, 'test');
  assert.equal(decideSigningMode({ ksBase64: '', ksPassword: '' }).mode, 'test');
});

test('scenario 1: only one secret present -> test mode, names the missing one', () => {
  const a = decideSigningMode({ ksBase64: 'abc' });
  assert.equal(a.mode, 'test');
  assert.match(a.reason, /KEYSTORE_PASSWORD/);
  const b = decideSigningMode({ ksPassword: 'def' });
  assert.equal(b.mode, 'test');
  assert.match(b.reason, /KEYSTORE_BASE64/);
});

test('scenario 2: both secrets present -> release mode', () => {
  const r = decideSigningMode({ ksBase64: 'abc', ksPassword: 'def' });
  assert.equal(r.mode, 'release');
  assert.match(r.reason, /release keystore/);
});

// --- selectReleaseApk -------------------------------------------------------

test('scenario 3: no .apk files at all -> refuses', () => {
  const d = selectReleaseApk([]);
  assert.equal(d.path, null);
  assert.match(d.reason, /no \.apk/);
});

test('scenario 3: debug-only output -> refuses (not a release dir)', () => {
  const d = selectReleaseApk(['debug/app-debug.apk']);
  assert.equal(d.path, null);
  assert.match(d.reason, /release\//);
});

test('scenario 4: unsigned-only release output -> refuses', () => {
  const d = selectReleaseApk(['release/app-release-unsigned.apk']);
  assert.equal(d.path, null);
  assert.match(d.reason, /unsigned/);
});

test('scenario 4: canonical app-release.apk preferred over unsigned sibling', () => {
  const d = selectReleaseApk([
    'release/app-release-unsigned.apk',
    'release/app-release.apk',
    'debug/app-debug.apk',
  ]);
  assert.equal(d.path, 'release/app-release.apk');
});

test('scenario 4: picks any signed release APK when canonical name absent (deterministic sort)', () => {
  const input = ['release/app-release-signed.apk', 'release/other.apk'];
  const d = selectReleaseApk([...input].reverse());
  assert.equal(d.path, 'release/app-release-signed.apk');
  const again = selectReleaseApk(input);
  assert.equal(again.path, d.path);
});

// --- canPublish -------------------------------------------------------------

test('scenario 6: release mode + path + verified signature + verified identity -> publishable', () => {
  const r = canPublish({
    mode: 'release',
    apkPath: 'release/app-release.apk',
    signatureValid: true,
    metaValid: true,
  });
  assert.equal(r.ok, true);
});

test('scenario 7: test mode is never publishable regardless of other gates', () => {
  const r = canPublish({
    mode: 'test',
    apkPath: 'release/app-release.apk',
    signatureValid: true,
    metaValid: true,
  });
  assert.equal(r.ok, false);
  assert.match(r.reason, /never published/);
});

test('scenario 8: failed signature verification blocks publish', () => {
  const r = canPublish({
    mode: 'release',
    apkPath: 'release/app-release.apk',
    signatureValid: false,
    metaValid: true,
  });
  assert.equal(r.ok, false);
  assert.match(r.reason, /apksigner/);
});

test('scenario 8: failed identity check blocks publish', () => {
  const r = canPublish({
    mode: 'release',
    apkPath: 'release/app-release.apk',
    signatureValid: true,
    metaValid: false,
  });
  assert.equal(r.ok, false);
  assert.match(r.reason, /package identity/);
});

test('scenario 3/4 consequence: missing APK path blocks publish', () => {
  const r = canPublish({ mode: 'release', apkPath: '', signatureValid: true, metaValid: true });
  assert.equal(r.ok, false);
  assert.match(r.reason, /no APK/);
});

// --- identity parsing / checks ---------------------------------------------

const BADGING = [
  "package: name='com.rashid.kingcraft' versionCode='6' versionName='0.6.0' platformBuildVersionName='14'",
  "sdkVersion:'24'",
  "targetSdkVersion:'34'",
  "application-label:'KingCraft'",
].join('\n');

test('parseBadging extracts package and versionName', () => {
  const p = parseBadging(BADGING);
  assert.equal(p.package, 'com.rashid.kingcraft');
  assert.equal(p.versionCode, '6');
  assert.equal(p.versionName, '0.6.0');
});

test('parseBadging on garbage returns nulls instead of throwing', () => {
  const p = parseBadging('not a badging file');
  assert.equal(p.package, null);
});

test('checkAppIdentity: matching appId passes', () => {
  const r = checkAppIdentity({
    expectedAppId: 'com.rashid.kingcraft',
    badgingText: BADGING,
    version: '0.6.0',
  });
  assert.equal(r.ok, true);
  assert.equal(r.errors.length, 0);
});

test('checkAppIdentity: wrong appId is fatal', () => {
  const r = checkAppIdentity({
    expectedAppId: 'com.rashid.rustgame',
    badgingText: BADGING,
    version: '0.6.0',
  });
  assert.equal(r.ok, false);
  assert.match(r.errors[0], /package mismatch/);
});

test('checkAppIdentity: versionName mismatch warns but does not fail', () => {
  const r = checkAppIdentity({
    expectedAppId: 'com.rashid.kingcraft',
    badgingText: BADGING,
    version: '9.9.9',
  });
  assert.equal(r.ok, true);
  assert.equal(r.warnings.length, 1);
  assert.match(r.warnings[0], /versionName/);
});

test('checkAppIdentity: missing appId config -> skip comparison with warning', () => {
  const r = checkAppIdentity({ expectedAppId: null, badgingText: BADGING, version: '0.6.0' });
  assert.equal(r.ok, true);
  assert.match(r.warnings[0], /not compared/);
});

test('readExpectedAppId reads capacitor.config.json and returns null when absent', () => {
  const dir = tmpProject({
    'capacitor.config.json': JSON.stringify({ appId: 'com.rashid.calculatorapp' }),
  });
  assert.equal(readExpectedAppId(dir), 'com.rashid.calculatorapp');
  assert.equal(readExpectedAppId(path.join(dir, 'nope')), null);
});

// --- CLI round-trips --------------------------------------------------------

test('CLI mode: release when env secrets are set', () => {
  const stdout = runCli(['mode'], { KS_B64: 'abc', KS_PASS: 'def' });
  assert.equal(parseKeyValues(stdout).mode, 'release');
});

test('CLI mode: test when env secrets are empty (scenario 1)', () => {
  const out = parseKeyValues(runCli(['mode'], { KS_B64: '', KS_PASS: '' }));
  assert.equal(out.mode, 'test');
  assert.match(out.reason, /missing/);
});

test('CLI select: prints path of signed release APK (scenario 4 selection)', () => {
  const dir = tmpProject({
    'release/app-release.apk': 'apk',
    'release/app-release-unsigned.apk': 'apk',
    'debug/app-debug.apk': 'apk',
  });
  const stdout = runCli(['select', dir]).trim();
  assert.match(stdout, /release[\\/]app-release\.apk$/);
});

test('CLI select: exits 1 when only unsigned APKs exist (scenario 4)', () => {
  const dir = tmpProject({ 'release/app-release-unsigned.apk': 'apk' });
  const err = runCliExpectFail(['select', dir]);
  assert.equal(err.status, 1);
  assert.match(String(err.stderr), /no publishable APK/);
});

test('CLI select: exits 1 when output dir has no APKs (scenario 3)', () => {
  const dir = tmpProject({ 'release/notes.txt': 'x' });
  const err = runCliExpectFail(['select', dir]);
  assert.equal(err.status, 1);
});

test('CLI can-publish: true/false lines for gate consumption (scenarios 6+7)', () => {
  const ok = parseKeyValues(
    runCli([
      'can-publish',
      '--mode', 'release',
      '--path', 'release/app-release.apk',
      '--verify', 'true',
      '--meta', 'true',
    ]),
  );
  assert.equal(ok.publish_ok, 'true');

  const blocked = parseKeyValues(
    runCli([
      'can-publish',
      '--mode', 'test',
      '--path', 'release/app-release.apk',
      '--verify', 'true',
      '--meta', 'true',
    ]),
  );
  assert.equal(blocked.publish_ok, 'false');

  const badVerify = parseKeyValues(
    runCli([
      'can-publish',
      '--mode', 'release',
      '--path', 'release/app-release.apk',
      '--verify', 'false',
      '--meta', 'true',
    ]),
  );
  assert.equal(badVerify.publish_ok, 'false');
});

test('CLI verify-meta: passes for matching capacitor appId, fails for mismatch', () => {
  const project = tmpProject({
    'capacitor.config.json': JSON.stringify({ appId: 'com.rashid.kingcraft' }),
  });
  const badging = tmpProject({ 'badging.txt': BADGING });

  const ok = parseKeyValues(
    runCli(['verify-meta', '--project', project, '--badging', path.join(badging, 'badging.txt'), '--version', '0.6.0']),
  );
  assert.equal(ok.meta_ok, 'true');
  assert.equal(ok.built_package, 'com.rashid.kingcraft');

  const wrongProject = tmpProject({
    'capacitor.config.json': JSON.stringify({ appId: 'com.rashid.wrong' }),
  });
  const err = runCliExpectFail([
    'verify-meta',
    '--project', wrongProject,
    '--badging', path.join(badging, 'badging.txt'),
  ]);
  assert.equal(err.status, 1);
  assert.match(String(err.stdout), /meta_ok=false/);
});

// --- signer continuity (historical release-key baseline) ---------------------

test('continuity: baseline constant is a full 64-char hex digest', () => {
  assert.equal(HISTORICAL_RELEASE_SIGNER_SHA256.length, 64);
  assert.match(HISTORICAL_RELEASE_SIGNER_SHA256, /^[0-9a-f]{64}$/);
});

test('continuity: release build matching the historical baseline passes', () => {
  const r = checkSignerContinuity({ signer: HISTORICAL_RELEASE_SIGNER_SHA256, mode: 'release' });
  assert.equal(r.ok, true);
  assert.equal(r.status, 'match-baseline');
  assert.equal(r.hard, false);
});

test('continuity: keytool-style AA:BB digests normalize to the same value', () => {
  const colon = HISTORICAL_RELEASE_SIGNER_SHA256.match(/../g).join(':').toUpperCase();
  assert.equal(normalizeSha256(colon), HISTORICAL_RELEASE_SIGNER_SHA256);
  const r = checkSignerContinuity({ signer: colon, mode: 'release' });
  assert.equal(r.ok, true);
  assert.equal(r.status, 'match-baseline');
});

test('continuity: baseline mismatch is report-only, never a hard failure', () => {
  const r = checkSignerContinuity({ signer: 'a'.repeat(64), mode: 'release' });
  assert.equal(r.ok, false);
  assert.equal(r.status, 'mismatch-baseline');
  assert.equal(r.hard, false);
});

test('continuity: pinned EXPECTED_SIGNER_SHA256 match passes, mismatch is hard', () => {
  const ok = checkSignerContinuity({ signer: 'c'.repeat(64), expected: 'C'.repeat(64), mode: 'release' });
  assert.equal(ok.ok, true);
  assert.equal(ok.status, 'match-pinned');
  assert.equal(ok.pinned, true);
  const bad = checkSignerContinuity({ signer: 'd'.repeat(64), expected: 'e'.repeat(64), mode: 'release' });
  assert.equal(bad.ok, false);
  assert.equal(bad.status, 'mismatch-pinned');
  assert.equal(bad.hard, true);
});

test('continuity: TEST builds skip the check even when a pin is set', () => {
  const r = checkSignerContinuity({ signer: 'f'.repeat(64), expected: 'a'.repeat(64), mode: 'test' });
  assert.equal(r.ok, true);
  assert.equal(r.status, 'skipped-test');
  assert.equal(r.hard, false);
});

test('continuity: missing/unparseable signer digest is unknown, never hard', () => {
  const r = checkSignerContinuity({ signer: '', mode: 'release' });
  assert.equal(r.ok, true);
  assert.equal(r.status, 'unknown');
  assert.equal(r.hard, false);
});

test('CLI continuity: baseline match prints ok + status (release mode)', () => {
  const kv = parseKeyValues(
    runCli(['continuity', '--mode', 'release', '--signer', HISTORICAL_RELEASE_SIGNER_SHA256]),
  );
  assert.equal(kv.continuity_ok, 'true');
  assert.equal(kv.continuity_status, 'match-baseline');
  assert.equal(kv.continuity_pinned, 'false');
});

test('CLI continuity: baseline mismatch stays exit 0 with ok=false (report-only)', () => {
  const kv = parseKeyValues(
    runCli(['continuity', '--mode', 'release', '--signer', 'a'.repeat(64)]),
  );
  assert.equal(kv.continuity_ok, 'false');
  assert.equal(kv.continuity_status, 'mismatch-baseline');
});

test('CLI continuity: pinned mismatch exits 1 (hard fail, scenario: continuity)', () => {
  const err = runCliExpectFail([
    'continuity',
    '--mode', 'release',
    '--signer', 'a'.repeat(64),
    '--expect', 'b'.repeat(64),
  ]);
  assert.equal(err.status, 1);
  assert.match(String(err.stderr), /EXPECTED_SIGNER_SHA256/);
});

test('CLI continuity: TEST mode is skipped and ok', () => {
  const kv = parseKeyValues(
    runCli(['continuity', '--mode', 'test', '--signer', 'a'.repeat(64)]),
  );
  assert.equal(kv.continuity_ok, 'true');
  assert.equal(kv.continuity_status, 'skipped-test');
});

// --- workflow wiring regression guards --------------------------------------

test('workflow: no hardcoded temp keystore password remains', () => {
  const wf = fs.readFileSync(WORKFLOW, 'utf8');
  assert.ok(!wf.includes('TempPass123'), 'hardcoded TempPass123 must be gone');
});

test('workflow: publish and version.json commit are gated on the release gate', () => {
  const wf = fs.readFileSync(WORKFLOW, 'utf8');
  const gates = wf.split('steps.gate.outputs.publish_ok == ').length - 1;
  assert.ok(gates >= 2, `expected >=2 publish_ok gates, found ${gates}`);
});

test('workflow: uses policy mode, select CLI, and --print-certs', () => {
  const wf = fs.readFileSync(WORKFLOW, 'utf8');
  assert.match(wf, /steps\.policy\.outputs\.mode/);
  assert.match(wf, /apk-release-policy\.mjs select/);
  assert.match(wf, /--print-certs/);
  assert.match(wf, /TEST-BUILD-/);
});

test('workflow: signer continuity step wired with optional pin secret', () => {
  const wf = fs.readFileSync(WORKFLOW, 'utf8');
  assert.match(wf, /apk-release-policy\.mjs continuity/);
  assert.match(wf, /secrets\.EXPECTED_SIGNER_SHA256/);
  assert.match(wf, /steps\.verify\.outputs\.signer_sha256/);
});
