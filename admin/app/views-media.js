// Media library (Supabase Storage via /api/admin/media) and the image picker
// used by the project and blog editors.
import { call } from './api.js';
import { t } from './i18n.js';
import { busy, clear, confirmDialog, el, empty, errorText, field, openDialog, toast } from './ui.js';

const MAX_SIDE = 1920;
const KEEP_BELOW = 350 * 1024; // small files are uploaded as they are

/**
 * Shrinks a large photo to WebP in the browser (canvas), so uploads stay
 * under the 3 MB limit and pages load fast. GIFs keep their animation and
 * are never re-encoded. The server re-checks the real type from the bytes.
 */
export async function prepareFile(file) {
  if (file.type === 'image/gif' || file.size <= KEEP_BELOW) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((res) => canvas.toBlob(res, 'image/webp', 0.85));
    if (blob && blob.size < file.size) return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.webp', { type: 'image/webp' });
  } catch { /* the browser cannot decode it: send the original, the server decides */ }
  return file;
}

const toBase64 = (file) => new Promise((resolve, reject) => {
  const r = new FileReader();
  r.onload = () => resolve(String(r.result).split(',')[1] ?? '');
  r.onerror = () => reject(r.error);
  r.readAsDataURL(file);
});

export async function uploadFile(file, { folder, replacePath } = {}) {
  const ready = await prepareFile(file);
  return call('media', 'upload', { folder, filename: ready.name, dataBase64: await toBase64(ready), replacePath });
}

function fileInput(onFiles, multiple = true) {
  const input = el('input', { type: 'file', accept: 'image/png,image/jpeg,image/webp,image/gif,image/avif', multiple, class: 'visually-hidden' });
  input.addEventListener('change', () => { if (input.files?.length) onFiles([...input.files]); input.value = ''; });
  return input;
}

async function uploadMany(files, folder, statusEl) {
  const done = [];
  for (const f of files) {
    statusEl.textContent = t('media.uploading', { name: f.name });
    try {
      done.push(await uploadFile(f, { folder }));
    } catch (err) {
      toast(`${f.name}: ${errorText(err)}`, 'error');
    }
  }
  statusEl.textContent = '';
  if (done.length) toast(t('media.uploaded'));
  return done;
}

function grid(items, { onPick, onChange }) {
  const files = items.filter((i) => !i.folder);
  if (!files.length) return empty(t('media.noFiles'));
  return el('ul', { class: 'media-grid' }, files.map((it) => {
    const replaceInput = fileInput(async ([f]) => {
      await busy(null, () => uploadFile(f, { replacePath: it.path }), t('media.replaced')).catch(() => {});
      onChange?.();
    }, false);
    return el('li', { class: 'media-item' },
      el('img', { src: it.url, alt: '', loading: 'lazy' }),
      el('p', { class: 'media-name', dir: 'ltr', title: it.path }, it.name),
      el('div', { class: 'media-actions' },
        onPick
          ? el('button', { type: 'button', class: 'btn btn-primary btn-sm', onclick: () => onPick(it) }, t('action.choose'))
          : [
            el('button', { type: 'button', class: 'btn btn-sm', onclick: async () => { await navigator.clipboard.writeText(it.url).catch(() => {}); toast(t('action.copied')); } }, t('action.copyUrl')),
            el('label', { class: 'btn btn-sm' }, t('action.replace'), replaceInput),
            el('button', {
              type: 'button', class: 'btn btn-sm btn-danger-ghost',
              onclick: async () => {
                if (!(await confirmDialog({ title: t('media.confirmDelete'), body: t('media.confirmDeleteBody'), confirmLabel: t('action.purge'), danger: true }))) return;
                try {
                  await call('media', 'delete', { path: it.path });
                } catch (err) {
                  if (err.status !== 409) { toast(errorText(err), 'error'); return; }
                  const force = await confirmDialog({ title: t('media.confirmDelete'), body: t('media.inUse', { refs: (err.details ?? []).join(', ') }), confirmLabel: t('action.purge'), danger: true });
                  if (!force) return;
                  await call('media', 'delete', { path: it.path, force: true }).catch((e2) => toast(errorText(e2), 'error'));
                }
                onChange?.();
              },
            }, t('action.purge')),
          ]));
  }));
}

function folderBar(folders, current, onSelect) {
  return el('div', { class: 'chips', role: 'group', 'aria-label': t('media.folder') },
    el('button', { type: 'button', class: 'chip', 'aria-pressed': String(!current), onclick: () => onSelect('') }, t('media.root')),
    folders.map((f) => el('button', { type: 'button', class: 'chip', dir: 'ltr', 'aria-pressed': String(current === f), onclick: () => onSelect(f) }, f)));
}

/** The media page. */
export async function mediaView() {
  const root = el('div', { class: 'view' });
  let folder = '';
  const status = el('p', { class: 'muted', role: 'status' });
  const listBox = el('div');
  const folderInput = field({ label: t('media.newFolder'), name: 'folder', value: 'uploads', hint: 'a-z, 0-9, -' });

  async function load() {
    clear(listBox).append(el('p', { class: 'muted' }, t('state.loading')));
    try {
      const top = await call('media', 'list', {});
      const folders = top.filter((i) => i.folder).map((i) => i.name);
      const items = folder ? await call('media', 'list', { folder }) : top;
      clear(listBox).append(folderBar(folders, folder, (f) => { folder = f; load(); }), grid(items, { onChange: load }));
    } catch (err) {
      clear(listBox).append(el('p', { class: 'state state-error', role: 'alert' }, errorText(err)));
    }
  }

  const upload = fileInput(async (files) => {
    const target = folderInput.querySelector('input').value.trim() || folder || 'uploads';
    await uploadMany(files, target, status);
    load();
  });
  root.append(
    el('h1', {}, t('media.title')),
    el('p', { class: 'muted' }, t('media.hint')),
    el('div', { class: 'toolbar' }, folderInput, el('label', { class: 'btn btn-primary' }, t('media.upload'), upload)),
    status,
    listBox);
  load();
  return root;
}

/** Opens the library and resolves with the chosen public URL (or null). */
export function pickImage() {
  return new Promise((resolve) => {
    let chosen = null;
    const body = el('div', { class: 'picker' });
    const status = el('p', { class: 'muted', role: 'status' });
    const { dlg, close } = openDialog(t('media.pick'), body, { wide: true });
    dlg.addEventListener('close', () => resolve(chosen));
    const pick = (it) => { chosen = it.url; close(); };
    const upload = fileInput(async (files) => {
      const [first] = await uploadMany(files.slice(0, 1), 'projects', status);
      if (first) { chosen = first.url; close(); }
    }, false);
    body.append(el('div', { class: 'toolbar' }, el('label', { class: 'btn btn-primary' }, t('media.upload'), upload), status), el('p', { class: 'muted' }, t('media.hint')));
    const listBox = el('div', {}, el('p', { class: 'muted' }, t('state.loading')));
    body.append(listBox);
    (async () => {
      try {
        const top = await call('media', 'list', {});
        const items = [...top.filter((i) => !i.folder)];
        for (const f of top.filter((i) => i.folder)) items.push(...await call('media', 'list', { folder: f.name }));
        clear(listBox).append(grid(items, { onPick: pick }));
      } catch (err) {
        clear(listBox).append(el('p', { class: 'state state-error', role: 'alert' }, errorText(err)));
      }
    })();
  });
}
