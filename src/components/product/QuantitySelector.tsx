import { Minus, Plus } from 'lucide-react';
import { Button } from '../ui/button';

interface QuantitySelectorProps {
  quantity: number;
  onQuantityChange: (qty: number) => void;
  minQuantity?: number;
  maxQuantity?: number;
}

export function QuantitySelector({
  quantity,
  onQuantityChange,
  minQuantity = 1,
  maxQuantity = 999,
}: QuantitySelectorProps) {
  const handleDecrease = () => {
    if (quantity > minQuantity) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (quantity < maxQuantity) {
      onQuantityChange(quantity + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || minQuantity;
    const clampedValue = Math.max(minQuantity, Math.min(maxQuantity, value));
    onQuantityChange(clampedValue);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Quantity</label>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={handleDecrease}
          disabled={quantity <= minQuantity}
          className="size-10"
        >
          <Minus className="size-4" />
        </Button>

        <input
          type="number"
          value={quantity}
          onChange={handleInputChange}
          min={minQuantity}
          max={maxQuantity}
          className="w-20 h-10 text-center border-2 border-gray-200 rounded-lg font-medium focus:outline-none focus:border-blue-500"
        />

        <Button
          variant="outline"
          size="icon"
          onClick={handleIncrease}
          disabled={quantity >= maxQuantity}
          className="size-10"
        >
          <Plus className="size-4" />
        </Button>
      </div>
      {minQuantity > 1 && (
        <p className="text-xs text-gray-500">Minimum order: {minQuantity} piece(s)</p>
      )}
    </div>
  );
}
