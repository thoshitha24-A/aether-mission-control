import { memo, useMemo } from 'react';
import { AnimatedNumber } from './AnimatedNumber';
import { Sparkline } from './Sparkline';
import { StatusDot } from './SystemIndicator';
import { useTelemetry } from '../context/TelemetryContext';
import { METRICS, METRIC_ORDER, metricStatus } from '../data/telemetryData';
import { fmtNum } from '../utils/format';

export function trendLabel(k, hist, value) {
  if (hist.length < 31) return 'Steady';
  const d = value - hist[hist.length - 31];
  const m = METRICS[k];
  const thr = m.dec ? 0.05 : 0.5;
  if (Math.abs(d) < thr) return 'Steady';
  return `${d > 0 ? '+' : '\u2212'}${fmtNum(Math.abs(d), m.dec)} ${m.unit} per min`;
}

export const TelemetryCard = memo(function TelemetryCard({ k, value, hist, selected, onSelect }) {
  const m = METRICS[k];
  const st = metricStatus(k, value);
  return (
    <button type="button" className={'tcard ' + st.cls} aria-pressed={!!selected} onClick={() => onSelect && onSelect(k)}
      aria-label={`${m.label}: ${fmtNum(value, m.dec)} ${m.unit}. ${st.label}. Show on chart`}>
      <span className="tc-top"><span className="label">{m.label}</span><StatusDot cls={st.cls} /></span>
      <span className="tc-val"><AnimatedNumber value={value} dec={m.dec} className="num" /><span className="unit">{m.unit}</span></span>
      <span className="tc-sub">{m.sub}</span>
      <span className="tc-foot"><span className="tc-trend num">{trendLabel(k, hist, value)}</span><Sparkline data={hist.slice(-60)} /></span>
    </button>
  );
});

export function TelemetryStrip({ selected, onSelect }) {
  const { values, buffers, tick } = useTelemetry();
  const hists = useMemo(() => {
    const o = {};
    METRIC_ORDER.forEach((k) => (o[k] = buffers.fine[k].slice(-61).map((p) => p.v)));
    return o;
  }, [buffers, tick]);
  return (
    <div className="tstrip" role="group" aria-label="Live telemetry">
      {METRIC_ORDER.map((k) => (
        <TelemetryCard key={k} k={k} value={values[k]} hist={hists[k]} selected={selected === k} onSelect={onSelect} />
      ))}
    </div>
  );
}
