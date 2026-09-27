export const LOG_CATS = {
  navigation: { label: 'Navigation' },
  telemetry: { label: 'Telemetry' },
  communication: { label: 'Communication' },
  system: { label: 'System' },
  alert: { label: 'Alert' },
};

export function seedLogs() {
  const now = Date.now();
  const L = [
    [0.4, 'navigation', 'Orbital correction completed', 'TCM-4 burn 12.4 s, \u0394v 1.82 m/s. Residuals within 0.3 sigma.'],
    [3.6, 'telemetry', 'Telemetry synchronized', 'All 1,284 channels aligned to ground epoch.'],
    [20, 'communication', 'Communication window opened', 'Halden-34 acquired signal. Ka-band downlink at 2.4 Mbps.'],
    [40, 'navigation', 'Navigation calibration complete', 'Star tracker alignment updated. Attitude error 0.004°.'],
    [52, 'alert', 'Thermal loop B approaching threshold', 'Radiator loop B at 38.6 °C against a 40.0 °C limit.'],
    [74, 'system', 'Payload heaters cycled', 'Lunar mapper held at survival temperature.'],
    [95, 'system', 'Lunar orbit insertion burn scheduled', 'Main engine, 382 s, \u0394v 873 m/s.'],
    [128, 'communication', 'Crew private conference ended', ''],
    [166, 'system', 'Power bus B load rebalanced', 'Galley and payload heaters moved to bus A.'],
    [210, 'telemetry', 'High-rate telemetry mode ended', 'Returned to 1 Hz housekeeping rate.'],
    [262, 'navigation', 'Trajectory correction 4 planned', 'Burn uplinked for crew review.'],
    [340, 'system', 'Crew sleep period ended', ''],
    [470, 'communication', 'Daily planning conference', 'Flight plan revision C accepted.'],
  ];
  return L.map(([m, cat, title, detail], i) => ({ id: 'log-' + i, t: now - m * 60000, cat, title, detail }));
}
