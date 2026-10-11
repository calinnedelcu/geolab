import { h } from '../core/dom.js';
import { ic, srcTag } from '../core/ui.js';
import { GENERAL, RO_UNITS, RO_GROUPS, RO_PEAKS } from '../data/relief.js';
import { buildReliefPage } from './relief_page.js';

// mic profil schematic depresiune/deal pentru Subcarpați
function profileSketch(seq) {
  const w = 220, hgt = 56; const segW = w / seq.length; let d = `M0,${hgt - 8}`;
  seq.forEach((s, i) => {
    const x0 = i * segW, x1 = (i + 1) * segW;
    if (s === 'depr') d += ` L${x0 + segW * 0.15},${hgt - 8} L${x0 + segW * 0.5},${hgt - 14} L${x1 - segW * 0.15},${hgt - 8} L${x1},${hgt - 8}`;
    else d += ` C${x0 + segW * 0.2},${hgt - 8} ${x0 + segW * 0.28},8 ${x0 + segW * 0.5},8 S${x1 - segW * 0.2},${hgt - 8} ${x1},${hgt - 8}`;
  });
  const wrap = h('div', { class: 'card tight', style: { marginTop: '12px' } }, h('div', { class: 'hint' }, 'Profil schematic (după schița din caiet)'));
  wrap.insertAdjacentHTML('beforeend', `<svg viewBox="0 0 ${w} ${hgt}" style="width:100%;height:auto;margin-top:6px"><path d="${d}" fill="none" stroke="var(--accent)" stroke-width="2.4"/>${seq.map((s, i) => `<text x="${(i + 0.5) * segW}" y="${hgt + 12}" fill="var(--muted)" font-size="10" text-anchor="middle">${s === 'depr' ? 'depr.' : 'deal'}</text>`).join('')}</svg>`);
  wrap.lastChild.setAttribute('viewBox', `0 0 ${w} ${hgt + 14}`);
  return wrap;
}

export default async function relieRomania(ctx = {}) {
  const cfg = {
    key: 'romania', assetName: 'terrain_romania', unitsAsset: 'units_romania', bordersAsset: 'borders_romania',
    units: RO_UNITS, groups: Object.entries(RO_GROUPS).map(([id, g]) => ({ id, name: g.name, color: g.color })), groupOf: (u) => ({ id: u.group, name: RO_GROUPS[u.group].name, color: RO_GROUPS[u.group].color }),
    peaks: RO_PEAKS, extremes: GENERAL.roExtremes, filterTitle: 'Trepte de relief (filtru)', listTitle: 'Unitățile de relief ale României',
    emptyText: 'Apasă pe o unitate de relief (munți, dealuri, podișuri, câmpii) sau alege din listă. Poți trasa și un profil topografic între două puncte.',
    tools: ['profile'],
    profilePresets: [
      { label: 'V → E peste Transilvania', a: { lon: 21.3, lat: 46.9 }, b: { lon: 27.9, lat: 46.9 } },
      { label: 'N → S peste Făgăraș', a: { lon: 24.75, lat: 46.35 }, b: { lon: 24.75, lat: 44.2 } },
      { label: 'Carpați → Delta', a: { lon: 25.6, lat: 45.45 }, b: { lon: 29.4, lat: 45.15 } },
    ],
    renderDetails: (u) => {
      const out = [];
      if (u.orient || u.span) out.push(h('div', { class: 'card tight', style: { marginTop: '12px' } }, u.span ? h('div', null, h('span', { class: 'hint' }, 'Poziție: '), u.span) : null, u.orient ? h('div', null, h('span', { class: 'hint' }, 'Orientare: '), h('b', null, u.orient)) : null));
      if (u.strips) out.push(h('div', { class: 'card tight', style: { marginTop: '12px' } }, h('div', { class: 'hint' }, 'Fâșii paralele de roci (NV → SE)'),
        h('div', { style: { display: 'flex', height: '16px', borderRadius: '8px', overflow: 'hidden', margin: '8px 0 6px' } }, u.strips.map(([n, c]) => h('div', { style: { flex: 1, background: c }, title: n }))),
        h('div', { class: 'chips' }, u.strips.map(([n, c]) => h('span', { class: 'chip', style: { '--chip': c, padding: '2px 8px', fontSize: '.76rem' } }, h('span', { class: 'dot' }), n)))));
      if (u.profile) out.push(profileSketch(u.profile));
      if (u.memo) out.push(h('div', { class: 'callout good', style: { marginTop: '12px' } }, ic('bulb'), h('div', null, h('b', null, 'Ține minte: '), u.memo)));
      return out;
    },
  };
  if (ctx.params && ctx.params.u) cfg.initialSelect = +ctx.params.u;
  return buildReliefPage(cfg);
}
