import React from 'react';
import { useWishlist } from '../hooks/useWishlist';
import { ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

const WishlistPage = () => {
  const { wishlistItems, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (wishlistItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Your Wishlist is Empty</h2>
          <p className="text-gray-600">Start adding items to your wishlist while shopping!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlistItems.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h2 className="text-lg font-semibold">{item.name}</h2>
              <p className="text-gray-600 mt-1">${item.price}</p>
              <div className="mt-4 flex justify-between">
                <button
                  onClick={() => addToCart(item)}
                  className="flex items-center px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Add to Cart
                </button>
                <button
                  onClick={() => toggleWishlist(item)}
                  className="p-2 text-red-600 hover:text-red-700"
                  aria-label="Remove from wishlist"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;