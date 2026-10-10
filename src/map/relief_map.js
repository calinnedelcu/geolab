import { L, CanvasOverlay, makeMap, homeControl, readoutControl, labelMarker, fmtLat, fmtLon } from './lf.js';
import { b64ToBytes, loadImage, loadAsset, h as H, clamp, fmt } from '../core/dom.js';

/**
 * Hartă 2D de relief (Leaflet): fundal = relief real (SRTM, proiecție Mercator),
 * unitățile de relief = poligoane vectoriale, selecție / filtrare / ascundere,
 * etichete, linii (granițe, profil), citire altitudine.
 */
export class ReliefMap {
  constructor(container, asset, unitsGeo, opts = {}) {
    this.container = container; this.asset = asset; this.meta = asset.meta; this.unitsGeo = unitsGeo; this.opts = opts;
    this.listeners = {}; this.labels = []; this.layers = new Map(); this.polys = {}; this.units = {};
    this.tint = 0.44; this.edges = true; this.selected = 0; this.hover = 0; this.filter = null; this.disposed = false; this.baseMode = 'color';
    this.ready = this._init();
  }
  on(ev, fn) { (this.listeners[ev] = this.listeners[ev] || []).push(fn); return this; }
  emit(ev, d) { (this.listeners[ev] || []).forEach((f) => f(d)); }

  async _init() {
    const { meta, asset } = this; const b = meta.bounds;
    this.bounds = L.latLngBounds([b.lat0, b.lon0], [b.lat1, b.lon1]);
    this.gw = meta.gridW; this.gh = meta.gridH;
    // înălțimi (pentru citire altitudine și profil)
    const bytes = b64ToBytes(asset.heights); const u16 = new Uint16Array(bytes.buffer, bytes.byteOffset, bytes.byteLength >> 1);
    this.heights = new Float32Array(u16.length); for (let i = 0; i < u16.length; i++) this.heights[i] = u16[i] / meta.qScale - meta.qOffset;
    // harta de ID-uri (identificarea unității într-un punct)
    const idImg = await loadImage(asset.idmap); const cv = document.createElement('canvas'); cv.width = idImg.width; cv.height = idImg.height; const cx = cv.getContext('2d', { willReadFrequently: true }); cx.drawImage(idImg, 0, 0);
    const px = cx.getImageData(0, 0, cv.width, cv.height).data; this.idW = cv.width; this.idH = cv.height; this.idData = new Uint8Array(this.idW * this.idH); for (let i = 0; i < this.idData.length; i++) this.idData[i] = px[i * 4];
    // hartă
    const zNative = Math.log2((meta.texW * 360) / ((b.lon1 - b.lon0) * 256));
    this.map = makeMap(this.container, { bounds: this.bounds, minZoom: 0, maxZoom: zNative + 1.25, maxBounds: this.bounds.pad(0.45) });
    const map = this.map;
    map.createPane('basePane').style.zIndex = 200; map.createPane('unitPane').style.zIndex = 300; map.createPane('linePane').style.zIndex = 380;
    this.baseLayer = L.imageOverlay(asset.color, this.bounds, { pane: 'basePane', interactive: false, className: 'relief-base' }).addTo(map);
    // poligoanele unităților
    this.unitGroup = L.layerGroup([], { pane: 'unitPane' }).addTo(map);
    const renderer = L.svg({ pane: 'unitPane', padding: 0.5 });
    Object.entries(this.unitsGeo).forEach(([id, g]) => { const ll = L.GeoJSON.coordsToLatLngs(g.coordinates, 2); const poly = L.polygon(ll, { renderer, pane: 'unitPane', interactive: false, className: 'unit-poly', smoothFactor: 0.6, stroke: true, lineJoin: 'round' }); this.polys[+id] = poly; this.unitGroup.addLayer(poly); });
    map.fitBounds(this.bounds, { animate: false, padding: [8, 8] }); this._homeZoom = map.getZoom(); map.setMinZoom(this._homeZoom - 0.75);
    this.readout = readoutControl(map); homeControl(map, () => this.resetView());
    // tooltip propriu
    this.tip = H('div', { class: 'lf-tip', style: { display: 'none' } }); this.container.appendChild(this.tip);
    map.on('mousemove', (e) => this._move(e)); map.on('mouseout', () => { this._setHover(0); this.tip.style.display = 'none'; this.emit('hover', null); this.readout.set('<span>Mută cursorul pe hartă</span>'); });
    map.on('click', (e) => this._click(e)); map.on('zoomend', () => this._zoomLabels()); map.on('movestart', () => { this.tip.style.display = 'none'; });
    this._ro = new ResizeObserver(() => map.invalidateSize({ animate: false })); this._ro.observe(this.container);
    this.setUnits(Object.keys(this.unitsGeo).map((id) => ({ id: +id, color: '#8899aa' })));
    return this;
  }

  // ---------------------------------------------------------------- coordonate / date
  uvOf(lon, lat) { const b = this.meta.bounds; const my = Math.asinh(Math.tan((lat * Math.PI) / 180)); return [(lon - b.lon0) / (b.lon1 - b.lon0), (b.my1 - my) / (b.my1 - b.my0)]; }
  heightAt(lon, lat) {
    const [u, v] = this.uvOf(lon, lat); if (u < 0 || v < 0 || u > 1 || v > 1) return 0; const x = clamp(u, 0, 1) * (this.gw - 1), y = clamp(v, 0, 1) * (this.gh - 1); const i = Math.min(this.gw - 2, Math.floor(x)), j = Math.min(this.gh - 2, Math.floor(y)), fx = x - i, fy = y - j; const g = this.heights, w = this.gw;
    const a = g[j * w + i], bb = g[j * w + i + 1], c = g[(j + 1) * w + i], d = g[(j + 1) * w + i + 1]; return (a * (1 - fx) + bb * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy;
  }
  idAt(lon, lat) { const [u, v] = this.uvOf(lon, lat); if (u < 0 || v < 0 || u > 1 || v > 1) return 0; const x = Math.min(this.idW - 1, Math.floor(u * this.idW)), y = Math.min(this.idH - 1, Math.floor(v * this.idH)); return this.idData[y * this.idW + x]; }

  // ---------------------------------------------------------------- unități
  setUnits(list) { list.forEach((u) => { this.units[u.id] = { id: u.id, color: u.color }; }); this._restyle(); }
  setTint(v) { this.tint = v; this._restyle(); }
  setEdges(on) { this.edges = on; this._restyle(); }
  setFilter(ids) { this.filter = ids ? new Set(ids) : null; this._restyle(); }
  setSelected(id) { this.selected = id || 0; this._restyle(); if (this.selected && this.polys[this.selected]) this.polys[this.selected].bringToFront(); }
  _setHover(id) { if (id === this.hover) return; this.hover = id; this._restyle(id); }
  _styleOf(id) {
    const u = this.units[id]; if (!u) return {}; const sel = id === this.selected, hov = id === this.hover, dim = this.filter && !this.filter.has(id) && !sel;
    const alpha = dim ? 0.035 : sel ? Math.min(0.88, this.tint + 0.3) : hov ? Math.min(0.78, this.tint + 0.2) : this.tint;
    return { fillColor: u.color, fillOpacity: alpha, color: sel || hov ? '#ffffff' : '#0a1230', weight: sel ? 3.2 : hov ? 2.4 : this.edges ? 1.15 : 0, opacity: dim ? 0.14 : sel || hov ? 1 : 0.55, fill: true };
  }
  _restyle() { Object.keys(this.polys).forEach((k) => this.polys[k].setStyle(this._styleOf(+k))); if (this.selected && this.polys[this.selected]) this.polys[this.selected].bringToFront(); }

  // ---------------------------------------------------------------- mouse
  _move(e) {
    const { lat, lng } = e.latlng; const id = this.idAt(lng, lat); const hh = this.heightAt(lng, lat);
    this._setHover(!this.noHover && id && this.polys[id] && (!this.filter || this.filter.has(id)) ? id : 0); this.container.style.cursor = id ? 'pointer' : '';
    this.readout.set(`<b>${fmtLat(lat)}, ${fmtLon(lng)}</b>${hh > 0 ? ` · alt. ≈ ${fmt(Math.round(hh))} m` : ' · mare'}`);
    const p = e.containerPoint; this.emit('hover', { id, lon: lng, lat, h: hh, sx: p.x, sy: p.y });
  }
  _click(e) {
    const { lat, lng } = e.latlng; const id = this.idAt(lng, lat); const hit = { id, lon: lng, lat, h: this.heightAt(lng, lat) };
    this.emit('click', hit); if (id && this.polys[id]) this.emit('select', hit);
  }
  showTip(sx, sy, html) { this.tip.style.display = 'block'; this.tip.style.left = sx + 'px'; this.tip.style.top = sy + 'px'; this.tip.innerHTML = html; }
  hideTip() { this.tip.style.display = 'none'; }

  // ---------------------------------------------------------------- cameră
  resetView(animate = true) { this.map.fitBounds(this.bounds, { animate, padding: [8, 8], duration: 0.8 }); }
  flyToUnit(id) { const poly = this.polys[id]; if (!poly) return; this.map.flyToBounds(poly.getBounds().pad(0.22), { duration: 0.85, maxZoom: this.map.getMaxZoom() - 1.5, paddingTopLeft: [10, 10], paddingBottomRight: [10, 10] }); }
  flyTo(lon, lat, zoom) { this.map.flyTo([lat, lon], zoom ?? Math.min(this.map.getMaxZoom() - 1, this._homeZoom + 2), { duration: 0.8 }); }
  invalidate() { this.map && this.map.invalidateSize({ animate: false }); }

  // ---------------------------------------------------------------- fundal
  setBase(mode) {
    this.baseMode = mode; const el = this.baseLayer.getElement(); if (!el) return;
    this.container.classList.remove('base-gray', 'base-plain'); el.style.display = '';
    if (mode === 'gray') this.container.classList.add('base-gray');
    if (mode === 'plain') { this.container.classList.add('base-plain'); this._ensurePlain(); el.style.display = 'none'; if (this.plainLayer) this.plainLayer.addTo(this.map); } else if (this.plainLayer) this.plainLayer.remove();
  }
  async _ensurePlain() {
    if (this.plainLayer || this._plainBusy) return; this._plainBusy = true;
    try {
      const masks = await loadAsset('masks'); const key = this.opts.kind === 'europe' ? 'europe_land' : 'romania_land'; const img = await loadImage(masks[key]);
      const cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height; const cx = cv.getContext('2d'); cx.drawImage(img, 0, 0); cx.globalCompositeOperation = 'source-in'; cx.fillStyle = '#ece7d6'; cx.fillRect(0, 0, cv.width, cv.height);
      this.plainLayer = new CanvasOverlay(cv, this.bounds, { pane: 'basePane', className: 'plain-land' }); if (this.baseMode === 'plain') this.plainLayer.addTo(this.map);
    } finally { this._plainBusy = false; }
  }

  // ---------------------------------------------------------------- etichete
  addLabel({ lon, lat, html, text, cls = 'name', group = 'default', color, onClick, title, minZoom = -99, maxZoom = 99, z = 0 }) {
    const inner = html != null ? html : text; const wrapHtml = `<div class="lbl ${cls}"${color ? ` style="--c:${color}"` : ''}>${inner}</div>`;
    const marker = labelMarker(lat, lon, wrapHtml, `grp-${group}`, { onClick, z, title }); marker.addTo(this.map);
    const l = { marker, group, minZoom, maxZoom, visible: true, el: () => marker.getElement() && marker.getElement().firstChild };
    this.labels.push(l); this._zoomLabels(); return l;
  }
  _zoomLabels() { const z = this.map.getZoom(); this.labels.forEach((l) => { const el = l.marker.getElement(); if (!el) return; el.style.display = l.visible && z >= l.minZoom && z <= l.maxZoom ? '' : 'none'; }); }
  clearLabels(group) { this.labels = this.labels.filter((l) => { if (!group || l.group === group) { l.marker.remove(); return false; } return true; }); }
  setLabelsVisible(group, on) { this.labels.forEach((l) => { if (!group || l.group === group) l.visible = on; }); this._zoomLabels(); }

  // ---------------------------------------------------------------- linii
  addLineLayer(name, polylines, { color = '#ffffff', width = 1.2, opacity = 0.9, dash = null } = {}) {
    this.removeLineLayer(name); const ll = polylines.map((pl) => pl.map(([lo, la]) => [la, lo]));
    const line = L.polyline(ll, { pane: 'linePane', color, weight: width, opacity, interactive: false, dashArray: dash, smoothFactor: 0.8, lineCap: 'round', lineJoin: 'round', noClip: false }).addTo(this.map); this.layers.set(name, line); return line;
  }
  removeLineLayer(name) { const l = this.layers.get(name); if (l) { l.remove(); this.layers.delete(name); } }
  setLayerVisible(name, on) { const l = this.layers.get(name); if (!l) return; if (on) l.addTo(this.map); else l.remove(); }

  // ---------------------------------------------------------------- profil topografic
  getProfile(a, b, n = 240) {
    const R = 6371008.8; const out = []; let dist = 0; let prev = null;
    for (let i = 0; i <= n; i++) { const f = i / n; const lon = a.lon + (b.lon - a.lon) * f, lat = a.lat + (b.lat - a.lat) * f; const hh = Math.max(this.heightAt(lon, lat), 0); const id = this.idAt(lon, lat); if (prev) { const dLat = ((lat - prev.lat) * Math.PI) / 180, dLon = ((lon - prev.lon) * Math.PI) / 180; dist += Math.hypot(dLon * Math.cos((((lat + prev.lat) / 2) * Math.PI) / 180), dLat) * R; } out.push({ lon, lat, h: hh, id, d: dist }); prev = { lon, lat }; }
    return out;
  }

  dispose() {
    this.disposed = true; this._ro && this._ro.disconnect(); this.labels = []; this.layers.clear();
    try { this.map && this.map.remove(); } catch (e) { /* ignorăm */ }
    this.tip && this.tip.remove();
  }
}
