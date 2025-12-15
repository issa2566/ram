import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Plus, Loader2, Car, AlertCircle, X, CheckCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ModelCard } from "@/components/ModelCard";
import { AddModelModal } from "@/components/AddModelModal";
import { 
  getVehicleModels, 
  createVehicleModel, 
  deleteVehicleModel,
  VehicleModelData 
} from "@/api/database";

const Catalogue2 = () => {
  const { marque } = useParams<{ marque: string }>();
  const decodedMarque = marque ? decodeURIComponent(marque) : "Inconnue";

  // State
  const [models, setModels] = useState<VehicleModelData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  // Check admin status
  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setIsAdmin(user.isAdmin === true || user.role === 'admin');
      }
    } catch (e) {
      console.error('Error checking admin status:', e);
    }
  }, []);

  // Fetch models
  const fetchModels = useCallback(async () => {
    if (!decodedMarque || decodedMarque === "Inconnue") return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getVehicleModels(decodedMarque);
      setModels(data);
    } catch (err) {
      console.error('Error fetching models:', err);
      setError('Erreur lors du chargement des modèles');
    } finally {
      setIsLoading(false);
    }
  }, [decodedMarque]);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  // Show notification
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Add model handler
  const handleAddModel = async (data: { model: string; description: string; image: string }) => {
    setIsSaving(true);
    
    try {
      const newModel = await createVehicleModel({
        marque: decodedMarque,
        model: data.model,
        description: data.description || undefined,
        image: data.image || undefined,
      });
      
      setModels(prev => [newModel, ...prev]);
      showNotification('Modèle ajouté avec succès !', 'success');
      return true;
    } catch (err) {
      console.error('Error adding model:', err);
      showNotification('Erreur lors de l\'ajout du modèle', 'error');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Delete model handler
  const handleDeleteModel = async (id: string | number) => {
    setDeletingId(id);
    
    try {
      await deleteVehicleModel(id);
      setModels(prev => prev.filter(m => m.id !== id));
      showNotification('Modèle supprimé avec succès !', 'success');
    } catch (err) {
      console.error('Error deleting model:', err);
      showNotification('Erreur lors de la suppression', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] overflow-x-hidden flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white shadow-sm">
        <Header />
      </div>

      {/* Main Content */}
      <main className="flex-1 px-4 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          {/* Page Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-2">
            Modèles disponibles pour : <span className="text-orange-500">{decodedMarque}</span>
          </h1>
          <p className="text-gray-500 text-sm md:text-base text-center mb-6 md:mb-8">
            Découvrez tous les modèles de la marque {decodedMarque}
          </p>

          {/* Admin Add Button */}
          {isAdmin && (
            <div className="flex justify-center mb-6 md:mb-8">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center justify-center gap-2 px-5 py-2.5 md:py-3
                           bg-orange-500 hover:bg-orange-600
                           text-white font-semibold text-sm
                           rounded-lg shadow-sm
                           transition-all duration-200
                           active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter un modèle</span>
              </button>
            </div>
          )}

          {/* Notification Toast */}
          {notification && (
            <div
              className={`fixed top-20 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-50
                          px-4 py-3 rounded-xl shadow-lg flex items-center gap-3
                          animate-[slideDown_0.3s_ease-out]
                          ${notification.type === 'success'
                            ? 'bg-green-50 border border-green-200 text-green-800'
                            : 'bg-red-50 border border-red-200 text-red-800'
                          }`}
            >
              {notification.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              )}
              <span className="text-sm font-medium">{notification.message}</span>
            </div>
          )}

          {/* Error Banner */}
          {error && !isLoading && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 max-w-2xl mx-auto">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700 flex-1">{error}</p>
              <button onClick={() => setError(null)} className="p-1 text-red-400 hover:text-red-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-4" />
              <p className="text-gray-500 text-sm">Chargement des modèles...</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && models.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Car className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-1">Aucun modèle</h3>
              <p className="text-sm text-gray-500 text-center max-w-xs">
                {isAdmin
                  ? `Cliquez sur "Ajouter un modèle" pour créer le premier modèle de ${decodedMarque}`
                  : `Aucun modèle disponible pour ${decodedMarque}`}
              </p>
            </div>
          )}

          {/* Models Grid */}
          {!isLoading && models.length > 0 && (
            <>
              {/* Results count */}
              <p className="text-xs text-gray-500 mb-4 text-center sm:text-left">
                {models.length} modèle{models.length > 1 ? 's' : ''}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
                {models.map((model) => (
                  <ModelCard
                    key={model.id}
                    id={model.id || 0}
                    model={model.model}
                    description={model.description}
                    image={model.image}
                    isAdmin={isAdmin}
                    isDeleting={deletingId === model.id}
                    onDelete={handleDeleteModel}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Add Model Modal */}
      <AddModelModal
        isOpen={isAddModalOpen}
        isSaving={isSaving}
        marque={decodedMarque}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddModel}
      />

      {/* Animation Keyframes */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Catalogue2;
