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

  // Алгоритм заливки (Flood Fill)
  const floodFill = (startX: number, startY: number, fillColor: string) => {
    const canvas = internalCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Получаем цвет начальной точки
    const startPos = (Math.floor(startY) * canvas.width + Math.floor(startX)) * 4;
    const startColor = {
      r: data[startPos],
      g: data[startPos + 1],
      b: data[startPos + 2],
      a: data[startPos + 3]
    };

    // Преобразуем цвет заливки в RGB
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };

    const fillColorRgb = hexToRgb(fillColor);
    if (!fillColorRgb) return;

    // Проверяем, не заливаем ли тем же цветом
    if (
      startColor.r === fillColorRgb.r &&
      startColor.g === fillColorRgb.g &&
      startColor.b === fillColorRgb.b
    ) {
      return;
    }

    const stack: [number, number][] = [[Math.floor(startX), Math.floor(startY)]];
    const visited = new Set<string>();

    while (stack.length > 0) {
      const [x, y] = stack.pop()!;
      const pos = (y * canvas.width + x) * 4;

      // Проверяем границы и посещенные точки
      if (
        x < 0 || x >= canvas.width ||
        y < 0 || y >= canvas.height ||
        visited.has(`${x},${y}`)
      ) {
        continue;
      }

      // Проверяем совпадение цвета
      if (
        data[pos] === startColor.r &&
        data[pos + 1] === startColor.g &&
        data[pos + 2] === startColor.b &&
        data[pos + 3] === startColor.a
      ) {
        // Заливаем пиксель
        data[pos] = fillColorRgb.r;
        data[pos + 1] = fillColorRgb.g;
        data[pos + 2] = fillColorRgb.b;
        data[pos + 3] = 255;

        visited.add(`${x},${y}`);

        // Добавляем соседние пиксели
        stack.push([x + 1, y]);
        stack.push([x - 1, y]);
        stack.push([x, y + 1]);
        stack.push([x, y - 1]);
      }
    }

    ctx.putImageData(imageData, 0, 0);
  };

  const startDrawing = (e: React.MouseEvent) => {
    const point = getCanvasPoint(e.clientX, e.clientY);
    
    if (toolState.tool === 'fill') {
      // Для заливки сразу выполняем действие
      floodFill(point.x, point.y, toolState.color);
      setIsDrawing(false);
      
      const canvas = internalCanvasRef.current;
      if (canvas) {
        saveToHistory(canvas.toDataURL());
      }
      return;
    }

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
    if (!isDrawing || toolState.tool === 'fill') return;

    const point = getCanvasPoint(e.clientX, e.clientY);

    if (toolState.tool === 'brush') {
      draw(point);
    } else if (toolState.tool === 'eraser') {
      erase(point);
    }
  };

  const stopDrawing = () => {
    if (isDrawing && toolState.tool !== 'fill') {
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
        style={{ 
          cursor: toolState.tool === 'fill' ? 'crosshair' : 
                 toolState.tool === 'brush' ? 'crosshair' : 'default' 
        }}
      />
      <div className="canvas-controls">
        <button onClick={clearCanvas} className="clear-btn">
          🚮
        </button>
      </div>
    </div>
  );
});

Canvas.displayName = 'Canvas';

export default Canvas;