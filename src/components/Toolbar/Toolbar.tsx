import React from 'react';
import './Toolbar.css';
import { ToolState } from '../utils/ToolState';
import ToolsSection from './ToolsSection';
import BrushSizeSection from './BrushSizeSection';
import ColorSection from './ColorSection';
import HistorySection from './HistorySection';

interface ToolbarProps {
  toolState: ToolState;
  setToolState: (toolState: ToolState) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  clearCanvas: () => void;
  isInRoom?: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({
  toolState,
  setToolState,
  undo,
  redo,
  canUndo,
  canRedo,
  clearCanvas,
  isInRoom = false
}) => {
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
      {/* Индикатор режима совместного рисования */}
      {isInRoom && (
        <div className="collaboration-indicator">
          <span className="indicator-icon">👥</span>
          <span className="indicator-text">Совместное рисование</span>
        </div>
      )}

      <ToolsSection
        toolState={toolState}
        onToolChange={handleToolChange}
        onClearCanvas={clearCanvas}
      />

      <BrushSizeSection
        toolState={toolState}
        onBrushSizeChange={handleBrushSizeChange}
      />

      <ColorSection
        toolState={toolState}
        onColorChange={handleColorChange}
      />

      <HistorySection
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
      />

      {/* Подсказка для режима совместного рисования */}
      {isInRoom && (
        <div className="room-tooltip">
          <p className="tooltip-text">
            Все изменения автоматически синхронизируются с другими участниками
          </p>
        </div>
      )}
    </div>
  );
};

export default Toolbar;