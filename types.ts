
export type AIAction = 'edit' | 'remove' | 'add' | 'restyle' | 'expand';

// Added missing ToolType for tool selection logic in EditorCanvas and ToolPanel
export type ToolType = 'select' | 'brush' | 'mask' | 'crop' | 'pan' | 'eraser';

// Added missing AspectRatio for image generation configuration in PropertyBar
export type AspectRatio = '1:1' | '4:3' | '16:9' | '9:16';

// Added missing Layer interface for image layer management in EditorCanvas and LayerPanel
export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  dataUrl: string | null;
}

export interface HistoryItem {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
}

export interface AppState {
  currentImage: string | null;
  history: HistoryItem[];
  isProcessing: boolean;
  prompt: string;
  error: string | null;
}
