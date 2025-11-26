type ToolbarProps = {
  color: string;
  setColor: (c: string) => void;
  tool: "brush" | "eraser";
  setTool: (t: "brush" | "eraser") => void;
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
  saveImage
}: ToolbarProps) {
  const Btn = ({
    children,
    onClick
  }: {
    children: React.ReactNode;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className="px-3 py-1 bg-gray-200 border border-gray-600 rounded shadow active:shadow-inner mr-2"
    >
      {children}
    </button>
  );

  return (
    <div className="p-2 bg-[#e0e0e0] border-b-2 border-gray-600 flex items-center gap-2">
      <Btn onClick={() => setTool("brush")}>Кисть</Btn>
      <Btn onClick={() => setTool("eraser")}>Ластик</Btn>

      <span className="ml-4">Цвет:</span>
      <input
        type="color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
      />

      <span className="ml-4">Толщина:</span>
      <input
        type="range"
        min={1}
        max={50}
        value={lineWidth}
        onChange={(e) => setLineWidth(Number(e.target.value))}
      />

      <Btn onClick={undo}>Undo</Btn>
      <Btn onClick={redo}>Redo</Btn>
      <Btn onClick={saveImage}>Сохранить</Btn>
    </div>
  );
}
