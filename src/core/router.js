// Router pe hash: #/cale?param=1
const routes = [];
let current = null;
let onChange = null;
export function route(pattern, load, meta = {}) { routes.push({ pattern, load, meta }); }
export const parse = () => {
  const raw = location.hash.replace(/^#/, '') || '/';
  const [path, q] = raw.split('?');
  const params = Object.fromEntries(new URLSearchParams(q || ''));
  return { path: path || '/', params };
};
export function go(path) { if (location.hash !== '#' + path) location.hash = path; else resolve(); }
export function start(cb) { onChange = cb; window.addEventListener('hashchange', resolve); resolve(); }
export function currentRoute() { return current; }
async function resolve() {
  const { path, params } = parse();
  const r = routes.find((x) => x.pattern === path) || routes.find((x) => x.pattern === '*');
  current = { ...r, path, params };
  onChange && onChange(current);
}
