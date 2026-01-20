import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CartItem } from '../components/CartDrawer';

const API_BASE = import.meta.env.VITE_API_BASE || '';

export function useCart() {
  const { isLoggedIn } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadCart = useCallback(async () => {
    if (!isLoggedIn) {
      setCartItems([]);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/cart`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        // Transform backend format to frontend format
        const items: CartItem[] = data.items.map((item: any) => ({
          id: item.productId,
          name: item.productName,
          price: Number(item.price),
          image: item.image || '',
          category: item.category || '',
          quantity: item.quantity,
          isNew: false,
        }));
        setCartItems(items);
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const addToCart = useCallback(async (productId: string, productName: string, price: number, image: string, category: string, quantity: number = 1) => {
    if (!isLoggedIn) {
      // For non-logged-in users, keep local state (fallback)
      setCartItems((prev) => {
        const existing = prev.find((item) => item.id === productId);
        if (existing) {
          return prev.map((item) =>
            item.id === productId
              ? { ...item, quantity: item.quantity + quantity }
              : item,
          );
        }
        return [
          ...prev,
          { id: productId, name: productName, price, image, category, quantity, isNew: false },
        ];
      });
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ productId, productName, price, image, category, quantity }),
      });
      if (res.ok) {
        await loadCart();
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  }, [isLoggedIn, loadCart]);

  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    if (!isLoggedIn) {
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === productId ? { ...item, quantity } : item,
        ),
      );
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/cart`, {
        method: 'GET',
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        const dbItem = data.items.find((i: any) => i.productId === productId);
        if (dbItem) {
          const updateRes = await fetch(`${API_BASE}/api/cart/${dbItem.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ quantity }),
          });
          if (updateRes.ok) {
            await loadCart();
          }
        }
      }
    } catch (error) {
      console.error('Failed to update cart:', error);
    }
  }, [isLoggedIn, loadCart]);

  const removeItem = useCallback(async (productId: string) => {
    if (!isLoggedIn) {
      setCartItems((prev) => prev.filter((item) => item.id !== productId));
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/cart`, {
        method: 'GET',
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        const dbItem = data.items.find((i: any) => i.productId === productId);
        if (dbItem) {
          const deleteRes = await fetch(`${API_BASE}/api/cart/${dbItem.id}`, {
            method: 'DELETE',
            credentials: 'include',
          });
          if (deleteRes.ok) {
            await loadCart();
          }
        }
      }
    } catch (error) {
      console.error('Failed to remove from cart:', error);
    }
  }, [isLoggedIn, loadCart]);

  const clearCart = useCallback(async () => {
    if (!isLoggedIn) {
      setCartItems([]);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/cart`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        await loadCart();
      }
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
  }, [isLoggedIn, loadCart]);

  return {
    cartItems,
    isLoading,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    reloadCart: loadCart,
  };
}

