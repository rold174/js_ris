import React, { forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import './Canvas.css';
import { ToolState } from '../App/App';

interface CanvasProps {
  isDrawing: boolean;
  setIsDrawing: (drawing: boolean) => void;
  toolState: ToolState;
  saveToHistory: (canvasData: string) => void;
  clearHistory: () => void;
}

const Canvas = forwardRef<HTMLCanvasElement, CanvasProps>(({
  isDrawing,
  setIsDrawing,
  toolState,
  saveToHistory,
  clearHistory
}, ref) => {
  const internalCanvasRef = useRef<HTMLCanvasElement>(null);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  useImperativeHandle(ref, () => internalCanvasRef.current!);

  useEffect(() => {
    const canvas = internalCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
  }, []);

  const getCanvasPoint = (clientX: number, clientY: number) => {
    const canvas = internalCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent) => {
    const point = getCanvasPoint(e.clientX, e.clientY);
    lastPointRef.current = point;
    setIsDrawing(true);

    if (toolState.tool === 'brush') {
      draw(point);
    }
  };

  const draw = (currentPoint: { x: number; y: number }) => {
    const canvas = internalCanvasRef.current;
    if (!canvas || !isDrawing) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = toolState.color;
    ctx.lineWidth = toolState.brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (lastPointRef.current) {
      ctx.beginPath();
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      ctx.lineTo(currentPoint.x, currentPoint.y);
      ctx.stroke();
    }

    lastPointRef.current = currentPoint;
  };

  const erase = (currentPoint: { x: number; y: number }) => {
    const canvas = internalCanvasRef.current;
    if (!canvas || !isDrawing) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = toolState.brushSize;
    ctx.lineCap = 'round';

    if (lastPointRef.current) {
      ctx.beginPath();
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      ctx.lineTo(currentPoint.x, currentPoint.y);
      ctx.stroke();
    }

    lastPointRef.current = currentPoint;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing) return;

    const point = getCanvasPoint(e.clientX, e.clientY);

    if (toolState.tool === 'brush') {
      draw(point);
    } else if (toolState.tool === 'eraser') {
      erase(point);
    }
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      lastPointRef.current = null;

      const canvas = internalCanvasRef.current;
      if (canvas) {
        saveToHistory(canvas.toDataURL());
      }
    }
  };

  const clearCanvas = () => {
    const canvas = internalCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      saveToHistory(canvas.toDataURL());
      clearHistory();
    }
  };

  return (
    <div className="canvas-container">
      <canvas
        ref={internalCanvasRef}
        id="main-canvas"
        width={800}
        height={600}
        onMouseDown={startDrawing}
        onMouseMove={handleMouseMove}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
      <div className="canvas-controls">
        <button onClick={clearCanvas} className="clear-btn">
          Очистить холст
        </button>
      </div>
    </div>
  );
});

Canvas.displayName = 'Canvas';

export default Canvas;