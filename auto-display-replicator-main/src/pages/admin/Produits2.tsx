import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Trash2, 
  Eye,
  ArrowLeft,
  Package,
  Image as ImageIcon
} from 'lucide-react';
import { 
  getAcha2Products, 
  deleteAcha2Product,
  type Acha2ProductData,
  resolveImageUrl
} from '@/api/database';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

// Helper function to format references
const formatReferences = (refs: string | string[] | null | undefined): string => {
  if (!refs || (Array.isArray(refs) && refs.length === 0)) {
    return "—";
  }

  if (typeof refs === "string") {
    return refs;
  }

  if (Array.isArray(refs)) {
    return refs.length + " réf";
  }

  return "—";
};

const Produits2: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<Acha2ProductData[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Acha2ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Acha2ProductData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getAcha2Products();
      console.log('📥 Produits2 - Products loaded:', data.length);
      setProducts(data);
      setFilteredProducts(data);
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

  useEffect(() => {
    if (user) {
      loadProducts();
    }
  }, [user]);

  // Search and filter
  useEffect(() => {
    let filtered = [...products];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => {
        const nameMatch = p.name?.toLowerCase().includes(query);
        const refMatch = (p.references2 || []).some((r: string) => r.toLowerCase().includes(query));
        const descMatch = p.description2?.toLowerCase().includes(query);
        return nameMatch || refMatch || descMatch;
      });
    }

    setFilteredProducts(filtered);
  }, [products, searchQuery]);

  const handleDeleteClick = (product: Acha2ProductData) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    try {
      setIsDeleting(true);
      await deleteAcha2Product(productToDelete.name);
      await loadProducts(); // Refresh the table
      setDeleteModalOpen(false);
      setProductToDelete(null);
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
    } finally {
      setIsDeleting(false);
    }
  };

  const handleView = (product: Acha2ProductData) => {
    navigate(`/acha2?name=${encodeURIComponent(product.name)}`);
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
                <h1 className="text-xl font-bold text-gray-800">Produits 2</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
            />
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Image</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nom du produit</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Prix</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Quantité</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Références</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Modèles</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Images</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#6366F1]"></div>
                      <p className="mt-4 text-gray-500">Chargement...</p>
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Aucun produit trouvé
                      </h3>
                      <p className="text-gray-500">
                        {searchQuery ? 'Aucun produit ne correspond à votre recherche' : 'Aucun produit disponible'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => {
                    const mainImage = product.images2 && product.images2.length > 0 
                      ? resolveImageUrl(product.images2[0]) 
                      : '/pp.jpg';
                    const productName = product.name || 'Produit sans nom';
                    const displayName = productName.length > 20 
                      ? productName.substring(0, 20) + '...' 
                      : productName;

                    return (
                      <tr key={product.id || product.name} className="hover:bg-gray-50 transition-colors">
                        {/* Image */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <img
                            src={mainImage}
                            alt={productName}
                            className="w-[60px] h-[60px] object-cover rounded-md"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/pp.jpg';
                            }}
                          />
                        </td>

                        {/* Nom du produit */}
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 max-w-[200px]" title={productName}>
                            {displayName}
                          </div>
                        </td>

                        {/* Prix */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">
                            {product.price2?.toFixed(3) || '0.000'} DT
                          </span>
                        </td>

                        {/* Quantité */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {product.quantity2 || 0}
                          </span>
                        </td>

                        {/* Références */}
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">
                            {formatReferences(product.references2)}
                          </span>
                        </td>

                        {/* Modèles */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">
                            {(product.modele2 || []).length}
                          </span>
                        </td>

                        {/* Images */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">
                            {(product.images2 || []).length}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleView(product)}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors flex items-center gap-1"
                              title="Voir / Modifier"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Voir / Modifier
                            </button>
                            <button
                              onClick={() => handleDeleteClick(product)}
                              className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-md transition-colors flex items-center gap-1"
                              title="Supprimer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Supprimer
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Aucun produit trouvé
              </h3>
              <p className="text-gray-500">
                {searchQuery ? 'Aucun produit ne correspond à votre recherche' : 'Aucun produit disponible'}
              </p>
            </div>
          ) : (
            filteredProducts.map((product) => {
              const mainImage = product.images2 && product.images2.length > 0 
                ? resolveImageUrl(product.images2[0]) 
                : '/pp.jpg';
              
              return (
                <div
                  key={product.id || product.name}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
                >
                  <div className="flex gap-4">
                    {/* Image */}
                    <img
                      src={mainImage}
                      alt={product.name || 'Product'}
                      className="w-20 h-20 object-cover rounded-md flex-shrink-0"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/pp.jpg';
                      }}
                    />

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-base mb-2 truncate">
                        {product.name || 'Produit sans nom'}
                      </h3>
                      
                      <div className="space-y-1 text-sm text-gray-600 mb-3">
                        <div>Prix: <strong className="text-gray-900">{product.price2?.toFixed(3) || '0.000'} DT</strong></div>
                        <div>Quantité: <strong className="text-gray-900">{product.quantity2 || 0}</strong></div>
                        <div>Réf: <strong className="text-gray-900">{formatReferences(product.references2)}</strong></div>
                        <div>Modèles: <strong className="text-gray-900">{(product.modele2 || []).length}</strong></div>
                        <div>Images: <strong className="text-gray-900">{(product.images2 || []).length}</strong></div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2 border-t border-gray-200">
                        <button
                          onClick={() => handleView(product)}
                          className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Voir / Modifier
                        </button>
                        <button
                          onClick={() => handleDeleteClick(product)}
                          className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-md transition-colors flex items-center justify-center"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Results Count */}
        {!loading && filteredProducts.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-600">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'produit trouvé' : 'produits trouvés'}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer le produit <strong>"{productToDelete?.name}"</strong> ?
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteModalOpen(false);
                setProductToDelete(null);
              }}
              disabled={isDeleting}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Suppression...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Produits2;
