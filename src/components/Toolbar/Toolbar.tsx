import React from 'react';
import Tools from '../Tools/Tools';
import './Toolbar.css';

interface ToolbarProps {
  currentTool: string;
  onToolChange: (tool: string) => void;
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
  brushColor: string;
  onBrushColorChange: (color: string) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  currentTool,
  onToolChange,
  brushSize,
  onBrushSizeChange,
  brushColor,
  onBrushColorChange
}) => {
  return (
    <div className="toolbar">
      <div className="toolbar-content">
        <h2>Рисовалка</h2>
        <Tools
          currentTool={currentTool}
          onToolChange={onToolChange}
          brushSize={brushSize}
          onBrushSizeChange={onBrushSizeChange}
          brushColor={brushColor}
          onBrushColorChange={onBrushColorChange}
        />
      </div>
    </div>
  );
};

export default Toolbar;