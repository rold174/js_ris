import { useRef } from 'react';
import { ToolState } from './ToolState';
import { getCanvasPoint } from './DrawingTools';
import { floodFill } from './FloodFill';

export const useCanvasDrawing = (
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  toolState: ToolState,
  setIsDrawing: (drawing: boolean) => void,
  saveToHistory: (canvasData: string) => void
) => {
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const drawingRef = useRef(false);

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
  const startDrawing = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const point = getCanvasPoint(canvas, e.clientX, e.clientY);

    if (toolState.tool === 'fill') {
      floodFill(canvas, point.x, point.y, toolState.color);
      saveToHistory(canvas.toDataURL());
      setIsDrawing(false);
      drawingRef.current = false;
      return;
    }

    lastPointRef.current = point;
    setIsDrawing(true);
    drawingRef.current = true;

    if (toolState.tool === 'brush') {
      draw(point);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || !drawingRef.current || toolState.tool === 'fill') return;
    
    const point = getCanvasPoint(canvas, e.clientX, e.clientY);
    if (toolState.tool === 'brush') draw(point);
    if (toolState.tool === 'eraser') erase(point);
  };

  const stopDrawing = () => {
    const canvas = canvasRef.current;
    if (drawingRef.current && toolState.tool !== 'fill' && canvas) {
      setIsDrawing(false);
      drawingRef.current = false;
      lastPointRef.current = null;
      saveToHistory(canvas.toDataURL());
    }
  };

  return {
    startDrawing,
    handleMouseMove,
    stopDrawing
  };
};