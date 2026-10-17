import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { HouseModel } from '../core/houseModel';
import { DimensionRenderer } from '../core/dimensions';

export const HouseViewer3D = forwardRef(function HouseViewer3D(
  {
    onFpsUpdate,
    roofOpacity,
    roofColor,
    doorType,
    doorOpenProgress,
    layers,
    showDimensions,
    isNight,
    autoRotate
  },
  ref
) {
  const mountRef = useRef(null);

  // Three.js instances stored in refs
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const houseRef = useRef(null);
  const dimensionsRef = useRef(null);
  const lightsRef = useRef({});

  // Camera tween helper
  const tweenCamera = (targetPos, targetLookAt, duration = 1000) => {
    if (!cameraRef.current || !controlsRef.current) return;
    const camera = cameraRef.current;
    const controls = controlsRef.current;

    const startPos = camera.position.clone();
    const startLookAt = controls.target.clone();
    const startTime = performance.now();

    const animateTransition = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1.0);
      const ease = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      camera.position.lerpVectors(startPos, targetPos, ease);
      controls.target.lerpVectors(startLookAt, targetLookAt, ease);
      controls.update();

      if (progress < 1.0) {
        requestAnimationFrame(animateTransition);
      }
    };

    requestAnimationFrame(animateTransition);
  };

  // Expose imperative methods to parent
  useImperativeHandle(ref, () => ({
    setCameraPreset(preset) {
      switch (preset) {
        case 'iso':
          tweenCamera(new THREE.Vector3(26, 16, 30), new THREE.Vector3(0, 3, 0));
          break;
        case 'front':
          tweenCamera(new THREE.Vector3(0, 4.2, 32), new THREE.Vector3(0, 3.5, 10));
          break;
        case 'side':
          tweenCamera(new THREE.Vector3(-28, 4.5, 0), new THREE.Vector3(0, 3.5, 0));
          break;
        case 'top':
          tweenCamera(new THREE.Vector3(0, 42, 0.01), new THREE.Vector3(0, 0, 0));
          break;
        case 'inside':
          tweenCamera(new THREE.Vector3(0, 1.8, 10.5), new THREE.Vector3(0, 2.2, -5.0));
          break;
        case 'wc':
          tweenCamera(new THREE.Vector3(1.2, 2.4, -8.5), new THREE.Vector3(3.8, 1.5, -12.0));
          break;
        case 'door':
          tweenCamera(new THREE.Vector3(2.2, 1.8, -7.5), new THREE.Vector3(2.3, 1.4, -12.8));
          break;
        case 'back':
          tweenCamera(new THREE.Vector3(2.0, 3.2, -22.0), new THREE.Vector3(1.5, 2.0, -12.9));
          break;
        case 'doors_side':
          tweenCamera(new THREE.Vector3(-18, 4.0, 7.5), new THREE.Vector3(-4.65, 2.2, 2.0));
          break;
        case 'doors_front':
          tweenCamera(new THREE.Vector3(0, 3.5, 23), new THREE.Vector3(0, 2.2, 12.9));
          break;
        default:
          break;
      }
    },
    takeScreenshot() {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      const dataURL = rendererRef.current.domElement.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'Nha-Mai-Thai-25.98m-x-9.5m.png';
      link.href = dataURL;
      link.click();
    },
    resetCamera() {
      tweenCamera(new THREE.Vector3(26, 16, 30), new THREE.Vector3(0, 3, 0));
    }
  }));

  // Initial Scene Setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#d4e6f1');
    scene.fog = new THREE.FogExp2(0xd4e6f1, 0.008);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(28, 16, 32);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 3.2, 0);
    controls.maxPolarAngle = Math.PI / 2 - 0.02;
    controls.minDistance = 3;
    controls.maxDistance = 120;
    controlsRef.current = controls;

    // 5. Lighting
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444455, 0.65);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfffaed, 1.25);
    sunLight.position.set(40, 60, 30);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 150;
    sunLight.shadow.camera.left = -30;
    sunLight.shadow.camera.right = 30;
    sunLight.shadow.camera.top = 30;
    sunLight.shadow.camera.bottom = -30;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0xddeeff, 0.35);
    fillLight.position.set(-30, 20, -30);
    scene.add(fillLight);

    lightsRef.current = { hemiLight, sunLight, fillLight };

    // 6. House Model & Dimensions
    const house = new HouseModel(scene);
    houseRef.current = house;

    const dimensions = new DimensionRenderer(scene);
    dimensionsRef.current = dimensions;

    // 7. Render Loop & FPS Counter
    let animationId;
    let frameCount = 0;
    let lastFpsTime = performance.now();

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      controls.update();
      renderer.render(scene, camera);

      frameCount++;
      const now = performance.now();
      if (now - lastFpsTime >= 1000) {
        if (onFpsUpdate) {
          onFpsUpdate(Math.round((frameCount * 1000) / (now - lastFpsTime)));
        }
        frameCount = 0;
        lastFpsTime = now;
      }
    };
    animate();

    // 8. Resize Listener
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      house.dispose();
      dimensions.dispose();
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update Roof Opacity
  useEffect(() => {
    if (houseRef.current) {
      houseRef.current.setRoofOpacity(roofOpacity);
    }
  }, [roofOpacity]);

  // Update Roof Color
  useEffect(() => {
    if (houseRef.current && roofColor) {
      houseRef.current.setRoofColor(roofColor);
    }
  }, [roofColor]);

  // Update Door Type Simulation
  useEffect(() => {
    if (houseRef.current && doorType !== undefined) {
      houseRef.current.setDoorType(doorType);
    }
  }, [doorType]);

  // Update Door Opening / Closing Progress
  useEffect(() => {
    if (houseRef.current && doorOpenProgress !== undefined) {
      houseRef.current.setDoorOpenProgress(doorOpenProgress);
    }
  }, [doorOpenProgress]);

  // Update Layer Visibilities
  useEffect(() => {
    if (houseRef.current && layers) {
      Object.entries(layers).forEach(([layer, visible]) => {
        houseRef.current.toggleLayer(layer, visible);
      });
    }
  }, [layers]);

  // Update Dimensions Visibility
  useEffect(() => {
    if (dimensionsRef.current) {
      dimensionsRef.current.setVisible(showDimensions);
    }
  }, [showDimensions]);

  // Update Auto-Rotate
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
      controlsRef.current.autoRotateSpeed = 1.6;
    }
  }, [autoRotate]);

  // Update Day / Night Mode
  useEffect(() => {
    const scene = sceneRef.current;
    const house = houseRef.current;
    const { hemiLight, sunLight, fillLight } = lightsRef.current;

    if (!scene || !hemiLight || !sunLight || !fillLight || !house) return;

    if (isNight) {
      scene.background.set('#0b101d');
      scene.fog.color.set('#0b101d');
      hemiLight.color.set('#223355');
      hemiLight.groundColor.set('#111822');
      hemiLight.intensity = 0.25;

      sunLight.color.set('#5c7099');
      sunLight.intensity = 0.3;
      fillLight.intensity = 0.1;

      house.setDayNight(true);
    } else {
      scene.background.set('#d4e6f1');
      scene.fog.color.set('#d4e6f1');
      hemiLight.color.set('#ffffff');
      hemiLight.groundColor.set('#444455');
      hemiLight.intensity = 0.65;

      sunLight.color.set('#fffaed');
      sunLight.intensity = 1.25;
      fillLight.intensity = 0.35;

      house.setDayNight(false);
    }
  }, [isNight]);

  return <div ref={mountRef} className="webgl-canvas" />;
});
