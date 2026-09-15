/* ============================================================
   Saranathan College of Engineering — Chart.js Visualizations
   Light Theme Configured for Executive Dashboard
   ============================================================ */

const Charts = {
  sparklineEnergy: null,
  sparklineWater: null,
  powerChart: null,

  /* ── KPI Sparklines (Overview Screen) ─────────────────── */
  initSparklines() {
    this._createSparkline(
      'energy-sparkline',
      CampusData.kpi.energySaved.trend,
      '#059669',
      'rgba(5, 150, 105, 0.12)',
      'sparklineEnergy'
    );
    this._createSparkline(
      'water-sparkline',
      CampusData.kpi.waterPrevented.trend,
      '#2563EB',
      'rgba(37, 99, 235, 0.12)',
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
          borderWidth: 2.5,
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

  /* ── 24h Power Load Curve (Building Drill-down) ────────── */
  initPowerChart() {
    const canvas = document.getElementById('power-chart');
    if (!canvas) return;

    if (this.powerChart) {
      this.powerChart.destroy();
    }

    const ctx = canvas.getContext('2d');
    const chartData = CampusData.powerChart24h;
    const shutoffIdx = chartData.shutoffIndex;

    // Custom annotation plugin for auto-shutoff event
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

        // Vertical dotted connector line
        drawCtx.beginPath();
        drawCtx.moveTo(x, y - 6);
        drawCtx.lineTo(x, y - 32);
        drawCtx.strokeStyle = 'rgba(217, 119, 6, 0.7)';
        drawCtx.lineWidth = 1.5;
        drawCtx.setLineDash([3, 3]);
        drawCtx.stroke();
        drawCtx.setLineDash([]);

        // Label box
        const label = 'AI Auto-shutoff dip';
        drawCtx.font = '700 10.5px Inter, sans-serif';
        const textW = drawCtx.measureText(label).width;
        const padX = 10, padY = 5;
        const boxX = x - textW / 2 - padX;
        const boxY = y - 52;

        drawCtx.fillStyle = '#FFF7ED';
        drawCtx.strokeStyle = '#FDBA74';
        drawCtx.lineWidth = 1;
        
        // Manual rounded rect for browser compatibility
        const bw = textW + padX * 2, bh = 18 + padY, br = 6;
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
        drawCtx.fillStyle = '#C2410C';
        drawCtx.textAlign = 'center';
        drawCtx.textBaseline = 'middle';
        drawCtx.fillText(label, x, boxY + 10 + padY / 2);

        // Point dot pulse
        drawCtx.beginPath();
        drawCtx.arc(x, y, 5, 0, Math.PI * 2);
        drawCtx.fillStyle = '#D97706';
        drawCtx.fill();
        drawCtx.strokeStyle = 'rgba(217, 119, 6, 0.3)';
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
          borderColor: '#059669',
          borderWidth: 2.5,
          fill: true,
          backgroundColor: (context) => {
            const chart = context.chart;
            const { ctx: c, chartArea } = chart;
            if (!chartArea) return 'rgba(5, 150, 105, 0.1)';
            const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, 'rgba(5, 150, 105, 0.22)');
            gradient.addColorStop(1, 'rgba(5, 150, 105, 0)');
            return gradient;
          },
          tension: 0.38,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: '#059669',
          pointHoverBorderColor: '#FFFFFF',
          pointHoverBorderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0F172A',
            titleColor: '#FFFFFF',
            bodyColor: '#CBD5E1',
            borderColor: '#334155',
            borderWidth: 1,
            cornerRadius: 10,
            padding: 12,
            titleFont: { family: 'Inter', weight: '700', size: 12 },
            bodyFont: { family: 'Inter', size: 11 },
            displayColors: false,
            callbacks: {
              title: (items) => items[0].label,
              label: (item) => item.parsed.y + ' kW Power Draw',
            },
          },
        },
        scales: {
          x: {
            ticks: {
              color: '#475569',
              font: { family: 'Inter', size: 10, weight: '600' },
              maxTicksLimit: 12,
            },
            grid: { color: '#E2E8F0', drawBorder: false },
          },
          y: {
            beginAtZero: true,
            ticks: {
              color: '#475569',
              font: { family: 'Inter', size: 10.5, weight: '600' },
              callback: (v) => v + ' kW',
            },
            grid: { color: '#E2E8F0', drawBorder: false },
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
