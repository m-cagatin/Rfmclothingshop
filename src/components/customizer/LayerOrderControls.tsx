import React from 'react';
import { Canvas, Object as FabricObject } from 'fabric';
import { ChevronsUp, ChevronUp, ChevronDown, ChevronsDown } from 'lucide-react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';

interface LayerOrderControlsProps {
  object: FabricObject;
  canvas: Canvas;
  onUpdate?: () => void;
}

export function LayerOrderControls({ object, canvas, onUpdate }: LayerOrderControlsProps) {
  const bringToFront = () => {
    canvas.bringObjectToFront(object);
    canvas.renderAll();
    onUpdate?.();
  };

  const bringForward = () => {
    canvas.bringObjectForward(object);
    canvas.renderAll();
    onUpdate?.();
  };

  const sendBackward = () => {
    canvas.sendObjectBackwards(object);
    canvas.renderAll();
    onUpdate?.();
  };

  const sendToBack = () => {
    canvas.sendObjectToBack(object);
    canvas.renderAll();
    onUpdate?.();
  };

  return (
    <div className="space-y-3 pt-4 border-t border-gray-200">
      <Label className="text-xs font-semibold text-gray-700 block">Layer Order</Label>
      
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={bringToFront}
          className="flex items-center justify-center gap-2"
          title="Bring to Front"
        >
          <ChevronsUp className="h-4 w-4" />
          <span className="text-xs">To Front</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={bringForward}
          className="flex items-center justify-center gap-2"
          title="Bring Forward"
        >
          <ChevronUp className="h-4 w-4" />
          <span className="text-xs">Forward</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={sendBackward}
          className="flex items-center justify-center gap-2"
          title="Send Backward"
        >
          <ChevronDown className="h-4 w-4" />
          <span className="text-xs">Backward</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={sendToBack}
          className="flex items-center justify-center gap-2"
          title="Send to Back"
        >
          <ChevronsDown className="h-4 w-4" />
          <span className="text-xs">To Back</span>
        </Button>
      </div>
    </div>
  );
}
