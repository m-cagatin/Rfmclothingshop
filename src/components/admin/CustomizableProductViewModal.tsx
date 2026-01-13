import { X } from 'lucide-react';
import { Button } from '../ui/button';
import { CustomizableProduct } from '../../types/customizableProduct';
import { Badge } from '../ui/badge';
import { useState } from 'react';

interface CustomizableProductViewModalProps {
  product: CustomizableProduct;
  onClose: () => void;
}

export function CustomizableProductViewModal({ product, onClose }: CustomizableProductViewModalProps) {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto p-4">
        <div className="bg-white rounded-lg w-full max-w-4xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">{product.name}</h2>
            <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
              {product.status}
            </Badge>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="size-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Basic Information */}
          <section>
            <h3 className="font-semibold text-lg border-b pb-2 mb-4">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <p className="font-medium">{product.category}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <p className="font-medium">{product.type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Fit Type</p>
                <p className="font-medium">{product.fitType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Available Sizes</p>
                <p className="font-medium">{product.sizes?.join(', ') || 'N/A'}</p>
              </div>
            </div>
            {product.fitDescription && (
              <div className="mt-4">
                <p className="text-sm text-gray-500">Fit Description</p>
                <p className="font-medium">{product.fitDescription}</p>
              </div>
            )}
            <div className="mt-4">
              <p className="text-sm text-gray-500">Description</p>
              <p className="font-medium">{product.description}</p>
            </div>
          </section>

          {/* Product Images */}
          <section>
            <h3 className="font-semibold text-lg border-b pb-2 mb-4">Product Images</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-2">Front View</p>
                <div 
                  className="relative w-full aspect-[3/4] border rounded-lg overflow-hidden cursor-pointer group"
                  onClick={() => setLightboxImage(product.images?.find(img => img.type === 'front')?.url || product.images?.[0]?.url || '')}
                >
                  <img
                    src={product.images?.find(img => img.type === 'front')?.url || product.images?.[0]?.url || ''}
                    alt="Front view"
                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Back View</p>
                <div 
                  className="relative w-full aspect-[3/4] border rounded-lg overflow-hidden cursor-pointer group"
                  onClick={() => setLightboxImage(product.images?.find(img => img.type === 'back')?.url || product.images?.[1]?.url || '')}
                >
                  <img
                    src={product.images?.find(img => img.type === 'back')?.url || product.images?.[1]?.url || ''}
                    alt="Back view"
                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              </div>
            </div>
            
            {/* Additional Images */}
            {product.images?.filter(img => img.type === 'additional').length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">Additional Images</p>
                <div className="grid grid-cols-3 gap-3">
                  {product.images.filter(img => img.type === 'additional').map((img, idx) => (
                    <div
                      key={img.id || idx}
                      className="relative w-full aspect-[3/4] border rounded-lg overflow-hidden cursor-pointer group"
                      onClick={() => setLightboxImage(img.url)}
                    >
                      <img
                        src={img.url}
                        alt={`Additional ${idx + 1}`}
                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Material & Fabric */}
          {(product.fabricComposition || product.fabricWeight || product.texture) && (
            <section>
              <h3 className="font-semibold text-lg border-b pb-2 mb-4">Material & Fabric</h3>
              <div className="grid grid-cols-3 gap-4">
                {product.fabricComposition && (
                  <div>
                    <p className="text-sm text-gray-500">Fabric Composition</p>
                    <p className="font-medium">{product.fabricComposition}</p>
                  </div>
                )}
                {product.fabricWeight && (
                  <div>
                    <p className="text-sm text-gray-500">Fabric Weight</p>
                    <p className="font-medium">{product.fabricWeight}</p>
                  </div>
                )}
                {product.texture && (
                  <div>
                    <p className="text-sm text-gray-500">Texture</p>
                    <p className="font-medium">{product.texture}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Pricing */}
          <section>
            <h3 className="font-semibold text-lg border-b pb-2 mb-4">Pricing</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Base Cost</p>
                <p className="text-2xl font-semibold">₱{product.baseCost.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Retail Price</p>
                <p className="text-2xl font-semibold text-green-600">₱{product.retailPrice.toFixed(2)}</p>
              </div>
            </div>
            
            {/* Print Costs */}
            {(product.frontPrintCost || product.backPrintCost) && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                {product.frontPrintCost && product.frontPrintCost > 0 && (
                  <div>
                    <p className="text-sm text-gray-500">Front Print Cost</p>
                    <p className="font-semibold">₱{product.frontPrintCost.toFixed(2)}</p>
                  </div>
                )}
                {product.backPrintCost && product.backPrintCost > 0 && (
                  <div>
                    <p className="text-sm text-gray-500">Back Print Cost</p>
                    <p className="font-semibold">₱{product.backPrintCost.toFixed(2)}</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Size Pricing */}
            {product.sizePricing && Object.keys(product.sizePricing).length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">Additional Charges by Size</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(product.sizePricing).map(([size, price]) => (
                    <div key={size} className="px-3 py-1 bg-gray-100 rounded border text-sm">
                      {size}: +₱{Number(price).toFixed(2)}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm">
                Profit Margin: <span className="font-semibold">₱{(product.retailPrice - product.baseCost).toFixed(2)}</span>
                {' '}({(((product.retailPrice - product.baseCost) / product.retailPrice) * 100).toFixed(1)}%)
              </p>
            </div>
          </section>

          {/* Colors & Variants */}
          <section>
            <h3 className="font-semibold text-lg border-b pb-2 mb-4">Colors & Variants</h3>
            <div className="space-y-4">
              {product.color && (product.color.name || product.color.hexCode) && (
                <div className="flex items-center gap-3 p-3 border rounded-lg w-fit">
                  <div
                    className="size-12 rounded border flex-shrink-0"
                    style={{ backgroundColor: product.color.hexCode || '#ffffff' }}
                  />
                  <div>
                    <p className="font-medium">{product.color.name || 'Unnamed color'}</p>
                    {product.color.hexCode && (
                      <p className="text-xs text-gray-500">{product.color.hexCode}</p>
                    )}
                  </div>
                </div>
              )}

              {product.variant && (product.variant.name || product.variant.image) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Variant Image</p>
                    {product.variant.image ? (
                      <div 
                        className="relative w-full aspect-[3/4] border rounded-lg overflow-hidden cursor-pointer group"
                        onClick={() => setLightboxImage(product.variant?.image || '')}
                      >
                        <img
                          src={product.variant.image}
                          alt={product.variant.name || 'Variant'}
                          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">No variant image</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Variant Name</p>
                    <p className="font-medium">{product.variant.name || '—'}</p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Print & Customization */}
          <section>
            <h3 className="font-semibold text-lg border-b pb-2 mb-4">Print & Customization</h3>
            <div className="space-y-4">
              {product.printMethod && (
                <div>
                  <p className="text-sm text-gray-500">Print Method</p>
                  <p className="font-medium">{product.printMethod}</p>
                </div>
              )}
              {product.printAreas && product.printAreas.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500">Print Areas</p>
                  <p className="font-medium">{product.printAreas.join(', ')}</p>
                </div>
              )}
              {product.designRequirements && (
                <div>
                  <p className="text-sm text-gray-500">Design Requirements</p>
                  <p className="font-medium">{product.designRequirements}</p>
                </div>
              )}
            </div>
          </section>

          {/* Business Details */}
          <section>
            <h3 className="font-semibold text-lg border-b pb-2 mb-4">Business Details</h3>
            <div className="grid grid-cols-2 gap-4">
              {product.turnaroundTime && (
                <div>
                  <p className="text-sm text-gray-500">Turnaround Time</p>
                  <p className="font-medium">{product.turnaroundTime}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Minimum Order Quantity</p>
                <p className="font-medium">{product.minOrderQuantity}</p>
              </div>
            </div>
          </section>

          {/* Meta Information */}
          <section>
            <h3 className="font-semibold text-lg border-b pb-2 mb-4">Meta Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Created At</p>
                <p className="font-medium">{new Date(product.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="font-medium">{new Date(product.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t bg-gray-50">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300"
            onClick={() => setLightboxImage(null)}
          >
            <X className="size-8" />
          </button>
          <img
            src={lightboxImage}
            alt="Full size"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
