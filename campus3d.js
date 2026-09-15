/* ============================================================
   CampusNexus — 3D Campus Map (Three.js)
   Buildings as 3D blocks with glow, raycasting, orbit controls
   ============================================================ */

const Campus3D = {
  scene: null,
  camera: null,
  renderer: null,
  controls: null,
  raycaster: null,
  mouse: new THREE.Vector2(),
  container: null,
  buildings: [],
  particles: null,
  animationId: null,
  _mouseOver: false,
  _autoRotateTimer: null,

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    if (w === 0 || h === 0) return;

    /* ── Scene ──────────────────────────────────────────── */
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x080c18);
    this.scene.fog = new THREE.FogExp2(0x080c18, 0.028);

    /* ── Camera ─────────────────────────────────────────── */
    this.camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 200);
    this.camera.position.set(14, 11, 14);
    this.camera.lookAt(0, 0, 1);

    /* ── Renderer ───────────────────────────────────────── */
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.container.appendChild(this.renderer.domElement);

    /* ── Controls ───────────────────────────────────────── */
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.maxPolarAngle = Math.PI / 2.3;
    this.controls.minPolarAngle = 0.3;
    this.controls.minDistance = 8;
    this.controls.maxDistance = 28;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.4;
    this.controls.target.set(0, 0, 1);

    // Pause auto-rotate on interaction, resume after idle
    this.controls.addEventListener('start', () => {
      this.controls.autoRotate = false;
      clearTimeout(this._autoRotateTimer);
    });
    this.controls.addEventListener('end', () => {
      this._autoRotateTimer = setTimeout(() => {
        this.controls.autoRotate = true;
      }, 6000);
    });

    /* ── Raycaster ──────────────────────────────────────── */
    this.raycaster = new THREE.Raycaster();

    /* ── Lights ─────────────────────────────────────────── */
    this.scene.add(new THREE.AmbientLight(0x3a4060, 0.7));

    const dirLight = new THREE.DirectionalLight(0xdde4ff, 0.9);
    dirLight.position.set(10, 18, 8);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(2048, 2048);
    dirLight.shadow.camera.left   = -12;
    dirLight.shadow.camera.right  =  12;
    dirLight.shadow.camera.top    =  12;
    dirLight.shadow.camera.bottom = -12;
    dirLight.shadow.camera.near   =  1;
    dirLight.shadow.camera.far    =  40;
    dirLight.shadow.bias = -0.001;
    this.scene.add(dirLight);

    const tealPoint = new THREE.PointLight(0x2DD4BF, 0.35, 30);
    tealPoint.position.set(0, 6, 0);
    this.scene.add(tealPoint);

    const bluePoint = new THREE.PointLight(0x38BDF8, 0.2, 25);
    bluePoint.position.set(-4, 5, 4);
    this.scene.add(bluePoint);

    /* ── Build scene geometry ───────────────────────────── */
    this._createGround();
    this._createBuildings();
    this._createParticles();
    this._createLabels();

    /* ── Event listeners ────────────────────────────────── */
    this.container.addEventListener('click', this._onClick.bind(this));
    this.container.addEventListener('mousemove', this._onMouseMove.bind(this));
    this.container.addEventListener('mouseenter', () => { this._mouseOver = true; });
    this.container.addEventListener('mouseleave', () => {
      this._mouseOver = false;
      this.container.style.cursor = '';
    });
    window.addEventListener('resize', this.onResize.bind(this));

    /* ── Start render loop ──────────────────────────────── */
    this._animate();
  },

  /* ── Ground plane + grid ──────────────────────────────── */
  _createGround() {
    // Grid
    const grid = new THREE.GridHelper(24, 24, 0x162040, 0x111a30);
    grid.material.opacity = 0.6;
    grid.material.transparent = true;
    this.scene.add(grid);

    // Solid ground
    const groundGeo = new THREE.PlaneGeometry(24, 24);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x0b1020,
      roughness: 0.95,
      metalness: 0.05,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Decorative paths between buildings
    const pathMat = new THREE.MeshStandardMaterial({
      color: 0x141e35,
      roughness: 0.8,
    });

    const paths = [
      { x: 0, z: 0, w: 0.15, d: 10, rot: 0 },
      { x: 0, z: 0, w: 12, d: 0.15, rot: 0 },
    ];
    paths.forEach(p => {
      const geo = new THREE.PlaneGeometry(p.w, p.d);
      const mesh = new THREE.Mesh(geo, pathMat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(p.x, 0.005, p.z);
      mesh.receiveShadow = true;
      this.scene.add(mesh);
    });
  },

  /* ── Buildings ────────────────────────────────────────── */
  _createBuildings() {
    CampusData.buildings.forEach(b => {
      const group = new THREE.Group();

      // Status-based colors
      let bodyColor, emissive, emissiveIntensity, edgeColor;
      switch (b.status) {
        case 'normal':
          bodyColor = 0x162a3a;
          emissive = 0x2DD4BF;
          emissiveIntensity = 0.12;
          edgeColor = 0x2DD4BF;
          break;
        case 'alert':
          bodyColor = 0x2a2210;
          emissive = 0xF59E0B;
          emissiveIntensity = 0.25;
          edgeColor = 0xF59E0B;
          break;
        case 'powered_down':
          bodyColor = 0x1a1a22;
          emissive = 0x444455;
          emissiveIntensity = 0.04;
          edgeColor = 0x444455;
          break;
      }

      // Main body
      const geo = new THREE.BoxGeometry(b.width, b.height, b.depth);
      const mat = new THREE.MeshStandardMaterial({
        color: bodyColor,
        emissive: emissive,
        emissiveIntensity: emissiveIntensity,
        roughness: 0.35,
        metalness: 0.35,
        transparent: true,
        opacity: 0.92,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.y = b.height / 2;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = { buildingId: b.id, buildingData: b };
      group.add(mesh);

      // Wireframe edges
      const edges = new THREE.EdgesGeometry(geo);
      const lineMat = new THREE.LineBasicMaterial({
        color: edgeColor,
        transparent: true,
        opacity: 0.35,
      });
      const wireframe = new THREE.LineSegments(edges, lineMat);
      wireframe.position.y = b.height / 2;
      group.add(wireframe);

      // Window strips (horizontal lines on front face for detail)
      const windowCount = Math.max(1, Math.floor(b.height / 0.5));
      for (let i = 0; i < windowCount; i++) {
        const wy = (i + 1) * (b.height / (windowCount + 1));
        const windowGeo = new THREE.PlaneGeometry(b.width * 0.8, 0.06);
        const windowMat = new THREE.MeshBasicMaterial({
          color: emissive,
          transparent: true,
          opacity: b.status === 'powered_down' ? 0.05 : 0.2,
        });
        const windowMesh = new THREE.Mesh(windowGeo, windowMat);
        windowMesh.position.set(0, wy, b.depth / 2 + 0.01);
        group.add(windowMesh);
      }

      // Glow disc beneath building
      const glowGeo = new THREE.PlaneGeometry(b.width + 0.8, b.depth + 0.8);
      const glowMat = new THREE.MeshBasicMaterial({
        color: emissive,
        transparent: true,
        opacity: b.status === 'powered_down' ? 0.02 : 0.06,
      });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      glow.rotation.x = -Math.PI / 2;
      glow.position.y = 0.02;
      group.add(glow);

      // Roof accent line
      const roofGeo = new THREE.PlaneGeometry(b.width, b.depth);
      const roofMat = new THREE.MeshBasicMaterial({
        color: emissive,
        transparent: true,
        opacity: 0.06,
      });
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.rotation.x = -Math.PI / 2;
      roof.position.y = b.height + 0.01;
      group.add(roof);

      group.position.set(b.x, 0, b.z);
      this.scene.add(group);

      this.buildings.push({
        group, mesh, glow, glowMat, mat, lineMat,
        data: b,
        baseEmissive: emissiveIntensity,
        baseGlowOpacity: glowMat.opacity,
      });
    });
  },

  /* ── Ambient particles ────────────────────────────────── */
  _createParticles() {
    const count = 180;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 22;
      positions[i * 3 + 1] = Math.random() * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 22;
      sizes[i] = 0.02 + Math.random() * 0.03;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color: 0x2DD4BF,
      size: 0.04,
      transparent: true,
      opacity: 0.35,
      sizeAttenuation: true,
    });

    this.particles = new THREE.Points(geo, mat);
    this.scene.add(this.particles);
  },

  /* ── HTML labels ──────────────────────────────────────── */
  _createLabels() {
    const container = document.getElementById('building-labels');
    if (!container) return;
    container.innerHTML = '';

    CampusData.buildings.forEach(b => {
      const label = document.createElement('div');
      label.className = 'building-label';
      if (b.status === 'alert') label.classList.add('alert');
      if (b.status === 'powered_down') label.classList.add('powered-down');
      label.id = 'label-' + b.id;
      label.textContent = b.name;
      container.appendChild(label);
    });
  },

  _updateLabels() {
    const cw = this.container.clientWidth;
    const ch = this.container.clientHeight;
    const halfW = cw / 2;
    const halfH = ch / 2;

    this.buildings.forEach(b => {
      const el = document.getElementById('label-' + b.data.id);
      if (!el) return;

      const vec = new THREE.Vector3(b.data.x, b.data.height + 0.4, b.data.z);
      vec.project(this.camera);

      if (vec.z > 1) { el.style.display = 'none'; return; }
      el.style.display = '';
      el.style.left = (vec.x * halfW + halfW) + 'px';
      el.style.top  = (-vec.y * halfH + halfH) + 'px';
    });
  },

  /* ── Events ───────────────────────────────────────────── */
  _onClick(event) {
    const rect = this.container.getBoundingClientRect();
    this.mouse.x =  ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const meshes = this.buildings.map(b => b.mesh);
    const intersects = this.raycaster.intersectObjects(meshes);

    if (intersects.length > 0) {
      const bd = intersects[0].object.userData.buildingData;
      if (typeof App !== 'undefined' && App.showBuilding) {
        App.showBuilding(bd);
      }
    }
  },

  _onMouseMove(event) {
    const rect = this.container.getBoundingClientRect();
    this.mouse.x =  ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  },

  onResize() {
    if (!this.container || !this.renderer) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    if (w === 0 || h === 0) return;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  },

  /* ── Render loop ──────────────────────────────────────── */
  _animate() {
    this.animationId = requestAnimationFrame(this._animate.bind(this));

    const time = performance.now() * 0.001;

    // Animate particles
    if (this.particles) {
      const pos = this.particles.geometry.attributes.position.array;
      for (let i = 0; i < pos.length; i += 3) {
        pos[i + 1] += Math.sin(time * 0.8 + i * 0.3) * 0.0015;
        if (pos[i + 1] > 10) pos[i + 1] = 0;
        if (pos[i + 1] < 0)  pos[i + 1] = 10;
      }
      this.particles.geometry.attributes.position.needsUpdate = true;
    }

    // Pulse alert buildings
    this.buildings.forEach(b => {
      if (b.data.status === 'alert') {
        const pulse = (Math.sin(time * 2.5) + 1) / 2;
        b.mat.emissiveIntensity = b.baseEmissive + pulse * 0.3;
        b.glowMat.opacity = b.baseGlowOpacity + pulse * 0.1;
      }
    });

    // Hover cursor
    if (this._mouseOver) {
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.buildings.map(b => b.mesh));
      this.container.style.cursor = intersects.length > 0 ? 'pointer' : '';
    }

    // Labels
    this._updateLabels();

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  },
};
