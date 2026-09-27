export function Sparkline({ data, w = 120, h = 28 }) {
  if (!data || data.length < 2) return null;
  let lo = Infinity, hi = -Infinity;
  for (const v of data) { if (v < lo) lo = v; if (v > hi) hi = v; }
  if (hi - lo < 1e-9) { hi += 1; lo -= 1; }
  const d = data.map((v, i) => `${i ? 'L' : 'M'}${((i / (data.length - 1)) * w).toFixed(1)} ${(h - 2 - ((v - lo) / (hi - lo)) * (h - 4)).toFixed(1)}`).join('');
  return <svg className="spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true"><path d={d} /></svg>;
}
