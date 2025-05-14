import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingBag, User, LogOut, Menu, Heart, Award } from 'lucide-react';
import MobileMenu from './MobileMenu';
import CartDrawer from './CartDrawer';

const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const { state: cartState } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <nav className="bg-black text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-2">
            <ShoppingBag className="h-8 w-8" />
            <span className="font-bold text-xl hidden sm:inline">Urban Sneakers Street</span>
            <span className="font-bold text-xl sm:hidden">USS</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-4">
            <Link to="/catalog" className="hover:text-gray-300">Catalog</Link>
            <Link to="/membership" className="hover:text-gray-300 flex items-center">
              <Award className="h-5 w-5 mr-1" />
              Membership
            </Link>
            
            {isAuthenticated && (
              <Link to="/wishlist" className="hover:text-gray-300">
                <Heart className="h-5 w-5" />
              </Link>
            )}
            
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative hover:text-gray-300"
            >
              <ShoppingBag className="h-6 w-6" />
              {cartState.items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartState.items.length}
                </span>
              )}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link to="/profile" className="hover:text-gray-300">
                  <User className="h-5 w-5" />
                </Link>
                {user?.isAdmin && (
                  <Link to="/admin" className="hover:text-gray-300">Admin</Link>
                )}
                <button
                  onClick={logout}
                  className="hover:text-gray-300"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="hover:text-gray-300">
                <User className="h-5 w-5" />
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center space-x-4">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative hover:text-gray-300"
            >
              <ShoppingBag className="h-6 w-6" />
              {cartState.items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartState.items.length}
                </span>
              )}
            </button>
            <button onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </nav>
  );
};

export default Navbar;