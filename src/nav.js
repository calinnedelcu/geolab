// Meniul + definirea paginilor + indexul de căutare
import { EU_UNITS, RO_UNITS, TERMS, RELIEF_TYPES, GENERAL } from './data/relief.js';
import { ZONES, WINDS, CENTERS, RO_CLIMATE, FACTORS } from './data/clima.js';
import { GLOSSARY, VERIFY } from './data/misc.js';
import { loadAsset } from './core/dom.js';

export const NAV = [
  { items: [{ path: '/', label: 'Acasă', icon: 'home' }, { path: '/test', label: 'Ce intră la test', icon: 'flag' }] },
  { title: 'La test: Reliefuri', items: [
    { path: '/relief-europa', label: 'Relief – Europa', icon: 'globe' },
    { path: '/relief-romania', label: 'Relief – România', icon: 'mountain' },
    { path: '/tipuri-relief', label: 'Tipuri de relief', icon: 'cube' },
    { path: '/comparatie', label: 'Europa vs. România', icon: 'layers' },
  ] },
  { title: 'La test: Clima', items: [
    { path: '/zone-clima', label: 'Zone de climă (hartă)', icon: 'cloud' },
    { path: '/climograf', label: 'Climograf (grafice)', icon: 'chart' },
    { path: '/clima-europa', label: 'Clima Europei (factori, vânturi)', icon: 'wind' },
    { path: '/clima-romania', label: 'Clima României', icon: 'thermo' },
  ] },
  { title: 'La test: Insule, peninsule, mări, golfuri', items: [
    { path: '/insule', label: 'Atlasul Europei (hartă + quiz)', icon: 'anchor' },
  ] },
  { title: 'Învață', items: [
    { path: '/carduri', label: 'Carduri (repetiție)', icon: 'cards' },
    { path: '/quiz', label: 'Quiz', icon: 'help' },
    { path: '/glosar', label: 'Glosar', icon: 'book' },
  ] },
];
export const PAGES = {
  '/': { title: 'Acasă', sub: 'Europa & România', load: () => import('./pages/home.js') },
  '/test': { title: 'Ce intră la test', sub: 'Lista de la profesor + de verificat', load: () => import('./pages/test_info.js') },
  '/relief-europa': { title: 'Relief – Europa', sub: 'Hartă reală de relief · 30 de unități', load: () => import('./pages/relief_europe.js'), stage: true },
  '/relief-romania': { title: 'Relief – România', sub: 'Hartă reală de relief · Carpați, dealuri, câmpii', load: () => import('./pages/relief_romania.js'), stage: true },
  '/tipuri-relief': { title: 'Tipuri de relief', sub: 'Glaciar · carst · vulcanic · eolian · litoral', load: () => import('./pages/tipuri_relief.js') },
  '/comparatie': { title: 'Europa vs. România', sub: 'Fișa generală · cifre · extreme', load: () => import('./pages/comparatie.js') },
  '/zone-clima': { title: 'Zone de climă', sub: 'Hartă · zonele de la test · vânturi', load: () => import('./pages/zone_clima.js'), stage: true },
  '/clima-europa': { title: 'Clima Europei', sub: 'Factori · temperatură · vânturi · cicloni', load: () => import('./pages/clima_europa.js') },
  '/clima-romania': { title: 'Clima României', sub: 'Influențe · Foehn · test', load: () => import('./pages/clima_romania.js') },
  '/climograf': { title: 'Climograf', sub: 'Amplitudine · t medie · fizionomia precipitațiilor', load: () => import('./pages/climograf.js') },
  '/insule': { title: 'Insule, peninsule, mări, golfuri', sub: 'Atlasul Europei – pentru test', load: () => import('./pages/bonus.js'), stage: true },
  '/bonus': { title: 'Insule, peninsule, mări, golfuri', sub: 'Atlasul Europei – pentru test', load: () => import('./pages/bonus.js'), stage: true },
  '/carduri': { title: 'Carduri', sub: 'Repetiție spațiată (Leitner)', load: () => import('./pages/carduri.js') },
  '/quiz': { title: 'Quiz', sub: 'Întrebări din caiete', load: () => import('./pages/quiz.js') },
  '/glosar': { title: 'Glosar', sub: 'Termenii din caiete', load: () => import('./pages/test_info.js').then((m) => ({ default: m.glosar })) },
  '*': { title: 'Acasă', sub: '', load: () => import('./pages/home.js') },
};
export function buildSearchIndex() {
  const out = [];
  Object.entries(PAGES).forEach(([p, m]) => { if (p !== '*') out.push({ title: m.title, text: m.sub, kind: 'Pagină', href: p, icon: 'compass' }); });
  EU_UNITS.forEach((u) => out.push({ title: u.name, text: `${u.kind} · ${u.alt ? u.alt.v + ' m ' + u.alt.where : u.loc || ''}`, kind: 'Europa', href: '/relief-europa?u=' + u.id, icon: 'globe' }));
  RO_UNITS.forEach((u) => out.push({ title: u.name, text: `${u.kind}${u.alt ? ' · ' + u.alt.v + ' m ' + u.alt.where : ''}`, kind: 'România', href: '/relief-romania?u=' + u.id, icon: 'mountain' }));
  ZONES.filter((z) => !z.special).forEach((z) => out.push({ title: `Zona ${z.name}`, text: `${z.lat} · t.m.a ${z.tma} · pp ${z.pp} · ${z.memo || ''}`, kind: 'Climă', href: '/zone-clima?zona=' + z.key, icon: 'cloud' }));
  [...WINDS.permanente, ...WINDS.sezoniere, ...WINDS.locale].forEach((w) => out.push({ title: w.name, text: w.desc, kind: 'Vânt', href: '/clima-europa', icon: 'wind' }));
  CENTERS.forEach((c) => out.push({ title: c.name, text: c.effect, kind: 'Climă', href: '/clima-europa', icon: 'cloud' }));
  RO_CLIMATE.influences.forEach((c) => out.push({ title: c.name, text: c.desc, kind: 'Clima RO', href: '/clima-romania', icon: 'thermo' }));
  Object.values(FACTORS).forEach((f) => f.items.forEach((i) => out.push({ title: i.t, text: `${f.name}: ${i.d}`, kind: 'Climă', href: '/clima-europa', icon: f.icon })));
  RELIEF_TYPES.forEach((t) => out.push({ title: t.name, text: t.caiet.map((x) => x[0]).join(' · '), kind: 'Relief', href: '/tipuri-relief', icon: t.icon }));
  TERMS.forEach((t) => out.push({ title: t.term, text: t.def, kind: 'Termen', href: '/tipuri-relief', icon: 'book' }));
  GLOSSARY.forEach((g) => out.push({ title: g.term, text: g.def, kind: 'Glosar', href: '/glosar', icon: 'book' }));
  VERIFY.forEach((v) => out.push({ title: v.item, text: v.detail, kind: 'De verificat', href: '/test', icon: 'alert' }));
  GENERAL.rows.forEach((r) => out.push({ title: r.label + ' – Europa vs. România', text: `${r.eu.text} | ${r.ro.text}`, kind: 'Cifre', href: '/comparatie', icon: 'layers' }));
  return out;
}
// extinde indexul cu date din fișiere mari (stații meteo, insule/mări) după ce aplicația a pornit
export function extendSearchIndex(add) {
  const go = () => {
    loadAsset('climate').then((a) => add(a.stations.map((s) => ({ title: `${s.name}${s.country ? ' (' + s.country + ')' : ''}`, text: `climograf · ${s.zoneNote || s.zoneId}`, kind: 'Stație meteo', href: '/climograf?st=' + s.id, icon: 'chart' })))).catch(() => {});
    loadAsset('bonus').then((a) => add(a.items.map((x) => ({ title: x.name, text: `${x.cat}${x.country ? ' · ' + x.country : ''}`, kind: 'Insule/mări', href: '/insule', icon: 'anchor' })))).catch(() => {});
  };
  (window.requestIdleCallback || ((f) => setTimeout(f, 1200)))(go);
}
