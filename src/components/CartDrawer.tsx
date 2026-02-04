import { Minus, Plus, Trash2, ShoppingBag, Package } from 'lucide-react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  // Customization fields
  size?: string;
  color?: string;
  printOption?: 'none' | 'front' | 'back' | 'both';
  customizationData?: {
    productId: number;
    frontDesignUrl?: string;
    backDesignUrl?: string;
    frontCanvasJson?: string;
    backCanvasJson?: string;
  };
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
}

export function CartDrawer({ isOpen, onClose, items, onUpdateQuantity, onRemoveItem, onClearCart }: CartDrawerProps) {
  const navigate = useNavigate();
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const freeShippingThreshold = 2000;
  const shipping = subtotal >= freeShippingThreshold ? 0 : 100;
  const total = subtotal + shipping;
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const amountUntilFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const handleRemoveItem = (id: string, name: string) => {
    onRemoveItem(id);
    toast.success(`${name} removed from cart`);
  };

  const handleUpdateQuantity = (id: string, newQuantity: number, itemName: string) => {
    onUpdateQuantity(id, newQuantity);
    toast.success(`Updated quantity for ${itemName}`);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="flex w-full flex-col sm:max-w-lg p-0">
        {/* Header */}
        <div className="px-6 py-5 border-b">
          <SheetTitle className="text-xl mb-2">Shopping Cart</SheetTitle>
          <div className="flex items-center justify-between">
            <SheetDescription className="text-sm">
              Review your items and proceed to checkout
            </SheetDescription>
            <span className="text-sm font-medium text-gray-900 ml-4 shrink-0">
              {totalItems} {totalItems === 1 ? 'item' : 'items'}
            </span>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-12">
            <div className="flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200">
              <ShoppingBag className="size-12 text-gray-400" />
            </div>
            <div className="text-center">
              <h3 className="mb-2">Your cart is empty</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Discover amazing products and add them to your cart to get started!
              </p>
            </div>
            <Button onClick={onClose} className="bg-black text-white hover:bg-black/90">
              <ShoppingBag className="size-4 mr-2" />
              Start Shopping
            </Button>
          </div>
        ) : (
          <>
            {/* Free Shipping Progress */}
            <div className="px-6 pt-4">
              {shipping > 0 && amountUntilFreeShipping > 0 ? (
                <div className="bg-blue-50 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="size-4 text-blue-600" />
                    <p className="text-sm text-blue-900">
                      Add <span className="font-semibold">₱{amountUntilFreeShipping.toFixed(2)}</span> more for FREE shipping!
                    </p>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-1.5">
                    <div 
                      className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((subtotal / freeShippingThreshold) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 rounded-lg p-3 mb-4 flex items-center gap-2">
                  <Package className="size-4 text-green-600" />
                  <p className="text-sm text-green-900 font-medium">
                    🎉 You've unlocked FREE shipping!
                  </p>
                </div>
              )}
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-auto px-6 pb-4">
              <div className="space-y-6">
                {items.map((item) => {
                  const itemTotal = item.price * item.quantity;
                  return (
                    <div key={item.id} className="flex gap-4 items-start">
                      {/* Product Image */}
                      <div className="size-20 shrink-0 overflow-hidden rounded-md bg-gray-100 border">
                        <ImageWithFallback
                          src={item.image}
                          alt={item.name}
                          className="size-full object-cover"
                        />
                      </div>
                      
                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="line-clamp-2 pr-2">{item.name}</h4>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50 -mt-1 transition-transform active:scale-95"
                            onClick={() => handleRemoveItem(item.id, item.name)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">
                          ₱{item.price.toFixed(2)} each
                        </p>
                        
                        <div className="flex items-center justify-between">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3 border rounded-md">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 hover:bg-gray-100 rounded-none transition-transform active:scale-95"
                              onClick={() => handleUpdateQuantity(item.id, Math.max(1, item.quantity - 1), item.name)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="size-3.5" />
                            </Button>
                            <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 hover:bg-gray-100 rounded-none transition-transform active:scale-95"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1, item.name)}
                            >
                              <Plus className="size-3.5" />
                            </Button>
                          </div>

                          {/* Item Total */}
                          <div className="font-semibold">
                            ₱{itemTotal.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Summary - Fixed */}
            <div className="border-t bg-white">
              <div className="px-6 py-5 space-y-3">
                {/* Subtotal */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})
                  </span>
                  <span className="font-medium">₱{subtotal.toFixed(2)}</span>
                </div>

                {/* Shipping */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  {shipping === 0 ? (
                    <span className="font-medium text-green-600">FREE</span>
                  ) : (
                    <span className="font-medium">₱{shipping.toFixed(2)}</span>
                  )}
                </div>

                <Separator />

                {/* Total */}
                <div className="flex items-center justify-between pt-1">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-xl">₱{total.toFixed(2)}</span>
                </div>

                {/* Checkout Buttons */}
                <div className="space-y-3 pt-2">
                  <Button 
                    className="w-full bg-black text-white hover:bg-black/90 h-12 transition-transform active:scale-95" 
                    onClick={() => {
                      onClose();
                      navigate('/checkout');
                      toast.success('Proceeding to checkout...');
                    }}
                  >
                    Proceed to Checkout
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full h-10 transition-transform active:scale-95"
                    onClick={onClose}
                  >
                    Continue Shopping
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}