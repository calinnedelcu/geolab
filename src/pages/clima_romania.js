import { h, svg, clear, clamp, fmt, shuffle } from '../core/dom.js';
import { ic, srcTag, callout, pageHead, rangeField, toggle, toast, beep, confetti } from '../core/ui.js';
import * as store from '../core/store.js';
import { createMap2D } from '../core/map2d.js';
import { loadDEM } from '../core/dem.js';
import { RO_CLIMATE, PRECIP } from '../data/clima.js';

// geometria săgeților de pe hartă (originea în afara țării → țintă în țară)
const GEO = {
  v_oceanica: { from: [18.2, 46.6], to: [21.9, 46.4] },
  scand_baltice: { from: [25.3, 49.9], to: [25.3, 47.9] },
  polare: { from: [31.2, 49.6], to: [27.6, 47.7] },
  est_europene: { from: [31.4, 46.5], to: [27.4, 46.1] },
  pontica: { from: [31.2, 44.3], to: [28.9, 44.55] },
  submediteraneana: { from: [19.6, 43.5], to: [21.7, 45.0] },
  austru: { from: [22.4, 43.4], to: [24.9, 44.6] },
  foehn: { from: [24.7, 44.8], to: [24.9, 46.15] },
};

export default async function climaRomania() {
  const el = h('div', { class: 'page wide' });
  el.append(pageHead({ eyebrow: 'Climă · România', title: 'Clima României', lead: 'Temperat-continentală, cu influențe din toate direcțiile. Apasă pe săgeți și vezi cum „funcționează” Foehn-ul din Făgăraș.' }));
  const cleanups = [];

  // ---------- recapitulare
  el.append(h('div', { class: 'grid c3' },
    h('div', { class: 'card tight' }, h('div', { class: 'hint' }, 'Tip de climă'), h('div', { class: 'num-big', style: { fontSize: '1.15rem' } }, 'temperat-continental'), h('div', { class: 'hint' }, RO_CLIMATE.type, ' ', srcTag('U'))),
    h('div', { class: 'card tight' }, h('div', { class: 'hint' }, 'Vestul Europei'), h('div', { class: 'num-big', style: { fontSize: '1.15rem', color: 'var(--ok)' } }, 'temperat oceanic'), h('div', { class: 'hint' }, 'toate țările din V Europei ', srcTag('U'))),
    h('div', { class: 'card tight' }, h('div', { class: 'hint' }, 'Centrul Europei'), h('div', { class: 'num-big', style: { fontSize: '1.15rem', color: 'var(--warm)' } }, 'temperat continental'), h('div', { class: 'hint' }, 'țările din C Europei ', srcTag('U')))));

  // ---------- harta influențelor
  const mapHost = h('div', { class: 'card', style: { padding: '14px' } }, h('div', { class: 'loader', style: { height: '340px' } }, h('div', { class: 'spinner' })));
  const info = h('div', { class: 'card', style: { minHeight: '190px' } });
  const list = h('div', { class: 'stack' });
  const show = (inf) => { clear(info); info.append(h('div', { class: 'row' }, h('h3', { style: { margin: 0, color: inf.color } }, inf.name), h('span', { class: 'badge' }, inf.dir)), h('p', { style: { fontSize: '1.02rem', margin: '10px 0' } }, inf.desc, ' ', srcTag(inf.src)), inf.id === 'foehn' ? h('a', { class: 'btn small primary', href: '#foehn', onclick: (e) => { e.preventDefault(); document.getElementById('foehn-sec').scrollIntoView({ behavior: 'smooth' }); } }, ic('play'), 'Vezi animația Foehn') : null); chips.forEach((c, k) => c.classList.toggle('active', RO_CLIMATE.influences[k] === inf)); };
  const chips = RO_CLIMATE.influences.map((inf) => h('button', { class: 'chip', style: { '--chip': inf.color, justifyContent: 'flex-start', width: '100%', borderRadius: '10px' }, onclick: () => show(inf) }, h('span', { class: 'dot' }), inf.name));
  list.append(...chips);
  const grid = h('div', { class: 'grid', style: { gridTemplateColumns: 'minmax(0,1.6fr) minmax(0,1fr)', alignItems: 'start', marginTop: '22px' } }, mapHost, h('div', { class: 'stack' }, info, list));
  el.append(h('h2', { style: { marginTop: '26px' } }, 'De unde vin influențele climatice'), grid);
  (async () => {
    const map = await createMap2D('romania', { vw: 1000 }); clear(mapHost); mapHost.append(map.el);
    map.overlay.style.background = 'transparent';
    const st = h('style', null, '.flow3{animation:dash3 1.2s linear infinite}@keyframes dash3{to{stroke-dashoffset:-32}}.pulse3{animation:pulse3 2s ease-in-out infinite;transform-origin:center;transform-box:fill-box}@keyframes pulse3{50%{transform:scale(1.25);opacity:.6}}');
    map.el.appendChild(st);
    RO_CLIMATE.influences.forEach((inf) => {
      const g = GEO[inf.id]; if (!g) return; const [x1, y1] = map.project(...g.from), [x2, y2] = map.project(...g.to); const ang = Math.atan2(y2 - y1, x2 - x1); const gg = svg('g', { style: { cursor: 'pointer' }, onclick: () => show(inf) });
      const curve = inf.id === 'foehn' ? `M${x1},${y1} Q${x1 + 40},${(y1 + y2) / 2} ${x2},${y2}` : `M${x1},${y1} L${x2},${y2}`;
      gg.append(svg('path', { d: curve, stroke: inf.color, 'stroke-width': 9, 'stroke-linecap': 'round', fill: 'none', 'stroke-dasharray': '14 10', class: 'flow3', opacity: 0.95 }), svg('path', { d: curve, stroke: 'transparent', 'stroke-width': 26, fill: 'none' }),
        svg('path', { d: 'M0,-13 L26,0 L0,13 Z', fill: inf.color, transform: `translate(${x2},${y2}) rotate(${(ang * 180) / Math.PI})` }));
      map.gTop.append(gg); const [px, py] = map.toPct(g.from[0] + (g.to[0] - g.from[0]) * 0.25, g.from[1] + (g.to[1] - g.from[1]) * 0.25);
      const lb = h('div', { class: 'lbl name', style: { position: 'absolute', left: px + '%', top: py + '%', fontSize: '.74rem', maxWidth: '120px', whiteSpace: 'normal', textAlign: 'center', lineHeight: 1.15 } }, inf.name.replace('Influențe ', '').replace('Influență ', '')); map.el.appendChild(lb);
    });
    // etichete orașe de reper
    [['București', 26.1, 44.43], ['Cluj-Napoca', 23.59, 46.77], ['Iași', 27.59, 47.16], ['Timișoara', 21.23, 45.75], ['Constanța', 28.63, 44.18], ['Brașov', 25.59, 45.65]].forEach(([n, lo, la]) => { const [px, py] = map.toPct(lo, la); map.el.appendChild(h('div', { style: { position: 'absolute', left: px + '%', top: py + '%', width: '8px', height: '8px', borderRadius: '50%', background: '#fff', transform: 'translate(-50%,-50%)', boxShadow: '0 0 0 3px rgba(0,0,0,.35)' } })); map.el.appendChild(h('div', { class: 'lbl name', style: { position: 'absolute', left: px + '%', top: `calc(${py}% + 12px)`, fontSize: '.7rem', opacity: 0.9 } }, n)); });
    show(RO_CLIMATE.influences[0]);
  })();

  // ---------- Foehn
  const fSec = h('section', { id: 'foehn-sec', style: { marginTop: '34px' } }, h('h2', null, 'Foehn-ul din Munții Făgăraș – secțiune animată'), h('p', { style: { color: 'var(--muted)', maxWidth: '80ch' } }, 'În caiet: „Foehn – Carpații Meridionali, Munții Făgăraș – reversantul nordic către D.C.T.: aer cald, la sfârșitul iernii produce dezghețul”. ', srcTag('UC'), ' Profilul de mai jos e tăiat pe date reale de elevație (sud → nord, lângă Vf. Moldoveanu).'));
  const cv = h('canvas', { width: 1100, height: 400, style: { width: '100%', height: 'auto', borderRadius: '16px', background: '#0b1634' } });
  const t0r = rangeField('Temperatura aerului la baza versantului sudic (°C)', { min: -10, max: 15, step: 1, value: 4, format: (v) => v + ' °C', onInput: () => calcF() });
  const resF = h('div', { class: 'card tight', style: { minHeight: '130px' } });
  let prof = null; let raf = 0; let tt = 0; let T0 = 4; let loaded = false;
  const HUP = 0.6, HDOWN = 1.0; // °C/100 m (urcare umedă / coborâre uscată)
  function calcF() {
    if (!prof) return; T0 = +t0r.querySelector('input').value; const iMax = prof.reduce((m, p, i) => (p.h > prof[m].h ? i : m), 0); const hS = prof[0].h, hC = prof[iMax].h, hN = prof[prof.length - 1].h;
    const Tc = T0 - ((hC - hS) / 100) * HUP, Tn = Tc + ((hC - hN) / 100) * HDOWN;
    clear(resF); resF.append(h('div', { class: 'hint' }, 'Aerul trece peste creastă (≈ ' + fmt(Math.round(hC)) + ' m)'), h('div', { class: 'row', style: { gap: '18px', margin: '6px 0' } }, h('div', null, h('div', { class: 'hint' }, 'Sud (la urcare)'), h('b', { class: 'num-big', style: { fontSize: '1.4rem' } }, T0 + ' °C')), h('span', null, '→'), h('div', null, h('div', { class: 'hint' }, 'Creastă'), h('b', { class: 'num-big', style: { fontSize: '1.4rem', color: 'var(--info)' } }, Tc.toFixed(1) + ' °C')), h('span', null, '→'), h('div', null, h('div', { class: 'hint' }, 'Nord (la coborâre)'), h('b', { class: 'num-big', style: { fontSize: '1.4rem', color: 'var(--warm)' } }, Tn.toFixed(1) + ' °C'))),
      h('div', { class: 'hint' }, `Urcând, aerul umed se răcește ~${HUP} °C/100 m și lasă ploaie/zăpadă pe versantul sudic; coborând, aerul uscat se încălzește ~${HDOWN} °C/100 m. Rezultat: la nord e cu ${(Tn - T0).toFixed(1)} °C mai cald decât la început → dezghețul. `, srcTag('X')));
  }
  (async () => {
    const dem = await loadDEM('romania'); const N = 260; prof = []; for (let i = 0; i < N; i++) { const lat = 44.45 + (46.55 - 44.45) * (i / (N - 1)); prof.push({ lat, h: Math.max(0, dem.sample(24.74, lat)) }); }
    loaded = true; calcF(); draw();
  })();
  const cx = cv.getContext('2d'); const parcels = Array.from({ length: 46 }, (_, i) => ({ f: i / 46, y: 0.2 + Math.random() * 0.7, s: 0.6 + Math.random() * 0.8 }));
  function draw() {
    raf = requestAnimationFrame(draw); if (!loaded) return; tt += 0.016; const W = 1100, Hh = 400; cx.clearRect(0, 0, W, Hh);
    const sky = cx.createLinearGradient(0, 0, 0, Hh); sky.addColorStop(0, '#15244e'); sky.addColorStop(1, '#6b93d6'); cx.fillStyle = sky; cx.fillRect(0, 0, W, Hh);
    const maxH = 2700; const X = (i) => 40 + (i / (prof.length - 1)) * (W - 80), Y = (hm) => Hh - 40 - (hm / maxH) * (Hh - 110);
    // profil
    cx.beginPath(); cx.moveTo(40, Hh); prof.forEach((p, i) => cx.lineTo(X(i), Y(p.h))); cx.lineTo(W - 40, Hh); cx.closePath(); const g = cx.createLinearGradient(0, Y(2500), 0, Hh); g.addColorStop(0, '#f1f5ff'); g.addColorStop(0.35, '#98a7c8'); g.addColorStop(1, '#3e7d58'); cx.fillStyle = g; cx.fill();
    const iMax = prof.reduce((m, p, i) => (p.h > prof[m].h ? i : m), 0);
    // nor pe creastă + ploaie pe versantul sudic
    cx.fillStyle = 'rgba(235,240,255,.93)'; [[X(iMax) - 120, Y(prof[iMax].h) - 52, 70], [X(iMax) - 40, Y(prof[iMax].h) - 64, 84], [X(iMax) - 190, Y(prof[iMax].h) - 30, 60]].forEach(([x, y, r]) => { cx.beginPath(); cx.ellipse(x, y, r, r * 0.36, 0, 0, 7); cx.fill(); });
    cx.strokeStyle = 'rgba(140,200,255,.9)'; cx.lineWidth = 2.5; for (let i = 0; i < 16; i++) { const x = X(iMax) - 230 + i * 12 + ((tt * 40) % 12); const yTop = Y(prof[iMax].h) - 22; const gy = Y(prof[Math.max(0, Math.round(iMax - 70 + (i * 4.5)))].h); const ph = ((tt * 1.3 + i * 0.17) % 1); cx.beginPath(); cx.moveTo(x - ph * 10, yTop + ph * (gy - yTop)); cx.lineTo(x - ph * 10 - 3, yTop + ph * (gy - yTop) + 12); cx.stroke(); }
    // particule de aer: de la S (stânga) spre N
    parcels.forEach((p) => { p.f += 0.0016 * p.s; if (p.f > 1) { p.f = 0; p.y = 0.2 + Math.random() * 0.7; } const idx = Math.floor(p.f * (prof.length - 1)); const gnd = prof[idx].h; const alt = Math.max(gnd + 120 + p.y * 260, gnd + (1 - Math.abs(p.f - iMax / prof.length)) * 200 * 0.0 + 150); const x = X(idx); const y = Y(alt); const warm = p.f > iMax / prof.length ? 1 : 0; const dd = clamp((p.f - iMax / prof.length) * 2.6, 0, 1); const c = warm ? `rgba(255,${Math.round(190 - dd * 60)},${Math.round(90 - dd * 40)},.95)` : `rgba(${Math.round(150 - 40 * (idx / iMax))},200,255,.95)`; cx.fillStyle = c; cx.beginPath(); cx.arc(x, y, 3.2, 0, 7); cx.fill(); });
    // etichete
    cx.fillStyle = '#fff'; cx.font = '800 15px system-ui'; cx.fillText('S – versant sudic (vânt umed urcă)', 56, 34); cx.textAlign = 'right'; cx.fillText('N – versant nordic (aer cald, uscat) → D.C.T.', W - 56, 34); cx.textAlign = 'left';
    cx.fillStyle = '#ffd37a'; cx.fillText(`Moldoveanu ≈ ${fmt(Math.round(prof[iMax].h))} m (în profil)`, X(iMax) - 80, Y(prof[iMax].h) - 14 + 60 * 0);
  }
  el.append(fSec, h('div', { class: 'card' }, cv, h('div', { class: 'grid c2', style: { marginTop: '14px', alignItems: 'start' } }, t0r, resF)));
  cleanups.push(() => cancelAnimationFrame(raf));

  // ---------- test rapid
  const qBox = h('div', { class: 'card' }); let qi = 0; let sc = 0;
  const QS = RO_CLIMATE.influences.filter((i) => i.id !== 'foehn').map((inf) => ({ q: `De unde vine „${inf.name}”?`, a: inf.dir, src: inf }));
  const dirs = [...new Set(QS.map((x) => x.a))];
  function nextQ() {
    clear(qBox); const x = QS[qi % QS.length]; const opts = shuffle([x.a, ...shuffle(dirs.filter((d) => d !== x.a)).slice(0, 3)]);
    qBox.append(h('div', { class: 'row' }, h('h3', { style: { margin: 0 } }, 'Test rapid: direcții'), h('div', { class: 'sp' }), h('span', { class: 'badge mint' }, `Scor: ${sc}`)), h('p', { style: { fontSize: '1.05rem' } }, x.q), h('div', { class: 'grid c2' }, opts.map((o) => h('button', { class: 'btn', onclick: (e) => { const ok = o === x.a; store.recordAnswer('clima-romania', ok); ok ? (sc++, beep('ok'), store.addXP(3)) : beep('bad'); e.currentTarget.classList.add(ok ? 'good' : 'bad'); setTimeout(() => { qi++; nextQ(); }, ok ? 600 : 1400); } }, o))));
  }
  nextQ();
  el.append(h('h2', { style: { marginTop: '30px' } }, 'Exersează'), qBox);
  return { el, destroy() { cleanups.forEach((f) => f()); } };
}
