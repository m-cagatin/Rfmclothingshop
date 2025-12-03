import { useState, useEffect } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '../ui/button';

interface VariantImageFile {
  file: File;
  preview: string;
  customPublicId?: string;
  folder: string;
}

interface VariantImageUploadZoneDeferredProps {
  label: string;
  required?: boolean;
  value?: VariantImageFile | null;
  onChange: (value: VariantImageFile | null) => void;
  productCode?: string;
  description?: string;
  maxSizeMB?: number;
}

export function VariantImageUploadZoneDeferred({ 
  label, 
  required, 
  value, 
  onChange, 
  productCode,
  description, 
  maxSizeMB = 10 
}: VariantImageUploadZoneDeferredProps) {
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(value?.preview || null);

  useEffect(() => {
    if (value?.preview) {
      setPreview(value.preview);
    }
  }, [value]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Image size must be less than ${maxSizeMB}MB`);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const previewUrl = reader.result as string;
      setPreview(previewUrl);

      const timestamp = Date.now();
      const customPublicId = productCode 
        ? `${productCode}_variant_${timestamp}`
        : undefined;

      const imageFile: VariantImageFile = {
        file,
        preview: previewUrl,
        customPublicId,
        folder: 'Customizable Products/Variant IMG',
      };

      onChange(imageFile);
    };

    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setPreview(null);
    onChange(null);
    setError(null);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}

      {!preview ? (
        <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="upload-variant"
          />
          <label
            htmlFor="upload-variant"
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            <Upload className="size-8 text-gray-400" />
            <span className="text-sm text-gray-600">
              Click to upload or drag and drop
            </span>
            <span className="text-xs text-gray-400">
              JPG, PNG, SVG (max {maxSizeMB}MB)
            </span>
          </label>
        </div>
      ) : (
        <div className="relative border rounded-lg p-4">
          <img
            src={preview}
            alt={label}
            className="w-full h-48 object-contain rounded"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemove}
          >
            <X className="size-4" />
          </Button>
          <p className="text-xs text-gray-500 mt-2 text-center">
            ✓ Ready to upload on save
          </p>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
