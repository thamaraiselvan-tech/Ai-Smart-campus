/* ============================================================
   Saranathan College of Engineering — Next-Level 3D Campus Scene
   Three.js Master Plan, Stadium Lights, Basketball Hoops & Ambiance
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

    /* ── Scene Setup ────────────────────────────────────── */
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xF1F5F9);
    this.scene.fog = new THREE.FogExp2(0xF1F5F9, 0.018);

    /* ── Camera Setup ───────────────────────────────────── */
    this.camera = new THREE.PerspectiveCamera(36, w / h, 0.1, 220);
    this.camera.position.set(20, 16, 20);
    this.camera.lookAt(0, 0, 0);

    /* ── WebGL Renderer Setup ───────────────────────────── */
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.18;
    this.container.appendChild(this.renderer.domElement);

    /* ── Orbit Controls Setup ───────────────────────────── */
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2.3;
    this.controls.minPolarAngle = 0.2;
    this.controls.minDistance = 9;
    this.controls.maxDistance = 38;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.4;
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

    /* ── Raycaster Setup ────────────────────────────────── */
    this.raycaster = new THREE.Raycaster();

    /* ── Daylight Environment Lighting ───────────────────── */
    this.scene.add(new THREE.AmbientLight(0xE2E8F0, 0.85));

    const hemiLight = new THREE.HemisphereLight(0xFFFFFF, 0x94A3B8, 0.45);
    this.scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xFFFBEB, 1.35);
    sunLight.position.set(20, 28, 16);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(2048, 2048);
    sunLight.shadow.camera.left   = -18;
    sunLight.shadow.camera.right  =  18;
    sunLight.shadow.camera.top    =  18;
    sunLight.shadow.camera.bottom = -18;
    sunLight.shadow.camera.near   =  2;
    sunLight.shadow.camera.far    =  60;
    sunLight.shadow.bias = -0.0005;
    this.scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0x93C5FD, 0.35);
    fillLight.position.set(-18, 14, -14);
    this.scene.add(fillLight);

    /* ── Build Master Plan Campus Geometry ─────────────── */
    this._createGround();
    this._createCampusTreeAccents();
    this._createStreetLamps();
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

    /* ── Start Animation Loop ────────────────────────────── */
    this._animate();
  },

  /* ── Ground Paving + Master Plan Roadways ──────────────── */
  _createGround() {
    const groundGeo = new THREE.PlaneGeometry(34, 34);
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

    const grid = new THREE.GridHelper(34, 34, 0xCBD5E1, 0xCBD5E1);
    grid.material.opacity = 0.45;
    grid.material.transparent = true;
    grid.position.y = 0.001;
    this.scene.add(grid);

    // Master Plan Roadways & Walkway Concourse
    const roadMat = new THREE.MeshStandardMaterial({ color: 0xCBD5E1, roughness: 0.7 });
    const roads = [
      { x: 0, z: 0, w: 0.4, d: 24 },                     // Central Pedestrian Boulevard
      { x: 0, z: -5.2, w: 18, d: 0.3 },                  // Rear Academic Way
      { x: 0, z: 0.5, w: 18, d: 0.3 },                   // Middle Engineering Way
      { x: 0, z: 5.2, w: 18, d: 0.3 },                   // Front Sports Concourse
      { x: -3.25, z: 5.2, w: 6.0, d: 0.35 },             // Direct Sports Concourse connecting Ground & Court!
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

  /* ── Trees & Greenery Groves ──────────────────────────── */
  _createCampusTreeAccents() {
    const treePositions = [
      { x: -3.2, z: -5.2 }, { x: 3.2, z: -5.2 },
      { x: -3.2, z: -2.0 }, { x: 3.2, z: -2.0 },
      { x: -3.2, z:  0.5 }, { x: 3.2, z:  0.5 },
      { x: -3.2, z:  3.0 }, { x: 3.2, z:  3.0 },
      { x:  2.2, z:  5.2 },
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

  /* ── Street Lamp Posts ────────────────────────────────── */
  _createStreetLamps() {
    const lampPositions = [
      { x: -0.3, z: -3.5 }, { x: 0.3, z: -3.5 },
      { x: -0.3, z: -1.0 }, { x: 0.3, z: -1.0 },
      { x: -0.3, z:  2.5 }, { x: 0.3, z:  2.5 },
    ];

    const postGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.6);
    const postMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
    const bulbGeo = new THREE.SphereGeometry(0.05, 8, 8);
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xFEF08A });

    lampPositions.forEach(p => {
      const group = new THREE.Group();
      const post = new THREE.Mesh(postGeo, postMat);
      post.position.y = 0.3;
      group.add(post);

      const bulb = new THREE.Mesh(bulbGeo, bulbMat);
      bulb.position.y = 0.62;
      group.add(bulb);

      group.position.set(p.x, 0, p.z);
      this.scene.add(group);
    });
  },

  /* ── 3D Building Blocks Construction ──────────────────── */
  _createBuildings() {
    CampusData.buildings.forEach(b => {
      const group = new THREE.Group();

      /* 1. Main Sports Ground (With 4 Stadium Light Towers) */
      if (b.id === 'ground') {
        this._createGroundBlock(group, b);
        group.position.set(b.x, 0, b.z);
        this.scene.add(group);
        return;
      }

      /* 2. Basketball Court Block (Adjacent to Ground) */
      if (b.id === 'basketballCourt') {
        this._createBasketballCourtBlock(group, b);
        group.position.set(b.x, 0, b.z);
        this.scene.add(group);
        return;
      }

      /* 3. Academic & Utility Blocks */
      let bodyColor, emissive, emissiveIntensity, accentColor;
      switch (b.status) {
        case 'normal':
          bodyColor = 0x1E293B;
          emissive = 0x2563EB;
          emissiveIntensity = 0.08;
          accentColor = 0x3B82F6;
          break;
        case 'alert':
          bodyColor = 0x451A03;
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

      // Glass Edge Highlights
      const edges = new THREE.EdgesGeometry(geo);
      const lineMat = new THREE.LineBasicMaterial({ color: accentColor, transparent: true, opacity: 0.45 });
      const wireframe = new THREE.LineSegments(edges, lineMat);
      wireframe.position.y = b.height / 2;
      group.add(wireframe);

      // Entrance Canopy for KS Block & RV Block
      if (b.id === 'ksBlock' || b.id === 'rvBlock') {
        const canopyGeo = new THREE.BoxGeometry(b.width * 0.4, 0.08, 0.4);
        const canopyMat = new THREE.MeshStandardMaterial({ color: 0x3B82F6, metalness: 0.5 });
        const canopy = new THREE.Mesh(canopyGeo, canopyMat);
        canopy.position.set(0, 0.4, b.depth / 2 + 0.2);
        group.add(canopy);
      }

      // Windows Facade
      const windowCount = Math.max(1, Math.floor(b.height / 0.55));
      for (let i = 0; i < windowCount; i++) {
        const wy = (i + 1) * (b.height / (windowCount + 1));
        const windowGeo = new THREE.PlaneGeometry(b.width * 0.84, 0.08);
        const windowMat = new THREE.MeshBasicMaterial({ color: 0x93C5FD, transparent: true, opacity: 0.65 });
        const windowMesh = new THREE.Mesh(windowGeo, windowMat);
        windowMesh.position.set(0, wy, b.depth / 2 + 0.01);
        group.add(windowMesh);
      }

      // Roof Structures (Parapets & Solar arrays & Chillers)
      const roofGeo = new THREE.BoxGeometry(b.width * 0.9, 0.08, b.depth * 0.9);
      const roofMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.4 });
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.y = b.height + 0.04;
      roof.castShadow = true;
      group.add(roof);

      if (b.solarGeneration > 0) {
        const solarGeo = new THREE.PlaneGeometry(b.width * 0.6, b.depth * 0.5);
        const solarMat = new THREE.MeshStandardMaterial({ color: 0x1E3A8A, metalness: 0.8, roughness: 0.2 });
        const solar = new THREE.Mesh(solarGeo, solarMat);
        solar.rotation.x = -Math.PI / 2;
        solar.position.y = b.height + 0.09;
        group.add(solar);
      }

      // Generator Room Hazard Texture Striping
      if (b.id === 'generatorRoom') {
        const ventGeo = new THREE.PlaneGeometry(b.width * 0.7, b.height * 0.5);
        const ventMat = new THREE.MeshBasicMaterial({ color: 0xF59E0B, wireframe: true });
        const vent = new THREE.Mesh(ventGeo, ventMat);
        vent.position.set(0, b.height * 0.5, b.depth / 2 + 0.015);
        group.add(vent);
      }

      group.position.set(b.x, 0, b.z);
      this.scene.add(group);

      this.buildings.push({
        group, mesh, mat, lineMat,
        data: b,
        baseY: 0, targetY: 0, currentY: 0,
        baseEmissive: emissiveIntensity,
      });
    });
  },

  /* ── Ground Field Block + 4 Stadium Light Towers ────────── */
  _createGroundBlock(group, b) {
    const turfGeo = new THREE.BoxGeometry(b.width, b.height, b.depth);
    const turfMat = new THREE.MeshStandardMaterial({ color: 0x16A34A, roughness: 0.85, metalness: 0.05 });
    const turfMesh = new THREE.Mesh(turfGeo, turfMat);
    turfMesh.position.y = b.height / 2;
    turfMesh.receiveShadow = true;
    turfMesh.castShadow = true;
    turfMesh.userData = { buildingId: b.id, buildingData: b };
    group.add(turfMesh);

    // Running Track Loop
    const trackGeo = new THREE.PlaneGeometry(b.width + 0.6, b.depth + 0.6);
    const trackMat = new THREE.MeshStandardMaterial({ color: 0xC2410C, roughness: 0.8 });
    const trackMesh = new THREE.Mesh(trackGeo, trackMat);
    trackMesh.rotation.x = -Math.PI / 2;
    trackMesh.position.y = 0.008;
    trackMesh.receiveShadow = true;
    group.add(trackMesh);

    // Field Markings
    const lineGeo = new THREE.PlaneGeometry(b.width * 0.85, b.depth * 0.85);
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, wireframe: true, opacity: 0.7, transparent: true });
    const lines = new THREE.Mesh(lineGeo, lineMat);
    lines.rotation.x = -Math.PI / 2;
    lines.position.y = b.height + 0.002;
    group.add(lines);

    // 4 Corner Stadium Light Towers!
    const towerGeo = new THREE.CylinderGeometry(0.03, 0.04, 1.8);
    const towerMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 });
    const headGeo  = new THREE.BoxGeometry(0.3, 0.12, 0.08);
    const headMat  = new THREE.MeshBasicMaterial({ color: 0xFEF08A });

    const cornerOffsets = [
      { x: -b.width / 2 - 0.2, z: -b.depth / 2 - 0.2 },
      { x:  b.width / 2 + 0.2, z: -b.depth / 2 - 0.2 },
      { x: -b.width / 2 - 0.2, z:  b.depth / 2 + 0.2 },
      { x:  b.width / 2 + 0.2, z:  b.depth / 2 + 0.2 },
    ];

    cornerOffsets.forEach(c => {
      const tower = new THREE.Mesh(towerGeo, towerMat);
      tower.position.set(c.x, 0.9, c.z);
      group.add(tower);

      const head = new THREE.Mesh(headGeo, headMat);
      head.position.set(c.x, 1.8, c.z);
      group.add(head);
    });

    this.buildings.push({
      group, mesh: turfMesh, mat: turfMat, lineMat: null,
      data: b,
      baseY: 0, targetY: 0, currentY: 0,
      baseEmissive: 0,
    });
  },

  /* ── Basketball Court Block (3D Hoops & Acrylic Surface) ── */
  _createBasketballCourtBlock(group, b) {
    const courtGeo = new THREE.BoxGeometry(b.width, b.height, b.depth);
    const courtMat = new THREE.MeshStandardMaterial({ color: 0x1D4ED8, roughness: 0.4, metalness: 0.1 });
    const courtMesh = new THREE.Mesh(courtGeo, courtMat);
    courtMesh.position.y = b.height / 2;
    courtMesh.receiveShadow = true;
    courtMesh.castShadow = true;
    courtMesh.userData = { buildingId: b.id, buildingData: b };
    group.add(courtMesh);

    // Terracotta Apron Border
    const apronGeo = new THREE.PlaneGeometry(b.width + 0.4, b.depth + 0.4);
    const apronMat = new THREE.MeshStandardMaterial({ color: 0xB91C1C, roughness: 0.5 });
    const apron = new THREE.Mesh(apronGeo, apronMat);
    apron.rotation.x = -Math.PI / 2;
    apron.position.y = 0.008;
    apron.receiveShadow = true;
    group.add(apron);

    // White Key & Line Markings
    const lineGeo = new THREE.PlaneGeometry(b.width * 0.88, b.depth * 0.88);
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, wireframe: true, opacity: 0.85, transparent: true });
    const lines = new THREE.Mesh(lineGeo, lineMat);
    lines.rotation.x = -Math.PI / 2;
    lines.position.y = b.height + 0.002;
    group.add(lines);

    // Center Ring
    const ringGeo = new THREE.RingGeometry(0.3, 0.33, 16);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, side: THREE.DoubleSide });
    const centerRing = new THREE.Mesh(ringGeo, ringMat);
    centerRing.rotation.x = -Math.PI / 2;
    centerRing.position.y = b.height + 0.003;
    group.add(centerRing);

    // 3D Basketball Hoops (Both ends)
    const poleGeo  = new THREE.CylinderGeometry(0.025, 0.025, 0.9);
    const poleMat  = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
    const boardGeo = new THREE.BoxGeometry(0.4, 0.28, 0.02);
    const boardMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
    const rimGeo   = new THREE.TorusGeometry(0.07, 0.012, 8, 16);
    const rimMat   = new THREE.MeshBasicMaterial({ color: 0xEA580C });

    // Left Hoop
    const pole1 = new THREE.Mesh(poleGeo, poleMat);
    pole1.position.set(-b.width / 2 + 0.2, 0.45, 0);
    group.add(pole1);
    const board1 = new THREE.Mesh(boardGeo, boardMat);
    board1.position.set(-b.width / 2 + 0.2, 0.75, 0);
    group.add(board1);
    const rim1 = new THREE.Mesh(rimGeo, rimMat);
    rim1.rotation.x = Math.PI / 2;
    rim1.position.set(-b.width / 2 + 0.32, 0.70, 0);
    group.add(rim1);

    // Right Hoop
    const pole2 = new THREE.Mesh(poleGeo, poleMat);
    pole2.position.set(b.width / 2 - 0.2, 0.45, 0);
    group.add(pole2);
    const board2 = new THREE.Mesh(boardGeo, boardMat);
    board2.position.set(b.width / 2 - 0.2, 0.75, 0);
    group.add(board2);
    const rim2 = new THREE.Mesh(rimGeo, rimMat);
    rim2.rotation.x = Math.PI / 2;
    rim2.position.set(b.width / 2 - 0.32, 0.70, 0);
    group.add(rim2);

    this.buildings.push({
      group, mesh: courtMesh, mat: courtMat, lineMat: null,
      data: b,
      baseY: 0, targetY: 0, currentY: 0,
      baseEmissive: 0,
    });
  },

  /* ── Floating HTML Light Pill Labels ──────────────────── */
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

      const labelOffset = (b.data.id === 'ground' || b.data.id === 'basketballCourt') ? 0.35 : b.data.height + 0.45;
      const vec = new THREE.Vector3(b.data.x, b.currentY + labelOffset, b.data.z);
      vec.project(this.camera);

      if (vec.z > 1) { el.style.display = 'none'; return; }
      el.style.display = '';
      el.style.left = (vec.x * halfW + halfW) + 'px';
      el.style.top  = (-vec.y * halfH + halfH) + 'px';
    });
  },

  /* ── Interactions & Hover Float Elevation Animation ──── */
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

    if (this._mouseOver && this.raycaster) {
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.buildings.map(b => b.mesh));

      if (intersects.length > 0) {
        const hoveredMesh = intersects[0].object;
        this.buildings.forEach(b => {
          if (b.mesh === hoveredMesh) {
            b.targetY = 0.35; // Smooth 3D elevation float!
          } else {
            b.targetY = 0;
          }
        });
        this.container.style.cursor = 'pointer';
      } else {
        this.buildings.forEach(b => { b.targetY = 0; });
        this.container.style.cursor = '';
      }
    }
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

    // Smooth hover elevation lerp
    this.buildings.forEach(b => {
      b.currentY += (b.targetY - b.currentY) * 0.12;
      b.group.position.y = b.currentY;
    });

    // Alert pulse animation for JS Block
    this.buildings.forEach(b => {
      if (b.data.status === 'alert' && b.mat.emissiveIntensity !== undefined) {
        const pulse = (Math.sin(time * 3.0) + 1) / 2;
        b.mat.emissiveIntensity = b.baseEmissive + pulse * 0.25;
      }
    });

    // Update HTML light pill labels positioning
    this._updateLabels();

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  },
};
