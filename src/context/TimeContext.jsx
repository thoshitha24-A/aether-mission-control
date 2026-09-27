import { createContext, useContext, useEffect, useState } from 'react';

export const TimeCtx = createContext(Date.now());

export function TimeProvider({ children }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return <TimeCtx.Provider value={now}>{children}</TimeCtx.Provider>;
}

export const useNow = () => useContext(TimeCtx);
