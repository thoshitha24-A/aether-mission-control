import { PageHead } from '../components/PageHead';
import { Panel } from '../components/Panel';
import { SpacecraftViewer } from '../components/SpacecraftViewer';
import { SubsystemDetail } from '../components/SubsystemDetail';
import { StatusPill } from '../components/SystemIndicator';
import { useMission } from '../context/MissionContext';
import { STATUS_META } from '../data/systemsData';
import { fmtNum } from '../utils/format';

export function Spacecraft() {
  const { subs, selectedSub, setSelectedSub, runDiagnostic } = useMission();
  const s = subs[selectedSub] || subs.propulsion;
  return (
    <div className="page">
      <PageHead title="Spacecraft" desc="AETHER-7 Pathfinder. Select any part of the vehicle, or a row below, to inspect its subsystem." />
      <div className="g">
        <Panel title="Vehicle" instrument className="s8" bodyClass="flush craft-body">
          <SpacecraftViewer subs={subs} selected={s.id} onSelect={setSelectedSub} />
        </Panel>
        <Panel title="Inspection" instrument className="s4"><SubsystemDetail s={s} onRun={runDiagnostic} /></Panel>
      </div>
      <Panel title="All subsystems" bodyClass="flush">
        <div className="table-scroll">
          <table className="table sys-table">
            <thead><tr><th scope="col">Subsystem</th><th scope="col">Status</th><th scope="col">Health</th><th scope="col">Temperature</th><th scope="col">Power</th><th scope="col"><span className="sr">Action</span></th></tr></thead>
            <tbody>
              {Object.values(subs).map((x) => (
                <tr key={x.id} className={x.id === s.id ? 'current' : ''}>
                  <th scope="row">{x.name}</th>
                  <td><StatusPill cls={STATUS_META[x.status].cls}>{STATUS_META[x.status].label}</StatusPill></td>
                  <td><span className="cell-bar"><span className="num">{x.health.toFixed(1)} %</span><span className="bar"><i style={{ width: x.health + '%' }} className={STATUS_META[x.status].cls} /></span></span></td>
                  <td className="num">{fmtNum(x.temp, 1)} °C</td>
                  <td className="num">{x.power < 0 ? '+' : ''}{fmtNum(Math.abs(x.power), 2)} kW</td>
                  <td className="right"><button type="button" className="btn sm" onClick={() => setSelectedSub(x.id)} aria-pressed={x.id === s.id}>Inspect</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
