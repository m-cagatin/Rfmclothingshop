import { useState, useRef } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card } from '../../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Upload, X, Loader2, Image as ImageIcon, Grid3x3, AlertCircle, RefreshCw } from 'lucide-react';
import { uploadToCloudinary, CloudinaryFolder } from '../../services/cloudinary';
import { CanvasGraphic, CanvasPattern, GraphicCategory } from '../../types/canvasResource';
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

const API_BASE = 'http://localhost:4000/api/canvas-resources';

export function CanvasResourcesPage() {
  const [activeTab, setActiveTab] = useState<'graphics' | 'patterns'>('graphics');
  
  // Graphics state
  const [graphics, setGraphics] = useState<CanvasGraphic[]>([]);
  const [loadingGraphics, setLoadingGraphics] = useState(false);
  
  // Patterns state
  const [patterns, setPatterns] = useState<CanvasPattern[]>([]);
  const [loadingPatterns, setLoadingPatterns] = useState(false);
  
  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resourceName, setResourceName] = useState('');
  const [resourceCategory, setResourceCategory] = useState<GraphicCategory>('icon');
  
  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'graphic' | 'pattern'; id: number } | null>(null);
  
  const graphicsFileInputRef = useRef<HTMLInputElement>(null);
  const patternsFileInputRef = useRef<HTMLInputElement>(null);

  // Load graphics
  const loadGraphics = async (category?: string) => {
    setLoadingGraphics(true);
    try {
      const url = category ? `${API_BASE}/graphics?category=${category}` : `${API_BASE}/graphics`;
      const response = await fetch(url);
      const data = await response.json();
      setGraphics(data);
    } catch (error) {
      toast.error('Failed to load graphics');
      console.error(error);
    } finally {
      setLoadingGraphics(false);
    }
  };

  // Load patterns
  const loadPatterns = async () => {
    setLoadingPatterns(true);
    try {
      const response = await fetch(`${API_BASE}/patterns`);
      const data = await response.json();
      setPatterns(data);
    } catch (error) {
      toast.error('Failed to load patterns');
      console.error(error);
    } finally {
      setLoadingPatterns(false);
    }
  };

  // Initial load
  useState(() => {
    loadGraphics();
    loadPatterns();
  });

  // Handle tab change - reset form
  const handleTabChange = (tab: 'graphics' | 'patterns') => {
    setActiveTab(tab);
    setSelectedFile(null);
    setPreviewUrl(null);
    setResourceName('');
    setUploadProgress(0);
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = activeTab === 'graphics' 
      ? ['image/png', 'image/svg+xml']
      : ['image/png'];
    
    if (!validTypes.includes(file.type)) {
      toast.error(`Invalid file type. ${activeTab === 'graphics' ? 'Use PNG or SVG' : 'Use PNG only'}`);
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 10MB');
      return;
    }

    setSelectedFile(file);
    setResourceName(file.name.replace(/\.[^/.]+$/, '')); // Remove extension
    setPreviewUrl(URL.createObjectURL(file));
  };

  // Validate image dimensions
  const validateDimensions = (file: File): Promise<{ valid: boolean; width: number; height: number; error?: string }> => {
    return new Promise((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const minDimension = Math.min(img.width, img.height);

        if (minDimension < 3600) {
          resolve({
            valid: false,
            width: img.width,
            height: img.height,
            error: `Image resolution too low (${img.width}×${img.height}px). Minimum 3600px required.`
          });
        } else {
          resolve({ valid: true, width: img.width, height: img.height });
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve({ valid: false, width: 0, height: 0, error: 'Failed to load image' });
      };

      img.src = objectUrl;
    });
  };

  // Handle upload
  const handleUpload = async () => {
    if (!selectedFile || !resourceName.trim()) {
      toast.error('Please select a file and enter a name');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Validate dimensions
      const validation = await validateDimensions(selectedFile);
      if (!validation.valid) {
        toast.error(validation.error || 'Invalid image');
        setUploading(false);
        return;
      }

      // Upload to Cloudinary
      const folder = activeTab === 'graphics' 
        ? CloudinaryFolder.ADMIN_GRAPHICS 
        : CloudinaryFolder.ADMIN_PATTERNS;

      const result = await uploadToCloudinary(
        selectedFile,
        folder,
        (progress) => setUploadProgress(progress)
      );

      // Save to database
      const endpoint = activeTab === 'graphics' ? `${API_BASE}/graphics` : `${API_BASE}/patterns`;
      const payload = {
        name: resourceName,
        cloudinary_url: result.url,
        thumbnail_url: result.thumbnailUrl || result.url,
        cloudinary_public_id: result.publicId,
        file_size: result.size,
        width: validation.width,
        height: validation.height,
        format: result.format,
        ...(activeTab === 'graphics' && { category: resourceCategory }),
        ...(activeTab === 'patterns' && { is_seamless: true }),
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to save resource');

      toast.success(`${activeTab === 'graphics' ? 'Graphic' : 'Pattern'} uploaded successfully`);
      
      // Reload list
      if (activeTab === 'graphics') {
        loadGraphics();
      } else {
        loadPatterns();
      }

      // Reset form
      setSelectedFile(null);
      setPreviewUrl(null);
      setResourceName('');
      setUploadProgress(0);
      const inputRef = activeTab === 'graphics' ? graphicsFileInputRef : patternsFileInputRef;
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    } catch (error: any) {
      toast.error(error.message || 'Upload failed');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deleteConfirm) return;

    try {
      const endpoint = deleteConfirm.type === 'graphic' 
        ? `${API_BASE}/graphics/${deleteConfirm.id}` 
        : `${API_BASE}/patterns/${deleteConfirm.id}`;

      const response = await fetch(endpoint, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');

      toast.success(`${deleteConfirm.type === 'graphic' ? 'Graphic' : 'Pattern'} deleted successfully`);
      
      // Reload list
      if (deleteConfirm.type === 'graphic') {
        loadGraphics();
      } else {
        loadPatterns();
      }
    } catch (error: any) {
      toast.error(error.message || 'Delete failed');
      console.error(error);
    } finally {
      setDeleteConfirm(null);
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Canvas Resources</h1>
            <p className="text-gray-600 mt-1">Upload graphics and patterns for customer designs</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => activeTab === 'graphics' ? loadGraphics() : loadPatterns()}
          >
            <RefreshCw className="size-4 mr-2" />
            Refresh
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => handleTabChange(v as any)}>
          <TabsList className="mb-6">
            <TabsTrigger value="graphics" className="flex items-center gap-2">
              <ImageIcon className="size-4" />
              Graphics
            </TabsTrigger>
            <TabsTrigger value="patterns" className="flex items-center gap-2">
              <Grid3x3 className="size-4" />
              Patterns
            </TabsTrigger>
          </TabsList>

          {/* Graphics Tab */}
          <TabsContent value="graphics">
            <Card className="p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Upload Graphic</h3>
              
              {/* Upload Zone */}
              <div 
                onClick={() => graphicsFileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors mb-4"
              >
                <input
                  ref={graphicsFileInputRef}
                  type="file"
                  accept="image/png,image/svg+xml"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {previewUrl ? (
                  <div className="space-y-4">
                    <img src={previewUrl} alt="Preview" className="max-h-48 mx-auto" />
                    <p className="text-sm text-gray-600">{selectedFile?.name}</p>
                  </div>
                ) : (
                  <>
                    <Upload className="size-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Drop files here or click to upload</p>
                    <p className="text-xs text-gray-500">Min 3600px • PNG or SVG • Max 10MB</p>
                  </>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={resourceName}
                    onChange={(e) => setResourceName(e.target.value)}
                    placeholder="e.g., Gold Star Icon"
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={resourceCategory} onValueChange={(v: any) => setResourceCategory(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="icon">Icon</SelectItem>
                      <SelectItem value="logo">Logo</SelectItem>
                      <SelectItem value="illustration">Illustration</SelectItem>
                      <SelectItem value="template">Template</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {uploading && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Uploading...</span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <Button 
                onClick={handleUpload} 
                disabled={!selectedFile || uploading}
                className="w-full"
              >
                {uploading ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Upload Graphic'
                )}
              </Button>
            </Card>

            {/* Graphics Grid */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Uploaded Graphics ({graphics.length})</h3>
                <div className="flex gap-2">
                  {(['all', 'icon', 'logo', 'illustration', 'template'] as const).map((cat) => (
                    <Button
                      key={cat}
                      variant="outline"
                      size="sm"
                      onClick={() => loadGraphics(cat === 'all' ? undefined : cat)}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              {loadingGraphics ? (
                <div className="text-center py-12">
                  <Loader2 className="size-8 animate-spin mx-auto text-gray-400" />
                </div>
              ) : graphics.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <ImageIcon className="size-12 mx-auto mb-4 opacity-30" />
                  <p>No graphics uploaded yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {graphics.map((graphic) => (
                    <Card key={graphic.id} className="overflow-hidden">
                      <div className="aspect-square bg-gray-100 relative">
                        <img 
                          src={graphic.thumbnail_url} 
                          alt={graphic.name}
                          className="w-full h-full object-contain p-2"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 size-8"
                          onClick={() => setDeleteConfirm({ type: 'graphic', id: graphic.id })}
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                      <div className="p-3">
                        <p className="font-medium text-sm truncate">{graphic.name}</p>
                        <p className="text-xs text-gray-500">{graphic.width} × {graphic.height}px</p>
                        <p className="text-xs text-gray-500">{graphic.format.toUpperCase()}</p>
                        {graphic.category && (
                          <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                            {graphic.category}
                          </span>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Patterns Tab */}
          <TabsContent value="patterns">
            <Card className="p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Upload Pattern</h3>
              
              <div 
                onClick={() => patternsFileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors mb-4"
              >
                <input
                  ref={patternsFileInputRef}
                  type="file"
                  accept="image/png"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {previewUrl ? (
                  <div className="space-y-4">
                    <img src={previewUrl} alt="Preview" className="max-h-48 mx-auto" />
                    <p className="text-sm text-gray-600">{selectedFile?.name}</p>
                  </div>
                ) : (
                  <>
                    <Grid3x3 className="size-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Drop files here or click to upload</p>
                    <p className="text-xs text-gray-500">Min 3600px • PNG only • Max 10MB • Seamless patterns work best</p>
                  </>
                )}
              </div>

              <div className="mb-4">
                <Label>Name</Label>
                <Input
                  value={resourceName}
                  onChange={(e) => setResourceName(e.target.value)}
                  placeholder="e.g., Camouflage Pattern"
                />
              </div>

              {uploading && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Uploading...</span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <Button 
                onClick={handleUpload} 
                disabled={!selectedFile || uploading}
                className="w-full"
              >
                {uploading ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Upload Pattern'
                )}
              </Button>
            </Card>

            {/* Patterns Grid */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Uploaded Patterns ({patterns.length})</h3>

              {loadingPatterns ? (
                <div className="text-center py-12">
                  <Loader2 className="size-8 animate-spin mx-auto text-gray-400" />
                </div>
              ) : patterns.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Grid3x3 className="size-12 mx-auto mb-4 opacity-30" />
                  <p>No patterns uploaded yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {patterns.map((pattern) => (
                    <Card key={pattern.id} className="overflow-hidden">
                      <div className="aspect-square bg-gray-100 relative">
                        <img 
                          src={pattern.thumbnail_url} 
                          alt={pattern.name}
                          className="w-full h-full object-cover"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 size-8"
                          onClick={() => setDeleteConfirm({ type: 'pattern', id: pattern.id })}
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                      <div className="p-3">
                        <p className="font-medium text-sm truncate">{pattern.name}</p>
                        <p className="text-xs text-gray-500">{pattern.width} × {pattern.height}px</p>
                        <p className="text-xs text-gray-500">{pattern.format.toUpperCase()}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {deleteConfirm?.type === 'graphic' ? 'Graphic' : 'Pattern'}?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this resource from Cloudinary and the database. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
