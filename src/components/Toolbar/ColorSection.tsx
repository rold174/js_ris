import React from 'react';
import { ToolState } from '../utils/ToolState';

interface ColorSectionProps {
  toolState: ToolState;
  onColorChange: (color: string) => void;
}

const ColorSection: React.FC<ColorSectionProps> = ({
  toolState,
  onColorChange,
}) => {
  const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];

  return (
    <div className="toolbar-section">
      <h3>Цвет</h3>
      <div className="colors">
        {colors.map((color, index) => (
          <button
            key={index}
            className={`color-btn ${toolState.color === color ? 'active' : ''}`}
            style={{ backgroundColor: color }}
            onClick={() => onColorChange(color)}
          />
        ))}
        <input
          type="color"
          value={toolState.color}
          onChange={(e) => onColorChange(e.target.value)}
          className="color-picker"
        />
      </div>
    </div>
  );
};

export default ColorSection;