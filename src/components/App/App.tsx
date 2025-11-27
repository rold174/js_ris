import React, { useState, useRef } from 'react';
import './App.css';
import Canvas from '../Canvas/Canvas';
import Toolbar from '../Toolbar/Toolbar';
import StartPage from '../StartPage/StartPage';

export interface ToolState {
  tool: string;
  color: string;
  brushSize: number;
}

export interface HistoryItem {
  canvasData: string;
  toolState: ToolState;
}

function App() {
  const [isDrawing, setIsDrawing] = useState(false);
  const [toolState, setToolState] = useState<ToolState>({
    tool: 'brush',
    color: '#000000',
    brushSize: 5
  });
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const MAX_HISTORY = 100;

  const saveToHistory = (canvasData: string) => {
    const newItem: HistoryItem = {
      canvasData,
      toolState: { ...toolState }
    };

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newItem);

    if (newHistory.length > MAX_HISTORY) {
      newHistory.shift();
    }

    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      restoreFromHistory(newIndex);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      restoreFromHistory(newIndex);
    }
  };

  const restoreFromHistory = (index: number) => {
    const item = history[index];
    if (item && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        const image = new Image();
        image.onload = () => {
          ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
          ctx.drawImage(image, 0, 0);
        };
        image.src = item.canvasData;
        setToolState(item.toolState);
      }
    }
  };

  const clearHistory = () => {
    setHistory([]);
    setHistoryIndex(-1);
  };

  return (
    <div className="App">
      <StartPage />
      <Toolbar 
        toolState={toolState}
        setToolState={setToolState}
        undo={undo}
        redo={redo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        historyLength={history.length}
        historyIndex={historyIndex}
      />
      <Canvas
        ref={canvasRef}
        isDrawing={isDrawing}
        setIsDrawing={setIsDrawing}
        toolState={toolState}
        saveToHistory={saveToHistory}
        clearHistory={clearHistory}
      />
    </div>
  );
}

export default App;