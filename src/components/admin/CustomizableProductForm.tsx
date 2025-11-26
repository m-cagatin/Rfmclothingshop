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
import { ImageUploadZone } from './ImageUploadZone';
import { ColorSelector } from './ColorSelector';
import { CustomizableProduct } from '../../types/customizableProduct';

interface CustomizableProductFormProps {
  product?: CustomizableProduct;
  onSave: (product: Omit<CustomizableProduct, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const CATEGORIES = ['T-Shirt', 'Polo', 'Caps', 'Hoodie', 'Jacket', 'Pants', 'Shorts'];
const TYPES = ['Unisex', 'Men', 'Women', 'Kids'];
const FIT_TYPES = ['Classic', 'Slim', 'Oversized', 'Regular'];
const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'];
const PRINT_METHODS = ['DTG (Direct to Garment)', 'Screen Print', 'Embroidery', 'Vinyl Transfer', 'Sublimation'];
const PRINT_AREAS = ['Front', 'Back', 'Sleeve', 'Chest', 'Pocket'];

export function CustomizableProductForm({ product, onSave, onCancel }: CustomizableProductFormProps) {
  const [formData, setFormData] = useState<Omit<CustomizableProduct, 'id' | 'createdAt' | 'updatedAt'>>({
    category: product?.category || '',
    name: product?.name || '',
    type: product?.type || '',
    sizes: product?.sizes || [],
    fitType: product?.fitType || '',
    fitDescription: product?.fitDescription || '',
    description: product?.description || '',
    frontImage: product?.frontImage || '',
    backImage: product?.backImage || '',
    additionalImages: product?.additionalImages || [],
    fabricComposition: product?.fabricComposition || '',
    fabricWeight: product?.fabricWeight || '',
    texture: product?.texture || '',
    baseCost: product?.baseCost || 0,
    retailPrice: product?.retailPrice || 0,
    colors: product?.colors || [],
    printMethod: product?.printMethod || '',
    printAreas: product?.printAreas || [],
    designRequirements: product?.designRequirements || '',
    turnaroundTime: product?.turnaroundTime || '',
    minOrderQuantity: product?.minOrderQuantity || 1,
    status: product?.status || 'inactive',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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

    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.type) newErrors.type = 'Type is required';
    if (formData.sizes.length === 0) newErrors.sizes = 'At least one size is required';
    if (!formData.frontImage) newErrors.frontImage = 'Front image is required';
    if (!formData.backImage) newErrors.backImage = 'Back image is required';
    if (!formData.retailPrice || formData.retailPrice <= 0) newErrors.retailPrice = 'Retail price is required';
    if (formData.colors.length === 0) newErrors.colors = 'At least one color is required';
    if (formData.description.length < 20) newErrors.description = 'Description must be at least 20 characters';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    } else {
      alert('Please fill in all required fields correctly');
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
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-xs text-red-500">{errors.category}</p>}
              </div>

              <div className="space-y-2">
                <Label>
                  Product Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="e.g., Classic Round Neck Tee"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  Type <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPES.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && <p className="text-xs text-red-500">{errors.type}</p>}
              </div>

              <div className="space-y-2">
                <Label>
                  Fit Type <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.fitType} onValueChange={(value) => setFormData({ ...formData, fitType: value })}>
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

            <div className="space-y-2">
              <Label>
                Available Sizes <span className="text-red-500">*</span>
              </Label>
              <div className="flex flex-wrap gap-3">
                {ALL_SIZES.map((size) => (
                  <div key={size} className="flex items-center space-x-2">
                    <Checkbox
                      id={`size-${size}`}
                      checked={formData.sizes.includes(size)}
                      onCheckedChange={() => handleSizeToggle(size)}
                    />
                    <label htmlFor={`size-${size}`} className="text-sm cursor-pointer">
                      {size}
                    </label>
                  </div>
                ))}
              </div>
              {errors.sizes && <p className="text-xs text-red-500">{errors.sizes}</p>}
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
              <Label>
                Product Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                placeholder="Detailed description of the product..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className={errors.description ? 'border-red-500' : ''}
              />
              <p className="text-xs text-gray-500">{formData.description.length} / 20 characters minimum</p>
              {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
            </div>
          </section>

          {/* 2. Product Images */}
          <section className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">2. Product Images</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <ImageUploadZone
                label="Front View"
                required
                value={formData.frontImage}
                onChange={(value) => setFormData({ ...formData, frontImage: value })}
                description="Upload front view of the product"
              />
              <ImageUploadZone
                label="Back View"
                required
                value={formData.backImage}
                onChange={(value) => setFormData({ ...formData, backImage: value })}
                description="Upload back view of the product"
              />
            </div>
            {(errors.frontImage || errors.backImage) && (
              <p className="text-xs text-red-500">Both front and back images are required</p>
            )}
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
                    value={formData.retailPrice || ''}
                    onChange={(e) => setFormData({ ...formData, retailPrice: parseFloat(e.target.value) || 0 })}
                    className={`pl-8 ${errors.retailPrice ? 'border-red-500' : ''}`}
                  />
                </div>
                <p className="text-xs text-gray-500">Customer price (before print fees)</p>
                {errors.retailPrice && <p className="text-xs text-red-500">{errors.retailPrice}</p>}
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

          {/* 5. Colors & Variants */}
          <section className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">5. Colors & Variants</h3>
            <ColorSelector
              colors={formData.colors}
              onChange={(colors) => setFormData({ ...formData, colors })}
            />
            {errors.colors && <p className="text-xs text-red-500">{errors.colors}</p>}
          </section>

          {/* 6. Print & Customization */}
          <section className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">6. Print & Customization</h3>
            
            <div className="space-y-2">
              <Label>Print Method</Label>
              <Select value={formData.printMethod} onValueChange={(value) => setFormData({ ...formData, printMethod: value })}>
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
                  onChange={(e) => setFormData({ ...formData, minOrderQuantity: parseInt(e.target.value) || 1 })}
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
              onCheckedChange={(checked) => setFormData({ ...formData, status: checked ? 'active' : 'inactive' })}
            />
            <label htmlFor="status" className="text-sm font-medium cursor-pointer">
              Publish immediately (make visible to customers)
            </label>
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {product ? 'Update Product' : 'Save Product'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
