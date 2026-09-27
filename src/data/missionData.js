export const T0 = Date.now();

export const LAUNCH_AT = T0 - (4 * 86400 + 6 * 3600 + 12 * 60 + 9) * 1000;

export const LOI_AT = T0 + (2 * 3600 + 14 * 60 + 33) * 1000;

export const MISSION = {
  code: 'AE-07',
  name: 'Orbital Frontier',
  vehicle: 'AETHER-7',
  station: 'Halden-34',
  nextStation: 'Mirador-12',
  loiDuration: 382,
  loiDv: 873,
};

export const missionProgress = (now) => 78 + ((now - T0) / 3.6e6) * 0.35;

export const PHASES = [
  { id: 'launch', name: 'Launch and ascent', when: 'MET 0d 00:00', state: 'done' },
  { id: 'leo', name: 'Earth parking orbit', when: 'MET 0d 00:12', state: 'done' },
  { id: 'tli', name: 'Translunar injection', when: 'MET 0d 02:41', state: 'done' },
  { id: 'coast', name: 'Translunar coast', when: 'MET 0d 02:48', state: 'done' },
  { id: 'loi', name: 'Lunar orbit insertion', when: 'Approach', state: 'current' },
  { id: 'science', name: 'Science orbit', when: 'After LOI + 2 trims', state: 'next' },
];
