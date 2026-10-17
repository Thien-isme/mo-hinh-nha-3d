import React from 'react';

export function QuickBar({
  roofOpacity,
  onToggleRoofTransparency,
  doorType,
  onSelectDoorType,
  doorOpenProgress,
  onToggleDoorAnimation,
  showDimensions,
  onToggleDimensions,
  onSelectPreset,
  onScreenshot
}) {
  const isXray = roofOpacity < 0.9;

  const getDoorLabel = () => {
    if (doorType === 'none') return '🚪 Cửa: Trống';
    if (doorType === 'type1') return '🚪 Cửa: Kéo Đ.Loan (1)';
    return '🚪 Cửa: Sắt 4 cánh (2)';
  };

  const handleCycleDoor = () => {
    if (doorType === 'none') onSelectDoorType('type1');
    else if (doorType === 'type1') onSelectDoorType('type2');
    else onSelectDoorType('none');
  };

  return (
    <nav className="bottom-bar">
      <button 
        className={`quick-btn ${doorType !== 'none' ? 'active' : ''}`}
        onClick={handleCycleDoor}
        title="Nhấp để chuyển đổi: Trống suốt -> Cửa kéo Đài Loan -> Cửa sắt 4 cánh"
      >
        {getDoorLabel()}
      </button>

      {doorType !== 'none' && (
        <button 
          className={`quick-btn ${doorOpenProgress > 0.05 ? 'active' : ''}`}
          onClick={onToggleDoorAnimation}
          title="Nhấp để tự động mở hoặc đóng cửa"
        >
          {doorOpenProgress > 0.5 ? `🔒 Đóng (${Math.round(doorOpenProgress * 100)}%)` : `🔓 Mở (${Math.round(doorOpenProgress * 100)}%)`}
        </button>
      )}

      <button 
        className={`quick-btn ${isXray ? 'active' : ''}`}
        onClick={onToggleRoofTransparency}
      >
        {isXray ? '🔓 Mái: Xuyên thấu' : '🏠 Mái: Đóng'}
      </button>

      <button 
        className={`quick-btn ${showDimensions ? 'active' : ''}`}
        onClick={() => onToggleDimensions(!showDimensions)}
      >
        📏 Thước đo
      </button>

      <button 
        className="quick-btn"
        onClick={() => onSelectPreset('doors_side')}
        title="Góc nhìn ngắm các cửa dọc vỉa hè"
      >
        🚶 Xem cửa vỉa hè
      </button>

      <button 
        className="quick-btn"
        onClick={() => onSelectPreset('iso')}
      >
        🌐 Toàn cảnh
      </button>

      <button 
        className="quick-btn highlight"
        onClick={onScreenshot}
      >
        📷 Chụp ảnh HD
      </button>
    </nav>
  );
}
