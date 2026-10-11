import { h, svg, clear, clamp, fmt, shuffle, pick, loadAsset } from '../core/dom.js';
import { ic, srcTag, callout, pageHead, tabs, toggle, toast, confetti, beep, ring, bar } from '../core/ui.js';
import * as store from '../core/store.js';
import { climographSVG, axes, stats, clues, MONTHS, MONTHS_LONG } from '../core/climo.js';
import { ZONES, ZONE_BY_KEY, MAIN_ZONES, TEST_ZONES, TEST_SHAPES } from '../data/clima.js';

const zoneOf = (st) => ZONE_BY_KEY[st.zoneId] || ZONE_BY_KEY.temperat_continental;
const css = `.climo{--tx:1}@keyframes cdraw{to{stroke-dashoffset:0}}.cbar{transition:opacity .2s}.cbar:hover{opacity:1}
.blur-num{filter:blur(8px);cursor:pointer;transition:filter .25s;user-select:none}.blur-num.on{filter:none;user-select:auto}
.climo-wrap{position:relative}.tbl-mini td,.tbl-mini th{padding:5px 7px;font-size:.8rem;text-align:center}
.draw-hit{cursor:crosshair}`;

export default async function climograf({ params } = {}) {
  const el = h('div', { class: 'page wide' }); el.append(h('style', null, css));
  el.append(pageHead({ eyebrow: 'Exersează graficele', title: 'Climograf', lead: 'La lucrare vine „doar grafic”: de calculat amplitudinea și temperatura medie. Aici înveți să citești, să calculezi și să recunoști zona – pe date reale de pe 6 continente și din România.' }));
  const loader = h('div', { class: 'loader', style: { height: '260px' } }, h('div', { class: 'spinner' }), 'Se încarcă stațiile meteo…'); el.append(loader);
  let asset; try { asset = await loadAsset('climate'); } catch (e) { clear(el); el.append(pageHead({ eyebrow: 'Climograf', title: 'Climograf' }), callout('warn', 'Datele climatice nu s-au putut încărca: ' + e.message)); return { el, destroy() {} }; }
  loader.remove();
  const stations = asset.stations.filter((s) => s.tempC && s.precipMm && s.tempC.length === 12 && s.precipMm.length === 12);
  const byId = Object.fromEntries(stations.map((s) => [s.id, s]));
  const body = h('div'); let cur = null; let token = 0;
  const TABS = [{ id: 'galerie', label: 'Fizionomia precipitațiilor', fn: tabGalerie }, { id: 'explor', label: 'Explorează', fn: tabExplor }, { id: 'calc', label: 'Calculează (ca la lucrare)', fn: tabCalc }, { id: 'zona', label: 'Recunoaște zona', fn: tabZona }, { id: 'draw', label: 'Desenează graficul', fn: tabDraw }, { id: 'comp', label: 'Compară', fn: tabComp }];
  const show = (id) => { const my = ++token; cur && cur.destroy && cur.destroy(); clear(body); const t = TABS.find((x) => x.id === id); const inst = t.fn(); if (my !== token) return; body.append(inst.el); cur = inst; };

  // ------------------------------------------------------------ helpers
  const grouped = () => { const g = {}; stations.forEach((s) => { (g[s.zoneId] = g[s.zoneId] || []).push(s); }); return g; };
  const stationSelect = (value, onChange, filter = () => true) => { const sel = h('select', { onchange: (e) => onChange(byId[e.target.value]) }); const g = grouped(); [...ZONES.filter((z) => !z.special), ZONE_BY_KEY.tranzitie].forEach((z) => { const items = (g[z.key] || []).filter(filter); if (!items.length) return; const og = h('optgroup', { label: z.name }); items.forEach((s) => og.append(h('option', { value: s.id, selected: s.id === value }, `${s.name}${s.country ? ' (' + s.country + ')' : ''}`))); sel.append(og); }); const rom = stations.filter((s) => s.isRomania && filter(s)); return sel; };
  const record = (ok) => { store.recordAnswer('climograf', ok); store.update((s) => { s.climo.solved++; if (ok) s.climo.correct++; }); store.checkBadges(); };

  // ============================================================ GALERIE – fizionomia precipitațiilor (zonele de la test)
  function tabGalerie() {
    const root = h('div');
    root.append(callout('good', h('b', null, 'La test: „fizionomia pp. pe grafice”. '), 'adică: cum arată barele de precipitații și linia temperaturii în fiecare zonă. Mai jos ai cele patru zone de la test + Germania (trecerea oceanic → continental), cu grafice reale. Apoi exersează la „Recunoaște zona”.'));
    const cheat = h('div', { class: 'table-wrap', style: { margin: '16px 0' } }, h('table', { class: 'table' }, h('thead', null, h('tr', null, ['Zonă', 'Precipitații (barele)', 'Temperatura (linia)', 'Indiciu rapid'].map((x) => h('th', null, x)))), h('tbody', null, TEST_SHAPES.map((z) => h('tr', null, h('td', null, h('b', { style: { color: z.color } }, z.title)), h('td', null, z.fiz), h('td', null, z.temp), h('td', null, h('span', { class: 'badge mint' }, z.clue)))))));
    root.append(cheat);
    TEST_SHAPES.forEach((z) => {
      const reps = z.rep.map((id) => byId[id]).filter(Boolean); if (!reps.length) return; const ax = axes(reps);
      const zoneObj = ZONE_BY_KEY[z.key];
      root.append(h('section', { class: 'card', style: { marginTop: '16px', borderLeft: `4px solid ${z.color}` } },
        h('div', { class: 'row', style: { marginBottom: '8px' } }, h('h3', { style: { margin: 0, color: z.color } }, z.title), h('span', { class: 'badge ok' }, 'la test'), h('div', { class: 'sp' }), h('a', { class: 'btn small', href: `#/zone-clima?zona=${z.key}` }, ic('globe'), 'Zona pe hartă')),
        h('p', { style: { margin: '0 0 10px', color: 'var(--muted)' } }, h('b', { style: { color: 'var(--text)' } }, 'Pe fișă: '), z.card, ' ', srcTag('F')),
        h('div', { class: 'grid', style: { gridTemplateColumns: `repeat(${Math.min(3, reps.length)}, minmax(0,1fr))`, gap: '12px' } }, reps.map((st) => { const c = climographSVG(st, { axes: ax, interactive: true, showMean: true, showAmp: true, width: 560, height: 360, title: `${st.name}${st.country ? ' – ' + st.country : ''}`, subtitle: `t medie ${stats(st).mean.toFixed(1)} °C · amplitudine ${stats(st).amp.toFixed(1)} °C · ${fmt(stats(st).sumP)} mm/an` }); return h('div', { class: 'climo-wrap', style: { position: 'relative' } }, c, c.geom.tip); })),
        h('ul', { style: { margin: '12px 0 0', paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '.92rem' } }, h('li', null, h('b', null, 'Precipitații: '), z.fiz), h('li', null, h('b', null, 'Temperaturi: '), z.temp)),
        zoneObj && zoneObj.tma && z.key !== 'tranzitie' ? h('div', { class: 'hint', style: { marginTop: '8px' } }, `Fișa: t.m.a ${zoneObj.tma} · pp ${zoneObj.pp}. Orașele reale pot ieși din aceste intervale (sunt orientative).`) : null));
    });
    root.append(h('div', { style: { marginTop: '16px' } }, callout('info', h('b', null, 'Cum le deosebești repede: '), '1) uită-te la bare: egale tot anul (oceanic), mari iarna (mediteraneană), mari vara (continental), foarte mici (subpolar); 2) apoi la linie: amplitudine mică (oceanic), medie (mediteraneană, Germania), mare (continental), foarte mare + sub 0 °C (subpolar).')));
    return { el: root, destroy() {} };
  }

  // ============================================================ EXPLOREAZĂ
  function tabExplor() {
    const root = h('div'); let st = byId[(params && params.st) || ''] || stations.find((s) => s.id === 'bucuresti') || stations[0]; let opts = { showMean: true, showAmp: true, showValues: true, showDry: false, hide: false };
    const chartHost = h('div', { class: 'climo-wrap card', style: { padding: '14px' } }); const side = h('div', { class: 'stack' });
    const zoneChips = h('div', { class: 'chips' });
    const draw = () => {
      clear(chartHost); const z = zoneOf(st); const S = stats(st);
      const chart = climographSVG(st, { interactive: true, showMean: opts.showMean, showAmp: opts.showAmp, showValues: opts.showValues, showDry: opts.showDry, animate: true, title: `${st.name}${st.country ? ' – ' + st.country : ''}`, subtitle: `${st.lat != null ? Math.abs(st.lat).toFixed(1) + '°' + (st.lat >= 0 ? ' N' : ' S') : ''}${st.altM != null ? ' · ' + fmt(st.altM) + ' m altitudine' : ''}${st.period ? ' · medii ' + st.period : ''}` });
      chartHost.append(chart, chart.geom.tip);
      // fișa
      clear(side);
      const blur = (txt, cls = '') => { const sp = h('span', { class: `${opts.hide ? 'blur-num' : ''} ${cls}`, onclick: (e) => e.currentTarget.classList.add('on') }, txt); return sp; };
      side.append(h('div', { class: 'card' }, h('div', { class: 'row', style: { gap: '10px', flexWrap: 'nowrap' } }, h('div', { style: { width: '12px', alignSelf: 'stretch', borderRadius: '8px', background: z.color } }), h('div', { class: 'sp' }, h('div', { class: 'hint' }, 'Zonă de climă'), h('h3', { style: { margin: 0 } }, opts.hide ? blur(z.name) : z.name), st.zoneNote ? h('div', { class: 'hint' }, st.zoneNote) : null)), h('a', { class: 'btn small', style: { marginTop: '10px' }, href: `#/zone-clima?zona=${z.key}` }, ic('globe'), 'Vezi zona pe hartă')));
      const kv = (a, b, c) => h('div', { class: 'card tight' }, h('div', { class: 'hint' }, a), h('div', { class: 'num-big', style: { fontSize: '1.45rem', color: c } }, b));
      side.append(h('div', { class: 'grid c2', style: { gap: '10px' } }, kv('Temperatura medie anuală', blur(`${S.mean.toFixed(1)} °C`), 'var(--warm)'), kv('Amplitudine termică', blur(`${S.amp.toFixed(1)} °C`), 'var(--pink)'), kv('Precipitații anuale', blur(`${fmt(S.sumP)} mm`), 'var(--info)'), kv('Lună caldă / rece', blur(`${MONTHS[S.iMax]} / ${MONTHS[S.iMin]}`), 'var(--text)')));
      // calcul pas cu pas
      const steps = h('details', { class: 'card tight' }, h('summary', { style: { cursor: 'pointer', fontWeight: 750 } }, 'Cum se calculează (pas cu pas)'),
        h('div', { style: { fontSize: '.9rem', marginTop: '8px' } },
          h('p', null, h('b', null, 'Amplitudine'), ' = t max − t min = ', h('b', null, `${S.tMax.toFixed(1)} − (${S.tMin.toFixed(1)}) = ${S.amp.toFixed(1)} °C`)),
          h('p', null, h('b', null, 't medie anuală'), ' = (suma celor 12 medii lunare) ÷ 12 = ', h('b', null, `${S.sumT.toFixed(1)} ÷ 12 = ${S.mean.toFixed(1)} °C`)),
          h('p', { style: { margin: 0 } }, h('b', null, 'Precipitații anuale'), ' = suma celor 12 luni = ', h('b', null, `${fmt(S.sumP)} mm`))));
      side.append(steps);
      // fișa vs. stație
      if (z && z.tmaR) { const inT = S.mean >= z.tmaR[0] - 0.4 && S.mean <= z.tmaR[1] + 0.4, inP = S.sumP >= z.ppR[0] * 0.85 && S.sumP <= z.ppR[1] * 1.15; side.append(h('div', { class: 'card tight' }, h('div', { class: 'hint' }, 'Fișa zonei vs. această stație'), h('div', { style: { fontSize: '.92rem', marginTop: '4px' } }, h('div', null, `t.m.a (fișă): ${z.tma} → stația: ${S.mean.toFixed(1)} °C `, h('span', { class: `badge ${inT ? 'ok' : 'warn'}` }, inT ? 'se potrivește' : 'în afara intervalului')), h('div', { style: { marginTop: '4px' } }, `pp.m.a (fișă): ${z.pp} → stația: ${fmt(S.sumP)} mm `, h('span', { class: `badge ${inP ? 'ok' : 'warn'}` }, inP ? 'se potrivește' : 'în afara intervalului'))), h('div', { class: 'hint', style: { marginTop: '6px' } }, 'Intervalele de pe fișe sunt orientative: o stație anume poate ieși din ele.'))); }
      // indicii
      side.append(h('div', { class: 'card tight' }, h('div', { class: 'hint', style: { fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', fontSize: '.7rem' } }, 'Cum „citești” graficul'), h('ul', { style: { margin: '6px 0 0', paddingLeft: '18px', fontSize: '.9rem', display: 'flex', flexDirection: 'column', gap: '5px' } }, clues(st).map((c) => h('li', null, c))), st.shapeNote ? h('p', { class: 'hint', style: { marginBottom: 0 } }, st.shapeNote) : null));
      if (st.transition) side.append(callout('info', 'Germania face trecerea dintre temperat oceanic și temperat continental.'));
      if (st.confidence && st.confidence !== 'high') side.append(h('div', { class: 'hint' }, `Încredere în date: ${st.confidence}.`));
      store.discover('climo', st.id, 3);
    };
    const sel = stationSelect(st.id, (s) => { st = s; draw(); }); sel.value = st.id;
    const rnd = h('button', { class: 'btn small', onclick: () => { st = pick(stations); sel.value = st.id; draw(); } }, ic('shuffle'), 'Aleatoriu');
    const zoneRow = h('div', { class: 'chips' }, MAIN_ZONES.map((z) => h('button', { class: 'chip', style: { '--chip': z.color }, onclick: () => { const c = stations.filter((s) => s.zoneId === z.key); if (c.length) { st = pick(c); sel.value = st.id; draw(); } } }, h('span', { class: 'dot' }), z.name)), h('button', { class: 'chip', style: { '--chip': '#d4a22a' }, onclick: () => { const c = stations.filter((s) => s.isRomania); if (c.length) { st = pick(c); sel.value = st.id; draw(); } } }, h('span', { class: 'dot' }), 'România'));
    const toggles = h('div', { class: 'row', style: { gap: '18px' } }, toggle('t medie', true, (v) => { opts.showMean = v; draw(); }), toggle('Amplitudine', true, (v) => { opts.showAmp = v; draw(); }), toggle('Valori pe grafic', true, (v) => { opts.showValues = v; draw(); }), toggle('Perioade secetoase (P < 2T)', false, (v) => { opts.showDry = v; draw(); }), toggle('Ascunde răspunsurile', false, (v) => { opts.hide = v; draw(); }));
    root.append(h('div', { class: 'row', style: { marginBottom: '12px', gap: '12px' } }, h('div', { class: 'field', style: { minWidth: '260px' } }, h('label', null, 'Stația meteo'), sel), rnd, h('div', { class: 'sp' }), toggles), zoneRow, h('div', { class: 'grid', style: { gridTemplateColumns: 'minmax(0,1.5fr) minmax(0,1fr)', alignItems: 'start', marginTop: '14px' } }, chartHost, side),
      h('div', { style: { marginTop: '10px' } }, callout('info', h('b', null, 'Despre „perioade secetoase”: '), 'în graficele de tip Walter–Lieth, când bara de precipitații e sub linia temperaturii (P < 2T, cu scara 1 °C = 2 mm), luna este secetoasă. E un extra față de caiet – util ca să vezi vara uscată a zonei mediteraneene.')));
    draw(); return { el: root, destroy() {} };
  }

  // ============================================================ CALCULEAZĂ
  function tabCalc() {
    const root = h('div'); let st, mode = 'tabel', score = { ok: 0, n: 0 }, locked = false; const host = h('div');
    const nextSt = () => { let s; do { s = pick(stations); } while (st && s.id === st.id && stations.length > 1); st = s; locked = false; render(); };
    const render = () => {
      clear(host); const S = stats(st); const showTable = mode === 'tabel';
      const chart = climographSVG(st, { interactive: true, showValues: showTable, hideName: true, title: 'Climograf (stație ascunsă)', subtitle: `${Math.abs(st.lat).toFixed(0)}° ${st.lat >= 0 ? 'N' : 'S'}` }); const chartCard = h('div', { class: 'climo-wrap card', style: { padding: '14px' } }, chart, chart.geom.tip);
      const inpMean = h('input', { type: 'number', step: 0.1, placeholder: 't medie anuală (°C)' }), inpAmp = h('input', { type: 'number', step: 0.1, placeholder: 'amplitudine (°C)' }), inpP = h('input', { type: 'number', step: 1, placeholder: 'precipitații anuale (mm)' });
      const fb = h('div', { style: { marginTop: '12px' } });
      const tolT = showTable ? 0.15 : 1.0, tolP = showTable ? 0.01 : 0.08;
      const check = () => {
        if (locked) return; if (inpMean.value === '' || inpAmp.value === '' || inpP.value === '') { toast({ icon: 'alert', title: 'Completează toate cele 3 câmpuri' }); return; }
        locked = true; const okM = Math.abs(+inpMean.value - S.mean) <= tolT, okA = Math.abs(+inpAmp.value - S.amp) <= tolT, okP = Math.abs(+inpP.value - S.sumP) <= Math.max(showTable ? 1.5 : 10, S.sumP * tolP);
        const n = [okM, okA, okP].filter(Boolean).length; score.n += 3; score.ok += n; record(n === 3); n === 3 ? (beep('ok'), confetti(window.innerWidth * 0.6, window.innerHeight * 0.4, 24), store.addXP(10, 'Climograf rezolvat corect!')) : (beep('bad'), store.addXP(n * 2));
        const row = (lab, ok, mine, right, unit) => h('div', { class: 'row', style: { gap: '8px' } }, h('span', { class: `badge ${ok ? 'ok' : 'bad'}` }, ok ? '✓' : '✗'), h('b', null, lab), h('span', null, `tu: ${mine} ${unit}`), !ok ? h('span', { style: { color: 'var(--accent)', fontWeight: 700 } }, `→ corect: ${right} ${unit}`) : null);
        clear(fb); fb.append(h('div', { class: 'card tight' }, row('t medie', okM, inpMean.value, S.mean.toFixed(1), '°C'), row('Amplitudine', okA, inpAmp.value, S.amp.toFixed(1), '°C'), row('Precipitații', okP, inpP.value, fmt(S.sumP), 'mm')),
          h('div', { class: 'card tight', style: { marginTop: '10px' } }, h('div', { class: 'hint' }, `Stația: ${st.name} (${st.country}) – ${zoneOf(st).name}`), h('p', { style: { fontSize: '.9rem', margin: '6px 0 0' } }, h('b', null, 'Amplitudine'), ` = ${S.tMax.toFixed(1)} (${MONTHS_LONG[S.iMax]}) − (${S.tMin.toFixed(1)}) (${MONTHS_LONG[S.iMin]}) = ${S.amp.toFixed(1)} °C. `, h('b', null, 'Medie'), ` = ${S.sumT.toFixed(1)} ÷ 12 = ${S.mean.toFixed(1)} °C.`)), h('div', { class: 'row', style: { marginTop: '10px' } }, h('button', { class: 'btn primary', onclick: nextSt }, 'Următorul ', ic('chevR'))));
        scoreEl.textContent = `Scor sesiune: ${score.ok}/${score.n}`;
      };
      [inpMean, inpAmp, inpP].forEach((i) => i.addEventListener('keydown', (e) => { if (e.key === 'Enter') check(); }));
      const tbl = h('div', { class: 'table-wrap', style: { marginTop: '12px' } }, h('table', { class: 'table tbl-mini' }, h('thead', null, h('tr', null, h('th', null, ''), MONTHS.map((m) => h('th', null, m)))), h('tbody', null, h('tr', null, h('th', null, 't °C'), st.tempC.map((t) => h('td', null, t.toFixed(1)))), h('tr', null, h('th', null, 'pp mm'), st.precipMm.map((p) => h('td', null, Math.round(p)))))));
      host.append(h('div', { class: 'grid', style: { gridTemplateColumns: 'minmax(0,1.5fr) minmax(0,1fr)', alignItems: 'start' } }, h('div', null, chartCard, showTable ? tbl : null),
        h('div', { class: 'card' }, h('h3', null, 'Calculează'), h('p', { style: { color: 'var(--muted)', fontSize: '.92rem' } }, showTable ? 'Cu tabelul sub ochi: valori exacte.' : 'Din grafic: estimează valorile (se acceptă o mică abatere).'),
          h('div', { class: 'stack' }, h('div', { class: 'field' }, h('label', null, 'Temperatura medie anuală (°C)'), inpMean), h('div', { class: 'field' }, h('label', null, 'Amplitudinea termică (°C)'), inpAmp), h('div', { class: 'field' }, h('label', null, 'Precipitații anuale (mm)'), inpP)),
          h('div', { class: 'row', style: { marginTop: '14px' } }, h('button', { class: 'btn primary', onclick: check }, ic('check'), 'Verifică'), h('button', { class: 'btn ghost', onclick: nextSt }, 'Sari peste')), fb)));
      setTimeout(() => inpMean.focus(), 40);
    };
    const scoreEl = h('span', { class: 'badge mint' }, 'Scor sesiune: 0/0');
    root.append(h('div', { class: 'row', style: { marginBottom: '12px' } }, tabs([{ id: 'tabel', label: 'Cu tabel (exact)' }, { id: 'grafic', label: 'Doar din grafic' }], 'tabel', (m) => { mode = m; locked = false; render(); }), h('div', { class: 'sp' }), scoreEl), host, h('div', { style: { marginTop: '14px' } }, callout('good', h('b', null, 'Rețeta: '), 'Amplitudine = luna cea mai caldă − luna cea mai rece. T medie = suma lunilor ÷ 12. Precipitații anuale = suma barelor.')));
    nextSt(); return { el: root, destroy() {} };
  }

  // ============================================================ RECUNOAȘTE ZONA
  function tabZona() {
    const root = h('div'); let st, allZ = false; const poolSt = () => stations.filter((s) => allZ || TEST_ZONES.some((z) => z.key === s.zoneId)); let queue = shuffle(poolSt()).slice(0, 12), idx = 0, ok = 0, locked = false; const host = h('div');
    const render = () => {
      clear(host); if (idx >= queue.length) { host.append(h('div', { class: 'card', style: { textAlign: 'center', padding: '36px' } }, ring((ok / queue.length) * 100, 110), h('h2', { style: { marginTop: '12px' } }, `${ok}/${queue.length} zone recunoscute`), h('button', { class: 'btn primary', onclick: () => { queue = shuffle(poolSt()).slice(0, 12); idx = 0; ok = 0; render(); } }, ic('rotate'), 'Din nou'))); store.addXP(ok * 2); store.checkBadges(); return; }
      st = queue[idx]; locked = false; const z = zoneOf(st); const chart = climographSVG(st, { interactive: true, hideName: true, showValues: false, title: 'Din ce zonă de climă este acest grafic?', subtitle: 'Indiciu: forma precipitațiilor și amplitudinea' });
      const optPool = allZ ? MAIN_ZONES : TEST_ZONES; const choices = shuffle([z, ...shuffle(optPool.filter((m) => m.id !== z.id)).slice(0, allZ ? 3 : 3)]).filter(Boolean); const fb = h('div', { style: { marginTop: '10px' } });
      const answer = (c, btn) => { if (locked) return; locked = true; const right = c.id === z.id || (st.transition && (c.key === 'temperat_oceanic' || c.key === 'temperat_continental')); record(right); right ? (ok++, beep('ok'), store.addXP(3)) : beep('bad'); [...opts.querySelectorAll('button')].forEach((b) => { b.disabled = true; if (b.dataset.id === String(z.id)) b.classList.add('good'); else if (b === btn) b.classList.add('bad'); });
        clear(fb); fb.append(h('div', { class: `callout ${right ? 'good' : 'warn'}` }, ic(right ? 'check' : 'alert'), h('div', null, h('b', null, `${st.name} (${st.country}) – ${z.name}. `), h('ul', { style: { margin: '6px 0 0', paddingLeft: '18px' } }, clues(st).slice(0, 4).map((x) => h('li', null, x))))), h('div', { class: 'row', style: { marginTop: '10px' } }, h('button', { class: 'btn primary', id: 'nx', onclick: () => { idx++; render(); } }, 'Următorul ', ic('chevR')), h('a', { class: 'btn small', href: `#/zone-clima?zona=${z.key}` }, 'Fișa zonei')));
        setTimeout(() => fb.querySelector('#nx') && fb.querySelector('#nx').focus(), 20); };
      const opts = h('div', { class: 'grid c2', style: { gap: '8px' } }, choices.map((c) => h('button', { class: 'btn opt', 'data-id': c.id, style: { justifyContent: 'flex-start', padding: '12px 14px', whiteSpace: 'normal' }, onclick: (e) => answer(c, e.currentTarget) }, h('span', { class: 'legend-dot', style: { color: c.color, background: c.color } }), c.name)));
      host.append(h('div', { class: 'row', style: { marginBottom: '8px' } }, h('span', { class: 'badge mint' }, `${idx + 1} / ${queue.length}`), h('span', { class: 'badge ok' }, `✓ ${ok}`), h('div', { class: 'sp' })), bar((idx / queue.length) * 100), h('div', { class: 'grid', style: { gridTemplateColumns: 'minmax(0,1.5fr) minmax(0,1fr)', alignItems: 'start', marginTop: '12px' } }, h('div', { class: 'climo-wrap card', style: { padding: '14px' } }, chart, chart.geom.tip), h('div', { class: 'card' }, h('h3', null, 'Alege zona'), opts, fb)));
    };
    root.append(h('div', { class: 'row', style: { marginBottom: '10px' } }, toggle('Include și zonele extra (nu sunt la test)', false, (v) => { allZ = v; queue = shuffle(poolSt()).slice(0, 12); idx = 0; ok = 0; render(); }), h('span', { class: 'hint' }, 'Implicit: doar mediteraneană, oceanic, continental, subpolar (+ Germania).')), host, h('div', { style: { marginTop: '14px' } }, callout('info', h('b', null, 'Indicii: '), 'bare mari tot anul = oceanic/ecuatorial • vară uscată + iarnă ploioasă = mediteraneană • maxim vara + amplitudine mare = continental • aproape fără bare = tropical uscat / polar • sezon ploios scurt și intens = musonic.')));
    render(); return { el: root, destroy() {} };
  }

  // ============================================================ DESENEAZĂ
  function tabDraw() {
    const root = h('div'); let st = pick(stations.filter((s) => s.isRomania).concat(stations.slice(0, 6))); let mode = 'pp'; let user = { pp: Array(12).fill(null), t: Array(12).fill(null) }; let checked = false; const host = h('div');
    const build = () => {
      clear(host); const S = stats(st); const ax = axes([st]); const empty = { ...st, tempC: Array(12).fill(0), precipMm: Array(12).fill(0) };
      const chart = climographSVG(empty, { axes: ax, hideData: true, title: `Desenează climograful: ${st.name}`, subtitle: 'Alege „Precipitații” sau „Temperatură” și apasă / trage pe grafic' }); const g = chart.geom; const layer = svg('g'); chart.append(layer);
      const redraw = () => { clear(layer); for (let i = 0; i < 12; i++) { if (user.pp[i] != null) { const top = g.yP(Math.min(user.pp[i], ax.pTop)); layer.append(svg('rect', { x: g.xC(i) - g.colW * 0.31, y: top, width: g.colW * 0.62, height: Math.max(0, g.y0 - top), rx: 3, fill: '#3d8bff', opacity: 0.85 })); }
          if (checked) { const trueTop = g.yP(Math.min(st.precipMm[i], ax.pTop)); const ok = user.pp[i] != null && Math.abs(user.pp[i] - st.precipMm[i]) <= Math.max(ax.pTop * 0.06, st.precipMm[i] * 0.12); layer.append(svg('line', { x1: g.xC(i) - g.colW * 0.4, x2: g.xC(i) + g.colW * 0.4, y1: trueTop, y2: trueTop, stroke: ok ? '#4ade80' : '#ff6b81', 'stroke-width': 3 })); } }
        const pts = user.t.map((v, i) => (v == null ? null : [g.xC(i), g.yT(v)])); layer.append(svg('path', { d: pts.filter(Boolean).map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(''), fill: 'none', stroke: '#ff4d6a', 'stroke-width': 3 })); pts.forEach((p, i) => { if (p) layer.append(svg('circle', { cx: p[0], cy: p[1], r: 5, fill: '#fff', stroke: '#ff4d6a', 'stroke-width': 2.4 })); if (checked) { const ty = g.yT(st.tempC[i]); const ok = user.t[i] != null && Math.abs(user.t[i] - st.tempC[i]) <= 2; layer.append(svg('circle', { cx: g.xC(i), cy: ty, r: 7.5, fill: 'none', stroke: ok ? '#4ade80' : '#ffd37a', 'stroke-width': 2.4, 'stroke-dasharray': ok ? '' : '3 3' })); } }); };
      const setFromEvent = (e) => { if (checked) return; const r = chart.getBoundingClientRect(); const x = ((e.clientX - r.left) / r.width) * g.W, y = ((e.clientY - r.top) / r.height) * g.Hh; const i = Math.floor((x - g.pad.l) / g.colW); if (i < 0 || i > 11 || y < g.pad.t || y > g.pad.t + g.plotH) return; if (mode === 'pp') user.pp[i] = clamp(Math.round(((g.y0 - y) / g.ppm) / 5) * 5, 0, ax.pTop); else user.t[i] = clamp(Math.round(((g.pad.t + (ax.tMax) * g.ppc - y) / g.ppc) * 2) / 2, ax.tMin, ax.tMax); redraw(); };
      let down = false; chart.addEventListener('pointerdown', (e) => { down = true; chart.setPointerCapture(e.pointerId); setFromEvent(e); }); chart.addEventListener('pointermove', (e) => { if (down) setFromEvent(e); }); chart.addEventListener('pointerup', () => { down = false; }); chart.style.cursor = 'crosshair'; chart.style.touchAction = 'none';
      const tbl = h('div', { class: 'table-wrap' }, h('table', { class: 'table tbl-mini' }, h('thead', null, h('tr', null, h('th', null, ''), MONTHS.map((m) => h('th', null, m)))), h('tbody', null, h('tr', null, h('th', null, 't °C'), st.tempC.map((t) => h('td', null, t.toFixed(1)))), h('tr', null, h('th', null, 'pp mm'), st.precipMm.map((p) => h('td', null, Math.round(p)))))));
      const fb = h('div'); const modeTabs = tabs([{ id: 'pp', label: 'Desenez precipitațiile (bare)' }, { id: 't', label: 'Desenez temperatura (linie)' }], 'pp', (m) => { mode = m; });
      const check = () => { checked = true; redraw(); let okP = 0, okT = 0; for (let i = 0; i < 12; i++) { if (user.pp[i] != null && Math.abs(user.pp[i] - st.precipMm[i]) <= Math.max(ax.pTop * 0.06, st.precipMm[i] * 0.12)) okP++; if (user.t[i] != null && Math.abs(user.t[i] - st.tempC[i]) <= 2) okT++; } const pct = Math.round(((okP + okT) / 24) * 100); record(pct >= 70); store.addXP(Math.round(pct / 10), 'Climograf desenat'); if (pct >= 80) confetti(); clear(fb); fb.append(h('div', { class: 'callout good' }, ic('check'), h('div', null, h('b', null, `Precizie: ${pct} %. `), `Precipitații corecte: ${okP}/12 · temperaturi corecte: ${okT}/12. Linia verde = valoarea corectă a barei; cercul verde/galben = temperatura corectă.`)), h('div', { class: 'row', style: { marginTop: '10px' } }, h('button', { class: 'btn primary', onclick: () => { st = pick(stations); user = { pp: Array(12).fill(null), t: Array(12).fill(null) }; checked = false; build(); } }, 'Alt grafic ', ic('chevR')))); };
      host.append(h('div', { class: 'row', style: { marginBottom: '10px' } }, modeTabs, h('div', { class: 'sp' }), h('button', { class: 'btn small ghost', onclick: () => { user = { pp: Array(12).fill(null), t: Array(12).fill(null) }; checked = false; clear(fb); redraw(); } }, ic('rotate'), 'Șterge'), h('button', { class: 'btn primary', onclick: check }, ic('check'), 'Verifică')),
        h('div', { class: 'grid', style: { gridTemplateColumns: 'minmax(0,1.5fr) minmax(0,1fr)', alignItems: 'start' } }, h('div', { class: 'card', style: { padding: '14px' } }, chart), h('div', { class: 'stack' }, h('div', { class: 'card tight' }, h('div', { class: 'hint' }, 'Datele de desenat'), tbl), fb)));
    };
    root.append(host, h('div', { style: { marginTop: '12px' } }, callout('info', 'Apasă / trage pe coloana unei luni ca să fixezi înălțimea. Axa stângă = temperatura (°C), cea dreaptă = precipitațiile (mm); linia groasă de la 0 °C este baza barelor.'))); build(); return { el: root, destroy() {} };
  }

  // ============================================================ COMPARĂ
  function tabComp() {
    const root = h('div'); let a = stations.find((s) => s.id === 'bucuresti') || stations[0], b = stations.find((s) => s.id === 'londra') || stations[1];
    const host = h('div');
    const draw = () => { clear(host); const ax = axes([a, b]); const SA = stats(a), SB = stats(b);
      const mk = (st) => { const c = climographSVG(st, { axes: ax, interactive: true, showMean: true, title: `${st.name}${st.country ? ' – ' + st.country : ''}`, subtitle: zoneOf(st).name }); return h('div', { class: 'climo-wrap card', style: { padding: '12px' } }, c, c.geom.tip); };
      const row = (l, x, y, f = (v) => v) => h('tr', null, h('td', null, l), h('td', null, f(x)), h('td', null, f(y)), h('td', null, typeof x === 'number' ? (y - x > 0 ? '+' : '') + (Math.round((y - x) * 10) / 10) : ''));
      host.append(h('div', { class: 'grid c2' }, mk(a), mk(b)), h('div', { class: 'table-wrap', style: { marginTop: '14px' } }, h('table', { class: 'table' }, h('thead', null, h('tr', null, ['', a.name, b.name, 'Diferență (B − A)'].map((x) => h('th', null, x)))), h('tbody', null, row('Zonă de climă', zoneOf(a).name, zoneOf(b).name), row('t medie anuală (°C)', SA.mean, SB.mean), row('Amplitudine (°C)', SA.amp, SB.amp), row('Precipitații (mm)', SA.sumP, SB.sumP, (v) => fmt(v)), row('Luna cea mai caldă', MONTHS_LONG[SA.iMax], MONTHS_LONG[SB.iMax]), row('Luna cea mai rece', MONTHS_LONG[SA.iMin], MONTHS_LONG[SB.iMin])))), h('div', { style: { marginTop: '10px' } }, callout('info', 'Ambele grafice folosesc aceeași scară – așa se pot compara corect.')));
    };
    root.append(h('div', { class: 'row', style: { marginBottom: '12px', gap: '14px' } }, h('div', { class: 'field', style: { minWidth: '240px' } }, h('label', null, 'Stația A'), stationSelect(a.id, (s) => { a = s; draw(); })), h('div', { class: 'field', style: { minWidth: '240px' } }, h('label', null, 'Stația B'), stationSelect(b.id, (s) => { b = s; draw(); }))), host);
    [...root.querySelectorAll('select')].forEach((sel, i) => { sel.value = i === 0 ? a.id : b.id; }); draw(); return { el: root, destroy() {} };
  }

    const startTab = params && params.tab && TABS.some((t) => t.id === params.tab) ? params.tab : 'galerie';
  el.append(h('div', { style: { marginBottom: '16px' } }, tabs(TABS, startTab, show)), body); show(startTab);
  return { el, destroy() { cur && cur.destroy && cur.destroy(); token++; } };
}
