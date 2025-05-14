import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Heart, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const { isAuthenticated, logout, user } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      
      <div className="fixed right-0 top-0 bottom-0 w-64 bg-white">
        <div className="p-4 flex justify-between items-center border-b">
          <span className="font-bold text-lg text-gray-900">Menu</span>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900">
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="p-4">
          <ul className="space-y-4">
            <li>
              <Link
                to="/"
                className="block py-2 text-gray-600 hover:text-blue-600"
                onClick={onClose}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/catalog"
                className="block py-2 text-gray-600 hover:text-blue-600"
                onClick={onClose}
              >
                Catalog
              </Link>
            </li>
            <li>
              <Link
                to="/membership"
                className="flex items-center py-2 text-gray-600 hover:text-blue-600"
                onClick={onClose}
              >
                <Award className="h-5 w-5 mr-2" />
                Membership
              </Link>
            </li>
            {isAuthenticated && (
              <li>
                <Link
                  to="/wishlist"
                  className="flex items-center py-2 text-gray-600 hover:text-blue-600"
                  onClick={onClose}
                >
                  <Heart className="h-5 w-5 mr-2" />
                  Wishlist
                </Link>
              </li>
            )}
            {isAuthenticated ? (
              <>
                <li>
                  <Link
                    to="/profile"
                    className="block py-2 text-gray-600 hover:text-blue-600"
                    onClick={onClose}
                  >
                    Profile
                  </Link>
                </li>
                {user?.isAdmin && (
                  <li>
                    <Link
                      to="/admin"
                      className="block py-2 text-gray-600 hover:text-blue-600"
                      onClick={onClose}
                    >
                      Admin Panel
                    </Link>
                  </li>
                )}
                <li>
                  <button
                    onClick={() => {
                      logout();
                      onClose();
                    }}
                    className="block w-full text-left py-2 text-red-600 hover:text-red-700"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link
                  to="/login"
                  className="block py-2 text-gray-600 hover:text-blue-600"
                  onClick={onClose}
                >
                  Login
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default MobileMenu;