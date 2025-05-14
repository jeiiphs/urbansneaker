import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import type { Sneaker } from '../../types/sneaker';
import { api } from '../../services/api';

const BrandPage = () => {
  const { brand } = useParams();
  const [sneakers, setSneakers] = useState<Sneaker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrandSneakers = async () => {
      try {
        const response = await api.get('/sneakers', {
          params: { brand }
        });
        setSneakers(response.data);
      } catch (error) {
        console.error('Error fetching brand sneakers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBrandSneakers();
  }, [brand]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">{brand} Sneakers</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sneakers.map((sneaker) => (
          <div key={sneaker.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img
              src={sneaker.image_url}
              alt={sneaker.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h2 className="text-lg font-semibold">{sneaker.name}</h2>
              <p className="text-gray-600 mt-1">${sneaker.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrandPage;