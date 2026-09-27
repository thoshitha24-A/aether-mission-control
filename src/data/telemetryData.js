import { gauss, mulberry32 } from '../utils/format';

export const METRIC_ORDER = ['altitude', 'velocity', 'fuel', 'signal', 'temperature', 'power'];

export const METRICS = {
  altitude: { label: 'Altitude', unit: 'km', dec: 0, base: 370480, drift: 1.4, noise: 0.3, revert: 0, sub: 'Above Earth surface', nominal: '0 to 410,000 km' },
  velocity: { label: 'Velocity', unit: 'km/h', dec: 0, base: 2948, drift: 0.05, noise: 0.8, revert: 0, sub: 'Earth-relative', nominal: '1,000 to 4,500 km/h' },
  fuel: { label: 'Fuel', unit: '%', dec: 1, base: 73.4, drift: -0.0002, noise: 0.0015, revert: 0, warn: { below: 25 }, sub: 'Propellant remaining', nominal: 'Above 25 %' },
  signal: { label: 'Signal', unit: '%', dec: 1, base: 98.2, drift: 0, noise: 0.14, revert: 0.18, warn: { below: 90 }, sub: 'Ka-band lock quality', nominal: 'Above 90 %' },
  temperature: { label: 'Temperature', unit: '°C', dec: 1, base: -42, drift: 0, noise: 0.16, revert: 0.1, warn: { above: -20 }, sub: 'External hull array', nominal: '\u221280 to \u221220 °C' },
  power: { label: 'Power', unit: '%', dec: 1, base: 86.7, drift: 0, noise: 0.08, revert: 0.12, warn: { below: 60 }, sub: 'Bus capacity', nominal: 'Above 60 %' },
};

export const RANGES = [
  { id: '5m', label: '5 min', ms: 3e5 },
  { id: '15m', label: '15 min', ms: 9e5 },
  { id: '1h', label: '1 hr', ms: 36e5 },
  { id: '6h', label: '6 hr', ms: 216e5 },
];

export const FINE_N = 1800;

export const COARSE_N = 720;

export const TICK_MS = 2000;

export function metricStatus(k, v) {
  const w = METRICS[k].warn;
  if (w && ((w.below != null && v < w.below) || (w.above != null && v > w.above))) return { cls: 'warn', label: 'Caution' };
  return { cls: 'ok', label: 'Nominal' };
}

export function capPct(k, v) {
  return METRICS[k].unit === '%' ? Math.min(100, v) : v;
}

export function initTelemetry() {
  const rng = mulberry32(7);
  const now = Date.now();
  const values = {}, prev = {}, fine = {}, coarse = {};
  METRIC_ORDER.forEach((k) => {
    const m = METRICS[k];
    let v = m.base;
    const f = new Array(FINE_N);
    for (let i = FINE_N - 1; i >= 0; i--) {
      f[i] = { t: now - (FINE_N - 1 - i) * TICK_MS, v: capPct(k, v) };
      v = v - m.drift + m.noise * gauss(rng) + m.revert * (m.base - v);
    }
    v = m.base;
    const c = new Array(COARSE_N);
    for (let i = COARSE_N - 1; i >= 0; i--) {
      c[i] = { t: now - (COARSE_N - 1 - i) * 30000, v: capPct(k, v) };
      v = v - m.drift * 15 + m.noise * 2.2 * gauss(rng) + Math.min(0.8, m.revert * 5) * (m.base - v);
    }
    fine[k] = f; coarse[k] = c; values[k] = m.base; prev[k] = m.base;
  });
  return { rng, values, prev, fine, coarse, tick: 0 };
}

export function stepTelemetry(s) {
  s.tick++;
  const now = Date.now();
  METRIC_ORDER.forEach((k) => {
    const m = METRICS[k];
    const v0 = s.values[k];
    const v = capPct(k, v0 + m.drift + m.noise * gauss(s.rng) + m.revert * (m.base - v0));
    s.prev[k] = v0;
    s.values[k] = v;
    s.fine[k].push({ t: now, v });
    if (s.fine[k].length > FINE_N) s.fine[k].shift();
    if (s.tick % 15 === 0) {
      s.coarse[k].push({ t: now, v });
      if (s.coarse[k].length > COARSE_N) s.coarse[k].shift();
    }
  });
}

export function downsample(pts, max) {
  if (pts.length <= max) return pts;
  const k = pts.length / max;
  const out = [];
  for (let i = 0; i < max - 1; i++) out.push(pts[Math.floor(i * k)]);
  out.push(pts[pts.length - 1]);
  return out;
}

export function getSeries(s, k, range) {
  const now = Date.now();
  const src = range.id === '6h' ? s.coarse[k].concat([{ t: now, v: s.values[k] }]) : s.fine[k];
  const cutoff = now - range.ms;
  return downsample(src.filter((p) => p.t >= cutoff), 180);
}
