import React, { useRef, useState, useEffect } from "react";
import { Stage, Layer, Line, Image as KonvaImage } from "react-konva";

type LineItem = {
  tool: "brush" | "eraser";
  color: string;
  strokeWidth: number;
  points: number[];
};

type FillItem = {
  fillLayer: true;
  image: HTMLImageElement;
};

type CanvasItem = LineItem | FillItem;

type CanvasProps = {
  color: string;
  lineWidth: number;
  tool: "brush" | "eraser" | "fill";
  undo: () => void;
  redo: () => void;
  registerUndo: (cb: () => void) => void;
  registerRedo: (cb: () => void) => void;
};

// --------------------------------------------------
// colors match
function colorsMatch(data: Uint8ClampedArray, pos: number, target: number[]) {
  return (
    data[pos] === target[0] &&
    data[pos + 1] === target[1] &&
    data[pos + 2] === target[2] &&
    data[pos + 3] === target[3]
  );
}

// --------------------------------------------------
// Flood fill with tolerance
function floodFill(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  fillColor: number[]
) {
  const { width, height } = ctx.canvas;

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  const offset = (x: number, y: number) => (y * width + x) * 4;

  const startPos = offset(x, y);

  const targetColor = [
    data[startPos],
    data[startPos + 1],
    data[startPos + 2],
    data[startPos + 3],
  ];

  // если цвет уже совпадает — выходим
  if (
    targetColor[0] === fillColor[0] &&
    targetColor[1] === fillColor[1] &&
    targetColor[2] === fillColor[2]
  )
    return;

  const stack = [[x, y]];

  while (stack.length) {
    const [cx, cy] = stack.pop()!;
    const pos = offset(cx, cy);

    if (!colorsMatch(data, pos, targetColor)) continue;

    data[pos] = fillColor[0];
    data[pos + 1] = fillColor[1];
    data[pos + 2] = fillColor[2];
    data[pos + 3] = 255;

    if (cx + 1 < width) stack.push([cx + 1, cy]);
    if (cx - 1 >= 0) stack.push([cx - 1, cy]);
    if (cy + 1 < height) stack.push([cx, cy + 1]);
    if (cy - 1 >= 0) stack.push([cx, cy - 1]);
  }

  ctx.putImageData(imageData, 0, 0);
}

// --------------------------------------------------

export default function Canvas({
  color,
  lineWidth,
  tool,
  undo,
  redo,
  registerUndo,
  registerRedo,
}: CanvasProps) {
  const stageRef = useRef<any>(null);

  const [items, setItems] = useState<CanvasItem[]>([]);
  const [redoStack, setRedoStack] = useState<CanvasItem[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  // главный холст
  const [stageWidth, setStageWidth] = useState(900);
  const [stageHeight, setStageHeight] = useState(600);

  // невидимый холст для заливки
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setStageWidth(window.innerWidth - 300);
    setStageHeight(window.innerHeight - 200);
  }, []);

  // --------------------------------------------------
  // Рендер всех линий в hidden canvas
  const renderToHiddenCanvas = () => {
    const canvas = hiddenCanvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    items.forEach((item) => {
      if ("fillLayer" in item) {
        ctx.drawImage(item.image, 0, 0, canvas.width, canvas.height);
      } else {
        ctx.strokeStyle = item.color;
        ctx.lineWidth = item.strokeWidth;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";

        ctx.beginPath();

        const pts = item.points;
        ctx.moveTo(pts[0], pts[1]);

        for (let i = 2; i < pts.length; i += 2) {
          ctx.lineTo(pts[i], pts[i + 1]);
        }

        ctx.stroke();
      }
    });
  };

  // --------------------------------------------------
  // Обработка Pointer Down
  const handlePointerDown = (e: any) => {
    const pos = e.target.getStage().getPointerPosition();
    if (!pos) return;

    if (tool === "fill") {
      renderToHiddenCanvas(); // готовим картинку
      performFill(pos.x, pos.y);
      return;
    }

    setIsDrawing(true);
    setRedoStack([]);

    const newLine: LineItem = {
      tool,
      color,
      strokeWidth: lineWidth,
      points: [pos.x, pos.y],
    };

    setItems((prev) => [...prev, newLine]);
  };

  // --------------------------------------------------
  const handlePointerMove = (e: any) => {
    if (!isDrawing) return;

    const pos = e.target.getStage().getPointerPosition();
    if (!pos) return;

    setItems((prev) => {
      const last = prev[prev.length - 1];
      if (!("points" in last)) return prev;

      const newPoints = [...last.points, pos.x, pos.y];
      const updated = { ...last, points: newPoints };

      return [...prev.slice(0, -1), updated];
    });
  };

  const handlePointerUp = () => setIsDrawing(false);

  // --------------------------------------------------
  // ЗАЛИВКА
  const performFill = (x: number, y: number) => {
    const canvas = hiddenCanvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    // HEX → RGB
    const rgb = [
      parseInt(color.slice(1, 3), 16),
      parseInt(color.slice(3, 5), 16),
      parseInt(color.slice(5, 7), 16),
      255,
    ];

    floodFill(ctx, Math.floor(x), Math.floor(y), rgb);

    // конверт в Image и добавление как слой
    const img = new Image();
    img.src = canvas.toDataURL();

    img.onload = () => {
      setItems((prev) => [...prev, { fillLayer: true, image: img }]);
      setRedoStack([]);
    };
  };

  // --------------------------------------------------
  // Undo / Redo
  const undoAction = () => {
    setItems((prev) => {
      if (!prev.length) return prev;
      setRedoStack((r) => [...r, prev[prev.length - 1]]);
      return prev.slice(0, -1);
    });
  };

  const redoAction = () => {
    setRedoStack((prev) => {
      if (!prev.length) return prev;
      const item = prev[prev.length - 1];
      setItems((i) => [...i, item]);
      return prev.slice(0, -1);
    });
  };

  useEffect(() => {
    registerUndo(undoAction);
    registerRedo(redoAction);
  }, []);

  // --------------------------------------------------

  return (
    <div className="p-4 bg-[#c0c0c0] flex justify-center items-center">
      {/* невидимый холст для заливки */}
      <canvas
        ref={hiddenCanvasRef}
        width={stageWidth}
        height={stageHeight}
        style={{ display: "none" }}
      />

      <div className="border-2 border-gray-600 shadow-xl bg-white">
        <Stage
          width={stageWidth}
          height={stageHeight}
          ref={stageRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <Layer>
            {items.map((item, i) =>
              "fillLayer" in item ? (
                <KonvaImage
                  key={i}
                  image={item.image}
                  x={0}
                  y={0}
                  width={stageWidth}
                  height={stageHeight}
                />
              ) : (
                <Line
                  key={i}
                  points={item.points}
                  stroke={item.color}
                  strokeWidth={item.strokeWidth}
                  lineCap="round"
                  lineJoin="round"
                  tension={0.4}
                  globalCompositeOperation={
                    item.tool === "eraser" ? "destination-out" : "source-over"
                  }
                />
              )
            )}
          </Layer>
        </Stage>
      </div>
    </div>
  );
}
