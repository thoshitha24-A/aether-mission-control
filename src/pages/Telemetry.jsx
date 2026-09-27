import { useMemo, useState } from 'react';
import { PageHead } from '../components/PageHead';
import { Panel } from '../components/Panel';
import { Radar } from '../components/Radar';
import { StatusDot, StatusPill } from '../components/SystemIndicator';
import { TelemetryStrip } from '../components/TelemetryCard';
import { TelemetryChart } from '../components/TelemetryChart';
import { useTelemetry } from '../context/TelemetryContext';
import { METRICS, METRIC_ORDER, RANGES, metricStatus } from '../data/telemetryData';
import { fmtNum } from '../utils/format';

export function Telemetry() {
  const { values, buffers, tick } = useTelemetry();
  const [metric, setMetric] = useState('velocity');
  const [range, setRange] = useState(RANGES[1]);
  const stats = useMemo(() => {
    const o = {};
    METRIC_ORDER.forEach((k) => {
      const s = buffers.fine[k].slice(-150).map((p) => p.v);
      o[k] = { min: Math.min(...s), max: Math.max(...s) };
    });
    return o;
  }, [buffers, tick]);
  return (
    <div className="page">
      <PageHead title="Telemetry" desc="Housekeeping channels refresh every 2 seconds. Select a channel to plot it.">
        <span className="live"><StatusDot cls="ok" pulse />Live, 0.5 Hz</span>
      </PageHead>
      <TelemetryStrip selected={metric} onSelect={setMetric} />
      <TelemetryChart metric={metric} onMetric={setMetric} range={range} onRange={setRange} height={340} title="Channel history" />
      <div className="g">
        <Panel title="Limits and ranges" className="s8" bodyClass="flush">
          <div className="table-scroll">
            <table className="table">
              <thead><tr><th scope="col">Channel</th><th scope="col">Current</th><th scope="col">5 min low</th><th scope="col">5 min high</th><th scope="col">Nominal range</th><th scope="col">Status</th></tr></thead>
              <tbody>
                {METRIC_ORDER.map((k) => {
                  const m = METRICS[k], st = metricStatus(k, values[k]);
                  return (
                    <tr key={k} className={metric === k ? 'current' : ''} onClick={() => setMetric(k)}>
                      <th scope="row"><button type="button" className="linklike" onClick={() => setMetric(k)}>{m.label}</button></th>
                      <td className="num">{fmtNum(values[k], m.dec)} {m.unit}</td>
                      <td className="num">{fmtNum(stats[k].min, m.dec)}</td>
                      <td className="num">{fmtNum(stats[k].max, m.dec)}</td>
                      <td>{m.nominal}</td>
                      <td><StatusPill cls={st.cls}>{st.label}</StatusPill></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
        <Panel title="Proximity radar" instrument className="s4" aside={<span className="meta num">Range 40,000 km</span>}><Radar /></Panel>
      </div>
    </div>
  );
}
