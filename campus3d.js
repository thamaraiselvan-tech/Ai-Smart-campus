/* ============================================================
   Saranathan College of Engineering — Realistic 3D Campus Scene
   Vanilla Three.js Master Plan, Function-Based Architecture,
   Instanced Trees & Lighting, Distance-Scaled Labels & Exploded View
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
  _hoveredBuilding: null,

  /* ── 3D Exploded Layer Expansion Engine State ──────────── */
  expandedBuildingId: null,
  currentExpandedBuilding: null,

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    if (w === 0 || h === 0) return;

    /* ── Scene & Atmosphere Setup ───────────────────────── */
    this.scene = new THREE.Scene();
    const skyColor = new THREE.Color(0xE0F2FE); // Soft daylight sky
    this.scene.background = skyColor;
    this.scene.fog = new THREE.FogExp2(skyColor, 0.012);

    /* ── Camera Setup ───────────────────────────────────── */
    this.camera = new THREE.PerspectiveCamera(36, w / h, 0.1, 300);
    this.camera.position.set(26, 20, 26);
    this.camera.lookAt(0, 0, 0);

    /* ── WebGL Renderer Setup (Rich Contrast & Filmic Tone) ── */
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.35;
    if (this.renderer.outputColorSpace !== undefined) {
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    }
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

    /* ── Realistic Afternoon Lighting & Contact Shadows ─── */
    this._setupLighting();

    /* ── Build Campus Infrastructure & Instanced Models ─── */
    this._createGroundAndRoads();
    this._createInstancedTrees();
    this._createInstancedStreetLamps();
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
      this._clearHoverState();
      this.container.style.cursor = '';
    });
    window.addEventListener('resize', this.onResize.bind(this));

    /* ── Start Render Loop ──────────────────────────────── */
    this._animate();
  },

  /* ── Realistic Afternoon Lighting System ───────────────── */
  _setupLighting() {
    // Soft Ambient Fill Light
    this.scene.add(new THREE.AmbientLight(0xFFFFFF, 0.65));

    // Sky-Ground Hemisphere Light
    const hemiLight = new THREE.HemisphereLight(0xF8FAFC, 0x64748B, 0.75);
    this.scene.add(hemiLight);

    // Direct Sunlight (Warm 45° Afternoon Angle with Long Shadows)
    const sunLight = new THREE.DirectionalLight(0xFFF7ED, 2.2);
    sunLight.position.set(32, 28, 24);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(2048, 2048);
    sunLight.shadow.camera.left   = -30;
    sunLight.shadow.camera.right  =  30;
    sunLight.shadow.camera.top    =  30;
    sunLight.shadow.camera.bottom = -30;
    sunLight.shadow.camera.near   =  2;
    sunLight.shadow.camera.far    =  95;
    sunLight.shadow.bias = -0.00015;
    this.scene.add(sunLight);

    // Architectural Rim Light for Building Silhouettes
    const rimLight = new THREE.DirectionalLight(0x93C5FD, 0.55);
    rimLight.position.set(-28, 24, -24);
    this.scene.add(rimLight);
  },

  /* ── Multi-Textured Ground Base, Walkways & Asphalt Roads ── */
  _createGroundAndRoads() {
    // 1. Base Campus Lawn Ground (Emerald Tone)
    const groundGeo = new THREE.PlaneGeometry(50, 46);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0xDCFCE7,
      roughness: 0.85,
      metalness: 0.05,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Perimeter Curb Wall
    const borderGeo = new THREE.BoxGeometry(49.6, 0.1, 45.6);
    const borderEdges = new THREE.EdgesGeometry(borderGeo);
    const borderMat = new THREE.LineBasicMaterial({ color: 0x94A3B8, linewidth: 2 });
    const borderWire = new THREE.LineSegments(borderEdges, borderMat);
    borderWire.position.y = 0.05;
    this.scene.add(borderWire);

    // Subtle Architectural Grid Overlay
    const grid = new THREE.GridHelper(50, 46, 0x94A3B8, 0xCBD5E1);
    grid.material.opacity = 0.25;
    grid.material.transparent = true;
    grid.position.y = 0.001;
    this.scene.add(grid);

    // 2. Concrete Pedestrian Walkway Network
    const pathMat = new THREE.MeshStandardMaterial({ color: 0xCBD5E1, roughness: 0.6 });
    const walkways = [
      { x: -6.5, z: -2.0, w: 1.2, d: 4.5 }, // Skywalk ground path between RV & JS
      { x:  6.2, z: -2.0, w: 1.2, d: 4.5 }, // Path between Generator & Mech
      { x:  0.0, z: -3.8, w: 4.2, d: 1.2 }, // KS Plaza walkway
      { x:  2.8, z:  5.2, w: 3.5, d: 1.2 }, // Cafeteria connection path
    ];
    walkways.forEach(w => {
      const geo = new THREE.PlaneGeometry(w.w, w.d);
      const mesh = new THREE.Mesh(geo, pathMat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(w.x, 0.003, w.z);
      mesh.receiveShadow = true;
      this.scene.add(mesh);
    });

    // 3. Dark Asphalt Road Network with White Lane Markings & Crosswalks
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.65 });
    const dashMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
    const medianMat = new THREE.MeshStandardMaterial({ color: 0x16A34A, roughness: 0.8 });

    const roads = [
      { x: -0.35, z: 0, w: 0.45, d: 28 },               // Left Central Lane
      { x:  0.35, z: 0, w: 0.45, d: 28 },               // Right Central Lane
      { x: 0, z: -5.2, w: 28, d: 0.4 },                 // Rear Academic Way
      { x: 0, z: 0.5, w: 28, d: 0.4 },                  // Middle Engineering Way
      { x: 0, z: 5.2, w: 28, d: 0.4 },                  // Front Sports Concourse
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

    // Pedestrian Crosswalk Stripes
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

    // KS Block Roundabout Drop-off Plaza
    const plazaGeo = new THREE.CylinderGeometry(1.4, 1.4, 0.02, 32);
    const plazaMat = new THREE.MeshStandardMaterial({ color: 0xCBD5E1, roughness: 0.6 });
    const plaza = new THREE.Mesh(plazaGeo, plazaMat);
    plaza.position.set(0, 0.01, -2.5);
    plaza.receiveShadow = true;
    this.scene.add(plaza);

    const islandGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.04, 24);
    const islandMat = new THREE.MeshStandardMaterial({ color: 0x16A34A, roughness: 0.7 });
    const island = new THREE.Mesh(islandGeo, islandMat);
    island.position.set(0, 0.02, -2.5);
    island.receiveShadow = true;
    this.scene.add(island);

    // Cafeteria Parking Lot with Stall Lines
    const parkingGeo = new THREE.PlaneGeometry(3.6, 2.2);
    const parkingMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });
    const parking = new THREE.Mesh(parkingGeo, parkingMat);
    parking.rotation.x = -Math.PI / 2;
    parking.position.set(10.2, 0.005, 5.2);
    parking.receiveShadow = true;
    this.scene.add(parking);

    for (let p = -1.4; p <= 1.4; p += 0.7) {
      const pLineGeo = new THREE.PlaneGeometry(0.04, 1.8);
      const pLine = new THREE.Mesh(pLineGeo, dashMat);
      pLine.rotation.x = -Math.PI / 2;
      pLine.position.set(10.2 + p, 0.007, 5.2);
      this.scene.add(pLine);
    }
  },

  /* ── Performance Instanced Trees (Organic Scale Variation) ─ */
  _createInstancedTrees() {
    const trunkGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.48);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350F, roughness: 0.9 });
    const f1Geo    = new THREE.SphereGeometry(0.38, 8, 8);
    const f1Mat    = new THREE.MeshStandardMaterial({ color: 0x15803D, roughness: 0.6 });

    const treePositions = [
      { x: -3.4, z: -5.2 }, { x: 3.4, z: -5.2 },
      { x: -3.4, z: -2.0 }, { x: 3.4, z: -2.0 },
      { x: -3.4, z:  0.5 }, { x: 3.4, z:  0.5 },
      { x: -3.4, z:  3.0 }, { x: 3.4, z:  3.0 },
      { x: -9.8, z: -4.5 }, { x: 9.8, z: -4.5 },
      { x: -9.8, z:  0.5 }, { x: 9.8, z:  0.5 },
      { x: -8.5, z:  8.2 }, { x: -6.5, z:  8.2 }, { x: -4.5, z:  8.2 }, { x: -2.5, z:  8.2 },
      { x: -8.8, z:  5.2 }, { x: -8.8, z:  3.2 }, { x: -8.8, z:  7.2 },
      { x:  1.8, z:  7.8 }, { x:  3.2, z:  7.8 },
      { x:  0.0, z: -2.5 },
    ];

    // Perimeter Ring Trees
    for (let x = -20; x <= 20; x += 3.5) {
      treePositions.push({ x, z: -16.5 });
      treePositions.push({ x, z:  16.5 });
    }
    for (let z = -14; z <= 14; z += 3.5) {
      treePositions.push({ x: -20.5, z });
      treePositions.push({ x:  20.5, z });
    }

    const count = treePositions.length;
    const instTrunk = new THREE.InstancedMesh(trunkGeo, trunkMat, count);
    const instLeaves = new THREE.InstancedMesh(f1Geo, f1Mat, count);

    instTrunk.castShadow = true;
    instLeaves.castShadow = true;

    const dummy = new THREE.Object3D();

    treePositions.forEach((p, i) => {
      const s = 0.88 + Math.random() * 0.35;
      const rotY = Math.random() * Math.PI * 2;

      dummy.position.set(p.x, 0.24 * s, p.z);
      dummy.rotation.y = rotY;
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      instTrunk.setMatrixAt(i, dummy.matrix);

      dummy.position.set(p.x, 0.6 * s, p.z);
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      instLeaves.setMatrixAt(i, dummy.matrix);
    });

    instTrunk.instanceMatrix.needsUpdate = true;
    instLeaves.instanceMatrix.needsUpdate = true;

    this.scene.add(instTrunk);
    this.scene.add(instLeaves);
  },

  /* ── Performance Instanced Street Lamp Posts ──────────── */
  _createInstancedStreetLamps() {
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

    const count = lampPositions.length;
    const instPosts = new THREE.InstancedMesh(postGeo, postMat, count);
    const instBulbs = new THREE.InstancedMesh(bulbGeo, bulbMat, count);

    const dummy = new THREE.Object3D();

    lampPositions.forEach((p, i) => {
      dummy.position.set(p.x, 0.325, p.z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      instPosts.setMatrixAt(i, dummy.matrix);

      dummy.position.set(p.x, 0.67, p.z);
      dummy.updateMatrix();
      instBulbs.setMatrixAt(i, dummy.matrix);
    });

    instPosts.instanceMatrix.needsUpdate = true;
    instBulbs.instanceMatrix.needsUpdate = true;

    this.scene.add(instPosts);
    this.scene.add(instBulbs);
  },

  /* ── Interconnecting Glass Skywalk Bridge ─────────────── */
  _createSkywalkBridges() {
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

  /* ── Realistic Function-Based Building Assemblies ─────── */
  _createBuildings() {
    CampusData.buildings.forEach(b => {
      const group = new THREE.Group();

      if (b.id === 'ground') {
        this._createGroundBlock(group, b);
        group.position.set(b.x, 0, b.z);
        this.scene.add(group);
        return;
      }

      if (b.id === 'basketballCourt') {
        this._createBasketballCourtBlock(group, b);
        group.position.set(b.x, 0, b.z);
        this.scene.add(group);
        return;
      }

      let bodyColor, emissive, emissiveIntensity, accentColor;
      switch (b.id) {
        case 'ksBlock':
          bodyColor = 0x1E293B; emissive = 0x2563EB; emissiveIntensity = 0.08; accentColor = 0x06B6D4;
          break;
        case 'rvBlock':
          bodyColor = 0x312E81; emissive = 0x3B82F6; emissiveIntensity = 0.12; accentColor = 0x60A5FA;
          break;
        case 'jsBlock':
          bodyColor = 0x78350F; emissive = 0xD97706; emissiveIntensity = 0.25; accentColor = 0xF59E0B;
          break;
        case 'generatorRoom':
          bodyColor = 0xD97706; emissive = 0xB45309; emissiveIntensity = 0.20; accentColor = 0xFBBF24;
          break;
        case 'mechBlock':
          bodyColor = 0x334155; emissive = 0x475569; emissiveIntensity = 0.08; accentColor = 0xEAB308;
          break;
        case 'cafeteria':
          bodyColor = 0xC2410C; emissive = 0xEA580C; emissiveIntensity = 0.10; accentColor = 0x38BDF8;
          break;
        default:
          bodyColor = 0x1E293B; emissive = 0x2563EB; emissiveIntensity = 0.08; accentColor = 0x3B82F6;
          break;
      }

      // --- LAYER 0: Sub-surface Rainwater Cistern Reservoir ---
      const layerCistern = new THREE.Group();
      const tankGeo = new THREE.BoxGeometry(b.width * 0.85, 0.5, b.depth * 0.85);
      const tankMat = new THREE.MeshStandardMaterial({ color: 0x0284C7, transparent: true, opacity: 0.82, roughness: 0.2, metalness: 0.4 });
      const tankMesh = new THREE.Mesh(tankGeo, tankMat);
      tankMesh.position.y = -0.25;
      layerCistern.add(tankMesh);

      const fluidGeo = new THREE.BoxGeometry(b.width * 0.82, 0.35, b.depth * 0.82);
      const fluidMat = new THREE.MeshBasicMaterial({ color: 0x38BDF8, transparent: true, opacity: 0.9 });
      const fluidMesh = new THREE.Mesh(fluidGeo, fluidMat);
      fluidMesh.position.y = -0.3;
      layerCistern.add(fluidMesh);

      const pipeGeo = new THREE.CylinderGeometry(0.04, 0.04, b.width * 0.7);
      const pipeMat = new THREE.MeshStandardMaterial({ color: 0x94A3B8, metalness: 0.8 });
      const pipe = new THREE.Mesh(pipeGeo, pipeMat);
      pipe.rotation.z = Math.PI / 2;
      pipe.position.set(0, -0.05, 0);
      layerCistern.add(pipe);
      group.add(layerCistern);

      // --- LAYER 1: Ground Floor Podium & Interior Workstations ---
      const layerPodium = new THREE.Group();
      const podiumSlabGeo = new THREE.BoxGeometry(b.width, 0.1, b.depth);
      const podiumSlabMat = new THREE.MeshStandardMaterial({ color: 0xCBD5E1, roughness: 0.5 });
      const podiumSlab = new THREE.Mesh(podiumSlabGeo, podiumSlabMat);
      podiumSlab.position.y = 0.05;
      layerPodium.add(podiumSlab);

      for (let nx = -b.width * 0.3; nx <= b.width * 0.3; nx += 0.6) {
        for (let nz = -b.depth * 0.25; nz <= b.depth * 0.25; nz += 0.6) {
          const nodeGeo = new THREE.BoxGeometry(0.12, 0.15, 0.12);
          const nodeMat = new THREE.MeshStandardMaterial({ color: accentColor, emissive: accentColor, emissiveIntensity: 0.7 });
          const node = new THREE.Mesh(nodeGeo, nodeMat);
          node.position.set(nx, 0.18, nz);
          layerPodium.add(node);
        }
      }

      if (b.id === 'ksBlock') {
        const stepGeo = new THREE.BoxGeometry(b.width * 0.6, 0.1, 0.6);
        const stepMat = new THREE.MeshStandardMaterial({ color: 0xCBD5E1, roughness: 0.5 });
        const step = new THREE.Mesh(stepGeo, stepMat);
        step.position.set(0, 0.05, b.depth / 2 + 0.3);
        layerPodium.add(step);

        const atriumGeo = new THREE.BoxGeometry(b.width * 0.5, 0.6, 0.4);
        const atriumMat = new THREE.MeshStandardMaterial({ color: 0x93C5FD, transparent: true, opacity: 0.75, metalness: 0.5 });
        const atrium = new THREE.Mesh(atriumGeo, atriumMat);
        atrium.position.set(0, 0.3, b.depth / 2 + 0.2);
        layerPodium.add(atrium);
      }
      group.add(layerPodium);

      // --- LAYER 2: Middle Academic Floor & Main Body ---
      const layerMiddle = new THREE.Group();
      const mainGeo = new THREE.BoxGeometry(b.width, b.height * 0.6, b.depth);
      const mainMat = new THREE.MeshStandardMaterial({
        color: bodyColor, emissive: emissive, emissiveIntensity: emissiveIntensity, roughness: 0.3, metalness: 0.2,
      });
      const mainMesh = new THREE.Mesh(mainGeo, mainMat);
      mainMesh.position.y = b.height * 0.3 + 0.1;
      mainMesh.castShadow = true; mainMesh.receiveShadow = true;
      mainMesh.userData = { buildingId: b.id, buildingData: b };
      layerMiddle.add(mainMesh);

      const edges = new THREE.EdgesGeometry(mainGeo);
      const lineMat = new THREE.LineBasicMaterial({ color: accentColor, transparent: true, opacity: 0.6 });
      const wireframe = new THREE.LineSegments(edges, lineMat);
      wireframe.position.y = b.height * 0.3 + 0.1;
      layerMiddle.add(wireframe);

      const windowCount = Math.max(1, Math.floor(b.height / 0.6));
      for (let i = 0; i < windowCount; i++) {
        const wy = (i + 1) * ((b.height * 0.6) / (windowCount + 1));
        const windowGeo = new THREE.PlaneGeometry(b.width * 0.84, 0.08);
        const windowMat = new THREE.MeshBasicMaterial({ color: 0x93C5FD, transparent: true, opacity: 0.75 });
        const windowMesh = new THREE.Mesh(windowGeo, windowMat);
        windowMesh.position.set(0, wy, b.depth / 2 + 0.01);
        layerMiddle.add(windowMesh);
      }
      group.add(layerMiddle);

      // --- LAYER 3: Roof Deck, Solar Array & HVAC Assemblies ---
      const layerRoof = new THREE.Group();
      const roofGeo = new THREE.BoxGeometry(b.width * 0.9, 0.08, b.depth * 0.9);
      const roofMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.4 });
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.y = b.height + 0.04;
      roof.castShadow = true;
      layerRoof.add(roof);

      if (b.solarGeneration > 0) {
        const solarGeo = new THREE.PlaneGeometry(b.width * 0.6, b.depth * 0.5);
        const solarMat = new THREE.MeshStandardMaterial({ color: 0x1E3A8A, metalness: 0.8, roughness: 0.2 });
        const solar = new THREE.Mesh(solarGeo, solarMat);
        solar.rotation.x = -Math.PI / 2;
        solar.position.y = b.height + 0.09;
        layerRoof.add(solar);
      }

      if (b.id === 'ksBlock' || b.id === 'rvBlock' || b.id === 'jsBlock') {
        const chillerGeo = new THREE.BoxGeometry(0.3, 0.2, 0.3);
        const chillerMat = new THREE.MeshStandardMaterial({ color: 0x94A3B8, metalness: 0.8 });
        const chiller = new THREE.Mesh(chillerGeo, chillerMat);
        chiller.position.set(-b.width * 0.25, b.height + 0.18, 0);
        chiller.castShadow = true;
        layerRoof.add(chiller);
      }

      if (b.id === 'mechBlock') {
        const pitchedGeo = new THREE.ConeGeometry(b.width * 0.6, 0.4, 4);
        const pitchedMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.3 });
        const pitchedRoof = new THREE.Mesh(pitchedGeo, pitchedMat);
        pitchedRoof.rotation.y = Math.PI / 4;
        pitchedRoof.position.set(0, b.height + 0.2, 0);
        pitchedRoof.castShadow = true;
        layerRoof.add(pitchedRoof);
      }

      if (b.id === 'cafeteria') {
        const patioGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.12);
        const patioMat = new THREE.MeshStandardMaterial({ color: 0x0284C7 });
        const umbrellaGeo = new THREE.ConeGeometry(0.25, 0.15, 6);
        const umbrellaMat = new THREE.MeshStandardMaterial({ color: 0xE0F2FE });
        [{ x: -b.width / 2 - 0.3, z: 0 }, { x: b.width / 2 + 0.3, z: 0 }].forEach(p => {
          const t = new THREE.Mesh(patioGeo, patioMat); t.position.set(p.x, 0.06, p.z); layerRoof.add(t);
          const u = new THREE.Mesh(umbrellaGeo, umbrellaMat); u.position.set(p.x, 0.35, p.z); layerRoof.add(u);
        });
      }

      if (b.id === 'generatorRoom') {
        const coilGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.4);
        const coilMat = new THREE.MeshStandardMaterial({ color: 0xB45309, metalness: 0.9, roughness: 0.2 });
        const coil1 = new THREE.Mesh(coilGeo, coilMat); coil1.position.set(-0.4, 0.2, b.depth / 2 + 0.2); layerRoof.add(coil1);
        const coil2 = new THREE.Mesh(coilGeo, coilMat); coil2.position.set(0.4, 0.2, b.depth / 2 + 0.2); layerRoof.add(coil2);
      }
      group.add(layerRoof);

      // Translucent Exploded Blueprint Guide Lines
      const guideBoxGeo = new THREE.BoxGeometry(b.width * 1.02, b.height + 4.2, b.depth * 1.02);
      const guideEdges  = new THREE.EdgesGeometry(guideBoxGeo);
      const guideMat    = new THREE.LineDashedMaterial({ color: accentColor, dashSize: 0.1, gapSize: 0.05, transparent: true, opacity: 0 });
      const guideLines  = new THREE.LineSegments(guideEdges, guideMat);
      guideLines.computeLineDistances();
      guideLines.position.y = (b.height + 4.2) / 2 - 1.2;
      guideLines.visible = false;
      group.add(guideLines);

      group.position.set(b.x, 0, b.z);
      this.scene.add(group);

      this.buildings.push({
        group, mesh: mainMesh, mat: mainMat, lineMat,
        data: b,
        baseY: 0, targetY: 0, currentY: 0,
        expansionFactor: 0,
        guideLines: guideLines,
        layers: [
          { group: layerCistern, baseY: 0, expandY: -1.5 },
          { group: layerPodium,  baseY: 0, expandY: 0.2 },
          { group: layerMiddle,  baseY: 0, expandY: 1.3 },
          { group: layerRoof,    baseY: 0, expandY: 2.6 },
        ],
        baseEmissive: emissiveIntensity,
      });
    });
  },

  /* ── Ground Field Block + Sub-surface Cistern Expansion ─── */
  _createGroundBlock(group, b) {
    const layerCistern = new THREE.Group();
    const tankGeo = new THREE.BoxGeometry(b.width * 0.85, 0.5, b.depth * 0.85);
    const tankMat = new THREE.MeshStandardMaterial({ color: 0x0284C7, transparent: true, opacity: 0.85 });
    const tank = new THREE.Mesh(tankGeo, tankMat); tank.position.y = -0.25; layerCistern.add(tank);
    group.add(layerCistern);

    const layerSurface = new THREE.Group();
    const turfGeo = new THREE.BoxGeometry(b.width, b.height, b.depth);
    const turfMat = new THREE.MeshStandardMaterial({ color: 0x15803D, roughness: 0.85 });
    const turfMesh = new THREE.Mesh(turfGeo, turfMat);
    turfMesh.position.y = b.height / 2; turfMesh.receiveShadow = true; turfMesh.castShadow = true;
    turfMesh.userData = { buildingId: b.id, buildingData: b };
    layerSurface.add(turfMesh);

    const trackGeo = new THREE.PlaneGeometry(b.width + 0.6, b.depth + 0.6);
    const trackMat = new THREE.MeshStandardMaterial({ color: 0xB91C1C, roughness: 0.8 });
    const trackMesh = new THREE.Mesh(trackGeo, trackMat);
    trackMesh.rotation.x = -Math.PI / 2; trackMesh.position.y = 0.008;
    layerSurface.add(trackMesh);

    const lineGeo = new THREE.PlaneGeometry(b.width * 0.85, b.depth * 0.85);
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, wireframe: true, opacity: 0.7, transparent: true });
    const lines = new THREE.Mesh(lineGeo, lineMat); lines.rotation.x = -Math.PI / 2; lines.position.y = b.height + 0.002;
    layerSurface.add(lines);
    group.add(layerSurface);

    const layerSuper = new THREE.Group();
    const bleacherTier1 = new THREE.BoxGeometry(b.width * 0.9, 0.15, 0.3);
    const bleacherMat   = new THREE.MeshStandardMaterial({ color: 0x94A3B8 });
    const t1 = new THREE.Mesh(bleacherTier1, bleacherMat); t1.position.set(0, 0.075, -b.depth / 2 - 0.25); layerSuper.add(t1);

    const towerGeo = new THREE.CylinderGeometry(0.03, 0.04, 2.0);
    const towerMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 });
    const headGeo  = new THREE.BoxGeometry(0.35, 0.15, 0.08);
    const headMat  = new THREE.MeshBasicMaterial({ color: 0xFEF08A });
    [{ x: -b.width / 2 - 0.2, z: -b.depth / 2 - 0.2 }, { x: b.width / 2 + 0.2, z: -b.depth / 2 - 0.2 }].forEach(c => {
      const tower = new THREE.Mesh(towerGeo, towerMat); tower.position.set(c.x, 1.0, c.z); layerSuper.add(tower);
      const head = new THREE.Mesh(headGeo, headMat); head.position.set(c.x, 2.0, c.z); layerSuper.add(head);
    });
    group.add(layerSuper);

    this.buildings.push({
      group, mesh: turfMesh, mat: turfMat, lineMat: null,
      data: b, baseY: 0, targetY: 0, currentY: 0, expansionFactor: 0,
      layers: [
        { group: layerCistern, baseY: 0, expandY: -1.4 },
        { group: layerSurface, baseY: 0, expandY: 0.4 },
        { group: layerSuper,   baseY: 0, expandY: 1.8 },
      ],
      baseEmissive: 0,
    });
  },

  /* ── Basketball Court Block + Sub-surface Cistern Expansion ─ */
  _createBasketballCourtBlock(group, b) {
    const layerCistern = new THREE.Group();
    const tankGeo = new THREE.BoxGeometry(b.width * 0.85, 0.5, b.depth * 0.85);
    const tankMat = new THREE.MeshStandardMaterial({ color: 0x0284C7, transparent: true, opacity: 0.85 });
    const tank = new THREE.Mesh(tankGeo, tankMat); tank.position.y = -0.25; layerCistern.add(tank);
    group.add(layerCistern);

    const layerSurface = new THREE.Group();
    const courtGeo = new THREE.BoxGeometry(b.width, b.height, b.depth);
    const courtMat = new THREE.MeshStandardMaterial({ color: 0x1D4ED8, roughness: 0.4, metalness: 0.1 });
    const courtMesh = new THREE.Mesh(courtGeo, courtMat);
    courtMesh.position.y = b.height / 2; courtMesh.receiveShadow = true; courtMesh.castShadow = true;
    courtMesh.userData = { buildingId: b.id, buildingData: b };
    layerSurface.add(courtMesh);

    const apronGeo = new THREE.PlaneGeometry(b.width + 0.4, b.depth + 0.4);
    const apronMat = new THREE.MeshStandardMaterial({ color: 0x991B1B });
    const apron = new THREE.Mesh(apronGeo, apronMat); apron.rotation.x = -Math.PI / 2; apron.position.y = 0.008;
    layerSurface.add(apron);
    group.add(layerSurface);

    const layerSuper = new THREE.Group();
    const poleGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.9);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
    const boardGeo = new THREE.BoxGeometry(0.4, 0.28, 0.02);
    const boardMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });

    const pole1 = new THREE.Mesh(poleGeo, poleMat); pole1.position.set(-b.width / 2 + 0.2, 0.45, 0); layerSuper.add(pole1);
    const board1 = new THREE.Mesh(boardGeo, boardMat); board1.position.set(-b.width / 2 + 0.2, 0.75, 0); layerSuper.add(board1);
    const pole2 = new THREE.Mesh(poleGeo, poleMat); pole2.position.set(b.width / 2 - 0.2, 0.45, 0); layerSuper.add(pole2);
    const board2 = new THREE.Mesh(boardGeo, boardMat); board2.position.set(b.width / 2 - 0.2, 0.75, 0); layerSuper.add(board2);
    group.add(layerSuper);

    this.buildings.push({
      group, mesh: courtMesh, mat: courtMat, lineMat: null,
      data: b, baseY: 0, targetY: 0, currentY: 0, expansionFactor: 0,
      layers: [
        { group: layerCistern, baseY: 0, expandY: -1.4 },
        { group: layerSurface, baseY: 0, expandY: 0.4 },
        { group: layerSuper,   baseY: 0, expandY: 1.8 },
      ],
      baseEmissive: 0,
    });
  },

  /* ── Distance-Scaled Floating HTML Light Pill Labels ──── */
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
      const vecPos = new THREE.Vector3(b.data.x, b.currentY + labelOffset, b.data.z);
      
      const dist = this.camera.position.distanceTo(vecPos);
      const scale = THREE.MathUtils.clamp(28 / dist, 0.72, 1.15);
      const opacity = THREE.MathUtils.clamp(45 / dist, 0.35, 1.0);

      const projVec = vecPos.clone();
      projVec.project(this.camera);

      if (projVec.z > 1) { el.style.display = 'none'; return; }
      el.style.display = '';
      el.style.left = (projVec.x * halfW + halfW) + 'px';
      el.style.top  = (-projVec.y * halfH + halfH) + 'px';
      el.style.transform = `translate(-50%, -100%) scale(${scale})`;
      el.style.opacity = opacity;

      if (this.expandedBuildingId === b.data.id) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });
  },

  /* ── 3D Expansion View Activation & Camera Glide Focus ── */
  expandBuilding(building) {
    if (!building) return;
    this.expandedBuildingId = building.id;
    this.currentExpandedBuilding = building;

    this.targetTargetPos = new THREE.Vector3(building.x, 0.8, building.z);
    this.targetCamPos = new THREE.Vector3(building.x + 6.5, 5.5, building.z + 6.5);
    this.isCameraPanning = true;
    this.controls.autoRotate = false;

    const btn = document.getElementById('btn-toggle-expand');
    const txt = document.getElementById('expansion-btn-text');
    if (btn && txt) {
      btn.classList.add('active');
      txt.textContent = `💥 3D Exploded View: ${building.name} (Click to Reset)`;
    }
  },

  collapseCurrentExpansion() {
    this.expandedBuildingId = null;
    this.currentExpandedBuilding = null;

    this.targetTargetPos = new THREE.Vector3(0, 0, 0);
    this.targetCamPos = new THREE.Vector3(26, 20, 26);
    this.isCameraPanning = true;

    const btn = document.getElementById('btn-toggle-expand');
    const txt = document.getElementById('expansion-btn-text');
    if (btn && txt) {
      btn.classList.remove('active');
      txt.textContent = 'Click Block for 3D Floor Expansion View';
    }
  },

  toggleCurrentExpansion() {
    if (this.expandedBuildingId) {
      this.collapseCurrentExpansion();
    } else if (typeof App !== 'undefined' && App.currentBuilding) {
      this.expandBuilding(App.currentBuilding);
    } else {
      this.expandBuilding(CampusData.buildings[0]);
    }
  },

  focusBuilding(building) {
    this.expandBuilding(building);
  },

  _clearHoverState() {
    this.buildings.forEach(b => {
      b.targetY = 0;
      const el = document.getElementById('label-' + b.data.id);
      if (el) el.classList.remove('hovered');
    });
    this._hoveredBuilding = null;
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
      this.expandBuilding(bd);
      setTimeout(() => {
        if (typeof App !== 'undefined' && App.showBuilding) {
          App.showBuilding(bd);
        }
      }, 300);
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
          const el = document.getElementById('label-' + b.data.id);
          if (b.mesh === hoveredMesh) {
            b.targetY = 0.35;
            if (el) el.classList.add('hovered');
          } else {
            b.targetY = 0;
            if (el) el.classList.remove('hovered');
          }
        });
        this.container.style.cursor = 'pointer';
      } else {
        this._clearHoverState();
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

  /* ── Render Loop (Ease-in-out Smooth Transitions) ─────── */
  _animate() {
    this.animationId = requestAnimationFrame(this._animate.bind(this));

    const time = performance.now() * 0.001;

    if (this.isCameraPanning && this.targetCamPos && this.targetTargetPos) {
      this.camera.position.lerp(this.targetCamPos, 0.08);
      this.controls.target.lerp(this.targetTargetPos, 0.08);
      if (this.camera.position.distanceTo(this.targetCamPos) < 0.2) {
        this.isCameraPanning = false;
      }
    }

    if (this.particles) {
      const pos = this.particles.geometry.attributes.position.array;
      for (let i = 0; i < pos.length; i += 3) {
        pos[i + 1] += Math.sin(time * 1.2 + i * 0.2) * 0.0025;
        if (pos[i + 1] > 9) pos[i + 1] = 0.5;
      }
      this.particles.geometry.attributes.position.needsUpdate = true;
    }

    this.buildings.forEach(b => {
      b.currentY += (b.targetY - b.currentY) * 0.12;
      b.group.position.y = b.currentY;

      const isExpanded = (this.expandedBuildingId === b.data.id);
      const targetExp = isExpanded ? 1.0 : 0.0;
      b.expansionFactor += (targetExp - b.expansionFactor) * 0.1;

      if (b.layers) {
        b.layers.forEach(l => {
          l.group.position.y = THREE.MathUtils.lerp(l.baseY, l.expandY, b.expansionFactor);
        });
      }

      if (b.guideLines) {
        b.guideLines.visible = (b.expansionFactor > 0.03);
        if (b.guideLines.material) {
          b.guideLines.material.opacity = b.expansionFactor * 0.65;
        }
      }
    });

    this.buildings.forEach(b => {
      if (b.data.status === 'alert' && b.mat && b.mat.emissiveIntensity !== undefined) {
        const pulse = (Math.sin(time * 3.0) + 1) / 2;
        b.mat.emissiveIntensity = b.baseEmissive + pulse * 0.25;
      }
    });

    this._updateLabels();

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  },
};
