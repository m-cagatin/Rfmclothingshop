import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { 
  ArrowLeft,
  ArrowRight,
  Info,
  X,
  MousePointer2,
  Square,
  Circle,
  Type,
  Image as ImageIcon,
  Layers,
  FolderOpen,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  ChevronsDown,
  ChevronsUp,
  Maximize,
  Upload,
  Grid3x3,
  Check,
  Package,
  Undo,
  Redo,
  Save,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignVerticalJustifyCenter,
  AlignHorizontalJustifyCenter,
  AlignVerticalSpaceAround,
  AlignHorizontalSpaceAround,
  Lock,
  Unlock
} from 'lucide-react';
import whiteTshirtFront from '../assets/787e6b4140e96e95ccf202de719b1da6a8bed3e6.png';
import whiteTshirtBack from '../assets/7b9c6122bea5ee4b12601772b07cf4c23c8f6092.png';
import { useFabricCanvas } from '../hooks/useFabricCanvas';
import { CanvasProvider } from '../contexts/CanvasContext';
import { useImageUpload } from '../hooks/useImageUpload';
import { useCanvasResources } from '../hooks/useCanvasResources';
import { useCanvasZoomPan } from '../hooks/useCanvasZoomPan';
import { useCustomizableProducts } from '../hooks/useCustomizableProducts';
import { PropertiesPanel } from '../components/customizer/PropertiesPanel';
import { AlertCircle } from 'lucide-react';
import { PRINT_AREA_PRESETS, PrintAreaPreset, DEFAULT_ZOOM } from '../utils/fabricHelpers';
import '../styles/canvasEditor.css';

type ViewSide = 'front' | 'back';

interface ClothingProduct {
  id: string;
  name: string;
  color: string;
  sizes: string[];
  image: string;
  noPrint: boolean;
  frontPrint: boolean;
  backPrint: boolean;
  category: string;
  subcategory: string;
  // New fields from database
  fitType?: string;
  fitDescription?: string;
  colorHex?: string;
  variantName?: string;
  differentiationType?: string;
  retailPrice?: number;
  frontPrintCost?: number;
  backPrintCost?: number;
}

interface LayerItem {
  id: string;
  productName: string;
  color: string;
  size: string;
  image: string;
  variants: {
    view: ViewSide;
    design: string;
  }[];
}

// Category-specific clothing images - Using uploaded white t-shirt mockups
const categoryImages: Record<string, { front: string; back: string }> = {
  'T-Shirt': {
    front: whiteTshirtFront,
    back: whiteTshirtBack,
  },
  'Jacket': {
    front: whiteTshirtFront,
    back: whiteTshirtBack,
  },
  'Hoodie': {
    front: whiteTshirtFront,
    back: whiteTshirtBack,
  },
  'Shirt': {
    front: whiteTshirtFront,
    back: whiteTshirtBack,
  },
  'Kids': {
    front: whiteTshirtFront,
    back: whiteTshirtBack,
  },
};

export function CustomDesignPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  
  // Canvas zoom/pan hook (Phase 2)
  const {
    canvasScale,
    panOffset,
    isPanning,
    spaceKeyPressed,
    isPanningCanvas,
    isSpacePanning,
    zoomIn,
    zoomOut,
    setZoom: setCanvasZoom,
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
  } = useCanvasZoomPan();
  const [printAreaSize, setPrintAreaSize] = useState<PrintAreaPreset>('Letter');
  const [activeTab, setActiveTab] = useState('edit');
  const [activeTool, setActiveTool] = useState<string | null>(null);
  
  // Loading flag to prevent auto-save during design load
  const isLoadingDesignRef = useRef(false);
  
  const [isClothingPanelOpen, setIsClothingPanelOpen] = useState(false);
  const [isVariantDetailsPanelOpen, setIsVariantDetailsPanelOpen] = useState(false);
  const [isUploadPanelOpen, setIsUploadPanelOpen] = useState(false);
  const [isTextPanelOpen, setIsTextPanelOpen] = useState(false);
  const [isLibraryPanelOpen, setIsLibraryPanelOpen] = useState(false);
  const [isGraphicsPanelOpen, setIsGraphicsPanelOpen] = useState(false);
  const [isPatternsPanelOpen, setIsPatternsPanelOpen] = useState(false);
  const [isPropertiesPanelOpen, setIsPropertiesPanelOpen] = useState(false);
  const [expandedLayerIds, setExpandedLayerIds] = useState<Set<any>>(new Set());
  const [expandedPricingIds, setExpandedPricingIds] = useState<Set<string>>(new Set());
  
  // Collapsible states for Variant Details panel
  const [isProductionCostOpen, setIsProductionCostOpen] = useState(false);
  const [isPrintAreaOpen, setIsPrintAreaOpen] = useState(true);
  
  // Active variant tracking (single variant only) - restore from localStorage on mount
  const [activeVariant, setActiveVariant] = useState<{
    id: string;
    productId: string;
    productName: string;
    variantName: string;
    size: string;
    printOption: 'none' | 'front' | 'back';
    image: string;
    retailPrice: number;
    totalPrice: number;
  } | null>(() => {
    try {
      const saved = localStorage.getItem('activeVariant');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Track size and print selections for current product
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedPrintOption, setSelectedPrintOption] = useState<'none' | 'front' | 'back'>('none');
  
  // History management for undo/redo
  const [historyStack, setHistoryStack] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const historyTimeoutRef = useRef<number | null>(null);
  
  // Unified design status for both save and load
  const [designStatus, setDesignStatus] = useState<{
    type: 'idle' | 'loading' | 'loaded' | 'saving' | 'saved' | 'save-error' | 'load-error';
    message?: string;
  }>({ type: 'idle' });
  
  const saveTimeoutRef = useRef<number | null>(null);
  const localStorageIntervalRef = useRef<number | null>(null);
  
  // Grid and snap settings
  const [showGrid, setShowGrid] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [gridSize, setGridSize] = useState(20); // Default 20px grid
  
  const [productName, setProductName] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [selectedView, setSelectedView] = useState<ViewSide>('front');
  const [layers, setLayers] = useState<LayerItem[]>([]);
  
  // Image upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadImage, validateImage, isUploading, error: uploadError } = useImageUpload();
  const [validationWarning, setValidationWarning] = useState<string | null>(null);
  
  // Text tool state
  const [textContent, setTextContent] = useState('');
  const [selectedFont, setSelectedFont] = useState('Arial');
  const [selectedTextSize, setSelectedTextSize] = useState<'Small' | 'Medium' | 'Large' | 'X-Large'>('Medium');
  const [selectedColor, setSelectedColor] = useState('#000000');
  
  // Recent uploads state
  const [recentUploads, setRecentUploads] = useState<Array<{ url: string; width: number; height: number; publicId: string; timestamp: number }>>([]);
  
  // Canvas resources hook
  const { graphics, patterns, fetchGraphics } = useCanvasResources();
  const [selectedGraphicCategory, setSelectedGraphicCategory] = useState<'all' | 'icon' | 'logo' | 'illustration' | 'template'>('all');
  
  // Calculate canvas dimensions based on print area preset
  const canvasWidth = Math.round(PRINT_AREA_PRESETS[printAreaSize].width * (DEFAULT_ZOOM / 100));
  const canvasHeight = Math.round(PRINT_AREA_PRESETS[printAreaSize].height * (DEFAULT_ZOOM / 100));

  // Initialize Fabric.js canvas
  const fabricCanvas = useFabricCanvas('design-canvas', {
    canvasWidth,
    canvasHeight,
    onObjectAdded: (obj) => {
      console.log('Object added:', obj);
    },
    onObjectRemoved: (obj) => {
      console.log('Object removed:', obj);
    },
    onSelectionCreated: (obj) => {
      console.log('Object selected:', obj);
    },
  });

  // NEW: Helper function to check if variant is active
  const isVariantActive = () => {
    return activeVariant !== null;
  };

  // NEW: Show warning when user tries to add object without selecting variant
  const showVariantRequiredWarning = () => {
    // Show alert
    alert('⚠️ Please select a clothing variant first to start customizing');
    
    // Auto-open Clothing Variants panel
    setIsClothingPanelOpen(true);
    
    // Close other panels
    setIsUploadPanelOpen(false);
    setIsTextPanelOpen(false);
    setIsLibraryPanelOpen(false);
    setIsGraphicsPanelOpen(false);
    setIsPatternsPanelOpen(false);
    
    // Trigger glow animation
    const clothingBtn = document.querySelector('[data-clothing-variants-btn]');
    if (clothingBtn) {
      clothingBtn.classList.add('glow-pulse');
      setTimeout(() => clothingBtn.classList.remove('glow-pulse'), 3000);
    }
  };

  // Undo/Redo Handlers
  const captureCanvasState = useCallback(() => {
    if (!fabricCanvas.canvasRef) return;
    
    // Clear existing timeout
    if (historyTimeoutRef.current) {
      clearTimeout(historyTimeoutRef.current);
    }
    
    // Debounce: capture state after 300ms of no changes
    historyTimeoutRef.current = window.setTimeout(() => {
      const canvasJSON = JSON.stringify(fabricCanvas.canvasRef!.toJSON());
      
      setHistoryStack(prev => {
        // Remove any "future" states if we're in the middle of history
        const newStack = historyIndex >= 0 ? prev.slice(0, historyIndex + 1) : [];
        
        // Add new state
        newStack.push(canvasJSON);
        
        // Limit to 50 states
        if (newStack.length > 50) {
          newStack.shift();
          return newStack;
        }
        
        return newStack;
      });
      
      // Update index to point to latest state
      setHistoryIndex(prev => {
        const newIndex = prev + 1;
        return newIndex > 49 ? 49 : newIndex;
      });
    }, 300);
  }, [fabricCanvas.canvasRef, historyIndex]);

  const handleUndo = useCallback(() => {
    if (historyIndex <= 0 || !fabricCanvas.canvasRef) return;
    
    const newIndex = historyIndex - 1;
    const prevState = historyStack[newIndex];
    
    if (prevState) {
      fabricCanvas.canvasRef.loadFromJSON(prevState, () => {
        fabricCanvas.canvasRef!.renderAll();
        fabricCanvas.updateCanvasObjects?.();
        setHistoryIndex(newIndex);
      });
    }
  }, [historyIndex, historyStack, fabricCanvas]);

  const handleRedo = useCallback(() => {
    if (historyIndex >= historyStack.length - 1 || !fabricCanvas.canvasRef) return;
    
    const newIndex = historyIndex + 1;
    const nextState = historyStack[newIndex];
    
    if (nextState) {
      fabricCanvas.canvasRef.loadFromJSON(nextState, () => {
        fabricCanvas.canvasRef!.renderAll();
        fabricCanvas.updateCanvasObjects?.();
        setHistoryIndex(newIndex);
      });
    }
  }, [historyIndex, historyStack, fabricCanvas]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z or Cmd+Z = Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      // Ctrl+Y or Cmd+Shift+Z = Redo
      else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Save design to database
  const handleSave = useCallback(async () => {
    if (!fabricCanvas.canvasRef || !activeVariant) {
      console.log('Cannot save: no canvas or active variant');
      return;
    }

    try {
      setDesignStatus({ type: 'saving' });
      
      const canvasData = fabricCanvas.canvasRef.toJSON();
      const view = selectedView;
      
      const response = await fetch('/api/design/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: 1, // TODO: Replace with actual user ID from auth
          customizableProductId: activeVariant.productId,
          selectedSize: activeVariant.size,
          selectedPrintOption: activeVariant.printOption,
          printAreaPreset: printAreaSize,
          frontCanvasJson: view === 'front' ? canvasData : null,
          backCanvasJson: view === 'back' ? canvasData : null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Save failed:', response.status, errorData);
        throw new Error(`Failed to save design: ${errorData.message || response.statusText}`);
      }

      setDesignStatus({ type: 'saved' });
      
    } catch (error) {
      console.error('Save error:', error);
      setDesignStatus({ 
        type: 'save-error',
        message: error instanceof Error ? error.message : 'Could not save your design. Changes are backed up locally.'
      });
    }
  }, [fabricCanvas.canvasRef, activeVariant, selectedView, printAreaSize]);

  // Trigger auto-save with debounce (2 seconds)
  const triggerAutoSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = window.setTimeout(() => {
      handleSave();
    }, 2000);
  }, [handleSave]);

  // Load saved design from database
  const loadUserDesign = useCallback(async () => {
    console.log('loadUserDesign called:', { activeVariant, hasCanvas: !!fabricCanvas.canvasRef });
    
    if (!activeVariant || !fabricCanvas.canvasRef) return;

    // Set loading flag to prevent auto-save during load
    isLoadingDesignRef.current = true;
    setDesignStatus({ type: 'loading' });

    try {
      const userId = 1; // TODO: Replace with actual user ID from auth
      const response = await fetch(`/api/design/load/${activeVariant.productId}?userId=${userId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log('No saved design found in database, checking localStorage...');
          
          // Try to load from localStorage backup
          const backupKey = `design_backup_${activeVariant.variantName}_${selectedView}`;
          const backupData = localStorage.getItem(backupKey);
          
          if (backupData) {
            const canvasData = JSON.parse(backupData);
            fabricCanvas.canvasRef.loadFromJSON(canvasData, () => {
              console.log('JSON loaded, forcing render...');
              
              // Force multiple render cycles to ensure visibility
              fabricCanvas.canvasRef?.renderAll();
              fabricCanvas.updateCanvasObjects?.();
              
              // Use requestAnimationFrame to ensure DOM is ready
              requestAnimationFrame(() => {
                fabricCanvas.canvasRef?.requestRenderAll();
                
                // Double-check with delayed render
                setTimeout(() => {
                  fabricCanvas.canvasRef?.requestRenderAll();
                  console.log('Design restored from localStorage backup');
                  setDesignStatus({ type: 'loaded', message: 'Design restored from backup' });
                }, 100);
              });
              
              setTimeout(() => { isLoadingDesignRef.current = false; }, 500);
            });
          } else {
            // No saved design, just show variant is loaded
            console.log('No saved design, fresh start');
            setDesignStatus({ type: 'loaded', message: 'Variant loaded - Ready to design' });
            isLoadingDesignRef.current = false;
          }
          return;
        }
        throw new Error('Failed to load design');
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Server returned HTML instead of JSON. Is the backend running?');
        throw new Error('Server error - backend may not be running');
      }
      
      const result = await response.json();
      const data = result.data;
      
      // Restore print area preset if saved
      if (data.printAreaPreset) {
        setPrintAreaSize(data.printAreaPreset);
      }
      
      // Load canvas data based on current view
      const canvasData = selectedView === 'front' ? data.frontCanvasJson : data.backCanvasJson;
      
      if (canvasData && fabricCanvas.canvasRef) {
        fabricCanvas.canvasRef.loadFromJSON(canvasData, () => {
          console.log('JSON loaded from database, forcing render...');
          
          // Force multiple render cycles to ensure visibility
          fabricCanvas.canvasRef?.renderAll();
          fabricCanvas.updateCanvasObjects?.();
          
          // Use requestAnimationFrame to ensure DOM is ready
          requestAnimationFrame(() => {
            fabricCanvas.canvasRef?.requestRenderAll();
            
            // Double-check with delayed render
            setTimeout(() => {
              fabricCanvas.canvasRef?.requestRenderAll();
              console.log('Design loaded successfully from database');
              setDesignStatus({ type: 'loaded', message: 'Design loaded successfully' });
            }, 100);
          });
          
          setTimeout(() => { isLoadingDesignRef.current = false; }, 500);
        });
      } else {
        // No canvas data but variant is loaded
        console.log('Variant loaded, no design data yet');
        setDesignStatus({ type: 'loaded', message: 'Variant loaded' });
        isLoadingDesignRef.current = false;
      }
    } catch (error) {
      console.error('Load error:', error);
      
      // Try to load from localStorage backup as last resort
      try {
        const backupKey = `design_backup_${activeVariant.variantName}_${selectedView}`;
        const backupData = localStorage.getItem(backupKey);
        
        if (backupData) {
          const canvasData = JSON.parse(backupData);
          fabricCanvas.canvasRef.loadFromJSON(canvasData, () => {
            console.log('JSON loaded from backup after error, forcing render...');
            
            // Force multiple render cycles to ensure visibility
            fabricCanvas.canvasRef?.renderAll();
            fabricCanvas.updateCanvasObjects?.();
            
            // Use requestAnimationFrame to ensure DOM is ready
            requestAnimationFrame(() => {
              fabricCanvas.canvasRef?.requestRenderAll();
              
              // Double-check with delayed render
              setTimeout(() => {
                fabricCanvas.canvasRef?.requestRenderAll();
                console.log('Design restored from localStorage backup after error');
                setDesignStatus({ type: 'loaded', message: 'Design restored from backup' });
              }, 100);
            });
            
            setTimeout(() => { isLoadingDesignRef.current = false; }, 500);
          });
        } else {
          setDesignStatus({ type: 'load-error', message: 'Failed to load design' });
          isLoadingDesignRef.current = false;
        }
      } catch (backupError) {
        console.error('Failed to restore from backup:', backupError);
        setDesignStatus({ type: 'load-error' });
        isLoadingDesignRef.current = false;
      }
    }
  }, [activeVariant, selectedView, fabricCanvas.canvasRef, setPrintAreaSize]);

  // Alignment functions
  const alignLeft = useCallback(() => {
    if (!fabricCanvas.canvasRef) return;
    const activeObject = fabricCanvas.canvasRef.getActiveObject();
    if (!activeObject) return;

    if (activeObject.type === 'activeSelection') {
      // Multi-selection: align all to leftmost
      const objects = (activeObject as any)._objects;
      const leftmost = Math.min(...objects.map((obj: any) => obj.left - obj.width / 2));
      objects.forEach((obj: any) => {
        obj.set({ left: leftmost + obj.width / 2 });
      });
    } else {
      // Single object: align to canvas left
      activeObject.set({ left: activeObject.width! / 2 });
    }
    
    fabricCanvas.canvasRef.renderAll();
    fabricCanvas.canvasRef.fire('object:modified', { target: activeObject });
  }, [fabricCanvas.canvasRef]);

  const alignCenter = useCallback(() => {
    if (!fabricCanvas.canvasRef) return;
    const activeObject = fabricCanvas.canvasRef.getActiveObject();
    if (!activeObject) return;

    const canvasCenterX = fabricCanvas.canvasRef.width! / 2;
    
    if (activeObject.type === 'activeSelection') {
      // Multi-selection: align all to horizontal center
      const objects = (activeObject as any)._objects;
      objects.forEach((obj: any) => {
        obj.set({ left: canvasCenterX });
      });
    } else {
      // Single object: center on canvas
      activeObject.set({ left: canvasCenterX });
    }
    
    fabricCanvas.canvasRef.renderAll();
    fabricCanvas.canvasRef.fire('object:modified', { target: activeObject });
  }, [fabricCanvas.canvasRef]);

  const alignRight = useCallback(() => {
    if (!fabricCanvas.canvasRef) return;
    const activeObject = fabricCanvas.canvasRef.getActiveObject();
    if (!activeObject) return;

    const canvasRight = fabricCanvas.canvasRef.width!;
    
    if (activeObject.type === 'activeSelection') {
      // Multi-selection: align all to rightmost
      const objects = (activeObject as any)._objects;
      const rightmost = Math.max(...objects.map((obj: any) => obj.left + obj.width / 2));
      objects.forEach((obj: any) => {
        obj.set({ left: canvasRight - (rightmost - obj.left) });
      });
    } else {
      // Single object: align to canvas right
      activeObject.set({ left: canvasRight - activeObject.width! / 2 });
    }
    
    fabricCanvas.canvasRef.renderAll();
    fabricCanvas.canvasRef.fire('object:modified', { target: activeObject });
  }, [fabricCanvas.canvasRef]);

  const alignTop = useCallback(() => {
    if (!fabricCanvas.canvasRef) return;
    const activeObject = fabricCanvas.canvasRef.getActiveObject();
    if (!activeObject) return;

    if (activeObject.type === 'activeSelection') {
      // Multi-selection: align all to topmost
      const objects = (activeObject as any)._objects;
      const topmost = Math.min(...objects.map((obj: any) => obj.top - obj.height / 2));
      objects.forEach((obj: any) => {
        obj.set({ top: topmost + obj.height / 2 });
      });
    } else {
      // Single object: align to canvas top
      activeObject.set({ top: activeObject.height! / 2 });
    }
    
    fabricCanvas.canvasRef.renderAll();
    fabricCanvas.canvasRef.fire('object:modified', { target: activeObject });
  }, [fabricCanvas.canvasRef]);

  const alignMiddle = useCallback(() => {
    if (!fabricCanvas.canvasRef) return;
    const activeObject = fabricCanvas.canvasRef.getActiveObject();
    if (!activeObject) return;

    const canvasCenterY = fabricCanvas.canvasRef.height! / 2;
    
    if (activeObject.type === 'activeSelection') {
      // Multi-selection: align all to vertical middle
      const objects = (activeObject as any)._objects;
      objects.forEach((obj: any) => {
        obj.set({ top: canvasCenterY });
      });
    } else {
      // Single object: center vertically on canvas
      activeObject.set({ top: canvasCenterY });
    }
    
    fabricCanvas.canvasRef.renderAll();
    fabricCanvas.canvasRef.fire('object:modified', { target: activeObject });
  }, [fabricCanvas.canvasRef]);

  const alignBottom = useCallback(() => {
    if (!fabricCanvas.canvasRef) return;
    const activeObject = fabricCanvas.canvasRef.getActiveObject();
    if (!activeObject) return;

    const canvasBottom = fabricCanvas.canvasRef.height!;
    
    if (activeObject.type === 'activeSelection') {
      // Multi-selection: align all to bottommost
      const objects = (activeObject as any)._objects;
      const bottommost = Math.max(...objects.map((obj: any) => obj.top + obj.height / 2));
      objects.forEach((obj: any) => {
        obj.set({ top: canvasBottom - (bottommost - obj.top) });
      });
    } else {
      // Single object: align to canvas bottom
      activeObject.set({ top: canvasBottom - activeObject.height! / 2 });
    }
    
    fabricCanvas.canvasRef.renderAll();
    fabricCanvas.canvasRef.fire('object:modified', { target: activeObject });
  }, [fabricCanvas.canvasRef]);

  // Distribution functions
  const distributeHorizontally = useCallback(() => {
    if (!fabricCanvas.canvasRef) return;
    const activeObject = fabricCanvas.canvasRef.getActiveObject();
    if (!activeObject || activeObject.type !== 'activeSelection') return;

    const objects = (activeObject as any)._objects;
    if (objects.length < 3) return; // Need at least 3 objects to distribute

    // Sort by horizontal position
    const sorted = [...objects].sort((a: any, b: any) => a.left - b.left);
    const leftmost = sorted[0].left;
    const rightmost = sorted[sorted.length - 1].left;
    const totalSpace = rightmost - leftmost;
    const spacing = totalSpace / (sorted.length - 1);

    sorted.forEach((obj: any, index: number) => {
      obj.set({ left: leftmost + spacing * index });
    });
    
    fabricCanvas.canvasRef.renderAll();
    fabricCanvas.canvasRef.fire('object:modified', { target: activeObject });
  }, [fabricCanvas.canvasRef]);

  const distributeVertically = useCallback(() => {
    if (!fabricCanvas.canvasRef) return;
    const activeObject = fabricCanvas.canvasRef.getActiveObject();
    if (!activeObject || activeObject.type !== 'activeSelection') return;

    const objects = (activeObject as any)._objects;
    if (objects.length < 3) return; // Need at least 3 objects to distribute

    // Sort by vertical position
    const sorted = [...objects].sort((a: any, b: any) => a.top - b.top);
    const topmost = sorted[0].top;
    const bottommost = sorted[sorted.length - 1].top;
    const totalSpace = bottommost - topmost;
    const spacing = totalSpace / (sorted.length - 1);

    sorted.forEach((obj: any, index: number) => {
      obj.set({ top: topmost + spacing * index });
    });
    
    fabricCanvas.canvasRef.renderAll();
    fabricCanvas.canvasRef.fire('object:modified', { target: activeObject });
  }, [fabricCanvas.canvasRef]);

  // Group selected objects (Ctrl+G)
  const groupObjects = useCallback(() => {
    if (!fabricCanvas.canvasRef) return;
    const activeObject = fabricCanvas.canvasRef.getActiveObject();
    
    // Only group if multiple objects are selected
    if (!activeObject || activeObject.type !== 'activeSelection') {
      console.log('Select multiple objects to group');
      return;
    }
    
    const selection = activeObject as any;
    const objects = selection._objects;
    
    if (objects.length < 2) {
      console.log('Need at least 2 objects to group');
      return;
    }
    
    // Create a group from the active selection
    selection.toGroup();
    fabricCanvas.canvasRef.renderAll();
    fabricCanvas.updateCanvasObjects?.();
    
    // Trigger undo/redo and auto-save
    const newGroup = fabricCanvas.canvasRef.getActiveObject();
    if (newGroup) {
      fabricCanvas.canvasRef.fire('object:modified', { target: newGroup });
    }
    
    console.log(`Grouped ${objects.length} objects`);
    toast.success('Objects grouped');
  }, [fabricCanvas.canvasRef]);

  // Ungroup selected group (Ctrl+Shift+G)
  const ungroupObjects = useCallback(() => {
    if (!fabricCanvas.canvasRef) return;
    const activeObject = fabricCanvas.canvasRef.getActiveObject();
    
    // Only ungroup if a group is selected
    if (!activeObject || activeObject.type !== 'group') {
      console.log('Select a group to ungroup');
      return;
    }
    
    const group = activeObject as any;
    const items = group._objects.slice(); // Copy array
    
    // Ungroup to active selection
    group.toActiveSelection();
    fabricCanvas.canvasRef.renderAll();
    fabricCanvas.updateCanvasObjects?.();
    
    // Trigger undo/redo and auto-save
    const newSelection = fabricCanvas.canvasRef.getActiveObject();
    if (newSelection) {
      fabricCanvas.canvasRef.fire('object:modified', { target: newSelection });
    }
    
    console.log(`Ungrouped ${items.length} objects`);
    toast.success('Group ungrouped');
  }, [fabricCanvas.canvasRef]);

  // Toggle lock/unlock for objects
  const toggleLock = useCallback((object: any) => {
    if (!fabricCanvas.canvasRef) return;

    // Get current lock state from custom properties
    const isLocked = (object as any).customProps?.locked || false;
    const newLockState = !isLocked;

    // Update lock state
    if (!(object as any).customProps) {
      (object as any).customProps = {};
    }
    (object as any).customProps.locked = newLockState;

    // Set Fabric.js properties based on lock state
    object.set({
      selectable: !newLockState,
      evented: !newLockState,
      hasControls: !newLockState,
      hasBorders: !newLockState,
      lockMovementX: newLockState,
      lockMovementY: newLockState,
      lockRotation: newLockState,
      lockScalingX: newLockState,
      lockScalingY: newLockState,
    });

    // If we're locking the currently selected object, deselect it
    if (newLockState && fabricCanvas.canvasRef.getActiveObject() === object) {
      fabricCanvas.canvasRef.discardActiveObject();
    }

    fabricCanvas.canvasRef.renderAll();
    fabricCanvas.updateCanvasObjects?.();

    // Fire object:modified to integrate with undo/redo and auto-save
    fabricCanvas.canvasRef.fire('object:modified', { target: object });

    toast.success(newLockState ? 'Object locked' : 'Object unlocked');
  }, [fabricCanvas]);

  // Render grid on canvas
  const renderGrid = useCallback(() => {
    if (!fabricCanvas.canvasRef || !showGrid) return;

    const canvas = fabricCanvas.canvasRef;
    
    // Remove existing grid lines
    const existingGrid = canvas.getObjects().filter((obj: any) => obj.id === 'grid-line');
    existingGrid.forEach((line: any) => canvas.remove(line));

    // Get canvas dimensions
    const width = canvas.getWidth();
    const height = canvas.getHeight();

    // Create grid lines
    const gridLines: any[] = [];

    // Vertical lines
    for (let x = 0; x <= width; x += gridSize) {
      const line = new (window as any).fabric.Line([x, 0, x, height], {
        stroke: '#e0e0e0',
        strokeWidth: 1,
        selectable: false,
        evented: false,
        id: 'grid-line',
      });
      gridLines.push(line);
    }

    // Horizontal lines
    for (let y = 0; y <= height; y += gridSize) {
      const line = new (window as any).fabric.Line([0, y, width, y], {
        stroke: '#e0e0e0',
        strokeWidth: 1,
        selectable: false,
        evented: false,
        id: 'grid-line',
      });
      gridLines.push(line);
    }

    // Add all grid lines to canvas
    gridLines.forEach(line => canvas.add(line));
    
    // Send grid lines to back
    gridLines.forEach(line => (canvas as any).sendObjectToBack(line));
    
    canvas.renderAll();
  }, [fabricCanvas, showGrid, gridSize]);

  // Snap object position to grid
  const snapToGridPosition = useCallback((value: number) => {
    return Math.round(value / gridSize) * gridSize;
  }, [gridSize]);

  // Keyboard shortcuts for group/ungroup
  useEffect(() => {
    const handleGroupKeys = (e: KeyboardEvent) => {
      // Ctrl+G = Group
      if ((e.ctrlKey || e.metaKey) && e.key === 'g' && !e.shiftKey) {
        e.preventDefault();
        groupObjects();
      }
      // Ctrl+Shift+G = Ungroup
      else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'g') {
        e.preventDefault();
        ungroupObjects();
      }
    };

    window.addEventListener('keydown', handleGroupKeys);
    return () => window.removeEventListener('keydown', handleGroupKeys);
  }, [groupObjects, ungroupObjects]);

  // Capture canvas state on changes
  useEffect(() => {
    if (!fabricCanvas.canvasRef) return;

    const canvas = fabricCanvas.canvasRef;
    const handleCanvasChange = () => {
      // Don't trigger auto-save if we're loading a design
      if (isLoadingDesignRef.current) {
        console.log('Skipping auto-save during design load');
        return;
      }
      
      captureCanvasState();
      triggerAutoSave(); // Trigger auto-save on canvas changes
    };

    canvas.on('object:added', handleCanvasChange);
    canvas.on('object:modified', handleCanvasChange);
    canvas.on('object:removed', handleCanvasChange);
    canvas.on('text:changed', handleCanvasChange);

    return () => {
      canvas.off('object:added', handleCanvasChange);
      canvas.off('object:modified', handleCanvasChange);
      canvas.off('object:removed', handleCanvasChange);
      canvas.off('text:changed', handleCanvasChange);
    };
  }, [fabricCanvas.canvasRef, captureCanvasState, triggerAutoSave]);

  // Handle grid rendering and snap-to-grid
  useEffect(() => {
    if (!fabricCanvas.canvasRef) return undefined;

    const canvas = fabricCanvas.canvasRef;

    if (showGrid) {
      // Render grid initially
      renderGrid();
      
      // Re-render grid after canvas renders
      const handleAfterRender = () => {
        // Check if grid lines still exist, if not, re-add them
        const gridExists = canvas.getObjects().some((obj: any) => obj.id === 'grid-line');
        if (!gridExists) {
          renderGrid();
        }
      };
      
      canvas.on('after:render', handleAfterRender);
      
      return () => {
        canvas.off('after:render', handleAfterRender);
        // Remove grid lines when grid is disabled
        const existingGrid = canvas.getObjects().filter((obj: any) => obj.id === 'grid-line');
        existingGrid.forEach((line: any) => canvas.remove(line));
        canvas.renderAll();
      };
    } else {
      // Remove grid lines when showGrid is false
      const existingGrid = canvas.getObjects().filter((obj: any) => obj.id === 'grid-line');
      existingGrid.forEach((line: any) => canvas.remove(line));
      canvas.renderAll();
      return undefined;
    }
  }, [fabricCanvas.canvasRef, showGrid, gridSize, renderGrid]);

  // Handle snap-to-grid during object movement
  useEffect(() => {
    if (!fabricCanvas.canvasRef) return;

    const canvas = fabricCanvas.canvasRef;

    const handleObjectMoving = (e: any) => {
      if (!snapToGrid || !e.target) return;

      const obj = e.target;
      
      // Snap position to grid
      obj.set({
        left: snapToGridPosition(obj.left || 0),
        top: snapToGridPosition(obj.top || 0),
      });
    };

    if (snapToGrid) {
      canvas.on('object:moving', handleObjectMoving);
    }

    return () => {
      canvas.off('object:moving', handleObjectMoving);
    };
  }, [fabricCanvas.canvasRef, snapToGrid, snapToGridPosition]);

  // Auto-open Properties panel when object selected
  useEffect(() => {
    if (fabricCanvas.selectedObject) {
      setIsPropertiesPanelOpen(true);
    }
  }, [fabricCanvas.selectedObject]);

  // Keyboard event listeners from hook
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Prevent pinch zoom on touch devices
    document.addEventListener('touchmove', (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    }, { passive: false });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // LocalStorage backup (every 10 seconds)
  useEffect(() => {
    if (!fabricCanvas.canvasRef || !activeVariant) return;

    localStorageIntervalRef.current = window.setInterval(() => {
      const canvasData = fabricCanvas.canvasRef?.toJSON();
      if (canvasData) {
        const backupKey = `design_backup_${activeVariant.variantName}_${selectedView}`;
        localStorage.setItem(backupKey, JSON.stringify(canvasData));
        console.log('LocalStorage backup saved');
      }
    }, 10000); // Every 10 seconds

    return () => {
      if (localStorageIntervalRef.current) {
        window.clearInterval(localStorageIntervalRef.current);
      }
    };
  }, [fabricCanvas.canvasRef, activeVariant, selectedView]);

  // Force save on window close/refresh
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Force immediate save if there's unsaved work
      if (fabricCanvas.canvasRef && activeVariant && designStatus.type !== 'saving') {
        handleSave();
      }
      
      // Only show warning if save is in progress or failed
      if (designStatus.type === 'saving' || designStatus.type === 'save-error') {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [fabricCanvas.canvasRef, activeVariant, handleSave, designStatus.type]);

  // Load saved design on mount
  useEffect(() => {
    console.log('Load effect triggered:', { 
      hasVariant: !!activeVariant, 
      hasCanvas: !!fabricCanvas.canvasRef,
      productId: activeVariant?.productId,
      view: selectedView
    });
    
    if (activeVariant && fabricCanvas.canvasRef) {
      console.log('Calling loadUserDesign...');
      loadUserDesign();
    } else {
      console.log('Skipped loadUserDesign - missing variant or canvas');
    }
  }, [activeVariant?.productId, selectedView, fabricCanvas.canvasRef, loadUserDesign]); // Include loadUserDesign
  
  // Centralized toast notification handler - shows messages based on status changes
  useEffect(() => {
    const { type, message } = designStatus;
    
    switch (type) {
      case 'loaded':
        toast.success(message || 'Design loaded successfully');
        // Reset to idle after showing message
        setTimeout(() => setDesignStatus({ type: 'idle' }), 100);
        break;
      case 'saved':
        toast.success('Design saved');
        // Reset to idle after 3 seconds
        setTimeout(() => setDesignStatus({ type: 'idle' }), 3000);
        break;
      case 'save-error':
        toast.error(message || 'Could not save your design. Changes are backed up locally.');
        // Reset to idle after 5 seconds
        setTimeout(() => setDesignStatus({ type: 'idle' }), 5000);
        break;
      case 'load-error':
        toast.error(message || 'Could not load design');
        setTimeout(() => setDesignStatus({ type: 'idle' }), 3000);
        break;
    }
  }, [designStatus]);
  
  // Auto-open Variant Details panel on mount (whether or not there's a variant)
  useEffect(() => {
    setIsVariantDetailsPanelOpen(true);
  }, []); // Run only on mount
  
  // Auto-open Layers panel on mount
  useEffect(() => {
    setActiveTab('layers');
  }, []); // Run only on mount
  
  // Persist activeVariant to localStorage whenever it changes
  useEffect(() => {
    if (activeVariant) {
      localStorage.setItem('activeVariant', JSON.stringify(activeVariant));
    } else {
      localStorage.removeItem('activeVariant');
    }
  }, [activeVariant]);
  
  // Get category from navigation state
  const selectedCategory = location.state?.category || 'T-Shirt - Round Neck';
  const selectedProductName = location.state?.productName || '';

  // Fetch all customizable products
  const { products: allProducts, loading: productsLoading, error: productsError } = useCustomizableProducts();

  // Filter products by exact category match
  const categoryVariants = useMemo(() => {
    if (!allProducts || allProducts.length === 0) return [];
    
    // Filter by exact category string
    return allProducts.filter(product => product.category === selectedCategory);
  }, [allProducts, selectedCategory]);

  // Map database products to ClothingProduct format for UI
  const clothingProducts: ClothingProduct[] = useMemo(() => {
    return categoryVariants.map(product => {
      // Get primary image
      const frontImage = product.images?.find(img => img.type === 'front');
      const imageUrl = frontImage?.url || product.images?.[0]?.url || 'https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?w=500';
      
      return {
        id: product.id,
        name: product.name,
        color: product.color?.name || product.variant?.name || 'Unknown',
        sizes: product.sizes || ['S', 'M', 'L', 'XL'],
        image: imageUrl,
        noPrint: true,
        frontPrint: product.printAreas?.includes('Front') || true,
        backPrint: product.printAreas?.includes('Back') || true,
        category: product.category,
        subcategory: '', // No subcategory in new structure
        // New fields from database
        fitType: product.fitType,
        fitDescription: product.fitDescription,
        colorHex: product.color?.hexCode,
        variantName: product.variant?.name,
        differentiationType: product.differentiationType,
        retailPrice: product.retailPrice,
        frontPrintCost: product.frontPrintCost,
        backPrintCost: product.backPrintCost,
      };
    });
  }, [categoryVariants]);

  // Set initial product info from passed state
  useEffect(() => {
    if (selectedProductName) {
      setProductName(selectedProductName);
    }
    if (selectedCategory) {
      setProductCategory(selectedCategory);
    }
  }, [selectedProductName, selectedCategory]);

  const handleAddToCustomize = (product: ClothingProduct) => {
    // Simplified for single variant
    
    // 1. Validate size selection
    if (!selectedSize) {
      alert('⚠️ Please select a size first');
      return;
    }
    
    // 2. Calculate total price
    let totalPrice = product.retailPrice || 350;
    
    // Add print cost
    if (selectedPrintOption === 'front') {
      totalPrice += (product.frontPrintCost || 100);
    } else if (selectedPrintOption === 'back') {
      totalPrice += (product.backPrintCost || 100);
    }
    
    // 3. Determine variant name
    const variantName = product.variantName || product.color || 'Default';
    
    // 4. Create and set active variant
    const variantId = `variant-${Date.now()}`;
    const newVariant = {
      id: variantId,
      productId: product.id,
      productName: product.name,
      variantName: variantName,
      size: selectedSize,
      printOption: selectedPrintOption,
      image: product.image,
      retailPrice: product.retailPrice || 350,
      totalPrice: totalPrice
    };
    
    setActiveVariant(newVariant);
    
    // Save to localStorage for persistence across page refreshes
    localStorage.setItem('activeVariant', JSON.stringify(newVariant));
    
    // 5. Close clothing panel and open variant details
    setIsClothingPanelOpen(false);
    setIsVariantDetailsPanelOpen(true);
  };

  // Remove the hardcoded clothingProducts array - now using real data from above
  const oldClothingProducts: ClothingProduct[] = [
    // Jacket/Varsity Variants
    { 
      id: '1', 
      name: 'Classic Black Varsity', 
      color: 'Black', 
      sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'], 
      image: 'https://images.unsplash.com/photo-1588011025378-15f4778d2558?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2YXJzaXR5JTIwamFja2V0JTIwYmxhY2t8ZW58MXx8fHwxNzYzNjU1NjcxfDA&ixlib=rb-4.1.0&q=80&w=1080',
      noPrint: true,
      frontPrint: true,
      backPrint: true,
      category: 'Jacket',
      subcategory: 'Varsity Jacket'
    },
    { 
      id: '2', 
      name: 'White Premium Edition', 
      color: 'White', 
      sizes: ['S', 'M', 'L', 'XL'], 
      image: 'https://images.unsplash.com/photo-1760458955495-9712cc8f79c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2YXJzaXR5JTIwamFja2V0JTIwd2hpdGV8ZW58MXx8fHwxNzYzNjU1NjczfDA&ixlib=rb-4.1.0&q=80&w=1080',
      noPrint: false,
      frontPrint: true,
      backPrint: true,
      category: 'Jacket',
      subcategory: 'Varsity Jacket'
    },
    { 
      id: '3', 
      name: 'Navy Blue Classic', 
      color: 'Navy Blue', 
      sizes: ['M', 'L', 'XL', '2XL', '3XL'], 
      image: 'https://images.unsplash.com/photo-1639270601211-9265bafae0f9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2YXJzaXR5JTIwamFja2V0JTIwbmF2eSUyMGJsdWV8ZW58MXx8fHwxNzYzNjU1NjczfDA&ixlib=rb-4.1.0&q=80&w=1080',
      noPrint: true,
      frontPrint: true,
      backPrint: false,
      category: 'Jacket',
      subcategory: 'Varsity Jacket'
    },
    { 
      id: '4', 
      name: 'Gray Heather Varsity', 
      color: 'Gray', 
      sizes: ['XS', 'S', 'M', 'L', 'XL'], 
      image: 'https://images.unsplash.com/photo-1715408153725-186c6c77fb45?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2YXJzaXR5JTIwamFja2V0JTIwZ3JheXxlbnwxfHx8fDE3NjM2NTU2NzN8MA&ixlib=rb-4.1.0&q=80&w=1080',
      noPrint: false,
      frontPrint: true,
      backPrint: true,
      category: 'Jacket',
      subcategory: 'Varsity Jacket'
    },
    { 
      id: '5', 
      name: 'Forest Green Limited', 
      color: 'Green', 
      sizes: ['S', 'M', 'L', 'XL', '2XL'], 
      image: 'https://images.unsplash.com/photo-1727063165870-0a1bc4c75240?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2YXJzaXR5JTIwamFja2V0JTIwZ3JlZW58ZW58MXx8fHwxNzYzNjU1NjczfDA&ixlib=rb-4.1.0&q=80&w=1080',
      noPrint: true,
      frontPrint: false,
      backPrint: true,
      category: 'Jacket',
      subcategory: 'Varsity Jacket'
    },
    { 
      id: '6', 
      name: 'Red Sport Edition', 
      color: 'Red', 
      sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'], 
      image: 'https://images.unsplash.com/photo-1761439703714-b9dd3ef8af4f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2YXJzaXR5JTIwamFja2V0JTIwcmVkfGVufDF8fHx8MTc2MzY1NTY3M3ww&ixlib=rb-4.1.0&q=80&w=1080',
      noPrint: true,
      frontPrint: true,
      backPrint: true,
      category: 'Jacket',
      subcategory: 'Varsity Jacket'
    },
    // T-Shirt Variants - Round Neck
    {
      id: '7',
      name: 'Round Neck White',
      color: 'White',
      sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
      image: 'https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHQtc2hpcnQlMjByb3VuZCUyMG5lY2t8ZW58MXx8fHwxNzYyOTg3NTQ5fDA&ixlib=rb-4.1.0&q=80&w=1080',
      noPrint: true,
      frontPrint: true,
      backPrint: true,
      category: 'T-Shirt',
      subcategory: 'Round Neck'
    },
    {
      id: '8',
      name: 'Round Neck Black',
      color: 'Black',
      sizes: ['S', 'M', 'L', 'XL', '2XL'],
      image: 'https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHQtc2hpcnQlMjByb3VuZCUyMG5lY2t8ZW58MXx8fHwxNzYyOTg3NTQ5fDA&ixlib=rb-4.1.0&q=80&w=1080',
      noPrint: true,
      frontPrint: true,
      backPrint: true,
      category: 'T-Shirt',
      subcategory: 'Round Neck'
    },
    {
      id: '25',
      name: 'Round Neck Navy Blue',
      color: 'Navy Blue',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      image: 'https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHQtc2hpcnQlMjByb3VuZCUyMG5lY2t8ZW58MXx8fHwxNzYyOTg3NTQ5fDA&ixlib=rb-4.1.0&q=80&w=1080',
      noPrint: true,
      frontPrint: true,
      backPrint: true,
      category: 'T-Shirt',
      subcategory: 'Round Neck'
    },
    // T-Shirt Variants - V Neck
    {
      id: '9',
      name: 'V Neck White',
      color: 'White',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      image: 'https://images.unsplash.com/photo-1620799139652-715e4d5b232d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHYlMjBuZWNrJTIwdHNoaXJ0fGVufDF8fHx8MTc2Mjk4NzU1MHww&ixlib=rb-4.1.0&q=80&w=1080',
      noPrint: true,
      frontPrint: true,
      backPrint: true,
      category: 'T-Shirt',
      subcategory: 'V Neck'
    },
    {
      id: '10',
      name: 'V Neck Gray',
      color: 'Gray',
      sizes: ['M', 'L', 'XL', '2XL'],
      image: 'https://images.unsplash.com/photo-1620799139652-715e4d5b232d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHYlMjBuZWNrJTIwdHNoaXJ0fGVufDF8fHx8MTc2Mjk4NzU1MHww&ixlib=rb-4.1.0&q=80&w=1080',
      noPrint: true,
      frontPrint: true,
      backPrint: false,
      category: 'T-Shirt',
      subcategory: 'V Neck'
    },
    {
      id: '26',
      name: 'V Neck Black',
      color: 'Black',
      sizes: ['S', 'M', 'L', 'XL', '2XL'],
      image: 'https://images.unsplash.com/photo-1620799139652-715e4d5b232d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHYlMjBuZWNrJTIwdHNoaXJ0fGVufDF8fHx8MTc2Mjk4NzU1MHww&ixlib=rb-4.1.0&q=80&w=1080',
      noPrint: true,
      frontPrint: true,
      backPrint: true,
      category: 'T-Shirt',
      subcategory: 'V Neck'
    },
    // T-Shirt Variants - Chinese Collar
    {
      id: '27',
      name: 'Chinese Collar White',
      color: 'White',
      sizes: ['S', 'M', 'L', 'XL'],
      image: 'https://images.unsplash.com/photo-1651659802584-08bf160743dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMGNoaW5lc2UlMjBjb2xsYXIlMjBzaGlydHxlbnwxfHx8fDE3NjI5ODc1NTB8MA&ixlib=rb-4.1.0&q=80&w=1080',
      noPrint: true,
      frontPrint: true,
      backPrint: true,
      category: 'T-Shirt',
      subcategory: 'Chinese Collar'
    },
    {
      id: '28',
      name: 'Chinese Collar Black',
      color: 'Black',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      image: 'https://images.unsplash.com/photo-1651659802584-08bf160743dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMGNoaW5lc2UlMjBjb2xsYXIlMjBzaGlydHxlbnwxfHx8fDE3NjI5ODc1NTB8MA&ixlib=rb-4.1.0&q=80&w=1080',
      noPrint: false,
      frontPrint: true,
      backPrint: true,
      category: 'T-Shirt',
      subcategory: 'Chinese Collar'
    },
    // Hoodie Variants
    {
      id: '11',
      name: 'Premium Cotton Hoodie White',
      color: 'White',
      sizes: ['S', 'M', 'L', 'XL', '2XL'],
      image: 'https://images.unsplash.com/photo-1639600280284-6ef3f0d67fe1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMGhvb2RpZSUyMHByZW1pdW18ZW58MXx8fHwxNzYyOTcxODA4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      noPrint: true,
      frontPrint: true,
      backPrint: true,
      category: 'Hoodie',
      subcategory: 'Premium Cotton'
    },
    {
      id: '12',
      name: 'Premium Cotton Hoodie Black',
      color: 'Black',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      image: 'https://images.unsplash.com/photo-1639600280284-6ef3f0d67fe1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMGhvb2RpZSUyMHByZW1pdW18ZW58MXx8fHwxNzYyOTcxODA4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      noPrint: true,
      frontPrint: true,
      backPrint: true,
      category: 'Hoodie',
      subcategory: 'Premium Cotton'
    },
    {
      id: '13',
      name: 'Premium Cotton Hoodie Gray',
      color: 'Gray',
      sizes: ['M', 'L', 'XL', '2XL', '3XL'],
      image: 'https://images.unsplash.com/photo-1639600280284-6ef3f0d67fe1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMGhvb2RpZSUyMHByZW1pdW18ZW58MXx8fHwxNzYyOTcxODA4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      noPrint: false,
      frontPrint: true,
      backPrint: true,
      category: 'Hoodie',
      subcategory: 'Premium Cotton'
    },
    // Polo Shirt Variants
    {
      id: '14',
      name: 'Polo Shirt White',
      color: 'White',
      sizes: ['S', 'M', 'L', 'XL'],
      image: 'https://images.unsplash.com/photo-1671438118097-479e63198629?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHBvbG8lMjBzaGlydHxlbnwxfHx8fDE3NjI5MzkzNDJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      noPrint: true,
      frontPrint: true,
      backPrint: true,
      category: 'Shirt',
      subcategory: 'Polo'
    },
    {
      id: '15',
      name: 'Polo Shirt Black',
      color: 'Black',
      sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
      image: 'https://images.unsplash.com/photo-1671438118097-479e63198629?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHBvbG8lMjBzaGlydHxlbnwxfHx8fDE3NjI5MzkzNDJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      noPrint: true,
      frontPrint: true,
      backPrint: false,
      category: 'Shirt',
      subcategory: 'Polo'
    },
    {
      id: '16',
      name: 'Polo Shirt Navy Blue',
      color: 'Navy Blue',
      sizes: ['M', 'L', 'XL', '2XL'],
      image: 'https://images.unsplash.com/photo-1671438118097-479e63198629?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHBvbG8lMjBzaGlydHxlbnwxfHx8fDE3NjI5MzkzNDJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      noPrint: true,
      frontPrint: true,
      backPrint: true,
      category: 'Shirt',
      subcategory: 'Polo'
    },
    // Kids Variants
    {
      id: '17',
      name: 'Kids T-Shirt White',
      color: 'White',
      sizes: ['2T', '3T', '4T', '5T', 'XS', 'S'],
      image: 'https://images.unsplash.com/photo-1731267776886-90f90af75eb1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxraWRzJTIwdC1zaGlydCUyMHdoaXRlfGVufDF8fHx8MTc2Mjk5MDk5MHww&ixlib=rb-4.1.0&q=80&w=1080',
      noPrint: true,
      frontPrint: true,
      backPrint: true,
      category: 'Kids',
      subcategory: 'Kids T-Shirt'
    },
    {
      id: '18',
      name: 'Kids T-Shirt Black',
      color: 'Black',
      sizes: ['2T', '3T', '4T', '5T', 'XS', 'S'],
      image: 'https://images.unsplash.com/photo-1731267776886-90f90af75eb1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxraWRzJTIwdC1zaGlydCUyMHdoaXRlfGVufDF8fHx8MTc2Mjk5MDk5MHww&ixlib=rb-4.1.0&q=80&w=1080',
      noPrint: true,
      frontPrint: true,
      backPrint: false,
      category: 'Kids',
      subcategory: 'Kids T-Shirt'
    },
    {
      id: '19',
      name: 'Kids Polo Shirt White',
      color: 'White',
      sizes: ['2T', '3T', '4T', '5T', 'XS'],
      image: 'https://images.unsplash.com/photo-1659779193831-97ccb9fecfeb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxraWRzJTIwcG9sbyUyMHNoaXJ0fGVufDF8fHx8MTc2MjkzMjQzOHww&ixlib=rb-4.1.0&q=80&w=1080',
      noPrint: true,
      frontPrint: true,
      backPrint: true,
      category: 'Kids',
      subcategory: 'Kids Polo'
    },
  ];

  // Filtered products are already filtered above in categoryVariants/clothingProducts
  const filteredClothingProducts = clothingProducts;

  // Get category display name
  const getCategoryDisplayName = (category: string) => {
    // Use the full category string as display name with "Variants" suffix
    return `${category} Variants`;
  };

  const leftTools = [
    { id: 'back', icon: ArrowLeft, label: 'Back' },
    { id: 'upload', icon: Upload, label: 'Upload Image' },
    { id: 'text', icon: Type, label: 'Add Text' },
    { id: 'library', icon: Layers, label: 'My Library' },
    { id: 'graphics', icon: ImageIcon, label: 'Graphics' },
    { id: 'patterns', icon: Grid3x3, label: 'Patterns/Textures' },
  ];

  const handleToolClick = (toolId: string) => {
    if (toolId === 'back') {
      navigate('/');
    } else if (toolId === 'upload') {
      setIsUploadPanelOpen(!isUploadPanelOpen);
      setIsTextPanelOpen(false);
      setIsLibraryPanelOpen(false);
      setIsGraphicsPanelOpen(false);
      setIsPatternsPanelOpen(false);
      setIsClothingPanelOpen(false);
      setIsPropertiesPanelOpen(false);
      setActiveTool('upload');
    } else if (toolId === 'text') {
      setIsTextPanelOpen(!isTextPanelOpen);
      setIsUploadPanelOpen(false);
      setIsLibraryPanelOpen(false);
      setIsGraphicsPanelOpen(false);
      setIsPatternsPanelOpen(false);
      setIsClothingPanelOpen(false);
      setIsPropertiesPanelOpen(false);
      setActiveTool('text');
    } else if (toolId === 'library') {
      setIsLibraryPanelOpen(!isLibraryPanelOpen);
      setIsUploadPanelOpen(false);
      setIsTextPanelOpen(false);
      setIsGraphicsPanelOpen(false);
      setIsPatternsPanelOpen(false);
      setIsClothingPanelOpen(false);
      setIsPropertiesPanelOpen(false);
      setActiveTool('library');
    } else if (toolId === 'graphics') {
      setIsGraphicsPanelOpen(!isGraphicsPanelOpen);
      setIsUploadPanelOpen(false);
      setIsTextPanelOpen(false);
      setIsLibraryPanelOpen(false);
      setIsPatternsPanelOpen(false);
      setIsClothingPanelOpen(false);
      setIsPropertiesPanelOpen(false);
      setActiveTool('graphics');
    } else if (toolId === 'patterns') {
      setIsPatternsPanelOpen(!isPatternsPanelOpen);
      setIsUploadPanelOpen(false);
      setIsTextPanelOpen(false);
      setIsLibraryPanelOpen(false);
      setIsGraphicsPanelOpen(false);
      setIsClothingPanelOpen(false);
      setIsPropertiesPanelOpen(false);
      setActiveTool('patterns');
    } else {
      setActiveTool(toolId);
    }
  };

  // Handle image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // NEW: Check if variant is active
    if (!isVariantActive()) {
      showVariantRequiredWarning();
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setValidationWarning(null);

    // Validate image
    const validation = await validateImage(file);
    
    if (!validation.valid) {
      setValidationWarning(validation.error || 'Invalid image');
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    if (validation.warning) {
      setValidationWarning(validation.warning);
    }

    // Upload image
    const result = await uploadImage(file);
    
    if (result) {
      // Add to recent uploads (keep last 6)
      setRecentUploads(prev => [
        { ...result, timestamp: Date.now() },
        ...prev
      ].slice(0, 6));
      
      // Add to canvas
      fabricCanvas.addImageToCanvas(result.url, { fit: true, center: true });
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  // Handle clicking on recent upload
  const handleRecentUploadClick = (imageUrl: string) => {
    // NEW: Check if variant is active
    if (!isVariantActive()) {
      showVariantRequiredWarning();
      return;
    }
    
    fabricCanvas.addImageToCanvas(imageUrl, { fit: true, center: true });
  };

  // Handle add graphic to canvas
  const handleAddGraphic = (graphicUrl: string) => {
    // NEW: Check if variant is active
    if (!isVariantActive()) {
      showVariantRequiredWarning();
      return;
    }
    
    fabricCanvas.addImageToCanvas(graphicUrl, { fit: true, center: true });
    setIsGraphicsPanelOpen(false);
  };

  // Handle apply pattern to selected object
  const handleApplyPattern = async (patternUrl: string) => {
    // NEW: Check if variant is active
    if (!isVariantActive()) {
      showVariantRequiredWarning();
      return;
    }
    
    const canvas = fabricCanvas.canvasRef;
    if (!canvas) return;

    const activeObj = canvas.getActiveObject();
    if (!activeObj) {
      alert('Please select an object first to apply the pattern');
      return;
    }

    // Load pattern image and apply as fill
    const { Image: FabricImage, Pattern } = await import('fabric');
    const img = await FabricImage.fromURL(patternUrl, { crossOrigin: 'anonymous' });
    const pattern = new Pattern({
      source: img.getElement() as HTMLImageElement,
      repeat: 'repeat'
    });
    
    activeObj.set('fill', pattern);
    canvas.renderAll();

    setIsPatternsPanelOpen(false);
  };

  // Handle add text
  const handleAddText = () => {
    if (!textContent.trim()) return;

    // NEW: Check if variant is active
    if (!isVariantActive()) {
      showVariantRequiredWarning();
      return;
    }

    const sizeMap = {
      'Small': 24,
      'Medium': 40,
      'Large': 60,
      'X-Large': 80,
    };

    fabricCanvas.addTextToCanvas(textContent, {
      fontSize: sizeMap[selectedTextSize],
      fontFamily: selectedFont,
      fill: selectedColor,
    });

    // Clear text input
    setTextContent('');
  };

  // Handle object update from Properties Panel
  const handleObjectUpdate = (updates: Record<string, any>) => {
    const canvas = fabricCanvas.canvasRef;
    const selectedObj = fabricCanvas.selectedObject;
    
    if (!canvas || !selectedObj) return;

    selectedObj.set(updates);
    canvas.renderAll();
  };

  return (
    <CanvasProvider value={{
      fabricCanvas: fabricCanvas.canvasRef,
      selectedObject: fabricCanvas.selectedObject,
      canvasObjects: fabricCanvas.canvasObjects,
      zoom: fabricCanvas.zoom,
      addImageToCanvas: fabricCanvas.addImageToCanvas,
      addTextToCanvas: fabricCanvas.addTextToCanvas,
      removeSelectedObject: fabricCanvas.removeSelectedObject,
      removeObject: fabricCanvas.removeObject,
      clearCanvas: fabricCanvas.clearCanvas,
      getCanvasJSON: fabricCanvas.getCanvasJSON,
      loadCanvasFromJSON: fabricCanvas.loadCanvasFromJSON,
      setZoom: fabricCanvas.setZoom,
      resetView: fabricCanvas.resetView,
      exportHighDPI: fabricCanvas.exportHighDPI,
    }}>
      <div className="h-screen flex bg-gray-100 overflow-hidden fixed inset-0">
      {/* Left Vertical Toolbar - Spans full height */}
      <div className="bg-white border-r w-20 flex flex-col items-center py-6 gap-4 z-10">
        {leftTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() => handleToolClick(tool.id)}
              className={`w-full flex flex-col items-center justify-center gap-1.5 py-2 px-1 transition-colors group ${
                activeTool === tool.id
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="size-5" />
              <span className={`text-[10px] text-center leading-tight ${
                activeTool === tool.id ? '' : 'text-gray-500'
              }`}>
                {tool.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Right side: Top bar, content, and bottom bar */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <div className="bg-white border-b px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setIsClothingPanelOpen(!isClothingPanelOpen);
                // Close left-side panels when opening Clothing Variants
                if (!isClothingPanelOpen) {
                  setIsUploadPanelOpen(false);
                  setIsTextPanelOpen(false);
                  setIsLibraryPanelOpen(false);
                  setIsGraphicsPanelOpen(false);
                  setIsPatternsPanelOpen(false);
                }
              }}
              data-clothing-variants-btn
              className={`${isClothingPanelOpen ? 'bg-gray-800 text-white hover:bg-gray-700 hover:text-white' : 'hover:bg-gray-100 hover:text-gray-900'}`}
            >
              Clothing Variants
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsVariantDetailsPanelOpen(!isVariantDetailsPanelOpen)}
              className={`flex items-center gap-2 ${isVariantDetailsPanelOpen ? 'bg-gray-800 text-white hover:bg-gray-700 hover:text-white' : 'hover:bg-gray-100 hover:text-gray-900'}`}
            >
              <Package className="size-4" />
              Variant Details
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsPropertiesPanelOpen(!isPropertiesPanelOpen);
                // Close left-side panels when opening Properties
                if (!isPropertiesPanelOpen) {
                  setIsUploadPanelOpen(false);
                  setIsTextPanelOpen(false);
                  setIsLibraryPanelOpen(false);
                  setIsGraphicsPanelOpen(false);
                  setIsPatternsPanelOpen(false);
                }
              }}
              className={`${isPropertiesPanelOpen ? 'bg-gray-800 text-white hover:bg-gray-700 hover:text-white' : 'hover:bg-gray-100 hover:text-gray-900'}`}
            >
              Properties
              {fabricCanvas.selectedObject && (
                <span className="ml-2 size-2 rounded-full bg-green-500"></span>
              )}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={'default'}
              size="sm"
              className="bg-gray-800 hover:bg-gray-700 text-white"
            >
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/custom-design-preview', {
                state: {
                  activeVariant,
                  canvasData: fabricCanvas.canvasRef?.toJSON(),
                  view: selectedView
                }
              })}
              className="hover:bg-gray-100 hover:text-gray-900"
              disabled={!activeVariant}
            >
              Preview
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab(activeTab === 'layers' ? '' : 'layers')}
              className={`relative ${activeTab === 'layers' ? 'bg-gray-800 text-white hover:bg-gray-700 hover:text-white' : 'hover:bg-gray-100 hover:text-gray-900'}`}
            >
              Layers
              {layers.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs size-5 rounded-full flex items-center justify-center">
                  {layers.length}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Variant Details Panel - LEFT SIDE */}
          {isVariantDetailsPanelOpen && (
            <div className="absolute left-0 top-0 bottom-0 bg-white border-r w-[320px] overflow-y-auto z-20 shadow-lg">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="p-4 border-b flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Variant Details</h2>
                  <Button variant="ghost" size="icon" className="size-8" onClick={() => setIsVariantDetailsPanelOpen(false)}>
                    <X className="size-4" />
                  </Button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-4">
                  {!activeVariant ? (
                    /* Empty State - No Variant Selected */
                    <div className="flex flex-col items-center justify-center h-full space-y-4 text-center px-4">
                      <Package className="size-16 text-gray-400" />
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">No Variant Selected</h3>
                        <p className="text-sm text-gray-600">Choose a product variant to start customizing your design</p>
                      </div>
                      <Button 
                        size="lg"
                        className="mt-4"
                        onClick={() => {
                          setIsVariantDetailsPanelOpen(false);
                          setIsClothingPanelOpen(true);
                        }}
                      >
                        <Package className="size-4 mr-2" />
                        Select Product Variant
                      </Button>
                    </div>
                  ) : (
                    /* Filled State - Variant Selected */
                    <div className="space-y-6">
                  {/* Image */}
                  <div className="space-y-3">
                    <div className="w-full aspect-square bg-gray-100 rounded-lg border overflow-hidden">
                      <img 
                        src={activeVariant.image} 
                        alt={activeVariant.productName}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>

                  {/* Product Name & Variant */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">{activeVariant.productName}</h3>
                    <div className="text-sm text-gray-600">{activeVariant.variantName}</div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Package className="size-4" />
                      <span>Your Brand Store</span>
                    </div>
                  </div>

                  {/* Stock Status */}
                  <div className="flex items-center gap-2 py-2 px-3 bg-green-50 border border-green-200 rounded-lg">
                    <Check className="size-4 text-green-600" />
                    <span className="text-sm text-green-700">In stock</span>
                  </div>

                  {/* Selected Options */}
                  <div className="space-y-3 border-t pt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Size</span>
                      <span className="font-medium">{activeVariant.size}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Print Option</span>
                      <span className="font-medium">
                        {activeVariant.printOption === 'none' ? 'No Print' : 
                         activeVariant.printOption === 'front' ? 'Front Only' : 'Back Only'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Retail Price</span>
                      <span className="font-medium">₱{activeVariant.retailPrice.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Production Cost */}
                  <Collapsible open={isProductionCostOpen} onOpenChange={setIsProductionCostOpen}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                        <span className="text-sm font-medium">Total Price: ₱{activeVariant.totalPrice.toFixed(2)}</span>
                        {isProductionCostOpen ? (
                          <ChevronUp className="size-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="size-4 text-gray-500" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-4 space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Retail Price</span>
                          <span>₱{activeVariant.retailPrice.toFixed(2)}</span>
                        </div>
                        {activeVariant.printOption === 'front' && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Front print</span>
                            <span>Included</span>
                          </div>
                        )}
                        {activeVariant.printOption === 'back' && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Back print</span>
                            <span>Included</span>
                          </div>
                        )}
                        <div className="pt-2 border-t flex items-center justify-between">
                          <span className="text-sm font-medium">Total</span>
                          <span className="text-sm font-medium">₱{activeVariant.totalPrice.toFixed(2)}</span>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Print Area Details */}
                  <Collapsible open={isPrintAreaOpen} onOpenChange={setIsPrintAreaOpen} className="border-t pt-6">
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent mb-4">
                        <span className="text-sm font-medium">Print area</span>
                        {isPrintAreaOpen ? (
                          <ChevronUp className="size-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="size-4 text-gray-500" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-4">
                      {/* Print Area Size Selector */}
                      <div className="space-y-2">
                        <Label htmlFor="variantPrintAreaSize" className="text-sm text-gray-600">Print Area Size</Label>
                        <Select value={printAreaSize} onValueChange={(value: PrintAreaPreset) => setPrintAreaSize(value)}>
                          <SelectTrigger id="variantPrintAreaSize" className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(Object.keys(PRINT_AREA_PRESETS) as PrintAreaPreset[]).map((preset) => (
                              <SelectItem key={preset} value={preset}>
                                {PRINT_AREA_PRESETS[preset].label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Print Size</span>
                          <span>{PRINT_AREA_PRESETS[printAreaSize].width} × {PRINT_AREA_PRESETS[printAreaSize].height} px</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">DPI</span>
                          <span>300</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Physical Size</span>
                          <span>{PRINT_AREA_PRESETS[printAreaSize].physicalSize}</span>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Clothing Variants Panel - LEFT SIDE */}
          {isClothingPanelOpen && (
            <div className="absolute left-0 top-0 bottom-0 bg-white border-r border-gray-300 w-[480px] overflow-hidden z-20 shadow-xl">
              <div className="h-full flex flex-col">
                {/* Header */}
                <div className="p-5 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl">{getCategoryDisplayName(selectedCategory)}</h2>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="size-2 rounded-full bg-green-500"></div>
                        <span className="text-gray-600">{productsLoading ? 'Loading...' : `${clothingProducts.length} Available`}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="size-8 hover:bg-gray-200" onClick={() => setIsClothingPanelOpen(false)}>
                      <X className="size-5" />
                    </Button>
                  </div>
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto p-5">
                  <style>{`
                    .variants-scroll::-webkit-scrollbar {
                      width: 8px;
                    }
                    .variants-scroll::-webkit-scrollbar-track {
                      background: #f1f1f1;
                      border-radius: 4px;
                    }
                    .variants-scroll::-webkit-scrollbar-thumb {
                      background: #888;
                      border-radius: 4px;
                    }
                    .variants-scroll::-webkit-scrollbar-thumb:hover {
                      background: #555;
                    }
                  `}</style>
                  
                  <div className="variants-scroll h-full overflow-y-auto space-y-4">
                    {productsLoading ? (
                      <div className="flex flex-col items-center justify-center h-full text-center px-6">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mb-4"></div>
                        <p className="text-sm text-gray-600">Loading variants...</p>
                      </div>
                    ) : productsError ? (
                      <div className="flex flex-col items-center justify-center h-full text-center px-6">
                        <AlertCircle className="size-16 text-red-400 mb-4" />
                        <p className="text-sm text-red-600 mb-2">Failed to load products</p>
                        <p className="text-xs text-gray-500">{productsError}</p>
                      </div>
                    ) : filteredClothingProducts.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center px-6">
                        <Package className="size-16 text-gray-300 mb-4" />
                        <p className="text-sm text-gray-600 mb-2">No variants found</p>
                        <p className="text-xs text-gray-500">
                          No products available for {selectedCategory}
                        </p>
                      </div>
                    ) : (
                      filteredClothingProducts.map((product) => {
                        const isPricingExpanded = expandedPricingIds.has(product.id);
                        
                        // Calculate pricing
                        const basePrice = product.retailPrice || 350;
                        const frontCost = product.frontPrintCost || 100;
                        const backCost = product.backPrintCost || 100;
                        const noPrintPrice = basePrice;
                        const frontPrintPrice = basePrice + frontCost;
                        const backPrintPrice = basePrice + backCost;

                        return (
                          <div
                            key={product.id}
                            className="w-full bg-white border-2 border-gray-200 rounded-xl hover:border-gray-400 hover:shadow-lg transition-all"
                          >
                            <div className="p-4 space-y-3">
                              {/* Top Section: Image and Details */}
                              <div className="flex gap-4">
                                <div className="w-32 h-32 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                                  <img 
                                    src={product.image} 
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>

                                <div className="flex-1 space-y-2.5">
                                  <h3 className="text-base hover:text-gray-900 transition-colors">
                                    {product.name}
                                  </h3>

                                  {/* Category */}
                                  {product.category && (
                                    <div className="text-xs text-gray-600">
                                      Category: <span className="font-medium">{product.category}</span>
                                    </div>
                                  )}

                                  {/* Sizes - Interactive */}
                                  <div className="space-y-1">
                                    <span className="text-xs text-gray-500">Select Size:<span className="text-red-500 ml-1">*</span></span>
                                    <div className="flex flex-wrap gap-1.5">
                                      {product.sizes.map((size) => {
                                        const isSelected = selectedSize === size;
                                        return (
                                          <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`px-2 py-0.5 text-xs border rounded transition-all ${
                                              isSelected 
                                                ? 'bg-gray-800 text-white border-gray-800 font-medium' 
                                                : 'bg-gray-100 border-gray-300 hover:border-gray-800 hover:bg-gray-200'
                                            }`}
                                          >
                                            {size}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>

                                  {/* Print Options */}
                                  <div className="space-y-1">
                                    <span className="text-xs text-gray-500">Print Option:</span>
                                    <div className="flex gap-1.5">
                                      {['none', 'front', 'back'].map((option) => {
                                        const isSelected = selectedPrintOption === option;
                                        const optionLabel = option.charAt(0).toUpperCase() + option.slice(1);
                                        return (
                                          <button
                                            key={option}
                                            onClick={() => setSelectedPrintOption(option as 'none' | 'front' | 'back')}
                                            className={`px-3 py-1 text-xs border rounded transition-all ${
                                              isSelected 
                                                ? 'bg-gray-800 text-white border-gray-800 font-medium' 
                                                : 'bg-gray-100 border-gray-300 hover:border-gray-800 hover:bg-gray-200'
                                            }`}
                                          >
                                            {optionLabel}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Color/Variant and Fit Info */}
                              <div className="space-y-2 pl-1">
                                {/* Color or Variant */}
                                {product.differentiationType === 'color' && product.colorHex ? (
                                  <div className="flex items-center gap-3">
                                    <div 
                                      className="size-10 rounded-md border-2 border-gray-300 shadow-sm flex-shrink-0"
                                      style={{ backgroundColor: product.colorHex }}
                                    />
                                    <div className="flex flex-col">
                                      <span className="text-xs text-gray-500">Color</span>
                                      <span className="text-sm text-gray-800">{product.color}</span>
                                    </div>
                                  </div>
                                ) : product.differentiationType === 'variant' && product.variantName ? (
                                  <div className="text-xs">
                                    <span className="text-gray-500">Variant: </span>
                                    <span className="text-gray-800 font-medium">{product.variantName}</span>
                                  </div>
                                ) : null}

                                {/* Fit Info */}
                                {(product.fitType || product.fitDescription) && (
                                  <div className="text-xs">
                                    {product.fitType && (
                                      <span className="text-gray-600">
                                        <span className="text-gray-500">Fit: </span>
                                        {product.fitType}
                                        {product.fitDescription && ' | '}
                                      </span>
                                    )}
                                    {product.fitDescription && (
                                      <span className="text-gray-500">{product.fitDescription}</span>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Collapsible Pricing Section */}
                              <div className="pt-2 border-t border-gray-100">
                                <button
                                  onClick={() => {
                                    setExpandedPricingIds(prev => {
                                      const newSet = new Set(prev);
                                      if (isPricingExpanded) {
                                        newSet.delete(product.id);
                                      } else {
                                        newSet.add(product.id);
                                      }
                                      return newSet;
                                    });
                                  }}
                                  className="w-full flex items-center justify-between py-2 px-2 hover:bg-gray-50 rounded transition-colors"
                                >
                                  <span className="text-xs font-medium text-gray-700">Pricing Options</span>
                                  <ChevronDown className={`size-4 text-gray-500 transition-transform ${isPricingExpanded ? 'rotate-180' : ''}`} />
                                </button>
                                
                                {isPricingExpanded && (
                                  <div className="space-y-2 mt-2">
                                    <div className="flex items-center justify-between py-1.5 px-2 bg-gray-50 border border-gray-200 rounded">
                                      <span className="text-xs text-gray-700">No Print</span>
                                      <span className="text-xs font-medium">₱{noPrintPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-1.5 px-2 bg-gray-50 border border-gray-200 rounded">
                                      <span className="text-xs text-gray-700">Front Print</span>
                                      <span className="text-xs font-medium">₱{frontPrintPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-1.5 px-2 bg-gray-50 border border-gray-200 rounded">
                                      <span className="text-xs text-gray-700">Back Print</span>
                                      <span className="text-xs font-medium">₱{backPrintPrice.toFixed(2)}</span>
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center justify-between gap-2 pt-2">
                                <Button 
                                  size="sm"
                                  className="bg-gray-800 hover:bg-gray-700 text-white text-xs h-8"
                                  onClick={() => handleAddToCustomize(product)}
                                >
                                  Add to Customize
                                </Button>
                                <button 
                                  onClick={() => navigate(`/custom-product/${product.id}`)}
                                  className="text-xs text-gray-600 hover:text-gray-900 hover:underline"
                                >
                                  More details →
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Upload Image Panel - LEFT SIDE */}
          {isUploadPanelOpen && (
            <div className="absolute left-0 top-0 bottom-0 bg-white border-r border-gray-300 w-[480px] overflow-hidden z-20 shadow-xl">
              <div className="h-full flex flex-col">
                <div className="p-5 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl">Upload Image</h2>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="size-2 rounded-full bg-green-500"></div>
                        <span className="text-gray-600">Available</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="size-8 hover:bg-gray-200" onClick={() => setIsUploadPanelOpen(false)}>
                      <X className="size-5" />
                    </Button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 min-h-0">
                  <div className="h-full space-y-4">
                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    
                    {/* Upload area */}
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
                    >
                      <Upload className="size-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-sm mb-1 font-medium">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-500">PNG, JPG or SVG (max. 10MB)</p>
                      {isUploading && (
                        <p className="text-xs text-blue-600 mt-2">Uploading...</p>
                      )}
                    </div>

                    {/* Validation Error/Warning */}
                    {validationWarning && (
                      <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <AlertCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs font-medium text-red-800 mb-1">
                            Upload Blocked
                          </p>
                          <p className="text-xs text-red-700">
                            {validationWarning}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Error */}
                    {uploadError && (
                      <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <AlertCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs font-medium text-red-800 mb-1">
                            Upload Failed
                          </p>
                          <p className="text-xs text-red-700">{uploadError}</p>
                        </div>
                      </div>
                    )}

                    {/* Guidelines */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-xs font-medium text-blue-900 mb-2">Best Practices</p>
                      <ul className="space-y-1.5 text-xs text-blue-800">
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 mt-0.5">•</span>
                          <span>Use images with at least 2000px on the shortest side</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 mt-0.5">•</span>
                          <span>PNG format with transparent background works best</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 mt-0.5">•</span>
                          <span>High resolution ensures sharp prints (300 DPI recommended)</span>
                        </li>
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs text-gray-500">Recent Uploads</p>
                      {recentUploads.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 text-sm">
                          <ImageIcon className="size-12 mx-auto mb-2 opacity-30" />
                          <p>No uploads yet</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3">
                          {recentUploads.slice(0, 6).map((upload, index) => (
                            <div 
                              key={upload.timestamp + index}
                              onClick={() => handleRecentUploadClick(upload.url)}
                              className="aspect-square bg-gray-100 rounded-lg border-2 border-gray-200 p-2 hover:border-blue-500 transition-colors cursor-pointer"
                            >
                              <img 
                                src={upload.url} 
                                alt="Recent upload" 
                                className="size-full object-contain rounded"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Add Text Panel - LEFT SIDE */}
          {isTextPanelOpen && (
            <div className="absolute left-0 top-0 bottom-0 bg-white border-r border-gray-300 w-[480px] overflow-hidden z-20 shadow-xl">
              <div className="h-full flex flex-col">
                <div className="p-5 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl">Add Text</h2>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="size-2 rounded-full bg-green-500"></div>
                        <span className="text-gray-600">Available</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="size-8 hover:bg-gray-200" onClick={() => setIsTextPanelOpen(false)}>
                      <X className="size-5" />
                    </Button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 min-h-0">
                  <div className="h-full space-y-4">
                    <div>
                      <Label>Text Content</Label>
                      <Input 
                        placeholder="Enter your text here..." 
                        className="mt-1" 
                        value={textContent}
                        onChange={(e) => setTextContent(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label className="text-xs text-gray-500 mb-2 block">Font Styles</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {['Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 'Comic Sans MS'].map((font) => (
                          <button
                            key={font}
                            onClick={() => setSelectedFont(font)}
                            className={`p-3 border-2 rounded-lg transition-colors text-left text-sm ${
                              selectedFont === font 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-200 hover:border-gray-400'
                            }`}
                            style={{ fontFamily: font }}
                          >
                            {font}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs text-gray-500 mb-2 block">Text Size</Label>
                      <div className="flex gap-2">
                        {(['Small', 'Medium', 'Large', 'X-Large'] as const).map((size) => (
                          <button
                            key={size}
                            onClick={() => setSelectedTextSize(size)}
                            className={`flex-1 p-2 border-2 rounded-lg transition-colors text-xs ${
                              selectedTextSize === size 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-200 hover:border-gray-400'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs text-gray-500 mb-2 block">Colors</Label>
                      <div className="grid grid-cols-6 gap-2">
                        {['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#808080', '#800000', '#008000', '#000080'].map((color) => (
                          <button
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            className={`aspect-square rounded-lg border-2 transition-colors ${
                              selectedColor === color 
                                ? 'border-blue-500 ring-2 ring-blue-200' 
                                : 'border-gray-300 hover:border-gray-500'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    <Button 
                      className="w-full bg-gray-800 hover:bg-gray-700"
                      onClick={handleAddText}
                    >
                      Add Text to Design
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* My Library Panel - LEFT SIDE */}
          {isLibraryPanelOpen && (
            <div className="absolute left-0 top-0 bottom-0 bg-white border-r border-gray-300 w-[480px] overflow-hidden z-20 shadow-xl">
              <div className="h-full flex flex-col">
                <div className="p-5 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl">My Library</h2>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="size-2 rounded-full bg-green-500"></div>
                        <span className="text-gray-600">Available</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="size-8 hover:bg-gray-200" onClick={() => setIsLibraryPanelOpen(false)}>
                      <X className="size-5" />
                    </Button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 min-h-0">
                  <div className="h-full space-y-4">
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500">Saved Designs</p>
                      <div className="grid grid-cols-2 gap-3">
                        {[1, 2, 3, 4].map((item) => (
                          <div key={item} className="aspect-square bg-gray-100 rounded-lg border-2 border-gray-200 overflow-hidden hover:border-gray-400 transition-colors cursor-pointer">
                            <div className="size-full flex flex-col items-center justify-center p-4">
                              <Layers className="size-12 text-gray-400 mb-2" />
                              <p className="text-xs text-gray-600">Design {item}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs text-gray-500">Saved Images</p>
                      <div className="grid grid-cols-2 gap-3">
                        {[1, 2].map((item) => (
                          <div key={item} className="aspect-square bg-gray-100 rounded-lg border-2 border-gray-200 overflow-hidden hover:border-gray-400 transition-colors cursor-pointer">
                            <div className="size-full flex items-center justify-center">
                              <ImageIcon className="size-12 text-gray-400" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Graphics Panel - LEFT SIDE */}
          {isGraphicsPanelOpen && (
            <div className="absolute left-0 top-0 bottom-0 bg-white border-r border-gray-300 w-[480px] overflow-hidden z-20 shadow-xl">
              <div className="h-full flex flex-col">
                <div className="p-5 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl">Graphics</h2>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="size-2 rounded-full bg-green-500"></div>
                        <span className="text-gray-600">{graphics.length} Available</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="size-8 hover:bg-gray-200" onClick={() => setIsGraphicsPanelOpen(false)}>
                      <X className="size-5" />
                    </Button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 min-h-0">
                  <div className="h-full space-y-4">
                    {/* Category Filter Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {(['all', 'icon', 'logo', 'illustration', 'template'] as const).map((cat) => (
                        <Button
                          key={cat}
                          variant={selectedGraphicCategory === cat ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            setSelectedGraphicCategory(cat);
                            fetchGraphics(cat === 'all' ? undefined : cat);
                          }}
                          className="capitalize shrink-0"
                        >
                          {cat}
                        </Button>
                      ))}
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500">
                        {selectedGraphicCategory === 'all' ? 'All Graphics' : `${selectedGraphicCategory.charAt(0).toUpperCase() + selectedGraphicCategory.slice(1)}s`}
                      </p>
                      {graphics.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                          <ImageIcon className="size-16 mx-auto mb-3 opacity-30" />
                          <p>No graphics available</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3">
                          {graphics.map((graphic) => (
                            <div 
                              key={graphic.id} 
                              className="aspect-square bg-gray-50 rounded-lg border-2 border-gray-200 overflow-hidden hover:border-blue-400 transition-colors cursor-pointer p-2"
                              onClick={() => handleAddGraphic(graphic.cloudinary_url)}
                            >
                              <img 
                                src={graphic.thumbnail_url} 
                                alt={graphic.name}
                                className="size-full object-contain"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Patterns/Textures Panel - LEFT SIDE */}
          {isPatternsPanelOpen && (
            <div className="absolute left-0 top-0 bottom-0 bg-white border-r border-gray-300 w-[480px] overflow-hidden z-20 shadow-xl">
              <div className="h-full flex flex-col">
                <div className="p-5 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl">Patterns & Textures</h2>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="size-2 rounded-full bg-green-500"></div>
                        <span className="text-gray-600">{patterns.length} Available</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="size-8 hover:bg-gray-200" onClick={() => setIsPatternsPanelOpen(false)}>
                      <X className="size-5" />
                    </Button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 min-h-0">
                  <div className="h-full space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                      <p className="font-medium mb-1">How to use patterns:</p>
                      <p className="text-xs">1. Select an object on the canvas</p>
                      <p className="text-xs">2. Click a pattern to apply it as fill</p>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500">Available Patterns</p>
                      {patterns.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                          <Grid3x3 className="size-16 mx-auto mb-3 opacity-30" />
                          <p>No patterns available</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3">
                          {patterns.map((pattern) => (
                            <div 
                              key={pattern.id} 
                              className="aspect-square bg-gray-50 rounded-lg border-2 border-gray-200 overflow-hidden hover:border-blue-400 transition-colors cursor-pointer"
                              onClick={() => handleApplyPattern(pattern.cloudinary_url)}
                            >
                              <img 
                                src={pattern.thumbnail_url} 
                                alt={pattern.name}
                                className="size-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Layers Panel - RIGHT SIDE */}
          {activeTab === 'layers' && (
            <div className="absolute right-0 top-0 bottom-0 bg-white border-l border-gray-300 w-[480px] overflow-hidden z-20 shadow-xl">
              <div className="h-full flex flex-col">
                <div className="p-5 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Layers className="size-5 text-gray-700" />
                      <h2 className="text-xl">Layers</h2>
                    </div>
                    <Button variant="ghost" size="icon" className="size-8 hover:bg-gray-200" onClick={() => setActiveTab('edit')}>
                      <X className="size-5" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="size-2 rounded-full bg-blue-500"></div>
                    <span className="text-gray-600">{fabricCanvas.canvasObjects.length} {fabricCanvas.canvasObjects.length === 1 ? 'object' : 'objects'}</span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  {fabricCanvas.canvasObjects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-6">
                      <Layers className="size-16 text-gray-300 mb-4" />
                      <p className="text-sm text-gray-600 mb-2">No objects yet</p>
                      <p className="text-xs text-gray-500">
                        Add text, images, or graphics to see them listed here
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">{[...fabricCanvas.canvasObjects].reverse().map((obj, index) => {
                        const isSelected = fabricCanvas.selectedObject === obj;
                        const isExpanded = expandedLayerIds.has(obj);
                        const objectType = obj.type || 'object';
                        const actualIndex = fabricCanvas.canvasObjects.length - 1 - index;
                        
                        const getObjectIcon = () => {
                          if (objectType === 'i-text' || objectType === 'text') return '📝';
                          if (objectType === 'image') return '🖼️';
                          if (objectType === 'rect') return '▭';
                          if (objectType === 'circle') return '⭕';
                          if (objectType === 'polygon') return '⬠';
                          return '📦';
                        };
                        
                        const getObjectLabel = () => {
                          if (objectType === 'i-text' || objectType === 'text') {
                            const text = (obj as any).text || '';
                            return text.length > 25 ? text.substring(0, 25) + '...' : text || 'Empty Text';
                          }
                          if (objectType === 'image') return 'Image';
                          if (objectType === 'rect') return 'Rectangle';
                          if (objectType === 'circle') return 'Circle';
                          if (objectType === 'polygon') return 'Polygon';
                          return 'Object';
                        };

                        const handleLayerAction = (action: 'front' | 'forward' | 'backward' | 'back', e: React.MouseEvent) => {
                          e.stopPropagation();
                          if (!fabricCanvas.canvasRef) return;

                          const canvas = fabricCanvas.canvasRef;
                          
                          // Perform the action
                          if (action === 'front') {
                            canvas.bringObjectToFront(obj);
                          } else if (action === 'forward') {
                            canvas.bringObjectForward(obj);
                          } else if (action === 'backward') {
                            canvas.sendObjectBackwards(obj);
                          } else if (action === 'back') {
                            canvas.sendObjectToBack(obj);
                          }
                          
                          canvas.renderAll();
                          
                          // Update the objects list to reflect new order
                          fabricCanvas.updateCanvasObjects?.();
                          
                          // Auto-collapse the layer controls after action
                          setExpandedLayerIds(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(obj);
                            return newSet;
                          });
                          
                          // Visual feedback - button flash
                          const button = e.currentTarget as HTMLButtonElement;
                          button.classList.add('bg-blue-500', 'text-white');
                          setTimeout(() => {
                            button.classList.remove('bg-blue-500', 'text-white');
                          }, 200);
                        };

                        return (
                          <div 
                            key={actualIndex} 
                            className={`border rounded-lg overflow-hidden transition-all ${
                              isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                            } ${(obj as any).customProps?.locked ? 'opacity-60 bg-gray-50' : ''}`}
                          >
                            {/* Compact Header */}
                            <div className={`flex items-center gap-2 p-2.5 transition-colors ${
                              (obj as any).customProps?.locked ? 'bg-gray-100' : 'bg-white hover:bg-gray-50'
                            }`}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const newExpanded = new Set(expandedLayerIds);
                                  if (isExpanded) {
                                    newExpanded.delete(obj);
                                  } else {
                                    newExpanded.add(obj);
                                  }
                                  setExpandedLayerIds(newExpanded);
                                }}
                                className="p-1 hover:bg-gray-200 rounded transition-colors"
                                title={isExpanded ? 'Collapse' : 'Expand controls'}
                              >
                                <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                              </button>
                              
                              <div 
                                className="flex items-center gap-2 flex-1 cursor-pointer"
                                onClick={() => {
                                  fabricCanvas.canvasRef?.setActiveObject(obj);
                                  fabricCanvas.canvasRef?.renderAll();
                                  setIsPropertiesPanelOpen(true);
                                }}
                              >
                                <span className="text-lg">{getObjectIcon()}</span>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-xs font-medium truncate">{getObjectLabel()}</h4>
                                </div>
                              </div>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleLock(obj);
                                }}
                                className={`p-1 hover:bg-gray-200 rounded transition-colors ${
                                  (obj as any).customProps?.locked ? 'text-red-600' : 'text-gray-400'
                                }`}
                                title={(obj as any).customProps?.locked ? 'Unlock object' : 'Lock object'}
                              >
                                {(obj as any).customProps?.locked ? (
                                  <Lock className="h-4 w-4" />
                                ) : (
                                  <Unlock className="h-4 w-4" />
                                )}
                              </button>
                              
                              <div className={`text-[10px] px-1.5 py-0.5 rounded ${
                                isSelected ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                              }`}>
                                #{index + 1}
                              </div>
                            </div>
                            
                            {/* Collapsible Layer Controls */}
                            {isExpanded && (
                              <div className="px-2.5 pb-2.5 bg-gray-50 border-t border-gray-200">
                                <div className="grid grid-cols-4 gap-1.5 pt-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 px-1 text-[10px] flex flex-col items-center justify-center gap-0.5 hover:bg-blue-100 transition-colors"
                                    onClick={(e) => handleLayerAction('front', e)}
                                    title="Bring to Front"
                                  >
                                    <ChevronsUp className="h-3 w-3" />
                                    <span>Front</span>
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 px-1 text-[10px] flex flex-col items-center justify-center gap-0.5 hover:bg-blue-100 transition-colors"
                                    onClick={(e) => handleLayerAction('forward', e)}
                                    title="Bring Forward"
                                  >
                                    <ChevronUp className="h-3 w-3" />
                                    <span>Forward</span>
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 px-1 text-[10px] flex flex-col items-center justify-center gap-0.5 hover:bg-blue-100 transition-colors"
                                    onClick={(e) => handleLayerAction('backward', e)}
                                    title="Send Backward"
                                  >
                                    <ChevronDown className="h-3 w-3" />
                                    <span>Backward</span>
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 px-1 text-[10px] flex flex-col items-center justify-center gap-0.5 hover:bg-blue-100 transition-colors"
                                    onClick={(e) => handleLayerAction('back', e)}
                                    title="Send to Back"
                                  >
                                    <ChevronsDown className="h-3 w-3" />
                                    <span>Back</span>
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Properties Panel - RIGHT SIDE */}
          <PropertiesPanel
            isOpen={isPropertiesPanelOpen}
            onClose={() => setIsPropertiesPanelOpen(false)}
            selectedObject={fabricCanvas.selectedObject}
            canvas={fabricCanvas.canvasRef}
            onUpdate={handleObjectUpdate}
            onLayerUpdate={fabricCanvas.updateCanvasObjects}
          />

          {/* Canvas Area */}
          <div 
            className="flex-1 overflow-hidden flex flex-col bg-gray-50 relative canvas-area-container"
            style={{ 
              cursor: isPanningCanvas ? 'grabbing' : 'default'
            }}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
          >
            {/* Pan Overlay - appears when Space is pressed */}
            {spaceKeyPressed && (
              <div
                className="absolute inset-0 z-50"
                style={{ cursor: isSpacePanning ? 'grabbing' : 'grab' }}
                onMouseDown={handleOverlayMouseDown}
                onMouseMove={handleOverlayMouseMove}
                onMouseUp={handleOverlayMouseUp}
                onMouseLeave={handleOverlayMouseUp}
              />
            )}

            {/* Canvas container - takes up available space */}
            <div className="flex-1 flex items-center justify-center overflow-hidden p-4">

            {/* CSS Transform Wrapper - applies zoom and pan */}
            <div 
              className={`canvas-transform-wrapper ${!isPanning ? 'zoom-transition' : ''}`}
              style={{
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${canvasScale})`,
                transformOrigin: 'center center',
              }}
            >
              {/* Design Area Box with Canvas */}
              <div
                className="relative border-2 border-dashed border-blue-600 rounded bg-white shadow-lg design-area-box"
                style={{
                  width: `${Math.round(PRINT_AREA_PRESETS[printAreaSize].width * (DEFAULT_ZOOM / 100))}px`,
                  height: `${Math.round(PRINT_AREA_PRESETS[printAreaSize].height * (DEFAULT_ZOOM / 100))}px`,
                }}
              >
                <div className="absolute -top-6 left-0 text-xs bg-blue-600 text-white px-2 py-0.5 rounded" style={{ pointerEvents: 'none' }}>
                  Design Area - {PRINT_AREA_PRESETS[printAreaSize].label}
                </div>
                
                {/* Fabric.js Canvas - positioned inside design area */}
                <canvas 
                  id="design-canvas" 
                  className="absolute inset-0"
                  style={{
                    width: `${Math.round(PRINT_AREA_PRESETS[printAreaSize].width * (DEFAULT_ZOOM / 100))}px`,
                    height: `${Math.round(PRINT_AREA_PRESETS[printAreaSize].height * (DEFAULT_ZOOM / 100))}px`,
                  }}
                />
              </div>
            </div>
            </div>

            {/* Front/Back Toggle - At bottom with transparent container */}
            <div className="py-4 flex items-center justify-center gap-3">
              <button
                onClick={() => setSelectedView('front')}
                className={`px-6 py-2.5 rounded-full transition-all shadow-md ${
                  selectedView === 'front'
                    ? 'bg-gray-800 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                Front side
              </button>
              <button
                onClick={() => setSelectedView('back')}
                className={`px-6 py-2.5 rounded-full transition-all shadow-md ${
                  selectedView === 'back'
                    ? 'bg-gray-800 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                Back side
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="bg-white border-t px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Undo/Redo Buttons */}
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              title="Undo (Ctrl+Z)"
            >
              <Undo className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={handleRedo}
              disabled={historyIndex >= historyStack.length - 1}
              title="Redo (Ctrl+Y)"
            >
              <Redo className="size-4" />
            </Button>
            
            <div className="w-px h-6 bg-gray-300 mx-1"></div>
            
            {/* Save Button */}
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3"
              onClick={handleSave}
              disabled={!activeVariant || designStatus.type === 'saving'}
              title="Save Design"
            >
              <Save className="size-4 mr-1.5" />
              Save
            </Button>
            
            {/* Save Status Indicator */}
            {(designStatus.type === 'saving' || designStatus.type === 'saved' || designStatus.type === 'save-error') && (
              <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded ${
                designStatus.type === 'saving' ? 'bg-blue-50 text-blue-700' :
                designStatus.type === 'saved' ? 'bg-green-50 text-green-700' :
                'bg-red-50 text-red-700'
              }`}>
                {designStatus.type === 'saving' && (
                  <>
                    <div className="size-3 border-2 border-blue-700 border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                )}
                {designStatus.type === 'saved' && (
                  <>
                    <Check className="size-3" />
                    <span>Saved</span>
                  </>
                )}
                {designStatus.type === 'save-error' && (
                  <>
                    <AlertCircle className="size-3" />
                    <span>Failed</span>
                  </>
                )}
              </div>
            )}
            
            <div className="w-px h-6 bg-gray-300 mx-1"></div>
            
            {/* Alignment Tools */}
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={alignLeft}
              disabled={!fabricCanvas.selectedObject}
              title="Align Left"
            >
              <AlignLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={alignCenter}
              disabled={!fabricCanvas.selectedObject}
              title="Align Center"
            >
              <AlignCenter className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={alignRight}
              disabled={!fabricCanvas.selectedObject}
              title="Align Right"
            >
              <AlignRight className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={alignTop}
              disabled={!fabricCanvas.selectedObject}
              title="Align Top"
            >
              <AlignVerticalJustifyCenter className="size-4" style={{ transform: 'rotate(90deg)' }} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={alignMiddle}
              disabled={!fabricCanvas.selectedObject}
              title="Align Middle"
            >
              <AlignVerticalJustifyCenter className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={alignBottom}
              disabled={!fabricCanvas.selectedObject}
              title="Align Bottom"
            >
              <AlignVerticalJustifyCenter className="size-4" style={{ transform: 'rotate(-90deg)' }} />
            </Button>
            
            <div className="w-px h-6 bg-gray-300 mx-1"></div>
            
            {/* Distribution Tools */}
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={distributeHorizontally}
              disabled={!fabricCanvas.selectedObject || fabricCanvas.canvasRef?.getActiveObject()?.type !== 'activeSelection'}
              title="Distribute Horizontally"
            >
              <AlignHorizontalSpaceAround className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={distributeVertically}
              disabled={!fabricCanvas.selectedObject || fabricCanvas.canvasRef?.getActiveObject()?.type !== 'activeSelection'}
              title="Distribute Vertically"
            >
              <AlignVerticalSpaceAround className="size-4" />
            </Button>
            
            <div className="w-px h-6 bg-gray-300 mx-1"></div>
            
            {/* Grid & Snap Tools */}
            <Button
              variant={showGrid ? "default" : "outline"}
              size="icon"
              className="size-8"
              onClick={() => setShowGrid(!showGrid)}
              title="Toggle Grid"
            >
              <Grid3x3 className="size-4" />
            </Button>
            <Button
              variant={snapToGrid ? "default" : "outline"}
              size="icon"
              className="size-8"
              onClick={() => setSnapToGrid(!snapToGrid)}
              disabled={!showGrid}
              title="Snap to Grid"
            >
              <Maximize className="size-4" />
            </Button>
            <Select value={gridSize.toString()} onValueChange={(value) => setGridSize(Number(value))}>
              <SelectTrigger className="h-8 w-[70px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10px</SelectItem>
                <SelectItem value="20">20px</SelectItem>
                <SelectItem value="50">50px</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="w-px h-6 bg-gray-300 mx-1"></div>
            
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={zoomOut}
              title="Zoom Out (Ctrl+-)"
            >
              <ZoomOut className="size-4" />
            </Button>
            <span className="text-sm min-w-[50px] text-center">{Math.round(canvasScale * 100)}%</span>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={zoomIn}
              title="Zoom In (Ctrl++)"
            >
              <ZoomIn className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8 ml-1"
              onClick={resetView}
              title="Reset View (Ctrl+0)"
            >
              <RotateCcw className="size-4" />
            </Button>
            
            {/* Zoom Presets */}
            <select
              value={Math.round(canvasScale * 100)}
              onChange={(e) => zoomToPreset(Number(e.target.value))}
              className="zoom-preset-select ml-2"
            >
              <option value={25}>25%</option>
              <option value={50}>50%</option>
              <option value={75}>75%</option>
              <option value={100}>100%</option>
              <option value={150}>150%</option>
              <option value={200}>200%</option>
              <option value={300}>300%</option>
              <option value={400}>400%</option>
            </select>
          </div>

          <Button size="sm" className="bg-green-600 hover:bg-green-700">
            Save Product
          </Button>
        </div>
      </div>
      </div>
    </CanvasProvider>
  );
}

export default CustomDesignPage;