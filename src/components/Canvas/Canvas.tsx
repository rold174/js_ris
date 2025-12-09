import React, { forwardRef, useImperativeHandle, useRef, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import './Canvas.css';
import { ToolState } from '../utils/ToolState';
import RoomInfo from './RoomInfo';
import { useSharedCanvas } from '../utils/useSharedCanvas';
import { initializeRoomCanvas } from '../utils/roomManager';
import { getUserId } from '../utils/firebaseRealtime'; // Добавим эту функцию

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
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('room');
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const userId = getUserId(); // Получаем ID пользователя

  const {
    sendDrawing,
    sendClearCanvas,
    sendFillCanvas,
    replayDrawingHistory
  } = useSharedCanvas({
    roomId: roomId || '',
    canvasRef,
    toolState,
    userId
  });

  // Инициализация холста при загрузке
  useEffect(() => {
    if (roomId) {
      initializeRoomCanvas(roomId);
    }
  }, [roomId]);

  // Получение координат мыши относительно холста
  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  // Начало рисования
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!roomId || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const { x, y } = getMousePos(e);
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = toolState.color;
    ctx.lineWidth = toolState.brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    lastPointRef.current = { x, y };
    setIsDrawing(true);
  };

  // Рисование
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPointRef.current || !roomId) return;
    
    const { x, y } = getMousePos(e);
    
    // Рисуем локально
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    
    // Отправляем действие другим пользователям
    sendDrawing(lastPointRef.current.x, lastPointRef.current.y, x, y);
    
    // Обновляем последнюю точку
    lastPointRef.current = { x, y };
    
    // Сохраняем в историю
    if (canvas && Math.random() < 0.1) { // Сохраняем случайные снимки
      saveToHistory(canvas.toDataURL());
    }
  };

  // Окончание рисования
  const stopDrawing = () => {
    setIsDrawing(false);
    lastPointRef.current = null;
    
    // Сохраняем окончательный результат
    if (canvasRef.current) {
      saveToHistory(canvasRef.current.toDataURL());
    }
  };

  useImperativeHandle(ref, () => {
    if (!canvasRef.current) {
      throw new Error('Canvas ref is not set');
    }
    return canvasRef.current;
  });

  // Инициализация холста при загрузке
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Загружаем существующие рисунки
    setTimeout(() => {
      replayDrawingHistory();
    }, 100);

  }, [replayDrawingHistory]);

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
      />
      
      {roomId && <RoomInfo roomId={roomId} activeUsers={activeUsers} />}
      
      {/* Панель совместного рисования */}
      {roomId && (
        <div className="collaboration-panel">
          <div className="panel-header">
            <span>👥 Совместное рисование</span>
            <span className="users-count">{activeUsers.length} участников</span>
          </div>
          <div className="panel-actions">
            <button 
              className="xp-button clear-btn"
              onClick={sendClearCanvas}
              title="Очистить холст для всех"
            >
              🧹 Очистить
            </button>
            <button 
              className="xp-button fill-btn"
              onClick={sendFillCanvas}
              title="Залить холст для всех"
            >
              🎨 Залить
            </button>
            <button 
              className="xp-button refresh-btn"
              onClick={replayDrawingHistory}
              title="Обновить рисунок"
            >
              🔄 Обновить
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

Canvas.displayName = 'Canvas';
export default Canvas;