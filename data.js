/* ============================================================
   Saranathan College of Engineering — Smart Campus Data Model
   ============================================================ */

const CampusData = {

  /* ── Institution Info ───────────────────────────────────── */
  institution: {
    name: 'Saranathan College of Engineering',
    tagline: 'Autonomous AI-Powered Smart Campus Intelligence',
    location: 'Venkateswara Nagar, Panjappur, Tiruchirappalli',
  },

  /* ── Campus 3D Blocks (7 Requested Institutions Blocks) ─── */
  buildings: [
    {
      id: 'rvBlock',
      name: 'RV block',
      subtitle: 'Electronics & Communication / Information Tech',
      status: 'normal',
      x: -4.2, z: -2.8, width: 3.2, depth: 2.2, height: 2.4,
      occupancy: 88, power: 58.4, water: 12.1
    },
    {
      id: 'ksBlock',
      name: 'KS block',
      subtitle: 'Computer Science & AI Labs / Admin Wing',
      status: 'normal',
      x:  0.8, z: -3.2, width: 3.6, depth: 2.0, height: 2.8,
      occupancy: 94, power: 64.2, water: 14.8
    },
    {
      id: 'jsBlock',
      name: 'JS block',
      subtitle: 'Electrical & Electronics / Basic Sciences',
      status: 'alert',
      x:  4.6, z: -1.8, width: 3.0, depth: 2.2, height: 2.2,
      occupancy: 76, power: 42.0, water: 19.5
    },
    {
      id: 'cafeteria',
      name: 'Cafeteria',
      subtitle: 'Central Dining Pavilion & Food Court',
      status: 'normal',
      x: -4.0, z:  2.4, width: 2.8, depth: 2.0, height: 1.2,
      occupancy: 68, power: 28.5, water: 24.4
    },
    {
      id: 'generatorRoom',
      name: 'Generator room',
      subtitle: 'Power Substation & HV Transformer Grid',
      status: 'normal',
      x: -1.0, z:  4.8, width: 2.0, depth: 1.5, height: 1.1,
      occupancy: 8,  power: 118.0, water: 1.8
    },
    {
      id: 'mechBlock',
      name: 'Mech Block',
      subtitle: 'Mechanical Workshop & CNC Automation Labs',
      status: 'normal',
      x:  3.8, z:  2.8, width: 3.4, depth: 2.4, height: 1.8,
      occupancy: 82, power: 72.8, water: 8.6
    },
    {
      id: 'ground',
      name: 'Ground',
      subtitle: 'Main College Sports Turf & Track Oval',
      status: 'powered_down',
      x:  0.0, z:  0.2, width: 4.4, depth: 3.0, height: 0.08,
      occupancy: 20, power: 2.4,  water: 0.0
    },
  ],

  /* ── Detailed Room Inspection (Featured: JS Block) ──────── */
  rooms: [
    { name: 'JS-101 (Power Systems Lab)', occupied: true,  lights: 'on',  ac: 'on',  lastAction: '11:42 AM — Smart HVAC optimized to 24 °C' },
    { name: 'JS-102 (Embedded Systems)',  occupied: true,  lights: 'on',  ac: 'on',  lastAction: '11:35 AM — Auto-occupancy verified' },
    { name: 'JS-201 (High Voltage Lab)',  occupied: false, lights: 'off', ac: 'off', lastAction: '11:15 AM — Lights OFF (idle 15 min)' },
    { name: 'JS-202 (Lecture Hall 4)',    occupied: false, lights: 'off', ac: 'off', lastAction: '10:58 AM — AC auto shutoff (no class)' },
    { name: 'JS-301 (IoT Research Lab)',  occupied: true,  lights: 'on',  ac: 'on',  lastAction: '11:30 AM — Workstation load normal' },
    { name: 'JS Simulation Lab',         occupied: true,  lights: 'on',  ac: 'on',  lastAction: '10:00 AM — Scheduled research run' },
    { name: 'JS Seminar Hall',           occupied: false, lights: 'off', ac: 'off', lastAction: '11:20 AM — Session ended, standby mode' },
    { name: 'JS Faculty Wing',           occupied: true,  lights: 'on',  ac: 'on',  lastAction: '11:00 AM — Ambient lighting adjusted' },
  ],

  /* ── Key Performance Metrics ───────────────────────────── */
  kpi: {
    energySaved: {
      value: 185,
      unit: 'kWh',
      trend: [95, 110, 102, 130, 125, 145, 140, 160, 155, 172, 168, 185],
    },
    waterPrevented: {
      value: 1480,
      unit: 'L',
      trend: [600, 750, 820, 930, 1020, 1100, 1190, 1280, 1340, 1410, 1440, 1480],
    },
  },

  /* ── Official Institutional AI Insight ─────────────────── */
  nexusInsight: "Saranathan AI Engine synchronized Generator Room peak shaving with JS Block lab schedules, offsetting ₹540/day in peak tariff charges while maintaining thermal comfort across all blocks.",

  /* ── Real-time Campus Ticker ───────────────────────────── */
  ticker: [
    { icon: '⚡', text: 'KS Block — Computer Lab 3 HVAC throttled to eco mode', time: '11:45 AM' },
    { icon: '💧', text: 'JS Block Tank — Minor flow variation (+18%) flagged for check', time: '11:38 AM' },
    { icon: '⚡', text: 'RV Block — Room 204 lights auto OFF after 12 min idle', time: '11:25 AM' },
    { icon: '🌱', text: 'Ground — Smart turf drip irrigation complete (05:30–06:00 AM)', time: '06:00 AM' },
    { icon: '⚡', text: 'Generator Room — Main grid sync check passed 100% clean', time: '10:15 AM' },
  ],

  /* ── 24-Hour Campus Power Profile ──────────────────────── */
  powerChart24h: {
    labels: [
      '12 AM','1 AM','2 AM','3 AM','4 AM','5 AM','6 AM','7 AM',
      '8 AM','9 AM','10 AM','11 AM','12 PM','1 PM','2 PM','3 PM',
      '4 PM','5 PM','6 PM','7 PM','8 PM','9 PM','10 PM','11 PM'
    ],
    data: [15, 12, 10, 8, 8, 12, 28, 48, 85, 112, 128, 120, 110, 105, 118, 72, 105, 88, 52, 35, 24, 20, 18, 16],
    shutoffIndex: 15,
  },

  /* ── Institutional Water Distribution Graph ────────────── */
  waterNetwork: {
    nodes: [
      { id: 'mainTank',      name: 'Central Tank',      rx: 0.12, ry: 0.25, flow: 32.5, status: 'normal' },
      { id: 'rvWater',       name: 'RV Block Tank',     rx: 0.40, ry: 0.20, flow: 12.1, status: 'normal' },
      { id: 'jsWater',       name: 'JS Block Tank',     rx: 0.72, ry: 0.22, flow: 19.5, status: 'anomaly', expected: '11–14' },
      { id: 'cafeteriaWater',name: 'Cafeteria Junction', rx: 0.40, ry: 0.70, flow: 24.4, status: 'normal' },
      { id: 'mechWater',     name: 'Mech Block Line',   rx: 0.72, ry: 0.70, flow: 8.6,  status: 'normal' },
    ],
    connections: [
      ['mainTank',       'rvWater'],
      ['rvWater',        'jsWater'],
      ['mainTank',       'cafeteriaWater'],
      ['cafeteriaWater', 'mechWater'],
      ['rvWater',        'cafeteriaWater'],
    ],
  },

  /* ── Action & Anomaly Log ──────────────────────────────── */
  alerts: [
    { type: 'water',  text: 'JS Block line flagged — flow 19.5 L/min exceeds baseline range (11–14 L/min)', time: '11:38 AM', status: 'Needs review' },
    { type: 'energy', text: 'KS Block Lab 3 — Intelligent HVAC setpoint auto-tuned for 45 students',       time: '11:45 AM', status: 'Auto-resolved' },
    { type: 'energy', text: 'RV Block Lecture Hall 2 — Lights OFF automatically after 12 min zero motion',  time: '11:25 AM', status: 'Auto-resolved' },
    { type: 'energy', text: 'Generator Room — Automatic peak shaving activated during high college demand',  time: '10:30 AM', status: 'Auto-resolved' },
    { type: 'water',  text: 'Cafeteria main intake — Flow stabilized post lunch prep peak',                 time: '10:15 AM', status: 'Auto-resolved' },
    { type: 'energy', text: 'Mech Block CNC Lab — Equipment power-down sequence executed',                  time: '09:45 AM', status: 'Auto-resolved' },
    { type: 'water',  text: 'Ground Drip System — Overnight smart irrigation cycle completed (450 L saved)',  time: '06:00 AM', status: 'Auto-resolved' },
    { type: 'energy', text: 'Campus Night Dimming — Transitioned to active daylight operational profile',   time: '07:30 AM', status: 'Auto-resolved' },
  ],
};
