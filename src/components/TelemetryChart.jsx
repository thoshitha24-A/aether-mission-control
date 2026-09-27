import { useMemo, useState } from 'react';
import { AnimatedNumber } from './AnimatedNumber';
import { Panel } from './Panel';
import { Segmented } from './Segmented';
import { useTelemetry } from '../context/TelemetryContext';
import { METRICS, METRIC_ORDER, RANGES, getSeries } from '../data/telemetryData';
import { useWidth } from '../hooks/useWidth';
import { fmtNum, fmtUTC, fmtUTCShort } from '../utils/format';

export function niceTicks(min, max, count = 4) {
  const span = max - min || 1;
  const step0 = span / count;
  const mag = Math.pow(10, Math.floor(Math.log10(step0)));
  const n = step0 / mag;
  const step = (n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10) * mag;
  const lo = Math.floor(min / step) * step, hi = Math.ceil(max / step) * step;
  const ticks = [];
  for (let v = lo; v <= hi + step / 2; v += step) ticks.push(+v.toFixed(10));
  return { ticks, lo, hi, step };
}

export function TelemetryChart({ metric, onMetric, range, onRange, height = 280, title = 'Telemetry history' }) {
  const { buffers, tick, values } = useTelemetry();
  const [wrapRef, width] = useWidth(640);
  const [hi, setHi] = useState(null);
  const m = METRICS[metric];
  const pts = useMemo(() => getSeries(buffers, metric, range), [buffers, metric, range, tick]);
  const W = Math.max(260, width), H = height;
  const padL = 60, padR = 18, padT = 18, padB = 30;
  let lo = Infinity, hiV = -Infinity;
  for (const p of pts) { if (p.v < lo) lo = p.v; if (p.v > hiV) hiV = p.v; }
  if (hiV - lo < 1e-6) { lo -= 1; hiV += 1; }
  const span = hiV - lo;
  const nt = niceTicks(lo - span * 0.12, hiV + span * 0.12, 4);
  const t0 = pts[0].t, t1 = pts[pts.length - 1].t;
  const x = (t) => padL + ((t - t0) / (t1 - t0 || 1)) * (W - padL - padR);
  const y = (v) => padT + (1 - (v - nt.lo) / (nt.hi - nt.lo || 1)) * (H - padT - padB);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${x(p.t).toFixed(1)} ${y(p.v).toFixed(1)}`).join('');
  const area = `${line}L${x(t1).toFixed(1)} ${H - padB}L${x(t0).toFixed(1)} ${H - padB}Z`;
  const xticks = [0, 0.25, 0.5, 0.75, 1].map((f) => t0 + (t1 - t0) * f);
  const fmtT = (t) => (range.id === '5m' ? fmtUTC(new Date(t)) : fmtUTCShort(new Date(t)));
  const limit = m.warn ? (m.warn.below != null ? m.warn.below : m.warn.above) : null;
  const limitIn = limit != null && limit >= nt.lo && limit <= nt.hi;
  const last = pts[pts.length - 1];
  const hp = hi != null ? pts[Math.min(hi, pts.length - 1)] : null;
  const gid = 'cg-' + metric;

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    const t = t0 + ((px - padL) / (W - padL - padR)) * (t1 - t0);
    let best = 0, bd = Infinity;
    for (let i = 0; i < pts.length; i++) { const d = Math.abs(pts[i].t - t); if (d < bd) { bd = d; best = i; } }
    setHi(best);
  };
  const onKey = (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); setHi((h) => Math.max(0, (h == null ? pts.length - 1 : h) - 1)); }
    if (e.key === 'ArrowRight') { e.preventDefault(); setHi((h) => Math.min(pts.length - 1, (h == null ? pts.length - 1 : h) + 1)); }
    if (e.key === 'Escape') setHi(null);
  };
  const metricOpts = METRIC_ORDER.map((k) => ({ id: k, label: METRICS[k].label }));

  return (
    <Panel title={title} instrument className="chart-panel"
      aside={<Segmented options={RANGES.map((r) => ({ id: r.id, label: r.label }))} value={range.id} onChange={(id) => onRange(RANGES.find((r) => r.id === id))} label="Time range" size="sm" />}>
      <div className="chart-top">
        <div className="seg-scroll"><Segmented options={metricOpts} value={metric} onChange={onMetric} label="Metric" /></div>
        <div className="chart-now">
          <span className="label">Current</span>
          <span className="chart-now-val"><AnimatedNumber value={values[metric]} dec={m.dec} /><span className="unit">{m.unit}</span></span>
        </div>
      </div>
      <div className="chart-wrap" ref={wrapRef}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="chart" role="img" tabIndex={0}
          aria-label={`${m.label} over the last ${range.label}. Current ${fmtNum(values[metric], m.dec)} ${m.unit}. Use left and right arrow keys to inspect values.`}
          onPointerMove={onMove} onPointerLeave={() => setHi(null)} onKeyDown={onKey} onBlur={() => setHi(null)}>
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--cyan)" stopOpacity="0.16" />
              <stop offset="1" stopColor="var(--cyan)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {nt.ticks.map((v) => (
            <g key={v}>
              <line x1={padL} x2={W - padR} y1={y(v)} y2={y(v)} className="grid-line" />
              <text x={padL - 10} y={y(v) + 4} className="axis-text" textAnchor="end">{fmtNum(v, nt.step < 1 ? 1 : 0)}</text>
            </g>
          ))}
          {xticks.map((t, i) => (
            <g key={i}>
              <line x1={x(t)} x2={x(t)} y1={padT} y2={H - padB} className="grid-line v" />
              <text x={x(t)} y={H - 9} className="axis-text" textAnchor={i === 0 ? 'start' : i === 4 ? 'end' : 'middle'}>{i === 4 ? 'Now' : fmtT(t)}</text>
            </g>
          ))}
          {limitIn && (
            <g className="limit">
              <line x1={padL} x2={W - padR} y1={y(limit)} y2={y(limit)} />
              <text x={W - padR - 4} y={y(limit) - 6} textAnchor="end">Limit {fmtNum(limit, m.dec)} {m.unit}</text>
            </g>
          )}
          <path d={area} fill={`url(#${gid})`} key={'a' + metric + range.id} className="chart-area" />
          <path d={line} className="chart-line" key={'l' + metric + range.id} pathLength="1" />
          <circle cx={x(last.t)} cy={y(last.v)} r="3.5" className="chart-head" />
          <circle cx={x(last.t)} cy={y(last.v)} r="3.5" className="chart-head-ring" />
          {hp && (
            <g className="chart-cursor">
              <line x1={x(hp.t)} x2={x(hp.t)} y1={padT} y2={H - padB} />
              <circle cx={x(hp.t)} cy={y(hp.v)} r="4" />
            </g>
          )}
        </svg>
        {hp && (
          <div className="chart-tip" style={{ left: x(hp.t), top: y(hp.v), transform: `translate(${x(hp.t) > W * 0.7 ? 'calc(-100% - 12px)' : '12px'}, -50%)` }} role="status">
            <span className="num tip-v">{fmtNum(hp.v, m.dec)} {m.unit}</span>
            <span className="tip-t">UTC {fmtUTC(new Date(hp.t))}</span>
          </div>
        )}
      </div>
    </Panel>
  );
}
