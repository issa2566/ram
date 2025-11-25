import { 
  Cog, 
  Car, 
  Wrench, 
  Gauge, 
  Battery, 
  Fuel,
  Thermometer,
  Zap,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const ProductCategoriesSection = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);

  const categories = [
    { 
      name: "Embrayage", 
      icon: Cog, 
      description: "Disques et mécanismes",
      links: [
        "Disque d'embrayage",
        "Kit d'embrayage",
        "Mécanisme d'embrayage",
        "Ressort d'embrayage",
        "Cable d'embrayage"
      ]
    },
    { 
      name: "Direction et Suspension", 
      icon: Car, 
      description: "Amortisseurs et rotules",
      links: [
        "Amortisseur avant",
        "Amortisseur arrière",
        "Rotule de direction",
        "Bras de suspension",
        "Ressort de suspension",
        "Biellette de direction"
      ]
    },
    { 
      name: "Filtration", 
      icon: Gauge, 
      description: "Filtres air, huile, carburant",
      links: [
        "Filtre à air",
        "Filtre à huile",
        "Filtre à carburant",
        "Filtre à pollen",
        "Filtre habitacle"
      ]
    },
    { 
      name: "Freinage", 
      icon: Wrench, 
      description: "Plaquettes et disques",
      links: [
        "Plaquettes de frein avant",
        "Plaquettes de frein arrière",
        "Disque de frein avant",
        "Disque de frein arrière",
        "Étrier de frein",
        "Liquide de frein"
      ]
    },
    { 
      name: "Pièces Moteur", 
      icon: Battery, 
      description: "Système de transmission",
      links: [
        "KIT DE DISTRIBUTION",
        "BOUGIE D'ALLUMAGE",
        "POMPE À EAU",
        "JOINT DE CULASSE",
        "SUPPORT MOTEUR",
        "COURROIE TRAPÉZOÏDALE À NERVURES"
      ]
    },
    { 
      name: "Pièces et Crémailleurs", 
      icon: Fuel, 
      description: "Direction assistée",
      links: [
        "Crémaillère de direction",
        "Biellette de direction",
        "Rotule de direction",
        "Pompe de direction assistée"
      ]
    },
    { 
      name: "Échappement et Charge", 
      icon: Thermometer, 
      description: "Système d'échappement",
      links: [
        "Pot d'échappement",
        "Catalyseur",
        "Silencieux",
        "Collecteur d'échappement"
      ]
    },
    { 
      name: "Carrosserie", 
      icon: Zap, 
      description: "Éléments de carrosserie",
      links: [
        "Pare-chocs avant",
        "Pare-chocs arrière",
        "Aile avant",
        "Aile arrière",
        "Capot"
      ]
    },
    { 
      name: "Pièces Habitacle", 
      icon: Cog, 
      description: "Intérieur véhicule",
      links: [
        "Volant",
        "Siège conducteur",
        "Tableau de bord",
        "Poignée de porte"
      ]
    },
    { 
      name: "Qualité Diesel/Essence", 
      icon: Car, 
      description: "Système d'injection",
      links: [
        "Injecteur",
        "Pompe à injection",
        "Filtre à gasoil",
        "Bougie de préchauffage"
      ]
    },
    { 
      name: "Optiques et Signaux", 
      icon: Wrench, 
      description: "Éclairage automobile",
      links: [
        "Phares avant",
        "Feux arrière",
        "Clignotant",
        "Ampoule"
      ]
    },
    { 
      name: "Refroidissement", 
      icon: Gauge, 
      description: "Radiateurs et ventilation",
      links: [
        "Radiateur",
        "Ventilateur",
        "Thermostat",
        "Liquide de refroidissement"
      ]
    }
  ];

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
        left: -250,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 250,
        behavior: 'smooth'
      });
    }
  };

  // Handle wheel scroll
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: e.deltaY,
        behavior: 'smooth'
      });
    }
  };

  // Toggle category expansion
  const toggleCategory = (index: number) => {
    setExpandedCategory(expandedCategory === index ? null : index);
  };

  // Update scroll state on scroll
  useEffect(() => {
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

  return (
    <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-gradient-to-b from-white via-orange-50/5 to-white relative overflow-hidden">
      {/* Ultra-luxury texture overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(249,115,22,0.02)_0%,transparent_70%)] pointer-events-none" />
      
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Title */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8 sm:mb-10 md:mb-12 text-[#F97316] leading-tight">
          FAMILLES DES PIÈCES
        </h2>
        
        {/* Horizontal scrolling categories display with controls */}
        <div className="relative">
          
          {/* Scroll Left Button - Hidden on mobile */}
          <button
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            className={`hidden sm:flex absolute left-0 lg:left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-white/90 backdrop-blur-md border-2 border-gray-200 hover:border-[#F97316] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-100 items-center justify-center group ${
              canScrollLeft ? 'opacity-100 cursor-pointer' : 'opacity-30 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:h-5 lg:h-6 lg:w-6 text-[#F97316] group-hover:text-[#ea580c] transition-colors" />
          </button>

          {/* Scroll Right Button - Hidden on mobile */}
          <button
            onClick={scrollRight}
            disabled={!canScrollRight}
            className={`hidden sm:flex absolute right-0 lg:right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-white/90 backdrop-blur-md border-2 border-gray-200 hover:border-[#F97316] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-100 items-center justify-center group ${
              canScrollRight ? 'opacity-100 cursor-pointer' : 'opacity-30 cursor-not-allowed'
            }`}
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:h-5 lg:h-6 lg:w-6 text-[#F97316] group-hover:text-[#ea580c] transition-colors" />
          </button>

          {/* Categories Container */}
          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto gap-4 sm:gap-5 md:gap-6 pb-4 scrollbar-hide px-8 sm:px-10 md:px-12 snap-x snap-mandatory"
            style={{ scrollBehavior: 'smooth' }}
          >
            {categories.map((category, index) => {
              const IconComponent = category.icon;
              const isExpanded = expandedCategory === index;
              
              return (
                <div
                  key={index}
                  className="group flex-shrink-0 snap-start min-w-[280px] sm:min-w-[300px] md:min-w-[320px] lg:min-w-[350px]"
                >
                  {/* Category Card */}
                  <div 
                    className="bg-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
                    onClick={() => toggleCategory(index)}
                  >
                    {/* Card Header */}
                    <div className="p-4 sm:p-5 md:p-6">
                      <div className="text-center">
                        <div className="mb-3 sm:mb-4 flex justify-center">
                          <div className={`p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#F97316]/10 to-[#E85A00]/5 border-2 transition-all duration-300 ${
                            isExpanded ? 'border-[#F97316] shadow-lg' : 'border-[#F97316]/20 group-hover:border-[#F97316]/50'
                          }`}>
                            <IconComponent className={`h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 mx-auto text-[#F97316] transition-transform duration-300 ${
                              isExpanded ? 'scale-110' : 'group-hover:scale-110'
                            }`} />
                          </div>
                        </div>
                        <h3 className="text-base sm:text-lg md:text-xl font-bold mb-2 text-gray-900 leading-tight group-hover:text-[#F97316] transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed mb-3">
                          {category.description}
                        </p>
                        {/* Expand/Collapse Icon */}
                        <div className="flex justify-center">
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-[#F97316] transition-transform duration-300" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-400 group-hover:text-[#F97316] transition-all duration-300" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Links List */}
                    {isExpanded && (
                      <div className="border-t-2 border-red-500 bg-white animate-in slide-in-from-top-2 duration-300">
                        <div className="p-4 sm:p-5 md:p-6">
                          <h4 className="text-xs sm:text-sm md:text-base font-bold text-gray-700 uppercase mb-3 sm:mb-4 text-center">
                            {category.name}
                          </h4>
                          <ul className="space-y-2 sm:space-y-2.5 max-h-[300px] sm:max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-orange-300 scrollbar-track-gray-100">
                            {category.links.map((link, linkIndex) => (
                              <li key={linkIndex}>
                                <Link
                                  to={`/category/${encodeURIComponent(link)}`}
                                  className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm md:text-base text-gray-700 hover:text-[#F97316] transition-colors group/link py-1.5 sm:py-2"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-[#F97316] flex-shrink-0 group-hover/link:translate-x-1 transition-transform" />
                                  <span className="flex-1">{link}</span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                          {/* Scroll Indicator */}
                          {category.links.length > 5 && (
                            <div className="flex justify-center mt-3 sm:mt-4">
                              <ChevronDown className="h-4 w-4 text-gray-400 animate-bounce" />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Scroll Indicators */}
          <div className="flex justify-center mt-4 sm:mt-6 space-x-2">
            <div 
              className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-300 ${
                canScrollLeft 
                  ? 'bg-[#F97316] scale-125 shadow-lg' 
                  : 'bg-gray-300'
              }`}
            />
            <div 
              className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-300 ${
                canScrollRight 
                  ? 'bg-[#F97316] scale-125 shadow-lg' 
                  : 'bg-gray-300'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-thin {
          scrollbar-width: thin;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #fb923c;
          border-radius: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #f97316;
        }
      `}</style>
    </section>
  );
};

export default ProductCategoriesSection;
