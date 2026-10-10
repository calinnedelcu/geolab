// Acces la datele reale de elevație (SRTM) fără 3D: pentru profile, calcule și grafice
import { loadAsset, b64ToBytes } from './dom.js';
const cache = {};
export async function loadDEM(kind /* 'europe' | 'romania' */) {
  if (cache[kind]) return cache[kind];
  const asset = await loadAsset(kind === 'europe' ? 'terrain_europe' : 'terrain_romania');
  const m = asset.meta, b = m.bounds; const bytes = b64ToBytes(asset.heights); const u16 = new Uint16Array(bytes.buffer, bytes.byteOffset, bytes.byteLength >> 1);
  const gw = m.gridW, gh = m.gridH; const hgt = new Float32Array(u16.length); for (let i = 0; i < u16.length; i++) hgt[i] = u16[i] / m.qScale - m.qOffset;
  const uvOf = (lon, lat) => [(lon - b.lon0) / (b.lon1 - b.lon0), (b.my1 - Math.asinh(Math.tan((lat * Math.PI) / 180))) / (b.my1 - b.my0)];
  const sample = (lon, lat) => {
    const [u, v] = uvOf(lon, lat); const x = Math.min(gw - 1.001, Math.max(0, u * (gw - 1))), y = Math.min(gh - 1.001, Math.max(0, v * (gh - 1))); const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j;
    const a = hgt[j * gw + i], bb = hgt[j * gw + i + 1], c = hgt[(j + 1) * gw + i], d = hgt[(j + 1) * gw + i + 1]; return (a * (1 - fx) + bb * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy;
  };
  cache[kind] = { sample, meta: m, uvOf };
  return cache[kind];
}
