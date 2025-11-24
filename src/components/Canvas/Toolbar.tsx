type ToolbarProps = {
  color: string;
  setColor: (c: string) => void;
  tool: string;
  setTool: (t: string) => void;
  lineWidth: number;
  setLineWidth: (v: number) => void;
};

export default function Toolbar({
  color,
  setColor,
  tool,
  setTool,
  lineWidth,
  setLineWidth
}: ToolbarProps) {
  return (
    <div className="h-20 w-full bg-white shadow flex items-center gap-6 px-4">

      <label className="flex items-center gap-2">
        Цвет:
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-10 h-10 p-0 border-none"
        />
      </label>

      <label className="flex items-center gap-2">
        Толщина:
        <input
          type="range"
          min={1}
          max={300}
          value={lineWidth}
          onChange={(e) => setLineWidth(Number(e.target.value))}
        />
        <span>{lineWidth}px</span>
      </label>

      <button
        className={`px-4 py-2 rounded-xl shadow ${
          tool === "brush" ? "bg-blue-300" : "bg-gray-200"
        }`}
        onClick={() => setTool("brush")}
      >
        Кисть
      </button>

      <button
        className={`px-4 py-2 rounded-xl shadow ${
          tool === "eraser" ? "bg-blue-300" : "bg-gray-200"
        }`}
        onClick={() => setTool("eraser")}
      >
        Ластик
      </button>

      <button
        className={`px-4 py-2 rounded-xl shadow ${
          tool === "fill" ? "bg-blue-300" : "bg-gray-200"
        }`}
        onClick={() => setTool("fill")}
      >
        Заливка
      </button>
    </div>
  );
}
