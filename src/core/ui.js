import { h, html, clear, $, norm, escapeHtml } from './dom.js';
import { icon } from './icons.js';
import * as store from './store.js';

export const ic = (name, cls) => html(icon(name, cls));
export const iconHTML = icon;

const root = () => document.getElementById('overlay-root');

// ---------- Toast ----------
let toastBox;
export function toast({ icon: ico = 'sparkle', title, text }) {
  if (!toastBox) { toastBox = h('div', { class: 'toasts' }); document.body.appendChild(toastBox); }
  const t = h('div', { class: 'toast' }, h('span', { class: 'ico', html: icon(ico) }), h('div', null, h('div', null, title), text ? h('small', null, text) : null));
  toastBox.appendChild(t);
  setTimeout(() => { t.style.transition = 'opacity .4s, transform .4s'; t.style.opacity = '0'; t.style.transform = 'translateY(8px)'; setTimeout(() => t.remove(), 420); }, 3400);
}
store.setToast(toast);

// ---------- Modal ----------
export function modal(content, { onClose } = {}) {
  const back = h('div', { class: 'modal-back', onclick: (e) => { if (e.target === back) close(); } });
  const box = h('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true' }, content);
  back.appendChild(box); root().appendChild(back);
  const esc = (e) => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', esc);
  function close() { document.removeEventListener('keydown', esc); back.remove(); onClose && onClose(); }
  return { close, box };
}

// ---------- Componente mici ----------
export function srcTag(code) {
  const map = {
    U: ['u', 'U', 'Din caietul tău (pix albastru)'],
    C: ['c', 'C', 'Din caietul colegului'],
    F: ['f', 'F', 'De pe fișele color despre climă'],
    X: ['x', '+', 'Completare din cunoștințe generale (nu e din caiete)'],
  };
  return code.split('').map((ch) => { const [cls, txt, tt] = map[ch] || ['x', ch, '']; return h('span', { class: `src ${cls}`, title: tt }, txt); });
}
export function callout(kind, ...kids) {
  const ico = kind === 'warn' ? 'alert' : kind === 'good' ? 'check' : 'info';
  return h('div', { class: `callout ${kind === 'info' ? '' : kind}` }, h('span', { html: icon(ico) }), h('div', null, ...kids));
}
export function chip(label, { active = false, color, onClick, dot = false } = {}) {
  const c = h('button', { class: `chip${active ? ' active' : ''}`, style: color ? { '--chip': color } : null, type: 'button', onclick: onClick }, dot ? h('span', { class: 'dot' }) : null, label);
  return c;
}
export function tabs(items, active, onSelect) {
  const wrap = h('div', { class: 'tabs', role: 'tablist' });
  const btns = items.map((it) => {
    const b = h('button', { class: `tab${it.id === active ? ' active' : ''}`, type: 'button', role: 'tab', onclick: () => { btns.forEach((x) => x.classList.remove('active')); b.classList.add('active'); onSelect(it.id); } }, it.label);
    return b;
  });
  wrap.append(...btns);
  return wrap;
}
export function ring(pct, size = 74, label) {
  const r = h('div', { class: 'ring', style: { '--size': size + 'px', '--p': Math.round(pct) } }, h('b', null, label ?? `${Math.round(pct)}%`));
  return r;
}
export function bar(pct) { return h('div', { class: 'bar' }, h('i', { style: { '--w': Math.max(0, Math.min(100, pct)) + '%' } })); }
export function setRangeFill(input) {
  const f = () => { const p = ((input.value - input.min) / (input.max - input.min)) * 100; input.style.setProperty('--fill', p + '%'); };
  input.addEventListener('input', f); f(); return input;
}
export function rangeField(label, { min, max, step = 1, value, onInput, format = (v) => v }) {
  const out = h('b', { class: 'num-big' }, format(value));
  const inp = h('input', { type: 'range', min, max, step, value, oninput: (e) => { out.textContent = format(+e.target.value); onInput && onInput(+e.target.value); } });
  setRangeFill(inp);
  return h('div', { class: 'field' }, h('label', { style: { display: 'flex', justifyContent: 'space-between' } }, h('span', null, label), out), inp);
}
export function toggle(label, checked, onChange) {
  const inp = h('input', { type: 'checkbox', checked, onchange: (e) => onChange(e.target.checked) });
  return h('label', { class: 'switch' }, inp, h('span', { class: 'track' }), h('span', null, label));
}
// număr animat
export function countUp(el, to, { dur = 1100, dec = 0, suffix = '' } = {}) {
  const start = performance.now(); const from = 0;
  const f = (t) => {
    const p = Math.min(1, (t - start) / dur); const e = 1 - Math.pow(1 - p, 3);
    el.textContent = (from + (to - from) * e).toLocaleString('ro-RO', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suffix;
    if (p < 1) requestAnimationFrame(f);
  };
  requestAnimationFrame(f);
}
// apare la scroll
export function revealOnScroll(container) {
  const els = container.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('in')); return () => {}; }
  const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { root: container.closest('.view') || null, threshold: 0.12 });
  els.forEach((e) => io.observe(e));
  return () => io.disconnect();
}
export function pageHead({ eyebrow, title, lead, actions }) {
  return h('div', { class: 'page-head' },
    h('div', null,
      eyebrow ? h('div', { class: 'eyebrow' }, eyebrow) : null,
      h('h1', null, title),
      lead ? h('p', { class: 'lead' }, lead) : null),
    actions ? h('div', { class: 'actions' }, actions) : null);
}

// ---------- Căutare globală (⌘K) ----------
let searchIndex = [];
export function setSearchIndex(arr) { searchIndex = arr; }
export function openPalette(go) {
  let sel = 0; let results = [];
  const input = h('input', { type: 'search', placeholder: 'Caută o unitate de relief, un vânt, o zonă de climă, o cifră…', autofocus: true, 'aria-label': 'Căutare' });
  const list = h('ul');
  const box = h('div', { class: 'palette' }, input, list);
  const back = h('div', { class: 'modal-back', style: { alignItems: 'start', paddingTop: '12vh' }, onclick: (e) => { if (e.target === back) close(); } }, box);
  root().appendChild(back);
  const close = () => { document.removeEventListener('keydown', onKey, true); back.remove(); };
  function render() {
    clear(list);
    const q = norm(input.value);
    if (!q) results = searchIndex.filter((x) => x.kind === 'Pagină').slice(0, 12);
    else {
      const toks = q.split(' ').filter(Boolean);
      results = searchIndex.map((x) => {
        const hay = x._n || (x._n = norm(x.title + ' ' + (x.text || '')));
        const tn = x._t || (x._t = norm(x.title));
        if (!toks.every((t) => hay.includes(t))) return null;
        let score = 0; toks.forEach((t) => { if (tn.startsWith(t)) score += 6; else if (tn.includes(t)) score += 3; else score += 1; });
        return { x, score };
      }).filter(Boolean).sort((a, b) => b.score - a.score).slice(0, 40).map((r) => r.x);
    }
    sel = Math.min(sel, Math.max(0, results.length - 1));
    if (!results.length) list.appendChild(h('li', { style: { color: 'var(--muted)' } }, 'Niciun rezultat. Încearcă alt cuvânt (ex.: „foehn”, „Moldoveanu”, „oceanic”).'));
    results.forEach((r, i) => {
      const li = h('li', { class: i === sel ? 'sel' : '', onclick: () => { close(); go(r.href); }, onmousemove: () => { sel = i; [...list.children].forEach((c, j) => c.classList.toggle('sel', j === i)); } },
        h('span', { html: icon(r.icon || 'search'), style: { width: '20px', color: 'var(--accent)' } }),
        h('div', null, h('b', null, r.title), r.text ? h('small', null, r.text.length > 110 ? r.text.slice(0, 108) + '…' : r.text) : null),
        h('span', { class: 'kind' }, r.kind));
      list.appendChild(li);
    });
  }
  function onKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(results.length - 1, sel + 1); render(); list.children[sel] && list.children[sel].scrollIntoView({ block: 'nearest' }); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(0, sel - 1); render(); list.children[sel] && list.children[sel].scrollIntoView({ block: 'nearest' }); }
    else if (e.key === 'Enter') { e.preventDefault(); const r = results[sel]; if (r) { close(); go(r.href); } }
  }
  document.addEventListener('keydown', onKey, true);
  input.addEventListener('input', () => { sel = 0; render(); });
  render(); setTimeout(() => input.focus(), 30);
}

// ---------- Sunete mici (WebAudio), opționale ----------
let actx;
export function beep(kind = 'ok') {
  if (!store.get().settings.sound) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const o = actx.createOscillator(), g = actx.createGain(); o.connect(g); g.connect(actx.destination);
    const now = actx.currentTime;
    const seq = kind === 'ok' ? [[660, 0], [880, 0.09]] : kind === 'bad' ? [[200, 0], [150, 0.1]] : [[520, 0]];
    o.type = kind === 'bad' ? 'sawtooth' : 'sine';
    g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(0.12, now + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
    seq.forEach(([f, t]) => o.frequency.setValueAtTime(f, now + t));
    o.start(now); o.stop(now + 0.3);
  } catch { /* ignorăm */ }
}
export function confetti(x = window.innerWidth / 2, y = window.innerHeight / 3, n = 36) {
  const cols = ['#5eead4', '#8b9cff', '#ff7aa8', '#ffb454', '#4ade80'];
  for (let i = 0; i < n; i++) {
    const p = h('i', { style: { position: 'fixed', left: x + 'px', top: y + 'px', width: '8px', height: '12px', background: cols[i % cols.length], borderRadius: '2px', zIndex: 200, pointerEvents: 'none' } });
    document.body.appendChild(p);
    const a = Math.random() * Math.PI * 2, v = 5 + Math.random() * 9; let vx = Math.cos(a) * v, vy = Math.sin(a) * v - 6, px = 0, py = 0, rot = 0, life = 0;
    const step = () => { life++; vy += 0.36; px += vx; py += vy; rot += vx * 2; p.style.transform = `translate(${px}px,${py}px) rotate(${rot}deg)`; p.style.opacity = String(Math.max(0, 1 - life / 70)); if (life < 70) requestAnimationFrame(step); else p.remove(); };
    requestAnimationFrame(step);
  }
}
