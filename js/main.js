/**
 * Main Application Controller
 * Three.js scene setup, Camera, Lighting, Interaction and UI Events
 */

class App {
  constructor() {
    this.container = document.getElementById('webgl-container');
    this.isNight = false;
    this.autoRotate = false;
    this.fpsCounter = document.getElementById('fps-counter');
    this.frameCount = 0;
    this.lastFpsUpdate = performance.now();

    this.initScene();
    this.initLighting();
    this.initModel();
    this.initControls();
    this.initUI();
    this.animate();

    window.addEventListener('resize', () => this.onWindowResize());
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#d4e6f1');
    this.scene.fog = new THREE.FogExp2(0xd4e6f1, 0.008);

    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    // Initial isometric view
    this.camera.position.set(28, 16, 32);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    this.container.appendChild(this.renderer.domElement);
  }

  initLighting() {
    // Ambient / Hemisphere light
    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0x444455, 0.65);
    this.hemiLight.position.set(0, 50, 0);
    this.scene.add(this.hemiLight);

    // Directional sunlight
    this.sunLight = new THREE.DirectionalLight(0xfffaed, 1.25);
    this.sunLight.position.set(40, 60, 30);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 10;
    this.sunLight.shadow.camera.far = 150;
    this.sunLight.shadow.camera.left = -30;
    this.sunLight.shadow.camera.right = 30;
    this.sunLight.shadow.camera.top = 30;
    this.sunLight.shadow.camera.bottom = -30;
    this.sunLight.shadow.bias = -0.0005;
    this.scene.add(this.sunLight);

    // Subtle fill light
    this.fillLight = new THREE.DirectionalLight(0xddeeff, 0.35);
    this.fillLight.position.set(-30, 20, -30);
    this.scene.add(this.fillLight);
  }

  initModel() {
    // 3D House Model
    this.house = new HouseModel(this.scene);

    // 3D Dimensions & Annotations
    this.dimensions = new DimensionRenderer(this.scene);
  }

  initControls() {
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.target.set(0, 3.2, 0);
    this.controls.maxPolarAngle = Math.PI / 2 - 0.02; // Prevent going underground
    this.controls.minDistance = 3;
    this.controls.maxDistance = 120;
    this.controls.update();
  }

  // Smooth camera animation to target position & lookAt
  tweenCamera(targetPos, targetLookAt, duration = 1200) {
    const startPos = this.camera.position.clone();
    const startLookAt = this.controls.target.clone();
    const startTime = performance.now();

    const animateTransition = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1.0);
      // Smooth easeInOutCubic
      const ease = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      this.camera.position.lerpVectors(startPos, targetPos, ease);
      this.controls.target.lerpVectors(startLookAt, targetLookAt, ease);
      this.controls.update();

      if (progress < 1.0) {
        requestAnimationFrame(animateTransition);
      }
    };

    requestAnimationFrame(animateTransition);
  }

  setCameraPreset(preset) {
    switch (preset) {
      case 'iso':
        this.tweenCamera(new THREE.Vector3(26, 15, 30), new THREE.Vector3(0, 3, 0));
        break;
      case 'front':
        this.tweenCamera(new THREE.Vector3(0, 4.2, 32), new THREE.Vector3(0, 3.5, 10));
        break;
      case 'side':
        this.tweenCamera(new THREE.Vector3(34, 4.5, 0), new THREE.Vector3(0, 3.5, 0));
        break;
      case 'top':
        this.tweenCamera(new THREE.Vector3(0, 42, 0.01), new THREE.Vector3(0, 0, 0));
        break;
      case 'inside':
        // Move inside the empty hall
        this.tweenCamera(new THREE.Vector3(0, 1.8, 10.5), new THREE.Vector3(0, 2.2, -5.0));
        break;
    }
  }

  toggleDayNight() {
    this.isNight = !this.isNight;
    const btn = document.getElementById('btn-day-night');

    if (this.isNight) {
      // Night theme
      this.scene.background.set('#0b101d');
      this.scene.fog.color.set('#0b101d');
      this.hemiLight.color.set('#223355');
      this.hemiLight.groundColor.set('#111822');
      this.hemiLight.intensity = 0.25;

      this.sunLight.color.set('#5c7099'); // Moonlight
      this.sunLight.intensity = 0.3;
      this.fillLight.intensity = 0.1;

      this.house.setDayNight(true);
      btn.innerHTML = '🌙 Ban đêm';
      btn.classList.add('active');
    } else {
      // Day theme
      this.scene.background.set('#d4e6f1');
      this.scene.fog.color.set('#d4e6f1');
      this.hemiLight.color.set('#ffffff');
      this.hemiLight.groundColor.set('#444455');
      this.hemiLight.intensity = 0.65;

      this.sunLight.color.set('#fffaed');
      this.sunLight.intensity = 1.25;
      this.fillLight.intensity = 0.35;

      this.house.setDayNight(false);
      btn.innerHTML = '☀️ Ban ngày';
      btn.classList.remove('active');
    }
  }

  takeScreenshot() {
    // Render current frame
    this.renderer.render(this.scene, this.camera);
    const dataURL = this.renderer.domElement.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'Nha-Mai-Thai-25.98m-x-9.5m.png';
    link.href = dataURL;
    link.click();
  }

  initUI() {
    // Camera Presets
    document.querySelectorAll('[data-preset]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('[data-preset]').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.setCameraPreset(e.currentTarget.dataset.preset);
      });
    });

    // Roof Opacity Slider
    const roofOpacitySlider = document.getElementById('roof-opacity');
    const roofOpacityVal = document.getElementById('roof-opacity-val');
    if (roofOpacitySlider) {
      roofOpacitySlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        this.house.setRoofOpacity(val);
        roofOpacityVal.textContent = Math.round(val * 100) + '%';
      });
    }

    // Quick Roof X-Ray / Open button
    const btnQuickRoof = document.getElementById('btn-quick-roof');
    let roofHidden = false;
    if (btnQuickRoof) {
      btnQuickRoof.addEventListener('click', () => {
        roofHidden = !roofHidden;
        const val = roofHidden ? 0.15 : 1.0;
        this.house.setRoofOpacity(val);
        if (roofOpacitySlider) roofOpacitySlider.value = val;
        if (roofOpacityVal) roofOpacityVal.textContent = Math.round(val * 100) + '%';
        btnQuickRoof.classList.toggle('active', roofHidden);
        btnQuickRoof.innerHTML = roofHidden ? '🔓 Mái: Xuyên thấu' : '🏠 Mái: Đóng';
      });
    }

    // Layer Toggles
    const layerCheckboxes = {
      'layer-roof': 'roof',
      'layer-walls': 'walls',
      'layer-structure': 'structure',
      'layer-columns': 'columns',
      'layer-interior': 'interior',
      'layer-ground': 'environment',
      'layer-lights': 'lights'
    };

    for (const [id, layer] of Object.entries(layerCheckboxes)) {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('change', (e) => {
          this.house.toggleLayer(layer, e.target.checked);
        });
      }
    }

    // Dimension lines toggle
    const dimCheckbox = document.getElementById('layer-dimensions');
    if (dimCheckbox) {
      dimCheckbox.addEventListener('change', (e) => {
        this.dimensions.setVisible(e.target.checked);
      });
    }

    // Roof Color Swatches
    document.querySelectorAll('.color-swatch').forEach(swatch => {
      swatch.addEventListener('click', (e) => {
        document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const color = e.currentTarget.dataset.color;
        this.house.setRoofColor(color);
      });
    });

    // Day/Night toggle
    const btnDayNight = document.getElementById('btn-day-night');
    if (btnDayNight) {
      btnDayNight.addEventListener('click', () => this.toggleDayNight());
    }

    // Auto rotate toggle
    const btnAutoRotate = document.getElementById('btn-auto-rotate');
    if (btnAutoRotate) {
      btnAutoRotate.addEventListener('click', () => {
        this.autoRotate = !this.autoRotate;
        this.controls.autoRotate = this.autoRotate;
        this.controls.autoRotateSpeed = 1.6;
        btnAutoRotate.classList.toggle('active', this.autoRotate);
      });
    }

    // Screenshot button
    const btnScreenshot = document.getElementById('btn-screenshot');
    if (btnScreenshot) {
      btnScreenshot.addEventListener('click', () => this.takeScreenshot());
    }

    // Reset view
    const btnReset = document.getElementById('btn-reset');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        document.querySelector('[data-preset="iso"]')?.click();
      });
    }

    // Mobile sidebar toggle
    const btnMenu = document.getElementById('btn-toggle-menu');
    const sidebar = document.getElementById('sidebar');
    if (btnMenu && sidebar) {
      btnMenu.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
      });
    }
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    this.controls.update();
    this.renderer.render(this.scene, this.camera);

    // FPS counter
    this.frameCount++;
    const now = performance.now();
    if (now - this.lastFpsUpdate >= 1000) {
      if (this.fpsCounter) {
        this.fpsCounter.textContent = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate)) + ' FPS';
      }
      this.frameCount = 0;
      this.lastFpsUpdate = now;
    }
  }
}

// Bootstrap after DOM ready
window.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
