import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, 
  Package, 
  Filter, 
  Droplets, 
  Wrench, 
  Phone,
  X,
  User,
  ShoppingCart,
  Heart,
  LayoutDashboard,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  const { user, logout, isAdmin } = useAuth();
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

  const handleLogout = () => {
    logout();
    onClose();
  };

  const navItems = [
    { label: 'الرئيسية', path: '/', icon: Home },
    { label: 'الكتالوج', path: '/catalogue', icon: Package },
    { label: 'الفلاتر', path: '/filtres', icon: Filter },
    { label: 'الزيوت', path: '/huiles-auto', icon: Droplets },
    { label: 'قطع الغيار', path: '/brand-parts', icon: Wrench },
    { label: 'اتصل بنا', path: '/contact', icon: Phone },
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 transform 
                   transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">القائمة</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* User Section */}
        {user ? (
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full 
                            flex items-center justify-center text-white font-semibold">
                {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{user.name || 'المستخدم'}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                to="/cart"
                onClick={onClose}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 
                         bg-white border border-gray-200 rounded-lg hover:bg-gray-50 
                         transition-colors text-sm font-medium"
              >
                <ShoppingCart className="w-4 h-4" />
                السلة {cartCount > 0 && `(${cartCount})`}
              </Link>
              <Link
                to="/favorites"
                onClick={onClose}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 
                         bg-white border border-gray-200 rounded-lg hover:bg-gray-50 
                         transition-colors text-sm font-medium"
              >
                <Heart className="w-4 h-4" />
                المفضلة
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-4 border-b border-gray-200">
            <Link
              to="/login"
              onClick={onClose}
              className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 
                       text-white rounded-lg hover:from-blue-600 hover:to-blue-700 
                       transition-all duration-200 font-medium text-sm text-center block"
            >
              تسجيل الدخول
            </Link>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 
                         hover:text-blue-600 transition-colors duration-150 border-r-4 
                         border-transparent hover:border-blue-500"
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Menu Items */}
        {user && (
          <div className="border-t border-gray-200 p-4 space-y-2">
            <Link
              to="/account"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 
                       rounded-lg transition-colors"
            >
              <User className="w-5 h-5" />
              <span>الملف الشخصي</span>
            </Link>
            <Link
              to="/orders"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 
                       rounded-lg transition-colors"
            >
              <Package className="w-5 h-5" />
              <span>الطلبات</span>
            </Link>
            {isAdmin && (
              <Link
                to="/admin-dashboard"
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 
                         rounded-lg transition-colors"
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>لوحة التحكم</span>
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 
                       rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default MobileNav;

