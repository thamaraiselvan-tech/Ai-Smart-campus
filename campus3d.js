/* ============================================================
   Saranathan College of Engineering — Realistic 3D Campus Scene
   Three.js Master Plan, Multi-Wing Architecture, Stadium Bleachers,
   Dual Basketball Courts, Asphalt Roads with Lane Lines & Lighting
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
  targetCamPos: null,
  targetTargetPos: null,
  isCameraPanning: false,
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
    this.scene.fog = new THREE.FogExp2(0xF1F5F9, 0.015);

    /* ── Camera Setup ───────────────────────────────────── */
    this.camera = new THREE.PerspectiveCamera(36, w / h, 0.1, 250);
    this.camera.position.set(22, 17, 22);
    this.camera.lookAt(0, 0, 0);

    /* ── WebGL Renderer Setup ───────────────────────────── */
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.22;
    this.container.appendChild(this.renderer.domElement);

    /* ── Orbit Controls Setup ───────────────────────────── */
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2.3;
    this.controls.minPolarAngle = 0.16;
    this.controls.minDistance = 8;
    this.controls.maxDistance = 42;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.35;
    this.controls.target.set(0, 0, 0);

    this.controls.addEventListener('start', () => {
      this.controls.autoRotate = false;
      this.isCameraPanning = false;
      clearTimeout(this._autoRotateTimer);
    });
    this.controls.addEventListener('end', () => {
      this._autoRotateTimer = setTimeout(() => {
        this.controls.autoRotate = true;
      }, 7000);
    });

    /* ── Raycaster Setup ────────────────────────────────── */
    this.raycaster = new THREE.Raycaster();

    /* ── Realistic Photorealistic Ambiance & Lighting ────── */
    // Ambient Light
    this.scene.add(new THREE.AmbientLight(0xE2E8F0, 0.85));

    // Sky Hemisphere Light
    const hemiLight = new THREE.HemisphereLight(0xFFFFFF, 0x94A3B8, 0.45);
    this.scene.add(hemiLight);

    // Direct Sunlight (Realistic 45° angle)
    const sunLight = new THREE.DirectionalLight(0xFFFBEB, 1.6);
    sunLight.position.set(24, 32, 20);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(2048, 2048);
    sunLight.shadow.camera.left   = -20;
    sunLight.shadow.camera.right  =  20;
    sunLight.shadow.camera.top    =  20;
    sunLight.shadow.camera.bottom = -20;
    sunLight.shadow.camera.near   =  2;
    sunLight.shadow.camera.far    =  70;
    sunLight.shadow.bias = -0.0002;
    this.scene.add(sunLight);

    // Architectural Rim Light (Highlighting building silhouettes!)
    const rimLight = new THREE.DirectionalLight(0x93C5FD, 0.45);
    rimLight.position.set(-22, 18, -18);
    this.scene.add(rimLight);

    /* ── Build Realistic Campus Infrastructure ──────────── */
    this._createGroundAndRoads();
    this._createCampusTreeAccents();
    this._createStreetLamps();
    this._createSkywalkBridges();
    this._createBuildings();
    this._createAIParticles();
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

  /* ── Realistic Paved Asphalt Roads + White Lane Lines ──── */
  _createGroundAndRoads() {
    // Ground Base
    const groundGeo = new THREE.PlaneGeometry(38, 38);
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

    // Grid Overlay
    const grid = new THREE.GridHelper(38, 38, 0xCBD5E1, 0xCBD5E1);
    grid.material.opacity = 0.4;
    grid.material.transparent = true;
    grid.position.y = 0.001;
    this.scene.add(grid);

    // Asphalt Road Network with White Lane Lines
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x64748B, roughness: 0.65 });
    const dashMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });

    const roads = [
      { x: 0, z: 0, w: 0.45, d: 28 },                   // Central Boulevard
      { x: 0, z: -5.2, w: 22, d: 0.35 },                // Rear Academic Way
      { x: 0, z: 0.5, w: 22, d: 0.35 },                 // Middle Engineering Way
      { x: 0, z: 5.2, w: 22, d: 0.35 },                 // Front Sports Concourse
      { x: -3.25, z: 5.2, w: 7.0, d: 0.4 },             // Direct Sports Concourse connecting Ground & Court
    ];

    roads.forEach(r => {
      const geo = new THREE.PlaneGeometry(r.w, r.d);
      const road = new THREE.Mesh(geo, roadMat);
      road.rotation.x = -Math.PI / 2;
      road.position.set(r.x, 0.005, r.z);
      road.receiveShadow = true;
      this.scene.add(road);

      // White Center Line Markings
      if (r.w > 5) {
        const lineGeo = new THREE.PlaneGeometry(r.w, 0.04);
        const line = new THREE.Mesh(lineGeo, dashMat);
        line.rotation.x = -Math.PI / 2;
        line.position.set(r.x, 0.007, r.z);
        this.scene.add(line);
      }
    });

    // Central Green Plaza Pavers
    const plazaGeo = new THREE.PlaneGeometry(3.2, 3.2);
    const plazaMat = new THREE.MeshStandardMaterial({ color: 0xCBD5E1, roughness: 0.6 });
    const plaza = new THREE.Mesh(plazaGeo, plazaMat);
    plaza.rotation.x = -Math.PI / 2;
    plaza.position.set(0, 0.006, 0);
    plaza.receiveShadow = true;
    this.scene.add(plaza);
  },

  /* ── Trees & Greenery Groves ──────────────────────────── */
  _createCampusTreeAccents() {
    const treePositions = [
      { x: -3.4, z: -5.2 }, { x: 3.4, z: -5.2 },
      { x: -3.4, z: -2.0 }, { x: 3.4, z: -2.0 },
      { x: -3.4, z:  0.5 }, { x: 3.4, z:  0.5 },
      { x: -3.4, z:  3.0 }, { x: 3.4, z:  3.0 },
      { x:  2.5, z:  5.2 },
    ];

    const trunkGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.45);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350F, roughness: 0.9 });
    const foliageGeo1 = new THREE.SphereGeometry(0.38, 8, 8);
    const foliageGeo2 = new THREE.SphereGeometry(0.28, 8, 8);
    const foliageMat1 = new THREE.MeshStandardMaterial({ color: 0x15803D, roughness: 0.6 });
    const foliageMat2 = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.6 });

    treePositions.forEach(p => {
      const group = new THREE.Group();
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 0.22;
      trunk.castShadow = true;
      group.add(trunk);

      const f1 = new THREE.Mesh(foliageGeo1, foliageMat1);
      f1.position.y = 0.58;
      f1.castShadow = true;
      group.add(f1);

      const f2 = new THREE.Mesh(foliageGeo2, foliageMat2);
      f2.position.y = 0.82;
      f2.castShadow = true;
      group.add(f2);

      group.position.set(p.x, 0, p.z);
      this.scene.add(group);
    });
  },

  /* ── Street Lamp Posts ────────────────────────────────── */
  _createStreetLamps() {
    const lampPositions = [
      { x: -0.35, z: -3.5 }, { x: 0.35, z: -3.5 },
      { x: -0.35, z: -1.0 }, { x: 0.35, z: -1.0 },
      { x: -0.35, z:  2.5 }, { x: 0.35, z:  2.5 },
    ];

    const postGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.65);
    const postMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
    const bulbGeo = new THREE.SphereGeometry(0.05, 8, 8);
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xFEF08A });

    lampPositions.forEach(p => {
      const group = new THREE.Group();
      const post = new THREE.Mesh(postGeo, postMat);
      post.position.y = 0.325;
      group.add(post);

      const bulb = new THREE.Mesh(bulbGeo, bulbMat);
      bulb.position.y = 0.67;
      group.add(bulb);

      group.position.set(p.x, 0, p.z);
      this.scene.add(group);
    });
  },

  /* ── Interconnecting Glass Skywalk Bridge ─────────────── */
  _createSkywalkBridges() {
    // Glass skywalk connecting RV Block & JS Block
    const bridgeGeo = new THREE.BoxGeometry(0.3, 0.35, 2.8);
    const bridgeMat = new THREE.MeshStandardMaterial({
      color: 0x93C5FD,
      transparent: true,
      opacity: 0.7,
      metalness: 0.5,
      roughness: 0.2,
    });
    const bridge = new THREE.Mesh(bridgeGeo, bridgeMat);
    bridge.position.set(-6.5, 1.6, -2.0);
    bridge.castShadow = true;
    this.scene.add(bridge);
  },

  /* ── Ambient AI Floating Particle System ─────────────── */
  _createAIParticles() {
    const count = 120;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 28;
      positions[i * 3 + 1] = Math.random() * 8 + 0.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 28;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color: 0x3B82F6,
      size: 0.05,
      transparent: true,
      opacity: 0.45,
      sizeAttenuation: true,
    });

    this.particles = new THREE.Points(geo, mat);
    this.scene.add(this.particles);
  },

  /* ── Realistic Architectural Building Assemblies ──────── */
  _createBuildings() {
    CampusData.buildings.forEach(b => {
      const group = new THREE.Group();

      /* 1. Ground Field + Spectator Grandstand / Bleachers */
      if (b.id === 'ground') {
        this._createGroundBlock(group, b);
        group.position.set(b.x, 0, b.z);
        this.scene.add(group);
        return;
      }

      /* 2. Basketball Court Block (Dual Courts + Hoops) */
      if (b.id === 'basketballCourt') {
        this._createBasketballCourtBlock(group, b);
        group.position.set(b.x, 0, b.z);
        this.scene.add(group);
        return;
      }

      /* 3. Academic Towers & Utility Assemblies */
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

      // Glass Edge Line Wireframes
      const edges = new THREE.EdgesGeometry(geo);
      const lineMat = new THREE.LineBasicMaterial({ color: accentColor, transparent: true, opacity: 0.45 });
      const wireframe = new THREE.LineSegments(edges, lineMat);
      wireframe.position.y = b.height / 2;
      group.add(wireframe);

      // KS Block Glass Entrance Atrium & Podium Steps
      if (b.id === 'ksBlock') {
        // Steps
        const stepGeo = new THREE.BoxGeometry(b.width * 0.6, 0.1, 0.6);
        const stepMat = new THREE.MeshStandardMaterial({ color: 0xCBD5E1, roughness: 0.5 });
        const step = new THREE.Mesh(stepGeo, stepMat);
        step.position.set(0, 0.05, b.depth / 2 + 0.3);
        group.add(step);

        // Glass Atrium Lobby
        const atriumGeo = new THREE.BoxGeometry(b.width * 0.5, 0.8, 0.4);
        const atriumMat = new THREE.MeshStandardMaterial({ color: 0x93C5FD, transparent: true, opacity: 0.75, metalness: 0.5 });
        const atrium = new THREE.Mesh(atriumGeo, atriumMat);
        atrium.position.set(0, 0.4, b.depth / 2 + 0.2);
        atrium.castShadow = true;
        group.add(atrium);
      }

      // Entrance Canopy for RV Block
      if (b.id === 'rvBlock') {
        const canopyGeo = new THREE.BoxGeometry(b.width * 0.4, 0.08, 0.4);
        const canopyMat = new THREE.MeshStandardMaterial({ color: 0x3B82F6, metalness: 0.5 });
        const canopy = new THREE.Mesh(canopyGeo, canopyMat);
        canopy.position.set(0, 0.4, b.depth / 2 + 0.2);
        group.add(canopy);
      }

      // Windows Facade Bands
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

      // Roof HVAC Chillers for KS / RV / JS
      if (b.id === 'ksBlock' || b.id === 'rvBlock' || b.id === 'jsBlock') {
        const chillerGeo = new THREE.BoxGeometry(0.3, 0.2, 0.3);
        const chillerMat = new THREE.MeshStandardMaterial({ color: 0x94A3B8, metalness: 0.8 });
        const chiller = new THREE.Mesh(chillerGeo, chillerMat);
        chiller.position.set(-b.width * 0.25, b.height + 0.18, 0);
        chiller.castShadow = true;
        group.add(chiller);
      }

      // Mech Block Pitched Metal Roof Assembly
      if (b.id === 'mechBlock') {
        const pitchedGeo = new THREE.ConeGeometry(b.width * 0.6, 0.4, 4);
        const pitchedMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.3 });
        const pitchedRoof = new THREE.Mesh(pitchedGeo, pitchedMat);
        pitchedRoof.rotation.y = Math.PI / 4;
        pitchedRoof.position.set(0, b.height + 0.2, 0);
        pitchedRoof.castShadow = true;
        group.add(pitchedRoof);
      }

      // Cafeteria Outdoor Patio Tables & Umbrella Meshes
      if (b.id === 'cafeteria') {
        const patioGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.12);
        const patioMat = new THREE.MeshStandardMaterial({ color: 0x0284C7 });
        const umbrellaGeo = new THREE.ConeGeometry(0.25, 0.15, 6);
        const umbrellaMat = new THREE.MeshStandardMaterial({ color: 0xE0F2FE });

        const patioOffsets = [
          { x: -b.width / 2 - 0.3, z: 0 },
          { x:  b.width / 2 + 0.3, z: 0 },
        ];
        patioOffsets.forEach(p => {
          const t = new THREE.Mesh(patioGeo, patioMat);
          t.position.set(p.x, 0.06, p.z);
          group.add(t);

          const u = new THREE.Mesh(umbrellaGeo, umbrellaMat);
          u.position.set(p.x, 0.35, p.z);
          group.add(u);
        });
      }

      // Generator Room Hazard Texture Striping & Transformer Coils
      if (b.id === 'generatorRoom') {
        const coilGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.4);
        const coilMat = new THREE.MeshStandardMaterial({ color: 0xB45309, metalness: 0.9, roughness: 0.2 });
        const coil1 = new THREE.Mesh(coilGeo, coilMat);
        coil1.position.set(-0.4, 0.2, b.depth / 2 + 0.2);
        group.add(coil1);

        const coil2 = new THREE.Mesh(coilGeo, coilMat);
        coil2.position.set(0.4, 0.2, b.depth / 2 + 0.2);
        group.add(coil2);
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

  /* ── Ground Field Block + Stadium Grandstand Bleachers ─── */
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

    // 3D Spectator Grandstand / Bleachers along rear edge
    const bleacherTier1 = new THREE.BoxGeometry(b.width * 0.9, 0.15, 0.3);
    const bleacherTier2 = new THREE.BoxGeometry(b.width * 0.9, 0.30, 0.25);
    const bleacherMat   = new THREE.MeshStandardMaterial({ color: 0x94A3B8, roughness: 0.5 });
    
    const t1 = new THREE.Mesh(bleacherTier1, bleacherMat);
    t1.position.set(0, 0.075, -b.depth / 2 - 0.25);
    t1.castShadow = true;
    group.add(t1);

    const t2 = new THREE.Mesh(bleacherTier2, bleacherMat);
    t2.position.set(0, 0.15, -b.depth / 2 - 0.45);
    t2.castShadow = true;
    group.add(t2);

    // 4 Corner Stadium Light Towers
    const towerGeo = new THREE.CylinderGeometry(0.03, 0.04, 2.0);
    const towerMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 });
    const headGeo  = new THREE.BoxGeometry(0.35, 0.15, 0.08);
    const headMat  = new THREE.MeshBasicMaterial({ color: 0xFEF08A });

    const cornerOffsets = [
      { x: -b.width / 2 - 0.2, z: -b.depth / 2 - 0.2 },
      { x:  b.width / 2 + 0.2, z: -b.depth / 2 - 0.2 },
      { x: -b.width / 2 - 0.2, z:  b.depth / 2 + 0.2 },
      { x:  b.width / 2 + 0.2, z:  b.depth / 2 + 0.2 },
    ];

    cornerOffsets.forEach(c => {
      const tower = new THREE.Mesh(towerGeo, towerMat);
      tower.position.set(c.x, 1.0, c.z);
      group.add(tower);

      const head = new THREE.Mesh(headGeo, headMat);
      head.position.set(c.x, 2.0, c.z);
      group.add(head);
    });

    this.buildings.push({
      group, mesh: turfMesh, mat: turfMat, lineMat: null,
      data: b,
      baseY: 0, targetY: 0, currentY: 0,
      baseEmissive: 0,
    });
  },

  /* ── Basketball Court Block (3D Hoops & Glass Backboards) ── */
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

      const labelOffset = (b.data.id === 'ground' || b.data.id === 'basketballCourt') ? 0.4 : b.data.height + 0.52;
      const vec = new THREE.Vector3(b.data.x, b.currentY + labelOffset, b.data.z);
      vec.project(this.camera);

      if (vec.z > 1) { el.style.display = 'none'; return; }
      el.style.display = '';
      el.style.left = (vec.x * halfW + halfW) + 'px';
      el.style.top  = (-vec.y * halfH + halfH) + 'px';
    });
  },

  /* ── Camera Smooth Glide Pan Animation on Click ──────── */
  focusBuilding(building) {
    if (!building) return;
    this.targetTargetPos = new THREE.Vector3(building.x, 0.5, building.z);
    this.targetCamPos = new THREE.Vector3(building.x + 10, 10, building.z + 10);
    this.isCameraPanning = true;
    this.controls.autoRotate = false;
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
      this.focusBuilding(bd);
      setTimeout(() => {
        if (typeof App !== 'undefined' && App.showBuilding) {
          App.showBuilding(bd);
        }
      }, 350);
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
            b.targetY = 0.4; // Smooth 3D elevation float!
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

    // Camera Glide Lerp
    if (this.isCameraPanning && this.targetCamPos && this.targetTargetPos) {
      this.camera.position.lerp(this.targetCamPos, 0.08);
      this.controls.target.lerp(this.targetTargetPos, 0.08);
      if (this.camera.position.distanceTo(this.targetCamPos) < 0.2) {
        this.isCameraPanning = false;
      }
    }

    // Floating AI Particles upward drift
    if (this.particles) {
      const pos = this.particles.geometry.attributes.position.array;
      for (let i = 0; i < pos.length; i += 3) {
        pos[i + 1] += Math.sin(time * 1.2 + i * 0.2) * 0.0025;
        if (pos[i + 1] > 9) pos[i + 1] = 0.5;
      }
      this.particles.geometry.attributes.position.needsUpdate = true;
    }

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
