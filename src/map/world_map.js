import { L, CanvasOverlay, makeMap, homeControl, readoutControl, labelMarker, fmtLat, fmtLon } from './lf.js';
import { loadImage, h as H, clamp } from '../core/dom.js';

const smooth = (x, a, b) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
// vânturi permanente: (u = est, v = nord) în grade/secundă, în funcție de latitudine
function wind(lat) {
  const a = Math.abs(lat), s = Math.sign(lat) || 1; const trade = 1 - smooth(a, 26, 34), west = smooth(a, 26, 34) * (1 - smooth(a, 56, 64)), polar = smooth(a, 56, 64), calm = 1 - smooth(a, 2, 7);
  return { u: -6.5 * trade * (1 - calm * 0.85) + 7.5 * west - 4.5 * polar, v: -s * 2.6 * trade * (1 - calm) + s * 1.8 * west - s * 1.6 * polar, trade, west, polar, calm };
}

/** Hartă 2D a lumii cu zonele de climă (Leaflet, proiecție plată), selecție, filtru „doar la test”, paralele, vânturi animate. */
export class WorldMap {
  constructor(container, asset) { this.container = container; this.asset = asset; this.listeners = {}; this.pins = []; this.selected = 0; this.testSet = null; this.disposed = false; this.windOn = false; this.ready = this._init(); }
  on(ev, fn) { (this.listeners[ev] = this.listeners[ev] || []).push(fn); return this; }
  emit(ev, d) { (this.listeners[ev] || []).forEach((f) => f(d)); }

  async _init() {
    const { asset } = this; const zImg = await loadImage(asset.zones);
    const cv = document.createElement('canvas'); cv.width = zImg.width; cv.height = zImg.height; const cx = cv.getContext('2d', { willReadFrequently: true }); cx.drawImage(zImg, 0, 0);
    const px = cx.getImageData(0, 0, cv.width, cv.height).data; this.zW = cv.width; this.zH = cv.height; this.Z = new Uint8Array(this.zW * this.zH); for (let i = 0; i < this.Z.length; i++) this.Z[i] = px[i * 4];
    this.bounds = L.latLngBounds([-90, -180], [90, 180]);
    const map = (this.map = makeMap(this.container, { crs: L.CRS.EPSG4326, bounds: this.bounds, minZoom: -2, maxZoom: 6, maxBounds: this.bounds, zoomSnap: 0.25 }));
    map.createPane('basePane').style.zIndex = 200; map.createPane('zonePane').style.zIndex = 300; map.createPane('linePane').style.zIndex = 380;
    this.baseLayer = L.imageOverlay(asset.color, this.bounds, { pane: 'basePane', interactive: false, className: 'world-base' }).addTo(map);
    this.canvas = document.createElement('canvas'); this.canvas.width = this.zW; this.canvas.height = this.zH; this.ctx = this.canvas.getContext('2d');
    this.zoneLayer = new CanvasOverlay(this.canvas, this.bounds, { pane: 'zonePane', className: 'zone-overlay' }).addTo(map);
    map.fitBounds(this.bounds, { animate: false }); this._home = map.getZoom(); map.setMinZoom(this._home - 0.5);
    this.readout = readoutControl(map); homeControl(map, () => this.resetView());
    this.tip = H('div', { class: 'lf-tip', style: { display: 'none' } }); this.container.appendChild(this.tip);
    map.on('mousemove', (e) => { const { lat, lng } = e.latlng; const zone = this.zoneAt(lng, lat); this.container.style.cursor = zone ? 'pointer' : ''; this.readout.set(`<b>${fmtLat(lat)}, ${fmtLon(lng)}</b>`); this.emit('hover', { zone, lon: lng, lat, sx: e.containerPoint.x, sy: e.containerPoint.y }); });
    map.on('mouseout', () => { this.hideTip(); this.emit('hover', null); });
    map.on('click', (e) => { const { lat, lng } = e.latlng; this.emit('click', { zone: this.zoneAt(lng, lat), lon: lng, lat }); });
    map.on('movestart', () => this.hideTip()); map.on('moveend zoomend', () => this._declutterPins());
    this._buildBands(); this._ro = new ResizeObserver(() => { map.invalidateSize({ animate: false }); this._sizeWind(); }); this._ro.observe(this.container);
    this._redraw(); return this;
  }
  zoneAt(lon, lat) { const x = Math.min(this.zW - 1, Math.max(0, Math.floor(((lon + 180) / 360) * this.zW))), y = Math.min(this.zH - 1, Math.max(0, Math.floor(((90 - lat) / 180) * this.zH))); return this.Z[y * this.zW + x]; }
  showTip(sx, sy, html) { this.tip.style.display = 'block'; this.tip.style.left = sx + 14 + 'px'; this.tip.style.top = sy + 14 + 'px'; this.tip.innerHTML = html; }
  hideTip() { this.tip.style.display = 'none'; }

  // ---------------------------------------------------------------- zone: selecție + filtru
  setSelected(id) { this.selected = id || 0; this._redraw(); }
  setTestOnly(ids) { this.testSet = ids ? new Set(ids) : null; this._redraw(); }
  _redraw() {
    const { zW, zH, Z } = this; const img = this.ctx.createImageData(zW, zH); const o = new Uint32Array(img.data.buffer);
    const DIM = ((0x96 << 24) | (34 << 16) | (14 << 8) | 8) >>> 0, LINE = ((0x55 << 24) | (35 << 16) | (15 << 8) | 10) >>> 0, SEL = 0xfff8f8f8 >>> 0;
    const sel = this.selected, ts = this.testSet;
    for (let y = 0; y < zH; y++) for (let x = 0; x < zW; x++) {
      const i = y * zW + x, id = Z[i]; if (!id) continue;
      const dim = sel ? id !== sel : ts ? !ts.has(id) : false;
      let v = dim ? DIM : 0;
      const r = x + 1 < zW ? Z[i + 1] : id, d = y + 1 < zH ? Z[i + zW] : id, l = x > 0 ? Z[i - 1] : id, u = y > 0 ? Z[i - zW] : id;
      const edge = r !== id || d !== id || l !== id || u !== id;
      if (edge) v = sel && id === sel ? SEL : dim ? v : LINE;
      o[i] = v;
    }
    this.ctx.putImageData(img, 0, 0);
  }

  // ---------------------------------------------------------------- cameră / pini
  resetView() { this.map.fitBounds(this.bounds, { animate: true, duration: 0.8 }); }
  flyToPoints(pts, pad = 0.3) { if (!pts.length) return; const b = L.latLngBounds(pts.map((p) => [p.lat, p.lon])); this.map.flyToBounds(b.pad(pad), { duration: 0.9, maxZoom: 3.5 }); }
  flyTo(lon, lat, zoom = 4) { this.map.flyTo([lat, lon], zoom, { duration: 0.9 }); }
  setPins(list) { this.pins.forEach((p) => p.remove()); this.pins = []; list.forEach((p) => { const m = labelMarker(p.lat, p.lon, `<div class="lbl pin" style="--c:${p.color || '#fff'}"><span>${p.name}</span></div>`, 'grp-pin', { onClick: p.onClick, z: 300 }); m.addTo(this.map); this.pins.push(m); }); this._declutterPins(); }
  // etichetele care s-ar suprapune se ascund (apar la zoom); ordinea din listă decide prioritatea
  _declutterPins() {
    const els = this.pins.map((m) => m.getElement()).filter(Boolean); els.forEach((el) => { el.style.visibility = ''; });
    const boxes = []; els.forEach((el) => { const t = el.firstElementChild; if (!t) return; const r = t.getBoundingClientRect(); if (boxes.some((b) => r.left < b.right + 3 && r.right > b.left - 3 && r.top < b.bottom + 2 && r.bottom > b.top - 2)) el.style.visibility = 'hidden'; else boxes.push(r); });
  }

  // ---------------------------------------------------------------- legendă (în colț, apăsabilă)
  setLegend(items, onPick) {
    if (!this._legend) { const self = this; const C = L.Control.extend({ options: { position: 'bottomleft' }, onAdd() { const d = L.DomUtil.create('div', 'wm-legend'); L.DomEvent.disableClickPropagation(d); L.DomEvent.disableScrollPropagation(d); self._legendEl = d; return d; } }); this._legend = new C().addTo(this.map); }
    const d = this._legendEl; while (d.firstChild) d.removeChild(d.firstChild);
    items.forEach((it) => d.appendChild(H('button', { class: 'wm-leg', title: 'Deschide fișa zonei', onclick: () => onPick && onPick(it.id) }, H('i', { style: { background: it.color } }), H('span', null, it.name), it.lat ? H('small', null, it.lat) : null)));
  }

  // ---------------------------------------------------------------- paralele
  _buildBands() {
    this.bandLayers = []; const lats = [0, 5, 15, 30, 40, 60, 66.5, 70];
    lats.forEach((lat, k) => [lat, -lat].forEach((L0, i) => {
      if (lat === 0 && i === 1) return; const line = L.polyline([[L0, -180], [L0, 180]], { pane: 'linePane', color: lat === 0 ? '#ffe27a' : '#ffffff', weight: lat === 0 ? 1.8 : 1, opacity: lat === 0 ? 0.8 : 0.42, dashArray: lat === 0 ? null : '5 6', interactive: false }).addTo(this.map);
      // etichetele paralelelor apropiate stau alternativ la stânga / la dreapta, ca să nu se suprapună
      const right = k % 2 === 1; const txt = lat === 0 ? 'Ecuator 0°' : `${String(lat).replace('.', ',')}° ${L0 > 0 ? 'N' : 'S'}`;
      const lb = labelMarker(L0, right ? 178 : -178, `<div class="lbl country" style="font-size:.62rem;letter-spacing:.04em;transform:translate(${right ? '-100%' : '0'},-50%)">${txt}</div>`, 'grp-band'); lb.addTo(this.map); this.bandLayers.push(line, lb);
    }));
  }
  setBands(on) { this.bandLayers.forEach((l) => { if (l.getElement) { const el = l.getElement(); el && (el.style.display = on ? '' : 'none'); } if (on) l.addTo(this.map); else l.remove(); }); }

  // ---------------------------------------------------------------- vânturi permanente (animat)
  _sizeWind() { if (!this.windCanvas) return; const r = this.container.getBoundingClientRect(); const d = Math.min(2, window.devicePixelRatio || 1); this.windCanvas.width = Math.max(2, Math.round(r.width * d)); this.windCanvas.height = Math.max(2, Math.round(r.height * d)); this._dpr = d; }
  setWind(on) {
    this.windOn = on; if (!on) { cancelAnimationFrame(this._wraf); this.windCanvas && (this.windCanvas.style.display = 'none'); return; }
    if (!this.windCanvas) { this.windCanvas = H('canvas', { class: 'wind-canvas' }); this.container.appendChild(this.windCanvas); this._sizeWind(); const N = 3000; this.pLon = new Float32Array(N); this.pLat = new Float32Array(N); this.pAge = new Float32Array(N); this.pLife = new Float32Array(N); for (let i = 0; i < N; i++) this._respawn(i, true); }
    this.windCanvas.style.display = ''; this._wlast = performance.now(); const loop = (t) => { if (this.disposed || !this.windOn) return; this._wraf = requestAnimationFrame(loop); const dt = Math.min(0.05, (t - this._wlast) / 1000); this._wlast = t; this._stepWind(dt); }; this._wraf = requestAnimationFrame(loop);
  }
  _respawn(i, init = false) { this.pLon[i] = Math.random() * 360 - 180; this.pLat[i] = Math.asin(Math.random() * 2 - 1) * 57.2958 * 0.97; this.pAge[i] = init ? Math.random() * 4 : 0; this.pLife[i] = 2.4 + Math.random() * 3.2; }
  _stepWind(dt) {
    const c = this.windCanvas, g = c.getContext('2d'), d = this._dpr; g.clearRect(0, 0, c.width, c.height); g.lineWidth = 1.5 * d; g.lineCap = 'round';
    const batches = { trade: [], west: [], polar: [], calm: [] }; const N = this.pLon.length; const map = this.map; const w0 = c.width, h0 = c.height;
    for (let i = 0; i < N; i++) {
      let lon = this.pLon[i], lat = this.pLat[i]; const w = wind(lat); const k = 1 / Math.max(0.25, Math.cos((lat * Math.PI) / 180));
      lon += w.u * dt * k; lat += w.v * dt; this.pAge[i] += dt; if (lon > 180) lon -= 360; if (lon < -180) lon += 360;
      if (this.pAge[i] > this.pLife[i] || Math.abs(lat) > 88.5) { this._respawn(i); continue; } this.pLon[i] = lon; this.pLat[i] = lat;
      const a = map.latLngToContainerPoint([lat, lon]), b = map.latLngToContainerPoint([lat - w.v * 0.5, lon - w.u * 0.5 * k]); const ax = a.x * d, ay = a.y * d; if (ax < -20 || ay < -20 || ax > w0 + 20 || ay > h0 + 20) continue;
      const f = Math.sin(Math.PI * clamp(this.pAge[i] / this.pLife[i], 0, 1)); const key = w.calm > 0.35 ? 'calm' : w.trade > 0.5 ? 'trade' : w.polar > 0.5 ? 'polar' : 'west'; batches[key].push(ax, ay, b.x * d, b.y * d, f);
    }
    const col = { trade: '255,196,90', west: '120,196,255', polar: '190,168,255', calm: '255,110,110' };
    Object.entries(batches).forEach(([k, arr]) => { for (let i = 0; i < arr.length; i += 5) { g.strokeStyle = `rgba(${col[k]},${(0.9 * arr[i + 4]).toFixed(2)})`; g.beginPath(); g.moveTo(arr[i], arr[i + 1]); g.lineTo(arr[i + 2], arr[i + 3]); g.stroke(); } });
  }

  dispose() { this.disposed = true; cancelAnimationFrame(this._wraf); this._ro && this._ro.disconnect(); try { this.map && this.map.remove(); } catch (e) { /* ignorăm */ } this.tip && this.tip.remove(); this.windCanvas && this.windCanvas.remove(); }
}
