// Hartă 2D (relief + straturi) pe proiecția Mercator a hărților de relief (imagine statică, pentru ilustrații)
import { h, svg, loadAsset, clamp } from './dom.js';

export async function createMap2D(kind /* 'europe' | 'romania' */, { vw = 1000 } = {}) {
  const [asset, masks] = await Promise.all([loadAsset(kind === 'europe' ? 'terrain_europe' : 'terrain_romania'), loadAsset('masks')]);
  const b = asset.meta.bounds; const aspect = (b.my1 - b.my0) / (((b.lon1 - b.lon0) * Math.PI) / 180);
  const VW = vw, VH = Math.round(vw * aspect);
  const project = (lon, lat) => [((lon - b.lon0) / (b.lon1 - b.lon0)) * VW, ((b.my1 - Math.asinh(Math.tan((lat * Math.PI) / 180))) / (b.my1 - b.my0)) * VH];
  const unproject = (x, y) => { const my = b.my1 - (y / VH) * (b.my1 - b.my0); return [b.lon0 + (x / VW) * (b.lon1 - b.lon0), (Math.atan(Math.sinh(my)) * 180) / Math.PI]; };
  const land = kind === 'europe' ? masks.europe_land : masks.romania_land;
  const el = h('div', { class: 'map2d', style: { position: 'relative', width: '100%', aspectRatio: `${VW} / ${VH}`, borderRadius: '18px', overflow: 'hidden', background: kind === 'europe' ? '#0e2a52' : '#0d2a4d', border: '1px solid var(--line)' } });
  const base = h('img', { src: asset.color, alt: '', draggable: false, style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'fill', filter: 'saturate(.7) brightness(.62) contrast(1.05)' } });
  const overlay = h('div', { class: 'ov', style: { position: 'absolute', inset: 0, WebkitMaskImage: `url(${land})`, maskImage: `url(${land})`, WebkitMaskSize: '100% 100%', maskSize: '100% 100%', pointerEvents: 'none' } });
  const canvas = h('canvas', { style: { position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' } });
  const vec = svg('svg', { viewBox: `0 0 ${VW} ${VH}`, style: { position: 'absolute', inset: 0, width: '100%', height: '100%' } });
  const gBorders = svg('g'), gTop = svg('g'); vec.append(gBorders, gTop);
  el.append(base, overlay, canvas, vec);
  // borduri
  const addBorders = async () => {
    try {
      const bd = await loadAsset(kind === 'europe' ? 'borders_europe' : 'borders_romania'); const lines = bd.lines || bd.border || [];
      const pathD = (pl) => pl.map(([lo, la], i) => { const [x, y] = project(lo, la); return `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`; }).join('');
      gBorders.append(svg('path', { d: lines.map(pathD).join(''), fill: 'none', stroke: 'rgba(255,255,255,.55)', 'stroke-width': kind === 'europe' ? 0.8 : 1.6, 'vector-effect': 'non-scaling-stroke' }));
      if (kind === 'romania' && bd.neighbors) gBorders.append(svg('path', { d: bd.neighbors.map(pathD).join(''), fill: 'none', stroke: 'rgba(255,255,255,.22)', 'stroke-width': 1, 'vector-effect': 'non-scaling-stroke' }));
    } catch { /* fără granițe */ }
  };
  addBorders();
  const toPct = (lon, lat) => { const [x, y] = project(lon, lat); return [(x / VW) * 100, (y / VH) * 100]; };
  const addLabel = (lon, lat, text, cls = 'name', style = {}) => { const [px, py] = toPct(lon, lat); const d = h('div', { class: `lbl ${cls}`, style: { left: px + '%', top: py + '%', ...style } }, text); d.style.position = 'absolute'; el.appendChild(d); return d; };
  const outer = makePanZoom(el);
  return { el: outer, asset, VW, VH, bounds: b, project, unproject, overlay, canvas, vec, gTop, addLabel, toPct };
}

// Face harta statică trasabilă (drag), cu zoom (butoane, dublu-click, Ctrl/⌘ + rotiță, ciupire). Tot ce se adaugă în `outer` ajunge în scena care se mișcă.
function makePanZoom(stage) {
  const style = stage.style; const radius = style.borderRadius, border = style.border, bg = style.background, ar = style.aspectRatio;
  Object.assign(style, { position: 'absolute', inset: '0', width: '100%', height: '100%', aspectRatio: '', border: '0', borderRadius: '0', transformOrigin: '0 0', willChange: 'transform', overflow: 'visible' });
  const outer = h('div', { class: 'map2d-view', style: { position: 'relative', width: '100%', aspectRatio: ar, overflow: 'hidden', borderRadius: radius, border, background: bg, cursor: 'grab', userSelect: 'none', touchAction: 'pan-y' } });
  outer.append = (...n) => stage.append(...n); outer.appendChild = (n) => stage.appendChild(n);
  Element.prototype.appendChild.call(outer, stage);
  let k = 1, tx = 0, ty = 0;
  const apply = () => { const W = outer.clientWidth, H = outer.clientHeight; const mx = W * 0.25, my = H * 0.25; tx = Math.min(mx, Math.max(W * (1 - k) - mx, tx)); ty = Math.min(my, Math.max(H * (1 - k) - my, ty)); style.transform = `translate(${tx}px,${ty}px) scale(${k})`; outer.style.cursor = 'grab'; outer.style.touchAction = k > 1 ? 'none' : 'pan-y'; };
  const zoomAt = (f, cx, cy) => { const nk = Math.min(6, Math.max(1, k * f)); const r = nk / k; tx = cx - (cx - tx) * r; ty = cy - (cy - ty) * r; k = nk; apply(); };
  const center = () => [outer.clientWidth / 2, outer.clientHeight / 2];
  outer.addEventListener('wheel', (e) => { if (!(e.ctrlKey || e.metaKey)) return; e.preventDefault(); const r = outer.getBoundingClientRect(); zoomAt(Math.exp(-e.deltaY * 0.01), e.clientX - r.left, e.clientY - r.top); }, { passive: false });
  outer.addEventListener('dblclick', (e) => { const r = outer.getBoundingClientRect(); zoomAt(1.8, e.clientX - r.left, e.clientY - r.top); });
  let drag = null, moved = false; const pts = new Map(); let pinch = 0;
  outer.addEventListener('pointerdown', (e) => { if (e.target.closest('.m2d-btns')) return; pts.set(e.pointerId, [e.clientX, e.clientY]); drag = { x: e.clientX, y: e.clientY, tx, ty }; moved = false; if (pts.size === 2) { const [a, b2] = [...pts.values()]; pinch = Math.hypot(a[0] - b2[0], a[1] - b2[1]); } });
  outer.addEventListener('pointermove', (e) => {
    if (!pts.has(e.pointerId)) return; pts.set(e.pointerId, [e.clientX, e.clientY]);
    if (pts.size === 2) { const [a, b2] = [...pts.values()]; const d = Math.hypot(a[0] - b2[0], a[1] - b2[1]); const r = outer.getBoundingClientRect(); if (pinch) zoomAt(d / pinch, (a[0] + b2[0]) / 2 - r.left, (a[1] + b2[1]) / 2 - r.top); pinch = d; moved = true; return; }
    if (!drag) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!moved && Math.hypot(dx, dy) < 4) return; if (!moved) { moved = true; try { outer.setPointerCapture(e.pointerId); } catch { /* ok */ } outer.style.cursor = 'grabbing'; }
    tx = drag.tx + dx; ty = drag.ty + dy; apply();
  });
  const end = (e) => { pts.delete(e.pointerId); pinch = 0; drag = pts.size ? drag : null; if (k > 1) outer.style.cursor = 'grab'; };
  outer.addEventListener('pointerup', end); outer.addEventListener('pointercancel', end);
  outer.addEventListener('click', (e) => { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
  const btn = (t, title, fn) => h('button', { type: 'button', title, 'aria-label': title, onclick: (e) => { e.stopPropagation(); fn(); }, style: { width: '34px', height: '34px', font: '700 19px/1 var(--font)', color: 'var(--text)', background: 'var(--glass-strong)', border: '1px solid var(--line-strong)', borderRadius: '10px', cursor: 'pointer' } }, t);
  const btns = h('div', { class: 'm2d-btns', style: { position: 'absolute', top: '10px', left: '10px', display: 'flex', flexDirection: 'column', gap: '6px', zIndex: 5 } }, btn('+', 'Mărește', () => { const [cx, cy] = center(); zoomAt(1.5, cx, cy); }), btn('−', 'Micșorează', () => { const [cx, cy] = center(); zoomAt(1 / 1.5, cx, cy); }), btn('⤢', 'Vedere de ansamblu', () => { k = 1; tx = ty = 0; apply(); }));
  const hint = h('div', { style: { position: 'absolute', right: '10px', bottom: '10px', zIndex: 5, padding: '4px 10px', borderRadius: '9px', fontSize: '.72rem', color: 'var(--muted)', background: 'var(--glass-strong)', border: '1px solid var(--line-strong)', pointerEvents: 'none' } }, 'Trage ca să te miști · dublu-click = zoom');
  Element.prototype.appendChild.call(outer, btns); Element.prototype.appendChild.call(outer, hint);
  new ResizeObserver(apply).observe(outer);
  return outer;
}

// ---------- particule de vânt pe canvas (în pixeli de ecran) ----------
export function windParticles(map, field, { count = 1600, trail = 0.9, speed = 1 } = {}) {
  const cv = map.canvas; let ctx = cv.getContext('2d'); let W = 0, H = 0, raf = 0; let parts = []; let running = true; let last = 0;
  const resize = () => { const r = cv.getBoundingClientRect(); const d = Math.min(2, window.devicePixelRatio || 1); W = Math.max(2, Math.round(r.width * d)); H = Math.max(2, Math.round(r.height * d)); cv.width = W; cv.height = H; };
  const ro = new ResizeObserver(resize); ro.observe(cv); resize();
  const seed = (p) => { p.x = Math.random() * W; p.y = Math.random() * H; p.age = Math.random() * 120; p.life = 80 + Math.random() * 120; };
  parts = Array.from({ length: count }, () => { const p = {}; seed(p); return p; });
  const loop = (t) => {
    if (!running) return; raf = requestAnimationFrame(loop);
    const dt = Math.min(0.05, (t - last) / 1000 || 0.016); last = t;
    ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = `rgba(0,0,0,${1 - trail})`; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over';
    ctx.lineWidth = Math.max(1.6, W / 520); ctx.lineCap = 'round';
    for (const p of parts) {
      const nx = p.x / W, ny = p.y / H; const f = field(nx, ny); // [vx, vy, r,g,b]
      const px = p.x, py = p.y; p.x += f[0] * speed * dt * W * 0.06; p.y += f[1] * speed * dt * W * 0.06; p.age += 1;
      if (p.age > p.life || p.x < 0 || p.x > W || p.y < 0 || p.y > H) { seed(p); continue; }
      const a = Math.sin(Math.PI * clamp(p.age / p.life, 0, 1));
      ctx.strokeStyle = `rgba(${f[2]},${f[3]},${f[4]},${Math.min(1, 1.15 * a).toFixed(2)})`; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(p.x, p.y); ctx.stroke();
    }
  };
  raf = requestAnimationFrame(loop);
  return { stop() { running = false; cancelAnimationFrame(raf); ro.disconnect(); }, clear() { ctx.clearRect(0, 0, W, H); }, setCount(n) { parts.length = 0; for (let i = 0; i < n; i++) { const p = {}; seed(p); parts.push(p); } } };
}
