import React from "react";

type ToolbarProps = {
  color: string;
  setColor: (c: string) => void;
  tool: string;
  setTool: (t: string) => void;
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
  return (
    <div
      className="
        h-16 w-full 
        flex items-center gap-3 px-3
        bg-gradient-to-b from-[#e3edf8] to-[#bfd5ee]
        border-b border-[#3a6ea5]
        shadow-[inset_0_1px_0_#ffffff,inset_0_-1px_0_#8ea7c4]
      "
    >
      {/* Tool Button */}
      <Button active={tool === 'brush'} onClick={() => setTool('brush')}>
        🖌 Кисть
      </Button>

      <Button active={tool === 'eraser'} onClick={() => setTool('eraser')}>
        🧽 Ластик
      </Button>

      <Button active={tool === 'fill'} onClick={() => setTool('fill')}>
        🪣 Заливка
      </Button>

      <Button onClick={undo}>↶ Undo</Button>
      <Button onClick={redo}>↷ Redo</Button>

      <Button onClick={saveImage}>💾 Сохранить</Button>

      {/* Color Picker */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-[#1f3d68] font-semibold">Цвет:</span>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="
            w-10 h-10 border border-[#3a6ea5] rounded-sm
            shadow-[inset_1px_1px_0_#ffffff,inset_-1px_-1px_0_#7b9bbd]
          "
        />
      </div>

      {/* Line width */}
      <div className="flex items-center gap-2 ml-4">
        <span className="text-sm text-[#1f3d68] font-semibold">Толщина:</span>
        <input
          type="range"
          min={1}
          max={60}
          value={lineWidth}
          onChange={(e) => setLineWidth(Number(e.target.value))}
        />
        <span className="text-sm">{lineWidth}px</span>
      </div>
    </div>
  );
}

function Button({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        px-3 py-1
        text-sm
        min-w-[70px]
        rounded-sm
        border
        ${
          active
            ? "border-[#1d3955] bg-[#d6e5f5] shadow-[inset_1px_1px_0_#ffffff,inset_-1px_-1px_0_#8ea7c4]"
            : "border-[#7b9bbd] bg-[#e9f0f8] hover:bg-[#f7fbff] shadow-[1px_1px_0_#ffffff,inset_-1px_-1px_0_#8ea7c4]"
        }
      `}
    >
      {children}
    </button>
  );
}
