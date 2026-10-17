import * as THREE from 'three';

/**
 * Procedural Texture Generator for House 3D Model
 * Generates realistic PBR textures using HTML5 Canvas (100% offline, zero external image assets needed)
 */

export const TextureGenerator = {
  // Tôn lợp mái sóng Thái (Corrugated Metal / Wave Profile Texture)
  createCorrugatedRoofTexture: function (baseColorHex = '#1d4872', width = 1024, height = 1024) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Base background
    ctx.fillStyle = baseColorHex;
    ctx.fillRect(0, 0, width, height);

    // Number of corrugation ridges along width
    const ridgeCount = 64;
    const ridgeWidth = width / ridgeCount;

    // Draw corrugated waves with realistic metallic highlights & shadows
    for (let i = 0; i < ridgeCount; i++) {
      const x = i * ridgeWidth;
      const grad = ctx.createLinearGradient(x, 0, x + ridgeWidth, 0);
      
      grad.addColorStop(0.0, 'rgba(0, 0, 0, 0.45)');
      grad.addColorStop(0.25, 'rgba(255, 255, 255, 0.15)');
      grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.45)');
      grad.addColorStop(0.75, 'rgba(255, 255, 255, 0.1)');
      grad.addColorStop(1.0, 'rgba(0, 0, 0, 0.55)');

      ctx.fillStyle = grad;
      ctx.fillRect(x, 0, ridgeWidth, height);
    }

    // Horizontal seams (mép nối khổ tôn theo chiều dài dốc)
    const seamSpacing = 128;
    for (let y = 0; y < height; y += seamSpacing) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.fillRect(0, y, width, 3);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.fillRect(0, y + 3, width, 2);
    }

    // Metallic grain
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 16;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  },

  // Normal Map cho tôn lợp mái (gives deep 3D ridges under dynamic lighting)
  createCorrugatedRoofNormalMap: function (width = 512, height = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;
    const ridgeCount = 32;
    const ridgeWidth = width / ridgeCount;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const u = (x % ridgeWidth) / ridgeWidth; // 0 to 1
        const slope = Math.cos(u * Math.PI * 2);
        
        const nx = Math.floor((slope * 0.7 + 1) * 0.5 * 255);
        const ny = 128;
        const nz = 230;

        const idx = (y * width + x) * 4;
        data[idx] = nx;
        data[idx + 1] = ny;
        data[idx + 2] = nz;
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  },

  // Sàn bê tông mài bóng / gạch men bóng kiếng
  createFloorTexture: function (width = 1024, height = 1024) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#d6d3ce';
    ctx.fillRect(0, 0, width, height);

    // Expansion joints / tile grid lines
    const gridSize = 128;
    ctx.strokeStyle = 'rgba(100, 95, 90, 0.45)';
    ctx.lineWidth = 3;

    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Concrete fine flecks
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const speckle = (Math.random() - 0.5) * 18;
      data[i] = Math.min(255, Math.max(0, data[i] + speckle));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + speckle));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + speckle));
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  },

  // Tường sơn mịn có chỉ viền chân tường
  createWallTexture: function (width = 512, height = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#f3f2ee';
    ctx.fillRect(0, 0, width, height);

    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const grain = (Math.random() - 0.5) * 10;
      data[i] = Math.min(255, Math.max(0, data[i] + grain));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + grain));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + grain));
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  },

  // Gạch ốp chân tường
  createPlinthTexture: function (width = 512, height = 256) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#4a5056';
    ctx.fillRect(0, 0, width, height);

    const tileH = 32;
    ctx.strokeStyle = '#2b3036';
    ctx.lineWidth = 2;
    for (let y = 0; y <= height; y += tileH) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  },

  // Sân gạch bê tông bên ngoài
  createPavementTexture: function (width = 512, height = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#b0b3b8';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#7c8087';
    ctx.lineWidth = 2;
    const step = 64;
    for (let x = 0; x <= width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  },

  // Thảm cỏ tự nhiên
  createGrassTexture: function (width = 512, height = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#4b7336';
    ctx.fillRect(0, 0, width, height);

    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const n = (Math.random() - 0.5) * 35;
      data[i] = Math.min(255, Math.max(0, data[i] + n * 0.7));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + n));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + n * 0.3));
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  },

  // Vỉa hè lát gạch Terrazzo / Block 400x400 chống trơn
  createSidewalkTileTexture: function (width = 512, height = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Light warm sand/grey paving
    ctx.fillStyle = '#c5c2ba';
    ctx.fillRect(0, 0, width, height);

    // 400x400 grid lines
    const tileSize = 64;
    ctx.strokeStyle = '#8e8b84';
    ctx.lineWidth = 3;

    for (let x = 0; x <= width; x += tileSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += tileSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Speckled aggregate pattern
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const n = (Math.random() - 0.5) * 22;
      data[i] = Math.min(255, Math.max(0, data[i] + n));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + n));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + n));
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  },

  // Đường nhựa Asphalt xe chạy (màu xám đen có hạt nhám)
  createAsphaltTexture: function (width = 512, height = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#2b2e33';
    ctx.fillRect(0, 0, width, height);

    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const n = (Math.random() - 0.5) * 28;
      data[i] = Math.min(255, Math.max(0, data[i] + n));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + n));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + n));
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  },

  // 1. Cửa Kéo Đài Loan (Ảnh 1 - Màu kem nhạt, nhíp la hình thoi hoa văn zíc zắc & lá dập sóng)
  createTaiwanAccordionDoorTexture: function (baseColorHex = '#efe8d8', width = 1024, height = 1024) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Nền màu vàng kem / champagne
    ctx.fillStyle = baseColorHex;
    ctx.fillRect(0, 0, width, height);

    // Lá tôn dập gân sóng đứng
    const slatW = 16;
    for (let x = 0; x < width; x += slatW) {
      const grad = ctx.createLinearGradient(x, 0, x + slatW, 0);
      grad.addColorStop(0.0, 'rgba(0, 0, 0, 0.22)');
      grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.22)');
      grad.addColorStop(0.7, 'rgba(255, 255, 255, 0.08)');
      grad.addColorStop(1.0, 'rgba(0, 0, 0, 0.25)');
      ctx.fillStyle = grad;
      ctx.fillRect(x, 0, slatW, height);
    }

    // Các thanh U đứng chịu lực
    const uBarSpacing = 64;
    for (let x = 0; x < width; x += uBarSpacing) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.fillRect(x - 2, 0, 20, height);

      const uGrad = ctx.createLinearGradient(x, 0, x + 16, 0);
      uGrad.addColorStop(0.0, '#d9d1be');
      uGrad.addColorStop(0.25, '#fbf8f0');
      uGrad.addColorStop(0.75, '#ede6d4');
      uGrad.addColorStop(1.0, '#c5bca8');
      ctx.fillStyle = uGrad;
      ctx.fillRect(x, 0, 16, height);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.fillRect(x + 7, 0, 2, height);
    }

    // Nhíp la hoa văn hình thoi đan chéo chữ X (3 tầng nhíp: trên, giữa, dưới)
    const tiers = [
      { y1: 80, y2: 340 },
      { y1: 380, y2: 640 },
      { y1: 680, y2: 940 }
    ];

    ctx.lineWidth = 6;
    ctx.lineCap = 'round';

    tiers.forEach(tier => {
      const midY = (tier.y1 + tier.y2) / 2;

      for (let x = 0; x < width + uBarSpacing; x += uBarSpacing) {
        // Đổ bóng nhíp
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.moveTo(x - uBarSpacing / 2 + 2, tier.y1 + 2);
        ctx.lineTo(x + uBarSpacing / 2 + 2, tier.y2 + 2);
        ctx.moveTo(x - uBarSpacing / 2 + 2, tier.y2 + 2);
        ctx.lineTo(x + uBarSpacing / 2 + 2, tier.y1 + 2);
        ctx.stroke();

        // Thanh nhíp kem sáng
        ctx.strokeStyle = '#f8f4e8';
        ctx.beginPath();
        ctx.moveTo(x - uBarSpacing / 2, tier.y1);
        ctx.lineTo(x + uBarSpacing / 2, tier.y2);
        ctx.moveTo(x - uBarSpacing / 2, tier.y2);
        ctx.lineTo(x + uBarSpacing / 2, tier.y1);
        ctx.stroke();

        // Nhíp phụ đan chéo
        ctx.beginPath();
        ctx.moveTo(x - uBarSpacing / 2, midY);
        ctx.lineTo(x + uBarSpacing / 2, tier.y1);
        ctx.moveTo(x - uBarSpacing / 2, midY);
        ctx.lineTo(x + uBarSpacing / 2, tier.y2);
        ctx.stroke();

        // Tán đinh tròn vàng đồng tại các khớp
        [tier.y1, midY, tier.y2].forEach(ry => {
          ctx.fillStyle = '#bfa15f';
          ctx.beginPath();
          ctx.arc(x, ry, 4.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffecb3';
          ctx.beginPath();
          ctx.arc(x - 1, ry - 1, 2, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    });

    // Nhiễu hạt kim loại
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const n = (Math.random() - 0.5) * 12;
      data[i] = Math.min(255, Math.max(0, data[i] + n));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + n));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + n));
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  },

  // 2. Cửa Sắt 4 Cánh Hiện Đại (Ảnh 2 - Màu xanh xám ghi, nan đứng thông thoáng phía trên, lá sách louver phía dưới)
  createModernIronGateTexture: function (baseColorHex = '#7a8982', width = 1024, height = 1024) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Nền tối bên trong sau chấn song
    ctx.fillStyle = '#1c2220';
    ctx.fillRect(0, 0, width, height);

    const panelCount = 4;
    const panelW = width / panelCount; // 256px
    const splitY = height * 0.65; // ~665px (65% nan đứng, 35% lá sách)

    for (let p = 0; p < panelCount; p++) {
      const px = p * panelW;
      const frameMargin = 4;
      const pw = panelW - frameMargin * 2;
      const ph = height - frameMargin * 2;
      const fx = px + frameMargin;
      const fy = frameMargin;

      // 1. PHẦN DƯỚI: LÁ SÁCH NGANG (LOUVER SLATS)
      const louverCount = 14;
      const louverH = (height - splitY - 24) / louverCount;
      for (let l = 0; l < louverCount; l++) {
        const ly = splitY + 12 + l * louverH;
        const lGrad = ctx.createLinearGradient(0, ly, 0, ly + louverH);
        lGrad.addColorStop(0.0, 'rgba(0, 0, 0, 0.7)');
        lGrad.addColorStop(0.15, '#92a39b');
        lGrad.addColorStop(0.7, '#74837c');
        lGrad.addColorStop(1.0, '#536059');
        ctx.fillStyle = lGrad;
        ctx.fillRect(fx + 10, ly + 2, pw - 20, louverH - 3);
      }

      // 2. DẢI LƯỚI ĐỤC LỖ / LƯỚI CHẮN MẮT CÁO Ở ĐOẠN GIỮA
      const meshY1 = splitY - 110;
      const meshY2 = splitY - 10;
      ctx.fillStyle = '#323c38';
      ctx.fillRect(fx + 10, meshY1, pw - 20, meshY2 - meshY1);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
      for (let mx = fx + 14; mx < fx + pw - 12; mx += 10) {
        for (let my = meshY1 + 4; my < meshY2 - 4; my += 10) {
          ctx.beginPath();
          ctx.arc(mx, my, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 3. PHẦN TRÊN: NAN SẮT HỘP ĐỨNG SONG SONG
      const barCount = 7;
      const barSpacing = (pw - 24) / barCount;
      const barW = 14;

      for (let b = 0; b < barCount; b++) {
        const bx = fx + 12 + b * barSpacing;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
        ctx.fillRect(bx - 2, fy + 12, barW + 4, splitY - 24);

        const barGrad = ctx.createLinearGradient(bx, 0, bx + barW, 0);
        barGrad.addColorStop(0.0, '#56635c');
        barGrad.addColorStop(0.2, '#99aba2');
        barGrad.addColorStop(0.7, '#7e8f87');
        barGrad.addColorStop(1.0, '#505d56');
        ctx.fillStyle = barGrad;
        ctx.fillRect(bx, fy + 12, barW, splitY - 24);
      }

      // Đố ngang đính bi tán tròn trang trí màu trắng bạc
      const tieYs = [fy + 140, fy + 340, splitY - 120];
      tieYs.forEach(ty => {
        ctx.fillStyle = '#65746d';
        ctx.fillRect(fx + 6, ty, pw - 12, 10);

        for (let b = 0; b < barCount; b++) {
          const rx = fx + 12 + b * barSpacing + barW / 2;
          ctx.fillStyle = '#e8eeea';
          ctx.beginPath();
          ctx.arc(rx, ty + 5, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#39443e';
          ctx.beginPath();
          ctx.arc(rx, ty + 7, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Khung bao sắt hộp bao quanh mỗi cánh
      ctx.lineWidth = 10;
      ctx.strokeStyle = '#687770';
      ctx.strokeRect(fx + 5, fy + 5, pw - 10, ph - 10);

      // Đố ngang phân cách trên dưới
      ctx.fillStyle = '#5c6a63';
      ctx.fillRect(fx + 6, splitY - 6, pw - 12, 12);
    }

    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const n = (Math.random() - 0.5) * 10;
      data[i] = Math.min(255, Math.max(0, data[i] + n));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + n));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + n));
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }
};
