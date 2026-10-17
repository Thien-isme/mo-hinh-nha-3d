import React, { useState, useRef } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { QuickBar } from './components/QuickBar';
import { HouseViewer3D } from './components/HouseViewer3D';

export function App() {
  const viewerRef = useRef(null);

  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [fps, setFps] = useState(60);
  const [activePreset, setActivePreset] = useState('iso');
  const [roofOpacity, setRoofOpacity] = useState(1.0);
  const [roofColor, setRoofColor] = useState('#0e0ea0');
  const [doorType, setDoorType] = useState('type1'); // 'none', 'type1' (Cửa kéo Đài Loan), 'type2' (Cửa sắt 4 cánh)
  const [doorOpenProgress, setDoorOpenProgress] = useState(0.0); // 0.0 = Đóng kín, 1.0 = Mở toang hoàn toàn
  const [isDoorAnimating, setIsDoorAnimating] = useState(false);
  const doorAnimRef = useRef(null);

  const [showDimensions, setShowDimensions] = useState(true);
  const [isNight, setIsNight] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);

  // Layer toggles
  const [layers, setLayers] = useState({
    roof: true,
    walls: true,
    structure: true,
    columns: true,
    interior: true,
    environment: true,
    road: true,
    lights: true,
    doors: true
  });

  const handleToggleLayer = (layerName, value) => {
    setLayers(prev => ({ ...prev, [layerName]: value }));
  };

  const handleSelectPreset = (preset) => {
    setActivePreset(preset);
    viewerRef.current?.setCameraPreset(preset);
  };

  const handleToggleRoofTransparency = () => {
    const newOpacity = roofOpacity < 0.9 ? 1.0 : 0.15;
    setRoofOpacity(newOpacity);
  };

  const handleScreenshot = () => {
    viewerRef.current?.takeScreenshot();
  };

  const handleResetView = () => {
    handleSelectPreset('iso');
  };

  // Animation Đóng / Mở cửa mượt mà
  const handleToggleDoorAnimation = () => {
    if (doorAnimRef.current) {
      cancelAnimationFrame(doorAnimRef.current);
      doorAnimRef.current = null;
    }

    const startVal = doorOpenProgress;
    const targetVal = startVal > 0.5 ? 0.0 : 1.0;
    const duration = 1600; // 1.6 giây mô phỏng
    const startTime = performance.now();
    setIsDoorAnimating(true);

    const step = (now) => {
      const elapsed = now - startTime;
      const p = Math.min(elapsed / duration, 1.0);
      const ease = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      const val = startVal + (targetVal - startVal) * ease;
      setDoorOpenProgress(val);

      if (p < 1.0) {
        doorAnimRef.current = requestAnimationFrame(step);
      } else {
        setIsDoorAnimating(false);
        doorAnimRef.current = null;
      }
    };
    doorAnimRef.current = requestAnimationFrame(step);
  };

  const handleSetDoorOpenProgress = (val) => {
    if (doorAnimRef.current) {
      cancelAnimationFrame(doorAnimRef.current);
      doorAnimRef.current = null;
      setIsDoorAnimating(false);
    }
    setDoorOpenProgress(val);
  };

  return (
    <div className="app-container">
      {/* 3D WebGL Canvas */}
      <HouseViewer3D
        ref={viewerRef}
        onFpsUpdate={setFps}
        roofOpacity={roofOpacity}
        roofColor={roofColor}
        doorType={doorType}
        doorOpenProgress={doorOpenProgress}
        layers={layers}
        showDimensions={showDimensions}
        isNight={isNight}
        autoRotate={autoRotate}
      />

      {/* Top Header */}
      <Header
        onToggleSidebar={() => setSidebarOpen(prev => !prev)}
        fps={fps}
      />

      {/* Control Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        activePreset={activePreset}
        onSelectPreset={handleSelectPreset}
        roofOpacity={roofOpacity}
        onChangeRoofOpacity={setRoofOpacity}
        currentRoofColor={roofColor}
        onSelectRoofColor={setRoofColor}
        doorType={doorType}
        onSelectDoorType={setDoorType}
        doorOpenProgress={doorOpenProgress}
        onChangeDoorOpenProgress={handleSetDoorOpenProgress}
        onToggleDoorAnimation={handleToggleDoorAnimation}
        isDoorAnimating={isDoorAnimating}
        layers={layers}
        onToggleLayer={handleToggleLayer}
        showDimensions={showDimensions}
        onToggleDimensions={setShowDimensions}
        isNight={isNight}
        onToggleDayNight={() => setIsNight(prev => !prev)}
        autoRotate={autoRotate}
        onToggleAutoRotate={() => setAutoRotate(prev => !prev)}
        onScreenshot={handleScreenshot}
        onResetView={handleResetView}
      />

      {/* Bottom Floating Quick Bar */}
      <QuickBar
        roofOpacity={roofOpacity}
        onToggleRoofTransparency={handleToggleRoofTransparency}
        doorType={doorType}
        onSelectDoorType={setDoorType}
        doorOpenProgress={doorOpenProgress}
        onToggleDoorAnimation={handleToggleDoorAnimation}
        showDimensions={showDimensions}
        onToggleDimensions={setShowDimensions}
        onSelectPreset={handleSelectPreset}
        onScreenshot={handleScreenshot}
      />
    </div>
  );
}
