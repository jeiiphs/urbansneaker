import React from 'react';
import MembershipCard from '../components/membership/MembershipCard';
import { useAuth } from '../context/AuthContext';

const membershipTiers = {
  Bronze: {
    minPoints: 0,
    benefits: [
      'Earn 1 point per $1 spent',
      'Birthday special offer',
      'Member-only newsletters'
    ]
  },
  Silver: {
    minPoints: 1000,
    benefits: [
      'Earn 2 points per $1 spent',
      'Free shipping on orders over $50',
      'Early access to sales',
      'Exclusive member events'
    ]
  },
  Gold: {
    minPoints: 5000,
    benefits: [
      'Earn 3 points per $1 spent',
      'Free shipping on all orders',
      'Priority customer service',
      'VIP access to new releases',
      'Special birthday gift'
    ]
  }
};

const Membership = () => {
  const { user } = useAuth();
  const points = user?.points || 0;

  const getCurrentTier = (points: number) => {
    if (points >= membershipTiers.Gold.minPoints) return 'Gold';
    if (points >= membershipTiers.Silver.minPoints) return 'Silver';
    return 'Bronze';
  };

  const currentTier = getCurrentTier(points);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Membership Benefits</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {Object.entries(membershipTiers).map(([tier, { benefits }]) => (
          <MembershipCard
            key={tier}
            tier={tier as 'Bronze' | 'Silver' | 'Gold'}
            points={points}
            benefits={benefits}
          />
        ))}
      </div>

      {user && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Your Membership Status</h2>
          <p className="text-lg mb-2">
            Current Tier: <span className="font-semibold">{currentTier}</span>
          </p>
          <p className="text-lg">
            Points Balance: <span className="font-semibold">{points}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default Membership;