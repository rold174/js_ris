import React from "react";
import useFill from "./useFill";
import useHistory from "./useHistory";
import "../styles/styles.css";

export type CanvasHandle = {
  undo: () => void;
  redo: () => void;
  saveImage: () => void;
};

type CanvasProps = {
  color: string;
  tool: string;
  lineWidth: number;
};

const Canvas = React.forwardRef<CanvasHandle, CanvasProps>(
  ({ color, tool, lineWidth }, ref) => {

    const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
    const isDrawing = React.useRef(false);
    const ctxRef = React.useRef<CanvasRenderingContext2D | null>(null);

    const { save, undo, redo } = useHistory(canvasRef);
    const fill = useFill(canvasRef, color, tool);

    React.useImperativeHandle(ref, () => ({
      undo,
      redo,
      saveImage,
    }));

    React.useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d")!;
      ctx.lineCap = "round";
      ctxRef.current = ctx;

      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      save();
    }, []);

const start = (e: React.PointerEvent) => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  canvas.setPointerCapture(e.pointerId);

  const { offsetX, offsetY } = e.nativeEvent;

  save();

  if (tool === "fill") {
    fill(offsetX, offsetY);
    save();
    return;
  }

  isDrawing.current = true;
  ctxRef.current!.lineWidth = lineWidth;
  ctxRef.current!.beginPath();
  ctxRef.current!.moveTo(offsetX, offsetY);
};

const draw = (e: React.PointerEvent) => {
  if (!isDrawing.current) return;

  const { offsetX, offsetY } = e.nativeEvent;

  ctxRef.current!.strokeStyle = tool === "eraser" ? "#ffffff" : color;
  ctxRef.current!.lineWidth = lineWidth;
  ctxRef.current!.lineTo(offsetX, offsetY);
  ctxRef.current!.stroke();
};

const end = (e: React.PointerEvent) => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  canvas.releasePointerCapture(e.pointerId);

  if (!isDrawing.current) return;

  isDrawing.current = false;
  ctxRef.current?.closePath();
};

    const saveImage = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const link = document.createElement("a");
      link.download = "drawing.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    };

    return (
      <div className="p-4 bg-[#c0c0c0] flex justify-center items-center">  
        <div className="canvas-wrapper">
          <canvas
            ref={canvasRef}
            width={window.innerWidth - 30}
            height={window.innerHeight - 100}
            className="bg-white"
            onPointerDown={start}
            onPointerMove={draw}
            onPointerUp={end}
          />
        </div>  
    </div>
    );
  }
);

export default Canvas;
