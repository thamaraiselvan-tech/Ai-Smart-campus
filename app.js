/* ============================================================
   Saranathan College of Engineering — App Controller
   Navigation, Building Inspection, Room Filtering & Analytics
   ============================================================ */

const App = {
  currentScreen: 'overview',
  currentFilter: 'all',
  currentBuilding: null,
  _waterInitialized: false,
  _powerChartInitialized: false,

  /* ── Bootstrap ────────────────────────────────────────── */
  init() {
    this._setupNav();
    this._setupRoomFilters();
    this._populateTicker();
    this._populateAlerts();
    this._updateClock();
    setInterval(() => this._updateClock(), 30000);

    // Initialize 3D canvas and sparklines
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

    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => this.showScreen('overview'));
    }
  },

  showScreen(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById('screen-' + name);
    if (target) target.classList.add('active');

    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const navItem = document.querySelector('[data-screen="' + name + '"]');
    if (navItem) navItem.classList.add('active');

    const titles = {
      overview: 'Campus Overview',
      building: 'Block Details & Analytics',
      water:    'Water & Leak Network',
      alerts:   'Autonomous Action & Audit Log',
    };
    const titleEl = document.getElementById('screen-title');
    if (titleEl) titleEl.textContent = titles[name] || name;

    // If opening building screen directly, guarantee building data is populated
    if (name === 'building' && !this.currentBuilding) {
      this.currentBuilding = CampusData.buildings[0]; // Default to KS block
    }

    if (name === 'building' && this.currentBuilding) {
      this._updateBuildingHeaderStats(this.currentBuilding);
      this._updateFilterTabCounts();
      this._populateRooms();
    }

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
    this.currentBuilding = building;
    this.currentFilter = 'all';

    this._updateBuildingHeaderStats(building);
    this._updateFilterTabCounts();
    this._populateRooms();

    // Trigger 3D Layer Expansion view on canvas
    if (typeof Campus3D !== 'undefined' && Campus3D.expandBuilding) {
      Campus3D.expandBuilding(building);
    }

    // Switch screen to building view
    this.showScreen('building');

    if (this._powerChartInitialized) {
      requestAnimationFrame(() => Charts.initPowerChart());
    }
  },

  _updateBuildingHeaderStats(building) {
    const nameEl   = document.getElementById('building-name');
    const subEl    = document.getElementById('building-subtitle');
    const occEl    = document.getElementById('building-occupancy');
    const powEl    = document.getElementById('building-power');
    const watEl    = document.getElementById('building-water');
    const solEl    = document.getElementById('building-solar');
    const statusEl = document.getElementById('building-status-badge');

    if (nameEl) nameEl.textContent = building.name;
    if (subEl)  subEl.textContent  = building.subtitle || 'Saranathan Campus Building';
    if (occEl)  occEl.textContent  = building.occupancy + '%';
    if (powEl)  powEl.textContent  = building.power + ' kW';
    if (watEl)  watEl.textContent  = building.water + ' L/min';
    if (solEl)  solEl.textContent  = (building.solarGeneration || 0) + ' kW';

    if (statusEl) {
      if (building.status === 'alert') {
        statusEl.textContent = 'ANOMALY ALERT';
        statusEl.className = 'status-badge alert';
      } else if (building.status === 'powered_down') {
        statusEl.textContent = 'STANDBY MODE';
        statusEl.className = 'status-badge standby';
      } else {
        statusEl.textContent = 'ACTIVE OPERATIONAL';
        statusEl.className = 'status-badge';
      }
    }

    // Populate Rainwater & Solar Subsystem Card
    const rainCapEl   = document.getElementById('detail-rain-capacity');
    const rainLvlEl   = document.getElementById('detail-rain-level');
    const rainBarEl   = document.getElementById('detail-rain-bar');
    const solarGenEl  = document.getElementById('detail-solar-gen');
    const solarBarEl  = document.getElementById('detail-solar-bar');

    const rainCap   = building.rainwaterCapacity || 15000;
    const rainLevel = building.rainwaterLevel || 75;
    const solarGen  = building.solarGeneration || 18.2;

    if (rainCapEl) rainCapEl.textContent = rainCap.toLocaleString() + ' L';
    if (rainLvlEl) rainLvlEl.textContent = rainLevel + '% Reservoir Level';
    if (rainBarEl) rainBarEl.style.width = rainLevel + '%';
    if (solarGenEl) solarGenEl.textContent = solarGen + ' kW';
    if (solarBarEl) solarBarEl.style.width = Math.min(100, Math.round((solarGen / 35) * 100)) + '%';

    // Populate Ambient & Equipment Specs
    const aqiEl     = document.getElementById('detail-aqi');
    const tempEl    = document.getElementById('detail-temp');
    const copEl     = document.getElementById('detail-hvac-cop');

    if (aqiEl)  aqiEl.textContent  = (building.aqi || 38) + ' AQI (Good)';
    if (tempEl) tempEl.textContent = (building.temp || 23.5) + ' °C';
    if (copEl)  copEl.textContent  = (building.hvacEfficiency || 94) + '% Efficiency';
  },

  /* ── Room Category Filter Tabs ─────────────────────────── */
  _setupRoomFilters() {
    document.querySelectorAll('.filter-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.currentFilter = tab.getAttribute('data-filter') || 'all';
        this._populateRooms();
      });
    });
  },

  _getRoomsForCurrentBuilding() {
    if (!this.currentBuilding) return CampusData.rooms;
    const bId = this.currentBuilding.id;
    return (CampusData.blockRooms && CampusData.blockRooms[bId]) ? CampusData.blockRooms[bId] : CampusData.rooms;
  },

  _updateFilterTabCounts() {
    const roomsList = this._getRoomsForCurrentBuilding();
    const allCount  = roomsList.length;
    const occCount  = roomsList.filter(r => r.occupied).length;
    const hvacCount = roomsList.filter(r => r.ac === 'on').length;
    const ecoCount  = roomsList.filter(r => !r.occupied).length;

    const elAll  = document.getElementById('count-all');
    const elOcc  = document.getElementById('count-occupied');
    const elHvac = document.getElementById('count-hvac');
    const elEco  = document.getElementById('count-eco');

    if (elAll)  elAll.textContent  = allCount;
    if (elOcc)  elOcc.textContent  = occCount;
    if (elHvac) elHvac.textContent = hvacCount;
    if (elEco)  elEco.textContent  = ecoCount;
  },

  _populateRooms() {
    const grid = document.getElementById('rooms-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const roomsList = this._getRoomsForCurrentBuilding();
    let filteredRooms = roomsList;

    if (this.currentFilter === 'occupied') {
      filteredRooms = roomsList.filter(r => r.occupied);
    } else if (this.currentFilter === 'hvac') {
      filteredRooms = roomsList.filter(r => r.ac === 'on');
    } else if (this.currentFilter === 'eco') {
      filteredRooms = roomsList.filter(r => !r.occupied);
    }

    if (filteredRooms.length === 0) {
      grid.innerHTML = `
        <div class="empty-rooms-msg">
          <span>ℹ️</span> No rooms found for the selected filter category.
        </div>
      `;
      return;
    }

    filteredRooms.forEach((room, i) => {
      const card = document.createElement('div');
      card.className = 'room-card';
      card.style.animationDelay = (i * 0.05) + 's';
      card.style.animation = 'fadeInUp 0.4s ease both';

      const occupiedClass = room.occupied ? 'occupied' : 'empty';
      const lightsClass   = room.lights === 'on' ? 'on' : 'off';
      const acClass       = room.ac === 'on' ? 'on' : 'off';

      card.innerHTML = `
        <div class="room-top">
          <span class="room-name">${room.name}</span>
          <span class="occupancy-dot ${occupiedClass}" title="${room.occupied ? 'Occupied / Active' : 'Empty / Eco'}"></span>
        </div>
        <div class="room-statuses">
          <span class="room-status-pill ${lightsClass}">💡 Lights ${room.lights.toUpperCase()}</span>
          <span class="room-status-pill ${acClass}">❄️ HVAC ${room.ac.toUpperCase()} (${room.temp})</span>
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

    track.innerHTML = itemsHTML + itemsHTML;
  },

  /* ── Action & Audit Log List ──────────────────────────── */
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

  /* ── Clock Update ─────────────────────────────────────── */
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
