// Locuri-exemplu pentru fiecare zonă de climă (cele scrise pe fișe) – coordonate aproximative, pentru pini pe glob
export const ZONE_PLACES = {
  1: [ // ecuatorială
    { n: 'Câmpia Amazoniană', lon: -62, lat: -3.5 }, { n: 'Bazinul Congo', lon: 23.5, lat: 0.5 }, { n: 'Arhipelagul Indonezian', lon: 111, lat: -1 },
  ],
  2: [ // subecuatorială
    { n: 'Podișul Brazilei', lon: -48, lat: -13 }, { n: 'Podișul Guyanelor (Llanos)', lon: -66, lat: 7.5 }, { n: 'Africa – bazinul Congo (S)', lon: 24, lat: -9 },
    { n: 'Madagascar (parțial)', lon: 46.5, lat: -16 }, { n: 'Peninsula Indiană', lon: 78, lat: 14 },
  ],
  3: [ // tropical uscat
    { n: 'Pod. Kalahari', lon: 22, lat: -23 }, { n: 'Pustiul Atacama', lon: -69, lat: -23.5 }, { n: 'Salar de Uyuni', lon: -67.5, lat: -20.3 }, { n: 'Peninsula Arabă', lon: 45, lat: 23.5 },
    { n: 'Podișul Thar', lon: 71, lat: 27 }, { n: 'P. Gibson', lon: 126, lat: -24.5 }, { n: 'Marele Deșert de Nisip', lon: 125, lat: -21 }, { n: 'P. Victoriei', lon: 130, lat: -29 },
    { n: 'Pod. Mexican', lon: -103, lat: 24.5 }, { n: 'Sonora–Mojave', lon: -114.5, lat: 34 }, { n: 'Sahara', lon: 8, lat: 24 },
  ],
  4: [ // tropical umed
    { n: 'Câmpia Chinei de Est', lon: 115, lat: 32 }, { n: 'Câmpia Manciuriei', lon: 125, lat: 45 }, { n: 'Asia de S și SE', lon: 98, lat: 18 }, { n: 'Japonia (parțial)', lon: 136.5, lat: 35 },
    { n: 'Australia de E', lon: 150, lat: -26 }, { n: 'SE Africii', lon: 33.5, lat: -20 }, { n: 'E Madagascarului', lon: 49, lat: -17 }, { n: 'E Braziliei', lon: -42, lat: -17 },
    { n: 'E Mexicului', lon: -97.5, lat: 20 }, { n: 'America Centrală', lon: -86, lat: 13 }, { n: 'Peninsula Florida', lon: -81.5, lat: 27.7 },
  ],
  5: [ // mediteraneană
    { n: 'Marea Mediterană', lon: 15, lat: 38.5 }, { n: 'Peninsula California', lon: -120.5, lat: 36 }, { n: 'Chile centrală', lon: -71, lat: -34 }, { n: 'Africa de Sud', lon: 19.5, lat: -33.5 },
    { n: 'Australia de S / SE', lon: 138, lat: -34.5 }, { n: 'Japonia de S', lon: 132, lat: 32.5 },
  ],
  6: [ // oceanic
    { n: 'Cordilierii de V (America)', lon: -123.5, lat: 47.5 }, { n: 'Anzii de V', lon: -73.5, lat: -45 }, { n: 'Vestul Europei', lon: 0, lat: 49.5 }, { n: 'Asia de E (oceanic musonic)', lon: 140, lat: 42 },
  ],
  7: [ // continental
    { n: 'Interiorul Americii de N', lon: -100, lat: 45 }, { n: 'America de S (Patagonia)', lon: -69, lat: -45 }, { n: 'Câmpia Europei de Est', lon: 36, lat: 52 }, { n: 'Asia Centrală', lon: 70, lat: 45 },
    { n: 'Siberia de V', lon: 75, lat: 58 }, { n: 'Pod. Gobi', lon: 105, lat: 43 }, { n: 'N Mării Caspice (aridă)', lon: 50, lat: 47.5 }, { n: 'N Canadei („rece”)', lon: -95, lat: 58 }, { n: 'N Siberiei („rece”)', lon: 105, lat: 64 },
  ],
  8: [ // subpolar
    { n: 'Groenlanda de N', lon: -40, lat: 79 }, { n: 'Novaia Zemlea de N', lon: 56, lat: 75 }, { n: 'Severnaia Zemlea', lon: 98, lat: 79.5 }, { n: 'Canada de N', lon: -100, lat: 72 }, { n: 'Franz Josef (F. Rusă) de N', lon: 56, lat: 81 },
  ],
  9: [ // polar
    { n: 'Antarctica', lon: 20, lat: -82 }, { n: 'Groenlanda (calota)', lon: -40, lat: 72 },
  ],
  10: [ { n: 'Germania', lon: 10.2, lat: 51.2 } ],
};
// etichete de vânt pe glob (lat, lon)
export const WIND_BELTS = [
  { n: 'Calme ecuatoriale', lon: -150, lat: 0, color: '#ff7b7b' },
  { n: 'Alizee', lon: -150, lat: 17, color: '#ffc36b' }, { n: 'Alizee', lon: -150, lat: -17, color: '#ffc36b' },
  { n: 'Vânturi de vest', lon: -150, lat: 46, color: '#7ec0ff' }, { n: 'Vânturi de vest', lon: -150, lat: -46, color: '#7ec0ff' },
  { n: 'Vânturi polare (de est)', lon: -150, lat: 76, color: '#bfa8ff' }, { n: 'Vânturi polare (de est)', lon: -150, lat: -76, color: '#bfa8ff' },
];
