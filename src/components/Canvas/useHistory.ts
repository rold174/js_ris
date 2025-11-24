import React from "react";

export default function useHistory(
  ref: React.RefObject<HTMLCanvasElement | null>
) {
  const history = React.useRef<ImageData[]>([]);
  const redoStack = React.useRef<ImageData[]>([]);

  const save = () => {
    const canvas = ref.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d")!;
    const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);

    history.current.push(snapshot);
    redoStack.current = [];
  };

  const undo = () => {
    const canvas = ref.current;
    if (!canvas) return;
    if (history.current.length === 0) return;

    const ctx = canvas.getContext("2d")!;
    const previous = history.current.pop()!;
    redoStack.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    ctx.putImageData(previous, 0, 0);
  };

  const redo = () => {
    const canvas = ref.current;
    if (!canvas) return;
    if (redoStack.current.length === 0) return;

    const ctx = canvas.getContext("2d")!;
    history.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    const next = redoStack.current.pop()!;
    ctx.putImageData(next, 0, 0);
  };

  return { save, undo, redo };
}
