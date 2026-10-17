import * as THREE from 'three';

/**
 * Dimensions & 3D Annotations Module
 * Renders dimensional lines, tick marks, and readable badges for:
 * - Total Length: 25.98 m
 * - Total Width: 9.50 m
 * - 5 Bays (5 Ô nhịp): 5.196 m each (6 column positions)
 * - Column Height: 3.80 m (Cột 20cm x 20cm)
 * - Roof Ridge Height: 6.60 m
 * - Side Sidewalk: 4.00 m (Mép nhà ra viền đỏ)
 * - Front Sidewalk: 12.00 m (Mặt tiền ra viền đỏ)
 * - Roadway Badges (Đường xe chạy - phần xanh)
 */

export class DimensionRenderer {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'dimensionGroup';
    this.scene.add(this.group);
    this.visible = true;

    this.initDimensions();
  }

  createBadgeSprite(text, subtext = '', bgColor = 'rgba(26, 43, 76, 0.92)', textColor = '#ffffff', borderColor = '#00d2ff', subtextColor = '#b0d5f8') {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 640;
    canvas.height = 170;

    const x = 12, y = 12, w = canvas.width - 24, h = canvas.height - 24, r = 22;
    ctx.fillStyle = bgColor;
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 5;

    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x + r, y);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Auto-fit font size để chữ không bao giờ bị tràn lề hay cắt cụt
    const maxTextW = w - 40;
    let mainFontSize = subtext ? 36 : 42;
    ctx.font = `bold ${mainFontSize}px "Segoe UI", Arial, sans-serif`;
    while (ctx.measureText(text).width > maxTextW && mainFontSize > 20) {
      mainFontSize -= 2;
      ctx.font = `bold ${mainFontSize}px "Segoe UI", Arial, sans-serif`;
    }

    ctx.fillStyle = textColor;
    const mainY = subtext ? y + 50 : y + h / 2;
    ctx.fillText(text, x + w / 2, mainY);

    if (subtext) {
      let subFontSize = 22;
      ctx.font = `normal ${subFontSize}px "Segoe UI", Arial, sans-serif`;
      while (ctx.measureText(subtext).width > maxTextW && subFontSize > 14) {
        subFontSize -= 2;
        ctx.font = `normal ${subFontSize}px "Segoe UI", Arial, sans-serif`;
      }
      ctx.fillStyle = subtextColor;
      ctx.fillText(subtext, x + w / 2, y + 98);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const spriteMaterial = new THREE.SpriteMaterial({
      map: texture,
      depthTest: false,
      depthWrite: false
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(1.5, 0.40, 1.0); // Kích thước gọn gàng, tinh tế
    return sprite;
  }

  createDimLine(p1, p2, color = 0x00d2ff, tickLength = 0.5) {
    const group = new THREE.Group();
    const material = new THREE.LineBasicMaterial({
      color: color,
      linewidth: 3,
      depthTest: false,
      depthWrite: false
    });

    const points = [p1, p2];
    const geom = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geom, material);
    group.add(line);

    const dir = new THREE.Vector3().subVectors(p2, p1).normalize();
    let perp = new THREE.Vector3(0, 1, 0);
    if (Math.abs(dir.y) > 0.9) {
      perp = new THREE.Vector3(1, 0, 0);
    } else {
      perp.crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize();
      if (perp.lengthSq() < 0.1) perp = new THREE.Vector3(0, 1, 0);
    }

    const t1A = p1.clone().addScaledVector(perp, tickLength);
    const t1B = p1.clone().addScaledVector(perp, -tickLength);
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([t1A, t1B]), material));

    const t2A = p2.clone().addScaledVector(perp, tickLength);
    const t2B = p2.clone().addScaledVector(perp, -tickLength);
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([t2A, t2B]), material));

    return group;
  }

  initDimensions() {
    const L = 25.98;
    const W = 9.50;
    const halfL = L / 2; // 12.99
    const halfW = W / 2; // 4.75
    // Kích thước từng ô: 4 ô đầu 5.00m, ô thứ năm (còn lại) 5.98m (tổng 25.98m)
    const bayLengths = [5.00, 5.00, 5.00, 5.00, 5.98];
    const colZPositions = [
      halfL,         // +12.99 (Cột 1 - Mặt tiền)
      halfL - 5.00,  // +7.99  (Cột 2)
      halfL - 10.00, // +2.99  (Cột 3)
      halfL - 15.00, // -2.01  (Cột 4)
      halfL - 20.00, // -7.01  (Cột 5)
      -halfL         // -12.99 (Cột 6 - Cuối nhà)
    ];
    const colHeight = 3.80; // 3.80m
    const ridgeHeight = 6.60; // 6.60m

    // Extension line dashed material
    const extMat = new THREE.LineDashedMaterial({
      color: 0x6699aa,
      dashSize: 0.3,
      gapSize: 0.2,
      depthTest: false
    });
    const addDashedLine = (a, b) => {
      const g = new THREE.BufferGeometry().setFromPoints([a, b]);
      const l = new THREE.Line(g, extMat);
      l.computeLineDistances();
      this.group.add(l);
    };

    // 1. 5 BAYS (4 ô 5.00m + 1 ô 5.98m) dọc theo vỉa hè (bên -X)
    const bayLineX = -halfW - 1.2; // -5.95m (trên vỉa hè)
    for (let i = 0; i < bayLengths.length; i++) {
      const z1 = colZPositions[i];
      const z2 = colZPositions[i + 1];
      const pt1 = new THREE.Vector3(bayLineX, 0.3, z1);
      const pt2 = new THREE.Vector3(bayLineX, 0.3, z2);
      this.group.add(this.createDimLine(pt1, pt2, 0xffa726, 0.4));

      addDashedLine(new THREE.Vector3(-halfW, 0.3, z1), new THREE.Vector3(bayLineX - 0.3, 0.3, z1));

      const isLast = (i === bayLengths.length - 1);
      const badgeTitle = isLast ? `Ô ${i + 1}: ${bayLengths[i].toFixed(2)} m (còn lại)` : `Ô ${i + 1}: ${bayLengths[i].toFixed(2)} m`;
      const bayBadge = this.createBadgeSprite(
        badgeTitle,
        `Cột ${i + 1} ➔ Cột ${i + 2}`,
        'rgba(30, 25, 45, 0.90)',
        '#ffffff',
        '#ffb74d'
      );
      bayBadge.scale.set(isLast ? 1.45 : 1.30, 0.36, 1.0);
      bayBadge.position.set(bayLineX - 0.8, 0.4, (z1 + z2) / 2);
      this.group.add(bayBadge);
    }
    addDashedLine(new THREE.Vector3(-halfW, 0.3, -halfL), new THREE.Vector3(bayLineX - 0.3, 0.3, -halfL));

    // 2. TOTAL LENGTH (25.98 m) - offset along sidewalk & curb (-X side)
    const lenX = -halfW - 4.0 - 0.6; // -9.35m (just outside red curb)
    const pLenStart = new THREE.Vector3(lenX, 0.3, halfL);
    const pLenEnd = new THREE.Vector3(lenX, 0.3, -halfL);
    this.group.add(this.createDimLine(pLenStart, pLenEnd, 0x00e1d9, 0.6));

    addDashedLine(new THREE.Vector3(-halfW, 0.3, halfL), new THREE.Vector3(lenX - 0.4, 0.3, halfL));
    addDashedLine(new THREE.Vector3(-halfW, 0.3, -halfL), new THREE.Vector3(lenX - 0.4, 0.3, -halfL));

    const spriteLen = this.createBadgeSprite('CHIỀU DÀI: 25.98 m', '4 ô 5.00m + 1 ô 5.98m (còn lại)');
    spriteLen.scale.set(1.6, 0.45, 1.0);
    spriteLen.position.set(lenX - 1.1, 0.4, 0);
    this.group.add(spriteLen);

    // 3. TOTAL WIDTH (9.50 m) - Back Facade (Z = -halfL - 2.0m)
    const backZ = -halfL - 2.0;
    const pW1 = new THREE.Vector3(-halfW, 0.3, backZ);
    const pW2 = new THREE.Vector3(halfW, 0.3, backZ);
    this.group.add(this.createDimLine(pW1, pW2, 0x00e676, 0.6));
    addDashedLine(new THREE.Vector3(-halfW, 0.3, -halfL - 0.3), new THREE.Vector3(-halfW, 0.3, backZ - 0.4));
    addDashedLine(new THREE.Vector3(halfW, 0.3, -halfL - 0.3), new THREE.Vector3(halfW, 0.3, backZ - 0.4));

    const spriteWidth = this.createBadgeSprite('CHIỀU RỘNG: 9.50 m', 'Không gian trống suốt', 'rgba(15, 40, 25, 0.92)', '#ffffff', '#00e676');
    spriteWidth.scale.set(1.6, 0.45, 1.0);
    spriteWidth.position.set(0, 0.4, backZ - 1.0);
    this.group.add(spriteWidth);

    // 4. COLUMN HEIGHT (3.80 m) & RIDGE HEIGHT (6.60 m)
    const hX = -halfW - 1.2;
    const hZ = halfL + 0.8;
    const pHStart = new THREE.Vector3(hX, 0.0, hZ);
    const pHEnd = new THREE.Vector3(hX, colHeight, hZ);
    this.group.add(this.createDimLine(pHStart, pHEnd, 0xe040fb, 0.5));

    const spriteColH = this.createBadgeSprite('CAO CỘT: 3.80 m', 'Cột 20cm × 20cm', 'rgba(40, 15, 45, 0.92)', '#ffffff', '#e040fb');
    spriteColH.scale.set(1.35, 0.38, 1.0);
    spriteColH.position.set(hX - 1.0, colHeight / 2, hZ);
    this.group.add(spriteColH);

    const rX = 0;
    const rZ = halfL + 0.5;
    const pRStart = new THREE.Vector3(rX, 0.0, rZ);
    const pREnd = new THREE.Vector3(rX, ridgeHeight, rZ);
    this.group.add(this.createDimLine(pRStart, pREnd, 0xffd600, 0.5));

    const spriteRidge = this.createBadgeSprite('ĐỈNH MÁI: 6.60 m', 'Độ dốc Mái Thái', 'rgba(45, 40, 10, 0.92)', '#ffffff', '#ffd600');
    spriteRidge.scale.set(1.45, 0.40, 1.0);
    spriteRidge.position.set(rX, ridgeHeight + 0.55, rZ);
    this.group.add(spriteRidge);

    // 4b. 2 CỘT ĐÔI MẶT TIỀN (2 x 20cm x 20cm nằm liền sát nhau) & 2 GIAN CỬA (4.35m)
    const frontDimZ = halfL + 0.35;
    const pGateL1 = new THREE.Vector3(-4.55, 0.28, frontDimZ);
    const pGateL2 = new THREE.Vector3(-0.20, 0.28, frontDimZ);
    this.group.add(this.createDimLine(pGateL1, pGateL2, 0x00e5ff, 0.35));

    const spriteGateL = this.createBadgeSprite('GIAN TRÁI: 4.35 m', 'Thông thủy cửa trước', 'rgba(15, 30, 45, 0.90)', '#ffffff', '#00e5ff');
    spriteGateL.scale.set(1.30, 0.36, 1.0);
    spriteGateL.position.set(-2.375, 0.45, frontDimZ + 0.5);
    this.group.add(spriteGateL);

    const pGateR1 = new THREE.Vector3(0.20, 0.28, frontDimZ);
    const pGateR2 = new THREE.Vector3(4.55, 0.28, frontDimZ);
    this.group.add(this.createDimLine(pGateR1, pGateR2, 0x00e5ff, 0.35));

    const spriteGateR = this.createBadgeSprite('GIAN PHẢI: 4.35 m', 'Thông thủy cửa trước', 'rgba(15, 30, 45, 0.90)', '#ffffff', '#00e5ff');
    spriteGateR.scale.set(1.30, 0.36, 1.0);
    spriteGateR.position.set(2.375, 0.45, frontDimZ + 0.5);
    this.group.add(spriteGateR);

    const spriteTwinCol = this.createBadgeSprite('CỘT ĐÔI: 2 × (20cm × 20cm)', 'Nằm liền sát nhau', 'rgba(15, 35, 60, 0.92)', '#ffffff', '#00d2ff');
    spriteTwinCol.scale.set(1.40, 0.40, 1.0);
    spriteTwinCol.position.set(0, 2.2, halfL + 0.4);
    this.group.add(spriteTwinCol);

    // 5. SIDEWALK SIDE (4.00 m) - from house long wall (X = -4.75) to red curb (X = -8.75)
    const swZ = -2.6;
    const pSW1 = new THREE.Vector3(-halfW, 0.25, swZ);
    const pSW2 = new THREE.Vector3(-halfW - 4.0, 0.25, swZ);
    this.group.add(this.createDimLine(pSW1, pSW2, 0xff3d00, 0.5));

    const spriteSideWalk = this.createBadgeSprite('VỈA HÈ: 4.00 m', 'Mép nhà ➔ Viền đỏ', 'rgba(45, 20, 15, 0.92)', '#ffffff', '#ff3d00');
    spriteSideWalk.scale.set(1.40, 0.40, 1.0);
    spriteSideWalk.position.set(-halfW - 2.0, 0.4, swZ - 0.6);
    this.group.add(spriteSideWalk);

    // 6. SIDEWALK FRONT (12.00 m) - from house front (Z = 12.99) to red curb (Z = 24.99)
    const pFW1 = new THREE.Vector3(-2.5, 0.25, halfL);
    const pFW2 = new THREE.Vector3(-2.5, 0.25, halfL + 12.0);
    this.group.add(this.createDimLine(pFW1, pFW2, 0xff3d00, 0.6));

    const spriteFrontWalk = this.createBadgeSprite('VỈA HÈ / SÂN: 12.00 m', 'Mặt tiền ➔ Viền đỏ', 'rgba(45, 20, 15, 0.92)', '#ffffff', '#ff3d00');
    spriteFrontWalk.scale.set(1.50, 0.42, 1.0);
    spriteFrontWalk.position.set(2.5, 0.4, halfL + 6.0);
    this.group.add(spriteFrontWalk);

    // 7. ROADWAY BADGES (Phần xanh đường xe chạy)
    const roadBadge1 = this.createBadgeSprite('ĐƯỜNG XE CHẠY', 'Nhánh đường xe chạy (phần xanh)', 'rgba(20, 48, 25, 0.92)', '#ffffff', '#43a047');
    roadBadge1.scale.set(1.50, 0.42, 1.0);
    roadBadge1.position.set(-halfW - 4.0 - 8.5 / 2 - 8.0, 0.5, 0);
    this.group.add(roadBadge1);

    const roadBadge2 = this.createBadgeSprite('ĐƯỜNG XE CHẠY', 'Nhánh đường trước (phần xanh)', 'rgba(20, 48, 25, 0.92)', '#ffffff', '#43a047');
    roadBadge2.scale.set(1.50, 0.42, 1.0);
    roadBadge2.position.set(-2.0, 0.5, halfL + 12.0 + 8.5 / 2 + 10.0);
    this.group.add(roadBadge2);

    // 8. RESTROOM DIMENSIONS (1.20 m × 1.40 m) - Từ phía đối diện vỉa hè vẽ vào 1.2m
    const xWallInner = halfW - 0.20; // 4.55m (mặt trong tường phía đối diện vỉa hè)
    const xWcInner = xWallInner - 1.20; // 3.35m (vào 1.2m)
    const zBackInner = -halfL + 0.20; // -12.79m (mặt trong tường sau)
    const zWcFront = zBackInner + 1.40; // -11.39m (chiều dài 1.4m)
    const wcFloorY = 0.32;
    const wcTopY = 0.25 + 2.40 + 0.05; // 2.70m

    // Chiều rộng WC: 1.20m (từ tường vào)
    const pWcW1 = new THREE.Vector3(xWallInner, wcFloorY, zWcFront + 0.35);
    const pWcW2 = new THREE.Vector3(xWcInner, wcFloorY, zWcFront + 0.35);
    this.group.add(this.createDimLine(pWcW1, pWcW2, 0x00e5ff, 0.3));
    addDashedLine(new THREE.Vector3(xWallInner, wcFloorY, zWcFront), new THREE.Vector3(xWallInner, wcFloorY, zWcFront + 0.35));
    addDashedLine(new THREE.Vector3(xWcInner, wcFloorY, zWcFront), new THREE.Vector3(xWcInner, wcFloorY, zWcFront + 0.35));

    const badgeWcW = this.createBadgeSprite('RỘNG: 1.20 m', 'Vào từ tường', 'rgba(10, 32, 50, 0.92)', '#ffffff', '#00e5ff');
    badgeWcW.scale.set(1.20, 0.34, 1.0);
    badgeWcW.position.set((xWallInner + xWcInner) / 2, wcFloorY + 0.35, zWcFront + 0.6);
    this.group.add(badgeWcW);

    // Chiều dài WC: 1.40m (dọc theo tường)
    const pWcL1 = new THREE.Vector3(xWcInner - 0.35, wcFloorY, zWcFront);
    const pWcL2 = new THREE.Vector3(xWcInner - 0.35, wcFloorY, zBackInner);
    this.group.add(this.createDimLine(pWcL1, pWcL2, 0x00e5ff, 0.3));
    addDashedLine(new THREE.Vector3(xWcInner, wcFloorY, zWcFront), new THREE.Vector3(xWcInner - 0.35, wcFloorY, zWcFront));
    addDashedLine(new THREE.Vector3(xWcInner, wcFloorY, zBackInner), new THREE.Vector3(xWcInner - 0.35, wcFloorY, zBackInner));

    const badgeWcL = this.createBadgeSprite('DÀI: 1.40 m', 'Dọc tường', 'rgba(10, 32, 50, 0.92)', '#ffffff', '#00e5ff');
    badgeWcL.scale.set(1.20, 0.34, 1.0);
    badgeWcL.position.set(xWcInner - 0.7, wcFloorY + 0.35, (zWcFront + zBackInner) / 2);
    this.group.add(badgeWcL);

    // Badge tổng thể WC nổi phía trên nóc WC
    const spriteWc = this.createBadgeSprite(
      'NHÀ VỆ SINH: 1.20 m × 1.40 m',
      'Vào 1.2m từ tường đối diện vỉa hè',
      'rgba(15, 30, 60, 0.94)',
      '#ffffff',
      '#00e5ff'
    );
    spriteWc.scale.set(1.60, 0.45, 1.0);
    spriteWc.position.set((xWallInner + xWcInner) / 2, wcTopY + 0.45, (zWcFront + zBackInner) / 2);
    this.group.add(spriteWc);

    // 9. BACK DOOR & SPACING (Cửa rộng 1.10m, cao 2.12m, cách WC 0.60m)
    const doorInnerZ = -halfL + 0.35; // -12.64m (bên trong sát tường sau)
    const xDoorRight = xWcInner - 0.60; // 3.35 - 0.60 = 2.75m (mép phải cửa)
    const xDoorLeft = xDoorRight - 1.10; // 2.75 - 1.10 = 1.65m (mép trái cửa)
    const xDoorCenter = (xDoorRight + xDoorLeft) / 2; // 2.20m
    const doorHeight = 2.12;

    // KHOẢNG CÁCH 0.60M (từ vách WC ra mép cửa)
    const pGap1 = new THREE.Vector3(xWcInner, wcFloorY, doorInnerZ);
    const pGap2 = new THREE.Vector3(xDoorRight, wcFloorY, doorInnerZ);
    this.group.add(this.createDimLine(pGap1, pGap2, 0x00bcd4, 0.25));
    addDashedLine(new THREE.Vector3(xWcInner, wcFloorY, -halfL + 0.20), new THREE.Vector3(xWcInner, wcFloorY, doorInnerZ));
    addDashedLine(new THREE.Vector3(xDoorRight, wcFloorY, -halfL + 0.20), new THREE.Vector3(xDoorRight, wcFloorY, doorInnerZ));

    const badgeGap = this.createBadgeSprite('KHOẢNG CÁCH: 0.60 m', 'Từ WC ra mép cửa', 'rgba(12, 35, 50, 0.92)', '#ffffff', '#00bcd4');
    badgeGap.scale.set(1.20, 0.34, 1.0);
    badgeGap.position.set((xWcInner + xDoorRight) / 2, wcFloorY + 0.35, doorInnerZ + 0.3);
    this.group.add(badgeGap);

    // CHIỀU RỘNG CỬA 1.10M
    const pDoorW1 = new THREE.Vector3(xDoorRight, wcFloorY, doorInnerZ);
    const pDoorW2 = new THREE.Vector3(xDoorLeft, wcFloorY, doorInnerZ);
    this.group.add(this.createDimLine(pDoorW1, pDoorW2, 0x4caf50, 0.3));
    addDashedLine(new THREE.Vector3(xDoorRight, wcFloorY, -halfL + 0.20), new THREE.Vector3(xDoorRight, wcFloorY, doorInnerZ));
    addDashedLine(new THREE.Vector3(xDoorLeft, wcFloorY, -halfL + 0.20), new THREE.Vector3(xDoorLeft, wcFloorY, doorInnerZ));

    const badgeDoorW = this.createBadgeSprite('CỬA HẬU: 1.10 m', 'Rộng 1.10m × Cao 2.12m', 'rgba(15, 45, 25, 0.92)', '#ffffff', '#4caf50');
    badgeDoorW.scale.set(1.30, 0.36, 1.0);
    badgeDoorW.position.set(xDoorCenter, wcFloorY + 0.40, doorInnerZ + 0.3);
    this.group.add(badgeDoorW);

    // CHIỀU CAO CỬA 2.12M
    const pDoorH1 = new THREE.Vector3(xDoorLeft - 0.20, 0.25, doorInnerZ);
    const pDoorH2 = new THREE.Vector3(xDoorLeft - 0.20, 0.25 + doorHeight, doorInnerZ);
    this.group.add(this.createDimLine(pDoorH1, pDoorH2, 0x4caf50, 0.25));
    addDashedLine(new THREE.Vector3(xDoorLeft, 0.25 + doorHeight, doorInnerZ), new THREE.Vector3(xDoorLeft - 0.20, 0.25 + doorHeight, doorInnerZ));

    const badgeDoorH = this.createBadgeSprite('CAO CỬA: 2.12 m', 'Khung bao 2.12m', 'rgba(15, 45, 25, 0.92)', '#ffffff', '#4caf50');
    badgeDoorH.scale.set(1.20, 0.34, 1.0);
    badgeDoorH.position.set(xDoorLeft - 0.60, 0.25 + doorHeight / 2, doorInnerZ + 0.15);
    this.group.add(badgeDoorH);

    // HAI CỘT ĐỐ CỬA THẲNG LÊN ĐÀ MÁI (20cm × 20cm × Cao 3.80m)
    const badgeCol = this.createBadgeSprite('CỘT ĐỐ CỬA: 20cm × 20cm', 'Thẳng lên đà mái (Cao 3.80m)', 'rgba(35, 20, 50, 0.92)', '#ffffff', '#e040fb');
    badgeCol.scale.set(1.40, 0.40, 1.0);
    badgeCol.position.set(2.85, 0.25 + 2.50, doorInnerZ + 0.35);
    this.group.add(badgeCol);

    // =========================================================================
    // 10. KÍCH THƯỚC CÁC CÂY SẮT ĐƯỢC TÔ MÀU THEO YÊU CẦU NGƯỜI DÙNG
    // =========================================================================
    const halfSpan = (W - 0.20) / 2; // 4.65m
    const chordY = colHeight + 0.25; // 4.05m
    const trussRise = ridgeHeight - chordY; // 2.55m

    // 10a. MÀU VÀNG: XÀ GỒ MÁI (PURLIN) - Chiều dài xà gồ dọc suốt nhà: 25.76 m
    const purlinX = 1.45; // Vị trí thanh xà gồ được tô màu vàng trên mái phải
    const purlinY = 6.05; // Độ cao xà gồ
    const purlinZFront = halfL - 0.11; // 12.88m
    const purlinZBack = -halfL + 0.11; // -12.88m
    const pPurlin1 = new THREE.Vector3(purlinX, purlinY, purlinZFront);
    const pPurlin2 = new THREE.Vector3(purlinX, purlinY, purlinZBack);
    this.group.add(this.createDimLine(pPurlin1, pPurlin2, 0xffd600, 0.45));
    addDashedLine(new THREE.Vector3(purlinX - 0.2, purlinY, purlinZFront), pPurlin1);
    addDashedLine(new THREE.Vector3(purlinX - 0.2, purlinY, purlinZBack), pPurlin2);

    const badgePurlin = this.createBadgeSprite(
      'XÀ GỒ MÁI: 25.76 m',
      'Thép C dọc nhà (Tổng 25.98m)',
      'rgba(45, 40, 10, 0.94)',
      '#ffffff',
      '#ffd600',
      '#fff59d'
    );
    badgePurlin.scale.set(1.50, 0.42, 1.0);
    badgePurlin.position.set(purlinX + 0.85, purlinY + 0.40, 0.0);
    this.group.add(badgePurlin);

    // 10b. MÀU XANH LÁ: KÈO NGHIÊNG MÁI (RAFTER) - Chiều dài cạnh huyền: 5.30 m
    const rafterZ = colZPositions[1]; // 7.99m (Cột 2 / Vì kèo 2)
    const pRafter1 = new THREE.Vector3(-halfSpan + 0.10, chordY + 0.20, rafterZ);
    const pRafter2 = new THREE.Vector3(0, ridgeHeight + 0.20, rafterZ);
    this.group.add(this.createDimLine(pRafter1, pRafter2, 0x00e676, 0.35));

    const badgeRafter = this.createBadgeSprite(
      'KÈO NGHIÊNG: 5.30 m',
      'Cánh trên vì kèo (Độ dốc 28.7°)',
      'rgba(15, 45, 25, 0.94)',
      '#ffffff',
      '#00e676',
      '#b9f6ca'
    );
    badgeRafter.scale.set(1.45, 0.40, 1.0);
    badgeRafter.position.set(-halfSpan / 2, (chordY + ridgeHeight) / 2 + 0.55, rafterZ);
    this.group.add(badgeRafter);

    // 10c. MÀU XANH DƯƠNG: GIẰNG ĐÁY NỬA NHỊP (BOTTOM CHORD HALF-SPAN) - Chiều dài: 4.65 m
    const chordZ = halfL + 0.38;
    const pChord1 = new THREE.Vector3(-halfSpan + 0.10, chordY - 0.40, chordZ);
    const pChord2 = new THREE.Vector3(0, chordY - 0.40, chordZ);
    this.group.add(this.createDimLine(pChord1, pChord2, 0x2979ff, 0.3));
    addDashedLine(new THREE.Vector3(-halfSpan + 0.10, chordY, chordZ), pChord1);
    addDashedLine(new THREE.Vector3(0, chordY, chordZ), pChord2);

    const badgeChord = this.createBadgeSprite(
      'GIẰNG ĐÁY NỬA NHỊP: 4.65 m',
      'Cánh dưới (Toàn nhịp vì kèo 9.30m)',
      'rgba(15, 30, 60, 0.94)',
      '#ffffff',
      '#2979ff',
      '#82b1ff'
    );
    badgeChord.scale.set(1.45, 0.40, 1.0);
    badgeChord.position.set(-halfSpan / 2, chordY - 0.70, chordZ + 0.15);
    this.group.add(badgeChord);

    // 10d. MÀU TRẮNG: 3 THANH CHỐNG ĐỨNG VÌ KÈO (VERTICAL STRUTS & KING POST)
    const strutDimZ = halfL + 0.25;

    // 1) Thanh chống đứng ngoài (Outer Strut: cách tâm 3.10m, cao 0.85m)
    const sxOuter = 3.10;
    const hOuter = 0.85;
    const pOut1 = new THREE.Vector3(-sxOuter - 0.22, chordY, strutDimZ);
    const pOut2 = new THREE.Vector3(-sxOuter - 0.22, chordY + hOuter, strutDimZ);
    this.group.add(this.createDimLine(pOut1, pOut2, 0xffffff, 0.18));

    const badgeOutStrut = this.createBadgeSprite(
      'CHỐNG ĐỨNG: 0.85 m',
      'Thanh đứng ngoài (Nhịp 2/3)',
      'rgba(25, 30, 40, 0.94)',
      '#ffffff',
      '#ffffff',
      '#cfd8dc'
    );
    badgeOutStrut.scale.set(1.20, 0.34, 1.0);
    badgeOutStrut.position.set(-sxOuter, chordY + hOuter / 2 + 0.20, strutDimZ + 0.25);
    this.group.add(badgeOutStrut);

    // 2) Thanh chống đứng trong (Inner Strut: cách tâm 1.55m, cao 1.70m)
    const sxInner = 1.55;
    const hInner = 1.70;
    const pIn1 = new THREE.Vector3(-sxInner - 0.22, chordY, strutDimZ);
    const pIn2 = new THREE.Vector3(-sxInner - 0.22, chordY + hInner, strutDimZ);
    this.group.add(this.createDimLine(pIn1, pIn2, 0xffffff, 0.18));

    const badgeInStrut = this.createBadgeSprite(
      'CHỐNG ĐỨNG: 1.70 m',
      'Thanh đứng trong (Nhịp 1/3)',
      'rgba(25, 30, 40, 0.94)',
      '#ffffff',
      '#ffffff',
      '#cfd8dc'
    );
    badgeInStrut.scale.set(1.20, 0.34, 1.0);
    badgeInStrut.position.set(-sxInner, chordY + hInner / 2 + 0.20, strutDimZ + 0.25);
    this.group.add(badgeInStrut);

    // 3) Cột chống giữa đỉnh nóc (King Post: tại trục giữa, cao 2.55m)
    const pKing1 = new THREE.Vector3(0.35, chordY, strutDimZ);
    const pKing2 = new THREE.Vector3(0.35, ridgeHeight, strutDimZ);
    this.group.add(this.createDimLine(pKing1, pKing2, 0xffffff, 0.22));

    const badgeKing = this.createBadgeSprite(
      'CHỐNG ĐỈNH NÓC: 2.55 m',
      'Cột giữa đỉnh vì kèo',
      'rgba(25, 30, 40, 0.94)',
      '#ffffff',
      '#ffffff',
      '#cfd8dc'
    );
    badgeKing.scale.set(1.35, 0.38, 1.0);
    badgeKing.position.set(0.85, chordY + trussRise / 2, strutDimZ + 0.25);
    this.group.add(badgeKing);
  }

  setVisible(visible) {
    this.visible = visible;
    this.group.visible = visible;
  }

  dispose() {
    this.scene.remove(this.group);
  }
}
