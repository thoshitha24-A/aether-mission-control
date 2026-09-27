import { useEffect, useMemo, useRef, useState } from 'react';
import { PAGES } from '../App';
import { AlertDrawer, Toasts } from './AlertPanel';
import { CommandPalette } from './CommandPalette';
import { BottomNav, MoreSheet } from './MobileNav';
import { Sidebar } from './Sidebar';
import { StatusBar } from './StatusBar';
import { TopBar } from './TopBar';
import { useMission } from '../context/MissionContext';
import { useHashRoute } from '../hooks/useHashRoute';

export function Shell({ booting, replayBoot }) {
  const [route, navigate] = useHashRoute();
  const [collapsed, setCollapsed] = useState(false);
  const [palette, setPalette] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [more, setMore] = useState(false);
  const { alerts } = useMission();
  const unread = alerts.filter((a) => !a.read).length;
  const mainRef = useRef(null);
  const first = useRef(true);

  useEffect(() => {
    const k = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        if (booting) return;
        e.preventDefault();
        setPalette((p) => !p);
      }
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [booting]);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (mainRef.current) mainRef.current.scrollTop = 0;
    const h = mainRef.current && mainRef.current.querySelector('h1');
    h && h.focus({ preventScroll: true });
  }, [route]);

  const commands = useMemo(() => [
    { id: 'go-telemetry', label: 'Navigate to telemetry', group: 'Go to', icon: 'activity', run: () => navigate('telemetry'), keywords: 'charts data' },
    { id: 'go-spacecraft', label: 'Open spacecraft', group: 'Go to', icon: 'craft', run: () => navigate('spacecraft'), keywords: 'vehicle subsystems' },
    { id: 'go-orbit', label: 'View orbit', group: 'Go to', icon: 'orbit', run: () => navigate('orbit'), keywords: 'trajectory map' },
    { id: 'go-comms', label: 'Open communications', group: 'Go to', icon: 'radio', run: () => navigate('comms'), keywords: 'messages radio' },
    { id: 'go-logs', label: 'Mission logs', group: 'Go to', icon: 'list', run: () => navigate('logs'), keywords: 'events timeline' },
    { id: 'go-crew', label: 'Open crew', group: 'Go to', icon: 'users', run: () => navigate('crew'), keywords: 'astronauts' },
    { id: 'go-overview', label: 'Mission overview', group: 'Go to', icon: 'overview', run: () => navigate('overview'), keywords: 'dashboard home' },
    { id: 'status', label: 'System status', group: 'Go to', icon: 'pulse', run: () => navigate('spacecraft'), keywords: 'health' },
    { id: 'alerts', label: 'Open alert center', group: 'Action', icon: 'bell', run: () => setAlertsOpen(true), keywords: 'notifications warnings' },
    { id: 'sidebar', label: collapsed ? 'Expand sidebar' : 'Collapse sidebar', group: 'Action', icon: 'panel', run: () => setCollapsed((c) => !c) },
    { id: 'boot', label: 'Replay boot sequence', group: 'Action', icon: 'play', run: replayBoot, keywords: 'initialize startup' },
  ], [navigate, collapsed, replayBoot]);

  const Page = PAGES[route];
  return (
    <div className={'shell' + (collapsed ? ' collapsed' : '')} aria-hidden={booting ? 'true' : undefined} inert={booting ? '' : undefined}>
      <a href="#main" className="skip" onClick={(e) => { e.preventDefault(); mainRef.current && mainRef.current.focus(); }}>Skip to content</a>
      <TopBar collapsed={collapsed} onToggleSidebar={() => setCollapsed((c) => !c)} onPalette={() => setPalette(true)} onAlerts={() => setAlertsOpen(true)} unread={unread} />
      <Sidebar route={route} navigate={navigate} collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <main className="main" id="main" ref={mainRef} tabIndex={-1}>
        <div key={route} className="page-wrap"><Page navigate={navigate} /></div>
      </main>
      <StatusBar />
      <BottomNav route={route} navigate={navigate} onMore={() => setMore(true)} moreOpen={more} />
      <MoreSheet open={more} onClose={() => setMore(false)} route={route} navigate={navigate} onPalette={() => setPalette(true)} onAlerts={() => setAlertsOpen(true)} unread={unread} />
      <AlertDrawer open={alertsOpen} onClose={() => setAlertsOpen(false)} navigate={navigate} />
      <CommandPalette open={palette} onClose={() => setPalette(false)} commands={commands} />
      <Toasts onView={() => setAlertsOpen(true)} />
    </div>
  );
}
