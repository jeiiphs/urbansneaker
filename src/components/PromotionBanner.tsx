import React from 'react';
import { Tag } from 'lucide-react';

interface Promotion {
  id: string;
  title: string;
  description: string;
  discountPercentage: number;
  validUntil: string;
  imageUrl?: string;
}

interface PromotionBannerProps {
  promotions: Promotion[];
}

const PromotionBanner: React.FC<PromotionBannerProps> = ({ promotions }) => {
  if (!promotions.length) return null;

  return (
    <div className="bg-gray-900 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <Tag className="h-6 w-6 mr-2" />
          Current Promotions
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.map((promo) => (
            <div 
              key={promo.id}
              className="bg-gray-800 rounded-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              {promo.imageUrl && (
                <img 
                  src={promo.imageUrl} 
                  alt={promo.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">{promo.title}</h3>
                  <span className="bg-red-600 text-white px-2 py-1 rounded text-sm">
                    {promo.discountPercentage}% OFF
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-2">{promo.description}</p>
                <p className="text-xs text-gray-500">
                  Valid until {new Date(promo.validUntil).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromotionBanner;