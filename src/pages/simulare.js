import { h, clear, shuffle, loadAsset } from '../core/dom.js';
import { ic, pageHead, ring, confetti, beep } from '../core/ui.js';
import * as store from '../core/store.js';
import { EU_UNITS } from '../data/relief.js';
import { ZONE_BY_KEY, TEST_ZONES } from '../data/clima.js';
import { questionPool } from '../data/cards.js';
import { CORE } from '../data/core_items.js';
import { stats, climographSVG } from '../core/climo.js';

// ------------------------------------------------------------------ Test de antrenament: întrebări cu variante, în stilul testului
const css = `
.sim-q{margin-top:14px}
.sim-q .opt.sel{border-color:var(--accent);background:color-mix(in srgb,var(--accent) 16%,var(--surface-2))}
.sim-q .opt{justify-content:flex-start;text-align:left;white-space:normal;font-weight:600}
.sim-q .opt .lt{min-width:22px;display:inline-grid;place-items:center;font-weight:800;color:var(--faint)}
.sim-sec h2{margin:34px 0 4px}
.sim-chart{max-width:640px;margin:10px 0 12px;padding:10px;border-radius:16px;background:var(--surface);border:1px solid var(--line)}
`;

const norm = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const num = (v) => String(v).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

// 4 variante: răspunsul corect + 3 greșite (unice); null dacă nu ajung
function mc(sec, q, right, wrongPool, why, extra = {}) {
  const wrong = shuffle([...new Set(wrongPool.filter((x) => x != null && x !== '' && String(x) !== String(right)))]).slice(0, 3);
  if (wrong.length < 3) return null;
  return { sec, q, a: right, opts: shuffle([right, ...wrong]), why, ...extra };
}
const pick = (arr, n) => shuffle(arr.slice()).slice(0, n);

function genSec1a(items) { // insulă / peninsulă / mare / golf / ocean după descriere – echilibrat pe categorii
  const LBL = { insula: 'insula / arhipelagul', peninsula: 'peninsula', mare: 'marea', golf: 'golful', ocean: 'oceanul' };
  const base = items.filter((x) => CORE.has(x.id) && LBL[x.cat]);
  const strip = (n) => n.replace(/^(Insulele|Insula|Peninsula|Marea|Golful|Oceanul)\s+/i, '');
  const byCat = {}; shuffle(base.slice()).forEach((x) => (byCat[x.cat] = byCat[x.cat] || []).push(x));
  const order = shuffle(['insula', 'peninsula', 'mare', 'golf']).concat(shuffle(['insula', 'mare', 'peninsula', 'golf']));
  const out = [];
  for (const cat of order) {
    if (out.length >= 6) break;
    while (byCat[cat] && byCat[cat].length) {
      const x = byCat[cat].shift(); const cands = (x.facts || []).filter((f) => !norm(f).includes(norm(strip(x.name))));
      if (!cands.length) continue;
      const it = mc(1, `Numește ${LBL[x.cat]} descris(ă) astfel: „${cands[0]}”`, x.name, base.filter((y) => y.cat === x.cat).map((y) => y.name), `${x.name}.`);
      if (it) { out.push(it); break; }
    }
  }
  return out;
}

function genSec1b(pool) { return pick(pool.filter((q) => q.topic === 'relief-europe' && !/Fusul|Suprafața|punctul|Altitudinea medie|SĂ (SCADĂ|CREASCĂ)/.test(q.q)), 4).map((q) => ({ sec: 1, q: q.q, a: q.a, opts: q.opts, why: q.why })); }

function parseRange(s) { const m = String(s).match(/(-?\d+)\s*[–-]\s*(-?\d+)/); return m ? [+m[1], +m[2]] : null; }
function genSec2(pool) {
  const out = [];
  // a) t.m.a. → ce climat
  const zs = TEST_ZONES.filter((z) => parseRange(z.tma));
  pick(zs, 3).forEach((z) => { const [a, b] = parseRange(z.tma); const v = Math.round((a + b) / 2); const pp = parseRange(z.pp); const ppTxt = pp ? ` și precipitații de ${z.pp.replace(/\s*\(.*$/, '')}` : '';
    const it = mc(2, `O regiune cu t.m.a. de aproximativ ${v} °C${ppTxt}. Ce climat are?`, z.name, TEST_ZONES.map((x) => x.name), `${z.name}: t.m.a. ${z.tma}, pp ${z.pp}.`); it && out.push(it); });
  // b) altitudine → munți ; c) munți → altitudine
  const mts = EU_UNITS.filter((u) => u.alt && u.alt.v > 500 && /^Munții/.test(u.name));
  pick(mts, 3).forEach((u) => { const it = mc(2, `Altitudinea maximă de ${num(u.alt.v)} m se întâlnește în:`, u.name, mts.map((x) => x.name), `${u.name}: ${num(u.alt.v)} m (${u.alt.where}).`); it && out.push(it); });
  const allAlt = EU_UNITS.filter((u) => u.alt && u.alt.v > 0);
  pick(allAlt, 3).forEach((u) => { const wrong = allAlt.filter((x) => x !== u).map((x) => `${num(x.alt.v)} m`); const it = mc(2, `Care este altitudinea maximă în ${u.name}?`, `${num(u.alt.v)} m`, wrong, `${u.name}: ${num(u.alt.v)} m (${u.alt.where}).`); it && out.push(it); });
  const germ = pool.filter((q) => /Germania|trecerea/i.test(q.q + q.a) && q.topic === 'zone-clima'); pick(germ, 1).forEach((q) => out.push({ sec: 2, q: q.q, a: q.a, opts: q.opts, why: q.why }));
  return out;
}

function genSec3(pool) { return pick(pool.filter((q) => q.topic === 'relief-romania'), 6).map((q) => ({ sec: 3, q: q.q, a: q.a, opts: q.opts, why: q.why })); }

const r1 = (v) => Math.round(v * 10) / 10;
function genSec4(stations, pool) {
  const test = new Set(TEST_ZONES.map((z) => z.key));
  const st4 = stations.filter((s) => test.has(s.zoneId) && s.lat > 0 && s.tempC && s.precipMm);
  const out = [];
  // câte o stație din zone diferite
  const byZone = {}; st4.forEach((s) => (byZone[s.zoneId] = byZone[s.zoneId] || []).push(s));
  pick(Object.keys(byZone), 2).forEach((k) => {
    const s = pick(byZone[k], 1)[0]; const S = stats(s); const spring = r1((s.tempC[2] + s.tempC[3] + s.tempC[4]) / 3);
    const near = (v, d = [1.2, 2.4, 3.6, 4.8]) => shuffle([...new Set(d.flatMap((x) => [r1(v + x), r1(v - x)]).filter((x) => x !== v))]);
    const chart = { st: s };
    const a = mc(4, 'Care este temperatura medie din primăvară (martie–mai), citită din diagramă?', `${spring} °C`, near(spring).map((x) => `${x} °C`), `(${s.tempC[2]} + ${s.tempC[3]} + ${s.tempC[4]}) ÷ 3 = ${spring} °C.`, { chart });
    const m = mc(4, 'Care este temperatura medie anuală (suma celor 12 medii lunare ÷ 12)?', `${S.mean} °C`, near(S.mean).map((x) => `${x} °C`), `Suma mediilor lunare ÷ 12 = ${S.mean} °C.`, { chart });
    const b = mc(4, 'Care este amplitudinea termică anuală (temperatura maximă − minimă)?', `${S.amp} °C`, near(S.amp, [1.5, 3, 4.5, 6]).map((x) => `${x} °C`), `${S.tMax} − (${S.tMin}) = ${S.amp} °C.`, { chart });
    const c = mc(4, 'Cărui climat îi corespunde diagrama?', ZONE_BY_KEY[s.zoneId].name, TEST_ZONES.map((z) => z.name), `Barele și linia corespund zonei ${ZONE_BY_KEY[s.zoneId].name}.`, { chart });
    [a, m, b, c].forEach((x) => x && out.push(x));
  });
  pick(pool.filter((q) => q.topic === 'climograf' && /^Pe grafic|^Indiciu/.test(q.q)), 2).forEach((q) => out.push({ sec: 4, q: q.q, a: q.a, opts: q.opts, why: q.why }));
  return out;
}

const SECTIONS = [
  [1, 'Subiectul 1 – Europa: insule, peninsule, mări, oceane și forme de relief', 'a) Numește insula / peninsula / marea / oceanul descris(ă).  b) Numește forma de relief.'],
  [2, 'Subiectul 2 – Climă și altitudini', 'a) t.m.a. → ce climat.  b) Altitudinea maximă de n m → în ce munți.  c) Altitudinea maximă din munții…'],
  [3, 'Subiectul 3 – România: forme de relief', 'Unde se află altitudinea / unitatea / resursa descrisă.'],
  [4, 'Subiectul 4 – Diagramă cu temperaturi și precipitații', 'Fizionomia precipitațiilor, amplitudinea, temperatura medie, climatul.'],
];

export default async function simulare() {
  const el = h('div', { class: 'page' }); el.append(h('style', null, css));
  el.append(pageHead({ eyebrow: 'Verifică-te', title: 'Test de antrenament', lead: 'Un test ca la clasă: întrebări cu 4 variante, pe subiecte, cu corectare la final. Fiecare test nou are întrebări diferite.' }));
  const body = h('div'); el.append(body);
  let items = [], stations = [];
  try { items = (await loadAsset('bonus')).items; } catch { /* fără insule */ }
  try { stations = (await loadAsset('climate')).stations; } catch { /* fără stații */ }

  function build() {
    const pool = questionPool().filter((q) => !q.extra);
    const all = [...genSec1a(items), ...genSec1b(pool), ...genSec2(pool), ...genSec3(pool), ...genSec4(stations, pool)];
    return all;
  }

  function render(qs) {
    clear(body); const answers = new Map(); let done = false; const nodes = [];
    SECTIONS.forEach(([sec, title, hint]) => {
      const list = qs.filter((q) => q.sec === sec); if (!list.length) return;
      const box = h('section', { class: 'sim-sec' }, h('h2', null, title), h('div', { class: 'hint' }, hint));
      let lastChart = null;
      list.forEach((q) => {
        const n = qs.indexOf(q) + 1; const card = h('div', { class: 'card sim-q' }); const btns = [];
        card.append(h('div', { style: { fontWeight: 750, marginBottom: '8px' } }, `${n}. ${q.q}`));
        if (q.chart) card.append(h('div', { class: 'sim-chart' }, climographSVG(q.chart.st, { hideName: true, title: 'Diagramă', subtitle: 'temperaturi (linie) și precipitații (bare)', showValues: false })));
        const grid = h('div', { class: 'stack', style: { gap: '8px' } });
        q.opts.forEach((o, i) => { const b = h('button', { class: 'btn opt', onclick: () => { if (done) return; answers.set(q, o); btns.forEach((x) => x.classList.toggle('sel', x === b)); upd(); } }, h('span', { class: 'lt' }, 'abcd'[i]), o); b.dataset.v = o; btns.push(b); grid.append(b); });
        card.append(grid); nodes.push({ q, card, btns }); box.append(card); void lastChart;
      });
      body.append(box);
    });
    const bar = h('div', { class: 'card', style: { marginTop: '28px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' } });
    const info = h('span', { class: 'hint' }); const check = h('button', { class: 'btn primary', onclick: grade }, ic('check'), 'Corectează testul'); const again = h('button', { class: 'btn', onclick: () => render(build()) }, ic('rotate'), 'Test nou');
    bar.append(check, again, info); body.append(bar);
    const upd = () => { info.textContent = `Ai răspuns la ${answers.size} din ${qs.length} întrebări.`; }; upd();
    function grade() {
      if (done) return; done = true; let ok = 0; const per = {};
      nodes.forEach(({ q, card, btns }) => {
        const mine = answers.get(q); const good = mine === q.a; if (good) ok++; (per[q.sec] = per[q.sec] || [0, 0]); per[q.sec][1]++; if (good) per[q.sec][0]++;
        store.recordAnswer(q.sec === 4 ? 'climograf' : q.sec === 2 ? 'zone-clima' : q.sec === 3 ? 'relief-romania' : 'relief-europe', good);
        btns.forEach((b) => { b.disabled = true; if (b.dataset.v === q.a) b.classList.add('good'); else if (b.dataset.v === mine) b.classList.add('bad'); });
        if (!good) card.append(h('div', { class: 'callout warn', style: { marginTop: '10px' } }, ic('alert'), h('div', null, h('b', null, mine ? 'Greșit. ' : 'Nu ai răspuns. '), `Corect: ${q.a}.`, q.why ? ` ${q.why}` : '')));
      });
      const pct = Math.round((ok / qs.length) * 100); beep(pct >= 60 ? 'ok' : 'bad'); if (pct >= 80) confetti(); store.addXP(Math.round(ok * 1.5), 'Test de antrenament'); store.checkBadges();
      const res = h('div', { class: 'card', style: { textAlign: 'center', padding: '24px 18px', marginBottom: '8px' } }, ring(pct, 110), h('h2', { style: { margin: '10px 0 4px' } }, `${ok} / ${qs.length} răspunsuri corecte`), h('div', { class: 'row', style: { justifyContent: 'center', gap: '8px' } }, SECTIONS.filter(([s]) => per[s]).map(([s]) => h('span', { class: 'badge' }, `Subiectul ${s}: ${per[s][0]}/${per[s][1]}`))));
      body.prepend(res); window.scrollTo?.({ top: 0 }); document.querySelector('.view')?.scrollTo?.({ top: 0, behavior: 'smooth' });
      check.disabled = true; info.textContent = 'Corectat. Vezi explicațiile sub răspunsurile greșite.';
    }
  }
  render(build());
  return { el };
}
