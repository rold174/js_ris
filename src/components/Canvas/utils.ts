export const getPixel = (
  data: Uint8ClampedArray,
  x: number,
  y: number,
  width: number
) => {
  const i = (y * width + x) * 4;
  return [data[i], data[i + 1], data[i + 2], data[i + 3]];
};

export const setPixel = (
  data: Uint8ClampedArray,
  x: number,
  y: number,
  color: number[],
  width: number
) => {
  const i = (y * width + x) * 4;
  data[i] = color[0];
  data[i + 1] = color[1];
  data[i + 2] = color[2];
  data[i + 3] = color[3];
};

export const colorsMatch = (a: number[], b: number[]) =>
  a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];

export const hexToRGBA = (hex: string) => {
  const v = parseInt(hex.replace("#", ""), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255, 255];
};
