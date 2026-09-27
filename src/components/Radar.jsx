import { useTelemetry } from '../context/TelemetryContext';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { moonGeometry } from '../lib/orbitalMechanics';
import { clamp, fmtNum, pad } from '../utils/format';

export function Radar() {
  const { values, tick } = useTelemetry();
  const reduced = useReducedMotion();
  const mg = moonGeometry(values.altitude);
  const RANGE = 40000, R = 132, PERIOD = 6;
  const objs = [
    { id: 'moon', name: 'Moon', brg: mg.bearing, range: mg.range, kind: 'body' },
    { id: 'lr2', name: 'Relay LR-2', brg: (212 + tick * 0.02) % 360, range: 31200 - tick * 1.1, kind: 'craft' },
    { id: 'kst', name: 'Kestrel probe', brg: (305 - tick * 0.015 + 360) % 360, range: 17400 + tick * 0.7, kind: 'craft' },
    { id: 'deb', name: 'Object 2291', brg: (48 + tick * 0.04) % 360, range: 9800 + tick * 1.6, kind: 'debris' },
  ];
  const slices = 10, spread = 42;
  const wedges = [];
  for (let i = 0; i < slices; i++) {
    const a0 = (-(i + 1) * spread) / slices, a1 = (-i * spread) / slices;
    const p0 = [R * Math.sin((a0 * Math.PI) / 180), -R * Math.cos((a0 * Math.PI) / 180)];
    const p1 = [R * Math.sin((a1 * Math.PI) / 180), -R * Math.cos((a1 * Math.PI) / 180)];
    wedges.push(<path key={i} d={`M0 0L${p0[0].toFixed(2)} ${p0[1].toFixed(2)}A${R} ${R} 0 0 1 ${p1[0].toFixed(2)} ${p1[1].toFixed(2)}Z`} style={{ opacity: 0.2 * (1 - i / slices) }} />);
  }
  return (
    <div className="radar">
      <svg viewBox="-150 -150 300 300" className="radar-svg" role="img" aria-label={`Proximity radar, ${fmtNum(RANGE)} kilometre range. ${objs.map((o) => `${o.name} bearing ${Math.round(o.brg)} degrees, ${fmtNum(o.range)} km`).join('. ')}`}>
        {[0.25, 0.5, 0.75, 1].map((f) => <circle key={f} r={R * f} className="r-ring" />)}
        {Array.from({ length: 36 }).map((_, i) => {
          const a = (i * 10 * Math.PI) / 180, l = i % 9 === 0 ? 8 : 4;
          return <line key={i} x1={(R + 2) * Math.sin(a)} y1={-(R + 2) * Math.cos(a)} x2={(R + 2 + l) * Math.sin(a)} y2={-(R + 2 + l) * Math.cos(a)} className="r-tick" />;
        })}
        <line x1={-R} x2={R} y1="0" y2="0" className="r-cross" />
        <line y1={-R} y2={R} x1="0" x2="0" className="r-cross" />
        {[['000', 0, -R - 16], ['090', R + 18, 3], ['180', 0, R + 22], ['270', -R - 18, 3]].map(([t, x, y]) => (
          <text key={t} x={x} y={y} textAnchor="middle" className="r-deg">{t}</text>
        ))}
        {[1, 2, 3].map((i) => <text key={i} x="3" y={-R * (i / 4) - 3} className="r-rlabel">{i * 10}k</text>)}
        <g className={'r-sweep' + (reduced ? ' still' : '')} style={{ animationDuration: PERIOD + 's' }}>
          {wedges}
          <line x1="0" y1="0" x2="0" y2={-R} className="r-lead" />
        </g>
        {objs.map((o) => {
          const r = (clamp(o.range, 0, RANGE) / RANGE) * R, a = (o.brg * Math.PI) / 180;
          const x = r * Math.sin(a), y = -r * Math.cos(a);
          return (
            <g key={o.id} className={'r-obj ' + o.kind}>
              <g className={'r-blip' + (reduced ? ' still' : '')} style={{ animationDuration: PERIOD + 's', animationDelay: ((o.brg / 360) * PERIOD).toFixed(2) + 's' }}>
                {o.kind === 'body' ? <circle cx={x} cy={y} r="4.5" /> : o.kind === 'debris' ? <rect x={x - 2.5} y={y - 2.5} width="5" height="5" transform={`rotate(45 ${x} ${y})`} /> : <circle cx={x} cy={y} r="3" />}
              </g>
              <text x={x + 7} y={y + 3}>{o.name}</text>
            </g>
          );
        })}
        <path d="M0 -5L4 3L-4 3Z" className="r-self" />
      </svg>
      <table className="radar-table">
        <thead><tr><th scope="col">Object</th><th scope="col">Bearing</th><th scope="col">Range</th></tr></thead>
        <tbody>
          {objs.map((o) => (
            <tr key={o.id}><td>{o.name}</td><td className="num">{pad(Math.round(o.brg) % 360, 3)}°</td><td className="num">{fmtNum(o.range)} km</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
