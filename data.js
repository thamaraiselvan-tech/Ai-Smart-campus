/* ============================================================
   CampusNexus — Hardcoded Demo Data
   All numbers are pre-loaded for the static demo. No backend.
   ============================================================ */

const CampusData = {

  /* ── Buildings ──────────────────────────────────────────── */
  buildings: [
    { id: 'blockA', name: 'Block A',          status: 'normal',       x: -3.2, z: -2.4, width: 2.6, depth: 1.8, height: 1.6, occupancy: 72, power: 45.2, water: 8.2 },
    { id: 'blockB', name: 'Block B',          status: 'normal',       x:  0.5, z: -2.8, width: 2.0, depth: 2.0, height: 2.2, occupancy: 85, power: 62.0, water: 12.4 },
    { id: 'blockC', name: 'Block C',          status: 'alert',        x:  3.8, z: -1.0, width: 2.4, depth: 1.6, height: 1.8, occupancy: 64, power: 38.0, water: 18.4 },
    { id: 'blockD', name: 'Block D',          status: 'powered_down', x: -2.8, z:  1.8, width: 1.8, depth: 2.2, height: 1.2, occupancy: 0,  power: 0.5,  water: 0.2 },
    { id: 'library', name: 'Library',         status: 'normal',       x:  0.8, z:  1.2, width: 3.0, depth: 2.0, height: 1.6, occupancy: 91, power: 28.0, water: 3.1 },
    { id: 'cafeteria', name: 'Cafeteria',     status: 'normal',       x: -0.8, z:  4.2, width: 2.5, depth: 1.5, height: 1.0, occupancy: 45, power: 22.0, water: 15.6 },
    { id: 'gym', name: 'Sports Complex',      status: 'powered_down', x:  3.8, z:  3.2, width: 2.2, depth: 2.6, height: 1.4, occupancy: 0,  power: 1.2,  water: 0.8 },
    { id: 'admin', name: 'Admin Block',       status: 'normal',       x: -4.2, z:  3.8, width: 1.6, depth: 1.6, height: 2.4, occupancy: 78, power: 18.0, water: 4.2 },
  ],

  /* ── Room-level detail (Block C — the featured building) ─ */
  rooms: [
    { name: 'Room 201',      occupied: true,  lights: 'on',  ac: 'on',  lastAction: '10:42 AM — AC set to 24 °C' },
    { name: 'Room 202',      occupied: true,  lights: 'on',  ac: 'on',  lastAction: '10:38 AM — Lights auto ON' },
    { name: 'Room 203',      occupied: false, lights: 'off', ac: 'off', lastAction: '10:15 AM — Lights OFF (empty 12 min)' },
    { name: 'Room 204',      occupied: false, lights: 'off', ac: 'off', lastAction: '09:58 AM — AC shutoff (empty 15 min)' },
    { name: 'Room 205',      occupied: true,  lights: 'on',  ac: 'on',  lastAction: '10:30 AM — AC set to 23 °C' },
    { name: 'Lab 1',         occupied: true,  lights: 'on',  ac: 'on',  lastAction: '09:00 AM — Scheduled power-on' },
    { name: 'Lab 2',         occupied: false, lights: 'off', ac: 'off', lastAction: '10:20 AM — Full shutoff (no class)' },
    { name: 'Seminar Hall',  occupied: true,  lights: 'on',  ac: 'on',  lastAction: '10:00 AM — Occupancy detected' },
  ],

  /* ── KPI cards ─────────────────────────────────────────── */
  kpi: {
    energySaved: {
      value: 142,
      unit: 'kWh',
      trend: [80, 95, 88, 110, 105, 120, 115, 130, 125, 138, 135, 142],
    },
    waterPrevented: {
      value: 1240,
      unit: 'L',
      trend: [500, 650, 720, 800, 880, 950, 1020, 1080, 1120, 1180, 1210, 1240],
    },
  },

  /* ── Nexus Insight (the pitch-winning card) ────────────── */
  nexusInsight: "Block C's water pump was rescheduled to 1–4 AM (off-peak), saving an estimated ₹380/day by pairing water demand with idle electricity capacity.",

  /* ── Ticker items ──────────────────────────────────────── */
  ticker: [
    { icon: '⚡', text: 'Lights OFF — Room 204 (empty 12 min)',            time: '10:15 AM' },
    { icon: '💧', text: 'Leak flagged — Tank 2, flow +34 % above baseline', time: '10:08 AM' },
    { icon: '⚡', text: 'AC shutoff — Lab 2 (no scheduled class)',          time: '10:02 AM' },
    { icon: '💧', text: 'Pump rescheduled — Block C to off-peak (1–4 AM)',  time: '09:45 AM' },
    { icon: '⚡', text: 'Sports Complex powered down — zero occupancy',     time: '09:30 AM' },
  ],

  /* ── 24-hour power chart (building drill-down) ─────────── */
  powerChart24h: {
    labels: [
      '12 AM','1 AM','2 AM','3 AM','4 AM','5 AM','6 AM','7 AM',
      '8 AM','9 AM','10 AM','11 AM','12 PM','1 PM','2 PM','3 PM',
      '4 PM','5 PM','6 PM','7 PM','8 PM','9 PM','10 PM','11 PM',
    ],
    data: [12, 10, 8, 6, 5, 5, 8, 22, 38, 45, 52, 48, 42, 40, 44, 28, 42, 38, 28, 20, 15, 14, 13, 12],
    //                                                                   ↑ auto-shutoff dip at 3 PM (index 15)
    shutoffIndex: 15,
  },

  /* ── Water / pipe network ──────────────────────────────── */
  waterNetwork: {
    nodes: [
      { id: 'mainTank',   name: 'Main Tank',    rx: 0.13, ry: 0.22, flow: 24.2, status: 'normal' },
      { id: 'junction1',  name: 'Junction A',   rx: 0.40, ry: 0.30, flow: 14.8, status: 'normal' },
      { id: 'tank2',      name: 'Tank 2',       rx: 0.70, ry: 0.22, flow: 18.4, status: 'anomaly', expected: '11–14' },
      { id: 'junction2',  name: 'Junction B',   rx: 0.40, ry: 0.68, flow: 9.4,  status: 'normal' },
      { id: 'blockCTank', name: 'Block C Tank',  rx: 0.70, ry: 0.68, flow: 6.1,  status: 'normal' },
    ],
    connections: [
      ['mainTank',  'junction1'],
      ['junction1', 'tank2'],
      ['mainTank',  'junction2'],
      ['junction2', 'blockCTank'],
      ['junction1', 'junction2'],
    ],
  },

  /* ── Alerts / action log ───────────────────────────────── */
  alerts: [
    { type: 'water',  text: 'Leak flagged — Tank 2 flow 34 % above 7-day baseline',               time: '10:08 AM',       status: 'Needs review' },
    { type: 'energy', text: 'Lights OFF — Room 204 (empty 12 min)',                                time: '10:15 AM',       status: 'Auto-resolved' },
    { type: 'energy', text: 'AC shutoff — Lab 2 (no scheduled class)',                             time: '10:02 AM',       status: 'Auto-resolved' },
    { type: 'water',  text: 'Pump rescheduled — Block C to off-peak window (1–4 AM)',              time: '09:45 AM',       status: 'Auto-resolved' },
    { type: 'energy', text: 'Sports Complex full power-down — zero occupancy detected',            time: '09:30 AM',       status: 'Auto-resolved' },
    { type: 'energy', text: 'Block D powered down — weekend, no scheduled activity',               time: '08:00 AM',       status: 'Auto-resolved' },
    { type: 'water',  text: 'Morning flow spike — within expected range for Monday',               time: '07:30 AM',       status: 'Auto-resolved' },
    { type: 'energy', text: 'Block A AC pre-cooling started — first class at 08:30',               time: '07:15 AM',       status: 'Auto-resolved' },
    { type: 'energy', text: 'Night mode activated — campus-wide dimming',                          time: '11:00 PM (prev)', status: 'Auto-resolved' },
    { type: 'water',  text: 'Tank 1 refill scheduled — overnight low-demand window',               time: '10:30 PM (prev)', status: 'Auto-resolved' },
  ],
};
