import { AnimatedNumber } from './AnimatedNumber';
import { StatusDot } from './SystemIndicator';
import { UTCClock } from './UTCClock';
import { useMission } from '../context/MissionContext';
import { useTelemetry } from '../context/TelemetryContext';
import { MISSION } from '../data/missionData';

export function StatusBar() {
  const { values } = useTelemetry();
  const { alerts, subs } = useMission();
  const critical = alerts.some((a) => a.level === 'critical');
  const cautions = Object.values(subs).filter((s) => s.status === 'warning').length;
  return (
    <footer className="statusbar" aria-label="System status">
      <div className="sb-item"><span className="label">System</span><StatusDot cls={critical ? 'crit' : 'ok'} /><span>{critical ? 'Critical' : 'Nominal'}</span>{cautions > 0 && <span className="warn-t">{cautions} caution</span>}</div>
      <div className="sb-item"><span className="label">Power</span><AnimatedNumber value={values.power} dec={1} /><span className="u">%</span></div>
      <div className="sb-item"><span className="label">Signal</span><AnimatedNumber value={values.signal} dec={1} /><span className="u">%</span></div>
      <div className="sb-item"><span className="label">Network</span><StatusDot cls="ok" /><span>Connected</span></div>
      <div className="sb-item hide-md"><span className="label">Station</span><span>{MISSION.station}</span></div>
      <div className="sb-item sb-end"><span className="label">UTC</span><UTCClock /></div>
    </footer>
  );
}
