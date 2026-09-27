import { useCallback, useState } from 'react';
import { Shell } from './components/AppShell';
import { Boot } from './components/BootSequence';
import { Starfield } from './components/Starfield';
import { MissionProvider } from './context/MissionContext';
import { TelemetryProvider } from './context/TelemetryContext';
import { TimeProvider } from './context/TimeContext';
import { Communications } from './pages/Communications';
import { Crew } from './pages/Crew';
import { Overview } from './pages/Dashboard';
import { MissionLogs } from './pages/MissionLogs';
import { Orbit } from './pages/Orbit';
import { Spacecraft } from './pages/Spacecraft';
import { Telemetry } from './pages/Telemetry';

export const PAGES = { overview: Overview, orbit: Orbit, spacecraft: Spacecraft, telemetry: Telemetry, crew: Crew, comms: Communications, logs: MissionLogs };

export function App() {
  const [booting, setBooting] = useState(() => {
    try { return sessionStorage.getItem('aether-booted') !== '1'; } catch (e) { return true; }
  });
  const done = useCallback(() => {
    setBooting(false);
    try { sessionStorage.setItem('aether-booted', '1'); } catch (e) { /* storage unavailable */ }
  }, []);
  const replay = useCallback(() => setBooting(true), []);
  return (
    <TimeProvider>
      <TelemetryProvider>
        <MissionProvider active={!booting}>
          <Starfield />
          <Shell booting={booting} replayBoot={replay} />
          {booting && <Boot onDone={done} />}
        </MissionProvider>
      </TelemetryProvider>
    </TimeProvider>
  );
}
