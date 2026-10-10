import './styles/index.css';
import { h, $, clear } from './core/dom.js';
import { icon } from './core/icons.js';
import * as store from './core/store.js';
import * as router from './core/router.js';
import { ic, openPalette, setSearchIndex } from './core/ui.js';
import { NAV, PAGES, buildSearchIndex, extendSearchIndex } from './nav.js';

store.load();
function applyTheme(t) {
  const theme = t || (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  document.documentElement.dataset.theme = theme; return theme;
}
let theme = applyTheme(store.get().theme);

// ---------- cadru ----------
const sidebar = h('aside', { class: 'sidebar', id: 'sidebar' });
const view = h('main', { class: 'view', id: 'view' });
const crumb = h('div', { class: 'crumb' });
const xpChip = h('button', { class: 'btn small ghost', title: 'Progres', onclick: () => router.go('/') });
const themeBtn = h('button', { class: 'btn icon small ghost', title: 'Temă luminoasă/întunecată', onclick: () => {
  theme = theme === 'dark' ? 'light' : 'dark'; store.update((s) => { s.theme = theme; }); applyTheme(theme); themeBtn.innerHTML = icon(theme === 'dark' ? 'sun' : 'moon');
} }, h('span', { html: icon(theme === 'dark' ? 'sun' : 'moon') }));
const topbar = h('header', { class: 'topbar' },
  h('button', { class: 'btn icon small ghost', 'aria-label': 'Meniu', title: 'Restrânge / extinde meniul', onclick: () => { if (window.innerWidth <= 900) document.body.classList.toggle('nav-open'); else { const c = document.body.classList.toggle('nav-collapsed'); store.update((s) => { s.settings.navCollapsed = c; s.settings.navTouched = true; }); } } }, ic('menu')),
  crumb, h('div', { class: 'spacer' }),
  h('button', { class: 'search-btn', onclick: () => openPalette((p) => router.go(p.replace(/^#/, ''))) }, ic('search'), h('span', null, 'Caută în tot site-ul…'), h('kbd', null, '⌘K')),
  xpChip, themeBtn);
document.getElementById('app').append(sidebar, h('div', { class: 'main' }, topbar, view));

function renderSidebar(active) {
  clear(sidebar);
  sidebar.append(h('a', { class: 'brand', href: '#/' }, h('div', { class: 'brand-logo' }, ic('globe')), h('div', null, h('div', { class: 'brand-name' }, 'GeoLab'), h('div', { class: 'brand-sub' }, 'Europa & România'))));
  NAV.forEach((g) => {
    if (g.title) sidebar.append(h('div', { class: 'nav-title' }, g.title));
    const nav = h('nav', { class: 'nav' });
    g.items.forEach((it) => nav.append(h('a', { href: '#' + it.path, 'data-label': it.label, class: it.path === active ? 'active' : '', onclick: () => document.body.classList.remove('nav-open') }, ic(it.icon), h('span', { class: 'nl' }, it.label), it.tag ? h('span', { class: `tag ${it.tag === 'NOU' ? 'new' : ''}` }, it.tag) : null)));
    sidebar.append(nav);
  });
  sidebar.append(h('div', { class: 'sidebar-foot' }, 'Făcut din notițele tale și ale colegului. ', h('br'), 'Verifică mereu cu atlasul și cu profesorul.'));
}
function renderXP() {
  const s = store.get(); const li = store.levelInfo(s.xp);
  xpChip.replaceChildren(h('span', { style: { color: 'var(--warm)', display: 'inline-flex', width: '16px' }, html: icon('flame') }), h('span', { class: 'xp-days' }, `${s.streak.days} zile`), h('span', { class: 'xp-dot', style: { opacity: .4 } }, '•'), h('b', { class: 'xp-lvl' }, `Nivel ${li.lvl}`), h('span', { class: 'hint xp-xp' }, `${s.xp} XP`));
}
store.subscribe(renderXP); renderXP();

// ---------- router ----------
let current = null;
let token = 0;
async function show(r) {
  const my = ++token;
  if (current && current.destroy) { try { current.destroy(); } catch (e) { console.error(e); } }
  current = null; clear(view); view.scrollTo(0, 0);
  const meta = PAGES[r.path] || PAGES['*'];
  renderSidebar(PAGES[r.path] ? r.path : '/');
  crumb.replaceChildren(meta.title, meta.sub ? h('small', null, meta.sub) : null);
  document.title = `${meta.title} · GeoLab`;
  view.classList.toggle('stage-view', !!meta.stage);
  { const st = store.get().settings; const auto = meta.stage && window.innerWidth < 1560 && window.innerWidth > 900 && !st.navTouched; document.body.classList.toggle('nav-collapsed', window.innerWidth > 900 && (st.navTouched ? !!st.navCollapsed : !!auto)); }
  view.append(h('div', { class: 'loader' }, h('div', { class: 'spinner' })));
  try {
    const mod = await meta.load();
    const inst = await (mod.default || mod)({ params: r.params });
    if (my !== token) { inst && inst.destroy && inst.destroy(); return; }
    clear(view); view.append(inst.el); current = inst; store.visit(r.path);
  } catch (e) {
    console.error(e);
    if (my === token) { clear(view); view.append(h('div', { class: 'page' }, h('h2', null, 'Ceva nu a mers'), h('p', null, String(e && e.message || e)))); }
  }
}
Object.keys(PAGES).forEach((p) => router.route(p, null));
router.start(show);
let SI = buildSearchIndex(); setSearchIndex(SI); extendSearchIndex((arr) => { SI = SI.concat(arr); setSearchIndex(SI); });
document.addEventListener('keydown', (e) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openPalette((p) => router.go(p.replace(/^#/, ''))); } });
window.__geolab = { store, router };
