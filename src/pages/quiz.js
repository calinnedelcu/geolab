import { h, clear, shuffle, clamp, fmt, loadAsset } from '../core/dom.js';
import { ic, pageHead, callout, toast, confetti, beep, ring, bar, tabs } from '../core/ui.js';
import * as store from '../core/store.js';
import { questionPool, bonusQuestions } from '../data/cards.js';
import { toggle } from '../core/ui.js';

const TOPICS = [
  { id: 'all', name: 'Amestecat (subiectele de test)', icon: 'shuffle', color: 'var(--accent)' },
  { id: 'relief-europe', name: 'Relief Europa', icon: 'globe', color: '#a66bff' },
  { id: 'relief-romania', name: 'Relief România', icon: 'mountain', color: '#e0524d' },
  { id: 'tipuri-relief', name: 'Tipuri de relief', icon: 'cube', color: '#7cc7ff' },
  { id: 'comparatie', name: 'Europa vs. România (fișa generală)', icon: 'layers', color: '#f0b429' },
  { id: 'zone-clima', name: 'Zone de climă (cele de la test)', icon: 'cloud', color: '#34a853' },
  { id: 'climograf', name: 'Fizionomia pp. pe grafice', icon: 'chart', color: '#ff7aa8' },
  { id: 'insule-mari', name: 'Insule, peninsule, mări, golfuri', icon: 'anchor', color: '#5eead4' },
  { id: 'clima', name: 'Clima Europei & României', icon: 'wind', color: '#4aa3df' },
];

export default async function quiz() {
  const el = h('div', { class: 'page' });
  let pool = questionPool(); let session = null; let timerId = 0; let extra = false;
  try { const D = await loadAsset('bonus'); pool = pool.concat(bonusQuestions(D.items)); } catch (e) { /* fără date pentru insule */ }
  const usable = () => pool.filter((q) => extra || !q.extra);
  el.append(pageHead({ eyebrow: 'Verifică-te', title: 'Quiz', lead: 'Întrebări generate din caietele voastre. Alege subiectul, modul și câte întrebări vrei.' }));
  const body = h('div'); el.append(body);

  function home() {
    clear(body); let topic = 'all', n = 15, mode = 'normal';
    const mastery = (t) => { const m = store.mastery(t === 'all' ? null : t); return m; };
    const topicCards = h('div', { class: 'grid c3' });
    const draw = () => { clear(topicCards); TOPICS.forEach((t) => { const cnt = usable().filter((q) => t.id === 'all' || q.topic === t.id).length; if (!cnt) return; const m = t.id === 'all' ? null : store.mastery(t.id); topicCards.append(h('button', { class: 'card hoverable', style: { textAlign: 'left', borderColor: topic === t.id ? t.color : undefined, boxShadow: topic === t.id ? `0 0 0 2px ${t.color}` : undefined }, onclick: () => { topic = t.id; draw(); } }, h('div', { class: 'row', style: { gap: '12px', flexWrap: 'nowrap' } }, h('span', { style: { width: '30px', color: t.color } }, ic(t.icon)), h('div', { class: 'sp' }, h('h3', { style: { margin: 0 } }, t.name), h('div', { class: 'hint' }, `${cnt} întrebări`)), m != null ? ring(m * 100, 52) : null))); }); };
    draw();
    const nSel = h('div', { class: 'chips' }, [10, 15, 25, 40].map((v) => h('button', { class: `chip ${v === n ? 'active' : ''}`, onclick: (e) => { n = v; [...nSel.children].forEach((c) => c.classList.remove('active')); e.currentTarget.classList.add('active'); } }, `${v} întrebări`)));
    const modes = tabs([{ id: 'normal', label: 'Normal' }, { id: 'timed', label: 'Contra-timp (20 s)' }, { id: 'survival', label: 'Supraviețuire (3 vieți)' }], 'normal', (v) => { mode = v; });
    body.append(h('div', { class: 'row', style: { marginBottom: '12px' } }, toggle('Include și materia extra (zonele ecuatorială, tropicale, polară)', extra, (v) => { extra = v; draw(); }), h('span', { class: 'hint' }, 'Implicit: doar ce intră la test.')), topicCards, h('div', { class: 'card', style: { marginTop: '16px' } }, h('div', { class: 'grid c2' }, h('div', { class: 'field' }, h('label', null, 'Număr de întrebări'), nSel), h('div', { class: 'field' }, h('label', null, 'Mod'), modes)), h('div', { class: 'row', style: { marginTop: '16px' } }, h('button', { class: 'btn primary', onclick: () => start(topic, n, mode) }, ic('play'), 'Începe quiz-ul'), h('span', { class: 'hint' }, 'Poți răspunde și de la tastatură: 1–4'))));
    const hist = store.get().quizHistory.slice(-6).reverse();
    if (hist.length) body.append(h('h2', { style: { marginTop: '26px' } }, 'Ultimele rezultate'), h('div', { class: 'table-wrap' }, h('table', { class: 'table' }, h('thead', null, h('tr', null, ['Subiect', 'Mod', 'Scor', 'Procent'].map((x) => h('th', null, x)))), h('tbody', null, hist.map((r) => h('tr', null, h('td', null, r.topic), h('td', null, r.mode), h('td', null, `${r.ok}/${r.n}`), h('td', null, `${r.pct}%`)))))));
  }

  function start(topic, n, mode) {
    const list = shuffle(usable().filter((q) => topic === 'all' || q.topic === topic));
    // reamestecă opțiunile la fiecare sesiune
    const qs = list.slice(0, n).map((q) => ({ ...q, opts: shuffle(q.opts) }));
    session = { topic, mode, qs, i: 0, ok: 0, lives: 3, wrong: [], t: 0 };
    ask();
  }
  function ask() {
    clearInterval(timerId); const s = session; if (!s) return;
    if (s.i >= s.qs.length || (s.mode === 'survival' && s.lives <= 0)) return finish();
    const q = s.qs[s.i]; clear(body);
    const head = h('div', { class: 'row', style: { marginBottom: '10px' } }, h('span', { class: 'badge mint' }, `${s.i + 1} / ${s.qs.length}`), h('span', { class: 'badge ok' }, `✓ ${s.ok}`), s.mode === 'survival' ? h('span', { class: 'badge bad' }, '♥'.repeat(s.lives) || '—') : null, h('div', { class: 'sp' }), h('button', { class: 'btn small ghost', onclick: () => { clearInterval(timerId); session = null; home(); } }, ic('x'), 'Oprește'));
    const prog = bar((s.i / s.qs.length) * 100);
    const card = h('div', { class: 'card', style: { marginTop: '14px' } });
    const timerBar = s.mode === 'timed' ? h('div', { class: 'bar', style: { marginBottom: '14px' } }, h('i', { style: { '--w': '100%', transition: 'width 1s linear' } })) : null;
    let done = false;
    const choose = (opt, btn) => {
      if (done) return; done = true; clearInterval(timerId); const ok = opt === q.a; store.recordAnswer(q.topic, ok);
      if (ok) { s.ok++; beep('ok'); store.addXP(2); } else { s.wrong.push(q); beep('bad'); if (s.mode === 'survival') s.lives--; }
      [...card.querySelectorAll('button.opt')].forEach((b) => { b.disabled = true; if (b.dataset.v === q.a) b.classList.add('good'); else if (b === btn) b.classList.add('bad'); });
      if (q.why) card.append(h('div', { class: `callout ${ok ? 'good' : 'warn'}`, style: { marginTop: '14px' } }, ic(ok ? 'check' : 'alert'), h('div', null, h('b', null, ok ? 'Corect! ' : 'Nu chiar. '), q.why)));
      card.append(h('div', { class: 'row', style: { marginTop: '14px' } }, h('button', { class: 'btn primary', id: 'nextq', onclick: () => { s.i++; ask(); } }, 'Următoarea ', ic('chevR'))));
      setTimeout(() => card.querySelector('#nextq') && card.querySelector('#nextq').focus(), 20);
    };
    card.append(timerBar, h('h2', { style: { fontSize: '1.3rem', marginBottom: '16px' } }, q.q), h('div', { class: 'stack' }, q.opts.map((o, i) => h('button', { class: 'btn opt', 'data-v': o, style: { justifyContent: 'flex-start', textAlign: 'left', whiteSpace: 'normal', padding: '13px 15px', fontWeight: 600 }, onclick: (e) => choose(o, e.currentTarget) }, h('span', { class: 'badge', style: { minWidth: '22px', justifyContent: 'center' } }, String(i + 1)), o))));
    body.append(head, prog, card);
    if (s.mode === 'timed') { let t = 20; const fill = timerBar.firstChild; setTimeout(() => (fill.style.setProperty('--w', '0%'), (fill.style.transitionDuration = '20s')), 30); timerId = setInterval(() => { t--; if (t <= 0) { clearInterval(timerId); if (!done) choose('__timeout__', null); } }, 1000); }
    s.keyHandler && document.removeEventListener('keydown', s.keyHandler);
    s.keyHandler = (e) => { const k = parseInt(e.key, 10); if (k >= 1 && k <= q.opts.length && !done) { const b = card.querySelectorAll('button.opt')[k - 1]; b && b.click(); } else if ((e.key === 'Enter' || e.key === ' ') && done) { e.preventDefault(); const nb = card.querySelector('#nextq'); nb && nb.click(); } };
    document.addEventListener('keydown', s.keyHandler);
  }
  function finish() {
    const s = session; clearInterval(timerId); s.keyHandler && document.removeEventListener('keydown', s.keyHandler); const n = s.qs.slice(0, s.i).length || s.qs.length; const pct = Math.round((s.ok / Math.max(1, s.i || s.qs.length)) * 100);
    store.update((st) => { st.quizHistory.push({ topic: TOPICS.find((t) => t.id === s.topic).name, mode: s.mode, ok: s.ok, n: s.i || s.qs.length, pct, ts: Date.now() }); st.quizHistory = st.quizHistory.slice(-30); });
    store.addXP(s.ok * 2, 'Quiz terminat'); store.checkBadges(); if (pct >= 80) confetti();
    clear(body); body.append(h('div', { class: 'card', style: { textAlign: 'center', padding: '34px 20px' } }, ring(pct, 120), h('h2', { style: { marginTop: '14px' } }, pct >= 90 ? 'Excelent!' : pct >= 70 ? 'Foarte bine!' : pct >= 50 ? 'Merge, dar mai exersează' : 'Hai să repetăm'), h('p', { style: { color: 'var(--muted)' } }, `${s.ok} răspunsuri corecte din ${s.i || s.qs.length}.`), h('div', { class: 'row', style: { justifyContent: 'center' } }, h('button', { class: 'btn primary', onclick: () => start(s.topic, s.qs.length, s.mode) }, ic('rotate'), 'Din nou'), s.wrong.length ? h('button', { class: 'btn', onclick: () => { session = { ...s, qs: s.wrong.map((q) => ({ ...q, opts: shuffle(q.opts) })), i: 0, ok: 0, lives: 3, wrong: [] }; ask(); } }, ic('target'), `Doar greșelile (${s.wrong.length})`) : null, h('button', { class: 'btn ghost', onclick: home }, 'Meniu'))));
    if (s.wrong.length) body.append(h('h3', { style: { marginTop: '24px' } }, 'Ce ai greșit'), h('div', { class: 'stack' }, s.wrong.map((q) => h('div', { class: 'card tight' }, h('div', { style: { fontWeight: 700 } }, q.q), h('div', { style: { color: 'var(--ok)', fontWeight: 650, marginTop: '4px' } }, '→ ', q.a), q.why ? h('div', { class: 'hint', style: { marginTop: '4px' } }, q.why) : null))));
    session = null;
  }
  home();
  return { el, destroy() { clearInterval(timerId); session && session.keyHandler && document.removeEventListener('keydown', session.keyHandler); } };
}
