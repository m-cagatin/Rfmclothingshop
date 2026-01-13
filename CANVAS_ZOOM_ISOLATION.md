# Canvas Zoom Isolation - Quick Guide

## The Question
How does the canvas zoom without affecting panels, navigation bars, and sidebars - especially with trackpad swipe gestures?

## The Answer

### 1. DOM Structure (from customization.html)

```html
<div class="customization-container">
  <!-- Sidebar: NO transform -->
  <div class="sidebar">
    <button class="sidebar-item">Upload</button>
    <button class="sidebar-item">Text</button>
  </div>

  <!-- Main content: NO transform -->
  <div class="main-content">
    
    <!-- Top toolbar: NO transform -->
    <div class="top-bar">
      <div class="toolbar-left">
        <button class="undo-btn">Undo</button>
        <button class="redo-btn">Redo</button>
      </div>
      <div class="text-toolbar">
        <select class="font-selector">Arial</select>
        <input type="number" class="font-size" />
      </div>
    </div>

    <!-- Canvas area: NO transform, but captures wheel events -->
    <div class="canvas-area" (wheel)="handleCanvasWheel($event)">
      
      <!-- ONLY THIS GETS TRANSFORMED -->
      <div 
        class="tshirt-canvas"
        [style.transform]="'translate(' + panOffsetX() + 'px, ' + panOffsetY() + 'px) scale(' + canvasScale() + ')'"
      >
        <div class="print-area-box">
          <canvas id="canvas"></canvas>
        </div>
      </div>

    </div>

    <!-- Bottom bar: NO transform -->
    <div class="bottom-bar">
      <div class="zoom-controls">
        <button (click)="zoomOut()">−</button>
        <span>{{ zoomLevel() }}%</span>
        <button (click)="zoomIn()">+</button>
      </div>
    </div>

  </div>
</div>
```

### 2. CSS (from customization.css)

```css
/* Container: NO transform */
.customization-container {
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

/* Sidebar: NO transform */
.sidebar {
  width: 80px;
  background: #ffffff;
  position: relative;
  z-index: 100;
}

/* Main content: NO transform */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Top toolbar: NO transform */
.top-bar {
  height: 56px;
  background: #ffffff;
  position: relative;
  z-index: 101;
}

/* Canvas area: NO transform */
.canvas-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #f5f5f0;
}

/* ONLY THIS HAS TRANSFORM */
.tshirt-canvas {
  width: 600px;
  height: 600px;
  background: #ffffff;
  border-radius: 8px;
  position: relative;
  transform-origin: center center;
  will-change: transform;
  /* Transform applied inline via Angular binding */
}

/* Bottom bar: NO transform */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 80px;
  height: 50px;
  background: #ffffff;
  z-index: 100;
}
```

### 3. Event Handling (from customization.ts)

```typescript
// State
canvasScale = signal(1.0);
zoomLevel = signal(100);
panOffsetX = signal(0);
panOffsetY = signal(0);

private wheelUpdateQueued = false;
private pendingDeltaX = 0;
private pendingDeltaY = 0;

// Wheel event handler - ONLY on canvas area
handleCanvasWheel(event: WheelEvent): void {
  event.preventDefault();
  event.stopPropagation();

  if (event.ctrlKey) {
    // Zoom with Ctrl (pinch on trackpad)
    this.handleZoomToPoint(event);
  } 
  else {
    // Trackpad swipe (two-finger pan)
    this.handleTrackpadPan(event);
  }
}

// Trackpad two-finger swipe
private handleTrackpadPan(event: WheelEvent): void {
  this.pendingDeltaX += event.deltaX;
  this.pendingDeltaY += event.deltaY;

  if (!this.wheelUpdateQueued) {
    this.wheelUpdateQueued = true;
    
    requestAnimationFrame(() => {
      // Update ONLY canvas pan
      this.panOffsetX.update(x => x - this.pendingDeltaX);
      this.panOffsetY.update(y => y - this.pendingDeltaY);
      
      this.pendingDeltaX = 0;
      this.pendingDeltaY = 0;
      this.wheelUpdateQueued = false;
    });
  }
}

// Zoom buttons
zoomIn(): void {
  const newScale = Math.min(this.canvasScale() + 0.1, 4.0);
  this.canvasScale.set(newScale);
  this.zoomLevel.set(Math.round(newScale * 100));
}

zoomOut(): void {
  const newScale = Math.max(this.canvasScale() - 0.1, 0.1);
  this.canvasScale.set(newScale);
  this.zoomLevel.set(Math.round(newScale * 100));
}
```

### 4. Why It Works

**Transform Scope:**
```typescript
// This binding ONLY affects .tshirt-canvas and its children
[style.transform]="'translate(' + panOffsetX() + 'px, ' + panOffsetY() + 'px) scale(' + canvasScale() + ')'"
```

**Result:**
- `.tshirt-canvas` → Zooms and pans ✓
- `.sidebar` → Stays 100%, fixed position ✓
- `.top-bar` → Stays 100%, fixed position ✓
- `.bottom-bar` → Stays 100%, fixed position ✓

**Event Isolation:**
```typescript
// Only attached to .canvas-area
(wheel)="handleCanvasWheel($event)"

// Inside handler
event.preventDefault();        // Stop page scroll
event.stopPropagation();      // Don't bubble to parents
```

**Result:**
- Trackpad swipe on canvas → Pans canvas ✓
- Trackpad swipe on sidebar → Ignored (no handler) ✓
- Page never scrolls ✓

## Summary
1. **Transform** → Only `.tshirt-canvas` has it
2. **UI** → Siblings of canvas area (unaffected)
3. **Events** → Only canvas area captures wheel events
