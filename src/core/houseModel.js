import * as THREE from 'three';
import { TextureGenerator } from './textures';

/**
 * 3D House Model Generator - Thai Corrugated Metal Roof
 * Dimensions: Length 25.98m x Width 9.50m
 * Ground floor only, unobstructed open interior
 * 6 Column portals = 5 equal bays (5.196m per bay)
 * Column specs: 20cm x 20cm, Height 3.80m
 * Site Planning: 4m side sidewalk, 12m front sidewalk with red curb & green roadways
 */

export class HouseModel {
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

    this.roadGroup = new THREE.Group();
    this.roadGroup.name = 'roadGroup';

    this.lightsGroup = new THREE.Group();
    this.lightsGroup.name = 'lightsGroup';

    this.doorsGroup = new THREE.Group();
    this.doorsGroup.name = 'doorsGroup';

    this.root.add(this.environmentGroup);
    this.root.add(this.roadGroup);
    this.root.add(this.columnsGroup);
    this.root.add(this.structureGroup);
    this.root.add(this.interiorGroup);
    this.root.add(this.wallsGroup);
    this.root.add(this.roofGroup);
    this.root.add(this.doorsGroup);
    this.root.add(this.lightsGroup);

    // Core Dimensions: Column 20cm x 20cm x 3m8
    this.L = 25.98; // Length (m)
    this.W = 9.50;  // Width (m)
    this.halfL = this.L / 2; // 12.99m
    this.halfW = this.W / 2; // 4.75m
    this.bays = 5;
    // Kích thước từng ô theo yêu cầu: từ ô này qua ô kia là 5.00m, ô còn lại là 5.98m (tổng 25.98m)
    this.bayLengths = [5.00, 5.00, 5.00, 5.00, 5.98];
    this.colZPositions = [
      this.halfL,          // +12.99m (Cột 1 - Mặt tiền)
      this.halfL - 5.00,   // +7.99m  (Cột 2)
      this.halfL - 10.00,  // +2.99m  (Cột 3)
      this.halfL - 15.00,  // -2.01m  (Cột 4)
      this.halfL - 20.00,  // -7.01m  (Cột 5)
      -this.halfL          // -12.99m (Cột 6 - Cuối nhà)
    ];
    this.floorY = 0.25; // Top of floor slab

    // User requested column specs: 20cm x 20cm x cao 3m8
    this.colSize = 0.20; // 20cm
    this.colHeight = 3.80; // 3.80m
    this.bottomChordY = this.floorY + this.colHeight; // 0.25 + 3.80 = 4.05m
    this.ridgeHeight = 6.60; // 4.05 + 2.55 = 6.60m

    // Roof overhangs - sát mép tường nhà theo yêu cầu người dùng
    this.eaveOverhangX = 0.05; // 0.05m (5cm) diềm mái sát mép tường bên
    this.eaveOverhangZ = 0.05; // 0.05m (5cm) diềm đầu hồi sát mép tường trước/sau
    this.eaveX = this.halfW + this.eaveOverhangX; // 4.80m (tường nhà tại 4.75m)

    // Structural elevations:
    this.purlinEaveY = 4.10;
    this.purlinRidgeY = 6.52;

    this.eaveY = 4.22;
    this.ridgeY = 6.65;

    this.roofZFront = this.halfL + this.eaveOverhangZ; // +13.04m (mặt tiền tại 12.99m)
    this.roofZBack = -this.halfL - this.eaveOverhangZ; // -13.04m (mặt sau tại -12.99m)

    // Sidewalk & Road Dimensions according to user sketch:
    // Side sidewalk: 4.00m from side wall to red curb (switched to -X side)
    this.sidewalkSideDist = 4.00;
    this.curbX = -this.halfW - this.sidewalkSideDist; // -4.75 - 4.00 = -8.75m

    // Front sidewalk: 12.00m from front wall to red curb
    this.sidewalkFrontDist = 12.00;
    this.curbZ = this.halfL + this.sidewalkFrontDist; // +12.99 + 12.00 = +24.99m

    // State
    this.currentRoofColor = '#0e0ea0'; // Màu tôn xanh #0e0ea0
    this.roofMaterials = [];
    this.interiorLightObjects = [];
    this.currentDoorType = 'type1'; // Default: Cửa kéo Đài Loan (Ảnh 1)
    this.doorOpenProgress = 0.0; // 0.0 = Đóng kín, 1.0 = Mở toang hoàn toàn
    this.animatedDoors = [];

    this.initMaterials();
    this.buildGroundAndFloor();
    this.buildSidewalkAndRoad();
    this.buildColumns();
    this.buildTrussesAndPurlins();
    this.buildWalls();
    this.buildThaiRoofFlawless();
    this.buildInterior();
    this.buildRestroom();
    this.setDoorType(this.currentDoorType);

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
    this.roofDiffuseTex.repeat.set(8, 28);
    this.roofNormalTex = TextureGenerator.createCorrugatedRoofNormalMap();
    this.roofNormalTex.repeat.set(8, 28);

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

    // Ridge cap & trim material
    this.trimMaterial = new THREE.MeshStandardMaterial({
      color: 0x0a0a70,
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

    // 5. Structural Steel
    this.steelMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a5568,
      roughness: 0.45,
      metalness: 0.6
    });

    this.columnMaterial = new THREE.MeshStandardMaterial({
      color: 0xdddddd,
      roughness: 0.5,
      metalness: 0.1
    });

    this.purlinMaterial = new THREE.MeshStandardMaterial({
      color: 0x8a929a,
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

    // 7. Ground / Grass
    this.grassTex = TextureGenerator.createGrassTexture();
    this.grassTex.repeat.set(24, 24);
    this.grassMaterial = new THREE.MeshStandardMaterial({
      map: this.grassTex,
      roughness: 0.9,
      metalness: 0.02
    });

    // 8. Sidewalk & Road Materials
    this.sidewalkTex = TextureGenerator.createSidewalkTileTexture();
    this.sidewalkTex.repeat.set(16, 24);
    this.sidewalkMaterial = new THREE.MeshStandardMaterial({
      map: this.sidewalkTex,
      roughness: 0.65,
      metalness: 0.05
    });

    // Red curb border (Mép viền đỏ)
    this.curbRedMaterial = new THREE.MeshStandardMaterial({
      color: 0xe53935, // Vibrant red
      roughness: 0.35,
      metalness: 0.1
    });

    // Asphalt road surface
    this.asphaltTex = TextureGenerator.createAsphaltTexture();
    this.asphaltTex.repeat.set(20, 20);
    this.asphaltMaterial = new THREE.MeshStandardMaterial({
      map: this.asphaltTex,
      roughness: 0.85,
      metalness: 0.1
    });

    // Green driveway markings / lanes (Phần xanh xe chạy)
    this.roadGreenMaterial = new THREE.MeshStandardMaterial({
      color: 0x43a047, // Vibrant green lane
      roughness: 0.55,
      metalness: 0.05
    });

    // Road yellow lane marking paint
    this.roadMarkingMaterial = new THREE.MeshStandardMaterial({
      color: 0xffeb3b,
      roughness: 0.35
    });

    this.roadWhiteMarkingMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5f5f5,
      roughness: 0.35
    });

    // 9. Door Materials for 2 Simulated Types (Cửa kéo Đài Loan & Cửa sắt 4 cánh)
    this.doorTex1 = TextureGenerator.createTaiwanAccordionDoorTexture('#efe8d8');
    this.doorTex1.wrapS = THREE.RepeatWrapping;
    this.doorTex1.wrapT = THREE.ClampToEdgeWrapping;
    this.doorTex1.repeat.set(2.0, 1.0);

    this.doorMatType1 = new THREE.MeshStandardMaterial({
      map: this.doorTex1,
      roughness: 0.38,
      metalness: 0.42,
      side: THREE.DoubleSide
    });

    this.doorTex2 = TextureGenerator.createModernIronGateTexture('#7a8982');
    this.doorTex2.wrapS = THREE.RepeatWrapping;
    this.doorTex2.wrapT = THREE.ClampToEdgeWrapping;
    this.doorTex2.repeat.set(1.0, 1.0);

    this.doorMatType2 = new THREE.MeshStandardMaterial({
      map: this.doorTex2,
      roughness: 0.42,
      metalness: 0.52,
      side: THREE.DoubleSide
    });

    this.brassMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.25,
      metalness: 0.85
    });

    this.stainlessMaterial = new THREE.MeshStandardMaterial({
      color: 0xe0e6eb,
      roughness: 0.2,
      metalness: 0.9
    });

    this.doorFrameType1Mat = new THREE.MeshStandardMaterial({
      color: 0xd6cfbf,
      roughness: 0.45,
      metalness: 0.35
    });

    this.doorFrameType2Mat = new THREE.MeshStandardMaterial({
      color: 0x58665f,
      roughness: 0.45,
      metalness: 0.55
    });
  }

  buildGroundAndFloor() {
    // Outer expansive landscape grass lawn
    const lawnGeom = new THREE.PlaneGeometry(120, 110);
    const lawn = new THREE.Mesh(lawnGeom, this.grassMaterial);
    lawn.rotation.x = -Math.PI / 2;
    lawn.position.y = -0.05;
    this.environmentGroup.add(lawn);

    // Main House Floor Slab: 25.98m x 9.50m x 0.25m
    const slabGeom = new THREE.BoxGeometry(this.W, this.floorY, this.L);
    const slab = new THREE.Mesh(slabGeom, this.floorMaterial);
    slab.position.set(0, this.floorY / 2, 0);
    this.environmentGroup.add(slab);

    // Front steps removed per user request (bỏ bậc tam cấp)
  }

  /**
   * BUILD SIDEWALK (VỈA HÈ), RED CURB (VIỀN ĐỎ), AND ROADWAY (ĐƯỜNG XE CHẠY)
   * Switched to -X side according to user request:
   * - 4m sidewalk along long side (-X wall to red curb)
   * - 12m sidewalk along front short side (+Z wall to red curb)
   * - Rounded corner at intersection (-8.75, +24.99)
   * - Red curb along the border line
   * - Asphalt roadway outside with 2 green branch lanes
   */
  buildSidewalkAndRoad() {
    const sidewalkHeight = 0.15; // Raised 15cm above roadway
    const curbW = 0.25; // 25cm curb stone
    const curbH = 0.18; // 18cm curb height

    const curbX = this.curbX; // -8.75m (4m on -X side)
    const curbZ = this.curbZ; // +24.99m (12m in front)
    const xOpposite = this.halfW + 2.0; // +6.75m (opposite 2m apron)
    const zBackMin = -this.halfL - 2.0; // -14.99m
    const cornerR = 3.50; // Corner radius

    // ==========================================
    // 1. VỈA HÈ (SIDEWALK EXTENDING TO RED CURB)
    // ==========================================
    const sidewalkShape = new THREE.Shape();
    // Start at back-opposite corner
    sidewalkShape.moveTo(xOpposite, zBackMin);
    // Back edge to side curb line X = curbX (-8.75m)
    sidewalkShape.lineTo(curbX, zBackMin);
    // Along 4m side walkway up to corner arc start
    sidewalkShape.lineTo(curbX, curbZ - cornerR);
    // Smooth 90° arc around corner: from (-8.75, 21.49) to (-5.25, 24.99)
    sidewalkShape.absarc(curbX + cornerR, curbZ - cornerR, cornerR, Math.PI, Math.PI / 2, true);
    // Along 12m front sidewalk across to xOpposite
    sidewalkShape.lineTo(xOpposite, curbZ);
    // Return along opposite side to start
    sidewalkShape.lineTo(xOpposite, zBackMin);

    const extrudeSettings = { depth: sidewalkHeight, bevelEnabled: false };
    const sidewalkGeom = new THREE.ExtrudeGeometry(sidewalkShape, extrudeSettings);
    sidewalkGeom.rotateX(Math.PI / 2);

    const sidewalkMesh = new THREE.Mesh(sidewalkGeom, this.sidewalkMaterial);
    sidewalkMesh.position.set(0, sidewalkHeight, 0);
    this.roadGroup.add(sidewalkMesh);

    // ==========================================
    // 2. MÉP VIỀN ĐỎ (RED CURB BORDER LINE)
    // ==========================================
    const curbGroup = new THREE.Group();

    // Side red curb: from zBackMin to curbZ - cornerR at X = curbX (-8.75m)
    const sideCurbLen = (curbZ - cornerR) - zBackMin;
    const sideCurbGeom = new THREE.BoxGeometry(curbW, curbH, sideCurbLen);
    const sideCurb = new THREE.Mesh(sideCurbLen > 0 ? sideCurbGeom : new THREE.BoxGeometry(curbW, curbH, 1), this.curbRedMaterial);
    sideCurb.position.set(curbX + curbW / 2, curbH / 2, (zBackMin + curbZ - cornerR) / 2);
    curbGroup.add(sideCurb);

    // Front red curb: from curbX + cornerR to xOpposite at Z = curbZ (+24.99m)
    const frontCurbLen = xOpposite - (curbX + cornerR);
    const frontCurbGeom = new THREE.BoxGeometry(frontCurbLen, curbH, curbW);
    const frontCurb = new THREE.Mesh(frontCurbLen > 0 ? frontCurbGeom : new THREE.BoxGeometry(1, curbH, curbW), this.curbRedMaterial);
    frontCurb.position.set(((curbX + cornerR) + xOpposite) / 2, curbH / 2, curbZ - curbW / 2);
    curbGroup.add(frontCurb);

    // Curved corner curb: arc segment around (curbX + cornerR, curbZ - cornerR)
    const arcSegments = 16;
    for (let i = 0; i < arcSegments; i++) {
      const a1 = Math.PI - (Math.PI / 2) * (i / arcSegments);
      const a2 = Math.PI - (Math.PI / 2) * ((i + 1) / arcSegments);
      const aMid = (a1 + a2) / 2;
      const arcLen = cornerR * (Math.PI / 2 / arcSegments);

      const cx = (curbX + cornerR) + (cornerR - curbW / 2) * Math.cos(aMid);
      const cz = (curbZ - cornerR) + (cornerR - curbW / 2) * Math.sin(aMid);

      const segmentGeom = new THREE.BoxGeometry(curbW, curbH, arcLen + 0.05);
      const segment = new THREE.Mesh(segmentGeom, this.curbRedMaterial);
      segment.position.set(cx, curbH / 2, cz);
      segment.rotation.y = -(Math.PI - aMid);
      curbGroup.add(segment);
    }

    this.roadGroup.add(curbGroup);

    // ==========================================
    // 3. ĐƯỜNG XE CHẠY (ASPHALT ROADWAY OUTSIDE)
    // ==========================================
    const roadWidth = 8.5; // 8.5m wide road
    const roadY = 0.01;

    // Main side road along 4m sidewalk: from X = curbX to curbX - roadWidth (-8.75 to -17.25)
    const sideRoadL = 58;
    const sideRoadGeom = new THREE.PlaneGeometry(roadWidth, sideRoadL);
    const sideRoad = new THREE.Mesh(sideRoadGeom, this.asphaltMaterial);
    sideRoad.rotation.x = -Math.PI / 2;
    sideRoad.position.set(curbX - roadWidth / 2, roadY, 5);
    this.roadGroup.add(sideRoad);

    // Main front road in front of 12m sidewalk: from Z = curbZ to curbZ + roadWidth
    const frontRoadW = 48;
    const frontRoadGeom = new THREE.PlaneGeometry(frontRoadW, roadWidth);
    const frontRoad = new THREE.Mesh(frontRoadGeom, this.asphaltMaterial);
    frontRoad.rotation.x = -Math.PI / 2;
    frontRoad.position.set(-2, roadY, curbZ + roadWidth / 2);
    this.roadGroup.add(frontRoad);

    // Corner junction connecting the two roadways
    const junctionGeom = new THREE.PlaneGeometry(roadWidth, roadWidth);
    const junction = new THREE.Mesh(junctionGeom, this.asphaltMaterial);
    junction.rotation.x = -Math.PI / 2;
    junction.position.set(curbX - roadWidth / 2, roadY, curbZ + roadWidth / 2);
    this.roadGroup.add(junction);

    // ==========================================
    // 4. PHẦN XANH (2 NHÁNH ĐƯỜNG XE CHẠY MÀU XANH)
    // ==========================================
    // Branch 1: Green roadway branch going West/left from 4m side sidewalk
    // Located at middle of house length (Z ≈ 0), extending outward along -X
    const greenBranch1W = 7.0; // 7m width
    const greenBranch1Len = 22.0; // Extends 22m outward
    const branch1X = curbX - roadWidth - greenBranch1Len / 2;

    const b1Geom = new THREE.PlaneGeometry(greenBranch1Len, greenBranch1W);
    const b1Road = new THREE.Mesh(b1Geom, this.asphaltMaterial);
    b1Road.rotation.x = -Math.PI / 2;
    b1Road.position.set(branch1X, roadY, 0);
    this.roadGroup.add(b1Road);

    // Distinct Green Center Lane Strip (Phần xanh xe chạy) matching sketch
    const gStrip1Geom = new THREE.PlaneGeometry(greenBranch1Len + roadWidth, 1.2);
    const gStrip1 = new THREE.Mesh(gStrip1Geom, this.roadGreenMaterial);
    gStrip1.rotation.x = -Math.PI / 2;
    gStrip1.position.set(curbX - (greenBranch1Len + roadWidth) / 2, roadY + 0.005, 0);
    this.roadGroup.add(gStrip1);

    // Green boundary stripes on the branch
    [-greenBranch1W / 2 + 0.2, greenBranch1W / 2 - 0.2].forEach(offZ => {
      const line = new THREE.Mesh(new THREE.PlaneGeometry(greenBranch1Len, 0.25), this.roadGreenMaterial);
      line.rotation.x = -Math.PI / 2;
      line.position.set(branch1X, roadY + 0.005, offZ);
      this.roadGroup.add(line);
    });

    // Branch 2: Green roadway branch going East/right from 12m front sidewalk
    // Located in front, extending outward along +Z
    const greenBranch2W = 7.5;
    const greenBranch2Len = 24.0;
    const branch2Z = curbZ + roadWidth + greenBranch2Len / 2;

    const b2Geom = new THREE.PlaneGeometry(greenBranch2W, greenBranch2Len);
    const b2Road = new THREE.Mesh(b2Geom, this.asphaltMaterial);
    b2Road.rotation.x = -Math.PI / 2;
    b2Road.position.set(-2.0, roadY, branch2Z);
    this.roadGroup.add(b2Road);

    // Distinct Green Center Lane Strip (Phần xanh xe chạy)
    const gStrip2Geom = new THREE.PlaneGeometry(1.2, greenBranch2Len + roadWidth);
    const gStrip2 = new THREE.Mesh(gStrip2Geom, this.roadGreenMaterial);
    gStrip2.rotation.x = -Math.PI / 2;
    gStrip2.position.set(-2.0, roadY + 0.005, curbZ + (greenBranch2Len + roadWidth) / 2);
    this.roadGroup.add(gStrip2);

    [-greenBranch2W / 2 + 0.2, greenBranch2W / 2 - 0.2].forEach(offX => {
      const line = new THREE.Mesh(new THREE.PlaneGeometry(0.25, greenBranch2Len), this.roadGreenMaterial);
      line.rotation.x = -Math.PI / 2;
      line.position.set(-2.0 + offX, roadY + 0.005, branch2Z);
      this.roadGroup.add(line);
    });

    // ==========================================
    // 5. ROAD MARKINGS (VẠCH KẺ ĐƯỜNG)
    // ==========================================
    // Dashed center yellow line along side road
    for (let z = -18; z <= 26; z += 4.5) {
      if (Math.abs(z) < 4.0) continue; // Intersection gap
      const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 2.5), this.roadMarkingMaterial);
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(curbX - roadWidth / 2, roadY + 0.006, z);
      this.roadGroup.add(stripe);
    }

    // Dashed center yellow line along front road
    for (let x = -16; x <= 12; x += 4.5) {
      if (Math.abs(x - (-2.0)) < 4.2) continue; // Intersection gap
      const stripe = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 0.2), this.roadMarkingMaterial);
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(x, roadY + 0.006, curbZ + roadWidth / 2);
      this.roadGroup.add(stripe);
    }

    // Pedestrian Zebra Crossing (Vạch người đi bộ qua đường)
    const zebraCount = 6;
    for (let k = 0; k < zebraCount; k++) {
      const bar = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 0.45), this.roadWhiteMarkingMaterial);
      bar.rotation.x = -Math.PI / 2;
      bar.position.set(curbX - roadWidth / 2, roadY + 0.007, 10.5 + k * 0.85);
      this.roadGroup.add(bar);
    }
  }

  // 6 Column Portal Lines along Length = 5 Bays
  // Cột thẳng lên luôn theo yêu cầu: Cột 20cm x 20cm thẳng tắp từ sàn lên đến sát mái, bỏ chân đế phình
  buildColumns() {
    const colSize = this.colSize; // 0.20m (20cm)
    const straightColH = 4.00; // 4.00m từ mặt sàn (Y=0.25m) lên thẳng mép mái tôn (Y=4.25m)
    // Tiết diện 20.6cm để che dầm dọc, tránh nhấp nháy z-fighting và giữ cột thẳng suốt
    const colGeom = new THREE.BoxGeometry(colSize + 0.006, straightColH, colSize + 0.006);

    const colXLeft = -this.halfW + colSize / 2; // -4.65m (mép ngoài tại -4.75m sát mép vỉa hè)
    const colXRight = this.halfW - colSize / 2; // +4.65m (mép ngoài tại +4.75m)

    for (let i = 0; i <= this.bays; i++) {
      const zPos = this.colZPositions[i];

      // Left Column (Hàng cột phía vỉa hè - thẳng tắp từ sàn lên sát mái)
      const leftCol = new THREE.Mesh(colGeom, this.columnMaterial);
      leftCol.position.set(colXLeft, this.floorY + straightColH / 2, zPos);
      this.columnsGroup.add(leftCol);

      // Right Column (Hàng cột phía đối diện vỉa hè - thẳng tắp từ sàn lên sát mái)
      const rightCol = new THREE.Mesh(colGeom, this.columnMaterial);
      rightCol.position.set(colXRight, this.floorY + straightColH / 2, zPos);
      this.columnsGroup.add(rightCol);
    }

    // =========================================================================
    // 2 CÂY CỘT ĐÔI MẶT TIỀN NẰM LIỀN SÁT NHAU (THEO NÉT VẼ XANH TRONG ẢNH NGƯỜI DÙNG)
    // - Vị trí: Ngay trục giữa mặt tiền (Z = +12.99m, đối xứng qua tâm X = 0)
    // - Quy cách mỗi cột: 20cm x 20cm, cao 3.80m (từ sàn Y=0.25m lên đến đáy vì kèo Y=4.05m)
    // - Nằm liền sát nhau: Cột trái từ X = -0.20m đến 0; Cột phải từ X = 0 đến +0.20m
    // - Khe tiếp giáp 2mm (hairline seam) để hiển thị rõ 2 thân cột 3D riêng biệt cạnh nhau
    // =========================================================================
    const twinColH = this.bottomChordY - this.floorY; // 4.05 - 0.25 = 3.80m
    const twinColGeom = new THREE.BoxGeometry(colSize, twinColH, colSize + 0.006);
    const frontColZ = this.halfL; // +12.99m

    // Cột trái (Tâm X = -0.101m)
    const leftTwinCol = new THREE.Mesh(twinColGeom, this.columnMaterial);
    leftTwinCol.name = 'frontTwinColLeft';
    leftTwinCol.position.set(-colSize / 2 - 0.001, this.floorY + twinColH / 2, frontColZ);
    this.columnsGroup.add(leftTwinCol);

    // Cột phải (Tâm X = +0.101m, nằm liền sát cột trái)
    const rightTwinCol = new THREE.Mesh(twinColGeom, this.columnMaterial);
    rightTwinCol.name = 'frontTwinColRight';
    rightTwinCol.position.set(colSize / 2 + 0.001, this.floorY + twinColH / 2, frontColZ);
    this.columnsGroup.add(rightTwinCol);
  }

  // Roof Trusses & Purlins (adjusted to 3.80m column height)
  buildTrussesAndPurlins() {
    const spanW = this.W - 0.2;
    const halfSpan = spanW / 2;
    const bottomChordY = this.bottomChordY; // 4.05m
    const ridgeY = this.ridgeHeight; // 6.60m
    const trussRise = ridgeY - bottomChordY; // 2.55m
    const trussThickness = 0.14;

    // Longitudinal eave tie beams connecting the 6 columns
    const eaveBeamGeom = new THREE.BoxGeometry(0.20, 0.30, this.L);
    const leftBeam = new THREE.Mesh(eaveBeamGeom, this.steelMaterial);
    leftBeam.position.set(-this.halfW + 0.10, bottomChordY - 0.15, 0);
    this.structureGroup.add(leftBeam);

    const rightBeam = new THREE.Mesh(eaveBeamGeom, this.steelMaterial);
    rightBeam.position.set(this.halfW - 0.10, bottomChordY - 0.15, 0);
    this.structureGroup.add(rightBeam);

    // 6 A-Frame Trusses at the 6 column positions
    for (let i = 0; i <= this.bays; i++) {
      const zPos = this.colZPositions[i];
      const trussGroup = new THREE.Group();
      trussGroup.position.set(0, 0, zPos);

      // Bottom chord
      const chordGeom = new THREE.BoxGeometry(spanW, 0.12, trussThickness);
      const chord = new THREE.Mesh(chordGeom, this.steelMaterial);
      chord.position.set(0, bottomChordY, 0);
      trussGroup.add(chord);

      // Left and right rafters
      const rafterLen = Math.sqrt(halfSpan * halfSpan + trussRise * trussRise);
      const rafterAngle = Math.atan2(trussRise, halfSpan);
      const rafterGeom = new THREE.BoxGeometry(rafterLen + 0.2, 0.14, trussThickness);

      const leftRafter = new THREE.Mesh(rafterGeom, this.steelMaterial);
      leftRafter.position.set(-halfSpan / 2, bottomChordY + trussRise / 2, 0);
      leftRafter.rotation.z = rafterAngle;
      trussGroup.add(leftRafter);

      const rightRafter = new THREE.Mesh(rafterGeom, this.steelMaterial);
      rightRafter.position.set(halfSpan / 2, bottomChordY + trussRise / 2, 0);
      rightRafter.rotation.z = -rafterAngle;
      trussGroup.add(rightRafter);

      // King post
      const kingPostGeom = new THREE.BoxGeometry(0.12, trussRise, trussThickness);
      const kingPost = new THREE.Mesh(kingPostGeom, this.steelMaterial);
      kingPost.position.set(0, bottomChordY + trussRise / 2, 0);
      trussGroup.add(kingPost);

      // Web struts (Các thanh chống đứng vì kèo nối liền từ thanh giằng đáy lên thẳng kèo nghiêng/mái)
      const strutCount = 2;
      for (let s = 1; s <= strutCount; s++) {
        const sx = (halfSpan / (strutCount + 1)) * s;
        // Chiều cao thanh chống đứng nối liền từ đáy vì kèo (bottomChordY) lên ngàm khít vào thanh cánh trên (kèo nghiêng/mái)
        const strutH = trussRise * (1 - sx / halfSpan) + 0.04;
        const strutGeom = new THREE.BoxGeometry(0.08, strutH, trussThickness);

        const leftStrut = new THREE.Mesh(strutGeom, this.steelMaterial);
        leftStrut.position.set(-sx, bottomChordY + strutH / 2, 0);
        trussGroup.add(leftStrut);

        const rightStrut = new THREE.Mesh(strutGeom, this.steelMaterial);
        rightStrut.position.set(sx, bottomChordY + strutH / 2, 0);
        trussGroup.add(rightStrut);
      }

      this.structureGroup.add(trussGroup);
    }

    // Longitudinal Purlins (Xà Gồ Mái C-channel) nằm gọn bên trong tường đầu hồi, không đâm xuyên ra ngoài
    const purlinTotalLen = this.L - 0.22; // 25.76m (bên trong 2 đầu hồi dày 0.20m)
    const purlinGeom = new THREE.BoxGeometry(0.08, 0.12, purlinTotalLen);
    const purlinLayers = 6;

    for (let p = 0; p <= purlinLayers; p++) {
      const t = p / purlinLayers; // 0 (eave) to 1 (ridge)
      const px = THREE.MathUtils.lerp(this.eaveX - 0.15, 0.25, t);
      const py = THREE.MathUtils.lerp(this.purlinEaveY, this.purlinRidgeY, t);

      // Left purlin
      const leftPurlin = new THREE.Mesh(purlinGeom, this.purlinMaterial);
      leftPurlin.position.set(-px, py, 0);
      this.structureGroup.add(leftPurlin);

      // Right purlin
      const rightPurlin = new THREE.Mesh(purlinGeom, this.purlinMaterial);
      rightPurlin.position.set(px, py, 0);
      this.structureGroup.add(rightPurlin);
    }

    // Top ridge purlin
    const ridgePurlin = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, purlinTotalLen), this.purlinMaterial);
    ridgePurlin.position.set(0, this.purlinRidgeY, 0);
    this.structureGroup.add(ridgePurlin);
  }

  // Exterior Walls, Doors, Windows (Height 3.80m)
  buildWalls() {
    const wallThick = 0.20;
    const wallH = this.colHeight; // 3.80m
    const plinthH = 0.50; // 0.50m plinth

    // --- PHÍA BÊN CÓ VỈA HÈ (-X): ĐỂ TRỐNG NGUYÊN Ô, CHỈ ĐỂ LẠI CÁC CỘT THEO YÊU CẦU ---
    // (Bên có vỉa hè không xây tường, để trống toàn bộ 5 ô nhịp thông thoáng, chỉ có 6 cây cột 20x20cm)

    // --- PHÍA BÊN KHÔNG CÓ VỈA HÈ (+X): VẼ TƯỜNG KÍN THEO YÊU CẦU ---
    const solidWallGroup = new THREE.Group();
    const solidWallX = this.halfW - wallThick / 2; // +4.65m
    solidWallGroup.position.set(solidWallX, this.floorY, 0);

    // Chân tường plinth
    const solidPlinth = new THREE.Mesh(
      new THREE.BoxGeometry(wallThick, plinthH, this.L),
      this.plinthMaterial
    );
    solidPlinth.position.set(0, plinthH / 2, 0);
    solidWallGroup.add(solidPlinth);

    // Thân tường xây kín suốt chiều dài 25.98m (không có cửa sổ)
    const solidMainWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallThick, wallH - plinthH, this.L),
      this.wallMaterial
    );
    solidMainWall.position.set(0, plinthH + (wallH - plinthH) / 2, 0);
    solidWallGroup.add(solidMainWall);

    this.wallsGroup.add(solidWallGroup);

    // --- PHÍA TRƯỚC: ĐỂ TRỐNG TOÀN BỘ THEO YÊU CẦU NGƯỜI DÙNG ---
    // (Mặt tiền để trống toàn bộ 9.50m giữa 2 cột góc, không xây tường, lộ vì kèo thép chữ A)

    // --- BACK WALL ---
    this.buildBackFacade(wallThick, wallH, plinthH);
  }

  buildSideBayWall(xPos, zPos, bayW, totalH, plinthH) {
    const wallGroup = new THREE.Group();
    wallGroup.position.set(xPos, this.floorY, zPos);

    // Lower plinth
    const plinthGeom = new THREE.BoxGeometry(0.20, plinthH, bayW);
    const plinthMesh = new THREE.Mesh(plinthGeom, this.plinthMaterial);
    plinthMesh.position.set(0, plinthH / 2, 0);
    wallGroup.add(plinthMesh);

    // Window dimensions (proportionate for 3.80m wall)
    const winW = 2.4;
    const winH = 1.4;
    const winSillY = 0.95;
    const winHeaderY = winSillY + winH; // 2.35m

    // Spandrel below window
    const belowGeom = new THREE.BoxGeometry(0.20, winSillY - plinthH, bayW);
    const belowMesh = new THREE.Mesh(belowGeom, this.wallMaterial);
    belowMesh.position.set(0, plinthH + (winSillY - plinthH) / 2, 0);
    wallGroup.add(belowMesh);

    // Lintel above window
    const aboveGeom = new THREE.BoxGeometry(0.20, totalH - winHeaderY, bayW);
    const aboveMesh = new THREE.Mesh(aboveGeom, this.wallMaterial);
    aboveMesh.position.set(0, winHeaderY + (totalH - winHeaderY) / 2, 0);
    wallGroup.add(aboveMesh);

    // Window side jambs
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

    // Các ô cửa sổ tạm thời để trống hoàn toàn theo yêu cầu người dùng (không lắp khung, kính)
    this.wallsGroup.add(wallGroup);
  }

  buildFrontFacade(wallThick, totalH, plinthH) {
    const frontGroup = new THREE.Group();
    frontGroup.position.set(0, this.floorY, this.halfL - wallThick / 2);

    const fullW = this.W;
    const doorW = 4.2;
    const doorH = 2.7;

    const sideW = (fullW - doorW) / 2;
    const plinthGeom = new THREE.BoxGeometry(sideW, plinthH, wallThick);

    const leftPlinth = new THREE.Mesh(plinthGeom, this.plinthMaterial);
    leftPlinth.position.set(-doorW / 2 - sideW / 2, plinthH / 2, 0);
    frontGroup.add(leftPlinth);

    const rightPlinth = new THREE.Mesh(plinthGeom, this.plinthMaterial);
    rightPlinth.position.set(doorW / 2 + sideW / 2, plinthH / 2, 0);
    frontGroup.add(rightPlinth);

    const sideWallGeom = new THREE.BoxGeometry(sideW, totalH - plinthH, wallThick);
    const leftWall = new THREE.Mesh(sideWallGeom, this.wallMaterial);
    leftWall.position.set(-doorW / 2 - sideW / 2, plinthH + (totalH - plinthH) / 2, 0);
    frontGroup.add(leftWall);

    const rightWall = new THREE.Mesh(sideWallGeom, this.wallMaterial);
    rightWall.position.set(doorW / 2 + sideW / 2, plinthH + (totalH - plinthH) / 2, 0);
    frontGroup.add(rightWall);

    const lintel = new THREE.Mesh(new THREE.BoxGeometry(doorW, totalH - doorH, wallThick), this.wallMaterial);
    lintel.position.set(0, doorH + (totalH - doorH) / 2, 0);
    frontGroup.add(lintel);

    // Cửa chính mặt tiền (4.2m x 2.7m) tạm thời để trống hoàn toàn theo yêu cầu người dùng

    // Front Gable Triangle
    const gableShape = new THREE.Shape();
    gableShape.moveTo(-this.halfW, totalH);
    gableShape.lineTo(0, this.ridgeHeight - this.floorY);
    gableShape.lineTo(this.halfW, totalH);
    gableShape.closePath();

    const gableGeom = new THREE.ExtrudeGeometry(gableShape, { depth: wallThick, bevelEnabled: false });
    const gableMesh = new THREE.Mesh(gableGeom, this.wallMaterial);
    gableMesh.position.set(0, 0, -wallThick / 2);
    frontGroup.add(gableMesh);

    // Decorative Thai Gable Louver Vent
    const ventGeom = new THREE.CylinderGeometry(0.55, 0.55, 0.08, 32);
    ventGeom.rotateX(Math.PI / 2);
    const ventMesh = new THREE.Mesh(ventGeom, this.aluminumFrameMaterial);
    ventMesh.position.set(0, totalH + 1.15, 0.12);
    frontGroup.add(ventMesh);

    for (let b = -0.35; b <= 0.35; b += 0.18) {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.03, 0.05), this.steelMaterial);
      blade.position.set(0, totalH + 1.15 + b, 0.14);
      frontGroup.add(blade);
    }

    this.wallsGroup.add(frontGroup);
  }

  buildBackFacade(wallThick, totalH, plinthH) {
    const backGroup = new THREE.Group();
    backGroup.position.set(0, this.floorY, -this.halfL + wallThick / 2);

    const doorW = 1.10; // Rộng 1.10m theo yêu cầu người dùng
    const doorH = 2.12; // Cao 2.12m theo yêu cầu người dùng

    // Tọa độ các mảng tường sau:
    // Nhà vệ sinh ở góc phải: X từ 3.35m đến 4.55m (tường nhà tại 4.75m)
    // Khoảng cách từ WC ra mép cửa: 0.60m -> mép cửa phải tại X = 3.35 - 0.60 = 2.75m
    // Mép cửa trái tại X = 2.75 - 1.10 = 1.65m (tâm cửa X = 2.20m)
    // Tường liền bên phải (bao trọn lưng nhà vệ sinh + khoảng 0.6m đến cửa): X từ 2.75m đến 4.75m (rộng 2.00m)
    // Tường liền bên trái (từ mép trái cửa đến hết góc nhà): X từ -4.75m đến 1.65m (rộng 6.40m)

    // 1. TƯỜNG LIỀN BÊN PHẢI (Che kín hoàn toàn lưng nhà vệ sinh + phần tường đệm)
    // Cột đố phải ở vị trí X từ 2.75m đến 2.95m (rộng 0.20m, cách vách WC 0.40m + cột 0.20m = đúng 0.60m đến mép cửa)
    const rightWallW = this.halfW - 2.95; // 4.75 - 2.95 = 1.80m
    const rightWallX = (2.95 + this.halfW) / 2; // 3.85m

    const rightPlinth = new THREE.Mesh(
      new THREE.BoxGeometry(rightWallW, plinthH, wallThick),
      this.plinthMaterial
    );
    rightPlinth.position.set(rightWallX, plinthH / 2, 0);
    backGroup.add(rightPlinth);

    const rightWallMesh = new THREE.Mesh(
      new THREE.BoxGeometry(rightWallW, totalH - plinthH, wallThick),
      this.wallMaterial
    );
    rightWallMesh.position.set(rightWallX, plinthH + (totalH - plinthH) / 2, 0);
    backGroup.add(rightWallMesh);

    // 2. TƯỜNG LIỀN BÊN TRÁI (Từ mép ngoài cột đố trái đến góc tường phía vỉa hè)
    // Cột đố trái ở vị trí X từ 1.45m đến 1.65m (rộng 0.20m)
    const leftWallW = 1.45 - (-this.halfW); // 1.45 - (-4.75) = 6.20m
    const leftWallX = (-this.halfW + 1.45) / 2; // -1.65m

    const leftPlinth = new THREE.Mesh(
      new THREE.BoxGeometry(leftWallW, plinthH, wallThick),
      this.plinthMaterial
    );
    leftPlinth.position.set(leftWallX, plinthH / 2, 0);
    backGroup.add(leftPlinth);

    const leftWallMesh = new THREE.Mesh(
      new THREE.BoxGeometry(leftWallW, totalH - plinthH, wallThick),
      this.wallMaterial
    );
    leftWallMesh.position.set(leftWallX, plinthH + (totalH - plinthH) / 2, 0);
    backGroup.add(leftWallMesh);

    // 3. HAI CÂY CỘT (TRỤ ĐỨNG) 20cm x 20cm VẼ THẲNG LÊN LUÔN TỚI ĐÀ MÁI (3.80m) THEO NÉT VẼ ẢNH 1
    const colThick = 0.20;
    const colDepth = 0.24; // Dày 24cm (nhô nhẹ 2cm mỗi bên so với tường để lộ rõ hình khối cây cột thẳng đứng)

    // Cột đố bên phải (ngay mép phải cửa, X từ 2.75m đến 2.95m, tâm X = 2.85m)
    const doorColRight = new THREE.Mesh(
      new THREE.BoxGeometry(colThick, totalH, colDepth),
      this.columnMaterial
    );
    doorColRight.position.set(2.85, totalH / 2, 0);
    backGroup.add(doorColRight);

    // Cột đố bên trái (ngay mép trái cửa, X từ 1.45m đến 1.65m, tâm X = 1.55m)
    const doorColLeft = new THREE.Mesh(
      new THREE.BoxGeometry(colThick, totalH, colDepth),
      this.columnMaterial
    );
    doorColLeft.position.set(1.55, totalH / 2, 0);
    backGroup.add(doorColLeft);

    // 4. LANH TÔ & TƯỜNG TRÊN CỬA (Giữa 2 cây cột, từ Y = 2.12m lên 3.80m)
    const lintelH = totalH - doorH; // 3.80 - 2.12 = 1.68m
    const lintelMesh = new THREE.Mesh(
      new THREE.BoxGeometry(doorW, lintelH, wallThick),
      this.wallMaterial
    );
    lintelMesh.position.set(2.20, doorH + lintelH / 2, 0);
    backGroup.add(lintelMesh);

    // 4. HỆ CỬA ĐI 1 CÁNH CAO CẤP (Rộng 1.10m x Cao 2.12m)
    const doorGroup = new THREE.Group();

    // Khung bao nhôm xingfa (dày 5.5cm)
    const frameThick = 0.055;
    const frameDepth = 0.12;

    const leftJamb = new THREE.Mesh(
      new THREE.BoxGeometry(frameThick, doorH, frameDepth),
      this.aluminumFrameMaterial
    );
    leftJamb.position.set(1.65 + frameThick / 2, doorH / 2, 0);
    doorGroup.add(leftJamb);

    const rightJamb = new THREE.Mesh(
      new THREE.BoxGeometry(frameThick, doorH, frameDepth),
      this.aluminumFrameMaterial
    );
    rightJamb.position.set(2.75 - frameThick / 2, doorH / 2, 0);
    doorGroup.add(rightJamb);

    const headJamb = new THREE.Mesh(
      new THREE.BoxGeometry(doorW, frameThick, frameDepth),
      this.aluminumFrameMaterial
    );
    headJamb.position.set(2.20, doorH - frameThick / 2, 0);
    doorGroup.add(headJamb);

    // Ngưỡng cửa mỏng
    const sill = new THREE.Mesh(
      new THREE.BoxGeometry(doorW, 0.02, 0.14),
      this.plinthMaterial
    );
    sill.position.set(2.20, 0.01, 0);
    doorGroup.add(sill);

    // Cánh cửa (hé mở góc 30 độ vào trong nhà)
    const leafW = doorW - frameThick * 2; // 0.99m
    const leafH = doorH - frameThick;     // 2.065m
    const leafThick = 0.045;

    const hingeX = 2.75 - frameThick; // 2.695m (bản lề phía góc WC)
    const leafPivot = new THREE.Group();
    leafPivot.position.set(hingeX, 0, 0);
    leafPivot.rotation.y = Math.PI / 6; // Mở 30 độ vào trong nhà

    // Đố đứng bản lề
    const hingeStile = new THREE.Mesh(
      new THREE.BoxGeometry(0.10, leafH, leafThick),
      this.aluminumFrameMaterial
    );
    hingeStile.position.set(-0.05, leafH / 2, 0);
    leafPivot.add(hingeStile);

    // Đố đứng khóa
    const lockStile = new THREE.Mesh(
      new THREE.BoxGeometry(0.10, leafH, leafThick),
      this.aluminumFrameMaterial
    );
    lockStile.position.set(-leafW + 0.05, leafH / 2, 0);
    leafPivot.add(lockStile);

    // Đố ngang trên
    const topRail = new THREE.Mesh(
      new THREE.BoxGeometry(leafW - 0.20, 0.10, leafThick),
      this.aluminumFrameMaterial
    );
    topRail.position.set(-leafW / 2, leafH - 0.05, 0);
    leafPivot.add(topRail);

    // Đố ngang dưới
    const bottomRail = new THREE.Mesh(
      new THREE.BoxGeometry(leafW - 0.20, 0.22, leafThick),
      this.aluminumFrameMaterial
    );
    bottomRail.position.set(-leafW / 2, 0.11, 0);
    leafPivot.add(bottomRail);

    // Kính an toàn lấy sáng ở giữa
    const glassPanel = new THREE.Mesh(
      new THREE.BoxGeometry(leafW - 0.20, leafH - 0.32, 0.012),
      this.glassMaterial
    );
    glassPanel.position.set(-leafW / 2, 0.22 + (leafH - 0.32) / 2, 0);
    leafPivot.add(glassPanel);

    // Tay nắm gạt inox SUS304
    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xd0d5dd,
      roughness: 0.15,
      metalness: 0.95
    });
    const handlePlate = new THREE.Mesh(
      new THREE.BoxGeometry(0.035, 0.24, leafThick + 0.015),
      chromeMat
    );
    handlePlate.position.set(-leafW + 0.06, 1.0, 0);
    leafPivot.add(handlePlate);

    const handleLever1 = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.02, 0.05),
      chromeMat
    );
    handleLever1.position.set(-leafW + 0.10, 1.02, leafThick / 2 + 0.025);
    leafPivot.add(handleLever1);

    const handleLever2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.02, 0.05),
      chromeMat
    );
    handleLever2.position.set(-leafW + 0.10, 1.02, -leafThick / 2 - 0.025);
    leafPivot.add(handleLever2);

    doorGroup.add(leafPivot);
    backGroup.add(doorGroup);

    // 5. Back Gable Triangle (Đầu hồi tam giác phía sau)
    const gableShape = new THREE.Shape();
    gableShape.moveTo(-this.halfW, totalH);
    gableShape.lineTo(0, this.ridgeHeight - this.floorY);
    gableShape.lineTo(this.halfW, totalH);
    gableShape.closePath();

    const gableGeom = new THREE.ExtrudeGeometry(gableShape, { depth: wallThick, bevelEnabled: false });
    const gableMesh = new THREE.Mesh(gableGeom, this.wallMaterial);
    gableMesh.position.set(0, 0, -wallThick / 2);
    backGroup.add(gableMesh);

    this.wallsGroup.add(backGroup);
  }

  /**
   * BUILD THAI CORRUGATED METAL ROOF FLAWLESSLY
   * 100% exact 3D coordinates, covers purlins, zero protruding bars
   */
  buildThaiRoofFlawless() {
    const zStart = this.roofZBack;  // -13.74m
    const zEnd = this.roofZFront;   // +13.74m
    const eaveX = this.eaveX;       // 5.40m
    const eaveY = this.eaveY;       // 3.88m
    const ridgeY = this.ridgeY;     // 6.65m
    const ridgeX = 0.0;

    const createSlopedPlane = (pTL, pTR, pBL, pBR, uRepeat, vRepeat) => {
      const geom = new THREE.BufferGeometry();
      const positions = new Float32Array([
        pTL.x, pTL.y, pTL.z,
        pBL.x, pBL.y, pBL.z,
        pTR.x, pTR.y, pTR.z,

        pTR.x, pTR.y, pTR.z,
        pBL.x, pBL.y, pBL.z,
        pBR.x, pBR.y, pBR.z
      ]);

      const uvs = new Float32Array([
        0, vRepeat,
        0, 0,
        uRepeat, vRepeat,

        uRepeat, vRepeat,
        0, 0,
        uRepeat, 0
      ]);

      geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
      geom.computeVertexNormals();

      return new THREE.Mesh(geom, this.roofMaterial);
    };

    // 1. LEFT ROOF SLOPE
    const leftTL = new THREE.Vector3(-eaveX, eaveY, zStart);
    const leftTR = new THREE.Vector3(ridgeX, ridgeY, zStart);
    const leftBL = new THREE.Vector3(-eaveX, eaveY, zEnd);
    const leftBR = new THREE.Vector3(ridgeX, ridgeY, zEnd);
    const leftRoof = createSlopedPlane(leftTL, leftTR, leftBL, leftBR, 8, 28);
    this.roofGroup.add(leftRoof);

    // 2. RIGHT ROOF SLOPE
    const rightTL = new THREE.Vector3(ridgeX, ridgeY, zStart);
    const rightTR = new THREE.Vector3(eaveX, eaveY, zStart);
    const rightBL = new THREE.Vector3(ridgeX, ridgeY, zEnd);
    const rightBR = new THREE.Vector3(eaveX, eaveY, zEnd);
    const rightRoof = createSlopedPlane(rightTL, rightTR, rightBL, rightBR, 8, 28);
    this.roofGroup.add(rightRoof);

    // 3. RIDGE CAP (Tôn úp nóc chữ V)
    const ridgeCapGroup = new THREE.Group();
    const ridgeCapW = 0.35;
    const ridgeCapYDrop = 0.18;

    const rCapLeftTL = new THREE.Vector3(-ridgeCapW, ridgeY - ridgeCapYDrop, zStart - 0.05);
    const rCapLeftTR = new THREE.Vector3(0, ridgeY + 0.06, zStart - 0.05);
    const rCapLeftBL = new THREE.Vector3(-ridgeCapW, ridgeY - ridgeCapYDrop, zEnd + 0.05);
    const rCapLeftBR = new THREE.Vector3(0, ridgeY + 0.06, zEnd + 0.05);
    const rCapLeft = createSlopedPlane(rCapLeftTL, rCapLeftTR, rCapLeftBL, rCapLeftBR, 1, 1);
    rCapLeft.material = this.trimMaterial;
    ridgeCapGroup.add(rCapLeft);

    const rCapRightTL = new THREE.Vector3(0, ridgeY + 0.06, zStart - 0.05);
    const rCapRightTR = new THREE.Vector3(ridgeCapW, ridgeY - ridgeCapYDrop, zStart - 0.05);
    const rCapRightBL = new THREE.Vector3(0, ridgeY + 0.06, zEnd + 0.05);
    const rCapRightBR = new THREE.Vector3(ridgeCapW, ridgeY - ridgeCapYDrop, zEnd + 0.05);
    const rCapRight = createSlopedPlane(rCapRightTL, rCapRightTR, rCapRightBL, rCapRightBR, 1, 1);
    rCapRight.material = this.trimMaterial;
    ridgeCapGroup.add(rCapRight);

    this.roofGroup.add(ridgeCapGroup);

    // 4. DIỀM MÁI TÔN SÁT TƯỜNG (Bỏ máng xối nhô ra & bỏ 4 cột/ống thoát nước đứng - chỉ để tôn sát mép nhà)
    const fasciaTotalLen = zEnd - zStart;
    const fasciaGeom = new THREE.BoxGeometry(0.03, 0.08, fasciaTotalLen);

    const leftFascia = new THREE.Mesh(fasciaGeom, this.trimMaterial);
    leftFascia.position.set(-eaveX, eaveY - 0.02, 0);
    this.roofGroup.add(leftFascia);

    const rightFascia = new THREE.Mesh(fasciaGeom, this.trimMaterial);
    rightFascia.position.set(eaveX, eaveY - 0.02, 0);
    this.roofGroup.add(rightFascia);

    // 5. THAI FINIALS (Chóp nhọn nóc Mái Thái ở 2 đầu hồi chính)
    const finialGeom = new THREE.ConeGeometry(0.12, 0.65, 16);
    const finialMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8, roughness: 0.2 });

    const frontFinial = new THREE.Mesh(finialGeom, finialMat);
    frontFinial.position.set(0, ridgeY + 0.35, zEnd - 0.05);
    this.roofGroup.add(frontFinial);

    const backFinial = new THREE.Mesh(finialGeom, finialMat);
    backFinial.position.set(0, ridgeY + 0.35, zStart + 0.05);
    this.roofGroup.add(backFinial);
  }

  // Inside Open Space - Trống suốt, đã gỡ toàn bộ bóng đèn trần theo yêu cầu
  buildInterior() {
    // Đã gỡ bỏ toàn bộ các bóng đèn và dây treo trần trong nhà theo yêu cầu
    // Giữ ánh sáng khuếch tán nội thất tự nhiên để không gian bên trong vẫn sáng rõ
    const interiorAmbient = new THREE.AmbientLight(0xfff6ec, 0.55);
    this.lightsGroup.add(interiorAmbient);
    this.interiorAmbientLight = interiorAmbient;
  }

  // Nhà Vệ Sinh trong nhà: 1.20m x 1.40m từ phía đối diện vỉa hè vẽ vào 1.2m
  buildRestroom() {
    const wcGroup = new THREE.Group();
    wcGroup.name = 'restroomGroup';

    const wcW = 1.20; // 1.20m vẽ vào từ tường đối diện vỉa hè
    const wcL = 1.40; // 1.40m chiều dài dọc nhà
    const wcH = 2.40; // 2.40m chiều cao
    const wallThick = 0.08; // Vách ngăn 8cm

    // Inner coordinates:
    const xWallInner = this.halfW - 0.20; // 4.55m
    const xWcInner = xWallInner - wcW;     // 3.35m
    const xWcCenter = (xWallInner + xWcInner) / 2; // 3.95m

    const zBackInner = -this.halfL + 0.20; // -12.79m
    const zWcFront = zBackInner + wcL;     // -11.39m
    const zWcCenter = (zBackInner + zWcFront) / 2; // -12.09m

    const floorY = this.floorY; // 0.25m

    // Materials
    const wcWallMat = new THREE.MeshStandardMaterial({
      color: 0xf2f4f7,
      roughness: 0.5,
      metalness: 0.05
    });

    const wcTileMat = new THREE.MeshStandardMaterial({
      color: 0xdce2e6,
      roughness: 0.35,
      metalness: 0.1
    });

    const porcelainMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.2,
      metalness: 0.05
    });

    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      roughness: 0.15,
      metalness: 0.9
    });

    const doorMat = new THREE.MeshStandardMaterial({
      color: 0xd8dde3,
      roughness: 0.45,
      metalness: 0.15
    });

    // 1. Floor tile
    const floorTile = new THREE.Mesh(new THREE.BoxGeometry(wcW, 0.02, wcL), wcTileMat);
    floorTile.position.set(xWcCenter, floorY + 0.01, zWcCenter);
    wcGroup.add(floorTile);

    // 2. Left Partition Wall (Facing Open Interior at X = xWcInner)
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(wallThick, wcH, wcL), wcWallMat);
    leftWall.position.set(xWcInner + wallThick / 2, floorY + wcH / 2, zWcCenter);
    wcGroup.add(leftWall);

    // 3. Front Partition Wall with Door (At Z = zWcFront)
    const doorW = 0.70;
    const doorH = 2.05;
    const sidePartW = wcW - doorW; // 0.50m

    if (sidePartW > 0.05) {
      const pWall = new THREE.Mesh(new THREE.BoxGeometry(sidePartW, wcH, wallThick), wcWallMat);
      pWall.position.set(xWallInner - sidePartW / 2, floorY + wcH / 2, zWcFront - wallThick / 2);
      wcGroup.add(pWall);
    }

    // Lintel above door
    const lintelH = wcH - doorH;
    if (lintelH > 0.05) {
      const lintel = new THREE.Mesh(new THREE.BoxGeometry(doorW, lintelH, wallThick), wcWallMat);
      lintel.position.set(xWcInner + doorW / 2, floorY + doorH + lintelH / 2, zWcFront - wallThick / 2);
      wcGroup.add(lintel);
    }

    // Door Panel (hé mở 35 độ để quan sát được thiết bị bên trong)
    const door = new THREE.Mesh(new THREE.BoxGeometry(doorW, doorH, 0.035), doorMat);
    door.position.set(xWcInner + doorW / 2 + 0.12, floorY + doorH / 2, zWcFront + 0.12);
    door.rotation.y = -Math.PI / 5;
    wcGroup.add(door);

    // Handle
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.12, 12), chromeMat);
    handle.rotation.z = Math.PI / 2;
    handle.position.set(xWcInner + doorW / 2 + 0.32, floorY + 1.0, zWcFront + 0.20);
    wcGroup.add(handle);

    // 4. Ceiling
    const ceiling = new THREE.Mesh(new THREE.BoxGeometry(wcW + wallThick, 0.05, wcL + wallThick), wcWallMat);
    ceiling.position.set(xWcCenter, floorY + wcH + 0.025, zWcCenter);
    wcGroup.add(ceiling);

    // 5. Toilet (Bồn cầu sứ trắng)
    const toiletBase = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.40, 0.52), porcelainMat);
    toiletBase.position.set(xWcCenter + 0.15, floorY + 0.20, zBackInner + 0.42);
    wcGroup.add(toiletBase);

    const toiletTank = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.38, 0.16), porcelainMat);
    toiletTank.position.set(xWcCenter + 0.15, floorY + 0.40 + 0.19, zBackInner + 0.10);
    wcGroup.add(toiletTank);

    const flushBtn = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.01, 16), chromeMat);
    flushBtn.position.set(xWcCenter + 0.15, floorY + 0.40 + 0.38 + 0.005, zBackInner + 0.10);
    wcGroup.add(flushBtn);

    // 6. Lavabo / Washbasin with Mirror
    const sink = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.14, 0.30), porcelainMat);
    sink.position.set(xWcInner + wallThick + 0.24, floorY + 0.85, zWcCenter);
    wcGroup.add(sink);

    const faucet = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.12, 12), chromeMat);
    faucet.position.set(xWcInner + wallThick + 0.10, floorY + 0.94, zWcCenter);
    wcGroup.add(faucet);

    const mirror = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.50, 0.36), chromeMat);
    mirror.position.set(xWcInner + wallThick + 0.02, floorY + 1.42, zWcCenter);
    wcGroup.add(mirror);

    // 7. Interior Warm Light for WC
    const wcLight = new THREE.PointLight(0xfffaed, 0.85, 6, 1.2);
    wcLight.position.set(xWcCenter, floorY + wcH - 0.25, zWcCenter);
    wcGroup.add(wcLight);

    this.interiorGroup.add(wcGroup);
  }

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

  setRoofColor(colorHex) {
    this.currentRoofColor = colorHex;
    const newTex = TextureGenerator.createCorrugatedRoofTexture(colorHex);
    newTex.repeat.set(8, 28);
    this.roofMaterial.map = newTex;
    this.roofMaterial.needsUpdate = true;

    const c = new THREE.Color(colorHex).multiplyScalar(0.7);
    this.trimMaterial.color.set(c);
  }

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
      case 'road':
        this.roadGroup.visible = visible;
        break;
      case 'lights':
        this.lightsGroup.visible = visible;
        break;
      case 'doors':
        this.doorsGroup.visible = visible;
        break;
    }
  }

  // ===============================================================
  // MÔ PHỎNG 2 LOẠI CỬA KÈM CƠ CHẾ ĐÓNG / MỞ ĐỘNG HỌC 3D
  // - none: Trống suốt, không lắp cửa
  // - type1: Cửa kéo Đài Loan (Ảnh 1) - Cơ chế xếp dồn nan & nhíp hoa văn về 2 bên cột
  // - type2: Cửa sắt 4 cánh hiện đại (Ảnh 2) - Cơ chế bản lề xoay gấp khúc (bi-fold) về 2 bên
  // ===============================================================
  createSlicedPlaneGeometry(width, height, uMin, uMax, isInner = false) {
    const geom = new THREE.PlaneGeometry(width, height);
    const uv = geom.attributes.uv;
    if (!isInner) {
      uv.setXY(0, uMin, 1);
      uv.setXY(1, uMax, 1);
      uv.setXY(2, uMin, 0);
      uv.setXY(3, uMax, 0);
    } else {
      // Đối với mặt trong nhà, lật ngược U để các nan và chi tiết khớp hoàn hảo từ hai phía
      uv.setXY(0, uMax, 1);
      uv.setXY(1, uMin, 1);
      uv.setXY(2, uMax, 0);
      uv.setXY(3, uMin, 0);
    }
    uv.needsUpdate = true;
    return geom;
  }

  setDoorType(type) {
    this.currentDoorType = type;
    this.animatedDoors = [];

    // Clear previous door objects
    while (this.doorsGroup.children.length > 0) {
      const obj = this.doorsGroup.children[0];
      this.doorsGroup.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
    }

    if (type === 'none') {
      return;
    }

    if (type === 'type1') {
      this.buildDoorsType1();
    } else if (type === 'type2') {
      this.buildDoorsType2();
    }

    // Áp dụng ngay mức độ mở hiện tại (0.0 -> 1.0)
    this.setDoorOpenProgress(this.doorOpenProgress);

    // Bật shadow cho các thành phần cửa mới
    this.doorsGroup.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }

  setDoorOpenProgress(progress) {
    this.doorOpenProgress = Math.max(0, Math.min(1, progress));
    for (let i = 0; i < this.animatedDoors.length; i++) {
      this.animatedDoors[i].update(this.doorOpenProgress);
    }
  }

  // 1. CỬA KÉO ĐÀI LOAN (ẢNH 1): CƠ CHẾ XẾP DỒN VỀ 2 BÊN CỘT
  buildDoorsType1() {
    const colSize = this.colSize; // 0.20m
    const doorH = 3.60;
    const colXLeft = -this.halfW + colSize / 2; // -4.65m

    // 5 ô nhịp dọc theo vỉa hè (-X side)
    for (let i = 0; i < this.bays; i++) {
      const z1 = this.colZPositions[i];
      const z2 = this.colZPositions[i + 1];
      const bayCenterZ = (z1 + z2) / 2;
      const bayClearW = (z1 - z2) - colSize;

      const bayDoor = this.buildBayDoorType1(colXLeft, bayCenterZ, bayClearW, doorH, false);
      this.doorsGroup.add(bayDoor);
    }

    // 2 bộ cửa mặt tiền (+Z side, chia đôi qua cặp cột đôi 40cm ở giữa)
    const frontZ = this.halfL - colSize / 2; // +12.89m
    const frontCornerColInnerX = this.halfW - colSize; // 4.55m
    const twinColOuterX = colSize + 0.001; // 0.201m
    const gateW = frontCornerColInnerX - twinColOuterX; // 4.35m
    const gateCenterX = (frontCornerColInnerX + twinColOuterX) / 2; // 2.375m

    const leftGate = this.buildBayDoorType1(-gateCenterX, frontZ, gateW, doorH, true);
    this.doorsGroup.add(leftGate);

    const rightGate = this.buildBayDoorType1(gateCenterX, frontZ, gateW, doorH, true);
    this.doorsGroup.add(rightGate);
  }

  buildBayDoorType1(cx, cz, bayW, doorH, isFront = false) {
    const group = new THREE.Group();
    const floorY = this.floorY; // 0.25m
    const headerH = 0.20; // 0.20m hộp máng trên
    const headerY = floorY + doorH + headerH / 2; // 3.95m
    const leafCenterY = floorY + doorH / 2; // 2.05m
    const halfW = (bayW - 0.08) / 2;

    if (!isFront) {
      // Dọc theo hàng cột vỉa hè (-X side, dọc trục Z)
      // 1. Cố định: Hộp máng che ray trên
      const header = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, headerH, bayW),
        this.doorFrameType1Mat
      );
      header.position.set(cx, headerY, cz);
      group.add(header);

      const groove = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.04, bayW),
        this.steelMaterial
      );
      groove.position.set(cx - 0.05, headerY - 0.06, cz);
      group.add(groove);

      // Ray dẫn hướng đáy
      const rail = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.025, bayW),
        this.aluminumFrameMaterial
      );
      rail.position.set(cx, floorY + 0.0125, cz);
      group.add(rail);

      // Hai đố đứng chữ U ôm cột hai bên
      [-bayW / 2 + 0.03, bayW / 2 - 0.03].forEach(offZ => {
        const jamb = new THREE.Mesh(
          new THREE.BoxGeometry(0.10, doorH, 0.06),
          this.doorFrameType1Mat
        );
        jamb.position.set(cx, leafCenterY, cz + offZ);
        group.add(jamb);
      });

      // 2. Cánh kéo bên trái (xếp về phía cột trái cz + halfW)
      const leftZAnchor = cz + bayW / 2 - 0.04;
      const leftGeom = new THREE.PlaneGeometry(halfW, doorH);

      const leftOuter = new THREE.Mesh(leftGeom, this.doorMatType1);
      leftOuter.rotation.y = -Math.PI / 2;
      group.add(leftOuter);

      const leftInner = new THREE.Mesh(leftGeom, this.doorMatType1);
      leftInner.rotation.y = Math.PI / 2;
      group.add(leftInner);

      const leftStile = new THREE.Mesh(
        new THREE.BoxGeometry(0.07, doorH, 0.07),
        this.doorFrameType1Mat
      );
      group.add(leftStile);

      const leftPlate = new THREE.Mesh(
        new THREE.BoxGeometry(0.01, 0.24, 0.04),
        this.brassMaterial
      );
      group.add(leftPlate);

      const leftHandle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.012, 0.32, 16),
        this.brassMaterial
      );
      group.add(leftHandle);

      // 3. Cánh kéo bên phải (xếp về phía cột phải cz - halfW)
      const rightZAnchor = cz - bayW / 2 + 0.04;
      const rightGeom = new THREE.PlaneGeometry(halfW, doorH);

      const rightOuter = new THREE.Mesh(rightGeom, this.doorMatType1);
      rightOuter.rotation.y = -Math.PI / 2;
      group.add(rightOuter);

      const rightInner = new THREE.Mesh(rightGeom, this.doorMatType1);
      rightInner.rotation.y = Math.PI / 2;
      group.add(rightInner);

      const rightStile = new THREE.Mesh(
        new THREE.BoxGeometry(0.07, doorH, 0.07),
        this.doorFrameType1Mat
      );
      group.add(rightStile);

      const rightPlate = new THREE.Mesh(
        new THREE.BoxGeometry(0.01, 0.24, 0.04),
        this.brassMaterial
      );
      group.add(rightPlate);

      const rightHandle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.012, 0.32, 16),
        this.brassMaterial
      );
      group.add(rightHandle);

      // Đăng ký bộ cập nhật động học khi đóng mở
      this.animatedDoors.push({
        update: (t) => {
          const compFactor = 1 - 0.82 * t;
          const curW = halfW * compFactor;

          // Cánh trái xếp lại
          leftOuter.scale.set(compFactor, 1, 1);
          leftInner.scale.set(compFactor, 1, 1);
          const leftCenterZ = leftZAnchor - curW / 2;
          leftOuter.position.set(cx - 0.02, leafCenterY, leftCenterZ);
          leftInner.position.set(cx + 0.02, leafCenterY, leftCenterZ);

          const leftLeadingZ = leftZAnchor - curW + 0.035;
          leftStile.position.set(cx, leafCenterY, leftLeadingZ);
          leftPlate.position.set(cx - 0.036, floorY + 1.15, leftLeadingZ - 0.01);
          leftHandle.position.set(cx - 0.045, floorY + 1.25, leftLeadingZ - 0.01);

          // Cánh phải xếp lại
          rightOuter.scale.set(compFactor, 1, 1);
          rightInner.scale.set(compFactor, 1, 1);
          const rightCenterZ = rightZAnchor + curW / 2;
          rightOuter.position.set(cx - 0.02, leafCenterY, rightCenterZ);
          rightInner.position.set(cx + 0.02, leafCenterY, rightCenterZ);

          const rightLeadingZ = rightZAnchor + curW - 0.035;
          rightStile.position.set(cx, leafCenterY, rightLeadingZ);
          rightPlate.position.set(cx - 0.036, floorY + 1.15, rightLeadingZ + 0.01);
          rightHandle.position.set(cx - 0.045, floorY + 1.25, rightLeadingZ + 0.01);
        }
      });
    } else {
      // Phía mặt tiền (+Z side, dọc trục X)
      const header = new THREE.Mesh(
        new THREE.BoxGeometry(bayW, headerH, 0.14),
        this.doorFrameType1Mat
      );
      header.position.set(cx, headerY, cz);
      group.add(header);

      const groove = new THREE.Mesh(
        new THREE.BoxGeometry(bayW, 0.04, 0.04),
        this.steelMaterial
      );
      groove.position.set(cx, headerY - 0.06, cz + 0.05);
      group.add(groove);

      const rail = new THREE.Mesh(
        new THREE.BoxGeometry(bayW, 0.025, 0.08),
        this.aluminumFrameMaterial
      );
      rail.position.set(cx, floorY + 0.0125, cz);
      group.add(rail);

      [-bayW / 2 + 0.03, bayW / 2 - 0.03].forEach(offX => {
        const jamb = new THREE.Mesh(
          new THREE.BoxGeometry(0.06, doorH, 0.10),
          this.doorFrameType1Mat
        );
        jamb.position.set(cx + offX, leafCenterY, cz);
        group.add(jamb);
      });

      const leftXAnchor = cx - bayW / 2 + 0.04;
      const leftGeom = new THREE.PlaneGeometry(halfW, doorH);

      const leftOuter = new THREE.Mesh(leftGeom, this.doorMatType1);
      group.add(leftOuter);

      const leftInner = new THREE.Mesh(leftGeom, this.doorMatType1);
      leftInner.rotation.y = Math.PI;
      group.add(leftInner);

      const leftStile = new THREE.Mesh(
        new THREE.BoxGeometry(0.07, doorH, 0.07),
        this.doorFrameType1Mat
      );
      group.add(leftStile);

      const leftPlate = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.24, 0.01),
        this.brassMaterial
      );
      group.add(leftPlate);

      const leftHandle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.012, 0.32, 16),
        this.brassMaterial
      );
      group.add(leftHandle);

      const rightXAnchor = cx + bayW / 2 - 0.04;
      const rightGeom = new THREE.PlaneGeometry(halfW, doorH);

      const rightOuter = new THREE.Mesh(rightGeom, this.doorMatType1);
      group.add(rightOuter);

      const rightInner = new THREE.Mesh(rightGeom, this.doorMatType1);
      rightInner.rotation.y = Math.PI;
      group.add(rightInner);

      const rightStile = new THREE.Mesh(
        new THREE.BoxGeometry(0.07, doorH, 0.07),
        this.doorFrameType1Mat
      );
      group.add(rightStile);

      const rightPlate = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.24, 0.01),
        this.brassMaterial
      );
      group.add(rightPlate);

      const rightHandle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.012, 0.32, 16),
        this.brassMaterial
      );
      group.add(rightHandle);

      this.animatedDoors.push({
        update: (t) => {
          const compFactor = 1 - 0.82 * t;
          const curW = halfW * compFactor;

          leftOuter.scale.set(compFactor, 1, 1);
          leftInner.scale.set(compFactor, 1, 1);
          const leftCenterX = leftXAnchor + curW / 2;
          leftOuter.position.set(leftCenterX, leafCenterY, cz + 0.02);
          leftInner.position.set(leftCenterX, leafCenterY, cz - 0.02);

          const leftLeadingX = leftXAnchor + curW - 0.035;
          leftStile.position.set(leftLeadingX, leafCenterY, cz);
          leftPlate.position.set(leftLeadingX - 0.01, floorY + 1.15, cz + 0.036);
          leftHandle.position.set(leftLeadingX - 0.01, floorY + 1.25, cz + 0.045);

          rightOuter.scale.set(compFactor, 1, 1);
          rightInner.scale.set(compFactor, 1, 1);
          const rightCenterX = rightXAnchor - curW / 2;
          rightOuter.position.set(rightCenterX, leafCenterY, cz + 0.02);
          rightInner.position.set(rightCenterX, leafCenterY, cz - 0.02);

          const rightLeadingX = rightXAnchor - curW + 0.035;
          rightStile.position.set(rightLeadingX, leafCenterY, cz);
          rightPlate.position.set(rightLeadingX + 0.01, floorY + 1.15, cz + 0.036);
          rightHandle.position.set(rightLeadingX + 0.01, floorY + 1.25, cz + 0.045);
        }
      });
    }

    return group;
  }

  // 2. CỬA SẮT HỘP 4 CÁNH HIỆN ĐẠI (ẢNH 2): CƠ CHẾ XOAY BẢN LỀ GẤP BI-FOLD
  buildDoorsType2() {
    const colSize = this.colSize; // 0.20m
    const doorH = 3.60;
    const colXLeft = -this.halfW + colSize / 2; // -4.65m

    // 5 ô nhịp dọc theo vỉa hè (-X side)
    for (let i = 0; i < this.bays; i++) {
      const z1 = this.colZPositions[i];
      const z2 = this.colZPositions[i + 1];
      const bayCenterZ = (z1 + z2) / 2;
      const bayClearW = (z1 - z2) - colSize;

      const bayDoor = this.buildBayDoorType2(colXLeft, bayCenterZ, bayClearW, doorH, false);
      this.doorsGroup.add(bayDoor);
    }

    // 2 bộ cửa sắt 4 cánh mặt tiền (+Z side, chia đôi qua cặp cột đôi 40cm ở giữa)
    const frontZ = this.halfL - colSize / 2; // +12.89m
    const frontCornerColInnerX = this.halfW - colSize; // 4.55m
    const twinColOuterX = colSize + 0.001; // 0.201m
    const gateW = frontCornerColInnerX - twinColOuterX; // 4.35m
    const gateCenterX = (frontCornerColInnerX + twinColOuterX) / 2; // 2.375m

    const leftGate = this.buildBayDoorType2(-gateCenterX, frontZ, gateW, doorH, true);
    this.doorsGroup.add(leftGate);

    const rightGate = this.buildBayDoorType2(gateCenterX, frontZ, gateW, doorH, true);
    this.doorsGroup.add(rightGate);
  }

  buildBayDoorType2(cx, cz, bayW, doorH, isFront = false) {
    const group = new THREE.Group();
    const floorY = this.floorY; // 0.25m
    const headerH = 0.20;
    const headerY = floorY + doorH + headerH / 2; // 3.95m
    const leafCenterY = floorY + doorH / 2; // 2.05m
    const pw = (bayW - 0.08) / 4; // Chiều rộng mỗi cánh trong 4 cánh
    const handleLen = 0.60;
    const handleY = floorY + 1.15;

    if (!isFront) {
      // Dọc theo hàng cột vỉa hè (-X side, dọc trục Z)
      // 1. Cố định: Lanh tô trên đỉnh & trụ khung bao ngoài
      const header = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, headerH, bayW),
        this.doorFrameType2Mat
      );
      header.position.set(cx, headerY, cz);
      group.add(header);

      [-bayW / 2 + 0.03, bayW / 2 - 0.03].forEach(offZ => {
        const post = new THREE.Mesh(
          new THREE.BoxGeometry(0.08, doorH, 0.06),
          this.doorFrameType2Mat
        );
        post.position.set(cx, leafCenterY, cz + offZ);
        group.add(post);

        [0.45, doorH * 0.65, doorH - 0.35].forEach(hy => {
          const hinge = new THREE.Mesh(
            new THREE.CylinderGeometry(0.015, 0.015, 0.10, 16),
            this.aluminumFrameMaterial
          );
          hinge.position.set(cx - 0.035, floorY + hy, cz + offZ);
          group.add(hinge);
        });
      });

      // 2. CÁNH 1 & CÁNH 2 (BÊN TRÁI - GẤP VỀ PHÍA CỘT TRÁI)
      const zHinge1 = cz + bayW / 2 - 0.04;
      const hinge1Group = new THREE.Group();
      hinge1Group.position.set(cx, 0, zHinge1);
      group.add(hinge1Group);

      const p1Group = new THREE.Group();
      p1Group.position.set(0, 0, -pw / 2);
      hinge1Group.add(p1Group);

      const p1GeomOuter = this.createSlicedPlaneGeometry(pw - 0.01, doorH, 0.0, 0.25, false);
      const p1Outer = new THREE.Mesh(p1GeomOuter, this.doorMatType2);
      p1Outer.rotation.y = -Math.PI / 2;
      p1Outer.position.set(-0.018, leafCenterY, 0);
      p1Group.add(p1Outer);

      const p1GeomInner = this.createSlicedPlaneGeometry(pw - 0.01, doorH, 0.0, 0.25, true);
      const p1Inner = new THREE.Mesh(p1GeomInner, this.doorMatType2);
      p1Inner.rotation.y = Math.PI / 2;
      p1Inner.position.set(0.018, leafCenterY, 0);
      p1Group.add(p1Inner);

      const p1Frame = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, doorH, pw),
        this.doorFrameType2Mat
      );
      p1Frame.position.set(0, leafCenterY, 0);
      p1Group.add(p1Frame);

      // Hinge 2 inside hinge1Group tại local Z = -pw
      const hinge2Group = new THREE.Group();
      hinge2Group.position.set(0, 0, -pw);
      hinge1Group.add(hinge2Group);

      const p2Group = new THREE.Group();
      p2Group.position.set(0, 0, -pw / 2);
      hinge2Group.add(p2Group);

      const p2GeomOuter = this.createSlicedPlaneGeometry(pw - 0.01, doorH, 0.25, 0.50, false);
      const p2Outer = new THREE.Mesh(p2GeomOuter, this.doorMatType2);
      p2Outer.rotation.y = -Math.PI / 2;
      p2Outer.position.set(-0.018, leafCenterY, 0);
      p2Group.add(p2Outer);

      const p2GeomInner = this.createSlicedPlaneGeometry(pw - 0.01, doorH, 0.25, 0.50, true);
      const p2Inner = new THREE.Mesh(p2GeomInner, this.doorMatType2);
      p2Inner.rotation.y = Math.PI / 2;
      p2Inner.position.set(0.018, leafCenterY, 0);
      p2Group.add(p2Inner);

      const p2Frame = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, doorH, pw),
        this.doorFrameType2Mat
      );
      p2Frame.position.set(0, leafCenterY, 0);
      p2Group.add(p2Frame);

      // Tay nắm inox 60cm bên cánh 2 (ở mép ngoài)
      [-0.045, 0.045].forEach(offX => {
        const handle = new THREE.Mesh(
          new THREE.CylinderGeometry(0.016, 0.016, handleLen, 24),
          this.stainlessMaterial
        );
        handle.position.set(offX, handleY, -pw + 0.04);
        hinge2Group.add(handle);

        [-handleLen * 0.4, handleLen * 0.4].forEach(hy => {
          const bracket = new THREE.Mesh(
            new THREE.CylinderGeometry(0.012, 0.012, 0.04, 16),
            this.stainlessMaterial
          );
          bracket.rotation.z = Math.PI / 2;
          bracket.position.set(offX / 2, handleY + hy, -pw + 0.04);
          hinge2Group.add(bracket);
        });
      });

      // 3. CÁNH 4 & CÁNH 3 (BÊN PHẢI - GẤP VỀ PHÍA CỘT PHẢI)
      const zHinge4 = cz - bayW / 2 + 0.04;
      const hinge4Group = new THREE.Group();
      hinge4Group.position.set(cx, 0, zHinge4);
      group.add(hinge4Group);

      const p4Group = new THREE.Group();
      p4Group.position.set(0, 0, pw / 2);
      hinge4Group.add(p4Group);

      const p4GeomOuter = this.createSlicedPlaneGeometry(pw - 0.01, doorH, 0.75, 1.00, false);
      const p4Outer = new THREE.Mesh(p4GeomOuter, this.doorMatType2);
      p4Outer.rotation.y = -Math.PI / 2;
      p4Outer.position.set(-0.018, leafCenterY, 0);
      p4Group.add(p4Outer);

      const p4GeomInner = this.createSlicedPlaneGeometry(pw - 0.01, doorH, 0.75, 1.00, true);
      const p4Inner = new THREE.Mesh(p4GeomInner, this.doorMatType2);
      p4Inner.rotation.y = Math.PI / 2;
      p4Inner.position.set(0.018, leafCenterY, 0);
      p4Group.add(p4Inner);

      const p4Frame = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, doorH, pw),
        this.doorFrameType2Mat
      );
      p4Frame.position.set(0, leafCenterY, 0);
      p4Group.add(p4Frame);

      const hinge3Group = new THREE.Group();
      hinge3Group.position.set(0, 0, pw);
      hinge4Group.add(hinge3Group);

      const p3Group = new THREE.Group();
      p3Group.position.set(0, 0, pw / 2);
      hinge3Group.add(p3Group);

      const p3GeomOuter = this.createSlicedPlaneGeometry(pw - 0.01, doorH, 0.50, 0.75, false);
      const p3Outer = new THREE.Mesh(p3GeomOuter, this.doorMatType2);
      p3Outer.rotation.y = -Math.PI / 2;
      p3Outer.position.set(-0.018, leafCenterY, 0);
      p3Group.add(p3Outer);

      const p3GeomInner = this.createSlicedPlaneGeometry(pw - 0.01, doorH, 0.50, 0.75, true);
      const p3Inner = new THREE.Mesh(p3GeomInner, this.doorMatType2);
      p3Inner.rotation.y = Math.PI / 2;
      p3Inner.position.set(0.018, leafCenterY, 0);
      p3Group.add(p3Inner);

      const p3Frame = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, doorH, pw),
        this.doorFrameType2Mat
      );
      p3Frame.position.set(0, leafCenterY, 0);
      p3Group.add(p3Frame);

      // Tay nắm inox 60cm bên cánh 3 (ở mép ngoài)
      [-0.045, 0.045].forEach(offX => {
        const handle = new THREE.Mesh(
          new THREE.CylinderGeometry(0.016, 0.016, handleLen, 24),
          this.stainlessMaterial
        );
        handle.position.set(offX, handleY, pw - 0.04);
        hinge3Group.add(handle);

        [-handleLen * 0.4, handleLen * 0.4].forEach(hy => {
          const bracket = new THREE.Mesh(
            new THREE.CylinderGeometry(0.012, 0.012, 0.04, 16),
            this.stainlessMaterial
          );
          bracket.rotation.z = Math.PI / 2;
          bracket.position.set(offX / 2, handleY + hy, pw - 0.04);
          hinge3Group.add(bracket);
        });
      });

      // Đăng ký bộ cập nhật chuyển động xoay bản lề
      this.animatedDoors.push({
        update: (t) => {
          // Cánh 1 & 2 mở xoay ra phía vỉa hè (-X) và gập chữ V
          hinge1Group.rotation.y = t * (Math.PI * 0.52);
          hinge2Group.rotation.y = -t * (Math.PI * 0.94);

          // Cánh 4 & 3 mở xoay ra phía vỉa hè (-X) và gập chữ V
          hinge4Group.rotation.y = -t * (Math.PI * 0.52);
          hinge3Group.rotation.y = t * (Math.PI * 0.94);
        }
      });
    } else {
      // Phía mặt tiền (+Z side, dọc trục X)
      const header = new THREE.Mesh(
        new THREE.BoxGeometry(bayW, headerH, 0.12),
        this.doorFrameType2Mat
      );
      header.position.set(cx, headerY, cz);
      group.add(header);

      [-bayW / 2 + 0.03, bayW / 2 - 0.03].forEach(offX => {
        const post = new THREE.Mesh(
          new THREE.BoxGeometry(0.06, doorH, 0.08),
          this.doorFrameType2Mat
        );
        post.position.set(cx + offX, leafCenterY, cz);
        group.add(post);

        [0.45, doorH * 0.65, doorH - 0.35].forEach(hy => {
          const hinge = new THREE.Mesh(
            new THREE.CylinderGeometry(0.015, 0.015, 0.10, 16),
            this.aluminumFrameMaterial
          );
          hinge.position.set(cx + offX, floorY + hy, cz + 0.035);
          group.add(hinge);
        });
      });

      // 2 cánh bên trái (xoay mở về phía trước +Z)
      const xHinge1 = cx - bayW / 2 + 0.04;
      const hinge1Group = new THREE.Group();
      hinge1Group.position.set(xHinge1, 0, cz);
      group.add(hinge1Group);

      const p1Group = new THREE.Group();
      p1Group.position.set(pw / 2, 0, 0);
      hinge1Group.add(p1Group);

      const p1Outer = new THREE.Mesh(this.createSlicedPlaneGeometry(pw - 0.01, doorH, 0.0, 0.25, false), this.doorMatType2);
      p1Outer.position.set(0, leafCenterY, 0.018);
      p1Group.add(p1Outer);

      const p1Inner = new THREE.Mesh(this.createSlicedPlaneGeometry(pw - 0.01, doorH, 0.0, 0.25, true), this.doorMatType2);
      p1Inner.rotation.y = Math.PI;
      p1Inner.position.set(0, leafCenterY, -0.018);
      p1Group.add(p1Inner);

      const p1Frame = new THREE.Mesh(new THREE.BoxGeometry(pw, doorH, 0.04), this.doorFrameType2Mat);
      p1Frame.position.set(0, leafCenterY, 0);
      p1Group.add(p1Frame);

      const hinge2Group = new THREE.Group();
      hinge2Group.position.set(pw, 0, 0);
      hinge1Group.add(hinge2Group);

      const p2Group = new THREE.Group();
      p2Group.position.set(pw / 2, 0, 0);
      hinge2Group.add(p2Group);

      const p2Outer = new THREE.Mesh(this.createSlicedPlaneGeometry(pw - 0.01, doorH, 0.25, 0.50, false), this.doorMatType2);
      p2Outer.position.set(0, leafCenterY, 0.018);
      p2Group.add(p2Outer);

      const p2Inner = new THREE.Mesh(this.createSlicedPlaneGeometry(pw - 0.01, doorH, 0.25, 0.50, true), this.doorMatType2);
      p2Inner.rotation.y = Math.PI;
      p2Inner.position.set(0, leafCenterY, -0.018);
      p2Group.add(p2Inner);

      const p2Frame = new THREE.Mesh(new THREE.BoxGeometry(pw, doorH, 0.04), this.doorFrameType2Mat);
      p2Frame.position.set(0, leafCenterY, 0);
      p2Group.add(p2Frame);

      [-0.045, 0.045].forEach(offZ => {
        const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, handleLen, 24), this.stainlessMaterial);
        handle.position.set(pw - 0.04, handleY, offZ);
        hinge2Group.add(handle);

        [-handleLen * 0.4, handleLen * 0.4].forEach(hy => {
          const bracket = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.04, 16), this.stainlessMaterial);
          bracket.rotation.x = Math.PI / 2;
          bracket.position.set(pw - 0.04, handleY + hy, offZ / 2);
          hinge2Group.add(bracket);
        });
      });

      // 2 cánh bên phải (xoay mở về phía trước +Z)
      const xHinge4 = cx + bayW / 2 - 0.04;
      const hinge4Group = new THREE.Group();
      hinge4Group.position.set(xHinge4, 0, cz);
      group.add(hinge4Group);

      const p4Group = new THREE.Group();
      p4Group.position.set(-pw / 2, 0, 0);
      hinge4Group.add(p4Group);

      const p4Outer = new THREE.Mesh(this.createSlicedPlaneGeometry(pw - 0.01, doorH, 0.75, 1.00, false), this.doorMatType2);
      p4Outer.position.set(0, leafCenterY, 0.018);
      p4Group.add(p4Outer);

      const p4Inner = new THREE.Mesh(this.createSlicedPlaneGeometry(pw - 0.01, doorH, 0.75, 1.00, true), this.doorMatType2);
      p4Inner.rotation.y = Math.PI;
      p4Inner.position.set(0, leafCenterY, -0.018);
      p4Group.add(p4Inner);

      const p4Frame = new THREE.Mesh(new THREE.BoxGeometry(pw, doorH, 0.04), this.doorFrameType2Mat);
      p4Frame.position.set(0, leafCenterY, 0);
      p4Group.add(p4Frame);

      const hinge3Group = new THREE.Group();
      hinge3Group.position.set(-pw, 0, 0);
      hinge4Group.add(hinge3Group);

      const p3Group = new THREE.Group();
      p3Group.position.set(-pw / 2, 0, 0);
      hinge3Group.add(p3Group);

      const p3Outer = new THREE.Mesh(this.createSlicedPlaneGeometry(pw - 0.01, doorH, 0.50, 0.75, false), this.doorMatType2);
      p3Outer.position.set(0, leafCenterY, 0.018);
      p3Group.add(p3Outer);

      const p3Inner = new THREE.Mesh(this.createSlicedPlaneGeometry(pw - 0.01, doorH, 0.50, 0.75, true), this.doorMatType2);
      p3Inner.rotation.y = Math.PI;
      p3Inner.position.set(0, leafCenterY, -0.018);
      p3Group.add(p3Inner);

      const p3Frame = new THREE.Mesh(new THREE.BoxGeometry(pw, doorH, 0.04), this.doorFrameType2Mat);
      p3Frame.position.set(0, leafCenterY, 0);
      p3Group.add(p3Frame);

      [-0.045, 0.045].forEach(offZ => {
        const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, handleLen, 24), this.stainlessMaterial);
        handle.position.set(-pw + 0.04, handleY, offZ);
        hinge3Group.add(handle);

        [-handleLen * 0.4, handleLen * 0.4].forEach(hy => {
          const bracket = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.04, 16), this.stainlessMaterial);
          bracket.rotation.x = Math.PI / 2;
          bracket.position.set(-pw + 0.04, handleY + hy, offZ / 2);
          hinge3Group.add(bracket);
        });
      });

      this.animatedDoors.push({
        update: (t) => {
          hinge1Group.rotation.y = -t * (Math.PI * 0.52);
          hinge2Group.rotation.y = t * (Math.PI * 0.94);

          hinge4Group.rotation.y = t * (Math.PI * 0.52);
          hinge3Group.rotation.y = -t * (Math.PI * 0.94);
        }
      });
    }

    return group;
  }

  setDayNight(isNight) {
    if (this.interiorAmbientLight) {
      this.interiorAmbientLight.intensity = isNight ? 0.75 : 0.55;
    }
    this.interiorLightObjects.forEach(light => {
      light.intensity = isNight ? 1.6 : 0.65;
    });
  }

  dispose() {
    this.scene.remove(this.root);
  }
}
