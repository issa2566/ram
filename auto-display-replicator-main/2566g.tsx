/**
 * Desktop Header Component - Premium Luxury Design
 * 
 * هذا الملف يحتوي على جميع الأكواد المكونة للهيدر على الديسكتوب
 * Premium Luxury Automotive E-commerce Header
 * 
 * @component DesktopHeader
 */

import React from "react";
import { Search, ChevronDown, Heart, ShoppingCart, User, Menu, MessageCircle, Settings, Filter, Droplets, AirVent, Wind as WindIcon, Fuel, FileText, Tag, LogOut, Home } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

/**
 * Desktop Header JSX Code
 * 
 * جميع الأكواد الخاصة بالهيدر على الديسكتوب (lg: breakpoint فما فوق)
 */
export const DesktopHeaderCode = ({
  // Props needed for the header
  user,
  isScrolled,
  scrollProgress,
  filtresDropdownOpen,
  setFiltresDropdownOpen,
  openFiltres,
  closeFiltres,
  customFilters,
  deletedFilters,
  filterNames,
  customLinks,
  setMenuOpen,
  handleLogout,
}: {
  user: any | null;
  isScrolled: boolean;
  scrollProgress: number;
  filtresDropdownOpen: boolean;
  setFiltresDropdownOpen: (open: boolean) => void;
  openFiltres: () => void;
  closeFiltres: () => void;
  customFilters: any[];
  deletedFilters: string[];
  filterNames: Record<string, string>;
  customLinks: any[];
  setMenuOpen: (open: boolean) => void;
  handleLogout: () => void;
}) => {
  return (
    <>
      {/* 🖥️ Desktop Header - Premium Luxury Automotive Style */}
      <header 
        className={`hidden lg:block sticky top-0 left-0 right-0 z-50 text-white border-b transition-all duration-500 ease-out min-h-[clamp(80px,7vw,140px)] ${
          isScrolled 
            ? 'border-orange-500/30 shadow-[0_20px_60px_rgba(0,0,0,0.8)]' 
            : 'border-orange-500/10 shadow-[0_10px_40px_rgba(0,0,0,0.4)]'
        }`}
        style={{
          backgroundColor: `rgba(15, 23, 36, ${0.85 + (scrollProgress * 0.15)})`,
          backdropFilter: `blur(${12 + (scrollProgress * 28)}px)`,
        }}
      >
        {/* Main Container - Responsive Premium Desktop with Large Screen Support */}
        <div className="container max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-8 lg:px-14 xl:px-16 2xl:px-20">
          
          {/* 🔹 Row 1: Top Main Row - LOGO | MAIN MENU | SEARCH BAR | LOGIN/DASHBOARD */}
          <div 
            className="flex items-center justify-between gap-8 lg:gap-10 xl:gap-12 luxury-transition-normal h-full min-w-0"
            style={{
              paddingTop: `${2 - (scrollProgress * 0.75)}rem`,
              paddingBottom: `${2 - (scrollProgress * 0.75)}rem`,
            }}
          >
            
            {/* Logo Section - Left - Premium Luxury Brand Statement */}
            <div className="hidden lg:flex items-center gap-8 flex-shrink-0 relative group/logoSection">
              {/* Glass morphism background */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent rounded-3xl blur-2xl opacity-0 group-hover/logoSection:opacity-100 transition-opacity duration-500 -z-10" />
              
              {/* Logo container */}
              <Link to="/" className="relative z-10 flex flex-col items-center gap-2 transition-transform duration-500 ease-out hover:scale-105 group/logo" style={{
                transform: `scale(${1 - (scrollProgress * 0.1)})`,
              }}>
                {/* Glow effect */}
                <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-3xl opacity-0 group-hover/logo:opacity-100 transition-opacity duration-500 scale-150 -z-10" />
                
                {/* Logo image */}
                <img 
                  src="/ramm.png" 
                  alt="RAM Logo" 
                  className="w-auto h-auto max-h-[180px] object-contain filter drop-shadow-2xl brightness-110 transition-all duration-500 group-hover/logo:drop-shadow-[0_0_30px_rgba(249,115,22,0.6)] relative z-10"
                  loading="eager"
                  decoding="async"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/ram.png';
                  }}
                />
                
                {/* Brand tagline */}
                <div className="relative overflow-hidden">
                  <span className="text-sm font-serif tracking-wider bg-gradient-to-r from-amber-200 via-orange-300 to-amber-200 bg-clip-text text-transparent opacity-0 group-hover/logo:opacity-100 transition-opacity duration-500 whitespace-nowrap">
                    Excellence in Automotive Parts
                  </span>
                </div>
              </Link>
              
              {/* Decorative line */}
              <div className="hidden xl:block w-px h-24 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-500/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-400 to-transparent blur-sm" />
              </div>
            </div>
            
            {/* Main Navigation Menu - Center - Horizontal Layout */}
            <nav className="flex-1 flex items-center justify-center gap-6 lg:gap-8 xl:gap-10 min-w-0">
              
              {/* PIÈCES DÉTACHÉES Dropdown - Premium Luxury Style */}
              <div className="relative group filtres-dropdown">
                <button 
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setFiltresDropdownOpen(!filtresDropdownOpen);
                  }}
                  onMouseEnter={openFiltres}
                  aria-expanded={filtresDropdownOpen}
                  aria-controls="filtres-menu"
                  className="group relative overflow-hidden px-8 lg:px-10 xl:px-12 py-5 lg:py-6 rounded-2xl lg:rounded-3xl bg-gradient-to-br from-white/5 via-white/[0.02] to-transparent border border-white/10 backdrop-blur-md transition-all duration-500 ease-out hover:border-orange-500/50 hover:bg-gradient-to-br hover:from-orange-500/20 hover:via-orange-600/10 hover:to-transparent hover:shadow-[0_0_40px_rgba(249,115,22,0.3)] hover:scale-105 active:scale-95"
                >
                  {/* Animated gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/20 to-orange-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                  
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-all duration-700" />
                  
                  {/* Content */}
                  <div className="relative flex items-center gap-4 z-10">
                    {/* Icon with rotation */}
                    <Settings className="w-7 h-7 lg:w-8 lg:h-8 xl:w-9 xl:h-9 text-white/80 group-hover:text-orange-400 transition-all duration-300 group-hover:rotate-90 group-hover:scale-110" />
                    
                    {/* Text with gradient */}
                    <span className="text-lg lg:text-xl xl:text-2xl font-semibold text-white/90 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-orange-300 group-hover:to-orange-500 group-hover:bg-clip-text transition-all duration-300 tracking-wide whitespace-nowrap">
                      PIÈCES DÉTACHÉES
                    </span>
                    
                    {/* Chevron with bounce */}
                    <ChevronDown className={`w-6 h-6 text-white/60 group-hover:text-orange-400 transition-all duration-300 group-hover:translate-y-1 group-hover:scale-110 ${filtresDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>
                  
                  {/* Bottom glow line */}
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center" />
                </button>
                
                {/* Enhanced Dropdown Menu - Premium Luxury Mega Menu */}
                {filtresDropdownOpen && (
                  <div 
                    id="filtres-menu"
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-6 w-[95vw] max-w-[1600px] px-12 py-10 bg-[#0A0E14]/95 backdrop-blur-3xl rounded-[2rem] shadow-[0_25px_100px_rgba(0,0,0,0.5)] border-2 border-orange-500/30 z-50 overflow-hidden animate-slide-down"
                    style={{
                      background: 'linear-gradient(135deg, rgba(10,14,20,0.98) 0%, rgba(15,23,36,0.95) 100%)',
                    }}
                    onMouseEnter={openFiltres}
                    onMouseLeave={closeFiltres}
                  >
                    {/* Animated background pattern */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none">
                      <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23F97316' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                      }} />
                    </div>
                    
                    {/* Top decorative line */}
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-orange-500 to-transparent" />
                    
                    {/* Custom Filters Grid - Premium Luxury Grid */}
                    {customFilters.length > 0 && (
                      <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6 mb-8 pb-8 border-b border-[#F97316]/30">
                        {customFilters.map((filter, index) => (
                          <Link 
                            key={filter.id}
                            to={filter.url || '#'}
                            className="group relative flex flex-col items-center gap-4 p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-sm transition-all duration-500 ease-out hover:bg-gradient-to-br hover:from-orange-500/20 hover:to-orange-600/10 hover:border-orange-500/50 hover:shadow-[0_20px_60px_rgba(249,115,22,0.4)] hover:scale-110 hover:-translate-y-2 overflow-hidden"
                            style={{
                              animationDelay: `${index * 50}ms`,
                            }}
                            onClick={() => setFiltresDropdownOpen(false)}
                          >
                            {/* Hover gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-400/0 via-orange-500/0 to-orange-600/0 group-hover:from-orange-400/10 group-hover:via-orange-500/5 group-hover:to-orange-600/10 transition-all duration-500" />
                            
                            {/* Icon/Image container */}
                            <div className="relative">
                              {/* Glow ring */}
                              <div className="absolute inset-0 rounded-full bg-orange-500/20 scale-0 group-hover:scale-150 blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
                              
                              {/* Icon */}
                              {filter.image ? (
                                <div className="relative w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-orange-500/20 to-orange-600/10 group-hover:from-orange-500/30 group-hover:to-orange-600/20 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 ring-2 ring-orange-500/20 group-hover:ring-orange-500/50 shadow-lg group-hover:shadow-[0_0_30px_rgba(249,115,22,0.6)] overflow-hidden">
                                  <img 
                                    src={filter.image} 
                                    alt={filter.name}
                                    className="w-full h-full object-cover rounded-2xl"
                                    loading="lazy"
                                    decoding="async"
                                  />
                                </div>
                              ) : (
                                <div className="relative w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-orange-500/20 to-orange-600/10 group-hover:from-orange-500/30 group-hover:to-orange-600/20 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 ring-2 ring-orange-500/20 group-hover:ring-orange-500/50 shadow-lg group-hover:shadow-[0_0_30px_rgba(249,115,22,0.6)]">
                                  <Filter className="w-10 h-10 lg:w-12 lg:h-12 text-orange-400 group-hover:text-orange-300 transition-colors duration-300" />
                                </div>
                              )}
                            </div>
                            
                            {/* Label */}
                            <span className="relative text-sm lg:text-base font-semibold text-center text-white/80 group-hover:text-white transition-colors duration-300 px-2">
                              {filter.name}
                            </span>
                            
                            {/* Bottom accent line */}
                            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center" />
                          </Link>
                        ))}
                      </div>
                    )}
                    
                    {/* Default Filters Grid - Premium Luxury Grid */}
                    <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
                      {!deletedFilters.includes('Filtre à huile') && (
                        <Link 
                          to={`/filter/${Date.now()}`}
                          className="group relative flex flex-col items-center gap-4 p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-sm transition-all duration-500 ease-out hover:bg-gradient-to-br hover:from-orange-500/20 hover:to-orange-600/10 hover:border-orange-500/50 hover:shadow-[0_20px_60px_rgba(249,115,22,0.4)] hover:scale-110 hover:-translate-y-2 overflow-hidden"
                          onClick={() => setFiltresDropdownOpen(false)}
                        >
                          {/* Hover gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-br from-orange-400/0 via-orange-500/0 to-orange-600/0 group-hover:from-orange-400/10 group-hover:via-orange-500/5 group-hover:to-orange-600/10 transition-all duration-500" />
                          
                          {/* Icon container */}
                          <div className="relative">
                            <div className="absolute inset-0 rounded-full bg-orange-500/20 scale-0 group-hover:scale-150 blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
                            <div className="relative w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-orange-500/20 to-orange-600/10 group-hover:from-orange-500/30 group-hover:to-orange-600/20 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 ring-2 ring-orange-500/20 group-hover:ring-orange-500/50 shadow-lg group-hover:shadow-[0_0_30px_rgba(249,115,22,0.6)]">
                              <Droplets className="w-10 h-10 lg:w-12 lg:h-12 text-orange-400 group-hover:text-orange-300 transition-colors duration-300" />
                            </div>
                          </div>
                          
                          {/* Label */}
                          <span className="relative text-sm lg:text-base font-semibold text-center text-white/80 group-hover:text-white transition-colors duration-300 px-2">
                            {filterNames['Filtre à huile']}
                          </span>
                          
                          {/* Bottom accent line */}
                          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center" />
                        </Link>
                      )}
                      
                      {!deletedFilters.includes('Filtre à air') && (
                        <Link 
                          to={`/filter/${Date.now()}`}
                          className="group relative flex flex-col items-center gap-4 p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-sm transition-all duration-500 ease-out hover:bg-gradient-to-br hover:from-orange-500/20 hover:to-orange-600/10 hover:border-orange-500/50 hover:shadow-[0_20px_60px_rgba(249,115,22,0.4)] hover:scale-110 hover:-translate-y-2 overflow-hidden"
                          onClick={() => setFiltresDropdownOpen(false)}
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-orange-400/0 via-orange-500/0 to-orange-600/0 group-hover:from-orange-400/10 group-hover:via-orange-500/5 group-hover:to-orange-600/10 transition-all duration-500" />
                          <div className="relative">
                            <div className="absolute inset-0 rounded-full bg-orange-500/20 scale-0 group-hover:scale-150 blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
                            <div className="relative w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-orange-500/20 to-orange-600/10 group-hover:from-orange-500/30 group-hover:to-orange-600/20 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 ring-2 ring-orange-500/20 group-hover:ring-orange-500/50 shadow-lg group-hover:shadow-[0_0_30px_rgba(249,115,22,0.6)]">
                              <AirVent className="w-10 h-10 lg:w-12 lg:h-12 text-orange-400 group-hover:text-orange-300 transition-colors duration-300" />
                            </div>
                          </div>
                          <span className="relative text-sm lg:text-base font-semibold text-center text-white/80 group-hover:text-white transition-colors duration-300 px-2">
                            {filterNames['Filtre à air']}
                          </span>
                          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center" />
                        </Link>
                      )}
                      
                      {!deletedFilters.includes('Filtre d\'habitacle') && (
                        <Link 
                          to={`/filter/${Date.now()}`}
                          className="group relative flex flex-col items-center gap-4 p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-sm transition-all duration-500 ease-out hover:bg-gradient-to-br hover:from-orange-500/20 hover:to-orange-600/10 hover:border-orange-500/50 hover:shadow-[0_20px_60px_rgba(249,115,22,0.4)] hover:scale-110 hover:-translate-y-2 overflow-hidden"
                          onClick={() => setFiltresDropdownOpen(false)}
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-orange-400/0 via-orange-500/0 to-orange-600/0 group-hover:from-orange-400/10 group-hover:via-orange-500/5 group-hover:to-orange-600/10 transition-all duration-500" />
                          <div className="relative">
                            <div className="absolute inset-0 rounded-full bg-orange-500/20 scale-0 group-hover:scale-150 blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
                            <div className="relative w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-orange-500/20 to-orange-600/10 group-hover:from-orange-500/30 group-hover:to-orange-600/20 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 ring-2 ring-orange-500/20 group-hover:ring-orange-500/50 shadow-lg group-hover:shadow-[0_0_30px_rgba(249,115,22,0.6)]">
                              <WindIcon className="w-10 h-10 lg:w-12 lg:h-12 text-orange-400 group-hover:text-orange-300 transition-colors duration-300" />
                            </div>
                          </div>
                          <span className="relative text-sm lg:text-base font-semibold text-center text-white/80 group-hover:text-white transition-colors duration-300 px-2">
                            {filterNames['Filtre d\'habitacle']}
                          </span>
                          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center" />
                        </Link>
                      )}
                      
                      {!deletedFilters.includes('Filtre à carburant') && (
                        <Link 
                          to={`/filter/${Date.now()}`}
                          className="group relative flex flex-col items-center gap-4 p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-sm transition-all duration-500 ease-out hover:bg-gradient-to-br hover:from-orange-500/20 hover:to-orange-600/10 hover:border-orange-500/50 hover:shadow-[0_20px_60px_rgba(249,115,22,0.4)] hover:scale-110 hover:-translate-y-2 overflow-hidden"
                          onClick={() => setFiltresDropdownOpen(false)}
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-orange-400/0 via-orange-500/0 to-orange-600/0 group-hover:from-orange-400/10 group-hover:via-orange-500/5 group-hover:to-orange-600/10 transition-all duration-500" />
                          <div className="relative">
                            <div className="absolute inset-0 rounded-full bg-orange-500/20 scale-0 group-hover:scale-150 blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
                            <div className="relative w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-orange-500/20 to-orange-600/10 group-hover:from-orange-500/30 group-hover:to-orange-600/20 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 ring-2 ring-orange-500/20 group-hover:ring-orange-500/50 shadow-lg group-hover:shadow-[0_0_30px_rgba(249,115,22,0.6)]">
                              <Fuel className="w-10 h-10 lg:w-12 lg:h-12 text-orange-400 group-hover:text-orange-300 transition-colors duration-300" />
                            </div>
                          </div>
                          <span className="relative text-sm lg:text-base font-semibold text-center text-white/80 group-hover:text-white transition-colors duration-300 px-2">
                            {filterNames['Filtre à carburant']}
                          </span>
                          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center" />
                        </Link>
                      )}
                      
                      {/* Footer link */}
                      <div className="col-span-full mt-8 pt-6 border-t border-white/10">
                        <Link 
                          to="/filters-catalogue"
                          className="group flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500/10 to-orange-600/10 border border-orange-500/30 hover:from-orange-500/20 hover:to-orange-600/20 hover:border-orange-500/50 transition-all duration-300 hover:shadow-[0_10px_40px_rgba(249,115,22,0.3)]"
                          onClick={() => setFiltresDropdownOpen(false)}
                        >
                          <span className="text-lg font-semibold text-orange-400 group-hover:text-orange-300 transition-colors">
                            Voir toutes les catégories
                          </span>
                          <ChevronDown className="w-5 h-5 text-orange-400 rotate-[-90deg] group-hover:translate-x-2 transition-transform duration-300" />
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Menu Button - Premium Luxury Style */}
              <button 
                onClick={() => setMenuOpen(true)} 
                className="group relative overflow-hidden px-8 lg:px-10 xl:px-12 py-5 lg:py-6 rounded-2xl lg:rounded-3xl bg-gradient-to-br from-white/5 via-white/[0.02] to-transparent border border-white/10 backdrop-blur-md transition-all duration-500 ease-out hover:border-orange-500/50 hover:bg-gradient-to-br hover:from-orange-500/20 hover:via-orange-600/10 hover:to-transparent hover:shadow-[0_0_40px_rgba(249,115,22,0.3)] hover:scale-105 active:scale-95"
              >
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/20 to-orange-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                
                {/* Shimmer effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-all duration-700" />
                
                {/* Content */}
                <div className="relative flex items-center gap-4 z-10">
                  <Menu className="w-7 h-7 lg:w-8 lg:h-8 xl:w-9 xl:h-9 text-white/80 group-hover:text-orange-400 transition-all duration-300 group-hover:rotate-90 group-hover:scale-110" />
                  <span className="text-lg lg:text-xl xl:text-2xl font-semibold text-white/90 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-orange-300 group-hover:to-orange-500 group-hover:bg-clip-text transition-all duration-300 tracking-wide whitespace-nowrap">
                    Menu
                  </span>
                </div>
                
                {/* Bottom glow line */}
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center" />
              </button>
            </nav>

            {/* Search Bar - Premium Luxury Desktop Only */}
            <div className="hidden lg:flex flex-1 max-w-2xl mx-auto relative group/searchBar">
              {/* Glow effect on focus */}
              <div className="absolute inset-0 bg-orange-500/20 rounded-2xl blur-xl opacity-0 group-focus-within/searchBar:opacity-100 transition-opacity duration-500 scale-110 -z-10" />
              
              {/* Search container */}
              <div className="relative w-full">
                {/* Input wrapper */}
                <div className="relative flex items-center">
                  {/* Search icon */}
                  <div className="absolute left-6 z-10 text-white/40 group-focus-within/searchBar:text-orange-400 transition-colors duration-300">
                    <Search className="w-6 h-6" aria-hidden="true" />
                  </div>
                  
                  {/* Input field */}
                  <Input
                    type="text"
                    placeholder="Rechercher des pièces automobiles..."
                    className="w-full h-16 lg:h-18 xl:h-20 pl-16 pr-16 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border-2 border-white/10 rounded-2xl lg:rounded-3xl text-white text-base lg:text-lg placeholder:text-white/40 font-medium focus:bg-gradient-to-br focus:from-white/15 focus:to-white/10 focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/20 focus:outline-none transition-all duration-500 hover:border-white/20 hover:shadow-lg group-focus-within/searchBar:shadow-[0_20px_60px_rgba(249,115,22,0.3)]"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons - Right Side - Premium Desktop */}
            <div className="flex items-center gap-4 lg:gap-6 flex-shrink-0">
              
              {/* Panier Button - Premium Luxury Primary */}
              <Link 
                to="/cart"
                className="group relative flex items-center gap-4 px-8 py-5 rounded-2xl lg:rounded-3xl bg-gradient-to-br from-orange-500 to-orange-600 border-2 border-orange-400/50 shadow-[0_10px_40px_rgba(249,115,22,0.4)] hover:from-orange-600 hover:to-orange-700 hover:border-orange-300/50 hover:shadow-[0_20px_60px_rgba(249,115,22,0.6)] hover:scale-105 active:scale-95 transition-all duration-300 ease-out overflow-hidden"
              >
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                
                {/* Content */}
                <div className="relative z-10 flex items-center gap-4">
                  {/* Icon with badge */}
                  <div className="relative">
                    <ShoppingCart className="w-7 h-7 lg:w-8 lg:h-8 text-white group-hover:scale-110 transition-transform duration-300" />
                    {/* Cart count badge */}
                    <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-white text-orange-600 flex items-center justify-center text-xs font-bold">
                      3
                    </div>
                  </div>
                  
                  <span className="text-lg lg:text-xl font-semibold text-white tracking-wide whitespace-nowrap">
                    Panier
                  </span>
                </div>
                
                {/* Bottom glow */}
                <div className="absolute inset-0 rounded-2xl bg-orange-400/50 blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
              </Link>
              
              {/* Admin Dashboard Button - Premium Gold Accent */}
              {user && (user.role === 'admin' || user.is_admin === true) && (
                <Link 
                  to="/admin-dashboard" 
                  className="group relative flex items-center gap-4 px-8 py-5 rounded-2xl lg:rounded-3xl bg-gradient-to-br from-amber-600/20 via-orange-500/20 to-amber-600/20 border-2 border-amber-400/30 backdrop-blur-md hover:from-amber-500/30 hover:via-orange-500/30 hover:to-amber-500/30 hover:border-amber-400/50 hover:shadow-[0_20px_60px_rgba(217,119,6,0.5)] hover:scale-105 transition-all duration-300 ease-out overflow-hidden"
                >
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400/0 via-amber-400/20 to-amber-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  
                  {/* Content */}
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="relative">
                      <Settings className="w-7 h-7 lg:w-8 lg:h-8 text-amber-300 group-hover:rotate-90 group-hover:scale-110 transition-all duration-500" />
                      {/* Pulse indicator */}
                      <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 animate-ping" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400" />
                    </div>
                    
                    <span className="text-lg lg:text-xl font-semibold text-amber-200 group-hover:text-amber-100 tracking-wide whitespace-nowrap transition-colors">
                      Dashboard
                    </span>
                  </div>
                </Link>
              )}
              
              {/* Login/Logout Button - Premium Ghost Style */}
              {user ? (
                <button 
                  onClick={handleLogout} 
                  className="group relative flex items-center gap-4 px-8 py-5 rounded-2xl lg:rounded-3xl bg-gradient-to-br from-red-500/10 to-red-600/10 border-2 border-red-500/20 backdrop-blur-md hover:from-red-500/20 hover:to-red-600/20 hover:border-red-500/40 hover:shadow-[0_20px_60px_rgba(239,68,68,0.4)] hover:scale-105 transition-all duration-300 ease-out overflow-hidden"
                >
                  {/* Hover gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-red-400/0 via-red-500/10 to-red-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative z-10 flex items-center gap-4">
                    <LogOut className="w-7 h-7 lg:w-8 lg:h-8 text-red-400 group-hover:text-red-300 group-hover:scale-110 transition-all duration-300" />
                    <span className="text-lg lg:text-xl font-semibold text-red-400 group-hover:text-red-300 tracking-wide whitespace-nowrap transition-colors">
                      Déconnexion
                    </span>
                  </div>
                </button>
              ) : (
                <Link 
                  to="/login" 
                  className="group relative flex items-center gap-4 px-8 py-5 rounded-2xl lg:rounded-3xl bg-gradient-to-br from-white/10 to-white/5 border-2 border-white/20 backdrop-blur-md hover:from-orange-500/20 hover:to-orange-600/20 hover:border-orange-500/40 hover:shadow-[0_20px_60px_rgba(249,115,22,0.4)] hover:scale-105 transition-all duration-300 ease-out overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400/0 via-orange-500/10 to-orange-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative z-10 flex items-center gap-4">
                    <User className="w-7 h-7 lg:w-8 lg:h-8 text-white/80 group-hover:text-orange-400 group-hover:scale-110 transition-all duration-300" />
                    <span className="text-lg lg:text-xl font-semibold text-white/90 group-hover:text-orange-400 tracking-wide whitespace-nowrap transition-colors">
                      Connexion
                    </span>
                  </div>
                </Link>
              )}
            </div>
          </div>
          
          {/* 🔹 Row 2: Links Bar - Premium Luxury Quick Navigation */}
          <div className="hidden lg:block border-t border-white/5 relative">
            {/* Gradient border top */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
            
            {/* Container */}
            <div className="container mx-auto px-8 lg:px-14 xl:px-16 2xl:px-20 py-6">
              {/* Links wrapper */}
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {/* Accueil */}
                <Link 
                  to="/"
                  className="group relative flex items-center gap-3 px-5 py-3 rounded-xl bg-white/0 hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-300 ease-out overflow-hidden"
                >
                  {/* Hover background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/10 to-orange-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Content */}
                  <div className="relative z-10 flex items-center gap-3">
                    <Home className="w-5 h-5 text-white/60 group-hover:text-orange-400 transition-all duration-300 group-hover:scale-110" />
                    <span className="text-base font-medium text-white/70 group-hover:text-white transition-colors duration-300 whitespace-nowrap">
                      Accueil
                    </span>
                  </div>
                  
                  {/* Bottom accent */}
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
                </Link>
                
                {/* Divider */}
                <div className="w-px h-6 bg-gradient-to-b from-transparent via-white/10 to-transparent" />
                
                {/* Catalogue */}
                <Link 
                  to="/catalogue"
                  className="group relative flex items-center gap-3 px-5 py-3 rounded-xl bg-white/0 hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-300 ease-out overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/10 to-orange-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative z-10 flex items-center gap-3">
                    <FileText className="w-5 h-5 text-white/60 group-hover:text-orange-400 transition-all duration-300 group-hover:scale-110" />
                    <span className="text-base font-medium text-white/70 group-hover:text-white transition-colors duration-300 whitespace-nowrap">
                      Catalogue
                    </span>
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
                </Link>
                
                <div className="w-px h-6 bg-gradient-to-b from-transparent via-white/10 to-transparent" />
                
                {/* Promotions - Special Badge */}
                <Link 
                  to="#promotions"
                  className="group relative flex items-center gap-3 px-5 py-3 rounded-xl bg-white/0 hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-300 ease-out overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/10 to-orange-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative z-10 flex items-center gap-3">
                    <div className="relative">
                      <Tag className="w-5 h-5 text-white/60 group-hover:text-orange-400 transition-all duration-300 group-hover:scale-110" />
                      {/* Sale badge */}
                      <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-ping" />
                      <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500" />
                    </div>
                    <span className="text-base font-medium text-white/70 group-hover:text-white transition-colors duration-300 whitespace-nowrap">
                      Promotions
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold animate-pulse">
                      HOT
                    </span>
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
                </Link>
                
                <div className="w-px h-6 bg-gradient-to-b from-transparent via-white/10 to-transparent" />
                
                {/* Favoris */}
                <button 
                  className="group relative flex items-center gap-3 px-5 py-3 rounded-xl bg-white/0 hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-300 ease-out overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/10 to-orange-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative z-10 flex items-center gap-3">
                    <Heart className="w-5 h-5 text-white/60 group-hover:text-red-400 group-hover:fill-red-400 transition-all duration-300 group-hover:scale-110" />
                    <span className="text-base font-medium text-white/70 group-hover:text-white transition-colors duration-300 whitespace-nowrap">
                      Favoris
                    </span>
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
                </button>
                
                <div className="w-px h-6 bg-gradient-to-b from-transparent via-white/10 to-transparent" />
                
                {/* Contact */}
                <Link 
                  to="#contact"
                  className="group relative flex items-center gap-3 px-5 py-3 rounded-xl bg-white/0 hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-300 ease-out overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/10 to-orange-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative z-10 flex items-center gap-3">
                    <MessageCircle className="w-5 h-5 text-white/60 group-hover:text-orange-400 transition-all duration-300 group-hover:scale-110" />
                    <span className="text-base font-medium text-white/70 group-hover:text-white transition-colors duration-300 whitespace-nowrap">
                      Contact
                    </span>
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
                </Link>
                
                {/* Custom Links - Dynamic */}
                {customLinks.map((link) => (
                  <React.Fragment key={link.id}>
                    <div className="w-px h-6 bg-gradient-to-b from-transparent via-white/10 to-transparent" />
                    
                    <Link
                      to={link.url || '#'}
                      className="group relative flex items-center gap-3 px-5 py-3 rounded-xl bg-white/0 hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-300 ease-out overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/10 to-orange-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      <div className="relative z-10 flex items-center gap-3">
                        {link.image ? (
                          <div className="w-5 h-5 rounded-full overflow-hidden ring-2 ring-white/10 group-hover:ring-orange-400 transition-all">
                            <img 
                              src={link.image} 
                              alt={link.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        ) : (
                          <FileText className="w-5 h-5 text-white/60 group-hover:text-orange-400 transition-all duration-300 group-hover:scale-110" />
                        )}
                        <span className="text-base font-medium text-white/70 group-hover:text-white transition-colors duration-300 whitespace-nowrap">
                          {link.name}
                        </span>
                      </div>
                      
                      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
                    </Link>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Animated progress bar at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500 transition-all duration-300"
            style={{
              width: `${scrollProgress * 100}%`,
              boxShadow: '0 0 20px rgba(249, 115, 22, 0.8)',
            }}
          />
        </div>
      </header>
    </>
  );
};

/**
 * ملاحظات الاستخدام:
 * 
 * هذا الملف يحتوي على جميع الأكواد الخاصة بالهيدر على الديسكتوب فقط.
 * 
 * المكونات المطلوبة:
 * - React
 * - lucide-react (للأيقونات)
 * - react-router-dom (للروابط)
 * - shadcn/ui Input component
 * 
 * الـ Props المطلوبة:
 * - user: معلومات المستخدم
 * - isScrolled: حالة التمرير
 * - scrollProgress: تقدم التمرير (0-1)
 * - filtresDropdownOpen: حالة القائمة المنسدلة
 * - setFiltresDropdownOpen: دالة لتغيير حالة القائمة
 * - openFiltres: دالة لفتح القائمة
 * - closeFiltres: دالة لإغلاق القائمة
 * - customFilters: مصفوفة الفلاتر المخصصة
 * - deletedFilters: مصفوفة الفلاتر المحذوفة
 * - filterNames: أسماء الفلاتر
 * - customLinks: الروابط المخصصة
 * - setMenuOpen: دالة لفتح القائمة الجانبية
 * - handleLogout: دالة تسجيل الخروج
 * 
 * المميزات:
 * - تصميم فاخر مع glassmorphism
 * - تأثيرات hover متقدمة
 * - Animations سلسة
 * - Responsive للشاشات الكبيرة فقط (lg: فما فوق)
 * - Scroll behavior متقدم
 * - Premium color palette
 */

