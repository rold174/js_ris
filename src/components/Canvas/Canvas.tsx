import React, { forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import './Canvas.css';
import { ToolState } from '../utils/ToolState';
import RoomInfo from './RoomInfo';
import { useCanvasDrawing } from '../utils/useCanvasDrawing';

interface CanvasProps {
  isDrawing: boolean;
  setIsDrawing: (drawing: boolean) => void;
  toolState: ToolState;
  saveToHistory: (canvasData: string) => void;
  onDraw?: (prevX: number, prevY: number, x: number, y: number) => void;
  onClearCanvas?: () => void;
  onFillCanvas?: (x: number, y: number, color: string) => void;
  roomId?: string;
  replayDrawingHistory?: () => void;
}

const Canvas = forwardRef<HTMLCanvasElement, CanvasProps>(({
  isDrawing,
  setIsDrawing,
  toolState,
  saveToHistory,
  onDraw,
  onClearCanvas,
  onFillCanvas,
  roomId,
  replayDrawingHistory
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Используем ваш существующий хук для рисования
  const {
    startDrawing,
    handleMouseMove,
    stopDrawing,
    isDrawingRef
  } = useCanvasDrawing(canvasRef, toolState, setIsDrawing, saveToHistory, onDraw, onFillCanvas);

  useImperativeHandle(ref, () => {
    if (!canvasRef.current) {
      throw new Error('Canvas ref is not set');
    }
    return canvasRef.current;
  });

  // Инициализация холста
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Сохраняем пустой холст в историю
    setTimeout(() => {
      if (canvas) saveToHistory(canvas.toDataURL());
    }, 0);
    
    // Загружаем историю рисования из Firebase если есть
    if (roomId && replayDrawingHistory) {
      setTimeout(() => {
        replayDrawingHistory();
      }, 100);
    }
  }, [roomId, replayDrawingHistory, saveToHistory]);

  return (
    <div className="canvas-container">
      <canvas
        ref={canvasRef}
        id="main-canvas"
        width={1600}
        height={600}
        onMouseDown={startDrawing}
        onMouseMove={handleMouseMove}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        style={{ cursor: toolState.tool === 'fill' ? 'crosshair' : 'default' }}
      />
      
      {roomId && <RoomInfo roomId={roomId} />}
    </div>
  );
});

Canvas.displayName = 'Canvas';
export default Canvas;