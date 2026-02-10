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
import { v4 as uuidv4 } from 'uuid';

export interface UseFabricCanvasOptions {
  onObjectAdded?: (obj: FabricObject) => void;
  onObjectRemoved?: (obj: FabricObject) => void;
  onObjectModified?: (obj: FabricObject) => void;
  onSelectionCreated?: (obj: FabricObject | null) => void;
  onSelectionCleared?: () => void;
  canvasWidth?: number;
  canvasHeight?: number;
  initDelay?: number; // Delay in ms before initializing (to stagger multiple canvases)
}

// Extended Fabric object with custom properties for tracking
export interface TrackedFabricObject extends FabricObject {
  id?: string;
  view?: 'front' | 'back';
  createdAt?: number;
  modifiedAt?: number;
}

export function useFabricCanvas(
  canvasId: string,
  view: 'front' | 'back', // NEW: Identify which canvas this is
  options: UseFabricCanvasOptions = {}
) {
  const canvasRef = useRef<Canvas | null>(null);
  const [selectedObject, setSelectedObject] = useState<FabricObject | null>(null);
  const [canvasObjects, setCanvasObjects] = useState<FabricObject[]>([]);
  const [zoom, setZoomLevel] = useState(1);

  // Helper function to attach tracking metadata to objects
  const attachObjectMetadata = useCallback((obj: FabricObject) => {
    const trackedObj = obj as TrackedFabricObject;

    // Only add metadata if it doesn't already exist (for loaded objects)
    if (!trackedObj.id) {
      trackedObj.id = uuidv4();
      trackedObj.view = view;
      trackedObj.createdAt = Date.now();
      trackedObj.modifiedAt = Date.now();
    }

    return trackedObj;
  }, [view]);

  // Update modified timestamp
  const updateObjectTimestamp = useCallback((obj: FabricObject) => {
    const trackedObj = obj as TrackedFabricObject;
    trackedObj.modifiedAt = Date.now();
  }, []);

  // Initialize canvas
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 20; // Try for 4 seconds (20 * 200ms)
    let retryTimer: number | null = null;

    const initCanvas = () => {
      attempts++;
      
      const canvasElement = document.getElementById(canvasId) as HTMLCanvasElement;
      
      if (!canvasElement) {
        if (attempts < maxAttempts) {
          // Retry after a short delay
          retryTimer = window.setTimeout(initCanvas, 200);
          if (attempts % 5 === 0) { // Log every 1 second
            console.log(`Retrying canvas initialization for ${canvasId}... (attempt ${attempts})`);
          }
          return;
        } else {
          console.error(`Canvas element ${canvasId} not found in DOM after ${maxAttempts} attempts`);
          return;
        }
      }

      // Check if element is properly attached to DOM
      if (!canvasElement.parentElement) {
        if (attempts < maxAttempts) {
          retryTimer = window.setTimeout(initCanvas, 200);
          return;
        }
        console.warn(`Canvas element ${canvasId} has no parent after ${maxAttempts} attempts`);
        return;
      }

      // Avoid double initialization
      if (canvasRef.current) {
        console.log(`Canvas ${canvasId} already initialized`);
        return;
      }

      console.log(`✅ Initializing canvas: ${canvasId} (attempt ${attempts})`);

      const canvas = new Canvas(canvasId, {
        width: options.canvasWidth || UI_CANVAS_WIDTH,
        height: options.canvasHeight || UI_CANVAS_HEIGHT,
        backgroundColor: 'transparent',
        selection: true,
        preserveObjectStacking: true,
        enableRetinaScaling: false, // Prevent automatic scaling
        // Keep controls crisp at any zoom level
        controlsAboveOverlay: true,
      });

      canvasRef.current = canvas;

      // Event handlers
      canvas.on('object:added', (e) => {
        if (e.target) {
          // Attach metadata to new objects
          attachObjectMetadata(e.target);
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
          // Update timestamp on modification
          updateObjectTimestamp(e.target);
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
    };

    // Defer initialization to next frame for proper DOM attachment
    // If initDelay is specified, add additional delay to stagger multiple canvas initializations
    const delay = options.initDelay || 0;

    const timeoutId = setTimeout(() => {
      requestAnimationFrame(() => {
        initCanvas();
      });
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      if (retryTimer !== null) {
        clearTimeout(retryTimer);
      }
      if (canvasRef.current) {
        canvasRef.current.dispose();
      }
    };
  }, [canvasId, options.initDelay]); // Only re-initialize if canvasId or delay changes

  // Update canvas dimensions when they change WITHOUT recreating the canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvasWidth = options.canvasWidth || UI_CANVAS_WIDTH;
    const canvasHeight = options.canvasHeight || UI_CANVAS_HEIGHT;
    
    canvasRef.current.setDimensions({
      width: canvasWidth,
      height: canvasHeight,
    });
    
    canvasRef.current.renderAll();
  }, [options.canvasWidth, options.canvasHeight]);

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

        const canvas = canvasRef.current;
        const canvasWidth = canvas.width || UI_CANVAS_WIDTH;
        const canvasHeight = canvas.height || UI_CANVAS_HEIGHT;

        // Fit to design area if requested
        if (options.fit !== false) {
          fitToDesignArea(img, canvasWidth, canvasHeight);
        }

        // Center if requested
        if (options.center !== false) {
          centerObject(img, canvas);
        }

        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
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

      const canvas = canvasRef.current;
      const centerX = (canvas.width || UI_CANVAS_WIDTH) / 2;
      const centerY = (canvas.height || UI_CANVAS_HEIGHT) / 2;

      const textObj = new IText(text, {
        fontSize: options.fontSize || 40,
        fontFamily: options.fontFamily || 'Arial',
        fill: options.fill || '#000000',
        fontWeight: options.fontWeight || 'normal',
        fontStyle: options.fontStyle || 'normal',
        left: centerX,
        top: centerY,
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

  // Set zoom - keep canvas at 1.0, use CSS transform for visual zoom
  const setZoom = useCallback((zoomLevel: number) => {
    if (!canvasRef.current) return;

    const zoom = Math.max(0.1, Math.min(3, zoomLevel));
    
    // Don't zoom the canvas itself - keep at 1.0 for crisp controls
    // The parent container will handle visual zoom via CSS transform
    setZoomLevel(zoom);
  }, []);

  // Reset view
  const resetView = useCallback(() => {
    if (!canvasRef.current) return;

    // Reset zoom level
    setZoomLevel(1);
    canvasRef.current.renderAll();
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
    updateCanvasObjects,
  };
}
