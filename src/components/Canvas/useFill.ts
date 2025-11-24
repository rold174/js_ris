import React from "react";
import { getPixel, setPixel, colorsMatch, hexToRGBA } from "./utils";

export default function useFill(
  ref: React.RefObject<HTMLCanvasElement>,
  color: string,
  tool: string
) {
  return (x: number, y: number) => {
    const canvas = ref.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d")!;
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = img.data;

    const targetColor = getPixel(data, x, y, canvas.width);
    const fillColor = hexToRGBA(tool === "eraser" ? "#ffffff" : color);

    if (colorsMatch(targetColor, fillColor)) return;

    const stack: [number, number][] = [[x, y]];

    while (stack.length) {
      const [cx, cy] = stack.pop()!;
      const current = getPixel(data, cx, cy, canvas.width);

      if (!colorsMatch(current, targetColor)) continue;

      setPixel(data, cx, cy, fillColor, canvas.width);

      if (cx > 0) stack.push([cx - 1, cy]);
      if (cx < canvas.width - 1) stack.push([cx + 1, cy]);
      if (cy > 0) stack.push([cx, cy - 1]);
      if (cy < canvas.height - 1) stack.push([cx, cy + 1]);
    }

    ctx.putImageData(img, 0, 0);
  };
}
