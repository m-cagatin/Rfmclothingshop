import React, { useState, useEffect } from 'react';
import { Canvas, Object as FabricObject } from 'fabric';
import { Lock, Unlock, RotateCw } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';

interface UniversalControlsProps {
  object: FabricObject;
  canvas: Canvas;
  onUpdate: (updates: Record<string, any>) => void;
}

export function UniversalControls({ object, canvas, onUpdate }: UniversalControlsProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [rotation, setRotation] = useState(0);
  const [opacity, setOpacity] = useState(100);
  const [aspectRatioLocked, setAspectRatioLocked] = useState(true);
  const [aspectRatio, setAspectRatio] = useState(1);

  // Update local state when object changes
  useEffect(() => {
    if (!object) return;

    const updateValues = () => {
      setPosition({
        x: Math.round(object.left || 0),
        y: Math.round(object.top || 0),
      });
      
      const width = Math.round((object.width || 0) * (object.scaleX || 1));
      const height = Math.round((object.height || 0) * (object.scaleY || 1));
      
      setSize({ width, height });
      setRotation(Math.round(object.angle || 0));
      setOpacity(Math.round((object.opacity || 1) * 100));
      
      if (width && height) {
        setAspectRatio(width / height);
      }
    };

    updateValues();

    // Listen to object modifications
    const handleModified = () => updateValues();
    object.on('modified', handleModified);
    object.on('scaling', handleModified);
    object.on('rotating', handleModified);
    object.on('moving', handleModified);

    return () => {
      object.off('modified', handleModified);
      object.off('scaling', handleModified);
      object.off('rotating', handleModified);
      object.off('moving', handleModified);
    };
  }, [object]);

  const handlePositionChange = (axis: 'x' | 'y', value: string) => {
    const numValue = parseFloat(value) || 0;
    if (axis === 'x') {
      setPosition(prev => ({ ...prev, x: numValue }));
      onUpdate({ left: numValue });
    } else {
      setPosition(prev => ({ ...prev, y: numValue }));
      onUpdate({ top: numValue });
    }
  };

  const handleSizeChange = (dimension: 'width' | 'height', value: string) => {
    const numValue = parseFloat(value) || 0;
    
    if (dimension === 'width') {
      const newWidth = numValue;
      const scaleX = newWidth / (object.width || 1);
      
      if (aspectRatioLocked) {
        const newHeight = newWidth / aspectRatio;
        const scaleY = newHeight / (object.height || 1);
        setSize({ width: newWidth, height: Math.round(newHeight) });
        onUpdate({ scaleX, scaleY });
      } else {
        setSize(prev => ({ ...prev, width: newWidth }));
        onUpdate({ scaleX });
      }
    } else {
      const newHeight = numValue;
      const scaleY = newHeight / (object.height || 1);
      
      if (aspectRatioLocked) {
        const newWidth = newHeight * aspectRatio;
        const scaleX = newWidth / (object.width || 1);
        setSize({ width: Math.round(newWidth), height: newHeight });
        onUpdate({ scaleX, scaleY });
      } else {
        setSize(prev => ({ ...prev, height: newHeight }));
        onUpdate({ scaleY });
      }
    }
  };

  const handleRotationChange = (value: number) => {
    setRotation(value);
    onUpdate({ angle: value });
  };

  const handleOpacityChange = (value: number[]) => {
    const newOpacity = value[0];
    setOpacity(newOpacity);
    onUpdate({ opacity: newOpacity / 100 });
  };

  return (
    <div className="space-y-4">
      {/* Position Controls */}
      <div>
        <Label className="text-xs font-semibold text-gray-700 mb-2 block">Position</Label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs text-gray-600 mb-1 block">X</Label>
            <Input
              type="number"
              value={position.x}
              onChange={(e) => handlePositionChange('x', e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs text-gray-600 mb-1 block">Y</Label>
            <Input
              type="number"
              value={position.y}
              onChange={(e) => handlePositionChange('y', e.target.value)}
              className="h-8 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Size Controls */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-xs font-semibold text-gray-700">Size</Label>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setAspectRatioLocked(!aspectRatioLocked)}
            title={aspectRatioLocked ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
          >
            {aspectRatioLocked ? (
              <Lock className="h-3 w-3" />
            ) : (
              <Unlock className="h-3 w-3" />
            )}
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs text-gray-600 mb-1 block">W</Label>
            <Input
              type="number"
              value={size.width}
              onChange={(e) => handleSizeChange('width', e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs text-gray-600 mb-1 block">H</Label>
            <Input
              type="number"
              value={size.height}
              onChange={(e) => handleSizeChange('height', e.target.value)}
              className="h-8 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Rotation Control */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-xs font-semibold text-gray-700">Rotation</Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={rotation}
              onChange={(e) => handleRotationChange(parseFloat(e.target.value) || 0)}
              className="h-7 w-16 text-xs text-center"
              min="0"
              max="360"
            />
            <span className="text-xs text-gray-500">°</span>
          </div>
        </div>
        <Slider
          value={[rotation]}
          onValueChange={(value) => handleRotationChange(value[0])}
          min={0}
          max={360}
          step={1}
          className="w-full"
        />
      </div>

      {/* Opacity Control */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-xs font-semibold text-gray-700">Opacity</Label>
          <span className="text-xs text-gray-600">{opacity}%</span>
        </div>
        <Slider
          value={[opacity]}
          onValueChange={handleOpacityChange}
          min={0}
          max={100}
          step={1}
          className="w-full"
        />
      </div>
    </div>
  );
}
