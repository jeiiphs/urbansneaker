import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, ShoppingBag } from 'lucide-react';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import WishlistButton from '../components/wishlist/WishlistButton';
import type { Sneaker } from '../types/sneaker';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sneaker, setSneaker] = useState<Sneaker | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchSneaker = async () => {
      try {
        const response = await api.get(`/sneakers/${id}`);
        setSneaker(response.data);
      } catch (error) {
        console.error('Error fetching sneaker:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSneaker();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
      </div>
    );
  }

  if (!sneaker) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-semibold mb-4">Sneaker not found</p>
          <button
            onClick={() => navigate('/catalog')}
            className="text-blue-600 hover:text-blue-700"
          >
            Return to Catalog
          </button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize) return;
    
    addToCart({
      id: sneaker.id,
      name: sneaker.name,
      price: sneaker.price,
      image_url: sneaker.image_url,
      size: selectedSize,
      quantity
    });

    navigate('/cart');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-8"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="aspect-w-3 aspect-h-4">
          <img
            src={sneaker.image_url}
            alt={sneaker.name}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>

        {/* Product Info */}
        <div>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{sneaker.name}</h1>
              <p className="text-lg text-gray-600 mt-2">{sneaker.brand}</p>
            </div>
            <WishlistButton sneaker={sneaker} />
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-900">Description</h2>
            <p className="mt-2 text-gray-600">{sneaker.description}</p>
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-900">Style</h2>
            <p className="mt-2 text-gray-600">{sneaker.style}</p>
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-900">Select Size</h2>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {sneaker.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`py-2 text-center rounded ${
                    selectedSize === size
                      ? 'bg-black text-white'
                      : 'border border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-900">Quantity</h2>
            <select
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="mt-2 block w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-900">
              ${sneaker.price}
            </span>
            <button
              onClick={handleAddToCart}
              disabled={!selectedSize || sneaker.stock === 0}
              className={`flex items-center px-6 py-3 rounded-lg text-white ${
                !selectedSize || sneaker.stock === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-black hover:bg-gray-800'
              }`}
            >
              <ShoppingBag className="h-5 w-5 mr-2" />
              {sneaker.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>

          {sneaker.stock > 0 && (
            <p className="mt-2 text-sm text-gray-500">
              {sneaker.stock} units available
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;