import { useState, useCallback, useRef, useEffect } from 'react';

// Pan boundary constants
const PAN_BOUNDARIES = {
  MARGIN: 100, // Minimum visible pixels of design area
  VIEWPORT_WIDTH: 1200, // Approximate canvas area width
  VIEWPORT_HEIGHT: 800, // Approximate canvas area height
  DESIGN_WIDTH: 240, // Base design area width (at 100% default zoom)
  DESIGN_HEIGHT: 280, // Base design area height (at 100% default zoom)
  DEFAULT_ZOOM: 100, // Default zoom percentage
};

export interface UseCanvasZoomPanReturn {
  // State
  canvasScale: number;
  panOffset: { x: number; y: number };
  isPanning: boolean;
  spaceKeyPressed: boolean;
  isPanningCanvas: boolean; // NEW: for click & drag pan
  isSpacePanning: boolean; // NEW: for Space + drag pan
  
  // Zoom methods
  zoomIn: () => void;
  zoomOut: () => void;
  setZoom: (scale: number) => void;
  zoomToPreset: (preset: number) => void;
  resetView: () => void;
  
  // Pan methods
  startPan: (clientX: number, clientY: number) => void;
  updatePan: (clientX: number, clientY: number) => void;
  endPan: () => void;
  
  // NEW: Click & drag pan methods
  handleCanvasMouseDown: (e: React.MouseEvent) => void;
  handleCanvasMouseMove: (e: React.MouseEvent) => void;
  handleCanvasMouseUp: () => void;
  
  // NEW: Space overlay pan methods
  handleOverlayMouseDown: (e: React.MouseEvent) => void;
  handleOverlayMouseMove: (e: React.MouseEvent) => void;
  handleOverlayMouseUp: () => void;
  
  // Event handlers
  handleKeyDown: (e: KeyboardEvent) => void;
  handleKeyUp: (e: KeyboardEvent) => void;
  handleWheel: (e: WheelEvent) => void;
}

export function useCanvasZoomPan(): UseCanvasZoomPanReturn {
  // State
  const [canvasScale, setCanvasScale] = useState(0.25); // Default 25%
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [spaceKeyPressed, setSpaceKeyPressed] = useState(false);
  const [isPanningCanvas, setIsPanningCanvas] = useState(false); // NEW: click & drag pan
  const [isSpacePanning, setIsSpacePanning] = useState(false); // NEW: Space + drag pan
  const panStartRef = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 });

  // Zoom methods
  const zoomIn = useCallback(() => {
    setCanvasScale(prev => Math.min(4, prev + 0.1));
  }, []);

  const zoomOut = useCallback(() => {
    setCanvasScale(prev => Math.max(0.25, prev - 0.1));
  }, []);

  const setZoom = useCallback((scale: number) => {
    setCanvasScale(Math.max(0.25, Math.min(4, scale)));
  }, []);

  const zoomToPreset = useCallback((preset: number) => {
    setCanvasScale(preset / 100);
  }, []);

  const resetView = useCallback(() => {
    setCanvasScale(0.25); // Reset to default 25%
    setPanOffset({ x: 0, y: 0 }); // Reset pan to center
  }, []);

  // Boundary calculation and enforcement
  const applyBoundaries = useCallback((x: number, y: number, scale: number) => {
    // Calculate the actual design area size after applying scale
    const scaledWidth = (PAN_BOUNDARIES.DESIGN_WIDTH * (PAN_BOUNDARIES.DEFAULT_ZOOM / 100)) * scale;
    const scaledHeight = (PAN_BOUNDARIES.DESIGN_HEIGHT * (PAN_BOUNDARIES.DEFAULT_ZOOM / 100)) * scale;
    
    // Calculate max pan offsets (design area can go to edges but not beyond)
    const maxPanX = (PAN_BOUNDARIES.VIEWPORT_WIDTH - scaledWidth) / 2 + PAN_BOUNDARIES.MARGIN;
    const maxPanY = (PAN_BOUNDARIES.VIEWPORT_HEIGHT - scaledHeight) / 2 + PAN_BOUNDARIES.MARGIN;
    const minPanX = -(PAN_BOUNDARIES.VIEWPORT_WIDTH - scaledWidth) / 2 - PAN_BOUNDARIES.MARGIN;
    const minPanY = -(PAN_BOUNDARIES.VIEWPORT_HEIGHT - scaledHeight) / 2 - PAN_BOUNDARIES.MARGIN;
    
    // Clamp pan offsets within boundaries
    return {
      x: Math.max(minPanX, Math.min(maxPanX, x)),
      y: Math.max(minPanY, Math.min(maxPanY, y))
    };
  }, []);

  // Pan methods
  const startPan = useCallback((clientX: number, clientY: number) => {
    setIsPanning(true);
    panStartRef.current = {
      x: clientX,
      y: clientY,
      offsetX: panOffset.x,
      offsetY: panOffset.y,
    };
  }, [panOffset]);

  const updatePan = useCallback((clientX: number, clientY: number) => {
    if (!isPanning) return;
    
    const deltaX = clientX - panStartRef.current.x;
    const deltaY = clientY - panStartRef.current.y;
    
    // Apply boundaries
    const newOffset = applyBoundaries(
      panStartRef.current.offsetX + deltaX,
      panStartRef.current.offsetY + deltaY,
      canvasScale
    );
    
    setPanOffset(newOffset);
  }, [isPanning, canvasScale, applyBoundaries]);

  const endPan = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Keyboard handlers
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Check if user is editing text
    const target = e.target as HTMLElement;
    const isEditingText = target.tagName === 'INPUT' || 
                          target.tagName === 'TEXTAREA' || 
                          target.isContentEditable;
    
    // Zoom shortcuts
    if ((e.ctrlKey || e.metaKey) && !isEditingText) {
      if (e.key === '=' || e.key === '+') {
        e.preventDefault();
        zoomIn();
      } else if (e.key === '-') {
        e.preventDefault();
        zoomOut();
      } else if (e.key === '0') {
        e.preventDefault();
        setZoom(1);
      }
    }
    
    // Pan mode (Space key) - also check Fabric.js IText editing
    if (e.code === 'Space' && !isEditingText) {
      const activeElement = document.activeElement;
      const isFabricTextEditing = activeElement?.classList.contains('upper-canvas');
      
      if (!isFabricTextEditing) {
        e.preventDefault();
        setSpaceKeyPressed(true);
      }
    }
  }, [zoomIn, zoomOut, setZoom]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space') {
      setSpaceKeyPressed(false);
      setIsSpacePanning(false);
      setIsPanning(false);
    }
  }, []);

  const handleWheel = useCallback((e: WheelEvent | React.WheelEvent) => {
    // Ctrl/Cmd + Wheel = Zoom on canvas
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault(); // Prevent browser zoom
      e.stopPropagation(); // Stop event from bubbling
      
      // Use RAF for smooth updates
      requestAnimationFrame(() => {
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setCanvasScale(prev => Math.max(0.25, Math.min(4, prev + delta)));
      });
    }
  }, []);

  // NEW: Click & Drag Pan handlers
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    
    // Only exclude clicks directly on the Fabric.js canvas element (not nearby elements)
    // Check if the target itself is a canvas with the design-canvas ID or any canvas element
    if (target.tagName === 'CANVAS') {
      return; // Let Fabric.js handle canvas interactions
    }
    
    // Everything else (grey area, design area borders, etc.) can trigger pan
    setIsPanningCanvas(true);
    panStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      offsetX: panOffset.x,
      offsetY: panOffset.y
    };
  }, [panOffset]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    // Only handle regular canvas pan, not space pan (overlay handles that)
    if (isPanningCanvas) {
      const deltaX = e.clientX - panStartRef.current.x;
      const deltaY = e.clientY - panStartRef.current.y;
      
      // Apply boundaries
      const newOffset = applyBoundaries(
        panStartRef.current.offsetX + deltaX,
        panStartRef.current.offsetY + deltaY,
        canvasScale
      );
      
      setPanOffset(newOffset);
    }
  }, [isPanningCanvas, canvasScale, applyBoundaries]);

  const handleCanvasMouseUp = useCallback(() => {
    setIsPanningCanvas(false);
  }, []);

  // Space overlay handlers - simplified for space+drag pan
  const handleOverlayMouseDown = useCallback((e: React.MouseEvent) => {
    if (!spaceKeyPressed) return;
    
    e.preventDefault();
    e.stopPropagation();
    setIsSpacePanning(true);
    panStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      offsetX: panOffset.x,
      offsetY: panOffset.y
    };
  }, [spaceKeyPressed, panOffset]);

  const handleOverlayMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isSpacePanning) return;
    
    e.preventDefault();
    const deltaX = e.clientX - panStartRef.current.x;
    const deltaY = e.clientY - panStartRef.current.y;
    
    const newOffset = applyBoundaries(
      panStartRef.current.offsetX + deltaX,
      panStartRef.current.offsetY + deltaY,
      canvasScale
    );
    
    setPanOffset(newOffset);
  }, [isSpacePanning, canvasScale, applyBoundaries]);

  const handleOverlayMouseUp = useCallback(() => {
    setIsSpacePanning(false);
  }, []);

  // Attach wheel event listener with passive: false to allow preventDefault
  useEffect(() => {
    const canvasArea = document.querySelector('.canvas-area-container');
    if (!canvasArea) return;

    const wheelHandler = (e: WheelEvent) => {
      handleWheel(e);
    };

    canvasArea.addEventListener('wheel', wheelHandler, { passive: false });
    return () => {
      canvasArea.removeEventListener('wheel', wheelHandler);
    };
  }, [handleWheel]);

  return {
    canvasScale,
    panOffset,
    isPanning,
    spaceKeyPressed,
    isPanningCanvas,
    isSpacePanning,
    zoomIn,
    zoomOut,
    setZoom,
    zoomToPreset,
    resetView,
    startPan,
    updatePan,
    endPan,
    handleCanvasMouseDown,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
    handleOverlayMouseDown,
    handleOverlayMouseMove,
    handleOverlayMouseUp,
    handleKeyDown,
    handleKeyUp,
    handleWheel,
  };
}
