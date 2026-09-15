/* ============================================================
   CampusNexus — Chart.js Sparklines & Power Chart
   ============================================================ */

const Charts = {
  sparklineEnergy: null,
  sparklineWater: null,
  powerChart: null,

  /* ── KPI Sparklines (overview screen) ─────────────────── */
  initSparklines() {
    this._createSparkline(
      'energy-sparkline',
      CampusData.kpi.energySaved.trend,
      '#2DD4BF',
      'rgba(45, 212, 191, 0.12)',
      'sparklineEnergy'
    );
    this._createSparkline(
      'water-sparkline',
      CampusData.kpi.waterPrevented.trend,
      '#38BDF8',
      'rgba(56, 189, 248, 0.12)',
      'sparklineWater'
    );
  },

  _createSparkline(canvasId, data, borderColor, bgColor, storeProp) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    if (this[storeProp]) {
      this[storeProp].destroy();
    }

    const ctx = canvas.getContext('2d');

    this[storeProp] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map((_, i) => i),
        datasets: [{
          data: data,
          borderColor: borderColor,
          borderWidth: 2,
          fill: true,
          backgroundColor: bgColor,
          tension: 0.45,
          pointRadius: 0,
          pointHoverRadius: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
        },
        scales: {
          x: { display: false },
          y: { display: false },
        },
        interaction: { mode: null },
        animation: {
          duration: 1200,
          easing: 'easeOutQuart',
        },
        elements: {
          line: { borderCapStyle: 'round' },
        },
      },
    });
  },

  /* ── 24h Power Draw Chart (building drill-down) ───────── */
  initPowerChart() {
    const canvas = document.getElementById('power-chart');
    if (!canvas) return;

    if (this.powerChart) {
      this.powerChart.destroy();
    }

    const ctx = canvas.getContext('2d');
    const chartData = CampusData.powerChart24h;
    const shutoffIdx = chartData.shutoffIndex;

    // Custom annotation plugin
    const shutoffAnnotation = {
      id: 'shutoffAnnotation',
      afterDatasetsDraw(chart) {
        const meta = chart.getDatasetMeta(0);
        if (!meta || !meta.data[shutoffIdx]) return;

        const point = meta.data[shutoffIdx];
        const drawCtx = chart.ctx;
        const x = point.x;
        const y = point.y;

        drawCtx.save();

        // Vertical connector line
        drawCtx.beginPath();
        drawCtx.moveTo(x, y - 6);
        drawCtx.lineTo(x, y - 32);
        drawCtx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
        drawCtx.lineWidth = 1;
        drawCtx.setLineDash([3, 3]);
        drawCtx.stroke();
        drawCtx.setLineDash([]);

        // Label background
        const label = 'Auto shutoff triggered';
        drawCtx.font = '600 10px Inter, sans-serif';
        const textW = drawCtx.measureText(label).width;
        const padX = 8, padY = 4;
        const boxX = x - textW / 2 - padX;
        const boxY = y - 50;

        drawCtx.fillStyle = 'rgba(245, 158, 11, 0.15)';
        drawCtx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
        drawCtx.lineWidth = 1;
        // Manual rounded rect for browser compatibility
        const bw = textW + padX * 2, bh = 18 + padY, br = 4;
        drawCtx.beginPath();
        drawCtx.moveTo(boxX + br, boxY);
        drawCtx.lineTo(boxX + bw - br, boxY);
        drawCtx.arcTo(boxX + bw, boxY, boxX + bw, boxY + br, br);
        drawCtx.lineTo(boxX + bw, boxY + bh - br);
        drawCtx.arcTo(boxX + bw, boxY + bh, boxX + bw - br, boxY + bh, br);
        drawCtx.lineTo(boxX + br, boxY + bh);
        drawCtx.arcTo(boxX, boxY + bh, boxX, boxY + bh - br, br);
        drawCtx.lineTo(boxX, boxY + br);
        drawCtx.arcTo(boxX, boxY, boxX + br, boxY, br);
        drawCtx.closePath();
        drawCtx.fill();
        drawCtx.stroke();

        // Label text
        drawCtx.fillStyle = '#F59E0B';
        drawCtx.textAlign = 'center';
        drawCtx.textBaseline = 'middle';
        drawCtx.fillText(label, x, boxY + 9 + padY / 2);

        // Point dot
        drawCtx.beginPath();
        drawCtx.arc(x, y, 5, 0, Math.PI * 2);
        drawCtx.fillStyle = '#F59E0B';
        drawCtx.fill();
        drawCtx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
        drawCtx.lineWidth = 6;
        drawCtx.stroke();

        drawCtx.restore();
      },
    };

    this.powerChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [{
          label: 'Power Draw (kW)',
          data: chartData.data,
          borderColor: '#2DD4BF',
          borderWidth: 2,
          fill: true,
          backgroundColor: (context) => {
            const chart = context.chart;
            const { ctx: c, chartArea } = chart;
            if (!chartArea) return 'rgba(45,212,191,0.1)';
            const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, 'rgba(45, 212, 191, 0.18)');
            gradient.addColorStop(1, 'rgba(45, 212, 191, 0)');
            return gradient;
          },
          tension: 0.35,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: '#2DD4BF',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(30,41,59,0.95)',
            titleColor: '#F1F5F9',
            bodyColor: '#94A3B8',
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1,
            cornerRadius: 8,
            padding: 10,
            titleFont: { family: 'Inter', weight: '600', size: 12 },
            bodyFont: { family: 'Inter', size: 11 },
            displayColors: false,
            callbacks: {
              title: (items) => items[0].label,
              label: (item) => item.parsed.y + ' kW',
            },
          },
        },
        scales: {
          x: {
            ticks: {
              color: '#64748B',
              font: { family: 'Inter', size: 9.5 },
              maxTicksLimit: 12,
            },
            grid: { color: 'rgba(255,255,255,0.03)', drawBorder: false },
          },
          y: {
            beginAtZero: true,
            ticks: {
              color: '#64748B',
              font: { family: 'Inter', size: 10 },
              callback: (v) => v + ' kW',
            },
            grid: { color: 'rgba(255,255,255,0.03)', drawBorder: false },
          },
        },
        interaction: {
          mode: 'index',
          intersect: false,
        },
        animation: {
          duration: 1000,
          easing: 'easeOutQuart',
        },
      },
      plugins: [shutoffAnnotation],
    });
  },
};
