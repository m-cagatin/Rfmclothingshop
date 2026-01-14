import { Button } from '../ui/button';
import { X } from 'lucide-react';
import { Canvas, Object as FabricObject, IText, Image as FabricImage } from 'fabric';
import { UniversalControls } from './UniversalControls';
import { TextControls } from './TextControls';
import { ImageControls } from './ImageControls';
import { ShapeControls } from './ShapeControls';

interface PropertiesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedObject: FabricObject | null;
  canvas: Canvas | null;
  onUpdate: (props: Partial<FabricObject>) => void;
}

export function PropertiesPanel({ 
  isOpen, 
  onClose, 
  selectedObject, 
  canvas,
  onUpdate 
}: PropertiesPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute left-0 top-0 bottom-0 bg-white border-r border-gray-300 w-[480px] overflow-hidden z-20 shadow-xl">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-xl">Properties</h2>
              {selectedObject && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="size-2 rounded-full bg-green-500"></div>
                  <span className="text-gray-600">Object Selected</span>
                </div>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="size-8 hover:bg-gray-200" 
              onClick={onClose}
            >
              <X className="size-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {selectedObject ? (
            <PropertiesContent 
              object={selectedObject} 
              canvas={canvas}
              onUpdate={onUpdate}
            />
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      <div className="size-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <svg 
          className="size-8 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" 
          />
        </svg>
      </div>
      <p className="text-sm text-gray-600 mb-2">No object selected</p>
      <p className="text-xs text-gray-500">
        Click on any text, image, or shape on the canvas to edit its properties
      </p>
    </div>
  );
}

function PropertiesContent({ 
  object, 
  canvas,
  onUpdate 
}: { 
  object: FabricObject; 
  canvas: Canvas | null;
  onUpdate: (props: Partial<FabricObject>) => void;
}) {
  // Get object type for display
  const getObjectTypeLabel = (obj: FabricObject): string => {
    const type = obj.type || 'object';
    if (type === 'i-text' || type === 'text') return 'Text';
    if (type === 'image') return 'Image';
    if (type === 'rect') return 'Rectangle';
    if (type === 'circle') return 'Circle';
    if (type === 'polygon') return 'Polygon';
    return 'Object';
  };

  const getObjectTypeIcon = (obj: FabricObject): string => {
    const type = obj.type || 'object';
    if (type === 'i-text' || type === 'text') return '📝';
    if (type === 'image') return '🖼️';
    if (type === 'rect') return '▭';
    if (type === 'circle') return '⭕';
    if (type === 'polygon') return '⬠';
    return '📦';
  };

  return (
    <div className="space-y-4">
      {/* Object Type Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
        <span className="text-2xl">{getObjectTypeIcon(object)}</span>
        <div>
          <h3 className="font-medium">{getObjectTypeLabel(object)}</h3>
          <p className="text-xs text-gray-500">Type: {object.type}</p>
        </div>
      </div>

      {/* Universal Controls - Phase 2 */}
      {canvas && (
        <UniversalControls
          object={object}
          canvas={canvas}
          onUpdate={onUpdate}
        />
      )}

      {/* Text-Specific Controls - Phase 3 */}
      {canvas && (object.type === 'i-text' || object.type === 'text') && (
        <TextControls
          object={object as IText}
          canvas={canvas}
          onUpdate={onUpdate}
        />
      )}

      {/* Image-Specific Controls - Phase 4 */}
      {canvas && object.type === 'image' && (
        <ImageControls
          object={object as FabricImage}
          canvas={canvas}
          onUpdate={onUpdate}
        />
      )}

      {/* Shape-Specific Controls - Phase 5 */}
      {canvas && (object.type === 'rect' || object.type === 'circle' || object.type === 'polygon' || object.type === 'triangle') && (
        <ShapeControls
          object={object}
          canvas={canvas}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
}
