import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FavoriteItem } from '../components/FavoritesDrawer';

const API_BASE = import.meta.env.VITE_API_BASE || '';

export function useFavorites() {
  const { isLoggedIn } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadFavorites = useCallback(async () => {
    if (!isLoggedIn) {
      setFavorites([]);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/favorites`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        // Transform backend format to frontend format
        const items: FavoriteItem[] = data.items.map((item: any) => ({
          id: item.productId,
          name: item.productName,
          price: Number(item.price),
          image: item.image || '',
          category: item.category || '',
        }));
        setFavorites(items);
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const toggleFavorite = useCallback(async (productId: string, productName: string, price: number, image: string, category: string) => {
    if (!isLoggedIn) {
      // For non-logged-in users, keep local state (fallback)
      setFavorites((prev) => {
        const existing = prev.find((item) => item.id === productId);
        if (existing) {
          return prev.filter((item) => item.id !== productId);
        }
        return [...prev, { id: productId, name: productName, price, image, category }];
      });
      return false;
    }

    try {
      const res = await fetch(`${API_BASE}/api/favorites/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ productId, productName, price, image, category }),
      });
      if (res.ok) {
        await loadFavorites();
        const data = await res.json();
        return data.isFavorited;
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
    return false;
  }, [isLoggedIn, loadFavorites]);

  const removeFavorite = useCallback(async (productId: string) => {
    if (!isLoggedIn) {
      setFavorites((prev) => prev.filter((item) => item.id !== productId));
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/favorites`, {
        method: 'GET',
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        const dbItem = data.items.find((i: any) => i.productId === productId);
        if (dbItem) {
          const deleteRes = await fetch(`${API_BASE}/api/favorites/${dbItem.id}`, {
            method: 'DELETE',
            credentials: 'include',
          });
          if (deleteRes.ok) {
            await loadFavorites();
          }
        }
      }
    } catch (error) {
      console.error('Failed to remove favorite:', error);
    }
  }, [isLoggedIn, loadFavorites]);

  const isFavorited = useCallback((productId: string) => {
    return favorites.some((fav) => fav.id === productId);
  }, [favorites]);

  return {
    favorites,
    isLoading,
    toggleFavorite,
    removeFavorite,
    isFavorited,
    reloadFavorites: loadFavorites,
  };
}

