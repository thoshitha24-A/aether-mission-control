import { useCallback, useEffect, useRef, useState } from 'react';
import { MISSION } from '../data/missionData';
import { useReducedMotion } from '../hooks/useReducedMotion';

export const BOOT_LINES = ['Core system', 'Navigation', 'Telemetry', 'Communication', 'Orbital system', 'Crew interface'];

export function Boot({ onDone }) {
  const reduced = useReducedMotion();
  const [n, setN] = useState(0);
  const [pct, setPct] = useState(0);
  const [ready, setReady] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const done = useRef(false);
  const finish = useCallback(() => {
    if (done.current) return;
    done.current = true;
    setLeaving(true);
    setTimeout(onDone, reduced ? 60 : 700);
  }, [onDone, reduced]);
  useEffect(() => {
    const step = reduced ? 80 : 330;
    const timers = BOOT_LINES.map((_, i) => setTimeout(() => setN(i + 1), 450 + step * (i + 1)));
    const total = 450 + step * (BOOT_LINES.length + 1);
    const t0 = performance.now();
    let raf;
    const f = (t) => {
      const k = Math.min(1, (t - t0) / total);
      setPct(Math.round(k * 100));
      if (k < 1) raf = requestAnimationFrame(f);
      else { setReady(true); timers.push(setTimeout(finish, reduced ? 250 : 900)); }
    };
    raf = requestAnimationFrame(f);
    return () => { timers.forEach(clearTimeout); cancelAnimationFrame(raf); };
  }, []);
  useEffect(() => {
    const k = (e) => { if (e.key === 'Enter' || e.key === 'Escape' || e.key === ' ') { e.preventDefault(); finish(); } };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [finish]);
  const segs = 24, on = Math.round((pct / 100) * segs);
  return (
    <div className={'boot' + (leaving ? ' out' : '')} role="dialog" aria-modal="true" aria-label="System initialization">
      <div className="boot-inner">
        <div className="boot-mark" aria-hidden="true">
          <svg viewBox="0 0 200 200"><ellipse cx="100" cy="100" rx="96" ry="34" transform="rotate(-24 100 100)" /><circle cx="100" cy="100" r="3" /></svg>
        </div>
        <div className="boot-word">AETHER</div>
        <div className="boot-sub">Advanced exploration and telemetry command system</div>
        <div className="boot-state num" aria-live="polite">{ready ? 'System ready' : 'Initializing'}</div>
        <ul className="boot-lines num">
          {BOOT_LINES.map((l, i) => (
            <li key={l} className={i < n ? 'on' : ''}>
              <span>{l}</span><span className="leader" aria-hidden="true" /><span className="st">{i < n ? 'Online' : 'Pending'}</span>
            </li>
          ))}
        </ul>
        <div className="boot-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Initialization progress">
          {Array.from({ length: segs }).map((_, i) => <i key={i} className={i < on ? 'on' : ''} />)}
          <span className="num">{pct}%</span>
        </div>
      </div>
      <div className="boot-foot num">
        <span>{MISSION.code} {MISSION.vehicle} build 7.4.2</span>
        <button type="button" className="btn sm ghost" onClick={finish}>Skip sequence <kbd>Enter</kbd></button>
      </div>
    </div>
  );
}
