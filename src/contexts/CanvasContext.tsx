import React, { createContext, useContext, ReactNode } from 'react';
import type { Canvas, Object as FabricObject, IText } from 'fabric';

interface CanvasContextType {
  fabricCanvas: Canvas | null;
  selectedObject: FabricObject | null;
  canvasObjects: FabricObject[];
  zoom: number;
  addImageToCanvas: (imageUrl: string, options?: { fit?: boolean; center?: boolean }) => void;
  addTextToCanvas: (
    text: string,
    options?: {
      fontSize?: number;
      fontFamily?: string;
      fill?: string;
      fontWeight?: string | number;
      fontStyle?: string;
    }
  ) => IText | undefined;
  removeSelectedObject: () => void;
  removeObject: (obj: FabricObject) => void;
  clearCanvas: () => void;
  getCanvasJSON: () => any;
  loadCanvasFromJSON: (json: any) => void;
  setZoom: (zoom: number) => void;
  resetView: () => void;
  exportHighDPI: () => Promise<Blob | null>;
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export function useCanvas() {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error('useCanvas must be used within a CanvasProvider');
  }
  return context;
}

interface CanvasProviderProps {
  children: ReactNode;
  value: CanvasContextType;
}

export function CanvasProvider({ children, value }: CanvasProviderProps) {
  return (
    <CanvasContext.Provider value={value}>
      {children}
    </CanvasContext.Provider>
  );
}
