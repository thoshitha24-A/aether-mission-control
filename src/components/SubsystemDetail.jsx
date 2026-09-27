import { AnimatedNumber } from './AnimatedNumber';
import { Icon } from './Icon';
import { StatusPill } from './SystemIndicator';
import { useTelemetry } from '../context/TelemetryContext';
import { useNow } from '../context/TimeContext';
import { STATUS_META } from '../data/systemsData';
import { ago, fmtNum } from '../utils/format';

export function SubsystemDetail({ s, onRun }) {
  const { tick } = useTelemetry();
  const now = useNow();
  const meta = STATUS_META[s.status];
  const temp = s.temp + (((tick * 7 + s.id.length) % 5) - 2) * 0.1;
  return (
    <div className="sub-detail" aria-live="polite">
      <div className="sd-head">
        <div><span className="label">Subsystem</span><h2>{s.name}</h2></div>
        <StatusPill cls={meta.cls}>{meta.label}</StatusPill>
      </div>
      <p className="muted">{s.desc}</p>
      <div className="sd-stats">
        <div><span className="label">Health</span><span className="sd-v"><AnimatedNumber value={s.health} dec={1} /><span className="unit">%</span></span>
          <span className="bar"><i style={{ width: s.health + '%' }} className={meta.cls} /></span></div>
        <div><span className="label">Temperature</span><span className="sd-v"><AnimatedNumber value={temp} dec={1} /><span className="unit">°C</span></span></div>
        <div><span className="label">{s.power < 0 ? 'Power output' : 'Power draw'}</span><span className="sd-v"><span className="num">{fmtNum(Math.abs(s.power), 2)}</span><span className="unit">kW</span></span></div>
        <div><span className="label">Last check</span><span className="sd-v small num">{ago(now - s.checkedAt)}</span></div>
      </div>
      <dl className="kv">
        {s.metrics.map(([k, v]) => <div key={k}><dt>{k}</dt><dd className="num">{v}</dd></div>)}
      </dl>
      <button type="button" className={'btn primary wide' + (s.running ? ' busy' : '')} onClick={() => onRun(s.id)} disabled={s.running}>
        {s.running ? <><span className="spinner" aria-hidden="true" />Running diagnostic</> : <><Icon name="pulse" size={15} />Run diagnostic</>}
      </button>
      {s.running && <div className="indet" aria-hidden="true"><i /></div>}
    </div>
  );
}
