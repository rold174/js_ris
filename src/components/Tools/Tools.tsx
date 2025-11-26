import React from 'react';
import './Tools.css';

interface ToolsProps {
  currentTool: string;
  onToolChange: (tool: string) => void;
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
  brushColor: string;
  onBrushColorChange: (color: string) => void;
}

const Tools: React.FC<ToolsProps> = ({
  currentTool,
  onToolChange,
  brushSize,
  onBrushSizeChange,
  brushColor,
  onBrushColorChange
}) => {
  const tools = [
    { id: 'brush', name: 'Кисть', icon: '🖌️' },
    { id: 'eraser', name: 'Ластик', icon: '🧹' }
  ];

  const colors = ['#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];

  return (
    <div className="tools">
      <div className="tools-section">
        <h3>Инструменты</h3>
        <div className="tool-buttons">
          {tools.map(tool => (
            <button
              key={tool.id}
              className={`tool-btn ${currentTool === tool.id ? 'active' : ''}`}
              onClick={() => onToolChange(tool.id)}
              title={tool.name}
            >
              <span className="tool-icon">{tool.icon}</span>
              {tool.name}
            </button>
          ))}
        </div>
      </div>

      <div className="tools-section">
        <h3>Размер кисти</h3>
        <div className="brush-size-controls">
          <input
            type="range"
            min="1"
            max="50"
            value={brushSize}
            onChange={(e) => onBrushSizeChange(Number(e.target.value))}
            className="brush-slider"
          />
          <span className="brush-size-value">{brushSize}px</span>
        </div>
      </div>

      <div className="tools-section">
        <h3>Цвет</h3>
        <div className="color-picker">
          <input
            type="color"
            value={brushColor}
            onChange={(e) => onBrushColorChange(e.target.value)}
            className="color-input"
          />
          <div className="color-presets">
            {colors.map(color => (
              <button
                key={color}
                className="color-preset"
                style={{ backgroundColor: color }}
                onClick={() => onBrushColorChange(color)}
                title={color}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tools;