import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getPromotions } from '../services/promotions';
import type { Promotion } from '../types/promotion';
import PromotionBanner from '../components/PromotionBanner';

const Home = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);

  useEffect(() => {
    const fetchPromotions = async () => {
      const data = await getPromotions();
      setPromotions(data);
    };

    fetchPromotions();
  }, []);

  return (
    <div className="relative">
      {/* Hero Section */}
      <div 
        className="h-[600px] bg-cover bg-center relative"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80")'
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50" />
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          <div className="text-white">
            <h1 className="text-5xl font-bold mb-4">Welcome to Urban Sneakers Street</h1>
            <p className="text-xl mb-8">Discover the latest and most exclusive sneakers</p>
            <Link
              to="/catalog"
              className="inline-flex items-center bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Shop Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Promotions Section */}
      {promotions.length > 0 && (
        <PromotionBanner promotions={promotions} />
      )}

      {/* Featured Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold mb-8">Featured Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Running",
              image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80"
            },
            {
              title: "Lifestyle",
              image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80"
            },
            {
              title: "Basketball",
              image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80"
            }
          ].map((category) => (
            <div key={category.title} className="relative h-64 rounded-lg overflow-hidden group">
              <img 
                src={category.image} 
                alt={category.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <h3 className="text-white text-2xl font-bold">{category.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;