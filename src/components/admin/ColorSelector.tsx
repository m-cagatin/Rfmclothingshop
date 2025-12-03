import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface ColorVariant {
  id: string;
  name: string;
  hexCode: string;
}

interface ColorSelectorProps {
  colors: ColorVariant[];
  onChange: (colors: ColorVariant[]) => void;
}

export function ColorSelector({ colors, onChange }: ColorSelectorProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newColor, setNewColor] = useState({ name: '', hexCode: '#000000' });

  const handleAddColor = () => {
    if (!newColor.name.trim()) {
      alert('Please enter a color name');
      return;
    }

    const color: ColorVariant = {
      id: Date.now().toString(),
      name: newColor.name,
      hexCode: newColor.hexCode,
    };

    onChange([...colors, color]);
    setNewColor({ name: '', hexCode: '#000000' });
    setShowAddForm(false);
  };

  const handleRemoveColor = (id: string) => {
    onChange(colors.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">
          Available Colors <span className="text-red-500">*</span>
        </label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <Plus className="size-4 mr-2" />
          Add Color
        </Button>
      </div>

      {/* Add Color Form */}
      {showAddForm && (
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium mb-1 block">Color Name</label>
              <Input
                placeholder="e.g., Navy Blue"
                value={newColor.name}
                onChange={(e) => setNewColor({ ...newColor, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Hex Code</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={newColor.hexCode}
                  onChange={(e) => setNewColor({ ...newColor, hexCode: e.target.value })}
                  className="h-10 w-12 rounded border border-gray-300 cursor-pointer"
                />
                <Input
                  placeholder="#000000"
                  value={newColor.hexCode}
                  onChange={(e) => setNewColor({ ...newColor, hexCode: e.target.value })}
                />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="button" size="sm" onClick={handleAddColor}>
              Add Color
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAddForm(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Colors List */}
      {colors.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {colors.map((color) => (
            <div
              key={color.id}
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-white group"
            >
              <div
                className="size-10 rounded border border-gray-300 flex-shrink-0"
                style={{ backgroundColor: color.hexCode }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{color.name}</p>
                <p className="text-xs text-gray-500">{color.hexCode}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemoveColor(color.id)}
              >
                <X className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
          <p className="text-sm text-gray-500">No colors added yet</p>
        </div>
      )}
    </div>
  );
}
