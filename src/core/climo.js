import { h, svg, clamp, fmt } from './dom.js';

export const MONTHS = ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Noi', 'Dec'];
export const MONTHS_LONG = ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie'];
const r1 = (x) => Math.round(x * 10) / 10;

export function stats(st) {
  const T = st.tempC, P = st.precipMm;
  const tMax = Math.max(...T), tMin = Math.min(...T); const iMax = T.indexOf(tMax), iMin = T.indexOf(tMin);
  const pMax = Math.max(...P), pMin = Math.min(...P);
  const sumT = T.reduce((a, b) => a + b, 0), sumP = P.reduce((a, b) => a + b, 0);
  const north = (st.lat ?? 0) >= 0; const warm = north ? [4, 5, 6, 7, 8, 9] : [10, 11, 0, 1, 2, 3]; // aprilie–septembrie (N) / octombrie–martie (S)
  const warmP = warm.reduce((a, i) => a + P[i], 0);
  return { mean: r1(sumT / 12), sumT: r1(sumT), amp: r1(tMax - tMin), tMax, tMin, iMax, iMin, sumP: Math.round(sumP), pMax, pMin, iPMax: P.indexOf(pMax), iPMin: P.indexOf(pMin), warmShare: sumP ? warmP / sumP : 0, dryMonths: P.filter((p) => p < 30).length, north };
}

// Explicații în română, construite din date
export function clues(st) {
  const s = stats(st); const out = [];
  const ampTxt = s.amp < 6 ? 'foarte mică (aproape constantă tot anul)' : s.amp < 14 ? 'mică–medie (climat moderat, influență oceanică)' : s.amp < 24 ? 'mare (ierni reci, veri calde – influență continentală)' : 'foarte mare (continentalism excesiv)';
  out.push(`Amplitudine termică ${s.amp.toFixed(1)} °C → ${ampTxt}.`);
  out.push(`Cea mai caldă lună: ${MONTHS_LONG[s.iMax]} (${s.tMax.toFixed(1)} °C); cea mai rece: ${MONTHS_LONG[s.iMin]} (${s.tMin.toFixed(1)} °C).`);
  const ws = s.warmShare; const half = s.north ? 'vara' : 'în semestrul cald';
  let shape;
  if (s.sumP < 150) shape = 'precipitații aproape inexistente → deșert / zonă foarte uscată';
  else if (s.sumP < 350 && s.pMax < 60) shape = 'precipitații foarte mici tot anul → climat arid';
  else if (ws < 0.28) shape = `precipitațiile sunt concentrate iarna, iar ${half} e uscat → tipar mediteranean`;
  else if (ws > 0.7 && s.dryMonths >= 3) shape = `ploile cad aproape numai ${half}, iar în restul anului e uscat → sezon ploios + sezon uscat (musoni / subecuatorial)`;
  else if (ws > 0.6) shape = `maxim de precipitații ${half} (≈ ${Math.round(ws * 100)} % din total) → tipar continental`;
  else shape = 'precipitațiile sunt repartizate destul de uniform pe tot anul → tipar oceanic / ecuatorial';
  out.push(`Forma precipitațiilor: ${shape}.`);
  out.push(`Precipitații anuale: ${fmt(s.sumP)} mm; luna cea mai ploioasă: ${MONTHS_LONG[s.iPMax]} (${Math.round(s.pMax)} mm); cea mai uscată: ${MONTHS_LONG[s.iPMin]} (${Math.round(s.pMin)} mm).`);
  return out;
}

const niceStepsP = [10, 20, 25, 40, 50, 75, 100, 150, 200, 250, 300, 400, 500, 750, 1000];
export function axes(series) {
  // series: [{tempC, precipMm}] – scalele se aleg ca să încapă toate
  const T = series.flatMap((s) => s.tempC), P = series.flatMap((s) => s.precipMm);
  const tMax = Math.max(10, Math.ceil((Math.max(...T) + 0.1) / 10) * 10); const tMin = Math.min(0, Math.floor((Math.min(...T) - 0.1) / 10) * 10);
  const nPos = tMax / 10; const pMax = Math.max(...P);
  const step = niceStepsP.find((s) => s * nPos >= pMax * 1.04) || Math.ceil(pMax / nPos / 100) * 100;
  return { tMax, tMin, nPos, pStep: step, pTop: step * nPos };
}

/**
 * Desenează un climograf (stil Walter–Lieth, precipitații ca bare, temperatura ca linie).
 * opts: { width, height, axes, showValues, showMean, showAmp, showDry, interactive, onHover, title, compare, hideNumbers, draw }
 */
export function climographSVG(st, opts = {}) {
  const W = opts.width || 760, Hh = opts.height || 440; const pad = { l: 58, r: 62, t: opts.title ? 54 : 30, b: 52 };
  const ax = opts.axes || axes([st]); const R = ax.tMax - ax.tMin; const plotW = W - pad.l - pad.r, plotH = Hh - pad.t - pad.b;
  const ppc = plotH / R; const yT = (t) => pad.t + (ax.tMax - t) * ppc; const y0 = yT(0); const ppm = (ax.tMax * ppc) / ax.pTop; const yP = (p) => y0 - p * ppm;
  const colW = plotW / 12; const xC = (i) => pad.l + colW * (i + 0.5);
  const s = svg('svg', { viewBox: `0 0 ${W} ${Hh}`, class: 'climo', style: { width: '100%', height: 'auto', display: 'block', userSelect: 'none' }, role: 'img', 'aria-label': `Climograf ${opts.hideName ? '' : st.name}` });
  const defs = svg('defs'); defs.append(svg('linearGradient', { id: 'pbar', x1: 0, x2: 0, y1: 0, y2: 1 }, svg('stop', { offset: '0%', 'stop-color': '#59b3ff' }), svg('stop', { offset: '100%', 'stop-color': '#2467d6' })), svg('linearGradient', { id: 'tline', x1: 0, x2: 1, y1: 0, y2: 0 }, svg('stop', { offset: '0%', 'stop-color': '#ff7a6a' }), svg('stop', { offset: '100%', 'stop-color': '#ff3d5c' })));
  const clip = svg('clipPath', { id: 'clip-plot' }, svg('rect', { x: pad.l, y: pad.t, width: plotW, height: plotH })); defs.append(clip); s.append(defs);
  s.append(svg('rect', { x: pad.l, y: pad.t, width: plotW, height: plotH, fill: 'color-mix(in srgb, var(--surface-2) 70%, transparent)', rx: 6 }));
  // grilă + axa temperaturii (stânga)
  for (let t = ax.tMin; t <= ax.tMax; t += 10) { s.append(svg('line', { x1: pad.l, x2: pad.l + plotW, y1: yT(t), y2: yT(t), stroke: t === 0 ? 'var(--line-strong)' : 'var(--line)', 'stroke-width': t === 0 ? 1.6 : 1 })); s.append(svg('text', { x: pad.l - 8, y: yT(t) + 4, 'text-anchor': 'end', fill: '#ff8a7c', 'font-size': 12, 'font-weight': 700 }, t)); }
  for (let k = 0; k <= ax.nPos; k++) { const p = k * ax.pStep; s.append(svg('text', { x: pad.l + plotW + 8, y: yP(p) + 4, fill: '#79b8ff', 'font-size': 12, 'font-weight': 700 }, p)); }
  s.append(svg('text', { x: pad.l - 40, y: pad.t - 12, fill: '#ff8a7c', 'font-size': 12, 'font-weight': 800 }, 't (°C)'), svg('text', { x: pad.l + plotW + 14, y: pad.t - 12, fill: '#79b8ff', 'font-size': 12, 'font-weight': 800 }, 'pp (mm)'));
  MONTHS.forEach((m, i) => s.append(svg('text', { x: xC(i), y: Hh - pad.b + 20, 'text-anchor': 'middle', fill: 'var(--muted)', 'font-size': 12.5, 'font-weight': 700 }, m)));
  const g = svg('g', { 'clip-path': 'url(#clip-plot)' }); s.append(g);
  // perioade secetoase (P < 2T) – opțional
  if (opts.showDry) { const pts = []; for (let i = 0; i < 12; i++) { const dry = st.precipMm[i] < 2 * Math.max(0, st.tempC[i]); if (dry) g.append(svg('rect', { x: pad.l + colW * i, y: pad.t, width: colW, height: plotH, fill: '#ffb454', opacity: 0.16 })); } }
  if (!opts.hideData) {
    // bare
    st.precipMm.forEach((p, i) => { const bw = colW * 0.62; const top = yP(Math.min(p, ax.pTop)); const r = svg('rect', { x: xC(i) - bw / 2, y: top, width: bw, height: Math.max(0, y0 - top), rx: 3, fill: 'url(#pbar)', opacity: opts.compare ? 0.55 : 0.92, class: 'cbar' }); g.append(r); if (opts.showValues) g.append(svg('text', { x: xC(i), y: top - 5, 'text-anchor': 'middle', fill: '#9cc9ff', 'font-size': 10.5, 'font-weight': 700 }, Math.round(p))); });
    // linia temperaturii
    const d = st.tempC.map((t, i) => `${i ? 'L' : 'M'}${xC(i).toFixed(1)},${yT(t).toFixed(1)}`).join(''); g.append(svg('path', { d, fill: 'none', stroke: 'url(#tline)', 'stroke-width': 3.2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', style: opts.animate ? 'stroke-dasharray:1400;stroke-dashoffset:1400;animation:cdraw 1.4s .1s ease forwards' : '' }));
    st.tempC.forEach((t, i) => { g.append(svg('circle', { cx: xC(i), cy: yT(t), r: 4.2, fill: '#fff', stroke: '#ff4d6a', 'stroke-width': 2.4 })); if (opts.showValues) g.append(svg('text', { x: xC(i), y: yT(t) - 10, 'text-anchor': 'middle', fill: '#ff9a8c', 'font-size': 10.5, 'font-weight': 700 }, t.toFixed(1))); });
    // medie + amplitudine
    const S = stats(st);
    if (opts.showMean) { g.append(svg('line', { x1: pad.l, x2: pad.l + plotW, y1: yT(S.mean), y2: yT(S.mean), stroke: '#ffd37a', 'stroke-width': 1.6, 'stroke-dasharray': '7 5' }), svg('text', { x: pad.l + plotW - 6, y: yT(S.mean) - 6, 'text-anchor': 'end', fill: '#ffd37a', 'font-size': 12, 'font-weight': 800 }, `t medie ${S.mean.toFixed(1)} °C`)); }
    if (opts.showAmp) { const x = xC(S.iMax) + colW * 0.42; g.append(svg('line', { x1: pad.l, x2: pad.l + plotW, y1: yT(S.tMax), y2: yT(S.tMax), stroke: '#ff8a7c', 'stroke-dasharray': '2 5', opacity: 0.8 }), svg('line', { x1: pad.l, x2: pad.l + plotW, y1: yT(S.tMin), y2: yT(S.tMin), stroke: '#8ec9ff', 'stroke-dasharray': '2 5', opacity: 0.8 }), svg('line', { x1: pad.l + 14, x2: pad.l + 14, y1: yT(S.tMax), y2: yT(S.tMin), stroke: '#fff', 'stroke-width': 2 }), svg('path', { d: `M${pad.l + 9},${yT(S.tMax) + 8} L${pad.l + 14},${yT(S.tMax)} L${pad.l + 19},${yT(S.tMax) + 8} M${pad.l + 9},${yT(S.tMin) - 8} L${pad.l + 14},${yT(S.tMin)} L${pad.l + 19},${yT(S.tMin) - 8}`, fill: 'none', stroke: '#fff', 'stroke-width': 2 }), svg('text', { x: pad.l + 24, y: (yT(S.tMax) + yT(S.tMin)) / 2 + 4, fill: '#fff', 'font-size': 12.5, 'font-weight': 800 }, `amplitudine ${S.amp.toFixed(1)} °C`)); }
  }
  if (opts.title) s.append(svg('text', { x: W / 2, y: 26, 'text-anchor': 'middle', fill: 'var(--text)', 'font-size': 17, 'font-weight': 800 }, opts.title), svg('text', { x: W / 2, y: 44, 'text-anchor': 'middle', fill: 'var(--muted)', 'font-size': 12 }, opts.subtitle || ''));
  // legendă
  s.append(svg('rect', { x: pad.l, y: Hh - 16, width: 16, height: 8, rx: 2, fill: '#3d8bff' }), svg('text', { x: pad.l + 22, y: Hh - 8, fill: 'var(--muted)', 'font-size': 11.5 }, 'precipitații (mm)'), svg('line', { x1: pad.l + 150, x2: pad.l + 172, y1: Hh - 12, y2: Hh - 12, stroke: '#ff4d6a', 'stroke-width': 3 }), svg('text', { x: pad.l + 178, y: Hh - 8, fill: 'var(--muted)', 'font-size': 11.5 }, 'temperatura medie lunară (°C)'));
  // hover
  const geom = { pad, plotW, plotH, colW, xC, yT, yP, y0, ppm, ppc, ax, W, Hh, svgEl: s, g };
  if (opts.interactive) {
    const cross = svg('line', { y1: pad.t, y2: pad.t + plotH, stroke: 'var(--text)', 'stroke-width': 1, opacity: 0, 'stroke-dasharray': '3 4' }); s.append(cross);
    const tip = h('div', { class: 'tip3d', style: { display: 'none', position: 'absolute', zIndex: 4 } });
    s.addEventListener('pointermove', (e) => { const r = s.getBoundingClientRect(); const x = ((e.clientX - r.left) / r.width) * W; const i = Math.floor((x - pad.l) / colW); if (i < 0 || i > 11) { cross.setAttribute('opacity', 0); tip.style.display = 'none'; return; } cross.setAttribute('opacity', 0.55); cross.setAttribute('x1', xC(i)); cross.setAttribute('x2', xC(i)); tip.style.display = 'block'; tip.style.left = ((xC(i) / W) * r.width + 16) + 'px'; tip.style.top = (((pad.t + 10) / Hh) * r.height) + 'px'; tip.innerHTML = `<b>${MONTHS_LONG[i]}</b><small>t = ${st.tempC[i].toFixed(1)} °C</small><small>pp = ${Math.round(st.precipMm[i])} mm</small>`; opts.onHover && opts.onHover(i); });
    s.addEventListener('pointerleave', () => { cross.setAttribute('opacity', 0); tip.style.display = 'none'; opts.onHover && opts.onHover(-1); });
    geom.tip = tip;
  }
  return Object.assign(s, { geom });
}
