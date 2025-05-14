import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Loader2, Edit, Trash2, Plus } from 'lucide-react';
import SneakerFilters from '../components/SneakerFilters';
import WishlistButton from '../components/wishlist/WishlistButton';
import AddToCartModal from '../components/AddToCartModal';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { Sneaker } from '../types/sneaker';

const Catalog = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sneakers, setSneakers] = useState<Sneaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedSneaker, setSelectedSneaker] = useState<Sneaker | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchSneakers();
  }, []);

  const fetchSneakers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/sneakers');
      setSneakers(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching sneakers:', err);
      setError('Failed to load sneakers');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this sneaker?')) {
      return;
    }

    try {
      await api.delete(`/api/sneakers/${id}`);
      setSneakers(sneakers.filter(s => s.id !== id));
      // Show success toast here
    } catch (err) {
      console.error('Error deleting sneaker:', err);
      // Show error toast here
    }
  };

  const brands = Array.from(new Set(sneakers.map(s => s.brand))).sort();
  const styles = Array.from(new Set(sneakers.map(s => s.style).filter(Boolean))).sort();

  const filteredSneakers = sneakers.filter(sneaker => {
    if (selectedBrand && sneaker.brand !== selectedBrand) return false;
    if (selectedStyle && sneaker.style !== selectedStyle) return false;
    if (sneaker.price < priceRange[0] || sneaker.price > priceRange[1]) return false;
    return true;
  });

  const handleAddToCart = (sneaker: Sneaker) => {
    setSelectedSneaker(sneaker);
    setIsModalOpen(true);
  };

  const handleProductClick = (sneakerId: number) => {
    navigate(`/product/${sneakerId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Our Collection</h1>
        {user?.isAdmin && (
          <button
            onClick={() => navigate('/admin/new')}
            className="flex items-center bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add New Sneaker
          </button>
        )}
      </div>
      
      <div className="lg:grid lg:grid-cols-4 lg:gap-8">
        <div className="hidden lg:block">
          <SneakerFilters
            brands={brands}
            styles={styles}
            selectedBrand={selectedBrand}
            selectedStyle={selectedStyle}
            priceRange={priceRange}
            onBrandChange={setSelectedBrand}
            onStyleChange={setSelectedStyle}
            onPriceRangeChange={setPriceRange}
            onClearFilters={() => {
              setSelectedBrand('');
              setSelectedStyle('');
              setPriceRange([0, 500]);
            }}
          />
        </div>

        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSneakers.map((sneaker) => (
              <div key={sneaker.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={sneaker.image_url}
                    alt={sneaker.name}
                    className="w-full h-48 object-cover cursor-pointer"
                    onClick={() => handleProductClick(sneaker.id)}
                  />
                  {user?.isAdmin && (
                    <div className="absolute top-2 right-2 flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/edit/${sneaker.id}`);
                        }}
                        className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                      >
                        <Edit className="h-4 w-4 text-blue-600" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(sneaker.id);
                        }}
                        className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 
                        className="text-lg font-semibold mb-1 cursor-pointer hover:text-blue-600"
                        onClick={() => handleProductClick(sneaker.id)}
                      >
                        {sneaker.name}
                      </h2>
                      <p className="text-gray-600 mb-2">{sneaker.brand}</p>
                      <p className="text-sm text-gray-500 mb-2">{sneaker.style}</p>
                    </div>
                    <WishlistButton sneaker={sneaker} />
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 mb-1">Available Sizes:</p>
                    <div className="flex flex-wrap gap-1">
                      {sneaker.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => handleAddToCart(sneaker)}
                          className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 rounded hover:bg-gray-200"
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-xl font-bold">${sneaker.price}</span>
                    <button 
                      onClick={() => handleAddToCart(sneaker)}
                      className={`flex items-center px-4 py-2 rounded text-sm font-medium transition-colors ${
                        sneaker.stock > 0
                          ? 'bg-black text-white hover:bg-gray-800'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={sneaker.stock === 0}
                    >
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      {sneaker.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredSneakers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No sneakers found matching your filters.
              </p>
              <button
                onClick={() => {
                  setSelectedBrand('');
                  setSelectedStyle('');
                  setPriceRange([0, 500]);
                }}
                className="mt-4 text-blue-600 hover:text-blue-700"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>

      {selectedSneaker && (
        <AddToCartModal
          sneaker={selectedSneaker}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedSneaker(null);
          }}
        />
      )}
    </div>
  );
};

export default Catalog;