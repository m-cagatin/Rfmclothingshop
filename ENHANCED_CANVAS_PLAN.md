# Enhanced Canvas Implementation Plan

## 🎯 Goals

### New Features to Add:
1. ✨ **Click & Drag Pan** - Like Figma/Google Maps (no Space key needed)
2. ✨ **Pan Boundaries** - Prevent design area from going out of reach
3. ✨ **Complete Reset** - Reset button resets both zoom AND pan to center
4. 🔧 **Fix Trackpad Zoom** - Make trackpad gestures work properly

### Features to Keep:
- ✅ Current zoom controls (buttons, dropdown, keyboard shortcuts)
- ✅ Space + drag pan (as alternative to click & drag)
- ✅ Ctrl/Cmd + wheel zoom
- ✅ UI stays fixed (toolbars, panels, sidebars)
- ✅ Default 25% zoom

---

## 📋 Implementation Strategy

### Phase 1: Fix Trackpad Zoom (Based on CANVAS_ZOOM_ISOLATION.md)

**Problem Identified:**
- Document-level wheel listener with `capture: true` interfering with canvas handler
- Missing `stopPropagation()` in canvas handler
- No RAF batching for smooth updates

**Solution:**
```typescript
// Remove document-level wheel listener completely
// Keep ONLY canvas-area wheel handler

handleWheel(event: WheelEvent): void {
  event.preventDefault();
  event.stopPropagation(); // Add this back!
  
  if (event.ctrlKey || event.metaKey) {
    // Trackpad pinch = zoom
    requestAnimationFrame(() => {
      const delta = event.deltaY > 0 ? -0.1 : 0.1;
      setCanvasScale(prev => Math.max(0.25, Math.min(4, prev + delta)));
    });
  }
}
```

**Files to Modify:**
- `src/pages/CustomDesignPage.tsx` - Remove document-level listener
- `src/hooks/useCanvasZoomPan.ts` - Add stopPropagation + RAF batching

---

### Phase 2: Click & Drag Pan (Figma-style)

**Current Behavior:**
- Pan only works with Space + drag

**New Behavior:**
- Click & drag anywhere on canvas area (outside design box) = pan
- Click & drag on design box/objects = select/move objects (Fabric.js default)
- Space + drag = pan (keep as override)

**Implementation:**
```typescript
const handleCanvasAreaMouseDown = (e: React.MouseEvent) => {
  const target = e.target as HTMLElement;
  
  // Check if click is on canvas-area background (not on canvas itself)
  if (target.classList.contains('canvas-area-container') || 
      target.classList.contains('canvas-transform-wrapper')) {
    // Start panning
    setIsPanningCanvas(true);
    setPanStart({ x: e.clientX, y: e.clientY });
  }
};

const handleMouseMove = (e: React.MouseEvent) => {
  if (isPanningCanvas || spaceKeyPressed) {
    const deltaX = e.clientX - panStart.x;
    const deltaY = e.clientY - panStart.y;
    
    // Apply boundaries check here
    setPanOffset(applyBoundaries(deltaX, deltaY));
  }
};
```

**Files to Modify:**
- `src/hooks/useCanvasZoomPan.ts` - Add click & drag pan logic
- `src/pages/CustomDesignPage.tsx` - Add mouse event handlers to canvas area

---

### Phase 3: Pan Boundaries (Keep Design Area Reachable)

**Goal:**
- Design area can pan but never goes completely off-screen
- User can always see and reach the design area
- Boundaries adjust based on zoom level

**Boundary Logic:**
```typescript
// Calculate boundaries based on:
// 1. Canvas area viewport size
// 2. Design area size
// 3. Current zoom level

const calculateBoundaries = () => {
  const canvasAreaWidth = 1200; // Get from ref
  const canvasAreaHeight = 800;
  
  const designWidth = 240 * (DEFAULT_ZOOM / 100) * canvasScale;
  const designHeight = 280 * (DEFAULT_ZOOM / 100) * canvasScale;
  
  // Allow design area to go to edges but not beyond
  const maxPanX = (canvasAreaWidth - designWidth) / 2 + MARGIN;
  const maxPanY = (canvasAreaHeight - designHeight) / 2 + MARGIN;
  const minPanX = -(canvasAreaWidth - designWidth) / 2 - MARGIN;
  const minPanY = -(canvasAreaHeight - designHeight) / 2 - MARGIN;
  
  return { maxPanX, maxPanY, minPanX, minPanY };
};

const applyBoundaries = (x: number, y: number) => {
  const bounds = calculateBoundaries();
  return {
    x: Math.max(bounds.minPanX, Math.min(bounds.maxPanX, x)),
    y: Math.max(bounds.minPanY, Math.min(bounds.maxPanY, y))
  };
};
```

**Visual Example:**
```
┌─────────────────────────────────────┐
│     Canvas Area Viewport            │
│                                     │
│   ┌─────────────────┐              │
│   │                 │              │
│   │  Design Area    │ ← Can move   │
│   │  (within bounds)│   but stays  │
│   │                 │   reachable  │
│   └─────────────────┘              │
│                                     │
└─────────────────────────────────────┘
```

**Files to Modify:**
- `src/hooks/useCanvasZoomPan.ts` - Add boundary calculation and enforcement
- Need canvas area ref to get viewport dimensions

---

### Phase 4: Complete Reset View

**Current Behavior:**
- Reset button only resets zoom to 25%

**New Behavior:**
```typescript
const resetView = () => {
  // Reset zoom
  setCanvasScale(0.25);
  
  // Reset pan to center (0, 0)
  setPanOffset({ x: 0, y: 0 });
  
  // Optional: Smooth animation
  // Use transition CSS class for smooth reset
};
```

**Files to Modify:**
- `src/hooks/useCanvasZoomPan.ts` - Update resetView function
- `src/styles/canvasEditor.css` - Optional: Add transition for smooth reset

---

## 🔧 Technical Details

### Event Handling Flow

```typescript
Canvas Area Events:
├─ onWheel (Ctrl+wheel or trackpad pinch)
│  ├─ preventDefault()
│  ├─ stopPropagation()
│  └─ requestAnimationFrame(() => zoom)
│
├─ onMouseDown (click & drag start)
│  ├─ Check if on canvas background (not objects)
│  ├─ Set isPanningCanvas = true
│  └─ Record start position
│
├─ onMouseMove (dragging)
│  ├─ If isPanningCanvas or spaceKeyPressed
│  ├─ Calculate delta
│  ├─ Apply boundaries
│  └─ Update panOffset
│
└─ onMouseUp (drag end)
   └─ Set isPanningCanvas = false
```

### State Management

```typescript
// In useCanvasZoomPan hook:
const [canvasScale, setCanvasScale] = useState(0.25);
const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
const [isPanningCanvas, setIsPanningCanvas] = useState(false); // NEW
const [panStart, setPanStart] = useState({ x: 0, y: 0 }); // NEW
const [spaceKeyPressed, setSpaceKeyPressed] = useState(false);
```

### Boundary Constants

```typescript
const PAN_BOUNDARIES = {
  MARGIN: 50, // Minimum visible pixels of design area
  MIN_ZOOM: 0.25,
  MAX_ZOOM: 4.0,
};
```

---

## 📁 Files to Modify

### 1. `src/hooks/useCanvasZoomPan.ts`
- ✅ Add `stopPropagation()` back to handleWheel
- ✅ Add RAF batching for smooth updates
- ✅ Add click & drag pan state and handlers
- ✅ Add boundary calculation logic
- ✅ Update resetView to reset pan position
- ✅ Export new handlers: `handleMouseDown`, `handleMouseMove`, `handleMouseUp`

### 2. `src/pages/CustomDesignPage.tsx`
- ✅ Remove document-level wheel event listener
- ✅ Add mouse event handlers to canvas area
- ✅ Add ref to canvas area for dimension calculations
- ✅ Update cursor styles (grab/grabbing)

### 3. `src/styles/canvasEditor.css`
- ✅ Add cursor styles for click & drag
- ✅ Optional: Add transition for smooth reset animation

### 4. Keep Unchanged:
- ✅ `index.html` - Viewport restrictions stay
- ✅ `src/index.css` - Touch-action stays
- ✅ Zoom controls UI
- ✅ Keyboard shortcuts
- ✅ Space + drag functionality

---

## 🎨 User Experience

### Panning Modes:

**Mode 1: Click & Drag (NEW)**
- Click anywhere on gray canvas background
- Drag to pan
- Cursor: grab → grabbing

**Mode 2: Space + Drag (EXISTING)**
- Hold Space key
- Click & drag anywhere
- Cursor: grab → grabbing
- Overrides object selection

### Zoom Controls (KEEP ALL):
1. Ctrl/Cmd + Mouse Wheel
2. Trackpad pinch gestures (WILL BE FIXED)
3. Zoom In/Out buttons
4. Zoom dropdown (presets)
5. Keyboard shortcuts (Ctrl + / -)
6. Reset View button (will also center pan)

### Boundaries:
- Design area can move freely within viewport
- Always keeps at least 50px visible
- Smooth boundary clamping (no jarring stops)
- Boundaries adjust with zoom level

---

## ✅ Testing Checklist

After implementation:

### Trackpad Zoom:
- [ ] Trackpad pinch zooms canvas only
- [ ] Trackpad pinch doesn't affect UI elements
- [ ] Zoom is smooth (no jank)

### Click & Drag Pan:
- [ ] Click on gray background = pan
- [ ] Click on design area/objects = select/move (Fabric default)
- [ ] Space + drag still works everywhere
- [ ] Cursor changes correctly

### Boundaries:
- [ ] Design area never goes completely off-screen
- [ ] Can't pan beyond boundaries
- [ ] Boundaries work at all zoom levels
- [ ] No jarring stops at boundaries

### Reset View:
- [ ] Resets zoom to 25%
- [ ] Resets pan to center (0, 0)
- [ ] Smooth transition (optional)

### Existing Features:
- [ ] All zoom controls still work
- [ ] Keyboard shortcuts work
- [ ] UI elements stay fixed
- [ ] Other pages can scroll normally
- [ ] No TypeScript errors

---

## 🚀 Implementation Order

1. **Fix Trackpad Zoom** (30 min)
   - Remove document listener
   - Add stopPropagation + RAF
   - Test trackpad gestures

2. **Add Click & Drag Pan** (45 min)
   - Add mouse handlers
   - Update cursor styles
   - Test click vs drag detection

3. **Implement Boundaries** (1 hour)
   - Calculate boundary limits
   - Enforce in pan updates
   - Test at different zoom levels

4. **Update Reset View** (15 min)
   - Add pan reset to function
   - Optional: Add smooth transition

5. **Testing & Polish** (30 min)
   - Test all interactions
   - Fix edge cases
   - Verify existing features

**Total Estimated Time:** 3 hours

---

## 🎯 Success Criteria

✅ Trackpad gestures zoom canvas only, not page
✅ Click & drag anywhere on canvas background to pan
✅ Design area always stays reachable (boundaries)
✅ Reset view centers and resets zoom
✅ All existing features continue working
✅ Smooth, polished user experience
