// Stare + progres (salvate local, în browser). Totul e protejat dacă localStorage nu e disponibil.
const KEY = 'geolab.v1';
const DEFAULT = () => ({
  xp: 0,
  streak: { days: 0, last: null },
  theme: null,
  discovered: {},      // { 'eu:17': ts, 'ro:3': ts }
  stats: {},           // { topic: { seen, correct } }
  leitner: {},         // { cardId: { box, due, seen } }
  badges: {},
  quizHistory: [],     // ultimele rezultate
  climo: { solved: 0, correct: 0 },
  visited: {},         // pagini vizitate
  settings: { sound: true, motion: true },
});
let state = DEFAULT();
const subs = new Set();
let ls = null;
try { ls = window.localStorage; ls.getItem('x'); } catch { ls = null; }

export function load() {
  try {
    const raw = ls && ls.getItem(KEY);
    if (raw) state = { ...DEFAULT(), ...JSON.parse(raw) };
  } catch { state = DEFAULT(); }
  touchStreak();
}
function save() { try { ls && ls.setItem(KEY, JSON.stringify(state)); } catch { /* ignorăm */ } }
export const get = () => state;
export function update(fn) { fn(state); save(); subs.forEach((f) => f(state)); }
export function subscribe(fn) { subs.add(fn); return () => subs.delete(fn); }
export function reset() { state = DEFAULT(); save(); subs.forEach((f) => f(state)); }

const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
function touchStreak() {
  const today = dayKey();
  const s = state.streak;
  if (s.last === today) return;
  const y = new Date(); y.setDate(y.getDate() - 1);
  s.days = s.last === dayKey(y) ? s.days + 1 : 1;
  s.last = today; save();
}

export const levelOf = (xp) => Math.floor(Math.sqrt(xp / 60)) + 1;
export const xpForLevel = (lvl) => Math.round(60 * (lvl - 1) ** 2);
export function levelInfo(xp = state.xp) {
  const lvl = levelOf(xp); const a = xpForLevel(lvl), b = xpForLevel(lvl + 1);
  return { lvl, into: xp - a, need: b - a, pct: Math.min(100, ((xp - a) / (b - a)) * 100) };
}

let toastFn = null;
export function setToast(fn) { toastFn = fn; }
export function addXP(n, why) {
  const before = levelOf(state.xp);
  update((s) => { s.xp += n; });
  const after = levelOf(state.xp);
  if (toastFn) {
    if (after > before) toastFn({ icon: 'trophy', title: `Nivel ${after}!`, text: 'Ai urcat un nivel – continuă tot așa!' });
    else if (why) toastFn({ icon: 'bolt', title: `+${n} XP`, text: why });
  }
}
export function discover(kind, id, xp = 8) {
  const k = `${kind}:${id}`;
  if (state.discovered[k]) return false;
  update((s) => { s.discovered[k] = Date.now(); });
  addXP(xp, 'Ai descoperit un element nou');
  checkBadges();
  return true;
}
export const discoveredCount = (kind) => Object.keys(state.discovered).filter((k) => k.startsWith(kind + ':')).length;

export function recordAnswer(topic, correct) {
  update((s) => {
    const t = (s.stats[topic] = s.stats[topic] || { seen: 0, correct: 0 });
    t.seen++; if (correct) t.correct++;
  });
}
export function mastery(topic) {
  const t = state.stats[topic]; if (!t || !t.seen) return null;
  return t.correct / t.seen;
}
export function visit(page) { if (!state.visited[page]) update((s) => { s.visited[page] = Date.now(); }); }

// ---------- Insigne ----------
export const BADGES = [
  { id: 'first', name: 'Primul pas', desc: 'Ai răspuns la prima întrebare', test: (s) => Object.values(s.stats).some((t) => t.seen > 0), icon: 'flag' },
  { id: 'q50', name: 'Antrenat', desc: '50 de întrebări rezolvate', test: (s) => Object.values(s.stats).reduce((a, t) => a + t.seen, 0) >= 50, icon: 'bolt' },
  { id: 'q200', name: 'Mașină de geografie', desc: '200 de întrebări rezolvate', test: (s) => Object.values(s.stats).reduce((a, t) => a + t.seen, 0) >= 200, icon: 'trophy' },
  { id: 'eu10', name: 'Explorator european', desc: 'Ai descoperit 10 unități de relief ale Europei', test: (s) => Object.keys(s.discovered).filter((k) => k.startsWith('eu:')).length >= 10, icon: 'compass' },
  { id: 'eu30', name: 'Cartograf al Europei', desc: 'Ai descoperit toate unitățile Europei', test: (s) => Object.keys(s.discovered).filter((k) => k.startsWith('eu:')).length >= 28, icon: 'globe' },
  { id: 'ro10', name: 'Drumeț prin Carpați', desc: 'Ai descoperit 10 unități de relief ale României', test: (s) => Object.keys(s.discovered).filter((k) => k.startsWith('ro:')).length >= 10, icon: 'mountain' },
  { id: 'ro17', name: 'Cartograf al României', desc: 'Ai descoperit toate unitățile României', test: (s) => Object.keys(s.discovered).filter((k) => k.startsWith('ro:')).length >= 17, icon: 'map' },
  { id: 'zone9', name: 'Meteorolog', desc: 'Ai deschis toate cele 9 zone de climă', test: (s) => Object.keys(s.discovered).filter((k) => k.startsWith('zone:')).length >= 9, icon: 'cloud' },
  { id: 'climo10', name: 'Climatolog', desc: '10 climografe rezolvate corect', test: (s) => s.climo.correct >= 10, icon: 'chart' },
  { id: 'streak3', name: 'Constanță', desc: '3 zile la rând', test: (s) => s.streak.days >= 3, icon: 'flame' },
];
export function checkBadges() {
  const earned = [];
  update((s) => { for (const b of BADGES) if (!s.badges[b.id] && b.test(s)) { s.badges[b.id] = Date.now(); earned.push(b); } });
  if (toastFn) earned.forEach((b) => toastFn({ icon: b.icon, title: `Insignă: ${b.name}`, text: b.desc }));
}

// ---------- Leitner (carduri) ----------
const BOX_DAYS = [0, 1, 2, 4, 8, 16];
export function cardDue(id) { const c = state.leitner[id]; return !c || c.due <= Date.now(); }
export function cardBox(id) { return (state.leitner[id] && state.leitner[id].box) || 0; }
export function rateCard(id, ok, intensive = false) {
  update((s) => {
    const c = (s.leitner[id] = s.leitner[id] || { box: 0, due: 0, seen: 0 });
    c.seen++;
    c.box = ok ? Math.min(5, c.box + 1) : 0;
    const days = intensive ? [0, 0.01, 0.04, 0.12, 0.3, 1][c.box] : BOX_DAYS[c.box];
    c.due = Date.now() + days * 86400000;
  });
}
