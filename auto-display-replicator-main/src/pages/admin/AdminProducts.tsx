import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Trash2, 
  Edit3, 
  Eye, 
  ArrowUpDown,
  Package,
  ArrowLeft,
  X
} from 'lucide-react';
import { 
  getDashboardProducts, 
  deleteDashboardProduct,
  updateDashboardProduct
} from '@/api/database';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const AdminProducts: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    price: '',
    promotion: '',
    quantity: ''
  });

  // Check admin access
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'admin' && parsedUser.is_admin !== true) {
        navigate('/login');
      } else {
        setUser(parsedUser);
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  // Fetch products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await getDashboardProducts();
        // Backend returns { success: true, count: number, data: array }
        // Ensure API data is read exactly as returned by backend: data.data or array directly
        const list = data?.data ?? [];
        
        // Map products to ensure all required fields are included and quantity stays a number
        const mappedProducts = list.map((p: any) => {
          const product = {
            id: p.id,
            product_id: p.product_id,
            name: p.name,
            reference: p.reference,
            price: p.price,
            quantity: typeof p.quantity === 'number' ? p.quantity : (p.quantity !== undefined && p.quantity !== null ? Number(p.quantity) : 0),
            image: p.image,
            created_at: p.created_at
          };
          
          // Print quantity values in console
          console.log("Quantity from API:", product.quantity, "Type:", typeof product.quantity);
          
          return product;
        });
        
        console.log('📥 AdminProducts - Products loaded:', mappedProducts.length);
        
        setProducts(mappedProducts);
        setFilteredProducts(mappedProducts);
      } catch (err) {
        console.error('Error loading products:', err);
        toast({
          title: "Erreur",
          description: "Impossible de charger les produits",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadProducts();
    }
  }, [user, toast]);

  // Search and filter
  useEffect(() => {
    let filtered = [...products];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => {
        const nameMatch = p.name?.toLowerCase().includes(query);
        const refMatch = p.reference?.toLowerCase().includes(query) || 
                        (Array.isArray(p.references) && p.references.some((r: string) => r.toLowerCase().includes(query)));
        return nameMatch || refMatch;
      });
    }

    // Sort by price
    filtered.sort((a, b) => {
      const priceA = Number(a.price || 0);
      const priceB = Number(b.price || 0);
      return sortOrder === 'asc' ? priceA - priceB : priceB - priceA;
    });

    setFilteredProducts(filtered);
  }, [products, searchQuery, sortOrder]);

  const handleDelete = async (id: string | number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit du tableau de bord ?')) {
      return;
    }

    try {
      await deleteDashboardProduct(String(id));
      setProducts(products.filter(p => p.id !== id));
      toast({
        title: "Succès",
        description: "Produit supprimé avec succès",
      });
    } catch (err) {
      console.error('Error deleting product:', err);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le produit",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setEditForm({
      price: String(product.price || 0),
      promotion: String(product.promotion || 0),
      quantity: String(product.quantity || 0)
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingProduct?.id) return;

    try {
      const updated = await updateDashboardProduct(String(editingProduct.id), {
        price: Number(editForm.price),
        promotion: Number(editForm.promotion),
        quantity: Number(editForm.quantity)
      });

      setProducts(products.map(p => p.id === editingProduct.id ? updated.data : p));
      setEditModalOpen(false);
      setEditingProduct(null);
      toast({
        title: "Succès",
        description: "Produit mis à jour avec succès",
      });
    } catch (err) {
      console.error('Error updating product:', err);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le produit",
        variant: "destructive",
      });
    }
  };

  const handleView = (product: any) => {
    if (product.reference) {
      navigate(`/acha/${encodeURIComponent(product.reference)}`);
    } else if (product.id) {
      navigate(`/acha/${encodeURIComponent(String(product.id))}`);
    }
  };

  const formatReferences = (reference: string | string[] | null | undefined): string[] => {
    if (!reference) return [];
    if (Array.isArray(reference)) {
      return reference;
    }
    if (typeof reference === 'string') {
      return reference.split(',').map(r => r.trim()).filter(r => r.length > 0);
    }
    return [];
  };

  const calculateFinalPrice = (price: number | string | undefined, promotion: number | undefined): number => {
    const basePrice = Number(price || 0);
    const promo = Number(promotion || 0);
    if (promo > 0) {
      return basePrice - (basePrice * (promo / 100));
    }
    return basePrice;
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin-dashboard')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Retour</span>
              </button>
              <div className="flex items-center gap-3">
                <Package className="w-6 h-6 text-[#6366F1]" />
                <h1 className="text-xl font-bold text-gray-800">Gestion des Produits</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Search and Sort Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Rechercher par nom ou référence..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="flex items-center gap-2"
            >
              <ArrowUpDown className="w-4 h-4" />
              Prix {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Image</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Reference</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Quantité</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created At</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#6366F1]"></div>
                      <p className="mt-4 text-gray-500">Chargement...</p>
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Aucun produit trouvé
                      </h3>
                      <p className="text-gray-500">
                        {searchQuery ? 'Aucun produit ne correspond à votre recherche' : 'Aucun produit n\'est encore ajouté au tableau de bord.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => {
                    const createdDate = product.created_at 
                      ? new Date(product.created_at).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : '-';

                    return (
                      <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name || 'Product'}
                              className="w-[50px] h-[50px] object-cover rounded-lg"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-[50px] h-[50px] bg-gray-100 rounded-lg flex items-center justify-center">
                              <Package className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                            {product.name || 'Produit sans nom'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-700 max-w-xs truncate">
                            {product.reference || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">
                            {Number(product.price || 0).toFixed(3)} DT
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">
                            {product.quantity ?? 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">
                            {createdDate}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleView(product)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Voir le produit"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(product)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Modifier"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#6366F1]"></div>
              <p className="mt-4 text-gray-500">Chargement...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Aucun produit trouvé
              </h3>
              <p className="text-gray-500">
                {searchQuery ? 'Aucun produit ne correspond à votre recherche' : 'Aucun produit n\'est encore ajouté au tableau de bord.'}
              </p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-sm border p-4 flex flex-col gap-4"
              >
                <div className="flex items-center gap-4">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name || 'Product'}
                      className="w-20 h-20 object-cover rounded-md"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0">
                      <Package className="w-10 h-10 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-base">
                      {product.name || 'Produit sans nom'}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                      Ref: {product.reference || '-'}
                    </p>
                    <p className="text-sm font-bold text-indigo-600 mt-1">
                      {Number(product.price || 0).toFixed(3)} DT
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Quantité:</span>
                  <span className="font-semibold">{product.quantity ?? 0}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleView(product)}
                    className="flex-1 p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                  >
                    Voir
                  </button>
                  <button 
                    onClick={() => handleEdit(product)}
                    className="flex-1 p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                  >
                    Modifier
                  </button>
                  <button 
                    onClick={() => handleDelete(product.id)}
                    className="flex-1 p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Modifier le produit</DialogTitle>
            <DialogDescription>
              Modifiez les informations du produit
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Prix (DT)
              </label>
              <Input
                type="number"
                step="0.001"
                value={editForm.price}
                onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                placeholder="0.000"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Promotion (%)
              </label>
              <Input
                type="number"
                step="1"
                value={editForm.promotion}
                onChange={(e) => setEditForm({ ...editForm, promotion: e.target.value })}
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Quantité
              </label>
              <Input
                type="number"
                step="1"
                value={editForm.quantity}
                onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                placeholder="0"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setEditModalOpen(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSaveEdit}
              className="bg-[#6366F1] hover:bg-[#4F46E5]"
            >
              Enregistrer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProducts;

