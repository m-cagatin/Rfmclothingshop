import { useState, useMemo } from 'react';
import { ProductCard } from '../components/ProductCard';
import { Button } from '../components/ui/button';
import { SlidersHorizontal, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../components/ui/sheet';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';
import { Slider } from '../components/ui/slider';
import { FavoriteItem } from '../components/FavoritesDrawer';

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
}

export function NewArrivalsPage({ onAddToCart, onToggleFavorite, favorites }: NewArrivalsPageProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);

  // Mock product data - all new arrivals
  const newProducts: Product[] = [
    {
      id: '1',
      name: 'Classic White T-Shirt - Round Neck',
      price: 200,
      image: 'https://images.unsplash.com/photo-1636458939465-9209848a5688?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwbW9kZWwlMjB0c2hpcnR8ZW58MXx8fHwxNzYyOTI0MDc1fDA&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'T-Shirts',
      isNew: true,
      section: 'New Arrivals',
    },
    {
      id: '2',
      name: 'Varsity Jacket - Blue & White',
      price: 600,
      image: 'https://images.unsplash.com/photo-1761245332312-fddc4f0b5bab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2YXJzaXR5JTIwamFja2V0JTIwc3RyZWV0fGVufDF8fHx8MTc2Mjk3Nzk3OXww&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'Jackets',
      isNew: true,
      section: 'New Arrivals',
    },
    {
      id: '5',
      name: 'Premium Black Hoodie',
      price: 480,
      image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMGhvb2RpZXxlbnwxfHx8fDE3NjI5MjQwNzV8MA&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'Hoodies',
      isNew: true,
      section: 'New Arrivals',
    },
    {
      id: '6',
      name: 'Graphic Print Tee',
      price: 250,
      image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmFwaGljJTIwdGVlfGVufDF8fHx8MTc2MjkyNDA3NXww&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'T-Shirts',
      isNew: true,
      section: 'New Arrivals',
    },
    {
      id: '7',
      name: 'Bomber Jacket - Olive',
      price: 650,
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib21iZXIlMjBqYWNrZXR8ZW58MXx8fHwxNzYyOTI0MDc1fDA&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'Jackets',
      isNew: true,
      section: 'New Arrivals',
    },
    {
      id: '8',
      name: 'Minimalist Crew Neck',
      price: 220,
      image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmV3JTIwbmVjayUyMHRzaGlydHxlbnwxfHx8fDE3NjI5MjQwNzV8MA&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'T-Shirts',
      isNew: true,
      section: 'New Arrivals',
    },
  ];

  // Men's products
  const menProducts: Product[] = [
    {
      id: 'm1',
      name: 'Classic White T-Shirt - Round Neck',
      price: 200,
      image: 'https://images.unsplash.com/photo-1636458939465-9209848a5688?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwbW9kZWwlMjB0c2hpcnR8ZW58MXx8fHwxNzYyOTI0MDc1fDA&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'T-Shirts',
      isNew: false,
      section: 'Men',
    },
    {
      id: 'm2',
      name: 'Varsity Jacket - Blue & White',
      price: 600,
      image: 'https://images.unsplash.com/photo-1761245332312-fddc4f0b5bab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2YXJzaXR5JTIwamFja2V0JTIwc3RyZWV0fGVufDF8fHx8MTc2Mjk3Nzk3OXww&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'Jackets',
      isNew: false,
      section: 'Men',
    },
    {
      id: 'm3',
      name: 'Oversized Hoodie - Premium Cotton',
      price: 450,
      image: 'https://images.unsplash.com/photo-1688111421205-a0a85415b224?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwaG9vZGllfGVufDF8fHx8MTc2Mjk1MjY5MHww&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'Hoodies',
      isNew: false,
      section: 'Men',
    },
    {
      id: 'm4',
      name: 'Denim Jacket - Classic Blue',
      price: 550,
      image: 'https://images.unsplash.com/photo-1657349038547-b18a07fb4329?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZW5pbSUyMGphY2tldCUyMHN0eWxlfGVufDF8fHx8MTc2MjkzMjg2MXww&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'Jackets',
      isNew: false,
      section: 'Men',
    },
    {
      id: 'm9',
      name: 'Polo Shirt - Navy Blue',
      price: 280,
      image: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb2xvJTIwc2hpcnQlMjBtZW58ZW58MXx8fHwxNzYyOTI0MDc1fDA&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'Shirts',
      isNew: false,
      section: 'Men',
    },
    {
      id: 'm10',
      name: 'Cargo Pants - Black',
      price: 520,
      image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJnbyUyMHBhbnRzfGVufDF8fHx8MTc2MjkyNDA3NXww&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'Pants',
      isNew: false,
      section: 'Men',
    },
  ];

  // Women's products
  const womenProducts: Product[] = [
    {
      id: 'w1',
      name: 'Elegant Blazer - Black',
      price: 680,
      image: 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21lbiUyMGJsYXplcnxlbnwxfHx8fDE3NjI5MjQwNzV8MA&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'Blazers',
      isNew: false,
      section: 'Women',
    },
    {
      id: 'w2',
      name: 'Floral Summer Dress',
      price: 520,
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdW1tZXIlMjBkcmVzcyUyMGZsb3JhbHxlbnwxfHx8fDE3NjI5MjQwNzV8MA&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'Dresses',
      isNew: false,
      section: 'Women',
    },
    {
      id: 'w3',
      name: 'Casual Knit Sweater',
      price: 380,
      image: 'https://images.unsplash.com/photo-1609825488888-3a766db05542?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21lbiUyMHN3ZWF0ZXJ8ZW58MXx8fHwxNzYyOTI0MDc1fDA&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'Sweaters',
      isNew: false,
      section: 'Women',
    },
    {
      id: 'w4',
      name: 'High-Waist Jeans - Blue',
      price: 450,
      image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21lbiUyMGplYW5zfGVufDF8fHx8MTc2MjkyNDA3NXww&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'Jeans',
      isNew: false,
      section: 'Women',
    },
    {
      id: 'w5',
      name: 'Silk Blouse - White',
      price: 340,
      image: 'https://images.unsplash.com/photo-1598522325074-042db73aa4e6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21lbiUyMGJsb3VzZXxlbnwxfHx8fDE3NjI5MjQwNzV8MA&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'Blouses',
      isNew: false,
      section: 'Women',
    },
    {
      id: 'w6',
      name: 'Midi Skirt - Pleated',
      price: 420,
      image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21lbiUyMHNraXJ0fGVufDF8fHx8MTc2MjkyNDA3NXww&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'Skirts',
      isNew: false,
      section: 'Women',
    },
  ];

  // Kids' products
  const kidsProducts: Product[] = [
    {
      id: 'k1',
      name: 'Kids Classic T-Shirt',
      price: 150,
      image: 'https://images.unsplash.com/photo-1731267776886-90f90af75eb1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxraWRzJTIwdC1zaGlydCUyMHdoaXRlfGVufDF8fHx8MTc2Mjk5MDk5MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      category: 'T-Shirts',
      isNew: false,
      section: 'Kids',
    },
    {
      id: 'k2',
      name: 'Kids Polo Shirt - Classic',
      price: 180,
      image: 'https://images.unsplash.com/photo-1659779193831-97ccb9fecfeb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxraWRzJTIwcG9sbyUyMHNoaXJ0fGVufDF8fHx8MTc2MjkzMjQzOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      category: 'Shirts',
      isNew: false,
      section: 'Kids',
    },
    {
      id: 'k3',
      name: 'Kids Casual Outfit',
      price: 280,
      image: 'https://images.unsplash.com/photo-1759313560190-d160c3567170?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxraWRzJTIwZmFzaGlvbiUyMGNhc3VhbHxlbnwxfHx8fDE3NjI5OTA5OTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      category: 'Casual',
      isNew: false,
      section: 'Kids',
    },
    {
      id: 'k4',
      name: 'Kids Stylish Wear',
      price: 320,
      image: 'https://images.unsplash.com/photo-1695262620869-fedab63bcc41?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlsZHJlbiUyMGNsb3RoaW5nJTIwc3R5bGV8ZW58MXx8fHwxNzYyOTkwOTkxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      category: 'Clothing',
      isNew: false,
      section: 'Kids',
    },
  ];

  // Unisex products
  const unisexProducts: Product[] = [
    {
      id: '1',
      name: 'Classic White T-Shirt - Round Neck',
      price: 200,
      image: 'https://images.unsplash.com/photo-1636458939465-9209848a5688?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwbW9kZWwlMjB0c2hpcnR8ZW58MXx8fHwxNzYyOTI0MDc1fDA&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'T-Shirts',
      isNew: false,
      section: 'Unisex',
    },
    {
      id: '2',
      name: 'Varsity Jacket - Blue & White',
      price: 600,
      image: 'https://images.unsplash.com/photo-1761245332312-fddc4f0b5bab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2YXJzaXR5JTIwamFja2V0JTIwc3RyZWV0fGVufDF8fHx8MTc2Mjk3Nzk3OXww&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'Jackets',
      isNew: false,
      section: 'Unisex',
    },
    {
      id: '3',
      name: 'Oversized Hoodie - Premium Cotton',
      price: 450,
      image: 'https://images.unsplash.com/photo-1688111421205-a0a85415b224?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwaG9vZGllfGVufDF8fHx8MTc2Mjk1MjY5MHww&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'Hoodies',
      isNew: false,
      section: 'Unisex',
    },
    {
      id: '4',
      name: 'Denim Jacket - Classic Blue',
      price: 550,
      image: 'https://images.unsplash.com/photo-1657349038547-b18a07fb4329?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZW5pbSUyMGphY2tldCUyMHN0eWxlfGVufDF8fHx8MTc2MjkzMjg2MXww&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'Jackets',
      isNew: false,
      section: 'Unisex',
    },
    {
      id: '5',
      name: 'Premium Black Hoodie',
      price: 480,
      image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMGhvb2RpZXxlbnwxfHx8fDE3NjI5MjQwNzV8MA&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'Hoodies',
      isNew: false,
      section: 'Unisex',
    },
    {
      id: '6',
      name: 'Graphic Print Tee',
      price: 250,
      image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmFwaGljJTIwdGVlfGVufDF8fHx8MTc2MjkyNDA3NXww&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'T-Shirts',
      isNew: false,
      section: 'Unisex',
    },
  ];

  const allProducts = [...newProducts, ...unisexProducts, ...menProducts, ...womenProducts, ...kidsProducts];

  // Get all unique categories
  const allCategories = useMemo(() => {
    const categories = new Set(allProducts.map(p => p.category));
    return Array.from(categories).sort();
  }, []);

  const sections = ['New Arrivals', 'Men', 'Women', 'Kids', 'Unisex'];

  // Filter products
  const filteredProducts = useMemo(() => {
    return allProducts.filter(product => {
      // Category filter
      if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) {
        return false;
      }

      // Section filter
      if (selectedSections.length > 0 && !selectedSections.includes(product.section || '')) {
        return false;
      }

      // Price filter
      if (product.price < priceRange[0] || product.price > priceRange[1]) {
        return false;
      }

      return true;
    });
  }, [selectedCategories, selectedSections, priceRange, allProducts]);

  // Group filtered products by section
  const filteredBySection = useMemo(() => {
    const grouped = {
      'New Arrivals': filteredProducts.filter(p => p.section === 'New Arrivals'),
      'Men': filteredProducts.filter(p => p.section === 'Men'),
      'Women': filteredProducts.filter(p => p.section === 'Women'),
      'Kids': filteredProducts.filter(p => p.section === 'Kids'),
      'Unisex': filteredProducts.filter(p => p.section === 'Unisex'),
    };
    return grouped;
  }, [filteredProducts]);

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

      {/* New Arrivals Section */}
      {filteredBySection['New Arrivals'].length > 0 && (
        <section className="container mx-auto px-4 py-12 md:px-6">
          <div className="mb-6">
            <h2 className="mb-2">New Arrivals</h2>
            <p className="text-gray-600">Fresh styles just dropped</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBySection['New Arrivals'].map((product) => (
              <ProductCard
                key={product.id}
                {...product}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        </section>
      )}

      {/* Men's Section */}
      {filteredBySection['Men'].length > 0 && (
        <section className="container mx-auto px-4 py-12 md:px-6 border-t">
          <div className="mb-6">
            <h2 className="mb-2">Men's Collection</h2>
            <p className="text-gray-600">Stylish and comfortable clothing for men</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBySection['Men'].map((product) => (
              <ProductCard
                key={product.id}
                {...product}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        </section>
      )}

      {/* Women's Section */}
      {filteredBySection['Women'].length > 0 && (
        <section className="container mx-auto px-4 py-12 md:px-6 border-t">
          <div className="mb-6">
            <h2 className="mb-2">Women's Collection</h2>
            <p className="text-gray-600">Elegant and trendy clothing for women</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBySection['Women'].map((product) => (
              <ProductCard
                key={product.id}
                {...product}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        </section>
      )}

      {/* Kids Section */}
      {filteredBySection['Kids'].length > 0 && (
        <section className="container mx-auto px-4 py-12 md:px-6 border-t">
          <div className="mb-6">
            <h2 className="mb-2">Kids' Collection</h2>
            <p className="text-gray-600">Fun and comfortable clothing for kids</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBySection['Kids'].map((product) => (
              <ProductCard
                key={product.id}
                {...product}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        </section>
      )}

      {/* Unisex Section */}
      {filteredBySection['Unisex'].length > 0 && (
        <section className="container mx-auto px-4 py-12 md:px-6 border-t">
          <div className="mb-6">
            <h2 className="mb-2">Unisex Collection</h2>
            <p className="text-gray-600">Stylish and comfortable clothing for everyone</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBySection['Unisex'].map((product) => (
              <ProductCard
                key={product.id}
                {...product}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        </section>
      )}

      {/* No Results */}
      {filteredProducts.length === 0 && (
        <section className="container mx-auto px-4 py-20 md:px-6 text-center">
          <h3 className="mb-2">No products found</h3>
          <p className="text-gray-600 mb-6">Try adjusting your filters to see more results</p>
          <Button onClick={clearFilters}>Clear all filters</Button>
        </section>
      )}

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