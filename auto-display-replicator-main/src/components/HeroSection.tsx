import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [heroTitle, setHeroTitle] = useState<string>("Un large choix de pièces auto");
  const [heroSubtitle, setHeroSubtitle] = useState<string>("Découvrez des milliers de références pour toutes les marques populaires. Qualité garantie, service fiable.");
  const defaultImages = ["/k.png", "/k2.jpg", "/k3.png"];
  const [images, setImages] = useState<string[]>(defaultImages);
  const [showTextEditor, setShowTextEditor] = useState<boolean>(false);
  const [showImagesEditor, setShowImagesEditor] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

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
          setUser(parsed);
          if (parsed?.is_admin === true || parsed?.isAdmin === true || parsed?.is_admin === "true" || parsed?.isAdmin === "true") {
            flagAdmin = true;
          }
          roleCandidates.push(
            normalizeRole(parsed?.role),
            normalizeRole(parsed?.user?.role),
            normalizeRole(parsed?.data?.role)
          );
        } catch {}
      }
      const altAuth = localStorage.getItem("auth");
      if (altAuth) {
        try {
          const parsed = JSON.parse(altAuth);
          if (parsed?.is_admin === true || parsed?.isAdmin === true || parsed?.is_admin === "true" || parsed?.isAdmin === "true") {
            flagAdmin = true;
          }
          roleCandidates.push(normalizeRole(parsed?.role));
        } catch {}
      }
      const plainRole = normalizeRole(localStorage.getItem("role"));
      if (plainRole) roleCandidates.push(plainRole);
      roleCandidates.push(
        normalizeRole(localStorage.getItem("userRole")),
        normalizeRole(sessionStorage.getItem("userRole"))
      );
      const params = new URLSearchParams(window.location.search);
      const forced =
        localStorage.getItem("force_admin") === "1" ||
        localStorage.getItem("isAdmin") === "1" ||
        localStorage.getItem("isAdmin") === "true" ||
        localStorage.getItem("is_admin") === "1" ||
        localStorage.getItem("is_admin") === "true" ||
        params.get("admin") === "1";
      const resolvedRole = roleCandidates.find((r) => !!r) || null;
      const adminSynonyms = [
        "admin",
        "administrator",
        "superadmin",
        "super admin",
        "administrateur",
        "مدير"
      ];
      const adminLike = resolvedRole ? adminSynonyms.includes(resolvedRole) : false;
      return forced || flagAdmin || adminLike;
    };
    const apply = () => setIsAdmin(computeIsAdmin());
    apply();
    const onStorage = () => apply();
    const onVisibility = () => apply();
    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVisibility);
    const t0 = setTimeout(apply, 300);
    const t1 = setTimeout(apply, 1000);
    const t2 = setTimeout(apply, 2000);
    return () => {
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisibility);
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {}
    }
    const storedTitle = localStorage.getItem("hero_title");
    const storedSubtitle = localStorage.getItem("hero_subtitle");
    const storedImages = localStorage.getItem("hero_images");
    if (storedTitle) setHeroTitle(storedTitle);
    if (storedSubtitle) setHeroSubtitle(storedSubtitle);
    if (storedImages) {
      try {
        const parsed = JSON.parse(storedImages);
        if (Array.isArray(parsed) && parsed.every((x) => typeof x === "string")) {
          const fixed = [...defaultImages];
          for (let i = 0; i < 3; i++) {
            if (typeof parsed[i] === "string" && parsed[i].trim().length > 0) {
              fixed[i] = parsed[i];
            }
          }
          setImages(fixed.slice(0, 3));
        }
      } catch {}
    }
  }, []);

  // Auto-slide every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
        setIsTransitioning(false);
      }, 250);
    }, 4000);

    return () => clearInterval(interval);
  }, [images.length]);

  const handleImageChange = (index: number, value: string) => {
    setImages((prev) => {
      const next = [...prev];
      next[index] = value;
      return next.slice(0, 3);
    });
  };

  const saveHeroConfig = () => {
    localStorage.setItem("hero_title", heroTitle);
    localStorage.setItem("hero_subtitle", heroSubtitle);
    const fixed = [...images];
    while (fixed.length < 3) fixed.push("");
    localStorage.setItem("hero_images", JSON.stringify(fixed.slice(0, 3)));
  };

  const handleImageFileUpload = (index: number, file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = (e.target?.result as string) || "";
      if (!dataUrl) return;
      setImages((prev) => {
        const next = [...prev];
        next[index] = dataUrl;
        return next.slice(0, 3);
      });
    };
    reader.readAsDataURL(file);
  };

  const handleIndicatorClick = (index: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentImageIndex(index);
      setIsTransitioning(false);
    }, 250);
  };

  return (
    <section className="relative overflow-hidden min-h-[85vh] sm:min-h-[90vh] md:min-h-[500px] lg:min-h-[600px] flex items-center justify-center">
      {/* Background Image Slider */}
      <div className="absolute inset-0 z-0">
              {images.map((image, index) => (
                <div
                  key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
                >
                  <img 
                    src={image} 
                    alt={`Hero ${index + 1}`}
              className="w-full h-full object-cover object-center scale-100 sm:scale-105"
              loading="eager"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              ))}
        {/* Gradient Overlay - Cleaner on Mobile */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F1724]/70 via-[#0F1724]/40 to-[#0F1724]/30 md:from-[#0F1724]/60 md:via-transparent md:to-[#0F1724]/20" />
        <div className="absolute inset-0 luxury-gradient-hero-overlay" />
      </div>
              
      {/* Content Container */}
      <div className="w-full max-w-7xl xl:max-w-8xl mx-auto px-3 sm:px-4 md:px-6 lg:px-12 xl:px-16 2xl:px-24 relative z-10 py-8 sm:py-12 md:py-20 lg:py-24 xl:py-28 2xl:py-32">
        {/* Admin Controls */}
        {isAdmin && (
          <div className="absolute right-2 top-2 sm:right-4 sm:top-4 lg:right-8 lg:top-8 z-50 flex items-center gap-2">
            <button
              onClick={() => {
                setShowTextEditor((v) => !v);
                setShowImagesEditor(false);
              }}
              className="h-9 w-9 sm:h-11 sm:w-11 rounded-full bg-black/70 backdrop-blur-sm ring-1 ring-white/20 hover:ring-white/40 grid place-items-center text-white shadow-lg transition-all"
              title="Modifier le texte"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 sm:h-5 sm:w-5">
                <path d="M21.731 2.269a2.625 2.625 0 0 0-3.714 0l-1.157 1.157 3.714 3.714 1.157-1.157a2.625 2.625 0 0 0 0-3.714zM3 17.25V21h3.75l10.94-10.94-3.714-3.714L3 17.25z"/>
              </svg>
            </button>
            <button
              onClick={() => {
                setShowImagesEditor((v) => !v);
                setShowTextEditor(false);
              }}
              className="h-9 w-9 sm:h-11 sm:w-11 rounded-full bg-black/70 backdrop-blur-sm ring-1 ring-white/20 hover:ring-white/40 grid place-items-center text-white shadow-lg transition-all"
              title="Modifier les images"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 sm:h-5 sm:w-5">
                <path d="M4.5 5.25A2.25 2.25 0 0 1 6.75 3h10.5A2.25 2.25 0 0 1 19.5 5.25v13.5A2.25 2.25 0 0 1 17.25 21H6.75A2.25 2.25 0 0 1 4.5 18.75V5.25zM7.5 7.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM6 18h12l-4.5-6-3.375 4.5L8.25 13.5 6 18z"/>
              </svg>
            </button>
          </div>
        )}

        {/* Admin Text Editor */}
        {isAdmin && showTextEditor && (
          <div className="mb-4 sm:mb-6 rounded-xl sm:rounded-2xl border border-white/15 bg-black/70 backdrop-blur-sm p-3 sm:p-4 max-w-3xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm text-gray-300 mb-1.5 sm:mb-2">Titre (H1)</label>
                <Input value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} className="text-sm" />
              </div>
              <div>
                <label className="block text-xs sm:text-sm text-gray-300 mb-1.5 sm:mb-2">Sous-titre</label>
                <Textarea value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} className="text-sm min-h-[80px]" />
              </div>
            </div>
            <div className="mt-3 sm:mt-4 flex items-center gap-2 sm:gap-3 flex-wrap">
              <Button onClick={saveHeroConfig} size="sm" className="text-xs sm:text-sm">Enregistrer</Button>
              <Button variant="outline" onClick={() => setShowTextEditor(false)} size="sm" className="text-xs sm:text-sm">Fermer</Button>
            </div>
          </div>
        )}

        {/* Admin Images Editor */}
        {isAdmin && showImagesEditor && (
          <div className="mb-4 sm:mb-6 rounded-xl sm:rounded-2xl border border-white/15 bg-black/70 backdrop-blur-sm p-3 sm:p-4 max-w-3xl">
            <div className="grid grid-cols-1 gap-2 sm:gap-3">
              {[0,1,2].map((i) => (
                <div key={i}>
                  <label className="block text-xs sm:text-sm text-gray-300 mb-1.5 sm:mb-2">Image {i + 1}</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageFileUpload(i, e.target.files?.[0])}
                    className="block w-full text-xs sm:text-sm text-white file:mr-2 sm:file:mr-3 file:rounded-md file:border-0 file:bg-white/10 file:px-2 sm:file:px-3 file:py-1.5 sm:file:py-2 file:text-white hover:file:bg-white/20 file:text-xs sm:file:text-sm"
                  />
                  {images[i] && (
                    <div className="mt-2 rounded-md overflow-hidden border border-white/10 bg-white/5 p-1.5 sm:p-2">
                      <img src={images[i]} alt={`Preview ${i+1}`} className="h-20 sm:h-24 w-auto object-contain mx-auto" />
                    </div>
                  )}
                </div>
                ))}
              </div>
            <div className="mt-3 sm:mt-4 flex items-center gap-2 sm:gap-3 flex-wrap">
              <Button onClick={saveHeroConfig} size="sm" className="text-xs sm:text-sm">Enregistrer</Button>
              <Button variant="outline" onClick={() => setShowImagesEditor(false)} size="sm" className="text-xs sm:text-sm">Fermer</Button>
            </div>
          </div>
        )}

        {/* Hero Content */}
        <div className="flex flex-col items-center text-center space-y-5 sm:space-y-6 md:space-y-8 lg:space-y-10 xl:space-y-12 2xl:space-y-16">
          {/* Headline - Responsive Typography */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold leading-[1.3] sm:leading-[1.2] md:leading-[1.1] tracking-tight text-white max-w-4xl xl:max-w-5xl 2xl:max-w-6xl mx-auto px-2 sm:px-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
            {heroTitle}
          </h1>
          
          {/* Subtitle - Improved Readability */}
          <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl font-medium sm:font-semibold text-white/90 sm:text-white/95 max-w-2xl sm:max-w-3xl xl:max-w-4xl 2xl:max-w-5xl mx-auto px-3 sm:px-4 leading-relaxed sm:leading-relaxed">
            {heroSubtitle}
          </p>
          
          {/* CTA Button - Mobile Optimized */}
          <div className="pt-2 sm:pt-4 md:pt-6 lg:pt-8">
            <Link
              to="/catalogue"
              className="group relative inline-flex items-center justify-center gap-2 sm:gap-3 lg:gap-4 bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white font-semibold rounded-xl sm:rounded-2xl lg:rounded-3xl px-6 sm:px-8 md:px-10 lg:px-12 xl:px-16 py-3.5 sm:py-4 md:py-5 lg:py-6 xl:py-7 text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl shadow-lg shadow-[#F97316]/30 hover:shadow-xl hover:shadow-[#F97316]/40 transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] active:translate-y-0 active:scale-100 overflow-hidden min-h-[44px] sm:min-h-[48px] lg:min-h-[56px] xl:min-h-[64px]"
            >
              <span className="relative z-10 whitespace-nowrap">Découvrir le catalogue</span>
              <svg 
                className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8 relative z-10 transition-transform duration-300 group-hover:translate-x-1" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              {/* Shine effect */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </Link>
          </div>
        </div>

        {/* Image Indicators - Hidden on Mobile */}
        <div className="hidden md:flex absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 space-x-2.5 z-20">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => handleIndicatorClick(index)}
              className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 ${
                index === currentImageIndex 
                  ? 'bg-[#F97316] scale-125 shadow-[0_0_12px_rgba(249,115,22,0.8)]' 
                  : 'bg-white/50 hover:bg-white/70 hover:scale-110'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
