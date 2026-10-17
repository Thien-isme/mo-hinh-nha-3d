/**
 * 3D House Model Generator - Thai Corrugated Metal Roof
 * Exact dimensions: Length 25.98m x Width 9.50m
 * Ground floor only, open unobstructed interior
 * 6 Column portals = 5 equal bays (5.196m per bay)
 */

class HouseModel {
  constructor(scene) {
    this.scene = scene;
    this.root = new THREE.Group();
    this.root.name = 'houseRoot';
    this.scene.add(this.root);

    // Groups for layer control
    this.roofGroup = new THREE.Group();
    this.roofGroup.name = 'roofGroup';

    this.wallsGroup = new THREE.Group();
    this.wallsGroup.name = 'wallsGroup';

    this.structureGroup = new THREE.Group();
    this.structureGroup.name = 'structureGroup';

    this.columnsGroup = new THREE.Group();
    this.columnsGroup.name = 'columnsGroup';

    this.interiorGroup = new THREE.Group();
    this.interiorGroup.name = 'interiorGroup';

    this.environmentGroup = new THREE.Group();
    this.environmentGroup.name = 'environmentGroup';

    this.lightsGroup = new THREE.Group();
    this.lightsGroup.name = 'lightsGroup';

    this.root.add(this.environmentGroup);
    this.root.add(this.columnsGroup);
    this.root.add(this.structureGroup);
    this.root.add(this.interiorGroup);
    this.root.add(this.wallsGroup);
    this.root.add(this.roofGroup);
    this.root.add(this.lightsGroup);

    // House Dimensions
    this.L = 25.98; // Length (m)
    this.W = 9.50;  // Width (m)
    this.halfL = this.L / 2; // 12.99m
    this.halfW = this.W / 2; // 4.75m
    this.bays = 5;
    this.bayLength = this.L / this.bays; // 5.196m
    this.colHeight = 4.20; // Height to eave / truss bottom chord
    this.ridgeHeight = 7.00; // Peak ridge of Thai gable roof
    this.eaveOverhangX = 0.65; // Side eave overhang
    this.eaveOverhangZ = 0.80; // Gable end overhang

    // State
    this.currentRoofColor = '#1d4872'; // Thai roof blue
    this.roofMaterials = [];
    this.interiorLightObjects = [];

    this.initMaterials();
    this.buildGroundAndFloor();
    this.buildColumns();
    this.buildTrussesAndPurlins();
    this.buildWalls();
    this.buildThaiRoof();
    this.buildInterior();

    // Shadow setup
    this.root.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }

  initMaterials() {
    // 1. Corrugated Roof Material
    this.roofDiffuseTex = TextureGenerator.createCorrugatedRoofTexture(this.currentRoofColor);
    this.roofDiffuseTex.repeat.set(12, 28);
    this.roofNormalTex = TextureGenerator.createCorrugatedRoofNormalMap();
    this.roofNormalTex.repeat.set(12, 28);

    this.roofMaterial = new THREE.MeshStandardMaterial({
      map: this.roofDiffuseTex,
      normalMap: this.roofNormalTex,
      normalScale: new THREE.Vector2(0.65, 0.65),
      roughness: 0.38,
      metalness: 0.55,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 1.0
    });
    this.roofMaterials.push(this.roofMaterial);

    // Ridge cap & fascia material
    this.trimMaterial = new THREE.MeshStandardMaterial({
      color: 0x163452,
      roughness: 0.4,
      metalness: 0.5
    });

    // 2. Floor Material
    this.floorTex = TextureGenerator.createFloorTexture();
    this.floorTex.repeat.set(6, 16);
    this.floorMaterial = new THREE.MeshStandardMaterial({
      map: this.floorTex,
      roughness: 0.35,
      metalness: 0.1
    });

    // 3. Wall Material
    this.wallTex = TextureGenerator.createWallTexture();
    this.wallTex.repeat.set(8, 4);
    this.wallMaterial = new THREE.MeshStandardMaterial({
      map: this.wallTex,
      roughness: 0.75,
      metalness: 0.05
    });

    // 4. Plinth tile (Chân tường)
    this.plinthTex = TextureGenerator.createPlinthTexture();
    this.plinthTex.repeat.set(12, 1);
    this.plinthMaterial = new THREE.MeshStandardMaterial({
      map: this.plinthTex,
      roughness: 0.6,
      metalness: 0.15
    });

    // 5. Structural Steel (Cột, Kèo, Xà gồ mạ kẽm)
    this.steelMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a5568, // Dark slate steel / concrete
      roughness: 0.45,
      metalness: 0.6
    });

    this.columnMaterial = new THREE.MeshStandardMaterial({
      color: 0xdddddd,
      roughness: 0.5,
      metalness: 0.1
    });

    this.purlinMaterial = new THREE.MeshStandardMaterial({
      color: 0x8a929a, // Galvanized purlin
      roughness: 0.4,
      metalness: 0.7
    });

    // 6. Glass & Window Frames
    this.glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x88ccee,
      transparent: true,
      opacity: 0.45,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.7,
      ior: 1.5
    });

    this.aluminumFrameMaterial = new THREE.MeshStandardMaterial({
      color: 0x22262a,
      roughness: 0.3,
      metalness: 0.8
    });

    // 7. Ground / Outside
    this.grassTex = TextureGenerator.createGrassTexture();
    this.grassTex.repeat.set(24, 24);
    this.grassMaterial = new THREE.MeshStandardMaterial({
      map: this.grassTex,
      roughness: 0.9,
      metalness: 0.02
    });

    this.pavementTex = TextureGenerator.createPavementTexture();
    this.pavementTex.repeat.set(12, 12);
    this.pavementMaterial = new THREE.MeshStandardMaterial({
      map: this.pavementTex,
      roughness: 0.7,
      metalness: 0.05
    });
  }

  buildGroundAndFloor() {
    // Outer grass lawn
    const lawnGeom = new THREE.PlaneGeometry(85, 75);
    const lawn = new THREE.Mesh(lawnGeom, this.grassMaterial);
    lawn.rotation.x = -Math.PI / 2;
    lawn.position.y = -0.05;
    this.environmentGroup.add(lawn);

    // Concrete pavement apron around house (vỉa hè quanh nhà)
    const apronW = this.W + 4.0;
    const apronL = this.L + 4.0;
    const apronGeom = new THREE.BoxGeometry(apronW, 0.12, apronL);
    const apron = new THREE.Mesh(apronGeom, this.pavementMaterial);
    apron.position.set(0, 0.06, 0);
    this.environmentGroup.add(apron);

    // Main House Floor Slab: 25.98m x 9.50m, raised 0.20m above ground
    const slabGeom = new THREE.BoxGeometry(this.W, 0.25, this.L);
    const slab = new THREE.Mesh(slabGeom, this.floorMaterial);
    slab.position.set(0, 0.125, 0);
    this.environmentGroup.add(slab);

    // Front Entrance Steps (Tam cấp mặt tiền ở Z = +halfL)
    const stepCount = 3;
    const stepW = 5.2; // Width of steps
    const stepDepth = 0.35;
    const stepHeight = 0.07;
    for (let i = 0; i < stepCount; i++) {
      const g = new THREE.BoxGeometry(stepW + i * 0.2, stepHeight, stepDepth * (stepCount - i));
      const m = new THREE.Mesh(g, this.pavementMaterial);
      m.position.set(0, (i + 0.5) * stepHeight, this.halfL + (stepCount - i) * stepDepth * 0.5);
      this.environmentGroup.add(m);
    }
  }

  // 6 Column Portal Lines along Length = 5 Bays
  buildColumns() {
    const colSize = 0.35; // 350mm x 350mm reinforced concrete / box columns
    const colGeom = new THREE.BoxGeometry(colSize, this.colHeight, colSize);

    // Footing pedestal (đài cột)
    const baseGeom = new THREE.BoxGeometry(colSize + 0.18, 0.35, colSize + 0.18);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x777e85, roughness: 0.6 });

    // The 6 column lines along Z:
    // from +halfL (Z = 12.99) to -halfL (Z = -12.99), step = bayLength = 5.196
    const colXLeft = -this.halfW + colSize / 2 + 0.05;
    const colXRight = this.halfW - colSize / 2 - 0.05;

    for (let i = 0; i <= this.bays; i++) {
      const zPos = this.halfL - i * this.bayLength;

      // Left Column
      const leftCol = new THREE.Mesh(colGeom, this.columnMaterial);
      leftCol.position.set(colXLeft, 0.25 + this.colHeight / 2, zPos);
      this.columnsGroup.add(leftCol);

      const leftBase = new THREE.Mesh(baseGeom, baseMat);
      leftBase.position.set(colXLeft, 0.25 + 0.175, zPos);
      this.columnsGroup.add(leftBase);

      // Right Column
      const rightCol = new THREE.Mesh(colGeom, this.columnMaterial);
      rightCol.position.set(colXRight, 0.25 + this.colHeight / 2, zPos);
      this.columnsGroup.add(rightCol);

      const rightBase = new THREE.Mesh(baseGeom, baseMat);
      rightBase.position.set(colXRight, 0.25 + 0.175, zPos);
      this.columnsGroup.add(rightBase);
    }
  }

  // Roof Trusses (Vì Kèo Thép Chữ A) & Purlins (Xà Gồ Mái)
  buildTrussesAndPurlins() {
    const spanW = this.W - 0.2; // Width between column tops
    const halfSpan = spanW / 2;
    const bottomChordY = 0.25 + this.colHeight; // 4.45m
    const ridgeY = this.ridgeHeight; // 7.00m
    const trussRise = ridgeY - bottomChordY; // ~2.55m
    const trussThickness = 0.14;

    // Eave tie beams along entire 25.98m length connecting the 6 columns
    const eaveBeamGeom = new THREE.BoxGeometry(0.25, 0.35, this.L);
    const leftBeam = new THREE.Mesh(eaveBeamGeom, this.steelMaterial);
    leftBeam.position.set(-this.halfW + 0.2, bottomChordY - 0.15, 0);
    this.structureGroup.add(leftBeam);

    const rightBeam = new THREE.Mesh(eaveBeamGeom, this.steelMaterial);
    rightBeam.position.set(this.halfW - 0.2, bottomChordY - 0.15, 0);
    this.structureGroup.add(rightBeam);

    // Build 6 Trusses at the 6 column positions
    for (let i = 0; i <= this.bays; i++) {
      const zPos = this.halfL - i * this.bayLength;
      const trussGroup = new THREE.Group();
      trussGroup.position.set(0, 0, zPos);

      // 1. Bottom Chord (Thanh giằng ngang dưới)
      const chordGeom = new THREE.BoxGeometry(spanW, 0.12, trussThickness);
      const chord = new THREE.Mesh(chordGeom, this.steelMaterial);
      chord.position.set(0, bottomChordY, 0);
      trussGroup.add(chord);

      // 2. Left and Right Rafters (Thanh kèo nghiêng dốc chữ A)
      const rafterLen = Math.sqrt(halfSpan * halfSpan + trussRise * trussRise);
      const rafterAngle = Math.atan2(trussRise, halfSpan);
      const rafterGeom = new THREE.BoxGeometry(rafterLen + 0.3, 0.14, trussThickness);

      const leftRafter = new THREE.Mesh(rafterGeom, this.steelMaterial);
      leftRafter.position.set(-halfSpan / 2, bottomChordY + trussRise / 2, 0);
      leftRafter.rotation.z = rafterAngle;
      trussGroup.add(leftRafter);

      const rightRafter = new THREE.Mesh(rafterGeom, this.steelMaterial);
      rightRafter.position.set(halfSpan / 2, bottomChordY + trussRise / 2, 0);
      rightRafter.rotation.z = -rafterAngle;
      trussGroup.add(rightRafter);

      // 3. King Post (Thanh chống đứng đỉnh)
      const kingPostGeom = new THREE.BoxGeometry(0.12, trussRise, trussThickness);
      const kingPost = new THREE.Mesh(kingPostGeom, this.steelMaterial);
      kingPost.position.set(0, bottomChordY + trussRise / 2, 0);
      trussGroup.add(kingPost);

      // 4. Web struts (Thanh giằng xiên chữ V)
      const strutCount = 2;
      for (let s = 1; s <= strutCount; s++) {
        const sx = (halfSpan / (strutCount + 1)) * s;
        const sy = bottomChordY + (trussRise / (strutCount + 1)) * (strutCount + 1 - s) * 0.45;
        const strutGeom = new THREE.BoxGeometry(0.08, sy - bottomChordY, trussThickness);
        
        // Left web
        const leftStrut = new THREE.Mesh(strutGeom, this.steelMaterial);
        leftStrut.position.set(-sx, bottomChordY + (sy - bottomChordY) / 2, 0);
        trussGroup.add(leftStrut);

        // Right web
        const rightStrut = new THREE.Mesh(strutGeom, this.steelMaterial);
        rightStrut.position.set(sx, bottomChordY + (sy - bottomChordY) / 2, 0);
        trussGroup.add(rightStrut);
      }

      this.structureGroup.add(trussGroup);
    }

    // Build Longitudinal Purlins (Xà Gồ Mái C-channel) running full 25.98m + overhangs
    const purlinTotalLen = this.L + this.eaveOverhangZ * 2;
    const purlinGeom = new THREE.BoxGeometry(0.08, 0.12, purlinTotalLen);
    const purlinLayers = 6; // 6 purlin lines per slope

    for (let p = 0; p <= purlinLayers; p++) {
      const t = p / purlinLayers; // 0 (eave) to 1 (ridge)
      const px = THREE.MathUtils.lerp(this.halfW + this.eaveOverhangX * 0.5, 0.2, t);
      const py = THREE.MathUtils.lerp(bottomChordY + 0.1, ridgeY - 0.05, t);

      // Left purlin
      const leftPurlin = new THREE.Mesh(purlinGeom, this.purlinMaterial);
      leftPurlin.position.set(-px, py, 0);
      this.structureGroup.add(leftPurlin);

      // Right purlin
      const rightPurlin = new THREE.Mesh(purlinGeom, this.purlinMaterial);
      rightPurlin.position.set(px, py, 0);
      this.structureGroup.add(rightPurlin);
    }

    // Ridge board purlin (Xà gồ nóc)
    const ridgePurlin = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.15, purlinTotalLen), this.purlinMaterial);
    ridgePurlin.position.set(0, ridgeY + 0.05, 0);
    this.structureGroup.add(ridgePurlin);
  }

  // Exterior Walls, Doors, Windows, and Thai Gable Front Pediment
  buildWalls() {
    const wallThick = 0.20;
    const wallH = this.colHeight; // 4.20m
    const plinthH = 0.65; // 0.65m plinth tiles

    // --- LEFT LONG WALL (X = -halfW) ---
    // Has 5 bays = 5 large windows between the 6 columns
    for (let i = 0; i < this.bays; i++) {
      const zCenter = this.halfL - (i + 0.5) * this.bayLength;
      this.buildSideBayWall(-this.halfW + wallThick / 2, zCenter, this.bayLength - 0.4, wallH, plinthH, true);
    }

    // --- RIGHT LONG WALL (X = +halfW) ---
    for (let i = 0; i < this.bays; i++) {
      const zCenter = this.halfL - (i + 0.5) * this.bayLength;
      this.buildSideBayWall(this.halfW - wallThick / 2, zCenter, this.bayLength - 0.4, wallH, plinthH, false);
    }

    // --- FRONT WALL (Z = +halfL) ---
    // Grand entrance door + front facade
    this.buildFrontFacade(wallThick, wallH, plinthH);

    // --- BACK WALL (Z = -halfL) ---
    this.buildBackFacade(wallThick, wallH, plinthH);
  }

  // Side Wall for each Bay with Centered 2-Panel Window
  buildSideBayWall(xPos, zPos, bayW, totalH, plinthH, isLeft) {
    const wallGroup = new THREE.Group();
    wallGroup.position.set(xPos, 0.25, zPos);

    // Lower plinth wall
    const plinthGeom = new THREE.BoxGeometry(0.20, plinthH, bayW);
    const plinthMesh = new THREE.Mesh(plinthGeom, this.plinthMaterial);
    plinthMesh.position.set(0, plinthH / 2, 0);
    wallGroup.add(plinthMesh);

    // Window dimensions
    const winW = 2.4;
    const winH = 1.6;
    const winSillY = 1.1; // Window sill height
    const winHeaderY = winSillY + winH; // 2.7m

    // Spandrel wall below window (from plinth to sill)
    const belowGeom = new THREE.BoxGeometry(0.20, winSillY - plinthH, bayW);
    const belowMesh = new THREE.Mesh(belowGeom, this.wallMaterial);
    belowMesh.position.set(0, plinthH + (winSillY - plinthH) / 2, 0);
    wallGroup.add(belowMesh);

    // Lintel wall above window (from header to roof beam)
    const aboveGeom = new THREE.BoxGeometry(0.20, totalH - winHeaderY, bayW);
    const aboveMesh = new THREE.Mesh(aboveGeom, this.wallMaterial);
    aboveMesh.position.set(0, winHeaderY + (totalH - winHeaderY) / 2, 0);
    wallGroup.add(aboveMesh);

    // Wall jambs on sides of window
    const jambW = (bayW - winW) / 2;
    if (jambW > 0.05) {
      const jambGeom = new THREE.BoxGeometry(0.20, winH, jambW);
      const leftJamb = new THREE.Mesh(jambGeom, this.wallMaterial);
      leftJamb.position.set(0, winSillY + winH / 2, -bayW / 2 + jambW / 2);
      wallGroup.add(leftJamb);

      const rightJamb = new THREE.Mesh(jambGeom, this.wallMaterial);
      rightJamb.position.set(0, winSillY + winH / 2, bayW / 2 - jambW / 2);
      wallGroup.add(rightJamb);
    }

    // Modern 2-panel Window with Dark Aluminum Frame & Glass
    const frameGeom = new THREE.BoxGeometry(0.08, winH, winW);
    const frame = new THREE.Mesh(frameGeom, this.aluminumFrameMaterial);
    frame.position.set(0, winSillY + winH / 2, 0);
    wallGroup.add(frame);

    const glassGeom = new THREE.BoxGeometry(0.02, winH - 0.1, winW - 0.1);
    const glass = new THREE.Mesh(glassGeom, this.glassMaterial);
    glass.position.set(0, winSillY + winH / 2, 0);
    wallGroup.add(glass);

    // Window Mullion in middle
    const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.09, winH, 0.06), this.aluminumFrameMaterial);
    mullion.position.set(0, winSillY + winH / 2, 0);
    wallGroup.add(mullion);

    this.wallsGroup.add(wallGroup);
  }

  // Front Facade: Main Entrance + Gable triangle (Đầu hồi Mái Thái)
  buildFrontFacade(wallThick, totalH, plinthH) {
    const frontGroup = new THREE.Group();
    frontGroup.position.set(0, 0.25, this.halfL - wallThick / 2);

    const fullW = this.W;
    const doorW = 4.2;
    const doorH = 2.9;

    // Plinth wall on left and right of door
    const sideW = (fullW - doorW) / 2;
    const plinthGeom = new THREE.BoxGeometry(sideW, plinthH, wallThick);
    
    const leftPlinth = new THREE.Mesh(plinthGeom, this.plinthMaterial);
    leftPlinth.position.set(-doorW / 2 - sideW / 2, plinthH / 2, 0);
    frontGroup.add(leftPlinth);

    const rightPlinth = new THREE.Mesh(plinthGeom, this.plinthMaterial);
    rightPlinth.position.set(doorW / 2 + sideW / 2, plinthH / 2, 0);
    frontGroup.add(rightPlinth);

    // Upper side walls
    const sideWallGeom = new THREE.BoxGeometry(sideW, totalH - plinthH, wallThick);
    const leftWall = new THREE.Mesh(sideWallGeom, this.wallMaterial);
    leftWall.position.set(-doorW / 2 - sideW / 2, plinthH + (totalH - plinthH) / 2, 0);
    frontGroup.add(leftWall);

    const rightWall = new THREE.Mesh(sideWallGeom, this.wallMaterial);
    rightWall.position.set(doorW / 2 + sideW / 2, plinthH + (totalH - plinthH) / 2, 0);
    frontGroup.add(rightWall);

    // Lintel above door
    const lintelGeom = new THREE.BoxGeometry(doorW, totalH - doorH, wallThick);
    const lintel = new THREE.Mesh(lintelGeom, this.wallMaterial);
    lintel.position.set(0, doorH + (totalH - doorH) / 2, 0);
    frontGroup.add(lintel);

    // Front Sliding / 4-Leaf Folding Glass Door
    const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(doorW, doorH, 0.08), this.aluminumFrameMaterial);
    doorFrame.position.set(0, doorH / 2, 0);
    frontGroup.add(doorFrame);

    const doorGlass = new THREE.Mesh(new THREE.BoxGeometry(doorW - 0.2, doorH - 0.2, 0.03), this.glassMaterial);
    doorGlass.position.set(0, doorH / 2, 0);
    frontGroup.add(doorGlass);

    // Door leaf divider frames (4 panels)
    for (let d = 1; d <= 3; d++) {
      const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.06, doorH, 0.09), this.aluminumFrameMaterial);
      mullion.position.set(-doorW / 2 + (doorW / 4) * d, doorH / 2, 0);
      frontGroup.add(mullion);
    }

    // Windows on left and right front
    const fWinW = 1.4, fWinH = 1.6;
    const fWinGeom = new THREE.BoxGeometry(fWinW, fWinH, 0.08);
    const fWinLeft = new THREE.Mesh(fWinGeom, this.aluminumFrameMaterial);
    fWinLeft.position.set(-doorW / 2 - sideW / 2, 1.1 + fWinH / 2, 0.02);
    frontGroup.add(fWinLeft);

    const fGlassLeft = new THREE.Mesh(new THREE.BoxGeometry(fWinW - 0.1, fWinH - 0.1, 0.02), this.glassMaterial);
    fGlassLeft.position.set(-doorW / 2 - sideW / 2, 1.1 + fWinH / 2, 0.02);
    frontGroup.add(fGlassLeft);

    const fWinRight = fWinLeft.clone();
    fWinRight.position.x = doorW / 2 + sideW / 2;
    frontGroup.add(fWinRight);

    const fGlassRight = fGlassLeft.clone();
    fGlassRight.position.x = doorW / 2 + sideW / 2;
    frontGroup.add(fGlassRight);

    // Gable Triangle Wall at Front (Tam giác đầu hồi mặt tiền)
    const gableShape = new THREE.Shape();
    gableShape.moveTo(-this.halfW, totalH);
    gableShape.lineTo(0, this.ridgeHeight - 0.25);
    gableShape.lineTo(this.halfW, totalH);
    gableShape.closePath();

    const extrudeSettings = { depth: wallThick, bevelEnabled: false };
    const gableGeom = new THREE.ExtrudeGeometry(gableShape, extrudeSettings);
    const gableMesh = new THREE.Mesh(gableGeom, this.wallMaterial);
    gableMesh.position.set(0, 0, -wallThick / 2);
    frontGroup.add(gableMesh);

    // Thai Gable Louver Vent / Decorative circular ornament
    const ventGeom = new THREE.CylinderGeometry(0.65, 0.65, 0.08, 32);
    ventGeom.rotateX(Math.PI / 2);
    const ventMesh = new THREE.Mesh(ventGeom, this.aluminumFrameMaterial);
    ventMesh.position.set(0, totalH + 1.25, 0.12);
    frontGroup.add(ventMesh);

    // Inner vent blades
    for (let b = -0.4; b <= 0.4; b += 0.2) {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.03, 0.05), this.steelMaterial);
      blade.position.set(0, totalH + 1.25 + b, 0.14);
      frontGroup.add(blade);
    }

    this.wallsGroup.add(frontGroup);
  }

  // Back Facade: Back door + gable wall
  buildBackFacade(wallThick, totalH, plinthH) {
    const backGroup = new THREE.Group();
    backGroup.position.set(0, 0.25, -this.halfL + wallThick / 2);

    // Solid wall with one standard back door
    const fullW = this.W;
    const doorW = 1.2;
    const doorH = 2.4;

    // Plinth
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(fullW, plinthH, wallThick), this.plinthMaterial);
    plinth.position.set(0, plinthH / 2, 0);
    backGroup.add(plinth);

    // Wall surrounding door
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(fullW - doorW - 2.0, totalH - plinthH, wallThick), this.wallMaterial);
    backWall.position.set(-1.0 - doorW / 2, plinthH + (totalH - plinthH) / 2, 0);
    backGroup.add(backWall);

    const backWall2 = new THREE.Mesh(new THREE.BoxGeometry(fullW - (fullW - doorW - 2.0) - doorW, totalH - plinthH, wallThick), this.wallMaterial);
    backWall2.position.set(doorW / 2 + 1.8, plinthH + (totalH - plinthH) / 2, 0);
    backGroup.add(backWall2);

    const backLintel = new THREE.Mesh(new THREE.BoxGeometry(doorW, totalH - doorH, wallThick), this.wallMaterial);
    backLintel.position.set(0, doorH + (totalH - doorH) / 2, 0);
    backGroup.add(backLintel);

    // Back steel security door
    const door = new THREE.Mesh(new THREE.BoxGeometry(doorW, doorH, 0.06), this.steelMaterial);
    door.position.set(0, doorH / 2, 0);
    backGroup.add(door);

    // Back Gable Triangle
    const gableShape = new THREE.Shape();
    gableShape.moveTo(-this.halfW, totalH);
    gableShape.lineTo(0, this.ridgeHeight - 0.25);
    gableShape.lineTo(this.halfW, totalH);
    gableShape.closePath();

    const gableGeom = new THREE.ExtrudeGeometry(gableShape, { depth: wallThick, bevelEnabled: false });
    const gableMesh = new THREE.Mesh(gableGeom, this.wallMaterial);
    gableMesh.position.set(0, 0, -wallThick / 2);
    backGroup.add(gableMesh);

    this.wallsGroup.add(backGroup);
  }

  // Thai Corrugated Metal Roof (Mái Thái Bằng Tôn)
  buildThaiRoof() {
    const bottomChordY = 0.25 + this.colHeight; // 4.45m
    const ridgeY = this.ridgeHeight + 0.15; // 7.15m
    const slopeRise = ridgeY - bottomChordY;
    const slopeRun = this.halfW + this.eaveOverhangX; // 4.75 + 0.65 = 5.40m
    const slopeLen = Math.sqrt(slopeRun * slopeRun + slopeRise * slopeRise); // ~5.98m
    const slopeAngle = Math.atan2(slopeRise, slopeRun);

    const totalRoofLen = this.L + this.eaveOverhangZ * 2; // 25.98 + 1.6 = 27.58m

    // --- 1. LEFT ROOF SHEET (Tôn dập sóng bên trái) ---
    const sheetGeom = new THREE.PlaneGeometry(slopeLen, totalRoofLen, 32, 64);
    
    const leftSheet = new THREE.Mesh(sheetGeom, this.roofMaterial);
    leftSheet.position.set(-slopeRun / 2, (bottomChordY + ridgeY) / 2, 0);
    leftSheet.rotation.y = -Math.PI / 2;
    leftSheet.rotation.x = -slopeAngle;
    this.roofGroup.add(leftSheet);

    // --- 2. RIGHT ROOF SHEET (Tôn dập sóng bên phải) ---
    const rightSheet = new THREE.Mesh(sheetGeom, this.roofMaterial);
    rightSheet.position.set(slopeRun / 2, (bottomChordY + ridgeY) / 2, 0);
    rightSheet.rotation.y = Math.PI / 2;
    rightSheet.rotation.x = -slopeAngle;
    this.roofGroup.add(rightSheet);

    // --- 3. RIDGE CAP (Tôn úp nóc chữ V mái Thái) ---
    const ridgeCapGeom = new THREE.ConeGeometry(0.35, totalRoofLen + 0.1, 4);
    ridgeCapGeom.rotateX(Math.PI / 2);
    ridgeCapGeom.rotateZ(Math.PI / 4);
    const ridgeCap = new THREE.Mesh(ridgeCapGeom, this.trimMaterial);
    ridgeCap.position.set(0, ridgeY + 0.08, 0);
    this.roofGroup.add(ridgeCap);

    // --- 4. THAI FASCIA / BARGEBOARDS (Diềm mái dốc chữ A 2 đầu hồi) ---
    const fasciaThick = 0.05;
    const fasciaWidth = 0.25;
    const fasciaGeom = new THREE.BoxGeometry(fasciaThick, fasciaWidth, slopeLen);

    // Front gable diềm mái
    const frontFasciaZ = this.halfL + this.eaveOverhangZ;
    const fLeftFascia = new THREE.Mesh(fasciaGeom, this.trimMaterial);
    fLeftFascia.position.set(-slopeRun / 2, (bottomChordY + ridgeY) / 2, frontFasciaZ);
    fLeftFascia.rotation.y = Math.PI / 2;
    fLeftFascia.rotation.x = slopeAngle;
    this.roofGroup.add(fLeftFascia);

    const fRightFascia = new THREE.Mesh(fasciaGeom, this.trimMaterial);
    fRightFascia.position.set(slopeRun / 2, (bottomChordY + ridgeY) / 2, frontFasciaZ);
    fRightFascia.rotation.y = -Math.PI / 2;
    fRightFascia.rotation.x = slopeAngle;
    this.roofGroup.add(fRightFascia);

    // Back gable diềm mái
    const backFasciaZ = -this.halfL - this.eaveOverhangZ;
    const bLeftFascia = new THREE.Mesh(fasciaGeom, this.trimMaterial);
    bLeftFascia.position.set(-slopeRun / 2, (bottomChordY + ridgeY) / 2, backFasciaZ);
    bLeftFascia.rotation.y = -Math.PI / 2;
    bLeftFascia.rotation.x = -slopeAngle;
    this.roofGroup.add(bLeftFascia);

    const bRightFascia = new THREE.Mesh(fasciaGeom, this.trimMaterial);
    bRightFascia.position.set(slopeRun / 2, (bottomChordY + ridgeY) / 2, backFasciaZ);
    bRightFascia.rotation.y = Math.PI / 2;
    bRightFascia.rotation.x = -slopeAngle;
    this.roofGroup.add(bRightFascia);

    // --- 5. GUTTERS (Máng xối tôn dọc 2 mép giọt nước) ---
    const gutterGeom = new THREE.BoxGeometry(0.18, 0.15, totalRoofLen);
    const leftGutter = new THREE.Mesh(gutterGeom, this.trimMaterial);
    leftGutter.position.set(-slopeRun - 0.05, bottomChordY - 0.05, 0);
    this.roofGroup.add(leftGutter);

    const rightGutter = new THREE.Mesh(gutterGeom, this.trimMaterial);
    rightGutter.position.set(slopeRun + 0.05, bottomChordY - 0.05, 0);
    this.roofGroup.add(rightGutter);

    // Downspouts (Ống thoát nước mưa ở 4 góc)
    const downspoutGeom = new THREE.CylinderGeometry(0.06, 0.06, bottomChordY, 16);
    const corners = [
      [-slopeRun - 0.05, this.halfL],
      [-slopeRun - 0.05, -this.halfL],
      [slopeRun + 0.05, this.halfL],
      [slopeRun + 0.05, -this.halfL]
    ];
    corners.forEach(([cx, cz]) => {
      const pipe = new THREE.Mesh(downspoutGeom, this.trimMaterial);
      pipe.position.set(cx, bottomChordY / 2, cz);
      this.roofGroup.add(pipe);
    });

    // --- 6. FRONT THAI PORCH CANOPY (Mái đón tiền sảnh giật cấp kiểu Mái Thái) ---
    // Giật cấp tạo nét Mái Thái sang trọng đặc trưng
    const porchW = 6.2;
    const porchHalfW = porchW / 2;
    const porchL = 2.4;
    const porchRidgeY = this.ridgeHeight - 0.8;
    const porchBaseY = bottomChordY + 0.4;
    const porchRise = porchRidgeY - porchBaseY;
    const porchSlopeLen = Math.sqrt(porchHalfW * porchHalfW + porchRise * porchRise);
    const porchAngle = Math.atan2(porchRise, porchHalfW);

    const porchSheetGeom = new THREE.PlaneGeometry(porchSlopeLen, porchL, 16, 16);

    const pLeft = new THREE.Mesh(porchSheetGeom, this.roofMaterial);
    pLeft.position.set(-porchHalfW / 2, (porchBaseY + porchRidgeY) / 2, this.halfL + porchL / 2);
    pLeft.rotation.y = -Math.PI / 2;
    pLeft.rotation.x = -porchAngle;
    this.roofGroup.add(pLeft);

    const pRight = new THREE.Mesh(porchSheetGeom, this.roofMaterial);
    pRight.position.set(porchHalfW / 2, (porchBaseY + porchRidgeY) / 2, this.halfL + porchL / 2);
    pRight.rotation.y = Math.PI / 2;
    pRight.rotation.x = -porchAngle;
    this.roofGroup.add(pRight);

    // Thai Finial / Chóp nhọn nóc Mái Thái
    const finialGeom = new THREE.ConeGeometry(0.12, 0.7, 16);
    const finial = new THREE.Mesh(finialGeom, new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8, roughness: 0.2 }));
    finial.position.set(0, ridgeY + 0.45, this.halfL + this.eaveOverhangZ - 0.1);
    this.roofGroup.add(finial);

    const backFinial = finial.clone();
    backFinial.position.z = -this.halfL - this.eaveOverhangZ + 0.1;
    this.roofGroup.add(backFinial);
  }

  // Inside Open Space (Tầng trệt hoàn toàn trống suốt)
  buildInterior() {
    // High-Bay Industrial Linear LED Lights hanging down from trusses in the 5 bays
    const lightGeom = new THREE.BoxGeometry(0.2, 0.08, 3.2);
    const emissiveMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xfff3d6,
      emissiveIntensity: 0.8,
      roughness: 0.2
    });

    const cableGeom = new THREE.CylinderGeometry(0.01, 0.01, 0.8, 8);
    const cableMat = new THREE.MeshBasicMaterial({ color: 0x333333 });

    for (let i = 0; i < this.bays; i++) {
      const zPos = this.halfL - (i + 0.5) * this.bayLength;

      // Two rows of lights (Left & Right inside unobstructed hall)
      [-2.2, 2.2].forEach(xPos => {
        const fixture = new THREE.Mesh(lightGeom, emissiveMat);
        fixture.position.set(xPos, 4.1, zPos);
        this.interiorGroup.add(fixture);

        // Hanging suspension cables
        [-1.2, 1.2].forEach(cableZ => {
          const cable = new THREE.Mesh(cableGeom, cableMat);
          cable.position.set(xPos, 4.5, zPos + cableZ);
          this.interiorGroup.add(cable);
        });

        // Spot/Point light for interior glow
        const light = new THREE.PointLight(0xfff1dc, 0.65, 12, 1.2);
        light.position.set(xPos, 3.9, zPos);
        this.lightsGroup.add(light);
        this.interiorLightObjects.push(light);
      });
    }
  }

  // Dynamic Roof Transparency (0.0 to 1.0)
  setRoofOpacity(val) {
    val = Math.max(0, Math.min(1, val));
    this.roofMaterials.forEach(mat => {
      mat.opacity = val;
      mat.transparent = val < 0.99;
      mat.needsUpdate = true;
    });
    this.trimMaterial.opacity = val;
    this.trimMaterial.transparent = val < 0.99;
  }

  // Change Roof Corrugated Metal Color
  setRoofColor(colorHex) {
    this.currentRoofColor = colorHex;
    const newTex = TextureGenerator.createCorrugatedRoofTexture(colorHex);
    newTex.repeat.set(12, 28);
    this.roofMaterial.map = newTex;
    this.roofMaterial.needsUpdate = true;

    // Darker shade for trims
    const c = new THREE.Color(colorHex).multiplyScalar(0.7);
    this.trimMaterial.color.set(c);
  }

  // Toggle Visibility of Individual Structural Layers
  toggleLayer(layerName, visible) {
    switch (layerName) {
      case 'roof':
        this.roofGroup.visible = visible;
        break;
      case 'walls':
        this.wallsGroup.visible = visible;
        break;
      case 'structure':
        this.structureGroup.visible = visible;
        break;
      case 'columns':
        this.columnsGroup.visible = visible;
        break;
      case 'interior':
        this.interiorGroup.visible = visible;
        break;
      case 'environment':
        this.environmentGroup.visible = visible;
        break;
      case 'lights':
        this.lightsGroup.visible = visible;
        break;
    }
  }

  // Day / Night Mode Lighting Adjustment
  setDayNight(isNight) {
    this.interiorLightObjects.forEach(light => {
      light.intensity = isNight ? 1.6 : 0.65;
    });
  }
}
