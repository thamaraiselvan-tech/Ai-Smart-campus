/* ============================================================
   CampusNexus — Water Network Visualization (Canvas 2D)
   Pipe schematic with animated flow particles & anomaly pulse
   ============================================================ */

const WaterNetwork = {
  canvas: null,
  ctx: null,
  animationId: null,
  particles: [],
  nodeMap: {},
  _startTime: 0,

  init(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this._startTime = performance.now();

    // Build node lookup
    this.nodeMap = {};
    CampusData.waterNetwork.nodes.forEach(n => { this.nodeMap[n.id] = n; });

    // Create flow particles
    this._initParticles();

    // Size canvas
    this._resize();
    window.addEventListener('resize', () => this._resize());

    // Start animation
    this._animate();
  },

  _resize() {
    if (!this.canvas) return;
    const container = this.canvas.parentElement;
    const w = container.clientWidth;
    const h = container.clientHeight;
    const dpr = Math.min(window.devicePixelRatio, 2);

    this.canvas.width  = w * dpr;
    this.canvas.height = h * dpr;
    this.canvas.style.width  = w + 'px';
    this.canvas.style.height = h + 'px';

    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  },

  _initParticles() {
    this.particles = [];
    CampusData.waterNetwork.connections.forEach(([fromId, toId]) => {
      const from = this.nodeMap[fromId];
      const to   = this.nodeMap[toId];
      // 5 particles per connection, evenly spaced
      for (let i = 0; i < 5; i++) {
        this.particles.push({
          from, to,
          progress: i / 5,
          speed: 0.0025 + Math.random() * 0.0015,
          size: 2.5 + Math.random() * 1.5,
        });
      }
    });
  },

  _animate() {
    this.animationId = requestAnimationFrame(this._animate.bind(this));

    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    if (w === 0 || h === 0) return;

    const time = (performance.now() - this._startTime) * 0.001;
    const ctx = this.ctx;

    // Clear
    ctx.clearRect(0, 0, w, h);

    // Update particles
    this.particles.forEach(p => {
      p.progress += p.speed;
      if (p.progress > 1) p.progress -= 1;
    });

    // Draw connections
    this._drawConnections(ctx, w, h, time);

    // Draw particles
    this._drawParticles(ctx, w, h, time);

    // Draw nodes
    this._drawNodes(ctx, w, h, time);
  },

  _drawConnections(ctx, w, h, time) {
    CampusData.waterNetwork.connections.forEach(([fromId, toId]) => {
      const from = this.nodeMap[fromId];
      const to   = this.nodeMap[toId];
      const x1 = from.rx * w, y1 = from.ry * h;
      const x2 = to.rx * w,   y2 = to.ry * h;

      // Glow line
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);

      const hasAnomaly = (from.status === 'anomaly' || to.status === 'anomaly');
      ctx.strokeStyle = hasAnomaly ? 'rgba(245, 158, 11, 0.18)' : 'rgba(45, 212, 191, 0.12)';
      ctx.lineWidth = 8;
      ctx.stroke();

      // Core line
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = hasAnomaly ? 'rgba(245, 158, 11, 0.4)' : 'rgba(45, 212, 191, 0.3)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    });
  },

  _drawParticles(ctx, w, h, time) {
    this.particles.forEach(p => {
      const x1 = p.from.rx * w, y1 = p.from.ry * h;
      const x2 = p.to.rx * w,   y2 = p.to.ry * h;
      const x = x1 + (x2 - x1) * p.progress;
      const y = y1 + (y2 - y1) * p.progress;

      const hasAnomaly = (p.from.status === 'anomaly' || p.to.status === 'anomaly');
      const color = hasAnomaly ? '#F59E0B' : '#2DD4BF';

      // Glow
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, p.size + 3, 0, Math.PI * 2);
      ctx.fillStyle = hasAnomaly ? 'rgba(245, 158, 11, 0.15)' : 'rgba(45, 212, 191, 0.15)';
      ctx.fill();

      // Core
      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.7 + Math.sin(time * 3 + p.progress * 6) * 0.3;
      ctx.fill();
      ctx.restore();
    });
  },

  _drawNodes(ctx, w, h, time) {
    CampusData.waterNetwork.nodes.forEach(node => {
      const x = node.rx * w;
      const y = node.ry * h;
      const isAnomaly = node.status === 'anomaly';
      const radius = isAnomaly ? 28 : 24;

      ctx.save();

      // Anomaly pulse ring
      if (isAnomaly) {
        const pulseRadius = radius + 8 + Math.sin(time * 3) * 5;
        const pulseAlpha  = 0.15 + Math.sin(time * 3) * 0.1;
        ctx.beginPath();
        ctx.arc(x, y, pulseRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(245, 158, 11, ${pulseAlpha})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Node circle — outer ring
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      const fillColor = isAnomaly
        ? 'rgba(245, 158, 11, 0.12)'
        : 'rgba(45, 212, 191, 0.08)';
      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.strokeStyle = isAnomaly ? 'rgba(245, 158, 11, 0.6)' : 'rgba(45, 212, 191, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Flow rate number
      ctx.fillStyle = isAnomaly ? '#F59E0B' : '#2DD4BF';
      ctx.font = '700 13px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.flow.toFixed(1), x, y - 2);

      // Unit
      ctx.fillStyle = isAnomaly ? 'rgba(245,158,11,0.6)' : 'rgba(45,212,191,0.5)';
      ctx.font = '500 8px Inter, sans-serif';
      ctx.fillText('L/min', x, y + 11);

      // Node name (below)
      ctx.fillStyle = '#94A3B8';
      ctx.font = '600 10px Inter, sans-serif';
      ctx.fillText(node.name, x, y + radius + 16);

      // Expected range for anomaly
      if (isAnomaly && node.expected) {
        ctx.fillStyle = 'rgba(245, 158, 11, 0.7)';
        ctx.font = '500 9px Inter, sans-serif';
        ctx.fillText('Expected: ' + node.expected + ' L/min', x, y + radius + 30);
      }

      ctx.restore();
    });
  },

  dispose() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  },
};
