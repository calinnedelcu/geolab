// Utilitare Leaflet comune pentru toate hărțile 2D ale site-ului
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { h } from '../core/dom.js';
import { icon } from '../core/icons.js';

export { L };

// Overlay Leaflet care afișează direct un <canvas> (conținutul se poate schimba fără a re-încărca imaginea)
export const CanvasOverlay = L.ImageOverlay.extend({
  initialize(canvas, bounds, options) { this._canvas = canvas; this._bounds = L.latLngBounds(bounds); L.Util.setOptions(this, options); },
  _initImage() {
    const img = (this._image = this._canvas);
    L.DomUtil.addClass(img, 'leaflet-image-layer');
    if (this._zoomAnimated) L.DomUtil.addClass(img, 'leaflet-zoom-animated');
    if (this.options.className) L.DomUtil.addClass(img, this.options.className);
    img.onselectstart = L.Util.falseFn; img.onmousemove = L.Util.falseFn;
    this._updateZIndex();
  },
});

export function makeMap(el, { crs, bounds, minZoom = 0, maxZoom = 10, maxBounds, zoomSnap = 0.25 } = {}) {
  const map = L.map(el, {
    crs: crs || L.CRS.EPSG3857, zoomControl: false, attributionControl: false, zoomSnap, zoomDelta: 0.5, wheelPxPerZoomLevel: 100, wheelDebounceTime: 35,
    minZoom, maxZoom, maxBounds, maxBoundsViscosity: 0.9, inertia: true, inertiaDeceleration: 2600, bounceAtZoomLimits: false, fadeAnimation: false, markerZoomAnimation: false, zoomAnimation: true,
    keyboard: true, doubleClickZoom: true, preferCanvas: false,
  });
  L.control.zoom({ position: 'topleft', zoomInText: '+', zoomOutText: '−', zoomInTitle: 'Mărește', zoomOutTitle: 'Micșorează' }).addTo(map);
  L.control.scale({ imperial: false, metric: true, maxWidth: 130, position: 'bottomleft' }).addTo(map);
  return map;
}

// buton „vedere de ansamblu”
export function homeControl(map, onClick, title = 'Vedere de ansamblu') {
  const C = L.Control.extend({ options: { position: 'topleft' }, onAdd() { const c = L.DomUtil.create('div', 'leaflet-bar lf-home'); const a = L.DomUtil.create('a', '', c); a.href = '#'; a.title = title; a.setAttribute('role', 'button'); a.setAttribute('aria-label', title); a.innerHTML = icon('expand'); L.DomEvent.on(a, 'click', (e) => { L.DomEvent.stop(e); onClick(); }); L.DomEvent.disableClickPropagation(c); return c; } });
  return new C().addTo(map);
}
// casetă cu coordonate / altitudine
export function readoutControl(map) {
  const C = L.Control.extend({ options: { position: 'bottomright' }, onAdd() { this._d = L.DomUtil.create('div', 'lf-readout'); this._d.innerHTML = '<span>Mută cursorul pe hartă</span>'; return this._d; }, set(html) { this._d.innerHTML = html; } });
  return new C().addTo(map);
}
export function labelMarker(lat, lon, html, cls = '', { onClick, z = 0, title } = {}) {
  const ic = L.divIcon({ className: `lf-lbl ${cls}`, html, iconSize: [0, 0], iconAnchor: [0, 0] });
  const m = L.marker([lat, lon], { icon: ic, interactive: !!onClick, keyboard: false, zIndexOffset: z, riseOnHover: false, title });
  if (onClick) m.on('click', (e) => { L.DomEvent.stopPropagation(e); onClick(); });
  return m;
}
// panou HTML pus peste hartă: nu lăsăm click/drag/rotița să ajungă la harta de dedesubt
export function shieldOverlay(el) { L.DomEvent.disableClickPropagation(el); L.DomEvent.disableScrollPropagation(el); return el; }
export const fmtLat = (v) => `${Math.abs(v).toFixed(2)}° ${v >= 0 ? 'N' : 'S'}`;
export const fmtLon = (v) => `${Math.abs(v).toFixed(2)}° ${v >= 0 ? 'E' : 'V'}`;
