/* ============================================================
   Saranathan College of Engineering — Smart Campus Data Model
   Institutional Blocks, Sub-surface Rainwater & Solar Intelligence
   ============================================================ */

const CampusData = {

  /* ── Institution Info ───────────────────────────────────── */
  institution: {
    name: 'Saranathan College of Engineering',
    tagline: 'Autonomous AI-Powered Smart Campus Intelligence',
    location: 'Venkateswara Nagar, Panjappur, Tiruchirappalli',
  },

  /* ── Campus 3D Blocks (Off-center Ground & Basketball Court) ─ */
  buildings: [
    {
      id: 'rvBlock',
      name: 'RV block',
      subtitle: 'Electronics & Communication / Information Tech',
      status: 'normal',
      x: -4.0, z: -2.8, width: 3.2, depth: 2.2, height: 2.6,
      occupancy: 88, power: 58.4, water: 12.1,
      solarGeneration: 24.5, rainwaterCapacity: 18000, rainwaterLevel: 82, aqi: 38, temp: 23.5, hvacEfficiency: 94,
    },
    {
      id: 'ksBlock',
      name: 'KS block',
      subtitle: 'Computer Science & AI Labs / Executive Admin',
      status: 'normal',
      x:  0.0, z: -3.2, width: 3.6, depth: 2.0, height: 3.0,
      occupancy: 94, power: 64.2, water: 14.8,
      solarGeneration: 32.0, rainwaterCapacity: 22000, rainwaterLevel: 88, aqi: 35, temp: 23.0, hvacEfficiency: 96,
    },
    {
      id: 'jsBlock',
      name: 'JS block',
      subtitle: 'Electrical & Electronics / Basic Sciences',
      status: 'alert',
      x:  4.2, z: -2.8, width: 3.0, depth: 2.2, height: 2.4,
      occupancy: 76, power: 42.0, water: 19.5,
      solarGeneration: 18.2, rainwaterCapacity: 15000, rainwaterLevel: 64, aqi: 45, temp: 24.2, hvacEfficiency: 88,
    },
    {
      id: 'cafeteria',
      name: 'Cafeteria',
      subtitle: 'Central Dining Pavilion & Student Commons',
      status: 'normal',
      x: -3.6, z:  2.4, width: 2.8, depth: 2.0, height: 1.3,
      occupancy: 68, power: 28.5, water: 24.4,
      solarGeneration: 14.0, rainwaterCapacity: 12000, rainwaterLevel: 75, aqi: 42, temp: 25.0, hvacEfficiency: 91,
    },
    {
      id: 'generatorRoom',
      name: 'Generator room',
      subtitle: 'Power Substation & HV Grid Transformer',
      status: 'normal',
      x:  0.0, z:  4.5, width: 2.0, depth: 1.5, height: 1.2,
      occupancy: 8,  power: 118.0, water: 1.8,
      solarGeneration: 8.5,  rainwaterCapacity: 5000,  rainwaterLevel: 90, aqi: 50, temp: 27.5, hvacEfficiency: 85,
    },
    {
      id: 'mechBlock',
      name: 'Mech Block',
      subtitle: 'Mechanical Workshop & CNC Automation Labs',
      status: 'normal',
      x:  3.6, z:  2.4, width: 3.4, depth: 2.4, height: 1.9,
      occupancy: 82, power: 72.8, water: 8.6,
      solarGeneration: 28.0, rainwaterCapacity: 20000, rainwaterLevel: 78, aqi: 44, temp: 24.8, hvacEfficiency: 90,
    },
    {
      id: 'basketballCourt',
      name: 'Basketball Court',
      subtitle: 'Outdoor Acrylic Court & Underground Rainwater Cistern',
      status: 'normal',
      x:  7.2, z:  2.2, width: 3.4, depth: 2.2, height: 0.1,
      occupancy: 45, power: 4.8,  water: 0.0,
      solarGeneration: 16.5, rainwaterCapacity: 45000, rainwaterLevel: 92, aqi: 28, temp: 27.0, hvacEfficiency: 100,
    },
    {
      id: 'ground',
      name: 'Ground',
      subtitle: 'Main College Sports Turf & Athletic Track Oval',
      status: 'powered_down',
      x: -7.5, z:  2.2, width: 4.6, depth: 3.2, height: 0.08,
      occupancy: 20, power: 2.4,  water: 0.0,
      solarGeneration: 0.0,  rainwaterCapacity: 35000, rainwaterLevel: 95, aqi: 25, temp: 28.0, hvacEfficiency: 100,
    },
  ],

  /* ── Detailed Room Inspection Data (Dynamic Filter Categories) ── */
  rooms: [
    { id: 'r101', name: 'JS-101 (Power Systems Lab)', category: 'occupied hvac', occupied: true,  lights: 'on',  ac: 'on',  temp: '23 °C', capacity: 85, lastAction: '11:42 AM — Smart HVAC optimized to 23 °C' },
    { id: 'r102', name: 'JS-102 (Embedded Systems Lab)', category: 'occupied hvac', occupied: true,  lights: 'on',  ac: 'on',  temp: '23 °C', capacity: 92, lastAction: '11:35 AM — Auto-occupancy verified' },
    { id: 'r201', name: 'JS-201 (High Voltage Lab)', category: 'eco',           occupied: false, lights: 'off', ac: 'off', temp: '26 °C', capacity: 0,  lastAction: '11:15 AM — Lights OFF (idle 15 min)' },
    { id: 'r202', name: 'JS-202 (Lecture Hall 4)',   category: 'eco',           occupied: false, lights: 'off', ac: 'off', temp: '25 °C', capacity: 0,  lastAction: '10:58 AM — AC auto shutoff (no class)' },
    { id: 'r301', name: 'JS-301 (IoT Research Lab)', category: 'occupied hvac', occupied: true,  lights: 'on',  ac: 'on',  temp: '22 °C', capacity: 78, lastAction: '11:30 AM — Workstation load normal' },
    { id: 'r302', name: 'JS Simulation Center',    category: 'occupied hvac', occupied: true,  lights: 'on',  ac: 'on',  temp: '23 °C', capacity: 64, lastAction: '10:00 AM — Scheduled research run' },
    { id: 'r401', name: 'JS Seminar Hall',          category: 'eco',           occupied: false, lights: 'off', ac: 'off', temp: '25 °C', capacity: 0,  lastAction: '11:20 AM — Session ended, standby mode' },
    { id: 'r402', name: 'JS Faculty Wing',          category: 'occupied',      occupied: true,  lights: 'on',  ac: 'off', temp: '24 °C', capacity: 50, lastAction: '11:00 AM — Natural ventilation mode' },
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
  nexusInsight: "Saranathan AI Engine synchronized Basketball Court sub-surface rainwater runoff (45,000 L tank) with JS Block cooling loops, saving ₹620/day while generating 16.5 kW from canopy solar.",

  /* ── Real-time Campus Ticker ───────────────────────────── */
  ticker: [
    { icon: '🏀', text: 'Basketball Court — Sub-surface rainwater harvesting tank at 92% capacity (45,000 L reservoir)', time: '11:50 AM' },
    { icon: '☀️', text: 'Roof Solar Array — Generating 141.7 kW total across campus blocks', time: '11:46 AM' },
    { icon: '⚡', text: 'KS Block — Computer Lab 3 HVAC throttled to eco mode', time: '11:45 AM' },
    { icon: '💧', text: 'JS Block Tank — Minor flow variation (+18%) flagged for check', time: '11:38 AM' },
    { icon: '🌱', text: 'Ground — Smart turf drip irrigation complete (05:30–06:00 AM)', time: '06:00 AM' },
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
      { id: 'mainTank',       name: 'Central Cistern',          rx: 0.12, ry: 0.25, flow: 32.5, status: 'normal' },
      { id: 'courtRainwater', name: 'Court Rainwater Tank',     rx: 0.40, ry: 0.20, flow: 16.2, status: 'normal' },
      { id: 'jsWater',        name: 'JS Block Supply',          rx: 0.72, ry: 0.22, flow: 19.5, status: 'anomaly', expected: '11–14' },
      { id: 'cafeteriaWater', name: 'Cafeteria Junction',      rx: 0.40, ry: 0.70, flow: 24.4, status: 'normal' },
      { id: 'mechWater',      name: 'Mech Block Line',          rx: 0.72, ry: 0.70, flow: 8.6,  status: 'normal' },
    ],
    connections: [
      ['mainTank',       'courtRainwater'],
      ['courtRainwater', 'jsWater'],
      ['mainTank',       'cafeteriaWater'],
      ['cafeteriaWater', 'mechWater'],
      ['courtRainwater', 'cafeteriaWater'],
    ],
  },

  /* ── Action & Anomaly Log ──────────────────────────────── */
  alerts: [
    { type: 'water',  text: 'JS Block line flagged — flow 19.5 L/min exceeds baseline range (11–14 L/min)', time: '11:38 AM', status: 'Needs review' },
    { type: 'water',  text: 'Basketball Court Rainwater Reservoir — Underground filtration auto-flush cycle completed', time: '11:20 AM', status: 'Auto-resolved' },
    { type: 'energy', text: 'KS Block Lab 3 — Intelligent HVAC setpoint auto-tuned for 45 students',       time: '11:45 AM', status: 'Auto-resolved' },
    { type: 'energy', text: 'RV Block Lecture Hall 2 — Lights OFF automatically after 12 min zero motion',  time: '11:25 AM', status: 'Auto-resolved' },
    { type: 'energy', text: 'Generator Room — Automatic peak shaving activated during high college demand',  time: '10:30 AM', status: 'Auto-resolved' },
    { type: 'water',  text: 'Cafeteria main intake — Flow stabilized post lunch prep peak',                 time: '10:15 AM', status: 'Auto-resolved' },
    { type: 'energy', text: 'Mech Block CNC Lab — Equipment power-down sequence executed',                  time: '09:45 AM', status: 'Auto-resolved' },
    { type: 'water',  text: 'Ground Drip System — Overnight smart irrigation cycle completed (450 L saved)',  time: '06:00 AM', status: 'Auto-resolved' },
  ],
};
