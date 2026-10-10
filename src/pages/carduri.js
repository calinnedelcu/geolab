import { h, clear, shuffle, clamp, loadAsset } from '../core/dom.js';
import { ic, pageHead, tabs, callout, toast, confetti, beep, ring, bar } from '../core/ui.js';
import * as store from '../core/store.js';
import { buildCards, buildBonusCards } from '../data/cards.js';
import { toggle } from '../core/ui.js';

export default async function carduri() {
  let all0 = buildCards(); try { const D = await loadAsset('bonus'); all0 = all0.concat(buildBonusCards(D.items)); } catch (e) { /* fără insule */ }
  let extra = false; let all = all0.filter((c) => extra || !c.extra); let decks = ['Toate', ...new Set(all.map((c) => c.deck))];
  const refilter = () => { all = all0.filter((c) => extra || !c.extra); decks = ['Toate', ...new Set(all.map((c) => c.deck))]; if (!decks.includes(deck)) deck = 'Toate'; };
  const el = h('div', { class: 'page' });
  let deck = 'Toate'; let intensive = false; let queue = []; let idx = 0; let flipped = false;
  const stats = h('div', { class: 'grid c4', style: { marginBottom: '18px' } });
  const area = h('div');
  el.append(pageHead({ eyebrow: 'Memorare', title: 'Carduri cu repetiție spațiată', lead: 'Sistemul Leitner: cardurile pe care le știi apar tot mai rar, cele greșite revin imediat. Datele vin din caietele tale și ale colegului.' }));
  const deckBar = h('div', { class: 'row', style: { marginBottom: '14px' } });
  const mkDeckBar = () => { refilter(); clear(deckBar); deckBar.append(h('div', { class: 'chips' }, decks.map((d) => h('button', { class: `chip ${d === deck ? 'active' : ''}`, onclick: () => { deck = d; build(); mkDeckBar(); } }, d, h('span', { class: 'hint', style: { marginLeft: '4px' } }, String(d === 'Toate' ? all.length : all.filter((c) => c.deck === d).length))))), h('div', { class: 'sp' }), toggle('Include materia extra', extra, (v) => { extra = v; mkDeckBar(); build(); }), h('label', { class: 'switch' }, h('input', { type: 'checkbox', checked: intensive, onchange: (e) => { intensive = e.target.checked; build(); } }), h('span', { class: 'track' }), h('span', null, 'Mod intens'))); };
  function pool() { const list = all.filter((c) => deck === 'Toate' || c.deck === deck); return list; }
  function build() {
    const list = pool(); const due = list.filter((c) => store.cardDue(c.id)); const nw = due.filter((c) => !store.get().leitner[c.id]);
    queue = shuffle(due.filter((c) => store.get().leitner[c.id])).concat(shuffle(nw)).slice(0, 40); idx = 0; flipped = false; renderStats(list, due); draw();
  }
  function renderStats(list, due) {
    clear(stats); const L = store.get().leitner; const boxes = [0, 0, 0, 0, 0, 0]; list.forEach((c) => { boxes[store.cardBox(c.id)]++; });
    const known = list.filter((c) => store.cardBox(c.id) >= 4).length;
    stats.append(h('div', { class: 'card tight' }, h('div', { class: 'hint' }, 'De reînvățat acum'), h('div', { class: 'num-big', style: { fontSize: '1.9rem', color: 'var(--accent)' } }, String(due.length))),
      h('div', { class: 'card tight' }, h('div', { class: 'hint' }, 'Cunoscute (cutia 4–5)'), h('div', { class: 'num-big', style: { fontSize: '1.9rem', color: 'var(--ok)' } }, `${known}/${list.length}`)),
      h('div', { class: 'card tight', style: { gridColumn: 'span 2' } }, h('div', { class: 'hint' }, 'Cutiile Leitner (0 = nou / greșit … 5 = stăpânit)'), h('div', { style: { display: 'flex', gap: '8px', alignItems: 'flex-end', height: '52px', marginTop: '6px' } }, boxes.map((n, i) => h('div', { style: { flex: 1, textAlign: 'center' } }, h('div', { style: { height: Math.max(4, (n / Math.max(1, list.length)) * 44) + 'px', background: `color-mix(in srgb, var(--accent) ${20 + i * 16}%, var(--surface-3))`, borderRadius: '6px' } }), h('small', null, `${i}·${n}`))))));
  }
  function draw() {
    clear(area);
    if (!queue.length || idx >= queue.length) {
      area.append(h('div', { class: 'card', style: { textAlign: 'center', padding: '44px 20px' } }, h('div', { style: { width: '64px', margin: '0 auto', color: 'var(--ok)' } }, ic('check')), h('h2', { style: { marginTop: '12px' } }, queue.length ? 'Sesiune terminată!' : 'Nimic de revizuit acum'), h('p', { style: { color: 'var(--muted)' } }, queue.length ? 'Bravo! Cardurile greșite revin curând.' : 'Toate cardurile din acest pachet sunt la zi. Încearcă „Mod intens” sau alt pachet.'), h('div', { class: 'row', style: { justifyContent: 'center' } }, h('button', { class: 'btn primary', onclick: build }, ic('rotate'), 'Încă o rundă'), h('button', { class: 'btn', onclick: () => { intensive = true; mkDeckBar(); const list = pool(); queue = shuffle(list).slice(0, 30); idx = 0; flipped = false; renderStats(list, list); draw(); } }, ic('bolt'), 'Repetă tot (30 aleatoare)'))));
      if (queue.length && idx >= queue.length) { confetti(); store.addXP(Math.round(queue.length * 1.2), 'Sesiune de carduri'); store.checkBadges(); }
      return;
    }
    const c = queue[idx];
    const front = h('div', { class: 'face front' }, h('div', { class: 'hint', style: { letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 800 } }, c.deck, c.tag ? ` · ${c.tag}` : ''), h('div', { style: { fontSize: 'clamp(1.2rem,2vw,1.7rem)', fontWeight: 750, marginTop: '14px', maxWidth: '30ch' } }, c.q), h('div', { class: 'hint', style: { marginTop: '24px' } }, 'Apasă pentru răspuns · Spațiu'));
    const back = h('div', { class: 'face back' }, h('div', { class: 'hint', style: { letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 800, color: 'var(--accent)' } }, 'Răspuns'), h('div', { style: { fontSize: 'clamp(1.05rem,1.7vw,1.4rem)', fontWeight: 650, marginTop: '14px', maxWidth: '44ch' } }, c.a));
    const cardEl = h('div', { class: `flip ${flipped ? 'on' : ''}`, onclick: () => { flipped = true; cardEl.classList.add('on'); showRate(); } }, front, back);
    const rate = h('div', { class: 'row', style: { justifyContent: 'center', marginTop: '16px', minHeight: '46px' } });
    const showRate = () => { clear(rate); rate.append(h('button', { class: 'btn bad', onclick: () => grade(false) }, ic('x'), 'Nu știam (1)'), h('button', { class: 'btn good', onclick: () => grade(true) }, ic('check'), 'Am știut (2)')); };
    const grade = (ok) => { store.rateCard(c.id, ok, intensive); store.recordAnswer(c.topic || 'carduri', ok); ok ? beep('ok') : beep('bad'); if (ok) store.addXP(1); idx++; flipped = false; if (idx >= queue.length) renderStats(pool(), pool().filter((x) => store.cardDue(x.id))); draw(); };
    area.append(h('div', { class: 'row', style: { marginBottom: '8px' } }, h('span', { class: 'badge mint' }, `${idx + 1} / ${queue.length}`), h('div', { class: 'sp' }), h('span', { class: 'hint' }, `Cutia ${store.cardBox(c.id)}`)), bar((idx / queue.length) * 100), h('div', { style: { marginTop: '16px' } }, cardEl), rate);
    if (flipped) showRate();
  }
  const key = (e) => { if (e.target.tagName === 'INPUT') return; if (e.code === 'Space') { e.preventDefault(); const f = document.querySelector('.flip'); if (f && !f.classList.contains('on')) f.click(); } else if (e.key === '1') document.querySelector('.btn.bad') && document.querySelector('.btn.bad').click(); else if (e.key === '2') document.querySelector('.btn.good') && document.querySelector('.btn.good').click(); };
  document.addEventListener('keydown', key);
  el.append(stats, deckBar, area, h('div', { style: { marginTop: '20px' } }, callout('info', h('b', null, 'Cum funcționează: '), 'dacă știi cardul, trece în cutia următoare (apare după 1, 2, 4, 8, 16 zile). Dacă nu, se întoarce în cutia 0 și apare din nou azi.')));
  mkDeckBar(); build();
  return { el, destroy() { document.removeEventListener('keydown', key); } };
}
