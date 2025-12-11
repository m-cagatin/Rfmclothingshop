import { Heart, Palette } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface CustomProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  category?: string;
  isNew?: boolean;
}

export function CustomProductCard({ id, name, price, image, category, isNew }: CustomProductCardProps) {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { requireAuth } = useAuth();

  const handleCustomizeClick = () => {
    requireAuth(() => {
      // Pass full category string and product info to the design page
      navigate('/custom-design', { 
        state: { 
          category: category || name, // Use category or name as full category identifier
          productName: name,
          productId: id 
        } 
      });
    });
  };

  const handleFavoriteClick = () => {
    requireAuth(() => {
      setIsFavorite(!isFavorite);
    });
  };

  return (
    <div 
      className="group relative overflow-hidden rounded-lg bg-white"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
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
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 flex size-9 items-center justify-center rounded-full bg-white/90 backdrop-blur transition-all hover:bg-white"
        >
          <Heart 
            className={`size-4 transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} 
          />
        </button>

        {/* Customize Now Button - Shows on hover */}
        <div 
          className={`absolute bottom-0 left-0 right-0 p-4 transition-all duration-300 ${
            isHovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
          }`}
        >
          <Button 
            onClick={handleCustomizeClick}
            className="w-full bg-black text-white hover:bg-black/90"
          >
            <Palette className="mr-2 size-4" />
            Customize Now
          </Button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="mb-1 line-clamp-1">{name}</h3>
        <p className="text-gray-600">₱{price.toFixed(2)}</p>
      </div>
    </div>
  );
}