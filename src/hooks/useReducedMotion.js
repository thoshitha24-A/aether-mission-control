import { useEffect, useState } from 'react';

export const mq = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

export function useReducedMotion() {
  const [r, setR] = useState(mq ? mq.matches : false);
  useEffect(() => {
    if (!mq) return;
    const f = () => setR(mq.matches);
    mq.addEventListener ? mq.addEventListener('change', f) : mq.addListener(f);
    return () => (mq.removeEventListener ? mq.removeEventListener('change', f) : mq.removeListener(f));
  }, []);
  return r;
}
