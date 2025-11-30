import { useEffect, useRef, useState, useCallback } from 'react';
import { Canvas, Image, IText, Object as FabricObject } from 'fabric';
import {
  enforceCanvasBounds,
  fitToDesignArea,
  centerObject,
  UI_CANVAS_WIDTH,
  UI_CANVAS_HEIGHT,
  PRINT_WIDTH,
  PRINT_HEIGHT,
  SCALE_FACTOR,
} from '../utils/fabricHelpers';

export interface UseFabricCanvasOptions {
  onObjectAdded?: (obj: FabricObject) => void;
  onObjectRemoved?: (obj: FabricObject) => void;
  onObjectModified?: (obj: FabricObject) => void;
  onSelectionCreated?: (obj: FabricObject | null) => void;
  onSelectionCleared?: () => void;
}

export function useFabricCanvas(
  canvasId: string,
  options: UseFabricCanvasOptions = {}
) {
  const canvasRef = useRef<Canvas | null>(null);
  const [selectedObject, setSelectedObject] = useState<FabricObject | null>(null);
  const [canvasObjects, setCanvasObjects] = useState<FabricObject[]>([]);
  const [zoom, setZoomLevel] = useState(1);

  // Initialize canvas
  useEffect(() => {
    const canvasElement = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvasElement) return;

    const canvas = new Canvas(canvasId, {
      width: UI_CANVAS_WIDTH,
      height: UI_CANVAS_HEIGHT,
      backgroundColor: 'transparent',
      selection: true,
      preserveObjectStacking: true,
    });

    canvasRef.current = canvas;

    // Event handlers
    canvas.on('object:added', (e) => {
      if (e.target) {
        options.onObjectAdded?.(e.target);
        updateCanvasObjects();
      }
    });

    canvas.on('object:removed', (e) => {
      if (e.target) {
        options.onObjectRemoved?.(e.target);
        updateCanvasObjects();
      }
    });

    canvas.on('object:modified', (e) => {
      if (e.target) {
        enforceCanvasBounds(e.target, canvas);
        options.onObjectModified?.(e.target);
        canvas.renderAll();
      }
    });

    canvas.on('object:moving', (e) => {
      if (e.target) {
        enforceCanvasBounds(e.target, canvas);
      }
    });

    canvas.on('selection:created', (e) => {
      const obj = e.selected?.[0] || null;
      setSelectedObject(obj);
      options.onSelectionCreated?.(obj);
    });

    canvas.on('selection:updated', (e) => {
      const obj = e.selected?.[0] || null;
      setSelectedObject(obj);
      options.onSelectionCreated?.(obj);
    });

    canvas.on('selection:cleared', () => {
      setSelectedObject(null);
      options.onSelectionCleared?.();
    });

    return () => {
      canvas.dispose();
    };
  }, [canvasId]);

  // Update canvas objects array
  const updateCanvasObjects = useCallback(() => {
    if (canvasRef.current) {
      setCanvasObjects([...canvasRef.current.getObjects()]);
    }
  }, []);

  // Add image to canvas
  const addImageToCanvas = useCallback(
    (imageUrl: string, options: { fit?: boolean; center?: boolean } = {}) => {
      if (!canvasRef.current) return;

      Image.fromURL(imageUrl, { crossOrigin: 'anonymous' }).then((img) => {
        if (!canvasRef.current) return;

        // Fit to design area if requested
        if (options.fit !== false) {
          fitToDesignArea(img, UI_CANVAS_WIDTH, UI_CANVAS_HEIGHT);
        }

        // Center if requested
        if (options.center !== false) {
          centerObject(img, canvasRef.current);
        }

        canvasRef.current.add(img);
        canvasRef.current.setActiveObject(img);
        canvasRef.current.renderAll();
      });
    },
    []
  );

  // Add text to canvas
  const addTextToCanvas = useCallback(
    (
      text: string,
      options: {
        fontSize?: number;
        fontFamily?: string;
        fill?: string;
        fontWeight?: string | number;
        fontStyle?: string;
      } = {}
    ) => {
      if (!canvasRef.current) return;

      const textObj = new IText(text, {
        fontSize: options.fontSize || 40,
        fontFamily: options.fontFamily || 'Arial',
        fill: options.fill || '#000000',
        fontWeight: options.fontWeight || 'normal',
        fontStyle: options.fontStyle || 'normal',
        left: UI_CANVAS_WIDTH / 2,
        top: UI_CANVAS_HEIGHT / 2,
        originX: 'center',
        originY: 'center',
      });

      canvasRef.current.add(textObj);
      canvasRef.current.setActiveObject(textObj);
      canvasRef.current.renderAll();

      return textObj;
    },
    []
  );

  // Remove selected object
  const removeSelectedObject = useCallback(() => {
    if (!canvasRef.current || !selectedObject) return;

    canvasRef.current.remove(selectedObject);
    canvasRef.current.renderAll();
    setSelectedObject(null);
  }, [selectedObject]);

  // Remove specific object
  const removeObject = useCallback((obj: FabricObject) => {
    if (!canvasRef.current) return;

    canvasRef.current.remove(obj);
    canvasRef.current.renderAll();
  }, []);

  // Clear all objects
  const clearCanvas = useCallback(() => {
    if (!canvasRef.current) return;

    canvasRef.current.clear();
    canvasRef.current.backgroundColor = 'transparent';
    canvasRef.current.renderAll();
    setCanvasObjects([]);
  }, []);

  // Get canvas JSON
  const getCanvasJSON = useCallback(() => {
    if (!canvasRef.current) return null;
    return canvasRef.current.toJSON();
  }, []);

  // Load canvas from JSON
  const loadCanvasFromJSON = useCallback((json: any) => {
    if (!canvasRef.current) return;

    canvasRef.current.loadFromJSON(json, () => {
      canvasRef.current?.renderAll();
      updateCanvasObjects();
    });
  }, [updateCanvasObjects]);

  // Set zoom
  const setZoom = useCallback((zoomLevel: number) => {
    if (!canvasRef.current) return;

    const zoom = Math.max(0.1, Math.min(3, zoomLevel));
    canvasRef.current.setZoom(zoom);
    canvasRef.current.renderAll();
    setZoomLevel(zoom);
  }, []);

  // Reset view
  const resetView = useCallback(() => {
    if (!canvasRef.current) return;

    canvasRef.current.setZoom(1);
    canvasRef.current.viewportTransform = [1, 0, 0, 1, 0, 0];
    canvasRef.current.renderAll();
    setZoomLevel(1);
  }, []);

  // Export high DPI (will be expanded in Phase 4)
  const exportHighDPI = useCallback(async (): Promise<Blob | null> => {
    if (!canvasRef.current) return null;

    // Create temporary canvas element at print resolution
    const tempCanvasEl = document.createElement('canvas');
    tempCanvasEl.width = PRINT_WIDTH;
    tempCanvasEl.height = PRINT_HEIGHT;
    
    const tempCanvas = new Canvas(tempCanvasEl, {
      width: PRINT_WIDTH,
      height: PRINT_HEIGHT,
    });

    const json = canvasRef.current.toJSON();
    
    return new Promise((resolve) => {
      tempCanvas.loadFromJSON(json, () => {
        // Scale all objects
        const objects = tempCanvas.getObjects();
        const scaleFactor = 1 / SCALE_FACTOR;

        objects.forEach((obj) => {
          obj.scaleX = (obj.scaleX || 1) * scaleFactor;
          obj.scaleY = (obj.scaleY || 1) * scaleFactor;
          obj.left = (obj.left || 0) * scaleFactor;
          obj.top = (obj.top || 0) * scaleFactor;
          obj.setCoords();
        });

        tempCanvas.renderAll();

        // Export as blob
        const dataURL = tempCanvas.toDataURL({
          format: 'png',
          quality: 1,
          multiplier: 1,
        });

        fetch(dataURL)
          .then((res) => res.blob())
          .then((blob) => {
            tempCanvas.dispose();
            resolve(blob);
          })
          .catch(() => {
            tempCanvas.dispose();
            resolve(null);
          });
      });
    });
  }, []);

  return {
    canvasRef: canvasRef.current,
    selectedObject,
    canvasObjects,
    zoom,
    addImageToCanvas,
    addTextToCanvas,
    removeSelectedObject,
    removeObject,
    clearCanvas,
    getCanvasJSON,
    loadCanvasFromJSON,
    setZoom,
    resetView,
    exportHighDPI,
  };
}
