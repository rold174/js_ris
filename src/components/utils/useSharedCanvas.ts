// src/utils/useSharedCanvas.ts
import { useEffect, useRef, useCallback } from 'react';
import { 
  subscribeToCanvas, 
  sendDrawingAction, 
  addActiveUser, 
  removeActiveUser,
  updateUserActivity,
  DrawingData 
} from './firebaseRealtime';
import { ToolState } from './ToolState';

interface UseSharedCanvasProps {
  roomId: string;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  toolState: ToolState;
  userId: string;
}

export const useSharedCanvas = ({
  roomId,
  canvasRef,
  toolState,
  userId
}: UseSharedCanvasProps) => {
  const drawingHistory = useRef<DrawingData[]>([]);

  // Рисование на локальном холсте
  const drawOnCanvas = useCallback((data: DrawingData) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const { type, x, y, prevX, prevY, color, brushSize } = data;
    
    if (type === 'draw' && x !== undefined && y !== undefined && prevX !== undefined && prevY !== undefined) {
      ctx.beginPath();
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    } else if (type === 'clear') {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [canvasRef]);

  // Воспроизведение истории рисования
  const replayDrawingHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Очищаем холст
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Воспроизводим все действия
    drawingHistory.current.forEach(action => {
      drawOnCanvas(action);
    });
  }, [canvasRef, drawOnCanvas]);

  // Обработка обновлений от других пользователей
  useEffect(() => {
    if (!roomId) return;
    
    const handleCanvasUpdate = (elements: DrawingData[]) => {
      drawingHistory.current = elements;
      replayDrawingHistory();
    };
    
    const handleUsersUpdate = (users: string[]) => {
      console.log(`Активные пользователи в комнате ${roomId}:`, users.length);
    };
    
    // Подписываемся на обновления
    const unsubscribe = subscribeToCanvas(
      roomId, 
      handleCanvasUpdate, 
      handleUsersUpdate
    );
    
    // Добавляем пользователя в активные
    addActiveUser(roomId, userId);
    
    // Обновляем активность каждые 30 секунд
    const activityInterval = setInterval(() => {
      updateUserActivity(roomId, userId);
    }, 30000);
    
    return () => {
      unsubscribe();
      removeActiveUser(roomId, userId);
      clearInterval(activityInterval);
    };
  }, [roomId, userId, replayDrawingHistory]);

  // Отправка действия рисования
  const sendDrawing = useCallback(async (
    prevX: number,
    prevY: number,
    x: number,
    y: number
  ) => {
    if (!roomId || !userId) return;
    
    const drawingData: DrawingData = {
      type: 'draw',
      x,
      y,
      prevX,
      prevY,
      color: toolState.tool === 'eraser' ? '#FFFFFF' : toolState.color,
      brushSize: toolState.brushSize,
      timestamp: Date.now(),
      userId
    };
    
    try {
      await sendDrawingAction(roomId, drawingData);
    } catch (error) {
      console.error('Ошибка при отправке рисования:', error);
    }
  }, [roomId, userId, toolState]);

  // Отправка действия очистки
  const sendClearCanvas = useCallback(async () => {
    if (!roomId || !userId) return;
    
    const clearData: DrawingData = {
      type: 'clear',
      color: '#FFFFFF',
      brushSize: 0,
      timestamp: Date.now(),
      userId
    };
    
    try {
      await sendDrawingAction(roomId, clearData);
    } catch (error) {
      console.error('Ошибка при отправке очистки:', error);
    }
  }, [roomId, userId]);

  return {
    sendDrawing,
    sendClearCanvas,
    sendFillCanvas: sendClearCanvas, // Простая заливка (очистка цветом)
    replayDrawingHistory
  };
};