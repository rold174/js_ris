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
}

const Toolbar: React.FC<ToolbarProps> = ({
  toolState,
  setToolState,
  undo,
  redo,
  canUndo,
  canRedo,
  clearCanvas,
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
    </div>
  );
};

export default Toolbar;