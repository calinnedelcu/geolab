import { h, clear } from '../core/dom.js';
import { ic, srcTag, chip } from '../core/ui.js';
import { PERIODS, PERIOD_BY_ID, EU_UNITS, EU_PEAKS, EU_MISSING, PERIOD_MNEMONIC } from '../data/relief.js';
import { buildReliefPage, shade } from './relief_page.js';

// „Mașina timpului”: dezvăluie unitățile în ordinea apariției lor
function timeMachine(viewer, api) {
  const steps = [
    { n: 0, label: 'Înainte', text: 'Încă nimic… Apasă Play sau trage cursorul.' },
    ...PERIODS.map((p, i) => ({ n: i + 1, label: p.name, text: `${p.name} – ${p.age}. ${p.explain}` })),
  ];
  const caption = h('div', { style: { fontSize: '.86rem', color: 'var(--muted)', minHeight: '66px', marginTop: '6px' } });
  const label = h('b', { class: 'num-big', style: { color: 'var(--accent)' } }, 'Toate');
  let timer = null;
  const range = h('input', { type: 'range', min: 0, max: 4, step: 1, value: 4 });
  const apply = (n, announce = true) => {
    const per = PERIODS.filter((p) => p.order <= n).map((p) => p.id);
    const ids = EU_UNITS.filter((u) => per.includes(u.per)).map((u) => u.id);
    if (n >= 4) viewer.setFilter(null); else viewer.setFilter(ids.length ? ids : [999]);
    label.textContent = steps[n].label; caption.textContent = steps[n].text;
    range.value = n; range.style.setProperty('--fill', (n / 4) * 100 + '%');
    api.activeGroups.clear(); (n >= 4 ? PERIODS.map((p) => p.id) : per).forEach((x) => api.activeGroups.add(x)); if (!api.activeGroups.size) PERIODS.forEach((p) => api.activeGroups.add(p.id)); api.drawChips();
  };
  range.addEventListener('input', () => { stop(); apply(+range.value); });
  range.style.setProperty('--fill', '100%');
  const playBtn = h('button', { class: 'btn small primary' }, ic('play'), 'Play');
  const stop = () => { clearInterval(timer); timer = null; playBtn.replaceChildren(ic('play'), 'Play'); };
  playBtn.addEventListener('click', () => {
    if (timer) return stop();
    let n = 0; apply(0); playBtn.replaceChildren(ic('pause'), 'Pauză');
    timer = setInterval(() => { n++; if (n > 4) return stop(); apply(n); }, 3600);
  });
  const panel = h('div', { class: 'glass panel' }, h('h4', null, 'Mașina timpului geologic'),
    h('div', { class: 'row', style: { justifyContent: 'space-between' } }, h('span', { class: 'hint' }, 'Perioada:'), label), range, caption,
    h('div', { class: 'row', style: { marginTop: '6px' } }, playBtn, h('span', { class: 'hint' }, 'Mnemonic: P · C · H · A')));
  panel.__stop = stop;
  return panel;
}

export default async function relieEuropa(ctx) {
  const unitsByPer = (p) => EU_UNITS.filter((u) => u.per === p);
  const cfg = {
    key: 'europe', assetName: 'terrain_europe', unitsAsset: 'units_europe', bordersAsset: 'borders_europe',
    units: EU_UNITS, groups: PERIODS.map((p) => ({ id: p.id, name: p.name, color: p.color })), groupOf: (u) => { const p = PERIOD_BY_ID[u.per]; return { id: p.id, name: p.name, color: p.color }; },
    peaks: EU_PEAKS, filterTitle: 'Perioade geologice (filtru)', listTitle: 'Cele 30 de unități (numerotarea din caiet)',
    missingNote: `Numerele ${EU_MISSING.join(' și ')} lipsesc din caietul colegului (și sunt greu de citit în al tău).`,
    emptyText: 'Apasă pe o unitate colorată de pe hartă sau alege din listă. Culoarea arată perioada geologică în care s-a format: Precambrian, Caledonic, Hercinic, Alpin.',
    timeMachine, labelNum: (u) => u.id,
    renderDetails: (u) => {
      const p = PERIOD_BY_ID[u.per];
      return [h('div', { class: 'card tight', style: { marginTop: '12px', borderColor: `color-mix(in srgb, ${p.color} 55%, var(--line))` } },
        h('div', { class: 'hint' }, 'Perioada geologică'), h('div', { style: { fontWeight: 800, color: p.color } }, p.name, p.orogeny ? ` – ${p.orogeny}` : ''),
        h('div', { class: 'hint', style: { marginTop: '4px' } }, `Vârstă: ${p.age} `, srcTag('X')), h('div', { style: { fontSize: '.88rem', marginTop: '6px' } }, p.explain))];
    },
  };
  if (ctx && ctx.params && ctx.params.u) cfg.initialSelect = +ctx.params.u;
  const pg = await buildReliefPage(cfg);
  return pg;
}
