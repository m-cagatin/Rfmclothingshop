import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { Label } from '../../components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Copy, 
  History,
  Eye,
  Package,
  CheckCircle2,
  AlertTriangle,
  DollarSign
} from 'lucide-react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';

const API_BASE = import.meta.env['VITE_API_BASE'] || 'http://localhost:4000';

interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  category: string;
  stock: number;
  unit: string;
  minLevel: number;
  costPerUnit: number;
  status: 'active' | 'inactive' | 'low_stock';
  createdAt?: string;
  updatedAt?: string;
}

export function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeItemsOnly, setActiveItemsOnly] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [viewingItem, setViewingItem] = useState<InventoryItem | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    stock: 0,
    unit: '',
    minLevel: 0,
    costPerUnit: 0,
  });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/inventory`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setItems(data);
      } else {
        toast.error('Failed to load inventory items');
      }
    } catch (error) {
      console.error('Error loading inventory:', error);
      toast.error('Failed to load inventory items');
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const stats = {
    totalItems: items.length,
    activeItems: items.filter(item => item.status === 'active').length,
    lowStockItems: items.filter(item => item.stock <= item.minLevel).length,
    totalValue: items.reduce((sum, item) => sum + (item.stock * item.costPerUnit), 0),
  };

  // Get unique categories
  const categories = Array.from(new Set(items.map(item => item.category)));

  // Filter items
  const filteredItems = items.filter(item => {
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !item.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedCategory !== 'all' && item.category !== selectedCategory) {
      return false;
    }
    if (activeItemsOnly && item.status === 'inactive') {
      return false;
    }
    return true;
  });

  const handleAddItem = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      category: '',
      stock: 0,
      unit: '',
      minLevel: 0,
      costPerUnit: 0,
    });
    setShowAddDialog(true);
  };

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      category: item.category,
      stock: item.stock,
      unit: item.unit,
      minLevel: item.minLevel,
      costPerUnit: item.costPerUnit,
    });
    setShowAddDialog(true);
  };

  const handleSaveItem = async () => {
    try {
      const url = editingItem 
        ? `${API_BASE}/api/inventory/${editingItem.id}`
        : `${API_BASE}/api/inventory`;
      
      const method = editingItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(editingItem ? 'Item updated successfully' : 'Item added successfully');
        setShowAddDialog(false);
        loadItems();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save item');
      }
    } catch (error) {
      console.error('Error saving item:', error);
      toast.error('Failed to save item');
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/inventory/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        toast.success('Item deleted successfully');
        setDeleteConfirm(null);
        loadItems();
      } else {
        toast.error('Failed to delete item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };

  const handleDuplicateItem = async (item: InventoryItem) => {
    setFormData({
      name: `${item.name} (Copy)`,
      description: item.description || '',
      category: item.category,
      stock: 0,
      unit: item.unit,
      minLevel: item.minLevel,
      costPerUnit: item.costPerUnit,
    });
    setEditingItem(null);
    setShowAddDialog(true);
  };

  const getStatusBadge = (item: InventoryItem) => {
    if (item.stock <= item.minLevel) {
      return <Badge variant="destructive">Low Stock</Badge>;
    }
    if (item.status === 'active') {
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Active</Badge>;
    }
    return <Badge variant="secondary">Inactive</Badge>;
  };

  const getStockColor = (item: InventoryItem) => {
    if (item.stock <= item.minLevel) {
      return 'text-red-600 font-semibold';
    }
    return '';
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading inventory...</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 md:p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Inventory Management</h1>
          <p className="text-gray-600">Track and manage consumable materials.</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Items</p>
                  <p className="text-2xl font-bold">{stats.totalItems}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Package className="size-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Items</p>
                  <p className="text-2xl font-bold">{stats.activeItems}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle2 className="size-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Low Stock</p>
                  <p className="text-2xl font-bold">{stats.lowStockItems}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <AlertTriangle className="size-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Value</p>
                  <p className="text-2xl font-bold">₱ {stats.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div className="p-3 bg-teal-100 rounded-full">
                  <DollarSign className="size-6 text-teal-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Add Button */}
        <div className="bg-white rounded-lg border p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex-1 flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" />
                <Input
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <Switch
                  id="active-only"
                  checked={activeItemsOnly}
                  onCheckedChange={setActiveItemsOnly}
                />
                <Label htmlFor="active-only" className="text-sm">Active Items Only</Label>
              </div>
            </div>

            <Button onClick={handleAddItem} className="bg-orange-500 hover:bg-orange-600">
              <Plus className="size-4 mr-2" />
              Add Item
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>NAME</TableHead>
                <TableHead>CATEGORY</TableHead>
                <TableHead>STOCK</TableHead>
                <TableHead>UNIT</TableHead>
                <TableHead>MIN LEVEL</TableHead>
                <TableHead>COST/UNIT</TableHead>
                <TableHead>STATUS</TableHead>
                <TableHead className="text-right">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                    No items found
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-sm">{item.id.slice(0, 8)}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        {item.description && (
                          <p className="text-sm text-gray-500">{item.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell className={getStockColor(item)}>
                      {item.stock.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {item.unit}
                    </TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>{item.minLevel} {item.unit}</TableCell>
                    <TableCell>₱ {item.costPerUnit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                    <TableCell>{getStatusBadge(item)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setViewingItem(item)}
                          className="size-8"
                        >
                          <Eye className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditItem(item)}
                          className="size-8"
                        >
                          <Edit className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDuplicateItem(item)}
                          className="size-8"
                        >
                          <Copy className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteConfirm(item.id)}
                          className="size-8 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          title="History"
                        >
                          <History className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Add/Edit Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
              <DialogDescription>
                {editingItem ? 'Update inventory item details' : 'Add a new item to your inventory'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Item Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., CUYI SUBLI INK - MAGENTA"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Sublimation Ink"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the item"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stock">Current Stock *</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit *</Label>
                  <Input
                    id="unit"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="e.g., bottle, kg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minLevel">Min Level *</Label>
                  <Input
                    id="minLevel"
                    type="number"
                    value={formData.minLevel}
                    onChange={(e) => setFormData({ ...formData, minLevel: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="costPerUnit">Cost per Unit (₱) *</Label>
                <Input
                  id="costPerUnit"
                  type="number"
                  step="0.01"
                  value={formData.costPerUnit}
                  onChange={(e) => setFormData({ ...formData, costPerUnit: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveItem} className="bg-orange-500 hover:bg-orange-600">
                {editingItem ? 'Update' : 'Add'} Item
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Dialog */}
        <Dialog open={!!viewingItem} onOpenChange={() => setViewingItem(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{viewingItem?.name}</DialogTitle>
              <DialogDescription>{viewingItem?.description}</DialogDescription>
            </DialogHeader>
            {viewingItem && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-600">Category</Label>
                    <p className="font-medium">{viewingItem.category}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Status</Label>
                    <div className="mt-1">{getStatusBadge(viewingItem)}</div>
                  </div>
                  <div>
                    <Label className="text-gray-600">Current Stock</Label>
                    <p className={`font-medium ${getStockColor(viewingItem)}`}>
                      {viewingItem.stock} {viewingItem.unit}
                    </p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Minimum Level</Label>
                    <p className="font-medium">{viewingItem.minLevel} {viewingItem.unit}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Cost per Unit</Label>
                    <p className="font-medium">₱ {viewingItem.costPerUnit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Total Value</Label>
                    <p className="font-medium">₱ {(viewingItem.stock * viewingItem.costPerUnit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewingItem(null)}>
                Close
              </Button>
              <Button onClick={() => {
                if (viewingItem) {
                  handleEditItem(viewingItem);
                  setViewingItem(null);
                }
              }} className="bg-orange-500 hover:bg-orange-600">
                Edit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Item</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this item? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteConfirm && handleDeleteItem(deleteConfirm)}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}

