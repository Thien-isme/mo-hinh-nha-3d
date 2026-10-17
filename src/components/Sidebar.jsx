import React from 'react';

const ROOF_COLORS = [
  { name: 'Xanh 0e0ea0', hex: '#0e0ea0' },
  { name: 'Xanh Coban', hex: '#1d4872' },
  { name: 'Đỏ Ruby ngói', hex: '#9e2a2b' },
  { name: 'Xám Titan / Ghi đá', hex: '#474f57' },
  { name: 'Xanh rêu phong thủy', hex: '#2d5a3f' },
  { name: 'Nâu đất socola', hex: '#7d4e38' }
];

export function Sidebar({
  isOpen,
  activePreset,
  onSelectPreset,
  roofOpacity,
  onChangeRoofOpacity,
  currentRoofColor,
  onSelectRoofColor,
  doorType,
  onSelectDoorType,
  doorOpenProgress,
  onChangeDoorOpenProgress,
  onToggleDoorAnimation,
  isDoorAnimating,
  layers,
  onToggleLayer,
  showDimensions,
  onToggleDimensions,
  isNight,
  onToggleDayNight,
  autoRotate,
  onToggleAutoRotate,
  onScreenshot,
  onResetView
}) {
  return (
    <aside className={`sidebar ${!isOpen ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <h2>Bảng Điều Khiển 3D</h2>
        <span className="badge-tag">React + Three.js</span>
      </div>

      <div className="sidebar-content">
        {/* Section 1: Specs */}
        <section className="control-section">
          <div className="section-title">📐 Thông Số Kỹ Thuật</div>
          <div className="specs-grid">
            <div className="spec-item">
              <div className="spec-label">Chiều dài</div>
              <div className="spec-value highlight">25.98 m</div>
            </div>
            <div className="spec-item">
              <div className="spec-label">Chiều rộng</div>
              <div className="spec-value highlight">9.50 m</div>
            </div>
            <div className="spec-item">
              <div className="spec-label">Cột (Dài × Rộng)</div>
              <div className="spec-value highlight">20cm × 20cm</div>
            </div>
            <div className="spec-item">
              <div className="spec-label">Chiều cao cột</div>
              <div className="spec-value highlight">3.80 m</div>
            </div>
            <div className="spec-item">
              <div className="spec-label">Số ô nhịp</div>
              <div className="spec-value">5 Ô (6 Cột)</div>
            </div>
            <div className="spec-item">
              <div className="spec-label">Bước các ô</div>
              <div className="spec-value highlight" style={{ fontSize: '13px' }}>4 ô 5.0m + 1 ô 5.98m</div>
            </div>
            <div className="spec-item">
              <div className="spec-label">Nhà vệ sinh (WC)</div>
              <div className="spec-value highlight" style={{ fontSize: '13px' }}>1.20m × 1.40m</div>
            </div>
            <div className="spec-item">
              <div className="spec-label">Cửa hậu</div>
              <div className="spec-value highlight" style={{ fontSize: '13px' }}>1.10m × 2.12m (cách WC 0.6m)</div>
            </div>
            <div className="spec-item">
              <div className="spec-label">Cột đôi mặt tiền</div>
              <div className="spec-value highlight" style={{ fontSize: '13px' }}>2 Cột 20×20cm liền sát nhau</div>
            </div>
            <div className="spec-item">
              <div className="spec-label">Vỉa hè hông</div>
              <div className="spec-value">4.00 m</div>
            </div>
            <div className="spec-item">
              <div className="spec-label">Vỉa hè trước</div>
              <div className="spec-value">12.00 m</div>
            </div>
            <div className="spec-item full-width">
              <div className="spec-label">Cửa trước (Mặt tiền)</div>
              <div className="spec-value highlight" style={{ fontSize: '13px' }}>
                2 Gian cửa rộng 4.35m chia qua cặp cột đôi giữa
              </div>
            </div>
            <div className="spec-item full-width">
              <div className="spec-label">Kiểu mái & Không gian</div>
              <div className="spec-value" style={{ fontSize: '13px' }}>
                Mái Thái xanh #0e0ea0 (Đỉnh 6.60m) - Tường sau liền, 1 WC, 1 Cửa hậu
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Door Simulator */}
        <section className="control-section highlight-box">
          <div className="section-title">🚪 Mô Phỏng Các Loại Cửa (Theo Ảnh Thật)</div>
          <div className="door-selector-grid">
            <button
              className={`door-btn ${doorType === 'none' ? 'active' : ''}`}
              onClick={() => onSelectDoorType('none')}
            >
              <div className="door-btn-icon">🚫</div>
              <div className="door-btn-content">
                <div className="door-btn-title">Trống suốt (Không gắn cửa)</div>
                <div className="door-btn-desc">Để trống toàn bộ 5 ô hông & mặt tiền, lộ rõ các cột</div>
              </div>
            </button>

            <button
              className={`door-btn ${doorType === 'type1' ? 'active' : ''}`}
              onClick={() => onSelectDoorType('type1')}
            >
              <div className="door-btn-icon">🟡</div>
              <div className="door-btn-content">
                <div className="door-btn-title">Loại 1: Cửa kéo Đài Loan (Ảnh 1)</div>
                <div className="door-btn-desc">Màu kem, dập sóng U, 3 tầng nhíp hoa văn zíc zắc & tán đinh đồng</div>
              </div>
            </button>

            <button
              className={`door-btn ${doorType === 'type2' ? 'active' : ''}`}
              onClick={() => onSelectDoorType('type2')}
            >
              <div className="door-btn-icon">🟢</div>
              <div className="door-btn-content">
                <div className="door-btn-title">Loại 2: Cửa sắt 4 cánh hiện đại (Ảnh 2)</div>
                <div className="door-btn-desc">Màu xám ghi, nan đứng thoáng + lá sách ngang, tay nắm inox 60cm</div>
              </div>
            </button>
          </div>

          {/* Điều khiển Đóng / Mở cửa Động Học */}
          {doorType !== 'none' && (
            <div className="door-motion-box" style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>
                  🎬 Mô Phỏng Đóng / Mở Cửa
                </span>
                <span
                  className="badge-tag"
                  style={{
                    background: doorOpenProgress >= 0.85 ? 'rgba(76, 175, 80, 0.22)' : doorOpenProgress > 0.1 ? 'rgba(255, 193, 7, 0.22)' : 'rgba(239, 68, 68, 0.22)',
                    borderColor: doorOpenProgress >= 0.85 ? '#4caf50' : doorOpenProgress > 0.1 ? '#ffc107' : '#ef4444',
                    color: doorOpenProgress >= 0.85 ? '#81c784' : doorOpenProgress > 0.1 ? '#ffe082' : '#fca5a5',
                    fontSize: '11px',
                    fontWeight: '600'
                  }}
                >
                  {doorOpenProgress >= 0.95 ? 'Mở toang 100%' : doorOpenProgress <= 0.05 ? 'Đóng kín 0%' : `Mở hé ${Math.round(doorOpenProgress * 100)}%`}
                </span>
              </div>

              {/* Nút bấm tự động mở / đóng có hiệu ứng mượt mà */}
              <button
                className={`preset-btn wide ${isDoorAnimating ? 'animating' : ''}`}
                onClick={onToggleDoorAnimation}
                style={{
                  background: doorOpenProgress > 0.5
                    ? 'linear-gradient(135deg, #10b981, #059669)'
                    : 'linear-gradient(135deg, #0284c7, #0369a1)',
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: '13px',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                }}
              >
                <span style={{ fontSize: '15px' }}>{doorOpenProgress > 0.5 ? '🔒' : '🔓'}</span>
                {isDoorAnimating
                  ? (doorOpenProgress > 0.5 ? 'Đang mở cửa ra...' : 'Đang đóng cửa lại...')
                  : (doorOpenProgress > 0.5 ? 'Bấm để ĐÓNG CỬA lại' : 'Bấm để MỞ CỬA ra')}
              </button>

              {/* Thanh kéo mở cửa thủ công */}
              <div className="slider-group" style={{ marginBottom: '10px' }}>
                <div className="slider-header" style={{ marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px' }}>Độ mở cửa (Kéo mượt)</span>
                  <span style={{ color: '#00e5ff', fontWeight: 'bold' }}>{Math.round(doorOpenProgress * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={doorOpenProgress}
                  onChange={(e) => onChangeDoorOpenProgress(parseFloat(e.target.value))}
                />
              </div>

              {/* 4 Nút nấc chọn nhanh */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '10px' }}>
                <button
                  className={`preset-btn ${doorOpenProgress <= 0.05 ? 'active' : ''}`}
                  style={{ fontSize: '11px', padding: '6px 2px', textAlign: 'center' }}
                  onClick={() => onChangeDoorOpenProgress(0)}
                >
                  Đóng 0%
                </button>
                <button
                  className={`preset-btn ${doorOpenProgress > 0.25 && doorOpenProgress < 0.45 ? 'active' : ''}`}
                  style={{ fontSize: '11px', padding: '6px 2px', textAlign: 'center' }}
                  onClick={() => onChangeDoorOpenProgress(0.35)}
                >
                  Hé 35%
                </button>
                <button
                  className={`preset-btn ${doorOpenProgress >= 0.55 && doorOpenProgress <= 0.75 ? 'active' : ''}`}
                  style={{ fontSize: '11px', padding: '6px 2px', textAlign: 'center' }}
                  onClick={() => onChangeDoorOpenProgress(0.65)}
                >
                  Nửa 65%
                </button>
                <button
                  className={`preset-btn ${doorOpenProgress >= 0.95 ? 'active' : ''}`}
                  style={{ fontSize: '11px', padding: '6px 2px', textAlign: 'center' }}
                  onClick={() => onChangeDoorOpenProgress(1.0)}
                >
                  Mở 100%
                </button>
              </div>
            </div>
          )}

          <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
            <button
              className="preset-btn"
              style={{ flex: 1, fontSize: '12px', padding: '8px 6px' }}
              onClick={() => onSelectPreset('doors_side')}
            >
              <span>🚶</span> Xem cửa vỉa hè
            </button>
            <button
              className="preset-btn"
              style={{ flex: 1, fontSize: '12px', padding: '8px 6px' }}
              onClick={() => onSelectPreset('doors_front')}
            >
              <span>🏠</span> Xem cửa mặt tiền
            </button>
          </div>
        </section>

        {/* Section 3: Camera Presets */}
        <section className="control-section">
          <div className="section-title">🎥 Góc Nhìn Camera</div>
          <div className="button-grid">
            <button
              className={`preset-btn ${activePreset === 'iso' ? 'active' : ''}`}
              onClick={() => onSelectPreset('iso')}
            >
              <span>🌐</span> Toàn cảnh 3D
            </button>
            <button
              className={`preset-btn ${activePreset === 'front' ? 'active' : ''}`}
              onClick={() => onSelectPreset('front')}
            >
              <span>🏠</span> Mặt tiền
            </button>
            <button
              className={`preset-btn ${activePreset === 'side' ? 'active' : ''}`}
              onClick={() => onSelectPreset('side')}
            >
              <span>📐</span> Mặt đứng vỉa hè
            </button>
            <button
              className={`preset-btn ${activePreset === 'top' ? 'active' : ''}`}
              onClick={() => onSelectPreset('top')}
            >
              <span>🗺️</span> Mặt bằng nóc
            </button>
            <button
              className={`preset-btn wide ${activePreset === 'doors_side' ? 'active' : ''}`}
              onClick={() => onSelectPreset('doors_side')}
              style={{ background: 'rgba(0, 210, 255, 0.14)', borderColor: 'rgba(0, 210, 255, 0.5)' }}
            >
              <span>🚪</span> Xem 5 Cửa Dọc Vỉa Hè (Góc nhìn cận cảnh)
            </button>
            <button
              className={`preset-btn wide ${activePreset === 'doors_front' ? 'active' : ''}`}
              onClick={() => onSelectPreset('doors_front')}
              style={{ background: 'rgba(255, 193, 7, 0.14)', borderColor: 'rgba(255, 193, 7, 0.5)' }}
            >
              <span>🏠</span> Xem Cửa Đôi Mặt Tiền (9.10m)
            </button>
            <button
              className={`preset-btn wide ${activePreset === 'inside' ? 'active' : ''}`}
              onClick={() => onSelectPreset('inside')}
              style={{ background: 'rgba(0, 210, 255, 0.12)', borderColor: 'rgba(0, 210, 255, 0.4)' }}
            >
              <span>🚶</span> Vào bên trong nhà (Trống suốt)
            </button>
            <button
              className={`preset-btn wide ${activePreset === 'wc' ? 'active' : ''}`}
              onClick={() => onSelectPreset('wc')}
              style={{ background: 'rgba(0, 229, 255, 0.14)', borderColor: 'rgba(0, 229, 255, 0.5)' }}
            >
              <span>🚽</span> Xem Nhà Vệ Sinh (1.2m × 1.4m)
            </button>
            <button
              className={`preset-btn wide ${activePreset === 'door' ? 'active' : ''}`}
              onClick={() => onSelectPreset('door')}
              style={{ background: 'rgba(76, 175, 80, 0.14)', borderColor: 'rgba(76, 175, 80, 0.5)' }}
            >
              <span>🚪</span> Xem Cửa Hậu (1.1m × 2.12m, cách WC 0.6m)
            </button>
            <button
              className={`preset-btn wide ${activePreset === 'back' ? 'active' : ''}`}
              onClick={() => onSelectPreset('back')}
              style={{ background: 'rgba(255, 167, 38, 0.14)', borderColor: 'rgba(255, 167, 38, 0.5)' }}
            >
              <span>🧱</span> Xem Mặt Sau (Tường liền theo ảnh 2)
            </button>
          </div>
        </section>

        {/* Section 3: Roof Transparency */}
        <section className="control-section">
          <div className="section-title">🔍 Mở Mái / Nhìn Xuyên Thấu</div>
          <div className="slider-group">
            <div className="slider-header">
              <span>Độ hiển thị mái tôn</span>
              <span>{Math.round(roofOpacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={roofOpacity}
              onChange={(e) => onChangeRoofOpacity(parseFloat(e.target.value))}
            />
          </div>
        </section>

        {/* Section 4: Roof Colors */}
        <section className="control-section">
          <div className="section-title">🎨 Màu Sắc Tôn Mái Thái</div>
          <div className="color-picker-row">
            {ROOF_COLORS.map(c => (
              <div
                key={c.hex}
                className={`color-swatch ${currentRoofColor === c.hex ? 'active' : ''}`}
                style={{ backgroundColor: c.hex }}
                onClick={() => onSelectRoofColor(c.hex)}
                title={c.name}
              />
            ))}
          </div>
        </section>

        {/* Section 5: Layer Toggles */}
        <section className="control-section">
          <div className="section-title">📑 Bật / Tắt Các Thành Phần</div>
          <div className="layer-list">
            <label className="layer-item">
              <span>🏠 Mái Thái lợp tôn</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={layers.roof}
                  onChange={(e) => onToggleLayer('roof', e.target.checked)}
                />
                <span className="slider-switch"></span>
              </label>
            </label>
            <label className="layer-item">
              <span>🧱 Tường bao & Cửa sổ</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={layers.walls}
                  onChange={(e) => onToggleLayer('walls', e.target.checked)}
                />
                <span className="slider-switch"></span>
              </label>
            </label>
            <label className="layer-item">
              <span>⚙️ Hệ vì kèo & Xà gồ thép</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={layers.structure}
                  onChange={(e) => onToggleLayer('structure', e.target.checked)}
                />
                <span className="slider-switch"></span>
              </label>
            </label>
            <label className="layer-item">
              <span>🏛️ Hệ 6 hàng cột (5 ô)</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={layers.columns}
                  onChange={(e) => onToggleLayer('columns', e.target.checked)}
                />
                <span className="slider-switch"></span>
              </label>
            </label>
            <label className="layer-item">
              <span>📏 Thước đo kích thước 3D</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={showDimensions}
                  onChange={(e) => onToggleDimensions(e.target.checked)}
                />
                <span className="slider-switch"></span>
              </label>
            </label>
            <label className="layer-item">
              <span>💡 Ánh sáng nội thất</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={layers.lights}
                  onChange={(e) => onToggleLayer('lights', e.target.checked)}
                />
                <span className="slider-switch"></span>
              </label>
            </label>
            <label className="layer-item">
              <span>🌳 Sân vườn ngoại cảnh</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={layers.environment}
                  onChange={(e) => onToggleLayer('environment', e.target.checked)}
                />
                <span className="slider-switch"></span>
              </label>
            </label>
            <label className="layer-item">
              <span>🛣️ Vỉa hè & Đường xe chạy</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={layers.road}
                  onChange={(e) => onToggleLayer('road', e.target.checked)}
                />
                <span className="slider-switch"></span>
              </label>
            </label>
            <label className="layer-item">
              <span>🚪 Cửa các ô & mặt tiền</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={layers.doors}
                  onChange={(e) => onToggleLayer('doors', e.target.checked)}
                />
                <span className="slider-switch"></span>
              </label>
            </label>
          </div>
        </section>

        {/* Section 6: Quick Utilities */}
        <section className="control-section">
          <div className="section-title">⚡ Tiện Ích</div>
          <div className="button-grid">
            <button
              className={`preset-btn ${isNight ? 'active' : ''}`}
              onClick={onToggleDayNight}
            >
              {isNight ? '🌙 Ban đêm' : '☀️ Ban ngày'}
            </button>
            <button
              className={`preset-btn ${autoRotate ? 'active' : ''}`}
              onClick={onToggleAutoRotate}
            >
              🔄 Tự động xoay
            </button>
            <button className="preset-btn wide" onClick={onScreenshot}>
              📸 Chụp ảnh màn hình HD
            </button>
            <button className="preset-btn wide" onClick={onResetView}>
              ↺ Đặt lại góc nhìn
            </button>
          </div>
        </section>
      </div>
    </aside>
  );
}
