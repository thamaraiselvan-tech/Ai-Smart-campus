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
    this.camera = new THREE.PerspectiveCamera(36, w / h, 0.1, 300);
    this.camera.position.set(26, 20, 26);
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
    this.controls.maxDistance = 55;
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
    sunLight.position.set(30, 38, 25);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(2048, 2048);
    sunLight.shadow.camera.left   = -28;
    sunLight.shadow.camera.right  =  28;
    sunLight.shadow.camera.top    =  28;
    sunLight.shadow.camera.bottom = -28;
    sunLight.shadow.camera.near   =  2;
    sunLight.shadow.camera.far    =  90;
    sunLight.shadow.bias = -0.0002;
    this.scene.add(sunLight);

    // Architectural Rim Light (Highlighting building silhouettes!)
    const rimLight = new THREE.DirectionalLight(0x93C5FD, 0.45);
    rimLight.position.set(-28, 22, -24);
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
    // Expanded Ground Base (48x44)
    const groundGeo = new THREE.PlaneGeometry(48, 44);
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

    // Perimeter Stone Curb / Fence Edge (Bordering campus)
    const borderGeo = new THREE.BoxGeometry(47.6, 0.1, 43.6);
    const borderEdges = new THREE.EdgesGeometry(borderGeo);
    const borderMat = new THREE.LineBasicMaterial({ color: 0x94A3B8, linewidth: 2 });
    const borderWire = new THREE.LineSegments(borderEdges, borderMat);
    borderWire.position.y = 0.05;
    this.scene.add(borderWire);

    // Grid Overlay
    const grid = new THREE.GridHelper(48, 44, 0xCBD5E1, 0xCBD5E1);
    grid.material.opacity = 0.35;
    grid.material.transparent = true;
    grid.position.y = 0.001;
    this.scene.add(grid);

    // Asphalt Road Network with White Center Lines & Crosswalk Stripes
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.65 });
    const dashMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
    const medianMat = new THREE.MeshStandardMaterial({ color: 0x16A34A, roughness: 0.8 }); // Green median strip

    // Primary & Secondary Road Segments
    const roads = [
      // Central Boulevard Parkway (Double Lane running N-S)
      { x: -0.35, z: 0, w: 0.45, d: 28 },               // Left Lane
      { x:  0.35, z: 0, w: 0.45, d: 28 },               // Right Lane
      // E-W Connecting Avenues
      { x: 0, z: -5.2, w: 28, d: 0.4 },                 // Rear Academic Way
      { x: 0, z: 0.5, w: 28, d: 0.4 },                  // Middle Engineering Way
      { x: 0, z: 5.2, w: 28, d: 0.4 },                  // Front Sports Concourse
      // Outer Perimeter Ring Road (N-S Loop)
      { x: -13.5, z: 0, w: 0.4, d: 28 },                // West Ring Road
      { x:  13.5, z: 0, w: 0.4, d: 28 },                // East Ring Road
      { x: 0, z: -13.5, w: 27.4, d: 0.4 },              // North Ring Road
      { x: 0, z:  13.5, w: 27.4, d: 0.4 },              // South Entrance Parkway
    ];

    roads.forEach(r => {
      const geo = new THREE.PlaneGeometry(r.w, r.d);
      const road = new THREE.Mesh(geo, roadMat);
      road.rotation.x = -Math.PI / 2;
      road.position.set(r.x, 0.005, r.z);
      road.receiveShadow = true;
      this.scene.add(road);

      // White Center Markings for Wide E-W Avenues
      if (r.w > 5) {
        const lineGeo = new THREE.PlaneGeometry(r.w - 1, 0.035);
        const line = new THREE.Mesh(lineGeo, dashMat);
        line.rotation.x = -Math.PI / 2;
        line.position.set(r.x, 0.007, r.z);
        this.scene.add(line);
      }
    });

    // Central Boulevard Median Grass Strip
    const medianGeo = new THREE.PlaneGeometry(0.2, 28);
    const median = new THREE.Mesh(medianGeo, medianMat);
    median.rotation.x = -Math.PI / 2;
    median.position.set(0, 0.007, 0);
    median.receiveShadow = true;
    this.scene.add(median);

    // Pedestrian Zebra Crosswalk Markings at Intersections
    const crosswalkZs = [-5.2, 0.5, 5.2];
    crosswalkZs.forEach(z => {
      for (let stripe = -0.4; stripe <= 0.4; stripe += 0.16) {
        const sGeo = new THREE.PlaneGeometry(0.1, 0.35);
        const sMesh = new THREE.Mesh(sGeo, dashMat);
        sMesh.rotation.x = -Math.PI / 2;
        sMesh.position.set(stripe, 0.008, z);
        this.scene.add(sMesh);
      }
    });

    // KS Block Executive Roundabout & Entrance Drop-off Plaza
    const plazaGeo = new THREE.CylinderGeometry(1.4, 1.4, 0.02, 32);
    const plazaMat = new THREE.MeshStandardMaterial({ color: 0xCBD5E1, roughness: 0.6 });
    const plaza = new THREE.Mesh(plazaGeo, plazaMat);
    plaza.position.set(0, 0.01, -2.5);
    plaza.receiveShadow = true;
    this.scene.add(plaza);

    // Roundabout Center Garden Island
    const islandGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.04, 24);
    const islandMat = new THREE.MeshStandardMaterial({ color: 0x16A34A, roughness: 0.7 });
    const island = new THREE.Mesh(islandGeo, islandMat);
    island.position.set(0, 0.02, -2.5);
    island.receiveShadow = true;
    this.scene.add(island);

    // Cafeteria & Mechanical Parking Lot with Stall Stripes
    const parkingGeo = new THREE.PlaneGeometry(3.6, 2.2);
    const parkingMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });
    const parking = new THREE.Mesh(parkingGeo, parkingMat);
    parking.rotation.x = -Math.PI / 2;
    parking.position.set(10.2, 0.005, 5.2);
    parking.receiveShadow = true;
    this.scene.add(parking);

    // Parking Lines
    for (let p = -1.4; p <= 1.4; p += 0.7) {
      const pLineGeo = new THREE.PlaneGeometry(0.04, 1.8);
      const pLine = new THREE.Mesh(pLineGeo, dashMat);
      pLine.rotation.x = -Math.PI / 2;
      pLine.position.set(10.2 + p, 0.007, 5.2);
      this.scene.add(pLine);
    }
  },

  /* ── Rich 3D Campus Forestry & Tree Avenues ──────────────── */
  _createCampusTreeAccents() {
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350F, roughness: 0.9 });

    // Tree Materials Palette
    const leafMats = {
      emerald: new THREE.MeshStandardMaterial({ color: 0x15803D, roughness: 0.6 }),
      forest:  new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.6 }),
      lime:    new THREE.MeshStandardMaterial({ color: 0x22C55E, roughness: 0.5 }),
      golden:  new THREE.MeshStandardMaterial({ color: 0x65A30D, roughness: 0.6 }),
    };

    // Helper to spawn varied 3D tree models
    const spawnTree = (x, z, type = 'shade', scale = 1.0) => {
      const group = new THREE.Group();

      if (type === 'palm') {
        // Royal Palm Tree: Slender curving trunk + top fronds
        const tGeo = new THREE.CylinderGeometry(0.04 * scale, 0.06 * scale, 0.8 * scale);
        const trunk = new THREE.Mesh(tGeo, trunkMat);
        trunk.position.y = (0.4 * scale);
        trunk.castShadow = true;
        group.add(trunk);

        const crownGeo = new THREE.ConeGeometry(0.42 * scale, 0.35 * scale, 6);
        const crown = new THREE.Mesh(crownGeo, leafMats.lime);
        crown.position.y = (0.85 * scale);
        crown.castShadow = true;
        group.add(crown);
      } else if (type === 'cypress') {
        // Conical Cypress / Pine Tree
        const tGeo = new THREE.CylinderGeometry(0.05 * scale, 0.07 * scale, 0.5 * scale);
        const trunk = new THREE.Mesh(tGeo, trunkMat);
        trunk.position.y = (0.25 * scale);
        trunk.castShadow = true;
        group.add(trunk);

        for (let i = 0; i < 3; i++) {
          const coneGeo = new THREE.ConeGeometry((0.35 - i * 0.08) * scale, 0.45 * scale, 8);
          const cone = new THREE.Mesh(coneGeo, i % 2 === 0 ? leafMats.forest : leafMats.emerald);
          cone.position.y = (0.55 + i * 0.3) * scale;
          cone.castShadow = true;
          group.add(cone);
        }
      } else if (type === 'ornamental') {
        // Low flowering courtyard bush
        const bGeo = new THREE.SphereGeometry(0.28 * scale, 8, 8);
        const bush = new THREE.Mesh(bGeo, leafMats.golden);
        bush.position.y = (0.25 * scale);
        bush.castShadow = true;
        group.add(bush);
      } else {
        // Classic Dome Shade Tree
        const tGeo = new THREE.CylinderGeometry(0.06 * scale, 0.08 * scale, 0.48 * scale);
        const trunk = new THREE.Mesh(tGeo, trunkMat);
        trunk.position.y = (0.24 * scale);
        trunk.castShadow = true;
        group.add(trunk);

        const f1Geo = new THREE.SphereGeometry(0.38 * scale, 8, 8);
        const f1 = new THREE.Mesh(f1Geo, leafMats.emerald);
        f1.position.y = (0.6 * scale);
        f1.castShadow = true;
        group.add(f1);

        const f2Geo = new THREE.SphereGeometry(0.28 * scale, 8, 8);
        const f2 = new THREE.Mesh(f2Geo, leafMats.forest);
        f2.position.y = (0.84 * scale);
        f2.castShadow = true;
        group.add(f2);
      }

      group.position.set(x, 0, z);
      this.scene.add(group);
    };

    // 1. Central Boulevard Palms & Shade Trees
    const boulevardZs = [-11, -8.5, -6, -3.5, 2, 4.5, 7, 9.5, 12];
    boulevardZs.forEach(z => {
      spawnTree(-1.1, z, 'palm', 1.0);
      spawnTree( 1.1, z, 'palm', 1.0);
    });

    // 2. Courtyard & Academic Gardens (Between Buildings)
    const gardenTreePos = [
      { x: -3.4, z: -5.2, type: 'shade' }, { x: 3.4, z: -5.2, type: 'shade' },
      { x: -3.4, z: -2.0, type: 'cypress' }, { x: 3.4, z: -2.0, type: 'cypress' },
      { x: -3.4, z:  0.5, type: 'shade' }, { x: 3.4, z:  0.5, type: 'shade' },
      { x: -3.4, z:  3.0, type: 'shade' }, { x: 3.4, z:  3.0, type: 'shade' },
      { x: -9.8, z: -4.5, type: 'cypress' }, { x: 9.8, z: -4.5, type: 'cypress' },
      { x: -9.8, z:  0.5, type: 'shade' },   { x: 9.8, z:  0.5, type: 'shade' },
      { x:  0.0, z: -2.5, type: 'ornamental', scale: 1.2 }, // Roundabout centerpiece tree
    ];
    gardenTreePos.forEach(p => spawnTree(p.x, p.z, p.type || 'shade', p.scale || 1.0));

    // 3. Sports & Athletics Green Belt (Surrounding Ground & Basketball Court)
    const sportsTreePos = [
      { x: -8.5, z:  8.2 }, { x: -6.5, z:  8.2 }, { x: -4.5, z:  8.2 }, { x: -2.5, z:  8.2 },
      { x: -8.8, z:  5.2 }, { x: -8.8, z:  3.2 }, { x: -8.8, z:  7.2 },
      { x:  1.8, z:  7.8 }, { x:  3.2, z:  7.8 },
    ];
    sportsTreePos.forEach(p => spawnTree(p.x, p.z, 'shade', 1.1));

    // 4. Outer Campus Perimeter Tree Ring (Neat Cypress & Shade Tree Belt)
    for (let x = -20; x <= 20; x += 3.5) {
      spawnTree(x, -16.5, 'cypress', 1.05);
      spawnTree(x,  16.5, 'cypress', 1.05);
    }
    for (let z = -14; z <= 14; z += 3.5) {
      spawnTree(-20.5, z, 'shade', 1.0);
      spawnTree( 20.5, z, 'shade', 1.0);
    }
  },

  /* ── Street Lamp Posts ────────────────────────────────── */
  _createStreetLamps() {
    const lampPositions = [
      { x: -0.65, z: -9.0 }, { x: 0.65, z: -9.0 },
      { x: -0.65, z: -5.2 }, { x: 0.65, z: -5.2 },
      { x: -0.65, z: -1.0 }, { x: 0.65, z: -1.0 },
      { x: -0.65, z:  2.5 }, { x: 0.65, z:  2.5 },
      { x: -0.65, z:  7.5 }, { x: 0.65, z:  7.5 },
      { x: -0.65, z: 11.5 }, { x: 0.65, z: 11.5 },
      { x: -6.5,  z:  2.8 }, { x: 6.5,  z:  2.8 },
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
