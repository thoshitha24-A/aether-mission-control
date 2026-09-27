import { memo, useEffect, useRef } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

export const Starfield = memo(function Starfield() {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    const c = ref.current;
    const ctx = c && c.getContext ? c.getContext('2d') : null;
    if (!ctx) return;
    let w = 0, h = 0, stars = [], raf = 0, last = performance.now();
    let shoot = null, nextShoot = performance.now() + 8000 + Math.random() * 10000;
    const rnd = Math.random;
    const draw = (dt, t) => {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        s.x -= s.s * dt;
        if (s.x < -2) s.x = w + 2;
        s.tw += dt * s.tws;
        ctx.globalAlpha = s.a * (0.82 + 0.18 * Math.sin(s.tw));
        ctx.fillStyle = s.blue ? '#BFE6FF' : '#E8EEF7';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, 6.2832);
        ctx.fill();
      }
      if (!reduced) {
        if (!shoot && t > nextShoot) {
          const ang = Math.PI * (0.78 + rnd() * 0.12);
          shoot = { x: w * (0.35 + rnd() * 0.6), y: h * rnd() * 0.35, vx: Math.cos(ang) * 620, vy: Math.sin(ang) * 620 * -1 * -1, age: 0, life: 0.9 };
          shoot.vy = Math.abs(Math.sin(ang) * 620) * 0.55;
          nextShoot = t + 14000 + rnd() * 16000;
        }
        if (shoot) {
          shoot.age += dt;
          shoot.x += shoot.vx * dt; shoot.y += shoot.vy * dt;
          const k = shoot.age / shoot.life;
          const a = Math.sin(Math.PI * Math.min(1, k)) * 0.55;
          const len = 110;
          const nx = -shoot.vx, ny = -shoot.vy, nl = Math.hypot(nx, ny);
          const g = ctx.createLinearGradient(shoot.x, shoot.y, shoot.x + (nx / nl) * len, shoot.y + (ny / nl) * len);
          g.addColorStop(0, `rgba(220,240,255,${a})`);
          g.addColorStop(1, 'rgba(220,240,255,0)');
          ctx.globalAlpha = 1;
          ctx.strokeStyle = g; ctx.lineWidth = 1.1;
          ctx.beginPath(); ctx.moveTo(shoot.x, shoot.y); ctx.lineTo(shoot.x + (nx / nl) * len, shoot.y + (ny / nl) * len); ctx.stroke();
          if (k >= 1) shoot = null;
        }
      }
      ctx.globalAlpha = 1;
    };
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = c.clientWidth; h = c.clientHeight;
      c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round((w * h) / 5200);
      stars = [];
      for (let i = 0; i < n; i++) {
        const L = rnd() < 0.64 ? 0 : rnd() < 0.78 ? 1 : 2;
        stars.push({ x: rnd() * w, y: rnd() * h, r: [0.5, 0.8, 1.2][L] * (0.75 + rnd() * 0.5), a: [0.3, 0.5, 0.8][L] * (0.6 + rnd() * 0.4), s: [1.5, 4, 8][L], tw: rnd() * 6.28, tws: 0.4 + rnd() * 0.9, blue: rnd() < 0.14 });
      }
      draw(0, performance.now());
    };
    resize();
    window.addEventListener('resize', resize);
    if (!reduced) {
      const loop = (t) => {
        const dt = Math.min(0.05, (t - last) / 1000);
        last = t;
        if (!document.hidden) draw(dt, t);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, [reduced]);
  return <canvas ref={ref} className="starfield" aria-hidden="true" />;
});
