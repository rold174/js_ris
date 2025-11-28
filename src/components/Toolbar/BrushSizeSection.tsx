import React from 'react';
import { ToolState } from '../utils/ToolState';

interface BrushSizeSectionProps {
  toolState: ToolState;
  onBrushSizeChange: (size: number) => void;
}

const BrushSizeSection: React.FC<BrushSizeSectionProps> = ({
  toolState,
  onBrushSizeChange,
}) => {
  return (
    <div className="toolbar-section">
      <h3>Размер кисти</h3>
      <div className="brush-size">
        <input
          type="range"
          min="1"
          max="300"
          value={toolState.brushSize}
          onChange={(e) => onBrushSizeChange(Number(e.target.value))}
          disabled={toolState.tool === 'fill'}
        />
        <span>{toolState.brushSize}px</span>
      </div>
      {toolState.tool === 'fill' && (
        <div className="tool-info">Кликните для заливки области</div>
      )}
    </div>
  );
};

export default BrushSizeSection;