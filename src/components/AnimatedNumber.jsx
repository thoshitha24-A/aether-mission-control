import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { fmtNum } from '../utils/format';

export function AnimatedNumber({ value, dec = 0, className = 'num' }) {
  const reduced = useReducedMotion();
  const [disp, setDisp] = useState(value);
  const cur = useRef(value);
  const raf = useRef(0);
  useEffect(() => {
    if (reduced) { cur.current = value; setDisp(value); return; }
    const from = cur.current, to = value, t0 = performance.now(), D = 700;
    cancelAnimationFrame(raf.current);
    const step = (t) => {
      const k = Math.min(1, (t - t0) / D);
      const e = 1 - Math.pow(1 - k, 3);
      cur.current = from + (to - from) * e;
      setDisp(cur.current);
      if (k < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [value, reduced]);
  return <span className={className}>{fmtNum(disp, dec)}</span>;
}
