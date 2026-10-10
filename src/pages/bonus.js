import { h, svg, clear, clamp, fmt, shuffle, pick, norm, loadAsset } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { ic, srcTag, callout, toggle, tabs, toast, confetti, beep, ring, chip } from '../core/ui.js';
import * as store from '../core/store.js';
import { L, makeMap, homeControl, readoutControl, labelMarker, fmtLat, fmtLon, shieldOverlay } from '../map/lf.js';

const CATS = {
  ocean: { name: 'Oceane', one: 'ocean', color: '#8f9bff', icon: 'globe' },
  insula: { name: 'Insule', one: 'insulă', color: '#ff9f43', icon: 'anchor' },
  peninsula: { name: 'Peninsule', one: 'peninsulă', color: '#7bd05a', icon: 'flag' },
  mare: { name: 'Mări', one: 'mare', color: '#3d9bff', icon: 'wave' },
  golf: { name: 'Golfuri', one: 'golf', color: '#1fd1b5', icon: 'droplet' },
  stramtoare: { name: 'Strâmtori și canale', one: 'strâmtoare / canal', color: '#ff6b9d', icon: 'route' },
};
const DRAW_ORDER = ['ocean', 'mare', 'peninsula', 'golf', 'insula', 'stramtoare'];
const ALPHA = { ocean: 0.2, mare: 0.2, golf: 0.34, peninsula: 0.42, insula: 0.58, stramtoare: 0.6 };
const PREFIX = /^(Insula|Insulele|Arhipelagul|Peninsula|Marea|Golful|Strâmtoarea|Canalul|Oceanul|Fiordul)\s+/i;
const shortTxt = (v) => { const t = Array.isArray(v) ? v.join(', ') : v; if (!t) return t; const parts = t.split(/,\s*/); return parts.length > 4 ? parts.slice(0, 3).join(', ') + '…' : t; };

// ---------- geometrie: punct în poligon ----------
const inRing = (x, y, r) => { let c = false; for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const [xi, yi] = r[i], [xj, yj] = r[j]; if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } return c; };
const inPoly = (x, y, poly) => inRing(x, y, poly[0]) && !poly.slice(1).some((h2) => inRing(x, y, h2));
function prepGeom(g) {
  if (!g) return null; const polys = g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : null; if (!polys) return null;
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; polys.forEach((p) => p[0].forEach(([x, y]) => { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }));
  return { polys, bbox: [x0, y0, x1, y1], bboxArea: (x1 - x0) * (y1 - y0) };
}

// varianta simplificată: doar cele mai cunoscute (≈ 60 din 100 de esențiale)
const CORE = new Set('oceanul-arctic oceanul-atlantic marea-adriatica marea-alba marea-baltica marea-barents marea-caspica marea-egee marea-ionica marea-irlandei marea-mediterana marea-neagra marea-nordului marea-tireniana golful-biscaya golful-botnic golful-finlandei golful-genova golful-venetiei golful-salonic canalul-maniecii stramtoarea-gibraltar stramtoarea-bosfor stramtoarea-dardanele stramtoarea-messina stramtoarea-dover stramtoarea-oresund stramtoarea-kerci stramtoarea-otranto stramtoarea-bonifacio pen-balcanica pen-iberica pen-italica pen-scandinavica pen-iutlanda pen-crimeea pen-kola pen-peloponez pen-bretania britanice marea-britanie irlanda islanda sicilia sardinia corsica creta cipru malta baleare mallorca ciclade svalbard novaia-zemlea feroe zealand gotland azore madeira rodos corfu'.split(' '));
export default async function insule() {
  const root = h('div', { class: 'mapage' }); root.style.setProperty('--ar', '1.1');
  const left = h('aside', { class: 'mp-side left' }), right = h('aside', { class: 'mp-side right' }), center = h('div', { class: 'mp-center' });
  const head = h('div', { class: 'mp-head' }); const mapbox = h('div', { class: 'mp-map land-map' }); const dock = h('div', { class: 'mp-dock', style: { display: 'none' } });
  center.append(head, mapbox, dock); root.append(left, center, right);
  mapbox.append(h('div', { class: 'loader' }, h('div', { class: 'spinner' }), h('div', null, 'Se încarcă atlasul Europei…')));
  let destroyed = false, map = null; const cleanups = [];

  (async () => {
    let D, land, borders = null;
    try { [D, land] = await Promise.all([loadAsset('bonus'), loadAsset('land_europe')]); try { borders = await loadAsset('borders_europe'); } catch (e) { /* fără granițe */ } }
    catch (e) { clear(mapbox); mapbox.append(h('div', { class: 'loader', style: { color: 'var(--text)', background: 'var(--surface)' } }, h('div', null, 'Datele pentru această secțiune nu sunt încă gata.'), h('small', null, String(e.message)))); return; }
    if (destroyed) return; clear(mapbox);
    const items = D.items.filter((x) => CATS[x.cat]); const byId = Object.fromEntries(items.map((x) => [x.id, x]));
    items.forEach((it) => { it._g = prepGeom(it.geometry); it._area = it.areaKm2 || (it._g ? it._g.bboxArea * 8000 : 0); });
    const st = { cats: new Set(Object.keys(CATS)), only1: true, core: true, names: true, borders: true, sel: null, quiz: null, hover: null, view: 'map', search: '' };

    // ---------------- hartă
    const BOUNDS = L.latLngBounds([30, -32], [76, 62]);
    map = makeMap(mapbox, { minZoom: 2, maxZoom: 9, maxBounds: L.latLngBounds([14, -70], [88, 110]), zoomSnap: 0.25 });
    map.createPane('basePane').style.zIndex = 200; map.createPane('itemPane').style.zIndex = 320; map.createPane('linePane').style.zIndex = 380;
    const cssVar = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
    const landStyle = () => ({ fillColor: cssVar('--land'), fillOpacity: 1, color: cssVar('--land-edge'), weight: 0.7, opacity: 0.8 });
    const landLayer = L.geoJSON({ type: 'Feature', geometry: land }, { pane: 'basePane', renderer: L.canvas({ pane: 'basePane', padding: 0.4 }), interactive: false, style: landStyle }).addTo(map);
    let borderLayer = null;
    if (borders && (borders.lines || borders.border)) borderLayer = L.polyline((borders.lines || borders.border).map((pl) => pl.map(([lo, la]) => [la, lo])), { pane: 'linePane', color: cssVar('--land-edge'), weight: 0.7, opacity: 0.55, interactive: false, renderer: L.canvas({ pane: 'linePane', padding: 0.4 }) }).addTo(map);
    const mo = new MutationObserver(() => { landLayer.setStyle(landStyle()); borderLayer && borderLayer.setStyle({ color: cssVar('--land-edge') }); }); mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] }); cleanups.push(() => mo.disconnect());
    map.fitBounds(BOUNDS, { animate: false }); const home = map.getZoom(); map.setMinZoom(Math.max(2, home - 0.75));
    const readout = readoutControl(map); homeControl(map, () => map.fitBounds(BOUNDS, { duration: 0.8 }));
    const tip = h('div', { class: 'lf-tip', style: { display: 'none' } }); mapbox.appendChild(tip);
    const ro = new ResizeObserver(() => map.invalidateSize({ animate: false })); ro.observe(mapbox); cleanups.push(() => ro.disconnect());
    // stratul vectorial al elementelor
    const svgR = L.svg({ pane: 'itemPane', padding: 0.5 }); const layerOf = {}; const labelOf = {};
    const colorOf = (it) => CATS[it.cat].color;
    const mk = (it) => {
      let lyr;
      if (it.geometry && (it.geometry.type === 'Polygon' || it.geometry.type === 'MultiPolygon')) lyr = L.polygon(L.GeoJSON.coordsToLatLngs(it.geometry.coordinates, it.geometry.type === 'Polygon' ? 1 : 2), { renderer: svgR, pane: 'itemPane', interactive: false, smoothFactor: 0.7 });
      else if (it.geometry && it.geometry.type === 'LineString') lyr = L.polyline(it.geometry.coordinates.map(([lo, la]) => [la, lo]), { renderer: svgR, pane: 'itemPane', interactive: false, lineCap: 'round' });
      else if (it.line && it.line.length > 1) lyr = L.polyline(it.line.map(([lo, la]) => [la, lo]), { renderer: svgR, pane: 'itemPane', interactive: false, lineCap: 'round' });
      else lyr = L.circleMarker([it.lonLat[1], it.lonLat[0]], { renderer: svgR, pane: 'itemPane', interactive: false, radius: it.cat === 'stramtoare' ? 7 : clamp((it.radiusKm || 40) / 10, 6, 14) });
      layerOf[it.id] = lyr; lyr.__it = it; return lyr;
    };
    DRAW_ORDER.forEach((c) => items.filter((x) => x.cat === c).sort((a, b) => b._area - a._area).forEach((it) => mk(it).addTo(map)));
    items.forEach((it) => { const m = labelMarker(it.lonLat[1], it.lonLat[0], `<div class="lbl iname c-${it.cat}" style="--c:${colorOf(it)}">${it.name}</div>`, 'grp-item', { z: it.importance === 1 ? 50 : 0 }); m.addTo(map); labelOf[it.id] = m; m.__it = it; });
    const isVisible = (it) => st.cats.has(it.cat) && (!st.only1 || (st.core ? CORE.has(it.id) : it.importance === 1) || st.sel === it.id) && (!st.search || norm([it.name, it.nameLocal, it.nameEn, ...(it.alt || [])].join(' ')).includes(norm(st.search)));
    const styleOf = (it) => {
      const sel = st.sel === it.id, hov = st.hover === it.id; const c = colorOf(it); const vis = isVisible(it); const quiet = st.quiz && st.quiz.mode !== 'find' && st.quiz.target && st.quiz.target.id === it.id;
      const isPt = layerOf[it.id] instanceof L.CircleMarker; const big = it.cat === 'ocean'; const line = (it.geometry && it.geometry.type === 'LineString') || (!it.geometry && it.line && it.line.length > 1);
      if (!vis) return { opacity: 0, fillOpacity: 0, weight: 0 };
      if (line) return { color: sel || hov ? '#fff' : c, weight: sel ? 7 : hov ? 6 : 5, opacity: 1 };
      return { color: sel || hov || quiet ? '#ffffff' : c, weight: sel || quiet ? 3 : hov ? 2.4 : isPt ? 1.8 : 1.3, opacity: 0.95, fillColor: c, fillOpacity: sel || quiet ? Math.min(0.9, ALPHA[it.cat] + 0.28) : hov ? Math.min(0.85, ALPHA[it.cat] + 0.18) : isPt ? 0.7 : ALPHA[it.cat] };
    };
    const restyle = () => { items.forEach((it) => { layerOf[it.id].setStyle(styleOf(it)); }); relabel(); const s = st.sel && layerOf[st.sel]; if (s && s.bringToFront) s.bringToFront(); };
    // etichete fără suprapuneri (alocare lacomă după importanță și mărime)
    function relabel() {
      const z = map.getZoom(); const placed = []; const order = items.filter((it) => isVisible(it) && st.names && !(st.quiz && st.quiz.mode === 'find')).sort((a, b) => (a.importance - b.importance) || (b._area - a._area));
      const shown = new Set();
      order.forEach((it) => {
        const pt = map.latLngToContainerPoint([it.lonLat[1], it.lonLat[0]]); const size = map.getSize(); if (pt.x < -40 || pt.y < -20 || pt.x > size.x + 40 || pt.y > size.y + 20) return;
        if (it.importance > 1 && z < 4.5) return; if (it.importance > 2 && z < 5.75) return;
        const w = it.name.length * 6.6 + 12, hh = 17; const bx = [pt.x - w / 2, pt.y - hh / 2, pt.x + w / 2, pt.y + hh / 2];
        if (placed.some((p) => bx[0] < p[2] && bx[2] > p[0] && bx[1] < p[3] && bx[3] > p[1]) && st.sel !== it.id) return; placed.push(bx); shown.add(it.id);
      });
      items.forEach((it) => { const el = labelOf[it.id].getElement(); if (el) el.style.display = shown.has(it.id) || (st.sel === it.id && isVisible(it) && st.names) ? '' : 'none'; });
    }
    map.on('zoomend moveend', relabel);

    // ---------------- identificarea elementului sub cursor
    const hit = (latlng) => {
      const { lng: x, lat: y } = latlng; let best = null;
      items.forEach((it) => { if (!isVisible(it) || !it._g) return; const [a, b, c2, d] = it._g.bbox; if (x < a || x > c2 || y < b || y > d) return; if (it._g.polys.some((p) => inPoly(x, y, p))) { if (!best || it._area < best._area) best = it; } });
      const pt = map.latLngToContainerPoint(latlng); let near = null, nd = 1e9;
      items.forEach((it) => { if (!isVisible(it)) return; const p = map.latLngToContainerPoint([it.lonLat[1], it.lonLat[0]]); const dd = Math.hypot(p.x - pt.x, p.y - pt.y); const thr = it._g ? 10 : 15; if (dd < thr && dd < nd && (!best || it._area <= best._area || !it._g)) { near = it; nd = dd; } });
      return near || best;
    };
    map.on('mousemove', (e) => {
      readout.set(`<b>${fmtLat(e.latlng.lat)}, ${fmtLon(e.latlng.lng)}</b>`);
      if (st.quiz && st.quiz.mode === 'find') { tip.style.display = 'none'; mapbox.style.cursor = ''; return; }
      const it = hit(e.latlng); mapbox.style.cursor = it ? 'pointer' : ''; const id = it ? it.id : null;
      if (id !== st.hover) { const old = st.hover; st.hover = id; old && layerOf[old] && layerOf[old].setStyle(styleOf(byId[old])); id && layerOf[id].setStyle(styleOf(it)); }
      if (it) { tip.style.display = 'block'; tip.style.left = e.containerPoint.x + 14 + 'px'; tip.style.top = e.containerPoint.y + 14 + 'px'; tip.innerHTML = `<div>${it.name}</div><small>${CATS[it.cat].one}${it.country ? ' · ' + it.country : ''}</small>`; } else tip.style.display = 'none';
    });
    map.on('mouseout', () => { tip.style.display = 'none'; });
    map.on('click', (e) => { const it = hit(e.latlng); if (st.quiz && st.quiz.mode === 'find') return quizClick(it); if (it) pickItem(it, false); });
    map.on('movestart', () => { tip.style.display = 'none'; });

    // ---------------- selecție + fișă
    const info = h('div', { class: 'panel card tight info-card' }); const listBox = h('div', { class: 'panel card tight list-card' });
    function showInfo(it) {
      clear(info); if (!it) { info.append(h('h4', null, 'Fișa elementului'), h('p', { style: { margin: 0, color: 'var(--muted)' } }, 'Apasă pe o insulă, peninsulă, mare, golf sau strâmtoare de pe hartă (sau alege din listă). Culorile arată categoria.'), h('div', { class: 'chips', style: { marginTop: '10px' } }, Object.values(CATS).map((c) => h('span', { class: 'chip active', style: { '--chip': c.color, padding: '3px 9px', fontSize: '.78rem' } }, h('span', { class: 'dot' }), c.one)))); return; }
      const c = CATS[it.cat];
      info.append(h('div', { class: 'row', style: { gap: '10px', flexWrap: 'nowrap', alignItems: 'flex-start' } }, h('div', { style: { width: '12px', alignSelf: 'stretch', borderRadius: '8px', background: c.color, flex: 'none' } }), h('div', { class: 'sp' }, h('h3', { style: { margin: 0 } }, it.name), h('div', { class: 'hint' }, c.one + (it.nameLocal && it.nameLocal !== it.name ? ` · ${it.nameLocal}` : '')))), h('button', { class: 'btn icon small ghost', style: { position: 'absolute', right: '8px', top: '8px' }, onclick: () => pickItem(null) }, ic('x')),
        h('dl', { class: 'kv', style: { marginTop: '10px' } }, it.country ? [h('dt', null, it.cat === 'mare' ? 'Țări riverane' : 'Țară'), h('dd', null, Array.isArray(it.country) ? it.country.join(', ') : it.country)] : null, it.belongsTo ? [h('dt', null, it.cat === 'insula' ? 'Se află în' : 'Face parte din'), h('dd', null, Array.isArray(it.belongsTo) ? it.belongsTo.join(', ') : it.belongsTo)] : null, it.connects && it.connects.length ? [h('dt', null, 'Leagă'), h('dd', null, it.connects.join(' ↔ '))] : null, it.areaKm2 ? [h('dt', null, 'Suprafață'), h('dd', null, `${fmt(it.areaKm2)} km²`)] : null),
        it.facts && it.facts.length ? h('ul', { style: { margin: '10px 0 0', paddingLeft: '18px', fontSize: '.9rem', display: 'flex', flexDirection: 'column', gap: '4px' } }, it.facts.map((f) => h('li', null, f))) : null,
        h('div', { class: 'row', style: { marginTop: '12px', gap: '8px' } }, h('button', { class: 'btn small primary', onclick: () => flyToItem(it) }, ic('target'), 'Zoom aici'), h('button', { class: 'btn small', onclick: () => startQuiz('type', [it]) }, ic('help'), 'Testează-mă')),
        it.confidence && it.confidence !== 'high' ? h('div', { style: { marginTop: '10px' } }, h('span', { class: 'badge warn' }, `încredere în date: ${it.confidence}`)) : null);
    }
    function flyToItem(it) { const lyr = layerOf[it.id]; if (lyr && lyr.getBounds && it._g) map.flyToBounds(lyr.getBounds().pad(0.4), { duration: 0.8, maxZoom: 7 }); else map.flyTo([it.lonLat[1], it.lonLat[0]], Math.max(map.getZoom(), 6), { duration: 0.8 }); }
    function pickItem(it, fly = false) {
      const old = st.sel; st.sel = it ? it.id : null; showInfo(it); restyle(); listBox.querySelectorAll('.chip').forEach((b) => b.classList.toggle('active', it && b.dataset.id === it.id));
      if (it) { if (fly) flyToItem(it); if (store.discover('insule', it.id, 2)) updateProg(); } }
    function drawList() {
      clear(listBox); listBox.append(h('h4', null, 'Lista (după categorie)'));
      Object.entries(CATS).forEach(([k, c]) => { if (!st.cats.has(k)) return; const arr = items.filter((x) => x.cat === k && isVisible(x)).sort((a, b) => a.name.localeCompare(b.name, 'ro')); if (!arr.length) return; listBox.append(h('div', { class: 'hint', style: { margin: '10px 0 4px', fontWeight: 800, color: c.color } }, `${c.name} (${arr.length})`), h('div', { class: 'chips' }, arr.map((x) => { const b = h('button', { class: `chip ${st.sel === x.id ? 'active' : ''}`, style: { '--chip': c.color }, onclick: () => pickItem(x, true) }, x.name); b.dataset.id = x.id; return b; }))); });
    }

    // ---------------- panou stânga: filtre + căutare
    const search = h('input', { type: 'search', placeholder: 'Caută un nume (ex.: Creta)…', 'aria-label': 'Caută', oninput: (e) => { st.search = e.target.value; restyle(); drawList(); }, onkeydown: (e) => { if (e.key === 'Enter') { const f = items.find((x) => isVisible(x)); if (f) pickItem(f, true); } } });
    const catChips = h('div', { class: 'chips' }, Object.entries(CATS).map(([k, c]) => { const b = h('button', { class: 'chip active', style: { '--chip': c.color }, onclick: () => { const a = st.cats; if (a.size === Object.keys(CATS).length) { a.clear(); a.add(k); } else if (a.has(k) && a.size === 1) Object.keys(CATS).forEach((x) => a.add(x)); else a.has(k) ? a.delete(k) : a.add(k); [...catChips.children].forEach((x) => x.classList.toggle('active', a.has(x.dataset.k))); restyle(); drawList(); } }, h('span', { class: 'dot' }), `${c.name} (${items.filter((x) => x.cat === k).length})`); b.dataset.k = k; return b; }));
    const progBox = h('div', { class: 'panel card tight' }); const updateProg = () => { const have = items.filter((x) => store.get().discovered['insule:' + x.id]).length; clear(progBox); progBox.append(h('div', { class: 'row', style: { gap: '10px', flexWrap: 'nowrap' } }, h('span', { html: icon('compass'), style: { width: '20px', color: 'var(--accent)', flex: 'none' } }), h('div', { class: 'sp' }, h('div', { style: { fontWeight: 700, fontSize: '.86rem' } }, `Descoperit: ${have} / ${items.length}`), h('div', { class: 'bar', style: { marginTop: '5px' } }, h('i', { style: { '--w': (have / items.length) * 100 + '%' } }))))); }; updateProg();
    const controls = h('div', { class: 'panel card tight' }, h('h4', null, 'Ce afișez'), h('div', { class: 'field', style: { marginBottom: '10px' } }, h('label', null, 'Caută'), search), catChips,
      h('div', { class: 'stack', style: { gap: '9px', marginTop: '12px' } }, toggle('Doar cele esențiale ★', true, (v) => { st.only1 = v; restyle(); drawList(); }), toggle('Varianta simplificată (doar cele mai cunoscute)', true, (v) => { st.core = v; restyle(); drawList(); relabel(); }), toggle('Numele pe hartă', true, (v) => { st.names = v; relabel(); })),
      h('div', { class: 'row', style: { marginTop: '12px' } }, h('button', { class: 'btn small', onclick: () => map.fitBounds(BOUNDS, { duration: 0.8 }) }, ic('expand'), 'Toată Europa')));
    const qBox = h('div', { class: 'panel card tight' });
    left.append(controls, qBox, progBox);

    // ---------------- teste
    const modes = [['find', 'Găsește pe hartă', 'target'], ['cat', 'Ce este? (insulă / mare / golf …)', 'help'], ['where', 'Unde se află? / Face parte din?', 'pin'], ['connect', 'Ce leagă strâmtoarea?', 'route'], ['type', 'Hartă oarbă – scrie numele', 'edit']];
    const menu = () => { clear(qBox); qBox.append(h('h4', null, 'Exersează'), h('div', { class: 'stack' }, modes.map(([id, l, ico]) => h('button', { class: 'btn small', style: { justifyContent: 'flex-start' }, onclick: () => startQuiz(id) }, ic(ico === 'edit' ? 'help' : ico), l))), h('div', { class: 'hint', style: { marginTop: '8px' } }, 'Se folosesc doar elementele esențiale ★.')); };
    const qPanel = h('div'); dock.append(qPanel); const showDock = (on) => { dock.style.display = on ? 'block' : 'none'; setTimeout(() => map.invalidateSize(), 30); };
    const poolFor = (mode) => { const base = items.filter((x) => (st.core ? CORE.has(x.id) : x.importance === 1)); if (mode === 'where') return base.filter((x) => ['insula', 'peninsula', 'mare', 'golf'].includes(x.cat) && (x.country || x.belongsTo)); if (mode === 'connect') return items.filter((x) => x.cat === 'stramtoare' && x.connects && x.connects.length >= 2); return base; };
    function startQuiz(mode, only = null) {
      const pool = only ? only : shuffle(poolFor(mode)).slice(0, mode === 'find' || mode === 'type' ? 12 : 12); if (!pool.length) { toast({ icon: 'alert', title: 'Nu sunt destule elemente pentru acest test' }); return; }
      st.quiz = { mode, queue: pool, i: 0, ok: 0, bad: 0, locked: false, target: null }; st.sel = null; st.hover = null; showInfo(null); restyle(); showDock(true); nextQ();
    }
    function endQuiz(done = true) { const q = st.quiz; st.quiz = null; restyle(); if (q && done && q.queue.length > 1) { clear(qPanel); const pct = Math.round((q.ok / Math.max(1, q.ok + q.bad)) * 100); qPanel.append(h('div', { class: 'row' }, h('h3', { style: { margin: 0 } }, `Rezultat: ${q.ok}/${q.ok + q.bad} (${pct}%)`), h('div', { class: 'sp' }), h('button', { class: 'btn small primary', onclick: () => startQuiz(q.mode) }, ic('rotate'), 'Din nou'), h('button', { class: 'btn small', onclick: () => showDock(false) }, 'Închide'))); if (pct >= 80) confetti(); store.addXP(q.ok * 2, 'Test insule / mări'); store.checkBadges(); } else showDock(false); }
    function nextQ() {
      const q = st.quiz; if (!q) return; if (q.i >= q.queue.length) return endQuiz(); q.locked = false; const it = q.queue[q.i]; q.target = it; clear(qPanel); restyle();
      const head2 = h('div', { class: 'row', style: { marginBottom: '8px', flexWrap: 'nowrap' } }, h('span', { class: 'badge mint' }, `${q.i + 1}/${q.queue.length}`), h('span', { class: 'badge ok' }, `✓ ${q.ok}`), h('span', { class: 'badge bad' }, `✗ ${q.bad}`), h('div', { class: 'sp' }), h('button', { class: 'btn small ghost', onclick: () => endQuiz(false) }, ic('x'), 'Oprește'));
      const adv = (ok) => { q.locked = true; store.recordAnswer('insule-mari', ok); ok ? (q.ok++, beep('ok'), store.addXP(2)) : (q.bad++, beep('bad')); setTimeout(() => { if (st.quiz === q) { q.i++; nextQ(); } }, ok ? 650 : 1700); };
      const mc = (right, wrong) => { const o = shuffle([right, ...shuffle([...new Set(wrong)].filter((x) => x && x !== right)).slice(0, 3)]); return h('div', { class: 'grid c2', style: { gap: '8px' } }, o.map((x) => h('button', { class: 'btn opt', style: { justifyContent: 'flex-start', textAlign: 'left', whiteSpace: 'normal' }, onclick: (e) => { if (q.locked) return; const ok = x === right; e.currentTarget.classList.add(ok ? 'good' : 'bad'); if (!ok) [...qPanel.querySelectorAll('button.opt')].find((b) => b.textContent === right)?.classList.add('good'); adv(ok); } }, x))); };
      const textOf = (v) => (Array.isArray(v) ? v.join(', ') : v);
      if (q.mode === 'find') { q.adv = adv; qPanel.append(head2, h('h3', { style: { margin: 0 } }, 'Apasă pe: ', h('span', { class: 'gradient-text' }, it.name), ` (${CATS[it.cat].one})`), h('div', { class: 'hint' }, 'Etichetele sunt ascunse. Se acceptă și o apăsare foarte apropiată.'), h('button', { class: 'btn small ghost', style: { marginTop: '8px' }, onclick: () => { map.flyTo([it.lonLat[1], it.lonLat[0]], Math.min(5, map.getZoom() + 0.5), { duration: 0.7 }); toast({ icon: 'bulb', title: 'Indiciu', text: it.country ? `Zona: ${textOf(it.country)}` : it.belongsTo ? `Zona: ${textOf(it.belongsTo)}` : '' }); } }, ic('bulb'), 'Indiciu')); }
      else if (q.mode === 'cat') qPanel.append(head2, h('h3', { style: { margin: '0 0 8px' } }, ['„', h('span', { class: 'gradient-text' }, it.name), '” este o…']), mc(CATS[it.cat].one, Object.values(CATS).map((c) => c.one)));
      else if (q.mode === 'where') {
        let right, wrongPool, prompt; const sameCat = items.filter((x) => (st.core ? CORE.has(x.id) : x.importance === 1) && x.cat === it.cat);
        if (it.cat === 'insula' && it.country && it.belongsTo && Math.random() < 0.5) { right = shortTxt(it.belongsTo); wrongPool = sameCat.map((x) => shortTxt(x.belongsTo)); prompt = ['În ce mare / ocean se află ', h('span', { class: 'gradient-text' }, it.name), '?']; }
        else if (it.cat === 'insula' || it.cat === 'peninsula') { right = shortTxt(it.country); wrongPool = sameCat.map((x) => shortTxt(x.country)); prompt = [it.cat === 'insula' ? 'Cărei țări aparține ' : 'În ce țară / țări se află ', h('span', { class: 'gradient-text' }, it.name), '?']; }
        else { right = shortTxt(it.belongsTo); wrongPool = sameCat.map((x) => shortTxt(x.belongsTo)); prompt = [it.cat === 'golf' ? 'Golful ' : 'Marea ', h('span', { class: 'gradient-text' }, it.name.replace(PREFIX, '')), it.cat === 'golf' ? ' aparține mării / oceanului:' : ' face parte din:']; }
        qPanel.append(head2, h('h3', { style: { margin: '0 0 8px' } }, ...prompt), mc(right, wrongPool));
      }
      else if (q.mode === 'connect') { const right = it.connects.join(' ↔ '); qPanel.append(head2, h('h3', { style: { margin: '0 0 8px' } }, ['Ce leagă ', h('span', { class: 'gradient-text' }, it.name), '?']), mc(right, items.filter((x) => x.connects && x.connects.length >= 2).map((x) => x.connects.join(' ↔ ')))); flyToItem(it); }
      else { const lyr = layerOf[it.id]; st.sel = it.id; restyle(); flyToItem(it); const inp = h('input', { type: 'text', placeholder: 'Scrie numele…', autocomplete: 'off', style: { fontSize: '1.05rem', maxWidth: '360px' } }); const fb = h('div', { style: { marginTop: '8px' } }); const submit = () => { if (q.locked) return; const ans = norm(inp.value); const cands = [it.name, it.nameLocal, it.nameEn, ...(it.alt || []), it.name.replace(PREFIX, '')].filter(Boolean).map(norm); const ok = !!ans && cands.includes(ans); clear(fb); fb.append(h('span', { class: `badge ${ok ? 'ok' : 'bad'}` }, ok ? 'Corect!' : `Corect: ${it.name}`)); adv(ok); }; inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); }); qPanel.append(head2, h('h3', { style: { margin: '0 0 8px' } }, `Cum se numește ${CATS[it.cat].one === 'mare' ? 'marea' : 'elementul'} evidențiat(ă) pe hartă?`), inp, h('div', { class: 'row', style: { marginTop: '8px' } }, h('button', { class: 'btn primary small', onclick: submit }, 'Verifică'), h('button', { class: 'btn ghost small', onclick: () => { clear(fb); fb.append(h('span', { class: 'badge warn' }, `${it.name[0]}… (${it.name.length} litere)`)); } }, ic('bulb'), 'Indiciu'), h('button', { class: 'btn ghost small', onclick: () => { if (q.locked) return; q.locked = true; q.bad++; store.recordAnswer('insule-mari', false); q.i++; nextQ(); } }, 'Sari peste')), fb); setTimeout(() => inp.focus(), 40); }
    }
    function quizClick(it) { const q = st.quiz; if (!q || q.locked || q.mode !== 'find') return; const right = q.target; const ok = !!it && it.id === right.id; const lyr = layerOf[right.id]; lyr.setStyle({ color: '#4ade80', weight: 4, opacity: 1, fillOpacity: 0.9, fillColor: '#4ade80' }); if (!ok) toast({ icon: 'alert', title: it ? `Ai apăsat: ${it.name}` : 'Ai apăsat în afara elementelor', text: `Corect: ${right.name}` }); flyToItem(right); q.adv(ok); }
    menu(); showInfo(null);
    right.append(info, listBox);

    // ---------------- vedere: hartă / liste de învățat
    const overlay = shieldOverlay(h('div', { class: 'mp-overlay', style: { display: 'none' } })); mapbox.append(overlay);
    head.append(tabs([{ id: 'map', label: 'Hartă' }, { id: 'lists', label: 'Liste de învățat' }], 'map', (v) => setView(v)), h('div', { class: 'sp' }), h('span', { class: 'hint' }, 'Trage = deplasează · rotița = zoom · dublu-click = apropie'));
    function setView(v) { st.view = v; overlay.style.display = v === 'map' ? 'none' : 'block'; if (v !== 'map') { clear(overlay); overlay.append(listsView()); } else setTimeout(() => map.invalidateSize(), 20); }
    function listsView() {
      const wrap = h('div', { style: { maxWidth: '1180px', margin: '0 auto' } }); let cover = false; let only1 = true; const body = h('div');
      wrap.append(h('div', { class: 'row', style: { marginBottom: '8px' } }, h('h2', { style: { margin: 0 } }, 'Listele pentru test'), h('div', { class: 'sp' }), toggle('Doar cele esențiale ★', true, (v) => { only1 = v; draw(); }), toggle('Varianta simplificată', st.core, (v) => { st.core = v; draw(); }), toggle('Acoperă răspunsurile (autotest)', false, (v) => { cover = v; draw(); })), h('p', { class: 'hint' }, 'Aici ai tot ce trebuie să știi pe categorii. Cu „Acoperă răspunsurile”, apasă pe o celulă ca s-o descoperi.'), body);
      const draw = () => { clear(body); Object.entries(CATS).forEach(([k, c]) => { const arr = items.filter((x) => x.cat === k && (!only1 || (st.core ? CORE.has(x.id) : x.importance === 1))).sort((a, b) => a.name.localeCompare(b.name, 'ro')); if (!arr.length) return; const mkc = (v) => { const td = h('td', { style: { fontSize: '.88rem' } }, v == null || v === '' ? '—' : Array.isArray(v) ? v.join(', ') : v); if (cover) { td.style.filter = 'blur(7px)'; td.style.cursor = 'pointer'; td.addEventListener('click', () => { td.style.filter = 'none'; }); } return td; };
        body.append(h('h3', { style: { margin: '20px 0 8px', color: c.color } }, `${c.name} (${arr.length})`), h('div', { class: 'table-wrap' }, h('table', { class: 'table' }, h('thead', null, h('tr', null, [h('th', null, 'Nume'), k === 'stramtoare' ? h('th', null, 'Leagă') : h('th', null, k === 'insula' ? 'Se află în / țara' : k === 'mare' ? 'Țări riverane / ocean' : 'Țara / marea'), h('th', null, 'De reținut')])), h('tbody', null, arr.map((x) => h('tr', { style: { cursor: 'pointer' }, onclick: () => { head.querySelectorAll('.tab')[0].click(); pickItem(x, true); } }, h('td', null, h('b', null, x.name)), k === 'stramtoare' ? mkc(x.connects && x.connects.join(' ↔ ')) : mkc([shortTxt(x.belongsTo), shortTxt(x.country)].filter(Boolean).join(' · ')), mkc((x.facts || []).slice(0, 2).join(' • ')))))))); }); };
      const textOf2 = (v) => (Array.isArray(v) ? v.join(', ') : v);
      draw(); return wrap;
    }
    drawList(); restyle(); relabel();
    const startId = new URLSearchParams(location.hash.split('?')[1] || '').get('e'); if (startId && byId[startId]) setTimeout(() => pickItem(byId[startId], true), 500);
  })();

  const mkToggle = (side, el) => { const b = h('button', { class: 'mp-toggle', title: 'Ascunde / arată panoul', onclick: () => { root.classList.toggle('hide-' + side); setTimeout(() => map && map.invalidateSize(), 260); } }, ic(side === 'left' ? 'chevL' : 'chevR')); el.prepend(b); };
  mkToggle('left', left); mkToggle('right', right);
  return { el: root, destroy() { destroyed = true; cleanups.forEach((f) => f()); try { map && map.remove(); } catch (e) { /* ignorăm */ } } };
}
