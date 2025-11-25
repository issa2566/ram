import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, ShoppingCart } from 'lucide-react';
import SearchBar from './SearchBar';
import UserMenu from './UserMenu';
import MobileNav from './MobileNav';

interface MobileHeaderProps {
  isScrolled: boolean;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ 
  isScrolled, 
  menuOpen, 
  setMenuOpen 
}) => {
  const [cartCount, setCartCount] = React.useState(0);

  React.useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartCount(cart.length);
    };

    updateCartCount();
    window.addEventListener('cartUpdated', updateCartCount);
    return () => window.removeEventListener('cartUpdated', updateCartCount);
  }, []);

  return (
    <>
      {/* Main Header */}
      <header
        className={`lg:hidden bg-white border-b border-gray-200 transition-shadow duration-300 ${
          isScrolled ? 'shadow-md' : 'shadow-sm'
        }`}
      >
        <div className="px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            {/* Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>

            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2 flex-shrink-0 group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg 
                            flex items-center justify-center text-white font-bold text-lg 
                            shadow-md group-hover:shadow-lg transition-all duration-300">
                RA
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-gray-900 group-hover:text-blue-600 
                               transition-colors">
                  Rannen Auto
                </span>
                <span className="text-[10px] text-gray-500">Motors</span>
              </div>
            </Link>

            {/* Cart & User */}
            <div className="flex items-center gap-2">
              <Link
                to="/cart"
                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ShoppingCart className="w-5 h-5 text-gray-700" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] 
                                 font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>
              <UserMenu />
            </div>
          </div>

          {/* Search Bar - Below header on mobile */}
          <div className="mt-3">
            <SearchBar />
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <MobileNav isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
};

export default MobileHeader;
