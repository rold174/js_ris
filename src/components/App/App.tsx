import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import Canvas from '../Canvas/Canvas';
import Toolbar from '../Toolbar/Toolbar';

export interface ToolState {
  tool: string;
  color: string;
  brushSize: number;
}

export interface HistoryItem {
  canvasData: string;
  toolState: ToolState;
}

const MAX_HISTORY = 100;

function App() {
  const [isDrawing, setIsDrawing] = useState(false);
  const [toolState, setToolState] = useState<ToolState>({
    tool: 'brush',
    color: '#000000',
    brushSize: 5
  });

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Add a new snapshot to history (called from Canvas)
  const saveToHistory = (canvasData: string) => {
    setHistory(prev => {
      // trim future states if we've undone
      const base = prev.slice(0, historyIndex + 1);
      const newItem: HistoryItem = { canvasData, toolState: { ...toolState } };
      base.push(newItem);

      // cap history size
      if (base.length > MAX_HISTORY) {
        base.shift(); // remove oldest
      }

      // update index to last
      setHistoryIndex(base.length - 1);
      return base;
    });
  };

  // Restore canvas from a history index
  const restoreFromHistory = (index: number) => {
    const item = history[index];
    if (!item || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = item.canvasData;

    // Restore the tool state that was saved with that history item
    setToolState(item.toolState);
  };

  // Undo / Redo
  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      restoreFromHistory(newIndex);
    } else if (historyIndex === 0) {
      // go to blank if user undoes the first entry
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
      restoreFromHistory(newIndex);
    }
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // Save cleared state as a new history item
    const blankData = canvasRef.current.toDataURL();
    saveToHistory(blankData);
  };

  // Keyboard shortcuts: Ctrl+Z / Ctrl+Y / Ctrl+Shift+Z
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const mod = isMac ? e.metaKey : e.ctrlKey;

      if (mod && e.key === 'z') {
        if (e.shiftKey) {
          redo(); // Ctrl+Shift+Z => redo
        } else {
          undo(); // Ctrl+Z => undo
        }
        e.preventDefault();
      } else if (mod && e.key === 'y') {
        redo(); // Ctrl+Y => redo
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [historyIndex, history]);

  // Provide canUndo / canRedo states
  const canUndo = historyIndex >= 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <div className="App">
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
  );
}

export default App;