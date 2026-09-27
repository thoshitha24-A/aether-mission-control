import { useState } from 'react';
import { AnimatedNumber } from '../components/AnimatedNumber';
import { MissionTimeline } from '../components/MissionTimeline';
import { OrbitalMap } from '../components/OrbitalMap';
import { Panel } from '../components/Panel';
import { Radar } from '../components/Radar';
import { StatusDot, StatusPill } from '../components/SystemIndicator';
import { TelemetryStrip } from '../components/TelemetryCard';
import { TelemetryChart } from '../components/TelemetryChart';
import { useMission } from '../context/MissionContext';
import { useTelemetry } from '../context/TelemetryContext';
import { useNow } from '../context/TimeContext';
import { CHANNELS } from '../data/commsData';
import { LAUNCH_AT, LOI_AT, MISSION, missionProgress } from '../data/missionData';
import { STATUS_META } from '../data/systemsData';
import { RANGES } from '../data/telemetryData';
import { moonGeometry } from '../lib/orbitalMechanics';
import { fmtDur, fmtMET, fmtNum, fmtUTC } from '../utils/format';

export function Situation({ navigate }) {
  const { values } = useTelemetry();
  const now = useNow();
  const { subs, setSelectedSub, alerts } = useMission();
  const mg = moonGeometry(values.altitude);
  const cautions = Object.values(subs).filter((s) => s.status === 'warning' || s.status === 'critical');
  const critical = alerts.some((a) => a.level === 'critical');
  const inspect = (id) => { setSelectedSub(id); navigate('spacecraft'); };
  return (
    <Panel title="Situation" instrument className="situation" bodyClass="sit-body">
      <div className="sit-block">
        <h3 className="sit-q">Where it is</h3>
        <div className="sit-big"><AnimatedNumber value={values.altitude} /><span className="unit">km from Earth</span></div>
        <div className="sit-row"><span>Distance to Moon</span><span className="num">{fmtNum(mg.range)} km</span></div>
        <div className="sit-row"><span>Velocity</span><span className="num">{fmtNum(values.velocity)} km/h</span></div>
      </div>
      <div className="sit-block">
        <h3 className="sit-q">What it is doing</h3>
        <div className="sit-phase">Lunar orbit insertion, approach</div>
        <div className="sit-count"><span className="label">Main engine burn in</span><span className="num count">T&minus;{fmtDur(LOI_AT - now)}</span></div>
        <div className="sit-row"><span>Burn</span><span className="num">{MISSION.loiDuration} s, &Delta;v {MISSION.loiDv} m/s</span></div>
      </div>
      <div className="sit-block">
        <h3 className="sit-q">Is everything OK</h3>
        <div className={'sit-verdict ' + (critical ? 'crit' : cautions.length ? 'warn' : 'ok')}>
          <StatusDot cls={critical ? 'crit' : cautions.length ? 'warn' : 'ok'} pulse={critical} />
          {critical ? 'Critical alert active' : cautions.length ? `Nominal with ${cautions.length} caution` : 'All systems nominal'}
        </div>
        <ul className="sys-chips" aria-label="Subsystem status">
          {Object.values(subs).map((s) => (
            <li key={s.id}>
              <button type="button" className={'sys-chip ' + STATUS_META[s.status].cls} onClick={() => inspect(s.id)} aria-label={`${s.name}: ${STATUS_META[s.status].label}. Inspect`}>
                <StatusDot cls={STATUS_META[s.status].cls} />{s.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  );
}

export function RecentComms({ navigate }) {
  const { messages } = useMission();
  const last = messages.slice(-4).reverse();
  return (
    <Panel title="Latest traffic" aside={<button type="button" className="btn sm" onClick={() => navigate('comms')}>Open console</button>}>
      <ul className="mini-msgs">
        {last.map((m) => (
          <li key={m.id}>
            <span className="num mm-t">{fmtUTC(new Date(m.t))}</span>
            <span className={'mm-src src-' + m.src}>{CHANNELS[m.src].label}</span>
            <span className="mm-text">{m.text}</span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export function Overview({ navigate }) {
  const now = useNow();
  const { logs, alerts } = useMission();
  const [metric, setMetric] = useState('altitude');
  const [range, setRange] = useState(RANGES[0]);
  const critical = alerts.some((a) => a.level === 'critical');
  return (
    <div className="page">
      <header className="mission-head">
        <div className="mh-id">
          <h1 tabIndex={-1}>Mission control</h1>
          <p className="mh-name"><span className="num">{MISSION.code}</span> {MISSION.name}</p>
        </div>
        <dl className="mh-facts">
          <div><dt>Status</dt><dd><StatusPill cls={critical ? 'crit' : 'ok'}>{critical ? 'Critical' : 'Nominal'}</StatusPill></dd></div>
          <div><dt>Mission elapsed</dt><dd className="num">T+ {fmtMET(now - LAUNCH_AT)}</dd></div>
          <div><dt>Progress</dt><dd className="num">{missionProgress(now).toFixed(1)} %</dd></div>
          <div className="hide-sm"><dt>Ground station</dt><dd>{MISSION.station}</dd></div>
        </dl>
      </header>

      <div className="g">
        <Panel title="Cislunar trajectory" instrument className="s8 map-panel" bodyClass="flush"
          aside={<button type="button" className="btn sm" onClick={() => navigate('orbit')}>Orbit detail</button>}>
          <OrbitalMap mode="cislunar" />
        </Panel>
        <div className="s4"><Situation navigate={navigate} /></div>
      </div>

      <TelemetryStrip selected={metric} onSelect={setMetric} />

      <div className="g">
        <div className="s8"><TelemetryChart metric={metric} onMetric={setMetric} range={range} onRange={setRange} height={260} /></div>
        <Panel title="Proximity radar" instrument className="s4" aside={<span className="meta num">Range 40,000 km</span>}><Radar /></Panel>
      </div>

      <div className="g">
        <Panel title="Recent events" className="s7" aside={<button type="button" className="btn sm" onClick={() => navigate('logs')}>All logs</button>}>
          <MissionTimeline items={logs.slice(0, 6)} compact />
        </Panel>
        <div className="s5"><RecentComms navigate={navigate} /></div>
      </div>
    </div>
  );
}
