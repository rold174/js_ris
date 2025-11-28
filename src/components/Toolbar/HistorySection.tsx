import React from 'react';

interface HistorySectionProps {
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const HistorySection: React.FC<HistorySectionProps> = ({
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}) => {
  return (
    <div className="toolbar-section">
      <h3>История</h3>
      <div className="history-controls">
        <button onClick={onUndo} disabled={!canUndo} className="history-btn">
          Назад
        </button>
        <button onClick={onRedo} disabled={!canRedo} className="history-btn">
          Вперед
        </button>
      </div>
    </div>
  );
};

export default HistorySection;