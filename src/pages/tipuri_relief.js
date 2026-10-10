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

// ------------------------------------------------------------------ scene
function sceneGlacial(infoSet) {
  const wrap = h('div'); let mode = 'montan';
  const draw = () => {
    clear(wrap); const s = S('svg', { viewBox: '0 0 900 380', class: 'sc' }); wrap.append(s);
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
function sceneKarst(infoSet) {
  const s = S('svg', { viewBox: '0 0 900 400', class: 'sc', style: 'background:linear-gradient(#5aa7e8,#c7e5ff 40%)' });
  s.append(S('rect', { x: 0, y: 140, width: 900, height: 260, fill: '#8a7a64' }), S('path', { d: 'M0,140 Q120,120 220,140 L260,170 L300,140 Q480,115 640,140 L700,200 L730,140 Q820,128 900,140 L900,0 L0,0Z', fill: '#bfe3ff' }),
    S('path', { d: 'M0,140 Q120,120 220,140 L260,170 L300,140 Q480,115 640,140 L700,200 L730,140 Q820,128 900,140', fill: 'none', stroke: '#3f7f56', 'stroke-width': 6 }));
  s.append(S('path', { d: 'M0,230 Q150,215 300,235 Q470,260 640,235 L900,250 L900,400 L0,400Z', fill: '#74664f' }));
  // peșteră
  s.append(S('path', { d: 'M120,330 Q180,250 300,280 Q380,300 470,270 Q560,250 600,320 Q620,360 560,370 Q420,380 300,372 Q150,376 120,330Z', fill: '#241d17' }));
  for (let i = 0; i < 9; i++) { const x = 190 + i * 45, l = 16 + (i * 7) % 24; s.append(S('path', { d: `M${x - 6},${290 + (i % 3) * 3} L${x},${290 + l + (i % 3) * 3} L${x + 6},${290 + (i % 3) * 3}Z`, fill: '#d9cfae' }), S('circle', { cx: x, cy: 296 + l, r: 2.5, fill: '#8fd1ff', class: 'drip', style: `animation-delay:${i * 0.2}s` })); }
  for (let i = 0; i < 6; i++) { const x = 220 + i * 62; s.append(S('path', { d: `M${x - 8},372 L${x},${350 - (i % 3) * 8} L${x + 8},372Z`, fill: '#cfc4a2' })); }
  // chei
  s.append(S('path', { d: 'M780,140 L790,330 L830,330 L840,140Z', fill: '#34281d' }), S('path', { d: 'M785,330 Q810,350 835,330Z', fill: '#3b86d8' }));
  const hs = [[260, 150, 'Dolină', 'Adâncitură în formă de pâlnie, apărută prin dizolvarea calcarului sau prăbușirea unei peșteri.'], [380, 330, 'Peșteră', 'Gol subteran dizolvat în calcar. Stalactite (de sus) și stalagmite (de jos) se formează din picăturile încărcate cu calcar.'], [810, 230, 'Chei', 'Vale îngustă și adâncă cu pereți abrupți, tăiată de un râu prin calcare.'], [660, 200, 'Doline mari', 'Doline alăturate pot forma un uvala; apa dispare în subteran.']];
  hs.forEach(([x, y, t, d]) => s.append(S('circle', { cx: x, cy: y, r: 11, fill: '#ffd37a', class: 'hot pulse', onclick: () => infoSet(t, d) }), S('text', { x: x + 16, y: y + 5, fill: '#fff', 'font-size': 14, 'font-weight': 800, style: 'paint-order:stroke;stroke:#000;stroke-width:3px' }, t)));
  return { el: h('div', null, s, h('div', { class: 'row', style: { marginTop: '12px' } }, h('div', { class: 'chips' }, ['Gips', 'Sare', 'Calcar'].map((x) => h('span', { class: 'chip', style: { '--chip': x === 'Gips' ? '#e8e0c8' : x === 'Sare' ? '#d8e6ff' : '#c9b79c' } }, h('span', { class: 'dot' }), x === 'Calcar' ? 'Calcar – peșteri „clasice”' : `Carst în ${x.toLowerCase()}`))))) };
}
function sceneVolcano(infoSet) {
  const wrap = h('div'); let active = true;
  const draw = () => {
    clear(wrap); const s = S('svg', { viewBox: '0 0 900 380', class: 'sc', style: active ? 'background:linear-gradient(#2a1630,#c2563a 70%,#f2a65a)' : 'background:linear-gradient(#10264a,#4a8ad0 70%,#b9e0ff)' });
    s.append(S('path', { d: 'M0,380 L0,330 L260,300 L400,120 L440,100 L520,100 L560,120 L700,300 L900,330 L900,380Z', fill: active ? '#3a2a2a' : '#4b5a52' }));
    if (active) {
      s.append(S('path', { d: 'M440,100 L520,100 L506,140 L454,140Z', fill: '#ff6a2a', class: 'lava' }), S('path', { d: 'M470,140 Q480,200 465,260 Q462,300 470,330 L490,330 Q500,300 495,260 Q510,200 490,140Z', fill: '#ff8a3a', opacity: 0.85, class: 'lava' }), S('path', { d: 'M480,100 Q430,170 392,250 Q380,290 400,300 Q430,230 470,160Z', fill: '#ff7a2a', class: 'lava' }));
      for (let i = 0; i < 5; i++) s.append(S('circle', { cx: 470 + i * 8, cy: 90, r: 22 + i * 4, fill: '#8a7a7a', class: 'smoke', style: `animation-delay:${i * 0.8}s` }));
      s.append(S('circle', { cx: 480, cy: 118, r: 11, fill: '#ffd37a', class: 'hot pulse', onclick: () => infoSet('Vulcan activ (Europa)', 'În Europa sunt vulcani activi: ex. Etna (Sicilia), Vezuviu, Stromboli (Italia); și în Islanda.') }));
    } else {
      s.append(S('path', { d: 'M440,100 L520,100 L510,128 L450,128Z', fill: '#2d7fc4' }), S('ellipse', { cx: 480, cy: 106, rx: 38, ry: 10, fill: '#7dc0ff', opacity: 0.9 }), S('circle', { cx: 480, cy: 106, r: 11, fill: '#ffd37a', class: 'hot pulse', onclick: () => infoSet('Lac vulcanic (România)', 'În România vulcanii sunt stinși (inactivi); în craterul lor s-au format lacuri vulcanice – ex. Lacul Sfânta Ana (Harghita).') }));
      for (let i = 0; i < 18; i++) s.append(S('path', { d: `M${120 + i * 40},${330 - (i % 4) * 4} l6,-26 l6,26Z`, fill: '#2f6b46' }));
    }
    s.append(S('text', { x: 24, y: 40, fill: '#fff', 'font-size': 18, 'font-weight': 800 }, active ? 'Vulcan activ – Europa' : 'Vulcan inactiv – România'));
    wrap.append(s);
  };
  draw();
  return { el: h('div', null, tabs([{ id: 'a', label: 'Activ (Europa)' }, { id: 'i', label: 'Inactiv (România)' }], 'a', (v) => { active = v === 'a'; draw(); }), h('div', { style: { marginTop: '12px' } }, wrap)) };
}
function sceneDunes(infoSet) {
  const cv = h('canvas', { width: 900, height: 360, class: 'sc', style: { aspectRatio: '900/360' } }); const cx = cv.getContext('2d'); let wind = 0.5, raf = 0, t = 0; const grains = Array.from({ length: 180 }, () => ({ x: Math.random() * 900, y: 200 + Math.random() * 130, v: 0.5 + Math.random() }));
  const range = rangeField('Viteza vântului', { min: 0, max: 1, step: 0.05, value: 0.5, format: (v) => (v < 0.3 ? 'slab' : v < 0.7 ? 'moderat' : 'puternic'), onInput: (v) => { wind = v; } });
  const loop = () => { raf = requestAnimationFrame(loop); t += 0.016 * (0.2 + wind * 2); cx.clearRect(0, 0, 900, 360); const sky = cx.createLinearGradient(0, 0, 0, 360); sky.addColorStop(0, '#f2c99a'); sky.addColorStop(1, '#fbe6c0'); cx.fillStyle = sky; cx.fillRect(0, 0, 900, 360); cx.fillStyle = '#ffe28a'; cx.beginPath(); cx.arc(780, 70, 34, 0, 7); cx.fill();
    const dune = (off, col, y0, a) => { cx.fillStyle = col; cx.beginPath(); cx.moveTo(0, 360); for (let x = 0; x <= 900; x += 6) { const ph = (x + t * 50 * wind * (off + 1)) / 130; const y = y0 + Math.sin(ph) * a + Math.sin(ph * 0.5 + off) * a * 0.6; cx.lineTo(x, y); } cx.lineTo(900, 360); cx.fill(); };
    dune(0, '#d9a85c', 230, 22); dune(1, '#c4903f', 275, 26); dune(2, '#a97a2f', 318, 18);
    cx.fillStyle = 'rgba(255,235,190,.9)'; grains.forEach((g) => { g.x += g.v * wind * 4 + 0.2; g.y += Math.sin(t * 3 + g.x * 0.02) * 0.4; if (g.x > 905) { g.x = -5; g.y = 200 + Math.random() * 130; } cx.fillRect(g.x, g.y, 2, 2); });
    cx.fillStyle = '#7a4a1f'; cx.font = '800 15px system-ui'; cx.fillText('Vântul cară și depune nisip → dune (relief eolian)', 20, 32); };
  loop();
  return { el: h('div', null, cv, h('div', { style: { marginTop: '12px', maxWidth: '420px' } }, range)), destroy() { cancelAnimationFrame(raf); } };
}
function sceneCoast(infoSet) {
  const wrap = h('div'); let mode = 'fiord';
  const draw = () => {
    clear(wrap); const s = S('svg', { viewBox: '0 0 900 380', class: 'sc', style: 'background:#14437f' }); wrap.append(s);
    const land = (d) => S('path', { d, fill: '#6a8a5a', stroke: '#2f4a2a', 'stroke-width': 3 });
    if (mode === 'fiord') s.append(land('M0,0 L900,0 L900,150 L600,150 L560,140 L520,150 L420,150 L395,140 L350,155 L300,150 L240,150 L215,140 L170,150 L0,150Z'), S('path', { d: 'M180,150 L190,330 L215,330 L225,150Z M370,150 L378,310 L402,310 L410,150Z M530,150 L535,300 L560,300 L565,150Z M110,150 L112,250 L130,250 L135,150Z', fill: '#2d87d8' }), S('text', { x: 24, y: 40, fill: '#fff', 'font-size': 18, 'font-weight': 800 }, 'Țărm cu fiorduri – ex.: Norvegia'));
    if (mode === 'dalmatic') s.append(land('M0,0 L900,0 L900,70 L0,70Z'), ...[0, 1, 2, 3, 4, 5, 6].map((i) => S('path', { d: `M${40 + i * 120},${130 + (i % 2) * 20} q60,-26 110,2 q-20,22 -70,18 q-30,0 -40,-20Z`, fill: '#6a8a5a', stroke: '#2f4a2a', 'stroke-width': 2.5 })), ...[0, 1, 2, 3, 4, 5].map((i) => S('path', { d: `M${20 + i * 140},70 q30,34 14,70`, fill: 'none', stroke: '#2f4a2a', 'stroke-width': 3 })), S('text', { x: 24, y: 40, fill: '#fff', 'font-size': 18, 'font-weight': 800 }, 'Țărm dalmatic – doar în zona Balcanică (Adriatica)'));
    if (mode === 'estuar') s.append(land('M0,0 L900,0 L900,140 L650,150 Q520,170 470,210 Q430,250 410,380 L0,380Z M900,150 L900,380 L520,380 Q540,250 600,200 Q760,160 900,150Z'), S('path', { d: 'M440,380 Q470,240 560,190 Q690,150 900,142 L900,150 Q760,160 600,200 Q540,250 520,380Z', fill: '#2d87d8' }), S('text', { x: 24, y: 40, fill: '#fff', 'font-size': 18, 'font-weight': 800 }, 'Țărm cu estuare – Sena, Tamisa, Elba'), S('text', { x: 24, y: 64, fill: '#cfe3ff', 'font-size': 14 }, 'Gura se lărgește în formă de pâlnie (influența mareelor)'));
    if (mode === 'delta') s.append(land('M0,0 L900,0 L900,120 L0,120Z'), S('path', { d: 'M440,0 L460,0 L462,120 L438,120Z', fill: '#2d87d8' }), ...[0, 1, 2, 3, 4].map((i) => S('path', { d: `M450,115 Q${450 + (i - 2) * 70},${170 + (i % 2) * 20} ${450 + (i - 2) * 150},230`, fill: 'none', stroke: '#2d87d8', 'stroke-width': 11, 'stroke-linecap': 'round' })), S('path', { d: 'M90,120 Q450,260 810,120 Q650,200 450,200 Q250,200 90,120Z', fill: '#8aa86a', opacity: 0.9 }), S('text', { x: 24, y: 40, fill: '#fff', 'font-size': 18, 'font-weight': 800 }, 'Țărm cu delte – Dunăre, Pad, Ron, Rin, Tibru'));
    s.append(S('g', { class: 'wave' }, ...[0, 1, 2, 3].map((i) => S('path', { d: `M-60,${300 + i * 22} q40,-12 80,0 t80,0 t80,0 t80,0 t80,0 t80,0 t80,0 t80,0 t80,0 t80,0 t80,0 t80,0`, fill: 'none', stroke: 'rgba(255,255,255,.22)', 'stroke-width': 3 }))));
  };
  draw();
  const ex = { fiord: 'Fiorduri (Norvegia)', dalmatic: 'Țărm dalmatic (Adriatica)', estuar: 'Estuare: Sena, Tamisa, Elba', delta: 'Delte: Dunăre, Pad, Ron (Rhône), Rin, Tibru' };
  return { el: h('div', null, tabs([{ id: 'fiord', label: 'Fiorduri' }, { id: 'dalmatic', label: 'Dalmatic' }, { id: 'estuar', label: 'Estuare' }, { id: 'delta', label: 'Delte' }], 'fiord', (m) => { mode = m; draw(); infoSet(ex[m], ''); }), h('div', { style: { marginTop: '12px' } }, wrap)) };
}

export default async function tipuri() {
  const el = h('div', { class: 'page wide' }); const style = h('style', null, css); el.append(style);
  el.append(pageHead({ eyebrow: 'Relief', title: 'Tipuri de relief', lead: 'Glaciar, carstic, vulcanic, eolian, litoral – cu mini-scene pe care poți apăsa. Fiecare punct galben ascunde o definiție.' }));
  const SCENES = { glacial: sceneGlacial, karst: sceneKarst, volcano: sceneVolcano, dunes: sceneDunes, coast: sceneCoast };
  let cur = null; const body = h('div'); const info = h('div', { class: 'card', style: { minHeight: '84px' } });
  const infoSet = (t, d) => { clear(info); info.append(h('h3', { style: { marginBottom: '4px' } }, t), h('p', { style: { margin: 0, color: 'var(--muted)' } }, d || 'Apasă pe punctele galbene de pe scenă.')); };
  const show = (id) => { cur && cur.destroy && cur.destroy(); const t = RELIEF_TYPES.find((x) => x.id === id); clear(body); const sc = SCENES[t.scene](infoSet); cur = sc;
    infoSet(t.name, 'Apasă pe punctele galbene de pe scenă ca să afli ce este fiecare.');
    body.append(h('div', { class: 'grid', style: { gridTemplateColumns: 'minmax(0,1.7fr) minmax(0,1fr)', alignItems: 'start' } }, h('div', null, sc.el, h('div', { style: { marginTop: '12px' } }, info)),
      h('div', { class: 'card' }, h('div', { class: 'row', style: { gap: '10px', marginBottom: '8px' } }, h('span', { style: { width: '26px', color: t.color }, html: '' }, ic(t.icon)), h('h3', { style: { margin: 0 } }, t.name)), h('div', { class: 'hint', style: { fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', fontSize: '.7rem' } }, 'Din caiete'), h('ul', { style: { margin: '6px 0 0', paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '8px' } }, t.caiet.map(([x, s]) => h('li', null, x, ' ', srcTag(s)))), t.ex ? h('div', { class: 'callout', style: { marginTop: '14px' } }, ic('info'), h('div', null, t.ex, ' ', t.exSrc ? srcTag(t.exSrc) : null)) : null))); };
  el.append(h('div', { class: 'row', style: { marginBottom: '14px' } }, tabs(RELIEF_TYPES.map((t) => ({ id: t.id, label: t.name })), 'glaciar', show)), body);
  el.append(h('h2', { style: { marginTop: '30px' } }, 'Cum se spune corect'), h('div', { class: 'grid c3' }, TERMS.map((t) => h('div', { class: 'card tight' }, h('b', null, t.term), h('div', { style: { color: 'var(--muted)', fontSize: '.92rem', marginTop: '4px' } }, t.def, ' ', srcTag(t.src))))));
  show('glaciar');
  return { el, destroy() { cur && cur.destroy && cur.destroy(); } };
}
