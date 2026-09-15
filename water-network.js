/* ============================================================
   Saranathan College of Engineering — Water Network Canvas 2D
   Light Schematic with Animated Flow Particles & Anomaly Pulse
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

    // Start animation loop
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
      // 5 flow particles per pipe connection
      for (let i = 0; i < 5; i++) {
        this.particles.push({
          from, to,
          progress: i / 5,
          speed: 0.0028 + Math.random() * 0.0015,
          size: 3.0 + Math.random() * 1.5,
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

    // Clear background
    ctx.clearRect(0, 0, w, h);

    // Subtle light grid background on canvas
    this._drawCanvasGrid(ctx, w, h);

    // Update particles position
    this.particles.forEach(p => {
      p.progress += p.speed;
      if (p.progress > 1) p.progress -= 1;
    });

    // Draw pipe connections
    this._drawConnections(ctx, w, h, time);

    // Draw moving water flow particles
    this._drawParticles(ctx, w, h, time);

    // Draw campus water nodes
    this._drawNodes(ctx, w, h, time);
  },

  _drawCanvasGrid(ctx, w, h) {
    ctx.save();
    ctx.strokeStyle = '#F1F5F9';
    ctx.lineWidth = 1;
    const step = 40;
    for (let x = 0; x < w; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    ctx.restore();
  },

  _drawConnections(ctx, w, h, time) {
    CampusData.waterNetwork.connections.forEach(([fromId, toId]) => {
      const from = this.nodeMap[fromId];
      const to   = this.nodeMap[toId];
      const x1 = from.rx * w, y1 = from.ry * h;
      const x2 = to.rx * w,   y2 = to.ry * h;

      const hasAnomaly = (from.status === 'anomaly' || to.status === 'anomaly');

      ctx.save();

      // Outer glow line
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = hasAnomaly ? 'rgba(217, 119, 6, 0.18)' : 'rgba(37, 99, 235, 0.15)';
      ctx.lineWidth = 8;
      ctx.stroke();

      // Core pipe line
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = hasAnomaly ? '#D97706' : '#3B82F6';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([8, 5]);
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
      const color = hasAnomaly ? '#D97706' : '#2563EB';

      ctx.save();
      // Outer glow
      ctx.beginPath();
      ctx.arc(x, y, p.size + 3, 0, Math.PI * 2);
      ctx.fillStyle = hasAnomaly ? 'rgba(217, 119, 6, 0.2)' : 'rgba(37, 99, 235, 0.2)';
      ctx.fill();

      // Core dot
      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.85 + Math.sin(time * 3 + p.progress * 6) * 0.15;
      ctx.fill();
      ctx.restore();
    });
  },

  _drawNodes(ctx, w, h, time) {
    CampusData.waterNetwork.nodes.forEach(node => {
      const x = node.rx * w;
      const y = node.ry * h;
      const isAnomaly = node.status === 'anomaly';
      const radius = isAnomaly ? 28 : 25;

      ctx.save();

      // Anomaly pulse ring
      if (isAnomaly) {
        const pulseRadius = radius + 8 + Math.sin(time * 3.5) * 6;
        const pulseAlpha  = 0.25 + Math.sin(time * 3.5) * 0.15;
        ctx.beginPath();
        ctx.arc(x, y, pulseRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(217, 119, 6, ${pulseAlpha})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Node background disc
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = isAnomaly ? '#FFF7ED' : '#EFF6FF';
      ctx.fill();
      ctx.strokeStyle = isAnomaly ? '#D97706' : '#2563EB';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Flow rate number
      ctx.fillStyle = isAnomaly ? '#C2410C' : '#1E40AF';
      ctx.font = '800 13.5px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.flow.toFixed(1), x, y - 3);

      // Unit text
      ctx.fillStyle = isAnomaly ? '#D97706' : '#3B82F6';
      ctx.font = '600 8.5px Inter, sans-serif';
      ctx.fillText('L/min', x, y + 11);

      // Node title label (below node)
      ctx.fillStyle = '#0F172A';
      ctx.font = '700 11px Inter, sans-serif';
      ctx.fillText(node.name, x, y + radius + 16);

      // Expected baseline text for anomalies
      if (isAnomaly && node.expected) {
        ctx.fillStyle = '#D97706';
        ctx.font = '600 9.5px Inter, sans-serif';
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
