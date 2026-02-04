import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Switch } from '../ui/switch';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Badge } from '../ui/badge';
import { ImageUploadZoneDeferred } from './ImageUploadZoneDeferred';
import { VariantImageUploadZoneDeferred } from './VariantImageUploadZoneDeferred';
import { CustomizableProduct, ProductImage, ProductImageFile, VariantSample } from '../../types/customizableProduct';
import { parseColorInput } from '../../utils/colorUtils';
import { CloudinaryFolder, uploadToCloudinary, deleteImage } from '../../services/cloudinary';

interface CustomizableProductFormProps {
  product?: CustomizableProduct;
  onSave: (product: Omit<CustomizableProduct, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const CATEGORIES = [
  'T-Shirt - Chinese Collar',
  'T-Shirt - V-Neck',
  'T-Shirt - Round Neck',
  'Jogging Pants',
  'Polo Shirt',
  'Sando (Jersey) - V-Neck',
  'Sando (Jersey) - Round Neck',
  'Sando (Jersey) - NBA Cut',
  'Shorts',
  'Warmers',
  'Varsity Jacket',
];
const TYPES = ['Unisex', 'Men', 'Women', 'Kids'];
const FIT_TYPES = [
  'Classic',
  'Slim Fit',
  'Regular Fit',
  'Relaxed Fit',
  'Oversized',
  'Tapered',
  'Athletic Fit',
  'Muscle Fit',
];
const ADULT_TOP_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];
const KIDS_TOP_SIZES = ['K6', 'K7', 'K8', 'K9', 'K10'];
const ADULT_PANTS_SIZES = ['26', '28', '30', '32', '34', '36', '38', '40', '42'];
const KIDS_PANTS_SIZES = ['22', '24', '26', '28', '30', '32'];
const ALL_SIZES = [
  ...ADULT_TOP_SIZES,
  ...KIDS_TOP_SIZES,
  ...ADULT_PANTS_SIZES,
  ...KIDS_PANTS_SIZES,
];
const PRINT_METHODS = ['DTG', 'Screen Print', 'Embroidery'];
const PRINT_AREAS = ['Front', 'Back'];

const AUTO_SIZE_PRICING: Record<string, number> = {
  'XL': 50,
  '2XL': 100,
  '3XL': 150,
};

const getAvailableSizes = (category: string, type: string): string[] => {
  const isTopWear = [
    'T-Shirt - Chinese Collar',
    'T-Shirt - V-Neck',
    'T-Shirt - Round Neck',
    'Polo Shirt',
    'Sando (Jersey) - V-Neck',
    'Sando (Jersey) - Round Neck',
    'Sando (Jersey) - NBA Cut',
    'Varsity Jacket',
  ].includes(category);
  
  const isBottomWear = [
    'Jogging Pants',
    'Shorts',
    'Warmers',
  ].includes(category);
  
  if (isTopWear) {
    return type === 'Kids' ? KIDS_TOP_SIZES : ADULT_TOP_SIZES;
  }
  
  if (isBottomWear) {
    return type === 'Kids' ? KIDS_PANTS_SIZES : ADULT_PANTS_SIZES;
  }
  
  return ADULT_TOP_SIZES;
};

export function CustomizableProductForm({ product, onSave, onCancel }: CustomizableProductFormProps) {
  // Generate a temporary product code for new products (for Cloudinary organization)
  const [productCode] = useState<string>(
    product?.id ? `CP${String(product.id).padStart(6, '0')}` : `TEMP${Date.now()}`
  );

  const [formData, setFormData] = useState<Omit<CustomizableProduct, 'id' | 'createdAt' | 'updatedAt'>>({
    category: product?.category || '',
    name: product?.name || '',
    type: product?.type || '',
    sizes: product?.sizes || [],
    fitType: product?.fitType || '',
    fitDescription: product?.fitDescription || '',
    description: product?.description || '',
    images: product?.images || [],
    fabricComposition: product?.fabricComposition || '',
    fabricWeight: product?.fabricWeight || '',
    texture: product?.texture || '',
    baseCost: product?.baseCost || 0,
    retailPrice: product?.retailPrice || 0,
    sizePricing: product?.sizePricing || {},
    frontPrintCost: product?.frontPrintCost || 0,
    backPrintCost: product?.backPrintCost || 0,
    sizeAvailability: product?.sizeAvailability || {},
    differentiationType: product?.differentiationType || 'none',
    color: product?.color || { name: '', hexCode: '' },
    variant: product?.variant || { name: '', image: '', publicId: '' },
    printMethod: product?.printMethod || '',
    printAreas: product?.printAreas || [],
    designRequirements: product?.designRequirements || 'Upload your design in high-resolution format (PNG, AI, or PSD). Ensure design dimensions match the selected print area.',
    turnaroundTime: product?.turnaroundTime || '5-7 business days for production. Rush orders available with additional fee.',
    minOrderQuantity: product?.minOrderQuantity || 1,
    status: product?.status || 'active',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [additionalImageSlots, setAdditionalImageSlots] = useState<number>(
    product?.images?.filter(img => img.type === 'additional').length || 0
  );
  const [isSaving, setIsSaving] = useState(false);
  
  // Hold pending image files (not uploaded yet)
  const [pendingImages, setPendingImages] = useState<{
    front?: ProductImageFile;
    back?: ProductImageFile;
    additional: ProductImageFile[];
    variant?: { file: File; preview: string; customPublicId?: string; folder: string };
  }>({
    additional: []
  });

  const handleSizeToggle = (size: string) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const handlePrintAreaToggle = (area: string) => {
    setFormData((prev) => ({
      ...prev,
      printAreas: prev.printAreas.includes(area)
        ? prev.printAreas.filter((a) => a !== area)
        : [...prev.printAreas, area],
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData['name'].trim()) newErrors['name'] = 'Product name is required';
    if (!formData['category']) newErrors['category'] = 'Category is required';
    if (!formData['type']) newErrors['type'] = 'Type is required';
    if (formData['sizes'].length === 0) newErrors['sizes'] = 'At least one size is required';
    
    // Check for required images (check both pendingImages and formData.images)
    const hasFrontImage = pendingImages.front || formData['images'].some(img => img.type === 'front');
    const hasBackImage = pendingImages.back || formData['images'].some(img => img.type === 'back');
    if (!hasFrontImage) newErrors['frontImage'] = 'Front image is required';
    if (!hasBackImage) newErrors['backImage'] = 'Back image is required';
    
    if (!formData['retailPrice'] || formData['retailPrice'] <= 0) newErrors['retailPrice'] = 'Retail price is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Step 1: Validate all fields
    if (!validateForm()) {
      alert('Please fill in all required fields correctly');
      return;
    }

    // Step 2: Check if images are selected
    const hasFrontImage = pendingImages.front || formData.images.some(img => img.type === 'front');
    const hasBackImage = pendingImages.back || formData.images.some(img => img.type === 'back');
    
    if (!hasFrontImage || !hasBackImage) {
      alert('Both front and back images are required');
      return;
    }

    // Step 3: Confirm with user
    const totalImages = (pendingImages.front ? 1 : 0) + (pendingImages.back ? 1 : 0) + pendingImages.additional.length;
    const confirmMessage = `
Ready to save "${formData.name}"?

✓ Category: ${formData.category}
✓ Type: ${formData.type}
✓ Sizes: ${formData.sizes.join(', ')}
✓ Images to upload: ${totalImages}
✓ Price: ₱${formData.retailPrice}

Click OK to upload images and save to database.
    `.trim();

    if (!confirm(confirmMessage)) {
      return;
    }

    // Step 4: Upload images and save
    setIsSaving(true);
    const uploadedImages: ProductImage[] = [...formData.images]; // Keep existing images
    const uploadedPublicIds: string[] = [];

    try {
      // Upload front image
      if (pendingImages.front) {
        const result = await uploadToCloudinary(
          pendingImages.front.file,
          pendingImages.front.folder as any,
          undefined,
          pendingImages.front.customPublicId
        );
        uploadedImages.push({
          url: result.url,
          publicId: result.publicId,
          type: 'front',
          displayOrder: 1
        });
        uploadedPublicIds.push(result.publicId);
      }

      // Upload back image
      if (pendingImages.back) {
        const result = await uploadToCloudinary(
          pendingImages.back.file,
          pendingImages.back.folder as any,
          undefined,
          pendingImages.back.customPublicId
        );
        uploadedImages.push({
          url: result.url,
          publicId: result.publicId,
          type: 'back',
          displayOrder: 1
        });
        uploadedPublicIds.push(result.publicId);
      }

      // Upload additional images
      for (const additionalImg of pendingImages.additional) {
        const result = await uploadToCloudinary(
          additionalImg.file,
          additionalImg.folder as any,
          undefined,
          additionalImg.customPublicId
        );
        uploadedImages.push({
          url: result.url,
          publicId: result.publicId,
          type: 'additional',
          displayOrder: additionalImg.displayOrder
        });
        uploadedPublicIds.push(result.publicId);
      }

      // Upload variant image if exists
      let variantData: VariantSample | undefined = undefined;
      if (formData.variant?.name && formData.variant.name.trim()) {
        if (pendingImages.variant) {
          const result = await uploadToCloudinary(
            pendingImages.variant.file,
            pendingImages.variant.folder as any,
            undefined,
            pendingImages.variant.customPublicId
          );
          variantData = {
            name: formData.variant.name.trim(),
            image: result.url,
            publicId: result.publicId
          };
          uploadedPublicIds.push(result.publicId);
        } else if (formData.variant.image) {
          // Keep existing variant data if no new image
          variantData = {
            name: formData.variant.name.trim(),
            image: formData.variant.image,
            publicId: formData.variant.publicId
          };
        }
      }

      // Save product with uploaded images
      const productData = {
        ...formData,
        images: uploadedImages,
        variant: variantData
      };

      await onSave(productData);
      // Success - parent component will handle close
      
    } catch (error) {
      console.error('Save failed:', error);
      
      // Rollback: Delete uploaded images
      for (const publicId of uploadedPublicIds) {
        try {
          await deleteImage(publicId);
        } catch (err) {
          console.error('Failed to delete image during rollback:', publicId, err);
        }
      }
      
      alert('Failed to save product. Uploaded images have been cleaned up. Please try again.');
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {product ? 'Edit Product' : 'Add New Customizable Product'}
          </h2>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="size-5" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-8 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* 1. Basic Information */}
          <section className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">1. Basic Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  Category <span className="text-red-500">*</span>
                </Label>
                <Select value={formData['category']} onValueChange={(value: string) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger className={errors['category'] ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors['category'] && <p className="text-xs text-red-500">{errors['category']}</p>}
              </div>

              <div className="space-y-2">
                <Label>
                  Product Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="e.g., Classic Round Neck Tee"
                  value={formData['name']}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={errors['name'] ? 'border-red-500' : ''}
                />
                {errors['name'] && <p className="text-xs text-red-500">{errors['name']}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  Type <span className="text-red-500">*</span>
                </Label>
                <Select value={formData['type']} onValueChange={(value: string) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger className={errors['type'] ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPES.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors['type'] && <p className="text-xs text-red-500">{errors['type']}</p>}
              </div>

              <div className="space-y-2">
                <Label>
                  Fit Type <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.fitType} onValueChange={(value: string) => setFormData({ ...formData, fitType: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select fit type" />
                  </SelectTrigger>
                  <SelectContent>
                    {FIT_TYPES.map((fit) => (
                      <SelectItem key={fit} value={fit}>{fit}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Label>
                Available Sizes & Stock Status <span className="text-red-500">*</span>
              </Label>
              <div className="text-xs text-muted-foreground bg-amber-50 p-3 rounded border border-amber-200 mb-3">
                ℹ️ <strong>Instructions:</strong> Check size to offer, set surcharge (auto-filled for XL/2XL/3XL), toggle stock status when out of stock.
              </div>
              
              <div className="space-y-2">
                {getAvailableSizes(formData.category, formData.type).map((size) => {
                  const isOffered = formData.sizes.includes(size);
                  const isAvailable = formData.sizeAvailability?.[size] !== false;
                  
                  return (
                    <div key={size} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50">
                      {/* Offer checkbox + Size label */}
                      <div className="flex items-center gap-2 w-24">
                        <Checkbox
                          checked={isOffered}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData({
                                ...formData,
                                sizes: [...formData.sizes, size],
                                sizePricing: {
                                  ...formData.sizePricing,
                                  [size]: AUTO_SIZE_PRICING[size] || 0
                                },
                                sizeAvailability: {
                                  ...formData.sizeAvailability,
                                  [size]: true
                                }
                              });
                            } else {
                              setFormData({
                                ...formData,
                                sizes: formData.sizes.filter(s => s !== size)
                              });
                            }
                          }}
                        />
                        <span className="font-medium">{size}</span>
                      </div>
                      
                      {/* Price surcharge */}
                      <div className="flex items-center gap-2 w-40">
                        <span className="text-sm text-gray-500">₱</span>
                        {isOffered ? (
                          <Input
                            type="number"
                            value={(formData.sizePricing || {})[size] || 0}
                            onChange={(e) => setFormData({
                              ...formData,
                              sizePricing: {
                                ...(formData.sizePricing || {}),
                                [size]: parseFloat(e.target.value) || 0
                              }
                            })}
                            className="w-24"
                          />
                        ) : (
                          <span className="text-gray-400 w-24">-</span>
                        )}
                      </div>
                      
                      {/* Stock status */}
                      {isOffered ? (
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={isAvailable}
                            onCheckedChange={(checked) => setFormData({
                              ...formData,
                              sizeAvailability: {
                                ...formData.sizeAvailability,
                                [size]: checked
                              }
                            })}
                          />
                          <Badge variant={isAvailable ? "default" : "secondary"}>
                            {isAvailable ? "In Stock" : "Out of Stock"}
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </div>
                  );
                })}
              </div>
              {errors['sizes'] && <p className="text-xs text-red-500">{errors['sizes']}</p>}
            </div>

            <div className="space-y-2">
              <Label>Product Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData({...formData, status: value as any})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active (Visible to customers)</SelectItem>
                  <SelectItem value="inactive">Inactive (Hidden temporarily)</SelectItem>
                  <SelectItem value="archived">Archived (Discontinued)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Fit Description</Label>
              <Input
                placeholder="e.g., Regular fit with comfortable cut"
                value={formData.fitDescription}
                onChange={(e) => setFormData({ ...formData, fitDescription: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Product Description</Label>
              <Textarea
                placeholder="Detailed description of the product..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>
          </section>

          {/* 2. Product Images */}
          <section className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">2. Product Images</h3>
            
            {/* Info Alert */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
              <strong className="text-blue-800">ℹ️ Note:</strong>{' '}
              <span className="text-blue-700">
                Images upload to Cloudinary immediately when selected. Make sure you want to keep them before clicking "Save Product".
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <ImageUploadZoneDeferred
                label="Front View"
                required
                value={pendingImages.front}
                onChange={(value) => {
                  setPendingImages(prev => ({ ...prev, front: value || undefined }));
                }}
                folder={CloudinaryFolder.CUSTOMIZABLE_PRODUCTS_FRONT}
                imageType="front"
                displayOrder={1}
                productCode={productCode}
                description="Upload front view of the product (JPG/PNG/SVG)"
                maxSizeMB={10}
              />
              <ImageUploadZoneDeferred
                label="Back View"
                required
                value={pendingImages.back}
                onChange={(value) => {
                  setPendingImages(prev => ({ ...prev, back: value || undefined }));
                }}
                folder={CloudinaryFolder.CUSTOMIZABLE_PRODUCTS_BACK}
                imageType="back"
                displayOrder={1}
                productCode={productCode}
                description="Upload back view of the product (JPG/PNG/SVG)"
                maxSizeMB={10}
              />
            </div>
            {(errors['frontImage'] || errors['backImage']) && (
              <p className="text-xs text-red-500">Both front and back images are required</p>
            )}

            {/* Additional Images (multiple, optional) */}
            <div className="space-y-2">
              <Label>Additional Images (optional)</Label>
              <p className="text-xs text-gray-500">JPG/PNG/SVG, max 10MB each - Max 5 images</p>
              <div className="space-y-4">
                {Array.from({ length: additionalImageSlots }).map((_, idx) => {
                  const existingImage = pendingImages.additional.find(
                    img => img.displayOrder === idx + 1
                  );
                  
                  return (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                      <ImageUploadZoneDeferred
                        label={`Additional Image ${idx + 1}`}
                        value={existingImage}
                        onChange={(value) => {
                          setPendingImages(prev => {
                            const otherImages = prev.additional.filter(img => img.displayOrder !== idx + 1);
                            return {
                              ...prev,
                              additional: value ? [...otherImages, { ...value, displayOrder: idx + 1 }] : otherImages
                            };
                          });
                        }}
                        folder={CloudinaryFolder.CUSTOMIZABLE_PRODUCTS_ADDITIONAL}
                        imageType="additional"
                        displayOrder={idx + 1}
                        productCode={productCode}
                        maxSizeMB={10}
                      />
                      <div className="flex gap-2 md:justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setPendingImages(prev => {
                              const filtered = prev.additional.filter(img => img.displayOrder !== idx + 1);
                              const renumbered = filtered.map(img => 
                                img.displayOrder > idx + 1 ? { ...img, displayOrder: img.displayOrder - 1 } : img
                              );
                              return { ...prev, additional: renumbered };
                            });
                            setAdditionalImageSlots(prev => prev - 1);
                          }}
                        >
                          Remove Slot
                        </Button>
                      </div>
                    </div>
                  );
                })}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAdditionalImageSlots(prev => prev + 1)}
                  disabled={additionalImageSlots >= 5}
                >
                  + Add Additional Image Slot {additionalImageSlots >= 5 && '(Max reached)'}
                </Button>
              </div>
            </div>
          </section>

          {/* 3. Material & Fabric */}
          <section className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">3. Material & Fabric</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Fabric Composition</Label>
                <Input
                  placeholder="e.g., 100% Cotton"
                  value={formData.fabricComposition}
                  onChange={(e) => setFormData({ ...formData, fabricComposition: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Fabric Weight</Label>
                <Input
                  placeholder="e.g., 180 g/m²"
                  value={formData.fabricWeight}
                  onChange={(e) => setFormData({ ...formData, fabricWeight: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Texture</Label>
                <Input
                  placeholder="e.g., Soft-washed"
                  value={formData.texture}
                  onChange={(e) => setFormData({ ...formData, texture: e.target.value })}
                />
              </div>
            </div>
          </section>

          {/* 4. Pricing */}
          <section className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">4. Pricing</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Base Cost (Your Cost)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₱</span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={formData.baseCost || ''}
                    onChange={(e) => setFormData({ ...formData, baseCost: parseFloat(e.target.value) || 0 })}
                    className="pl-8"
                  />
                </div>
                <p className="text-xs text-gray-500">Your production cost per unit</p>
              </div>
              <div className="space-y-2">
                <Label>
                  Retail Price <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₱</span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={formData['retailPrice'] || ''}
                    onChange={(e) => setFormData({ ...formData, retailPrice: parseFloat(e.target.value) || 0 })}
                    className={`pl-8 ${errors['retailPrice'] ? 'border-red-500' : ''}`}
                  />
                </div>
                <p className="text-xs text-gray-500">Customer price (before print fees)</p>
                {errors['retailPrice'] && <p className="text-xs text-red-500">{errors['retailPrice']}</p>}
              </div>
            </div>

            {/* Print Areas */}
            <div className="space-y-3">
              <Label>Print Areas</Label>
              <div className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="area-Front"
                    checked={formData.printAreas.includes('Front')}
                    onCheckedChange={() => handlePrintAreaToggle('Front')}
                  />
                  <label htmlFor="area-Front" className="text-sm cursor-pointer">
                    Front
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="area-Back"
                    checked={formData.printAreas.includes('Back')}
                    onCheckedChange={() => handlePrintAreaToggle('Back')}
                  />
                  <label htmlFor="area-Back" className="text-sm cursor-pointer">
                    Back
                  </label>
                </div>
              </div>
            </div>

            {/* Print Costs - Conditionally enabled */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className={!formData.printAreas.includes('Front') ? 'text-gray-400' : ''}>Front Print Cost (₱)</Label>
                <div className="relative">
                  <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${!formData.printAreas.includes('Front') ? 'text-gray-300' : 'text-gray-500'}`}>₱</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.frontPrintCost ?? ''}
                    onChange={(e) => setFormData({ ...formData, frontPrintCost: e.target.value === '' ? undefined : parseFloat(e.target.value) })}
                    placeholder="0.00"
                    className="pl-8"
                    disabled={!formData.printAreas.includes('Front')}
                  />
                </div>
                <p className={`text-xs ${!formData.printAreas.includes('Front') ? 'text-gray-400' : 'text-gray-500'}`}>Cost to add front print customization</p>
              </div>
              <div className="space-y-2">
                <Label className={!formData.printAreas.includes('Back') ? 'text-gray-400' : ''}>Back Print Cost (₱)</Label>
                <div className="relative">
                  <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${!formData.printAreas.includes('Back') ? 'text-gray-300' : 'text-gray-500'}`}>₱</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.backPrintCost ?? ''}
                    onChange={(e) => setFormData({ ...formData, backPrintCost: e.target.value === '' ? undefined : parseFloat(e.target.value) })}
                    placeholder="0.00"
                    className="pl-8"
                    disabled={!formData.printAreas.includes('Back')}
                  />
                </div>
                <p className={`text-xs ${!formData.printAreas.includes('Back') ? 'text-gray-400' : 'text-gray-500'}`}>Cost to add back print customization</p>
              </div>
            </div>

            {formData.baseCost > 0 && formData.retailPrice > 0 && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm">
                  Profit Margin: <span className="font-semibold">₱{(formData.retailPrice - formData.baseCost).toFixed(2)}</span>
                  {' '}({(((formData.retailPrice - formData.baseCost) / formData.retailPrice) * 100).toFixed(1)}%)
                </p>
              </div>
            )}
          </section>

          {/* 5. Product Differentiation */}
          <section className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">5. Product Differentiation</h3>
            
            <div className="space-y-3">
              <Label className="text-base">How should this product be differentiated?</Label>
              <RadioGroup 
                value={formData.differentiationType} 
                onValueChange={(value) => setFormData({...formData, differentiationType: value as any})}
                className="space-y-3"
              >
                <div className="flex items-center space-x-3 p-3 border-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors" 
                     style={{ borderColor: formData.differentiationType === 'none' ? '#3b82f6' : '#e5e7eb' }}>
                  <RadioGroupItem value="none" id="diff-none" />
                  <Label htmlFor="diff-none" className="font-medium cursor-pointer flex-1">
                    None (Plain customizable product)
                    <span className="block text-xs text-gray-500 font-normal mt-0.5">Customer adds their own design</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 border-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                     style={{ borderColor: formData.differentiationType === 'color' ? '#3b82f6' : '#e5e7eb' }}>
                  <RadioGroupItem value="color" id="diff-color" />
                  <Label htmlFor="diff-color" className="font-medium cursor-pointer flex-1">
                    Single Color Option
                    <span className="block text-xs text-gray-500 font-normal mt-0.5">Product available in one specific color</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 border-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                     style={{ borderColor: formData.differentiationType === 'variant' ? '#3b82f6' : '#e5e7eb' }}>
                  <RadioGroupItem value="variant" id="diff-variant" />
                  <Label htmlFor="diff-variant" className="font-medium cursor-pointer flex-1">
                    Single Variant Option (pre-designed template)
                    <span className="block text-xs text-gray-500 font-normal mt-0.5">Product with a specific design/print pattern</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Show color fields only if 'color' is selected */}
            {formData.differentiationType === 'color' && (
              <div className="p-5 border-2 border-blue-300 rounded-lg bg-blue-50/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-semibold">Color Name / Code</Label>
                    <Input
                      placeholder="Type: red, #FF0000, or rgb(255,0,0)"
                      value={formData.color?.name || ''}
                      onChange={(e) => {
                        const input = e.target.value;
                        const parsed = parseColorInput(input);
                        
                        if (parsed) {
                          // Valid color found - update both name and hex
                          setFormData({ 
                            ...formData, 
                            color: { name: parsed.name || input, hexCode: parsed.hex } 
                          });
                        } else {
                          // Just update name as-is
                          setFormData({ 
                            ...formData, 
                            color: { ...(formData.color || { hexCode: '#000000' }), name: input } 
                          });
                        }
                      }}
                      className="font-mono"
                    />
                    <p className="text-xs text-gray-600">
                      💡 Type color name (e.g., "red"), hex code (#FF0000), or RGB value
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold">Color Picker</Label>
                    <div className="flex gap-2 items-start">
                      <div className="relative">
                        <input
                          type="color"
                          value={formData.color?.hexCode || '#000000'}
                          onChange={(e) => {
                            const hex = e.target.value.toUpperCase();
                            const parsed = parseColorInput(hex);
                            setFormData({ 
                              ...formData, 
                              color: { 
                                name: parsed?.name || formData.color?.name || '', 
                                hexCode: hex 
                              } 
                            });
                          }}
                          className="h-12 w-12 rounded-lg border-2 border-gray-300 cursor-pointer shadow-sm"
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-8 h-8 rounded border-2 border-gray-300 shadow-sm" 
                            style={{ backgroundColor: formData.color?.hexCode || '#000000' }}
                          />
                          <span className="font-mono text-sm font-semibold">
                            {formData.color?.hexCode || '#000000'}
                          </span>
                        </div>
                        {formData.color?.name && (
                          <p className="text-xs text-gray-600 capitalize">
                            Color: {formData.color.name}
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-600">
                      🎨 Click to pick a color visually
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Show variant fields only if 'variant' is selected */}
            {formData.differentiationType === 'variant' && (
              <div className="space-y-4 p-5 border-2 border-purple-300 rounded-lg bg-purple-50/50">
                <div className="space-y-2">
                  <Label className="font-semibold">Variant Name</Label>
                  <Input
                    placeholder="e.g., Skull Design, Floral Pattern, Abstract Art"
                    value={formData.variant?.name || ''}
                    onChange={(e) => setFormData({ ...formData, variant: { ...(formData.variant || { image: '', publicId: '' }), name: e.target.value } })}
                  />
                </div>
                <VariantImageUploadZoneDeferred
                  label="Variant Preview Image"
                  value={pendingImages.variant}
                  onChange={(value) => {
                    setPendingImages(prev => ({
                      ...prev,
                      variant: value || undefined
                    }));
                  }}
                  productCode={productCode}
                  maxSizeMB={10}
                />
              </div>
            )}
          </section>

          {/* 6. Print & Customization */}
          <section className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">6. Print & Customization</h3>
            
            <div className="space-y-2">
              <Label>Print Method</Label>
              <Select value={formData.printMethod} onValueChange={(value: string) => setFormData({ ...formData, printMethod: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select print method" />
                </SelectTrigger>
                <SelectContent>
                  {PRINT_METHODS.map((method) => (
                    <SelectItem key={method} value={method}>{method}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Print Areas</Label>
              <div className="flex flex-wrap gap-3">
                {PRINT_AREAS.map((area) => (
                  <div key={area} className="flex items-center space-x-2">
                    <Checkbox
                      id={`area-${area}`}
                      checked={formData.printAreas.includes(area)}
                      onCheckedChange={() => handlePrintAreaToggle(area)}
                    />
                    <label htmlFor={`area-${area}`} className="text-sm cursor-pointer">
                      {area}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Design Requirements</Label>
              <Textarea
                placeholder="e.g., PNG file with transparent background, 300 DPI minimum"
                value={formData.designRequirements}
                onChange={(e) => setFormData({ ...formData, designRequirements: e.target.value })}
                rows={3}
              />
            </div>
          </section>

          {/* 7. Business Details */}
          <section className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">7. Business Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Turnaround Time</Label>
                <Input
                  placeholder="e.g., 3-5 business days"
                  value={formData.turnaroundTime}
                  onChange={(e) => setFormData({ ...formData, turnaroundTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Minimum Order Quantity</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.minOrderQuantity}
                  onChange={(e) => setFormData({ ...formData, minOrderQuantity: parseInt(e.target.value) || 0 })}
                  onBlur={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    if (value < 1) {
                      setFormData({ ...formData, minOrderQuantity: 1 });
                    }
                  }}
                />
              </div>
            </div>
          </section>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="status"
              checked={formData.status === 'active'}
              onCheckedChange={(checked: boolean) => setFormData({ ...formData, status: checked ? 'active' : 'inactive' })}
            />
            <label htmlFor="status" className="text-sm font-medium cursor-pointer">
              Publish immediately (make visible to customers)
            </label>
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSaving}>
              {isSaving ? 'Saving...' : (product ? 'Update Product' : 'Save Product')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
