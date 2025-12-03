import { useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { uploadToCloudinary, CloudinaryFolder } from '../../services/cloudinary';

interface VariantImageUploadZoneProps {
  label: string;
  required?: boolean;
  value?: { url: string; publicId: string };
  onChange: (value: { url: string; publicId: string } | null) => void;
  productCode?: string; // Product code for organizing images
  description?: string;
  maxSizeMB?: number;
}

export function VariantImageUploadZone({ 
  label, 
  required, 
  value, 
  onChange, 
  productCode,
  description, 
  maxSizeMB = 10 
}: VariantImageUploadZoneProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setUploading(true);
    setProgress(0);

    try {
      // Generate custom public ID with product code
      const timestamp = Date.now();
      const customPublicId = productCode 
        ? `${productCode}_variant_${timestamp}`
        : undefined;

      const result = await uploadToCloudinary(
        file, 
        CloudinaryFolder.CUSTOMIZABLE_PRODUCTS_VARIANT, 
        (p) => setProgress(p),
        customPublicId
      );
      
      onChange({
        url: result.url,
        publicId: result.publicId,
      });
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleRemove = () => {
    onChange(null);
    setError(null);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}
      
      {error && (
        <div className="text-xs text-red-500 bg-red-50 p-2 rounded border border-red-200">
          {error}
        </div>
      )}

      {value?.url ? (
        <div className="relative w-full h-48 border-2 border-gray-200 rounded-lg overflow-hidden group">
          <img src={value.url} alt={label} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemove}
              disabled={uploading}
            >
              <X className="size-4 mr-2" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <>
          <label className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
            uploading 
              ? 'border-purple-400 bg-purple-50' 
              : 'border-gray-300 hover:border-gray-400 bg-gray-50'
          }`}>
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {uploading ? (
                <>
                  <Loader2 className="size-10 mb-3 text-purple-500 animate-spin" />
                  <p className="mb-2 text-sm text-gray-600 font-semibold">
                    Uploading... {Math.round(progress)}%
                  </p>
                </>
              ) : (
                <>
                  <Upload className="size-10 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-400">PNG, JPG, SVG (MAX. {maxSizeMB}MB)</p>
                </>
              )}
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>
          
          {uploading && progress > 0 && (
            <div className="w-full">
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </>
      )}
    </div>
  );
}
