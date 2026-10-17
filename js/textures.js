/**
 * Procedural Texture Generator for House 3D Model
 * Generates realistic textures using HTML5 Canvas (100% offline, zero external image assets needed)
 */

const TextureGenerator = {
  // Tôn lợp mái sóng Thái (Corrugated Metal / Wave Tile Texture)
  createCorrugatedRoofTexture: function (baseColorHex = '#1e4b7a', width = 1024, height = 1024) {
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

    // Draw corrugated waves with shading
    for (let i = 0; i < ridgeCount; i++) {
      const x = i * ridgeWidth;
      const grad = ctx.createLinearGradient(x, 0, x + ridgeWidth, 0);
      
      grad.addColorStop(0.0, 'rgba(0,0,0,0.4)');
      grad.addColorStop(0.3, 'rgba(255,255,255,0.3)');
      grad.addColorStop(0.5, 'rgba(255,255,255,0.5)');
      grad.addColorStop(0.7, 'rgba(255,255,255,0.2)');
      grad.addColorStop(1.0, 'rgba(0,0,0,0.5)');

      ctx.fillStyle = grad;
      ctx.fillRect(x, 0, ridgeWidth, height);
    }

    // Add horizontal seam lines (khổ nối tôn dập gân)
    const seamSpacing = 128;
    for (let y = 0; y < height; y += seamSpacing) {
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(0, y, width, 3);
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.fillRect(0, y + 3, width, 2);
    }

    // Subtle metallic noise
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 15;
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
        // Normal vector components: wave profile is sin(2 * PI * u)
        // derivative is cos(2 * PI * u)
        const slope = Math.cos(u * Math.PI * 2);
        
        // Map slope to red channel (X normal): -1..1 -> 0..255
        const nx = Math.floor((slope * 0.7 + 1) * 0.5 * 255);
        const ny = 128; // flat in Y
        const nz = 230; // facing outward

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

    // Light warm gray base
    ctx.fillStyle = '#d6d3ce';
    ctx.fillRect(0, 0, width, height);

    // Expansion joints / Tile grid lines (e.g. 1m or 2m squares)
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

    // Concrete fine flecks / speckles
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const speckle = (Math.random() - 0.5) * 20;
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

  // Tường sơn mịn có chỉ viền chân tường (Plinth / Wall plaster)
  createWallTexture: function (width = 512, height = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Warm white plaster
    ctx.fillStyle = '#f3f2ee';
    ctx.fillRect(0, 0, width, height);

    // Subtle plaster grain
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const grain = (Math.random() - 0.5) * 12;
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

  // Gạch ốp chân tường (Plinth tile pattern)
  createPlinthTexture: function (width = 512, height = 256) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#4a5056';
    ctx.fillRect(0, 0, width, height);

    // Horizontal grooves
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

  // Sân gạch bê tông / đường dạo bên ngoài
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

  // Thảm cỏ tự nhiên bên ngoài
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
  }
};
