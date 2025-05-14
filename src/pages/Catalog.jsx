import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import SneakerFilters from '../components/SneakerFilters';
import { api, withCircuitBreaker } from '../services/api';

const MAX_RETRIES = 3;
const BASE_RETRY_DELAY = 1000; // 1 second

const FALLBACK_SNEAKERS = [
  {
    id: 1,
    name: "Air Max 270",
    brand: "Nike",
    price: 149.99,
    image_url: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&q=80",
    description: "The Nike Air Max 270 delivers visible cushioning under every step.",
    stock: 10,
    style: "Lifestyle",
    sizes: ["38", "39", "40", "41", "42", "43", "44"]
  },
  {
    id: 2,
    name: "Ultraboost 21",
    brand: "Adidas",
    price: 179.99,
    image_url: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80",
    description: "Experience epic energy with the Ultraboost 21.",
    stock: 8,
    style: "Running",
    sizes: ["40", "41", "42", "43", "44", "45"]
  },
  {
    id: 3,
    name: "RS-X³",
    brand: "Puma",
    price: 129.99,
    image_url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80",
    description: "Bold design meets maximum comfort.",
    stock: 12,
    style: "Lifestyle",
    sizes: ["39", "40", "41", "42", "43"]
  }
];

const Catalog = () => {
  const [sneakers, setSneakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [retryCount, setRetryCount] = useState(0);

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  useEffect(() => {
    const fetchSneakers = async (attempt = 0) => {
      try {
        if (!navigator.onLine) {
          throw new Error('No internet connection. Please check your network and try again.');
        }

        // Calculate exponential backoff delay
        const retryDelay = attempt > 0 ? Math.min(BASE_RETRY_DELAY * Math.pow(2, attempt - 1), 8000) : 0;
        if (retryDelay > 0) {
          console.log(`Waiting ${retryDelay}ms before retry attempt ${attempt + 1}/${MAX_RETRIES}`);
          await sleep(retryDelay);
        }

        const response = await withCircuitBreaker(api.get('/sneakers'));
        setSneakers(response.data.length > 0 ? response.data : FALLBACK_SNEAKERS);
        setError(null);
        setRetryCount(0);
      } catch (error) {
        console.error('Error fetching sneakers:', error);
        console.log(`Retry attempt ${attempt + 1}/${MAX_RETRIES}`);

        // Handle network errors with exponential backoff retry logic
        if (
          (error.message.includes('Network error') || !navigator.onLine) &&
          attempt < MAX_RETRIES
        ) {
          setRetryCount(attempt + 1);
          return fetchSneakers(attempt + 1);
        }

        setError(error.message);
        setSneakers(FALLBACK_SNEAKERS); // Use fallback data on error
      } finally {
        setLoading(false);
      }
    };

    fetchSneakers();
  }, []);

  const brands = sneakers?.length ? Array.from(new Set(sneakers.map(s => s.brand))).sort() : [];
  const styles = sneakers?.length ? Array.from(new Set(sneakers.map(s => s.style).filter(Boolean))).sort() : [];

  const filteredSneakers = sneakers.filter(sneaker => {
    if (selectedBrand && sneaker.brand !== selectedBrand) return false;
    if (selectedStyle && sneaker.style !== selectedStyle) return false;
    if (sneaker.price < priceRange[0] || sneaker.price > priceRange[1]) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-blue-600 mb-4" />
        {retryCount > 0 && (
          <p className="text-gray-600">
            Retrying... Attempt {retryCount} of {MAX_RETRIES}
          </p>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setLoading(true);
              setError(null);
              setRetryCount(0);
              window.location.reload();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Our Collection</h1>
      
      <div className="lg:grid lg:grid-cols-4 lg:gap-8">
        {/* Filters - Desktop */}
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

        {/* Filters - Mobile */}
        <div className="lg:hidden mb-6">
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

        {/* Sneakers Grid */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSneakers.map((sneaker) => (
              <div key={sneaker.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-w-3 aspect-h-2">
                  <img
                    src={sneaker.image_url || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80'}
                    alt={sneaker.name}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="p-4">
                  <h2 className="text-lg font-semibold mb-1">{sneaker.name}</h2>
                  <p className="text-gray-600 mb-2">{sneaker.brand}</p>
                  <p className="text-sm text-gray-500 mb-2">{sneaker.style}</p>
                  {sneaker.sizes && sneaker.sizes.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-1">Available Sizes:</p>
                      <div className="flex flex-wrap gap-1">
                        {sneaker.sizes.map((size) => (
                          <span
                            key={size}
                            className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 rounded"
                          >
                            {size}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-xl font-bold">${sneaker.price}</span>
                    <button 
                      className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                        sneaker.stock > 0
                          ? 'bg-black text-white hover:bg-gray-800'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={sneaker.stock === 0}
                    >
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
    </div>
  );
};

export default Catalog;