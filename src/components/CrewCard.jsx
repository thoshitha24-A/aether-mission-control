import { useMemo, useState } from 'react';
import { Icon } from './Icon';
import { Sparkline } from './Sparkline';
import { StatusPill } from './SystemIndicator';
import { useTelemetry } from '../context/TelemetryContext';
import { CREW_STATUS } from '../data/crewData';
import { mulberry32 } from '../utils/format';

export function Avatar({ c, size = 56 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" className="avatar" aria-hidden="true">
      <defs>
        <linearGradient id={'av-' + c.id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={`hsl(${c.hue} 55% 38%)`} />
          <stop offset="1" stopColor={`hsl(${c.hue + 20} 60% 14%)`} />
        </linearGradient>
      </defs>
      <circle cx="28" cy="28" r="24" fill={`url(#av-${c.id})`} />
      <ellipse cx="28" cy="28" rx="27" ry="9" transform="rotate(-28 28 28)" className="av-ring" />
      <text x="28" y="33" textAnchor="middle">{c.initials}</text>
    </svg>
  );
}

export function CrewCard({ c, index }) {
  const { tick } = useTelemetry();
  const [open, setOpen] = useState(false);
  const rng = mulberry32(tick * 31 + index);
  const hr = Math.round(c.hr + Math.sin(tick * 0.5 + index) * 2 + (rng() - 0.5) * 2);
  const hrHist = useMemo(() => Array.from({ length: 40 }).map((_, i) => c.hr + Math.sin((tick - 40 + i) * 0.5 + index) * 2 + (mulberry32((tick - 40 + i) * 31 + index)() - 0.5) * 2), [tick]);
  const st = CREW_STATUS[c.status];
  const bodyId = 'crew-more-' + c.id;
  return (
    <article className={'panel crew-card' + (open ? ' open' : '')} aria-labelledby={'crew-' + c.id}>
      <div className="cc-top">
        <Avatar c={c} />
        <div className="cc-id">
          <span className="label">{c.role}</span>
          <h2 id={'crew-' + c.id}>{c.name}</h2>
          <span className="muted">{c.position}</span>
        </div>
      </div>
      <div className="cc-row">
        <StatusPill cls={st.cls}>{st.label}</StatusPill>
        <span className="cc-hr"><span className="num">{hr}</span> bpm</span>
      </div>
      <div className="cc-task">
        <span className="label">Current task</span>
        <span>{c.task}</span>
      </div>
      <button type="button" className="btn sm cc-toggle" aria-expanded={open} aria-controls={bodyId} onClick={() => setOpen((o) => !o)}>
        {open ? 'Hide schedule' : 'Show schedule'}<Icon name="chevron" size={14} className={open ? 'rot90' : ''} />
      </button>
      <div className="cc-more" id={bodyId} hidden={!open}>
        <ol className="cc-tasks">
          {c.tasks.map(([t, s]) => <li key={t} className={'t-' + s}><span className="t-state">{s === 'done' ? 'Done' : s === 'now' ? 'Now' : 'Next'}</span>{t}</li>)}
        </ol>
        <div className="cc-vitals">
          <span className="label">Heart rate, last 80 s</span>
          <Sparkline data={hrHist} w={200} h={30} />
        </div>
        <div className="sit-row"><span>{c.status === 'rest' ? 'Rest ends in' : 'Shift ends in'}</span><span className="num">{Math.floor(c.shift / 60)} h {c.shift % 60} min</span></div>
      </div>
    </article>
  );
}
