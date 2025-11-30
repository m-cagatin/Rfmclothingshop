import { Canvas, Object as FabricObject, Image as FabricImage } from 'fabric';

// Print resolution constants
export const PRINT_WIDTH = 4800;
export const PRINT_HEIGHT = 5400;
export const PRINT_DPI = 300;

// UI canvas dimensions (scaled down for display)
export const UI_CANVAS_WIDTH = 240;  // Matches the design area in CustomDesignPage
export const UI_CANVAS_HEIGHT = 280;

// Calculate scale factor
export const SCALE_FACTOR = UI_CANVAS_WIDTH / PRINT_WIDTH;

/**
 * Enforce canvas boundaries - prevent objects from leaving design area
 */
export function enforceCanvasBounds(
  obj: FabricObject,
  canvas: Canvas
): void {
  const bounds = {
    left: 0,
    top: 0,
    width: canvas.width || UI_CANVAS_WIDTH,
    height: canvas.height || UI_CANVAS_HEIGHT,
  };

  obj.setCoords();

  const objBounds = obj.getBoundingRect();

  // Check left boundary
  if (objBounds.left < bounds.left) {
    obj.left = Math.max(obj.left + (bounds.left - objBounds.left), 0);
  }

  // Check top boundary
  if (objBounds.top < bounds.top) {
    obj.top = Math.max(obj.top + (bounds.top - objBounds.top), 0);
  }

  // Check right boundary
  if (objBounds.left + objBounds.width > bounds.width) {
    obj.left = Math.min(
      obj.left - (objBounds.left + objBounds.width - bounds.width),
      bounds.width
    );
  }

  // Check bottom boundary
  if (objBounds.top + objBounds.height > bounds.height) {
    obj.top = Math.min(
      obj.top - (objBounds.top + objBounds.height - bounds.height),
      bounds.height
    );
  }

  obj.setCoords();
}

/**
 * Fit object to design area while maintaining aspect ratio
 */
export function fitToDesignArea(
  obj: FabricObject,
  maxWidth: number,
  maxHeight: number,
  padding = 20
): void {
  const availableWidth = maxWidth - padding * 2;
  const availableHeight = maxHeight - padding * 2;

  if (!obj.width || !obj.height) return;

  const scaleX = availableWidth / obj.width;
  const scaleY = availableHeight / obj.height;
  const scale = Math.min(scaleX, scaleY, 1); // Don't scale up

  obj.scale(scale);
  obj.setCoords();
}

/**
 * Convert UI coordinates to print resolution coordinates
 */
export function uiToPrintCoords(
  x: number,
  y: number
): { x: number; y: number } {
  return {
    x: x / SCALE_FACTOR,
    y: y / SCALE_FACTOR,
  };
}

/**
 * Convert print coordinates to UI coordinates
 */
export function printToUICoords(
  x: number,
  y: number
): { x: number; y: number } {
  return {
    x: x * SCALE_FACTOR,
    y: y * SCALE_FACTOR,
  };
}

/**
 * Calculate DPI of an image object at current scale
 */
export function calculateObjectDPI(
  obj: FabricImage,
  printWidthInches: number
): number {
  if (!obj.width || !obj.scaleX) return 0;

  const pixelWidth = obj.width * obj.scaleX;
  const printPixelWidth = pixelWidth / SCALE_FACTOR;

  return printPixelWidth / printWidthInches;
}

/**
 * Check if object is completely within bounds
 */
export function isWithinBounds(
  obj: FabricObject,
  bounds: { width: number; height: number }
): boolean {
  obj.setCoords();
  const objBounds = obj.getBoundingRect();

  return (
    objBounds.left >= 0 &&
    objBounds.top >= 0 &&
    objBounds.left + objBounds.width <= bounds.width &&
    objBounds.top + objBounds.height <= bounds.height
  );
}

/**
 * Center object on canvas
 */
export function centerObject(
  obj: FabricObject,
  canvas: Canvas
): void {
  obj.set({
    left: (canvas.width || 0) / 2,
    top: (canvas.height || 0) / 2,
    originX: 'center',
    originY: 'center',
  });
  obj.setCoords();
  canvas.renderAll();
}

/**
 * Get print size in inches
 */
export function getPrintSizeInches(): { width: number; height: number } {
  return {
    width: PRINT_WIDTH / PRINT_DPI,
    height: PRINT_HEIGHT / PRINT_DPI,
  };
}

/**
 * Calculate recommended minimum resolution for an object
 */
export function getRecommendedResolution(
  widthInches: number,
  heightInches: number,
  targetDPI = 300
): { width: number; height: number } {
  return {
    width: Math.ceil(widthInches * targetDPI),
    height: Math.ceil(heightInches * targetDPI),
  };
}

/**
 * Check image quality and return warnings
 */
export function checkImageQuality(
  img: FabricImage
): { dpi: number; warnings: string[] } {
  const warnings: string[] = [];
  
  if (!img.width || !img.height || !img.scaleX || !img.scaleY) {
    return { dpi: 0, warnings: ['Unable to calculate image quality'] };
  }

  // Calculate effective DPI
  const printSizeInches = getPrintSizeInches();
  const scaledWidth = img.width * img.scaleX;
  const scaledHeight = img.height * img.scaleY;
  
  const printPixelWidth = scaledWidth / SCALE_FACTOR;
  const printPixelHeight = scaledHeight / SCALE_FACTOR;
  
  const widthDPI = printPixelWidth / (printSizeInches.width * (scaledWidth / UI_CANVAS_WIDTH));
  const heightDPI = printPixelHeight / (printSizeInches.height * (scaledHeight / UI_CANVAS_HEIGHT));
  
  const effectiveDPI = Math.min(widthDPI, heightDPI);

  if (effectiveDPI < 150) {
    warnings.push(
      `Low resolution: ${Math.round(effectiveDPI)} DPI. Recommended: 300 DPI minimum. Image may appear pixelated when printed.`
    );
  } else if (effectiveDPI < 300) {
    warnings.push(
      `Medium resolution: ${Math.round(effectiveDPI)} DPI. Recommended: 300 DPI for best quality.`
    );
  }

  return { dpi: Math.round(effectiveDPI), warnings };
}
