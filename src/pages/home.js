import { h, clear, loadAsset, pick, shuffle } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { ic, srcTag, ring, bar, countUp, revealOnScroll } from '../core/ui.js';
import * as store from '../core/store.js';
import { EU_UNITS, RO_UNITS } from '../data/relief.js';
import { MAIN_ZONES } from '../data/clima.js';

const FACTS = [
  'Mont Blanc (4810 m) e cel mai înalt vârf din Europa de Vest; Elbrus (5642 m, în Caucaz) e cel mai înalt din Europa.',
  'Cea mai joasă cotă a Europei e în Depresiunea Pericaspică: −28 m.',
  'Temperatura scade cu 0,6 °C la fiecare 100 m altitudine – calculează cât e pe Moldoveanu!',
  'România are, aproximativ, o treime munți, o treime dealuri și podișuri, o treime câmpii.',
  'Foehn-ul din Făgăraș aduce aer cald pe versantul nordic și poate topi zăpada la sfârșitul iernii.',
  'Germania face trecerea dintre climatul temperat oceanic și cel continental.',
  'Cea mai lungă peșteră din România este Peștera Vântului; din Europa – Hölloch (Elveția).',
  'Podișul Dobrogei e cel mai complex podiș din țară.',
  'Subcarpații Curburii au dealuri cutate și structură complexă (996 m – Măgura Odobești).',
  'Delta Dunării crește an de an: avansul deltelor mărește suprafața țării.',
  'În Europa sunt, permanent, 2 cicloni și 2 anticicloni.',
  'Amplitudinea termică = temperatura maximă lunară − temperatura minimă lunară.',
];

export default async function home() {
  const el = h('div', { class: 'page wide', style: { paddingTop: '18px' } });
  const s = store.get(); const li = store.levelInfo(s.xp);
  // ---------- hero
  const tilt = h('div', { class: 'hero-tilt' }, h('div', { class: 'hero-card c1' }), h('div', { class: 'hero-card c2' }), h('div', { class: 'hero-card c3' }));
  const hero = h('section', { class: 'hero' },
    h('div', { class: 'hero-copy' },
      h('div', { class: 'eyebrow', style: { color: 'var(--accent)', fontWeight: 800, letterSpacing: '.12em', fontSize: '.74rem', textTransform: 'uppercase' } }, 'Pregătire pentru test'),
      h('h1', { class: 'hero-title' }, 'Europa & România', h('br'), h('span', { class: 'gradient-text' }, 'învață pe hărți reale')),
      h('p', { class: 'lead', style: { color: 'var(--muted)', maxWidth: '54ch', fontSize: '1.08rem' } }, 'Reliefuri, climă, grafice și insule, peninsule, mări, golfuri – din notițele tale și ale colegului, puse pe hărți 2D reale, cu simulări, carduri și teste. Totul funcționează și fără internet.'),
      h('div', { class: 'row', style: { marginTop: '8px', gap: '12px' } },
        h('a', { class: 'btn primary', href: '#/test' }, ic('flag'), 'Ce intră la test'),
        h('a', { class: 'btn', href: '#/climograf' }, ic('chart'), 'Climograf'),
        h('a', { class: 'btn ghost', href: '#/quiz' }, ic('help'), 'Un quiz rapid')),
      h('div', { class: 'row', style: { marginTop: '16px', gap: '10px' } }, h('span', { class: 'hint' }, 'Legendă surse:'), ...srcTag('U'), h('span', { class: 'hint' }, 'caietul tău'), ...srcTag('C'), h('span', { class: 'hint' }, 'al colegului'), ...srcTag('F'), h('span', { class: 'hint' }, 'fișele de climă'), ...srcTag('X'), h('span', { class: 'hint' }, 'completare'))),
    tilt);
  el.append(hero);
  loadAsset('hero').then((a) => { tilt.querySelector('.c1').style.backgroundImage = `url(${a.romania})`; tilt.querySelector('.c2').style.backgroundImage = `url(${a.europe})`; tilt.querySelector('.c3').style.backgroundImage = `url(${a.world})`; }).catch(() => {});

  // ---------- progres
  const kinds = { eu: EU_UNITS.length, ro: RO_UNITS.length, zone: MAIN_ZONES.length };
  const have = (k) => Object.keys(s.discovered).filter((x) => x.startsWith(k + ':')).length;
  const pctOf = (k) => Math.round((have(k) / kinds[k]) * 100);
  const m = (t) => { const v = store.mastery(t); return v == null ? 0 : v * 100; };
  const total = Object.values(s.stats).reduce((a, t) => a + t.seen, 0), good = Object.values(s.stats).reduce((a, t) => a + t.correct, 0);
  const prog = h('section', { style: { marginTop: '34px' } }, h('h2', null, 'Progresul tău'),
    h('div', { class: 'grid c4' },
      h('div', { class: 'card' }, h('div', { class: 'row', style: { gap: '14px', flexWrap: 'nowrap' } }, ring(li.pct, 78, `${li.lvl}`), h('div', null, h('div', { class: 'hint' }, 'Nivel'), h('div', { class: 'num-big', style: { fontSize: '1.5rem' } }, `${s.xp} XP`), h('div', { class: 'hint' }, `${li.into} / ${li.need} până la nivelul ${li.lvl + 1}`)))),
      h('div', { class: 'card' }, h('div', { class: 'hint' }, 'Serie de zile'), h('div', { class: 'row', style: { alignItems: 'center', gap: '8px' } }, h('span', { style: { width: '30px', color: 'var(--warm)' } }, ic('flame')), h('span', { class: 'num-big', style: { fontSize: '2rem' } }, String(s.streak.days))), h('div', { class: 'hint' }, 'Intră în fiecare zi ca să o menții')),
      h('div', { class: 'card' }, h('div', { class: 'hint' }, 'Răspunsuri corecte'), h('div', { class: 'num-big', style: { fontSize: '2rem', color: 'var(--ok)' } }, total ? `${Math.round((good / total) * 100)}%` : '—'), h('div', { class: 'hint' }, `${good} din ${total} întrebări`)),
      h('div', { class: 'card' }, h('div', { class: 'hint' }, 'Unități descoperite'), h('div', { class: 'num-big', style: { fontSize: '2rem', color: 'var(--accent)' } }, `${have('eu') + have('ro') + have('zone')}`), h('div', { class: 'hint' }, `din ${kinds.eu + kinds.ro + kinds.zone} (relief + zone)`))));
  el.append(prog);
  const meters = h('div', { class: 'grid c3', style: { marginTop: '16px' } },
    ...[['Relief Europa', 'eu', 'Explorat pe hartă', '#a66bff', '/relief-europa'], ['Relief România', 'ro', 'Explorat pe hartă', '#e0524d', '/relief-romania'], ['Zone de climă', 'zone', 'Explorate pe hartă', '#34a853', '/zone-clima']].map(([n, k, d, c, href]) => h('a', { class: 'card tight hoverable', href: '#' + href }, h('div', { class: 'row', style: { justifyContent: 'space-between' } }, h('b', null, n), h('span', { class: 'hint' }, `${have(k)}/${kinds[k]}`)), h('div', { class: 'bar', style: { margin: '8px 0 4px' } }, h('i', { style: { '--w': pctOf(k) + '%', background: c } })), h('div', { class: 'hint' }, d))));
  el.append(meters);

  // ---------- pași
  const STEPS = [
    ['1', 'Vezi ce intră la test', 'Lista ta: insule/mări, reliefuri, clima.', '/test', 'flag'],
    ['2', 'Reliefuri', 'Europa (30 de unități), România (17) și tipurile de relief.', '/relief-europa', 'mountain'],
    ['3', 'Clima: zonele de climă', 'Toate zonele, de la ecuatorială la polară + Germania.', '/zone-clima', 'cloud'],
    ['4', 'Climograf', 'Fizionomia precipitațiilor, amplitudine, temperatură medie.', '/climograf', 'chart'],
    ['5', 'Clima Europei și a României', 'Factori, vânturi, cicloni + influențele din România.', '/clima-europa', 'wind'],
    ['6', 'Insule, peninsule, mări, golfuri', 'Atlasul Europei cu hartă și quiz.', '/insule', 'anchor'],
    ['7', 'Repetă și testează-te', 'Carduri cu repetiție spațiată + quiz.', '/carduri', 'cards'],
  ];
  el.append(h('section', { style: { marginTop: '34px' } }, h('h2', null, 'Plan de studiu recomandat'), h('div', { class: 'grid c3' }, STEPS.map(([n, t, d, href, ico]) => h('a', { class: 'card hoverable reveal', href: '#' + href }, h('div', { class: 'row', style: { gap: '12px', flexWrap: 'nowrap', alignItems: 'flex-start' } }, h('div', { style: { minWidth: '38px', height: '38px', borderRadius: '12px', display: 'grid', placeItems: 'center', fontWeight: 850, background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', color: 'var(--accent-ink)' } }, n), h('div', null, h('h3', { style: { margin: '0 0 3px' } }, t), h('div', { style: { color: 'var(--muted)', fontSize: '.92rem' } }, d))))))));

  // ---------- știai că
  const fact = h('div', { class: 'card', style: { display: 'flex', gap: '16px', alignItems: 'center', background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent) 10%, var(--surface-2)), var(--surface))' } }, h('span', { style: { width: '34px', color: 'var(--warm)', flex: 'none' } }, ic('bulb')), h('div', null, h('div', { class: 'hint', style: { fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', fontSize: '.7rem' } }, 'Știai că?'), h('div', { id: 'fact', style: { fontSize: '1.05rem', fontWeight: 600 } }, pick(FACTS))), h('div', { class: 'sp' }), h('button', { class: 'btn small', onclick: () => { document.getElementById('fact').textContent = pick(FACTS); } }, ic('shuffle'), 'Alta'));
  el.append(h('section', { style: { marginTop: '30px' } }, fact));

  // ---------- insigne
  const earned = s.badges; el.append(h('section', { style: { marginTop: '30px' } }, h('h2', null, 'Insigne'), h('div', { class: 'grid auto' }, store.BADGES.map((b) => { const on = !!earned[b.id]; return h('div', { class: 'card tight', style: { opacity: on ? 1 : 0.55, display: 'flex', gap: '12px', alignItems: 'center' } }, h('div', { style: { width: '42px', height: '42px', borderRadius: '14px', display: 'grid', placeItems: 'center', background: on ? 'linear-gradient(135deg, var(--warm), var(--pink))' : 'var(--surface-3)', color: on ? '#2a1400' : 'var(--faint)', flex: 'none' } }, h('span', { style: { width: '22px' } }, ic(on ? b.icon : 'lock'))), h('div', null, h('b', null, b.name), h('div', { class: 'hint' }, b.desc))); }))));
  el.append(h('div', { class: 'card', style: { marginTop: '30px' } }, h('div', { class: 'row' }, h('span', { style: { width: '26px', color: 'var(--info)' }, html: '' }, ic('info')), h('div', { class: 'sp' }, h('b', null, 'Despre date. '), 'Hărțile folosesc date reale de elevație (SRTM via AWS Terrain Tiles) și contururi Natural Earth. Informațiile din text provin din cele 25 de poze (caietul tău, caietul colegului și fișele de climă). Unde cele două surse diferă sau scrisul nu se poate citi, vezi pagina „Ce intră la test”.'), h('a', { class: 'btn small', href: '#/test' }, 'De verificat ', ic('chevR')))));
  revealOnScroll(el); el.querySelectorAll('.reveal').forEach((n) => setTimeout(() => n.classList.add('in'), 100));
  return { el, destroy() {} };
}
