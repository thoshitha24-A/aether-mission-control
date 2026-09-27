import { useEffect, useRef, useState } from 'react';
import { Icon } from './Icon';
import { useTelemetry } from '../context/TelemetryContext';
import { useNow } from '../context/TimeContext';
import { LOI_AT, MISSION } from '../data/missionData';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { CIS, LUN, conic, craftCis, lunarApproachTheta, moonGeometry, solveKepler } from '../lib/orbitalMechanics';
import { clamp, fmtDur, fmtNum } from '../utils/format';

export const MAP_W = 960, MAP_H = 520, MAP_S = 2;

export const MAP_FIT = { cislunar: { fx: 200, fy: -6, z: 1 }, lunar: { fx: 150, fy: 26, z: 0.36 } };

export function OrbitalMap({ mode = 'cislunar', compact = false, ariaLabel }) {
  const { values } = useTelemetry();
  const now = useNow();
  const reduced = useReducedMotion();
  const fit = MAP_FIT[mode];
  const [v, setV] = useState({ fx: fit.fx, fy: fit.fy, zoom: 1, rot: 0 });
  const [show, setShow] = useState({ paths: true, labels: true, grid: true });
  const [hover, setHover] = useState(false);
  const [sel, setSel] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [hint, setHint] = useState(false);
  const [anim, setAnim] = useState(() => performance.now());
  const svgRef = useRef(null);
  const ptrs = useRef(new Map());
  const drag = useRef(null);
  const pinch = useRef(null);
  const hintT = useRef(0);

  useEffect(() => { setV({ fx: MAP_FIT[mode].fx, fy: MAP_FIT[mode].fy, zoom: 1, rot: 0 }); setSel(false); }, [mode]);
  useEffect(() => {
    if (mode !== 'lunar' || reduced) return;
    let id;
    const f = (t) => { setAnim(t); id = requestAnimationFrame(f); };
    id = requestAnimationFrame(f);
    return () => cancelAnimationFrame(id);
  }, [mode, reduced]);
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const onWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        setV((s) => ({ ...s, zoom: clamp(s.zoom * Math.exp(-e.deltaY * 0.0022), 0.5, 14) }));
      } else {
        setHint(true);
        clearTimeout(hintT.current);
        hintT.current = setTimeout(() => setHint(false), 1500);
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const z = fit.z * v.zoom;
  const cr = Math.cos(v.rot), sr = Math.sin(v.rot);
  const P = ([x, y]) => {
    const dx = x - v.fx, dy = y - v.fy;
    return [MAP_W / 2 + (dx * cr - dy * sr) * z * MAP_S, MAP_H / 2 + (dx * sr + dy * cr) * z * MAP_S];
  };
  const unP = (sx, sy) => {
    const vx = (sx - MAP_W / 2) / (z * MAP_S), vy = (sy - MAP_H / 2) / (z * MAP_S);
    return [vx * cr + vy * sr + v.fx, -vx * sr + vy * cr + v.fy];
  };
  const pathOf = (pts) => pts.map((p, i) => { const q = P(p); return `${i ? 'L' : 'M'}${q[0].toFixed(1)} ${q[1].toFixed(1)}`; }).join('');
  const sample = (p, e, a, b, n) => { const r = []; for (let i = 0; i <= n; i++) r.push(conic(p, e, a + ((b - a) * i) / n)); return r; };

  // ---- geometry per mode
  let craft, flown, planned, extra = null, bodies = [], rings = [], ringCenter, labels = [], info, craftTh, tangentNext, preview = null;
  const unit = mode === 'cislunar' ? CIS.unit : LUN.unit;
  if (mode === 'cislunar') {
    const c = craftCis(values.altitude);
    craftTh = c.th; craft = c.pos;
    flown = sample(CIS.p, CIS.e, 0, c.th, 180);
    planned = sample(CIS.p, CIS.e, c.th, Math.PI, 40);
    extra = sample(CIS.p, CIS.e, Math.PI, 2 * Math.PI, 160);
    tangentNext = conic(CIS.p, CIS.e, c.th + 0.004);
    ringCenter = [0, 0];
    rings = [100, 200, 300, 400].map((r) => ({ r, label: `${r * 1000 / 1000},000 km`.replace(',000 km', 'k km') }));
    bodies = [
      { id: 'earth', pos: [0, 0], r: CIS.earthR, kind: 'earth', label: 'Earth' },
      { id: 'moon', pos: CIS.moon, r: CIS.moonR, kind: 'moon', label: 'Moon' },
    ];
    const mg = moonGeometry(values.altitude);
    info = [
      ['Distance from Earth', `${fmtNum(values.altitude)} km`],
      ['Distance to Moon', `${fmtNum(mg.range)} km`],
      ['Velocity', `${fmtNum(values.velocity)} km/h`],
      ['True anomaly', `${fmtNum((c.th * 180) / Math.PI, 2)}°`],
    ];
    labels = [
      { at: conic(CIS.p, CIS.e, 0), text: 'Perigee 207 km', dx: 0, dy: 22, anchor: 'middle', mark: true },
    ];
  } else {
    const th = lunarApproachTheta(now);
    craftTh = th;
    craft = conic(LUN.ph, LUN.eh, th);
    flown = sample(LUN.ph, LUN.eh, -2.05, th, 120);
    planned = sample(LUN.ph, LUN.eh, th, 0, 60);
    extra = sample(LUN.p, LUN.e, 0, 2 * Math.PI, 240);
    tangentNext = conic(LUN.ph, LUN.eh, th + 0.004);
    ringCenter = [0, 0];
    rings = [250, 500].map((r) => ({ r, label: `${fmtNum(r * 10)} km` }));
    bodies = [{ id: 'moon', pos: [0, 0], r: LUN.R, kind: 'moon', label: 'Moon' }];
    const rk = Math.hypot(craft[0], craft[1]) * 10;
    const aH = (LUN.ph * 10) / (LUN.eh * LUN.eh - 1);
    const vel = Math.sqrt(LUN.mu * (2 / rk + 1 / aH)) * 3600;
    info = [
      ['Altitude above Moon', `${fmtNum(rk - 1737)} km`],
      ['Moon-relative velocity', `${fmtNum(vel)} km/h`],
      ['Time to LOI burn', fmtDur(LOI_AT - now)],
      ['Target orbit', '100 \u00d7 3,000 km polar'],
    ];
    labels = [
      { at: [-LUN.rp, 0], text: `LOI burn  T\u2212${fmtDur(LOI_AT - now)}`, dx: -14, dy: 4, anchor: 'end', mark: true },
      { at: [LUN.ra, 0], text: 'Aposelene 3,000 km', dx: 14, dy: 4, anchor: 'start', mark: true },
    ];
    if (!reduced) {
      const T = 24000;
      const M = ((anim % T) / T) * 2 * Math.PI;
      preview = conic(LUN.p, LUN.e, solveKepler(M, LUN.e));
    }
  }

  const cq = P(craft);
  const tq = P(tangentNext);
  let tx = tq[0] - cq[0], ty = tq[1] - cq[1];
  const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;

  // scale bar
  const kmPerPx = unit / (z * MAP_S);
  const raw = 120 * kmPerPx;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const nice = (raw / mag >= 5 ? 5 : raw / mag >= 2 ? 2 : 1) * mag;
  const barLen = nice / kmPerPx;

  // ---- interaction
  const toView = (e) => {
    const r = svgRef.current.getBoundingClientRect();
    return [((e.clientX - r.left) * MAP_W) / r.width, ((e.clientY - r.top) * MAP_H) / r.height];
  };
  const onDown = (e) => {
    if (e.target.closest && e.target.closest('.craft-hit')) return;
    svgRef.current.setPointerCapture && svgRef.current.setPointerCapture(e.pointerId);
    const p = toView(e);
    ptrs.current.set(e.pointerId, p);
    drag.current = { start: p, v: { ...v } };
    pinch.current = null;
  };
  const onMove = (e) => {
    const p = toView(e);
    if (ptrs.current.has(e.pointerId)) {
      ptrs.current.set(e.pointerId, p);
      if (ptrs.current.size >= 2) {
        const [a, b] = [...ptrs.current.values()];
        const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
        if (!pinch.current) pinch.current = { d, zoom: v.zoom };
        const zNew = clamp((pinch.current.zoom * d) / (pinch.current.d || 1), 0.5, 14);
        setV((s) => ({ ...s, zoom: zNew }));
      } else if (drag.current) {
        const dv = drag.current.v;
        const zz = fit.z * dv.zoom, c = Math.cos(dv.rot), s = Math.sin(dv.rot);
        const dx = (p[0] - drag.current.start[0]) / (zz * MAP_S), dy = (p[1] - drag.current.start[1]) / (zz * MAP_S);
        const sx = dx * c + dy * s, sy = -dx * s + dy * c;
        setV((st) => ({ ...st, fx: dv.fx - sx, fy: dv.fy - sy }));
      }
    } else {
      setCursor(unP(p[0], p[1]));
    }
  };
  const onUp = (e) => {
    ptrs.current.delete(e.pointerId);
    if (ptrs.current.size < 2) pinch.current = null;
    if (ptrs.current.size === 1) {
      const [rest] = [...ptrs.current.values()];
      drag.current = { start: rest, v: { ...v } };
    } else if (ptrs.current.size === 0) drag.current = null;
  };
  const zoomBy = (k) => setV((s) => ({ ...s, zoom: clamp(s.zoom * k, 0.5, 14) }));
  const rotBy = (deg) => setV((s) => ({ ...s, rot: s.rot + (deg * Math.PI) / 180 }));
  const reset = () => setV({ fx: fit.fx, fy: fit.fy, zoom: 1, rot: 0 });
  const focusCraft = () => setV((s) => ({ ...s, fx: craft[0], fy: craft[1], zoom: Math.max(s.zoom, mode === 'cislunar' ? 5 : 2.2) }));
  const onKey = (e) => {
    const step = 40 / (z * MAP_S);
    const panBy = (dx, dy) => setV((s) => ({ ...s, fx: s.fx + dx * cr + dy * sr, fy: s.fy - dx * sr + dy * cr }));
    const map = {
      ArrowLeft: () => panBy(-step, 0), ArrowRight: () => panBy(step, 0), ArrowUp: () => panBy(0, -step), ArrowDown: () => panBy(0, step),
      '+': () => zoomBy(1.25), '=': () => zoomBy(1.25), '-': () => zoomBy(0.8), r: () => rotBy(15), R: () => rotBy(-15), '0': reset,
    };
    if (map[e.key]) { e.preventDefault(); map[e.key](); }
  };
  const toggle = (k) => setShow((s) => ({ ...s, [k]: !s[k] }));
  const craftAct = () => setSel((s) => !s);
  const rc = P(ringCenter);

  const tipLeft = cq[0] > MAP_W * 0.68;
  const cursorKm = cursor ? [cursor[0] * unit, cursor[1] * unit] : null;

  return (
    <div className={'omap' + (compact ? ' compact' : '')}>
      <svg ref={svgRef} viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="omap-svg" tabIndex={0} role="application"
        aria-label={ariaLabel || 'Orbital map. Drag to pan, Ctrl and scroll or plus and minus to zoom, R to rotate, 0 to reset.'}
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onPointerLeave={() => setCursor(null)} onKeyDown={onKey}>
        <defs>
          <radialGradient id="earthG" cx="0.36" cy="0.34" r="0.75">
            <stop offset="0" stopColor="#8EC3FF" />
            <stop offset="0.45" stopColor="#2F66B8" />
            <stop offset="1" stopColor="#0A1B3E" />
          </radialGradient>
          <radialGradient id="moonG" cx="0.38" cy="0.35" r="0.8">
            <stop offset="0" stopColor="#D9DDE4" />
            <stop offset="0.55" stopColor="#8D95A3" />
            <stop offset="1" stopColor="#343A45" />
          </radialGradient>
          <linearGradient id="termG" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0.45" stopColor="#02050B" stopOpacity="0" />
            <stop offset="0.8" stopColor="#02050B" stopOpacity="0.72" />
          </linearGradient>
          <radialGradient id="glowG" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0.6" stopColor="#5FD0E4" stopOpacity="0.16" />
            <stop offset="1" stopColor="#5FD0E4" stopOpacity="0" />
          </radialGradient>
        </defs>

        {show.grid && (
          <g className="og-grid">
            {(() => {
              const a1 = P([ringCenter[0] - 2000, ringCenter[1]]), a2 = P([ringCenter[0] + 2000, ringCenter[1]]);
              const b1 = P([ringCenter[0], ringCenter[1] - 2000]), b2 = P([ringCenter[0], ringCenter[1] + 2000]);
              return <><line x1={a1[0]} y1={a1[1]} x2={a2[0]} y2={a2[1]} /><line x1={b1[0]} y1={b1[1]} x2={b2[0]} y2={b2[1]} /></>;
            })()}
            {rings.map((r) => {
              const lp = P([ringCenter[0] + r.r * Math.cos(-0.6), ringCenter[1] + r.r * Math.sin(-0.6)]);
              return (
                <g key={r.r}>
                  <circle cx={rc[0]} cy={rc[1]} r={r.r * z * MAP_S} />
                  {show.labels && <text x={lp[0] + 4} y={lp[1] - 4} className="og-ring-label">{mode === 'cislunar' ? `${fmtNum(r.r * 1000)} km` : r.label}</text>}
                </g>
              );
            })}
          </g>
        )}

        {mode === 'cislunar' && show.paths && (
          <circle cx={P([0, 0])[0]} cy={P([0, 0])[1]} r={384.4 * z * MAP_S} className="moon-orbit" />
        )}
        {show.paths && extra && <path d={pathOf(extra)} className={mode === 'lunar' ? 'target-orbit' : 'return-leg'} />}
        {show.paths && <path d={pathOf(planned)} className="traj-planned" />}
        <path d={pathOf(flown)} className="traj-flown" />

        {bodies.map((b) => {
          const q = P(b.pos), r = Math.max(2.5, b.r * z * MAP_S);
          return (
            <g key={b.id} className={'body ' + b.kind}>
              {b.kind === 'earth' && <circle cx={q[0]} cy={q[1]} r={r * 1.35} fill="url(#glowG)" />}
              <circle cx={q[0]} cy={q[1]} r={r} fill={b.kind === 'earth' ? 'url(#earthG)' : 'url(#moonG)'} />
              {b.kind === 'moon' && r > 26 && (
                <g className="craters">
                  {[[-0.3, -0.25, 0.14], [0.22, 0.1, 0.1], [-0.05, 0.38, 0.08], [0.35, -0.35, 0.06], [-0.45, 0.2, 0.07]].map(([ox, oy, cr2], i) => (
                    <circle key={i} cx={q[0] + ox * r} cy={q[1] + oy * r} r={cr2 * r} />
                  ))}
                </g>
              )}
              <circle cx={q[0]} cy={q[1]} r={r} fill="url(#termG)" />
              {b.kind === 'earth' && <circle cx={q[0]} cy={q[1]} r={r + 1.5} className="atmo" />}
              {show.labels && <text x={q[0]} y={q[1] + r + 18} className="body-label" textAnchor="middle">{b.label}</text>}
            </g>
          );
        })}

        {show.labels && labels.map((l, i) => {
          const q = P(l.at);
          return (
            <g key={i} className="map-mark">
              {l.mark && <path d={`M${q[0] - 4} ${q[1]}L${q[0]} ${q[1] - 4}L${q[0] + 4} ${q[1]}L${q[0]} ${q[1] + 4}Z`} />}
              <text x={q[0] + l.dx} y={q[1] + l.dy} textAnchor={l.anchor}>{l.text}</text>
            </g>
          );
        })}

        {preview && (() => {
          const q = P(preview);
          return <g className="preview"><circle cx={q[0]} cy={q[1]} r="3" />{show.labels && <text x={q[0] + 8} y={q[1] - 6}>Planned orbit preview</text>}</g>;
        })()}

        {/* direction indicator */}
        <g className="heading">
          <line x1={cq[0] + tx * 12} y1={cq[1] + ty * 12} x2={cq[0] + tx * 34} y2={cq[1] + ty * 34} />
          <path d={`M${cq[0] + tx * 40} ${cq[1] + ty * 40}L${cq[0] + tx * 31 - ty * 4.5} ${cq[1] + ty * 31 + tx * 4.5}L${cq[0] + tx * 31 + ty * 4.5} ${cq[1] + ty * 31 - tx * 4.5}Z`} />
        </g>

        <g className={'craft-hit' + (sel ? ' sel' : '') + (hover ? ' hov' : '')} role="button" tabIndex={0}
          aria-label={`${MISSION.vehicle} spacecraft. ${sel ? 'Hide' : 'Show'} details`} aria-pressed={sel}
          onClick={craftAct} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); craftAct(); } }}
          onPointerEnter={() => setHover(true)} onPointerLeave={() => setHover(false)} onFocus={() => setHover(true)} onBlur={() => setHover(false)}>
          <circle cx={cq[0]} cy={cq[1]} r="18" className="hit" />
          {!reduced && <circle cx={cq[0]} cy={cq[1]} r="6" className="craft-pulse" />}
          <path d={`M${cq[0]} ${cq[1] - 6}L${cq[0] + 6} ${cq[1]}L${cq[0]} ${cq[1] + 6}L${cq[0] - 6} ${cq[1]}Z`} className="craft-mark" />
          {sel && (
            <g className="brackets">
              {[[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy], i) => (
                <path key={i} d={`M${cq[0] + sx * 15} ${cq[1] + sy * 9}V${cq[1] + sy * 15}H${cq[0] + sx * 9}`} />
              ))}
            </g>
          )}
          {show.labels && <text x={cq[0] + (tipLeft ? -16 : 16)} y={cq[1] + (mode === 'cislunar' ? -14 : 22)} textAnchor={tipLeft ? 'end' : 'start'} className="craft-label">{MISSION.vehicle}</text>}
        </g>

        {/* scale bar */}
        <g className="scalebar" transform={`translate(${MAP_W - 24 - barLen} ${MAP_H - 22})`}>
          <path d={`M0 -5V0H${barLen}V-5`} />
          <text x={barLen / 2} y="-10" textAnchor="middle">{fmtNum(nice)} km</text>
        </g>
      </svg>

      <div className="omap-tools" role="toolbar" aria-label="Map controls">
        <button type="button" className="btn icon" onClick={() => zoomBy(1.3)} aria-label="Zoom in" title="Zoom in"><Icon name="plus" size={16} /></button>
        <button type="button" className="btn icon" onClick={() => zoomBy(1 / 1.3)} aria-label="Zoom out" title="Zoom out"><Icon name="minus" size={16} /></button>
        <button type="button" className="btn icon" onClick={() => rotBy(-15)} aria-label="Rotate counterclockwise" title="Rotate counterclockwise"><Icon name="rotccw" size={16} /></button>
        <button type="button" className="btn icon" onClick={() => rotBy(15)} aria-label="Rotate clockwise" title="Rotate clockwise"><Icon name="rotcw" size={16} /></button>
        <button type="button" className="btn icon" onClick={focusCraft} aria-label="Center on spacecraft" title="Center on spacecraft"><Icon name="target" size={16} /></button>
        <button type="button" className="btn icon" onClick={reset} aria-label="Reset view" title="Reset view"><Icon name="fit" size={16} /></button>
        <span className="tool-sep" aria-hidden="true" />
        <button type="button" className="btn icon toggle" aria-pressed={show.paths} onClick={() => toggle('paths')} aria-label="Show orbital paths" title="Orbital paths"><Icon name="route" size={16} /></button>
        <button type="button" className="btn icon toggle" aria-pressed={show.labels} onClick={() => toggle('labels')} aria-label="Show labels" title="Labels"><Icon name="label" size={16} /></button>
        <button type="button" className="btn icon toggle" aria-pressed={show.grid} onClick={() => toggle('grid')} aria-label="Show range grid" title="Range grid"><Icon name="grid" size={16} /></button>
      </div>

      {hover && !sel && (
        <div className="omap-tip" style={{ left: `${(cq[0] / MAP_W) * 100}%`, top: `${(cq[1] / MAP_H) * 100}%`, transform: `translate(${tipLeft ? 'calc(-100% - 22px)' : '22px'}, -50%)` }}>
          <strong>{MISSION.vehicle}</strong>
          <span>{info[0][0]} <b className="num">{info[0][1]}</b></span>
          <span>{info[1][0]} <b className="num">{info[1][1]}</b></span>
          <em>Select for details</em>
        </div>
      )}

      {sel && (
        <div className="omap-card" role="region" aria-label="Spacecraft details">
          <div className="oc-head">
            <div><span className="label">Tracking</span><strong>{MISSION.vehicle}</strong></div>
            <button type="button" className="btn icon ghost" onClick={() => setSel(false)} aria-label="Close details"><Icon name="x" size={16} /></button>
          </div>
          <dl>
            {info.map(([k, val]) => (<div key={k}><dt>{k}</dt><dd className="num">{val}</dd></div>))}
          </dl>
          <button type="button" className="btn wide" onClick={focusCraft}><Icon name="target" size={14} />Center view on spacecraft</button>
        </div>
      )}

      {!compact && (
        <div className="omap-legend" aria-hidden="true">
          <span><i className="lg-flown" />Flown</span>
          <span><i className="lg-planned" />Planned</span>
          {mode === 'lunar' ? <span><i className="lg-target" />Target orbit</span> : <span><i className="lg-moon" />Lunar orbit</span>}
          <span className="lg-note">Bodies not to scale</span>
        </div>
      )}

      <div className="omap-readout num" aria-hidden="true">
        {cursorKm
          ? <>X {fmtNum(cursorKm[0])} km&nbsp;&nbsp;Y {fmtNum(-cursorKm[1])} km&nbsp;&nbsp;R {fmtNum(Math.hypot(cursorKm[0], cursorKm[1]))} km</>
          : <>ZOOM {(v.zoom).toFixed(2)}&times;&nbsp;&nbsp;ROT {fmtNum((((v.rot * 180) / Math.PI) % 360 + 360) % 360)}°</>}
      </div>
      <div className={'omap-hint' + (hint ? ' on' : '')} aria-hidden="true">Hold Ctrl and scroll to zoom</div>
    </div>
  );
}
