import { ShoppingBag, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { toast } from 'sonner@2.0.3';

export interface FavoriteItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

interface FavoritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: FavoriteItem[];
  onRemoveFavorite: (id: string) => void;
  onAddToCart: (id: string) => void;
}

export function FavoritesDrawer({ 
  isOpen, 
  onClose, 
  favorites, 
  onRemoveFavorite,
  onAddToCart 
}: FavoritesDrawerProps) {
  const handleRemoveFavorite = (id: string, name: string) => {
    onRemoveFavorite(id);
    toast.success(`${name} removed from favorites`);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle>My Favorites</SheetTitle>
          <SheetDescription>
            {favorites.length} {favorites.length === 1 ? 'item' : 'items'} saved
          </SheetDescription>
        </SheetHeader>

        {/* Favorites List */}
        <div className="flex-1 overflow-y-auto mt-6">
          {favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="size-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <svg
                  className="size-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <h3 className="mb-2">No favorites yet</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Start adding items to your favorites by clicking the heart icon on products you love!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {favorites.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 rounded-lg border bg-white hover:shadow-md transition-shadow"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="size-24 object-cover rounded-md"
                  />
                  <div className="flex-1 flex flex-col">
                    <div className="flex-1">
                      <h3 className="text-sm mb-1">{item.name}</h3>
                      <p className="text-xs text-muted-foreground mb-2">{item.category}</p>
                      <p className="font-medium">₱{item.price}</p>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        onClick={(e) => {
                          // Visual feedback
                          const button = e.currentTarget;
                          button.style.transform = 'scale(0.95)';
                          setTimeout(() => {
                            button.style.transform = 'scale(1)';
                          }, 100);
                          
                          onAddToCart(item.id);
                          toast.success(`${item.name} added to cart!`);
                        }}
                        className="flex-1 bg-black text-white hover:bg-black/90 transition-transform active:scale-95"
                      >
                        <ShoppingBag className="size-4 mr-2" />
                        Add to Cart
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50 -mt-1 transition-transform active:scale-95"
                        onClick={() => handleRemoveFavorite(item.id, item.name)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {favorites.length > 0 && (
          <>
            <Separator />
            <div className="p-6">
              <Button
                className="w-full bg-black text-white hover:bg-black/90 transition-transform active:scale-95"
                onClick={() => {
                  // Add all to cart
                  favorites.forEach(item => onAddToCart(item.id));
                  toast.success('All items added to cart!');
                }}
              >
                <ShoppingBag className="size-4 mr-2" />
                Add All to Cart
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}