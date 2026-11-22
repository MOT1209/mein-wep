// The calculator vault, run against a tiny fake page: the code is stored
// hashed, a failed save keeps setup retryable, a key pressed while the code
// is checked cannot change the result, and old plain-text codes are converted.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function makeEnv(storage = new Map(), failKey = { value: null }) {
  const el = () => ({
    innerText: '', value: '', style: {}, textContent: '',
    classList: { _s: new Set(['hidden']), add(c) { this._s.add(c); }, remove(c) { this._s.delete(c); }, contains(c) { return this._s.has(c); } },
    addEventListener() {}, click() {}, appendChild() {}, getAttribute() { return null; },
  });
  const els = new Map();
  const document = {
    getElementById: (id) => { if (!els.has(id)) els.set(id, el()); return els.get(id); },
    querySelector: () => el(), querySelectorAll: () => [], createElement: () => el(),
    addEventListener() {}, body: { appendChild() {} },
  };
  const localStorage = {
    getItem: (k) => (storage.has(k) ? storage.get(k) : null),
    setItem: (k, v) => { if (k === failKey.value) throw new Error('QuotaExceededError'); storage.set(k, String(v)); },
    removeItem: (k) => storage.delete(k),
  };
  const ctx = { document, localStorage, crypto: globalThis.crypto, TextEncoder, setTimeout, console, Array, Uint8Array, DOMException };
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(new URL('../apps/calculator-app/js/app.js', import.meta.url), 'utf8') + '\n;globalThis.__calc = calc;', ctx);
  return { calc: ctx.__calc, storage };
}

test('calculator vault: hashed code, retryable setup, no race, legacy conversion', async () => {
  const fail = { value: 'vaultCodeHash' };
  const { calc, storage } = makeEnv(new Map(), fail);
  const type = (s) => { for (const d of s) calc.appendNumber(d); };
  await calc.handleEquals(); type('1234'); await calc.handleEquals(); type('1234'); await calc.handleEquals();
  const failed = { setup: calc.isSetupMode, display: calc.currentOperand, stored: storage.get('vaultCodeHash') ?? null };
  fail.value = null;
  type('4321'); await calc.handleEquals(); type('4321'); await calc.handleEquals();
  const ok = { setup: calc.isSetupMode, hashLen: storage.get('vaultCodeHash')?.length, plain: storage.get('vaultPassword') ?? null };
  await new Promise((r) => setTimeout(r, 2100));
  // Race: 1 + 2 =, and "3" pressed while the code check runs.
  calc.clear(); type('1'); calc.chooseOperation('+'); type('2'); const p = calc.handleEquals(); type('3'); await p;
  const race = calc.currentOperand;
  // Legacy migration and the right / wrong code.
  const legacy = makeEnv(new Map([['vaultPassword', '5678']]));
  await new Promise((r) => setTimeout(r, 50));
  const t2 = (s) => { for (const d of s) legacy.calc.appendNumber(d); };
  t2('1111'); await legacy.calc.handleEquals(); const wrongDisplay = legacy.calc.currentOperand;
  legacy.calc.clear(); t2('5678'); await legacy.calc.handleEquals(); const rightDisplay = legacy.calc.currentOperand;
  assert.deepEqual(failed, { setup: true, display: 'RE-ENTER', stored: null }, 'a failed save keeps setup open');
  assert.deepEqual(ok, { setup: false, hashLen: 64, plain: null }, 'retry stores only the hash');
  assert.equal(race, '3', 'the key pressed during the check is ignored');
  assert.deepEqual({ hash: !!legacy.storage.get('vaultCodeHash'), plain: legacy.storage.get('vaultPassword') ?? null }, { hash: true, plain: null }, 'old code converted');
  assert.equal(wrongDisplay, '1111', 'a wrong code does not open the vault');
  assert.equal(rightDisplay, '0', 'the right code opens it');
});
