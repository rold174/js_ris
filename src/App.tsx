import React from "react";
import Canvas, { CanvasHandle } from "./components/Canvas/Canvas";
import Toolbar from "./components/Canvas/Toolbar";

export default function App() {
  const [color, setColor] = React.useState("#000000");
  const [tool, setTool] = React.useState<"brush" | "eraser" | "fill">("brush");
  const [lineWidth, setLineWidth] = React.useState(4);

  const canvasRef = React.useRef<CanvasHandle>(null);

  return (
    <div className="w-screen h-screen flex flex-col bg-gray-100">
      <Toolbar
        color={color}
        setColor={setColor}
        tool={tool}
        setTool={(t) => setTool(t as any)}
        lineWidth={lineWidth}
        setLineWidth={setLineWidth}
        undo={() => canvasRef.current?.undo()}
        redo={() => canvasRef.current?.redo()}
      />

      <Canvas
        ref={canvasRef}
        color={color}
        tool={tool}
        lineWidth={lineWidth}
      />
    </div>
  );
}
