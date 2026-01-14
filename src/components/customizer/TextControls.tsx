import React, { useState, useEffect } from 'react';
import { Canvas, IText } from 'fabric';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

interface TextControlsProps {
  object: IText;
  canvas: Canvas;
  onUpdate: (updates: Record<string, any>) => void;
}

const FONT_FAMILIES = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Georgia',
  'Verdana',
  'Comic Sans MS',
  'Courier New',
  'Impact',
  'Trebuchet MS',
  'Arial Black',
];

const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80, 96];

export function TextControls({ object, canvas, onUpdate }: TextControlsProps) {
  const [text, setText] = useState('');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontSize, setFontSize] = useState(40);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right' | 'justify'>('left');
  const [textColor, setTextColor] = useState('#000000');

  // Update local state when object changes
  useEffect(() => {
    if (!object || object.type !== 'i-text') return;

    setText(object.text || '');
    setFontFamily(object.fontFamily || 'Arial');
    setFontSize(object.fontSize || 40);
    setIsBold((object.fontWeight as string) === 'bold');
    setIsItalic(object.fontStyle === 'italic');
    setIsUnderline(object.underline || false);
    setTextAlign((object.textAlign as any) || 'left');
    setTextColor((object.fill as string) || '#000000');
  }, [object]);

  const handleTextChange = (value: string) => {
    setText(value);
    onUpdate({ text: value });
  };

  const handleFontFamilyChange = (value: string) => {
    setFontFamily(value);
    onUpdate({ fontFamily: value });
  };

  const handleFontSizeChange = (value: string) => {
    const size = parseInt(value) || 40;
    setFontSize(size);
    onUpdate({ fontSize: size });
  };

  const toggleBold = () => {
    const newBold = !isBold;
    setIsBold(newBold);
    onUpdate({ fontWeight: newBold ? 'bold' : 'normal' });
  };

  const toggleItalic = () => {
    const newItalic = !isItalic;
    setIsItalic(newItalic);
    onUpdate({ fontStyle: newItalic ? 'italic' : 'normal' });
  };

  const toggleUnderline = () => {
    const newUnderline = !isUnderline;
    setIsUnderline(newUnderline);
    onUpdate({ underline: newUnderline });
  };

  const handleAlignChange = (align: 'left' | 'center' | 'right' | 'justify') => {
    setTextAlign(align);
    onUpdate({ textAlign: align });
  };

  const handleColorChange = (value: string) => {
    setTextColor(value);
    onUpdate({ fill: value });
  };

  return (
    <div className="space-y-4 pt-4 border-t border-gray-200">
      <Label className="text-xs font-semibold text-gray-700 block">Text Properties</Label>

      {/* Text Content */}
      <div>
        <Label className="text-xs text-gray-600 mb-1 block">Content</Label>
        <Textarea
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          className="text-sm resize-none"
          rows={3}
          placeholder="Enter text..."
        />
      </div>

      {/* Font Family */}
      <div>
        <Label className="text-xs text-gray-600 mb-1 block">Font</Label>
        <select
          value={fontFamily}
          onChange={(e) => handleFontFamilyChange(e.target.value)}
          className="w-full h-9 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {FONT_FAMILIES.map((font) => (
            <option key={font} value={font} style={{ fontFamily: font }}>
              {font}
            </option>
          ))}
        </select>
      </div>

      {/* Font Size */}
      <div>
        <Label className="text-xs text-gray-600 mb-1 block">Size</Label>
        <div className="flex gap-2">
          <select
            value={fontSize}
            onChange={(e) => handleFontSizeChange(e.target.value)}
            className="flex-1 h-9 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {FONT_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}px
              </option>
            ))}
          </select>
          <Input
            type="number"
            value={fontSize}
            onChange={(e) => handleFontSizeChange(e.target.value)}
            className="w-20 h-9 text-sm"
            min="8"
            max="500"
          />
        </div>
      </div>

      {/* Text Style Toggles */}
      <div>
        <Label className="text-xs text-gray-600 mb-2 block">Style</Label>
        <div className="flex gap-2">
          <Button
            variant={isBold ? 'default' : 'outline'}
            size="sm"
            onClick={toggleBold}
            className="flex-1"
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant={isItalic ? 'default' : 'outline'}
            size="sm"
            onClick={toggleItalic}
            className="flex-1"
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant={isUnderline ? 'default' : 'outline'}
            size="sm"
            onClick={toggleUnderline}
            className="flex-1"
            title="Underline"
          >
            <Underline className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Text Alignment */}
      <div>
        <Label className="text-xs text-gray-600 mb-2 block">Alignment</Label>
        <div className="grid grid-cols-4 gap-2">
          <Button
            variant={textAlign === 'left' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleAlignChange('left')}
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            variant={textAlign === 'center' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleAlignChange('center')}
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            variant={textAlign === 'right' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleAlignChange('right')}
            title="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
          <Button
            variant={textAlign === 'justify' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleAlignChange('justify')}
            title="Justify"
          >
            <AlignJustify className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Text Color */}
      <div>
        <Label className="text-xs text-gray-600 mb-1 block">Color</Label>
        <div className="flex gap-2">
          <input
            type="color"
            value={textColor}
            onChange={(e) => handleColorChange(e.target.value)}
            className="h-9 w-16 border border-gray-300 rounded cursor-pointer"
          />
          <Input
            type="text"
            value={textColor}
            onChange={(e) => handleColorChange(e.target.value)}
            className="flex-1 h-9 text-sm font-mono"
            placeholder="#000000"
          />
        </div>
      </div>
    </div>
  );
}
