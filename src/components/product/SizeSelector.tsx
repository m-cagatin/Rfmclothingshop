import { Button } from '../ui/button';

interface SizeSelectorProps {
  sizes: string[];
  selectedSize: string;
  onSizeSelect: (size: string) => void;
  sizeAvailability?: Record<string, boolean>;
  sizePricing?: Record<string, number>;
}

export function SizeSelector({
  sizes,
  selectedSize,
  onSizeSelect,
  sizeAvailability = {},
  sizePricing = {},
}: SizeSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Select Size</label>
        {selectedSize && sizePricing[selectedSize] && (
          <span className="text-xs text-orange-600">
            +₱{sizePricing[selectedSize]} extra
          </span>
        )}
      </div>

      <div className="grid grid-cols-6 gap-2">
        {sizes.map((size) => {
          const isAvailable = sizeAvailability[size] !== false;
          const isSelected = selectedSize === size;

          return (
            <Button
              key={size}
              variant={isSelected ? 'default' : 'outline'}
              size="sm"
              disabled={!isAvailable}
              onClick={() => onSizeSelect(size)}
              className={`${
                isSelected
                  ? 'bg-gray-800 hover:bg-gray-700 text-white'
                  : 'hover:bg-gray-100'
              } ${!isAvailable ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              {size}
            </Button>
          );
        })}
      </div>

      {!selectedSize && (
        <p className="text-xs text-gray-500">Please select a size</p>
      )}
    </div>
  );
}
