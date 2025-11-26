import React from "react";
import Canvas, { CanvasHandle } from "./components/Canvas/Canvas";
import Toolbar from "./components/Canvas/Toolbar";

export default function App() {
  const canvasRef = React.useRef<CanvasHandle>(null);

  const [color, setColor] = React.useState("#000000");
  const [tool, setTool] = React.useState<"brush" | "eraser">("brush");
  const [lineWidth, setLineWidth] = React.useState(5);

  return (
    <div className="w-full h-full overflow-hidden">
      <Toolbar
        color={color}
        setColor={setColor}
        tool={tool}
        setTool={setTool}
        lineWidth={lineWidth}
        setLineWidth={setLineWidth}
        undo={() => canvasRef.current?.undo()}
        redo={() => canvasRef.current?.redo()}
        saveImage={() => canvasRef.current?.saveImage()}
      />

      <Canvas
        ref={canvasRef}
        color={color}
        lineWidth={lineWidth}
        tool={tool}
      />
    </div>
  );
}
