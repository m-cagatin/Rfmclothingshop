import { useState, useMemo } from 'react';
import { ProductCard } from '../components/ProductCard';
import { Button } from '../components/ui/button';
import { SlidersHorizontal, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../components/ui/sheet';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';
import { Slider } from '../components/ui/slider';
import { FavoriteItem } from '../components/FavoritesDrawer';
import { useCatalogProductsCustomer } from '../hooks/useCatalogProductsCustomer';

interface NewArrivalsPageProps {
  onAddToCart: (productId: string) => void;
  onToggleFavorite?: (productId: string) => void;
  favorites?: FavoriteItem[];
}

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  isNew: boolean;
  section?: string;
  gender?: string;
}

export function NewArrivalsPage({ onAddToCart, onToggleFavorite, favorites }: NewArrivalsPageProps) {
  const { products: allProducts, loading } = useCatalogProductsCustomer(); // Get all products
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);

  // Filter only new products
  const newProducts = useMemo(() => allProducts.filter(p => p.isNew), [allProducts]);

  // Get all unique categories from new products
  const allCategories = useMemo(() => {
    const categories = new Set(newProducts.map(p => p.category));
    return Array.from(categories).sort();
  }, [newProducts]);

  const sections = useMemo(() => {
    const genders = new Set(newProducts.map(p => p.gender || 'Unisex'));
    return Array.from(genders).sort();
  }, [newProducts]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return newProducts.filter(product => {
      // Category filter
      if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) {
        return false;
      }

      // Section filter
      if (selectedSections.length > 0 && !selectedSections.includes(product.gender || 'Unisex')) {
        return false;
      }

      // Price filter
      if (product.price < priceRange[0] || product.price > priceRange[1]) {
        return false;
      }

      return true;
    });
  }, [selectedCategories, selectedSections, priceRange, newProducts]);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleSection = (section: string) => {
    setSelectedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedSections([]);
    setPriceRange([0, 1000]);
  };

  const hasActiveFilters = selectedCategories.length > 0 || selectedSections.length > 0 || priceRange[0] !== 0 || priceRange[1] !== 1000;

  // Show loading state after all hooks are defined
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-12 md:px-6">
          <div className="mb-6">
            <h1 className="mb-2">Catalog</h1>
            <p className="text-gray-600">
              Browse our complete collection of clothing for everyone.
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">{filteredProducts.length} products</p>
            <Button variant="outline" size="sm" onClick={() => setIsFilterOpen(true)}>
              <SlidersHorizontal className="mr-2 size-4" />
              Filters
              {hasActiveFilters && (
                <span className="ml-2 inline-flex items-center justify-center size-5 rounded-full bg-black text-white text-xs">
                  {selectedCategories.length + selectedSections.length}
                </span>
              )}
            </Button>
          </div>
        </div>
      </section>

      {/* Active Filters Pills */}
      {hasActiveFilters && (
        <section className="bg-gray-50 border-b">
          <div className="container mx-auto px-4 py-4 md:px-6">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600">Active filters:</span>
              {selectedSections.map(section => (
                <button
                  key={section}
                  onClick={() => toggleSection(section)}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-black text-white text-sm rounded-full hover:bg-gray-800 transition-colors"
                >
                  {section}
                  <X className="size-3" />
                </button>
              ))}
              {selectedCategories.map(category => (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-black text-white text-sm rounded-full hover:bg-gray-800 transition-colors"
                >
                  {category}
                  <X className="size-3" />
                </button>
              ))}
              {(priceRange[0] !== 0 || priceRange[1] !== 1000) && (
                <button
                  onClick={() => setPriceRange([0, 1000])}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-black text-white text-sm rounded-full hover:bg-gray-800 transition-colors"
                >
                  ₱{priceRange[0]} - ₱{priceRange[1]}
                  <X className="size-3" />
                </button>
              )}
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-black underline"
              >
                Clear all
              </button>
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals Grid */}
      <section className="container mx-auto px-4 py-12 md:px-6">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                {...product}
                onAddToCart={onAddToCart}
                onToggleFavorite={onToggleFavorite}
                isFavorited={favorites?.some(fav => fav.id === product.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <h3 className="mb-2">No new arrivals found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters to see more results</p>
            <Button onClick={clearFilters}>Clear all filters</Button>
          </div>
        )}
      </section>

      {/* Filter Drawer */}
      <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto p-0 flex flex-col">
          <SheetHeader className="px-6 py-4 border-b">
            <SheetTitle className="text-left">Filters</SheetTitle>
            <SheetDescription className="text-left">
              Refine your search by selecting categories and price range
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
            {/* Section Filter */}
            <div>
              <h4 className="mb-3 text-sm uppercase tracking-wide text-gray-500">Section</h4>
              <div className="flex flex-wrap gap-2">
                {sections.map((section) => (
                  <button
                    key={section}
                    onClick={() => toggleSection(section)}
                    className={`px-4 py-2 rounded-full border transition-all ${
                      selectedSections.includes(section)
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-black'
                    }`}
                  >
                    {section}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div className="pt-2 border-t">
              <h4 className="mb-3 text-sm uppercase tracking-wide text-gray-500">Category</h4>
              <div className="flex flex-wrap gap-2">
                {allCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => toggleCategory(category)}
                    className={`px-4 py-2 rounded-full border transition-all ${
                      selectedCategories.includes(category)
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-black'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="pt-2 border-t">
              <h4 className="mb-3 text-sm uppercase tracking-wide text-gray-500">Price Range</h4>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 text-center">
                    <div className="text-xs text-gray-500 mb-1">Min</div>
                    <div className="px-4 py-2 border rounded-lg bg-gray-50">
                      ₱{priceRange[0]}
                    </div>
                  </div>
                  <div className="px-3 text-gray-400">—</div>
                  <div className="flex-1 text-center">
                    <div className="text-xs text-gray-500 mb-1">Max</div>
                    <div className="px-4 py-2 border rounded-lg bg-gray-50">
                      ₱{priceRange[1]}
                    </div>
                  </div>
                </div>
                <Slider
                  min={0}
                  max={1000}
                  step={50}
                  value={priceRange}
                  onValueChange={(value: number[]) => setPriceRange(value as [number, number])}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Filter Actions - Fixed at bottom */}
          <div className="border-t bg-white px-6 py-4 space-y-3">
            <Button
              onClick={() => {
                setIsFilterOpen(false);
              }}
              className="w-full h-12"
              size="lg"
            >
              Show {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'}
            </Button>
            {hasActiveFilters && (
              <Button
                onClick={clearFilters}
                variant="outline"
                className="w-full h-12"
                size="lg"
              >
                Clear All Filters
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}