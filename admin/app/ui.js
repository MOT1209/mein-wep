// Small DOM helpers. Text always goes in through textContent or attributes,
// never innerHTML, so nothing from the database can become markup.
import { t } from './i18n.js';

/**
 * el('button', { class: 'btn', onclick: fn, type: 'button' }, 'Save')
 * Attributes: class, text, html is NOT supported on purpose; on* become
 * listeners; boolean false/null/undefined skip the attribute.
 */
export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === false || v === null || v === undefined) continue;
    if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else if (k === 'class') node.className = v;
    else if (k === 'dataset') Object.assign(node.dataset, v);
    else if (k === 'value' && 'value' in node) node.value = v;
    else if (k === 'checked' || k === 'selected' || k === 'disabled' || k === 'hidden') node[k] = !!v;
    else node.setAttribute(k, v === true ? '' : String(v));
  }
  append(node, children);
  return node;
}

export function append(node, children) {
  for (const c of children.flat(Infinity)) {
    if (c === null || c === undefined || c === false) continue;
    node.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return node;
}

export function clear(node) {
  while (node.firstChild) node.firstChild.remove();
  return node;
}

// --- feedback -------------------------------------------------------------

let toastBox;
export function toast(message, kind = 'ok') {
  toastBox ??= document.getElementById('toasts');
  const item = el('div', { class: `toast toast-${kind}`, role: kind === 'error' ? 'alert' : 'status' }, message);
  toastBox.append(item);
  setTimeout(() => item.remove(), kind === 'error' ? 8000 : 4000);
}

export function errorText(err) {
  if (!err) return t('error.generic');
  if (err.status === 0) return t('error.network');
  if (err.status === 503 && /migration/i.test(err.message)) return t('error.migration');
  return err.message || t('error.generic');
}

export const loading = () => el('p', { class: 'state state-loading', role: 'status' }, el('span', { class: 'spinner', 'aria-hidden': 'true' }), t('state.loading'));
export const empty = (text) => el('div', { class: 'state state-empty' }, text || t('state.empty'));
export function failure(err, retry) {
  return el('div', { class: 'state state-error', role: 'alert' },
    el('p', {}, errorText(err)),
    retry ? el('button', { type: 'button', class: 'btn', onclick: retry }, t('action.retry')) : null);
}

/** Runs an async action with a busy button and a toast. */
export async function busy(button, fn, successText) {
  const label = button?.textContent;
  if (button) { button.disabled = true; button.setAttribute('aria-busy', 'true'); }
  try {
    const r = await fn();
    if (successText) toast(successText, 'ok');
    return r;
  } catch (err) {
    toast(errorText(err), 'error');
    throw err;
  } finally {
    if (button) { button.disabled = false; button.removeAttribute('aria-busy'); button.textContent = label; }
  }
}

// --- dialogs ---------------------------------------------------------------

/** Native <dialog>; resolves true/false. Destructive actions say what happens. */
export function confirmDialog({ title, body, confirmLabel, danger = false }) {
  return new Promise((resolve) => {
    const dlg = el('dialog', { class: 'dialog', 'aria-labelledby': 'dlg-title' },
      el('h2', { id: 'dlg-title' }, title),
      body ? el('p', {}, body) : null,
      el('div', { class: 'dialog-actions' },
        el('button', { type: 'button', class: 'btn', value: 'cancel', onclick: () => dlg.close('cancel') }, t('action.cancel')),
        el('button', { type: 'button', class: `btn ${danger ? 'btn-danger' : 'btn-primary'}`, onclick: () => dlg.close('ok') }, confirmLabel || t('action.confirm'))));
    dlg.addEventListener('close', () => { resolve(dlg.returnValue === 'ok'); dlg.remove(); });
    document.body.append(dlg);
    dlg.showModal();
  });
}

/** A dialog with arbitrary content; returns { dlg, close }. */
export function openDialog(title, content, { wide = false } = {}) {
  const dlg = el('dialog', { class: `dialog${wide ? ' dialog-wide' : ''}`, 'aria-labelledby': 'dlg2-title' },
    el('div', { class: 'dialog-head' },
      el('h2', { id: 'dlg2-title' }, title),
      el('button', { type: 'button', class: 'btn btn-icon', 'aria-label': t('action.close'), onclick: () => dlg.close() }, '×')),
    content);
  dlg.addEventListener('close', () => dlg.remove());
  document.body.append(dlg);
  dlg.showModal();
  return { dlg, close: () => dlg.close() };
}

// --- forms -----------------------------------------------------------------

let uid = 0;
/** Labelled field. type: text | textarea | select | checkbox | number | url | datetime-local */
export function field({ label, name, type = 'text', value, options, hint, required, rows, dir, placeholder }) {
  const id = `f-${name}-${(uid += 1)}`;
  let input;
  if (type === 'textarea') {
    input = el('textarea', { id, name, rows: rows || 4, required, dir, placeholder });
    input.value = value ?? '';
  } else if (type === 'select') {
    input = el('select', { id, name, required },
      options.map((o) => el('option', { value: o.value, selected: String(o.value) === String(value ?? '') }, o.label)));
  } else if (type === 'checkbox') {
    input = el('input', { id, name, type: 'checkbox', checked: !!value });
    return el('div', { class: 'field field-check' }, input, el('label', { for: id }, label), hint ? el('p', { class: 'hint' }, hint) : null);
  } else {
    input = el('input', { id, name, type, value: value ?? '', required, dir, placeholder, inputmode: type === 'url' ? 'url' : undefined });
  }
  return el('div', { class: 'field' }, el('label', { for: id }, label, required ? el('span', { class: 'req', 'aria-hidden': 'true' }, ' *') : null), input,
    hint ? el('p', { class: 'hint' }, hint) : null);
}

/** Reads named inputs of a form into an object (checkbox -> boolean). */
export function readForm(form) {
  const out = {};
  for (const input of form.querySelectorAll('[name]')) {
    if (input.type === 'checkbox') out[input.name] = input.checked;
    else out[input.name] = input.value;
  }
  return out;
}

export const lines = (s) => String(s ?? '').split('\n').map((x) => x.trim()).filter(Boolean);
export const commas = (s) => String(s ?? '').split(',').map((x) => x.trim()).filter(Boolean);

export function badge(text, tone = '') {
  return el('span', { class: `badge${tone ? ` badge-${tone}` : ''}` }, text);
}

export function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString(document.documentElement.lang || undefined, { dateStyle: 'medium', timeStyle: 'short' });
}
