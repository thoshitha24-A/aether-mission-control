export const CHANNELS = {
  control: { label: 'Mission Control', short: 'CTRL' },
  craft: { label: 'AETHER-7', short: 'AE-7' },
  ground: { label: 'Ground station', short: 'GND' },
  auto: { label: 'Autonomous system', short: 'AUTO' },
};

export function seedMessages() {
  const now = Date.now();
  const M = [
    [6.3, 'control', 'Trajectory correction confirmed. Good burn, AETHER.'],
    [6.1, 'craft', 'Copy. Navigation systems nominal, residuals 0.3 sigma.'],
    [5.0, 'ground', 'Halden-34 tracking. Ka-band lock, 2.4 megabit downlink.'],
    [3.3, 'auto', 'Thermal manager: loop B flow increased to 112 percent.'],
    [2.1, 'control', 'AETHER, confirm cabin configuration for LOI at your convenience.'],
    [1.4, 'craft', 'Cabin configured. Crew seated by T minus 30.'],
  ];
  return M.map(([m, src, text], i) => ({ id: 'msg-' + i, t: now - m * 60000, src, text }));
}

export const INCOMING_POOL = [
  ['ground', 'Range and range-rate nominal. Doppler residuals under 0.1 Hz.'],
  ['auto', 'Onboard navigation updated state vector from optical image 1143.'],
  ['craft', 'Mission Control, AETHER. Payload bay door indicator shows closed and latched.'],
  ['control', 'AETHER, Flight. You are go for LOI configuration at T minus 45.'],
  ['auto', 'Power manager trimmed array 2 gimbal 0.4° for sun pointing.'],
  ['ground', 'Mirador-12 standing by for handover.'],
  ['craft', 'Guidance display matches the ground solution. Commander Sen concurs.'],
];

export const ACKS = ['Copy, Mission Control.', 'AETHER copies all.', 'Copy. Will advise when complete.', 'Understood. Proceeding.'];

export const QUICK = ['Request status report', 'Confirm LOI configuration', 'Go for lunar orbit insertion'];
