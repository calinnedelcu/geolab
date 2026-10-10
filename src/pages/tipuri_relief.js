import { h, svg, clear, clamp, rand } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { ic, srcTag, callout, pageHead, tabs, toggle, rangeField } from '../core/ui.js';
import * as store from '../core/store.js';
import { RELIEF_TYPES, TERMS } from '../data/relief.js';

const S = (tag, a, ...k) => svg(tag, a, ...k);
const css = `
.sc{width:100%;height:auto;border-radius:18px;background:linear-gradient(#0f2a55,#2a5aa0 55%,#93c4ee)}
.hot{cursor:pointer;transition:filter .2s}.hot:hover{filter:brightness(1.35) drop-shadow(0 0 8px #fff)}
.pulse{animation:pls 1.8s ease-in-out infinite;transform-box:fill-box;transform-origin:center}@keyframes pls{50%{transform:scale(1.35);opacity:.55}}
.drip{animation:drp 1.6s ease-in infinite}@keyframes drp{0%{transform:translateY(-4px);opacity:0}30%{opacity:1}100%{transform:translateY(34px);opacity:0}}
.lava{animation:lv 1.2s ease-in-out infinite alternate}@keyframes lv{to{opacity:.55;transform:translateY(-3px)}}
.smoke{animation:sm 4s ease-out infinite;transform-box:fill-box;transform-origin:center}@keyframes sm{0%{transform:translateY(0) scale(.5);opacity:.8}100%{transform:translateY(-90px) scale(1.7);opacity:0}}
.wave{animation:wv 5s ease-in-out infinite alternate}@keyframes wv{to{transform:translateX(-26px)}}
.flowd{animation:fd 1.2s linear infinite}@keyframes fd{to{stroke-dashoffset:-30}}
`;


// ------------------------------------------------------------------ imagini realiste (apasă = mărește)
function lightbox(src, alt) {
  const ov = h('div', { style: { position: 'fixed', inset: '0', zIndex: 5000, background: 'rgba(5,10,25,.9)', display: 'grid', placeItems: 'center', cursor: 'zoom-out', padding: '2vh 2vw' } }, h('img', { src, alt, style: { maxWidth: '96vw', maxHeight: '92vh', borderRadius: '14px', boxShadow: '0 20px 60px rgba(0,0,0,.6)' } }));
  const close = () => { ov.remove(); document.removeEventListener('keydown', onKey); }; const onKey = (e) => { if (e.key === 'Escape') close(); };
  ov.addEventListener('click', close); document.addEventListener('keydown', onKey); document.body.append(ov);
}
const PHOTO = (n, alt) => { const src = `assets/relief/${n}.jpg`; return h('img', { src, alt, title: 'Apasă ca să mărești', style: { width: '100%', height: 'auto', display: 'block', borderRadius: '18px', border: '1px solid var(--line)', cursor: 'zoom-in', background: 'var(--surface-2)', aspectRatio: '1600 / 685' }, onclick: () => lightbox(src, alt) }); };

// ------------------------------------------------------------------ scene
function sceneGlacial(infoSet) {
  const wrap = h('div'); let mode = 'montan';
  const draw = () => {
    clear(wrap); if (mode === 'calota') { wrap.append(PHOTO('01', 'Calotă glaciară, fiord și lac glaciar')); infoSet('Calotă glaciară · fiord · lac glaciar', 'Calota: gheață care acoperă o suprafață întinsă (Groenlanda, Antarctica). Fiordul: vale glaciară inundată de mare (Norvegia). Lacul glaciar: apă într-o depresiune creată de ghețari.'); return; }
    if (mode === 'montan') { wrap.append(PHOTO('00', 'Glaciar montan: circ, ghețar, vale glaciară, lac')); infoSet('Glaciar montan', 'Circ glaciar → ghețar → vale glaciară cu profil în U → lac glaciar. Apasă pe imagine ca s-o mărești.'); return; }
    const s = S('svg', { viewBox: '0 0 900 380', class: 'sc' }); wrap.append(s);
    if (mode === 'montan') {
      s.append(S('path', { d: 'M0,380 L0,250 L140,130 L230,200 L330,70 L450,210 L560,60 L700,190 L820,110 L900,200 L900,380Z', fill: '#4a5d73' }),
        S('path', { d: 'M310,110 L330,70 L360,120 L335,100Z M540,100 L560,60 L590,110 L565,92Z', fill: '#fff' }));
      // circ + ghețar + vale în U
      s.append(S('path', { d: 'M330,200 Q380,160 430,210 Q470,250 450,300 L380,380 L300,380 Q290,280 330,200Z', fill: '#cfe9ff', opacity: 0.95 }),
        S('path', { d: 'M385,300 Q420,320 430,380 L360,380 Q360,330 385,300Z', fill: '#e8f5ff' }),
        S('path', { d: 'M20,380 Q120,300 220,380Z', fill: '#2c3f55' }));
      s.append(S('ellipse', { cx: 560, cy: 330, rx: 90, ry: 26, fill: '#3b86d8', opacity: 0.95 }), S('ellipse', { cx: 560, cy: 326, rx: 90, ry: 20, fill: '#7dc0ff', opacity: 0.55 }));
      const hs = [[372, 235, 'Circ glaciar', 'Adâncitură „în fotoliu” săpată de ghețar, adesea cu lac glaciar.'], [405, 340, 'Ghețar / vale glaciară', 'Valea glaciară are profil în „U” (spre deosebire de valea de râu, în „V”).'], [560, 300, 'Lac glaciar', 'Lacul rămas în circ după topirea ghețarului (ex.: Bâlea, Zănoaga în Retezat).']];
      hs.forEach(([x, y, t, d]) => s.append(S('circle', { cx: x, cy: y, r: 11, fill: '#ffd37a', class: 'hot pulse', onclick: () => infoSet(t, d) }), S('text', { x: x + 16, y: y + 5, fill: '#fff', 'font-size': 14, 'font-weight': 700 }, t)));
    } else {
      s.append(S('rect', { x: 0, y: 0, width: 900, height: 380, fill: '#14325e' }), S('path', { d: 'M0,70 L900,70 L900,0 L0,0Z', fill: '#cfe9ff' }),
        S('path', { d: 'M0,70 L180,70 Q215,70 225,110 L255,330 Q258,360 290,360 L330,360 Q365,360 372,320 L395,95 Q400,70 430,70 L900,70 L900,380 L0,380Z', fill: '#2b3b50' }), S('path', { d: 'M215,90 L255,330 Q258,350 290,350 L330,350 Q360,350 365,320 L390,110Z', fill: '#2f78c4', opacity: 0.95 }));
      s.append(S('text', { x: 600, y: 40, fill: '#0d2a55', 'font-size': 16, 'font-weight': 800 }, 'Calota glaciară'), S('text', { x: 190, y: 210, fill: '#fff', 'font-size': 14, 'font-weight': 700, transform: 'rotate(-8 190 210)' }, 'Fiord'));
      [[300, 250, 'Fiord', 'Golf lung, îngust și adânc, săpat de un ghețar de calotă și umplut de mare (Norvegia).'], [600, 70, 'Calotă glaciară', 'Strat gros de gheață care acoperă o mare suprafață (Groenlanda, Antarctica; în trecut, nordul Europei).'], [470, 190, 'Lacuri glaciare', 'Lacuri formate în adânciturile lăsate de calotă (Finlanda, Suedia – „agăre” în caiet).']].forEach(([x, y, t, d]) => s.append(S('circle', { cx: x, cy: y, r: 11, fill: '#ffd37a', class: 'hot pulse', onclick: () => infoSet(t, d) })));
    }
  };
  draw();
  return { el: h('div', null, tabs([{ id: 'montan', label: 'Glaciar montan' }, { id: 'calota', label: 'Glaciar de calotă' }], 'montan', (m) => { mode = m; draw(); }), h('div', { style: { marginTop: '12px' } }, wrap)) };
}
function sceneKarst() { return { el: PHOTO('02', 'Relief carstic') }; }
function sceneVolcano(infoSet) {
  const box = h('div'); let active = true;
  const draw = () => { clear(box); box.append(PHOTO(active ? '03' : '04', active ? 'Vulcan activ' : 'Vulcan inactiv')); infoSet(active ? 'Vulcan activ (Europa)' : 'Vulcan inactiv (România)', ''); };
  draw();
  return { el: h('div', null, tabs([{ id: 'a', label: 'Activ (Europa)' }, { id: 'i', label: 'Inactiv (România)' }], 'a', (v) => { active = v === 'a'; draw(); }), h('div', { style: { marginTop: '12px' } }, box)) };
}
function sceneDunes() { return { el: PHOTO('05', 'Relief eolian: dune') }; }
function sceneCoast(infoSet) {
  const box = h('div'); let mode = 'fiord'; const FILE = { fiord: '06', dalmatic: '07', estuar: '08', delta: '09' };
  const NAME = { fiord: 'Fiord', dalmatic: 'Țărm dalmatic', estuar: 'Estuar', delta: 'Deltă' };
  const draw = () => { clear(box); box.append(PHOTO(FILE[mode], NAME[mode])); };
  draw();
  const ex = { fiord: 'Fiorduri (Norvegia)', dalmatic: 'Țărm dalmatic (Adriatica)', estuar: 'Estuare: Sena, Tamisa, Elba', delta: 'Delte: Dunăre, Pad, Ron (Rhône), Rin, Tibru' };
  return { el: h('div', null, tabs([{ id: 'fiord', label: 'Fiorduri' }, { id: 'dalmatic', label: 'Dalmatic' }, { id: 'estuar', label: 'Estuare' }, { id: 'delta', label: 'Delte' }], 'fiord', (m) => { mode = m; draw(); infoSet(ex[m], ''); }), h('div', { style: { marginTop: '12px' } }, box)) };
}

export default async function tipuri() {
  const el = h('div', { class: 'page wide' }); const style = h('style', null, css); el.append(style);
  el.append(pageHead({ eyebrow: 'Relief', title: 'Tipuri de relief', lead: 'Glaciar, carstic, vulcanic, eolian, litoral – cu imagini realiste pe care poți apăsa ca să le mărești.' }));
  const SCENES = { glacial: sceneGlacial, karst: sceneKarst, volcano: sceneVolcano, dunes: sceneDunes, coast: sceneCoast };
  let cur = null; const body = h('div'); const info = h('div', { class: 'card', style: { minHeight: '84px' } });
  const infoSet = (t, d) => { clear(info); info.append(h('h3', { style: { marginBottom: '4px' } }, t), h('p', { style: { margin: 0, color: 'var(--muted)' } }, d || 'Apasă pe imagine ca s-o mărești.')); };
  const show = (id) => { cur && cur.destroy && cur.destroy(); const t = RELIEF_TYPES.find((x) => x.id === id); clear(body); const sc = SCENES[t.scene](infoSet); cur = sc;
    infoSet(t.name, 'Apasă pe imagine ca s-o mărești .');
    body.append(h('div', { class: 'grid', style: { gridTemplateColumns: 'minmax(0,1.7fr) minmax(0,1fr)', alignItems: 'start' } }, h('div', null, sc.el, h('div', { style: { marginTop: '12px' } }, info)),
      h('div', { class: 'card' }, h('div', { class: 'row', style: { gap: '10px', marginBottom: '8px' } }, h('span', { style: { width: '26px', color: t.color }, html: '' }, ic(t.icon)), h('h3', { style: { margin: 0 } }, t.name)), h('div', { class: 'hint', style: { fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', fontSize: '.7rem' } }, 'Din caiete'), h('ul', { style: { margin: '6px 0 0', paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '8px' } }, t.caiet.map(([x, s]) => h('li', null, x, ' ', srcTag(s)))), t.ex ? h('div', { class: 'callout', style: { marginTop: '14px' } }, ic('info'), h('div', null, t.ex, ' ', t.exSrc ? srcTag(t.exSrc) : null)) : null))); };
  el.append(h('div', { class: 'row', style: { marginBottom: '14px' } }, tabs(RELIEF_TYPES.map((t) => ({ id: t.id, label: t.name })), 'glaciar', show)), body);
  el.append(h('h2', { style: { marginTop: '30px' } }, 'Cum se spune corect'), h('div', { class: 'grid c3' }, TERMS.map((t) => h('div', { class: 'card tight' }, h('b', null, t.term), h('div', { style: { color: 'var(--muted)', fontSize: '.92rem', marginTop: '4px' } }, t.def, ' ', srcTag(t.src))))));
  show('glaciar');
  return { el, destroy() { cur && cur.destroy && cur.destroy(); } };
}
