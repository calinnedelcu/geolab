// =====================================================================
//  RELIEF – conținut din caiete (U = caietul tău, C = caietul colegului, X = completare)
//  Câmpul `src` indică de unde provine informația.
// =====================================================================

export const PERIODS = [
  { id: 'precambrian', name: 'Precambrian', short: 'Precambrian', order: 1, color: '#d9b13b',
    caiet: 'Precambrian → „jos” (cele mai joase altitudini – zone foarte vechi, erodate)',
    orogeny: null, age: 'mai vechi de ≈ 541 milioane de ani',
    explain: 'Cea mai veche perioadă. Aici sunt platformele și scuturile continentale: roci foarte vechi, erodate timp de sute de milioane de ani – de aceea relieful e jos: câmpii și podișuri, doar munți mici.',
    mnemonic: 'P – cel mai vechi, cel mai „jos”' },
  { id: 'caledonic', name: 'Caledonic', short: 'Caledonic', order: 2, color: '#ef6c57',
    caiet: 'Caledonic → orogeneză caledoniană (încrețire)',
    orogeny: 'orogeneza caledoniană', age: '≈ 490–390 milioane de ani',
    explain: 'Primul lanț de munți „încrețiți” din Europa de Nord-Vest. Fiind foarte vechi, sunt erodați, dar în Scandinavia au rămas înalți (și au fost ridicați din nou ulterior).',
    mnemonic: 'C – încrețire caledoniană' },
  { id: 'hercinic', name: 'Hercinic', short: 'Hercinic', order: 3, color: '#4aa3df',
    caiet: 'Hercinic → orogeneză hercinică',
    orogeny: 'orogeneza hercinică', age: '≈ 360–290 milioane de ani',
    explain: 'Munți vechi, rotunjiți, din centrul și vestul Europei (masive, „aliniamente” V–E). Mulți au fost fragmentați și reînălțați mai târziu.',
    mnemonic: 'H – hercinicii sunt „masive” rotunjite' },
  { id: 'alpin', name: 'Alpin', short: 'Alpin', order: 4, color: '#a66bff',
    caiet: 'Alpin → orogeneză alpină',
    orogeny: 'orogeneza alpină', age: '≈ 100 milioane de ani → azi (maxim: 65–20 m.a.)',
    explain: 'Cei mai tineri și mai înalți munți: Alpi, Carpați, Pirinei, Caucaz… În fața lor se află câmpiile și podișurile de sedimentare (Pad, Panonică, Pricernomorică, Pericaspică, Bavariei).',
    mnemonic: 'A – cei mai tineri, cei mai înalți' },
];
export const PERIOD_BY_ID = Object.fromEntries(PERIODS.map((p) => [p.id, p]));
export const PERIOD_MNEMONIC = 'Pentru Cunoaștere Harta Ajută → P · C · H · A (Precambrian · Caledonic · Hercinic · Alpin)';

export const TERMS = [
  { id: 'treapta', term: 'Treaptă de relief', def: 'Suprafață cvasiorizontală situată la o anumită înălțime față de unitățile limitrofe.', src: 'UC' },
  { id: 'unitate', term: 'Unitate de relief', def: 'Sistem relativ omogen din punct de vedere al alcătuirii, structurii și caracteristicilor (munte, deal, podiș, câmpie).', src: 'UC' },
  { id: 'tip', term: 'Tip de relief', def: 'Model pentru o grupare de unități fizico-geografice de dimensiuni variabile.', src: 'UC' },
];

// ---------------------------------------------------------------------
//  EUROPA – cele 30 de unități (numerotarea din caietul colegului; 15–16 lipsesc)
//  Id-urile coincid cu harta 3D.
// ---------------------------------------------------------------------
export const EU_UNITS = [
  { id: 1, key: 'cimpia_europei_est', name: 'Câmpia Europei de Est', kind: 'câmpie', per: 'precambrian', alt: null,
    facts: [['Cea mai întinsă câmpie a Europei – platformă precambriană (jos).', 'UC'], ['Se întinde peste Polonia, Belarus, Ucraina, Rusia europeană.', 'X']], loc: 'Europa de Est (Rusia, Ucraina, Belarus)' },
  { id: 2, key: 'pod_finlandei', name: 'Podișul Finlandei', kind: 'podiș', per: 'precambrian', alt: null,
    facts: [['Parte din Scutul Baltic (precambrian) – lacuri glaciare numeroase.', 'UX']], loc: 'Finlanda' },
  { id: 3, key: 'pod_smaland', name: 'Podișul Småland', kind: 'podiș', per: 'precambrian', alt: null,
    facts: [['Podiș mic din sudul Suediei, tot precambrian.', 'UX']], loc: 'Sudul Suediei' },
  { id: 4, key: 'm_hibini', name: 'Munții Hibini', kind: 'munte', per: 'precambrian', alt: { v: 1191, where: 'vf. maxim' },
    facts: [['Altitudinea maximă: 1191 m.', 'UC'], ['Situați în Laponia, pe Peninsula Kola.', 'UC']], loc: 'Laponia – Peninsula Kola (Rusia)' },
  { id: 5, key: 'm_scandinaviei', name: 'Munții Scandinaviei', kind: 'munte', per: 'caledonic', alt: { v: 2469, where: 'Galdhøpiggen' },
    facts: [['Vf. Galdhøpiggen: 2469 m (în caietul tău e scris 2169 – greșeală de scris; cel corect e 2469).', 'CU'], ['Lanț lung, orientat NE–SV, în Norvegia și Suedia.', 'X']], loc: 'Peninsula Scandinavă (Norvegia, Suedia)',
    verify: 'Galdhøpiggen: 2469 m (colegul) vs 2169 m (caietul tău)' },
  { id: 6, key: 'm_scotiei', name: 'Munții Scoției', kind: 'munte', per: 'caledonic', alt: { v: 1343, where: 'Ben Nevis' },
    facts: [['Vf. Ben Nevis: 1343 m (în caiet; valoarea oficială de azi: 1345 m).', 'CU']], loc: 'Scoția (Marea Britanie)' },
  { id: 7, key: 'm_pennini', name: 'Munții Pennini (nordul)', kind: 'munte', per: 'caledonic', alt: { v: 978, where: '„Mas. Cumberland” (în caiet)' },
    facts: [['În caietul tău apare „Nordul M. Pennini”; colegul: 978 m – Masivul Cumberland.', 'UC']], loc: 'Anglia (nord)',
    verify: '978 m e vf. Scafell Pike (Cumbria, fostul Cumberland); cel mai înalt din Pennini e Cross Fell (893 m).' },
  { id: 8, key: 'm_ural', name: 'Munții Ural', kind: 'munte', per: 'hercinic', alt: { v: 1894, where: 'Narodnaia' },
    facts: [['Vf. Narodnaia: 1894 m.', 'UC'], ['Granița convențională dintre Europa și Asia (limita estică a Europei: 67° long E).', 'UX']], loc: 'Rusia (limita Europa–Asia)' },
  { id: 9, key: 'mas_central_francez', name: 'Masivul Central Francez', kind: 'masiv', per: 'hercinic', alt: null,
    facts: [['Aliniamentul INTERN (V–E) al hercinicilor.', 'UC']], loc: 'Franța (centru)' },
  { id: 10, key: 'm_padurea_neagra', name: 'Munții Pădurea Neagră', kind: 'munte', per: 'hercinic', alt: null,
    facts: [['Aliniamentul INTERN (V–E) al hercinicilor.', 'UC']], loc: 'Germania (sud-vest)' },
  { id: 11, key: 'mas_armorican', name: 'Masivul Armorican', kind: 'masiv', per: 'hercinic', alt: null,
    facts: [['Aliniamentul EXTERN al hercinicilor.', 'C']], loc: 'Franța (Bretania)' },
  { id: 12, key: 'mas_sistos_renan', name: 'Masivul Șistos Renan', kind: 'masiv', per: 'hercinic', alt: null,
    facts: [['Aliniamentul EXTERN al hercinicilor.', 'C']], loc: 'Germania (Valea Rinului) + Belgia (Ardeni)' },
  { id: 13, key: 'm_cantabrici', name: 'Munții Cantabrici', kind: 'munte', per: 'hercinic', alt: { v: 2665, where: 'Picos de Europa' },
    facts: [['2665 m – Picos de Europa (valoare din caiet).', 'UC']], loc: 'Spania (nord)',
    verify: 'Cel mai înalt vârf din Picos de Europa e Torre Cerredo (≈ 2650 m); în caiet: 2665 m.' },
  { id: 14, key: 'm_jura', name: 'Munții Jura', kind: 'munte', per: 'hercinic', alt: { v: 1723, where: 'vf. maxim' }, uncertain: true,
    facts: [['Apare în caietul tău: „M. Jura – 1723 m”, la sfârșitul listei hercinice. Locul exact în listă e neclar (numerele 14–16 lipsesc la coleg).', 'U']], loc: 'Elveția–Franța',
    verify: 'Numerele 14–16 lipsesc la coleg; la tine sunt greu de citit. Jura = 1723 m e scris clar.' },
  { id: 17, key: 'm_pirinei', name: 'Munții Pirinei', kind: 'munte', per: 'alpin', alt: { v: 3404, where: 'Pico de Aneto' },
    facts: [['Pico de Aneto: 3404 m.', 'UC'], ['Granița naturală Franța–Spania.', 'X']], loc: 'Spania–Franța' },
  { id: 18, key: 'm_alpi', name: 'Munții Alpi', kind: 'munte', per: 'alpin', alt: { v: 4810, where: 'Mont Blanc' },
    facts: [['Mont Blanc: 4810 m = vârful cel mai înalt din Europa Occidentală (Elbrus 5642 m e în Caucaz).', 'UC']], loc: 'Franța–Italia–Elveția–Austria' },
  { id: 19, key: 'm_carpati', name: 'Munții Carpați', kind: 'munte', per: 'alpin', alt: { v: 2655, where: 'Gerlachovský (Slovacia)' },
    facts: [['Vf. Gerlachovský: 2655 m (Carpații Slovaciei) – cel mai înalt din Carpați.', 'UC'], ['În România: Orientali, Meridionali, Occidentali.', 'UC']], loc: 'Arc Slovacia–Polonia–Ucraina–România' },
  { id: 20, key: 'm_apenini', name: 'Munții Apenini', kind: 'munte', per: 'alpin', alt: null,
    facts: [['Coloana vertebrală a Peninsulei Italice.', 'X']], loc: 'Italia' },
  { id: 21, key: 'm_dinarici', name: 'Munții Dinarici', kind: 'munte', per: 'alpin', alt: null,
    facts: [['Paralel cu țărmul Mării Adriatice (țărm dalmatic).', 'X']], loc: 'Croația–Bosnia–Muntenegru' },
  { id: 22, key: 'm_pindului', name: 'Munții Pindului', kind: 'munte', per: 'alpin', alt: null,
    facts: [['Coloana Greciei continentale.', 'X']], loc: 'Grecia' },
  { id: 23, key: 'm_balcani', name: 'Munții Balcani', kind: 'munte', per: 'alpin', alt: null,
    facts: [['Bulgaria – dau numele Peninsulei Balcanice.', 'X']], loc: 'Bulgaria' },
  { id: 24, key: 'm_crimeei', name: 'Munții Crimeei', kind: 'munte', per: 'alpin', alt: { v: 1545, where: 'Iaila (Roman-Kosh)' },
    facts: [['1545 m – Iaila.', 'UC']], loc: 'Peninsula Crimeea' },
  { id: 25, key: 'm_caucaz', name: 'Munții Caucaz', kind: 'munte', per: 'alpin', alt: { v: 5642, where: 'Elbrus' },
    facts: [['Elbrus: 5642 m – cel mai înalt vârf (după convenție) al Europei.', 'UC']], loc: 'Între Marea Neagră și Marea Caspică' },
  { id: 26, key: 'cimpia_padului', name: 'Câmpia Padului', kind: 'câmpie', per: 'alpin', alt: null,
    facts: [['Câmpie de aluviuni între Alpi și Apenini, străbătută de râul Pad.', 'UX']], loc: 'Nordul Italiei' },
  { id: 27, key: 'cimpia_panonica', name: 'Câmpia Panonică', kind: 'câmpie', per: 'alpin', alt: null,
    facts: [['În interiorul arcului Carpaților și Alpilor (Ungaria, Serbia, V României).', 'UX']], loc: 'Ungaria + vecini' },
  { id: 28, key: 'cimpia_pricernomorica', name: 'Câmpia Pricernomorică', kind: 'câmpie', per: 'alpin', alt: null,
    facts: [['Câmpia de la nordul Mării Negre („Pri-cerno-morică” = de lângă Marea Neagră).', 'UX']], loc: 'Ucraina (sud)' },
  { id: 29, key: 'cimpia_pericaspica', name: 'Câmpia Pericaspică', kind: 'câmpie', per: 'alpin', alt: { v: -28, where: 'Depresiunea Pericaspică' },
    facts: [['Aici e cea mai joasă cotă a Europei: −28 m (Depresiunea Pericaspică).', 'UC'], ['Și cea mai uscată: ≈ 250 mm precipitații/an.', 'UC']], loc: 'Nordul Mării Caspice' },
  { id: 30, key: 'pod_bavariei', name: 'Podișul Bavariei', kind: 'podiș', per: 'alpin', alt: null,
    facts: [['Podiș la nordul Alpilor.', 'UX']], loc: 'Sudul Germaniei' },
];
export const EU_BY_ID = Object.fromEntries(EU_UNITS.map((u) => [u.id, u]));
export const EU_MISSING = [15, 16];

// Vârfuri-cheie (marcaje 3D) – coordonate aproximative; cotele sunt cele din caiete
export const EU_PEAKS = [
  { name: 'Mont Blanc', alt: 4810, lon: 6.865, lat: 45.833, note: 'cel mai înalt din Europa Occidentală' },
  { name: 'Elbrus', alt: 5642, lon: 42.437, lat: 43.352, note: 'Caucaz – cel mai înalt din Europa' },
  { name: 'Galdhøpiggen', alt: 2469, lon: 8.312, lat: 61.636, note: 'Munții Scandinaviei' },
  { name: 'Ben Nevis', alt: 1343, lon: -5.004, lat: 56.797, note: 'Munții Scoției' },
  { name: 'Narodnaia', alt: 1894, lon: 60.17, lat: 65.03, note: 'Munții Ural' },
  { name: 'Pico de Aneto', alt: 3404, lon: 0.657, lat: 42.631, note: 'Pirinei' },
  { name: 'Picos de Europa', alt: 2665, lon: -4.85, lat: 43.2, note: 'Cantabrici' },
  { name: 'Gerlachovský', alt: 2655, lon: 20.133, lat: 49.164, note: 'Carpați' },
  { name: 'Iaila (Crimeea)', alt: 1545, lon: 34.25, lat: 44.6, note: 'Munții Crimeei' },
  { name: 'Moldoveanu', alt: 2544, lon: 24.738, lat: 45.599, note: 'cel mai înalt din România' },
  { name: 'Munții Hibini', alt: 1191, lon: 33.7, lat: 67.7, note: 'Laponia (Pen. Kola)' },
  { name: 'Mas. Cumberland (Scafell Pike)', alt: 978, lon: -3.212, lat: 54.454, note: 'Pennini (nordul) – poz. aprox.' },
  { name: 'Munții Jura (vf. maxim)', alt: 1723, lon: 5.91, lat: 46.29, note: 'Jura – în caiet doar „vf. maxim”, poz. aprox.' },
  { name: 'Depr. Pericaspică', alt: -28, lon: 47.5, lat: 47.0, note: 'cea mai joasă cotă din Europa' },
];

// ---------------------------------------------------------------------
//  ROMÂNIA – unități (id-urile coincid cu harta 3D a României)
// ---------------------------------------------------------------------
export const RO_GROUPS = {
  carpati: { name: 'Carpații', color: '#e0524d' },
  subcarpati: { name: 'Subcarpații', color: '#f08a2c' },
  podisuri: { name: 'Podișuri, dealuri, depresiune', color: '#e7c340' },
  cimpii: { name: 'Câmpii și Delta', color: '#4fbf6a' },
};
export const RO_UNITS = [
  { id: 1, key: 'c_orientali', name: 'Carpații Orientali', short: 'C. Orientali', kind: 'munți', group: 'carpati', alt: { v: 2303, where: 'Masivul Rodnei (Pietrosul Rodnei)' },
    span: 'De la granița de N a României până la Valea Prahovei', orient: 'NV → SE',
    facts: [['2303 m – Masivul Rodnei.', 'UC'], ['Limite: N – granița României; S – Valea Prahovei.', 'U'],
      ['Orientare NV → SE; „fâșii paralele de roci (toate tipurile)”: vulcanic → șisturi cristaline → fliș (roci sedimentare cutate).', 'UC'],
      ['Relief fragmentat; relief vulcanic; relief glaciar DOAR în grupa nordică.', 'UC']],
    strips: [['Vulcanic', '#e0524d'], ['Șisturi cristaline', '#b66dd1'], ['Fliș (roci sedimentare cutate)', '#5aa9e6']],
    memo: 'Orientali = 3 fâșii paralele NV→SE: vulcanic – cristalin – fliș.' },
  { id: 2, key: 'c_meridionali', name: 'Carpații Meridionali', short: 'C. Meridionali', kind: 'munți', group: 'carpati', alt: { v: 2544, where: 'Vf. Moldoveanu (Făgăraș)' },
    span: 'Valea Prahovei → Culoarul Timiș–Cerna', orient: 'E → V',
    facts: [['2544 m – Vf. Moldoveanu, Munții Făgăraș – cel mai înalt vârf din România.', 'U'], ['Orientare E → V.', 'UC'], ['Domină șisturile cristaline – foarte masivi; roci sedimentare spre periferie.', 'UC'],
      ['Relief glaciar bine dezvoltat (în caiet: „>180” – nu e precizat ce reprezintă cifra).', 'UC'], ['În caiet ai scris „4 grupe”, apoi tăiat – grupele clasice: Bucegi, Făgăraș, Parâng, Retezat–Godeanu.', 'UX']],
    memo: 'Meridionali = cei mai înalți din țară (Moldoveanu 2544 m).' },
  { id: 3, key: 'c_occidentali', name: 'Carpații Occidentali', short: 'C. Occidentali', kind: 'munți', group: 'carpati', alt: { v: 1849, where: 'Masivul Bihor (Cucurbăta Mare)' },
    span: 'Vestul Transilvaniei: Apuseni + Munții Banatului', orient: 'SV → NE',
    facts: [['Masivul Bihor: 1849 m (în caiet se citește 1840/1849 – valoarea corectă: 1849 m).', 'UC'], ['Orientare SV → NE.', 'UC'],
      ['„Mozaic petrografic” – toate tipurile de roci; domină calcarele → relief carstic.', 'UC'], ['Relief carstic bogat: în caiet „>10 K peșteri”.', 'U']],
    memo: 'Occidentali = cei mai joși dintre cei trei, dar cu „mozaic” de roci și multe peșteri.' },
  { id: 4, key: 's_moldovei', name: 'Subcarpații Moldovei', short: 'S. Moldovei', kind: 'dealuri', group: 'subcarpati', alt: { v: 911, where: 'Culmea Pleșu' },
    facts: [['Dealuri formate prin încrețire; 911 m – Culmea Pleșu.', 'UC'], ['Roci sedimentare dure (sare); structură simplă.', 'UC'], ['În profil: o depresiune urmată de un șir de dealuri.', 'UC']],
    profile: ['depr', 'deal'] },
  { id: 5, key: 's_curburii', name: 'Subcarpații Curburii', short: 'S. Curburii', kind: 'dealuri', group: 'subcarpati', alt: { v: 996, where: 'Măgura Odobești' },
    facts: [['Dealuri cutate, din roci sedimentare cutate; structură complexă.', 'UC'], ['996 m – Măgura Odobești.', 'UC'], ['În profil: depresiune – deal – depresiune – deal.', 'C']],
    profile: ['depr', 'deal', 'depr', 'deal'] },
  { id: 6, key: 's_getici', name: 'Subcarpații Getici', short: 'S. Getici', kind: 'dealuri', group: 'subcarpati', alt: { v: 1218, where: 'Dealul Chicioara' },
    facts: [['Prin încrețire; roci sedimentare; 1218 m – Dealul Chicioara.', 'UC'], ['Structură: la coleg „simplă”; la tine „sunt ca ai Curburii” (complexă) – verifică.', 'UC']],
    verify: 'Structura Subcarpaților Getici: simplă (coleg) vs „ca cei ai Curburii” (tu).' },
  { id: 7, key: 'pod_moldovei', name: 'Podișul Moldovei', short: 'Pod. Moldovei', kind: 'podiș', group: 'podisuri', alt: { v: 688, where: 'Dealul Ciungi' },
    facts: [['688 m – Dealul Ciungi.', 'UC'], ['Roci sedimentare necimentate (nisip, pietriș, argile etc.).', 'U'], ['Are ca fundament o platformă precambriană (fundamentul Pod. Moldovei).', 'UC']] },
  { id: 8, key: 'pod_getic', name: 'Podișul Getic', short: 'Pod. Getic', kind: 'podiș', group: 'podisuri', alt: { v: 745, where: 'Plaiul Galben' },
    facts: [['745 m – Plaiul Galben (în caiet).', 'UC']] },
  { id: 9, key: 'pod_mehedinti', name: 'Podișul Mehedinți', short: 'Pod. Mehedinți', kind: 'podiș', group: 'podisuri', alt: { v: 885, where: 'un deal (nume ilizibil în caiet)' }, uncertain: true,
    facts: [['Format prin încrețire; calcaros (relief carstic).', 'U'], ['Altitudine maximă notată: 885 m – numele dealului nu se citește.', 'U']],
    verify: 'Podișul Mehedinți: „885 m – Dl. …” (nume ilizibil).' },
  { id: 10, key: 'dct', name: 'Depresiunea Colinară a Transilvaniei', short: 'D.C.T.', kind: 'depresiune', group: 'podisuri', alt: { v: 1080, where: 'Dealul Bicheș (în caietul colegului)' },
    facts: [['Domuri gazeifere (gaz metan pur – CH₄).', 'UC'], ['Cute diapire (sarea e la suprafață).', 'UC'], ['1080 m – Dl. Bicheș (apare doar în caietul colegului).', 'C']] },
  { id: 11, key: 'd_vest', name: 'Dealurile de Vest', short: 'Dealurile de Vest', kind: 'dealuri', group: 'podisuri', alt: { v: 795, where: 'Culmea Prelucă (în caiet)' },
    facts: [['Formate prin sedimentare.', 'UC'], ['795 m – „Culmea Prelucă” (așa e scris în ambele caiete).', 'UC']] },
  { id: 12, key: 'pod_dobrogei', name: 'Podișul Dobrogei (de Sud)', short: 'Pod. Dobrogei', kind: 'podiș', group: 'podisuri', alt: null,
    facts: [['Cel mai complex podiș din țară (cel mai complex din punct de vedere geologic).', 'UC']] },
  { id: 13, key: 'pod_casimcei', name: 'Podișul Casimcei', short: 'Pod. Casimcei', kind: 'podiș', group: 'podisuri', alt: null, per: 'caledonic',
    facts: [['Șisturile verzi – vechi; în caietul colegului apare la rândul „Caledonic” (B. Pod. Casimcei).', 'C'], ['În caietul tău apare lângă „Precambrian”, alături de fundamentul Pod. Moldovei.', 'U']],
    verify: 'Podișul Casimcei: Precambrian (la tine) sau Caledonic (la coleg).' },
  { id: 14, key: 'dobrogea_nord', name: 'Masivul Dobrogei de Nord (Măcin)', short: 'M. Măcin', kind: 'munți', group: 'podisuri', alt: { v: 467, where: 'Vf. Țuțuiatu' }, per: 'hercinic',
    facts: [['Hercinic: Masivul Dobrogei de Nord – Munții Măcin (467 m – Țuțuiatu).', 'UC'], ['Cei mai vechi și mai joși munți din țară.', 'X']] },
  { id: 15, key: 'cimpia_romana', name: 'Câmpia Română', short: 'Câmpia Română', kind: 'câmpie', group: 'cimpii', alt: { v: 300, where: 'Câmpia Piteștilor' },
    facts: [['300 m – Câmpia Piteștilor.', 'UC']] },
  { id: 16, key: 'cimpia_vest', name: 'Câmpia de Vest', short: 'Câmpia de Vest', kind: 'câmpie', group: 'cimpii', alt: { v: 180, where: 'Câmpia Vingăi' },
    facts: [['180 m – Câmpia Vingăi.', 'UC']] },
  { id: 17, key: 'delta', name: 'Delta Dunării', short: 'Delta Dunării', kind: 'deltă', group: 'cimpii', alt: { v: 12, where: 'Grindul Letea' },
    facts: [['12 m – Grindul Letea.', 'UC'], ['Avansul deltei = una dintre cauzele creșterii suprafeței țării.', 'UC']] },
];
export const RO_BY_ID = Object.fromEntries(RO_UNITS.map((u) => [u.id, u]));
export const RO_OLD = [
  { name: 'Fundamentul Podișului Moldovei', per: 'precambrian', src: 'C', note: 'Platformă precambriană (Platforma Moldovenească) – „fundament” sub Podișul Moldovei.' },
  { name: 'Podișul Casimcei – șisturile verzi', per: 'caledonic', src: 'C', note: 'La coleg: Caledonic (B). La tine: lângă Precambrian.' },
  { name: 'Masivul Dobrogei de Nord – Munții Măcin (467 m – Țuțuiatu)', per: 'hercinic', src: 'UC', note: 'Hercinic.' },
];
export const RO_PEAKS = [
  { name: 'Moldoveanu', alt: 2544, lon: 24.738, lat: 45.599, note: 'Făgăraș – cel mai înalt din România' },
  { name: 'Pietrosul Rodnei', alt: 2303, lon: 24.64, lat: 47.59, note: 'Masivul Rodnei – Carpații Orientali' },
  { name: 'Cucurbăta Mare (Bihor)', alt: 1849, lon: 22.67, lat: 46.44, note: 'Carpații Occidentali' },
  { name: 'Țuțuiatu (Măcin)', alt: 467, lon: 28.17, lat: 45.19, note: 'Dobrogea de Nord – hercinic' },
  { name: 'Măgura Odobești', alt: 996, lon: 27.07, lat: 45.78, note: 'Subcarpații Curburii' },
  { name: 'Dealul Chicioara', alt: 1218, lon: 24.8, lat: 45.2, note: 'Subcarpații Getici (poz. aprox.)' },
  { name: 'Culmea Pleșu', alt: 911, lon: 26.81, lat: 46.81, note: 'Subcarpații Moldovei (poz. aprox.)' },
  { name: 'Dealul Ciungi', alt: 688, lon: 27.68, lat: 46.22, note: 'Podișul Moldovei (poz. aprox.)' },
  { name: 'Plaiul Galben', alt: 745, lon: 24.67, lat: 44.51, note: 'Podișul Getic (poz. aprox.)' },
  { name: 'Deal fără nume în caiet', unnamed: true, alt: 885, lon: 22.87, lat: 44.82, note: 'Podișul Mehedinți (nume ilizibil, poz. aprox.)' },
  { name: 'Dealul Bicheș', alt: 1080, lon: 24.65, lat: 46.19, note: 'Depresiunea Colinară a Transilvaniei (poz. aprox.)' },
  { name: 'Culmea Prelucă', alt: 795, lon: 21.88, lat: 45.87, note: 'Dealurile de Vest (poz. aprox.)' },
  { name: 'Câmpia Piteștilor', alt: 300, lon: 24.3, lat: 44.8, note: 'Câmpia Română (poz. aprox.)' },
  { name: 'Câmpia Vingăi', alt: 180, lon: 21.2, lat: 46.0, note: 'Câmpia de Vest' },
  { name: 'Grindul Letea', alt: 12, lon: 29.5, lat: 45.32, note: 'Delta Dunării' },
];

// ---------------------------------------------------------------------
//  Tipuri de relief (U38(1,2) + L6)
// ---------------------------------------------------------------------
export const RELIEF_TYPES = [
  { id: 'glaciar', name: 'Relief glaciar', icon: 'cube', color: '#7cc7ff',
    caiet: [['De calotă: fiorduri, lacuri glaciare', 'UC'], ['Montan: circuri glaciare, văi glaciare', 'UC']],
    ex: 'Fiorduri: Norvegia. Montan: Alpi, Carpații Meridionali (Făgăraș, Retezat).',
    exSrc: 'X', scene: 'glacial' },
  { id: 'carstic', name: 'Relief carstic', icon: 'droplet', color: '#c9b79c',
    caiet: [['Peșteri, doline, chei', 'UC'], ['Cea mai lungă peșteră din Europa: Hölloch (Elveția)', 'UC'], ['Cea mai lungă peșteră din România: Peștera Vântului (în caietul colegului: „Vântului?”)', 'UC'],
      ['Gips: Optimisticeskaia (Ucraina), Emil Racoviță (Rep. Moldova/Ucraina)', 'UC'], ['Sare: Peștera Mânzălești (jud. Buzău)', 'UC']],
    ex: 'Carstul domină în Carpații Occidentali (calcare).', exSrc: 'UC', scene: 'karst' },
  { id: 'vulcanic', name: 'Relief vulcanic', icon: 'flame', color: '#ff7a45',
    caiet: [['Vulcani activi (Europa) – ex. Etna', 'UC'], ['Vulcani inactivi (România)', 'UC'], ['Lacuri vulcanice', 'UC']],
    ex: 'România: lanțul vulcanic Oaș–Gutâi–Țibleș, Călimani–Gurghiu–Harghita (în vestul Carpaților Orientali).', exSrc: 'X', scene: 'volcano' },
  { id: 'eolian', name: 'Relief eolian', icon: 'wind', color: '#e6c17a',
    caiet: [['Câmpii cu dune', 'UC']], ex: 'Dunele se formează prin acțiunea vântului pe nisipuri.', exSrc: 'X', scene: 'dunes' },
  { id: 'litoral', name: 'Relief litoral', icon: 'anchor', color: '#5ad1c4',
    caiet: [['Țărm cu fiorduri', 'UC'], ['Țărm dalmatic (doar în zona Balcanică)', 'UC'], ['Țărm cu estuare – Sena, Tamisa, Elba', 'UC'], ['Țărm cu delte – Dunăre, Pad, Ron (Rhône), Rin, Tibru', 'UC']],
    ex: '', exSrc: '', scene: 'coast' },
];

// ---------------------------------------------------------------------
//  Fișa generală: Europa vs România
// ---------------------------------------------------------------------
export const GENERAL = {
  rows: [
    { label: 'Suprafață', eu: { v: 10.18, unit: 'mil. km²', dec: 2, text: '≈ 10,18 milioane km²' }, ro: { v: 238397, unit: 'km²', dec: 0, text: '238.397 km²' }, src: 'UC' },
    { label: 'Populație', eu: { v: 740, unit: 'mil. loc.', dec: 0, text: '≈ 740 milioane loc.' }, ro: { v: 19.7, unit: 'mil. loc.', dec: 1, text: '≈ 19,7 milioane loc.' }, src: 'UC' },
    { label: 'Poziție', eu: { text: 'Poziție peninsulară vestică a masei continentale Eurasia' }, ro: { text: '≈ 2,3 % din suprafața continentului' }, src: 'UC' },
    { label: 'Idee-cheie', eu: { text: 'Europa = peninsulă masivă, puternic articulată, cu mări interioare' }, ro: { text: 'România = țară de mărime medie la nivelul continentului european' }, src: 'UC' },
    { label: 'Fus orar', eu: { text: '–' }, ro: { text: 'GMT+2' }, src: 'U' },
    { label: 'Trepte de relief', eu: { text: 'Asimetric – altitudini crescătoare de la câmpie (N) spre lanțuri alpine (S)' }, ro: { text: 'Concentric, proporțional, trepte armonioase (≈ 1/3 munți, 1/3 dealuri și podișuri, 1/3 câmpii)' }, src: 'UC' },
    { label: 'Altitudine maximă', eu: { text: 'Mont Blanc – 4810 m (Elbrus = 5642 m, Caucaz)', v: 4810 }, ro: { text: 'Vf. Moldoveanu – 2544 m (Făgăraș)', v: 2544 }, src: 'UC' },
    { label: 'Altitudine medie', eu: { text: '300 m', v: 300 }, ro: { text: '450 m', v: 450 }, src: 'UC' },
    { label: 'Altitudine minimă', eu: { text: '−28 m (Depresiunea Pericaspică)', v: -28 }, ro: { text: '≈ 5 m (câmpia de lângă… ; țărmul mării = 0 m)', v: 5 }, src: 'UC' },
  ],
  euExtremes: [
    { dir: 'N', name: 'Capul Nordkinn', lat: '71° lat N', country: 'Norvegia', lon: 27.65, latv: 71.13 },
    { dir: 'S', name: 'Punta de Tarifa', lat: '36° lat N', country: 'Spania', lon: -5.61, latv: 36.0 },
    { dir: 'V', name: 'Cabo da Roca', lat: '≈ 9° long V', country: 'Portugalia', lon: -9.5, latv: 38.78 },
    { dir: 'E', name: 'Munții Ural', lat: '67° long E', country: 'Rusia', lon: 67.0, latv: 66.9 },
  ],
  roExtremes: [
    { dir: 'N', name: 'Horodiștea', lat: '48°15′ lat N', county: 'Botoșani', lon: 26.7, latv: 48.255 },
    { dir: 'S', name: 'Zimnicea', lat: '43°37′ lat N', county: 'Teleorman', lon: 25.36, latv: 43.62 },
    { dir: 'V', name: 'Beba Veche', lat: '20°15′ long E', county: 'Timiș', lon: 20.26, latv: 46.13 },
    { dir: 'E', name: 'Sulina', lat: '29°41′ long E', county: 'Tulcea', lon: 29.69, latv: 45.16 },
  ],
  dynamic: {
    grow: ['avansul deltelor (ex.: Delta Dunării)', 'înălțarea tectonică', 'polderele'],
    shrink: ['abraziunea falezelor', 'subsidența', 'creșterea nivelului mării'],
  },
  hostile: {
    eu: ['Tundra arctică – permafrost și noapte polară prelungită', 'Etajul alpin-nival – vânturi violente, viscole, ger și pante stâncoase abrupte'],
    ro: ['Crestele alpine – vânturi intense, soluri scheletice', 'Mlaștinile și grindurile – iz. hidrologic (?) și soluri saline'],
  },
  stepsReal: { munti: 31, deal: 36, cimpii: 33, src: 'INSSE – „România în cifre”' },
};
