import React, { useRef, useState } from "react";
import Canvas from "./components/Canvas/Canvas";
import Toolbar from "./components/Canvas/Toolbar";

export default function App() {
  const [color, setColor] = useState("#000000");
  const [tool, setTool] = useState<"brush" | "eraser" | "fill">("brush");
  const [lineWidth, setLineWidth] = useState(5);

  const undoRef = useRef<() => void>(() => {});
  const redoRef = useRef<() => void>(() => {});

  const registerUndo = (cb: () => void) => {
    undoRef.current = cb;
  };

  const registerRedo = (cb: () => void) => {
    redoRef.current = cb;
  };

  const handleUndo = () => undoRef.current();
  const handleRedo = () => redoRef.current();

  // сохранение PNG
  const handleSaveImage = () => {
    const stage: any = document.querySelector("canvas")?.parentElement
      ?.parentElement;

    if (!stage) return;

    const konvaStage = stage.__konvaNode;
    if (!konvaStage) return;

    const dataURL = konvaStage.toDataURL({ pixelRatio: 2 });

    const link = document.createElement("a");
    link.download = "drawing.png";
    link.href = dataURL;
    link.click();
  };

  return (
    <div className="w-full h-full flex flex-col">
      <Toolbar
        color={color}
        setColor={setColor}
        tool={tool}
        setTool={setTool}
        lineWidth={lineWidth}
        setLineWidth={setLineWidth}
        undo={handleUndo}
        redo={handleRedo}
        saveImage={handleSaveImage}
      />

      <Canvas
        color={color}
        tool={tool}
        lineWidth={lineWidth}
        undo={handleUndo}
        redo={handleRedo}
        registerUndo={registerUndo}
        registerRedo={registerRedo}
      />
    </div>
  );
}
