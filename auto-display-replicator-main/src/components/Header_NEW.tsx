import React, { useState, useEffect } from 'react';
import DesktopHeader from './Header/DesktopHeader';
import MobileHeader from './Header/MobileHeader';
import { useIsMobile } from '@/hooks/use-mobile';

/**
 * Professional Header Component for Rannen Auto Motors
 * 
 * Features:
 * - Responsive design (Desktop, Tablet, Mobile)
 * - Top bar with contact information
 * - Logo section with gradient
 * - Advanced search bar
 * - Navigation menu with dropdowns
 * - User menu with cart counter
 * - Mobile sidebar navigation
 * - Smooth scroll effects
 * 
 * @component
 * @example
 * ```tsx
 * <Header />
 * ```
 */
const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when switching to desktop
  useEffect(() => {
    if (!isMobile) {
      setMenuOpen(false);
    }
  }, [isMobile]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [menuOpen]);

  return (
    <div className="sticky top-0 z-50">
      <DesktopHeader isScrolled={isScrolled} />
      <MobileHeader 
        isScrolled={isScrolled} 
        menuOpen={menuOpen} 
        setMenuOpen={setMenuOpen} 
      />
    </div>
  );
};

export default Header;

