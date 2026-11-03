/**
 * Media uploads: the file type is decided from the file's own bytes (magic
 * numbers), never from its name or the Content-Type the browser sent. SVG is
 * not accepted (it can carry script). The bucket enforces the same MIME list
 * and the 5 MB cap again on the Supabase side.
 */
import crypto from 'node:crypto';
import { InputError } from './cms-validate.js';

export const BUCKET = 'media';
// The function body limit on Vercel is ~4.5 MB and base64 adds a third, so
// the decoded file may be at most 3 MB. The dashboard shrinks images to WebP
// in the browser before upload, which keeps real photos well below that.
export const MAX_BYTES = 3 * 1024 * 1024;

const ascii = (buf, start, end) => buf.subarray(start, end).toString('latin1');

export function sniffImage(buf) {
  if (buf.length < 12) return null;
  if (buf[0] === 0x89 && ascii(buf, 1, 4) === 'PNG' && buf[4] === 0x0d && buf[5] === 0x0a) return { type: 'image/png', ext: 'png' };
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { type: 'image/jpeg', ext: 'jpg' };
  if (ascii(buf, 0, 6) === 'GIF87a' || ascii(buf, 0, 6) === 'GIF89a') return { type: 'image/gif', ext: 'gif' };
  if (ascii(buf, 0, 4) === 'RIFF' && ascii(buf, 8, 12) === 'WEBP') return { type: 'image/webp', ext: 'webp' };
  if (ascii(buf, 4, 8) === 'ftyp' && ['avif', 'avis'].includes(ascii(buf, 8, 12))) return { type: 'image/avif', ext: 'avif' };
  return null;
}

/** "Projects/My Logo.PNG" -> folder "projects", base "my-logo". */
export function cleanFolder(folder) {
  if (folder === undefined || folder === null || folder === '') return 'uploads';
  if (typeof folder !== 'string' || !/^[a-z0-9-]{1,40}(\/[a-z0-9-]{1,40})?$/.test(folder)) {
    throw new InputError('Folder may use a-z, 0-9 and -, at most two levels');
  }
  return folder;
}

export function baseName(name) {
  const b = String(name ?? '').replace(/\.[^.]*$/, '').toLowerCase().normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50);
  return b || 'image';
}

/** Decodes and checks an upload; returns { bytes, type, path }. */
export function prepareUpload({ folder, filename, dataBase64 }) {
  if (typeof dataBase64 !== 'string' || !dataBase64.length) throw new InputError('No file');
  if (dataBase64.length > Math.ceil(MAX_BYTES / 3) * 4 + 8) throw new InputError('File too large (max 3 MB)');
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(dataBase64)) throw new InputError('File is not valid base64');
  const bytes = Buffer.from(dataBase64, 'base64');
  if (bytes.length > MAX_BYTES) throw new InputError('File too large (max 3 MB)');
  const kind = sniffImage(bytes);
  if (!kind) throw new InputError('Only PNG, JPEG, WebP, GIF or AVIF images are accepted');
  const dir = cleanFolder(folder);
  const id = crypto.randomBytes(5).toString('hex');
  return { bytes: new Uint8Array(bytes), type: kind.type, path: `${dir}/${baseName(filename)}-${id}.${kind.ext}` };
}

/** An object path inside the bucket as sent back by the dashboard. */
export function cleanObjectPath(p) {
  if (typeof p !== 'string' || !/^[a-z0-9-]{1,40}(\/[a-z0-9-]{1,40})?\/[a-z0-9-]{1,70}\.(png|jpg|gif|webp|avif)$/.test(p)) {
    throw new InputError('Bad file path');
  }
  return p;
}
