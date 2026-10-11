// Carduri de memorare + banca de întrebări (generate din datele din caiete)
import { CORE } from './core_items.js';
import { EU_UNITS, RO_UNITS, PERIODS, PERIOD_BY_ID, GENERAL, RELIEF_TYPES, TERMS, EU_PEAKS, RO_PEAKS } from './relief.js';
import { ZONES, MAIN_ZONES, FACTORS, WINDS, CENTERS, RO_CLIMATE, TEMPS, PRECIP, LAPSE, TEST_SHAPES } from './clima.js';

const alt = (a) => (a ? `${a.v < 0 ? '−' : ''}${Math.abs(a.v)} m (${a.where})` : null);

export function buildCards() {
  const C = [];
  const add = (id, deck, q, a, extra = {}) => C.push({ id, deck, q, a, ...extra });

  // ---- Relief Europa
  EU_UNITS.forEach((u) => {
    const p = PERIOD_BY_ID[u.per];
    add(`eu-per-${u.id}`, 'Relief Europa', `În ce perioadă geologică s-a format: ${u.name}?`, `${p.name}${p.orogeny ? ' – ' + p.orogeny : ''}`, { tag: `#${u.id}`, topic: 'relief-europe' });
    if (u.alt) add(`eu-alt-${u.id}`, 'Relief Europa', `Care este altitudinea maximă notată pentru ${u.name}?`, alt(u.alt), { tag: `#${u.id}`, topic: 'relief-europe' });
  });
  PERIODS.forEach((p) => {
    const names = EU_UNITS.filter((u) => u.per === p.id).map((u) => u.name);
    add(`eu-list-${p.id}`, 'Relief Europa', `Enumeră unitățile ${p.name.toLowerCase()}e din Europa (din caiet).`, names.join(' · '), { topic: 'relief-europe' });
  });
  add('eu-order', 'Relief Europa', 'Ordinea celor 4 perioade geologice, de la cea mai veche la cea mai tânără:', 'Precambrian → Caledonic → Hercinic → Alpin', { topic: 'relief-europe' });
  add('eu-hercinic-intern', 'Relief Europa', 'Hercinic: aliniamentul INTERN (V–E):', 'Masivul Central Francez · M. Pădurea Neagră', { topic: 'relief-europe' });
  add('eu-hercinic-extern', 'Relief Europa', 'Hercinic: aliniamentul EXTERN:', 'Masivul Armorican · Masivul Șistos Renan', { topic: 'relief-europe' });

  // ---- Relief România
  RO_UNITS.forEach((u) => {
    if (u.alt) add(`ro-alt-${u.id}`, 'Relief România', `Altitudinea maximă și vârful: ${u.name}`, alt(u.alt), { tag: `#${u.id}`, topic: 'relief-romania' });
  });
  add('ro-orient', 'Relief România', 'Carpații Orientali – orientare și fâșii de roci:', 'NV → SE; vulcanic · șisturi cristaline · fliș (roci sedimentare cutate). Relief glaciar doar în grupa N.', { topic: 'relief-romania' });
  add('ro-merid', 'Relief România', 'Carpații Meridionali – orientare, roci, relief:', 'E → V; șisturi cristaline (foarte masivi), roci sedimentare spre periferie; relief glaciar.', { topic: 'relief-romania' });
  add('ro-occid', 'Relief România', 'Carpații Occidentali – orientare, roci, relief:', 'SV → NE; „mozaic petrografic”; domină calcarele → relief carstic (peșteri). Masivul Bihor 1849 m.', { topic: 'relief-romania' });
  add('ro-sc-mold', 'Relief România', 'Subcarpații Moldovei – ce știi?', 'Dealuri prin încrețire; roci sedimentare dure (sare); structură simplă; 911 m – Culmea Pleșu.', { topic: 'relief-romania' });
  add('ro-sc-curb', 'Relief România', 'Subcarpații Curburii – ce știi?', 'Dealuri cutate; roci sedimentare cutate; structură complexă; 996 m – Măgura Odobești.', { topic: 'relief-romania' });
  add('ro-sc-get', 'Relief România', 'Subcarpații Getici – ce știi?', 'Prin încrețire; roci sedimentare; 1218 m – Dealul Chicioara.', { topic: 'relief-romania' });
  add('ro-dct', 'Relief România', 'D.C.T. – ce are special?', 'Domuri gazeifere (gaz metan pur) și cute diapire (sarea e la suprafață). 1080 m – Dl. Bicheș (coleg).', { topic: 'relief-romania' });
  add('ro-dob', 'Relief România', 'Podișul Dobrogei – ce îl face special?', 'Este cel mai complex podiș din țară (cel mai complex geologic).', { topic: 'relief-romania' });
  add('ro-trepte', 'Relief România', 'Trepte de relief în România:', 'Concentric, proporțional, armonios: ≈ 1/3 munți, 1/3 dealuri și podișuri, 1/3 câmpii (INSSE: 31 / 36 / 33 %).', { topic: 'relief-romania' });
  add('ro-extreme', 'Relief România', 'Extremele României (N, S, V, E):', 'N – Horodiștea (48°15′, Botoșani) · S – Zimnicea (43°37′, Teleorman) · V – Beba Veche (20°15′, Timiș) · E – Sulina (29°41′, Tulcea)', { topic: 'relief-romania' });
  add('eu-extreme', 'Relief Europa', 'Extremele Europei (N, S, V, E):', 'N – Capul Nordkinn (71° N, Norvegia) · S – Punta de Tarifa (36° N, Spania) · V – Cabo da Roca (≈ 9° V, Portugalia) · E – Munții Ural (67° E)', { topic: 'relief-europe' });
  add('gen-cote', 'Relief Europa', 'Altitudini: maximă / medie / minimă – Europa vs. România', 'Europa: Mont Blanc 4810 m (Elbrus 5642 m) / 300 m / −28 m (Pericaspica). România: Moldoveanu 2544 m / 450 m / ≈ 5 m (țărmul 0 m).', { topic: 'relief-europe' });
  add('gen-supr', 'Relief Europa', 'Suprafață și populație: Europa vs. România', 'Europa ≈ 10,18 mil. km², ≈ 740 mil. loc. • România 238.397 km², ≈ 19,7 mil. loc. (≈ 2,3 % din continent). Fus orar: GMT+2.', { topic: 'relief-europe' });
  add('gen-dinam', 'Relief Europa', 'Suprafața e dinamică: ce o face să crească / să scadă?', 'Crește: avansul deltelor (Delta Dunării), înălțarea tectonică, polderele. Scade: abraziunea falezelor, subsidența, creșterea nivelului mării.', { topic: 'relief-europe' });
  add('gen-ostile', 'Relief Europa', 'Medii geografice ostile (Europa / România):', 'EU: tundra arctică (permafrost, noapte polară) • etajul alpin-nival (vânturi, viscole, pante abrupte). RO: crestele alpine (vânturi, soluri scheletice) • mlaștinile și grindurile.', { topic: 'relief-europe' });

  // ---- Tipuri de relief
  RELIEF_TYPES.forEach((t) => add(`rt-${t.id}`, 'Tipuri de relief', `${t.name}: ce trebuie să știi?`, t.caiet.map((x) => x[0]).join(' • '), { topic: 'relief-tipuri' }));
  TERMS.forEach((t) => add(`term-${t.id}`, 'Tipuri de relief', `Definește: ${t.term}`, t.def, { topic: 'relief-tipuri' }));
  add('rt-lung-eu', 'Tipuri de relief', 'Cea mai lungă peșteră din Europa / din România:', 'Europa – Hölloch (Elveția) • România – Peștera Vântului', { topic: 'relief-tipuri' });
  add('rt-litoral', 'Tipuri de relief', 'Tipuri de țărm și exemple:', 'fiorduri · țărm dalmatic (Balcani) · cu estuare (Sena, Tamisa, Elba) · cu delte (Dunăre, Pad, Ron, Rin, Tibru)', { topic: 'relief-tipuri' });

  // ---- Zone de climă
  MAIN_ZONES.forEach((z) => {
    const ex = { topic: 'zone-clima', extra: !z.test };
    add(`z-lat-${z.id}`, 'Zone de climă', `${z.name}: între ce latitudini?`, z.lat, ex);
    add(`z-tma-${z.id}`, 'Zone de climă', `${z.name}: t.m.a și precipitații?`, `${z.tma} · ${z.pp}`, ex);
    add(`z-veg-${z.id}`, 'Zone de climă', `${z.name}: vegetație și sol?`, `${z.veg.join(' • ')} — sol: ${z.soil}`, ex);
    add(`z-where-${z.id}`, 'Zone de climă', `${z.name}: unde se găsește?`, z.where.join(' • '), ex);
    if (z.memo) add(`z-memo-${z.id}`, 'Zone de climă', `${z.name}: formula scurtă din fișă`, z.memo, ex);
  });
  TEST_SHAPES.forEach((t) => {
    add(`fz-${t.key}`, 'Fizionomia pp. pe grafice', `Cum arată climograful pentru: ${t.title}?`, `Precipitații: ${t.fiz} Temperaturi: ${t.temp}`, { topic: 'climograf' });
    add(`fzq-${t.key}`, 'Fizionomia pp. pe grafice', `Indiciu rapid pentru: ${t.title}`, t.clue, { topic: 'climograf' });
  });
  add('z-germ', 'Zone de climă', 'Ce țară face trecerea dintre temperat oceanic și temperat continental?', 'Germania', { topic: 'zone-clima' });
  add('z-grupe', 'Zone de climă', 'Zonele de climă de la test:', 'Temperat: mediteraneană, temperat oceanic, temperat continental (trecere oceanic → continental: Germania) • Rece: subpolar', { topic: 'zone-clima' });
  add('z-grupe-extra', 'Zone de climă', 'Toate cele 9 zone, pe grupe (extra):', 'Caldă: ecuatorială, subecuatorială, tropical uscat, tropical umed • Temperată: mediteraneană, temperat oceanic, temperat continental • Rece: subpolar, polar', { topic: 'zone-clima', extra: true });

  // ---- Clima Europei / României
  add('c-rad', 'Clima Europei', 'Radiația solară: valori pe zone', '140–160 kcal/cm² (S) • 80–140 (temperată) • sub 80 (rece). Bilanțul radiativ scade S→N.', { topic: 'clima' });
  add('c-vant-perm', 'Clima Europei', 'Vânturile permanente (toate cele 3):', 'De vest (instabil, furtuni, pp abundente) • alizee (sud, vara) • polare / de est (rece, sărac în pp)', { topic: 'clima' });
  add('c-vant-sez', 'Clima Europei', 'Vânturi sezoniere și locale:', 'Sezoniere: brizele montane și litorale. Locale: Mistralul (Franța), Crivățul/Suhoveiul, Austrul, Bora, Foehn-ul (Alpi).', { topic: 'clima' });
  add('c-cent', 'Clima Europei', 'Cei 4 cicloni/anticicloni de deasupra Europei:', 'Anticiclonul Siberiei (senin) · Anticiclonul Azorelor (umed, senin) · Ciclonul Islandez · Ciclonul Mediteranean', { topic: 'clima' });
  add('c-temp', 'Clima Europei', 'Temperaturi: T.M.A., ianuarie, iulie (sud → nord)', 'T.M.A. +18 → −4 °C • ianuarie +10 → −20 °C • iulie 25 → 15 °C', { topic: 'clima' });
  add('c-pp', 'Clima Europei', 'Precipitațiile în Europa:', 'V 1000–1400 mm/an → E 400–500 mm/an; minim Câmpia Pericaspică ≈ 250 mm/an; cresc cu altitudinea.', { topic: 'clima' });
  add('c-pp-ro', 'Clima României', 'Precipitațiile în România după altitudine:', 'peste 2000 m: 1000–1200 • 1000–2000 m: 600–1000 • sub 1000 m: sub 600 mm/an. Minim: Delta Dunării (< 300 mm/an).', { topic: 'clima' });
  add('c-lapse', 'Clima Europei', 'Regula altitudinii (relief):', `temperatura scade cu ${LAPSE.tPer100m} °C la 100 m; precipitațiile cresc cu 100 mm la 100 m.`, { topic: 'clima' });
  add('c-fiz', 'Clima Europei', 'Factorii fizico-geografici ai climei:', 'poziția geografică · hidrografia (moderează t°) · vegetația (la fel) · relieful (altitudine, pantă, orientare)', { topic: 'clima' });
  add('c-ro', 'Clima României', 'Tipul de climă și cele 6 influențe:', 'Temperat-continentală. V – vest-oceanice • N – scandinavo-baltice • NE/E – polare + est-europene (crivăț) • E – pontică • S/SV – submediteraneene (austrul).', { topic: 'clima' });
  add('c-foehn', 'Clima României', 'Foehn-ul din România:', 'Carpații Meridionali – Munții Făgăraș, reversantul nordic către D.C.T.: aer cald, la sfârșitul iernii produce dezghețul.', { topic: 'clima' });
  add('c-west', 'Clima României', 'Țările din V Europei / din C Europei – ce climă au?', 'V Europei – temperat oceanic • C Europei – temperat continental', { topic: 'clima' });
  add('c-ampl', 'Fizionomia pp. pe grafice', 'Cum calculezi amplitudinea termică și temperatura medie (din grafic)?', 'Amplitudine = temperatura maximă lunară − temperatura minimă lunară. Temperatura medie anuală = suma celor 12 medii lunare ÷ 12. Precipitații anuale = suma lunilor.', { topic: 'climograf' });
  return C;
}

// ---------------- Banca de întrebări cu variante ----------------
const shuf = (a) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const pickN = (arr, n, not) => shuf(arr.filter((x) => x !== not)).slice(0, n);

export function questionPool() {
  const Q = [];
  const mc = (topic, q, a, wrong, why) => Q.push({ topic, q, a, opts: shuf([a, ...pickN([...new Set(wrong)], 3, a)]), why });
  // Relief Europa
  const eu = EU_UNITS;
  eu.forEach((u) => {
    const p = PERIOD_BY_ID[u.per];
    mc('relief-europe', `„${u.name}” aparține perioadei:`, p.name, PERIODS.map((x) => x.name), `${u.name}: ${p.name}.`);
    if (u.alt) mc('relief-europe', `Altitudinea maximă din caiet pentru ${u.name} este:`, `${Math.abs(u.alt.v)} m`.replace(/^/, u.alt.v < 0 ? '−' : ''), eu.filter((x) => x.alt && x !== u).map((x) => `${x.alt.v < 0 ? '−' : ''}${Math.abs(x.alt.v)} m`), `${u.name}: ${u.alt.v} m (${u.alt.where}).`);
  });
  EU_PEAKS.filter((p) => p.alt > 0).forEach((p) => mc('relief-europe', `Vârful ${p.name} (${p.alt} m) se află în:`, p.note.includes('–') ? p.note.split('–')[0].trim() : p.note, ['Pirinei', 'Alpi', 'Carpați', 'Caucaz', 'Munții Ural', 'Munții Scandinaviei'], `${p.name} – ${p.note}.`));
  // Vârfuri: dat vârful, alege altitudinea (variante apropiate ca ordin de mărime)
  const peakAlt = (list, topic) => list.filter((p) => p.alt > 0 && !p.unnamed).forEach((p) => {
    const near = new Set(); [0.9, 0.8, 1.12, 1.25, 0.7, 1.4].forEach((f) => { const v = Math.round((p.alt * f) / 10) * 10 + (p.alt % 10 ? 4 : 0); if (v !== p.alt && v > 0) near.add(v); }); list.forEach((x) => { if (x !== p && x.alt > 0 && Math.abs(x.alt - p.alt) < p.alt * 0.45) near.add(x.alt); });
    mc(topic, `Care este altitudinea (cota maximă) pentru ${p.name} (${p.note})?`, `${p.alt} m`, [...near].map((v) => `${v} m`), `${p.name}: ${p.alt} m.`);
  });
  peakAlt(EU_PEAKS, 'relief-europe'); peakAlt(RO_PEAKS, 'relief-romania');
  mc('relief-europe', 'Cea mai joasă cotă din Europa se află în:', 'Depresiunea Pericaspică (−28 m)', ['Delta Dunării', 'Câmpia Padului', 'Câmpia Panonică', 'Țările de Jos'], 'Pericaspica: −28 m.');
  mc('relief-europe', 'Altitudinea maximă a Europei (după caiet, cu Caucazul) este:', 'Elbrus – 5642 m', ['Mont Blanc – 4810 m', 'Moldoveanu – 2544 m', 'Galdhøpiggen – 2469 m'], 'Elbrus 5642 m (Caucaz); Mont Blanc 4810 m.');
  mc('relief-europe', 'Fusul orar al României este:', 'GMT+2', ['GMT+1', 'GMT+3', 'GMT'], 'GMT+2.');
  mc('relief-europe', 'Suprafața României este de:', '238.397 km²', ['230.340 km²', '248.100 km²', '312.700 km²'], '238.397 km².');
  mc('relief-europe', 'Care e punctul cel mai nordic al României?', 'Horodiștea (Botoșani)', ['Sulina (Tulcea)', 'Zimnicea (Teleorman)', 'Beba Veche (Timiș)'], 'N – Horodiștea.');
  mc('relief-europe', 'Care e punctul cel mai estic al României?', 'Sulina (Tulcea)', ['Horodiștea (Botoșani)', 'Zimnicea (Teleorman)', 'Beba Veche (Timiș)'], 'E – Sulina.');
  mc('relief-europe', 'Care e punctul cel mai sudic al României?', 'Zimnicea (Teleorman)', ['Horodiștea (Botoșani)', 'Sulina (Tulcea)', 'Beba Veche (Timiș)'], 'S – Zimnicea.');
  mc('relief-europe', 'Care e punctul cel mai vestic al României?', 'Beba Veche (Timiș)', ['Horodiștea (Botoșani)', 'Sulina (Tulcea)', 'Zimnicea (Teleorman)'], 'V – Beba Veche.');
  mc('relief-europe', 'Capul Nordkinn (71° N) este punctul cel mai … al Europei:', 'nordic (Norvegia)', ['sudic (Spania)', 'vestic (Portugalia)', 'estic (Rusia)'], 'N – Nordkinn.');
  mc('relief-europe', 'Punta de Tarifa (36° N) este punctul cel mai … al Europei:', 'sudic (Spania)', ['nordic (Norvegia)', 'vestic (Portugalia)', 'estic (Rusia)'], 'S – Tarifa.');
  mc('relief-europe', 'Cabo da Roca este punctul cel mai … al Europei:', 'vestic (Portugalia)', ['nordic (Norvegia)', 'sudic (Spania)', 'estic (Rusia)'], 'V – Cabo da Roca.');
  mc('relief-europe', 'Altitudinea medie a României este:', '450 m', ['300 m', '600 m', '250 m'], 'RO: 450 m; Europa: 300 m.');
  mc('relief-europe', 'Care dintre acestea face SĂ SCADĂ suprafața unei țări?', 'abraziunea falezelor', ['avansul deltelor', 'polderele', 'înălțarea tectonică'], 'Scade: abraziunea, subsidența, creșterea nivelului mării.');
  mc('relief-europe', 'Care dintre acestea face SĂ CREASCĂ suprafața unei țări?', 'avansul deltelor', ['abraziunea falezelor', 'subsidența', 'creșterea nivelului mării'], 'Crește: delte, înălțare tectonică, polderi.');
  // Relief România
  RO_UNITS.filter((u) => u.alt).forEach((u) => mc('relief-romania', `Altitudinea maximă notată pentru ${u.name}:`, `${u.alt.v} m – ${u.alt.where.replace(/ \(.*/, '')}`, RO_UNITS.filter((x) => x.alt && x !== u).map((x) => `${x.alt.v} m – ${x.alt.where.replace(/ \(.*/, '')}`), `${u.name}: ${u.alt.v} m – ${u.alt.where}.`));
  mc('relief-romania', 'Orientarea Carpaților Orientali este:', 'NV → SE', ['E → V', 'SV → NE', 'N → S'], 'Orientali: NV→SE.');
  mc('relief-romania', 'Orientarea Carpaților Meridionali este:', 'E → V', ['NV → SE', 'SV → NE', 'N → S'], 'Meridionali: E→V.');
  mc('relief-romania', 'Orientarea Carpaților Occidentali este:', 'SV → NE', ['NV → SE', 'E → V', 'N → S'], 'Occidentali: SV→NE.');
  mc('relief-romania', 'Ce roci domină în Carpații Meridionali?', 'șisturile cristaline', ['calcarele', 'rocile vulcanice', 'rocile sedimentare cutate'], 'Meridionali: cristalin.');
  mc('relief-romania', 'Ce domină în Carpații Occidentali și ce relief generează?', 'calcarele → relief carstic', ['șisturile cristaline → relief glaciar', 'rocile vulcanice → relief vulcanic', 'flișul → relief eolian'], 'Occidentali: calcare → carst.');
  mc('relief-romania', 'Relieful glaciar la Carpații Orientali apare:', 'doar în grupa nordică', ['în toată unitatea', 'doar în grupa sudică', 'nu apare'], 'Orientali: glaciar doar în grupa N.');
  mc('relief-romania', 'Cel mai complex podiș din țară este:', 'Podișul Dobrogei', ['Podișul Moldovei', 'Podișul Getic', 'Podișul Mehedinți'], 'Dobrogea – cel mai complex.');
  mc('relief-romania', 'Domurile gazeifere (gaz metan) se află în:', 'Depresiunea Colinară a Transilvaniei', ['Podișul Getic', 'Subcarpații Curburii', 'Podișul Dobrogei'], 'D.C.T.: domuri gazeifere, cute diapire.');
  mc('relief-romania', 'Structura Subcarpaților Curburii este:', 'complexă (dealuri cutate)', ['simplă', 'orizontală', 'vulcanică'], 'S. Curburii – cutate, structură complexă.');
  mc('relief-romania', 'Structura Subcarpaților Moldovei este:', 'simplă', ['complexă', 'carstică', 'vulcanică'], 'S. Moldovei – structură simplă.');
  mc('relief-romania', 'Cea mai lungă peșteră din România este:', 'Peștera Vântului', ['Peștera Mânzălești', 'Hölloch', 'Emil Racoviță'], 'RO – Vântului (Hölloch e în Elveția).');
  mc('relief-romania', 'Peștera Mânzălești (jud. Buzău) este o peșteră în:', 'sare', ['gips', 'calcar', 'bazalt'], 'Mânzălești – sare.');
  mc('relief-romania', 'Optimisticeskaia (Ucraina) este o peșteră în:', 'gips', ['sare', 'calcar', 'bazalt'], 'Gips: Optimisticeskaia, Emil Racoviță.');
  mc('relief-romania', 'Cea mai lungă peșteră din Europa (după caiet):', 'Hölloch (Elveția)', ['Peștera Vântului', 'Mânzălești', 'Optimisticeskaia'], 'Hölloch – Elveția.');
  mc('relief-romania', 'Ce proporție au (aprox.) munții, dealurile/podișurile și câmpiile în România?', '≈ o treime fiecare (31 / 36 / 33 %)', ['50 / 30 / 20 %', '10 / 30 / 60 %', '70 / 20 / 10 %'], 'Proporțional, armonios.');
  mc('relief-romania', 'Masivul Dobrogei de Nord (M. Măcin) este un relief:', 'hercinic', ['alpin', 'caledonic', 'precambrian'], 'Măcin – hercinic.');
  // Zone de climă
  MAIN_ZONES.forEach((z) => {
    const pool = z.test ? MAIN_ZONES.filter((x) => x.test) : MAIN_ZONES; const n0 = Q.length;
    mc('zone-clima', `Care zonă are t.m.a. ${z.tma}?`, z.name, pool.map((x) => x.name), `${z.name}: ${z.tma}.`);
    mc('zone-clima', `Precipitațiile de ${z.pp} sunt tipice pentru:`, z.name, pool.map((x) => x.name), `${z.name}: ${z.pp}.`);
    mc('zone-clima', `${z.name} se află între latitudinile:`, z.lat, pool.map((x) => x.lat), `${z.name}: ${z.lat}.`);
    mc('zone-clima', `Vegetația „${z.veg[0].slice(0, 70)}” aparține zonei:`, z.name, pool.map((x) => x.name), `${z.name}.`);
    mc('zone-clima', `Solul „${z.soil.slice(0, 60)}” este specific zonei:`, z.name, pool.map((x) => x.name), `${z.name}.`);
    if (!z.test) for (let i = n0; i < Q.length; i++) Q[i].extra = true;
  });
  TEST_SHAPES.filter((t) => t.key !== 'tranzitie').forEach((t) => {
    const others = TEST_SHAPES.filter((x) => x.key !== t.key && x.key !== 'tranzitie').map((x) => x.title);
    mc('climograf', `Pe grafic: ${t.fiz.replace(/\.$/, '')}. Ce zonă este?`, t.title, others, `${t.title}: ${t.fiz} ${t.temp}`);
    mc('climograf', `Indiciu: „${t.clue}” → zona:`, t.title, others, `${t.title}.`);
  });
  mc('zone-clima', 'Solul „terra rossa” este tipic pentru:', 'Mediteraneană', ['Temperat oceanic', 'Subpolar', 'Ecuatorială'], 'Mediteraneană – terra rossa.');
  mc('zone-clima', 'Ce țară face trecerea între climatul temperat oceanic și cel continental?', 'Germania', ['Franța', 'Polonia', 'Austria'], 'Germania.');
  mc('zone-clima', 'Care zonă NU permite formarea solurilor?', 'Polar', ['Subpolar', 'Tropical uscat', 'Ecuatorială'], 'Polar – nu se formează soluri.');
  mc('zone-clima', 'Selvas = pădurea din zona:', 'Ecuatorială (Amazonia)', ['Subecuatorială', 'Mediteraneană', 'Subpolară'], 'Selvas – ecuatorială.');
  mc('zone-clima', 'Llanos și savana aparțin zonei:', 'Subecuatorială', ['Ecuatorială', 'Tropical uscat', 'Polar'], 'Subecuatorială.');
  mc('zone-clima', 'Taiga se întâlnește în zona:', 'Temperat continental („rece”)', ['Mediteraneană', 'Ecuatorială', 'Tropical uscat'], 'Taiga – continental rece.');
  mc('zone-clima', 'Amplitudine termică zilnică uriașă (zi 50–60 °C, noapte ≤ 15 °C):', 'Tropical uscat', ['Ecuatorială', 'Polar', 'Temperat oceanic'], 'Tropical uscat.');
  // Climă
  mc('clima', 'Cu cât scade temperatura la fiecare 100 m altitudine?', '0,6 °C', ['0,2 °C', '1 °C', '1,5 °C'], '0,6 °C / 100 m.');
  mc('clima', 'Câtă precipitație în plus se înregistrează la 100 m altitudine (caiet)?', '100 mm', ['10 mm', '50 mm', '500 mm'], '100 mm / 100 m.');
  mc('clima', 'Vânturile de vest aduc în Europa:', 'vreme instabilă, furtuni, precipitații abundente', ['vreme rece și uscată', 'ger și viscol', 'vară secetoasă'], 'De vest – instabil, ploi.');
  mc('clima', 'Vânturile polare (de est) aduc:', 'vreme rece, săracă în precipitații', ['ploi abundente', 'vreme caldă', 'furtuni frecvente'], 'Polare – rece, secetos.');
  mc('clima', 'Alizeele se resimt în Europa:', 'în sud, vara', ['în nord, iarna', 'în vest, tot anul', 'în est, primăvara'], 'Alizee – sud, vara.');
  mc('clima', 'Care anticiclon aduce vreme senină iarna, cu ger?', 'Anticiclonul Siberiei', ['Anticiclonul Azorelor', 'Ciclonul Islandez', 'Ciclonul Mediteranean'], 'Siberian – senin.');
  mc('clima', 'Cum se numește vântul local din Franța?', 'Mistralul', ['Crivățul', 'Bora', 'Austrul'], 'Mistral – Franța.');
  mc('clima', 'Crivățul este numit și:', 'Suhovei', ['Mistral', 'Foehn', 'Bora'], 'Crivăț / Suhovei.');
  mc('clima', 'Foehn-ul din Alpi este un vânt:', 'cald și uscat', ['rece și umed', 'rece și uscat', 'cald și umed'], 'Foehn – cald.');
  mc('clima', 'Minimul de precipitații din Europa este în:', 'Câmpia Pericaspică (250 mm/an)', ['Delta Dunării', 'Câmpia Padului', 'Podișul Bavariei'], 'Pericaspica 250 mm.');
  mc('clima', 'Minimul de precipitații din România este în:', 'Delta Dunării (< 300 mm/an)', ['Câmpia Română', 'Podișul Moldovei', 'Carpații Orientali'], 'Delta Dunării.');
  mc('clima', 'Precipitațiile la peste 2000 m în România:', '1000–1200 mm/an', ['sub 600 mm/an', '600–1000 mm/an', '2000 mm/an'], 'Peste 2000 m: 1000–1200.');
  mc('clima', 'Precipitațiile la sub 1000 m în România:', 'sub 600 mm/an', ['1000–1200 mm/an', '600–1000 mm/an', '1500 mm/an'], 'Sub 1000 m: sub 600.');
  mc('clima', 'T.M.A. în sudul Europei (zona sud-mediteraneană):', '+18 °C', ['+10 °C', '+25 °C', '−4 °C'], 'T.M.A. +18 (S), −4 (N).');
  mc('clima', 'T.M.A. în nordul Europei (zona nord-subpolară):', '−4 °C', ['+18 °C', '0 °C', '−20 °C'], 'T.M.A. −4 (N).');
  mc('clima', 'Temperatura medie în ianuarie în nord:', '−20 °C', ['−4 °C', '+10 °C', '−10 °C'], 'Ian: +10 (S), −20 (N).');
  mc('clima', 'Foehn-ul din România bate pe:', 'reversantul nordic al Munților Făgăraș', ['versantul sudic al Carpaților Orientali', 'litoral', 'Delta Dunării'], 'Făgăraș – spre D.C.T.');
  mc('clima', 'Austrul este un vânt din:', 'sudul / sud-vestul României', ['nord', 'est', 'vest'], 'Austru – influențe submediteraneene.');
  mc('clima', 'Influențele scandinavo-baltice vin din:', 'nord', ['sud', 'est', 'vest'], 'Scandinavo-baltice – N.');
  mc('clima', 'România are un climat:', 'temperat-continental', ['temperat oceanic', 'mediteranean', 'subpolar'], 'Temperat-continental.');
  mc('clima', 'Amplitudinea termică anuală se calculează:', 'temperatura maximă lunară − temperatura minimă lunară', ['suma temperaturilor ÷ 12', 'suma precipitațiilor', 'temperatura din iulie × 2'], 'Max − min.');
  mc('clima', 'Hidrografia și vegetația, în raport cu temperatura:', 'o moderează (o reglează)', ['o cresc mult', 'o scad mult', 'nu au efect'], 'Moderează.');
  return Q;
}


// ---------------- Insule, peninsule, mări, golfuri (din datele atlasului) ----------------
const CAT1 = { ocean: 'ocean', insula: 'insulă', peninsula: 'peninsulă', mare: 'mare', golf: 'golf', stramtoare: 'strâmtoare / canal' };
const txt = (v) => (Array.isArray(v) ? v.join(', ') : v);
export function buildBonusCards(items) {
  const C = [];
  items.filter((x) => CORE.has(x.id)).forEach((x) => {
    const where = [x.belongsTo && `în/la ${txt(x.belongsTo)}`, x.country && `țara: ${txt(x.country)}`].filter(Boolean).join(' · ');
    if (x.cat === 'stramtoare') C.push({ id: `ins-${x.id}`, deck: 'Insule, peninsule, mări, golfuri', q: `${x.name}: ce leagă?`, a: x.connects && x.connects.length ? x.connects.join(' ↔ ') + (x.country ? ` (${txt(x.country)})` : '') : (where || CAT1[x.cat]), topic: 'insule-mari', tag: CAT1[x.cat] });
    else C.push({ id: `ins-${x.id}`, deck: 'Insule, peninsule, mări, golfuri', q: `${x.name}: ce este și unde se află?`, a: `${CAT1[x.cat]}${where ? ' – ' + where : ''}${x.facts && x.facts[0] ? ' • ' + x.facts[0] : ''}`, topic: 'insule-mari', tag: CAT1[x.cat] });
  });
  return C;
}
export function bonusQuestions(items) {
  const Q = []; const base = items.filter((x) => CORE.has(x.id)); const mc = (q, a, wrong, why) => Q.push({ topic: 'insule-mari', q, a, opts: shuf([a, ...pickN([...new Set(wrong.filter(Boolean))], 3, a)]), why });
  base.forEach((x) => {
    const where = txt(x.country || x.belongsTo); if (where) mc(`${x.name} – unde se află / cui aparține?`, where, base.filter((y) => y.cat === x.cat).map((y) => txt(y.country || y.belongsTo)), `${x.name}: ${where}.`);
    if (x.cat === 'stramtoare' && x.connects && x.connects.length >= 2) mc(`Ce leagă ${x.name}?`, x.connects.join(' ↔ '), base.filter((y) => y.connects && y.connects.length >= 2).map((y) => y.connects.join(' ↔ ')), `${x.name}: ${x.connects.join(' ↔ ')}.`);
  });
  return Q;
}
