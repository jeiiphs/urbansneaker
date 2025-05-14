import { api } from './api';
import type { Promotion } from '../types/promotion';

// Fallback promotions in case the server is not available
const fallbackPromotions: Promotion[] = [
  {
    id: '1',
    title: 'Summer Sale',
    description: 'Get amazing discounts on selected sneakers',
    discountPercentage: 20,
    validUntil: '2024-12-31',
    imageUrl: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80'
  },
  {
    id: '2',
    title: 'New Arrivals Special',
    description: 'Be the first to get our latest collections with special pricing',
    discountPercentage: 15,
    validUntil: '2024-12-31',
    imageUrl: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&q=80'
  },
  {
    id: '3',
    title: 'Limited Edition Collection',
    description: 'Exclusive designs available for a limited time only',
    discountPercentage: 25,
    validUntil: '2024-12-31',
    imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80'
  }
];

const sanitizePromotion = (promo: any): Promotion => ({
  id: String(promo.id),
  title: String(promo.title || ''),
  description: String(promo.description || ''),
  discountPercentage: Number(promo.discount_percentage || 0),
  validUntil: String(promo.valid_until || ''),
  imageUrl: promo.image_url || undefined
});

export const getPromotions = async (): Promise<Promotion[]> => {
  try {
    const { data } = await api.get('/api/promotions');
    return Array.isArray(data) ? data.map(sanitizePromotion) : fallbackPromotions;
  } catch (error) {
    console.warn('Using fallback promotions due to server error:', error);
    return fallbackPromotions;
  }
};