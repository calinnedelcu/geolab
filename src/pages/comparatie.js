import { h, svg, clear, fmt, clamp, loadAsset } from '../core/dom.js';
import { ic, srcTag, callout, pageHead, countUp, tabs, toggle } from '../core/ui.js';
import * as store from '../core/store.js';
import { createMap2D } from '../core/map2d.js';
import { GENERAL } from '../data/relief.js';

export default async function comparatie() {
  const el = h('div', { class: 'page wide' });
  el.append(pageHead({ eyebrow: 'Fișa generală', title: 'Europa vs. România', lead: 'Cifrele de bază din caiet, puse față în față. Numerele „se numără” singure când le vezi.' }));
  const G = GENERAL;

  // ---- numere mari
  const big = (label, a, b) => { const ea = h('span', { class: 'num-big', style: { fontSize: '2rem', color: 'var(--accent-2)' } }, '0'), eb = h('span', { class: 'num-big', style: { fontSize: '2rem', color: 'var(--accent)' } }, '0'); setTimeout(() => { countUp(ea, a.v, { dec: a.dec }); countUp(eb, b.v, { dec: b.dec }); }, 250); return h('div', { class: 'card' }, h('div', { class: 'hint' }, label), h('div', { class: 'row', style: { alignItems: 'flex-end', gap: '26px', marginTop: '8px' } }, h('div', null, h('div', { class: 'hint' }, 'Europa'), ea, ' ', h('small', null, a.unit)), h('div', null, h('div', { class: 'hint' }, 'România'), eb, ' ', h('small', null, b.unit)))); };
  el.append(h('div', { class: 'grid c2' }, big('Suprafață', G.rows[0].eu, G.rows[0].ro), big('Populație', G.rows[1].eu, G.rows[1].ro)));

  // ---- tabel
  const tb = h('table', { class: 'table' }, h('thead', null, h('tr', null, ['', 'Europa', 'România', ''].map((x) => h('th', null, x)))), h('tbody', null, G.rows.map((r) => h('tr', null, h('td', null, h('b', null, r.label)), h('td', null, r.eu.text), h('td', null, r.ro.text), h('td', null, ...srcTag(r.src))))));
  el.append(h('h2', { style: { marginTop: '26px' } }, 'Tabelul din caiet'), h('div', { class: 'table-wrap' }, tb));

  // ---- altitudini
  const W = 920, Hh = 330, pad = { l: 60, r: 20, t: 20, b: 40 };
  const vals = [['Maximă', G.rows[6].eu.v, G.rows[6].ro.v, 'Mont Blanc 4810 m (Elbrus 5642 m)', 'Moldoveanu 2544 m'], ['Medie', 300, 450, '300 m', '450 m'], ['Minimă', G.rows[8].eu.v, G.rows[8].ro.v, '−28 m (Pericaspica)', '≈ 5 m (țărm 0 m)']];
  const s = svg('svg', { viewBox: `0 0 ${W} ${Hh}`, style: { width: '100%', height: 'auto' } }); const max = 5700, min = -400; const y = (v) => pad.t + (1 - (v - min) / (max - min)) * (Hh - pad.t - pad.b); const gw = (W - pad.l - pad.r) / 3;
  [0, 1000, 2000, 3000, 4000, 5000].forEach((v) => s.append(svg('line', { x1: pad.l, x2: W - pad.r, y1: y(v), y2: y(v), stroke: 'var(--line)' }), svg('text', { x: pad.l - 8, y: y(v) + 4, 'text-anchor': 'end', fill: 'var(--faint)', 'font-size': 11 }, v)));
  const bars = [];
  vals.forEach(([lab, e, r, et, rt], i) => { const x0 = pad.l + i * gw + gw * 0.15, bw = gw * 0.3; [[e, 'var(--accent-2)', et, x0], [r, 'var(--accent)', rt, x0 + bw + 12]].forEach(([v, col, t, x]) => { const top = y(Math.max(v, 0)), bot = y(Math.min(v, 0)); const rect = svg('rect', { x, y: bot, width: bw, height: 0, rx: 6, fill: col, opacity: 0.9 }); rect.style.transition = 'all 1s cubic-bezier(.2,.8,.2,1)'; bars.push(() => { rect.setAttribute('y', top); rect.setAttribute('height', Math.max(4, bot - top)); }); s.append(rect, svg('text', { x: x + bw / 2, y: Math.min(top, bot) - 8, 'text-anchor': 'middle', fill: 'var(--text)', 'font-size': 12, 'font-weight': 800 }, `${v} m`), svg('text', { x: x + bw / 2, y: Hh - 16, 'text-anchor': 'middle', fill: 'var(--muted)', 'font-size': 10 }, t.length > 22 ? t.slice(0, 22) + '…' : t)); }); s.append(svg('text', { x: x0 + bw + 6, y: Hh - 3, 'text-anchor': 'middle', fill: 'var(--text)', 'font-size': 13, 'font-weight': 800 }, lab)); });
  s.append(svg('rect', { x: W - 200, y: 8, width: 12, height: 12, rx: 3, fill: 'var(--accent-2)' }), svg('text', { x: W - 182, y: 18, fill: 'var(--text)', 'font-size': 12 }, 'Europa'), svg('rect', { x: W - 120, y: 8, width: 12, height: 12, rx: 3, fill: 'var(--accent)' }), svg('text', { x: W - 102, y: 18, fill: 'var(--text)', 'font-size': 12 }, 'România'));
  setTimeout(() => bars.forEach((f) => f()), 400);
  el.append(h('h2', { style: { marginTop: '26px' } }, 'Altitudinile: maximă · medie · minimă'), h('div', { class: 'card' }, s, h('div', { class: 'hint' }, 'Sursa: ', srcTag('UC'))));

  // ---- trepte de relief România
  const don = (parts) => { let a0 = -Math.PI / 2; const R = 80, r = 50; const sv = svg('svg', { viewBox: '-100 -100 200 200', style: { width: '210px', height: '210px' } }); parts.forEach(([n, v, c]) => { const a1 = a0 + (v / 100) * 2 * Math.PI; const p = (rad, a) => [Math.cos(a) * rad, Math.sin(a) * rad]; const [x0, y0] = p(R, a0), [x1, y1] = p(R, a1), [x2, y2] = p(r, a1), [x3, y3] = p(r, a0); const lg = a1 - a0 > Math.PI ? 1 : 0; const path = svg('path', { d: `M${x0},${y0} A${R},${R} 0 ${lg} 1 ${x1},${y1} L${x2},${y2} A${r},${r} 0 ${lg} 0 ${x3},${y3}Z`, fill: c, style: 'transition:transform .25s;cursor:pointer', onmouseenter: (e) => (e.currentTarget.style.transform = 'scale(1.06)'), onmouseleave: (e) => (e.currentTarget.style.transform = '') }); sv.append(path); const am = (a0 + a1) / 2; const [tx, ty] = p((R + r) / 2, am); sv.append(svg('text', { x: tx, y: ty + 4, 'text-anchor': 'middle', fill: '#07101f', 'font-size': 14, 'font-weight': 900, 'pointer-events': 'none' }, v + '%')); a0 = a1; }); return sv; };
  const steps = h('div', { class: 'grid c2', style: { alignItems: 'center' } }, h('div', { class: 'card', style: { display: 'grid', placeItems: 'center' } }, don([['Munți', 31, '#e0524d'], ['Dealuri și podișuri', 36, '#e7c340'], ['Câmpii', 33, '#4fbf6a']])), h('div', { class: 'card' }, h('h3', null, 'Trepte de relief în România'), h('p', null, 'Relief ', h('b', null, 'concentric și proporțional'), ', cu trepte armonioase: aproximativ o treime munți, o treime dealuri și podișuri, o treime câmpii. ', srcTag('UC')), h('div', { class: 'chips' }, [['Munți', '#e0524d', '31 %'], ['Dealuri și podișuri', '#e7c340', '36 %'], ['Câmpii', '#4fbf6a', '33 %']].map(([n, c, v]) => h('span', { class: 'chip active', style: { '--chip': c } }, h('span', { class: 'dot' }), `${n}: ${v}`))), h('p', { class: 'hint', style: { marginTop: '10px' } }, 'Procentele (INSSE – „România în cifre”) sunt o completare: în caiet scrie doar „câte 1/3”. ', srcTag('X')), h('p', null, h('b', null, 'Europa: '), 'asimetric – altitudini crescătoare de la câmpie (N) spre lanțuri alpine (S). ', srcTag('UC'))));
  el.append(h('h2', { style: { marginTop: '26px' } }, 'Cum sunt „așezate” treptele'), steps);

  // ---- extreme pe hartă
  const mapGrid = h('div', { class: 'grid c2', style: { marginTop: '26px', alignItems: 'start' } }); const mapE = h('div', { class: 'card' }, h('div', { class: 'loader', style: { height: '240px' } }, h('div', { class: 'spinner' }))), mapR = h('div', { class: 'card' }, h('div', { class: 'loader', style: { height: '240px' } }, h('div', { class: 'spinner' })));
  mapGrid.append(mapE, mapR);
  el.append(h('h2', { style: { marginTop: '26px' } }, 'Punctele extreme'), mapGrid);
  const addPts = (map, pts, color) => pts.forEach((p) => { const [x, y] = map.toPct(p.lon, p.latv); map.el.append(h('div', { style: { position: 'absolute', left: x + '%', top: y + '%', width: '14px', height: '14px', borderRadius: '50%', background: color, border: '2px solid #fff', transform: 'translate(-50%,-50%)', boxShadow: `0 0 0 4px ${color}55` } })); map.el.append(h('div', { class: 'lbl pin', style: { position: 'absolute', left: x + '%', top: y + '%', '--c': color } }, h('span', null, `${p.dir}: ${p.name}`))); });
  (async () => {
    const me = await createMap2D('europe', { vw: 800 }); clear(mapE); mapE.append(h('h3', null, 'Europa'), me.el, h('div', { class: 'row', style: { marginTop: '10px', gap: '6px' } }, G.euExtremes.map((p) => h('span', { class: 'chip' }, h('b', null, p.dir), ` ${p.name} (${p.lat}, ${p.country})`)))); addPts(me, G.euExtremes, '#ffb454');
    const mr = await createMap2D('romania', { vw: 800 }); clear(mapR); mapR.append(h('h3', null, 'România'), mr.el, h('div', { class: 'row', style: { marginTop: '10px', gap: '6px' } }, G.roExtremes.map((p) => h('span', { class: 'chip' }, h('b', null, p.dir), ` ${p.name} (${p.lat}, ${p.county})`)))); addPts(mr, G.roExtremes, '#5eead4');
  })();

  // ---- dinamica suprafeței + medii ostile
  el.append(h('h2', { style: { marginTop: '26px' } }, 'Suprafața e dinamică'), h('div', { class: 'grid c2' },
    h('div', { class: 'card', style: { borderTop: '3px solid var(--ok)' } }, h('h3', null, ic('plus'), ' Crește'), h('ul', null, G.dynamic.grow.map((x) => h('li', null, x))), h('div', { class: 'hint' }, srcTag('UC'))),
    h('div', { class: 'card', style: { borderTop: '3px solid var(--bad)' } }, h('h3', null, ic('minus'), ' Scade'), h('ul', null, G.dynamic.shrink.map((x) => h('li', null, x))), h('div', { class: 'hint' }, srcTag('UC')))));
  el.append(h('h2', { style: { marginTop: '26px' } }, 'Medii geografice ostile'), h('div', { class: 'grid c2' },
    h('div', { class: 'card' }, h('h3', null, 'Europa'), h('ul', null, G.hostile.eu.map((x) => h('li', null, x))), h('div', { class: 'hint' }, srcTag('UC'))),
    h('div', { class: 'card' }, h('h3', null, 'România'), h('ul', null, G.hostile.ro.map((x) => h('li', null, x))), h('div', { class: 'hint' }, srcTag('UC')))));
  return { el, destroy() {} };
}
