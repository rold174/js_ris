import { hexToRgb } from './DrawingTools';

export const floodFill = (
  canvas: HTMLCanvasElement,
  startX: number,
  startY: number,
  fillColor: string
) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  const startPos = (Math.floor(startY) * canvas.width + Math.floor(startX)) * 4;
  const startColor = {
    r: data[startPos],
    g: data[startPos + 1],
    b: data[startPos + 2],
    a: data[startPos + 3]
  };

  const fillColorRgb = hexToRgb(fillColor);
  if (!fillColorRgb) return;

  if (
    startColor.r === fillColorRgb.r &&
    startColor.g === fillColorRgb.g &&
    startColor.b === fillColorRgb.b
  ) return;

  const stack: [number, number][] = [[Math.floor(startX), Math.floor(startY)]];
  const visited = new Set<string>();

  while (stack.length) {
    const [x, y] = stack.pop()!;
    if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) continue;
    const key = `${x},${y}`;
    if (visited.has(key)) continue;

    const pos = (y * canvas.width + x) * 4;
    if (
      data[pos] === startColor.r &&
      data[pos + 1] === startColor.g &&
      data[pos + 2] === startColor.b &&
      data[pos + 3] === startColor.a
    ) {
      data[pos] = fillColorRgb.r;
      data[pos + 1] = fillColorRgb.g;
      data[pos + 2] = fillColorRgb.b;
      data[pos + 3] = 255;

      visited.add(key);

      stack.push([x + 1, y]);
      stack.push([x - 1, y]);
      stack.push([x, y + 1]);
      stack.push([x, y - 1]);
    }
  }

  ctx.putImageData(imageData, 0, 0);
};