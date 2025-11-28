import React from 'react';
import { ToolState } from '../utils/ToolState';

interface ToolsSectionProps {
  toolState: ToolState;
  onToolChange: (tool: string) => void;
  onClearCanvas: () => void;
}

const ToolsSection: React.FC<ToolsSectionProps> = ({
  toolState,
  onToolChange,
  onClearCanvas,
}) => {
  return (
    <div className="toolbar-section">
      <h3>Инструменты</h3>
      <div className="tools">
        <button
          className={`tool-btn ${toolState.tool === 'brush' ? 'active' : ''}`}
          onClick={() => onToolChange('brush')}
          title="Кисть"
        >
          🖌️
        </button>
        <button
          className={`tool-btn ${toolState.tool === 'eraser' ? 'active' : ''}`}
          onClick={() => onToolChange('eraser')}
          title="Ластик"
        >
          🧽
        </button>
        <button
          className={`tool-btn ${toolState.tool === 'fill' ? 'active' : ''}`}
          onClick={() => onToolChange('fill')}
          title="Заливка"
        >
          🧺
        </button>
        <button
          className="tool-button"
          onClick={onClearCanvas}
          title="Очистить холст"
        >
          🚮
        </button>
      </div>
    </div>
  );
};

export default ToolsSection;