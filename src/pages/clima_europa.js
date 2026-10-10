import { h, svg, clear, clamp, fmt, rand, randInt } from '../core/dom.js';
import { ic, srcTag, callout, pageHead, tabs, rangeField, toggle, toast, beep, confetti, revealOnScroll } from '../core/ui.js';
import * as store from '../core/store.js';
import { createMap2D, windParticles } from '../core/map2d.js';
import { FACTORS, TEMPS, PRECIP, WINDS, CENTERS, CENTER_NOTE, LAPSE, BRIZA } from '../data/clima.js';

const sec = (title, ...kids) => h('section', { class: 'reveal', style: { marginTop: '26px' } }, h('h2', null, title), ...kids);

// ============================================================ 1. FACTORI
function tabFactori() {
  const el = h('div');
  const cards = Object.values(FACTORS).map((f) => h('div', { class: 'card', style: { borderTop: `3px solid ${f.color}` } },
    h('div', { class: 'row', style: { gap: '10px', marginBottom: '8px' } }, h('span', { html: '', style: { width: '26px', color: f.color } }, ic(f.icon)), h('h3', { style: { margin: 0 } }, f.name)),
    h('ul', { style: { margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '8px' } }, f.items.map((it) => h('li', null, h('b', null, it.t), it.d ? ': ' + it.d : '', ' ', srcTag(it.src))))));
  el.append(h('div', { class: 'grid c3' }, cards));

  // --- Soarele și latitudinea
  const W = 760, Hh = 360, cx = 560, cy = 180, R = 150;
  const s = svg('svg', { viewBox: `0 0 ${W} ${Hh}`, style: { width: '100%', height: 'auto', background: 'radial-gradient(500px 260px at 15% 50%, rgba(255,200,80,.18), transparent 70%)', borderRadius: '16px' } });
  const rays = svg('g'); const earth = svg('g'); s.append(rays, earth);
  earth.append(svg('circle', { cx, cy, r: R, fill: 'color-mix(in srgb, var(--accent-2) 22%, var(--surface))', stroke: 'var(--line-strong)' }));
  earth.append(svg('line', { x1: cx - R, x2: cx + R, y1: cy, y2: cy, stroke: 'var(--warm)', 'stroke-dasharray': '5 5', opacity: 0.8 }), svg('text', { x: cx + R + 8, y: cy + 4, fill: 'var(--warm)', 'font-size': 12 }, 'Ecuator'));
  const info = h('div', { class: 'card tight', style: { minHeight: '120px' } });
  const range = rangeField('Latitudinea (°N)', { min: 0, max: 80, step: 1, value: 45, format: (v) => v + '°', onInput: (v) => draw(v) });
  function klass(lat) { return lat < 42 ? ['140–160 kcal/cm²', 'în S', 'var(--warm)'] : lat < 62 ? ['80–140 kcal/cm²', 'zona temperată', 'var(--ok)'] : ['sub 80 kcal/cm²', 'zona rece', 'var(--info)']; }
  function draw(lat) {
    clear(rays); const a = lat * Math.PI / 180; const pt = [cx + R * Math.cos(a), cy - R * Math.sin(a)]; const bw = 40; // lățimea fasciculului
    // raze paralele orizontale, fascicul îngroșat în dreptul punctului
    for (let i = -4; i <= 4; i++) { const y = pt[1] + i * (bw / 4); const dy = y - cy; const x2 = Math.abs(dy) < R ? cx - Math.sqrt(R * R - dy * dy) : cx - 8; rays.append(svg('line', { x1: 40, x2, y1: y, y2: y, stroke: '#ffcf5a', 'stroke-width': 2, opacity: 0.85 })); }
    // suprafața pe care cade fasciculul
    const tx = -Math.sin(a), ty = -Math.cos(a); const L = bw / Math.cos(a); const p1 = [pt[0] - tx * L / 2, pt[1] - ty * L / 2], p2 = [pt[0] + tx * L / 2, pt[1] + ty * L / 2];
    rays.append(svg('line', { x1: p1[0], y1: p1[1], x2: p2[0], y2: p2[1], stroke: '#ff7a45', 'stroke-width': 7, 'stroke-linecap': 'round' }), svg('text', { x: pt[0] + 14, y: pt[1] - 10, fill: '#ff9c6a', 'font-size': 13, 'font-weight': 800 }, `suprafață ×${(1 / Math.cos(a)).toFixed(2)}`));
    rays.append(svg('text', { x: 40, y: 28, fill: 'var(--muted)', 'font-size': 12, 'font-weight': 700 }, 'Raze solare paralele (aceeași cantitate de energie)'));
    rays.append(svg('circle', { cx: 24, cy: cy, r: 16, fill: '#ffd04a' }));
    const [rad, zone, col] = klass(lat); clear(info);
    info.append(h('div', { class: 'hint' }, 'Radiația solară la această latitudine (după caiet)'), h('div', { class: 'num-big', style: { fontSize: '1.6rem', color: col } }, rad), h('div', { style: { fontWeight: 700 } }, zone), h('p', { style: { margin: '8px 0 0', fontSize: '.9rem', color: 'var(--muted)' } }, 'Cu cât mergi spre nord, aceeași cantitate de energie se împarte pe o suprafață mai mare și razele cad mai oblic – de aceea ', h('b', null, 'bilanțul radiativ scade de la S spre N'), ' (Europa și România). ', srcTag('UC'), ' Explicația cu fasciculul: ', srcTag('X')));
  }
  draw(45);
  el.append(sec('Radiația solară și latitudinea', h('div', { class: 'grid c2', style: { alignItems: 'start' } }, h('div', { class: 'card' }, s, range), info)));

  // --- barele de valori din caiet
  el.append(sec('Cifrele de reținut', h('div', { class: 'grid c3' },
    h('div', { class: 'card tight' }, h('div', { class: 'hint' }, 'Radiația solară'), h('div', { class: 'num-big', style: { fontSize: '1.15rem' } }, '140–160 → 80–140 → sub 80'), h('div', { class: 'hint' }, 'kcal/cm² – în S / temperat / rece')),
    h('div', { class: 'card tight' }, h('div', { class: 'hint' }, 'Relief: altitudine'), h('div', { class: 'num-big', style: { fontSize: '1.15rem' } }, `−${LAPSE.tPer100m} °C la 100 m`), h('div', { class: 'hint' }, 'temperatura scade cu altitudinea')),
    h('div', { class: 'card tight' }, h('div', { class: 'hint' }, 'Hidrografie și vegetație'), h('div', { class: 'num-big', style: { fontSize: '1.15rem' } }, 'moderează t°'), h('div', { class: 'hint' }, 'reglează / moderează temperatura')))));
  return { el, destroy() {} };
}

// ============================================================ 2. TEMPERATURA
function tabTemperatura() {
  const el = h('div');
  // --- S → N
  const T = TEMPS; const lerp = (a, b, t) => a + (b - a) * t;
  const gauge = (label, v, min, max, color) => { const pct = clamp(((v - min) / (max - min)) * 100, 0, 100); return h('div', { class: 'card tight' }, h('div', { class: 'hint' }, label), h('div', { class: 'num-big', style: { fontSize: '1.7rem', color } }, `${v.toFixed(1)} °C`), h('div', { class: 'bar', style: { marginTop: '8px' } }, h('i', { style: { '--w': pct + '%' } }))); };
  const out = h('div', { class: 'grid c4', style: { marginTop: '10px' } });
  const range = rangeField('Mergi de la sud (36° N – Mediterana) spre nord (71° N – subpolar)', { min: 0, max: 100, step: 1, value: 0, format: (v) => `${Math.round(36 + v * 0.35)}° N`, onInput: (v) => draw(v / 100) });
  function draw(t) {
    clear(out); const tma = lerp(T.tma.south, T.tma.north, t), ian = lerp(T.ian.south, T.ian.north, t), iul = lerp(T.iul.south, T.iul.north, t);
    out.append(gauge('T.M.A.', tma, -10, 24, 'var(--accent)'), gauge('t medie ianuarie', ian, -25, 15, 'var(--info)'), gauge('t medie iulie', iul, 5, 30, 'var(--warm)'),
      h('div', { class: 'card tight' }, h('div', { class: 'hint' }, 'Amplitudine termică (iul − ian)'), h('div', { class: 'num-big', style: { fontSize: '1.7rem', color: 'var(--pink)' } }, `${(iul - ian).toFixed(1)} °C`), h('div', { class: 'hint', style: { marginTop: '6px' } }, 'mare = continental, mică = oceanic')));
  }
  draw(0);
  el.append(sec('Temperatura în Europa: de la sud la nord', h('p', { style: { color: 'var(--muted)', maxWidth: '75ch' } }, 'Valorile extreme din caiet: ', h('b', null, 'T.M.A. +18 °C (sud) → −4 °C (nord)'), ' · ianuarie +10 → −20 °C · iulie 25 → 15 °C. Cursorul face o interpolare simplă între cele două capete (doar ca să simți tendința). ', srcTag('U')),
    h('div', { class: 'card' }, range, out), h('div', { class: 'table-wrap', style: { marginTop: '14px' } }, h('table', { class: 'table' }, h('thead', null, h('tr', null, ['', 'Sud (sud-mediteranean)', 'Nord (nord-subpolar)'].map((x) => h('th', null, x)))), h('tbody', null,
      h('tr', null, h('td', null, 'T.M.A.'), h('td', null, '+18 °C'), h('td', null, '−4 °C')), h('tr', null, h('td', null, 't medie ianuarie'), h('td', null, '+10 °C'), h('td', null, '−20 °C')), h('tr', null, h('td', null, 't medie iulie'), h('td', null, '25 °C'), h('td', null, '15 °C')))))));

  // --- calculator altitudine
  const t0 = h('input', { type: 'number', value: 18, step: 0.5, style: { maxWidth: '110px' } });
  const altR = rangeField('Altitudinea locului', { min: 0, max: 5000, step: 50, value: 2000, format: (v) => `${fmt(v)} m`, onInput: () => calc() });
  const res = h('div', { class: 'card tight', style: { flex: 1 } }); const mount = svg('svg', { viewBox: '0 0 480 220', style: { width: '100%', height: 'auto' } });
  function calc() {
    const alt = +altR.querySelector('input').value; const base = +t0.value; const t = base - (alt / 100) * LAPSE.tPer100m; const snow = base > 0 ? Math.round((base / LAPSE.tPer100m) * 100) : 0;
    clear(res); res.append(h('div', { class: 'hint' }, 'Temperatura la altitudinea aleasă'), h('div', { class: 'num-big', style: { fontSize: '2rem', color: t < 0 ? 'var(--info)' : 'var(--warm)' } }, `${t.toFixed(1)} °C`),
      h('div', { style: { fontSize: '.9rem', color: 'var(--muted)', marginTop: '6px' } }, `${base} − (${fmt(alt)} ÷ 100) × ${LAPSE.tPer100m} = ${t.toFixed(1)} °C`), h('div', { class: 'hint', style: { marginTop: '6px' } }, base > 0 ? `Temperatura medie ajunge sub 0 °C de la ≈ ${fmt(snow)} m în sus.` : 'Deja sub 0 °C la nivelul mării.'));
    clear(mount); const x = (a) => 20 + (a / 5000) * 440; const hy = (a) => 200 - (a / 5000) * 170;
    mount.append(svg('defs', null, svg('linearGradient', { id: 'mg', x1: 0, x2: 0, y1: 0, y2: 1 }, svg('stop', { offset: '0%', 'stop-color': '#fff' }), svg('stop', { offset: '40%', 'stop-color': '#a8b8d8' }), svg('stop', { offset: '100%', 'stop-color': '#3f8a5a' }))));
    mount.append(svg('path', { d: 'M20,200 L170,60 L230,110 L300,34 L460,200 Z', fill: 'url(#mg)', opacity: 0.9 }), svg('line', { x1: 14, x2: 466, y1: hy(alt), y2: hy(alt), stroke: 'var(--accent)', 'stroke-dasharray': '6 5', 'stroke-width': 2 }), svg('text', { x: 24, y: hy(alt) - 6, fill: 'var(--accent)', 'font-size': 13, 'font-weight': 800 }, `${fmt(alt)} m → ${t.toFixed(1)} °C`));
    if (base > 0 && snow < 5000) mount.append(svg('line', { x1: 14, x2: 466, y1: hy(snow), y2: hy(snow), stroke: '#8ec9ff', 'stroke-dasharray': '2 5' }), svg('text', { x: 466, y: hy(snow) - 5, 'text-anchor': 'end', fill: '#8ec9ff', 'font-size': 11 }, '0 °C'));
  }
  t0.addEventListener('input', calc); calc();
  el.append(sec('Calculator: relieful scade temperatura', h('div', { class: 'card' }, h('div', { class: 'grid c2', style: { alignItems: 'center' } }, h('div', { class: 'stack' }, h('div', { class: 'field' }, h('label', null, 'Temperatura la nivelul mării (°C)'), t0), altR, res), h('div', null, mount)),
    h('div', { class: 'callout', style: { marginTop: '14px' } }, ic('info'), h('div', null, h('b', null, 'Regula din caiet: '), `la fiecare 100 m în sus, temperatura scade cu ${LAPSE.tPer100m} °C. `, srcTag('UC'))))));

  // --- exerciții
  const exWrap = h('div', { class: 'card' }); let ex = null; let okCount = 0, tot = 0;
  const newEx = () => { const base = randInt(8, 26), alt = randInt(3, 38) * 100; ex = { base, alt, ans: +(base - alt / 100 * LAPSE.tPer100m).toFixed(1) }; renderEx(); };
  const renderEx = (msg) => {
    clear(exWrap); const inp = h('input', { type: 'number', step: 0.1, placeholder: 'răspuns în °C', style: { maxWidth: '160px' }, autofocus: true });
    const check = () => { if (inp.value === '') return; tot++; const ok = Math.abs(+inp.value - ex.ans) <= 0.06; store.recordAnswer('calc-altitudine', ok); ok ? (okCount++, beep('ok'), store.addXP(3)) : beep('bad'); renderEx(ok ? h('span', { class: 'badge ok' }, 'Corect! ') : h('span', { class: 'badge bad' }, `Greșit – corect: ${ex.ans} °C (${ex.base} − ${ex.alt / 100}×0,6)`)); if (ok) setTimeout(newEx, 900); else setTimeout(newEx, 2600); };
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') check(); });
    exWrap.append(h('div', { class: 'row' }, h('h3', { style: { margin: 0 } }, 'Exercițiu rapid'), h('div', { class: 'sp' }), h('span', { class: 'badge mint' }, `Corecte: ${okCount}/${tot}`)),
      h('p', { style: { fontSize: '1.05rem' } }, `La nivelul mării temperatura medie este ${ex.base} °C. Cât este la ${fmt(ex.alt)} m altitudine?`), h('div', { class: 'row' }, inp, h('button', { class: 'btn primary', onclick: check }, 'Verifică'), msg || null)); setTimeout(() => inp.focus(), 30);
  };
  newEx(); el.append(sec('Exersează calculul', exWrap));
  return { el, destroy() {} };
}

// ============================================================ 3. PRECIPITAȚII
async function tabPrecipitatii() {
  const el = h('div'); const map = await createMap2D('europe', { vw: 1000 });
  map.overlay.style.background = 'linear-gradient(90deg, rgba(30,120,255,.82) 0%, rgba(30,120,255,.62) 28%, rgba(60,160,255,.34) 62%, rgba(120,190,255,.10) 100%)'; map.overlay.style.mixBlendMode = 'normal';
  // etichete
  const [wx, wy] = map.toPct(-7, 52), [ex2, ey2] = map.toPct(47.5, 47);
  const tag = (txt, x, y, extra = {}) => { const d = h('div', { style: { position: 'absolute', left: x + '%', top: y + '%', transform: 'translate(-50%,-50%)', padding: '5px 10px', borderRadius: '10px', background: 'rgba(8,12,30,.82)', color: '#fff', fontWeight: 800, fontSize: '.8rem', border: '1px solid rgba(255,255,255,.3)', boxShadow: '0 4px 14px rgba(0,0,0,.4)', whiteSpace: 'nowrap', ...extra } }, txt); map.el.appendChild(d); return d; };
  tag('V: 1000–1400 mm/an', wx - 3, wy - 12); tag('E: 400–500 mm/an', 76, 20); tag('Minim: Câmpia Pericaspică ≈ 250 mm/an', ex2 - 4, ey2 + 8, { background: 'rgba(120,30,20,.9)' });
  const scan = h('div', { style: { position: 'absolute', top: 0, bottom: 0, width: '2px', background: '#fff', left: '30%', boxShadow: '0 0 12px #fff', pointerEvents: 'none', display: 'none' } });
  const bubble = h('div', { style: { position: 'absolute', top: '8px', transform: 'translateX(-50%)', padding: '6px 11px', borderRadius: '10px', background: 'var(--glass-strong)', color: 'var(--text)', fontWeight: 800, border: '1px solid var(--line-strong)', whiteSpace: 'nowrap', display: 'none' } });
  map.el.append(scan, bubble);
  map.el.addEventListener('pointermove', (e) => { const r = map.el.getBoundingClientRect(); const u = clamp((e.clientX - r.left) / r.width, 0, 1); const [lon] = map.unproject(u * map.VW, 0); scan.style.display = bubble.style.display = 'block'; scan.style.left = bubble.style.left = u * 100 + '%'; const t = clamp((lon + 10) / 62, 0, 1); const mm = 1200 + (450 - 1200) * t; bubble.textContent = `≈ ${Math.round(mm / 10) * 10} mm/an (orientativ, ${Math.abs(lon).toFixed(0)}° ${lon >= 0 ? 'E' : 'V'})`; });
  map.el.addEventListener('pointerleave', () => { scan.style.display = bubble.style.display = 'none'; });
  el.append(sec('Precipitațiile scad de la vest la est', h('p', { style: { color: 'var(--muted)', maxWidth: '78ch' } }, 'Precipitațiile sunt influențate de prezența oceanului și de relief. În V sunt bogate tot timpul anului; pe continent scad de la ', h('b', null, '1000–1400 mm/an'), ' (V) la ', h('b', null, '400–500 mm/an'), ' (E). ', srcTag('UC'), ' Mută mouse-ul peste hartă ca să „citești” valoarea orientativă.'), map.el,
    h('div', { class: 'grid c3', style: { marginTop: '14px' } },
      h('div', { class: 'card tight' }, h('div', { class: 'hint' }, 'Minim în Europa'), h('div', { class: 'num-big', style: { fontSize: '1.4rem', color: 'var(--bad)' } }, '250 mm/an'), h('div', null, 'Câmpia Pericaspică ', srcTag('UC'))),
      h('div', { class: 'card tight' }, h('div', { class: 'hint' }, 'Minim în România'), h('div', { class: 'num-big', style: { fontSize: '1.4rem', color: 'var(--warm)' } }, 'sub 300 mm/an'), h('div', null, 'Delta Dunării ', srcTag('UC'))),
      h('div', { class: 'card tight' }, h('div', { class: 'hint' }, 'Cresc cu altitudinea'), h('div', { class: 'num-big', style: { fontSize: '1.4rem' } }, 'mai sus = mai ploios'), h('div', null, 'În caiet: „cresc pp. 100 mm / 100 m” ', srcTag('UC'))))));
  // România: altitudine -> pp
  const out = h('div', { class: 'card tight' }); const bars = PRECIP.ro.map(([a, v], i) => ({ a, v, i }));
  const r2 = rangeField('Altitudinea în România', { min: 0, max: 2500, step: 50, value: 1500, format: (v) => `${fmt(v)} m`, onInput: (v) => upd(v) });
  const upd = (alt) => { const idx = alt >= 2000 ? 0 : alt >= 1000 ? 1 : 2; clear(out); out.append(h('div', { class: 'hint' }, 'Precipitații medii anuale la această altitudine (România)'), h('div', { class: 'num-big', style: { fontSize: '1.7rem', color: 'var(--info)' } }, PRECIP.ro[idx][1]), h('div', { class: 'row', style: { marginTop: '10px', gap: '6px' } }, bars.map((b) => h('span', { class: `chip ${b.i === idx ? 'active' : ''}`, style: { '--chip': 'var(--info)' } }, `${b.a}: ${b.v}`)))); };
  upd(1500); el.append(sec('România: precipitațiile după altitudine', h('div', { class: 'card' }, r2, out, h('p', { class: 'hint', style: { marginBottom: 0, marginTop: '10px' } }, 'peste 2000 m → 1000–1200 mm/an • 1000–2000 m → 600–1000 mm/an • sub 1000 m → sub 600 mm/an ', srcTag('UC')))));
  el.append(h('div', { style: { marginTop: '14px' } }, callout('warn', h('b', null, 'De verificat: '), 'Caietele spun „cresc pp. 100 mm/100 m”, dar intervalele pentru România cresc mult mai lent (de la ~500 la ~1100 mm între 0 și 2500 m). La test folosește intervalele din caiet, nu o formulă liniară.')));
  return { el, destroy() {} };
}

// ============================================================ 4. VÂNTURI
async function tabVanturi() {
  const el = h('div'); const map = await createMap2D('europe', { vw: 1000 });
  let season = 'vara'; let showPerm = true;
  // câmp de vânt (în coordonate ecran: x spre E, y spre S)
  const b = map.bounds; const latOf = (ny) => map.unproject(0, ny * map.VH)[1];
  const field = (nx, ny) => {
    const lat = latOf(ny); const lon = map.unproject(nx * map.VW, 0)[0];
    const sm = (x, a, c) => { const t = clamp((x - a) / (c - a), 0, 1); return t * t * (3 - 2 * t); };
    const southEdge = season === 'vara' ? 40 : 31; const polar = sm(lat, 61, 67), trade = 1 - sm(lat, southEdge - 4, southEdge + 3), west = (1 - polar) * (1 - trade);
    const wob = Math.sin(lon * 0.11 + lat * 0.18) * 0.28;
    const vx = 1.15 * west - 0.55 * trade - 0.55 * polar + 0.1 * wob; const vy = -0.16 * west + 0.4 * trade + 0.1 * polar + wob * 0.5 * west;
    const col = trade > 0.5 ? [255, 190, 90] : polar > 0.5 ? [186, 160, 255] : [120, 190, 255];
    return [showPerm ? vx : 0, showPerm ? vy : 0, ...col];
  };
  const wp = windParticles(map, field, { count: 2200, trail: 0.93, speed: 1.15 });
  // vânturi locale (săgeți)
  const arrow = (lon, lat, ang, color, label, w) => {
    const [x, y] = map.project(lon, lat); const g = svg('g', { transform: `translate(${x},${y}) rotate(${ang})`, style: { cursor: 'pointer' }, onclick: () => showWind(w) });
    g.append(svg('line', { x1: -26, x2: 18, y1: 0, y2: 0, stroke: color, 'stroke-width': 6, 'stroke-linecap': 'round', 'stroke-dasharray': '10 7', class: 'flow' }), svg('path', { d: 'M18,-11 L34,0 L18,11 Z', fill: color }), svg('circle', { r: 20, fill: 'transparent' }));
    map.gTop.append(g); const [px, py] = map.toPct(lon, lat); const t = h('div', { class: 'lbl name', style: { left: px + '%', top: `calc(${py}% + 22px)`, position: 'absolute', pointerEvents: 'none' } }, label); map.el.appendChild(t); return g;
  };
  const LOCAL = { mistral: [4.8, 44.3, 100, 'Mistralul'], bora: [15.4, 44.5, 35 + 90 + 55, 'Bora'], crivat: [27.5, 46.8, 135, 'Crivățul'], austru: [23.6, 44.3, -45, 'Austrul'], foehn: [10.3, 47.0, -90, 'Foehn (Alpi)'] };
  WINDS.locale.forEach((w) => { const d = LOCAL[w.id]; if (d) arrow(d[0], d[1], d[2], w.color, d[3], w); });
  const style = h('style', null, '.flow{animation:dash 1.1s linear infinite}@keyframes dash{to{stroke-dashoffset:-34}}');
  const info = h('div', { class: 'card', style: { minHeight: '150px' } });
  function showWind(w) { clear(info); info.append(h('h3', { style: { color: w.color || 'var(--accent)' } }, w.name), h('div', { class: 'hint' }, w.where || w.dir || ''), h('p', null, w.desc, ' ', srcTag(w.src)), w.verify ? callout('warn', h('b', null, 'De verificat: '), w.verify) : null); }
  showWind({ name: 'Vânturile Europei', desc: 'Apasă pe săgețile colorate de pe hartă (vânturi locale) sau pe lista din dreapta. Particulele arată vânturile permanente.', color: 'var(--accent)', src: 'UC' });
  const seasonBtns = tabs([{ id: 'vara', label: 'Vara' }, { id: 'iarna', label: 'Iarna' }], 'vara', (v) => { season = v; });
  const side = h('div', { class: 'stack' },
    h('div', { class: 'card' }, h('h3', null, 'Permanente (toate cele 3)'), h('ul', { style: { margin: 0, paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' } }, WINDS.permanente.map((w) => h('li', null, h('span', { class: 'legend-dot', style: { color: w.color, background: w.color } }), h('b', null, w.name), ' – ', w.desc, ' ', srcTag(w.src)))), h('div', { class: 'row', style: { marginTop: '12px' } }, h('span', { class: 'hint' }, 'Sezonul pentru alizee:'), seasonBtns)),
    h('div', { class: 'card' }, h('h3', null, 'Sezoniere'), h('ul', { style: { margin: 0, paddingLeft: '18px' } }, WINDS.sezoniere.map((w) => h('li', null, h('b', null, w.name), ' – ', w.desc, ' ', srcTag(w.src)))), h('div', { class: 'hint', style: { marginTop: '8px' } }, 'Vezi animația „briză” mai jos.')),
    h('div', { class: 'card' }, h('h3', null, 'Locale'), h('div', { class: 'chips' }, WINDS.locale.map((w) => h('button', { class: 'chip', style: { '--chip': w.color }, onclick: () => showWind(w) }, h('span', { class: 'dot' }), w.name)))), info);
  el.append(style, sec('Vânturile Europei', h('p', { style: { color: 'var(--muted)', maxWidth: '78ch' } }, 'Particulele curg după vânturile permanente: ', h('b', { style: { color: '#ffbe5a' } }, 'alizee'), ' (sud, vara), ', h('b', { style: { color: '#78beff' } }, 'vânturile de vest'), ' (zona temperată), ', h('b', { style: { color: '#baa0ff' } }, 'vânturile polare / de est'), ' (nord).'), h('div', { class: 'grid', style: { gridTemplateColumns: 'minmax(0,1.5fr) minmax(0,1fr)', alignItems: 'start' } }, map.el, side)));
  // ---- briza
  const bz = h('canvas', { width: 900, height: 320, style: { width: '100%', height: 'auto', borderRadius: '16px', background: 'linear-gradient(#10224a,#1b3b72)' } }); let mode = 'montana', day = true; const cx = bz.getContext('2d'); let raf = 0, tt = 0;
  const brizaCtl = h('div', { class: 'row', style: { marginBottom: '10px' } }, tabs([{ id: 'montana', label: 'Briza montană' }, { id: 'litorala', label: 'Briza litorală' }], 'montana', (v) => { mode = v; }), tabs([{ id: 'zi', label: 'Ziua' }, { id: 'noapte', label: 'Noaptea' }], 'zi', (v) => { day = v === 'zi'; }));
  const cap = h('div', { class: 'hint', style: { marginTop: '8px' } });
  const drawB = () => {
    raf = requestAnimationFrame(drawB); tt += 0.016; const W = 900, Hh = 320; cx.clearRect(0, 0, W, Hh);
    const sky = cx.createLinearGradient(0, 0, 0, Hh); sky.addColorStop(0, day ? '#4aa3ff' : '#0b1230'); sky.addColorStop(1, day ? '#bfe3ff' : '#223a72'); cx.fillStyle = sky; cx.fillRect(0, 0, W, Hh);
    cx.fillStyle = day ? '#ffd24a' : '#e8ecf8'; cx.beginPath(); cx.arc(day ? 780 : 120, 60, 28, 0, 7); cx.fill();
    if (mode === 'montana') { cx.fillStyle = '#3f7f56'; cx.beginPath(); cx.moveTo(0, 320); cx.lineTo(0, 250); cx.lineTo(240, 250); cx.lineTo(560, 70); cx.lineTo(900, 250); cx.lineTo(900, 320); cx.fill(); cx.fillStyle = '#fff'; cx.beginPath(); cx.moveTo(500, 100); cx.lineTo(560, 70); cx.lineTo(610, 98); cx.fill(); cx.fillStyle = '#e8f0ff'; cx.font = '700 15px system-ui'; cx.fillText('munte', 540, 130); cx.fillText('vale', 70, 240); }
    else { cx.fillStyle = '#2a69b8'; cx.fillRect(0, 230, 450, 90); cx.fillStyle = '#c8b27a'; cx.fillRect(450, 230, 450, 90); cx.fillStyle = '#e8f0ff'; cx.font = '700 15px system-ui'; cx.fillText('mare', 150, 280); cx.fillText('uscat', 640, 280); }
    // săgeți
    const arrowAt = (x, y, dx, dy, c) => { const L = 46; cx.strokeStyle = c; cx.lineWidth = 4; cx.lineCap = 'round'; cx.beginPath(); cx.moveTo(x, y); cx.lineTo(x + dx * L, y + dy * L); cx.stroke(); const a = Math.atan2(dy, dx); cx.beginPath(); cx.moveTo(x + dx * L, y + dy * L); cx.lineTo(x + dx * L - 11 * Math.cos(a - 0.5), y + dy * L - 11 * Math.sin(a - 0.5)); cx.moveTo(x + dx * L, y + dy * L); cx.lineTo(x + dx * L - 11 * Math.cos(a + 0.5), y + dy * L - 11 * Math.sin(a + 0.5)); cx.stroke(); };
    const phase = (tt * 0.5) % 1;
    if (mode === 'montana') { const s = day ? 1 : -1; for (let i = 0; i < 4; i++) { const f = (i / 4 + phase) % 1; const px = day ? 120 + f * 360 : 480 - f * 360; const py = day ? 240 - (px - 120) * 0.45 : 240 - (px - 120) * 0.45; arrowAt(px, py - 20, (day ? 1 : -1) * 0.8, day ? -0.6 : 0.6, day ? '#ffb454' : '#7ec0ff'); } cap.textContent = day ? 'Ziua: versantul se încălzește → aerul urcă spre munte (briză de vale).' : 'Noaptea: versantul se răcește → aerul rece coboară în vale (briză de munte).'; }
    else { for (let i = 0; i < 4; i++) { const f = (i / 4 + phase) % 1; const x = day ? 220 + f * 460 : 680 - f * 460; arrowAt(x, 210 - (Math.sin(f * 3.14) * 40), day ? 1 : -1, 0, day ? '#ffb454' : '#7ec0ff'); } cap.textContent = day ? 'Ziua: uscatul se încălzește mai repede → aerul urcă; briza bate dinspre mare spre uscat.' : 'Noaptea: uscatul se răcește mai repede → briza bate dinspre uscat spre mare.'; }
  };
  drawB(); el.append(sec('Briza – simulare', h('div', { class: 'card' }, brizaCtl, bz, cap)));
  return { el, destroy() { wp.stop(); cancelAnimationFrame(raf); } };
}

// ============================================================ 5. CICLONI
async function tabCicloni() {
  const el = h('div'); const map = await createMap2D('europe', { vw: 1000 });
  const info = h('div', { class: 'card', style: { minHeight: '170px' } });
  const show = (c) => { clear(info); info.append(h('div', { class: 'row' }, h('h3', { style: { margin: 0, color: c.color } }, c.name), h('span', { class: `badge ${c.type === 'ciclon' ? '' : 'warn'}` }, c.type)), h('p', { style: { fontSize: '1.05rem', margin: '10px 0' } }, 'Efect: ', h('b', null, c.effect), ' ', srcTag(c.src)), h('div', { class: 'hint' }, c.type === 'ciclon' ? 'Presiune scăzută: aerul urcă și se învârte în sens trigonometric (emisfera nordică) → nori, ploaie.' : 'Presiune ridicată: aerul coboară și se învârte în sensul acelor de ceasornic → vreme senină.')); };
  CENTERS.forEach((c) => {
    const [x, y] = map.project(c.lon, c.lat); const dir = c.type === 'ciclon' ? -1 : 1; const g = svg('g', { transform: `translate(${x},${y})`, style: { cursor: 'pointer' }, onclick: () => show(c) });
    g.append(svg('circle', { r: 56, fill: c.color, opacity: 0.16 }), svg('circle', { r: 56, fill: 'none', stroke: c.color, 'stroke-width': 2, 'stroke-dasharray': '6 6', class: dir > 0 ? 'rot-cw' : 'rot-ccw', style: { transformOrigin: '0 0' } }), svg('circle', { r: 34, fill: 'none', stroke: c.color, 'stroke-width': 2.5, opacity: 0.9 }),
      svg('path', { d: 'M0,-34 A34,34 0 1,' + (dir > 0 ? 1 : 0) + ' -30,16', fill: 'none', stroke: '#fff', 'stroke-width': 3, class: dir > 0 ? 'rot-cw' : 'rot-ccw', style: { transformOrigin: '0 0' }, 'marker-end': '' }),
      svg('text', { x: 0, y: 6, 'text-anchor': 'middle', 'font-size': 26, 'font-weight': 900, fill: '#fff' }, c.type === 'ciclon' ? 'D' : 'Î'));
    map.gTop.append(g); const [px, py] = map.toPct(c.lon, c.lat); map.el.appendChild(h('div', { class: 'lbl name', style: { position: 'absolute', left: px + '%', top: `calc(${py}% + 68px)`, fontSize: '.8rem' } }, c.name));
  });
  show(CENTERS[0]);
  const st = h('style', null, '.rot-cw{animation:rcw 9s linear infinite}.rot-ccw{animation:rccw 9s linear infinite}@keyframes rcw{to{transform:rotate(360deg)}}@keyframes rccw{to{transform:rotate(-360deg)}}');
  el.append(st, sec('Cele 4 centre barice de deasupra Europei', h('p', { style: { color: 'var(--muted)', maxWidth: '78ch' } }, 'Deasupra Europei sunt permanent ', h('b', null, '2 cicloni'), ' și ', h('b', null, '2 anticicloni'), ': Anticiclonul Siberiei (senin), Anticiclonul Azorelor (umed, senin), Ciclonul Islandez, Ciclonul Mediteranean. ', srcTag('UC'), ' Apasă pe fiecare. Pe hartă: D = presiune scăzută (ciclon), Î = presiune înaltă (anticiclon) – literele sunt ale mele, pentru claritate.'),
    h('div', { class: 'grid', style: { gridTemplateColumns: 'minmax(0,1.5fr) minmax(0,1fr)', alignItems: 'start' } }, map.el, h('div', { class: 'stack' }, info, callout('warn', h('b', null, 'Atenție: '), CENTER_NOTE.fizic)))));
  // --- secțiune verticală
  const mk = (cyc) => {
    const s = svg('svg', { viewBox: '0 0 420 260', style: { width: '100%', height: 'auto', borderRadius: '14px', background: cyc ? 'linear-gradient(#27324d,#4a5a86)' : 'linear-gradient(#3f8fe0,#bfe3ff)' } });
    s.append(svg('rect', { x: 0, y: 220, width: 420, height: 40, fill: '#3c6e50' }));
    const ar = (d, c) => svg('path', { d, fill: 'none', stroke: c, 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-dasharray': '10 8', class: 'flow2' });
    if (cyc) { s.append(ar('M30,215 Q130,215 210,200', '#7ec0ff'), ar('M390,215 Q290,215 210,200', '#7ec0ff'), ar('M210,200 L210,60', '#ffb454'), svg('ellipse', { cx: 210, cy: 52, rx: 90, ry: 26, fill: '#e8edf8', opacity: 0.95 }), svg('ellipse', { cx: 150, cy: 66, rx: 50, ry: 18, fill: '#cfd7ea' }), svg('ellipse', { cx: 270, cy: 66, rx: 54, ry: 18, fill: '#cfd7ea' })); for (let i = 0; i < 9; i++) s.append(svg('line', { x1: 120 + i * 22, x2: 112 + i * 22, y1: 90, y2: 120, stroke: '#8ec9ff', 'stroke-width': 2.5, class: 'rain', style: { animationDelay: `${i * 0.13}s` } })); s.append(svg('text', { x: 210, y: 250, 'text-anchor': 'middle', fill: '#fff', 'font-size': 13, 'font-weight': 800 }, 'presiune scăzută – aerul urcă')); }
    else { s.append(ar('M210,70 L210,205', '#ffb454'), ar('M210,215 Q290,215 390,215', '#7ec0ff'), ar('M210,215 Q130,215 30,215', '#7ec0ff'), svg('circle', { cx: 340, cy: 54, r: 26, fill: '#ffd24a' })); s.append(svg('text', { x: 210, y: 250, 'text-anchor': 'middle', fill: '#fff', 'font-size': 13, 'font-weight': 800 }, 'presiune ridicată – aerul coboară')); }
    return s;
  };
  const st2 = h('style', null, '.flow2{animation:dash2 1.2s linear infinite}@keyframes dash2{to{stroke-dashoffset:-36}}.rain{animation:rainf 1s linear infinite}@keyframes rainf{0%{transform:translateY(-10px);opacity:0}30%{opacity:1}100%{transform:translateY(70px);opacity:0}}');
  el.append(st2, sec('Ciclon vs. anticiclon – ce se întâmplă', h('div', { class: 'grid c2' }, h('div', { class: 'card' }, h('h3', null, 'Ciclon'), mk(true), h('p', { style: { marginBottom: 0 } }, 'Aer urcă → se răcește → nori → ', h('b', null, 'înnorat, ploaie'), '. ', srcTag('UX'))), h('div', { class: 'card' }, h('h3', null, 'Anticiclon'), mk(false), h('p', { style: { marginBottom: 0 } }, 'Aer coboară → se încălzește → norii se destramă → ', h('b', null, 'senin'), '. ', srcTag('UX'))))));
  return { el, destroy() {} };
}

export default async function climaEuropa() {
  const el = h('div', { class: 'page wide' });
  el.append(pageHead({ eyebrow: 'Climă · Europa', title: 'Clima Europei', lead: 'Factorii care fac vremea: soare, vânturi, relief. Cu simulări pe care le poți mișca.' }));
  const body = h('div'); let cur = null; let token = 0;
  const TABS = [{ id: 'factori', label: 'Factorii climei', fn: tabFactori }, { id: 'temp', label: 'Temperatura', fn: tabTemperatura }, { id: 'pp', label: 'Precipitațiile', fn: tabPrecipitatii }, { id: 'vant', label: 'Vânturile', fn: tabVanturi }, { id: 'ciclon', label: 'Cicloni & anticicloni', fn: tabCicloni }];
  const show = async (id) => { const my = ++token; cur && cur.destroy && cur.destroy(); clear(body); body.append(h('div', { class: 'loader', style: { height: '260px' } }, h('div', { class: 'spinner' }))); const t = TABS.find((x) => x.id === id); let inst; try { inst = await t.fn(); } catch (e) { console.error(e); clear(body); body.append(h('p', null, 'Eroare: ' + e.message)); return; } if (my !== token) { inst.destroy && inst.destroy(); return; } clear(body); body.append(inst.el); cur = inst; revealOnScroll(inst.el); inst.el.querySelectorAll('.reveal').forEach((n) => n.classList.add('in')); };
  el.append(h('div', { style: { marginBottom: '8px' } }, tabs(TABS, 'factori', show)), body); show('factori');
  return { el, destroy() { cur && cur.destroy && cur.destroy(); token++; } };
}
