import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Edit2, Upload, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPromotions, updatePromotionImage, type PromotionData } from "@/api/database";
import { uploadImage } from "@/services/uploadService";
import { useToast } from "@/hooks/use-toast";

const PromotionsSection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<any>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [imageTransforms, setImageTransforms] = useState<{[key: number]: {translateX: number, translateY: number, scaleX: number, scaleY: number}}>({});
  const [promotionTexts, setPromotionTexts] = useState<{[key: number]: {title: string, subtitle: string, price: string, originalPrice: string}}>({});
  const [isEditModalOpen, setIsEditModalOpen] = useState<number | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch promotions from database using React Query
  const { data: promotionsData = [], isLoading: isLoadingPromotions } = useQuery({
    queryKey: ['promotions'],
    queryFn: getPromotions,
    staleTime: 0, // Always fetch fresh data
  });

  // Convert promotions array to image map for easier access
  const promotionImages: {[key: number]: string} = {};
  promotionsData.forEach((promo: PromotionData) => {
    if (promo.image) {
      promotionImages[promo.id] = promo.image;
    }
  });

  const promotions = [
    {
      title: "Pack Entretien",
      subtitle: "Complet pour votre véhicule",
      price: "150",
      originalPrice: "200",
      currency: "DT",
      image: "🔧",
      badge: "PROMO",
      productId: "promo-pack-entretien"
    },
    {
      title: "Kit Embrayage",
      subtitle: "Haute qualité",
      price: "250",
      originalPrice: "320",
      currency: "DT",
      image: "⚙️",
      badge: "NOUVEAU",
      productId: "promo-kit-embrayage"
    }
  ];

  const handleCardClick = async (promo: typeof promotions[0]) => {
    if (promo.productId) {
      // Product detail page removed - navigate to catalogue instead
      navigate('/catalogue');
    }
  };

  // Check scroll position and update button states
  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  // Scroll functions
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -300,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 300,
        behavior: 'smooth'
      });
    }
  };

  // Handle wheel scroll
  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: e.deltaY,
        behavior: 'smooth'
      });
    }
  };

  // Update promotion image mutation
  const updatePromotionMutation = useMutation({
    mutationFn: async ({ promoId, imageUrl }: { promoId: number; imageUrl: string }) => {
      return await updatePromotionImage(promoId, imageUrl);
    },
    onSuccess: () => {
      // Invalidate and refetch promotions
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      toast({
        title: "Succès",
        description: "Image de promotion mise à jour avec succès",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour l'image",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    // Check admin status periodically
    const checkAdmin = () => {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          if (parsed?.role === 'admin' || parsed?.isAdmin === true) {
            setUser(parsed);
          }
        } catch (e) {
          // Ignore
        }
      }
    };
    checkAdmin();
    const interval = setInterval(checkAdmin, 1000);
    return () => clearInterval(interval);

    // Load saved image transforms (keep in localStorage for now)
    const savedTransforms = localStorage.getItem('promotionImageTransforms');
    if (savedTransforms) {
      setImageTransforms(JSON.parse(savedTransforms));
    }

    // Load saved promotion texts (keep in localStorage for now)
    const savedTexts = localStorage.getItem('promotionTexts');
    if (savedTexts) {
      try {
        setPromotionTexts(JSON.parse(savedTexts));
      } catch (error) {
        console.error('Error parsing promotion texts:', error);
      }
    }

    // NOTE: Promotion products are created on-demand when user clicks "Commander"
    // This prevents 409 SKU already exists errors on every page load
    // See handleCardClick() function for product creation logic

    // Update scroll state on scroll
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      container.addEventListener('wheel', handleWheel, { passive: false });
      checkScrollPosition(); // Initial check
      
      return () => {
        container.removeEventListener('scroll', checkScrollPosition);
        container.removeEventListener('wheel', handleWheel);
      };
    }
  }, []);

  const isAdmin = user && (user.role === 'admin' || user.isAdmin === true);

  const handleEditClick = (promoIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditModalOpen(promoIndex);
    setSelectedImageFile(null);
    setImagePreview(null);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveImage = async () => {
    if (isEditModalOpen === null || !selectedImageFile) return;
    
    setIsUploading(true);
    try {
      // Upload image to server
      const uploadedImageUrl = await uploadImage(selectedImageFile);
      
      // Update promotion in database
      await updatePromotionMutation.mutateAsync({
        promoId: isEditModalOpen,
        imageUrl: uploadedImageUrl
      });
      
      // Close modal and reset state
      setIsEditModalOpen(null);
      setSelectedImageFile(null);
      setImagePreview(null);
    } catch (error) {
      console.error('Error saving promotion image:', error);
      // Error toast is handled by mutation onError
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUpload = async (promoIndex: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    try {
      // Upload image to server
      const uploadedImageUrl = await uploadImage(file);
      
      // Update promotion in database
      await updatePromotionMutation.mutateAsync({
        promoId: promoIndex,
        imageUrl: uploadedImageUrl
      });
    } catch (error) {
      console.error('Error uploading promotion image:', error);
      // Error toast is handled by mutation onError
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async (promoIndex: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) return;
    
    setIsUploading(true);
    try {
      // Remove image by setting it to null/empty
      await updatePromotionMutation.mutateAsync({
        promoId: promoIndex,
        imageUrl: ''
      });
      
      // Remove transforms
      const newTransforms = { ...imageTransforms };
      delete newTransforms[promoIndex];
      setImageTransforms(newTransforms);
      localStorage.setItem('promotionImageTransforms', JSON.stringify(newTransforms));
    } catch (error) {
      console.error('Error removing promotion image:', error);
      // Error toast is handled by mutation onError
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageTransform = (promoIndex: number, field: string, value: number) => {
    const newTransforms = {
      ...imageTransforms,
      [promoIndex]: {
        ...imageTransforms[promoIndex],
        [field]: value
      }
    };
    setImageTransforms(newTransforms);
    localStorage.setItem('promotionImageTransforms', JSON.stringify(newTransforms));
  };
  const resetImageTransform = (promoIndex: number) => {
    const newTransforms = {
      ...imageTransforms,
      [promoIndex]: {
        translateX: 0,
        translateY: 0,
        scaleX: 1,
        scaleY: 1
      }
    };
    setImageTransforms(newTransforms);
    localStorage.setItem('promotionImageTransforms', JSON.stringify(newTransforms));
    alert('Image transform reset to default!');
  };

  const handleTextChange = (promoIndex: number, field: string, value: string) => {
    const currentTexts = promotionTexts[promoIndex] || { title: '', subtitle: '', price: '', originalPrice: '' };
    const newTexts = {
      ...promotionTexts,
      [promoIndex]: {
        ...currentTexts,
        [field]: value
      }
    } as { [key: number]: { title: string; subtitle: string; price: string; originalPrice: string } };
    setPromotionTexts(newTexts);
    localStorage.setItem('promotionTexts', JSON.stringify(newTexts));
  };

  const resetTexts = (promoIndex: number) => {
    const defaultTexts = {
      title: promotions[promoIndex].title,
      subtitle: promotions[promoIndex].subtitle,
      price: promotions[promoIndex].price,
      originalPrice: promotions[promoIndex].originalPrice
    };
    const newTexts = {
      ...promotionTexts,
      [promoIndex]: defaultTexts
    };
    setPromotionTexts(newTexts);
    localStorage.setItem('promotionTexts', JSON.stringify(newTexts));
    alert('Texts reset to default!');
  };

  return (
    <section className="py-6 sm:py-8 md:py-12 lg:py-16 xl:py-20 bg-gradient-to-b from-white via-orange-50/20 to-gray-100/30 relative overflow-hidden w-full max-w-full">
      {/* Subtle texture overlay for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(249,115,22,0.03)_0%,transparent_70%)] pointer-events-none" />
      
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 relative z-10 overflow-hidden">
        
        {/* Title - Responsive Styling */}
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-center mb-5 sm:mb-6 md:mb-8 lg:mb-10 text-[#F97316] leading-tight tracking-tight px-2">
          PROMOTIONS
        </h2>
        
        {/* Loading State */}
        {isLoadingPromotions && (
          <div className="py-16 text-center">
            <div className="inline-block h-8 w-8 rounded-full border-b-2 border-[#F97316] animate-spin" />
            <p className="mt-4 text-gray-600">Chargement des promotions...</p>
          </div>
        )}
        
        {/* Horizontal scrolling promotions display with controls */}
        {!isLoadingPromotions && (
        <div className="relative w-full">
          
          {/* Scroll Left Button - Hidden on mobile */}
          <button
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
            className={`hidden md:flex absolute -left-1 lg:left-0 top-1/2 -translate-y-1/2 z-20 w-9 h-9 md:w-10 md:h-10 lg:w-11 lg:h-11 rounded-full bg-white/95 backdrop-blur-md border-2 border-gray-200 hover:border-[#F97316]/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-100 items-center justify-center group ${
              canScrollLeft ? 'opacity-100 cursor-pointer' : 'opacity-30 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 text-[#F97316] group-hover:text-[#ea580c] transition-colors" />
          </button>

          {/* Scroll Right Button - Hidden on mobile */}
          <button
            onClick={scrollRight}
            disabled={!canScrollRight}
            aria-label="Scroll right"
            className={`hidden md:flex absolute -right-1 lg:right-0 top-1/2 -translate-y-1/2 z-20 w-9 h-9 md:w-10 md:h-10 lg:w-11 lg:h-11 rounded-full bg-white/95 backdrop-blur-md border-2 border-gray-200 hover:border-[#F97316]/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-100 items-center justify-center group ${
              canScrollRight ? 'opacity-100 cursor-pointer' : 'opacity-30 cursor-not-allowed'
            }`}
          >
            <ChevronRight className="h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 text-[#F97316] group-hover:text-[#ea580c] transition-colors" />
          </button>

          {/* Promotions Container - Better mobile handling */}
          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto gap-3 sm:gap-4 md:gap-5 lg:gap-6 pb-3 sm:pb-4 scrollbar-hide px-1 sm:px-2 md:px-10 lg:px-12 snap-x snap-mandatory -webkit-overflow-scrolling-touch"
            style={{ 
              scrollBehavior: 'smooth',
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {promotions.map((promo, index) => (
              <div
                key={index}
                className="group flex-shrink-0 snap-start cursor-pointer w-[260px] sm:w-[280px] md:w-[320px] lg:w-[380px] xl:w-[420px] relative"
                style={{ scrollSnapAlign: 'center' }}
                onClick={() => handleCardClick(promo)}
              >
                {/* Edit Button - Admin Only */}
                {isAdmin && (
                  <button
                    onClick={(e) => handleEditClick(index, e)}
                    className="absolute top-2 right-2 z-30 w-8 h-8 sm:w-9 sm:h-9 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-transform duration-200 border border-gray-200"
                    aria-label="Modifier l'image"
                  >
                    <Edit2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#f97316]" />
                  </button>
                )}
                
                <div className="bg-white rounded-xl sm:rounded-2xl border-2 sm:border-4 border-white/20 hover:border-[#F97316]/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-100 overflow-hidden h-full">
                  {index === 0 ? (
                    // First card - display ff.png image or uploaded image from database
                    <div className="flex flex-col justify-center items-center p-3 sm:p-4 md:p-5 lg:p-6">
                      <div className="flex justify-center items-center w-full h-28 sm:h-32 md:h-40 lg:h-48 xl:h-52 mb-3 sm:mb-4 md:mb-5 relative">
                        <img
                          src={promotionImages[0] || "/ff.png"}
                          alt="Promotion Image"
                          className="w-full h-auto max-w-[200px] sm:max-w-[240px] md:max-w-[280px] lg:max-w-[320px] xl:max-w-[360px] object-contain mx-auto"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `
                                <div class="w-full h-full bg-gradient-to-br from-[#F97316]/20 to-[#ea580c]/10 rounded-2xl flex items-center justify-center text-[#F97316] font-bold text-sm sm:text-lg border-2 border-[#F97316]/30">
                                  Image non disponible
                                </div>
                              `;
                            }
                          }}
                        />
                      </div>
                      <div className="w-full text-center">
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCardClick(promo);
                          }}
                          className="group/btn relative w-full bg-gradient-to-r from-[#F97316] to-[#ea580c] hover:from-[#ea580c] hover:to-[#F97316] text-white font-semibold rounded-lg sm:rounded-xl px-4 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-3.5 text-xs sm:text-sm md:text-base transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-100 border-2 sm:border-4 border-white/20 hover:border-white/40 overflow-hidden min-h-[44px]"
                        >
                          <span className="relative z-10">Commander</span>
                          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                        </Button>
                      </div>
                    </div>
                  ) : index === 1 ? (
                    // Second card - display ll.png image or uploaded image from database
                    <div className="flex flex-col justify-center items-center p-3 sm:p-4 md:p-5 lg:p-6">
                      <div className="flex justify-center items-center w-full h-28 sm:h-32 md:h-40 lg:h-48 xl:h-52 mb-3 sm:mb-4 md:mb-5 relative">
                        <img
                          src={promotionImages[1] || "/ll.png"}
                          alt="Promotion Image"
                          className="w-full h-auto max-w-[200px] sm:max-w-[240px] md:max-w-[280px] lg:max-w-[320px] xl:max-w-[360px] object-contain mx-auto"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `
                                <div class="w-full h-full bg-gradient-to-br from-[#F97316]/20 to-[#ea580c]/10 rounded-2xl flex items-center justify-center text-[#F97316] font-bold text-sm sm:text-lg border-2 border-[#F97316]/30">
                                  Image non disponible
                                </div>
                              `;
                            }
                          }}
                        />
                      </div>
                      <div className="w-full text-center">
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCardClick(promo);
                          }}
                          className="group/btn relative w-full bg-gradient-to-r from-[#F97316] to-[#ea580c] hover:from-[#ea580c] hover:to-[#F97316] text-white font-semibold rounded-lg sm:rounded-xl px-4 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-3.5 text-xs sm:text-sm md:text-base transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-100 border-2 sm:border-4 border-white/20 hover:border-white/40 overflow-hidden min-h-[44px]"
                        >
                          <span className="relative z-10">Commander</span>
                          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                  <>
                    <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10">
                      <Badge className="bg-gradient-to-r from-[#F97316] to-[#ea580c] text-white text-xs sm:text-sm font-bold px-3 py-1 rounded-lg shadow-lg">
                        {promo.badge}
                      </Badge>
                    </div>
                    
                    <div className="p-4 sm:p-5 md:p-6 lg:p-8">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-5 md:gap-6">
                        <div className="flex-1 text-center sm:text-left">
                          {(promotionTexts[index]?.title || promo.title) && (
                            <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold mb-2 sm:mb-3 text-gray-900 group-hover:text-[#F97316] transition-colors duration-300">
                              {promotionTexts[index]?.title || promo.title}
                            </h3>
                          )}
                          {(promotionTexts[index]?.subtitle || promo.subtitle) && (
                            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 leading-relaxed">
                              {promotionTexts[index]?.subtitle || promo.subtitle}
                            </p>
                          )}
                          
                          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
                            {(promotionTexts[index]?.price || promo.price) && (
                              <span className="text-lg sm:text-xl md:text-2xl font-black text-[#F97316] drop-shadow-[0_2px_8px_rgba(249,115,22,0.3)]">
                                {promotionTexts[index]?.price || promo.price} {promo.currency}
                              </span>
                            )}
                            {(promotionTexts[index]?.originalPrice || promo.originalPrice) && (
                              <span className="text-sm sm:text-base text-gray-500 line-through">
                                {promotionTexts[index]?.originalPrice || promo.originalPrice} {promo.currency}
                              </span>
                            )}
                          </div>
                          
                          <Button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCardClick(promo);
                            }}
                            className="group/btn relative bg-gradient-to-r from-[#F97316] to-[#ea580c] hover:from-[#ea580c] hover:to-[#F97316] text-white font-bold rounded-xl px-6 py-3 sm:px-8 sm:py-4 text-sm sm:text-base md:text-lg transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(249,115,22,0.5)] active:scale-100 active:translate-y-0 border-4 border-white/20 hover:border-white/40 overflow-hidden w-full sm:w-auto"
                          >
                            <span className="relative z-10">Commander</span>
                            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                          </Button>
                        </div>
                        
                        {/* Image Display Area - Premium Framing */}
                        <div className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 flex items-center justify-center flex-shrink-0 p-3 sm:p-4 rounded-xl bg-gradient-to-br from-[#F97316]/10 to-[#ea580c]/5 border-2 border-[#F97316]/20 group-hover:border-[#F97316]/40 group-hover:shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all duration-300">
                          {promotionImages[index] ? (
                            <div className="relative w-full h-full">
                              <img
                                src={promotionImages[index]}
                                alt={`${promo.title} image`}
                                className="w-full h-full object-contain transition-transform duration-200"
                                style={{
                                  transform: `translate(${imageTransforms[index]?.translateX || 0}px, ${imageTransforms[index]?.translateY || 0}px) scale(${imageTransforms[index]?.scaleX || 1}, ${imageTransforms[index]?.scaleY || 1})`
                                }}
                              />
                              {user && user.role === 'admin' && (
                                <div className="absolute -top-2 -right-2 flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleRemoveImage(index)}
                                    className="text-xs h-7 w-7 p-0 rounded-full bg-red-500 hover:bg-red-600 shadow-lg"
                                    aria-label="Remove image"
                                  >
                                    ×
                                  </Button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-5xl sm:text-6xl md:text-7xl opacity-30 text-[#F97316]">
                              {promo.image}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Admin Controls - Premium Styling */}
                      {user && user.role === 'admin' && (
                        <div 
                          onClick={(e) => e.stopPropagation()}
                          className="mt-4 sm:mt-5 md:mt-6 p-4 sm:p-5 md:p-6 bg-gradient-to-br from-gray-50 to-orange-50/30 rounded-xl border-2 border-[#F97316]/20 shadow-lg"
                        >
                          <h4 className="text-sm sm:text-base font-bold mb-3 sm:mb-4 text-[#F97316] flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#F97316]"></span>
                            Contrôles Admin
                          </h4>
                    
                          {/* Text Editing Controls */}
                          <div className="mb-4 sm:mb-6">
                            <h5 className="text-xs sm:text-sm font-semibold mb-3 text-gray-800">Modifier le texte</h5>
                            <div className="grid grid-cols-1 gap-3 sm:gap-4">
                              <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Titre:</label>
                                <div className="relative">
                                  <Input
                                    value={promotionTexts[index]?.title || promo.title}
                                    onChange={(e) => handleTextChange(index, 'title', e.target.value)}
                                    className="text-sm pr-8 border-gray-300 focus:border-[#F97316] focus:ring-[#F97316] rounded-lg"
                                    placeholder="Titre de la promotion"
                                  />
                                  {(promotionTexts[index]?.title !== undefined ? promotionTexts[index].title : promo.title) && (
                                    <button
                                      type="button"
                                      onClick={() => handleTextChange(index, 'title', '')}
                                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 text-lg font-bold transition-colors"
                                      title="Effacer le titre"
                                      aria-label="Clear title"
                                    >
                                      ×
                                    </button>
                                  )}
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Sous-titre:</label>
                                <div className="relative">
                                  <Input
                                    value={promotionTexts[index]?.subtitle || promo.subtitle}
                                    onChange={(e) => handleTextChange(index, 'subtitle', e.target.value)}
                                    className="text-sm pr-8 border-gray-300 focus:border-[#F97316] focus:ring-[#F97316] rounded-lg"
                                    placeholder="Description de la promotion"
                                  />
                                  {(promotionTexts[index]?.subtitle !== undefined ? promotionTexts[index].subtitle : promo.subtitle) && (
                                    <button
                                      type="button"
                                      onClick={() => handleTextChange(index, 'subtitle', '')}
                                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 text-lg font-bold transition-colors"
                                      title="Effacer le sous-titre"
                                      aria-label="Clear subtitle"
                                    >
                                      ×
                                    </button>
                                  )}
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Prix actuel:</label>
                                  <div className="relative">
                                    <Input
                                      value={promotionTexts[index]?.price || promo.price}
                                      onChange={(e) => handleTextChange(index, 'price', e.target.value)}
                                      className="text-xs sm:text-sm pr-8 border-gray-300 focus:border-[#F97316] focus:ring-[#F97316] rounded-lg"
                                      placeholder="Prix"
                                    />
                                    {(promotionTexts[index]?.price !== undefined ? promotionTexts[index].price : promo.price) && (
                                      <button
                                        type="button"
                                        onClick={() => handleTextChange(index, 'price', '')}
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 text-lg font-bold transition-colors"
                                        title="Effacer le prix"
                                        aria-label="Clear price"
                                      >
                                        ×
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Ancien prix:</label>
                                  <div className="relative">
                                    <Input
                                      value={promotionTexts[index]?.originalPrice || promo.originalPrice}
                                      onChange={(e) => handleTextChange(index, 'originalPrice', e.target.value)}
                                      className="text-xs sm:text-sm pr-8 border-gray-300 focus:border-[#F97316] focus:ring-[#F97316] rounded-lg"
                                      placeholder="Ancien prix"
                                    />
                                    {(promotionTexts[index]?.originalPrice !== undefined ? promotionTexts[index].originalPrice : promo.originalPrice) && (
                                      <button
                                        type="button"
                                        onClick={() => handleTextChange(index, 'originalPrice', '')}
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 text-lg font-bold transition-colors"
                                        title="Effacer l'ancien prix"
                                        aria-label="Clear original price"
                                      >
                                        ×
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <Button
                                onClick={() => resetTexts(index)}
                                variant="outline"
                                size="sm"
                                className="border-2 border-[#F97316] text-[#F97316] hover:bg-[#F97316] hover:text-white font-semibold text-xs sm:text-sm w-full rounded-lg transition-all duration-300 hover:scale-105"
                              >
                                Réinitialiser texte
                              </Button>
                            </div>
                          </div>

                          {/* Image Controls */}
                          <div>
                            <h5 className="text-xs sm:text-sm font-semibold mb-3 text-gray-800">Contrôles d'image</h5>
                            
                            {/* Image Upload */}
                            <div className="mb-4">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(index, e)}
                                className="text-sm mb-2 border-gray-300 focus:border-[#F97316] focus:ring-[#F97316] rounded-lg cursor-pointer"
                              />
                              <p className="text-xs text-gray-500">
                                Formats acceptés: JPG, PNG, GIF
                              </p>
                            </div>

                            {/* Image Transform Controls */}
                            {promotionImages[index] && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                  <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Position X:</label>
                                    <input
                                      type="range"
                                      min="-50"
                                      max="50"
                                      value={imageTransforms[index]?.translateX || 0}
                                      onChange={(e) => handleImageTransform(index, 'translateX', parseInt(e.target.value))}
                                      className="w-full accent-[#F97316]"
                                    />
                                    <span className="text-xs sm:text-sm font-semibold text-[#F97316]">{(imageTransforms[index]?.translateX || 0)}px</span>
                                  </div>
                                  <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Position Y:</label>
                                    <input
                                      type="range"
                                      min="-50"
                                      max="50"
                                      value={imageTransforms[index]?.translateY || 0}
                                      onChange={(e) => handleImageTransform(index, 'translateY', parseInt(e.target.value))}
                                      className="w-full accent-[#F97316]"
                                    />
                                    <span className="text-xs sm:text-sm font-semibold text-[#F97316]">{(imageTransforms[index]?.translateY || 0)}px</span>
                                  </div>
                                  <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Largeur:</label>
                                    <input
                                      type="range"
                                      min="0.5"
                                      max="2"
                                      step="0.1"
                                      value={imageTransforms[index]?.scaleX || 1}
                                      onChange={(e) => handleImageTransform(index, 'scaleX', parseFloat(e.target.value))}
                                      className="w-full accent-[#F97316]"
                                    />
                                    <span className="text-xs sm:text-sm font-semibold text-[#F97316]">{(imageTransforms[index]?.scaleX || 1)}x</span>
                                  </div>
                                  <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Hauteur:</label>
                                    <input
                                      type="range"
                                      min="0.5"
                                      max="2"
                                      step="0.1"
                                      value={imageTransforms[index]?.scaleY || 1}
                                      onChange={(e) => handleImageTransform(index, 'scaleY', parseFloat(e.target.value))}
                                      className="w-full accent-[#F97316]"
                                    />
                                    <span className="text-xs sm:text-sm font-semibold text-[#F97316]">{(imageTransforms[index]?.scaleY || 1)}x</span>
                                  </div>
                                </div>
                                <Button
                                  onClick={() => resetImageTransform(index)}
                                  variant="outline"
                                  size="sm"
                                  className="border-2 border-[#F97316] text-[#F97316] hover:bg-[#F97316] hover:text-white font-semibold text-xs sm:text-sm w-full rounded-lg transition-all duration-300 hover:scale-105"
                                >
                                  Réinitialiser position
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
            ))}
          </div>

          {/* Scroll Indicators */}
          <div className="flex justify-center mt-3 sm:mt-4 md:mt-5 gap-2">
            <div 
              className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-300 ${
                canScrollLeft 
                  ? 'bg-[#F97316] scale-110 shadow-md' 
                  : 'bg-gray-300'
              }`}
              aria-hidden="true"
            />
            <div 
              className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-300 ${
                canScrollRight 
                  ? 'bg-[#F97316] scale-110 shadow-md' 
                  : 'bg-gray-300'
              }`}
              aria-hidden="true"
            />
          </div>
          {/* Mobile scroll hint */}
          <p className="text-center text-xs text-gray-400 mt-2 md:hidden">← Glissez pour voir plus →</p>
        </div>
        )}
      </div>

      {/* Edit Image Modal */}
      <Dialog open={isEditModalOpen !== null} onOpenChange={(open) => !open && setIsEditModalOpen(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modifier l'image de la promotion</DialogTitle>
            <DialogDescription>
              Téléchargez une nouvelle image pour cette carte promotionnelle.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Sélectionner une image</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choisir une image
              </Button>
            </div>
            {imagePreview && (
              <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditModalOpen(null);
                setSelectedImageFile(null);
                setImagePreview(null);
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSaveImage}
              disabled={!selectedImageFile || isUploading}
              className="bg-[#f97316] hover:bg-[#ea580c] text-white"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enregistrement...
                </>
              ) : (
                'Enregistrer'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default PromotionsSection;
