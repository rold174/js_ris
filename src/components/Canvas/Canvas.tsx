import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState
} from "react";
import { Stage, Layer, Line } from "react-konva";

export type CanvasHandle = {
  undo: () => void;
  redo: () => void;
  saveImage: () => void;
};

type CanvasProps = {
  color: string;
  lineWidth: number;
  tool: "brush" | "eraser";
};

const Canvas = forwardRef<CanvasHandle, CanvasProps>(
  ({ color, lineWidth, tool }, ref) => {
    const stageRef = useRef<any>(null);

    const [lines, setLines] = useState<any[]>([]);
    const [redoStack, setRedoStack] = useState<any[]>([]);
    const isDrawing = useRef(false);

    const handlePointerDown = (e: any) => {
      isDrawing.current = true;
      const pos = e.target.getStage().getPointerPosition();

      setLines([
        ...lines,
        {
          tool,
          color: tool === "eraser" ? "white" : color,
          strokeWidth: lineWidth,
          points: [pos.x, pos.y]
        }
      ]);
      setRedoStack([]);
    };

    const handlePointerMove = (e: any) => {
      if (!isDrawing.current) return;

      const stage = e.target.getStage();
      const point = stage.getPointerPosition();
      const lastLine = lines[lines.length - 1];
      if (!lastLine) return;

      lastLine.points = [...lastLine.points, point.x, point.y];
      setLines(lines.concat());
    };

    const handlePointerUp = () => {
      isDrawing.current = false;
    };

    // ===== EXPORT FUNCTIONS =====
    useImperativeHandle(ref, () => ({
      undo() {
        if (lines.length === 0) return;
        const newLines = [...lines];
        const popped = newLines.pop();
        setRedoStack([...redoStack, popped]);
        setLines(newLines);
      },

      redo() {
        if (redoStack.length === 0) return;
        const newRedo = [...redoStack];
        const restored = newRedo.pop();
        setLines([...lines, restored]);
        setRedoStack(newRedo);
      },

      saveImage() {
        if (!stageRef.current) return;
        const uri = stageRef.current.toDataURL();

        const link = document.createElement("a");
        link.download = "drawing.png";
        link.href = uri;
        link.click();
      }
    }));

    return (
      <div className="p-4 bg-[#c0c0c0] flex justify-center items-center">
        <div className="border-2 border-gray-600 shadow-xl bg-white">
          <Stage
            width={window.innerWidth - 200}
            height={window.innerHeight - 150}
            ref={stageRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <Layer>
              {lines.map((line, i) => (
                <Line
                  key={i}
                  points={line.points}
                  stroke={line.color}
                  strokeWidth={line.strokeWidth}
                  tension={0.4}
                  lineCap="round"
                  lineJoin="round"
                  globalCompositeOperation={
                    line.tool === "eraser"
                      ? "destination-out"
                      : "source-over"
                  }
                />
              ))}
            </Layer>
          </Stage>
        </div>
      </div>
    );
  }
);

export default Canvas;
