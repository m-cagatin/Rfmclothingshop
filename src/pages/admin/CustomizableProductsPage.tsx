import { useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Eye, Edit, XCircle, Plus, Archive, Trash2, RotateCcw, CheckCircle, Search, Filter, X } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { useCustomizableProducts } from '../../hooks/useCustomizableProducts';
import { CustomizableProductForm } from '../../components/admin/CustomizableProductForm';
import { CustomizableProductViewModal } from '../../components/admin/CustomizableProductViewModal';
import { CustomizableProduct, ProductStatus } from '../../types/customizableProduct';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../components/ui/popover';
import { Badge } from '../../components/ui/badge';

export function CustomizableProductsPage() {
  const {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    activateProduct,
    deactivateProduct,
    archiveProduct,
    restoreProduct,
    getProductsByStatus,
    clearAllProducts,
  } = useCustomizableProducts();

  const [activeTab, setActiveTab] = useState<ProductStatus>('active');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<CustomizableProduct | null>(null);
  const [viewingProduct, setViewingProduct] = useState<CustomizableProduct | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [archiveConfirm, setArchiveConfirm] = useState<string | null>(null);
  const [clearAllConfirm, setClearAllConfirm] = useState(false);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showPreDesignedOnly, setShowPreDesignedOnly] = useState(false);

  // Get products by status first
  const statusFilteredProducts = getProductsByStatus(activeTab);
  
  // Apply all filters
  const filteredProducts = statusFilteredProducts.filter(product => {
    // Search filter
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Category filter
    if (selectedCategory !== 'all' && product.category !== selectedCategory) {
      return false;
    }
    
    // Type filter
    if (selectedType !== 'all' && product.type !== selectedType) {
      return false;
    }
    
    // Pre-Designed filter
    if (showPreDesignedOnly && !product.category.startsWith('Pre-Designed')) {
      return false;
    }
    
    return true;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(filteredProducts.map(p => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts(prev => [...prev, productId]);
    } else {
      setSelectedProducts(prev => prev.filter(id => id !== productId));
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEditProduct = (product: CustomizableProduct) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleSaveProduct = (productData: Omit<CustomizableProduct, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
      toast.success('Product updated successfully');
    } else {
      addProduct(productData);
      toast.success('Product created successfully');
    }
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleDeactivate = (productId: string) => {
    deactivateProduct(productId);
    toast.success('Product deactivated');
  };

  const handleActivate = (productId: string) => {
    activateProduct(productId);
    toast.success('Product activated');
  };

  const handleArchive = (productId: string) => {
    archiveProduct(productId);
    setArchiveConfirm(null);
    toast.success('Product archived');
  };

  const handleRestore = (productId: string) => {
    restoreProduct(productId);
    toast.success('Product restored to inactive');
  };

  const handleDelete = (productId: string) => {
    deleteProduct(productId);
    setDeleteConfirm(null);
    toast.success('Product permanently deleted');
  };

  const handleClearAll = async () => {
    try {
      await clearAllProducts();
      setClearAllConfirm(false);
      setSelectedProducts([]);
      toast.success('All products cleared successfully');
    } catch (error) {
      console.error('Error clearing all products:', error);
      toast.error('Failed to clear all products');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <p className="text-gray-500">Loading products...</p>
        </div>
      </AdminLayout>
    );
  }

  const activeFilterCount = [
    activeTab !== 'active',
    selectedCategory !== 'all',
    selectedType !== 'all',
    showPreDesignedOnly
  ].filter(Boolean).length;

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Customizable Products</h1>
          <p className="text-gray-600">Manage products with custom designs, sizes, and color options</p>
        </div>

        {/* Top Bar: Search + Filter + Add Product */}
        <div className="flex items-center gap-3 mb-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <Input
              placeholder="Search products by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Dropdown */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="relative">
                <Filter className="size-4 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="end">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-3">Filter Products</h4>
                </div>

                {/* Status Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      variant={activeTab === 'active' ? 'default' : 'outline'}
                      onClick={() => setActiveTab('active')}
                      className={`justify-start ${activeTab === 'active' ? 'bg-black hover:bg-black/90' : ''}`}
                    >
                      Active ({getProductsByStatus('active').length})
                    </Button>
                    <Button
                      size="sm"
                      variant={activeTab === 'inactive' ? 'default' : 'outline'}
                      onClick={() => setActiveTab('inactive')}
                      className={`justify-start ${activeTab === 'inactive' ? 'bg-black hover:bg-black/90' : ''}`}
                    >
                      Inactive ({getProductsByStatus('inactive').length})
                    </Button>
                    <Button
                      size="sm"
                      variant={activeTab === 'archived' ? 'default' : 'outline'}
                      onClick={() => setActiveTab('archived')}
                      className={`justify-start ${activeTab === 'archived' ? 'bg-black hover:bg-black/90' : ''}`}
                    >
                      Archived ({getProductsByStatus('archived').length})
                    </Button>
                    <Button
                      size="sm"
                      variant={activeTab === 'all' ? 'default' : 'outline'}
                      onClick={() => setActiveTab('all')}
                      className={`justify-start ${activeTab === 'all' ? 'bg-black hover:bg-black/90' : ''}`}
                    >
                      All ({products.length})
                    </Button>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-3">
                  {/* Category */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="T-Shirt - Chinese Collar">T-Shirt - Chinese Collar</SelectItem>
                        <SelectItem value="T-Shirt - V-Neck">T-Shirt - V-Neck</SelectItem>
                        <SelectItem value="T-Shirt - Round Neck">T-Shirt - Round Neck</SelectItem>
                        <SelectItem value="Jogging Pants">Jogging Pants</SelectItem>
                        <SelectItem value="Polo Shirt">Polo Shirt</SelectItem>
                        <SelectItem value="Sando (Jersey) - V-Neck">Sando (Jersey) - V-Neck</SelectItem>
                        <SelectItem value="Sando (Jersey) - Round Neck">Sando (Jersey) - Round Neck</SelectItem>
                        <SelectItem value="Sando (Jersey) - NBA Cut">Sando (Jersey) - NBA Cut</SelectItem>
                        <SelectItem value="Shorts">Shorts</SelectItem>
                        <SelectItem value="Warmers">Warmers</SelectItem>
                        <SelectItem value="Varsity Jacket">Varsity Jacket</SelectItem>
                        <SelectItem value="Pre-Designed T-Shirt - Chinese Collar">Pre-Designed T-Shirt - Chinese Collar</SelectItem>
                        <SelectItem value="Pre-Designed T-Shirt - V-Neck">Pre-Designed T-Shirt - V-Neck</SelectItem>
                        <SelectItem value="Pre-Designed T-Shirt - Round Neck">Pre-Designed T-Shirt - Round Neck</SelectItem>
                        <SelectItem value="Pre-Designed Jogging Pants">Pre-Designed Jogging Pants</SelectItem>
                        <SelectItem value="Pre-Designed Polo Shirt">Pre-Designed Polo Shirt</SelectItem>
                        <SelectItem value="Pre-Designed Sando (Jersey) - V-Neck">Pre-Designed Sando (Jersey) - V-Neck</SelectItem>
                        <SelectItem value="Pre-Designed Sando (Jersey) - Round Neck">Pre-Designed Sando (Jersey) - Round Neck</SelectItem>
                        <SelectItem value="Pre-Designed Sando (Jersey) - NBA Cut">Pre-Designed Sando (Jersey) - NBA Cut</SelectItem>
                        <SelectItem value="Pre-Designed Shorts">Pre-Designed Shorts</SelectItem>
                        <SelectItem value="Pre-Designed Warmers">Pre-Designed Warmers</SelectItem>
                        <SelectItem value="Pre-Designed Varsity Jacket">Pre-Designed Varsity Jacket</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Type */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Type</label>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="Unisex">Unisex</SelectItem>
                        <SelectItem value="Men">Men</SelectItem>
                        <SelectItem value="Women">Women</SelectItem>
                        <SelectItem value="Kids">Kids</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Pre-Designed Toggle */}
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Pre-Designed Only</label>
                    <Button
                      size="sm"
                      variant={showPreDesignedOnly ? 'default' : 'outline'}
                      onClick={() => setShowPreDesignedOnly(!showPreDesignedOnly)}
                      className={showPreDesignedOnly ? 'bg-purple-600 hover:bg-purple-700' : ''}
                    >
                      {showPreDesignedOnly ? 'ON' : 'OFF'}
                    </Button>
                  </div>
                </div>

                {/* Clear Filters Button */}
                <div className="border-t pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setSelectedType('all');
                      setShowPreDesignedOnly(false);
                      setActiveTab('active');
                    }}
                    className="w-full"
                  >
                    Clear All Filters
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Add Product Button */}
          <Button className="bg-black hover:bg-black/90" onClick={handleAddProduct}>
            <Plus className="size-4 mr-2" />
            Add New Product
          </Button>

          {/* Clear All Button */}
          {products.length > 0 && (
            <Button 
              variant="destructive" 
              onClick={() => setClearAllConfirm(true)}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="size-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>

        {/* Active Filter Badges */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-sm text-gray-600">Active filters:</span>
            {activeTab !== 'active' && (
              <Badge variant="secondary" className="gap-1">
                Status: {activeTab}
                <X className="size-3 cursor-pointer" onClick={() => setActiveTab('active')} />
              </Badge>
            )}
            {selectedCategory !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                {selectedCategory}
                <X className="size-3 cursor-pointer" onClick={() => setSelectedCategory('all')} />
              </Badge>
            )}
            {selectedType !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                Type: {selectedType}
                <X className="size-3 cursor-pointer" onClick={() => setSelectedType('all')} />
              </Badge>
            )}
            {showPreDesignedOnly && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-700 gap-1">
                Pre-Designed Only
                <X className="size-3 cursor-pointer" onClick={() => setShowPreDesignedOnly(false)} />
              </Badge>
            )}
          </div>
        )}

        {/* Results Counter */}
        <div className="text-sm text-gray-600 mb-4">
          Showing {filteredProducts.length} of {statusFilteredProducts.length} products
        </div>

        {/* Select All Checkbox */}
        {filteredProducts.length > 0 && (
          <div className="mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="size-4 rounded border-gray-300"
                checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
              <span className="text-sm text-gray-700">
                Select All {selectedProducts.length > 0 && `(${selectedProducts.length} selected)`}
              </span>
            </label>
          </div>
        )}

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="border-2 relative overflow-hidden">
                <div className="absolute top-3 left-3 z-10">
                  <input
                    type="checkbox"
                    className="size-4 rounded border-gray-300 bg-white"
                    checked={selectedProducts.includes(product.id)}
                    onChange={(e) => handleSelectProduct(product.id, e.target.checked)}
                  />
                </div>
                {product.status === 'active' && (
                  <div className="absolute top-3 right-3 z-10">
                    <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                      Active
                    </span>
                  </div>
                )}
                <div className="bg-gray-100 aspect-square flex items-center justify-center overflow-hidden">
                  <ImageWithFallback
                    src={product.images?.find(img => img.type === 'front')?.url || product.images?.[0]?.url || ''}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-1 truncate">{product.name}</h3>
                  <div className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium mb-3">
                    {product.category}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div>
                      <p className="text-gray-500">BASE COST</p>
                      <p className="font-bold">₱{product.baseCost}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">RETAIL PRICE</p>
                      <p className="font-bold">₱{product.retailPrice}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">SIZES</p>
                      <p className="font-bold">{product.sizes?.length || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">COLOR</p>
                      <p className="font-bold">{product.color?.name || '—'}</p>
                    </div>
                  </div>

                  {/* Actions based on status */}
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setViewingProduct(product)}
                      >
                        <Eye className="size-3 mr-1" />
                        View
                      </Button>
                      {product.status !== 'archived' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleEditProduct(product)}
                        >
                          <Edit className="size-3 mr-1" />
                          Edit
                        </Button>
                      )}
                    </div>

                    {/* Active product actions */}
                    {product.status === 'active' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                        onClick={() => handleDeactivate(product.id)}
                      >
                        <XCircle className="size-3 mr-1" />
                        Deactivate
                      </Button>
                    )}

                    {/* Inactive product actions */}
                    {product.status === 'inactive' && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-green-600 border-green-600 hover:bg-green-50"
                          onClick={() => handleActivate(product.id)}
                        >
                          <CheckCircle className="size-3 mr-1" />
                          Activate
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-orange-600 border-orange-600 hover:bg-orange-50"
                          onClick={() => setArchiveConfirm(product.id)}
                        >
                          <Archive className="size-3 mr-1" />
                          Archive
                        </Button>
                      </div>
                    )}

                    {/* Archived product actions */}
                    {product.status === 'archived' && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleRestore(product.id)}
                        >
                          <RotateCcw className="size-3 mr-1" />
                          Restore
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex-1"
                          onClick={() => setDeleteConfirm(product.id)}
                        >
                          <Trash2 className="size-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-lg">
            <p className="text-gray-500 mb-4">
              {activeTab === 'active' && 'No active products'}
              {activeTab === 'inactive' && 'No inactive products'}
              {activeTab === 'archived' && 'No archived products'}
              {activeTab === 'all' && 'No products yet'}
            </p>
            {activeTab === 'all' && (
              <Button onClick={handleAddProduct}>
                <Plus className="size-4 mr-2" />
                Add Your First Product
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <CustomizableProductForm
          product={editingProduct || undefined}
          onSave={handleSaveProduct}
          onCancel={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
        />
      )}

      {/* View Product Modal */}
      {viewingProduct && (
        <CustomizableProductViewModal
          product={viewingProduct}
          onClose={() => setViewingProduct(null)}
        />
      )}

      {/* Archive Confirmation Dialog */}
      <AlertDialog open={archiveConfirm !== null} onOpenChange={() => setArchiveConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Product?</AlertDialogTitle>
            <AlertDialogDescription>
              This product will be moved to the archived section. You can restore it later or delete it permanently from the archived section.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => archiveConfirm && handleArchive(archiveConfirm)}>
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product Permanently?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product from your database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear All Confirmation Dialog */}
      <AlertDialog open={clearAllConfirm} onOpenChange={setClearAllConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Products?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete ALL {products.length} products and their images from the database. 
              This action cannot be undone. Are you absolutely sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearAll}
              className="bg-red-600 hover:bg-red-700"
            >
              Clear All Products
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
