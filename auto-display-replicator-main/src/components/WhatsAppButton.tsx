import React from 'react';
import { MessageCircle } from 'lucide-react';

const WhatsAppButton = () => {
  // رقم الواتساب - يمكن تغييره حسب الحاجة
  const phoneNumber = '21623167813'; // رقم الواتساب الخاص بك
  const message = 'Bonjour! Je suis intéressé par vos produits.';
  
  const handleWhatsAppClick = () => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <>
      {/* WhatsApp Floating Button */}
      <button
        onClick={handleWhatsAppClick}
        className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-2xl transition-all duration-300 hover:scale-110 group"
        aria-label="Contact us on WhatsApp"
        title="Contactez-nous sur WhatsApp"
      >
        {/* WhatsApp Icon */}
        <MessageCircle className="w-7 h-7" />
        
        {/* Notification Badge */}
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          1
        </span>
        
        {/* Tooltip */}
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          Contactez-nous sur WhatsApp
        </span>
      </button>
    </>
  );
};

export default WhatsAppButton;

