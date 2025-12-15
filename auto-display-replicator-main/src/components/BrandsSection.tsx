import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { getBrandImages, updateBrandImages, uploadBrandImages, BrandImagesData } from "@/api/database";
import { toast } from "@/hooks/use-toast";

const DEFAULT_BRANDS: BrandImagesData = {
  id: 0,
  title: 'NOS MARQUES DISPONIBLES',
  images: ['/pp.jpg'],
  updatedAt: new Date().toISOString()
};

// Backend base URL for static files
const BACKEND_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, '') || 'http://localhost:3000';

/**
 * Convert relative image path to full URL
 * /brands/file.png → http://localhost:3000/brands/file.png
 */
const getFullImageUrl = (imagePath: string | undefined | null): string => {
  if (!imagePath) return '/pp.jpg';
  
  // Already a full URL - return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Data URL - return as-is
  if (imagePath.startsWith('data:')) {
    return imagePath;
  }
  
  // Backend paths - prepend base URL
  if (imagePath.startsWith('/brands/') || imagePath.startsWith('/hero/') || imagePath.startsWith('/uploads/')) {
    const fullUrl = `${BACKEND_URL}${imagePath}`;
    console.log('🔗 Converting path:', imagePath, '→', fullUrl);
    return fullUrl;
  }
  
  // Public assets like /pp.jpg - return as-is
  if (imagePath.startsWith('/')) {
    return imagePath;
  }
  
  // Just filename - assume brands folder
  return `${BACKEND_URL}/brands/${imagePath}`;
};

const BrandsSection = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [brandData, setBrandData] = useState<BrandImagesData>(DEFAULT_BRANDS);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Edit modal states
  const [editTitle, setEditTitle] = useState('');
  const [editImages, setEditImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check admin status
  useEffect(() => {
    const normalizeRole = (val: unknown): string | null => {
      if (!val) return null;
      if (typeof val === "string") return val.toLowerCase();
      return null;
    };

    const computeIsAdmin = (): boolean => {
      const roleCandidates: Array<string | null> = [];
      let flagAdmin = false;

      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          const parsed = JSON.parse(userData);
          if (parsed?.is_admin === true || parsed?.isAdmin === true || parsed?.is_admin === "true" || parsed?.isAdmin === "true") {
            flagAdmin = true;
          }
          roleCandidates.push(
            normalizeRole(parsed?.role),
            normalizeRole(parsed?.user?.role),
            normalizeRole(parsed?.data?.role)
          );
        } catch (e) {
          console.warn("Error parsing user data:", e);
        }
      }

      const adminSynonyms = ["admin", "administrator", "superadmin", "super_admin", "root"];
      const resolvedRole = roleCandidates.find((r) => r !== null) || null;
      const adminLike = resolvedRole ? adminSynonyms.includes(resolvedRole) : false;

      return flagAdmin || adminLike;
    };

    const apply = () => setIsAdmin(computeIsAdmin());
    apply();

    window.addEventListener("storage", apply);
    document.addEventListener("visibilitychange", apply);

    const t0 = setTimeout(apply, 300);
    const t1 = setTimeout(apply, 1000);

    return () => {
      window.removeEventListener("storage", apply);
      document.removeEventListener("visibilitychange", apply);
      clearTimeout(t0);
      clearTimeout(t1);
    };
  }, []);

  // Load brand data on mount
  useEffect(() => {
    const loadBrandData = async () => {
      try {
        setIsLoading(true);
        const data = await getBrandImages();
        console.log('📦 BrandsSection: Loaded data from API:', data);
        console.log('📦 BrandsSection: Images array:', data.images);
        setBrandData(data);
        setImageError(false);
      } catch (error) {
        console.error('❌ Error loading brand images:', error);
        setBrandData(DEFAULT_BRANDS);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadBrandData();
  }, []);

  // Auto-rotate images if multiple
  useEffect(() => {
    if (brandData.images.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % brandData.images.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, [brandData.images.length]);

  // Open edit modal
  const handleOpenEdit = () => {
    setEditTitle(brandData.title);
    setEditImages([...brandData.images]);
    setNewImageFiles([]);
    setNewImagePreviews([]);
    setShowEditModal(true);
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    // Create previews
    const previews = files.map(file => URL.createObjectURL(file));
    setNewImageFiles(prev => [...prev, ...files]);
    setNewImagePreviews(prev => [...prev, ...previews]);
  };

  // Remove an existing image
  const handleRemoveExistingImage = (index: number) => {
    setEditImages(prev => prev.filter((_, i) => i !== index));
  };

  // Remove a new image preview
  const handleRemoveNewImage = (index: number) => {
    setNewImagePreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Save changes
  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      let finalImages = [...editImages];
      
      // Upload new images if any
      if (newImageFiles.length > 0) {
        const uploadedUrls = await uploadBrandImages(newImageFiles);
        finalImages = [...finalImages, ...uploadedUrls];
      }
      
      // If no images, keep at least one default
      if (finalImages.length === 0) {
        finalImages = ['/pp.jpg'];
      }
      
      // Update brand data
      const updated = await updateBrandImages({
        title: editTitle,
        images: finalImages
      });
      
      setBrandData(updated);
      setShowEditModal(false);
      setImageError(false);
      setCurrentImageIndex(0);
      
      // Clean up previews
      newImagePreviews.forEach(url => URL.revokeObjectURL(url));
      setNewImagePreviews([]);
      setNewImageFiles([]);
      
      toast({
        title: "✅ Succès",
        description: "Les images des marques ont été mises à jour",
      });
    } catch (error) {
      console.error('Error saving brand images:', error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de sauvegarder les modifications",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Get the current image with full URL
  const rawImagePath = brandData.images[currentImageIndex] || '/pp.jpg';
  const currentImage = getFullImageUrl(rawImagePath);
  
  console.log('🖼️ BrandsSection: Rendering image:', rawImagePath, '→', currentImage);

  return (
    <section className="py-8 sm:py-10 md:py-14 lg:py-16 xl:py-20 bg-gradient-to-b from-white via-orange-50/10 to-white relative overflow-hidden w-full max-w-full">
      {/* Ultra-luxury texture overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(249,115,22,0.03)_0%,transparent_70%)] pointer-events-none" />
      
      {/* Admin Edit Button */}
      {isAdmin && (
        <button
          onClick={handleOpenEdit}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 lg:top-8 lg:right-8 z-50 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-black/70 backdrop-blur-sm ring-1 ring-white/20 hover:ring-orange-500/50 hover:bg-black/80 grid place-items-center text-white shadow-lg transition-all"
          title="Modifier les images des marques"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 sm:h-6 sm:w-6">
            <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.69a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
          </svg>
        </button>
      )}
      
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 relative z-10">
        
        {/* Title - Responsive Typography */}
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-center mb-6 sm:mb-8 md:mb-10 lg:mb-12 text-[#F97316] leading-tight tracking-tight">
          {brandData.title}
        </h2>

        {/* Brand Image - Responsive sizing with proper constraints */}
        <div className="flex justify-center items-center mb-6 sm:mb-8 md:mb-10 lg:mb-12 px-2 sm:px-4">
          <div className="relative w-full max-w-full sm:max-w-[85%] md:max-w-[75%] lg:max-w-[65%] xl:max-w-[55%]">
            {isLoading ? (
              <div className="w-full aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl sm:rounded-2xl md:rounded-3xl animate-pulse flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : !imageError ? (
              <div className="relative">
                <img
                  key={currentImage}
                  src={currentImage}
                  alt={brandData.title}
                  className="w-full h-auto object-contain rounded-xl sm:rounded-2xl md:rounded-3xl border-2 sm:border-4 border-white/40 lg:border-[#F97316]/50 shadow-lg sm:shadow-xl md:shadow-2xl transition-all duration-500 hover:scale-[1.02]"
                  onError={() => setImageError(true)}
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
                
                {/* Image indicators */}
                {brandData.images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {brandData.images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all ${
                          idx === currentImageIndex
                            ? 'bg-orange-500 scale-125'
                            : 'bg-white/60 hover:bg-white/80'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full aspect-video bg-gradient-to-br from-[#F97316]/20 to-[#ea580c]/10 rounded-xl sm:rounded-2xl border-2 sm:border-4 border-[#F97316]/30 flex items-center justify-center text-[#F97316] font-bold text-sm sm:text-lg md:text-xl lg:text-2xl shadow-lg">
                Image non disponible
              </div>
            )}
          </div>
        </div>

        {/* CTA Button - Mobile-friendly sizing */}
        <div className="text-center px-4">
          <Link 
            to="/catalogue"
            className="group relative inline-flex items-center justify-center gap-2 sm:gap-3 luxury-gradient-primary text-white font-semibold rounded-xl sm:rounded-2xl px-5 sm:px-8 md:px-10 lg:px-12 py-3 sm:py-4 md:py-5 text-sm sm:text-base md:text-lg lg:text-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] active:translate-y-0 active:scale-100 overflow-hidden min-h-[48px] max-w-full"
          >
            <span className="relative z-10 text-center">VOIR TOUTES LES MARQUES</span>
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </Link>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Modifier les marques</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Title Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre de la section
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                  placeholder="NOS MARQUES DISPONIBLES"
                />
              </div>

              {/* Current Images */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Images actuelles ({editImages.length})
                </label>
                {editImages.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {editImages.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={getFullImageUrl(img)}
                          alt={`Brand ${idx + 1}`}
                          className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <button
                          onClick={() => handleRemoveExistingImage(idx)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Aucune image actuelle</p>
                )}
              </div>

              {/* New Images Preview */}
              {newImagePreviews.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nouvelles images à ajouter ({newImagePreviews.length})
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {newImagePreviews.map((preview, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={preview}
                          alt={`New ${idx + 1}`}
                          className="w-full h-24 object-cover rounded-lg border-2 border-green-300"
                        />
                        <button
                          onClick={() => handleRemoveNewImage(idx)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        <div className="absolute bottom-1 left-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded">
                          Nouveau
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <div className="mb-6">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition flex flex-col items-center gap-2 text-gray-600 hover:text-orange-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="font-medium">Ajouter des images</span>
                  <span className="text-xs text-gray-400">JPG, PNG, WebP (max 10MB)</span>
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-6 py-2.5 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-xl font-medium transition"
                disabled={isSaving}
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Sauvegarder
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default BrandsSection;
