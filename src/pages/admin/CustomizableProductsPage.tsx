import { useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Eye, Edit, XCircle, Plus, Archive, Trash2, RotateCcw, CheckCircle } from 'lucide-react';
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
  } = useCustomizableProducts();

  const [activeTab, setActiveTab] = useState<ProductStatus>('active');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<CustomizableProduct | null>(null);
  const [viewingProduct, setViewingProduct] = useState<CustomizableProduct | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [archiveConfirm, setArchiveConfirm] = useState<string | null>(null);

  const filteredProducts = getProductsByStatus(activeTab);

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

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <p className="text-gray-500">Loading products...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Customizable Products</h1>
            <p className="text-gray-600">Manage products with custom designs, sizes, and color options</p>
          </div>
          <Button className="bg-black hover:bg-black/90" onClick={handleAddProduct}>
            <Plus className="size-4 mr-2" />
            Add New Product
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'active' ? 'default' : 'outline'}
            onClick={() => setActiveTab('active')}
            className={activeTab === 'active' ? 'bg-black hover:bg-black/90' : ''}
          >
            Active ({getProductsByStatus('active').length})
          </Button>
          <Button
            variant={activeTab === 'inactive' ? 'default' : 'outline'}
            onClick={() => setActiveTab('inactive')}
            className={activeTab === 'inactive' ? 'bg-black hover:bg-black/90' : ''}
          >
            Inactive ({getProductsByStatus('inactive').length})
          </Button>
          <Button
            variant={activeTab === 'archived' ? 'default' : 'outline'}
            onClick={() => setActiveTab('archived')}
            className={activeTab === 'archived' ? 'bg-black hover:bg-black/90' : ''}
          >
            Archived ({getProductsByStatus('archived').length})
          </Button>
          <Button
            variant={activeTab === 'all' ? 'default' : 'outline'}
            onClick={() => setActiveTab('all')}
            className={activeTab === 'all' ? 'bg-black hover:bg-black/90' : ''}
          >
            All ({products.length})
          </Button>
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
                    src={product.frontImage}
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
                      <p className="font-bold">{product.sizes.length}</p>
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
    </AdminLayout>
  );
}
