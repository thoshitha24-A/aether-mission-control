export const CREW = [
  { id: 'sen', name: 'Aria Sen', initials: 'AS', role: 'Commander', position: 'Mission command', status: 'active', task: 'Navigation calibration', hue: 188, hr: 64, shift: 220,
    tasks: [['Crew brief', 'done'], ['Navigation calibration', 'now'], ['LOI checklist review', 'next']] },
  { id: 'vale', name: 'Dmitri Vale', initials: 'DV', role: 'Pilot', position: 'Flight dynamics', status: 'active', task: 'LOI burn rehearsal', hue: 212, hr: 71, shift: 205,
    tasks: [['Attitude timeline check', 'done'], ['LOI burn rehearsal', 'now'], ['Manual takeover drill', 'next']] },
  { id: 'haddad', name: 'Leila Haddad', initials: 'LH', role: 'Mission specialist', position: 'Payload and science', status: 'standby', task: 'Lunar mapper warm-up plan', hue: 168, hr: 58, shift: 310,
    tasks: [['Spectrometer calibration', 'done'], ['Mapper warm-up plan', 'now'], ['First light targets', 'next']] },
  { id: 'aoyama', name: 'Kenji Aoyama', initials: 'KA', role: 'Flight engineer', position: 'Vehicle systems', status: 'rest', task: 'Rest cycle', hue: 228, hr: 52, shift: 95,
    tasks: [['Thermal loop B review', 'done'], ['Rest cycle', 'now'], ['Pre-burn systems check', 'next']] },
];

export const CREW_STATUS = { active: { label: 'Active', cls: 'ok' }, standby: { label: 'Standby', cls: 'info' }, rest: { label: 'Rest cycle', cls: 'idle' } };
