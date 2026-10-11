import { h, svg, clear, loadAsset, shuffle } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { ic, srcTag, callout, chip, toggle, tabs, toast, confetti, beep } from '../core/ui.js';
import * as store from '../core/store.js';
import { WorldMap } from '../map/world_map.js';
import { labelMarker, shieldOverlay } from '../map/lf.js';
import { ZONES, ZONE_BY_ID, MAIN_ZONES, TEST_ZONES, ZONE_GROUPS, latShort } from '../data/clima.js';
import { ZONE_PLACES, WIND_BELTS } from '../data/clima_places.js';

export default async function zoneClima() {
  const root = h('div', { class: 'mapage' }); root.style.setProperty('--ar', '1.5');
  const left = h('aside', { class: 'mp-side left' }), right = h('aside', { class: 'mp-side right' }), center = h('div', { class: 'mp-center' });
  const head = h('div', { class: 'mp-head' }); const mapbox = h('div', { class: 'mp-map' }); const dock = h('div', { class: 'mp-dock', style: { display: 'none' } });
  center.append(head, mapbox, dock); root.append(left, center, right);
  mapbox.append(h('div', { class: 'loader' }, h('div', { class: 'spinner' }), h('div', null, 'Se încarcă harta zonelor de climă…')));
  const state = { selected: 0, quiz: null, testOnly: true, view: 'map' }; let wm = null; let destroyed = false;
  const testIds = TEST_ZONES.map((z) => z.id).concat([10]);

  (async () => {
    let asset; try { asset = await loadAsset('world'); } catch (e) { clear(mapbox); mapbox.append(h('div', { class: 'loader' }, 'Nu am putut încărca harta.')); return; }
    if (destroyed) return; clear(mapbox);
    wm = new WorldMap(mapbox, asset); await wm.ready; if (destroyed) { wm.dispose(); return; }
    wm.setTestOnly(testIds);
    // legendă pe hartă: doar zonele de la test (sau toate, când filtrul e oprit)
    const legName = (z) => (z.id === 10 ? 'Tranziție (Germania)' : z.id === 4 ? 'Tropical umed' : z.name.replace(/ \(.*\)$/, ''));
    const drawLegend = (onlyTest) => wm.setLegend((onlyTest ? testIds.map((i) => ZONE_BY_ID[i]) : MAIN_ZONES).map((z) => ({ id: z.id, name: legName(z), color: z.color, lat: latShort(z) })), (id) => select(id));
    drawLegend(true);
    // etichete de curenți (vânturi) – apar doar când stratul e pornit
    const beltMarks = [];

    const zoneBtns = new Map(); const mkZoneBtn = (z) => { const b = h('button', { class: 'chip', style: { display: 'flex', width: '100%', justifyContent: 'flex-start', borderRadius: '10px', marginBottom: '4px', '--chip': z.color }, onclick: () => select(z.id) }, h('span', { class: 'dot' }), h('b', { style: { fontWeight: 700 } }, z.name), h('span', { class: 'hint', style: { marginLeft: 'auto', fontSize: '.7rem', whiteSpace: 'nowrap' } }, latShort(z))); zoneBtns.set(z.id, b); return b; };
    const listPanel = h('div', { class: 'panel card tight' }, h('h4', null, 'Zonele de climă'),
      h('div', { class: 'hint', style: { margin: '4px 0 6px', fontWeight: 800, color: 'var(--accent)' } }, 'LA TEST: temperat + rece → subpolar'),
      ...TEST_ZONES.map(mkZoneBtn), mkZoneBtn(ZONE_BY_ID[10]),
      h('div', { class: 'hint', style: { margin: '12px 0 6px', fontWeight: 800 } }, 'EXTRA (nu sunt la test)'), ...MAIN_ZONES.filter((z) => !z.test).map(mkZoneBtn));
    const layers = h('div', { class: 'panel card tight' }, h('h4', null, 'Vedere'), h('div', { class: 'stack', style: { gap: '9px' } },
      toggle('Evidențiază doar zonele de la test', true, (v) => { state.testOnly = v; wm.setTestOnly(v && !state.selected ? testIds : null); drawLegend(v); }),
      toggle('Paralele (limite de latitudine)', true, (v) => wm.setBands(v)),
      toggle('Vânturi permanente (animat)', false, (v) => { wm.setWind(v); beltMarks.forEach((m) => (v ? m.addTo(wm.map) : m.remove())); })),
      h('div', { class: 'row', style: { marginTop: '12px', gap: '8px' } }, h('button', { class: 'btn small', onclick: () => { select(0); wm.resetView(); } }, ic('expand'), 'Toată lumea'), h('button', { class: 'btn small', onclick: () => { wm.flyTo(25, 45.8, 5); toast({ icon: 'pin', title: 'România', text: 'Climă temperat-continentală (≈ 43–48° lat N)' }); } }, ic('pin'), 'România')));
    const quizBtn = h('button', { class: 'btn small primary', onclick: () => startQuiz() }, ic('target'), 'Test: ghicește zona'); layers.append(h('div', { class: 'divider' }), h('h4', null, 'Exersează'), quizBtn, h('div', { class: 'hint', style: { marginTop: '8px' } }, 'Întrebările sunt doar din zonele de la test.'));
    left.append(listPanel, layers);
    // benzi de vânt (markere pe margine)
    WIND_BELTS.forEach((b) => { const html = `<div class="lbl country" style="color:${b.color};letter-spacing:.04em;text-transform:none;font-size:.72rem;transform:translate(0,-50%)">${b.n}</div>`; beltMarks.push(labelMarker(b.lat, -150, html, 'grp-belt')); });

    // ---------- fișa zonei
    const card = h('div', { class: 'panel card tight info-card' }); right.append(card);
    function renderCard(z) {
      clear(card);
      if (!z) { card.append(h('h4', null, 'Fișa zonei'), h('p', { style: { margin: '0 0 10px', color: 'var(--muted)' } }, 'Apasă pe o regiune colorată de pe hartă sau alege o zonă din listă. Zonele colorate puternic sunt cele de la test.'), h('div', { class: 'chips' }, TEST_ZONES.map((m) => chip(m.name, { color: m.color, dot: true, onClick: () => select(m.id) }))), h('div', { class: 'divider' }), callout('info', h('b', null, 'Tip: '), 'pornește „Vânturi permanente” ca să vezi alizeele (galben), vânturile de vest (albastru), vânturile polare (mov) și calmele ecuatoriale (roșu).')); return; }
      const g = ZONE_GROUPS[z.group];
      card.append(h('div', { class: 'row', style: { gap: '12px', alignItems: 'flex-start', flexWrap: 'nowrap' } }, h('div', { style: { width: '14px', alignSelf: 'stretch', borderRadius: '8px', background: z.color, boxShadow: `0 0 18px ${z.color}`, flex: 'none' } }, ''), h('div', { class: 'sp' }, h('h3', { style: { margin: 0 } }, z.name), h('div', { class: 'chips', style: { marginTop: '6px' } }, h('span', { class: 'chip active', style: { '--chip': g.color, padding: '2px 9px', fontSize: '.78rem' } }, g.name), h('span', { class: 'chip', style: { padding: '2px 9px', fontSize: '.78rem' } }, z.lat), z.test ? h('span', { class: 'badge ok' }, 'LA TEST') : h('span', { class: 'badge' }, 'extra')))), h('button', { class: 'btn icon small ghost', style: { position: 'absolute', right: '8px', top: '8px' }, onclick: () => select(0) }, ic('x')));
      // valoarea mare = înainte de paranteză; nota din paranteză apare mică dedesubt
      const stat = (label, v, color) => { const m = String(v).match(/^(.*?)\s*(\([^)]*\)|\(.*)$/); return h('div', { class: 'card tight' }, h('div', { class: 'hint' }, label), h('div', { class: 'num-big', style: { fontSize: '1.3rem', color } }, m ? m[1] : v), m ? h('div', { class: 'hint', style: { marginTop: '2px', fontSize: '.74rem' } }, m[2]) : null); };
      card.append(h('div', { class: 'grid c2', style: { gap: '10px', marginTop: '14px' } }, stat('t.m.a (temp. medie anuală)', z.tma, 'var(--warm)'), stat('pp.m.a (precipitații)', z.pp, 'var(--info)')));
      if (z.memo) card.append(h('div', { class: 'callout good', style: { marginTop: '10px' } }, ic('bulb'), h('div', null, h('b', null, 'Ține minte: '), z.memo, ' ', srcTag('F'))));
      const sec = (title, body) => h('div', { style: { marginTop: '12px' } }, h('div', { class: 'hint', style: { fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', fontSize: '.7rem' } }, title), body);
      card.append(sec('Unde se găsește', h('div', { class: 'chips', style: { marginTop: '6px' } }, (ZONE_PLACES[z.id] || []).map((p) => h('button', { class: 'chip', style: { '--chip': z.color }, onclick: () => wm.flyTo(p.lon, p.lat, 4.5) }, ic('pin'), p.n)))));
      card.append(sec('Cum arată vremea (și graficul)', h('p', { style: { margin: '4px 0 0', fontSize: '.92rem' } }, z.shape, ' ', z.seasons && z.seasons !== z.shape ? z.seasons : '')));
      card.append(h('dl', { class: 'kv', style: { marginTop: '12px' } }, h('dt', null, 'Vânturi'), h('dd', null, z.winds), h('dt', null, 'Sol'), h('dd', null, z.soil)));
      card.append(sec('Vegetație', h('ul', { style: { margin: '6px 0 0', paddingLeft: '18px', fontSize: '.9rem', display: 'flex', flexDirection: 'column', gap: '4px' } }, z.veg.map((v) => h('li', null, v)))));
      if (z.sub) card.append(h('div', { class: 'hint', style: { marginTop: '10px' } }, z.sub));
      if (z.verify) card.append(h('div', { style: { marginTop: '12px' } }, callout('warn', h('b', null, 'De verificat: '), z.verify)));
      card.append(h('div', { class: 'row', style: { marginTop: '14px', gap: '8px' } }, h('a', { class: 'btn small primary', href: `#/climograf?tab=galerie` }, ic('chart'), 'Vezi climograful'), h('span', { class: 'hint' }, 'Sursa: fișele color ', srcTag('F'))));
    }
    renderCard(null);
    function select(id, fly = true) {
      state.selected = id; wm.setSelected(id); wm.setTestOnly(!id && state.testOnly ? testIds : null); renderCard(id ? ZONE_BY_ID[id] : null); zoneBtns.forEach((b, k) => b.classList.toggle('active', k === id));
      if (id) { const pl = ZONE_PLACES[id] || []; wm.setPins(pl.map((p) => ({ name: p.n, lon: p.lon, lat: p.lat, color: ZONE_BY_ID[id].color, onClick: () => wm.flyTo(p.lon, p.lat, 4.5) }))); if (fly && pl.length) wm.flyToPoints(pl.map((p) => ({ lat: p.lat, lon: p.lon })), 0.35); store.discover('zone', id, 8); } else wm.setPins([]);
    }
    wm.on('hover', (e) => { if (!e || state.quiz) { wm.hideTip(); return; } const z = e.zone ? ZONE_BY_ID[e.zone] : null; if (!z) { wm.hideTip(); return; } wm.showTip(e.sx, e.sy, `<div>${z.name}</div><small>${z.test ? 'la test' : 'extra'} · ${z.lat}</small>`); });
    wm.on('click', (e) => { if (state.quiz) return quizClick(e.zone); if (e.zone) select(e.zone, false); });

    // ---------- test: ghicește zona (doar zonele de la test)
    const qPanel = h('div'); dock.append(qPanel); const showDock = (on) => { dock.style.display = on ? 'block' : 'none'; setTimeout(() => wm.map.invalidateSize(), 30); };
    const POOL = TEST_ZONES;
    function startQuiz() { state.quiz = { queue: shuffle(POOL.concat(POOL)).slice(0, 8), idx: 0, ok: 0, bad: 0, locked: false }; select(0, false); wm.setSelected(0); wm.setTestOnly(null); wm.setWind(false); showDock(true); nextQ(); }
    function endQuiz(done = true) { const q = state.quiz; state.quiz = null; wm.setSelected(0); wm.setPins([]); wm.setTestOnly(state.testOnly ? testIds : null); if (q && done) { clear(qPanel); const pct = Math.round((q.ok / Math.max(1, q.ok + q.bad)) * 100); qPanel.append(h('div', { class: 'row' }, h('h3', { style: { margin: 0 } }, `Rezultat: ${q.ok}/${q.ok + q.bad} (${pct}%)`), h('div', { class: 'sp' }), h('button', { class: 'btn small primary', onclick: startQuiz }, ic('rotate'), 'Din nou'), h('button', { class: 'btn small', onclick: () => showDock(false) }, 'Închide'))); if (pct >= 75) confetti(); store.addXP(q.ok * 2, 'Test zone de climă'); store.checkBadges(); } else showDock(false); }
    function nextQ() {
      const q = state.quiz; if (!q) return; if (q.idx >= q.queue.length) return endQuiz(); q.locked = false; const z = q.queue[q.idx]; clear(qPanel);
      const k = ['tma', 'where', 'pp', 'veg'][q.idx % 4]; let prompt;
      if (k === 'tma') prompt = ['Care zonă are t.m.a ', h('b', { class: 'gradient-text' }, z.tma), '?']; else if (k === 'pp') prompt = ['Care zonă are precipitații de ', h('b', { class: 'gradient-text' }, z.pp), '?']; else if (k === 'where') prompt = ['Apasă pe hartă zona: ', h('b', { class: 'gradient-text' }, z.name)]; else prompt = ['Care zonă are vegetația: ', h('b', { class: 'gradient-text' }, z.veg[0].slice(0, 90)), '?'];
      qPanel.append(h('div', { class: 'row', style: { flexWrap: 'nowrap' } }, h('span', { class: 'badge mint' }, `${q.idx + 1}/${q.queue.length}`), h('span', { class: 'badge ok' }, `✓ ${q.ok}`), h('span', { class: 'badge bad' }, `✗ ${q.bad}`), h('div', { class: 'sp' }), h('button', { class: 'btn small ghost', onclick: () => endQuiz(false) }, ic('x'), 'Oprește')), h('h3', { style: { margin: '10px 0 8px', fontSize: '1.02rem' } }, ...prompt));
      if (k !== 'where') qPanel.append(h('div', { class: 'grid c2', style: { gap: '8px' } }, shuffle(POOL).map((o) => h('button', { class: 'btn opt', onclick: (e) => answer(o.id === z.id, e.currentTarget, z) }, o.name)))); else qPanel.append(h('div', { class: 'hint' }, 'Click pe hartă, pe regiunea care crezi că aparține zonei.'));
    }
    function answer(ok, btn, z) { const q = state.quiz; if (!q || q.locked) return; q.locked = true; store.recordAnswer('zone-clima', ok); ok ? (q.ok++, beep('ok')) : (q.bad++, beep('bad')); btn.classList.add(ok ? 'good' : 'bad'); if (!ok) [...qPanel.querySelectorAll('button.opt')].find((b) => b.textContent === z.name)?.classList.add('good'); if (ok) store.addXP(3); setTimeout(() => { if (state.quiz === q) { q.idx++; nextQ(); } }, ok ? 800 : 1700); }
    function quizClick(zone) { const q = state.quiz; if (!q || q.locked || q.idx % 4 !== 1 || !zone) return; const z = q.queue[q.idx]; const ok = zone === z.id || (zone === 10 && (z.id === 6 || z.id === 7)); q.locked = true; store.recordAnswer('zone-clima', ok); ok ? (q.ok++, beep('ok'), store.addXP(3)) : (q.bad++, beep('bad'), toast({ icon: 'alert', title: zone ? `Aceea e: ${ZONE_BY_ID[zone].name}` : 'Nu e uscat', text: `Corect: ${z.name}` })); wm.setSelected(z.id); setTimeout(() => { if (state.quiz === q) { wm.setSelected(0); q.idx++; nextQ(); } }, ok ? 800 : 1700); }

    // ---------- comutator: Hartă / Scara latitudinii / Tabel
    const overlay = shieldOverlay(h('div', { class: 'mp-overlay', style: { display: 'none' } })); mapbox.append(overlay);
    const mapHint = h('span', { class: 'hint' }, 'Trage = deplasează · rotița = zoom · dublu-click = apropie');
    head.append(tabs([{ id: 'map', label: 'Hartă' }, { id: 'scale', label: 'Scara latitudinii' }, { id: 'table', label: 'Tabel comparativ' }], 'map', (v) => setView(v)), h('div', { class: 'sp' }), mapHint);
    // în vederile pe toată lățimea (scară / tabel) ascundem fișa din dreapta ca să încapă tabelul; la întoarcere o refacem
    let hadHideRight = null;
    function setView(v) {
      state.view = v; overlay.style.display = v === 'map' ? 'none' : 'block'; mapHint.style.display = v === 'map' ? '' : 'none';
      if (v !== 'map') { if (hadHideRight == null) hadHideRight = root.classList.contains('hide-right'); root.classList.add('hide-right'); clear(overlay); overlay.append(v === 'scale' ? scaleView() : tableView()); }
      else if (hadHideRight != null) { root.classList.toggle('hide-right', hadHideRight); hadHideRight = null; }
    }
    function scaleView() {
      const wrap = h('div', { style: { maxWidth: '1100px', margin: '0 auto' } }, h('h2', null, 'Zonele de climă pe latitudine'), h('p', { style: { color: 'var(--muted)', maxWidth: '70ch' } }, 'Aproape toate zonele sunt „benzi” între paralele. Apasă pe o bandă ca să deschizi fișa zonei. Temperat oceanic și temperat continental ocupă aceeași bandă de latitudine (40–60°) – diferența o face distanța față de ocean (V vs. interior); Germania face trecerea.'));
      const W = 980, Hh = 560, y = (lat) => 40 + ((90 - lat) / 180) * (Hh - 70); const s = svg('svg', { viewBox: `130 0 ${W - 190} ${Hh}`, style: { width: '100%', height: 'auto', background: 'var(--surface)', borderRadius: '18px', border: '1px solid var(--line)' } });
      const bands = [[0, 5, 1, 'Ecuatorială'], [5, 15, 2, 'Subecuatorială'], [15, 30, 3, 'Tropical uscat / umed (musonic)'], [30, 40, 5, 'Mediteraneană'], [40, 60, 6, 'Temperat oceanic (V) / continental (interior)'], [60, 70, 8, 'Subpolar'], [70, 90, 9, 'Polar']]; const x0 = 250, x1 = 650;
      bands.forEach(([a, b, id, label]) => [1, -1].forEach((sgn) => { const ya = y(sgn * a), yb = y(sgn * b); const top = Math.min(ya, yb), hh = Math.abs(yb - ya); const z = ZONE_BY_ID[id]; s.append(svg('rect', { x: x0, y: top + 1, width: x1 - x0, height: hh - 2, rx: 7, fill: z.color, 'fill-opacity': z.test ? 0.92 : 0.42, style: { cursor: 'pointer' }, onclick: () => { setView('map'); head.querySelectorAll('.tab').forEach((t, i) => t.classList.toggle('active', i === 0)); select(id); } })); if (hh > 22) s.append(svg('text', { x: (x0 + x1) / 2, y: top + hh / 2 + 4, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 750, fill: '#0b1020', 'pointer-events': 'none' }, label + (z.test ? ' ★' : ''))); }));
      s.append(svg('line', { x1: x0 - 40, x2: x1 + 40, y1: y(0), y2: y(0), stroke: 'var(--text)', 'stroke-dasharray': '5 5', opacity: 0.7 }), svg('text', { x: x0 - 46, y: y(0) + 4, 'text-anchor': 'end', fill: 'var(--text)', 'font-size': 12 }, 'Ecuator 0°'));
      [5, 15, 30, 40, 60, 70].forEach((l) => [1, -1].forEach((sg) => s.append(svg('text', { x: x0 - 46, y: y(sg * l) + 4, 'text-anchor': 'end', fill: 'var(--muted)', 'font-size': 12 }, `${l}° ${sg > 0 ? 'N' : 'S'}`))));
      [[0, 30, 'Alizee', '#ffb454'], [30, 60, 'Vânturi de vest', '#67b7ff'], [60, 90, 'Vânturi polare (de est)', '#b6a3ff']].forEach(([a, b, lab, col]) => [1, -1].forEach((sg) => { const ya = y(sg * a), yb = y(sg * b); const top = Math.min(ya, yb), hh = Math.abs(yb - ya); s.append(svg('rect', { x: x1 + 70, y: top + 3, width: 6, height: hh - 6, rx: 3, fill: col }), svg('text', { x: x1 + 86, y: top + hh / 2 + 4, fill: 'var(--text)', 'font-size': 12.5, 'font-weight': 700 }, lab)); }));
      s.append(svg('text', { x: x1 + 70, y: 22, fill: 'var(--faint)', 'font-size': 11, 'font-weight': 800, 'letter-spacing': 1.2 }, 'VÂNTURI PERMANENTE'), svg('text', { x: x0, y: 22, fill: 'var(--faint)', 'font-size': 11, 'font-weight': 800, 'letter-spacing': 1.2 }, 'ZONE DE CLIMĂ (★ = la test)'));
      wrap.append(s, h('div', { style: { marginTop: '14px' } }, callout('info', 'Pe fișe: Mediteraneană 30–40°, Temperat oceanic și continental 40–60/66°, Subpolar 60/66–70°, Polar 70°–poli. Germania face trecerea între temperat oceanic și continental.'))); return wrap;
    }
    function tableView() {
      const wrap = h('div', { style: { maxWidth: '1280px', margin: '0 auto' } }); let cover = false; let onlyTest = true;
      const tw = h('div', { class: 'table-wrap' });
      wrap.append(h('div', { class: 'row', style: { marginBottom: '12px' } }, h('h2', { style: { margin: 0 } }, 'Tabel comparativ'), h('div', { class: 'sp' }), toggle('Doar zonele de la test', true, (v) => { onlyTest = v; draw(); }), toggle('Acoperă răspunsurile (autotest)', false, (v) => { cover = v; draw(); })), h('p', { class: 'hint' }, 'Cu „Acoperă răspunsurile” activ, apasă pe o celulă ca s-o descoperi – exact ca la un caiet acoperit cu mâna.'), tw);
      const cols = [['Latitudine', (z) => z.lat], ['t.m.a', (z) => z.tma], ['pp.m.a', (z) => z.pp], ['Vânturi', (z) => z.winds], ['Sol', (z) => z.soil], ['Vegetație', (z) => z.veg.join(' • ')], ['Ține minte', (z) => z.memo || '']];
      function draw() { clear(tw); const tb = h('table', { class: 'table' }); tb.append(h('thead', null, h('tr', null, h('th', null, 'Zonă'), cols.map((c) => h('th', null, c[0])))));
        const body = h('tbody'); ZONES.filter((z) => !z.special && (!onlyTest || z.test)).forEach((z) => body.append(h('tr', null, h('td', null, h('b', { style: { color: z.color } }, z.name), z.test ? h('span', { class: 'badge ok', style: { marginLeft: '6px' } }, 'test') : null), cols.map(([n, f], i) => { const td = h('td', { style: { minWidth: i === 5 ? '260px' : '110px', fontSize: '.86rem' } }, f(z)); if (cover && n !== 'Latitudine') { td.style.filter = 'blur(7px)'; td.style.cursor = 'pointer'; td.style.userSelect = 'none'; td.addEventListener('click', () => { td.style.filter = 'none'; td.style.userSelect = 'auto'; }); } return td; })))); tb.append(body); tw.append(tb); }
      draw(); return wrap;
    }
    const startZone = new URLSearchParams(location.hash.split('?')[1] || '').get('zona'); if (startZone) { const z = ZONES.find((x) => x.key === startZone); if (z) setTimeout(() => select(z.id), 400); }
  })();

  const mkToggle = (side, el) => { const b = h('button', { class: 'mp-toggle', title: 'Ascunde / arată panoul', onclick: () => { root.classList.toggle('hide-' + side); setTimeout(() => wm && wm.map.invalidateSize(), 260); } }, ic(side === 'left' ? 'chevL' : 'chevR')); el.prepend(b); };
  mkToggle('left', left); mkToggle('right', right);
  return { el: root, destroy() { destroyed = true; wm && wm.dispose(); } };
}
