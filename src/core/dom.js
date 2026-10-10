// Utilitare DOM minimaliste (fără framework)
const SVGNS = 'http://www.w3.org/2000/svg';

// append()/prepend() nativ scrie „null” ca text și nu acceptă liste: le facem tolerante (ignoră null/false, aplatizează liste)
(function patchAppend() {
  const clean = (nodes) => nodes.flat(Infinity).filter((n) => n != null && n !== false);
  for (const P of [Element.prototype, DocumentFragment.prototype]) {
    for (const m of ['append', 'prepend']) {
      const orig = P[m]; if (!orig || orig.__patched) continue;
      const fn = function (...nodes) { return orig.apply(this, clean(nodes)); }; fn.__patched = true; P[m] = fn;
    }
  }
  const rc = Element.prototype.replaceChildren;
  if (rc && !rc.__patched) { const fn = function (...nodes) { return rc.apply(this, clean(nodes)); }; fn.__patched = true; Element.prototype.replaceChildren = fn; }
})();

// Object.assign(el.style, …) ignoră variabilele CSS („--x”): le setăm explicit cu setProperty
function setStyle(el, obj) {
  for (const [k, v] of Object.entries(obj)) {
    if (v == null || v === false) continue;
    if (k.startsWith('--')) el.style.setProperty(k, String(v)); else el.style[k] = v;
  }
}

export function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  applyAttrs(el, attrs);
  appendKids(el, kids);
  return el;
}
export function svg(tag, attrs, ...kids) {
  const el = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'class') el.setAttribute('class', v);
    else if (k === 'style' && typeof v === 'object') setStyle(el, v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  appendKids(el, kids);
  return el;
}
function applyAttrs(el, attrs) {
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'style' && typeof v === 'object') setStyle(el, v);
    else if (k === 'style') el.setAttribute('style', v);
    else if (k === 'html') el.innerHTML = v;
    else if (k === 'dataset') Object.assign(el.dataset, v);
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'value' || k === 'checked' || k === 'disabled' || k === 'selected' || k === 'min' || k === 'max' || k === 'step' || k === 'type' || k === 'placeholder' || k === 'id' || k === 'href' || k === 'title' || k === 'name') {
      try { el[k] = v; } catch { el.setAttribute(k, v); }
    } else el.setAttribute(k, v === true ? '' : v);
  }
}
function appendKids(el, kids) {
  for (const kid of kids.flat(Infinity)) {
    if (kid == null || kid === false) continue;
    el.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
  }
}
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
export function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); return el; }
export function html(str) { const t = document.createElement('template'); t.innerHTML = str.trim(); return t.content.firstElementChild; }

export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const easeInOut = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOut = (t) => 1 - Math.pow(1 - t, 3);
export const rand = (a, b) => a + Math.random() * (b - a);
export const randInt = (a, b) => Math.floor(rand(a, b + 1));
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
export function shuffle(arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export function debounce(fn, ms = 120) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }
export function throttleRaf(fn) { let queued = false, last; return (...a) => { last = a; if (queued) return; queued = true; requestAnimationFrame(() => { queued = false; fn(...last); }); }; }
export const fmt = (n, d = 0) => Number(n).toLocaleString('ro-RO', { minimumFractionDigits: d, maximumFractionDigits: d });
export const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const norm = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[ăâ]/g, 'a').replace(/î/g, 'i').replace(/[șş]/g, 's').replace(/[țţ]/g, 't').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();

// Încarcă un fișier .js de date (merge și din file://) – folosit pentru texturile/datele mari
const _loaded = {};
export function loadAsset(name) {
  window.GEO_ASSETS = window.GEO_ASSETS || {};
  if (window.GEO_ASSETS[name]) return Promise.resolve(window.GEO_ASSETS[name]);
  if (_loaded[name]) return _loaded[name];
  _loaded[name] = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = `assets/${name}.js`;
    s.onload = () => (window.GEO_ASSETS[name] ? resolve(window.GEO_ASSETS[name]) : reject(new Error('Asset gol: ' + name)));
    s.onerror = () => { delete _loaded[name]; reject(new Error('Nu pot încărca assets/' + name + '.js')); };
    document.head.appendChild(s);
  });
  return _loaded[name];
}
export function b64ToBytes(dataUri) {
  const b64 = dataUri.slice(dataUri.indexOf(',') + 1);
  const bin = atob(b64); const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
export function loadImage(src) {
  return new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src; });
}
