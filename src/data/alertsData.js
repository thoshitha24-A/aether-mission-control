export function seedAlerts() {
  const now = Date.now();
  return [
    { id: 'al-1', level: 'warning', title: 'Thermal subsystem approaching threshold', detail: 'Radiator loop B at 38.6 °C, limit 40.0 °C. Flow increased to 112 %.', t: now - 52 * 60000, read: false, system: 'thermal' },
    { id: 'al-2', level: 'info', title: 'Communication window open', detail: 'Halden-34 tracking pass ends in 3 h 12 min.', t: now - 20 * 60000, read: false },
    { id: 'al-3', level: 'info', title: 'Lunar orbit insertion burn scheduled', detail: 'Main engine burn 382 s, \u0394v 873 m/s.', t: now - 95 * 60000, read: true },
  ];
}

export const ALERT_POOL = [
  { delay: 75, level: 'info', title: 'Ground station handover prepared', detail: 'Halden-34 to Mirador-12 at the next pass boundary.' },
  { delay: 180, level: 'warning', title: 'Signal margin reduced', detail: 'High-gain antenna slewing to LOI attitude. Link margin 2.1 dB for about 4 minutes.', system: 'comms' },
  { delay: 320, level: 'info', title: 'Star tracker 2 reacquired lock', detail: 'Brief occultation by the lunar limb has cleared.', system: 'navigation' },
  { delay: 480, level: 'critical', title: 'Reaction wheel 3 current spike', detail: 'Wheel 3 drew 2.4 A for 0.8 s and was isolated automatically. Attitude held on remaining wheels.', system: 'navigation' },
];

export const LEVEL_META = { info: { label: 'Info', icon: 'info', cls: 'info' }, warning: { label: 'Warning', icon: 'warn', cls: 'warn' }, critical: { label: 'Critical', icon: 'crit', cls: 'crit' } };
