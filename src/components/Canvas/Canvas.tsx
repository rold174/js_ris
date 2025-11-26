import React, { useEffect, useRef } from 'react';
import './Canvas.css';

const Canvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight - 60;
      }
    };

    window.addEventListener('resize', handleResize);
    
    // Инициализация canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Начальная настройка контекста
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
      }
    }

    return () => {
      window.removeEventListener('resize', handleResize);
    };
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