import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X,
  TrendingUp,
  DollarSign,
  UserCheck,
  ShoppingCart,
  Trash2,
  Phone,
  MapPin,
  Calendar
} from 'lucide-react';
import { getDashboardProducts, DashboardProductData, getOrders, deleteOrder, OrderData } from '@/api/database';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [dashboardProducts, setDashboardProducts] = useState<DashboardProductData[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Load user data
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      // Check if user is admin
      if (parsedUser.role !== 'admin' && parsedUser.is_admin !== true) {
        navigate('/login');
      } else {
        setUser(parsedUser);
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  // Meta Pixel Code
  useEffect(() => {
    // Create script element
    const script = document.createElement('script');
    script.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '1755717761807103');
      fbq('track', 'PageView');
    `;
    document.head.appendChild(script);

    // Create noscript element
    const noscript = document.createElement('noscript');
    noscript.innerHTML = `
      <img height="1" width="1" style="display:none"
      src="https://www.facebook.com/tr?id=1755717761807103&ev=PageView&noscript=1"
      />
    `;
    document.body.appendChild(noscript);

    return () => {
      // Cleanup
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      if (noscript.parentNode) {
        noscript.parentNode.removeChild(noscript);
      }
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    window.dispatchEvent(new Event('userLogout'));
    navigate('/login');
  };

  // Load dashboard products
  useEffect(() => {
    if (activeMenu === 'produits') {
      loadDashboardProducts();
    }
  }, [activeMenu]);

  // Load orders
  useEffect(() => {
    if (activeMenu === 'commandes') {
      loadOrders();
    }
  }, [activeMenu]);

  const loadDashboardProducts = async () => {
    setLoadingProducts(true);
    try {
      const products = await getDashboardProducts();
      setDashboardProducts(products);
    } catch (error) {
      console.error('Error loading dashboard products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const ordersData = await getOrders();
      setOrders(ordersData);
    } catch (error) {
      console.error('Error loading orders:', error);
      if (error instanceof Error && error.message === 'Admin access required') {
        alert('Vous devez être administrateur pour accéder aux commandes.');
        navigate('/login');
      }
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
      return;
    }

    try {
      await deleteOrder(orderId);
      // Reload orders
      await loadOrders();
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Erreur lors de la suppression de la commande');
    }
  };

  // Mock data
  const stats = [
    {
      title: 'Total Ventes',
      value: '125,430',
      change: '+12.5%',
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      title: 'Produits',
      value: '1,234',
      change: '+8.2%',
      icon: Package,
      color: 'bg-blue-500'
    },
    {
      title: 'Clients',
      value: '8,567',
      change: '+15.3%',
      icon: Users,
      color: 'bg-purple-500'
    },
    {
      title: 'Revenus',
      value: '45,678 TND',
      change: '+23.1%',
      icon: TrendingUp,
      color: 'bg-orange-500'
    }
  ];

  const recentOrders = [
    { id: 1, client: 'Ahmed Ben Ali', montant: '245.50 TND', statut: 'Livré', date: '15 Jan 2025' },
    { id: 2, client: 'Fatma Bouzid', montant: '189.30 TND', statut: 'En cours', date: '14 Jan 2025' },
    { id: 3, client: 'Mohamed Trabelsi', montant: '567.80 TND', statut: 'Livré', date: '14 Jan 2025' },
    { id: 4, client: 'Salma Hammami', montant: '123.45 TND', statut: 'En attente', date: '13 Jan 2025' },
    { id: 5, client: 'Karim Dridi', montant: '890.20 TND', statut: 'Livré', date: '13 Jan 2025' }
  ];

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'produits', label: 'Produits', icon: Package },
    { id: 'produits2', label: 'Produits 2', icon: Package, path: '/admin-produits2' },
    { id: 'commandes', label: 'Commandes', icon: ShoppingBag },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'statistiques', label: 'Statistiques', icon: BarChart3 },
    { id: 'parametres', label: 'Paramètres', icon: Settings }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Livré':
        return 'bg-green-100 text-green-800';
      case 'En cours':
        return 'bg-blue-100 text-blue-800';
      case 'En attente':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Meta Pixel Code */}
      
      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full bg-white shadow-lg z-40 transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
        w-64
      `}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-[#6366F1]">Admin Panel</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            // Special handling for "Produits" and "Produits 2" - link to separate pages
            if (item.id === 'produits') {
              return (
                <Link
                  key={item.id}
                  to="/admin/products"
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            }
            if (item.id === 'produits2' && item.path) {
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            }
            return (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${activeMenu === item.id
                    ? 'bg-[#6366F1] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className={`lg:ml-64 transition-all duration-300`}>
        {/* Navbar */}
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <Menu className="w-6 h-6" />
              </button>
              
              <div className="flex items-center gap-4 ml-auto">
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-gray-800">
                      {user?.username || 'Admin'}
                    </p>
                    <p className="text-xs text-gray-500">Administrateur</p>
                  </div>
                  <div className="w-10 h-10 bg-[#6366F1] rounded-full flex items-center justify-center text-white font-semibold">
                    {(user?.username || 'A').charAt(0).toUpperCase()}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Déconnexion</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {activeMenu === 'dashboard' ? 'Dashboard' : 
               activeMenu === 'produits' ? 'Produits' :
               activeMenu === 'commandes' ? 'Commandes' :
               activeMenu === 'clients' ? 'Clients' :
               activeMenu === 'statistiques' ? 'Statistiques' :
               activeMenu === 'parametres' ? 'Paramètres' : 'Dashboard'}
            </h2>
            <p className="text-gray-600 mt-1">
              {activeMenu === 'dashboard' ? 'Vue d\'ensemble de votre activité' :
               activeMenu === 'produits' ? 'Gestion des produits du tableau de bord' :
               activeMenu === 'commandes' ? 'Gestion des commandes' :
               activeMenu === 'clients' ? 'Gestion des clients' :
               activeMenu === 'statistiques' ? 'Statistiques et analyses' :
               activeMenu === 'parametres' ? 'Paramètres du système' : ''}
            </p>
          </div>

          {/* Produits Section */}
          {activeMenu === 'produits' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">
                  Produits du tableau de bord
                </h3>
              </div>
              <div className="p-6">
                {loadingProducts ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Chargement des produits...</p>
                  </div>
                ) : dashboardProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Aucun produit dans le tableau de bord</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dashboardProducts.map((product) => (
                      <div
                        key={product.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        {product.first_image && (
                          <img
                            src={product.first_image}
                            alt={product.name || 'Product'}
                            className="w-full h-48 object-cover rounded-lg mb-3"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        )}
                        <h4 className="font-semibold text-gray-800 mb-2">{product.name}</h4>
                        {product.reference && (
                          <p className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">Référence:</span> {product.reference}
                          </p>
                        )}
                        <p className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">Prix:</span> {Number(product.price || 0).toFixed(3)} DT
                        </p>
                        <p className="text-sm text-gray-600 mb-3">
                          <span className="font-medium">Quantité:</span> {product.quantity || 0}
                        </p>
                        <button
                          onClick={() => {
                            // TODO: Implement delete functionality
                            console.log('Delete product:', product.id);
                          }}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                          Supprimer
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Commandes Section */}
          {activeMenu === 'commandes' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">
                  Gestion des commandes
                </h3>
              </div>
              
              {loadingOrders ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                  <p className="text-gray-500 mt-4">Chargement des commandes...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Aucune commande pour le moment</p>
                </div>
              ) : (
                <>
                  {/* MOBILE CARD VIEW (< 768px) */}
                  <div className="block md:hidden p-4 space-y-4">
                    {orders.map((order) => {
                      const orderDate = order.created_at 
                        ? new Date(order.created_at) 
                        : new Date();
                      const formattedDate = orderDate.toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      });
                      const formattedTime = orderDate.toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      });

                      return (
                        <div 
                          key={order.id}
                          className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 space-y-3"
                        >
                          {/* Product Header */}
                          <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
                            {order.product_image ? (
                              <img 
                                src={order.product_image} 
                                alt={order.product_name}
                                className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Package className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-base text-gray-900 mb-1 leading-tight">
                                {order.product_name}
                              </h4>
                              <div className="flex items-center gap-2 flex-wrap mt-2">
                                <span className="text-sm font-bold text-orange-600">
                                  {parseFloat(String(order.product_price || 0)).toFixed(3)} DT
                                </span>
                                <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded font-medium">
                                  Qté: {order.quantity}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Client Info */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between py-2">
                              <span className="text-xs font-medium text-gray-500">Client</span>
                              <span className="text-sm font-semibold text-gray-900">
                                {order.customer_prenom} {order.customer_nom}
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between py-2">
                              <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                                <Phone className="w-3.5 h-3.5" />
                                Téléphone
                              </span>
                              <a 
                                href={`tel:${order.customer_phone}`}
                                className="text-sm font-semibold text-blue-600 hover:text-blue-800 active:text-blue-900"
                              >
                                {order.customer_phone}
                              </a>
                            </div>
                            
                            <div className="flex items-center justify-between py-2">
                              <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                Localisation
                              </span>
                              <span className="text-sm text-gray-900 text-right">
                                {order.customer_wilaya}
                                <br />
                                <span className="text-gray-600">{order.customer_delegation}</span>
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between py-2 border-t border-gray-100 pt-2">
                              <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                Date
                              </span>
                              <div className="text-right">
                                <div className="text-sm font-medium text-gray-900">{formattedDate}</div>
                                <div className="text-xs text-gray-500">{formattedTime}</div>
                              </div>
                            </div>
                          </div>

                          {/* References (if any) */}
                          {order.product_references && order.product_references.length > 0 && (
                            <div className="pt-2 border-t border-gray-100">
                              <div className="flex flex-wrap gap-1.5">
                                {order.product_references.slice(0, 3).map((ref, i) => (
                                  <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded font-medium">
                                    {ref}
                                  </span>
                                ))}
                                {order.product_references.length > 3 && (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded font-medium">
                                    +{order.product_references.length - 3}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Action Button */}
                          <div className="pt-3 border-t border-gray-200">
                            <button
                              onClick={() => order.id && handleDeleteOrder(order.id)}
                              className="w-full min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
                              aria-label="Supprimer la commande"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Supprimer</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* TABLET & DESKTOP TABLE VIEW (>= 768px) */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                          <th className="px-3 lg:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                            Date & Heure
                          </th>
                          <th className="px-3 lg:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b hidden lg:table-cell">
                            Image
                          </th>
                          <th className="px-3 lg:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                            Produit
                          </th>
                          <th className="px-3 lg:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                            Prix
                          </th>
                          <th className="px-3 lg:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b hidden lg:table-cell">
                            Références
                          </th>
                          <th className="px-3 lg:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                            Qté
                          </th>
                          <th className="px-3 lg:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                            Client
                          </th>
                          <th className="px-3 lg:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                            Téléphone
                          </th>
                          <th className="px-3 lg:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                            Wilaya
                          </th>
                          <th className="px-3 lg:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b hidden lg:table-cell">
                            Délégation
                          </th>
                          <th className="px-3 lg:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map((order, index) => {
                          const orderDate = order.created_at 
                            ? new Date(order.created_at) 
                            : new Date();
                          const formattedDate = orderDate.toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          });
                          const formattedTime = orderDate.toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          });

                          return (
                            <tr 
                              key={order.id} 
                              className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                            >
                              <td className="px-3 lg:px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                <div className="flex flex-col">
                                  <span className="font-medium">{formattedDate}</span>
                                  <span className="text-gray-500 text-xs">{formattedTime}</span>
                                </div>
                              </td>
                              <td className="px-3 lg:px-4 py-3 whitespace-nowrap hidden lg:table-cell">
                                {order.product_image ? (
                                  <img 
                                    src={order.product_image} 
                                    alt={order.product_name}
                                    className="w-12 h-12 object-cover rounded"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                    <Package className="w-6 h-6 text-gray-400" />
                                  </div>
                                )}
                              </td>
                              <td className="px-3 lg:px-4 py-3 text-sm text-gray-900">
                                <div className="max-w-xs truncate" title={order.product_name}>
                                  {order.product_name}
                                </div>
                              </td>
                              <td className="px-3 lg:px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                                {parseFloat(String(order.product_price || 0)).toFixed(3)} DT
                              </td>
                              <td className="px-3 lg:px-4 py-3 text-sm text-gray-600 hidden lg:table-cell">
                                {order.product_references && order.product_references.length > 0 ? (
                                  <div className="max-w-xs">
                                    <div className="flex flex-wrap gap-1">
                                      {order.product_references.slice(0, 2).map((ref, i) => (
                                        <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                          {ref}
                                        </span>
                                      ))}
                                      {order.product_references.length > 2 && (
                                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                          +{order.product_references.length - 2}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 italic">Aucune</span>
                                )}
                              </td>
                              <td className="px-3 lg:px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-center">
                                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded font-medium">
                                  {order.quantity}
                                </span>
                              </td>
                              <td className="px-3 lg:px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                <div>
                                  <div className="font-medium">{order.customer_prenom} {order.customer_nom}</div>
                                </div>
                              </td>
                              <td className="px-3 lg:px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                <a 
                                  href={`tel:${order.customer_phone}`}
                                  className="text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                  {order.customer_phone}
                                </a>
                              </td>
                              <td className="px-3 lg:px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                {order.customer_wilaya}
                              </td>
                              <td className="px-3 lg:px-4 py-3 whitespace-nowrap text-sm text-gray-900 hidden lg:table-cell">
                                <div className="max-w-xs truncate" title={order.customer_delegation}>
                                  {order.customer_delegation}
                                </div>
                              </td>
                              <td className="px-3 lg:px-4 py-3 whitespace-nowrap text-sm">
                                <button
                                  onClick={() => order.id && handleDeleteOrder(order.id)}
                                  className="min-w-[44px] min-h-[44px] flex items-center justify-center text-red-600 hover:text-red-900 hover:bg-red-50 px-2 py-2 rounded transition-colors"
                                  title="Supprimer"
                                  aria-label="Supprimer la commande"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Dashboard Section */}
          {activeMenu === 'dashboard' && (
            <>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-green-600">
                      {stat.change}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-1">
                    {stat.value}
                  </h3>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                </div>
              );
            })}
          </div>

          {/* Graph and Table Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Graph Placeholder */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Graphique des ventes
              </h3>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                <p className="text-gray-400">Graphique ici</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Activité récente
              </h3>
              <div className="space-y-3">
                {recentOrders.slice(0, 4).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{order.client}</p>
                      <p className="text-sm text-gray-500">{order.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">{order.montant}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.statut)}`}>
                        {order.statut}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                Dernières commandes
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.client}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{order.montant}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.statut)}`}>
                          {order.statut}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-[#6366F1] hover:text-[#4f46e5] transition-colors">
                          Voir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
            </>
          )}
        </main>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;

