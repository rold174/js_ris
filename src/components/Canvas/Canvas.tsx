import React from "react";
import useDrawing from "./useDrawing";
import useFill from "./useFill";

type CanvasProps = {
  color: string;
  tool: string;
  lineWidth: number;
};

const Canvas = React.forwardRef<HTMLCanvasElement, CanvasProps>(
  ({ color, tool, lineWidth }, ref) => {
    const { handleStart, handleDraw, handleEnd } = useDrawing(
      ref as React.RefObject<HTMLCanvasElement>,
      color,
      tool,
      lineWidth
    );

    const fill = useFill(
        ref as React.RefObject<HTMLCanvasElement>, 
        color, 
        tool
    );

    const start = (e: React.MouseEvent) => {
      const { offsetX, offsetY } = e.nativeEvent;

      if (tool === "fill") {
        fill(offsetX, offsetY);
        return;
      }

      handleStart(offsetX, offsetY);
    };

    const draw = (e: React.MouseEvent) => {
      const { offsetX, offsetY } = e.nativeEvent;
      handleDraw(offsetX, offsetY);
    };

    return (
      <canvas
        ref={ref}
        width={window.innerWidth}
        height={window.innerHeight - 80}
        className="bg-white border-t border-gray-300"
        onMouseDown={start}
        onMouseMove={draw}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
      />
    );
  }
);

export default Canvas;
