import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect
} from 'react';
import './Canvas.css';
import { ToolState } from '../App/App';

interface CanvasProps {
  isDrawing: boolean;
  setIsDrawing: (drawing: boolean) => void;
  toolState: ToolState;
  saveToHistory: (canvasData: string) => void;
}

const Canvas = forwardRef<HTMLCanvasElement, CanvasProps>(({
  isDrawing,
  setIsDrawing,
  toolState,
  saveToHistory
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const drawingRef = useRef(false);

  useImperativeHandle(ref, () => canvasRef.current!);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Save initial blank state to history (so undo has something)
    // Delay slightly to ensure canvas has correct size/layout
    setTimeout(() => {
      if (canvas) saveToHistory(canvas.toDataURL());
    }, 0);
  }, []);

  const getCanvasPoint = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  // Flood fill (same implementation, kept)
  const floodFill = (startX: number, startY: number, fillColor: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const startPos = (Math.floor(startY) * canvas.width + Math.floor(startX)) * 4;
    const startColor = {
      r: data[startPos],
      g: data[startPos + 1],
      b: data[startPos + 2],
      a: data[startPos + 3]
    };

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

    if (
      startColor.r === fillColorRgb.r &&
      startColor.g === fillColorRgb.g &&
      startColor.b === fillColorRgb.b
    ) return;

    const stack: [number, number][] = [[Math.floor(startX), Math.floor(startY)]];
    const visited = new Set<string>();

    while (stack.length) {
      const [x, y] = stack.pop()!;
      if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) continue;
      const key = `${x},${y}`;
      if (visited.has(key)) continue;

      const pos = (y * canvas.width + x) * 4;
      if (
        data[pos] === startColor.r &&
        data[pos + 1] === startColor.g &&
        data[pos + 2] === startColor.b &&
        data[pos + 3] === startColor.a
      ) {
        data[pos] = fillColorRgb.r;
        data[pos + 1] = fillColorRgb.g;
        data[pos + 2] = fillColorRgb.b;
        data[pos + 3] = 255;

        visited.add(key);

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
      floodFill(point.x, point.y, toolState.color);
      // Save after fill
      const canvas = canvasRef.current!;
      saveToHistory(canvas.toDataURL());
      setIsDrawing(false);
      drawingRef.current = false;
      return;
    }

    lastPointRef.current = point;
    setIsDrawing(true);
    drawingRef.current = true;

    // For immediate dot when mousedown without move
    if (toolState.tool === 'brush') {
      draw(point);
    }
  };

  const draw = (currentPoint: { x: number; y: number }) => {
    const canvas = canvasRef.current;
    if (!canvas || !drawingRef.current) return;
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
    const canvas = canvasRef.current;
    if (!canvas || !drawingRef.current) return;
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
    if (!drawingRef.current || toolState.tool === 'fill') return;
    const point = getCanvasPoint(e.clientX, e.clientY);
    if (toolState.tool === 'brush') draw(point);
    if (toolState.tool === 'eraser') erase(point);
  };

  const stopDrawing = () => {
    if (drawingRef.current && toolState.tool !== 'fill') {
      setIsDrawing(false);
      drawingRef.current = false;
      lastPointRef.current = null;

      // Save snapshot after finishing stroke
      if (canvasRef.current) saveToHistory(canvasRef.current.toDataURL());
    }
  };

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
        style={{ cursor: toolState.tool === 'fill' || toolState.tool === 'brush' ? 'crosshair' : 'default' }}
      />
    </div>
  );
});

Canvas.displayName = 'Canvas';
export default Canvas;
