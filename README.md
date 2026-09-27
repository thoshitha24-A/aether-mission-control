# AETHER: Advanced Exploration & Telemetry Command System

A frontend-only mission control interface for **AE-07 / Orbital Frontier**, a simulated crewed spacecraft two hours from lunar orbit insertion. Everything runs in the browser: no backend, no APIs, no keys.

## Run it

Requires Node.js 18 or newer.

```bash
npm install
npm run dev       # local dev server, usually http://localhost:5173
npm run build     # production build into dist/
npm run preview   # serve the production build
```

No setup at all? Open `standalone/aether-mission-control.html` directly in a browser. It is the same app compiled into one file.

`vite.config.js` uses `base: './'`, so the `dist/` folder can be deployed to GitHub Pages, Netlify or Vercel as-is.

## Keyboard

| Key | Action |
| --- | --- |
| Ctrl/Cmd + K | Command palette |
| Enter or Esc | Skip boot sequence |
| Arrows, + / -, R, 0 | Pan, zoom, rotate, reset the focused orbital map |
| Ctrl + scroll | Zoom the orbital map |
| Left / Right | Inspect values on a focused telemetry chart |

## Structure

```
src/
  main.jsx, App.jsx          entry point, page registry
  components/                AppShell, TopBar, Sidebar, StatusBar, MobileNav,
                             OrbitalMap, Radar, TelemetryCard, TelemetryChart,
                             SpacecraftViewer, SubsystemDetail, CrewCard,
                             AlertPanel, CommandPalette, MissionTimeline,
                             BootSequence, Starfield, SignalWave, UI primitives
  pages/                     Dashboard, Orbit, Spacecraft, Telemetry, Crew,
                             Communications, MissionLogs
  context/                   TimeContext (1 s clock), TelemetryContext (2 s sim),
                             MissionContext (logs, alerts, comms, subsystems)
  data/                      missionData, telemetryData, crewData, alertsData,
                             commsData, logsData, systemsData, navigation
  lib/orbitalMechanics.js    conic orbits, Kepler solver, geometry helpers
  hooks/                     useHashRoute, useDialog, useWidth, useReducedMotion
  styles/global.css          design tokens and all styles
```

## How the simulation works

- **One consistent mission.** The spacecraft sits on a translunar transfer ellipse (perigee 207 km, apogee about 393,600 km). Its position on the map, the Moon's bearing and range on the radar, and the Moon-relative velocity in the arrival view are all derived from the live altitude reading, so every screen agrees.
- **Telemetry** is a seeded random walk with drift and mean reversion, ticking every 2 s, with 1 h of fine history and 6 h of coarse history generated at startup.
- **Comms** uplinks take the real one-way Earth–Moon light time (1.28 s) before showing as delivered.
- **Alerts** are scheduled sparingly over the first eight minutes, not generated continuously.

Real space agency identities are not used. All crew, stations and hardware are fictional.

## Design notes

- **Palette:** near-black navy base, instrument cyan and signal blue, with amber and red reserved for actual cautions and alerts.
- **Type:** IBM Plex Sans for the interface, IBM Plex Mono for every number.
- **Panels:** hairline borders with corner registration ticks instead of glowing cards.
- **Motion:** each piece of motion is tied to meaning (the radar sweep, live telemetry, the orbital preview). All of it respects `prefers-reduced-motion`.

## Tech

React 18 and Vite 5. Charts, the orbital map, the radar and the vehicle diagram are hand-built SVG, and the starfield is Canvas. There are no UI or chart libraries.
