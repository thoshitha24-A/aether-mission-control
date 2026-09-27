import { LOI_AT, T0 } from '../data/missionData';
import { clamp } from '../utils/format';

export const CIS = (() => {
  const rp = 6.578, ra = 400;
  const a = (rp + ra) / 2, e = (ra - rp) / (ra + rp);
  return { rp, ra, a, e, p: a * (1 - e * e), moon: [384.4, 0], earthR: 15, moonR: 4.6, unit: 1000 };
})();

export const LUN = (() => {
  const rp = 183.7, ra = 473.7;
  const a = (rp + ra) / 2, e = (ra - rp) / (ra + rp);
  const eh = 1.32;
  return { rp, ra, a, e, p: a * (1 - e * e), eh, ph: rp * (1 + eh), R: 173.7, unit: 10, mu: 4902.8 };
})();

export function conic(p, e, th) {
  const r = p / (1 + e * Math.cos(th));
  return [-r * Math.cos(th), -r * Math.sin(th)];
}

export function craftCis(altKm) {
  const r = (altKm + 6371) / 1000;
  const c = (CIS.p / r - 1) / CIS.e;
  const th = Math.acos(clamp(c, -1, 1));
  return { th, pos: conic(CIS.p, CIS.e, th) };
}

export function moonGeometry(altKm) {
  const { pos } = craftCis(altKm);
  const dx = CIS.moon[0] - pos[0], dy = CIS.moon[1] - pos[1];
  const range = Math.hypot(dx, dy) * 1000;
  const bearing = ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360;
  return { range, bearing };
}

export function lunarApproachTheta(now) {
  const rem = clamp((LOI_AT - now) / (LOI_AT - T0), 0, 1);
  return -(0.12 + 1.2 * rem);
}

export function solveKepler(M, e) {
  let E = M;
  for (let i = 0; i < 6; i++) E = E - (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  return 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2));
}
