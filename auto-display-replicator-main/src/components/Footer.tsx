import { Phone, Mail, MapPin, Clock, Shield, Truck, Users } from "lucide-react";
import { FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa";

const Footer = () => {
  const services = [{
    icon: Shield,
    title: "Qualité Originale",
    description: "Pièces certifiées"
  }, {
    icon: Truck,
    title: "Livraison à Domicile",
    description: "Service rapide"
  }, {
    icon: Users,
    title: "Les Meilleurs Prix",
    description: "Prix compétitifs"
  }];

  return (
    <footer>
      {/* ✅ قسم الخدمات - Ultra-Luxury Premium */}
      <section className="luxury-gradient-primary text-white luxury-section-premium">
        {/* Mobile/Tablet View - Keep original design */}
        <div className="lg:hidden container mx-auto px-2 sm:px-3 md:px-4">
          <div className="flex justify-center items-center gap-2 sm:gap-3 md:gap-4">
            {services.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <div key={index} className="text-center p-0.5 sm:p-1 md:p-2 transition-transform duration-300 hover:scale-110">
                  <IconComponent className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 mx-auto mb-0.5 sm:mb-1 md:mb-2 transition-transform duration-300 hover:scale-110" />
                  <h3 className="font-semibold text-[8px] xs:text-[9px] sm:text-xs md:text-sm mb-0 sm:mb-0.5 leading-tight">{service.title}</h3>
                  <p className="text-[7px] xs:text-[8px] sm:text-[10px] md:text-xs opacity-90 leading-tight">{service.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* PC View - Compact and Optimized */}
        <div className="hidden lg:block">
          <div className="max-w-[1000px] xl:max-w-[1100px] mx-auto px-8 xl:px-12">
            <div className="flex justify-center items-center gap-8 xl:gap-12">
              {services.map((service, index) => {
                const IconComponent = service.icon;
                return (
                  <div key={index} className="text-center flex-1 max-w-[280px] xl:max-w-[300px] transition-transform duration-300 hover:scale-105">
                    <IconComponent className="h-10 w-10 xl:h-12 xl:w-12 mx-auto mb-3 xl:mb-4 transition-transform duration-300 hover:scale-110" />
                    <h3 className="font-semibold text-base xl:text-lg mb-2 leading-tight">{service.title}</h3>
                    <p className="text-sm xl:text-base opacity-90 leading-tight">{service.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ✅ Footer محسّن احترافي - Ultra-Luxury Corporate Style */}
      <section className="text-white py-16 sm:py-20 md:py-16 lg:py-20 xl:py-24 2xl:py-28 bg-gradient-to-b from-[#0F1724] to-[#000000]">
        <div className="w-full max-w-[1400px] lg:max-w-7xl xl:max-w-8xl mx-auto px-4 sm:px-6 md:px-10 lg:px-12 xl:px-16">
          {/* ✅ Grid من 4 أعمدة - Clean Desktop Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 items-start gap-y-4 gap-x-8 md:gap-x-10 lg:gap-x-14 xl:gap-x-20 mb-8 lg:mb-10 xl:mb-12">
            
            {/* ✅ العمود 1: اللوغو والمعلومات - Clean Desktop Styling */}
            <div className="lg:pr-2 flex flex-col items-start gap-2 lg:gap-3 lg:-mt-8 xl:-mt-14 2xl:-mt-16 lg:-ml-4 xl:-ml-6 2xl:-ml-8">
                <img 
                  src="/ram.png" 
                  alt="RAM Logo" 
                className="w-32 h-32 lg:w-40 lg:h-40 xl:w-48 xl:h-48 object-contain rounded-2xl luxury-transition luxury-hover-scale luxury-shadow-image"
                />
              <h3 className="luxury-heading text-2xl lg:text-3xl xl:text-3xl 2xl:text-4xl leading-tight text-white">
                  Rannen auto motors
                </h3>
              <p className="text-sm lg:text-base leading-relaxed max-w-xs text-white/80 font-medium">
                Votre spécialiste en pièces détachées et accessoires automobiles depuis plus de 20 ans. Qualité garantie, service fiable.
              </p>
            </div>

            {/* ✅ العمود 2: الروابط - Elegant Desktop Hover Effects */}
            <div>
              <h3 className="luxury-subheading text-xl lg:text-xl xl:text-2xl 2xl:text-2xl mb-6 lg:mb-7 text-white">
                Navigation
              </h3>
              <ul className="space-y-3 lg:space-y-4">
                <li>
                  <a 
                    href="/" 
                    className="block text-sm lg:text-base text-white/80 hover:text-[#F97316] luxury-transition font-medium"
                  >
                    Accueil
                  </a>
                </li>
                <li>
                  <a 
                    href="/products" 
                    className="block text-sm lg:text-base transition-colors duration-200 hover:text-[#ff6600]"
                    style={{ color: '#f5f5f5' }}
                  >
                    Catalogue
                  </a>
                </li>
                <li>
                  <a 
                    href="/favorites" 
                    className="block text-sm lg:text-base transition-colors duration-200 hover:text-[#ff6600]"
                    style={{ color: '#f5f5f5' }}
                  >
                    Favoris
                  </a>
                </li>
                <li>
                  <a 
                    href="/contact" 
                    className="block text-sm lg:text-base transition-colors duration-200 hover:text-[#ff6600]"
                    style={{ color: '#f5f5f5' }}
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* ✅ العمود 3: معلومات الاتصال وأيقونات التواصل الاجتماعي - Clean Desktop Styling */}
            <div>
              <h3 className="font-semibold text-lg lg:text-xl xl:text-xl 2xl:text-2xl mb-4 lg:mb-5" style={{ color: '#f5f5f5' }}>
                Contactez-Nous
              </h3>
              <div className="space-y-3.5 lg:space-y-4 mb-6 lg:mb-7">
                {/* رقم الهاتف */}
                <div className="flex items-center space-x-3 group">
                  <Phone className="h-5 w-5 lg:h-6 lg:w-6 flex-shrink-0 transition-colors duration-200 group-hover:text-[#ff6600]" style={{ color: '#ff6600' }} />
                  <span className="text-sm lg:text-base transition-colors duration-200 group-hover:text-[#ff6600]" style={{ color: '#f5f5f5' }}>
                    +21624 167 004
                  </span>
                </div>
                
                {/* البريد الإلكتروني */}
                <div className="flex items-center space-x-3 group">
                  <Mail className="h-5 w-5 lg:h-6 lg:w-6 flex-shrink-0 transition-colors duration-200 group-hover:text-[#ff6600]" style={{ color: '#ff6600' }} />
                  <span className="text-sm lg:text-base break-words transition-colors duration-200 group-hover:text-[#ff6600]" style={{ color: '#f5f5f5' }}>
                    rannenautomotors@gmail.com
                  </span>
                </div>
                
                {/* العنوان */}
                <div className="flex items-start space-x-3 group">
                  <MapPin className="h-5 w-5 lg:h-6 lg:w-6 mt-0.5 flex-shrink-0 transition-colors duration-200 group-hover:text-[#ff6600]" style={{ color: '#ff6600' }} />
                  <span className="text-sm lg:text-base leading-relaxed transition-colors duration-200 group-hover:text-[#ff6600]" style={{ color: '#f5f5f5' }}>
                    AV YAHIA IBN OMAR CITEE HAJJEM, Kairouan, Tunisia
                  </span>
                </div>
              </div>
              
              {/* ✅ أيقونات التواصل الاجتماعي - Clean Desktop Styling */}
              <div>
                <h4 className="font-semibold text-base lg:text-lg mb-3 lg:mb-4" style={{ color: '#f5f5f5' }}>
                  Suivez-Nous
                </h4>
                <div className="flex space-x-3">
                  {/* Facebook */}
                  <a 
                    href="https://www.facebook.com/share/1JA2Mo6QWx/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 lg:w-11 lg:h-11 xl:w-12 xl:h-12 rounded-full bg-gray-900/60 hover:bg-gray-900/70 flex items-center justify-center transition-all duration-200 hover:scale-105 hover:opacity-90"
                    aria-label="Facebook"
                  >
                    <FaFacebook className="w-8 h-8" style={{ color: '#1877F2' }} />
                  </a>
                  
                  {/* Instagram */}
                  <a 
                    href="https://www.instagram.com/rannenautomotors?igsh=MTZiODFra3JrN3ViNQ==" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 lg:w-11 lg:h-11 xl:w-12 xl:h-12 rounded-full bg-gray-900/60 hover:bg-gray-900/70 flex items-center justify-center transition-all duration-200 hover:scale-105 hover:opacity-90"
                    aria-label="Instagram"
                  >
                    <FaInstagram className="w-8 h-8" style={{ color: '#E4405F' }} />
                  </a>
                  
                  {/* WhatsApp */}
                  <a 
                    href="https://wa.me/21623167813" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 lg:w-11 lg:h-11 xl:w-12 xl:h-12 rounded-full bg-gray-900/60 hover:bg-gray-900/70 flex items-center justify-center transition-all duration-200 hover:scale-105 hover:opacity-90"
                    aria-label="WhatsApp"
                  >
                    <FaWhatsapp className="w-8 h-8" style={{ color: '#25D366' }} />
                  </a>
                </div>
              </div>
            </div>

            {/* ✅ العمود 4: Google Map - Clean Desktop Styling */}
            <div>
              <h3 className="font-semibold text-lg lg:text-xl xl:text-xl 2xl:text-2xl mb-4 lg:mb-5" style={{ color: '#f5f5f5' }}>
                Notre Localisation
              </h3>
              <div className="w-full h-[220px] lg:h-[280px] xl:h-[300px] 2xl:h-[320px] rounded-lg lg:rounded-xl overflow-hidden shadow-md lg:shadow-lg hover:shadow-xl transition-shadow duration-200 border border-white/10">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3271.2345678901234!2d10.0956!3d35.6769!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12f8b4c8c8c8c8c8%3A0x8c8c8c8c8c8c8c8c!2sKairouan%2C%20Tunisia!5e0!3m2!1sen!2stn!4v1640995200000!5m2!1sen!2stn"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Rannen Auto Motors Location - Kairouan, Tunisia"
                  className="w-full h-full"
                ></iframe>
              </div>
            </div>
          </div>

          {/* ✅ خط خفيف في الأسفل مع حقوق النشر - Clean Desktop Styling */}
          <div className="border-t border-gray-700/50 lg:border-gray-600/40 pt-6 lg:pt-8 mt-8 lg:mt-10 text-center">
            <p className="text-sm lg:text-base transition-colors duration-200 hover:text-[#ff6600]" style={{ color: '#f5f5f5', opacity: 0.7 }}>
              &copy; 2025 RAM Auto Motors. Tous droits réservés.
            </p>
          </div>
        </div>
      </section>
    </footer>
  );
};

export default Footer;
