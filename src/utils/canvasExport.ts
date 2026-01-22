/**
 * Canvas Export Utilities
 * Functions for exporting Fabric.js canvas designs
 */

export interface ExportOptions {
  format?: 'png' | 'jpeg';
  quality?: number; // 0-1 for JPEG
  multiplier?: number; // Scale factor for higher resolution (e.g., 2 for 2x)
  left?: number;
  top?: number;
  width?: number;
  height?: number;
}

/**
 * Export canvas to data URL with optional cropping to print area
 */
export function exportCanvasToDataURL(
  canvas: any,
  options: ExportOptions = {}
): string {
  const {
    format = 'png',
    quality = 1,
    multiplier = 2, // 2x for better quality
    left,
    top,
    width,
    height,
  } = options;

  try {
    // If crop dimensions provided, export only that region
    if (left !== undefined && top !== undefined && width !== undefined && height !== undefined) {
      return canvas.toDataURL({
        format,
        quality,
        multiplier,
        left,
        top,
        width,
        height,
      });
    }

    // Export full canvas
    return canvas.toDataURL({
      format,
      quality,
      multiplier,
    });
  } catch (error) {
    console.error('Canvas export error:', error);
    throw new Error('Failed to export canvas');
  }
}

/**
 * Export only objects within print area bounds
 */
export function exportPrintAreaOnly(
  canvas: any,
  printAreaBounds: { left: number; top: number; width: number; height: number }
): string {
  return exportCanvasToDataURL(canvas, {
    format: 'png',
    quality: 1,
    multiplier: 3, // 3x for print quality (300 DPI equivalent)
    ...printAreaBounds,
  });
}

/**
 * Download canvas as image file
 */
export function downloadCanvas(
  canvas: any,
  filename: string = 'design',
  options: ExportOptions = {}
): void {
  try {
    const dataURL = exportCanvasToDataURL(canvas, options);
    const link = document.createElement('a');
    link.download = `${filename}.${options.format || 'png'}`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Download error:', error);
    throw new Error('Failed to download design');
  }
}

/**
 * Get canvas dimensions for a specific print area
 */
export function getPrintAreaBounds(
  canvas: any,
  printAreaSize: { width: number; height: number }
): { left: number; top: number; width: number; height: number } {
  const canvasWidth = canvas.getWidth();
  const canvasHeight = canvas.getHeight();
  
  // Center the print area
  const left = (canvasWidth - printAreaSize.width) / 2;
  const top = (canvasHeight - printAreaSize.height) / 2;
  
  return {
    left,
    top,
    width: printAreaSize.width,
    height: printAreaSize.height,
  };
}

/**
 * Convert data URL to Blob for upload
 */
export function dataURLToBlob(dataURL: string): Blob {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new Blob([u8arr], { type: mime });
}
