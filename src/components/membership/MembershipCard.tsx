import React from 'react';
import { Award, Gift, Star } from 'lucide-react';

interface MembershipCardProps {
  points: number;
  tier: 'Bronze' | 'Silver' | 'Gold';
  benefits: string[];
}

const MembershipCard: React.FC<MembershipCardProps> = ({ points, tier, benefits }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Award className="h-8 w-8 text-yellow-500 mr-2" />
          <h3 className="text-xl font-bold">{tier} Member</h3>
        </div>
        <div className="flex items-center">
          <Star className="h-5 w-5 text-yellow-500 mr-1" />
          <span className="font-semibold">{points} points</span>
        </div>
      </div>
      <ul className="space-y-2">
        {benefits.map((benefit, index) => (
          <li key={index} className="flex items-center">
            <Gift className="h-4 w-4 text-blue-500 mr-2" />
            <span>{benefit}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MembershipCard;