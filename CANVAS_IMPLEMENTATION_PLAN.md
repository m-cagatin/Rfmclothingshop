# Canvas Zoom & Pan Implementation Plan
## RFMCLOTHINGSHOP - CustomDesignPage Enhancement

**Project:** RFMCLOTHINGSHOP  
**Target:** CustomDesignPage.tsx Canvas Enhancement  
**Framework:** React 18 + TypeScript + Vite  
**Canvas Library:** Fabric.js (existing)  
**Date:** December 18, 2025 (Updated)  
**Status:** ✅ **FEASIBILITY VERIFIED - READY FOR IMPLEMENTATION**

---

## 🚨 **CRITICAL IMPLEMENTATION NOTES**

### ⚠️ **MANDATORY CHECKPOINT AFTER PHASE 2**

After completing Phase 2 (Zoom System), you **MUST STOP** and run coordinate verification tests before proceeding to Phase 3. This is the **highest risk area** of the implementation.

**Test Requirements:**
- ✅ Object selection at 100%, 200%, 400% zoom
- ✅ Object dragging at various zoom levels
- ✅ Click coordinates translate correctly with CSS transform

**If tests fail:** Implement the `getScaledPointer` override documented in Phase 2.

**DO NOT PROCEED to Phase 3 until verification passes!**

### ⭐ **NEW: Phase 2.5 - Image Optimization System**

To solve the high-resolution vs performance challenge:
- **Problem:** 4000px images cause lag during editing
- **Solution:** Dual-resolution system (1200px for editing, original for export)
- **Result:** Smooth canvas performance + high-quality final output

See Phase 2.5 section for complete implementation details.

---

## 🎯 **IMPLEMENTATION SCOPE**

### **What We're Changing:**
✅ Canvas zoom mechanism (CSS transform instead of Fabric native)  
✅ Canvas pan functionality (Space+drag, trackpad, wheel)  
✅ Object selection (enhanced controls and visual feedback)  
✅ Alignment guides (Figma-style snapping system)  
✅ Drag & drop file upload (over canvas area)  
✅ Keyboard shortcuts (zoom/pan controls)  

### **What We're NOT Changing:**
❌ Left sidebar (80px with tool buttons)  
❌ All panels (Upload, Text, Graphics, Patterns, My Clothing)  
❌ Top navigation bar (My Clothing, Edit, Preview, Layers buttons)  
❌ Bottom action bar (visual design stays same)  
❌ T-shirt mockup selection and positioning  
❌ Product filtering and category system  
❌ Navigation flow (CustomProductsPage → CustomDesignPage)  
❌ Layers panel (right side)  
❌ View switcher (Front/Back buttons)  

---

## 📐 **ARCHITECTURE OVERVIEW**

### **Current Structure:**
```
CustomDesignPage
├── Left Sidebar (80px)
├── Main Content
│   ├── Top Bar
│   ├── Canvas Area
│   │   └── T-shirt Mockup + Fabric Canvas
│   └── Bottom Bar (Zoom controls)
└── Panels (Upload, Text, etc.)
```

### **Enhanced Structure:**
```
CustomDesignPage
├── Left Sidebar (80px) ✅ Unchanged
├── Main Content
│   ├── Top Bar ✅ Unchanged
│   ├── Canvas Area (ENHANCED)
│   │   ├── PanOverlay (Space+drag) ⭐ NEW
│   │   ├── DropZoneOverlay (file drop) ⭐ NEW
│   │   └── CSS Transform Wrapper ⭐ NEW
│   │       ├── T-shirt Mockup
│   │       ├── Print Area Box
│   │       └── Fabric Canvas (Enhanced config) ⭐ ENHANCED
│   └── Bottom Bar (Enhanced functionality) ⭐ ENHANCED
└── Panels ✅ Unchanged
```

---

## 🗂️ **FILE STRUCTURE**

### **New Files to Create:**

```
src/
├── hooks/
│   ├── useCanvasZoomPan.ts          ⭐ NEW - Zoom/pan state & logic
│   └── useAlignmentGuides.ts        ⭐ NEW - Snapping system
│
├── components/
│   └── customizer/
│       ├── PanOverlay.tsx           ⭐ NEW - Space+drag overlay
│       ├── DropZoneOverlay.tsx      ⭐ NEW - File drop zone
│       └── CanvasToolbar.tsx        ⭐ NEW (Optional) - Floating toolbar
│
├── utils/
│   ├── canvasTransform.ts           ⭐ NEW - Transform utilities
│   └── fileValidation.ts            ⭐ NEW - File upload validation
│
└── styles/
    └── canvasEditor.css             ⭐ NEW - Canvas-specific styles
```

### **Files to Modify:**

```
src/
├── pages/
│   └── CustomDesignPage.tsx         🔧 MODIFY - Canvas area structure (lines ~1530-1638)
│
├── hooks/
│   └── useFabricCanvas.ts           🔧 MODIFY - Enhance config, update zoom method
│
├── contexts/
│   └── CanvasContext.tsx            🔧 MODIFY - Add zoom/pan/selection state
│
└── utils/
    └── fabricHelpers.ts             🔧 MODIFY - Add transform utilities
```

---

## 📋 **IMPLEMENTATION PHASES**

### **Phase 1: Foundation - Canvas Transform Wrapper**
**Duration:** 2-3 hours  
**Risk:** Low  
**Dependencies:** None  

#### **Objective:**
Add CSS transform wrapper around existing canvas without breaking anything.

#### **Tasks:**

1. **Create CSS file for canvas styles**
   - File: `src/styles/canvasEditor.css`
   - Define `.canvas-transform-wrapper` class
   - Add transform properties and transitions

2. **Update CustomDesignPage.tsx canvas area**
   - Location: Lines ~1530-1580
   - Wrap existing canvas structure in transform div
   - Add inline style for dynamic transform
   - Keep all existing elements (mockup, print area, canvas)

3. **Test:**
   - ✅ Canvas still renders correctly
   - ✅ T-shirt mockup displays based on selectedCategory
   - ✅ Front/Back view switching works
   - ✅ All panels still open/close correctly
   - ✅ Product filtering still works

**Code Changes:**

```tsx
// CustomDesignPage.tsx - Canvas Area (Lines ~1530-1580)
<div className="canvas-area">
  <div className="relative">
    {/* ADD: CSS Transform Wrapper */}
    <div 
      className="canvas-transform-wrapper"
      style={{
        transform: `translate(${0}px, ${0}px) scale(${1})`, // Default values initially
        transformOrigin: 'center center',
      }}
    >
      {/* EXISTING: T-shirt mockup */}
      <img 
        src={selectedView === 'front' 
          ? categoryImages[selectedCategory]?.front 
          : categoryImages[selectedCategory]?.back
        }
        alt={`${selectedCategory} ${selectedView}`}
        className="w-full h-full object-contain"
      />

      {/* EXISTING: Print area box */}
      <div className="print-area-box" style={{...}}>
        {/* EXISTING: Fabric canvas */}
        <canvas id="design-canvas" className="..." style={{...}} />
      </div>
    </div>
  </div>
</div>
```

**CSS to Create:**

```css
/* src/styles/canvasEditor.css */
.canvas-transform-wrapper {
  position: relative;
  transform-origin: center center;
  transition: transform 0.2s ease-out;
  will-change: transform;
}

.canvas-area {
  position: relative;
  overflow: hidden; /* Prevent scroll during pan */
}
```

---

### **Phase 2: Zoom System - CSS Transform Based**
**Duration:** 4-5 hours  
**Risk:** Medium  
**Dependencies:** Phase 1  

#### **Objective:**
Replace Fabric's native zoom with CSS transform zoom, add zoom presets.

#### **Tasks:**

1. **Create useCanvasZoomPan hook**
   - File: `src/hooks/useCanvasZoomPan.ts`
   - State: canvasScale, zoomLevel, panOffsetX/Y
   - Methods: zoomIn, zoomOut, setPresetZoom, zoomFit, zoomToCursor
   - Keyboard listeners: Ctrl+Plus/Minus/0

2. **Update useFabricCanvas.ts**
   - Modify setZoom method to use CSS scale (not Fabric zoom)
   - Keep Fabric canvas at scale 1.0 always
   - Update resetView to reset CSS transforms

3. **Enhance bottom bar zoom controls**
   - Location: CustomDesignPage.tsx lines ~1610-1638
   - Connect to new zoom methods (keep existing UI)
   - Add zoom presets dropdown (small popup)

4. **Integrate into CustomDesignPage**
   - Import useCanvasZoomPan hook
   - Connect transform wrapper to zoom state
   - Wire up zoom buttons to new methods

**Hook Structure:**

```typescript
// src/hooks/useCanvasZoomPan.ts
import { useState, useRef, useEffect, useCallback } from 'react';

interface ZoomPanState {
  canvasScale: number;      // 0.1 to 4.0
  zoomLevel: number;        // 10% to 400%
  panOffsetX: number;
  panOffsetY: number;
  isPanning: boolean;
  spaceKeyPressed: boolean;
}

export function useCanvasZoomPan() {
  const [canvasScale, setCanvasScale] = useState(1.0);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [panOffsetX, setPanOffsetX] = useState(0);
  const [panOffsetY, setPanOffsetY] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const [spaceKeyPressed, setSpaceKeyPressed] = useState(false);

  // Zoom methods
  const zoomIn = useCallback(() => {
    const newScale = Math.min(canvasScale + 0.1, 4.0);
    setCanvasScale(newScale);
    setZoomLevel(Math.round(newScale * 100));
  }, [canvasScale]);

  const zoomOut = useCallback(() => {
    const newScale = Math.max(canvasScale - 0.1, 0.1);
    setCanvasScale(newScale);
    setZoomLevel(Math.round(newScale * 100));
  }, [canvasScale]);

  const setPresetZoom = useCallback((percentage: number) => {
    const newScale = percentage / 100;
    setCanvasScale(newScale);
    setZoomLevel(percentage);
  }, []);

  const zoomFit = useCallback(() => {
    setCanvasScale(1.0);
    setZoomLevel(100);
    setPanOffsetX(0);
    setPanOffsetY(0);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '+' || e.key === '=') {
          e.preventDefault();
          zoomIn();
        } else if (e.key === '-' || e.key === '_') {
          e.preventDefault();
          zoomOut();
        } else if (e.key === '0') {
          e.preventDefault();
          zoomFit();
        }
      }

      // Space for pan
      if (e.code === 'Space' && !spaceKeyPressed) {
        const target = e.target as HTMLElement;
        
        // Check if editing text in Fabric canvas ⭐ IMPORTANT
        const canvas = fabricCanvasRef.current;
        const activeObj = canvas?.getActiveObject();
        const isEditingText = activeObj && (activeObj as any).isEditing === true;
        
        if (!isEditingText && target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          setSpaceKeyPressed(true);
        }
      }
    }

    function handleKeyUp(e: KeyboardEvent) {
      if (e.code === 'Space') {
        setSpaceKeyPressed(false);
        setIsPanning(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [spaceKeyPressed, zoomIn, zoomOut, zoomFit]);

  return {
    canvasScale,
    zoomLevel,
    panOffsetX,
    panOffsetY,
    isPanning,
    spaceKeyPressed,
    zoomIn,
    zoomOut,
    setPresetZoom,
    zoomFit,
    setIsPanning,
    setPanOffsetX,
    setPanOffsetY,
  };
}
```

**Integration:**

```tsx
// CustomDesignPage.tsx
import { useCanvasZoomPan } from '../hooks/useCanvasZoomPan';

function CustomDesignPage() {
  const {
    canvasScale,
    zoomLevel,
    panOffsetX,
    panOffsetY,
    zoomIn,
    zoomOut,
    zoomFit,
  } = useCanvasZoomPan();

  // ... rest of component

  return (
    <div className="canvas-area">
      <div 
        className="canvas-transform-wrapper"
        style={{
          transform: `translate(${panOffsetX}px, ${panOffsetY}px) scale(${canvasScale})`,
        }}
      >
        {/* canvas content */}
      </div>

      {/* Bottom bar zoom controls */}
      <div className="bottom-bar">
        <Button onClick={zoomOut}><ZoomOut /></Button>
        <span>{zoomLevel}%</span>
        <Button onClick={zoomIn}><ZoomIn /></Button>
        <Button onClick={zoomFit}><RotateCcw /></Button>
      </div>
    </div>
  );
}
```

**Testing:**
- ✅ Zoom in/out buttons work smoothly
- ✅ Ctrl+Plus/Minus keyboard shortcuts work
- ✅ Canvas scales from center
- ✅ **CRITICAL: Object selection works at all zoom levels (100%, 200%, 400%)**
- ✅ **CRITICAL: Object dragging works smoothly at all zoom levels**
- ✅ T-shirt mockup scales with canvas
- ✅ No conflicts with text inputs (Space key)

**⚠️ MANDATORY CHECKPOINT:**

After completing Phase 2, **STOP** and run comprehensive coordinate verification tests:

```typescript
// Coordinate Verification Test
function testCoordinateTranslation() {
  const canvas = fabricCanvas;
  
  // Add test rectangle at known position
  const testRect = new fabric.Rect({
    left: 120,
    top: 140,
    width: 50,
    height: 50,
    fill: 'red'
  });
  canvas.add(testRect);
  
  // Test at various zoom levels
  [1.0, 1.5, 2.0, 3.0, 4.0].forEach(scale => {
    setCanvasScale(scale);
    
    // Simulate click at rectangle center
    // MUST select object correctly
    // If fails: Implement getScaledPointer override
  });
}
```

**DO NOT PROCEED TO PHASE 3 UNTIL THIS TEST PASSES!**

If test fails, implement coordinate override in `useFabricCanvas.ts`:

```typescript
function getScaledPointer(canvas: Canvas, e: MouseEvent) {
  const canvasEl = canvas.getElement();
  const bounds = canvasEl.getBoundingClientRect();
  
  // getBoundingClientRect should account for CSS transform automatically
  const x = (e.clientX - bounds.left) / (bounds.width / canvasEl.width);
  const y = (e.clientY - bounds.top) / (bounds.height / canvasEl.height);
  
  return { x, y };
}
```

---

### **Phase 2.5: Image Optimization System (NEW)**
**Duration:** 3-4 hours  
**Risk:** Low  
**Dependencies:** Phase 2  

#### **Objective:**
Implement dual-resolution system: optimized images for canvas editing, original high-res for export.

#### **Problem Statement:**
- Users upload 4000×3000px images for print quality
- Loading full resolution causes canvas lag
- Solution: Use 1200px version for editing, swap to original on export

#### **Tasks:**

1. **Enhance Cloudinary Upload Service**
   - File: `src/services/cloudinary.ts`
   - Modify `uploadToCloudinary()` function
   - Generate 3 URLs: original, editing (1200px), thumbnail (300px)

**Code Changes:**

```typescript
// src/services/cloudinary.ts
export interface UploadedImage {
  url: string;              // Original URL
  editingUrl: string;       // 1200px optimized ⭐ NEW
  thumbnailUrl: string;     // 300px thumbnail (existing)
  publicId: string;
  width: number;
  height: number;
  format: string;
  size: number;
}

export async function uploadToCloudinary(
  file: File,
  folder: CloudinaryFolder,
  onProgress?: (percentage: number) => void
): Promise<UploadedImage> {
  // ... existing upload logic ...
  
  return new Promise((resolve, reject) => {
    xhr.onload = () => {
      const data = JSON.parse(xhr.responseText);
      
      // Original URL
      const originalUrl = data.secure_url;
      
      // Editing URL (1200px max dimension)
      const editingUrl = originalUrl.replace(
        '/upload/',
        '/upload/w_1200,h_1200,c_limit,q_auto:good,f_auto/'
      );
      
      // Thumbnail URL (existing)
      const thumbnailUrl = originalUrl.replace(
        '/upload/',
        '/upload/w_300,h_300,c_fill,q_auto/'
      );
      
      resolve({
        url: originalUrl,
        editingUrl,          // ⭐ NEW
        thumbnailUrl,
        publicId: data.public_id,
        width: data.width,
        height: data.height,
        format: data.format,
        size: data.bytes,
      });
    };
  });
}
```

2. **Update Image Upload Hook**
   - File: `src/hooks/useImageUpload.ts`
   - Modify return type to include `editingUrl`
   - Pass through all URLs from Cloudinary service

```typescript
// src/hooks/useImageUpload.ts
export interface UploadResult {
  url: string;              // Original
  editingUrl: string;       // ⭐ NEW
  thumbnailUrl: string;
  width: number;
  height: number;
  publicId: string;
}

export function useImageUpload() {
  const uploadImage = async (file: File) => {
    // ... validation ...
    
    const result = await uploadToCloudinary(file, CloudinaryFolder.USER_UPLOADS, setProgress);
    
    return {
      url: result.url,
      editingUrl: result.editingUrl,  // ⭐ NEW
      thumbnailUrl: result.thumbnailUrl,
      width: result.width,
      height: result.height,
      publicId: result.publicId,
    };
  };
  
  return { uploadImage, progress, error };
}
```

3. **Modify Canvas Image Addition**
   - File: `src/hooks/useFabricCanvas.ts`
   - Update `addImageToCanvas` method
   - Load `editingUrl` to canvas
   - Store `originalUrl` as custom Fabric property

```typescript
// src/hooks/useFabricCanvas.ts
const addImageToCanvas = useCallback(
  async (uploadedImage: UploadResult) => {
    if (!canvasRef.current) return;

    try {
      // Load editing version (1200px optimized)
      const img = await Image.fromURL(uploadedImage.editingUrl, {
        crossOrigin: 'anonymous',
      });

      // Store original URL for export
      img.set({
        originalSrc: uploadedImage.url,  // ⭐ NEW custom property
        editingSrc: uploadedImage.editingUrl,
        publicId: uploadedImage.publicId,
      });

      // Fit to design area
      const { scaleX, scaleY } = fitToDesignArea(img);
      img.set({
        left: UI_CANVAS_WIDTH / 2,
        top: UI_CANVAS_HEIGHT / 2,
        scaleX,
        scaleY,
        originX: 'center',
        originY: 'center',
      });

      canvasRef.current.add(img);
      canvasRef.current.setActiveObject(img);
      canvasRef.current.renderAll();
    } catch (error) {
      console.error('Failed to add image:', error);
    }
  },
  []
);
```

4. **Enhance High-DPI Export**
   - File: `src/hooks/useFabricCanvas.ts`
   - Modify `exportHighDPI` method
   - Load original high-res images before rendering
   - Swap image elements dynamically

```typescript
// src/hooks/useFabricCanvas.ts
const exportHighDPI = useCallback(async (): Promise<Blob | null> => {
  if (!canvasRef.current) return null;

  // Create temp canvas at print resolution
  const tempCanvasEl = document.createElement('canvas');
  tempCanvasEl.width = PRINT_WIDTH;  // 4800px
  tempCanvasEl.height = PRINT_HEIGHT; // 5400px
  const tempCanvas = new Canvas(tempCanvasEl, {
    backgroundColor: 'transparent',
  });

  // Serialize current canvas state
  const json = canvasRef.current.toJSON(['originalSrc', 'editingSrc', 'publicId']); // Include custom props

  return new Promise((resolve) => {
    tempCanvas.loadFromJSON(json, async () => {
      const objects = tempCanvas.getObjects();

      // STEP 1: Swap to original high-res images
      const loadPromises = objects.map(async (obj) => {
        if (obj.type === 'image' && (obj as any).originalSrc) {
          const originalUrl = (obj as any).originalSrc;
          
          // Load original high-res image
          const highResImgElement = await new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = originalUrl;
          });

          // Swap image element
          (obj as any).setElement(highResImgElement);
        }
      });

      await Promise.all(loadPromises);

      // STEP 2: Scale coordinates to print resolution
      const scaleFactor = 1 / SCALE_FACTOR; // 1 / 0.05 = 20x
      objects.forEach((obj) => {
        obj.scaleX = (obj.scaleX || 1) * scaleFactor;
        obj.scaleY = (obj.scaleY || 1) * scaleFactor;
        obj.left = (obj.left || 0) * scaleFactor;
        obj.top = (obj.top || 0) * scaleFactor;

        if (obj.type === 'i-text' || obj.type === 'text') {
          (obj as any).fontSize = ((obj as any).fontSize || 16) * scaleFactor;
        }
      });

      tempCanvas.renderAll();

      // STEP 3: Export as PNG blob
      tempCanvas.getElement().toBlob((blob) => {
        resolve(blob);
      }, 'image/png');
    });
  });
}, []);
```

**Math Verification:**

```
Canvas editing resolution: 1200×1200px (max dimension)
Max CSS zoom: 400% (from Phase 2)
Visual display at 400%: 1200 × 4 = 4800px equivalent
Canvas display size: 240×280px
At 400%: 960×1120px visual
Available pixels: 1200px
Required pixels: 960px
Sharpness ratio: 1200/960 = 1.25× = Sharp! ✅

Export resolution: 4800×5400px (300 DPI)
Original image: 2000px+ (validation enforces this)
Scale factor: 20×
Final quality: Perfect! ✅
```

**Performance Analysis:**

```
Memory usage per image:
- Thumbnail (300px): ~50KB
- Editing (1200px): ~400KB
- Original (4000px): ~2MB (not loaded until export)

Canvas with 10 images:
- Current: 10 × 2MB = 20MB (all full-res, causes lag)
- Optimized: 10 × 400KB = 4MB (smooth editing) ✅

Export time:
- Load 10 original images: ~2 seconds
- Acceptable for one-time operation ✅
```

**Testing:**
- ✅ Upload 4000×3000px image
- ✅ Verify editingUrl loads in canvas (1200px)
- ✅ Verify originalUrl stored in Fabric object
- ✅ Zoom to 400% - image stays sharp (not pixelated)
- ✅ Export design - verify high-res original used
- ✅ Check export file resolution: 4800×5400px
- ✅ Multiple images (10+) - canvas still smooth

---

### **Phase 3: Pan Functionality**
**Duration:** 3-4 hours  
**Risk:** Medium  
**Dependencies:** Phase 2  

#### **Objective:**
Enable Space+drag pan, trackpad gestures, and wheel pan.

#### **Tasks:**

1. **Create PanOverlay component**
   - File: `src/components/customizer/PanOverlay.tsx`
   - Transparent overlay over canvas area
   - Activates when Space pressed
   - Captures mouse events for dragging

2. **Add pan methods to useCanvasZoomPan**
   - handlePanStart, handlePanMove, handlePanEnd
   - handleTrackpadPan (two-finger swipe)
   - handleWheelPan (with modifiers)

3. **Add zoom-to-cursor**
   - Implement Ctrl+Wheel zoom
   - Calculate cursor position
   - Adjust pan to keep point under cursor

4. **Integrate overlay into CustomDesignPage**
   - Add PanOverlay component to canvas area
   - Wire up event handlers
   - Add wheel event handler to canvas area

**PanOverlay Component:**

```tsx
// src/components/customizer/PanOverlay.tsx
import React from 'react';
import './PanOverlay.css';

interface PanOverlayProps {
  active: boolean;
  isPanning: boolean;
  onPanStart: (e: React.MouseEvent) => void;
  onPanMove: (e: React.MouseEvent) => void;
  onPanEnd: () => void;
}

export function PanOverlay({
  active,
  isPanning,
  onPanStart,
  onPanMove,
  onPanEnd,
}: PanOverlayProps) {
  if (!active) return null;

  return (
    <div
      className={`pan-overlay ${isPanning ? 'panning' : ''}`}
      onMouseDown={onPanStart}
      onMouseMove={onPanMove}
      onMouseUp={onPanEnd}
      onMouseLeave={onPanEnd}
    />
  );
}
```

```css
/* PanOverlay.css */
.pan-overlay {
  position: fixed;
  inset: 0;
  z-index: 999;
  cursor: grab;
  user-select: none;
}

.pan-overlay.panning {
  cursor: grabbing;
}
```

**Pan Methods in Hook:**

```typescript
// Add to useCanvasZoomPan.ts
const panStartX = useRef(0);
const panStartY = useRef(0);
const panStartOffsetX = useRef(0);
const panStartOffsetY = useRef(0);

const handlePanStart = useCallback((e: React.MouseEvent) => {
  if (!spaceKeyPressed) return;
  
  setIsPanning(true);
  panStartX.current = e.clientX;
  panStartY.current = e.clientY;
  panStartOffsetX.current = panOffsetX;
  panStartOffsetY.current = panOffsetY;
}, [spaceKeyPressed, panOffsetX, panOffsetY]);

const handlePanMove = useCallback((e: React.MouseEvent) => {
  if (!isPanning) return;
  
  const deltaX = e.clientX - panStartX.current;
  const deltaY = e.clientY - panStartY.current;
  
  setPanOffsetX(panStartOffsetX.current + deltaX);
  setPanOffsetY(panStartOffsetY.current + deltaY);
}, [isPanning]);

const handlePanEnd = useCallback(() => {
  setIsPanning(false);
}, []);

// Wheel event handler
const handleCanvasWheel = useCallback((e: React.WheelEvent) => {
  e.preventDefault();
  e.stopPropagation();

  if (e.ctrlKey) {
    // Zoom to cursor
    handleZoomToPoint(e);
  } else if (e.shiftKey) {
    // Horizontal pan
    setPanOffsetX(panOffsetX - e.deltaY);
  } else {
    // Vertical pan (trackpad or Alt+Wheel)
    setPanOffsetY(panOffsetY - e.deltaY);
  }
}, [canvasScale, panOffsetX, panOffsetY]);
```

**Testing:**
- ✅ Space+drag pans canvas smoothly
- ✅ Grab/grabbing cursor appears
- ✅ Trackpad two-finger swipe works
- ✅ Ctrl+Wheel zooms to cursor position
- ✅ Shift+Wheel pans horizontally
- ✅ Pan doesn't interfere with object selection

---

### **Phase 4: Enhanced Selection System**
**Duration:** 2-3 hours  
**Risk:** Low  
**Dependencies:** None (independent)  

#### **Objective:**
Improve Fabric.js selection with better visual feedback and controls.

#### **Tasks:**

1. **Update Fabric canvas configuration**
   - Location: useFabricCanvas.ts initialization
   - Add selection border styling
   - Configure corner controls

2. **Enhance object defaults**
   - Update addImageToCanvas method
   - Update addTextToCanvas method
   - Better control handles

**Configuration Updates:**

```typescript
// src/hooks/useFabricCanvas.ts
const canvas = new Canvas(canvasId, {
  width: UI_CANVAS_WIDTH,
  height: UI_CANVAS_HEIGHT,
  backgroundColor: 'transparent',
  
  // Selection styling
  selection: true,
  selectionBorderColor: '#007bff',
  selectionLineWidth: 2,
  selectionDashArray: [],
  
  // Performance
  preserveObjectStacking: true,
  enableRetinaScaling: true,
  renderOnAddRemove: true,
  
  // Controls
  uniformScaling: false,
  uniScaleKey: null,
});

// Configure default object controls
Canvas.prototype.customiseCornerIcons({
  settings: {
    borderColor: '#007bff',
    cornerSize: 12,
    cornerShape: 'circle',
    cornerBackgroundColor: '#007bff',
    cornerStrokeColor: 'white',
    transparentCorners: false,
  }
});
```

**Enhanced Object Configuration:**

```typescript
// Update addImageToCanvas in useFabricCanvas.ts
const addImageToCanvas = useCallback((imageUrl: string, options = {}) => {
  Image.fromURL(imageUrl, { crossOrigin: 'anonymous' }).then((img) => {
    if (options.fit !== false) {
      fitToDesignArea(img, UI_CANVAS_WIDTH, UI_CANVAS_HEIGHT);
    }
    if (options.center !== false) {
      centerObject(img, canvasRef.current);
    }
    
    // Enhanced object config
    img.set({
      cornerStyle: 'circle',
      cornerColor: '#007bff',
      cornerSize: 12,
      transparentCorners: false,
      borderColor: '#007bff',
      borderScaleFactor: 2,
      lockScalingFlip: true,
      centeredScaling: false,
      centeredRotation: true,
      hasRotatingPoint: true,
    });
    
    canvasRef.current.add(img);
    canvasRef.current.setActiveObject(img);
    canvasRef.current.renderAll();
  });
}, []);
```

**Testing:**
- ✅ Selected objects have blue circular handles
- ✅ Rotation handle appears
- ✅ Multi-select with Ctrl+Click works
- ✅ Selection box drag works
- ✅ Visual feedback is clear

---

### **Phase 5: Smart Alignment Guides & Snapping**
**Duration:** 4-5 hours  
**Risk:** Medium  
**Dependencies:** Phase 4  

#### **Objective:**
Add Figma-style alignment guides with two-tier snapping system.

#### **Tasks:**

1. **Create useAlignmentGuides hook**
   - File: `src/hooks/useAlignmentGuides.ts`
   - Two-tier system: show at 8px, snap at 2px
   - Canvas center alignment
   - Object-to-object alignment

2. **Integrate into useFabricCanvas**
   - Add object:moving event handler
   - Add object:modified cleanup
   - Create/remove guide lines

3. **Create visual guide lines**
   - Pink dashed lines (#FF0066)
   - Fabric.Line objects
   - Auto-cleanup after movement

**Alignment Hook:**

```typescript
// src/hooks/useAlignmentGuides.ts
import { Canvas, Object as FabricObject, Line } from 'fabric';

const SHOW_DISTANCE = 8;  // Show guide at 8px
const SNAP_DISTANCE = 2;  // Snap at 2px

export function useAlignmentGuides(canvas: Canvas | null) {
  useEffect(() => {
    if (!canvas) return;

    let alignmentLines: Line[] = [];

    function createGuideLine(coords: number[]): Line {
      return new Line(coords, {
        stroke: '#FF0066',
        strokeWidth: 1,
        strokeDashArray: [5, 5],
        selectable: false,
        evented: false,
        excludeFromExport: true,
        isAlignmentGuide: true,
      } as any);
    }

    function clearGuides() {
      alignmentLines.forEach(line => canvas.remove(line));
      alignmentLines = [];
    }

    function checkAlignment(obj: FabricObject) {
      clearGuides();

      const canvasCenter = {
        x: canvas.width! / 2,
        y: canvas.height! / 2,
      };

      const objCenter = obj.getCenterPoint();
      const objBounds = obj.getBoundingRect();

      // Canvas center - vertical line
      const vcDist = Math.abs(objCenter.x - canvasCenter.x);
      if (vcDist < SHOW_DISTANCE) {
        if (vcDist < SNAP_DISTANCE) {
          obj.set({ left: obj.left! + (canvasCenter.x - objCenter.x) });
          obj.setCoords();
        }
        const line = createGuideLine([canvasCenter.x, 0, canvasCenter.x, canvas.height!]);
        canvas.add(line);
        alignmentLines.push(line);
      }

      // Canvas center - horizontal line
      const hcDist = Math.abs(objCenter.y - canvasCenter.y);
      if (hcDist < SHOW_DISTANCE) {
        if (hcDist < SNAP_DISTANCE) {
          obj.set({ top: obj.top! + (canvasCenter.y - objCenter.y) });
          obj.setCoords();
        }
        const line = createGuideLine([0, canvasCenter.y, canvas.width!, canvasCenter.y]);
        canvas.add(line);
        alignmentLines.push(line);
      }

      // Object-to-object alignment (iterate through other objects)
      const allObjects = canvas.getObjects().filter(o => 
        o !== obj && o.type !== 'line' && o.visible && !(o as any).isAlignmentGuide
      );

      // ⭐ Spatial optimization for performance with many objects
      const MAX_ALIGNMENT_DISTANCE = 200; // Only check nearby objects
      const nearbyObjects = allObjects.filter(target => {
        const targetCenter = target.getCenterPoint();
        const dx = targetCenter.x - objCenter.x;
        const dy = targetCenter.y - objCenter.y;
        const distance = Math.hypot(dx, dy);
        return distance < MAX_ALIGNMENT_DISTANCE;
      });

      nearbyObjects.forEach(target => {
        const targetCenter = target.getCenterPoint();
        const targetBounds = target.getBoundingRect();

        // Vertical center alignment
        const voDist = Math.abs(objCenter.x - targetCenter.x);
        if (voDist < SHOW_DISTANCE) {
          if (voDist < SNAP_DISTANCE) {
            obj.set({ left: obj.left! + (targetCenter.x - objCenter.x) });
            obj.setCoords();
          }
          const y1 = Math.min(objBounds.top, targetBounds.top);
          const y2 = Math.max(objBounds.top + objBounds.height, targetBounds.top + targetBounds.height);
          const line = createGuideLine([targetCenter.x, y1, targetCenter.x, y2]);
          canvas.add(line);
          alignmentLines.push(line);
        }

        // Add more alignment checks (edges, etc.)
      });

      if (alignmentLines.length > 0) {
        canvas.renderAll();
      }
    }

    canvas.on('object:moving', (e) => {
      if (e.target) checkAlignment(e.target);
    });

    canvas.on('object:modified', clearGuides);
    canvas.on('selection:cleared', clearGuides);

    return () => {
      canvas.off('object:moving');
      canvas.off('object:modified');
      canvas.off('selection:cleared');
      clearGuides();
    };
  }, [canvas]);
}
```

**Integration:**

```typescript
// src/hooks/useFabricCanvas.ts
import { useAlignmentGuides } from './useAlignmentGuides';

export function useFabricCanvas(canvasId: string, options = {}) {
  // ... existing code
  
  // Enable alignment guides
  useAlignmentGuides(canvasRef.current);
  
  // ... rest of hook
}
```

**Testing:**
- ✅ Pink dashed lines appear when near center
- ✅ Objects snap to canvas center (both axes)
- ✅ Objects snap to other objects (center, edges)
- ✅ Guides disappear after movement
- ✅ Two-tier system works (show 8px, snap 2px)

---

### **Phase 6: Drag & Drop File Upload**
**Duration:** 3-4 hours  
**Risk:** Low  
**Dependencies:** None (independent)  

#### **Objective:**
Enable drag & drop file upload directly onto canvas area.

#### **Tasks:**

1. **Create file validation utility**
   - File: `src/utils/fileValidation.ts`
   - Type checking (PNG, JPG, SVG)
   - Size limits (max 10MB)
   - Return validation result

2. **Create DropZoneOverlay component**
   - File: `src/components/customizer/DropZoneOverlay.tsx`
   - Transparent overlay over canvas
   - Visual feedback during drag
   - Handle file drop event

3. **Integrate with existing upload system**
   - Use existing useImageUpload hook
   - Connect to addImageToCanvas method
   - Show progress/errors

**File Validation:**

```typescript
// src/utils/fileValidation.ts
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateImageFile(file: File): ValidationResult {
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
  
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Only PNG, JPG, and SVG files are allowed'
    };
  }
  
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size must be less than 10MB'
    };
  }
  
  return { valid: true };
}
```

**DropZone Component:**

```tsx
// src/components/customizer/DropZoneOverlay.tsx
import React, { useState } from 'react';
import { validateImageFile } from '../../utils/fileValidation';
import './DropZoneOverlay.css';

interface DropZoneOverlayProps {
  onFileDrop: (file: File) => Promise<void>;
}

export function DropZoneOverlay({ onFileDrop }: DropZoneOverlayProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    
    for (const file of files) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        alert(validation.error);
        continue;
      }
      
      await onFileDrop(file);
    }
  };

  return (
    <div
      className={`drop-zone-overlay ${isDragging ? 'dragging' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    />
  );
}
```

```css
/* DropZoneOverlay.css */
.drop-zone-overlay {
  position: absolute;
  inset: 0;
  z-index: 10;
  pointer-events: none;
}

.drop-zone-overlay.dragging {
  pointer-events: auto;
  background: rgba(0, 123, 255, 0.1);
  border: 3px dashed #007bff;
  border-radius: 8px;
}
```

**Integration:**

```tsx
// CustomDesignPage.tsx
import { DropZoneOverlay } from '../components/customizer/DropZoneOverlay';
import { useImageUpload } from '../hooks/useImageUpload';

function CustomDesignPage() {
  const { uploadImage } = useImageUpload();
  const fabricCanvas = useFabricCanvas('design-canvas', {/*...*/});

  const handleFileDrop = async (file: File) => {
    try {
      const url = await uploadImage(file);
      fabricCanvas.addImageToCanvas(url, { fit: true, center: true });
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <div className="canvas-area">
      <DropZoneOverlay onFileDrop={handleFileDrop} />
      {/* rest of canvas */}
    </div>
  );
}
```

**Testing:**
- ✅ Drag files from desktop onto canvas
- ✅ Visual highlight appears during drag
- ✅ File validation works (type, size)
- ✅ Images upload to Cloudinary
- ✅ Images added to canvas automatically
- ✅ Multiple files supported

---

### **Phase 7: Context Integration**
**Duration:** 2-3 hours  
**Risk:** Low  
**Dependencies:** All previous phases  

#### **Objective:**
Update CanvasContext to expose all new functionality to components.

#### **Tasks:**

1. **Extend CanvasContext interface**
   - Location: src/contexts/CanvasContext.tsx
   - Add zoom/pan state
   - Add selection state
   - Add new methods

2. **Update CanvasProvider value**
   - Pass all new state and methods
   - Ensure backward compatibility

3. **Test context consumers**
   - Verify existing components still work
   - Test new functionality accessible

**Updated Interface:**

```typescript
// src/contexts/CanvasContext.tsx
interface CanvasContextType {
  // Existing properties
  fabricCanvas: Canvas | null;
  selectedObject: FabricObject | null;
  canvasObjects: FabricObject[];
  zoom: number;
  addImageToCanvas: (imageUrl: string, options?: any) => void;
  addTextToCanvas: (text: string, options?: any) => IText | undefined;
  removeSelectedObject: () => void;
  removeObject: (obj: FabricObject) => void;
  clearCanvas: () => void;
  getCanvasJSON: () => any;
  loadCanvasFromJSON: (json: any) => void;
  resetView: () => void;
  exportHighDPI: () => Promise<Blob | null>;
  
  // NEW: Zoom & Pan
  canvasScale: number;
  zoomLevel: number;
  panOffsetX: number;
  panOffsetY: number;
  isPanning: boolean;
  spacePressed: boolean;
  zoomIn: () => void;
  zoomOut: () => void;
  setPresetZoom: (percentage: number) => void;
  zoomToFit: () => void;
  
  // NEW: Selection
  isMultiSelect: boolean;
  selectionType: 'text' | 'image' | 'shape' | 'group' | null;
}
```

**Testing:**
- ✅ All existing components still work
- ✅ New zoom/pan methods accessible
- ✅ Context updates propagate correctly
- ✅ No breaking changes

---

### **Phase 8: Testing & Refinement**
**Duration:** 3-4 hours  
**Risk:** Low  
**Dependencies:** All previous phases  

#### **Objective:**
Comprehensive testing and bug fixes.

#### **Test Categories:**

1. **Navigation Flow**
   - CustomProductsPage → CustomDesignPage
   - Category passed correctly
   - Product filtering works
   - Mockup displays correctly

2. **Existing Features**
   - All panels open/close
   - All buttons work
   - Upload panel functionality
   - Text panel functionality
   - Graphics panel functionality
   - My Clothing panel
   - Layers panel

3. **New Canvas Features**
   - Zoom in/out smooth
   - Pan with Space+drag
   - Trackpad gestures
   - Keyboard shortcuts
   - Alignment guides
   - Drag & drop upload
   - Object selection

4. **Edge Cases**
   - Zoom limits (10%-400%)
   - Pan boundaries
   - Multiple objects
   - Large files
   - View switching (Front/Back)
   - Category switching

5. **Performance**
   - Canvas with 20+ objects
   - Rapid zoom/pan
   - Large images (4K+)
   - Memory leaks check

6. **Cross-browser**
   - Chrome/Edge
   - Firefox
   - Safari
   - Mobile devices (if applicable)

---

## 📊 **IMPLEMENTATION TIMELINE**

### **Estimated Duration:**

| Phase | Duration | Cumulative |
|-------|----------|------------|
| Phase 1: Transform Wrapper | 2-3 hours | 2-3 hours |
| Phase 2: Zoom System | 4-5 hours | 6-8 hours |
| **Phase 2.5: Image Optimization** ⭐ NEW | **3-4 hours** | **9-12 hours** |
| Phase 3: Pan Functionality | 3-4 hours | 12-16 hours |
| Phase 4: Enhanced Selection | 2-3 hours | 14-19 hours |
| Phase 5: Alignment Guides | 4-5 hours | 18-24 hours |
| Phase 6: Drag & Drop | 3-4 hours | 21-28 hours |
| Phase 7: Context Integration | 2-3 hours | 23-31 hours |
| Phase 8: Testing & Refinement | 3-4 hours | 26-35 hours |

**Total: 26-35 hours (3-4 working days with Phase 2.5)**
**Previous estimate: 23-31 hours**
**Increase: +3-4 hours for image optimization system**

### **Recommended Schedule:**

**Day 1 (8 hours):**
- Morning: Phase 1 + Phase 2 (Foundation + Zoom)
- Afternoon: Phase 3 (Pan)

**Day 2 (8 hours):**
- Morning: Phase 4 + Phase 5 (Selection + Alignment)
- Afternoon: Phase 6 (Drag & Drop)

**Day 3 (8 hours):**
- Morning: Phase 7 (Context Integration)
- Afternoon: Phase 8 (Testing)
- Evening: Bug fixes and polish

---

## ⚠️ **CRITICAL SUCCESS FACTORS**

### **1. Preserve Existing Functionality**
- ✅ All panels must continue to work
- ✅ Product filtering must not break
- ✅ Navigation flow must remain intact
- ✅ T-shirt mockup selection must work

### **2. Maintain Performance**
- ✅ Smooth 60fps zoom/pan
- ✅ No lag with multiple objects
- ✅ Efficient event handling

### **3. User Experience**
- ✅ Intuitive controls
- ✅ Clear visual feedback
- ✅ Keyboard shortcuts work
- ✅ Professional feel

### **4. Code Quality**
- ✅ TypeScript types throughout
- ✅ Proper React patterns
- ✅ Clean component structure
- ✅ Reusable hooks

---

## 🔄 **ROLLBACK PLAN**

If issues arise during implementation:

1. **Phase-by-phase rollback**
   - Each phase is independent
   - Can revert specific features
   - Git commits per phase

2. **Feature flags**
   - Add environment variable to enable/disable new features
   - `VITE_ENABLE_CANVAS_ENHANCEMENTS=true`

3. **Backup strategy**
   - Create branch before starting
   - Keep original files as `.backup.tsx`
   - Document all changes

---

## 📝 **POST-IMPLEMENTATION TASKS**

After successful implementation:

1. **Documentation**
   - Update README with new features
   - Document keyboard shortcuts
   - Create user guide

2. **Performance Monitoring**
   - Track canvas performance metrics
   - Monitor memory usage
   - Log any errors

3. **User Feedback**
   - Gather feedback on new features
   - Identify pain points
   - Plan future enhancements

4. **Optimization**
   - Profile performance
   - Optimize bottlenecks
   - Add caching if needed

---

## 🎯 **SUCCESS CRITERIA**

### **Must Have:**
- ✅ Smooth zoom in/out (CSS transform)
- ✅ Pan with Space+drag
- ✅ Keyboard shortcuts (Ctrl+Plus/Minus/0)
- ✅ Enhanced object selection
- ✅ All existing features work

### **Should Have:**
- ✅ Alignment guides and snapping
- ✅ Zoom-to-cursor
- ✅ Trackpad gestures
- ✅ Drag & drop upload

### **Nice to Have:**
- ✅ Zoom presets dropdown
- ✅ Contextual toolbar (optional)
- ✅ Touch device support

---

## 🚀 **READY TO START?**

This plan provides:
- ✅ Clear phase-by-phase approach
- ✅ Detailed code examples
- ✅ Testing checkpoints
- ✅ Realistic timeline
- ✅ Risk mitigation
- ✅ Success criteria

**Next Steps:**
1. Review this plan thoroughly
2. Ask any clarifying questions
3. Set up development branch
4. Begin Phase 1 implementation

---

## 📋 **DETAILED CODE CHANGES - LINE BY LINE**

This section provides exact line numbers and surgical changes for each file.

---

### **FILE 1: CustomDesignPage.tsx**

**Location:** `src/pages/CustomDesignPage.tsx` (1638 lines)  
**Risk:** Medium

#### Change 1.1: Add Import (Line 34)
```tsx
// ADD after line 34 (after useCustomizableProducts import)
import { useCanvasZoomPan } from '../hooks/useCanvasZoomPan';
```

#### Change 1.2: Remove Zoom State (Line 84)
```tsx
// REMOVE this line:
const [zoom, setZoom] = useState(DEFAULT_ZOOM);
```

#### Change 1.3: Add Hook Usage (After Line 133)
```tsx
// ADD after fabricCanvas hook initialization
const {
  canvasScale,
  zoomLevel,
  panOffsetX,
  panOffsetY,
  isPanning,
  spaceKeyPressed,
  zoomIn,
  zoomOut,
  setPresetZoom,
  zoomFit,
  handlePanStart,
  handlePanMove,
  handlePanEnd,
  handleCanvasWheel,
} = useCanvasZoomPan();
```

#### Change 1.4: Canvas Area Restructure (Lines 1519-1593)

**BEFORE:**
```tsx
{/* Canvas Area */}
<div className="flex-1 overflow-auto p-8 flex flex-col items-center justify-center bg-gray-50">
  <div className="relative flex items-center justify-center mb-8">
    <div className="relative w-[1400px] h-[1600px] flex items-center justify-center">
```

**AFTER:**
```tsx
{/* Canvas Area */}
<div 
  className="flex-1 overflow-hidden p-8 flex flex-col items-center justify-center bg-gray-50 relative"
  onWheel={handleCanvasWheel}
>
  {/* Pan Overlay */}
  {spaceKeyPressed && (
    <div
      className={`absolute inset-0 z-50 ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
      onMouseDown={handlePanStart}
      onMouseMove={handlePanMove}
      onMouseUp={handlePanEnd}
      onMouseLeave={handlePanEnd}
    />
  )}

  <div className="relative flex items-center justify-center mb-8">
    {/* CSS Transform Wrapper */}
    <div 
      className="canvas-transform-wrapper"
      style={{
        transform: `translate(${panOffsetX}px, ${panOffsetY}px) scale(${canvasScale})`,
        transformOrigin: 'center center',
        transition: isPanning ? 'none' : 'transform 0.15s ease-out',
        willChange: 'transform',
      }}
    >
      <div className="relative w-[1400px] h-[1600px] flex items-center justify-center">
```

#### Change 1.5: Bottom Bar (Lines 1598-1629)

**BEFORE:**
```tsx
onClick={() => {
  const newZoom = Math.max(50, zoom - 10);
  setZoom(newZoom);
  fabricCanvas.setZoom(newZoom / 100);
}}
```

**AFTER:**
```tsx
onClick={zoomOut}
```

**Replace `{zoom}%` with `{zoomLevel}%`**

---

### **FILE 2: useFabricCanvas.ts**

**Location:** `src/hooks/useFabricCanvas.ts` (298 lines)  
**Risk:** HIGH ⚠️

#### Change 2.1: Add Import (Line 11)
```typescript
import type { UploadedImage } from '../services/cloudinary';
```

#### Change 2.2: Remove Zoom State (Line 27)
```typescript
// REMOVE:
const [zoom, setZoomLevel] = useState(1);
```

#### Change 2.3: Modify addImageToCanvas (Lines 106-129)

**BEFORE:**
```typescript
const addImageToCanvas = useCallback(
  (imageUrl: string, options: { fit?: boolean; center?: boolean } = {}) => {
```

**AFTER:**
```typescript
const addImageToCanvas = useCallback(
  (imageData: string | UploadedImage, options: { fit?: boolean; center?: boolean } = {}) => {
    if (!canvasRef.current) return;

    const loadUrl = typeof imageData === 'string' 
      ? imageData 
      : imageData.editingUrl || imageData.url;
    
    const originalUrl = typeof imageData === 'string' 
      ? imageData 
      : imageData.url;

    Image.fromURL(loadUrl, { crossOrigin: 'anonymous' }).then((img) => {
      if (!canvasRef.current) return;

      // Store original URL for high-res export
      (img as any).originalSrc = originalUrl;
      (img as any).editingSrc = loadUrl;
```

#### Change 2.4: Remove setZoom Method (Lines 219-230)
```typescript
// REMOVE or deprecate:
const setZoom = useCallback((zoomLevel: number) => {
  // ... entire function
}, []);
```

#### Change 2.5: Enhance exportHighDPI (Lines 232-298)

**ADD before scaling objects:**
```typescript
// Include custom properties
const json = canvasRef.current.toJSON(['originalSrc', 'editingSrc', 'publicId']);

// STEP 1: Load original high-res images
const loadPromises = objects.map(async (obj) => {
  if (obj.type === 'image' && (obj as any).originalSrc) {
    const originalUrl = (obj as any).originalSrc;
    try {
      const highResImg = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = originalUrl;
      });
      (obj as any).setElement(highResImg);
    } catch (error) {
      console.warn('Failed to load original image:', originalUrl);
    }
  }
});
await Promise.all(loadPromises);
```

---

### **FILE 3: cloudinary.ts**

**Location:** `src/services/cloudinary.ts` (162 lines)  
**Risk:** Low

#### Change 3.1: Update Interface (Lines 25-32)

**BEFORE:**
```typescript
interface UploadResult {
  url: string;
  thumbnailUrl?: string;
```

**AFTER:**
```typescript
export interface UploadedImage {
  url: string;              // Original
  editingUrl: string;       // 1200px optimized
  thumbnailUrl: string;     // 300px preview
```

#### Change 3.2: Generate editingUrl (Lines 77-96)

**ADD after thumbnailUrl generation:**
```typescript
// Editing URL (1200px max dimension)
const editingUrl = originalUrl.replace(
  '/upload/',
  '/upload/w_1200,h_1200,c_limit,q_auto:good,f_auto/'
);

resolve({
  url: originalUrl,
  editingUrl,
  thumbnailUrl,
  // ... rest
});
```

---

### **FILE 4: useImageUpload.ts**

**Location:** `src/hooks/useImageUpload.ts` (130 lines)  
**Risk:** Low

#### Change 4.1: Update Return Type (Lines 4-6)
```typescript
import type { UploadedImage } from '../services/cloudinary';

uploadImage: (file: File, folder?: string) => Promise<UploadedImage | null>;
```

#### Change 4.2: Use Cloudinary Service
```typescript
import { uploadToCloudinary, CloudinaryFolder } from '../services/cloudinary';

// Replace fetch logic with:
const result = await uploadToCloudinary(file, CloudinaryFolder.USER_UPLOADS, setProgress);
return result;
```

---

### **FILE 5: CanvasContext.tsx**

**Location:** `src/contexts/CanvasContext.tsx` (~50 lines)  
**Risk:** Low

#### Change 5.1: Update Interface (Lines 4-19)
```typescript
interface CanvasContextType {
  // Add new zoom/pan state
  canvasScale: number;
  zoomLevel: number;
  panOffsetX: number;
  panOffsetY: number;
  
  // Update method signature
  addImageToCanvas: (imageData: string | UploadedImage, options?: {...}) => void;
  
  // Add new methods
  zoomIn: () => void;
  zoomOut: () => void;
  zoomFit: () => void;
  setPresetZoom: (percentage: number) => void;
}
```

---

### **NEW FILES TO CREATE**

#### File 6: useCanvasZoomPan.ts
**Location:** `src/hooks/useCanvasZoomPan.ts`
- See Phase 2 section for full implementation

#### File 7: canvasEditor.css
**Location:** `src/styles/canvasEditor.css`
```css
.canvas-transform-wrapper {
  position: relative;
  transform-origin: center center;
  will-change: transform;
}

.canvas-transform-wrapper img {
  image-rendering: high-quality;
}
```

---

### **FILES NOT CHANGED**

| File | Reason |
|------|--------|
| `fabricHelpers.ts` | Constants remain the same |
| `globals.css` | No conflicts |
| All panel components | Already absolute positioned |
| Navigation components | Unchanged |

---

### **IMPLEMENTATION CHECKLIST**

```
□ Phase 1
  □ Create canvasEditor.css
  □ Add transform wrapper to CustomDesignPage.tsx (lines 1519-1593)
  □ Test: mockup scales correctly

□ Phase 2  
  □ Create useCanvasZoomPan.ts hook
  □ Remove zoom state from CustomDesignPage.tsx (line 84)
  □ Add hook usage (after line 133)
  □ Update bottom bar controls (lines 1598-1629)
  □ Test: zoom in/out works

□ CHECKPOINT: Coordinate Verification
  □ Test object selection at 100%, 200%, 400%
  □ Test object dragging at various zooms
  □ STOP if fails - implement getScaledPointer override

□ Phase 2.5
  □ Update cloudinary.ts interface (lines 25-32)
  □ Add editingUrl generation (lines 77-96)
  □ Update useImageUpload.ts return type
  □ Modify addImageToCanvas (lines 106-129)
  □ Enhance exportHighDPI (lines 232-298)
  □ Test: upload shows 1200px, export uses 4000px

□ Phase 3-8
  □ (Continue with remaining phases)
```

---

**Document Version:** 1.1  
**Last Updated:** December 18, 2025  
**Status:** Ready for Implementation
