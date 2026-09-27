import { useState } from 'react';
import { Icon } from './Icon';
import { Segmented } from './Segmented';
import { useMission } from '../context/MissionContext';
import { useNow } from '../context/TimeContext';
import { LEVEL_META } from '../data/alertsData';
import { SUBSYSTEMS_SEED } from '../data/systemsData';
import { useDialog } from '../hooks/useDialog';
import { ago, fmtUTC } from '../utils/format';

export function AlertDrawer({ open, onClose, navigate }) {
  const { alerts, alertActions, setSelectedSub } = useMission();
  const now = useNow();
  const [tab, setTab] = useState('all');
  const ref = useDialog(open, onClose);
  const list = tab === 'unread' ? alerts.filter((a) => !a.read) : alerts;
  const unread = alerts.filter((a) => !a.read).length;
  return (
    <div className={'drawer-wrap' + (open ? ' open' : '')} aria-hidden={!open} inert={!open ? '' : undefined}>
      <div className="scrim" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-labelledby="alerts-title" ref={ref}>
        <div className="drawer-head">
          <h2 id="alerts-title">Alerts</h2>
          <button type="button" className="btn icon ghost" onClick={onClose} aria-label="Close alerts" data-autofocus><Icon name="x" /></button>
        </div>
        <div className="drawer-tools">
          <Segmented options={[{ id: 'all', label: `All ${alerts.length}` }, { id: 'unread', label: `Unread ${unread}` }]} value={tab} onChange={setTab} label="Show" size="sm" />
          <button type="button" className="btn sm" onClick={alertActions.markAllRead} disabled={!unread}>Mark all as read</button>
        </div>
        <ul className="alert-list">
          {list.map((a) => {
            const lm = LEVEL_META[a.level];
            return (
              <li key={a.id} className={'alert ' + lm.cls + (a.read ? ' read' : '')}>
                <Icon name={lm.icon} size={18} className="al-icon" />
                <div className="al-body">
                  <div className="al-top"><span className="al-level">{lm.label}</span><time className="num">{fmtUTC(new Date(a.t))}, {ago(now - a.t)}</time></div>
                  <h3>{a.title}</h3>
                  <p>{a.detail}</p>
                  <div className="al-actions">
                    {a.system && <button type="button" className="btn sm" onClick={() => { setSelectedSub(a.system); alertActions.markRead(a.id); navigate('spacecraft'); onClose(); }}>Inspect {SUBSYSTEMS_SEED.find((s) => s.id === a.system).name.toLowerCase()}</button>}
                    {!a.read && <button type="button" className="btn sm ghost" onClick={() => alertActions.markRead(a.id)}><Icon name="check" size={13} />Mark as read</button>}
                    <button type="button" className="btn sm ghost" onClick={() => alertActions.dismiss(a.id)}>Dismiss</button>
                  </div>
                </div>
                {!a.read && <span className="unread-dot" aria-label="Unread" />}
              </li>
            );
          })}
          {!list.length && <li className="empty">{tab === 'unread' ? 'Everything is read. New alerts will appear here as they are raised.' : 'No active alerts. New alerts will appear here as they are raised.'}</li>}
        </ul>
      </aside>
    </div>
  );
}

export function Toasts({ onView }) {
  const { toasts, dismissToast } = useMission();
  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((t) => {
        const lm = LEVEL_META[t.level] || LEVEL_META.info;
        return (
          <div key={t.id} className={'toast ' + lm.cls}>
            <Icon name={lm.icon} size={17} className="al-icon" />
            <div className="toast-body">
              <strong>{t.title}</strong>
              {t.detail && <span>{t.detail}</span>}
              {t.kind === 'alert' && <button type="button" className="linklike" onClick={() => { dismissToast(t.id); onView(); }}>View in alert center</button>}
            </div>
            <button type="button" className="btn icon ghost sm" onClick={() => dismissToast(t.id)} aria-label="Dismiss notification"><Icon name="x" size={14} /></button>
          </div>
        );
      })}
    </div>
  );
}
