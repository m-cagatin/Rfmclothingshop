import { useState } from 'react';
import { ProductImage } from '../../types/customizableProduct';

interface ProductImageGalleryProps {
  images: ProductImage[];
  productName: string;
}

export function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-400">No image available</p>
      </div>
    );
  }

  const activeImage = images[activeIndex];

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
        <img
          src={activeImage.url}
          alt={`${productName} - ${activeImage.type}`}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((img, index) => (
            <button
              key={img.id || index}
              onClick={() => setActiveIndex(index)}
              className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                activeIndex === index
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img
                src={img.url}
                alt={`${productName} thumbnail ${index + 1}`}
                className="w-full h-full object-contain"
              />
            </button>
          ))}
        </div>
      )}

      {/* Image Type Label */}
      <div className="text-center">
        <span className="text-sm text-gray-600 capitalize">
          {activeImage.type} View
        </span>
      </div>
    </div>
  );
}
