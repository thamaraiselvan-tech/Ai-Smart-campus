/* ============================================================
   Saranathan College of Engineering — App Controller
   Navigation, Screen Management, Data Population & Inspection
   ============================================================ */

const App = {
  currentScreen: 'overview',
  _waterInitialized: false,
  _powerChartInitialized: false,

  /* ── Bootstrap ────────────────────────────────────────── */
  init() {
    this._setupNav();
    this._populateTicker();
    this._populateAlerts();
    this._updateClock();
    setInterval(() => this._updateClock(), 30000);

    // Initialize 3D canvas and sparkline charts on startup
    Campus3D.init('campus-3d');
    Charts.initSparklines();
  },

  /* ── Navigation ───────────────────────────────────────── */
  _setupNav() {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const screen = item.getAttribute('data-screen');
        if (screen) this.showScreen(screen);
      });
    });

    // Back button on building drill-down screen
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => this.showScreen('overview'));
    }
  },

  showScreen(name) {
    // Hide all screens & show target
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById('screen-' + name);
    if (target) target.classList.add('active');

    // Update active navigation icon
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const navItem = document.querySelector('[data-screen="' + name + '"]');
    if (navItem) navItem.classList.add('active');

    // Update screen headers
    const titles = {
      overview: 'Campus Overview',
      building: 'Block Details & Analytics',
      water:    'Water & Leak Network',
      alerts:   'Autonomous Action & Audit Log',
    };
    const titleEl = document.getElementById('screen-title');
    if (titleEl) titleEl.textContent = titles[name] || name;

    // Deferred initialization for screens with heavy canvases
    requestAnimationFrame(() => {
      if (name === 'water' && !this._waterInitialized) {
        WaterNetwork.init('water-network');
        this._waterInitialized = true;
      }
      if (name === 'building' && !this._powerChartInitialized) {
        Charts.initPowerChart();
        this._powerChartInitialized = true;
      }
      if (name === 'overview') {
        Campus3D.onResize();
      }
    });

    this.currentScreen = name;
  },

  /* ── Building Inspection Drill-down ────────────────────── */
  showBuilding(building) {
    const nameEl = document.getElementById('building-name');
    const subEl  = document.getElementById('building-subtitle');
    const occEl  = document.getElementById('building-occupancy');
    const powEl  = document.getElementById('building-power');
    const watEl  = document.getElementById('building-water');

    if (nameEl) nameEl.textContent = building.name;
    if (subEl)  subEl.textContent  = building.subtitle || 'Saranathan Campus Building';
    if (occEl)  occEl.textContent  = building.occupancy + '%';
    if (powEl)  powEl.textContent  = building.power + ' kW';
    if (watEl)  watEl.textContent  = building.water + ' L/min';

    // Populate room cards
    this._populateRooms();

    // Switch to building view
    this.showScreen('building');

    // Re-render power chart if canvas resized
    if (this._powerChartInitialized) {
      requestAnimationFrame(() => Charts.initPowerChart());
    }
  },

  _populateRooms() {
    const grid = document.getElementById('rooms-grid');
    if (!grid) return;
    grid.innerHTML = '';

    CampusData.rooms.forEach((room, i) => {
      const card = document.createElement('div');
      card.className = 'room-card';
      card.style.animationDelay = (i * 0.05) + 's';
      card.style.animation = 'fadeInUp 0.4s ease both';

      const occupiedClass = room.occupied ? 'occupied' : 'empty';
      const lightsClass = room.lights === 'on' ? 'on' : 'off';
      const acClass = room.ac === 'on' ? 'on' : 'off';

      card.innerHTML = `
        <div class="room-top">
          <span class="room-name">${room.name}</span>
          <span class="occupancy-dot ${occupiedClass}" title="${room.occupied ? 'Occupied' : 'Empty'}"></span>
        </div>
        <div class="room-statuses">
          <span class="room-status-pill ${lightsClass}">💡 Lights ${room.lights.toUpperCase()}</span>
          <span class="room-status-pill ${acClass}">❄️ HVAC ${room.ac.toUpperCase()}</span>
        </div>
        <div class="room-action">${room.lastAction}</div>
      `;

      grid.appendChild(card);
    });
  },

  /* ── Live Ticker Strip ─────────────────────────────────── */
  _populateTicker() {
    const track = document.getElementById('ticker-track');
    if (!track) return;
    track.innerHTML = '';

    const itemsHTML = CampusData.ticker.map(t =>
      `<span class="ticker-item">
        <span class="ticker-icon">${t.icon}</span>
        <span>${t.text}</span>
        <span class="ticker-time">${t.time}</span>
      </span>
      <span class="ticker-separator">●</span>`
    ).join('');

    // Duplicate for seamless infinite scrolling loop
    track.innerHTML = itemsHTML + itemsHTML;
  },

  /* ── Alerts & Action Log List ──────────────────────────── */
  _populateAlerts() {
    const list = document.getElementById('alerts-list');
    if (!list) return;
    list.innerHTML = '';

    CampusData.alerts.forEach((alert, i) => {
      const item = document.createElement('div');
      item.className = 'alert-item';
      item.style.animationDelay = (i * 0.05) + 's';

      const iconClass = alert.type === 'energy' ? 'energy' : 'water';
      const icon = alert.type === 'energy' ? '⚡' : '💧';
      const pillClass = alert.status === 'Auto-resolved' ? 'resolved' : 'review';

      item.innerHTML = `
        <div class="alert-icon-wrapper ${iconClass}">${icon}</div>
        <span class="alert-text">${alert.text}</span>
        <span class="alert-time">${alert.time}</span>
        <span class="status-pill ${pillClass}">${alert.status}</span>
      `;

      list.appendChild(item);
    });
  },

  /* ── Real-time Header Clock ───────────────────────────── */
  _updateClock() {
    const el = document.getElementById('topbar-time');
    if (!el) return;
    const now = new Date();
    let h = now.getHours();
    const m = String(now.getMinutes()).padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    el.textContent = h + ':' + m + ' ' + ampm;
  },
};

/* ── Bootstrap on DOM Ready ──────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
