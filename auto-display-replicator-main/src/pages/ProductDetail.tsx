import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById, getProducts } from "@/api/database";
import { ChevronUp, ChevronDown, Search, ChevronLeft, ChevronRight, Share2, MessageCircle, Phone } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

// Skeleton Loader Component
const SkeletonLoader = () => (
  <div className="animate-pulse">
    <div className="bg-gray-200 rounded-xl aspect-square mb-4"></div>
    <div className="h-6 bg-gray-200 rounded mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
  </div>
);

// Image Error Fallback Component
const ImageErrorFallback = ({ className }: { className?: string }) => (
  <div className={`${className} flex items-center justify-center bg-gray-100`}>
    <div className="text-4xl sm:text-6xl text-gray-300">🛢️</div>
  </div>
);

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<any>(null);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSearchVisible, setIsSearchVisible] = useState(true);
  const [isSpecsExpanded, setIsSpecsExpanded] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [addToCartLoading, setAddToCartLoading] = useState(false);
  const [buyNowLoading, setBuyNowLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [productImages, setProductImages] = useState<string[]>([]);
  
  // Swipe gesture handlers
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const isAdmin = user && user.role === 'admin';
  
  const handleSaveOptions = () => {
    alert('Les nouvelles options ont été sauvegardées avec succès! Redirection vers la page des filtres...');
    setTimeout(() => {
      window.location.href = '/admin-filters';
    }, 1000);
  };

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        if (productId) {
          const productData = await getProductById(productId);
          if (productData) setProduct(productData);
        }
        const allProducts = await getProducts();
        setSimilarProducts(allProducts.slice(0, 6));
      } catch (error) {
        console.error('Error loading product:', error);
      } finally {
        setLoading(false);
        setImageLoading(false);
      }
    };
    loadProduct();
  }, [productId]);

  useEffect(() => {
    if (product) {
      if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        setProductImages(product.images);
      } else if (product.image && product.image.trim() !== '') {
        setProductImages([product.image, '/ff.png', '/ll.png']);
      } else {
        setProductImages(['/ff.png', '/ll.png', '/ff.png']);
      }
      setCurrentImageIndex(0);
      setImageLoading(true);
    }
  }, [product]);

  const handleNextImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
  }, [productImages.length]);

  const handlePrevImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  }, [productImages.length]);

  const handleDotClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  const handleQuantityChange = (value: number) => {
    if (value >= 1) setQuantity(value);
  };

  // Swipe gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && productImages.length > 1) {
      handleNextImage();
    }
    if (isRightSwipe && productImages.length > 1) {
      handlePrevImage();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && productImages.length > 1) {
        handlePrevImage();
      } else if (e.key === 'ArrowRight' && productImages.length > 1) {
        handleNextImage();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleNextImage, handlePrevImage, productImages.length]);

  const handleAddToCart = async () => {
    setAddToCartLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setAddToCartLoading(false);
    // Add to cart logic here
  };

  const handleBuyNow = async () => {
    setBuyNowLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setBuyNowLoading(false);
    // Buy now logic here
  };

  // Haptic feedback for mobile
  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
        <div className="text-center max-w-md w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <div className="text-sm sm:text-base text-gray-600">Chargement du produit...</div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-base sm:text-lg text-gray-600 mb-4">Produit non trouvé</div>
          <Button 
            onClick={() => navigate('/huiles-auto')}
            className="bg-gradient-to-r from-[#F97316] to-[#EA580C] hover:from-[#EA580C] hover:to-[#F97316] text-white px-6 py-3 sm:px-8 sm:py-4 text-sm sm:text-base font-semibold shadow-lg min-h-[48px] rounded-xl"
            aria-label="Retour aux produits"
          >
            Retour aux produits
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 overflow-x-hidden">
      <Header />
      
      {/* Admin Search Toggle */}
      {isAdmin && (
        <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <Button
              onClick={() => {
                setIsSearchVisible(!isSearchVisible);
                triggerHaptic();
              }}
              variant="outline"
              size="sm"
              className="w-full bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200 text-orange-700 hover:from-orange-100 hover:to-orange-200 text-xs sm:text-sm transition-all min-h-[44px] rounded-lg"
              aria-label={isSearchVisible ? "Masquer la recherche" : "Afficher la recherche"}
              aria-expanded={isSearchVisible}
            >
              <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" aria-hidden="true" />
              {isSearchVisible ? (
                <>
                  <ChevronUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" aria-hidden="true" />
                  Masquer la recherche
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" aria-hidden="true" />
                  Afficher la recherche
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Admin Search Section */}
      {isAdmin && isSearchVisible && (
        <div className={`bg-gradient-to-r from-white to-gray-50 border-b border-gray-200 py-4 sm:py-5 lg:py-6 transition-all duration-300 ${isSearchVisible ? 'opacity-100' : 'opacity-0 hidden'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-4">
              <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent mb-2">
                TROUVEZ VOS PIÈCES AUTO
              </h2>
              <p className="text-xs sm:text-sm text-gray-600">Recherchez parmi notre large gamme</p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
                {['Marque', 'Modèle', 'Année'].map((label) => (
                  <div key={label}>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5" htmlFor={`search-${label}`}>
                      Recherche {label}
                    </label>
                    <button 
                      id={`search-${label}`}
                      className="w-full px-3 py-2.5 sm:py-3 border border-gray-300 rounded-lg text-left flex items-center justify-between bg-white text-xs sm:text-sm hover:border-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all shadow-sm min-h-[44px]"
                      aria-label={`Sélectionner ${label}`}
                    >
                      <span className="text-gray-500">Sélectionner</span>
                      <ChevronDown className="h-4 w-4 text-gray-400" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 mb-3">
                <div className="flex-1 relative">
                  <Input 
                    placeholder="Rechercher une pièce..." 
                    className="pr-10 text-xs sm:text-sm h-10 sm:h-11 border-gray-300 focus:border-orange-500 focus:ring-orange-500 rounded-lg" 
                    aria-label="Rechercher une pièce"
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" aria-hidden="true" />
                </div>
                <Button 
                  className="px-6 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xs sm:text-sm h-10 sm:h-11 shadow-md rounded-lg min-w-[120px]"
                  aria-label="Rechercher"
                >
                  Rechercher
                </Button>
              </div>
              
              {isAdmin && (
                <div className="text-center">
                  <Button 
                    onClick={handleSaveOptions}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-2.5 sm:py-3 text-xs sm:text-sm shadow-md rounded-lg min-h-[44px]"
                    aria-label="Sauvegarder les nouvelles options"
                  >
                    Sauvegarder les nouvelles options
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className={`${isAdmin && isSearchVisible ? "pt-4 sm:pt-6 md:pt-8 lg:pt-10" : "pt-2 sm:pt-4 md:pt-6"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8 lg:py-10">
          
          {/* Breadcrumbs */}
          <nav className="mb-4 sm:mb-6 md:mb-8 text-xs sm:text-sm md:text-base text-gray-600 flex flex-wrap items-center gap-1 sm:gap-2" aria-label="Breadcrumb">
            <a href="/" className="hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 rounded px-1">Accueil</a>
            <span className="text-gray-400" aria-hidden="true">{'>'}</span>
            <a href="/shop" className="hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 rounded px-1">Shop</a>
            <span className="text-gray-400" aria-hidden="true">{'>'}</span>
            <a href="/huiles-auto" className="hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 rounded px-1">Huiles moteur</a>
            <span className="text-gray-400" aria-hidden="true">{'>'}</span>
            <span className="text-gray-900 font-medium truncate max-w-[100px] xs:max-w-[150px] sm:max-w-none" title={product.brand}>
              {product.brand}
            </span>
            <span className="text-gray-400" aria-hidden="true">{'>'}</span>
            <span className="text-gray-900 font-medium truncate max-w-[120px] xs:max-w-[180px] sm:max-w-none" title={product.name}>
              {product.name}
            </span>
          </nav>

          {/* Product Detail Card */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 md:mb-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
              
              {/* Image Gallery - Premium Design */}
              <div className="relative lg:sticky lg:top-20">
                <div 
                  ref={imageContainerRef}
                  className="max-w-2xl mx-auto aspect-square bg-gradient-to-br from-gray-100 to-gray-50 rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden group relative mb-4 sm:mb-6 shadow-inner"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  role="img"
                  aria-label={`Image ${currentImageIndex + 1} sur ${productImages.length} du produit ${product.name}`}
                >
                  {productImages.length > 0 ? (
                    <>
                      {/* Main Image */}
                      <div className="relative w-full h-full">
                        {productImages.map((image, index) => (
                          <div
                            key={index}
                            className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                            }`}
                          >
                            {imageLoading && index === currentImageIndex ? (
                              <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
                                <div className="text-gray-400">Chargement...</div>
                              </div>
                            ) : (
                              <img 
                                src={image} 
                                alt={`${product.name} - Image ${index + 1}`}
                                className="w-full h-full object-contain p-3 sm:p-4 md:p-6 lg:p-8"
                                loading={index === 0 ? "eager" : "lazy"}
                                onLoad={() => setImageLoading(false)}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const fallback = target.nextElementSibling as HTMLElement;
                                  if (fallback) fallback.style.display = 'flex';
                                }}
                              />
                            )}
                            <ImageErrorFallback className="hidden w-full h-full" />
                          </div>
                        ))}
                      </div>

                      {/* Navigation Arrows - Luxury Style */}
                      {productImages.length > 1 && (
                        <>
                          <button
                            onClick={() => {
                              handlePrevImage();
                              triggerHaptic();
                            }}
                            className="absolute left-2 sm:left-3 md:left-4 lg:left-6 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 backdrop-blur-sm text-white p-2 sm:p-3 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 z-10 shadow-xl min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation focus:outline-none focus:ring-2 focus:ring-white"
                            aria-label="Image précédente"
                          >
                            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
                          </button>
                          <button
                            onClick={() => {
                              handleNextImage();
                              triggerHaptic();
                            }}
                            className="absolute right-2 sm:right-3 md:right-4 lg:right-6 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 backdrop-blur-sm text-white p-2 sm:p-3 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 z-10 shadow-xl min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation focus:outline-none focus:ring-2 focus:ring-white"
                            aria-label="Image suivante"
                          >
                            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
                          </button>

                          {/* Dot Indicators - Premium Style */}
                          <div className="absolute bottom-3 sm:bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-2.5 z-10" role="tablist" aria-label="Navigation des images">
                            {productImages.map((_, index) => (
                              <button
                                key={index}
                                onClick={() => {
                                  handleDotClick(index);
                                  triggerHaptic();
                                }}
                                role="tab"
                                aria-selected={index === currentImageIndex}
                                aria-label={`Aller à l'image ${index + 1}`}
                                className={`rounded-full transition-all duration-300 touch-manipulation min-w-[32px] min-h-[32px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-white ${
                                  index === currentImageIndex 
                                    ? 'bg-gradient-to-r from-[#F97316] to-[#EA580C] w-8 sm:w-10 shadow-lg shadow-orange-500/50' 
                                    : 'bg-white/80 hover:bg-white w-2.5 sm:w-3 h-2.5 sm:h-3'
                                }`}
                              />
                            ))}
                          </div>
                        </>
                      )}

                      {/* Discount Badge */}
                      {product.discount && (
                        <div className="absolute top-2 sm:top-3 md:top-4 left-2 sm:left-3 md:left-4 bg-gradient-to-r from-red-500 to-red-600 text-white px-2.5 sm:px-3 md:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold z-20 shadow-lg">
                          {product.discount}
                        </div>
                      )}

                      {/* Image Counter */}
                      <div className="absolute top-2 sm:top-3 md:top-4 right-2 sm:right-3 md:right-4 bg-black/70 backdrop-blur-sm text-white text-xs sm:text-sm px-2 sm:px-2.5 py-1 rounded-lg z-10 shadow-lg">
                        {currentImageIndex + 1} / {productImages.length}
                      </div>
                    </>
                  ) : (
                    <ImageErrorFallback className="w-full h-full" />
                  )}
                </div>
                
                {/* Thumbnail Navigation */}
                {productImages.length > 1 && (
                  <div className="flex gap-2 sm:gap-2.5 md:gap-3 lg:gap-4 justify-center overflow-x-auto pb-2 scrollbar-hide">
                    {productImages.slice(0, 4).map((image, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          handleDotClick(index);
                          triggerHaptic();
                        }}
                        className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-lg sm:rounded-xl overflow-hidden border-2 md:border-[3px] transition-all duration-300 shadow-md hover:shadow-lg min-w-[56px] min-h-[56px] focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                          index === currentImageIndex 
                            ? 'border-orange-500 ring-2 ring-orange-200 scale-105' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        aria-label={`Voir l'image ${index + 1}`}
                      >
                        <img 
                          src={image} 
                          alt={`Miniature ${index + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/ff.png';
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info - Premium Layout */}
              <div className="space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8">
                {/* Title & Brand */}
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg sm:rounded-xl md:rounded-2xl p-4 sm:p-5 md:p-6 border border-gray-200 shadow-sm">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight break-words">
                    {product.name}
                  </h1>
                  {product.brand && (
                    <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 font-semibold mb-4 sm:mb-5">
                      {product.brand}
                    </p>
                  )}
                  
                  {/* Product Identifiers - Professional Style */}
                  <div className="flex flex-wrap gap-2 sm:gap-3 mb-4">
                    {product.sku && (
                      <div className="flex items-center gap-2 bg-gradient-to-br from-green-50 to-green-100 border border-green-300 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] sm:text-xs text-gray-600 font-semibold uppercase">Réf</span>
                          <span className="text-xs sm:text-sm md:text-base font-bold text-gray-900">{product.sku || 'N/A'}</span>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2 bg-gradient-to-br from-green-50 to-green-100 border border-green-300 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] sm:text-xs text-gray-600 font-semibold uppercase">Code usine</span>
                        <span className="text-xs sm:text-sm md:text-base font-bold text-gray-900">{product.factoryCode || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {product.loyaltyPoints && (
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-50 via-orange-100 to-orange-50 border border-orange-300 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 shadow-sm">
                      <span className="text-base sm:text-lg md:text-xl">✨</span>
                      <p className="text-xs sm:text-sm md:text-base text-orange-700 font-bold">
                        Gagnez {product.loyaltyPoints} points de fidélité
                      </p>
                    </div>
                  )}
                </div>

                {/* Price - Luxury Styling */}
                <div className="bg-gradient-to-br from-orange-50 via-white to-orange-50 rounded-lg sm:rounded-xl md:rounded-2xl p-4 sm:p-5 md:p-6 border-2 border-orange-200 shadow-md sm:shadow-lg relative overflow-hidden">
                  {/* Decorative background pattern */}
                  <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-orange-200/30 to-transparent rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-tr from-orange-200/30 to-transparent rounded-full blur-2xl"></div>
                  
                  <div className="relative z-10">
                    <div className="mb-2 sm:mb-3">
                      <p className="text-xs sm:text-sm md:text-base font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                        <span className="w-2 h-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full"></span>
                        PRIX TTC (UNITÉ)
                      </p>
                    </div>
                    <div className="flex flex-wrap items-baseline gap-2 sm:gap-3">
                      {product.originalPrice && (
                        <span className="text-base sm:text-lg md:text-xl text-gray-400 line-through font-semibold">
                          {product.originalPrice}
                        </span>
                      )}
                      <span className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[#F97316] via-[#EA580C] to-[#F97316] bg-clip-text text-transparent leading-none">
                        {product.price || '0.00'}
                      </span>
                      <span className="text-base sm:text-lg md:text-xl font-bold text-gray-700">TND</span>
                    </div>
                  </div>
                </div>

                {/* Model & Engine Selection */}
                <div className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6 xl:space-y-7">
                  <div className="bg-gradient-to-br from-white via-gray-50 to-white rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-3xl xl:rounded-[2rem] border border-gray-200 sm:border-2 lg:border-[3px] p-3 sm:p-4 md:p-5 lg:p-7 xl:p-8 shadow-sm sm:shadow-md lg:shadow-lg xl:shadow-xl hover:shadow-2xl transition-all duration-300 lg:max-w-full">
                    <label className="block text-xs sm:text-sm md:text-base lg:text-xl xl:text-2xl font-extrabold text-gray-900 mb-2 sm:mb-3 md:mb-4 lg:mb-5 xl:mb-6 flex items-center gap-2 sm:gap-3 lg:gap-4" htmlFor="model-select">
                      <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-4 lg:h-4 xl:w-5 xl:h-5 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full shadow-md"></div>
                      <span>Modèle</span>
                    </label>
                    <button 
                      id="model-select"
                      className="w-full px-4 sm:px-5 py-3 text-base sm:text-lg border-2 border-gray-300 rounded-lg sm:rounded-xl text-left flex items-center justify-between bg-gradient-to-r from-gray-50 via-white to-gray-50 hover:from-white hover:via-gray-50 hover:to-white font-semibold text-gray-700 hover:border-orange-500 hover:shadow-md focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300 shadow-sm min-h-[44px] group"
                      aria-label="Sélectionner le modèle"
                    >
                      <span className="text-gray-600 group-hover:text-gray-900 transition-colors text-xs sm:text-sm lg:text-base">Sélectionner un modèle</span>
                      <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-9 lg:w-9 xl:h-10 xl:w-10 text-gray-400 group-hover:text-orange-500 group-hover:scale-125 flex-shrink-0 transition-all duration-300" aria-hidden="true" />
                    </button>
                  </div>
                  
                  <div className="bg-gradient-to-br from-white via-gray-50 to-white rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-3xl xl:rounded-[2rem] border border-gray-200 sm:border-2 lg:border-[3px] p-3 sm:p-4 md:p-5 lg:p-7 xl:p-8 shadow-sm sm:shadow-md lg:shadow-lg xl:shadow-xl hover:shadow-2xl transition-all duration-300 lg:max-w-full">
                    <label className="block text-xs sm:text-sm md:text-base lg:text-xl xl:text-2xl font-extrabold text-gray-900 mb-2 sm:mb-3 md:mb-4 lg:mb-5 xl:mb-6 flex items-center gap-2 sm:gap-3 lg:gap-4" htmlFor="engine-select">
                      <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-4 lg:h-4 xl:w-5 xl:h-5 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full shadow-md"></div>
                      <span>Motorisation</span>
                    </label>
                    <button 
                      id="engine-select"
                      className="w-full px-4 sm:px-5 py-3 text-base sm:text-lg border-2 border-gray-300 rounded-lg sm:rounded-xl text-left flex items-center justify-between bg-gradient-to-r from-gray-50 via-white to-gray-50 hover:from-white hover:via-gray-50 hover:to-white font-semibold text-gray-700 hover:border-orange-500 hover:shadow-md focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300 shadow-sm min-h-[44px] group"
                      aria-label="Sélectionner la motorisation"
                    >
                      <span className="text-gray-600 group-hover:text-gray-900 transition-colors text-xs sm:text-sm lg:text-base">Sélectionner une motorisation</span>
                      <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-9 lg:w-9 xl:h-10 xl:w-10 text-gray-400 group-hover:text-orange-500 group-hover:scale-125 flex-shrink-0 transition-all duration-300" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                {/* Quantity Selector */}
                <div className="bg-gradient-to-br from-white via-gray-50 to-white rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-3xl xl:rounded-[2rem] border border-gray-200 sm:border-2 lg:border-[3px] p-3 sm:p-4 md:p-5 lg:p-7 xl:p-8 shadow-sm sm:shadow-md lg:shadow-lg xl:shadow-xl hover:shadow-2xl transition-all duration-300 lg:max-w-full">
                  <label className="block text-xs sm:text-sm md:text-base lg:text-xl xl:text-2xl font-extrabold text-gray-900 mb-2 sm:mb-3 md:mb-4 lg:mb-5 xl:mb-6 flex items-center gap-2 sm:gap-3 lg:gap-4" htmlFor="quantity-input">
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-4 lg:h-4 xl:w-5 xl:h-5 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full shadow-md"></div>
                    <span>Quantité</span>
                  </label>
                  <div className="flex items-center border-2 lg:border-[3px] border-gray-300 rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-3xl xl:rounded-[2rem] overflow-hidden w-fit shadow-md sm:shadow-lg lg:shadow-xl xl:shadow-2xl hover:shadow-2xl transition-all duration-300 bg-white lg:max-w-full group">
                    <button
                      onClick={() => {
                        handleQuantityChange(quantity - 1);
                        triggerHaptic();
                      }}
                      className="px-3 sm:px-4 md:px-5 lg:px-9 xl:px-12 2xl:px-14 py-2.5 sm:py-3 md:py-4 lg:py-6 xl:py-7 2xl:py-8 text-gray-700 hover:bg-gradient-to-br hover:from-orange-50 hover:to-orange-100 hover:text-orange-600 active:bg-orange-200 transition-all duration-300 touch-manipulation font-extrabold text-lg sm:text-xl md:text-2xl lg:text-5xl xl:text-6xl 2xl:text-7xl focus:outline-none focus:ring-2 focus:ring-orange-500 min-w-[44px] sm:min-w-[48px] md:min-w-[52px] lg:min-w-[80px] xl:min-w-[90px] 2xl:min-w-[100px] min-h-[44px] sm:min-h-[48px] md:min-h-[52px] lg:min-h-[76px] xl:min-h-[84px] 2xl:min-h-[92px] border-r-2 lg:border-r-[3px] border-gray-200 group-hover:border-orange-300"
                      aria-label="Diminuer la quantité"
                    >
                      −
                    </button>
                    <Input
                      id="quantity-input"
                      type="number"
                      value={quantity}
                      onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                      className="w-16 sm:w-20 md:w-24 lg:w-44 xl:w-52 2xl:w-60 text-center border-0 focus:ring-0 text-base sm:text-lg md:text-xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-extrabold text-gray-900 min-h-[44px] sm:min-h-[48px] md:min-h-[52px] lg:min-h-[76px] xl:min-h-[84px] 2xl:min-h-[92px] bg-transparent"
                      min="1"
                      aria-label="Quantité"
                    />
                    <button
                      onClick={() => {
                        handleQuantityChange(quantity + 1);
                        triggerHaptic();
                      }}
                      className="px-3 sm:px-4 md:px-5 lg:px-9 xl:px-12 2xl:px-14 py-2.5 sm:py-3 md:py-4 lg:py-6 xl:py-7 2xl:py-8 text-gray-700 hover:bg-gradient-to-br hover:from-orange-50 hover:to-orange-100 hover:text-orange-600 active:bg-orange-200 transition-all duration-300 touch-manipulation font-extrabold text-lg sm:text-xl md:text-2xl lg:text-5xl xl:text-6xl 2xl:text-7xl focus:outline-none focus:ring-2 focus:ring-orange-500 min-w-[44px] sm:min-w-[48px] md:min-w-[52px] lg:min-w-[80px] xl:min-w-[90px] 2xl:min-w-[100px] min-h-[44px] sm:min-h-[48px] md:min-h-[52px] lg:min-h-[76px] xl:min-h-[84px] 2xl:min-h-[92px] border-l-2 lg:border-l-[3px] border-gray-200 group-hover:border-orange-300"
                      aria-label="Augmenter la quantité"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Action Buttons - Premium Style */}
                <div className="space-y-2 sm:space-y-3 md:space-y-4 lg:space-y-5 xl:space-y-6 pt-2 lg:max-w-full">
                  <Button 
                    onClick={handleAddToCart}
                    disabled={addToCartLoading}
                    className="w-full bg-gradient-to-r from-[#F97316] via-[#EA580C] to-[#F97316] hover:from-[#EA580C] hover:via-[#F97316] hover:to-[#EA580C] text-white py-3 sm:py-3.5 md:py-4 lg:py-7 xl:py-8 2xl:py-9 text-xs sm:text-sm md:text-base lg:text-xl xl:text-2xl 2xl:text-3xl font-extrabold shadow-lg sm:shadow-xl lg:shadow-2xl xl:shadow-2xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5 sm:hover:-translate-y-1 lg:hover:-translate-y-2 hover:scale-[1.01] sm:hover:scale-[1.02] lg:hover:scale-[1.03] active:translate-y-0 active:scale-100 rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-3xl xl:rounded-[2rem] min-h-[48px] sm:min-h-[52px] md:min-h-[56px] lg:min-h-[72px] xl:min-h-[80px] 2xl:min-h-[88px] focus:outline-none focus:ring-2 sm:focus:ring-4 lg:focus:ring-4 focus:ring-orange-500 focus:ring-offset-2 relative overflow-hidden group"
                    aria-label="Ajouter au panier"
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      {addToCartLoading ? (
                        <>
                          <span className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 xl:h-8 xl:w-8 border-b-2 border-white mr-2 sm:mr-3 lg:mr-4"></span>
                          <span className="text-xs sm:text-sm lg:text-base">Ajout en cours...</span>
                        </>
                      ) : (
                        <>
                          <span className="mr-1.5 sm:mr-2 lg:mr-3 text-base sm:text-lg lg:text-2xl xl:text-3xl">🛒</span>
                          <span className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl">Ajouter au panier</span>
                        </>
                      )}
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                  </Button>
                  <Button 
                    onClick={handleBuyNow}
                    disabled={buyNowLoading}
                    className="w-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 hover:from-gray-800 hover:via-gray-900 hover:to-gray-800 text-white py-3 sm:py-3.5 text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-700 rounded-lg min-h-[44px] focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 relative overflow-hidden group"
                    aria-label="Acheter maintenant"
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      {buyNowLoading ? (
                        <>
                          <span className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 xl:h-8 xl:w-8 border-b-2 border-white mr-2 sm:mr-3 lg:mr-4"></span>
                          <span className="text-xs sm:text-sm lg:text-base">Traitement...</span>
                        </>
                      ) : (
                        <>
                          <span className="mr-1.5 sm:mr-2 lg:mr-3 text-base sm:text-lg lg:text-2xl xl:text-3xl">⚡</span>
                          <span className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl">Commander</span>
                        </>
                      )}
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                  </Button>
                  
                  {/* Share Buttons - Horizontal Scroll on Mobile */}
                  <div className="flex gap-2 sm:gap-2.5 md:gap-3 lg:gap-5 xl:gap-6 overflow-x-auto pb-2 scrollbar-hide pt-2 lg:justify-center">
                    <Button 
                      variant="outline" 
                      className="flex-shrink-0 border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold shadow-sm hover:shadow-md transition-all rounded-lg min-h-[40px] sm:min-h-[44px] min-w-[80px] sm:min-w-[100px] focus:outline-none focus:ring-2 focus:ring-gray-500"
                      aria-label="Partager le produit"
                    >
                      <Share2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 lg:h-7 lg:w-7 xl:h-8 xl:w-8 mr-1 sm:mr-1.5 md:mr-2 lg:mr-3" aria-hidden="true" />
                      <span className="hidden xs:inline text-[10px] sm:text-xs lg:text-base">Partager</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-shrink-0 border-2 border-green-500 text-green-600 hover:bg-green-50 hover:border-green-600 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold shadow-sm hover:shadow-md transition-all rounded-lg min-h-[40px] sm:min-h-[44px] min-w-[90px] sm:min-w-[120px] focus:outline-none focus:ring-2 focus:ring-green-500"
                      aria-label="Contacter via WhatsApp"
                    >
                      <MessageCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 lg:h-7 lg:w-7 xl:h-8 xl:w-8 mr-1 sm:mr-1.5 md:mr-2 lg:mr-3" aria-hidden="true" />
                      <span className="hidden xs:inline text-[10px] sm:text-xs lg:text-base">WhatsApp</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-shrink-0 border-2 border-blue-500 text-blue-600 hover:bg-blue-50 hover:border-blue-600 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold shadow-sm hover:shadow-md transition-all rounded-lg min-h-[40px] sm:min-h-[44px] min-w-[80px] sm:min-w-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Contacter"
                    >
                      <Phone className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 lg:h-7 lg:w-7 xl:h-8 xl:w-8 mr-1 sm:mr-1.5 md:mr-2 lg:mr-3" aria-hidden="true" />
                      <span className="hidden xs:inline text-[10px] sm:text-xs lg:text-base">Contact</span>
                    </Button>
                  </div>
                </div>

                {/* Product Details */}
                <div className="space-y-2 text-xs sm:text-sm md:text-base text-gray-600 pt-3 sm:pt-4 border-t border-gray-200">
                  {product.sku && (
                    <p>
                      <span className="font-semibold text-gray-700">UGS:</span> {product.sku}
                    </p>
                  )}
                  {product.category && (
                    <p>
                      <span className="font-semibold text-gray-700">Catégories:</span> {product.category}
                      {product.brand && `, ${product.brand}`}
                    </p>
                  )}
                  {product.brand && (
                    <p>
                      <span className="font-semibold text-gray-700">Marque:</span> {product.brand}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Description Section - Accordion on Mobile */}
          <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-3xl shadow-md sm:shadow-lg md:shadow-xl lg:shadow-2xl p-3 sm:p-4 md:p-6 lg:p-10 xl:p-12 2xl:p-16 mb-4 sm:mb-6 md:mb-8 lg:mb-12 xl:mb-14">
            <button
              onClick={() => {
                setIsDescriptionExpanded(!isDescriptionExpanded);
                triggerHaptic();
              }}
              className="w-full flex items-center justify-between border-b-2 border-gray-200 mb-3 sm:mb-4 md:mb-6 pb-2 sm:pb-3 focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-t-lg"
              aria-expanded={isDescriptionExpanded}
              aria-controls="description-content"
            >
              <span className="px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-bold text-orange-500 border-b-2 border-orange-500 -mb-[2px]">
                DESCRIPTION
              </span>
              {isDescriptionExpanded ? (
                <ChevronUp className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400 md:hidden" aria-hidden="true" />
              ) : (
                <ChevronDown className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400 md:hidden" aria-hidden="true" />
              )}
            </button>
            <div 
              id="description-content"
              className={`space-y-3 sm:space-y-4 md:space-y-6 ${isDescriptionExpanded || !isMobile ? 'block' : 'hidden md:block'}`}
            >
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3 lg:gap-4">
                <span className="w-1 h-6 sm:h-8 md:h-10 lg:h-12 xl:h-14 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></span>
                Détails & compatibilité
              </h3>
              {product.description ? (
                <div>
                  <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl text-gray-600 leading-relaxed max-w-5xl">
                    {product.description.length > 200 && !isDescriptionExpanded ? (
                      <>
                        {product.description.substring(0, 200)}...
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsDescriptionExpanded(true);
                            triggerHaptic();
                          }}
                          className="text-orange-500 font-semibold ml-1 hover:underline focus:outline-none focus:ring-2 focus:ring-orange-500 rounded"
                          aria-label="Lire la suite de la description"
                        >
                          Lire la suite
                        </button>
                      </>
                    ) : (
                      product.description
                    )}
                  </p>
                </div>
              ) : (
                <p className="text-xs sm:text-sm md:text-base text-gray-500 italic">Aucune description disponible</p>
              )}
            </div>
          </div>

          {/* Specifications Section - Accordion on Mobile */}
          <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-3xl shadow-md sm:shadow-lg md:shadow-xl lg:shadow-2xl p-3 sm:p-4 md:p-6 lg:p-10 xl:p-12 2xl:p-16 mb-4 sm:mb-6 md:mb-8 lg:mb-12 xl:mb-14">
            <button
              onClick={() => {
                setIsSpecsExpanded(!isSpecsExpanded);
                triggerHaptic();
              }}
              className="w-full flex items-center justify-between mb-3 sm:mb-4 md:mb-6 focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-t-lg"
              aria-expanded={isSpecsExpanded}
              aria-controls="specs-content"
            >
              <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-bold text-gray-900">
                Spécifications / Homologations
              </h2>
              {isSpecsExpanded ? (
                <ChevronUp className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400 md:hidden" aria-hidden="true" />
              ) : (
                <ChevronDown className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400 md:hidden" aria-hidden="true" />
              )}
            </button>
            <div 
              id="specs-content"
              className={`space-y-2 sm:space-y-3 md:space-y-4 lg:space-y-5 xl:space-y-6 ${isSpecsExpanded || !isMobile ? 'block' : 'hidden md:block'}`}
            >
              <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl text-gray-600">
                <span className="font-semibold text-gray-700">Général:</span> ACEA C3, API SP
              </p>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl text-gray-600 leading-relaxed max-w-5xl">
                LIQUI MOLY recommande ce produit pour les véhicules et organes pour lesquels les spécifications ou références de pièce de rechange d'origine suivantes sont requises:
              </p>
              <ul className="list-disc list-inside space-y-1 sm:space-y-2 lg:space-y-3 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl text-gray-600 ml-2 sm:ml-4 lg:ml-6 max-w-5xl">
                <li>Stellantis FPW9.55535/03</li>
                <li>Peugeot Citroen (PSA) B71 2290</li>
                <li>Peugeot Citroen (PSA) B71 2297</li>
              </ul>
            </div>
          </div>

          {/* Similar Products Section - Horizontal Scroll on Mobile */}
          <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-3xl shadow-md sm:shadow-lg md:shadow-xl lg:shadow-2xl p-3 sm:p-4 md:p-6 lg:p-10 xl:p-12 2xl:p-16">
            <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6 lg:mb-8 xl:mb-10 2xl:mb-12">
              PRODUITS SIMILAIRES
            </h2>
            {/* Mobile: Horizontal Scroll */}
            <div className="md:hidden overflow-x-auto pb-4 scrollbar-hide -mx-3 sm:-mx-4 px-3 sm:px-4">
              <div className="flex gap-3 min-w-max">
                {similarProducts.map((similarProduct) => (
                  <div 
                    key={similarProduct.id} 
                    className="flex-shrink-0 w-[160px] sm:w-[180px] border-2 border-gray-200 rounded-lg p-3 hover:shadow-lg hover:border-orange-300 transition-all duration-300 cursor-pointer group"
                    onClick={() => navigate(`/product-detail/${similarProduct.id}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        navigate(`/product-detail/${similarProduct.id}`);
                      }
                    }}
                    aria-label={`Voir les détails de ${similarProduct.name}`}
                  >
                    <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-50 rounded-lg overflow-hidden mb-2 shadow-inner">
                      {similarProduct.image ? (
                        <img 
                          src={similarProduct.image} 
                          alt={similarProduct.name}
                          className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/ff.png';
                          }}
                        />
                      ) : (
                        <ImageErrorFallback className="w-full h-full" />
                      )}
                    </div>
                    <h3 className="text-xs font-semibold text-gray-900 mb-1 line-clamp-2 min-h-[2.5rem] group-hover:text-orange-600 transition-colors">
                      {similarProduct.name}
                    </h3>
                    {similarProduct.loyaltyPoints && (
                      <p className="text-xs text-orange-500 font-medium mb-1">
                        ✨ {similarProduct.loyaltyPoints} pts
                      </p>
                    )}
                    <p className="text-sm font-bold text-gray-900 mb-2">
                      {similarProduct.price}
                    </p>
                    <Button 
                      className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-2 text-xs font-semibold shadow-md hover:shadow-lg transition-all rounded-lg min-h-[36px]"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/product-detail/${similarProduct.id}`);
                      }}
                      aria-label={`Voir les détails de ${similarProduct.name}`}
                    >
                      Voir détails
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            {/* Desktop: Grid */}
            <div className="hidden md:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {similarProducts.map((similarProduct) => (
                <div 
                  key={similarProduct.id} 
                  className="border-2 border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:shadow-lg hover:border-orange-300 transition-all duration-300 cursor-pointer group"
                  onClick={() => navigate(`/product-detail/${similarProduct.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      navigate(`/product-detail/${similarProduct.id}`);
                    }
                  }}
                  aria-label={`Voir les détails de ${similarProduct.name}`}
                >
                  <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-50 rounded-lg overflow-hidden mb-3 shadow-inner">
                    {similarProduct.image ? (
                      <img 
                        src={similarProduct.image} 
                        alt={similarProduct.name}
                        className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/ff.png';
                        }}
                      />
                    ) : (
                      <ImageErrorFallback className="w-full h-full" />
                    )}
                  </div>
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-1.5 line-clamp-2 min-h-[2.5rem] group-hover:text-orange-600 transition-colors">
                    {similarProduct.name}
                  </h3>
                  {similarProduct.loyaltyPoints && (
                    <p className="text-xs text-orange-500 font-medium mb-1.5">
                      ✨ {similarProduct.loyaltyPoints} pts
                    </p>
                  )}
                  <p className="text-sm sm:text-base font-bold text-gray-900 mb-3">
                    {similarProduct.price}
                  </p>
                  <Button 
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-2 text-xs sm:text-sm font-semibold shadow-md hover:shadow-lg transition-all rounded-lg min-h-[44px]"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/product-detail/${similarProduct.id}`);
                    }}
                    aria-label={`Voir les détails de ${similarProduct.name}`}
                  >
                    Voir détails
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
      
      {/* Custom Scrollbar Hide Styles */}
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default ProductDetail;
