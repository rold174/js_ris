import React, { forwardRef, useImperativeHandle, useRef, useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import './Canvas.css';
import { ToolState } from '../utils/ToolState';
import RoomInfo from './RoomInfo';
import { useSharedCanvas } from '../utils/useSharedCanvas';
import { initializeRoomCanvas } from '../utils/roomManager';
import { getUserId } from '../utils/firebaseRealtime';
import { useCanvasDrawing } from '../utils/useCanvasDrawing'; // Импортируем улучшенный хук

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
  const userId = getUserId();

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

  // Колбэк для отправки рисования
const handleDraw = useCallback((prevX: number, prevY: number, x: number, y: number) => {
  if (roomId) {
    // ОТПРАВЛЯЕМ БЕЗ ДЕБАУНСА - пусть firebase сам разберется
    sendDrawing(prevX, prevY, x, y);
  }
}, [roomId, sendDrawing]);

  // Используем улучшенный хук для рисования
  const {
    startDrawing,
    handleMouseMove,
    stopDrawing
  } = useCanvasDrawing(
    canvasRef,
    toolState,
    setIsDrawing,
    saveToHistory,
    handleDraw // Передаем колбэк для синхронизации
  );

  // Инициализация холста при загрузке
  useEffect(() => {
    if (roomId) {
      initializeRoomCanvas(roomId);
    }
  }, [roomId]);

  useImperativeHandle(ref, () => {
    if (!canvasRef.current) {
      throw new Error('Canvas ref is not set');
    }
    return canvasRef.current;
  });

  // Инициализация canvas context
  // В Canvas.tsx в useEffect инициализации:
  useEffect(() => {
  const canvas = canvasRef.current;
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  // Критически важные настройки для плавного рисования
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.globalCompositeOperation = 'source-over';
  
  // Начальные настройки
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 5;
  
  }, []);

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