import React from 'react';
import './Toolbar.css';
import { ToolState } from '../App/App';
// import { clearCanvas } from '../Canvas/Canvas';

interface ToolbarProps {
  toolState: ToolState;
  setToolState: (toolState: ToolState) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  clearCanvas: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  toolState,
  setToolState,
  undo,
  redo,
  canUndo,
  canRedo
}) => {
  const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];

  const handleToolChange = (tool: string) => {
    setToolState({ ...toolState, tool });
  };

  const handleColorChange = (color: string) => {
    setToolState({ ...toolState, color });
  };

  const handleBrushSizeChange = (size: number) => {
    setToolState({ ...toolState, brushSize: size });
  };  

  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <h3>Инструменты</h3>
        <div className="tools">
          <button
            className={`tool-btn ${toolState.tool === 'brush' ? 'active' : ''}`}
            onClick={() => handleToolChange('brush')}
          >
            🖌️
          </button>
          <button
            className={`tool-btn ${toolState.tool === 'eraser' ? 'active' : ''}`}
            onClick={() => handleToolChange('eraser')}
          >
            🧽
          </button>
          <button
            className={`tool-btn ${toolState.tool === 'fill' ? 'active' : ''}`}
            onClick={() => handleToolChange('fill')}
          >
            🧺
          </button>
          <button 
            className={`tool-button ${toolState.tool === 'clear' ? 'active' : ''}`}
            onClick={() => {
              const canvas = document.querySelector('canvas') as HTMLCanvasElement;
              const ctx = canvas.getContext('2d');
              ctx?.clearRect(0, 0, canvas.width, canvas.height);
            }}
            >
              🚮
          </button>
        </div>        
      </div>

      <div className="toolbar-section">
        <h3>Размер кисти</h3>
        <div className="brush-size">
          <input
            type="range"
            min="1"
            max="300"
            value={toolState.brushSize}
            onChange={(e) => handleBrushSizeChange(Number(e.target.value))}
            disabled={toolState.tool === 'fill'}
          />
          <span>{toolState.brushSize}px</span>
        </div>
        {toolState.tool === 'fill' && (
          <div className="tool-info">
            Кликните для заливки области
          </div>
        )}
      </div>

      <div className="toolbar-section">
        <h3>Цвет</h3>
        <div className="colors">
          {colors.map((color, index) => (
            <button
              key={index}
              className={`color-btn ${toolState.color === color ? 'active' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => handleColorChange(color)}
            />
          ))}
          <input
            type="color"
            value={toolState.color}
            onChange={(e) => handleColorChange(e.target.value)}
            className="color-picker"
          />
        </div>
      </div>

      <div className="toolbar-section">
        <h3>История</h3>
        <div className="history-controls">
          <button 
            onClick={undo} 
            disabled={!canUndo}
            className="history-btn"
          >
            Назад
          </button>
          <button 
            onClick={redo} 
            disabled={!canRedo}
            className="history-btn"
          >
            Вперед
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;