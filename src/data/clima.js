// =====================================================================
//  CLIMA – conținut din fișele colorate (F) și din caiete (U = tu, C = coleg)
// =====================================================================

export const ZONE_GROUPS = {
  temperata: { name: 'Climă temperată', color: '#34a853' },
  rece: { name: 'Climă rece', color: '#4aa3df' },
  calda: { name: 'Climă caldă', color: '#ef6b45' },
};

// id numeric = valoarea din harta globului (world_zones.png)
export const ZONES = [
  { id: 1, key: 'ecuatoriala', name: 'Ecuatorială', group: 'calda', color: '#d63a4a', lat: '0–5° lat N și S', latMin: 0, latMax: 5,
    where: ['America de Sud – Câmpia Amazoniană', 'Africa – Bazinul Congo', 'Asia – Arhipelagul Indonezian'],
    tma: '25–28 °C', tmaR: [25, 28], pp: '2000–4000 mm/an', ppR: [2000, 4000],
    winds: 'calmele ecuatoriale',
    soil: 'lateritice – bine formate, dar nefertile',
    veg: ['Foarte bogată în specii (+3000), pădure etajată, multe specii de palmieri (de cocos, cafea, cacao, pâine, cauciuc), liane', 'Se numește „selvas” – Pădurea Amazoniană'],
    memo: 'TEMP. MARI • PLOUĂ MULT', shape: 'Temperatură ridicată și aproape constantă tot anul; precipitații abundente în toate lunile (două maxime ușoare).',
    seasons: 'Fără anotimpuri termice – ploaie tot anul.' },
  { id: 2, key: 'subecuatoriala', name: 'Subecuatorială', group: 'calda', color: '#f0883e', lat: '5–15° lat N și S', latMin: 5, latMax: 15,
    where: ['America de Sud – Podișul Brazilei, Podișul Guyanelor', 'Africa – bazinul Congo, parțial Madagascar', 'Asia – foarte puțin: peninsula Indiană'],
    tma: '22–25 °C', tmaR: [22, 25], pp: '1000–2000 mm/an', ppR: [1000, 2000],
    winds: 'alizee (sezonul umed) / calmele ecuatoriale (sezonul uscat) – așa e scris pe fișă',
    soil: 'lateritice, roșii de savană',
    veg: ['Formațiuni ierboase foarte rezistente, tipice: iarba elefantului, palmierul de savană, baobab, acacia', 'Africa – savană (spre Ecuator se transformă în PĂDURI-PARC)', 'America de Sud – Llanos (Podișul Guyanelor) → se transformă în PĂDURI-GALERII'],
    memo: 'Un sezon cald și umed + unul cald și uscat', shape: 'Două anotimpuri: sezon ploios (vara locală) și sezon uscat – barele de precipitații cad aproape la zero într-o parte a anului.',
    seasons: 'Sezon cald și umed / sezon cald și uscat.',
    verify: 'Pe fișă: „cald și umed – se extind alizeele din zona ecuatorială; cald și uscat – se resimt calmele ecuatoriale” – în realitate invers (umed = calmele/ZCIT, uscat = alizeele). Păstrează varianta de pe fișă la test, dar întreabă profesorul.' },
  { id: 3, key: 'tropical_uscat', name: 'Tropical uscat', group: 'calda', color: '#e6c15a', lat: '15–30° lat N și S', latMin: 15, latMax: 30,
    where: ['Africa – Pod. Congo(?), Pod. Kalahari', 'America de Sud – P. Atacama, Salar de Uyuni', 'Asia – Pen. Arabă, Pod. Thar', 'Australia – P. Gibson, P. Marelui Deșert de Nisip, P. Victoriei', 'America de Nord – Pod. Mexican, Sonora–Mojave'],
    tma: '15–16 °C (cum e pe fișă)', tmaR: [15, 16], pp: '300 și < 300 mm/an', ppR: [0, 300],
    winds: 'alizee', soil: 'calcisoluri',
    veg: ['Formațiuni ierboase foarte rezistente la uscăciune: cactuși, agave, curmali, oaze (Africa)', 'America – arbuști țepoși (caatinga), pelin', 'Australia – scrub'],
    memo: 'PLOUĂ PUȚIN • TEMP. MEDII', shape: 'Aproape fără precipitații (bare minuscule); amplitudine zilnică uriașă: ziua 50–60 °C, noaptea ≤ 15 °C.',
    seasons: 'Uscat tot anul; „discrepanțe foarte mari” între zi și noapte.',
    verify: 'Temperatura medie anuală scrisă pe fișă (15–16 °C) pare mică față de realitate (deșerturile tropicale au adesea 20–30 °C). Folosește valoarea de pe fișă la test.' },
  { id: 4, key: 'tropical_umed', name: 'Tropical umed (musonic)', group: 'calda', color: '#26b5a2', lat: '15–30° lat N și S', latMin: 15, latMax: 30,
    where: ['Asia de S și SE (Câmpia Chinei de Est, Câmpia Manciuriei)', 'Parțial Japonia și Australia', 'SE Africii, E Madagascarului', 'E Braziliei, E Mexicului, America Centrală, Peninsula Florida'],
    tma: '15–18 °C (cum e pe fișă)', tmaR: [15, 18], pp: '3000–4000 mm/an și peste', ppR: [3000, 4000],
    winds: 'alizee (musoni)', soil: 'argiluvisoluri',
    veg: ['Se aseamănă cu pădurile ecuatoriale ca abundență', 'Elemente prețioase în pământ'],
    memo: 'FRIG (față de ecuatorial) • PLOUĂ MULT', shape: 'Maxim puternic de precipitații vara (musonul), iarna aproape uscat.',
    seasons: 'Un maxim foarte puternic de ploi în sezonul musonic.' },
  { id: 5, key: 'mediteraneana', test: true, name: 'Mediteraneană (subtropicală)', group: 'temperata', color: '#aad662', lat: '30–40° lat N și S', latMin: 30, latMax: 40,
    where: ['În jurul Mării Mediterane', 'Peninsula California', 'Chile centrală', 'Africa de Sud', 'Australia de S/SE', 'Japonia de S'],
    tma: '15–20 °C', tmaR: [15, 20], pp: '800–1000 mm/an', ppR: [800, 1000],
    winds: 'alizee → vară caldă și secetoasă • vânturi de vest → iarnă blândă și ploioasă', soil: 'terra rossa',
    veg: ['M. Mediterană: stejar veșnic verde / de plută, pin de Alep, măslin sălbatic, garigă, frigană', 'America de Nord / Japonia: stejar negru/verde, magnolie, palmier pitic, pin de tămâie (?), chaparral', 'Chile: bambus, fag austral'],
    memo: 'VARĂ USCATĂ • IARNĂ PLOIOASĂ', shape: 'Barele de precipitații sunt mari iarna și aproape lipsesc vara; temperaturi blânde iarna, calde vara.',
    seasons: 'Vară caldă și secetoasă / iarnă blândă și ploioasă.' },
  { id: 6, key: 'temperat_oceanic', test: true, name: 'Temperat oceanic', group: 'temperata', color: '#34a853', lat: '40–60/66° lat N și S', latMin: 40, latMax: 60,
    where: ['America – M. Cordilieri de V, M. Anzi de V', 'Vestul Europei', 'Asia – în E se aseamănă cu regiunea temperat-oceanică + musoni ⇒ temperat oceanic musonic'],
    tma: '10–15 °C', tmaR: [10, 15], pp: '1000–1200 mm/an (în Asia: 1200–3000)', ppR: [1000, 1200],
    winds: 'de vest; musoni', soil: 'cambisol',
    veg: ['Păduri de foioase – carpen, ulm, tei', 'În Groenlanda nu există păduri de foioase'],
    memo: 'PLOUĂ TOT ANUL • VARĂ RĂCOROASĂ', shape: 'Precipitații repartizate aproape uniform pe tot anul; amplitudine termică mică.',
    seasons: 'Vară umedă și răcoroasă / iarnă blândă și ploioasă.' },
  { id: 7, key: 'temperat_continental', test: true, name: 'Temperat continental', group: 'temperata', color: '#6a9f46', lat: '40–60° lat N, în interiorul continentelor', latMin: 40, latMax: 60,
    where: ['Semiaridă: interiorul Americii de N, America de S (Anzi), Europa – Câmpia Europei de Est, Asia Centrală, Siberia de V, Pod. Gobi', 'Aridă: N Mării Caspice', '„Rece”: N Canadei, N Siberiei'],
    tma: '5–10 °C', tmaR: [5, 10], pp: '500–800 mm/an', ppR: [500, 800],
    winds: 'de est', soil: 'molisoluri – fertile (stepă) • spodosol (taiga)',
    veg: ['Semiaridă: stepă, prerie, pampas, puna', '„Rece”: taiga (păduri de conifere/rășinoase), molid, brad, sequoia, tsuga'],
    memo: 'IERNI GEROASE • VERI CALDE-SECETOASE',
    shape: 'Amplitudine termică mare (ierni geroase, veri calde); precipitații moderate, cu maxim vara.',
    seasons: 'Ierni geroase / veri calde și secetoase. România: semiarid (40–50° N); „rece” (50–60° N).',
    sub: 'Cifre de pe fișă: 7–8 °C = semiarid • 5–6 °C = „rece” • 9–10 °C = arid.' },
  { id: 8, key: 'subpolar', test: true, name: 'Subpolar', group: 'rece', color: '#4ea4e0', lat: '60/66–70° lat N și S', latMin: 60, latMax: 70,
    where: ['Insulele din nord: Groenlanda de N, Novaia Zemlea de N, Severnaia Zemlea, Canada de N, Franz Josef (F. Rusă) de N'],
    tma: '0–5 °C', tmaR: [0, 5], pp: '300–500 mm/an', ppR: [300, 500],
    winds: 'vânturi puternice (adaptare la frig + vânt)', soil: 'stratificate: molisol / pergelisol (permafrost, „merzlotă”)',
    veg: ['Tundră (adaptată la frig + vânt)'],
    memo: 'VARĂ SCURTĂ • IARNĂ LUNGĂ', shape: 'Vară scurtă (2–3 luni) răcoroasă; iarnă lungă și geroasă; precipitații puține.',
    seasons: 'Vară scurtă-răcoroasă (2–3 luni) / iarnă lungă-geroasă.' },
  { id: 9, key: 'polar', name: 'Polar', group: 'rece', color: '#c3b0ee', lat: '70°–poli, lat N și S', latMin: 70, latMax: 90,
    where: ['Antarctica și Groenlanda – cea mai aspră – influențate de calotele polare'],
    tma: 'sub 0 °C', tmaR: [-60, 0], pp: 'sub 100 mm/an (sub formă solidă)', ppR: [0, 100],
    winds: 'polare – puternice', soil: 'NU se formează soluri!',
    veg: ['Tundră (cum e notat pe fișă) – practic fără vegetație'],
    memo: 'CEA MAI FRIGUROASĂ • FĂRĂ SOLURI', shape: 'Temperaturi negative aproape tot anul; precipitații foarte puține (zăpadă).',
    seasons: 'Frig extrem tot anul.' },
  { id: 10, key: 'tranzitie', test: true, name: 'Tranziție oceanic → continental (Germania)', group: 'temperata', color: '#46994a', lat: '≈ 47–55° lat N', latMin: 47, latMax: 55, special: true,
    where: ['Germania face trecerea dintre temperat oceanic și temperat continental'],
    tma: 'nu e dat în caiet', tmaR: null, pp: 'nu e dat în caiet', ppR: null,
    winds: 'de vest / de est', soil: '–', veg: ['Păduri de foioase și amestec'],
    memo: 'Germania = trecerea oceanic → continental', shape: 'Intermediar: ploi tot anul (ca la oceanic) dar cu ierni mai reci (ca la continental).', seasons: '' },
];
// latitudinea pe scurt, pentru liste și legende („40–60/66°”, „≈47–55°”)
export const latShort = (z) => z.lat.replace(/,?\s+lat\b.*$/, '').replace(/^≈\s*/, '≈');
export const ZONE_BY_ID = Object.fromEntries(ZONES.map((z) => [z.id, z]));
export const ZONE_BY_KEY = Object.fromEntries(ZONES.map((z) => [z.key, z]));
export const MAIN_ZONES = ZONES.filter((z) => !z.special);
// Zonele de la test (din „Test” scris în caiet): temperat + rece → subpolar; mediteranean, temperat oceanic, temperat continental; trecere oc → cont. (Germania)
export const TEST_ZONES = MAIN_ZONES.filter((z) => z.test);

// ---------------------------------------------------------------------
//  Factorii genetici ai climei (K1–K2, U38(3,5))
// ---------------------------------------------------------------------
export const FACTORS = {
  radiativi: {
    name: 'Factori radiativi', icon: 'sun', color: '#ffb454',
    items: [
      { t: 'Radiația solară', d: '140–160 kcal/cm² în sud • 80–140 kcal/cm² în zona temperată • sub 80 kcal/cm² în zona rece.', src: 'UC' },
      { t: 'Bilanțul radiativ', d: 'scade de la S spre N (în Europa și România).', src: 'UC' },
    ],
  },
  dinamici: {
    name: 'Factori dinamici', icon: 'wind', color: '#67b7ff',
    items: [
      { t: 'Vânturile de vest', d: 'vreme instabilă, furtuni frecvente, precipitații abundente.', src: 'UC' },
      { t: 'Alizeele', d: 'se resimt în sud, vara.', src: 'UC' },
      { t: 'Vânturile polare (de est)', d: 'vreme rece, săracă în precipitații.', src: 'UC' },
      { t: 'Ciclonii și anticiclonii', d: 'Deasupra Europei sunt permanent 2 cicloni și 2 anticicloni: Anticiclonul Siberiei (senin), Anticiclonul Azorelor (umed, senin), Ciclonul Islandez, Ciclonul Mediteranean.', src: 'UC' },
    ],
  },
  fizico: {
    name: 'Factori fizico-geografici', icon: 'mountain', color: '#5be0a1',
    items: [
      { t: 'Poziția geografică', d: '', src: 'UC' },
      { t: 'Hidrografia', d: 'reglează / moderează temperatura.', src: 'UC' },
      { t: 'Vegetația', d: 'reglează temperatura (la fel ca hidrografia).', src: 'UC' },
      { t: 'Relieful', d: 'altitudine: temperatura scade cu 0,6 °C la 100 m, precipitațiile cresc cu 100 mm la 100 m. Contează și panta și orientarea (expoziția).', src: 'UC' },
    ],
  },
};
export const LAPSE = { tPer100m: 0.6, ppPer100m: 100 };

// ---------------------------------------------------------------------
//  Elementele climei – Europa și România
// ---------------------------------------------------------------------
export const TEMPS = {
  tma: { south: 18, north: -4, label: 'T.M.A. (temperatura medie anuală)', southName: 'sud (zona sud-mediteraneană)', northName: 'nord (zona nord-subpolară)' },
  ian: { south: 10, north: -20, label: 't medie ianuarie' },
  iul: { south: 25, north: 15, label: 't medie iulie' },
};
export const PRECIP = {
  west: '1000–1400 mm/an (V)', east: '400–500 mm/an (E)', min: { v: 250, where: 'Câmpia Pericaspică' }, minRO: { v: 300, where: 'Delta Dunării (sub 300 mm/an)' },
  ro: [['peste 2000 m', '1000–1200 mm/an'], ['1000–2000 m', '600–1000 mm/an'], ['sub 1000 m', 'sub 600 mm/an']],
};

export const WINDS = {
  permanente: [
    { id: 'vest', name: 'Vânturile de vest', dir: 'V → E', desc: 'Zona temperată (vreme instabilă, furtuni, precipitații abundente).', src: 'UC', color: '#67b7ff' },
    { id: 'alizee', name: 'Alizee', dir: 'NE → SW', desc: 'Se resimt în sudul Europei – vara; uscate (Mediterana).', src: 'UC', color: '#ffb454' },
    { id: 'polare', name: 'Vânturi polare (de est)', dir: 'NE → SW', desc: 'În nord; reci și uscate.', src: 'UC', color: '#b6a3ff' },
  ],
  sezoniere: [
    { id: 'briza_montana', name: 'Briza montană', desc: 'Ziua urcă spre munte, noaptea coboară în vale (și invers la litoral).', src: 'UC' },
    { id: 'briza_litorala', name: 'Briza litorală', desc: 'Ziua dinspre mare spre uscat, noaptea invers.', src: 'U' },
  ],
  locale: [
    { id: 'mistral', name: 'Mistralul', where: 'Franța', lon: 4.6, lat: 43.7, desc: 'Vânt rece și puternic în valea Ronului (Franța).', src: 'UC', color: '#67b7ff' },
    { id: 'crivat', name: 'Crivățul (Suhoveiul)', where: 'E României / E Europei', lon: 27.3, lat: 46.4, desc: 'Vânt rece din est/nord-est, cu viscole iarna.', src: 'UC', color: '#b6a3ff' },
    { id: 'austru', name: 'Austrul', where: 'țărmul dalmatic – Balcani (în caietul colegului)', lon: 22.8, lat: 44.7, desc: 'În România: vânt cald și uscat din sud-vest. În caietul colegului e notat „țărmul dalmatic – Balcani”.', src: 'C', color: '#ffb454',
      verify: 'Austrul = vânt din SV în sudul României; „țărmul dalmatic” se potrivește mai degrabă cu Bora.' },
    { id: 'bora', name: 'Bora', where: 'Dalmația (Coasta de Aur?)', lon: 15.2, lat: 44.4, desc: 'Vânt rece, puternic, care coboară de pe munți spre Marea Adriatică.', src: 'C', color: '#5eead4',
      verify: '„Coasta de Aur” – probabil „Coasta de Azur” (de fapt, unde bate Mistralul).' },
    { id: 'foehn', name: 'Foehn-ul', where: 'Munții Alpi (și Făgăraș în România)', lon: 10.5, lat: 46.9, desc: 'Vânt cald și uscat care coboară pe versantul adăpostit al munților.', src: 'UC', color: '#ff7a45' },
  ],
};

export const CENTERS = [
  { id: 'anticiclon_siberian', name: 'Anticiclonul Siberiei', type: 'anticiclon', lon: 85, lat: 52, effect: 'senin (iarna – ger și aer uscat)', src: 'UC', color: '#c3b0ee' },
  { id: 'anticiclon_azoric', name: 'Anticiclonul Azorelor', type: 'anticiclon', lon: -28, lat: 37, effect: 'umed, senin', src: 'UC', color: '#ffb454' },
  { id: 'ciclon_islandez', name: 'Ciclonul Islandez', type: 'ciclon', lon: -22, lat: 64, effect: 'înnorat, ploaie', src: 'UC', color: '#67b7ff' },
  { id: 'ciclon_mediteranean', name: 'Ciclonul Mediteranean', type: 'ciclon', lon: 14, lat: 40, effect: 'ploi (mai ales iarna)', src: 'UC', color: '#5eead4' },
];
export const CENTER_NOTE = {
  caiet: [
    ['Anticicloni – masă de aer; ciclon – înnorat – ploaie. Condiția: „da” – de deasupra oceanului; „nu” – de deasupra continentului.', 'U'],
    ['Ciclon = masă de aer → aer uscat (de deasupra continentului); anticiclon = → aer umed (de la ocean).', 'C'],
  ],
  fizic: 'În meteorologie: ciclon = zonă de presiune scăzută (nori, ploi); anticiclon = presiune ridicată (senin). Formulările din caiete (uscat/umed) se referă la originea masei de aer (continent/ocean) – verifică ce spune profesorul.',
};

// ---------------------------------------------------------------------
//  Clima României
// ---------------------------------------------------------------------
export const RO_CLIMATE = {
  type: 'Climă temperată; climat temperat-continental.',
  influences: [
    { id: 'v_oceanica', name: 'Influențe vest-oceanice', dir: 'din V', lon: 22.0, lat: 46.4, desc: 'Vânturile de vest, până în Carpați → climat mai blând.', src: 'UC', color: '#67b7ff', ang: 90 },
    { id: 'scand_baltice', name: 'Influențe scandinavo-baltice', dir: 'din N', lon: 25.5, lat: 47.9, desc: 'Din nord: aer rece și uscat („baltice – rece, uscat”).', src: 'UC', color: '#b6a3ff', ang: 180 },
    { id: 'polare', name: 'Vânturi polare', dir: 'din NE', lon: 27.6, lat: 47.9, desc: 'Vânturile polare aduc influențe estice.', src: 'UC', color: '#8e9bff', ang: 225 },
    { id: 'est_europene', name: 'Influențe est-europene (Crivățul / Suhoveiul)', dir: 'din E / SE', lon: 27.8, lat: 46.2, desc: 'E și SE: influențe est-europene – vânturi polare – crivățul.', src: 'UC', color: '#9d8cff', ang: 270 },
    { id: 'pontica', name: 'Influență pontică', dir: 'dinspre Marea Neagră', lon: 29.2, lat: 44.6, desc: 'Extremul estic – litoralul și Dobrogea.', src: 'C', color: '#5eead4', ang: 300 },
    { id: 'submediteraneana', name: 'Influențe submediteraneene', dir: 'din S/SV', lon: 22.0, lat: 45.1, desc: 'S – zona Munților Banatului, sudul Câmpiei și al Dealurilor de Vest.', src: 'UC', color: '#ffb454', ang: 40 },
    { id: 'austru', name: 'Austrul', dir: 'din S/SV', lon: 24.6, lat: 44.2, desc: 'În sud: vânt cald.', src: 'UC', color: '#ff9c5b', ang: 0 },
    { id: 'foehn', name: 'Foehn (Făgăraș)', dir: 'versantul nordic', lon: 24.8, lat: 45.75, desc: 'Munții Făgăraș (Carpații Meridionali): reversantul nordic, către D.C.T. – aer cald; la sfârșitul iernii produce dezghețul.', src: 'UC', color: '#ff7a45', ang: 180 },
  ],
  rules: [
    ['Toate țările din V Europei', 'climat temperat oceanic', 'UC'],
    ['Țările din C Europei', 'climat temperat continental', 'UC'],
  ],
  minimum: 'Minim de precipitații în România: sub 300 mm/an – Delta Dunării.',
};

export const BRIZA = { day: 'Ziua: aerul se încălzește mai repede pe uscat/versant, urcă; briza bate dinspre vale/mare spre munte/uscat.', night: 'Noaptea: invers – aerul rece coboară în vale / dinspre uscat spre mare.' };

// ---------------------------------------------------------------------
//  Fizionomia precipitațiilor pe grafice – foaia de recunoaștere pentru zonele de la test
// ---------------------------------------------------------------------
export const TEST_SHAPES = [
  { key: 'mediteraneana', title: 'Mediteraneană (30–40°)', color: '#aad662', rep: ['roma', 'lisabona', 'atena'],
    fiz: 'Barele sunt MARI iarna (oct–mar) și foarte mici sau lipsesc vara (iun–aug).', temp: 'Iernile sunt blânde (cea mai rece lună peste ~7 °C), verile calde (22–27 °C); amplitudine medie.',
    clue: 'Vară uscată + iarnă ploioasă', card: 'Vară caldă și secetoasă / iarnă blândă și ploioasă.' },
  { key: 'temperat_oceanic', title: 'Temperat oceanic (40–60° V)', color: '#34a853', rep: ['brest', 'londra', 'seattle'],
    fiz: 'Bare relativ EGALE în toate cele 12 luni (ploi tot anul), fără lună uscată.', temp: 'Amplitudine MICĂ (≈ 10–15 °C): ierni blânde, veri răcoroase.',
    clue: 'Ploi tot anul + amplitudine mică', card: 'Vară umedă-răcoroasă / iarnă blândă-ploioasă.' },
  { key: 'temperat_continental', title: 'Temperat continental (interior)', color: '#6a9f46', rep: ['moscova', 'cluj', 'bucuresti'],
    fiz: 'Precipitațiile au maxim VARA (mai–august); iarna barele sunt mai mici.', temp: 'Amplitudine MARE (≥ 20 °C): ierni geroase (ianuarie sub 0 °C), veri calde.',
    clue: 'Maxim vara + amplitudine mare', card: 'Ierni geroase / veri calde-secetoase (în caiet).' },
  { key: 'subpolar', title: 'Subpolar (60/66–70°)', color: '#4ea4e0', rep: ['murmansk', 'churchill', 'iqaluit'],
    fiz: 'Precipitații puține (300–500 mm/an), bare mici, cu un mic maxim vara–toamna.', temp: 'Temperatura sub 0 °C multe luni; vară scurtă (2–3 luni) și răcoroasă; amplitudine foarte mare.',
    clue: 'Sub 0 °C mult timp + bare mici', card: 'Vară scurtă-răcoroasă (2–3 luni) / iarnă lungă-geroasă.' },
  { key: 'tranzitie', title: 'Trecere oceanic → continental (Germania)', color: '#46994a', rep: ['berlin', 'varsovia'],
    fiz: 'Ploi în toate lunile (ca la oceanic), dar cu un ușor maxim vara (ca la continental).', temp: 'Amplitudine medie (≈ 18–19 °C): iernile mai reci decât la oceanic, verile moderate.',
    clue: 'Intermediar între oceanic și continental', card: 'Germania face trecerea dintre temp. oc. și temp. cont.' },
];
