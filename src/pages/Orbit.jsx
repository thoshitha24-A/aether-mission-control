import { useState } from 'react';
import { OrbitalMap } from '../components/OrbitalMap';
import { PageHead } from '../components/PageHead';
import { Panel } from '../components/Panel';
import { Segmented } from '../components/Segmented';
import { useTelemetry } from '../context/TelemetryContext';
import { useNow } from '../context/TimeContext';
import { LOI_AT, MISSION, PHASES, missionProgress } from '../data/missionData';
import { CIS, LUN, moonGeometry } from '../lib/orbitalMechanics';
import { fmtDur, fmtNum, pad } from '../utils/format';

export function Orbit() {
  const now = useNow();
  const { values } = useTelemetry();
  const [mode, setMode] = useState('cislunar');
  const progress = missionProgress(now);
  const mg = moonGeometry(values.altitude);
  const elements = mode === 'cislunar'
    ? [['Apoapsis', '393,629 km'], ['Periapsis', '207 km'], ['Orbital period', '10 d 13 h 23 min'], ['Inclination', '28.7°'], ['Eccentricity', CIS.e.toFixed(4)], ['Distance from Earth', `${fmtNum(values.altitude)} km`], ['Distance to Moon', `${fmtNum(mg.range)} km`]]
    : [['Aposelene', '3,000 km'], ['Periselene', '100 km'], ['Orbital period', '4 h 41 min'], ['Inclination', '90.0° polar'], ['Eccentricity', LUN.e.toFixed(4)], ['Insertion \u0394v', `${MISSION.loiDv} m/s`], ['Burn starts', `T\u2212${fmtDur(LOI_AT - now)}`]];
  const segs = 24, filled = Math.round((progress / 100) * segs);
  return (
    <div className="page">
      <PageHead title="Orbit" desc="Trajectory, orbital elements and mission phase. Switch views to compare the current transfer orbit with the planned lunar orbit.">
        <Segmented options={[{ id: 'cislunar', label: 'Transfer orbit' }, { id: 'lunar', label: 'Lunar arrival' }]} value={mode} onChange={setMode} label="Orbit view" />
      </PageHead>
      <div className="g">
        <Panel title={mode === 'cislunar' ? 'Earth-centred view' : 'Moon-centred view'} instrument className="s8 map-panel" bodyClass="flush">
          <OrbitalMap mode={mode} />
        </Panel>
        <div className="s4 stack">
          <Panel title="Current phase" instrument>
            <div className="phase-now">Lunar orbit insertion</div>
            <p className="muted">Approach leg. Main engine burn at periselene in <span className="num">T&minus;{fmtDur(LOI_AT - now)}</span>.</p>
            <div className="progress-head"><span className="label">Mission progress</span><span className="num">{progress.toFixed(1)} %</span></div>
            <div className="seg-bar" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100} aria-label="Mission progress">
              {Array.from({ length: segs }).map((_, i) => <i key={i} className={i < filled ? 'on' : ''} />)}
            </div>
          </Panel>
          <Panel title={mode === 'cislunar' ? 'Transfer orbit elements' : 'Target orbit elements'}>
            <dl className="kv">
              {elements.map(([k, v]) => <div key={k}><dt>{k}</dt><dd className="num">{v}</dd></div>)}
            </dl>
          </Panel>
        </div>
      </div>
      <Panel title="Mission phases">
        <ol className="phases">
          {PHASES.map((p, i) => (
            <li key={p.id} className={'ph ' + p.state} aria-current={p.state === 'current' ? 'step' : undefined}>
              <span className="ph-n num">{pad(i + 1)}</span>
              <span className="ph-name">{p.name}</span>
              <span className="ph-when">{p.state === 'current' ? `Burn in T\u2212${fmtDur(LOI_AT - now)}` : p.when}</span>
            </li>
          ))}
        </ol>
      </Panel>
    </div>
  );
}
