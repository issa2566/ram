import { Link } from "react-router-dom";
import { useState } from "react";

const BrandsSection = () => {
  const [imageError, setImageError] = useState(false);

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-20 xl:py-28 2xl:py-32 bg-gradient-to-b from-white via-orange-50/10 to-white relative overflow-hidden">
      {/* Ultra-luxury texture overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(249,115,22,0.03)_0%,transparent_70%)] pointer-events-none" />
      
      <div className="w-full max-w-[1400px] lg:max-w-7xl xl:max-w-8xl mx-auto px-4 sm:px-6 md:px-10 lg:px-12 xl:px-16 relative z-10">
        
        {/* Title - Ultra-Luxury Styling Desktop */}
        <h2 className="text-[36px] md:text-[42px] lg:text-[48px] xl:text-[56px] 2xl:text-[64px] font-[700] text-center mb-12 md:mb-16 lg:mb-20 xl:mb-24 2xl:mb-28 text-[#F97316] leading-[1.1] tracking-[-0.02em] luxury-animate-fade-in-up">
          NOS MARQUES DISPONIBLES
        </h2>

        {/* Brand Image - Centered with Premium Styling */}
        <div className="flex justify-center items-center mb-8 sm:mb-10 md:mb-12 lg:mb-16 xl:mb-20">
          <div className="relative w-full max-w-[90%] sm:max-w-[80%] md:max-w-[70%] lg:max-w-[60%] xl:max-w-[55%] 2xl:max-w-[50%]">
            {!imageError ? (
              <img
                src="/pp.jpg"
                alt="Nos marques disponibles"
                className="w-full h-auto object-contain rounded-3xl border-4 border-white/40 lg:border-[#F97316]/50 shadow-[var(--shadow-2xl)] luxury-transition-normal luxury-hover-scale luxury-hover-glow"
                onError={(e) => {
                  setImageError(true);
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
                style={{ imageRendering: 'crisp-edges' }}
              />
            ) : (
              <div className="w-full aspect-video bg-gradient-to-br from-[#F97316]/20 to-[#ea580c]/10 rounded-2xl border-4 border-[#F97316]/30 flex items-center justify-center text-[#F97316] font-bold text-xl sm:text-2xl md:text-3xl lg:text-4xl shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
                Image non disponible
              </div>
            )}
          </div>
        </div>

        {/* CTA Button - Consistent with Hero Section */}
        <div className="text-center">
          <Link 
            to="/catalogue"
            className="group relative inline-flex items-center justify-center gap-4 luxury-gradient-primary text-white font-semibold rounded-2xl px-10 md:px-12 lg:px-16 py-5 md:py-6 lg:py-7 text-lg md:text-xl lg:text-2xl shadow-[var(--shadow-button)] hover:shadow-[var(--shadow-button-hover)] luxury-transition-fast hover:-translate-y-1 hover:scale-[1.02] active:translate-y-0 active:scale-100 overflow-hidden"
          >
            <span className="relative z-10">VOIR TOUTES LES MARQUES</span>
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full luxury-transition-slower" />
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BrandsSection;