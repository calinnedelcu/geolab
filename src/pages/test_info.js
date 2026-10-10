import { h, clear } from '../core/dom.js';
import { ic, pageHead, callout, srcTag, ring } from '../core/ui.js';
import * as store from '../core/store.js';
import { EXAM, VERIFY, GLOSSARY } from '../data/misc.js';

export default async function testInfo() {
  const el = h('div', { class: 'page' });
  el.append(pageHead({ eyebrow: 'Pregătire', title: 'Ce intră la test', lead: EXAM.note }));
  const key = 'exam-checks';
  const getC = () => store.get().settings[key] || {};
  const setC = (id, v) => store.update((s) => { s.settings[key] = { ...(s.settings[key] || {}), [id]: v }; });
  const allRows = EXAM.groups.flatMap((g) => g.rows);
  const prog = h('div', { class: 'card', style: { marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' } });
  const drawProg = () => { const done = allRows.filter((r) => getC()[r.id]).length; clear(prog); prog.append(ring((done / allRows.length) * 100, 78, `${done}/${allRows.length}`), h('div', { class: 'sp' }, h('h3', { style: { margin: 0 } }, 'Progresul tău la subiectele de test'), h('div', { class: 'hint' }, 'Bifează când simți că știi un subiect; poți reveni oricând.')), h('a', { class: 'btn primary', href: '#/quiz' }, ic('help'), 'Quiz pe subiectele de test'), h('a', { class: 'btn', href: '#/carduri' }, ic('cards'), 'Carduri')); };
  drawProg();
  const mkRow = (r) => { const cb = h('input', { type: 'checkbox', checked: !!getC()[r.id], onchange: (e) => { setC(r.id, e.target.checked); row.classList.toggle('done', e.target.checked); drawProg(); } }); const row = h('div', { class: 'trow' }, h('label', { style: { display: 'flex', gap: '12px', alignItems: 'flex-start', cursor: 'pointer', flex: 1 } }, cb, h('span', null, r.label)), h('div', { class: 'row', style: { gap: '6px' } }, (r.links || []).map(([t, href]) => h('a', { class: 'btn small', href }, t, ' ', ic('chevR'))))); row.classList.toggle('done', !!getC()[r.id]); return row; };
  const st = h('style', null, '.done label span{opacity:.6;text-decoration:line-through}.trow{display:flex;flex-direction:column;gap:8px;padding:11px 0;border-bottom:1px solid var(--line)}.trow .row{padding-left:30px}.trow:last-child{border-bottom:0}');
  el.append(st, prog, h('div', { class: 'grid c3', style: { alignItems: 'start' } }, EXAM.groups.map((g) => h('div', { class: 'card', style: { borderTop: `3px solid ${g.color}` } }, h('div', { class: 'row', style: { gap: '10px', marginBottom: '6px', flexWrap: 'nowrap' } }, h('span', { style: { width: '26px', color: g.color, flex: 'none' } }, ic(g.icon)), h('h3', { style: { margin: 0 } }, g.title)), g.rows.map(mkRow), g.hint ? h('div', { class: 'callout warn', style: { marginTop: '12px' } }, ic('alert'), h('div', null, g.hint)) : null))));
  el.append(h('div', { style: { marginTop: '16px' } }, callout('good', h('b', null, 'Din caietul tău: '), EXAM.tipsHeard, ' Antrenează-te la ', h('a', { href: '#/climograf' }, 'Climograf'), '.')));
  // ---- de verificat
  const sevLabel = { bad: ['Probabil greșeală', 'bad'], warn: ['De verificat', 'warn'], info: ['Notă', ''] };
  const filter = { sev: 'all' };
  const vwrap = h('div', { class: 'stack' });
  const drawV = () => { clear(vwrap); VERIFY.filter((v) => filter.sev === 'all' || v.sev === filter.sev).forEach((v) => vwrap.append(h('div', { class: `callout ${v.sev === 'bad' ? 'warn' : v.sev === 'info' ? '' : 'warn'}` }, ic(v.sev === 'info' ? 'info' : 'alert'), h('div', null, h('div', { class: 'row', style: { gap: '8px', marginBottom: '2px' } }, h('span', { class: `badge ${sevLabel[v.sev][1]}` }, sevLabel[v.sev][0]), h('span', { class: 'hint' }, v.topic), h('b', null, v.item)), h('div', null, v.detail), v.fix ? h('div', { style: { marginTop: '4px', color: 'var(--accent)', fontWeight: 650 } }, '→ ', v.fix) : null)))); };
  drawV();
  el.append(h('h2', { id: 'verifica', style: { marginTop: '34px' } }, 'De verificat / diferențe între caiete'), h('p', { style: { color: 'var(--muted)', maxWidth: '78ch' } }, 'Am citit pozele rând cu rând și le-am comparat. Iată unde caietele diferă, unde scrisul e greu de citit sau unde informația pare neobișnuită. Merită clarificat cu profesorul / atlasul.'),
    h('div', { class: 'chips', style: { marginBottom: '12px' } }, [['all', 'Toate'], ['bad', 'Probabil greșeli'], ['warn', 'De verificat'], ['info', 'Note']].map(([id, l]) => h('button', { class: `chip ${filter.sev === id ? 'active' : ''}`, onclick: (e) => { filter.sev = id; [...e.currentTarget.parentNode.children].forEach((c) => c.classList.remove('active')); e.currentTarget.classList.add('active'); drawV(); } }, l))), vwrap);
  return { el, destroy() {} };
}

export async function glosar() {
  const el = h('div', { class: 'page' });
  el.append(pageHead({ eyebrow: 'Referință', title: 'Glosar', lead: 'Toți termenii din caiete, pe înțelesul tuturor. Caută sau filtrează.' }));
  const q = h('input', { type: 'search', placeholder: 'Caută un termen…', style: { maxWidth: '360px' } }); const list = h('div', { class: 'grid auto', style: { marginTop: '16px' } });
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const draw = () => { clear(list); const t = norm(q.value); GLOSSARY.filter((g) => !t || norm(g.term + ' ' + g.def).includes(t)).sort((a, b) => a.term.localeCompare(b.term, 'ro')).forEach((g) => list.append(h('div', { class: 'card tight' }, h('div', { class: 'row', style: { gap: '8px' } }, h('b', null, g.term), h('span', { class: 'sp' }), ...srcTag(g.src)), h('div', { style: { color: 'var(--muted)', fontSize: '.92rem', marginTop: '4px' } }, g.def)))); if (!list.children.length) list.append(h('p', { class: 'hint' }, 'Niciun termen găsit.')); };
  q.addEventListener('input', draw); draw(); el.append(q, list); return { el, destroy() {} };
}
