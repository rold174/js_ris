export interface ToolState {
  tool: string;
  color: string;
  brushSize: number;
}

export interface HistoryItem {
  canvasData: string;
  toolState: ToolState;
}

export const MAX_HISTORY = 100;