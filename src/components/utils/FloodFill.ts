import { hexToRgb } from './DrawingTools';

export const floodFill = (
  canvas: HTMLCanvasElement,
  startX: number,
  startY: number,
  fillColor: string
) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Получаем данные изображения один раз
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const width = canvas.width;
  const height = canvas.height;

  // Координаты для начала заливки
  const x = Math.floor(startX);
  const y = Math.floor(startY);

  // Проверка границ
  if (x < 0 || x >= width || y < 0 || y >= height) return;

  const startPos = (y * width + x) * 4;
  const startColor = {
    r: data[startPos],
    g: data[startPos + 1],
    b: data[startPos + 2],
    a: data[startPos + 3]
  };

  const fillColorRgb = hexToRgb(fillColor);
  if (!fillColorRgb) return;

  // Если цвет заливки совпадает с исходным цветом, ничего не делаем
  if (
    startColor.r === fillColorRgb.r &&
    startColor.g === fillColorRgb.g &&
    startColor.b === fillColorRgb.b &&
    startColor.a === 255 // Учитываем альфа-канал
  ) return;

  // Используем очередь вместо стека для лучшей производительности
  const queue: [number, number][] = [];
  queue.push([x, y]);

  // Массив для отслеживания посещенных пикселей (более эффективно, чем Set)
  const visited = new Uint8Array(width * height);
  const index = y * width + x;
  visited[index] = 1;

  // Цикл заливки
  while (queue.length > 0) {
    const [currentX, currentY] = queue.shift()!;
    
    // Находим левую границу линии
    let left = currentX;
    while (left > 0 && shouldFill(left - 1, currentY, data, startColor, width)) {
      left--;
    }
    
    // Находим правую границу линии
    let right = currentX;
    while (right < width - 1 && shouldFill(right + 1, currentY, data, startColor, width)) {
      right++;
    }
    
    // Заливаем линию и проверяем строки выше и ниже
    for (let i = left; i <= right; i++) {
      fillPixel(i, currentY, data, fillColorRgb, width);
      
      // Проверяем строку выше
      if (currentY > 0) {
        const upIndex = (currentY - 1) * width + i;
        if (!visited[upIndex] && shouldFill(i, currentY - 1, data, startColor, width)) {
          queue.push([i, currentY - 1]);
          visited[upIndex] = 1;
        }
      }
      
      // Проверяем строку ниже
      if (currentY < height - 1) {
        const downIndex = (currentY + 1) * width + i;
        if (!visited[downIndex] && shouldFill(i, currentY + 1, data, startColor, width)) {
          queue.push([i, currentY + 1]);
          visited[downIndex] = 1;
        }
      }
    }
  }

  // Применяем изменения на холсте
  ctx.putImageData(imageData, 0, 0);
};

// Вспомогательная функция для проверки, нужно ли заливать пиксель
const shouldFill = (
  x: number,
  y: number,
  data: Uint8ClampedArray,
  startColor: { r: number; g: number; b: number; a: number },
  width: number
): boolean => {
  const pos = (y * width + x) * 4;
  return (
    data[pos] === startColor.r &&
    data[pos + 1] === startColor.g &&
    data[pos + 2] === startColor.b &&
    data[pos + 3] === startColor.a
  );
};

// Вспомогательная функция для заливки пикселя
const fillPixel = (
  x: number,
  y: number,
  data: Uint8ClampedArray,
  fillColor: { r: number; g: number; b: number },
  width: number
) => {
  const pos = (y * width + x) * 4;
  data[pos] = fillColor.r;
  data[pos + 1] = fillColor.g;
  data[pos + 2] = fillColor.b;
  data[pos + 3] = 255;
};