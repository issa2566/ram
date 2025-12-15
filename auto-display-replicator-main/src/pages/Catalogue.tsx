import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CatalogueCarsSection } from "@/features/catalogue";

const Catalogue = () => {
  return (
    <div className="min-h-screen bg-[#F9FAFB] overflow-x-hidden">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white shadow-sm">
        <Header />
      </div>

      {/* Main Content */}
      <main>
        <CatalogueCarsSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Catalogue;
