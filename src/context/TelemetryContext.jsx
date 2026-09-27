import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { TICK_MS, initTelemetry, stepTelemetry } from '../data/telemetryData';

export const TelemetryCtx = createContext(null);

export function TelemetryProvider({ children }) {
  const store = useRef(null);
  if (!store.current) store.current = initTelemetry();
  const [snap, setSnap] = useState(() => ({ values: { ...store.current.values }, prev: { ...store.current.prev }, tick: 0 }));
  useEffect(() => {
    const id = setInterval(() => {
      stepTelemetry(store.current);
      setSnap({ values: { ...store.current.values }, prev: { ...store.current.prev }, tick: store.current.tick });
    }, TICK_MS);
    return () => clearInterval(id);
  }, []);
  const value = useMemo(() => ({ ...snap, buffers: store.current }), [snap]);
  return <TelemetryCtx.Provider value={value}>{children}</TelemetryCtx.Provider>;
}

export const useTelemetry = () => useContext(TelemetryCtx);
