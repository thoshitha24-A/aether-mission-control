import { STATUS_META } from '../data/systemsData';
import { useReducedMotion } from '../hooks/useReducedMotion';

export const PART_LABELS = {
  lifesupport: { a: [150, 222], e: [120, 300], l: [60, 300], anchor: 'start' },
  navigation: { a: [217, 154], e: [200, 118], l: [120, 118], anchor: 'start' },
  comms: { a: [300, 104], e: [300, 70], l: [220, 70], anchor: 'start' },
  payload: { a: [304, 258], e: [304, 316], l: [260, 316], anchor: 'start' },
  power: { a: [570, 72], e: [640, 72], l: [648, 72], anchor: 'start' },
  thermal: { a: [548, 182], e: [690, 140], l: [698, 140], anchor: 'start' },
  propulsion: { a: [646, 220], e: [720, 220], l: [728, 220], anchor: 'start' },
};

export function SpacecraftViewer({ subs, selected, onSelect }) {
  const reduced = useReducedMotion();
  const part = (id, children) => {
    const s = subs[id], L = PART_LABELS[id];
    const act = () => onSelect(id);
    return (
      <g className={`part st-${STATUS_META[s.status].cls}${selected === id ? ' sel' : ''}`} role="button" tabIndex={0}
        aria-label={`${s.name}, ${STATUS_META[s.status].label}. Inspect`} aria-pressed={selected === id}
        onClick={act} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } }}>
        {children}
        <g className="part-label">
          <circle cx={L.a[0]} cy={L.a[1]} r="2.5" />
          <polyline points={`${L.a[0]},${L.a[1]} ${L.e[0]},${L.e[1]} ${L.l[0] + (L.l[0] < L.e[0] ? 0 : 0)},${L.l[1]}`} />
          <text x={L.l[0] < L.e[0] ? L.l[0] : L.l[0]} y={L.l[1] - 7}>{s.name}</text>
          {s.status !== 'nominal' && <text x={L.l[0]} y={L.l[1] + 14} className="part-state">{STATUS_META[s.status].label}</text>}
        </g>
      </g>
    );
  };
  return (
    <svg viewBox="0 0 900 440" className="craft-svg" role="group" aria-label="AETHER-7 vehicle diagram. Select a subsystem to inspect it.">
      <defs>
        <pattern id="cells" width="14" height="12" patternUnits="userSpaceOnUse">
          <rect width="14" height="12" fill="#0C1B33" />
          <path d="M0 0H14M0 0V12" stroke="#28446E" strokeWidth="0.8" />
        </pattern>
        <pattern id="fins" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(90)">
          <rect width="8" height="8" fill="#101B2C" />
          <path d="M0 4H8" stroke="#3A506E" strokeWidth="1.2" />
        </pattern>
        <linearGradient id="plume" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#8FE3F2" stopOpacity="0.5" />
          <stop offset="1" stopColor="#8FE3F2" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="hull" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#1A2940" />
          <stop offset="1" stopColor="#0C1524" />
        </linearGradient>
      </defs>
      <g className="craft-ref" aria-hidden="true">
        <line x1="40" x2="860" y1="220" y2="220" />
        <text x="44" y="212">Vehicle X axis</text>
        <path d="M108 400V412M646 400V412M108 406H646" />
        <text x="377" y="428" textAnchor="middle">Overall length 17.6 m</text>
      </g>
      {selected === 'propulsion' && !reduced && <path d="M646 170L790 196V244L646 270Z" fill="url(#plume)" className="plume" />}
      {part('power', <>
        <line x1="465" y1="108" x2="465" y2="165" className="strut" />
        <line x1="465" y1="275" x2="465" y2="332" className="strut" />
        <rect x="360" y="34" width="210" height="74" className="shape array" fill="url(#cells)" />
        <rect x="360" y="332" width="210" height="74" className="shape array" fill="url(#cells)" />
      </>)}
      {part('comms', <>
        <line x1="300" y1="182" x2="300" y2="122" className="strut" />
        <path d="M258 116Q300 146 342 116Z" className="shape" />
        <line x1="300" y1="130" x2="300" y2="104" className="strut" />
        <circle cx="300" cy="104" r="3.5" className="shape" />
      </>)}
      {part('propulsion', <>
        <rect x="360" y="165" width="210" height="110" rx="3" className="shape" fill="url(#hull)" />
        <circle cx="420" cy="220" r="24" className="inner" />
        <circle cx="510" cy="220" r="24" className="inner" />
        <path d="M570 198H584L646 162V278L584 242H570Z" className="shape" fill="url(#hull)" />
      </>)}
      {part('thermal', <>
        <rect x="382" y="170" width="166" height="20" className="shape fins" fill="url(#fins)" />
        <rect x="382" y="250" width="166" height="20" className="shape fins" fill="url(#fins)" />
      </>)}
      {part('payload', <>
        <rect x="248" y="182" width="112" height="76" className="shape" fill="url(#hull)" />
        <rect x="262" y="196" width="26" height="18" className="inner" />
        <circle cx="330" cy="236" r="10" className="inner" />
      </>)}
      {part('lifesupport', <>
        <path d="M108 220L186 170H248V270H186Z" className="shape" fill="url(#hull)" />
        <rect x="200" y="200" width="16" height="10" rx="2" className="inner" />
      </>)}
      {part('navigation', <>
        <rect x="198" y="154" width="18" height="16" className="shape" />
        <rect x="222" y="154" width="18" height="16" className="shape" />
        <circle cx="207" cy="154" r="4" className="inner" />
        <circle cx="231" cy="154" r="4" className="inner" />
      </>)}
    </svg>
  );
}
