import React, { useState, useRef } from 'react';
import './App.css';
import Canvas from '../Canvas/Canvas';
import Toolbar from '../Toolbar/Toolbar';
import AppHeader from './AppHeader';
import { ToolState } from '../utils/ToolState';
import { useHistory } from '../utils/useHistory';
import { useKeyboardShortcuts } from '../utils/useKeyboardShortcuts';

function App() {
  const [isDrawing, setIsDrawing] = useState(false);
  const [toolState, setToolState] = useState<ToolState>({
    tool: 'brush',
    color: '#000000',
    brushSize: 5
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const {
    history,
    historyIndex,
    setHistoryIndex,
    saveToHistory,
    restoreFromHistory
  } = useHistory(toolState);

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const restoredToolState = restoreFromHistory(newIndex, canvasRef);
      if (restoredToolState) {
        setToolState(restoredToolState);
      }
    } else if (historyIndex === 0) {
      setHistoryIndex(-1);
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const restoredToolState = restoreFromHistory(newIndex, canvasRef);
      if (restoredToolState) {
        setToolState(restoredToolState);
      }
    }
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    const blankData = canvasRef.current.toDataURL();
    saveToHistory(blankData);
  };

  useKeyboardShortcuts(undo, redo);

  const canUndo = historyIndex >= 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <div className="App">
      <AppHeader />
      
      <div className="app-content">
        <Toolbar
          toolState={toolState}
          setToolState={setToolState}
          undo={undo}
          redo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
          clearCanvas={clearCanvas}
        />

        <Canvas
          ref={canvasRef}
          isDrawing={isDrawing}
          setIsDrawing={setIsDrawing}
          toolState={toolState}
          saveToHistory={saveToHistory}
        />
      </div>
    </div>
  );
}

export default App;