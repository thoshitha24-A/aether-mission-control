export const pad = (n, l = 2) => String(Math.floor(n)).padStart(l, '0');

export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export const fmtUTC = (d) => `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;

export const fmtUTCShort = (d) => `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;

export const fmtNum = (v, dec = 0) => {
  const s = Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  return (v < 0 && Number(s.replace(/,/g, '')) !== 0 ? '\u2212' : '') + s;
};

export const fmtDur = (ms) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${pad(s / 3600)}:${pad((s % 3600) / 60)}:${pad(s % 60)}`;
};

export const fmtMET = (ms) => {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 86400)}d ${pad((s % 86400) / 3600)}:${pad((s % 3600) / 60)}:${pad(s % 60)}`;
};

export const ago = (ms) => {
  const s = Math.max(0, Math.round(ms / 1000));
  if (s < 60) return `${s} s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  return `${Math.floor(m / 60)} h ${m % 60} min ago`;
};

export function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function gauss(rng) {
  const u = Math.max(1e-9, rng()), v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export let _uid = 0;

export const uid = (p = 'id') => `${p}-${Date.now().toString(36)}-${(_uid++).toString(36)}`;
