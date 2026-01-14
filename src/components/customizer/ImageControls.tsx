import React, { useState, useEffect } from 'react';
import { Canvas, Image as FabricImage } from 'fabric';
import { RefreshCw, Upload } from 'lucide-react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';

interface ImageControlsProps {
  object: FabricImage;
  canvas: Canvas;
  onUpdate: (updates: Record<string, any>) => void;
}

export function ImageControls({ object, canvas, onUpdate }: ImageControlsProps) {
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);

  useEffect(() => {
    if (!object || object.type !== 'image') return;

    // Get current filter values
    const filters = (object as any).filters || [];
    const brightnessFilter = filters.find((f: any) => f.type === 'Brightness');
    const contrastFilter = filters.find((f: any) => f.type === 'Contrast');
    const saturationFilter = filters.find((f: any) => f.type === 'Saturation');

    setBrightness(brightnessFilter?.brightness || 0);
    setContrast(contrastFilter?.contrast || 0);
    setSaturation(saturationFilter?.saturation || 0);
  }, [object]);

  const applyFilters = async (filterType: string, value: number) => {
    if (!object) return;

    // Fabric.js v6 filters - import from filters namespace
    const fabric = await import('fabric');
    const filters = fabric.filters;
    
    let currentFilters = (object as any).filters || [];
    
    // Remove existing filter of this type
    currentFilters = currentFilters.filter((f: any) => f.constructor.name !== filterType);
    
    // Add new filter if value is not default
    if (filterType === 'Brightness' && value !== 0) {
      currentFilters.push(new filters.Brightness({ brightness: value }));
    } else if (filterType === 'Contrast' && value !== 0) {
      currentFilters.push(new filters.Contrast({ contrast: value }));
    } else if (filterType === 'Saturation' && value !== 0) {
      currentFilters.push(new filters.Saturation({ saturation: value }));
    }
    
    (object as any).filters = currentFilters;
    object.applyFilters();
    canvas.renderAll();
  };

  const handleBrightnessChange = (value: number[]) => {
    const brightness = value[0] / 100;
    setBrightness(brightness);
    applyFilters('Brightness', brightness);
  };

  const handleContrastChange = (value: number[]) => {
    const contrast = value[0] / 100;
    setContrast(contrast);
    applyFilters('Contrast', contrast);
  };

  const handleSaturationChange = (value: number[]) => {
    const saturation = value[0] / 100;
    setSaturation(saturation);
    applyFilters('Saturation', saturation);
  };

  const resetFilters = () => {
    setBrightness(0);
    setContrast(0);
    setSaturation(0);
    (object as any).filters = [];
    object.applyFilters();
    canvas.renderAll();
  };

  return (
    <div className="space-y-4 pt-4 border-t border-gray-200">
      <Label className="text-xs font-semibold text-gray-700 block">Image Adjustments</Label>

      {/* Brightness */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-xs text-gray-600">Brightness</Label>
          <span className="text-xs text-gray-600">{Math.round(brightness * 100)}</span>
        </div>
        <Slider
          value={[brightness * 100]}
          onValueChange={handleBrightnessChange}
          min={-100}
          max={100}
          step={1}
          className="w-full"
        />
      </div>

      {/* Contrast */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-xs text-gray-600">Contrast</Label>
          <span className="text-xs text-gray-600">{Math.round(contrast * 100)}</span>
        </div>
        <Slider
          value={[contrast * 100]}
          onValueChange={handleContrastChange}
          min={-100}
          max={100}
          step={1}
          className="w-full"
        />
      </div>

      {/* Saturation */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-xs text-gray-600">Saturation</Label>
          <span className="text-xs text-gray-600">{Math.round(saturation * 100)}</span>
        </div>
        <Slider
          value={[saturation * 100]}
          onValueChange={handleSaturationChange}
          min={-100}
          max={100}
          step={1}
          className="w-full"
        />
      </div>

      {/* Reset Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={resetFilters}
        className="w-full"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Reset Filters
      </Button>
    </div>
  );
}
