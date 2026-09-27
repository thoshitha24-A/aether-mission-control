import { useReducedMotion } from '../hooks/useReducedMotion';

export function SignalWave({ strength }) {
  const reduced = useReducedMotion();
  const amp = 4 + (strength / 100) * 10;
  let d = 'M0 20';
  for (let x = 0; x <= 400; x += 4) d += `L${x} ${(20 + Math.sin(x / 11) * amp * Math.sin(x / 57 + 1)).toFixed(1)}`;
  return (
    <svg viewBox="0 0 200 40" preserveAspectRatio="none" className="wave" aria-hidden="true">
      <g className={reduced ? '' : 'wave-move'}><path d={d} /></g>
    </svg>
  );
}
