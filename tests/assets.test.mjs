// Every tracked PNG the site or a PWA serves must be a decodable image.
// Eight PWA icons once shipped with a malformed IHDR chunk (length 17
// instead of 13), so browsers showed nothing where the app icon should be.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

// zlib.crc32 needs Node 20.15+/22.2+; package.json allows any Node 20.
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let k = 0; k < 8; k++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}

test('tracked PNG files have a valid signature and IHDR chunk', () => {
  const pngs = execSync('git ls-files -z -- "*.png"', { encoding: 'utf8' })
    .split('\0')
    .filter((f) => f && !f.includes('/android/'));
  assert.ok(pngs.length > 0);
  for (const file of pngs) {
    const buf = readFileSync(file);
    assert.ok(buf.subarray(0, 8).equals(SIGNATURE), `${file}: not a PNG`);
    assert.equal(buf.readUInt32BE(8), 13, `${file}: IHDR length`);
    assert.equal(buf.toString('ascii', 12, 16), 'IHDR', `${file}: first chunk`);
    assert.equal(buf.readUInt32BE(29), crc32(buf.subarray(12, 29)), `${file}: IHDR CRC`);
  }
});
