import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getProductById, createProduct, getProducts } from "@/api/database";

const PromotionsSection = () => {
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<any>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [promotionImages, setPromotionImages] = useState<{[key: number]: string}>({});
  const [imageTransforms, setImageTransforms] = useState<{[key: number]: {translateX: number, translateY: number, scaleX: number, scaleY: number}}>({});
  const [promotionTexts, setPromotionTexts] = useState<{[key: number]: {title: string, subtitle: string, price: string, originalPrice: string}}>({});

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
      try {
        // Check if product exists, if not create it first
        let product = await getProductById(promo.productId);
        
        if (!product) {
          // Product doesn't exist, create it now
          const index = promotions.findIndex(p => p.productId === promo.productId);
          const productData = {
            id: promo.productId,
            name: promo.title,
            price: `${promo.price} ${promo.currency}`,
            originalPrice: `${promo.originalPrice} ${promo.currency}`,
            discount: promo.badge === "PROMO" ? "-25%" : undefined,
            brand: "RAM Auto Motors",
            sku: `PROMO-${promo.productId.toUpperCase().replace(/-/g, '')}`,
            category: "Promotions",
            loyaltyPoints: 5,
            image: index === 0 ? "/ff.png" : index === 1 ? "/ll.png" : undefined,
            images: index === 0 ? ["/ff.png", "/ll.png"] : index === 1 ? ["/ll.png", "/ff.png"] : undefined,
            description: promo.subtitle,
            factoryCode: `FACT-${promo.productId.toUpperCase()}`,
            hasPreview: false,
            hasOptions: false
          };
          
          product = await createProduct(productData);
        }
        
        // Navigate to product detail page
        navigate(`/product-detail/${promo.productId}`);
      } catch (error) {
        console.error('Error handling card click:', error);
        // Still navigate even if there's an error
        navigate(`/product-detail/${promo.productId}`);
      }
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

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Load saved promotion images
    const savedImages = localStorage.getItem('promotionImages');
    if (savedImages) {
      setPromotionImages(JSON.parse(savedImages));
    }

    // Load saved image transforms
    const savedTransforms = localStorage.getItem('promotionImageTransforms');
    if (savedTransforms) {
      setImageTransforms(JSON.parse(savedTransforms));
    }

    // Load saved promotion texts
    const savedTexts = localStorage.getItem('promotionTexts');
    if (savedTexts) {
      try {
        setPromotionTexts(JSON.parse(savedTexts));
      } catch (error) {
        console.error('Error parsing promotion texts:', error);
      }
    }

    // Create promotion products if they don't exist
    const createPromotionProducts = async () => {
      try {
        // Get all existing products first
        const allProducts = await getProducts();
        
        for (let index = 0; index < promotions.length; index++) {
          const promo = promotions[index];
          if (promo.productId) {
            // Check if product exists in the list
            const existingProduct = allProducts.find((p: any) => p.id === promo.productId);
            
            if (!existingProduct) {
              // Create the product with all required fields
              const productData = {
                id: promo.productId,
                name: promo.title,
                price: `${promo.price} ${promo.currency}`,
                originalPrice: `${promo.originalPrice} ${promo.currency}`,
                discount: promo.badge === "PROMO" ? "-25%" : undefined,
                brand: "RAM Auto Motors",
                sku: `PROMO-${promo.productId.toUpperCase().replace(/-/g, '')}`,
                category: "Promotions",
                loyaltyPoints: 5,
                image: index === 0 ? "/ff.png" : index === 1 ? "/ll.png" : undefined,
                images: index === 0 ? ["/ff.png", "/ll.png"] : index === 1 ? ["/ll.png", "/ff.png"] : undefined,
                description: promo.subtitle,
                factoryCode: `FACT-${promo.productId.toUpperCase()}`,
                hasPreview: false,
                hasOptions: false
              };
              
              try {
                await createProduct(productData);
                console.log(`Product ${promo.productId} created successfully`);
              } catch (createError) {
                console.error(`Error creating product ${promo.productId}:`, createError);
              }
            } else {
              console.log(`Product ${promo.productId} already exists`);
            }
          }
        }
      } catch (error) {
        console.error('Error creating promotion products:', error);
      }
    };
    createPromotionProducts();

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

  const handleImageUpload = (promoIndex: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataUrl = e.target?.result as string;
        const newImages = { ...promotionImages, [promoIndex]: imageDataUrl };
        setPromotionImages(newImages);
        localStorage.setItem('promotionImages', JSON.stringify(newImages));
        alert('Image uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (promoIndex: number) => {
    const newImages = { ...promotionImages };
    delete newImages[promoIndex];
    setPromotionImages(newImages);
    localStorage.setItem('promotionImages', JSON.stringify(newImages));
    
    const newTransforms = { ...imageTransforms };
    delete newTransforms[promoIndex];
    setImageTransforms(newTransforms);
    localStorage.setItem('promotionImageTransforms', JSON.stringify(newTransforms));
    
    alert('Image removed successfully!');
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
    <section className="py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24 2xl:py-28 bg-gradient-to-b from-white via-orange-50/20 to-gray-100/30 relative overflow-hidden">
      {/* Subtle texture overlay for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(249,115,22,0.03)_0%,transparent_70%)] pointer-events-none" />
      
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 max-w-7xl lg:max-w-[1600px] relative z-10">
        
        {/* Title - Premium Styling */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-black text-center mb-8 sm:mb-10 md:mb-12 lg:mb-16 xl:mb-20 text-[#F97316] drop-shadow-[0_4px_20px_rgba(249,115,22,0.3)] leading-tight tracking-tight">
          PROMOTIONS
        </h2>
        
        {/* Horizontal scrolling promotions display with controls */}
        <div className="relative">
          
          {/* Desktop Layout (lg+) — Premium Scroll Buttons */}
          {/* Scroll Left Button - Glass Effect, Always Visible on Desktop */}
          <button
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
            className={`hidden sm:flex absolute left-2 lg:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full bg-white/80 backdrop-blur-md border-2 border-white/40 hover:border-[#F97316]/50 shadow-[0_8px_24px_rgba(0,0,0,0.15)] hover:shadow-[0_12px_32px_rgba(249,115,22,0.3)] transition-all duration-300 hover:scale-110 active:scale-100 items-center justify-center group ${
              canScrollLeft ? 'opacity-100 cursor-pointer' : 'opacity-30 cursor-not-allowed lg:opacity-50'
            }`}
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-[#F97316] group-hover:text-[#ea580c] transition-colors" />
          </button>

          {/* Scroll Right Button - Glass Effect, Always Visible on Desktop */}
          <button
            onClick={scrollRight}
            disabled={!canScrollRight}
            aria-label="Scroll right"
            className={`hidden sm:flex absolute right-2 lg:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full bg-white/80 backdrop-blur-md border-2 border-white/40 hover:border-[#F97316]/50 shadow-[0_8px_24px_rgba(0,0,0,0.15)] hover:shadow-[0_12px_32px_rgba(249,115,22,0.3)] transition-all duration-300 hover:scale-110 active:scale-100 items-center justify-center group ${
              canScrollRight ? 'opacity-100 cursor-pointer' : 'opacity-30 cursor-not-allowed lg:opacity-50'
            }`}
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-[#F97316] group-hover:text-[#ea580c] transition-colors" />
          </button>

          {/* Promotions Container - Smooth Snap Scrolling */}
          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto gap-4 sm:gap-5 md:gap-6 lg:gap-8 pb-4 scrollbar-hide px-4 sm:px-6 md:px-8 lg:px-12 snap-x snap-mandatory"
            style={{ 
              scrollBehavior: 'smooth',
              scrollSnapType: 'x mandatory'
            }}
          >
            {promotions.map((promo, index) => (
              <div
                key={index}
                className="group flex-shrink-0 snap-start cursor-pointer min-w-[280px] sm:min-w-[320px] md:min-w-[350px] lg:min-w-[420px] xl:min-w-[450px]"
                style={{ scrollSnapAlign: 'center' }}
                onClick={() => handleCardClick(promo)}
              >
                <div className="bg-white rounded-2xl border-4 border-white/20 hover:border-[#F97316]/40 shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.2),0_0_40px_rgba(249,115,22,0.25),12px_12px_0_rgba(249,115,22,0.2)] transition-all duration-300 hover:scale-105 active:scale-100 overflow-hidden h-full">
                  {index === 0 ? (
                    // First card - display ff.png image
                    <div className="flex flex-col justify-center items-center p-4 sm:p-5 md:p-6 lg:p-8">
                      <div className="flex justify-center items-center w-full h-32 sm:h-40 md:h-48 lg:h-56 xl:h-64 mb-4 sm:mb-5 md:mb-6">
                        <img
                          src="/ff.png"
                          alt="Promotion Image"
                          className="w-full h-auto max-w-[250px] sm:max-w-[300px] md:max-w-[350px] lg:max-w-[400px] xl:max-w-[450px] object-contain mx-auto"
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
                          className="group/btn relative w-full bg-gradient-to-r from-[#F97316] to-[#ea580c] hover:from-[#ea580c] hover:to-[#F97316] text-white font-bold rounded-xl px-6 py-3 sm:px-8 sm:py-4 text-sm sm:text-base md:text-lg transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(249,115,22,0.5)] active:scale-100 active:translate-y-0 border-4 border-white/20 hover:border-white/40 overflow-hidden"
                        >
                          <span className="relative z-10">Commander</span>
                          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                        </Button>
                      </div>
                    </div>
                  ) : index === 1 ? (
                    // Second card - display ll.png image
                    <div className="flex flex-col justify-center items-center p-4 sm:p-5 md:p-6 lg:p-8">
                      <div className="flex justify-center items-center w-full h-32 sm:h-40 md:h-48 lg:h-56 xl:h-64 mb-4 sm:mb-5 md:mb-6">
                        <img
                          src="/ll.png"
                          alt="Promotion Image"
                          className="w-full h-auto max-w-[250px] sm:max-w-[300px] md:max-w-[350px] lg:max-w-[400px] xl:max-w-[450px] object-contain mx-auto"
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
                          className="group/btn relative w-full bg-gradient-to-r from-[#F97316] to-[#ea580c] hover:from-[#ea580c] hover:to-[#F97316] text-white font-bold rounded-xl px-6 py-3 sm:px-8 sm:py-4 text-sm sm:text-base md:text-lg transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(249,115,22,0.5)] active:scale-100 active:translate-y-0 border-4 border-white/20 hover:border-white/40 overflow-hidden"
                        >
                          <span className="relative z-10">Commander</span>
                          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                  <>
                    <div className="absolute top-4 left-4 z-10">
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

          {/* Scroll Indicators - Premium Animated Style */}
          <div className="flex justify-center mt-6 sm:mt-8 space-x-2">
            <div 
              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                canScrollLeft 
                  ? 'bg-[#F97316] scale-125 shadow-[0_0_12px_rgba(249,115,22,0.8)]' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={canScrollLeft ? "Can scroll left" : "Cannot scroll left"}
            />
            <div 
              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                canScrollRight 
                  ? 'bg-[#F97316] scale-125 shadow-[0_0_12px_rgba(249,115,22,0.8)]' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={canScrollRight ? "Can scroll right" : "Cannot scroll right"}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromotionsSection;