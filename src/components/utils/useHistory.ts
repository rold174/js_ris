import { useState } from 'react';
import { ToolState, HistoryItem, MAX_HISTORY } from './ToolState';

export const useHistory = (toolState: ToolState) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const saveToHistory = (canvasData: string) => {
    setHistory(prev => {
      const base = prev.slice(0, historyIndex + 1);
      const newItem: HistoryItem = { canvasData, toolState: { ...toolState } };
      base.push(newItem);

      if (base.length > MAX_HISTORY) {
        base.shift();
      }

      setHistoryIndex(base.length - 1);
      return base;
    });
  };

  const restoreFromHistory = (index: number, canvasRef: React.RefObject<HTMLCanvasElement | null>) => {
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

    return item.toolState;
  };

  return {
    history,
    historyIndex,
    setHistoryIndex,
    saveToHistory,
    restoreFromHistory
  };
};