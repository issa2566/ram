import { useEffect, useState } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import BrandsSection from "@/components/BrandsSection";
import PromotionsSection from "@/components/PromotionsSection";
import ProductCategoriesSection from "@/components/ProductCategoriesSection";
import Footer from "@/components/Footer";

const Index = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  return (
    <div className="min-h-screen bg-background no-scroll-x">
      <Header />
      
      {/* Welcome Message */}
      {user && (
        <div className="bg-orange-500 text-white py-3 px-4 md:py-4 md:px-6 lg:py-5 lg:px-8 text-center">
          <p className="text-responsive-sm md:text-base lg:text-lg xl:text-xl font-medium">
            Welcome back, {user.username}! You are logged in as {user.role}.
          </p>
        </div>
      )}
      
      <HeroSection />
      <BrandsSection />
      <ProductCategoriesSection />
      <PromotionsSection />
      <Footer />
    </div>
  );
};

export default Index;
