import React, { forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import './Canvas.css';
import { ToolState } from '../utils/ToolState';
import RoomInfo from './RoomInfo';
import { useCanvasDrawing } from '../utils/useCanvasDrawing';

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
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const {
    startDrawing,
    handleMouseMove,
    stopDrawing
  } = useCanvasDrawing(canvasRef, toolState, setIsDrawing, saveToHistory);

  useImperativeHandle(ref, () => {
    if (!canvasRef.current) {
      throw new Error('Canvas ref is not set');
    }
    return canvasRef.current;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    setTimeout(() => {
      if (canvas) saveToHistory(canvas.toDataURL());
    }, 0);
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
      
      {roomId && <RoomInfo roomId={roomId} />}
    </div>
  );
});

Canvas.displayName = 'Canvas';
export default Canvas;