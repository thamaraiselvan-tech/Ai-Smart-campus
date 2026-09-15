/* ============================================================
   Saranathan College of Engineering — 3D Campus Scene (Three.js)
   Daylight Environment, Custom Architecture & Sports Turf Ground
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
    this.scene.background = new THREE.Color(0xEEF4FA);
    this.scene.fog = new THREE.FogExp2(0xEEF4FA, 0.022);

    /* ── Camera ─────────────────────────────────────────── */
    this.camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 200);
    this.camera.position.set(16, 13, 16);
    this.camera.lookAt(0, 0, 0);

    /* ── Renderer ───────────────────────────────────────── */
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.container.appendChild(this.renderer.domElement);

    /* ── Controls ───────────────────────────────────────── */
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2.3;
    this.controls.minPolarAngle = 0.2;
    this.controls.minDistance = 9;
    this.controls.maxDistance = 32;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.45;
    this.controls.target.set(0, 0, 0);

    this.controls.addEventListener('start', () => {
      this.controls.autoRotate = false;
      clearTimeout(this._autoRotateTimer);
    });
    this.controls.addEventListener('end', () => {
      this._autoRotateTimer = setTimeout(() => {
        this.controls.autoRotate = true;
      }, 7000);
    });

    /* ── Raycaster ──────────────────────────────────────── */
    this.raycaster = new THREE.Raycaster();

    /* ── Daylight Environment Lighting ───────────────────── */
    // Ambient light
    this.scene.add(new THREE.AmbientLight(0xE2E8F0, 0.85));

    // Sky/Ground hemisphere light
    const hemiLight = new THREE.HemisphereLight(0xFFFFFF, 0x94A3B8, 0.4);
    this.scene.add(hemiLight);

    // Direct Sunlight
    const sunLight = new THREE.DirectionalLight(0xFFFBEB, 1.25);
    sunLight.position.set(16, 24, 12);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(2048, 2048);
    sunLight.shadow.camera.left   = -14;
    sunLight.shadow.camera.right  =  14;
    sunLight.shadow.camera.top    =  14;
    sunLight.shadow.camera.bottom = -14;
    sunLight.shadow.camera.near   =  2;
    sunLight.shadow.camera.far    =  50;
    sunLight.shadow.bias = -0.0005;
    this.scene.add(sunLight);

    // Subtle blue fill light
    const fillLight = new THREE.DirectionalLight(0x93C5FD, 0.3);
    fillLight.position.set(-14, 12, -10);
    this.scene.add(fillLight);

    /* ── Build Campus Geometry ──────────────────────────── */
    this._createGround();
    this._createCampusTreeAccents();
    this._createBuildings();
    this._createLabels();

    /* ── Event Listeners ────────────────────────────────── */
    this.container.addEventListener('click', this._onClick.bind(this));
    this.container.addEventListener('mousemove', this._onMouseMove.bind(this));
    this.container.addEventListener('mouseenter', () => { this._mouseOver = true; });
    this.container.addEventListener('mouseleave', () => {
      this._mouseOver = false;
      this.container.style.cursor = '';
    });
    window.addEventListener('resize', this.onResize.bind(this));

    /* ── Start Render Loop ──────────────────────────────── */
    this._animate();
  },

  /* ── Ground Plane + Campus Roads & Grid ───────────────── */
  _createGround() {
    // Base paving plane
    const groundGeo = new THREE.PlaneGeometry(28, 28);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0xE2E8F0,
      roughness: 0.85,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Light grid lines for architectural vibe
    const grid = new THREE.GridHelper(28, 28, 0xCBD5E1, 0xCBD5E1);
    grid.material.opacity = 0.45;
    grid.material.transparent = true;
    grid.position.y = 0.001;
    this.scene.add(grid);

    // Paved roadways connecting blocks
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0xCBD5E1,
      roughness: 0.7,
    });
    const roads = [
      { x: 0, z: 0, w: 0.25, d: 20 },
      { x: 0, z: 0, w: 20, d: 0.25 },
      { x: -3.8, z: 0, w: 0.2, d: 16 },
      { x: 3.8, z: 0, w: 0.2, d: 16 },
    ];
    roads.forEach(r => {
      const geo = new THREE.PlaneGeometry(r.w, r.d);
      const road = new THREE.Mesh(geo, roadMat);
      road.rotation.x = -Math.PI / 2;
      road.position.set(r.x, 0.005, r.z);
      road.receiveShadow = true;
      this.scene.add(road);
    });
  },

  /* ── Campus Tree / Greenery Accents ──────────────────── */
  _createCampusTreeAccents() {
    const treePositions = [
      { x: -6.5, z: -4 }, { x: -6.5, z: 1 }, { x: -6.5, z: 4.5 },
      { x:  6.5, z: -4 }, { x:  6.5, z: 1 }, { x:  6.5, z: 4.5 },
      { x: -2, z: -5.5 }, { x:  2, z: -5.5 },
    ];

    const trunkGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.4);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350F, roughness: 0.9 });
    const foliageGeo = new THREE.SphereGeometry(0.35, 8, 8);
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x15803D, roughness: 0.6 });

    treePositions.forEach(p => {
      const group = new THREE.Group();
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 0.2;
      trunk.castShadow = true;
      group.add(trunk);

      const foliage = new THREE.Mesh(foliageGeo, foliageMat);
      foliage.position.y = 0.55;
      foliage.castShadow = true;
      group.add(foliage);

      group.position.set(p.x, 0, p.z);
      this.scene.add(group);
    });
  },

  /* ── 3D Blocks (7 Saranathan Institution Blocks) ──────── */
  _createBuildings() {
    CampusData.buildings.forEach(b => {
      const group = new THREE.Group();

      /* Special Handling for "Ground" (Sports Turf Field) */
      if (b.id === 'ground') {
        this._createGroundBlock(group, b);
        group.position.set(b.x, 0, b.z);
        this.scene.add(group);
        return;
      }

      /* Academic & Utility Building Blocks */
      let bodyColor, emissive, emissiveIntensity, accentColor;
      switch (b.status) {
        case 'normal':
          bodyColor = 0x1E293B; // Deep slate academic block
          emissive = 0x2563EB;
          emissiveIntensity = 0.08;
          accentColor = 0x3B82F6;
          break;
        case 'alert':
          bodyColor = 0x451A03; // Warm brown/amber alert block
          emissive = 0xD97706;
          emissiveIntensity = 0.25;
          accentColor = 0xF59E0B;
          break;
        case 'powered_down':
          bodyColor = 0x334155;
          emissive = 0x64748B;
          emissiveIntensity = 0.02;
          accentColor = 0x94A3B8;
          break;
      }

      // Main Building Body Mesh
      const geo = new THREE.BoxGeometry(b.width, b.height, b.depth);
      const mat = new THREE.MeshStandardMaterial({
        color: bodyColor,
        emissive: emissive,
        emissiveIntensity: emissiveIntensity,
        roughness: 0.3,
        metalness: 0.2,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.y = b.height / 2;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = { buildingId: b.id, buildingData: b };
      group.add(mesh);

      // Clean White/Glass Wireframe Edges
      const edges = new THREE.EdgesGeometry(geo);
      const lineMat = new THREE.LineBasicMaterial({
        color: accentColor,
        transparent: true,
        opacity: 0.45,
      });
      const wireframe = new THREE.LineSegments(edges, lineMat);
      wireframe.position.y = b.height / 2;
      group.add(wireframe);

      // Glass Window Strips (Horizontal facade bands)
      const windowCount = Math.max(1, Math.floor(b.height / 0.55));
      for (let i = 0; i < windowCount; i++) {
        const wy = (i + 1) * (b.height / (windowCount + 1));
        const windowGeo = new THREE.PlaneGeometry(b.width * 0.84, 0.08);
        const windowMat = new THREE.MeshBasicMaterial({
          color: 0x93C5FD,
          transparent: true,
          opacity: 0.65,
        });
        const windowMesh = new THREE.Mesh(windowGeo, windowMat);
        windowMesh.position.set(0, wy, b.depth / 2 + 0.01);
        group.add(windowMesh);
      }

      // Roof Structure Accent (Parapet / Solar panels / Ventilation)
      const roofParapetGeo = new THREE.BoxGeometry(b.width * 0.9, 0.08, b.depth * 0.9);
      const roofParapetMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.4 });
      const roofParapet = new THREE.Mesh(roofParapetGeo, roofParapetMat);
      roofParapet.position.y = b.height + 0.04;
      roofParapet.castShadow = true;
      group.add(roofParapet);

      // Solar Panel Array for RV Block / KS Block
      if (b.id === 'rvBlock' || b.id === 'ksBlock') {
        const solarGeo = new THREE.PlaneGeometry(b.width * 0.6, b.depth * 0.5);
        const solarMat = new THREE.MeshStandardMaterial({ color: 0x1E3A8A, metalness: 0.8, roughness: 0.2 });
        const solar = new THREE.Mesh(solarGeo, solarMat);
        solar.rotation.x = -Math.PI / 2;
        solar.position.y = b.height + 0.09;
        group.add(solar);
      }

      // Generator Room Mesh Details
      if (b.id === 'generatorRoom') {
        const gridVentGeo = new THREE.PlaneGeometry(b.width * 0.7, b.height * 0.5);
        const gridVentMat = new THREE.MeshBasicMaterial({ color: 0xF59E0B, wireframe: true });
        const vent = new THREE.Mesh(gridVentGeo, gridVentMat);
        vent.position.set(0, b.height * 0.5, b.depth / 2 + 0.015);
        group.add(vent);
      }

      group.position.set(b.x, 0, b.z);
      this.scene.add(group);

      this.buildings.push({
        group, mesh, mat, lineMat,
        data: b,
        baseEmissive: emissiveIntensity,
      });
    });
  },

  /* ── Dedicated 3D Sports Turf Ground Mesh ─────────────── */
  _createGroundBlock(group, b) {
    // Lush Green Turf Field Base
    const turfGeo = new THREE.BoxGeometry(b.width, b.height, b.depth);
    const turfMat = new THREE.MeshStandardMaterial({
      color: 0x16A34A, // Lush grass green
      roughness: 0.85,
      metalness: 0.05,
    });
    const turfMesh = new THREE.Mesh(turfGeo, turfMat);
    turfMesh.position.y = b.height / 2;
    turfMesh.receiveShadow = true;
    turfMesh.castShadow = true;
    turfMesh.userData = { buildingId: b.id, buildingData: b };
    group.add(turfMesh);

    // Terracotta Running Track Loop around Turf
    const trackGeo = new THREE.PlaneGeometry(b.width + 0.6, b.depth + 0.6);
    const trackMat = new THREE.MeshStandardMaterial({ color: 0xC2410C, roughness: 0.8 });
    const trackMesh = new THREE.Mesh(trackGeo, trackMat);
    trackMesh.rotation.x = -Math.PI / 2;
    trackMesh.position.y = 0.008;
    trackMesh.receiveShadow = true;
    group.add(trackMesh);

    // White Turf Field Line Markings (Soccer / Athletic Oval)
    const lineGeo = new THREE.PlaneGeometry(b.width * 0.85, b.depth * 0.85);
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, wireframe: true, opacity: 0.7, transparent: true });
    const lines = new THREE.Mesh(lineGeo, lineMat);
    lines.rotation.x = -Math.PI / 2;
    lines.position.y = b.height + 0.002;
    group.add(lines);

    // Center circle line
    const circleGeo = new THREE.RingGeometry(0.35, 0.38, 16);
    const circleMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, side: THREE.DoubleSide });
    const centerCircle = new THREE.Mesh(circleGeo, circleMat);
    centerCircle.rotation.x = -Math.PI / 2;
    centerCircle.position.y = b.height + 0.003;
    group.add(centerCircle);

    this.buildings.push({
      group, mesh: turfMesh, mat: turfMat, lineMat: null,
      data: b,
      baseEmissive: 0,
    });
  },

  /* ── Floating HTML Labels (Light Mode Pill Badges) ─────── */
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

      const labelHeightOffset = b.data.id === 'ground' ? 0.3 : b.data.height + 0.45;
      const vec = new THREE.Vector3(b.data.x, labelHeightOffset, b.data.z);
      vec.project(this.camera);

      if (vec.z > 1) { el.style.display = 'none'; return; }
      el.style.display = '';
      el.style.left = (vec.x * halfW + halfW) + 'px';
      el.style.top  = (-vec.y * halfH + halfH) + 'px';
    });
  },

  /* ── Interactions ─────────────────────────────────────── */
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

  /* ── Render Loop ──────────────────────────────────────── */
  _animate() {
    this.animationId = requestAnimationFrame(this._animate.bind(this));

    const time = performance.now() * 0.001;

    // Pulse alert buildings (JS Block alert animation)
    this.buildings.forEach(b => {
      if (b.data.status === 'alert' && b.mat.emissiveIntensity !== undefined) {
        const pulse = (Math.sin(time * 3.0) + 1) / 2;
        b.mat.emissiveIntensity = b.baseEmissive + pulse * 0.25;
      }
    });

    // Hover cursor raycasting
    if (this._mouseOver) {
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.buildings.map(b => b.mesh));
      this.container.style.cursor = intersects.length > 0 ? 'pointer' : '';
    }

    // Update HTML light pill labels positioning
    this._updateLabels();

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  },
};
