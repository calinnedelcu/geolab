import { h, svg, clear, loadAsset, shuffle, clamp, fmt } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { ic, srcTag, callout, chip, toggle, toast, confetti, beep, tabs } from '../core/ui.js';
import * as store from '../core/store.js';
import { ReliefMap } from '../map/relief_map.js';

// culoare ușor variată în jurul unei nuanțe (pentru unități din aceeași grupă)
export function shade(hex, i, n = 8) {
  const c = hex.replace('#', ''); const r = parseInt(c.slice(0, 2), 16), g = parseInt(c.slice(2, 4), 16), b = parseInt(c.slice(4, 6), 16);
  const t = ((i % n) / (n - 1) - 0.5) * 0.42;
  const f = (v) => Math.round(clamp(t > 0 ? v + (255 - v) * t : v * (1 + t), 0, 255));
  return '#' + [f(r), f(g), f(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
}

/**
 * Pagină de hartă 2D de relief.
 * cfg: { key, assetName, unitsAsset, bordersAsset, title, units, groups, groupOf, peaks, filterTitle, listTitle, emptyText, missingNote,
 *        timeMachine(rm, api), tools:['profile'], profilePresets, renderDetails(unit,{rm,select}), labelNum(unit), initialSelect }
 */
export async function buildReliefPage(cfg) {
  const root = h('div', { class: 'mapage' }); root.style.setProperty('--ar', '1.22');
  const left = h('aside', { class: 'mp-side left' }), right = h('aside', { class: 'mp-side right' });
  const center = h('div', { class: 'mp-center' }); const mapbox = h('div', { class: 'mp-map' }); const dock = h('div', { class: 'mp-dock', style: { display: 'none' } });
  center.append(mapbox, dock); root.append(left, center, right);
  mapbox.append(h('div', { class: 'loader' }, h('div', { class: 'spinner' }), h('div', null, 'Se încarcă harta de relief reală…'), h('small', null, 'Prima încărcare poate dura câteva secunde.')));
  const state = { selected: 0, labelMode: 'num', quiz: null, tool: null, profile: null, destroyed: false };
  let rm = null; const cleanups = [];

  (async () => {
    let asset, ugeo, borders = null;
    try { [asset, ugeo, borders] = await Promise.all([loadAsset(cfg.assetName), loadAsset(cfg.unitsAsset), cfg.bordersAsset ? loadAsset(cfg.bordersAsset) : null]); }
    catch (e) { clear(mapbox); mapbox.append(h('div', { class: 'loader' }, h('div', null, 'Nu am putut încărca datele hărții.'), h('small', null, String(e.message)))); return; }
    if (state.destroyed) return;
    const unitById = Object.fromEntries(cfg.units.map((u) => [u.id, u]));
    const groupOf = (u) => cfg.groupOf(u);
    const colorOf = (u) => u.color || (u.color = shade(groupOf(u).color, u.id));
    const metaUnit = (id) => asset.meta.units.find((m) => m.id === id);
    clear(mapbox);
    rm = new ReliefMap(mapbox, asset, ugeo, { kind: cfg.key });
    try { await rm.ready; } catch (e) { console.error(e); return; }
    if (state.destroyed) { rm.dispose(); return; }
    rm.setUnits(cfg.units.map((u) => ({ id: u.id, color: colorOf(u) })));

    // ------------- granițe (fără nume de țări)
    if (borders) {
      const lines = borders.lines || borders.border;
      if (lines) rm.addLineLayer('borders', lines, { color: '#ffffff', width: cfg.key === 'europe' ? 1 : 2, opacity: cfg.key === 'europe' ? 0.55 : 0.95 });
      if (borders.neighbors) rm.addLineLayer('neighbors', borders.neighbors, { color: '#ffffff', width: 1, opacity: 0.3 });
    }
    // ------------- vârfuri
    (cfg.peaks || []).forEach((p) => rm.addLabel({ lon: p.lon, lat: p.lat, html: `<span>${p.name}</span><i>${p.alt < 0 ? '−' : ''}${fmt(Math.abs(p.alt))} m</i>`, cls: 'peak', group: 'peak', title: p.note, minZoom: rm._homeZoom + (cfg.key === 'europe' ? 0.5 : 0.6) }));

    // ------------- etichete unități
    const unitLabels = {};
    const labelText = (u) => (state.labelMode === 'num' ? String(cfg.labelNum ? cfg.labelNum(u) : u.id) : (u.short || u.name));
    const mkLabels = () => {
      rm.clearLabels('unit'); Object.keys(unitLabels).forEach((k) => delete unitLabels[k]);
      if (state.labelMode === 'off') return;
      cfg.units.forEach((u) => { const mu = metaUnit(u.id); if (!mu || !mu.anchor) return; unitLabels[u.id] = rm.addLabel({ lon: mu.anchor.lon, lat: mu.anchor.lat, text: labelText(u), cls: state.labelMode === 'num' ? 'num' : 'uname', color: colorOf(u), group: 'unit', z: 100, onClick: () => { if (!state.quiz && !state.tool) select(u.id); } }); });
      markSel();
    };
    const markSel = () => { Object.entries(unitLabels).forEach(([id, l]) => { const el = l.el(); el && el.classList.toggle('sel', +id === state.selected); }); };

    // ------------- panoul din stânga: straturi
    const labelModes = tabs([{ id: 'num', label: 'Numere' }, { id: 'name', label: 'Nume' }, { id: 'off', label: 'Ascunse' }], 'num', (m) => { state.labelMode = m; mkLabels(); });
    const baseModes = tabs([{ id: 'color', label: 'Relief' }, { id: 'gray', label: 'Gri' }, { id: 'plain', label: 'Simplu' }], 'color', (m) => rm.setBase(m));
    const layerPanel = h('div', { class: 'panel card tight' }, h('h4', null, 'Straturi și vedere'),
      h('div', { class: 'field', style: { marginBottom: '10px' } }, h('label', null, 'Etichete unități'), labelModes),
      h('div', { class: 'field', style: { marginBottom: '12px' } }, h('label', null, 'Fundal hartă'), baseModes),
      h('div', { class: 'stack', style: { gap: '9px' } },
        toggle('Colorează unitățile', true, (v) => rm.setTint(v ? 0.44 : 0)),
        toggle('Margini între unități', true, (v) => rm.setEdges(v)),
        borders ? toggle(cfg.key === 'europe' ? 'Granițele țărilor' : 'Granița României', true, (v) => { rm.setLayerVisible('borders', v); rm.setLayerVisible('neighbors', v); }) : null,
        cfg.peaks ? toggle('Vârfuri-cheie', true, (v) => rm.setLabelsVisible('peak', v)) : null),
      h('div', { class: 'row', style: { marginTop: '12px', gap: '8px' } }, h('button', { class: 'btn small', onclick: () => rm.resetView() }, ic('expand'), 'Vedere de ansamblu')));
    left.append(layerPanel);

    // ------------- filtru (perioade / trepte)
    const filterPanel = h('div', { class: 'panel card tight' }, h('h4', null, cfg.filterTitle)); const chipsWrap = h('div', { class: 'chips' }); filterPanel.append(chipsWrap);
    const activeGroups = new Set(cfg.groups.map((g) => g.id));
    const applyFilter = () => { const ids = cfg.units.filter((u) => activeGroups.has(groupOf(u).id)).map((u) => u.id); rm.setFilter(ids.length === cfg.units.length ? null : ids); };
    const drawChips = () => {
      clear(chipsWrap);
      cfg.groups.forEach((g) => chipsWrap.append(chip(g.name, { color: g.color, dot: true, active: activeGroups.has(g.id), onClick: () => {
        if (activeGroups.size === cfg.groups.length) { activeGroups.clear(); activeGroups.add(g.id); }
        else if (activeGroups.has(g.id) && activeGroups.size === 1) { cfg.groups.forEach((x) => activeGroups.add(x.id)); }
        else if (activeGroups.has(g.id)) activeGroups.delete(g.id); else activeGroups.add(g.id);
        drawChips(); applyFilter();
      } })));
      chipsWrap.append(h('button', { class: 'chip', onclick: () => { cfg.groups.forEach((g) => activeGroups.add(g.id)); drawChips(); applyFilter(); } }, 'Toate'));
    };
    drawChips(); left.append(filterPanel);
    let tmPanel = null; if (cfg.timeMachine) { tmPanel = cfg.timeMachine(rm, { activeGroups, drawChips, unitById, select }); left.append(tmPanel); }

    // ------------- progres
    const progBox = h('div', { class: 'panel card tight' });
    const kind = cfg.key === 'europe' ? 'eu' : 'ro';
    const updateProgress = () => { const total = cfg.units.length; const have = cfg.units.filter((u) => store.get().discovered[`${kind}:${u.id}`]).length; clear(progBox); progBox.append(h('div', { class: 'row', style: { gap: '10px', flexWrap: 'nowrap' } }, h('span', { html: icon('compass'), style: { width: '20px', color: 'var(--accent)', flex: 'none' } }), h('div', { class: 'sp' }, h('div', { style: { fontWeight: 700, fontSize: '.86rem' } }, `Descoperit: ${have} / ${total}`), h('div', { class: 'bar', style: { marginTop: '5px' } }, h('i', { style: { '--w': (have / total) * 100 + '%' } }))))); };
    updateProgress();

    // ------------- panoul din dreapta: fișa + lista
    const infoBox = h('div', { class: 'panel card tight info-card' });
    const listBox = h('div', { class: 'panel card tight list-card' }, h('h4', null, cfg.listTitle));
    right.append(infoBox, listBox); const listItems = new Map();
    cfg.groups.forEach((g) => {
      const members = cfg.units.filter((u) => groupOf(u).id === g.id); if (!members.length) return;
      listBox.append(h('div', { class: 'hint', style: { margin: '10px 0 4px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 750, color: g.color } }, h('span', { class: 'legend-dot', style: { color: g.color, background: g.color } }), g.name));
      members.forEach((u) => { const it = h('button', { class: 'chip', style: { display: 'flex', width: '100%', borderRadius: '10px', marginBottom: '4px', justifyContent: 'flex-start', '--chip': colorOf(u) }, onclick: () => select(u.id, true) }, h('b', { style: { minWidth: '22px', color: colorOf(u) } }, String(cfg.labelNum ? cfg.labelNum(u) : u.id)), h('span', null, u.name)); listItems.set(u.id, it); listBox.append(it); });
    });
    if (cfg.missingNote) listBox.append(h('div', { class: 'hint', style: { marginTop: '10px' } }, cfg.missingNote));
    left.append(progBox);

    function renderInfo(u) {
      clear(infoBox);
      if (!u) { infoBox.append(h('h4', null, 'Fișa unității'), h('p', { style: { margin: '0 0 10px', color: 'var(--muted)' } }, cfg.emptyText), h('div', { class: 'chips' }, h('span', { class: 'badge mint' }, ic('eye'), 'Click = fișă'), h('span', { class: 'badge' }, 'Dublu-click = zoom'), h('span', { class: 'badge warn' }, 'Trage = deplasează'))); return; }
      const g = groupOf(u);
      infoBox.append(
        h('div', { class: 'row', style: { alignItems: 'flex-start', gap: '12px', flexWrap: 'nowrap' } },
          h('div', { style: { minWidth: '40px', height: '40px', borderRadius: '12px', display: 'grid', placeItems: 'center', fontWeight: 850, color: '#07101f', background: colorOf(u), boxShadow: `0 6px 20px -6px ${colorOf(u)}` } }, String(cfg.labelNum ? cfg.labelNum(u) : u.id)),
          h('div', { class: 'sp' }, h('h3', { style: { margin: 0 } }, u.name), h('div', { class: 'chips', style: { marginTop: '6px' } }, h('span', { class: 'chip active', style: { '--chip': g.color, padding: '3px 9px', fontSize: '.78rem' } }, g.name), u.kind ? h('span', { class: 'chip', style: { padding: '3px 9px', fontSize: '.78rem' } }, u.kind) : null))),
        h('button', { class: 'btn icon small ghost', style: { position: 'absolute', right: '8px', top: '8px' }, title: 'Închide', onclick: () => select(0) }, ic('x')));
      if (u.alt) infoBox.append(h('div', { class: 'card tight', style: { marginTop: '12px', background: 'color-mix(in srgb, var(--accent) 8%, var(--surface))' } }, h('div', { class: 'hint' }, 'Altitudine (din caiet)'), h('div', { class: 'row', style: { alignItems: 'baseline', gap: '8px' } }, h('span', { class: 'num-big', style: { fontSize: '1.9rem', color: 'var(--accent)' } }, (u.alt.v < 0 ? '−' : '') + fmt(Math.abs(u.alt.v)) + ' m'), h('span', { style: { color: 'var(--muted)', fontWeight: 600 } }, u.alt.where))));
      const extra = cfg.renderDetails ? cfg.renderDetails(u, { rm, select }) : [];
      infoBox.append(h('ul', { style: { margin: '12px 0 0', paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '7px', fontSize: '.92rem' } }, (u.facts || []).map(([t, s]) => h('li', null, t, ' ', srcTag(s)))));
      extra.forEach((n) => n && infoBox.append(n));
      if (u.verify) infoBox.append(h('div', { style: { marginTop: '12px' } }, callout('warn', h('b', null, 'De verificat: '), u.verify)));
      infoBox.append(h('div', { class: 'row', style: { marginTop: '14px', gap: '8px' } }, h('button', { class: 'btn small primary', onclick: () => rm.flyToUnit(u.id) }, ic('target'), 'Zoom aici'), h('button', { class: 'btn small', onclick: () => startQuiz('find', [u.id]) }, ic('help'), 'Testează-mă')));
    }
    function select(id, fly = false) {
      state.selected = id; rm.setSelected(id); renderInfo(id ? unitById[id] : null); markSel();
      listItems.forEach((el, k) => el.classList.toggle('active', k === id));
      if (id) { if (store.discover(kind, id, 8)) updateProgress(); if (fly) rm.flyToUnit(id); const it = listItems.get(id); it && it.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
    }

    // ------------- tooltip la hover
    rm.on('hover', (e) => {
      if (!e || state.quiz || state.tool) { rm.hideTip(); return; }
      const u = e.id ? unitById[e.id] : null; if (!u) { rm.hideTip(); return; }
      rm.showTip(e.sx + 14, e.sy + 14, `<div>${u.name}</div><small>${u.alt ? `max. ${u.alt.v < 0 ? '−' : ''}${fmt(Math.abs(u.alt.v))} m · ` : ''}${e.h > 0 ? `aici ≈ ${fmt(Math.round(e.h))} m` : ''}</small>`);
    });
    rm.on('select', (e) => { if (state.quiz && state.quiz.mode === 'find') return quizClick(e.id); if (state.tool) return; select(e.id); });
    rm.on('click', (e) => { if (state.quiz && state.quiz.mode === 'find' && !e.id) return quizClick(0); if (state.tool === 'profile') profileClick(e); });

    // ------------- dock (test / profil)
    const quizPanel = h('div'); const toolPanel = h('div', { style: { display: 'none' } });
    dock.append(quizPanel, toolPanel);
    const showDock = (on) => { dock.style.display = on ? 'block' : 'none'; setTimeout(() => rm.invalidate(), 30); };

    // 30 de întrebări: dacă sunt mai puține unități, se repetă runde amestecate (fără aceeași unitate de două ori la rând)
    function fill30(ids) { let out = []; while (out.length < 30) { let r = shuffle(ids.slice()); if (out.length && r[0] === out[out.length - 1] && r.length > 1) r.push(r.shift()); out = out.concat(r); } return out.slice(0, 30); }
    function startQuiz(mode = 'find', only = null) {
      if (state.tool) toggleTool(null);
      const pool = only ? only.slice() : shuffle(cfg.units.map((u) => u.id));
      state.quiz = { mode, queue: only ? pool.slice() : fill30(cfg.units.map((u) => u.id)), idx: 0, ok: 0, bad: 0, locked: false };
      select(0); rm.setFilter(null); applyFilter(); rm.noHover = true; rm.setLabelsVisible('unit', false); rm.hideTip(); showDock(true); nextQ();
    }
    function endQuiz(msg) {
      const q = state.quiz; state.quiz = null; rm.noHover = false; rm.setSelected(0); rm.setLabelsVisible('unit', true); applyFilter();
      if (q && q.queue.length > 1 && msg !== false) {
        clear(quizPanel); const pct = Math.round((q.ok / Math.max(1, q.ok + q.bad)) * 100);
        quizPanel.append(h('div', { class: 'row' }, h('h3', { style: { margin: 0 } }, `Rezultat: ${q.ok}/${q.ok + q.bad} (${pct}%)`), h('div', { class: 'sp' }), h('button', { class: 'btn small primary', onclick: () => startQuiz(q.mode) }, ic('rotate'), 'Din nou'), h('button', { class: 'btn small', onclick: () => showDock(false) }, 'Închide')));
        if (pct >= 80) confetti(); store.addXP(Math.round(q.ok * 2), 'Test pe hartă terminat'); store.checkBadges();
      } else showDock(false);
    }
    function nextQ() {
      const q = state.quiz; if (!q) return; if (q.idx >= q.queue.length) return endQuiz();
      q.locked = false; const id = q.queue[q.idx]; const u = unitById[id]; rm.setSelected(0); clear(quizPanel);
      const head = h('div', { class: 'row', style: { gap: '10px', flexWrap: 'nowrap', marginBottom: '8px' } }, h('span', { class: 'badge mint' }, `${q.idx + 1}/${q.queue.length}`), h('span', { class: 'badge ok' }, `✓ ${q.ok}`), h('span', { class: 'badge bad' }, `✗ ${q.bad}`), h('div', { class: 'sp' }), h('button', { class: 'btn small ghost', onclick: () => endQuiz(false) }, ic('x'), 'Oprește'));
      if (q.mode === 'find') {
        quizPanel.append(head, h('h3', { style: { margin: '0 0 4px' } }, 'Unde se află: ', h('span', { class: 'gradient-text' }, u.name), '?'), h('div', { class: 'hint' }, 'Apasă pe hartă locul potrivit.'),
          h('div', { class: 'row', style: { marginTop: '8px' } }, h('button', { class: 'btn small', onclick: () => { toast({ icon: 'bulb', title: 'Indiciu', text: `Unitatea e în: ${u.loc || groupOf(u).name}` }); } }, ic('bulb'), 'Indiciu'), h('button', { class: 'btn small ghost', onclick: () => { q.bad++; q.idx++; nextQ(); } }, 'Sari peste')));
      } else {
        rm.setSelected(id); rm.flyToUnit(id);
        const others = shuffle(cfg.units.filter((x) => x.id !== id)).slice(0, 3); const opts = shuffle([u, ...others]);
        quizPanel.append(head, h('h3', { style: { margin: '0 0 8px' } }, 'Cum se numește unitatea evidențiată?'), h('div', { class: 'grid c2', style: { gap: '8px' } }, opts.map((o) => h('button', { class: 'btn opt', onclick: (e) => answer(o.id === id, e.currentTarget, id) }, o.name))));
      }
    }
    function answer(ok, btn, id) {
      const q = state.quiz; if (!q || q.locked) return; q.locked = true; store.recordAnswer('relief-' + cfg.key, ok); ok ? (q.ok++, beep('ok')) : (q.bad++, beep('bad'));
      btn.classList.add(ok ? 'good' : 'bad'); if (!ok) [...quizPanel.querySelectorAll('button.opt')].find((b) => b.textContent === unitById[id].name)?.classList.add('good'); if (ok) store.addXP(3);
      setTimeout(() => { if (state.quiz === q) { q.idx++; nextQ(); } }, ok ? 650 : 1400);
    }
    function quizClick(hitId) {
      const q = state.quiz; if (!q || q.locked || q.mode !== 'find') return; const id = q.queue[q.idx]; if (!hitId) return; /* click în afara unităților = ca și cum nu ai apăsat */ const ok = hitId === id; q.locked = true;
      store.recordAnswer('relief-' + cfg.key, ok); ok ? (q.ok++, beep('ok')) : (q.bad++, beep('bad')); rm.setSelected(id);
      if (ok) { store.addXP(3); confetti(window.innerWidth * 0.5, window.innerHeight * 0.4, 18); } else toast({ icon: 'alert', title: hitId ? `Aceea e: ${unitById[hitId]?.name || '—'}` : 'Nu e o unitate', text: `Răspunsul corect: ${unitById[id].name}` });
      clear(quizPanel); quizPanel.append(h('div', { class: 'row' }, h('span', { class: `badge ${ok ? 'ok' : 'bad'}` }, ok ? 'Corect!' : 'Greșit'), h('b', null, unitById[id].name)));
      setTimeout(() => { if (state.quiz === q) { q.idx++; nextQ(); } }, ok ? 800 : 1700);
    }

    // ------------- profil topografic
    const profileSVG = h('div', { style: { width: '100%', overflow: 'hidden' } });
    function toggleTool(t) {
      state.tool = state.tool === t ? null : t;
      if (state.tool === 'profile') { state.quiz && endQuiz(false); quizPanel.style.display = 'none'; toolPanel.style.display = 'block'; showDock(true); showProfileUI(); }
      else { toolPanel.style.display = 'none'; quizPanel.style.display = ''; rm.removeLineLayer('profile'); rm.clearLabels('profile'); state.profile = null; if (!state.quiz) showDock(false); }
      toolBtns.forEach((b) => b.classList.toggle('primary', b.dataset.tool === state.tool));
    }
    function pMark(p, t) { rm.addLabel({ lon: p.lon, lat: p.lat, text: t, cls: 'num', color: '#ffd37a', group: 'profile', z: 400 }); }
    function profileClick(e) {
      const p = state.profile || (state.profile = { pts: [] });
      if (p.pts.length >= 2) { p.pts = []; rm.clearLabels('profile'); rm.removeLineLayer('profile'); }
      p.pts.push({ lon: e.lon, lat: e.lat }); pMark(e, p.pts.length === 1 ? 'A' : 'B');
      if (p.pts.length === 2) drawProfile(p.pts[0], p.pts[1]); else showProfileUI('Alege punctul B…');
    }
    function showProfileUI(msg) {
      clear(toolPanel);
      toolPanel.append(h('div', { class: 'row', style: { marginBottom: '8px' } }, h('h4', { style: { margin: 0 } }, 'Profil topografic'), h('div', { class: 'sp' }),
        ...(cfg.profilePresets || []).map((pr) => h('button', { class: 'btn small', onclick: () => { rm.clearLabels('profile'); state.profile = { pts: [pr.a, pr.b] }; pMark(pr.a, 'A'); pMark(pr.b, 'B'); drawProfile(pr.a, pr.b); } }, pr.label)),
        h('button', { class: 'btn small ghost', onclick: () => toggleTool(null) }, ic('x'))),
        h('div', { class: 'hint' }, msg || 'Apasă pe hartă două puncte (A și B) – vezi cum se schimbă altitudinea și unitățile de relief între ele. Sau alege un traseu gata făcut.'), profileSVG);
      clear(profileSVG);
    }
    function drawProfile(a, b) {
      const data = rm.getProfile(a, b, 260); rm.addLineLayer('profile', [data.map((d) => [d.lon, d.lat])], { color: '#ffd37a', width: 4, opacity: 1 }); showProfileUI();
      const W = 920, Hh = 190, pad = { l: 44, r: 10, t: 12, b: 24 }; const maxH = Math.max(200, Math.ceil(Math.max(...data.map((d) => d.h)) / 200) * 200); const total = data[data.length - 1].d || 1;
      const X = (d) => pad.l + (d / total) * (W - pad.l - pad.r), Y = (v) => pad.t + (1 - v / maxH) * (Hh - pad.t - pad.b);
      const s = svg('svg', { viewBox: `0 0 ${W} ${Hh}`, style: { width: '100%', height: 'auto' } });
      for (let v = 0; v <= maxH; v += maxH / 4) s.append(svg('line', { x1: pad.l, x2: W - pad.r, y1: Y(v), y2: Y(v), stroke: 'var(--line)' }), svg('text', { x: pad.l - 6, y: Y(v) + 4, 'text-anchor': 'end', fill: 'var(--faint)', 'font-size': 11 }, Math.round(v)));
      for (let i = 0; i < data.length - 1; i++) { const d0 = data[i], d1 = data[i + 1]; const u = unitById[d0.id]; const col = u ? colorOf(u) : '#6f7ca6'; s.append(svg('path', { d: `M${X(d0.d)},${Y(d0.h)} L${X(d1.d)},${Y(d1.h)} L${X(d1.d)},${Hh - pad.b} L${X(d0.d)},${Hh - pad.b} Z`, fill: col, 'fill-opacity': 0.8, stroke: col, 'stroke-width': 0.5 })); }
      s.append(svg('path', { d: data.map((d, i) => `${i ? 'L' : 'M'}${X(d.d)},${Y(d.h)}`).join(' '), fill: 'none', stroke: 'var(--text)', 'stroke-width': 1.6 }));
      let runStart = 0; for (let i = 1; i <= data.length; i++) { if (i === data.length || data[i].id !== data[runStart].id) { const u = unitById[data[runStart].id]; const w = X(data[i - 1].d) - X(data[runStart].d); if (u && w > 52) s.append(svg('text', { x: (X(data[runStart].d) + X(data[i - 1].d)) / 2, y: Hh - pad.b - 7, 'text-anchor': 'middle', fill: '#07101f', 'font-size': 10.5, 'font-weight': 800 }, u.short || u.name)); runStart = i; } }
      s.append(svg('text', { x: pad.l, y: Hh - 6, fill: 'var(--muted)', 'font-size': 11 }, 'A'), svg('text', { x: W - pad.r, y: Hh - 6, fill: 'var(--muted)', 'font-size': 11, 'text-anchor': 'end' }, `B   ·   ${fmt(Math.round(total / 1000))} km`));
      const cursor = svg('line', { y1: pad.t, y2: Hh - pad.b, stroke: 'var(--text)', 'stroke-width': 1.2, opacity: 0 }); const readout = h('div', { class: 'hint', style: { minHeight: '20px', marginTop: '4px' } }, 'Mută mouse-ul peste grafic.'); s.append(cursor);
      s.addEventListener('pointermove', (e) => { const r = s.getBoundingClientRect(); const x = ((e.clientX - r.left) / r.width) * W; const t = clamp((x - pad.l) / (W - pad.l - pad.r), 0, 1); const d = data[Math.round(t * (data.length - 1))]; cursor.setAttribute('x1', X(d.d)); cursor.setAttribute('x2', X(d.d)); cursor.setAttribute('opacity', 1); readout.textContent = `${fmt(Math.round(d.h))} m · ${unitById[d.id] ? unitById[d.id].name : '—'} · km ${fmt(Math.round(d.d / 1000))}`; });
      clear(profileSVG); profileSVG.append(s, readout);
    }
    const toolBtns = []; (cfg.tools || []).forEach((t) => { if (t === 'profile') { const b = h('button', { class: 'btn small', onclick: () => toggleTool('profile') }, ic('cut'), 'Profil topografic'); b.dataset.tool = 'profile'; toolBtns.push(b); } });
    layerPanel.append(h('div', { class: 'divider' }), h('h4', null, 'Exersează'), h('div', { class: 'row', style: { gap: '8px' } }, h('button', { class: 'btn small primary', onclick: () => startQuiz('find') }, ic('target'), 'Test pe hartă'), h('button', { class: 'btn small', onclick: () => startQuiz('name') }, ic('help'), 'Recunoaște unitatea'), ...toolBtns));

    if (cfg.extras) cfg.extras({ root, rm, left, right, select, unitById, colorOf, startQuiz });
    renderInfo(null); mkLabels(); rm.setBase('color');
    if (cfg.initialSelect) setTimeout(() => select(cfg.initialSelect, true), 450);
    root.__api = { rm, select, startQuiz };
  })();

  // buton de restrângere a panourilor
  const mkToggle = (side, el) => { const b = h('button', { class: 'mp-toggle', title: 'Ascunde / arată panoul', onclick: () => { root.classList.toggle('hide-' + side); setTimeout(() => rm && rm.invalidate(), 260); } }, ic(side === 'left' ? 'chevL' : 'chevR')); el.prepend(b); };
  mkToggle('left', left); mkToggle('right', right);
  return { el: root, destroy() { state.destroyed = true; cleanups.forEach((f) => f()); rm && rm.dispose(); } };
}
