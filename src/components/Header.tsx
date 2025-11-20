import { ShoppingBag, Search, User, Menu, Heart, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner@2.0.3';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from './ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface HeaderProps {
  onCartClick: () => void;
  onFavoritesClick: () => void;
  onLoginClick: () => void;
  cartItemsCount?: number;
  favoritesCount?: number;
}

// Mock products data for search
const allProducts = [
  {
    id: '1',
    name: 'Classic White T-Shirt - Round Neck',
    price: 200,
    image: 'https://images.unsplash.com/photo-1636458939465-9209848a5688?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwbW9kZWwlMjB0c2hpcnR8ZW58MXx8fHwxNzYyOTI0MDc1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'T-Shirts',
  },
  {
    id: '2',
    name: 'Varsity Jacket - Blue & White',
    price: 600,
    image: 'https://images.unsplash.com/photo-1761245332312-fddc4f0b5bab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2YXJzaXR5JTIwamFja2V0JTIwc3RyZWV0fGVufDF8fHx8MTc2Mjk3Nzk3OXww&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Jackets',
  },
  {
    id: '3',
    name: 'Oversized Hoodie - Premium Cotton',
    price: 450,
    image: 'https://images.unsplash.com/photo-1688111421205-a0a85415b224?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwaG9vZGllfGVufDF8fHx8MTc2Mjk1MjY5MHww&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Hoodies',
  },
  {
    id: '4',
    name: 'Denim Jacket - Classic Blue',
    price: 550,
    image: 'https://images.unsplash.com/photo-1657349038547-b18a07fb4329?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZW5pbSUyMGphY2tldCUyMHN0eWxlfGVufDF8fHx8MTc2MjkzMjg2MXww&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Jackets',
  },
  {
    id: '5',
    name: 'Premium Black Hoodie',
    price: 480,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMGhvb2RpZXxlbnwxfHx8fDE3NjI5MjQwNzV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Hoodies',
  },
  {
    id: '6',
    name: 'Graphic Print Tee',
    price: 250,
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmFwaGljJTIwdGVlfGVufDF8fHx8MTc2MjkyNDA3NXww&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'T-Shirts',
  },
];

export function Header({ onCartClick, onFavoritesClick, onLoginClick, cartItemsCount = 0, favoritesCount = 0 }: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { requireAuth, isLoggedIn, user, logout } = useAuth();
  const searchRef = useRef<HTMLDivElement>(null);
  
  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleFavoriteClick = () => {
    requireAuth(() => {
      onFavoritesClick();
    });
  };

  const handleUserClick = () => {
    if (isLoggedIn) {
      // Show user menu or logout
      logout();
    } else {
      onLoginClick();
    }
  };

  // Filter products based on search query
  const filteredProducts = searchQuery.trim()
    ? allProducts.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleProductClick = (productId: string) => {
    setSearchOpen(false);
    setSearchQuery('');
    navigate(`/product/${productId}`);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-md bg-black">
              <span className="text-white">R</span>
            </div>
            <span className="tracking-tight">RFM</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              to="/new-arrivals" 
              className={`text-sm transition-colors hover:text-black/70 relative ${
                isActive('/new-arrivals') ? 'font-medium' : ''
              }`}
            >
              Catalog
              {isActive('/new-arrivals') && (
                <span className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-black"></span>
              )}
            </Link>
            <Link 
              to="/unisex" 
              className={`text-sm transition-colors hover:text-black/70 relative ${
                isActive('/unisex') ? 'font-medium' : ''
              }`}
            >
              Unisex
              {isActive('/unisex') && (
                <span className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-black"></span>
              )}
            </Link>
            <Link 
              to="/men" 
              className={`text-sm transition-colors hover:text-black/70 relative ${
                isActive('/men') ? 'font-medium' : ''
              }`}
            >
              Men
              {isActive('/men') && (
                <span className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-black"></span>
              )}
            </Link>
            <Link 
              to="/women" 
              className={`text-sm transition-colors hover:text-black/70 relative ${
                isActive('/women') ? 'font-medium' : ''
              }`}
            >
              Women
              {isActive('/women') && (
                <span className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-black"></span>
              )}
            </Link>
            <Link 
              to="/kids" 
              className={`text-sm transition-colors hover:text-black/70 relative ${
                isActive('/kids') ? 'font-medium' : ''
              }`}
            >
              Kids
              {isActive('/kids') && (
                <span className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-black"></span>
              )}
            </Link>
            <Link 
              to="/custom-products" 
              className={`text-sm transition-colors hover:text-black/70 relative ${
                isActive('/custom-products') ? 'font-medium' : ''
              }`}
            >
              Custom Design
              {isActive('/custom-products') && (
                <span className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-black"></span>
              )}
            </Link>
          </nav>
        </div>

        {/* Search Bar - Desktop */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full" ref={searchRef}>
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
            <Input 
              placeholder="Search for products..." 
              className="w-full pl-10 pr-4 h-10 rounded-full border-gray-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={() => setSearchOpen(true)}
            />
            
            {/* Search Results Dropdown */}
            {searchOpen && searchQuery.trim() && (
              <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-auto z-50">
                {filteredProducts.length > 0 ? (
                  <div className="p-2">
                    {filteredProducts.map(product => (
                      <button
                        key={product.id}
                        onClick={() => handleProductClick(product.id)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <ImageWithFallback
                          src={product.image}
                          alt={product.name}
                          className="size-12 rounded-md object-cover"
                        />
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.category}</p>
                        </div>
                        <p className="text-sm font-medium">₱{product.price.toFixed(2)}</p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <Search className="size-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500">No products found</p>
                    <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Mobile Search */}
          <Button variant="ghost" size="icon" className="md:hidden transition-transform active:scale-95">
            <Search className="size-5" />
          </Button>

          {/* User Menu */}
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative transition-transform active:scale-95">
                  <User className="size-5" />
                  {/* Online indicator */}
                  <span className="absolute top-1 right-1 size-2 bg-green-500 rounded-full ring-2 ring-white"></span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {
                  // TODO: Navigate to account page
                  console.log('View account');
                }}>
                  <User className="mr-2 size-4" />
                  My Account
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleFavoriteClick}>
                  <Heart className="mr-2 size-4" />
                  My Favorites
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {
                  logout();
                  toast.success('Logged out', {
                    description: 'You have been successfully logged out.',
                  });
                }}>
                  <LogOut className="mr-2 size-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="icon" onClick={onLoginClick} className="relative transition-transform active:scale-95">
              <User className="size-5" />
            </Button>
          )}

          <Button variant="ghost" size="icon" onClick={handleFavoriteClick} className="relative transition-transform active:scale-95">
            <Heart className="size-5" />
            {favoritesCount > 0 && (
              <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-black text-white text-xs">
                {favoritesCount}
              </span>
            )}
          </Button>

          <Button variant="ghost" size="icon" onClick={onCartClick} className="relative transition-transform active:scale-95">
            <ShoppingBag className="size-5" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-black text-white text-xs">
                {cartItemsCount}
              </span>
            )}
          </Button>

          {/* Mobile Menu */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden transition-transform active:scale-95"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="size-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="right" className="w-[300px] sm:w-[400px]">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
            <SheetDescription>Navigate to different sections</SheetDescription>
          </SheetHeader>
          <nav className="flex flex-col gap-4 mt-8">
            <Link 
              to="/new-arrivals" 
              className={`text-lg py-2 transition-colors hover:text-black/70 ${
                isActive('/new-arrivals') ? 'font-medium border-l-2 border-black pl-4' : 'pl-4'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Catalog
            </Link>
            <Link 
              to="/unisex" 
              className={`text-lg py-2 transition-colors hover:text-black/70 ${
                isActive('/unisex') ? 'font-medium border-l-2 border-black pl-4' : 'pl-4'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Unisex
            </Link>
            <Link 
              to="/men" 
              className={`text-lg py-2 transition-colors hover:text-black/70 ${
                isActive('/men') ? 'font-medium border-l-2 border-black pl-4' : 'pl-4'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Men
            </Link>
            <Link 
              to="/women" 
              className={`text-lg py-2 transition-colors hover:text-black/70 ${
                isActive('/women') ? 'font-medium border-l-2 border-black pl-4' : 'pl-4'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Women
            </Link>
            <Link 
              to="/kids" 
              className={`text-lg py-2 transition-colors hover:text-black/70 ${
                isActive('/kids') ? 'font-medium border-l-2 border-black pl-4' : 'pl-4'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Kids
            </Link>
            <Link 
              to="/custom-products" 
              className={`text-lg py-2 transition-colors hover:text-black/70 ${
                isActive('/custom-products') ? 'font-medium border-l-2 border-black pl-4' : 'pl-4'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Custom Design
            </Link>
          </nav>
        </SheetContent>
      </Sheet>

      {/* Search Dialog */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Search Results</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            {filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <div key={product.id} className="flex items-center gap-4">
                  <ImageWithFallback
                    src={product.image}
                    alt={product.name}
                    className="size-10 rounded-md"
                  />
                  <div className="flex flex-col">
                    <p className="text-sm font-medium leading-none">{product.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{product.category}</p>
                    <p className="text-sm leading-none text-black/70">₹{product.price}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative transition-transform active:scale-95"
                    onClick={() => handleProductClick(product.id)}
                  >
                    <ShoppingBag className="size-5" />
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm leading-none text-gray-500">No products found</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}