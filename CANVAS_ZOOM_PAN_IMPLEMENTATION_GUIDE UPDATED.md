# Canvas Zoom & Pan Implementation Guide

## Complete Reference for Recreating Figma-Style Canvas Controls

This document provides a framework-agnostic guide to implementing a Fabric.js canvas with Figma-style zoom and pan controls. Use this as a reference to recreate the system in React, Vue, or any other framework.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Layout Structure](#layout-structure)
3. [State Management](#state-management)
4. [Zoom Implementation](#zoom-implementation)
5. [Pan Implementation](#pan-implementation)
6. [Canvas Dimensions System](#canvas-dimensions-system)
7. [Event Handling](#event-handling)
8. [CSS Styling Reference](#css-styling-reference)
9. [Step-by-Step Recreation Guide](#step-by-step-recreation-guide)
10. [React Example Implementation](#react-example-implementation)

---

## Architecture Overview

### Core Components

The system consists of 4 main layers:

```
1. Container Layout (Fixed Viewport)
   ├── Sidebar (Fixed 80px)
   └── Main Content (Flexible)
       ├── Top Bar (Fixed 56px)
       ├── Canvas Area (Flexible Center Space)
       │   └── Canvas Transform Wrapper (600×600px)
       │       └── Print Area Box (Dynamic Size)
       │           └── Fabric.js Canvas Element
       └── Bottom Bar (Fixed 50px)
```

### Technology Stack

- **Canvas Library**: Fabric.js (for object manipulation)
- **Zoom Method**: CSS Transform (not Fabric's native zoom)
- **Pan Method**: CSS Transform translate
- **State**: Reactive signals/hooks for UI updates

### Key Design Decisions

1. **CSS Transform over Fabric Zoom**: Better performance, simpler math
2. **Centered Canvas**: Fixed wrapper that scales from center
3. **Observable Pattern**: State changes trigger UI updates
4. **Keyboard + Mouse**: Multiple input methods for accessibility

---

## Layout Structure

### HTML Structure (Framework-Agnostic)

```html
<div class="customization-container">
  <!-- Left Sidebar -->
  <div class="left-sidebar">
    <button class="back-btn">Back</button>
    <button class="sidebar-btn">Upload</button>
    <button class="sidebar-btn">Add text</button>
    <!-- More tools... -->
  </div>

  <!-- Main Content -->
  <div class="main-content">
    <!-- Top Bar -->
    <div class="top-bar">
      <div class="top-bar-left">
        <button class="undo-btn">↶</button>
        <button class="redo-btn">↷</button>
      </div>
      <div class="top-bar-center">
        <!-- Text formatting toolbar -->
      </div>
      <div class="top-bar-right">
        <button class="btn-preview">Preview</button>
      </div>
    </div>

    <!-- Canvas Area -->
    <div class="canvas-area" 
         onWheel={handleCanvasWheel}
         onClick={handleCanvasClick}>
      
      <!-- Transform Wrapper -->
      <div class="tshirt-canvas"
           style={{
             transform: `translate(${panX}px, ${panY}px) scale(${scale})`
           }}>
        
        <!-- Print Area Box -->
        <div class="print-area-box"
             style={{
               width: `${canvasWidth}px`,
               height: `${canvasHeight}px`
             }}>
          
          <!-- Fabric Canvas -->
          <canvas ref={canvasRef}></canvas>
          
          <!-- Resize Handles (optional) -->
          <div class="resize-handle resize-handle-e" 
               onMouseDown={handleResizeStart}></div>
          <div class="resize-handle resize-handle-s" 
               onMouseDown={handleResizeStart}></div>
          <div class="resize-handle resize-handle-se" 
               onMouseDown={handleResizeStart}></div>
        </div>
      </div>

      <!-- Pan Overlay (Space + Drag) -->
      <div class="pan-overlay"
           className={spacePressed ? 'active' : ''}
           onMouseDown={handlePanStart}
           onMouseMove={handlePanMove}
           onMouseUp={handlePanEnd}>
      </div>
    </div>

    <!-- Bottom Bar -->
    <div class="bottom-bar">
      <div class="bottom-bar-left">
        <!-- Zoom Controls -->
        <div class="zoom-controls">
          <button onClick={zoomOut}>−</button>
          <div class="zoom-display" onClick={toggleZoomPresets}>
            {zoomLevel}%
          </div>
          <button onClick={zoomIn}>+</button>
          <button onClick={zoomFit}>⟲</button>
        </div>
      </div>
      
      <div class="bottom-bar-center">
        <!-- View Switcher (Front/Back/Neck) -->
      </div>
      
      <div class="bottom-bar-right">
        <!-- Additional Controls -->
      </div>
    </div>
  </div>
</div>
```

### Viewport Dimensions

```
Total Screen: 100vw × 100vh
├── Left Sidebar: 80px (fixed width)
└── Main Content: calc(100vw - 80px) × 100vh
    ├── Top Bar: 100% × 56px
    ├── Canvas Area: 100% × calc(100vh - 106px)
    └── Bottom Bar: 100% × 50px
```

---

## State Management

### Required State Variables

```javascript
// Zoom State
const [zoomLevel, setZoomLevel] = useState(100);        // Display percentage
const [canvasScale, setCanvasScale] = useState(1.0);    // CSS scale value (0.1 - 4.0)

// Pan State
const [panOffsetX, setPanOffsetX] = useState(0);        // Horizontal pan in pixels
const [panOffsetY, setPanOffsetY] = useState(0);        // Vertical pan in pixels
const [isPanning, setIsPanning] = useState(false);      // Currently dragging?
const [spaceKeyPressed, setSpaceKeyPressed] = useState(false);  // Space held?

// Pan Start Positions (for drag calculations)
const [panStartX, setPanStartX] = useState(0);
const [panStartY, setPanStartY] = useState(0);
const [panStartOffsetX, setPanStartOffsetX] = useState(0);
const [panStartOffsetY, setPanStartOffsetY] = useState(0);

// Canvas Dimensions
const [canvasWidth, setCanvasWidth] = useState(400);    // Fabric canvas width
const [canvasHeight, setCanvasHeight] = useState(500);  // Fabric canvas height

// UI State
const [isZoomExpanded, setIsZoomExpanded] = useState(false);  // Zoom presets visible?
const [fabricCanvas, setFabricCanvas] = useState(null);        // Fabric.js instance

// Wheel Event Throttling
const wheelUpdateQueued = useRef(false);
const pendingDeltaX = useRef(0);
const pendingDeltaY = useRef(0);
```

### State Update Pattern

When zoom or pan changes, update both the display state and trigger UI re-render:

```javascript
function updateScale(newScale) {
  const clampedScale = Math.max(0.1, Math.min(4.0, newScale));
  setCanvasScale(clampedScale);
  setZoomLevel(Math.round(clampedScale * 100));
}

function updatePan(x, y) {
  setPanOffsetX(x);
  setPanOffsetY(y);
}
```

---

## Zoom Implementation

### 1. CSS Transform-Based Zoom

**Why not Fabric's native zoom?**
- CSS transform is more performant
- Simpler coordinate math
- Better browser optimization
- Easier to combine with pan

### 2. Zoom Methods

```javascript
// Zoom In (10% increment)
function zoomIn() {
  const newScale = Math.min(canvasScale + 0.1, 4.0);  // Max 400%
  updateScale(newScale);
}

// Zoom Out (10% decrement)
function zoomOut() {
  const newScale = Math.max(canvasScale - 0.1, 0.1);  // Min 10%
  updateScale(newScale);
}

// Zoom to Specific Preset
function setPresetZoom(percentage) {
  const newScale = percentage / 100;
  updateScale(newScale);
}

// Zoom Fit (Reset to 100% and center)
function zoomFit() {
  updateScale(1.0);
  setPanOffsetX(0);
  setPanOffsetY(0);
}
```

### 3. Zoom Presets

Common presets for quick access:

```javascript
const zoomPresets = [
  { label: '3%', value: 3 },      // Overview
  { label: '50%', value: 50 },    // Zoomed out
  { label: '100%', value: 100 },  // Actual size
  { label: '135%', value: 135 },  // Comfortable
  { label: '170%', value: 170 },  // Detail work
];
```

### 4. Zoom to Cursor (Advanced)

This keeps the point under the cursor stationary while zooming:

```javascript
function handleZoomToPoint(event) {
  const canvasArea = event.currentTarget;
  const rect = canvasArea.getBoundingClientRect();
  
  // Get mouse position relative to canvas center
  const mouseX = event.clientX - rect.left - rect.width / 2;
  const mouseY = event.clientY - rect.top - rect.height / 2;
  
  // Calculate new scale from wheel delta
  const oldScale = canvasScale;
  const delta = event.deltaY;
  let newScale = oldScale * (0.999 ** delta);
  newScale = Math.max(0.1, Math.min(4.0, newScale));
  
  // Calculate the canvas point under cursor BEFORE zoom
  const canvasPointX = (mouseX - panOffsetX) / oldScale;
  const canvasPointY = (mouseY - panOffsetY) / oldScale;
  
  // Calculate pan adjustment to keep cursor on same point AFTER zoom
  const panAdjustX = canvasPointX * (newScale - oldScale);
  const panAdjustY = canvasPointY * (newScale - oldScale);
  
  // Update pan offset before applying scale
  setPanOffsetX(panOffsetX - panAdjustX);
  setPanOffsetY(panOffsetY - panAdjustY);
  
  // Apply scale
  updateScale(newScale);
}
```

**Math Explanation:**
1. Find mouse position relative to center
2. Calculate what point on the canvas is under cursor (in canvas coordinates)
3. Determine how much pan adjustment needed to keep that point under cursor
4. Apply pan adjustment, then apply scale

### 5. Keyboard Shortcuts

```javascript
function handleKeyDown(event) {
  // Zoom shortcuts
  if (event.ctrlKey || event.metaKey) {
    switch(event.key) {
      case '+':
      case '=':
        event.preventDefault();
        zoomIn();
        break;
      case '-':
      case '_':
        event.preventDefault();
        zoomOut();
        break;
      case '0':
        event.preventDefault();
        zoomFit();
        break;
      case '1':
        event.preventDefault();
        setPresetZoom(100);
        break;
      case '2':
        event.preventDefault();
        setPresetZoom(200);
        break;
    }
  }
  
  // Space key for panning
  if (event.code === 'Space' && !spaceKeyPressed) {
    event.preventDefault();
    setSpaceKeyPressed(true);
  }
}

function handleKeyUp(event) {
  if (event.code === 'Space') {
    setSpaceKeyPressed(false);
    setIsPanning(false);
  }
}

// Add event listeners
useEffect(() => {
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
  
  return () => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
  };
}, [canvasScale, panOffsetX, panOffsetY, spaceKeyPressed]);
```

---

## Pan Implementation

### 1. Space + Drag Pan

```javascript
function handlePanStart(event) {
  if (!spaceKeyPressed) return;
  
  setIsPanning(true);
  setPanStartX(event.clientX);
  setPanStartY(event.clientY);
  setPanStartOffsetX(panOffsetX);
  setPanStartOffsetY(panOffsetY);
}

function handlePanMove(event) {
  if (!isPanning) return;
  
  const deltaX = event.clientX - panStartX;
  const deltaY = event.clientY - panStartY;
  
  setPanOffsetX(panStartOffsetX + deltaX);
  setPanOffsetY(panStartOffsetY + deltaY);
}

function handlePanEnd() {
  setIsPanning(false);
}
```

### 2. Trackpad/Mouse Wheel Pan

```javascript
function handleCanvasWheel(event) {
  event.preventDefault();
  event.stopPropagation();

  if (event.ctrlKey) {
    // ZOOM TO CURSOR (trackpad pinch or Ctrl+wheel)
    handleZoomToPoint(event);
  } 
  else if (event.shiftKey) {
    // PAN LEFT/RIGHT (Shift + wheel)
    handleHorizontalPan(event);
  } 
  else if (event.altKey) {
    // PAN UP/DOWN (Alt + wheel)
    handleVerticalPan(event);
  } 
  else {
    // TRACKPAD SWIPE (two-finger pan)
    handleTrackpadPan(event);
  }
}

// Horizontal Pan (Shift + Wheel)
function handleHorizontalPan(event) {
  const panAmount = event.deltaY;
  setPanOffsetX(panOffsetX - panAmount);
}

// Vertical Pan (Alt + Wheel)
function handleVerticalPan(event) {
  const panAmount = event.deltaY;
  setPanOffsetY(panOffsetY - panAmount);
}

// Trackpad Swipe (smooth pan both directions)
function handleTrackpadPan(event) {
  // Accumulate deltas for smooth performance
  pendingDeltaX.current += event.deltaX;
  pendingDeltaY.current += event.deltaY;

  // Throttle with requestAnimationFrame
  if (!wheelUpdateQueued.current) {
    wheelUpdateQueued.current = true;
    requestAnimationFrame(() => {
      setPanOffsetX(panOffsetX - pendingDeltaX.current);
      setPanOffsetY(panOffsetY - pendingDeltaY.current);
      pendingDeltaX.current = 0;
      pendingDeltaY.current = 0;
      wheelUpdateQueued.current = false;
    });
  }
}
```

### 3. Pan Overlay

A transparent overlay that captures mouse events when Space is pressed:

```jsx
<div 
  className={`pan-overlay ${spaceKeyPressed ? 'active' : ''} ${isPanning ? 'panning' : ''}`}
  onMouseDown={handlePanStart}
  onMouseMove={handlePanMove}
  onMouseUp={handlePanEnd}
  onMouseLeave={handlePanEnd}
/>
```

---

## Canvas Dimensions System

### 1. Print Area Presets

Common t-shirt print sizes:

```javascript
const printAreaPresets = [
  { 
    id: 'small', 
    label: 'Small (12" × 16")', 
    width: 300, 
    height: 400, 
    description: 'Chest print' 
  },
  { 
    id: 'medium', 
    label: 'Medium (16" × 20")', 
    width: 400, 
    height: 500, 
    description: 'Standard' 
  },
  { 
    id: 'large', 
    label: 'Large (18" × 24")', 
    width: 450, 
    height: 600, 
    description: 'Full front' 
  },
  { 
    id: 'oversized', 
    label: 'Oversized (20" × 28")', 
    width: 500, 
    height: 700, 
    description: 'All-over' 
  }
];
```

### 2. Preset Selection

```javascript
function selectPrintAreaPreset(presetId) {
  const preset = printAreaPresets.find(p => p.id === presetId);
  if (!preset) return;
  
  // Update canvas dimensions
  setCanvasWidth(preset.width);
  setCanvasHeight(preset.height);
  
  // Resize Fabric.js canvas
  if (fabricCanvas) {
    fabricCanvas.setWidth(preset.width);
    fabricCanvas.setHeight(preset.height);
    fabricCanvas.requestRenderAll();
  }
}
```

### 3. Custom Sizing with Drag Handles

```javascript
const [printAreaMode, setPrintAreaMode] = useState('preset'); // 'preset' or 'custom'
const [isResizing, setIsResizing] = useState(false);
const [resizeDirection, setResizeDirection] = useState(null); // 'e', 's', or 'se'
const [resizeStartX, setResizeStartX] = useState(0);
const [resizeStartY, setResizeStartY] = useState(0);
const [resizeStartWidth, setResizeStartWidth] = useState(0);
const [resizeStartHeight, setResizeStartHeight] = useState(0);

function handleResizeStart(event, direction) {
  event.stopPropagation();
  setIsResizing(true);
  setResizeDirection(direction);
  setResizeStartX(event.clientX);
  setResizeStartY(event.clientY);
  setResizeStartWidth(canvasWidth);
  setResizeStartHeight(canvasHeight);
}

function handleResizeMove(event) {
  if (!isResizing) return;
  
  const deltaX = event.clientX - resizeStartX;
  const deltaY = event.clientY - resizeStartY;
  
  let newWidth = resizeStartWidth;
  let newHeight = resizeStartHeight;
  
  // Calculate based on direction
  if (resizeDirection === 'e' || resizeDirection === 'se') {
    newWidth = Math.max(200, Math.min(800, resizeStartWidth + deltaX));
  }
  
  if (resizeDirection === 's' || resizeDirection === 'se') {
    newHeight = Math.max(200, Math.min(800, resizeStartHeight + deltaY));
  }
  
  // Update dimensions
  setCanvasWidth(newWidth);
  setCanvasHeight(newHeight);
  
  // Resize Fabric canvas
  if (fabricCanvas) {
    fabricCanvas.setWidth(newWidth);
    fabricCanvas.setHeight(newHeight);
    fabricCanvas.requestRenderAll();
  }
}

function handleResizeEnd() {
  setIsResizing(false);
  setResizeDirection(null);
}

// Add to document listeners
useEffect(() => {
  if (isResizing) {
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
    return () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
    };
  }
}, [isResizing, resizeStartX, resizeStartY, resizeStartWidth, resizeStartHeight]);
```

---

## Event Handling

### Complete Event Handler Setup

```javascript
// Canvas Area Click (deselect objects)
function handleCanvasAreaClick(event) {
  // Only deselect if clicking empty space (not on canvas or controls)
  if (event.target.classList.contains('canvas-area')) {
    if (fabricCanvas) {
      fabricCanvas.discardActiveObject();
      fabricCanvas.requestRenderAll();
    }
  }
}

// Prevent Context Menu on Canvas
function handleContextMenu(event) {
  event.preventDefault();
}

// Track Mouse Position (useful for debugging)
function handleMouseMove(event) {
  // You can track cursor position for tooltips, guides, etc.
  const rect = event.currentTarget.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;
  // Store or use as needed
}
```

---

## CSS Styling Reference

### Core Layout Styles

```css
/* Full viewport container */
.customization-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 0;
  background: #f5f5f0;
  overflow: hidden;
  position: relative;
}

/* Left sidebar */
.left-sidebar {
  width: 80px;
  background: #fff;
  border-right: 1px solid #e5e5e5;
  display: flex;
  flex-direction: column;
  padding: 16px 0;
  gap: 4px;
  flex-shrink: 0;
}

/* Main content area */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

/* Top bar */
.top-bar {
  height: 56px;
  background: #fff;
  border-bottom: 1px solid #e5e5e5;
  display: flex;
  align-items: center;
  padding: 0 20px;
  justify-content: space-between;
  flex-shrink: 0;
}

/* Canvas area - centers content */
.canvas-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

/* Transform wrapper for zoom/pan */
.tshirt-canvas {
  width: 600px;
  height: 600px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  
  /* Critical: transform origin at center */
  transform-origin: center center;
  transition: transform 0.2s ease-out;
  will-change: transform;
}

/* Print area box */
.print-area-box {
  border: 2px dashed #007bff;
  border-radius: 4px;
  background: rgba(0, 123, 255, 0.02);
  position: relative;
  transition: width 0.1s ease, height 0.1s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Print area label */
.print-area-box::before {
  content: 'Print Area';
  position: absolute;
  top: -24px;
  left: 0;
  font-size: 12px;
  color: #007bff;
  font-weight: 500;
}

/* Canvas element */
.print-area-box canvas {
  border: none;
  max-width: 100%;
  max-height: 100%;
}

/* Bottom bar */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 80px;
  right: 0;
  height: 50px;
  background: #ffffff;
  border-top: 1px solid #e5e5e7;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 0 20px 0 12px;
  z-index: 100;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
}
```

### Pan Overlay Styles

```css
/* Pan overlay - space + drag */
.pan-overlay {
  position: fixed;
  inset: 0;
  z-index: 999;
  pointer-events: none;
}

.pan-overlay.active {
  pointer-events: auto;
  cursor: grab;
}

.pan-overlay.panning {
  cursor: grabbing;
}
```

### Zoom Control Styles

```css
/* Zoom controls container */
.zoom-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Zoom buttons */
.zoom-btn {
  width: 32px;
  height: 32px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-size: 18px;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.zoom-btn:hover {
  background: #f5f5f5;
  border-color: #999;
}

.zoom-btn:active {
  transform: scale(0.95);
}

/* Zoom display (percentage) */
.zoom-display {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 2px solid #007bff;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  min-width: 70px;
  justify-content: center;
  transition: all 0.15s;
}

.zoom-display:hover {
  background: #f0f8ff;
  border-color: #0056b3;
}

/* Zoom presets dropdown */
.zoom-presets {
  position: absolute;
  bottom: 100%;
  left: 0;
  margin-bottom: 8px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.zoom-preset-btn {
  padding: 8px 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 13px;
  color: #333;
  text-align: left;
  transition: all 0.15s;
  border-radius: 4px;
}

.zoom-preset-btn:hover {
  background: #e8f4ff;
  color: #007bff;
}

.zoom-preset-btn.active {
  background: #007bff;
  color: white;
  font-weight: 600;
}
```

### Resize Handle Styles

```css
/* Resize handles */
.resize-handle {
  position: absolute;
  background: #007bff;
  z-index: 10;
  transition: background 0.15s;
}

.resize-handle:hover {
  background: #0056b3;
}

/* East handle (right edge) */
.resize-handle-e {
  right: -5px;
  top: 50%;
  transform: translateY(-50%);
  width: 10px;
  height: 40px;
  cursor: ew-resize;
  border-radius: 3px;
}

/* South handle (bottom edge) */
.resize-handle-s {
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 10px;
  cursor: ns-resize;
  border-radius: 3px;
}

/* Southeast handle (corner) */
.resize-handle-se {
  right: -5px;
  bottom: -5px;
  width: 14px;
  height: 14px;
  cursor: nwse-resize;
  border-radius: 2px;
}

/* Visual indicator lines */
.resize-handle::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 2px;
  height: 60%;
  background: white;
}

.resize-handle-s::after {
  width: 60%;
  height: 2px;
}

.resize-handle-se::after {
  display: none;
}
```

---

## Step-by-Step Recreation Guide

### Phase 1: Setup & Layout

1. **Install Fabric.js**
   ```bash
   npm install fabric
   ```

2. **Create Container Structure**
   - Full viewport container
   - Sidebar (80px fixed)
   - Main content (flexible)
   - Top bar (56px)
   - Canvas area (flexible)
   - Bottom bar (50px)

3. **Add CSS Grid/Flexbox**
   - Use flexbox for main layout
   - Grid for bottom bar sections
   - Ensure no scrollbars with `overflow: hidden`

### Phase 2: Canvas Initialization

4. **Initialize Fabric.js**
   ```javascript
   import { fabric } from 'fabric';
   
   useEffect(() => {
     const canvas = new fabric.Canvas(canvasRef.current, {
       width: 400,
       height: 500,
       backgroundColor: 'transparent',
       selection: true,
       preserveObjectStacking: true,
       enableRetinaScaling: true
     });
     
     setFabricCanvas(canvas);
     
     return () => canvas.dispose();
   }, []);
   ```

5. **Create Transform Wrapper**
   ```jsx
   <div 
     className="tshirt-canvas"
     style={{
       transform: `translate(${panOffsetX}px, ${panOffsetY}px) scale(${canvasScale})`
     }}
   >
   ```

### Phase 3: Zoom Implementation

6. **Add Zoom State**
   - `canvasScale` (0.1 to 4.0)
   - `zoomLevel` (10% to 400%)

7. **Create Zoom Buttons**
   - Zoom In (+10%)
   - Zoom Out (-10%)
   - Reset/Fit (100%)
   - Preset buttons

8. **Implement Zoom to Cursor**
   - Calculate mouse position
   - Find canvas point under cursor
   - Apply scale with pan adjustment

9. **Add Keyboard Shortcuts**
   - Ctrl/Cmd + Plus: Zoom in
   - Ctrl/Cmd + Minus: Zoom out
   - Ctrl/Cmd + 0: Reset

### Phase 4: Pan Implementation

10. **Add Pan State**
    - `panOffsetX`, `panOffsetY`
    - `isPanning`, `spaceKeyPressed`
    - Start positions for drag

11. **Implement Space + Drag**
    - Listen for Space key
    - Track mouse down/move/up
    - Calculate deltas

12. **Add Pan Overlay**
    - Transparent full-screen div
    - Activate when Space pressed
    - Show grab/grabbing cursor

13. **Implement Wheel Pan**
    - Plain scroll: vertical pan
    - Shift + scroll: horizontal pan
    - Trackpad: both directions

### Phase 5: Canvas Sizing

14. **Define Presets**
    - Create preset array
    - Add selection UI

15. **Implement Resize Handles**
    - Three handles: E, S, SE
    - Track resize start
    - Calculate new dimensions
    - Update Fabric canvas

### Phase 6: Polish & Optimization

16. **Add Transitions**
    - Smooth zoom animation
    - Smooth pan for presets

17. **Throttle Events**
    - Use requestAnimationFrame for wheel
    - Debounce resize updates

18. **Test Edge Cases**
    - Min/max zoom limits
    - Canvas boundary checks
    - Multi-touch gestures

---

## React Example Implementation

### Complete React Hook

```jsx
import React, { useState, useRef, useEffect } from 'react';
import { fabric } from 'fabric';

function useCanvasControls() {
  // Zoom state
  const [canvasScale, setCanvasScale] = useState(1.0);
  const [zoomLevel, setZoomLevel] = useState(100);
  
  // Pan state
  const [panOffsetX, setPanOffsetX] = useState(0);
  const [panOffsetY, setPanOffsetY] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const [spaceKeyPressed, setSpaceKeyPressed] = useState(false);
  
  // Pan drag state
  const panStartX = useRef(0);
  const panStartY = useRef(0);
  const panStartOffsetX = useRef(0);
  const panStartOffsetY = useRef(0);
  
  // Canvas dimensions
  const [canvasWidth, setCanvasWidth] = useState(400);
  const [canvasHeight, setCanvasHeight] = useState(500);
  
  // Fabric canvas
  const [fabricCanvas, setFabricCanvas] = useState(null);
  const canvasRef = useRef(null);
  
  // Wheel throttling
  const wheelUpdateQueued = useRef(false);
  const pendingDeltaX = useRef(0);
  const pendingDeltaY = useRef(0);
  
  // Initialize Fabric canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: canvasWidth,
      height: canvasHeight,
      backgroundColor: 'transparent',
      selection: true,
      preserveObjectStacking: true,
      enableRetinaScaling: true
    });
    
    setFabricCanvas(canvas);
    
    return () => canvas.dispose();
  }, []);
  
  // Update Fabric canvas size when dimensions change
  useEffect(() => {
    if (fabricCanvas) {
      fabricCanvas.setWidth(canvasWidth);
      fabricCanvas.setHeight(canvasHeight);
      fabricCanvas.requestRenderAll();
    }
  }, [canvasWidth, canvasHeight, fabricCanvas]);
  
  // Keyboard event listeners
  useEffect(() => {
    function handleKeyDown(event) {
      // Space key for panning
      if (event.code === 'Space' && !spaceKeyPressed) {
        const target = event.target;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          event.preventDefault();
          setSpaceKeyPressed(true);
        }
      }
      
      // Zoom shortcuts
      if (event.ctrlKey || event.metaKey) {
        switch(event.key) {
          case '+':
          case '=':
            event.preventDefault();
            zoomIn();
            break;
          case '-':
          case '_':
            event.preventDefault();
            zoomOut();
            break;
          case '0':
            event.preventDefault();
            zoomFit();
            break;
        }
      }
    }
    
    function handleKeyUp(event) {
      if (event.code === 'Space') {
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
  }, [spaceKeyPressed, canvasScale, panOffsetX, panOffsetY]);
  
  // Zoom methods
  function updateScale(newScale) {
    const clampedScale = Math.max(0.1, Math.min(4.0, newScale));
    setCanvasScale(clampedScale);
    setZoomLevel(Math.round(clampedScale * 100));
  }
  
  function zoomIn() {
    updateScale(canvasScale + 0.1);
  }
  
  function zoomOut() {
    updateScale(canvasScale - 0.1);
  }
  
  function setPresetZoom(percentage) {
    updateScale(percentage / 100);
  }
  
  function zoomFit() {
    updateScale(1.0);
    setPanOffsetX(0);
    setPanOffsetY(0);
  }
  
  // Pan methods
  function handlePanStart(event) {
    if (!spaceKeyPressed) return;
    
    setIsPanning(true);
    panStartX.current = event.clientX;
    panStartY.current = event.clientY;
    panStartOffsetX.current = panOffsetX;
    panStartOffsetY.current = panOffsetY;
  }
  
  function handlePanMove(event) {
    if (!isPanning) return;
    
    const deltaX = event.clientX - panStartX.current;
    const deltaY = event.clientY - panStartY.current;
    
    setPanOffsetX(panStartOffsetX.current + deltaX);
    setPanOffsetY(panStartOffsetY.current + deltaY);
  }
  
  function handlePanEnd() {
    setIsPanning(false);
  }
  
  // Wheel event handler
  function handleCanvasWheel(event) {
    event.preventDefault();
    event.stopPropagation();
    
    if (event.ctrlKey) {
      handleZoomToPoint(event);
    } else if (event.shiftKey) {
      setPanOffsetX(panOffsetX - event.deltaY);
    } else if (event.altKey) {
      setPanOffsetY(panOffsetY - event.deltaY);
    } else {
      handleTrackpadPan(event);
    }
  }
  
  function handleZoomToPoint(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const mouseX = event.clientX - rect.left - rect.width / 2;
    const mouseY = event.clientY - rect.top - rect.height / 2;
    
    const oldScale = canvasScale;
    let newScale = oldScale * (0.999 ** event.deltaY);
    newScale = Math.max(0.1, Math.min(4.0, newScale));
    
    const canvasPointX = (mouseX - panOffsetX) / oldScale;
    const canvasPointY = (mouseY - panOffsetY) / oldScale;
    
    const panAdjustX = canvasPointX * (newScale - oldScale);
    const panAdjustY = canvasPointY * (newScale - oldScale);
    
    setPanOffsetX(panOffsetX - panAdjustX);
    setPanOffsetY(panOffsetY - panAdjustY);
    updateScale(newScale);
  }
  
  function handleTrackpadPan(event) {
    pendingDeltaX.current += event.deltaX;
    pendingDeltaY.current += event.deltaY;
    
    if (!wheelUpdateQueued.current) {
      wheelUpdateQueued.current = true;
      requestAnimationFrame(() => {
        setPanOffsetX(panOffsetX - pendingDeltaX.current);
        setPanOffsetY(panOffsetY - pendingDeltaY.current);
        pendingDeltaX.current = 0;
        pendingDeltaY.current = 0;
        wheelUpdateQueued.current = false;
      });
    }
  }
  
  return {
    // State
    canvasScale,
    zoomLevel,
    panOffsetX,
    panOffsetY,
    isPanning,
    spaceKeyPressed,
    canvasWidth,
    canvasHeight,
    fabricCanvas,
    canvasRef,
    
    // Zoom methods
    zoomIn,
    zoomOut,
    setPresetZoom,
    zoomFit,
    
    // Pan methods
    handlePanStart,
    handlePanMove,
    handlePanEnd,
    
    // Event handlers
    handleCanvasWheel,
    
    // Setters
    setCanvasWidth,
    setCanvasHeight
  };
}

export default useCanvasControls;
```

### React Component Usage

```jsx
import React from 'react';
import useCanvasControls from './useCanvasControls';
import './CanvasEditor.css';

function CanvasEditor() {
  const {
    canvasScale,
    zoomLevel,
    panOffsetX,
    panOffsetY,
    isPanning,
    spaceKeyPressed,
    canvasWidth,
    canvasHeight,
    canvasRef,
    zoomIn,
    zoomOut,
    setPresetZoom,
    zoomFit,
    handlePanStart,
    handlePanMove,
    handlePanEnd,
    handleCanvasWheel
  } = useCanvasControls();
  
  return (
    <div className="customization-container">
      {/* Left Sidebar */}
      <div className="left-sidebar">
        <button className="back-btn">Back</button>
        <button className="sidebar-btn">Upload</button>
        <button className="sidebar-btn">Add Text</button>
      </div>
      
      {/* Main Content */}
      <div className="main-content">
        {/* Top Bar */}
        <div className="top-bar">
          <div className="top-bar-left">
            <button className="undo-btn">↶</button>
            <button className="redo-btn">↷</button>
          </div>
        </div>
        
        {/* Canvas Area */}
        <div 
          className="canvas-area"
          onWheel={handleCanvasWheel}
        >
          <div 
            className="tshirt-canvas"
            style={{
              transform: `translate(${panOffsetX}px, ${panOffsetY}px) scale(${canvasScale})`
            }}
          >
            <div 
              className="print-area-box"
              style={{
                width: `${canvasWidth}px`,
                height: `${canvasHeight}px`
              }}
            >
              <canvas ref={canvasRef} />
            </div>
          </div>
          
          {/* Pan Overlay */}
          <div 
            className={`pan-overlay ${spaceKeyPressed ? 'active' : ''} ${isPanning ? 'panning' : ''}`}
            onMouseDown={handlePanStart}
            onMouseMove={handlePanMove}
            onMouseUp={handlePanEnd}
            onMouseLeave={handlePanEnd}
          />
        </div>
        
        {/* Bottom Bar */}
        <div className="bottom-bar">
          <div className="bottom-bar-left">
            <div className="zoom-controls">
              <button className="zoom-btn" onClick={zoomOut}>−</button>
              <div className="zoom-display">
                {zoomLevel}%
              </div>
              <button className="zoom-btn" onClick={zoomIn}>+</button>
              <button className="zoom-btn" onClick={zoomFit}>⟲</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CanvasEditor;
```

---

## Tips & Best Practices

### Performance Optimization

1. **Use CSS Transforms**: Much faster than repositioning/resizing
2. **Throttle Wheel Events**: Use requestAnimationFrame
3. **Will-Change Property**: Hint browser for optimization
4. **Avoid Unnecessary Re-renders**: Memoize callbacks and values

### User Experience

1. **Visual Feedback**: Show grab/grabbing cursor during pan
2. **Smooth Transitions**: 200ms ease-out for zoom changes
3. **Keyboard Shortcuts**: Ctrl+Plus/Minus for zoom
4. **Multiple Pan Methods**: Space+drag, wheel, trackpad

### Edge Cases to Handle

1. **Minimum Zoom**: 10% (0.1 scale)
2. **Maximum Zoom**: 400% (4.0 scale)
3. **Canvas Bounds**: Prevent negative dimensions
4. **Input Focus**: Don't capture Space when typing
5. **Touch Devices**: Add touch event handlers

### Debugging Tips

1. **Console Logging**: Track scale and pan values
2. **Visual Indicators**: Show coordinates on screen
3. **Grid Overlay**: Add reference grid to canvas
4. **Transform Origin**: Ensure it's at center

---

## Common Issues & Solutions

### Issue: Zoom is jerky or laggy

**Solution**: Use CSS transforms instead of Fabric's native zoom, and ensure `will-change: transform` is set.

### Issue: Pan doesn't work smoothly

**Solution**: Use requestAnimationFrame to throttle updates, especially for trackpad events.

### Issue: Objects don't scale properly

**Solution**: Apply scale to wrapper div, not the canvas element itself. Fabric canvas stays at actual size.

### Issue: Cursor position wrong after zoom

**Solution**: Implement zoom-to-cursor math correctly. Calculate canvas point before zoom, adjust pan after.

### Issue: Space key triggers page scroll

**Solution**: Call `event.preventDefault()` on Space keydown, but only when not in input fields.

### Issue: Resize handles not visible

**Solution**: Ensure print area mode is set to 'custom' and z-index is high enough.

---

## Advanced Features to Add

1. **Zoom Slider**: Visual slider for precise zoom control
2. **Minimap**: Overview of full canvas with viewport indicator
3. **Fit to Selection**: Zoom to selected objects
4. **Zoom History**: Back/forward through zoom states
5. **Touch Gestures**: Pinch-to-zoom on mobile
6. **Ruler Guides**: Measure dimensions
7. **Grid Snapping**: Align objects to grid
8. **Zoom Animation**: Smooth animated zoom transitions

---

## Framework-Specific Notes

### React
- Use `useRef` for mutable values (pan start positions)
- Use `useState` for UI state (scale, offsets)
- Use `useEffect` for event listeners and cleanup
- Memoize callbacks with `useCallback`

### Vue
- Use `ref()` for reactive state
- Use `computed()` for derived values (zoom percentage)
- Use `onMounted` / `onUnmounted` for lifecycle
- Use `@wheel.prevent` directive for wheel events

### Angular
- Use `signal()` for reactive state
- Use `computed()` for derived values
- Use `@ViewChild` for canvas element reference
- Use `@HostListener` for keyboard events

### Svelte
- Use reactive declarations `$:`
- Use `bind:this` for element references
- Use `onMount` / `onDestroy` for lifecycle
- Use `on:wheel|preventDefault` for events

---

## Testing Checklist

- [ ] Zoom in/out with buttons
- [ ] Zoom with keyboard (Ctrl +/-)
- [ ] Zoom with Ctrl + wheel
- [ ] Zoom to cursor position accurate
- [ ] Pan with Space + drag
- [ ] Pan with trackpad swipe
- [ ] Pan with Shift/Alt + wheel
- [ ] Reset zoom to 100%
- [ ] Preset zoom buttons work
- [ ] Canvas resizes correctly
- [ ] Resize handles work (custom mode)
- [ ] Min/max zoom limits enforced
- [ ] No page scroll during zoom/pan
- [ ] Space key doesn't trigger when typing
- [ ] Undo/redo history works
- [ ] Objects selectable and editable
- [ ] Performance smooth at all zoom levels

---

## Resources

- **Fabric.js Documentation**: http://fabricjs.com/docs/
- **CSS Transforms**: https://developer.mozilla.org/en-US/docs/Web/CSS/transform
- **requestAnimationFrame**: https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
- **Wheel Events**: https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent

---

## License & Credits

This implementation guide is based on the RFM (Ready For Me) customization canvas system. 

Feel free to use this as a reference for your own projects. The architecture and patterns described here are framework-agnostic and can be adapted to any JavaScript framework or vanilla JS.

---

## 11. Drag & Drop, Selection, and Snapping System

### Object Addition & Management

#### Adding Images to Canvas

Images are added via drag-and-drop or file upload with automatic scaling:

```javascript
/**
 * Add image from uploaded file
 * Auto-scales to fit 80% of canvas while maintaining aspect ratio
 */
async function addImageFromFile(file) {
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      addImageFromURL(dataUrl).then(resolve).catch(reject);
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Add image from URL or data URL
 */
async function addImageFromURL(url) {
  return new Promise((resolve, reject) => {
    fabric.Image.fromURL(url, (img) => {
      if (!img || !img.width || !img.height) {
        reject(new Error('Failed to load image'));
        return;
      }

      // Calculate scaling to fit canvas
      const maxWidth = fabricCanvas.width * 0.8;
      const maxHeight = fabricCanvas.height * 0.8;
      const scale = calculateScaleToFit(
        img.width, 
        img.height, 
        maxWidth, 
        maxHeight
      );

      // Configure image with selection controls
      img.set({
        left: fabricCanvas.width / 2,
        top: fabricCanvas.height / 2,
        originX: 'center',
        originY: 'center',
        scaleX: scale,
        scaleY: scale,
        selectable: true,      // Can be selected
        hasControls: true,     // Show resize/rotate handles
        hasBorders: true,      // Show selection border
        lockUniScaling: false  // Allow non-uniform scaling
      });

      // Add to canvas and select
      fabricCanvas.add(img);
      fabricCanvas.setActiveObject(img);
      fabricCanvas.renderAll();
      
      resolve();
    }, {
      crossOrigin: 'anonymous'
    });
  });
}

// Helper function
function calculateScaleToFit(width, height, maxWidth, maxHeight) {
  const widthScale = maxWidth / width;
  const heightScale = maxHeight / height;
  return Math.min(widthScale, heightScale, 1); // Never scale up
}
```

#### Adding Text Elements

```javascript
/**
 * Add simple text to canvas
 */
function addText(text = 'Enter text', style = {}) {
  const defaultStyle = {
    left: 100,
    top: 100,
    fontSize: 40,
    fill: '#000000',
    fontFamily: 'Arial',
    editable: true,        // Double-click to edit
    selectable: true,
    hasControls: true,
    hasBorders: true,
    lockUniScaling: false,
    lockScalingFlip: true, // Prevent flipping
    originX: 'left',
    originY: 'top',
    ...style
  };

  const textObject = new fabric.IText(text, defaultStyle);
  
  // Initialize coordinates
  textObject.setCoords();
  
  fabricCanvas.add(textObject);
  fabricCanvas.setActiveObject(textObject);
  fabricCanvas.renderAll();
  
  // Update coordinates after render
  setTimeout(() => {
    textObject.setCoords();
    fabricCanvas.requestRenderAll();
  }, 50);
}

/**
 * Add pre-designed text template (title + subtitle)
 */
async function addPreDesignedText(template) {
  // Load custom font if needed
  if (template.fontFamily) {
    await loadGoogleFont(template.fontFamily);
  }

  const textObj = new fabric.IText(template.title || 'Text', {
    left: 100,
    top: 100,
    fontSize: template.fontSize || 50,
    fill: template.fill || '#000000',
    fontFamily: template.fontFamily || 'Arial',
    fontWeight: template.fontWeight || 'bold',
    textAlign: template.textAlign || 'center',
    editable: true,
    selectable: true,
    hasControls: true,
    hasBorders: true
  });

  textObj.setCoords();
  fabricCanvas.add(textObj);

  // Add subtitle if exists
  if (template.subtitle) {
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const textHeight = textObj.getScaledHeight();
    const subtitleObj = new fabric.IText(template.subtitle, {
      left: 100,
      top: textObj.top + textHeight + 10,
      fontSize: template.subtitleSize || 24,
      fill: template.fill || '#000000',
      fontFamily: template.fontFamily || 'Arial',
      fontWeight: 'normal',
      editable: true,
      selectable: true,
      hasControls: true,
      hasBorders: true
    });

    subtitleObj.setCoords();
    fabricCanvas.add(subtitleObj);
    
    // Multi-select both objects
    setTimeout(() => {
      const selection = new fabric.ActiveSelection(
        [textObj, subtitleObj], 
        { canvas: fabricCanvas }
      );
      fabricCanvas.setActiveObject(selection);
      fabricCanvas.renderAll();
    }, 100);
  }
}
```

---

### Selection System

#### Selection Event Handling

The system tracks three main selection events:

```javascript
/**
 * Setup event listeners for selection tracking
 */
function setupEventListeners() {
  // Selection created - user clicks on object
  fabricCanvas.on('selection:created', (e) => {
    const obj = e.selected?.[0] || e.target;
    handleSelection(obj);
  });

  // Selection updated - user switches to different object
  fabricCanvas.on('selection:updated', (e) => {
    const obj = e.selected?.[0] || e.target;
    handleSelection(obj);
  });

  // Selection cleared - user clicks empty space
  fabricCanvas.on('selection:cleared', (e) => {
    handleSelection(null);
  });

  // Object modified - after resize, rotate, move
  fabricCanvas.on('object:modified', (e) => {
    if (e.target) {
      e.target.setCoords(); // Update bounding box
    }
    
    const obj = fabricCanvas.getActiveObject();
    if (obj) {
      handleSelection(obj);
    }
  });

  // Mouse down - immediate feedback
  fabricCanvas.on('mouse:down', (e) => {
    if (e.target) {
      e.target.setCoords();
      handleSelection(e.target);
    } else {
      // Empty canvas clicked
      fabricCanvas.discardActiveObject();
      fabricCanvas.renderAll();
      handleSelection(null);
    }
  });
}

/**
 * Handle selection state changes
 */
function handleSelection(obj) {
  // Update selection state
  setHasSelection(!!obj);
  
  // Check if selected object is text
  let isText = false;
  if (obj) {
    if (obj.type === 'activeSelection') {
      // Multi-select - check if any is text
      const objects = obj.getObjects();
      isText = objects.some(o => 
        o.type === 'text' || 
        o.type === 'i-text' || 
        o.type === 'textbox' ||
        o.type === 'IText'
      );
    } else {
      // Single select
      isText = obj.type === 'text' || 
               obj.type === 'i-text' || 
               obj.type === 'textbox' ||
               obj.type === 'IText';
    }
  }
  
  setIsTextSelected(isText);
  
  // Show/hide toolbar based on selection type
  if (isText) {
    showTextToolbar(obj);
  } else if (obj) {
    showGeneralToolbar(obj);
  } else {
    hideAllToolbars();
  }
}
```

#### Selection Frames (Bounding Box)

Fabric.js automatically shows selection frames with these properties:

```javascript
// Object configuration for selection appearance
const objectConfig = {
  // Selection border
  hasBorders: true,              // Show border when selected
  borderColor: '#007bff',        // Border color
  borderScaleFactor: 2,          // Border thickness
  borderDashArray: null,         // Solid line (or [5, 5] for dashed)
  
  // Control handles (corners/edges)
  hasControls: true,             // Show resize/rotate handles
  cornerColor: '#007bff',        // Handle fill color
  cornerStrokeColor: '#ffffff',  // Handle border color
  cornerSize: 12,                // Handle size in pixels
  cornerStyle: 'circle',         // 'circle' or 'rect'
  transparentCorners: false,     // Fill handles with color
  
  // Rotation control
  hasRotatingPoint: true,        // Show rotation handle
  rotatingPointOffset: 40,       // Distance from object
  
  // Selection behavior
  selectable: true,              // Can be selected
  lockMovementX: false,          // Allow horizontal movement
  lockMovementY: false,          // Allow vertical movement
  lockRotation: false,           // Allow rotation
  lockScalingX: false,           // Allow horizontal scaling
  lockScalingY: false,           // Allow vertical scaling
  lockScalingFlip: true,         // Prevent flipping when scaling negative
  lockUniScaling: false          // Allow non-uniform scaling
};
```

**Customizing Selection Appearance:**

```javascript
// Global selection styles
fabric.Object.prototype.set({
  borderColor: '#007bff',
  cornerColor: '#007bff',
  cornerStrokeColor: '#fff',
  cornerSize: 10,
  transparentCorners: false,
  borderScaleFactor: 2
});

// Or per-object
const myObject = new fabric.Rect({
  // ... rect properties
  borderColor: '#ff0066',
  cornerColor: '#ff0066',
  cornerSize: 14
});
```

---

### Contextual Toolbar System

#### Toolbar Visibility Logic

```javascript
/**
 * Show text formatting toolbar when text is selected
 */
function showTextToolbar(obj) {
  // Extract text properties
  let properties = obj;
  
  if (obj.type === 'activeSelection') {
    // Multi-select: get first text object's properties
    const objects = obj.getObjects();
    const firstText = objects.find(o => 
      o.type === 'text' || o.type === 'i-text' || o.type === 'textbox'
    );
    properties = firstText || obj;
  }
  
  // Update toolbar state
  setToolbarVisible(true);
  setSelectedFontFamily(properties.fontFamily || 'Arial');
  setSelectedFontSize(properties.fontSize || 40);
  setSelectedTextColor(properties.fill || '#000000');
  setIsBold(properties.fontWeight === 'bold');
  setIsItalic(properties.fontStyle === 'italic');
  setIsUnderline(properties.underline || false);
  setTextAlignment(properties.textAlign || 'left');
}

/**
 * Show general toolbar for images/shapes
 */
function showGeneralToolbar(obj) {
  setToolbarVisible(true);
  setToolbarType('general');
  
  // Show general controls: opacity, delete, layer order, etc.
  setSelectedOpacity(obj.opacity || 1);
  setSelectedAngle(obj.angle || 0);
}

/**
 * Hide all toolbars when nothing is selected
 */
function hideAllToolbars() {
  setToolbarVisible(false);
  setToolbarType(null);
}
```

#### Toolbar Component Structure

```jsx
function TextToolbar({ visible, properties, onChange }) {
  if (!visible) return null;
  
  return (
    <div className="text-toolbar">
      {/* Font Family */}
      <select 
        value={properties.fontFamily} 
        onChange={(e) => onChange('fontFamily', e.target.value)}
      >
        <option value="Arial">Arial</option>
        <option value="Helvetica">Helvetica</option>
        <option value="Georgia">Georgia</option>
        {/* More fonts... */}
      </select>
      
      {/* Font Size */}
      <div className="font-size-control">
        <button onClick={() => onChange('fontSize', properties.fontSize - 2)}>−</button>
        <input 
          type="number" 
          value={properties.fontSize}
          onChange={(e) => onChange('fontSize', +e.target.value)}
        />
        <button onClick={() => onChange('fontSize', properties.fontSize + 2)}>+</button>
      </div>
      
      {/* Text Formatting */}
      <button 
        className={properties.isBold ? 'active' : ''}
        onClick={() => onChange('fontWeight', properties.isBold ? 'normal' : 'bold')}
      >
        <strong>B</strong>
      </button>
      
      <button 
        className={properties.isItalic ? 'active' : ''}
        onClick={() => onChange('fontStyle', properties.isItalic ? 'normal' : 'italic')}
      >
        <em>I</em>
      </button>
      
      <button 
        className={properties.isUnderline ? 'active' : ''}
        onClick={() => onChange('underline', !properties.isUnderline)}
      >
        <u>U</u>
      </button>
      
      {/* Text Alignment */}
      <div className="text-align-group">
        <button onClick={() => onChange('textAlign', 'left')}>⬅</button>
        <button onClick={() => onChange('textAlign', 'center')}>↔</button>
        <button onClick={() => onChange('textAlign', 'right')}>➡</button>
      </div>
      
      {/* Text Color */}
      <input 
        type="color" 
        value={properties.fill}
        onChange={(e) => onChange('fill', e.target.value)}
      />
      
      {/* Delete */}
      <button 
        className="delete-btn"
        onClick={() => deleteSelected()}
      >
        🗑️
      </button>
    </div>
  );
}
```

#### Applying Toolbar Changes

```javascript
/**
 * Apply text formatting from toolbar
 */
function applyTextFormatting(property, value) {
  const activeObject = fabricCanvas.getActiveObject();
  if (!activeObject) return;
  
  if (activeObject.type === 'activeSelection') {
    // Multi-select: apply to all text objects
    activeObject.getObjects().forEach(obj => {
      if (obj.type === 'text' || obj.type === 'i-text' || obj.type === 'textbox') {
        obj.set(property, value);
      }
    });
  } else {
    // Single object
    activeObject.set(property, value);
  }
  
  fabricCanvas.requestRenderAll();
  
  // Save to history
  saveState();
}

// Usage examples
function setFontFamily(fontFamily) {
  applyTextFormatting('fontFamily', fontFamily);
}

function setFontSize(fontSize) {
  applyTextFormatting('fontSize', fontSize);
}

function toggleBold() {
  const obj = fabricCanvas.getActiveObject();
  const currentWeight = obj.fontWeight === 'bold' ? 'normal' : 'bold';
  applyTextFormatting('fontWeight', currentWeight);
}
```

---

### Alignment Guides & Snapping

#### Smart Snapping System

The system shows visual guides when objects are near alignment and snaps only when very close:

```javascript
/**
 * Setup alignment guides with two-tier system:
 * - Show guides when within 8px
 * - Snap only when within 2px
 */
function setupAlignmentGuides() {
  let alignmentLines = [];
  const showDistance = 8;  // Show guide threshold
  const snapDistance = 2;  // Snap threshold (must be close!)
  const lineColor = '#FF0066';
  const lineWidth = 1;

  // Create dashed line helper
  function createLine(coords) {
    return new fabric.Line(coords, {
      stroke: lineColor,
      strokeWidth: lineWidth,
      selectable: false,
      evented: false,
      strokeDashArray: [5, 5],
      excludeFromExport: true,
      isAlignmentGuide: true
    });
  }

  // Clear all guide lines
  function clearAlignmentLines() {
    alignmentLines.forEach(line => fabricCanvas.remove(line));
    alignmentLines = [];
  }

  // Get canvas center point
  function getCanvasCenter() {
    return {
      x: fabricCanvas.width / 2,
      y: fabricCanvas.height / 2
    };
  }

  // Check alignment during movement
  function checkAlignment(obj) {
    if (!obj || obj.isAlignmentGuide) return;

    clearAlignmentLines();

    const canvasCenter = getCanvasCenter();
    const objCenter = obj.getCenterPoint();
    const objBounds = obj.getBoundingRect();
    
    // Get all other objects (except current and guides)
    const allObjects = fabricCanvas.getObjects().filter(o => 
      o !== obj && o.type !== 'line' && o.visible && !o.isAlignmentGuide
    );

    let snapped = false;

    // ===========================
    // CANVAS CENTER ALIGNMENT
    // ===========================
    
    // Vertical center line
    const verticalCenterDist = Math.abs(objCenter.x - canvasCenter.x);
    if (verticalCenterDist < showDistance) {
      // Snap if very close
      if (verticalCenterDist < snapDistance) {
        obj.set({ left: obj.left + (canvasCenter.x - objCenter.x) });
        obj.setCoords();
        snapped = true;
      }
      // Show guide
      const line = createLine([
        canvasCenter.x, 0, 
        canvasCenter.x, fabricCanvas.height
      ]);
      fabricCanvas.add(line);
      alignmentLines.push(line);
    }

    // Horizontal center line
    const horizontalCenterDist = Math.abs(objCenter.y - canvasCenter.y);
    if (horizontalCenterDist < showDistance) {
      // Snap if very close
      if (horizontalCenterDist < snapDistance) {
        obj.set({ top: obj.top + (canvasCenter.y - objCenter.y) });
        obj.setCoords();
        snapped = true;
      }
      // Show guide
      const line = createLine([
        0, canvasCenter.y, 
        fabricCanvas.width, canvasCenter.y
      ]);
      fabricCanvas.add(line);
      alignmentLines.push(line);
    }

    // ===========================
    // OBJECT-TO-OBJECT ALIGNMENT
    // ===========================
    
    allObjects.forEach(target => {
      const targetCenter = target.getCenterPoint();
      const targetBounds = target.getBoundingRect();

      // VERTICAL CENTER ALIGNMENT (between objects)
      const verticalObjectDist = Math.abs(objCenter.x - targetCenter.x);
      if (verticalObjectDist < showDistance) {
        if (verticalObjectDist < snapDistance) {
          obj.set({ left: obj.left + (targetCenter.x - objCenter.x) });
          obj.setCoords();
          snapped = true;
        }
        const y1 = Math.min(objBounds.top, targetBounds.top);
        const y2 = Math.max(
          objBounds.top + objBounds.height, 
          targetBounds.top + targetBounds.height
        );
        const line = createLine([targetCenter.x, y1, targetCenter.x, y2]);
        fabricCanvas.add(line);
        alignmentLines.push(line);
      }

      // HORIZONTAL CENTER ALIGNMENT (between objects)
      const horizontalObjectDist = Math.abs(objCenter.y - targetCenter.y);
      if (horizontalObjectDist < showDistance) {
        if (horizontalObjectDist < snapDistance) {
          obj.set({ top: obj.top + (targetCenter.y - objCenter.y) });
          obj.setCoords();
          snapped = true;
        }
        const x1 = Math.min(objBounds.left, targetBounds.left);
        const x2 = Math.max(
          objBounds.left + objBounds.width, 
          targetBounds.left + targetBounds.width
        );
        const line = createLine([x1, targetCenter.y, x2, targetCenter.y]);
        fabricCanvas.add(line);
        alignmentLines.push(line);
      }

      // LEFT EDGE ALIGNMENT
      const leftEdgeDist = Math.abs(objBounds.left - targetBounds.left);
      if (leftEdgeDist < showDistance) {
        if (leftEdgeDist < snapDistance) {
          obj.set({ left: obj.left + (targetBounds.left - objBounds.left) });
          obj.setCoords();
          snapped = true;
        }
        const y1 = Math.min(objBounds.top, targetBounds.top);
        const y2 = Math.max(
          objBounds.top + objBounds.height, 
          targetBounds.top + targetBounds.height
        );
        const line = createLine([targetBounds.left, y1, targetBounds.left, y2]);
        fabricCanvas.add(line);
        alignmentLines.push(line);
      }

      // RIGHT EDGE ALIGNMENT
      const objRight = objBounds.left + objBounds.width;
      const targetRight = targetBounds.left + targetBounds.width;
      const rightEdgeDist = Math.abs(objRight - targetRight);
      if (rightEdgeDist < showDistance) {
        if (rightEdgeDist < snapDistance) {
          obj.set({ left: obj.left + (targetRight - objRight) });
          obj.setCoords();
          snapped = true;
        }
        const y1 = Math.min(objBounds.top, targetBounds.top);
        const y2 = Math.max(
          objBounds.top + objBounds.height, 
          targetBounds.top + targetBounds.height
        );
        const line = createLine([targetRight, y1, targetRight, y2]);
        fabricCanvas.add(line);
        alignmentLines.push(line);
      }

      // TOP EDGE ALIGNMENT
      const topEdgeDist = Math.abs(objBounds.top - targetBounds.top);
      if (topEdgeDist < showDistance) {
        if (topEdgeDist < snapDistance) {
          obj.set({ top: obj.top + (targetBounds.top - objBounds.top) });
          obj.setCoords();
          snapped = true;
        }
        const x1 = Math.min(objBounds.left, targetBounds.left);
        const x2 = Math.max(
          objBounds.left + objBounds.width, 
          targetBounds.left + targetBounds.width
        );
        const line = createLine([x1, targetBounds.top, x2, targetBounds.top]);
        fabricCanvas.add(line);
        alignmentLines.push(line);
      }

      // BOTTOM EDGE ALIGNMENT
      const objBottom = objBounds.top + objBounds.height;
      const targetBottom = targetBounds.top + targetBounds.height;
      const bottomEdgeDist = Math.abs(objBottom - targetBottom);
      if (bottomEdgeDist < showDistance) {
        if (bottomEdgeDist < snapDistance) {
          obj.set({ top: obj.top + (targetBottom - objBottom) });
          obj.setCoords();
          snapped = true;
        }
        const x1 = Math.min(objBounds.left, targetBounds.left);
        const x2 = Math.max(
          objBounds.left + objBounds.width, 
          targetBounds.left + targetBounds.width
        );
        const line = createLine([x1, targetBottom, x2, targetBottom]);
        fabricCanvas.add(line);
        alignmentLines.push(line);
      }
    });

    // Render if guides shown or snapping occurred
    if (alignmentLines.length > 0 || snapped) {
      fabricCanvas.renderAll();
    }
  }

  // Attach to object moving event
  fabricCanvas.on('object:moving', (e) => {
    checkAlignment(e.target);
  });

  // Clear guides when movement stops
  fabricCanvas.on('object:modified', () => {
    clearAlignmentLines();
    fabricCanvas.renderAll();
  });

  fabricCanvas.on('selection:cleared', () => {
    clearAlignmentLines();
    fabricCanvas.renderAll();
  });

  fabricCanvas.on('selection:created', () => {
    clearAlignmentLines();
    fabricCanvas.renderAll();
  });
}
```

#### Alignment Types Supported

1. **Canvas Center Alignment**
   - Vertical center line (X-axis)
   - Horizontal center line (Y-axis)

2. **Object-to-Object Alignment**
   - Center-to-center (vertical)
   - Center-to-center (horizontal)
   - Left edge to left edge
   - Right edge to right edge
   - Top edge to top edge
   - Bottom edge to bottom edge

#### Visual Guide Styling

```css
/* Alignment guide lines are created by Fabric, but styled via JS */
.canvas-container {
  position: relative;
}

/* These styles apply to selected objects */
.canvas-free-drawing-mode .lower-canvas {
  cursor: crosshair;
}

/* Customize guide appearance in createLine function */
const guideLineStyle = {
  stroke: '#FF0066',           // Pink/magenta color
  strokeWidth: 1,              // Thin line
  strokeDashArray: [5, 5],     // Dashed pattern
  selectable: false,           // Can't be selected
  evented: false,              // Doesn't respond to events
  excludeFromExport: true      // Don't include in export
};
```

---

### Drag & Drop File Upload

#### HTML Structure

```html
<div class="upload-dropzone"
     onDragOver={handleDragOver}
     onDragLeave={handleDragLeave}
     onDrop={handleDrop}>
  
  <input 
    type="file" 
    id="fileInput"
    accept="image/*"
    onChange={handleFileInput}
    style={{ display: 'none' }}
  />
  
  <div className="dropzone-content">
    <svg className="upload-icon">{/* upload icon */}</svg>
    <p>Drag & drop images here</p>
    <p className="or-text">or</p>
    <button onClick={() => document.getElementById('fileInput').click()}>
      Browse Files
    </button>
  </div>
</div>
```

#### Drag & Drop Handlers

```javascript
/**
 * Handle drag over event
 */
function handleDragOver(e) {
  e.preventDefault();
  e.stopPropagation();
  setIsDragging(true);
}

/**
 * Handle drag leave event
 */
function handleDragLeave(e) {
  e.preventDefault();
  e.stopPropagation();
  setIsDragging(false);
}

/**
 * Handle file drop
 */
function handleDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  setIsDragging(false);
  
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    handleFiles(files);
  }
}

/**
 * Handle file input change
 */
function handleFileInput(e) {
  const files = e.target.files;
  if (files.length > 0) {
    handleFiles(files);
  }
}

/**
 * Process dropped/selected files
 */
async function handleFiles(files) {
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert(`${file.name} is not an image file`);
      continue;
    }
    
    // Validate file size (e.g., 10MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert(`${file.name} is too large. Max size is 10MB`);
      continue;
    }
    
    try {
      await addImageFromFile(file);
      console.log(`✓ Added ${file.name} to canvas`);
    } catch (error) {
      console.error(`Failed to add ${file.name}:`, error);
      alert(`Failed to add ${file.name}: ${error.message}`);
    }
  }
}
```

#### Dropzone Styling

```css
.upload-dropzone {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
}

.upload-dropzone.dragging {
  border-color: #007bff;
  background: #f0f8ff;
}

.upload-dropzone:hover {
  border-color: #007bff;
  background: #fafafa;
}

.dropzone-content {
  pointer-events: none;
}

.upload-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 16px;
  color: #666;
}

.or-text {
  margin: 16px 0;
  color: #999;
  font-size: 14px;
}

.upload-dropzone button {
  pointer-events: auto;
  padding: 10px 24px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.upload-dropzone button:hover {
  background: #0056b3;
}
```

---

### Multi-Object Selection

#### Selecting Multiple Objects

```javascript
// Enable multi-selection in canvas config
const canvas = new fabric.Canvas('canvas', {
  selection: true,  // Enable selection
  selectionBorderColor: '#007bff',
  selectionColor: 'rgba(0, 123, 255, 0.1)',
  selectionLineWidth: 2
});

/**
 * Select all objects (Ctrl+A / Cmd+A)
 */
function selectAll() {
  fabricCanvas.discardActiveObject();
  
  const allObjects = fabricCanvas.getObjects().filter(obj => 
    obj.selectable && !obj.isAlignmentGuide
  );
  
  if (allObjects.length > 0) {
    const selection = new fabric.ActiveSelection(allObjects, {
      canvas: fabricCanvas
    });
    fabricCanvas.setActiveObject(selection);
    fabricCanvas.requestRenderAll();
  }
}

/**
 * Group selected objects (Ctrl+G / Cmd+G)
 */
function groupSelected() {
  const activeObject = fabricCanvas.getActiveObject();
  
  if (!activeObject || activeObject.type !== 'activeSelection') {
    return;
  }
  
  // Convert active selection to permanent group
  const group = activeObject.toGroup();
  fabricCanvas.requestRenderAll();
  
  console.log('✓ Objects grouped');
}

/**
 * Ungroup selected group (Ctrl+Shift+G / Cmd+Shift+G)
 */
function ungroupSelected() {
  const activeObject = fabricCanvas.getActiveObject();
  
  if (!activeObject || activeObject.type !== 'group') {
    return;
  }
  
  // Convert group back to active selection
  activeObject.toActiveSelection();
  fabricCanvas.requestRenderAll();
  
  console.log('✓ Group ungrouped');
}
```

---

### Object Deletion

```javascript
/**
 * Delete selected object(s)
 */
function deleteSelected() {
  const activeObjects = fabricCanvas.getActiveObjects();
  
  if (activeObjects.length === 0) {
    return;
  }
  
  // Remove all selected objects
  activeObjects.forEach(obj => {
    fabricCanvas.remove(obj);
  });
  
  // Clear selection
  fabricCanvas.discardActiveObject();
  fabricCanvas.requestRenderAll();
  
  console.log(`✓ Deleted ${activeObjects.length} object(s)`);
}

// Keyboard shortcut
document.addEventListener('keydown', (e) => {
  if (e.key === 'Delete' || e.key === 'Backspace') {
    // Don't delete if typing in input
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      deleteSelected();
    }
  }
});
```

---

### Complete React Example with All Features

```jsx
import React, { useState, useRef, useEffect } from 'react';
import { fabric } from 'fabric';

function CanvasEditor() {
  const canvasRef = useRef(null);
  const [fabricCanvas, setFabricCanvas] = useState(null);
  const [selectedObject, setSelectedObject] = useState(null);
  const [showTextToolbar, setShowTextToolbar] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 400,
      height: 500,
      backgroundColor: 'transparent',
      selection: true
    });
    
    setupEventListeners(canvas);
    setupAlignmentGuides(canvas);
    
    setFabricCanvas(canvas);
    
    return () => canvas.dispose();
  }, []);
  
  // Event listeners
  function setupEventListeners(canvas) {
    canvas.on('selection:created', (e) => {
      handleSelection(e.selected?.[0] || e.target);
    });
    
    canvas.on('selection:updated', (e) => {
      handleSelection(e.selected?.[0] || e.target);
    });
    
    canvas.on('selection:cleared', () => {
      handleSelection(null);
    });
  }
  
  function handleSelection(obj) {
    setSelectedObject(obj);
    
    if (obj) {
      const isText = obj.type === 'i-text' || obj.type === 'textbox';
      setShowTextToolbar(isText);
    } else {
      setShowTextToolbar(false);
    }
  }
  
  // File handlers
  async function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await addImageFromFile(files[0]);
    }
  }
  
  async function addImageFromFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      fabric.Image.fromURL(e.target.result, (img) => {
        const scale = Math.min(
          (fabricCanvas.width * 0.8) / img.width,
          (fabricCanvas.height * 0.8) / img.height,
          1
        );
        
        img.set({
          left: fabricCanvas.width / 2,
          top: fabricCanvas.height / 2,
          originX: 'center',
          originY: 'center',
          scaleX: scale,
          scaleY: scale
        });
        
        fabricCanvas.add(img);
        fabricCanvas.setActiveObject(img);
        fabricCanvas.renderAll();
      });
    };
    reader.readAsDataURL(file);
  }
  
  function addText() {
    const text = new fabric.IText('Enter text', {
      left: 100,
      top: 100,
      fontSize: 40,
      fill: '#000000',
      fontFamily: 'Arial'
    });
    
    fabricCanvas.add(text);
    fabricCanvas.setActiveObject(text);
    fabricCanvas.renderAll();
  }
  
  return (
    <div className="canvas-editor">
      <div className="toolbar">
        {showTextToolbar && (
          <TextToolbar 
            object={selectedObject}
            onChange={(prop, value) => {
              selectedObject.set(prop, value);
              fabricCanvas.requestRenderAll();
            }}
          />
        )}
      </div>
      
      <div 
        className={`dropzone ${isDragging ? 'dragging' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <canvas ref={canvasRef} />
      </div>
      
      <div className="sidebar">
        <button onClick={addText}>Add Text</button>
        <button onClick={() => document.getElementById('fileInput').click()}>
          Upload Image
        </button>
        <input 
          id="fileInput"
          type="file" 
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => addImageFromFile(e.target.files[0])}
        />
      </div>
    </div>
  );
}
```

---

## Summary: Key Features

### Selection System
- ✅ Click to select objects
- ✅ Multi-select with Ctrl/Cmd+Click or drag selection box
- ✅ Selection frames (bounding boxes) with resize handles
- ✅ Rotation handle for all objects
- ✅ Visual feedback with colored borders

### Toolbars
- ✅ Contextual toolbar appears only when relevant
- ✅ Text toolbar for font, size, color, alignment
- ✅ General toolbar for images/shapes
- ✅ Auto-hide when selection cleared

### Drag & Drop
- ✅ Drag files from desktop onto canvas
- ✅ Visual feedback during drag
- ✅ Multiple file support
- ✅ File type and size validation

### Snapping & Guides
- ✅ Smart two-tier system (show at 8px, snap at 2px)
- ✅ Canvas center alignment
- ✅ Object-to-object alignment
- ✅ Edge and center alignment
- ✅ Visual dashed guide lines
- ✅ Auto-clear guides after movement

### Object Management
- ✅ Add images, text, shapes, patterns
- ✅ Auto-scale images to fit canvas
- ✅ Multi-object selection and manipulation
- ✅ Group/ungroup objects
- ✅ Delete selected objects
- ✅ Layer ordering (bring to front, send to back)

---

**Last Updated**: December 18, 2025
**Version**: 2.0.0
