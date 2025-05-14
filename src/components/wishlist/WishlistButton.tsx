import React from 'react';
import { Heart } from 'lucide-react';
import { useWishlist } from '../../hooks/useWishlist';
import type { Sneaker } from '../../types/sneaker';

interface WishlistButtonProps {
  sneaker: Sneaker;
}

const WishlistButton: React.FC<WishlistButtonProps> = ({ sneaker }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isWishlisted = isInWishlist(sneaker.id);

  return (
    <button
      onClick={() => toggleWishlist(sneaker)}
      className={`p-2 rounded-full transition-colors ${
        isWishlisted 
          ? 'bg-red-100 text-red-600' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
      aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
    </button>
  );
};

export default WishlistButton;