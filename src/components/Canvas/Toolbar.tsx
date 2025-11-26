import React from "react";

type ToolbarProps = {
  color: string;
  setColor: (c: string) => void;
  tool: "brush" | "eraser" | "fill";
  setTool: (t: "brush" | "eraser" | "fill") => void;
  lineWidth: number;
  setLineWidth: (v: number) => void;
  undo: () => void;
  redo: () => void;
  saveImage: () => void;
};

export default function Toolbar({
  color,
  setColor,
  tool,
  setTool,
  lineWidth,
  setLineWidth,
  undo,
  redo,
  saveImage,
}: ToolbarProps) {
  const Btn = ({
    active,
    children,
    onClick,
  }: {
    active?: boolean;
    children: React.ReactNode;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-md border text-sm 
        ${
          active
            ? "bg-[#e5e5e5] border-[#888] shadow-inner"
            : "bg-[#f0f0f0] border-[#999] active:shadow-inner hover:bg-white"
        }`}
      style={{ boxShadow: active ? "inset 2px 2px 3px #aaa" : "2px 2px 3px #aaa" }}
    >
      {children}
    </button>
  );

  return (
    <div className="w-full bg-[#d4d0c8] border-b border-[#808080] p-3 flex items-center gap-4">
      <Btn active={tool === "brush"} onClick={() => setTool("brush")}>
        Кисть
      </Btn>

      <Btn active={tool === "eraser"} onClick={() => setTool("eraser")}>
        Ластик
      </Btn>

      <Btn active={tool === "fill"} onClick={() => setTool("fill")}>
        Заливка
      </Btn>

      <div className="flex items-center gap-2 ml-6">
        <span className="text-sm">Цвет:</span>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-8 h-8 border border-black"
        />
      </div>

      <div className="flex items-center gap-2 ml-6">
        <span className="text-sm">Толщина:</span>
        <input
          type="range"
          min={1}
          max={50}
          value={lineWidth}
          onChange={(e) => setLineWidth(Number(e.target.value))}
        />
        <span className="text-sm">{lineWidth}px</span>
      </div>

      <Btn onClick={undo}>Undo</Btn>
      <Btn onClick={redo}>Redo</Btn>

      <Btn onClick={saveImage}>Сохранить</Btn>
    </div>
  );
}
