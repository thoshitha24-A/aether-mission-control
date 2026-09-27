import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ALERT_POOL, seedAlerts } from '../data/alertsData';
import { ACKS, INCOMING_POOL, seedMessages } from '../data/commsData';
import { seedLogs } from '../data/logsData';
import { SUBSYSTEMS_SEED } from '../data/systemsData';
import { uid } from '../utils/format';

export const MissionCtx = createContext(null);

export function MissionProvider({ active, children }) {
  const [logs, setLogs] = useState(seedLogs);
  const [alerts, setAlerts] = useState(seedAlerts);
  const [messages, setMessages] = useState(seedMessages);
  const [subs, setSubs] = useState(() => {
    const now = Date.now();
    const o = {};
    SUBSYSTEMS_SEED.forEach((s) => (o[s.id] = { ...s, checkedAt: now - s.checked * 60000, running: false }));
    return o;
  });
  const [selectedSub, setSelectedSub] = useState('propulsion');
  const [toasts, setToasts] = useState([]);
  const timers = useRef([]);
  const later = useCallback((fn, ms) => { const id = setTimeout(fn, ms); timers.current.push(id); return id; }, []);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const addLog = useCallback((cat, title, detail = '') => {
    setLogs((l) => [{ id: uid('log'), t: Date.now(), cat, title, detail }, ...l]);
  }, []);
  const dismissToast = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const toast = useCallback((t) => {
    const id = uid('toast');
    setToasts((prev) => [...prev.slice(-2), { ...t, id }]);
    later(() => dismissToast(id), t.level === 'critical' ? 9000 : 6000);
  }, [later, dismissToast]);

  const pushAlert = useCallback((a) => {
    const al = { ...a, id: uid('al'), t: Date.now(), read: false };
    setAlerts((prev) => [al, ...prev]);
    addLog('alert', a.title, a.detail);
    if (a.level !== 'info') toast({ level: a.level, title: a.title, detail: a.detail, kind: 'alert' });
  }, [addLog, toast]);

  const alertActions = useMemo(() => ({
    markRead: (id) => setAlerts((p) => p.map((a) => (a.id === id ? { ...a, read: true } : a))),
    dismiss: (id) => setAlerts((p) => p.filter((a) => a.id !== id)),
    markAllRead: () => setAlerts((p) => p.map((a) => ({ ...a, read: true }))),
  }), []);

  // simulated alert schedule, starts once the boot sequence finishes
  useEffect(() => {
    if (!active) return;
    const ids = ALERT_POOL.map((a) => setTimeout(() => pushAlert(a), a.delay * 1000));
    return () => ids.forEach(clearTimeout);
  }, [active, pushAlert]);

  // simulated incoming traffic
  useEffect(() => {
    if (!active) return;
    let i = 0, id;
    const schedule = () => {
      id = setTimeout(() => {
        const [src, text] = INCOMING_POOL[i++ % INCOMING_POOL.length];
        setMessages((m) => [...m, { id: uid('msg'), t: Date.now(), src, text }].slice(-120));
        schedule();
      }, 24000 + Math.random() * 14000);
    };
    schedule();
    return () => clearTimeout(id);
  }, [active]);

  const ackIdx = useRef(0);
  const sendMessage = useCallback((text) => {
    const id = uid('msg');
    setMessages((m) => [...m, { id, t: Date.now(), src: 'control', text, own: true, status: 'uplink' }]);
    later(() => {
      setMessages((m) => m.map((x) => (x.id === id ? { ...x, status: 'delivered' } : x)));
      addLog('communication', 'Uplink delivered', text.length > 80 ? text.slice(0, 79) + '\u2026' : text);
    }, 1280);
    later(() => {
      const ack = ACKS[ackIdx.current++ % ACKS.length];
      setMessages((m) => [...m, { id: uid('msg'), t: Date.now(), src: 'craft', text: ack }]);
    }, 3000);
  }, [later, addLog]);

  const runDiagnostic = useCallback((sid) => {
    setSubs((s) => ({ ...s, [sid]: { ...s[sid], running: true } }));
    later(() => {
      setSubs((s) => {
        const cur = s[sid];
        const health = sid === 'thermal' ? Math.min(86, cur.health + 1.6) : Math.min(99.9, cur.health + 0.3);
        return { ...s, [sid]: { ...cur, running: false, checkedAt: Date.now(), health } };
      });
      const name = SUBSYSTEMS_SEED.find((x) => x.id === sid).name;
      const stillWarn = sid === 'thermal';
      addLog('system', `${name} diagnostic complete`, stillWarn ? 'Loop B 38.1 °C. Caution remains until the burn attitude is reached.' : 'All checks passed.');
      toast({ level: stillWarn ? 'warning' : 'info', title: `${name} diagnostic complete`, detail: stillWarn ? 'Caution remains on loop B.' : 'All checks passed.' });
    }, 1900);
  }, [later, addLog, toast]);

  const value = useMemo(() => ({
    logs, addLog, alerts, alertActions, messages, sendMessage, subs, runDiagnostic,
    selectedSub, setSelectedSub, toasts, dismissToast,
  }), [logs, addLog, alerts, alertActions, messages, sendMessage, subs, runDiagnostic, selectedSub, toasts, dismissToast]);
  return <MissionCtx.Provider value={value}>{children}</MissionCtx.Provider>;
}

export const useMission = () => useContext(MissionCtx);
