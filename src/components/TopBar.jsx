import { Icon } from './Icon';
import { StatusPill } from './SystemIndicator';
import { UTCClock } from './UTCClock';
import { useMission } from '../context/MissionContext';
import { useNow } from '../context/TimeContext';
import { LAUNCH_AT, MISSION } from '../data/missionData';
import { fmtMET } from '../utils/format';

export function TopBar({ collapsed, onToggleSidebar, onPalette, onAlerts, unread }) {
  const now = useNow();
  const { alerts } = useMission();
  const critical = alerts.some((a) => a.level === 'critical');
  return (
    <header className="topbar">
      <button type="button" className="btn icon ghost sb-toggle" onClick={onToggleSidebar} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-expanded={!collapsed} title="Toggle sidebar">
        <Icon name="panel" />
      </button>
      <div className="brand" aria-label="AETHER mission control">
        <svg viewBox="0 0 32 32" width="26" height="26" aria-hidden="true" className="brand-mark">
          <circle cx="16" cy="16" r="4.5" />
          <ellipse cx="16" cy="16" rx="14" ry="6" transform="rotate(-28 16 16)" />
          <circle cx="27.4" cy="10" r="1.8" className="bm-dot" />
        </svg>
        <span className="brand-word">AETHER</span>
        <span className="brand-sub">Mission control</span>
      </div>
      <div className="tb-mission">
        <span className="num">{MISSION.code}</span>
        <span className="tb-name">{MISSION.name}</span>
        <StatusPill cls={critical ? 'crit' : 'ok'}>{critical ? 'Critical' : 'Nominal'}</StatusPill>
      </div>
      <div className="tb-right">
        <button type="button" className="cmdk" onClick={onPalette} aria-label="Open command palette" aria-keyshortcuts="Control+K">
          <Icon name="search" size={15} /><span className="cmdk-text">Search AETHER</span><kbd>Ctrl K</kbd>
        </button>
        <button type="button" className="btn icon ghost bell" onClick={onAlerts} aria-label={`Alerts, ${unread} unread`}>
          <Icon name="bell" />
          {unread > 0 && <span className="badge num" aria-hidden="true">{unread}</span>}
        </button>
        <div className="tb-clocks">
          <div><span className="label">UTC</span><UTCClock /></div>
          <div className="hide-md"><span className="label">MET</span><span className="num">{fmtMET(now - LAUNCH_AT)}</span></div>
        </div>
      </div>
    </header>
  );
}
