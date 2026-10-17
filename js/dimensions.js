/**
 * Dimensions & 3D Annotations Module
 * Renders dimensional lines, tick marks, and readable badges for:
 * - Total Length: 25.98 m
 * - Total Width: 9.50 m
 * - 5 Bays (5 Ô nhịp): 5.196 m each (6 column positions)
 * - Column Height: 4.20 m
 * - Roof Ridge Height: 7.00 m
 */

class DimensionRenderer {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'dimensionGroup';
    this.scene.add(this.group);
    this.visible = true;

    this.initDimensions();
  }

  // Create a sprite label with nice rounded background tag
  createBadgeSprite(text, subtext = '', bgColor = 'rgba(26, 43, 76, 0.92)', textColor = '#ffffff', borderColor = '#00d2ff') {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 180;

    // Draw rounded rectangle
    const x = 16, y = 16, w = 480, h = 148, r = 24;
    ctx.fillStyle = bgColor;
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 6;

    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Main text
    ctx.fillStyle = textColor;
    ctx.font = 'bold 56px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const mainY = subtext ? y + 54 : y + h / 2;
    ctx.fillText(text, x + w / 2, mainY);

    // Subtext
    if (subtext) {
      ctx.fillStyle = '#b0d5f8';
      ctx.font = 'normal 32px "Segoe UI", Arial, sans-serif';
      ctx.fillText(subtext, x + w / 2, y + 104);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const spriteMaterial = new THREE.SpriteMaterial({
      map: texture,
      depthTest: false,
      depthWrite: false
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(3.2, 1.15, 1.0);
    return sprite;
  }

  // Draw dimension line with tick marks
  createDimLine(p1, p2, color = 0x00d2ff, tickLength = 0.5) {
    const group = new THREE.Group();
    const material = new THREE.LineBasicMaterial({
      color: color,
      linewidth: 3,
      depthTest: false,
      depthWrite: false
    });

    // Main line
    const points = [p1, p2];
    const geom = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geom, material);
    group.add(line);

    // Direction
    const dir = new THREE.Vector3().subVectors(p2, p1).normalize();
    // Up or perp vector for ticks
    let perp = new THREE.Vector3(0, 1, 0);
    if (Math.abs(dir.y) > 0.9) {
      perp = new THREE.Vector3(1, 0, 0);
    } else {
      perp.crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize();
      if (perp.lengthSq() < 0.1) perp = new THREE.Vector3(0, 1, 0);
    }

    // Tick at p1
    const t1A = p1.clone().addScaledVector(perp, tickLength);
    const t1B = p1.clone().addScaledVector(perp, -tickLength);
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([t1A, t1B]), material));

    // Tick at p2
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
    const bayCount = 5;
    const bayLength = L / bayCount; // 5.196
    const colHeight = 4.20;
    const ridgeHeight = 7.00;

    // 1. DIMENSION: TOTAL LENGTH (25.98 m) - offset along right side (X = +6.8m, Y = 0.3m)
    const lenX = halfW + 2.2;
    const pLenStart = new THREE.Vector3(lenX, 0.3, halfL);
    const pLenEnd = new THREE.Vector3(lenX, 0.3, -halfL);
    this.group.add(this.createDimLine(pLenStart, pLenEnd, 0x00e1d9, 0.6));

    // Extension lines from house to dimension line
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
    addDashedLine(new THREE.Vector3(halfW + 0.3, 0.3, halfL), new THREE.Vector3(lenX + 0.4, 0.3, halfL));
    addDashedLine(new THREE.Vector3(halfW + 0.3, 0.3, -halfL), new THREE.Vector3(lenX + 0.4, 0.3, -halfL));

    const spriteLen = this.createBadgeSprite('CHIỀU DÀI: 25.98 m', 'Tổng 5 ô nhịp');
    spriteLen.position.set(lenX + 1.2, 0.5, 0);
    this.group.add(spriteLen);

    // 2. DIMENSIONS: 5 BAYS (Ô NHỊP CỘT = 5.196 m each)
    // Offset along left side (X = - halfW - 2.0m)
    const bayX = -halfW - 2.0;
    for (let i = 0; i < bayCount; i++) {
      const z1 = halfL - i * bayLength;
      const z2 = halfL - (i + 1) * bayLength;
      const pt1 = new THREE.Vector3(bayX, 0.3, z1);
      const pt2 = new THREE.Vector3(bayX, 0.3, z2);
      this.group.add(this.createDimLine(pt1, pt2, 0xffa726, 0.4));

      addDashedLine(new THREE.Vector3(-halfW - 0.3, 0.3, z1), new THREE.Vector3(bayX - 0.3, 0.3, z1));
      if (i === bayCount - 1) {
        addDashedLine(new THREE.Vector3(-halfW - 0.3, 0.3, z2), new THREE.Vector3(bayX - 0.3, 0.3, z2));
      }

      const bayBadge = this.createBadgeSprite(
        `Ô ${i + 1}: 5.20 m`,
        `Cột ${i + 1} ➔ Cột ${i + 2}`,
        'rgba(30, 25, 45, 0.90)',
        '#ffffff',
        '#ffb74d'
      );
      bayBadge.scale.set(2.4, 0.95, 1.0);
      bayBadge.position.set(bayX - 1.2, 0.5, (z1 + z2) / 2);
      this.group.add(bayBadge);
    }

    // 3. DIMENSION: TOTAL WIDTH (9.50 m) - Front Facade (Z = +halfL + 2.2m)
    const frontZ = halfL + 2.2;
    const pW1 = new THREE.Vector3(-halfW, 0.3, frontZ);
    const pW2 = new THREE.Vector3(halfW, 0.3, frontZ);
    this.group.add(this.createDimLine(pW1, pW2, 0x00e676, 0.6));
    addDashedLine(new THREE.Vector3(-halfW, 0.3, halfL + 0.3), new THREE.Vector3(-halfW, 0.3, frontZ + 0.4));
    addDashedLine(new THREE.Vector3(halfW, 0.3, halfL + 0.3), new THREE.Vector3(halfW, 0.3, frontZ + 0.4));

    const spriteWidth = this.createBadgeSprite('CHIỀU RỘNG: 9.50 m', 'Không gian trống suốt', 'rgba(15, 40, 25, 0.92)', '#ffffff', '#00e676');
    spriteWidth.position.set(0, 0.5, frontZ + 1.2);
    this.group.add(spriteWidth);

    // 4. DIMENSION: COLUMN HEIGHT (4.20 m) - at front-right corner
    const hX = halfW + 1.2;
    const hZ = halfL + 0.8;
    const pHStart = new THREE.Vector3(hX, 0.0, hZ);
    const pHEnd = new THREE.Vector3(hX, colHeight, hZ);
    this.group.add(this.createDimLine(pHStart, pHEnd, 0xe040fb, 0.5));
    const spriteColH = this.createBadgeSprite('CAO CỘT: 4.20 m', 'Giọt sành mái', 'rgba(40, 15, 45, 0.92)', '#ffffff', '#e040fb');
    spriteColH.scale.set(2.6, 1.0, 1.0);
    spriteColH.position.set(hX + 1.4, colHeight / 2, hZ);
    this.group.add(spriteColH);

    // 5. DIMENSION: RIDGE HEIGHT (7.00 m) - at front center
    const rX = 0;
    const rZ = halfL + 1.0;
    const pRStart = new THREE.Vector3(rX, 0.0, rZ);
    const pREnd = new THREE.Vector3(rX, ridgeHeight, rZ);
    this.group.add(this.createDimLine(pRStart, pREnd, 0xffd600, 0.5));
    const spriteRidge = this.createBadgeSprite('ĐỈNH MÁI: 7.00 m', 'Độ dốc Mái Thái', 'rgba(45, 40, 10, 0.92)', '#ffffff', '#ffd600');
    spriteRidge.scale.set(2.6, 1.0, 1.0);
    spriteRidge.position.set(rX - 1.8, ridgeHeight - 1.2, rZ);
    this.group.add(spriteRidge);
  }

  setVisible(visible) {
    this.visible = visible;
    this.group.visible = visible;
  }
}
