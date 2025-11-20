import { Heart, ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner@2.0.3';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  category?: string;
  isNew?: boolean;
  onAddToCart: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  isFavorited?: boolean;
}

export function ProductCard({ id, name, price, image, category, isNew, onAddToCart, onToggleFavorite, isFavorited = false }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { requireAuth } = useAuth();
  const navigate = useNavigate();

  const handleFavoriteClick = () => {
    requireAuth(() => {
      if (onToggleFavorite) {
        onToggleFavorite(id);
        toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites');
      }
    });
  };

  const handleAddToCart = () => {
    requireAuth(() => {
      onAddToCart(id);
      toast.success(`${name} added to cart!`);
    });
  };

  const handleProductClick = () => {
    navigate(`/product/${id}`);
  };

  return (
    <div 
      className="group relative overflow-hidden rounded-lg bg-white"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div 
        className="relative aspect-[3/4] overflow-hidden bg-gray-100 cursor-pointer"
        onClick={handleProductClick}
      >
        <ImageWithFallback
          src={image}
          alt={name}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isNew && (
            <Badge className="bg-black text-white hover:bg-black/90">New</Badge>
          )}
          {category && (
            <Badge variant="secondary" className="bg-white/90 text-black">
              {category}
            </Badge>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleFavoriteClick();
          }}
          className="absolute top-3 right-3 flex size-9 items-center justify-center rounded-full bg-white/90 backdrop-blur transition-all hover:bg-white active:scale-95"
        >
          <Heart 
            className={`size-4 transition-colors ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} 
          />
        </button>

        {/* Quick Add to Cart - Shows on hover */}
        <div 
          className={`absolute bottom-0 left-0 right-0 p-4 transition-all duration-300 ${
            isHovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
          }`}
        >
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
            className="w-full bg-black text-white hover:bg-black/90 transition-transform active:scale-95"
          >
            <ShoppingCart className="mr-2 size-4" />
            Add to Cart
          </Button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 cursor-pointer" onClick={handleProductClick}>
        <h3 className="mb-1 line-clamp-1">{name}</h3>
        <p className="text-gray-600">₱{price.toFixed(2)}</p>
      </div>
    </div>
  );
}