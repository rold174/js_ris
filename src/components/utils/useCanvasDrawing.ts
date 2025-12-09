import { useRef, useCallback } from 'react';
import { ToolState } from './ToolState';
import { getCanvasPoint } from './DrawingTools';
import { floodFill } from './FloodFill';

export const useCanvasDrawing = (
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  toolState: ToolState,
  setIsDrawing: (drawing: boolean) => void,
  saveToHistory: (canvasData: string) => void,
  onDraw?: (prevX: number, prevY: number, x: number, y: number) => void,
  onFillCanvas?: (x: number, y: number, color: string) => void
) => {
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const drawLine = useCallback((canvas: HTMLCanvasElement, x1: number, y1: number, x2: number, y2: number, color: string, lineWidth: number) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  }, []);

  const startDrawing = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Если инструмент - заливка, обрабатываем отдельно
    if (toolState.tool === 'fill') {
      const point = getCanvasPoint(canvas, e.clientX, e.clientY);
      
      // Выполняем заливку локально
      floodFill(canvas, point.x, point.y, toolState.color);
      
      // Сохраняем в историю
      saveToHistory(canvas.toDataURL());
      
      // Отправляем действие заливки для совместного рисования
      if (onFillCanvas) {
        onFillCanvas(point.x, point.y, toolState.color);
      }
      
      return;
    }

    // Для остальных инструментов (кисть, ластик)
    const point = getCanvasPoint(canvas, e.clientX, e.clientY);
    const color = toolState.tool === 'eraser' ? '#FFFFFF' : toolState.color;
    
    // Рисуем точку сразу
    drawLine(canvas, point.x, point.y, point.x, point.y, color, toolState.brushSize);
    
    // Если есть обработчик для совместного рисования, отправляем точку
    if (onDraw) {
      onDraw(point.x, point.y, point.x, point.y);
    }

    lastPointRef.current = point;
    isDrawingRef.current = true;
    setIsDrawing(true);

  }, [canvasRef, toolState, setIsDrawing, drawLine, onDraw, onFillCanvas, saveToHistory]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (toolState.tool === 'fill') return; // Для заливки не нужно обрабатывать движение
    
    if (!isDrawingRef.current || !lastPointRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const point = getCanvasPoint(canvas, e.clientX, e.clientY);
    const color = toolState.tool === 'eraser' ? '#FFFFFF' : toolState.color;
    
    // Рисуем линию
    drawLine(canvas, lastPointRef.current.x, lastPointRef.current.y, point.x, point.y, color, toolState.brushSize);
    
    // Отправляем линию для совместного рисования
    if (onDraw) {
      onDraw(lastPointRef.current.x, lastPointRef.current.y, point.x, point.y);
    }

    lastPointRef.current = point;

  }, [canvasRef, toolState, onDraw, drawLine]);

  const stopDrawing = useCallback(() => {
    if (toolState.tool === 'fill') return; // Для заливки не нужно останавливать рисование
    
    if (isDrawingRef.current) {
      isDrawingRef.current = false;
      setIsDrawing(false);
      
      if (canvasRef.current) {
        saveToHistory(canvasRef.current.toDataURL());
      }
      
      lastPointRef.current = null;
    }
  }, [canvasRef, saveToHistory, setIsDrawing, toolState.tool]);

  return {
    startDrawing,
    handleMouseMove,
    stopDrawing,
    isDrawingRef
  };
};