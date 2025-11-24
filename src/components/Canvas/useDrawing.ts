import React from "react";

export default function useDrawing(
  ref: React.RefObject<HTMLCanvasElement>,
  color: string,
  tool: string,
  lineWidth: number
) {
  const isDrawing = React.useRef(false);
  const ctxRef = React.useRef<CanvasRenderingContext2D | null>(null);

  React.useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.lineCap = "round";
    ctxRef.current = ctx;
  }, [ref]);

  const handleStart = (x: number, y: number) => {
    isDrawing.current = true;
    ctxRef.current!.lineWidth = lineWidth;
    ctxRef.current!.beginPath();
    ctxRef.current!.moveTo(x, y);
  };

  const handleDraw = (x: number, y: number) => {
    if (!isDrawing.current) return;
    ctxRef.current!.strokeStyle = tool === "eraser" ? "white" : color;
    ctxRef.current!.lineWidth = lineWidth;
    ctxRef.current!.lineTo(x, y);
    ctxRef.current!.stroke();
  };

  const handleEnd = () => {
    isDrawing.current = false;
    ctxRef.current?.closePath();
  };

  return { handleStart, handleDraw, handleEnd };
}
