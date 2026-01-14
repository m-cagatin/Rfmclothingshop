import React, { useState, useEffect } from 'react';
import { Canvas, Object as FabricObject, Rect, Circle } from 'fabric';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Slider } from '../ui/slider';

interface ShapeControlsProps {
  object: FabricObject;
  canvas: Canvas;
  onUpdate: (updates: Record<string, any>) => void;
}

export function ShapeControls({ object, canvas, onUpdate }: ShapeControlsProps) {
  const [fillColor, setFillColor] = useState('#000000');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(0);
  const [cornerRadius, setCornerRadius] = useState(0);

  useEffect(() => {
    if (!object) return;

    setFillColor((object.fill as string) || '#000000');
    setStrokeColor((object.stroke as string) || '#000000');
    setStrokeWidth(object.strokeWidth || 0);
    
    // Corner radius only for rectangles
    if (object.type === 'rect') {
      setCornerRadius((object as Rect).rx || 0);
    }
  }, [object]);

  const handleFillColorChange = (value: string) => {
    setFillColor(value);
    onUpdate({ fill: value });
  };

  const handleStrokeColorChange = (value: string) => {
    setStrokeColor(value);
    onUpdate({ stroke: value });
  };

  const handleStrokeWidthChange = (value: number[]) => {
    const width = value[0];
    setStrokeWidth(width);
    onUpdate({ strokeWidth: width });
  };

  const handleCornerRadiusChange = (value: number[]) => {
    const radius = value[0];
    setCornerRadius(radius);
    onUpdate({ rx: radius, ry: radius });
  };

  const isRect = object.type === 'rect';

  return (
    <div className="space-y-4 pt-4 border-t border-gray-200">
      <Label className="text-xs font-semibold text-gray-700 block">Shape Properties</Label>

      {/* Fill Color */}
      <div>
        <Label className="text-xs text-gray-600 mb-1 block">Fill Color</Label>
        <div className="flex gap-2">
          <input
            type="color"
            value={fillColor}
            onChange={(e) => handleFillColorChange(e.target.value)}
            className="h-9 w-16 border border-gray-300 rounded cursor-pointer"
          />
          <Input
            type="text"
            value={fillColor}
            onChange={(e) => handleFillColorChange(e.target.value)}
            className="flex-1 h-9 text-sm font-mono"
            placeholder="#000000"
          />
        </div>
      </div>

      {/* Stroke Color */}
      <div>
        <Label className="text-xs text-gray-600 mb-1 block">Stroke Color</Label>
        <div className="flex gap-2">
          <input
            type="color"
            value={strokeColor}
            onChange={(e) => handleStrokeColorChange(e.target.value)}
            className="h-9 w-16 border border-gray-300 rounded cursor-pointer"
          />
          <Input
            type="text"
            value={strokeColor}
            onChange={(e) => handleStrokeColorChange(e.target.value)}
            className="flex-1 h-9 text-sm font-mono"
            placeholder="#000000"
          />
        </div>
      </div>

      {/* Stroke Width */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-xs text-gray-600">Stroke Width</Label>
          <span className="text-xs text-gray-600">{strokeWidth}px</span>
        </div>
        <Slider
          value={[strokeWidth]}
          onValueChange={handleStrokeWidthChange}
          min={0}
          max={50}
          step={1}
          className="w-full"
        />
      </div>

      {/* Corner Radius (only for rectangles) */}
      {isRect && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-xs text-gray-600">Corner Radius</Label>
            <span className="text-xs text-gray-600">{Math.round(cornerRadius)}px</span>
          </div>
          <Slider
            value={[cornerRadius]}
            onValueChange={handleCornerRadiusChange}
            min={0}
            max={100}
            step={1}
            className="w-full"
          />
        </div>
      )}
    </div>
  );
}
