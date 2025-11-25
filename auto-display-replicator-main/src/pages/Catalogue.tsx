import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getCarBrands, createCarBrand, deleteCarBrandByName, CarBrandData, getProducts, ProductData } from "@/api/database";
import { useSearch } from "@/contexts/SearchContext";
import { Edit, Save, X } from "lucide-react";

const Catalogue = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { searchQuery, searchResults, performSearch } = useSearch();
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedCar, setSelectedCar] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [deleteMode, setDeleteMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showProductResults, setShowProductResults] = useState<boolean>(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  // Admin add-card modal state
  const [addOpen, setAddOpen] = useState<boolean>(false);
  const [newBrandName, setNewBrandName] = useState<string>('');
  const [newModel, setNewModel] = useState<string>('');
  const [newBrandImage, setNewBrandImage] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // State for editing brand text fields
  const [editingBrand, setEditingBrand] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<'model' | 'description' | null>(null);
  const [editModelValue, setEditModelValue] = useState<string>('');
  const [editDescriptionValue, setEditDescriptionValue] = useState<string>('');

  // قاعدة بيانات السيارات المفصلة
  const carDatabase = {
    Audi: [
      { 
        id: 1, 
        name: "Audi R8 V10 Plus", 
        year: 2024, 
        price: "€215,000", 
        power: "620 CH", 
        acceleration: "3.2s", 
        speed: "331 km/h",
        consumption: "12.8 L/100km",
        image: "/cars/audi-r8.jpg", 
        type: "Supercar", 
        description: "Une supercar allemande alliant luxe et performances extrêmes",
        features: ["Quattro", "Carbon Package", "Bang & Olufsen", "Ceramic Brakes"],
        color: "Ara Blue Crystal"
      },
      { 
        id: 2, 
        name: "Audi e-tron GT", 
        year: 2024, 
        price: "€110,000", 
        power: "530 CH", 
        acceleration: "3.9s", 
        speed: "245 km/h",
        consumption: "Électrique",
        image: "/cars/audi-etron-gt.jpg", 
        type: "Électrique", 
        description: "La gran turismo électrique ultime signée Audi",
        features: ["Torque Vectoring", "800V Architecture", "Air Suspension", "22\" Wheels"],
        color: "Tactical Green"
      }
    ],
    BMW: [
      { 
        id: 1, 
        name: "BMW M8 Competition", 
        year: 2024, 
        price: "€165,000", 
        power: "625 CH", 
        acceleration: "3.2s", 
        speed: "305 km/h",
        consumption: "12.3 L/100km",
        image: "/cars/bmw-m8.jpg", 
        type: "Coupé", 
        description: "Le summum de la performance BMW dans un écrin de luxe",
        features: ["xDrive", "M Sport Exhaust", "Carbon Roof", "Laser Lights"],
        color: "São Paulo Yellow"
      },
      { 
        id: 2, 
        name: "BMW i7 xDrive60", 
        year: 2024, 
        price: "€135,000", 
        power: "544 CH", 
        acceleration: "4.5s", 
        speed: "240 km/h",
        consumption: "Électrique",
        image: "/cars/bmw-i7.jpg", 
        type: "Berline Électrique", 
        description: "La berline de luxe électrique qui redéfinit l'excellence",
        features: ["31\" Theater Screen", "Crystal Headlights", "Executive Lounge", "Bowers & Wilkins"],
        color: "Black Sapphire"
      }
    ],
    Mercedes: [
      { 
        id: 1, 
        name: "Mercedes-AMG GT 63 S", 
        year: 2024, 
        price: "€185,000", 
        power: "639 CH", 
        acceleration: "3.2s", 
        speed: "315 km/h",
        consumption: "13.2 L/100km",
        image: "/cars/mercedes-amg-gt.jpg", 
        type: "4-Portes Coupé", 
        description: "Le mariage parfait entre sportivité extrême et luxe quotidien",
        features: ["AMG Performance", "Rear-Wheel Steering", "Carbon Ceramic", "Race Mode"],
        color: "Selenite Grey Magno"
      },
      { 
        id: 2, 
        name: "Mercedes-Maybach S680", 
        year: 2024, 
        price: "€230,000", 
        power: "612 CH", 
        acceleration: "4.5s", 
        speed: "250 km/h",
        consumption: "14.3 L/100km",
        image: "/cars/mercedes-maybach.jpg", 
        type: "Berline Ultime", 
        description: "L'apogée du luxe automobile et du raffinement absolu",
        features: ["Maybach Interior", "V12 Biturbo", "Executive Seats", "Burmester 4D"],
        color: "Obsidian Black"
      }
    ],
    Porsche: [
      { 
        id: 1, 
        name: "Porsche 911 Turbo S", 
        year: 2024, 
        price: "€245,000", 
        power: "650 CH", 
        acceleration: "2.7s", 
        speed: "330 km/h",
        consumption: "11.5 L/100km",
        image: "/cars/porsche-911.jpg", 
        type: "Supercar", 
        description: "L'icône légendaire dans sa version la plus aboutie",
        features: ["PDK", "PASM", "Sport Chrono", "Carbon Package"],
        color: "Guards Red"
      }
    ]
  };

  const defaultBrands = [
    { name: "Audi", file: "Audi.svg", models: ["R8 V10 Plus", "e-tron GT", "RS7 Sportback"], description: "L'innovation au service du progrès" },
    { name: "BMW", file: "BMW.svg", models: ["M8 Competition", "i7 xDrive60", "X7 M60i"], description: "La joie de conduire ultime" },
    { name: "Mercedes", file: "Mercedes-Benz.svg", models: ["AMG GT 63 S", "Maybach S680", "G63 AMG"], description: "Le meilleur ou rien" },
    { name: "Porsche", file: "porsche.svg", models: ["911 Turbo S", "Taycan Turbo", "Cayenne Turbo GT"], description: "Rêve. Foi. Passion." },
    { name: "Lamborghini", file: "lamborghini.svg", models: ["Aventador SVJ", "Huracán STO", "Urus Performante"], description: "Suis ton instinct" },
    { name: "Ferrari", file: "ferrari.svg", models: ["SF90 Stradale", "Roma", "Purosangue"], description: "Un rêve italien" },
    { name: "Bentley", file: "bentley.svg", models: ["Continental GT", "Flying Spur", "Bentayga"], description: "Construire une voiture extraordinaire" },
    { name: "Rolls-Royce", file: "rolls-royce.svg", models: ["Phantom", "Ghost", "Cullinan"], description: "Rien ne pousse à l'ombre" }
  ];

  const [carBrands, setCarBrands] = useState<CarBrandData[]>(defaultBrands);

  // Load brands from database on mount
  useEffect(() => {
    const loadBrands = async () => {
      try {
        const saved = await getCarBrands();
        if (saved && saved.length > 0) {
          setCarBrands(saved);
        } else {
          // If no saved brands, use defaults and save them
          const defaultBrandsWithIds = defaultBrands.map((brand, index) => ({
            ...brand,
            id: `default-${index}`,
          }));
          setCarBrands(defaultBrandsWithIds);
          // Save defaults to database
          for (const brand of defaultBrandsWithIds) {
            try {
              await createCarBrand(brand);
            } catch (error) {
              console.error('Error saving default brand:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error loading brands:', error);
        // Fallback to localStorage
        try {
          const saved = localStorage.getItem('catalogue_brands');
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
              setCarBrands(parsed);
            }
          }
        } catch {}
      }
    };
    loadBrands();
  }, []);

  // تتبع السكرول وإخفاء الهيدر
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (currentScrollY / scrollHeight) * 100;
      
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    let admin = false;
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        const role = u?.role?.toLowerCase() || "";
        admin = role === "admin" || u?.is_admin === true || u?.isAdmin === true;
        console.log('🔍 User check:', { user: u, role, is_admin: u?.is_admin, isAdmin: u?.isAdmin, admin });
      } catch (e) {
        console.error('Error parsing user:', e);
      }
    } else {
      console.log('⚠️ No user found in localStorage');
    }
    setIsAdmin(admin);
    console.log('✅ isAdmin set to:', admin);
    
    // محاكاة تحميل البيانات
    setTimeout(() => setIsLoading(false), 3000);
  }, []);

  const showNotification = useCallback((message: string, type: string = 'info') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 5000);
  }, []);

  const handleBrandClick = (brand: string) => {
    setSelectedBrand(brand);
    showNotification(`🚀 Découverte de l'univers ${brand}`, 'info');
  };

  const handleCarClick = (car: any) => {
    setSelectedCar(car);
  };

  const closeModal = () => {
    setSelectedBrand(null);
    setSelectedCar(null);
  };

  // Check if there's a search query in URL
  useEffect(() => {
    const queryParam = searchParams.get('search');
    if (queryParam) {
      console.log('🔍 Catalogue: Found search query in URL:', queryParam);
      setSearchTerm(queryParam);
      performSearch(queryParam);
      setShowProductResults(true);
    } else {
      setShowProductResults(false);
    }
  }, [searchParams, performSearch]);

  const filteredBrands = carBrands.filter(brand =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewModels = () => {
    if (selectedBrand) {
      // placeholder for navigation
      setNotification({ show: true, message: `Ouverture des modèles: ${selectedBrand}`, type: 'info' });
      setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    }
  };

  // Compress image before storing
  const compressImage = (dataUrl: string, maxWidth: number = 800, maxHeight: number = 800, quality: number = 0.7): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        } else {
          resolve(dataUrl); // Fallback if canvas not supported
        }
      };
      img.onerror = () => resolve(dataUrl); // Fallback on error
      img.src = dataUrl;
    });
  };

  // Admin add-card helpers
  const handleBrandImageUpload = async (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = (e.target?.result as string) || '';
      if (dataUrl) {
        // Compress image before setting state
        try {
          const compressed = await compressImage(dataUrl, 600, 600, 0.6);
          setNewBrandImage(compressed);
        } catch (error) {
          console.error('Error compressing image:', error);
          setNewBrandImage(dataUrl); // Use original if compression fails
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const saveNewCard = async () => {
    if (!newBrandName.trim() || !newModel.trim() || !newBrandImage) {
      setNotification({ show: true, message: 'Veuillez renseigner tous les champs.', type: 'error' });
      setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
      return;
    }
    
    if (isSaving) return; // Prevent multiple clicks
    
    setIsSaving(true);
    
    try {
      // Compress image one more time before saving to ensure optimal size
      let finalImage = newBrandImage;
      if (newBrandImage.startsWith('data:image')) {
        try {
          finalImage = await compressImage(newBrandImage, 600, 600, 0.6);
          console.log('Image compressed for storage');
        } catch (error) {
          console.warn('Failed to compress image, using original:', error);
        }
      }
      
      const newBrand: CarBrandData = {
        name: newBrandName.trim(),
        file: finalImage,
        models: [newModel.trim()],
        description: ''
      };
      
      console.log('Saving brand:', { ...newBrand, file: finalImage.substring(0, 50) + '...' });
      
      // Save to database (will fallback to localStorage if server unavailable)
      const savedBrand = await createCarBrand(newBrand);
      
      console.log('Brand saved:', savedBrand);
      
      // Update local state
      setCarBrands((prev) => {
        const updated = [...prev, savedBrand];
        // localStorage is handled by createCarBrand function
        return updated;
      });
      
      setAddOpen(false);
      setNewBrandName('');
      setNewModel('');
      setNewBrandImage('');
      setNotification({ show: true, message: 'Marque ajoutée avec succès', type: 'success' });
      setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    } catch (error: any) {
      console.error('Error saving brand:', error);
      const errorMessage = error?.name === 'QuotaExceededError' 
        ? 'L\'espace de stockage est plein. Veuillez supprimer des marques anciennes ou vider le cache du navigateur.'
        : 'Erreur lors de l\'ajout de la marque. Vérifiez la console pour plus de détails.';
      setNotification({ show: true, message: errorMessage, type: 'error' });
      setTimeout(() => setNotification({ show: false, message: '', type: '' }), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveBrand = async (brandName: string) => {
    if (!confirm(`Supprimer la marque "${brandName}" ?`)) {
      return;
    }
    
    try {
      // Delete from database
      await deleteCarBrandByName(brandName);
      
      // Update local state
      setCarBrands((prev) => prev.filter(brand => brand.name !== brandName));
      
      showNotification(`Marque "${brandName}" supprimée avec succès.`, 'success');
    } catch (error) {
      console.error('Error deleting brand:', error);
      showNotification('Erreur lors de la suppression de la marque', 'error');
    }
  };

  // Functions for editing brand text fields
  const handleStartEdit = (brandName: string, field: 'model' | 'description') => {
    const brand = carBrands.find(b => b.name === brandName);
    if (brand) {
      setEditingBrand(brandName);
      setEditingField(field);
      if (field === 'model') {
        setEditModelValue(Array.isArray((brand as any).models) && (brand as any).models.length > 0 ? (brand as any).models[0] : '');
      } else {
        setEditDescriptionValue(brand.description || '');
      }
    }
  };

  const handleSaveEdit = async (brandName: string) => {
    if (!editingField || !editingBrand) return;
    
    try {
      const brand = carBrands.find(b => b.name === brandName);
      if (!brand) return;

      let updatedBrand: CarBrandData;
      
      if (editingField === 'model') {
        const models = Array.isArray((brand as any).models) ? [...(brand as any).models] : [];
        if (models.length > 0) {
          models[0] = editModelValue.trim();
        } else {
          models.push(editModelValue.trim());
        }
        updatedBrand = {
          ...brand,
          models: models as any
        };
      } else {
        updatedBrand = {
          ...brand,
          description: editDescriptionValue.trim()
        };
      }

      // Update in database
      await createCarBrand(updatedBrand);
      
      // Update local state
      setCarBrands((prev) => prev.map(b => b.name === brandName ? updatedBrand : b));
      
      // Reset editing state
      setEditingBrand(null);
      setEditingField(null);
      setEditModelValue('');
      setEditDescriptionValue('');
      
      showNotification('Modification enregistrée avec succès', 'success');
    } catch (error) {
      console.error('Error saving edit:', error);
      showNotification('Erreur lors de l\'enregistrement', 'error');
    }
  };

  const handleCancelEdit = () => {
    setEditingBrand(null);
    setEditingField(null);
    setEditModelValue('');
    setEditDescriptionValue('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white relative overflow-hidden">
      {/* شريط تقدم السكرول */}
      <div className="fixed top-0 left-0 w-full h-1 z-50">
        <div 
          className="h-full bg-gradient-to-r from-orange-500 to-red-600 transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* الهيدر المتحرك */}
      <div className="sticky top-0 z-50">
        <Header />
      </div>

      <main className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        {/* القسم الرئيسي */}
        <div className="text-center mb-20">
          <div className="relative inline-block mb-8">
            <div className="absolute -inset-4 bg-gradient-to-r from-orange-600 to-red-700 rounded-2xl blur-3xl opacity-30 animate-pulse"></div>
            <h1 className="relative text-5xl sm:text-6xl lg:text-7xl font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 mb-6 tracking-tight leading-tight">
              CATALOGUE EXCLUSIF
              <span className="block text-2xl sm:text-3xl text-orange-300/80 mt-4 font-light tracking-widest">
                L'ART DE L'AUTOMOBILE
              </span>
            </h1>
          </div>
          
          <p className="text-xl text-orange-200/80 max-w-3xl mx-auto leading-relaxed font-light tracking-wide">
            Découvrez notre collection de véhicules d'exception où le luxe rencontre la performance
          </p>
        </div>

        {/* شريط البحث */}
        <div className="max-w-2xl mx-auto mb-16">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl blur opacity-40 group-hover:opacity-60 transition duration-1000"></div>
            <input
              type="text"
              placeholder="🔍 Rechercher une marque de prestige..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="relative w-full px-8 py-5 bg-black/60 backdrop-blur-2xl border border-orange-500/30 rounded-2xl text-white placeholder-orange-200/50 focus:outline-none focus:ring-3 focus:ring-orange-400/50 focus:border-orange-400 transition-all duration-300 text-lg shadow-2xl font-medium"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-6 top-1/2 transform -translate-y-1/2 text-orange-300/70 hover:text-orange-200 transition-colors text-xl"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* عناصر التحكم للأدمن */}
        {isAdmin && (
          <div className="flex justify-center gap-3 mb-12">
            <button
              onClick={() => setAddOpen(true)}
              className="px-8 py-4 rounded-2xl font-bold transition-all duration-300 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white hover:scale-105 shadow-2xl"
            >
              ➕ Ajouter une carte
            </button>
            <button
              onClick={() => setDeleteMode(!deleteMode)}
              className={`px-8 py-4 rounded-2xl font-bold transition-all duration-300 backdrop-blur-md border ${
                deleteMode 
                  ? 'bg-red-500/20 hover:bg-red-500/30 text-red-200 border-red-400/30' 
                  : 'bg-orange-500/20 hover:bg-orange-500/30 text-orange-200 border-orange-400/30'
              } hover:scale-105 shadow-2xl`}
            >
              {deleteMode ? '🛑 Mode Suppression Actif' : '👑 Mode Administrateur'}
            </button>
          </div>
        )}

        {/* نتائج البحث في المنتجات */}
        {showProductResults && searchQuery && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-orange-200 mb-8 text-center">
              نتائج البحث في المنتجات ({searchResults.length})
            </h2>
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {searchResults.map((product: ProductData) => (
                  <div
                    key={product.id}
                    onClick={() => navigate(`/product-detail/${product.id}`)}
                    className="group bg-black/40 backdrop-blur-xl border border-orange-500/20 rounded-3xl overflow-hidden cursor-pointer hover:border-orange-400/50 transition-all duration-300 hover:scale-105"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-black/60">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-orange-200/50 text-center">
                            <div className="text-4xl mb-2">🔧</div>
                            <div className="text-sm font-semibold">{product.brand || 'OEM'}</div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-orange-100 font-semibold mb-2 line-clamp-2">{product.name}</h3>
                      <div className="flex items-center justify-between mb-2 text-xs text-orange-200/70">
                        <span>{product.brand || 'OEM'}</span>
                        <span>{product.sku}</span>
                      </div>
                      <div className="text-lg font-bold text-orange-400">{product.price}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-orange-200/70 text-lg">لم يتم العثور على منتجات تطابق "{searchQuery}"</p>
              </div>
            )}
          </div>
        )}

        {/* شبكة العلامات التجارية */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {[...Array(12)].map((_, index) => (
              <div
                key={index}
                className="p-6 rounded-3xl bg-black/40 backdrop-blur-xl border border-orange-500/10 animate-pulse"
              >
                <div className="w-20 h-20 mx-auto bg-orange-500/10 rounded-2xl mb-4"></div>
                <div className="h-5 bg-orange-500/10 rounded w-4/5 mx-auto mb-2"></div>
                <div className="h-4 bg-orange-500/10 rounded w-3/5 mx-auto"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {filteredBrands.map((brand, index) => (
              <div
                key={brand.name}
                role="button"
                tabIndex={0}
                aria-label={`Voir les modèles ${brand.name}`}
                onKeyDown={(e) => e.key === 'Enter' && handleBrandClick(brand.name)}
                onClick={() => handleBrandClick(brand.name)}
                className="relative cursor-pointer p-6 rounded-3xl bg-black/40 backdrop-blur-xl border border-orange-500/20 shadow-2xl hover:shadow-orange-500/25 transition-all duration-700 transform hover:scale-110 hover:-translate-y-2 group focus:outline-none focus:ring-3 focus:ring-orange-400/50"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  animation: 'fadeInUp 0.8s ease-out forwards'
                }}
              >
                {isAdmin && deleteMode && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveBrand(brand.name);
                    }}
                    className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-gradient-to-br from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-bold shadow-2xl transition-all duration-300 hover:scale-110 z-10 flex items-center justify-center text-sm border border-red-300/30"
                    aria-label={`Supprimer ${brand.name}`}
                    title="Supprimer"
                  >
                    ×
                  </button>
                )}
                {/* صورة العلامة بإطار متناسق */}
                <div className="mb-4">
                  <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-orange-500/20 bg-black/60">
                    <img
                      src={brand.file && brand.file.startsWith('data:') ? brand.file : `/cars.logo/${brand.file}`}
                      alt={brand.name}
                      className="absolute inset-0 w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        const parent = target.parentElement;
                        if (parent) {
                          target.remove();
                          const fallback = document.createElement('div');
                          fallback.className = 'w-full h-full grid place-items-center text-orange-200/80 text-4xl font-bold';
                          fallback.textContent = (brand.name || 'N').charAt(0);
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                {/* اسم الماركة */}
                <div className="flex items-center justify-center gap-2 mb-1">
                  <h3 className="text-center text-lg font-bold text-orange-100 group-hover:text-orange-300 transition-colors duration-500 tracking-wide">
                    {brand.name}
                  </h3>
                  {/* Debug: Show admin status */}
                  {isAdmin && (
                    <span className="text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded border border-green-500/30">
                      Admin
                    </span>
                  )}
                </div>
                
                {/* الموديل (Modèle) أسفل اسم الماركة */}
                {isAdmin && editingBrand === brand.name && editingField === 'model' ? (
                  <div className="mb-2 flex items-center gap-2 justify-center">
                    <input
                      type="text"
                      value={editModelValue}
                      onChange={(e) => setEditModelValue(e.target.value)}
                      className="flex-1 px-2 py-1 text-[13px] sm:text-sm text-center bg-black/60 border border-orange-500/30 rounded-lg text-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      onClick={(e) => e.stopPropagation()}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveEdit(brand.name);
                        }
                      }}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveEdit(brand.name);
                      }}
                      className="p-1 text-green-400 hover:text-green-300 transition-colors"
                      title="Enregistrer"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancelEdit();
                      }}
                      className="p-1 text-red-400 hover:text-red-300 transition-colors"
                      title="Annuler"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center text-[13px] sm:text-sm text-orange-300/90 mb-2 relative flex items-center justify-center gap-2">
                    {Array.isArray((brand as any).models) && (brand as any).models.length > 0 ? (
                      <>
                        <span>{(brand as any).models[0]}</span>
                        {isAdmin && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartEdit(brand.name, 'model');
                            }}
                            className="inline-flex items-center justify-center p-1.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 hover:text-orange-200 transition-all rounded-md border border-orange-500/30 hover:border-orange-500/50 shadow-sm"
                            title="Modifier le modèle"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    ) : (
                      isAdmin && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEdit(brand.name, 'model');
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 hover:text-orange-200 transition-all rounded-md border border-orange-500/30 hover:border-orange-500/50 shadow-sm text-xs"
                          title="Ajouter un modèle"
                        >
                          <Edit className="w-4 h-4" />
                          <span className="text-[10px]">Ajouter modèle</span>
                        </button>
                      )
                    )}
                  </div>
                )}

                {/* الوصف */}
                {isAdmin && editingBrand === brand.name && editingField === 'description' ? (
                  <div className="mb-2 flex items-center gap-2 justify-center">
                    <input
                      type="text"
                      value={editDescriptionValue}
                      onChange={(e) => setEditDescriptionValue(e.target.value)}
                      className="flex-1 px-2 py-1 text-xs text-center bg-black/60 border border-orange-500/30 rounded-lg text-orange-200/80 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      onClick={(e) => e.stopPropagation()}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveEdit(brand.name);
                        }
                      }}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveEdit(brand.name);
                      }}
                      className="p-1 text-green-400 hover:text-green-300 transition-colors"
                      title="Enregistrer"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancelEdit();
                      }}
                      className="p-1 text-red-400 hover:text-red-300 transition-colors"
                      title="Annuler"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <p className="text-center text-xs text-orange-200/60 group-hover:text-orange-200/80 transition-colors duration-500 leading-relaxed relative flex items-center justify-center gap-2 flex-wrap">
                    {brand.description || (isAdmin && <span className="text-orange-300/50 italic">Pas de description</span>)}
                    {isAdmin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEdit(brand.name, 'description');
                        }}
                        className="inline-flex items-center justify-center p-1.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 hover:text-orange-200 transition-all rounded-md border border-orange-500/30 hover:border-orange-500/50 shadow-sm"
                        title={brand.description ? "Modifier la description" : "Ajouter une description"}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                  </p>
                )}

                {/* التأثيرات */}
                <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-orange-400/30 pointer-events-none transition-all duration-500"></div>
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-orange-500/0 to-red-500/0 group-hover:from-orange-500/5 group-hover:to-red-500/5 pointer-events-none transition-all duration-500"></div>
                
                {/* تأثير التوهج */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 bg-gradient-to-br from-orange-400/10 to-red-500/10 blur-xl transition-all duration-1000 pointer-events-none"></div>
              </div>
            ))}
          </div>
        )}

        {/* رسالة عدم وجود نتائج */}
        {!isLoading && filteredBrands.length === 0 && (
          <div className="text-center py-24">
            <div className="text-8xl mb-6 opacity-30">🔍</div>
            <h3 className="text-3xl font-bold text-orange-200 mb-4">Aucun résultat trouvé</h3>
            <p className="text-orange-200/60 text-lg">Essayez d'autres termes de recherche</p>
          </div>
        )}
      </main>

      {/* Modal d'ajout d'une nouvelle carte (Admin uniquement) */}
      {isAdmin && addOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-2xl p-4" onClick={() => setAddOpen(false)}>
          <div className="bg-gradient-to-br from-black via-gray-900 to-black rounded-3xl w-full max-w-xl p-6 relative shadow-2xl border border-orange-500/30" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setAddOpen(false)}
              className="absolute top-4 right-4 text-orange-300 text-2xl font-bold hover:text-orange-100 transition-colors w-10 h-10 flex items-center justify-center rounded-xl hover:bg-orange-500/10"
              aria-label="Fermer le formulaire d'ajout"
            >
              ×
            </button>
            <h3 className="text-2xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500">Ajouter une nouvelle carte</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-orange-200 mb-1">Nom de la marque</label>
                <input
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  placeholder="Ex: Peugeot"
                  className="w-full px-4 py-2 rounded-lg bg-black/60 border border-orange-500/30 text-white placeholder-orange-200/50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm text-orange-200 mb-1">Modèle</label>
                <input
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                  placeholder="Ex: 308 GTi"
                  className="w-full px-4 py-2 rounded-lg bg-black/60 border border-orange-500/30 text-white placeholder-orange-200/50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm text-orange-200 mb-1">Image (télécharger)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleBrandImageUpload(e.target.files?.[0] || undefined)}
                  className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-orange-500/20 file:text-white file:px-3 file:py-2 hover:file:bg-orange-500/30"
                />
                {newBrandImage && (
                  <div className="mt-3 rounded-lg overflow-hidden border border-orange-500/30 bg-black/60 p-2">
                    <img src={newBrandImage} alt="Aperçu" className="h-32 w-auto object-contain mx-auto" />
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  onClick={() => {
                    if (!isSaving) {
                      setAddOpen(false);
                      setNewBrandName('');
                      setNewModel('');
                      setNewBrandImage('');
                    }
                  }} 
                  disabled={isSaving}
                  className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Annuler
                </button>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    saveNewCard();
                  }} 
                  disabled={isSaving}
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Enregistrement...
                    </>
                  ) : (
                    'Enregistrer'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* مودال العلامة التجارية */}
      {selectedBrand && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4 animate-fadeIn"
          onClick={closeModal}
        >
          <div
            className="bg-gradient-to-br from-black via-gray-900 to-black rounded-3xl w-full max-w-6xl p-8 relative shadow-2xl border border-orange-500/30 backdrop-blur-2xl animate-scaleIn max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* زر الإغلاق */}
            <button
              onClick={closeModal}
              className="absolute top-6 right-6 text-orange-300 text-3xl font-bold hover:text-orange-100 transition-colors duration-200 w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-orange-500/10 focus:outline-none focus:ring-3 focus:ring-orange-400/50 z-10"
              aria-label="Fermer"
            >
              ×
            </button>

            {/* محتوى المودال */}
            <div className="flex flex-col items-center text-center gap-6 mb-8">
              {/* صورة كبيرة للعلامة */}
              <div className="w-full max-w-3xl aspect-[16/9] rounded-2xl overflow-hidden border border-orange-500/30 bg-black/60">
                <img
                  src={(carBrands.find(b => b.name === selectedBrand)?.file || '').startsWith('data:') ? (carBrands.find(b => b.name === selectedBrand)?.file as string) : `/cars.logo/${carBrands.find(b => b.name === selectedBrand)?.file}`}
                  alt={selectedBrand}
                  className="w-full h-full object-contain p-6"
                />
              </div>
              {/* اسم الماركة */}
              <h2 className="text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500">
                {selectedBrand}
              </h2>
              {/* الموديل (الأول من القائمة إن وجد) */}
              {Array.isArray((carBrands.find(b => b.name === selectedBrand) as any)?.models) && (carBrands.find(b => b.name === selectedBrand) as any)?.models.length > 0 && (
                <div className="text-lg sm:text-xl text-orange-200/90">
                  {(carBrands.find(b => b.name === selectedBrand) as any).models[0]}
                </div>
              )}
              {/* زر "C'est ma voiture" */}
              <button
                onClick={() => {
                  if (selectedBrand) {
                    // الانتقال إلى صفحة قطع الغيار الخاصة بالعلامة
                    navigate(`/brand/${encodeURIComponent(selectedBrand)}/parts`);
                  }
                }}
                className="mt-4 px-8 py-4 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 hover:from-orange-400 hover:via-amber-400 hover:to-orange-300 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3 border-2 border-orange-300/50"
              >
                <span>👉</span>
                <span>C'est ma voiture</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* الفوتر */}
      <Footer />
    </div>
  );
};

export default Catalogue;