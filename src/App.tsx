import React from "react";
import Canvas from "./components/Canvas/Canvas";
import Toolbar from "./components/Canvas/Toolbar";

export default function App() {
  const [color, setColor] = React.useState("black");
  const [tool, setTool] = React.useState("brush");
  const [lineWidth, setLineWidth] = React.useState(4);

  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  return (
    <div className="w-screen h-screen flex flex-col bg-gray-100">
      <Toolbar
        color={color}
        setColor={setColor}
        tool={tool}
        setTool={setTool}
        lineWidth={lineWidth}
        setLineWidth={setLineWidth}
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
