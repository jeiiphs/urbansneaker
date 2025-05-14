import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { Sneaker } from '../types/sneaker';

export const useWishlist = () => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<Sneaker[]>([]);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user]);

  const fetchWishlist = async () => {
    try {
      const { data } = await api.get('/wishlist');
      setWishlistItems(data);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  const isInWishlist = (sneakerId: number) => {
    return wishlistItems.some(item => item.id === sneakerId);
  };

  const toggleWishlist = async (sneaker: Sneaker) => {
    if (!user) {
      // Handle unauthenticated user
      return;
    }

    try {
      if (isInWishlist(sneaker.id)) {
        await api.delete(`/wishlist/${sneaker.id}`);
        setWishlistItems(items => items.filter(item => item.id !== sneaker.id));
      } else {
        await api.post('/wishlist', { sneakerId: sneaker.id });
        setWishlistItems(items => [...items, sneaker]);
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
    }
  };

  return {
    wishlistItems,
    isInWishlist,
    toggleWishlist,
  };
};