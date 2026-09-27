import { CrewCard } from '../components/CrewCard';
import { PageHead } from '../components/PageHead';
import { CREW } from '../data/crewData';

export function Crew() {
  const counts = CREW.reduce((o, c) => ((o[c.status] = (o[c.status] || 0) + 1), o), {});
  return (
    <div className="page">
      <PageHead title="Crew" desc="Four aboard. Biomedical data is simulated from suit and cabin sensors.">
        <dl className="inline-stats">
          <div><dt>Active</dt><dd className="num">{counts.active || 0}</dd></div>
          <div><dt>Standby</dt><dd className="num">{counts.standby || 0}</dd></div>
          <div><dt>Resting</dt><dd className="num">{counts.rest || 0}</dd></div>
        </dl>
      </PageHead>
      <div className="crew-grid">
        {CREW.map((c, i) => <CrewCard key={c.id} c={c} index={i} />)}
      </div>
    </div>
  );
}
