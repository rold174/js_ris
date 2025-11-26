import React, { useEffect, useRef, useState, useCallback } from 'react';
import './Canvas.css';

interface CanvasProps {
  currentTool: string;
  brushSize: number;
  brushColor: string;
}

const Canvas: React.FC<CanvasProps> = ({ currentTool, brushSize, brushColor }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPosition, setLastPosition] = useState<{ x: number; y: number } | null>(null);

  // Функция для получения координат мыши относительно canvas
  const getMousePos = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }, []);

  // Функция рисования
  const draw = useCallback((currentPos: { x: number; y: number }) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !lastPosition) return;

    ctx.beginPath();
    ctx.moveTo(lastPosition.x, lastPosition.y);
    ctx.lineTo(currentPos.x, currentPos.y);
    
    if (currentTool === 'eraser') {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = brushSize;
    } else {
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushSize;
    }
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    setLastPosition(currentPos);
  }, [lastPosition, currentTool, brushSize, brushColor]);

  // Обработчики событий мыши
  const handleMouseDown = useCallback((e: MouseEvent) => {
    setIsDrawing(true);
    setLastPosition(getMousePos(e));
  }, [getMousePos]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDrawing) return;
    draw(getMousePos(e));
  }, [isDrawing, draw, getMousePos]);

  const handleMouseUp = useCallback(() => {
    setIsDrawing(false);
    setLastPosition(null);
  }, []);

  // Инициализация canvas и подписка на события
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Начальная настройка контекста
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }

    // Подписка на события
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseout', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseout', handleMouseUp);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp, brushColor, brushSize]);

  // Обработчик изменения размера окна
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        // Сохраняем текущее изображение
        const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
        
        // Меняем размер
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight - 60;
        
        // Восстанавливаем изображение
        if (imageData && ctx) {
          ctx.putImageData(imageData, 0, 0);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="canvas-container">
      <canvas 
        ref={canvasRef}
        id="main-canvas"
        width={window.innerWidth}
        height={window.innerHeight - 60}
      />
    </div>
  );
};

export default Canvas;