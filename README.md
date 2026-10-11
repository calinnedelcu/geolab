# GeoLab – Europa & România (pregătire pentru test)

Site interactiv de învățat geografie, făcut din caietele voastre (cel albastru + cel al colegului) și din cele două fișe color cu zonele de climă.

## Cum îl deschizi

Dublu-click pe `index.html`. Merge direct din folder, fără server și fără internet.

Dacă vreodată ceva nu se încarcă (unele browsere sunt stricte cu fișierele locale), pornește un server local din acest folder:

```bash
python3 -m http.server 8765
```

și deschide `http://localhost:8765`.

Progresul (XP, carduri, bifele din „Ce intră la test”) se salvează în browser (localStorage), deci rămâne pe același calculator și în același browser.

## Ce conține

Totul e construit în jurul listei „Test” din caiet:

- **Ce intră la test** – lista bifabilă + „De verificat” (nepotriviri între caiete).
- **Reliefuri** – Relief Europa (unități + „mașina timpului” P·C·H·A), Relief România (unități + profil topografic), Tipuri de relief, Europa vs. România.
- **Clima** – Zone de climă (harta lumii; sunt evidențiate doar zonele de la test: mediteraneană, temperat oceanic, temperat continental, subpolar + trecerea prin Germania), Climograf (fizionomia precipitațiilor pe grafice, calculul amplitudinii și al temperaturii medii, „recunoaște zona”, desenează graficul), Clima Europei (factori, temperaturi, precipitații, vânturi, cicloni și anticicloni) și Clima României (influențe, Austru, Foehn, precipitații după altitudine).
- **Insule, peninsule, mări, golfuri** – hartă, liste de învățat și quiz.
- **Învață** – carduri cu repetiție spațiată (Leitner), quiz (normal / contra-timp / supraviețuire), glosar.
- **Extra** – zonele de climă care nu sunt în lista de test (ecuatorială, subecuatorială, tropicale, polară) rămân pe hartă, estompate, și intră în carduri/quiz doar cu comutatorul „Include materia extra”.

Etichetele de sursă din fișe: **U** = caietul tău, **C** = caietul colegului, **F** = fișele color, **X** = completat din cunoștințe generale.

## Date folosite

- Natural Earth (țări, uscat, mări, regiuni) – domeniu public.
- Relief: SRTM, prin tile-urile de elevație AWS Terrarium.
- Climă: normale climatice NOAA / WMO 1991–2020 (74 de stații).
- Insule, peninsule, mări, golfuri: Wikipedia / Wikidata / VLIZ (caietele conțin doar titlul acestei teme).
- Hărți: Leaflet (BSD-2). Font: Inter (SIL OFL).

## Rebuild (doar dacă modifici codul din `src/`)

```bash
npm install
npm run build   # generează app.js + app.css
```
