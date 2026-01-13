# Phase 2: Zoom System Enhancement - 🔄 IMPLEMENTING

**Status:** 🔄 PLANNING → READY TO IMPLEMENT  
**Estimated Duration:** 4-5 hours  
**Risk Level:** Medium (coordinate translation risk)  
**Dependencies:** Phase 1 ✅

---

## 🎯 Objectives

1. Create dedicated `useCanvasZoomPan` hook to centralize zoom/pan logic
2. Add zoom-to-cursor functionality (zoom where mouse points)
3. Move zoom/pan state from CustomDesignPage to reusable hook
4. Clean up CustomDesignPage component

---

## 🚨 CRITICAL: Post-Implementation Testing Required

After Phase 2 completion, **MUST TEST** before Phase 3:

### Coordinate Verification Tests
- [ ] Click to select object at 100% zoom
- [ ] Click to select object at 200% zoom
- [ ] Click to select object at 400% zoom
- [ ] Drag object at 100% zoom
- [ ] Drag object at 200% zoom
- [ ] Resize object at different zoom levels

**If tests fail:** Implement `getScaledPointer` override (see Fallback Plan below)

---

## 📦 Files to Create

### 1. `src/hooks/useCanvasZoomPan.ts` (NEW)

**Purpose:** Centralize all zoom/pan logic

**Exports:**
```typescript
interface UseCanvasZoomPanReturn {
  // State
  canvasScale: number;
  panOffset: { x: number; y: number };
  isPanning: boolean;
  spaceKeyPressed: boolean;
  
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
  
  // Event handlers
  handleKeyDown: (e: KeyboardEvent) => void;
  handleKeyUp: (e: KeyboardEvent) => void;
  handleWheel: (e: WheelEvent) => void;
}
```

**State Management:**
```typescript
const [canvasScale, setCanvasScale] = useState(0.25);
const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
const [isPanning, setIsPanning] = useState(false);
const [spaceKeyPressed, setSpaceKeyPressed] = useState(false);
const panStartRef = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 });
```

**Zoom Methods:**
```typescript
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
  setCanvasScale(1);
  setPanOffset({ x: 0, y: 0 });
}, []);
```

**Pan Methods:**
```typescript
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
  setPanOffset({
    x: panStartRef.current.offsetX + deltaX,
    y: panStartRef.current.offsetY + deltaY,
  });
}, [isPanning]);

const endPan = useCallback(() => {
  setIsPanning(false);
}, []);
```

**Keyboard Handlers:**
```typescript
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
  
  // Pan mode (Space key)
  if (e.code === 'Space' && !isEditingText) {
    e.preventDefault();
    setSpaceKeyPressed(true);
  }
}, [zoomIn, zoomOut, setZoom]);

const handleKeyUp = useCallback((e: KeyboardEvent) => {
  if (e.code === 'Space') {
    setSpaceKeyPressed(false);
    endPan();
  }
}, [endPan]);
```

**Wheel Handler:**
```typescript
const handleWheel = useCallback((e: WheelEvent) => {
  if (e.ctrlKey || e.metaKey) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setCanvasScale(prev => Math.max(0.25, Math.min(4, prev + delta)));
  }
}, []);
```

---

## 📝 Files to Modify

### 1. `src/pages/CustomDesignPage.tsx`

**Remove from component:**
```typescript
// DELETE these state declarations (lines ~100-105)
const [canvasScale, setCanvasScale] = useState(0.25);
const [panOffsetX, setPanOffsetX] = useState(0);
const [panOffsetY, setPanOffsetY] = useState(0);
const [isPanning, setIsPanning] = useState(false);
const [spaceKeyPressed, setSpaceKeyPressed] = useState(false);
const panStartRef = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 });

// DELETE keyboard event handlers useEffect (lines ~145-199)
```

**Add hook usage:**
```typescript
// ADD at top of component (line ~95)
const {
  canvasScale,
  panOffset,
  isPanning,
  spaceKeyPressed,
  zoomIn,
  zoomOut,
  setZoom,
  zoomToPreset,
  resetView,
  startPan,
  updatePan,
  endPan,
  handleKeyDown,
  handleKeyUp,
  handleWheel,
} = useCanvasZoomPan();

// ADD useEffect for keyboard listeners
useEffect(() => {
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
  return () => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
  };
}, [handleKeyDown, handleKeyUp]);
```

**Update transform wrapper:**
```typescript
// CHANGE (line ~1600)
// FROM:
style={{
  transform: `translate(${panOffsetX}px, ${panOffsetY}px) scale(${canvasScale})`,
  transformOrigin: 'center center',
}}

// TO:
style={{
  transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${canvasScale})`,
  transformOrigin: 'center center',
}}
```

**Update pan overlay:**
```typescript
// CHANGE (lines ~1606-1620)
<div
  className={`pan-overlay ${isPanning ? 'grabbing' : 'grab'}`}
  onMouseDown={(e) => startPan(e.clientX, e.clientY)}
  onMouseMove={(e) => updatePan(e.clientX, e.clientY)}
  onMouseUp={endPan}
  onMouseLeave={endPan}
/>
```

**Update zoom controls:**
```typescript
// CHANGE bottom bar buttons (lines ~1690-1710)
<Button onClick={zoomOut}>-</Button>
<span>{Math.round(canvasScale * 100)}%</span>
<Button onClick={zoomIn}>+</Button>
<Button onClick={resetView}>Reset</Button>

<select
  value={Math.round(canvasScale * 100)}
  onChange={(e) => zoomToPreset(Number(e.target.value))}
>
  <option value={25}>25%</option>
  <option value={50}>50%</option>
  {/* ... */}
</select>
```

**Update wheel handler:**
```typescript
// CHANGE canvas area onWheel (line ~1585)
onWheel={(e) => {
  handleWheel(e.nativeEvent);
}}
```

---

## 🔄 Refactoring Benefits

### Before (Phase 1):
- 120+ lines of zoom/pan logic in CustomDesignPage
- State management scattered
- Event handlers inline
- Hard to reuse

### After (Phase 2):
- ~50 lines in CustomDesignPage (hook usage only)
- Centralized state in hook
- Clean separation of concerns
- Reusable in other components

---

## 🧪 Testing Checklist

### Basic Functionality
- [ ] Zoom in/out buttons work
- [ ] Keyboard shortcuts work (Ctrl+/-/0)
- [ ] Zoom presets dropdown works
- [ ] Ctrl+Wheel zooms
- [ ] Space+drag pans
- [ ] Pan overlay appears/disappears

### Coordinate Tests (CRITICAL)
- [ ] Click to select text at 100% → Works
- [ ] Click to select text at 200% → Works
- [ ] Click to select text at 400% → Works
- [ ] Drag text at 200% → Position correct
- [ ] Resize text at 200% → Size correct
- [ ] Transform handles align properly

### Edge Cases
- [ ] Space key doesn't pan while editing text
- [ ] Zoom respects min (25%) and max (400%)
- [ ] Pan works after zoom changes
- [ ] Reset view restores to 100% and center

---

## 🚨 Fallback Plan: If Coordinate Tests Fail

If object selection/dragging breaks at zoom levels, implement this fix:

### Add to `useFabricCanvas.ts`:

```typescript
useEffect(() => {
  if (!canvas) return;
  
  // Override Fabric's pointer position calculation
  const originalGetPointer = canvas.getPointer.bind(canvas);
  
  canvas.getPointer = function(e: any, ignoreZoom?: boolean) {
    const pointer = originalGetPointer(e, ignoreZoom);
    
    // Get CSS transform values from wrapper
    const wrapper = document.querySelector('.canvas-transform-wrapper') as HTMLElement;
    if (!wrapper) return pointer;
    
    const transform = window.getComputedStyle(wrapper).transform;
    if (transform === 'none') return pointer;
    
    // Parse transform matrix
    const matrix = transform.match(/matrix\\((.+)\\)/);
    if (!matrix) return pointer;
    
    const values = matrix[1].split(', ');
    const scale = parseFloat(values[0]);
    const translateX = parseFloat(values[4]);
    const translateY = parseFloat(values[5]);
    
    // Adjust pointer coordinates
    return {
      x: (pointer.x - translateX) / scale,
      y: (pointer.y - translateY) / scale,
    };
  };
}, [canvas]);
```

---

## 📊 Estimated Timeline

| Task | Duration | Notes |
|------|----------|-------|
| Create useCanvasZoomPan hook | 1.5 hours | State + methods |
| Refactor CustomDesignPage | 1 hour | Remove old code, add hook |
| Update event handlers | 0.5 hours | Wire up new methods |
| Testing | 1-2 hours | Basic + coordinate tests |
| Fix issues (if any) | 0-1 hour | Coordinate override if needed |
| **Total** | **4-5 hours** | |

---

## ✅ Success Criteria

- [ ] Hook created and exports all required methods
- [ ] CustomDesignPage uses hook (state removed)
- [ ] All zoom controls work
- [ ] All pan controls work
- [ ] Coordinate tests pass
- [ ] No TypeScript errors
- [ ] Code is cleaner and more maintainable

---

## 🚀 Next Steps After Completion

1. ✅ Complete coordinate verification tests
2. ✅ Document any issues in `PHASE_2_IMPLEMENTED.md`
3. 🔄 Create `PHASE_3_IMPLEMENTING.md` (Pan System)
4. ➡️ Proceed to Phase 3

---

**Ready to implement?** Say "go" to start Phase 2 implementation.
