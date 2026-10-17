import React from 'react';

export function Header({ onToggleSidebar, fps }) {
  return (
    <>
      <header className="top-header">
        <button 
          className="btn-menu-toggle" 
          onClick={onToggleSidebar}
          title="Bật/Tắt bảng điều khiển"
        >
          ☰
        </button>
        <div className="brand-icon">🏛️</div>
        <div className="title-group">
          <h1>MÔ HÌNH 3D NHÀ MÁI THÁI</h1>
          <div className="subtitle">
            <span>KÍCH THƯỚC: 25.98m × 9.50m</span>
            <span className="badge-tag">Tầng trệt trống suốt</span>
            <span className="badge-tag">6 Cột (5 Ô Nhà)</span>
          </div>
        </div>
      </header>

      <div className="hud-corner">
        <div className="hud-badge">
          <span>Diện tích sàn:</span>
          <strong>246.81 m²</strong>
        </div>
        <div className="hud-badge">
          <span>{fps} FPS</span>
        </div>
      </div>
    </>
  );
}
