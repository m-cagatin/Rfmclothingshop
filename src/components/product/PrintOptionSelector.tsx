interface PrintOption {
  id: 'none' | 'front' | 'back';
  label: string;
  price: number;
}

interface PrintOptionSelectorProps {
  basePrice: number;
  frontPrintCost: number;
  backPrintCost: number;
  selectedOption: 'none' | 'front' | 'back';
  onOptionSelect: (option: 'none' | 'front' | 'back') => void;
}

export function PrintOptionSelector({
  basePrice,
  frontPrintCost,
  backPrintCost,
  selectedOption,
  onOptionSelect,
}: PrintOptionSelectorProps) {
  const options: PrintOption[] = [
    { id: 'none', label: 'No Print', price: basePrice },
    { id: 'front', label: 'Front Print', price: basePrice + frontPrintCost },
    { id: 'back', label: 'Back Print', price: basePrice + backPrintCost },
  ];

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Print Option</label>

      <div className="space-y-2">
        {options.map((option) => {
          const isSelected = selectedOption === option.id;

          return (
            <button
              key={option.id}
              onClick={() => onOptionSelect(option.id)}
              className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`size-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? 'border-blue-500' : 'border-gray-300'
                    }`}
                  >
                    {isSelected && (
                      <div className="size-2.5 rounded-full bg-blue-500" />
                    )}
                  </div>
                  <span className="font-medium">{option.label}</span>
                </div>
                <span className="text-lg font-semibold">₱{option.price.toFixed(2)}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
