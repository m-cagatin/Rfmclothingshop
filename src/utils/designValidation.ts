import * as fabric from 'fabric';
import { PRINT_AREA_PRESETS, PrintAreaPreset } from '../utils/fabricHelpers';

export const DESIGN_LIMITS = {
  MAX_OBJECTS: 50,
  MAX_CANVAS_JSON_SIZE_MB: 2,
  MAX_IMAGE_WIDTH: 4000,
  MAX_IMAGE_HEIGHT: 4000,
  MIN_OBJECTS: 1,
} as const;

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ObjectBoundsInfo {
  object: fabric.Object;
  isOutsidePrintArea: boolean;
  bounds: {
    left: number;
    top: number;
    right: number;
    bottom: number;
  };
}

/**
 * Get the print area bounds based on canvas size and preset
 */
function getPrintAreaBounds(canvas: fabric.Canvas, printAreaSize: PrintAreaPreset) {
  const printArea = PRINT_AREA_PRESETS[printAreaSize];
  const centerX = (canvas.width || 0) / 2;
  const centerY = (canvas.height || 0) / 2;

  return {
    left: centerX - printArea.width / 2,
    top: centerY - printArea.height / 2,
    right: centerX + printArea.width / 2,
    bottom: centerY + printArea.height / 2,
  };
}

/**
 * Check if an object is fully within the print area
 */
function isObjectInPrintArea(
  obj: fabric.Object,
  printAreaBounds: ReturnType<typeof getPrintAreaBounds>
): boolean {
  const objBounds = obj.getBoundingRect();
  
  return (
    objBounds.left >= printAreaBounds.left &&
    objBounds.top >= printAreaBounds.top &&
    objBounds.left + objBounds.width <= printAreaBounds.right &&
    objBounds.top + objBounds.height <= printAreaBounds.bottom
  );
}

/**
 * Get all objects and their positions relative to print area
 */
export function getObjectsBoundsInfo(
  canvas: fabric.Canvas,
  printAreaSize: PrintAreaPreset
): ObjectBoundsInfo[] {
  const printAreaBounds = getPrintAreaBounds(canvas, printAreaSize);
  const objects = canvas.getObjects().filter((obj: fabric.Object) => !obj.get('name')?.includes('print-area'));

  return objects.map((obj: fabric.Object) => {
    const objBounds = obj.getBoundingRect();
    return {
      object: obj,
      isOutsidePrintArea: !isObjectInPrintArea(obj, printAreaBounds),
      bounds: {
        left: objBounds.left,
        top: objBounds.top,
        right: objBounds.left + objBounds.width,
        bottom: objBounds.top + objBounds.height,
      },
    };
  });
}

/**
 * Validate the design before saving or previewing
 */
export function validateDesign(
  canvas: fabric.Canvas | null,
  printAreaSize: PrintAreaPreset
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!canvas) {
    errors.push('Canvas is not initialized');
    return { valid: false, errors, warnings };
  }

  // Get all objects except print area markers
  const objects = canvas.getObjects().filter((obj: fabric.Object) => !obj.get('name')?.includes('print-area'));

  // Check minimum objects
  if (objects.length < DESIGN_LIMITS.MIN_OBJECTS) {
    warnings.push('Your design is empty. Add some elements before saving.');
  }

  // Check maximum objects
  if (objects.length > DESIGN_LIMITS.MAX_OBJECTS) {
    errors.push(`Too many objects (${objects.length}). Maximum allowed is ${DESIGN_LIMITS.MAX_OBJECTS}.`);
  }

  // Check canvas JSON size
  const canvasJSON = JSON.stringify(canvas.toJSON());
  const jsonSizeBytes = new Blob([canvasJSON]).size;
  const jsonSizeMB = jsonSizeBytes / (1024 * 1024);
  
  if (jsonSizeMB > DESIGN_LIMITS.MAX_CANVAS_JSON_SIZE_MB) {
    errors.push(
      `Design data is too large (${jsonSizeMB.toFixed(2)}MB). Maximum allowed is ${DESIGN_LIMITS.MAX_CANVAS_JSON_SIZE_MB}MB. Consider removing some elements or reducing image quality.`
    );
  }

  // Check for objects outside print area
  const objectsBounds = getObjectsBoundsInfo(canvas, printAreaSize);
  const outsideObjects = objectsBounds.filter(info => info.isOutsidePrintArea);
  
  if (outsideObjects.length > 0) {
    warnings.push(
      `${outsideObjects.length} object${outsideObjects.length > 1 ? 's are' : ' is'} outside the print area and won't be printed. Consider moving them inside.`
    );
  }

  // Check for oversized images
  objects.forEach((obj: fabric.Object, index: number) => {
    if (obj.type === 'image') {
      const img = obj as fabric.Image;
      const originalWidth = img.width || 0;
      const originalHeight = img.height || 0;

      if (originalWidth > DESIGN_LIMITS.MAX_IMAGE_WIDTH || originalHeight > DESIGN_LIMITS.MAX_IMAGE_HEIGHT) {
        warnings.push(
          `Image ${index + 1} is very large (${originalWidth}×${originalHeight}px). This may affect performance.`
        );
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Automatically fit all objects within the print area
 */
export function autoFitObjectsToPrintArea(
  canvas: fabric.Canvas,
  printAreaSize: PrintAreaPreset
): number {
  const printAreaBounds = getPrintAreaBounds(canvas, printAreaSize);
  const objectsBounds = getObjectsBoundsInfo(canvas, printAreaSize);
  const outsideObjects = objectsBounds.filter(info => info.isOutsidePrintArea);

  let movedCount = 0;

  outsideObjects.forEach(({ object, bounds }) => {
    let newLeft = object.left || 0;
    let newTop = object.top || 0;

    // Adjust horizontal position
    if (bounds.left < printAreaBounds.left) {
      newLeft += printAreaBounds.left - bounds.left;
    } else if (bounds.right > printAreaBounds.right) {
      newLeft -= bounds.right - printAreaBounds.right;
    }

    // Adjust vertical position
    if (bounds.top < printAreaBounds.top) {
      newTop += printAreaBounds.top - bounds.top;
    } else if (bounds.bottom > printAreaBounds.bottom) {
      newTop -= bounds.bottom - printAreaBounds.bottom;
    }

    // Update object position
    object.set({
      left: newLeft,
      top: newTop,
    });
    object.setCoords();
    movedCount++;
  });

  canvas.requestRenderAll();
  return movedCount;
}

/**
 * Get current design usage stats
 */
export function getDesignStats(canvas: fabric.Canvas | null): {
  objectCount: number;
  jsonSizeMB: number;
  objectsOutsidePrintArea: number;
  percentageFull: number;
} {
  if (!canvas) {
    return {
      objectCount: 0,
      jsonSizeMB: 0,
      objectsOutsidePrintArea: 0,
      percentageFull: 0,
    };
  }

  const objects = canvas.getObjects().filter((obj: fabric.Object) => !obj.get('name')?.includes('print-area'));
  const canvasJSON = JSON.stringify(canvas.toJSON());
  const jsonSizeBytes = new Blob([canvasJSON]).size;
  const jsonSizeMB = jsonSizeBytes / (1024 * 1024);

  return {
    objectCount: objects.length,
    jsonSizeMB: parseFloat(jsonSizeMB.toFixed(2)),
    objectsOutsidePrintArea: 0, // Would need printAreaSize to calculate
    percentageFull: Math.round((objects.length / DESIGN_LIMITS.MAX_OBJECTS) * 100),
  };
}
