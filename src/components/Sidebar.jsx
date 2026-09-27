import { Icon } from './Icon';
import { useMission } from '../context/MissionContext';
import { useNow } from '../context/TimeContext';
import { LOI_AT } from '../data/missionData';
import { NAV } from '../data/navigation';
import { fmtDur } from '../utils/format';

export function Sidebar({ route, navigate, collapsed, onToggle }) {
  const now = useNow();
  const { alerts } = useMission();
  return (
    <nav className="sidebar" aria-label="Primary">
      <ul className="nav">
        {NAV.map((n) => (
          <li key={n.id}>
            <a href={'#/' + n.id} className={'nav-item' + (route === n.id ? ' active' : '')} aria-current={route === n.id ? 'page' : undefined}
              onClick={(e) => { e.preventDefault(); navigate(n.id); }} title={collapsed ? n.label : undefined}>
              <Icon name={n.icon} />
              <span className="nav-label">{n.label}</span>
              {n.id === 'spacecraft' && <span className="nav-flag warn" aria-label="1 caution" />}
            </a>
          </li>
        ))}
      </ul>
      <div className="sb-foot">
        <div className="sb-event">
          <span className="label">Next event</span>
          <span className="sb-ev-name">LOI burn</span>
          <span className="num sb-ev-t">T&minus;{fmtDur(LOI_AT - now)}</span>
        </div>
        <button type="button" className="btn ghost sb-collapse" onClick={onToggle} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          <Icon name="panel" size={16} /><span className="nav-label">{collapsed ? 'Expand' : 'Collapse'}</span>
        </button>
      </div>
    </nav>
  );
}
