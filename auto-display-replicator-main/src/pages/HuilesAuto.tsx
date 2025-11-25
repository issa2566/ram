import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { X, Upload, RotateCcw } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts, updateProduct, createProduct, deleteProduct, getSectionContent, updateSectionContent } from "@/api/database";

const HuilesAuto = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectionTitle, setSectionTitle] = useState("Huiles Auto");
  const [sectionDescription, setSectionDescription] = useState("Découvrez notre gamme complète d'huiles automobiles et d'eau radiateur de qualité supérieure pour maintenir votre véhicule en parfait état.");

  const defaultProducts = [
    { id: 1, name: "LIQUI MOLY Top Tec 6320 5W-30 5L", price: "179.90 TND", originalPrice: "200.00 TND", discount: "-10%", hasPreview: false, hasOptions: false },
    { id: 2, name: "LIQUI MOLY Special Tec AA 0W-16 5L", price: "179.90 TND", originalPrice: "", discount: "", hasPreview: true, hasOptions: false },
    { id: 3, name: "LIQUI MOLY Top Tec 6200 0W-20", price: "59.90 TND - 259.90 TND", originalPrice: "", discount: "", hasPreview: true, hasOptions: true },
    { id: 4, name: "LIQUI MOLY Top Tec 4210 0W-30 5L", price: "229.90 TND", originalPrice: "", discount: "", hasPreview: false, hasOptions: false },
    { id: 5, name: "LIQUI MOLY Molygen New Generation 5W-20 5L", price: "189.90 TND", originalPrice: "200.00 TND", discount: "-5%", hasPreview: false, hasOptions: false },
    { id: 6, name: "LIQUI MOLY MoS2 Leichtlauf 15W-40 5L", price: "104.90 TND", originalPrice: "110.00 TND", discount: "-4%", hasPreview: false, hasOptions: false },
    { id: 7, name: "LIQUI MOLY Top Tec 4400 5W-30 5L", price: "189.90 TND", originalPrice: "215.00 TND", discount: "-12%", hasPreview: false, hasOptions: false },
    { id: 8, name: "LIQUI MOLY Special Tec AA 10W-30 Diesel 4L", price: "117.90 TND", originalPrice: "", discount: "", hasPreview: true, hasOptions: false },
    { id: 9, name: "Mannol bidon TS-4 15W40 EXTRA CL 20L", price: "309.90 TND", originalPrice: "", discount: "", hasPreview: false, hasOptions: false },
    { id: 10, name: "LIQUI MOLY Touring high tech 20W50 4L", price: "89.90 TND", originalPrice: "", discount: "", hasPreview: false, hasOptions: false },
    { id: 11, name: "LIQUI MOLY SPECIAL TEC I 0W-30", price: "67.00 TND - 231.90 TND", originalPrice: "", discount: "-3%", hasPreview: false, hasOptions: true },
    { id: 12, name: "LIQUI MOLY Top Tec 4100 5W-40", price: "36.90 TND - 162.90 TND", originalPrice: "", discount: "-4%", hasPreview: false, hasOptions: true }
  ];

  // Load user and data from database
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load user from localStorage
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }

        // Load products from database
        const productsData = await getProducts();
        if (productsData.length > 0) {
          setProducts(productsData);
        } else {
          // Initialize with default products if database is empty
          const defaultProductsData = defaultProducts.map(product => ({
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice,
            discount: product.discount,
            brand: "LIQUI MOLY",
            sku: `LM${String(product.id).padStart(5, '0')}`,
            category: "Huiles moteur",
            loyaltyPoints: 4.5,
            hasPreview: product.hasPreview,
            hasOptions: product.hasOptions,
          }));
          
          // Create products in database
          for (const productData of defaultProductsData) {
            await createProduct(productData);
          }
          
          // Reload products
          const newProducts = await getProducts();
          setProducts(newProducts);
        }

        // Load section content from database
        const sectionContent = await getSectionContent('huiles_auto');
        if (sectionContent) {
          if (sectionContent.title) setSectionTitle(sectionContent.title);
          if (sectionContent.description) setSectionDescription(sectionContent.description);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleImageUpload = async (productId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const imageData = e.target?.result as string;
          await updateProduct(productId, { image: imageData });
          
          // Update local state
          setProducts(prev => prev.map(product => 
            product.id === productId 
              ? { ...product, image: imageData }
              : product
          ));
        } catch (error) {
          console.error('Error updating product image:', error);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = async (productId: string) => {
    try {
      await updateProduct(productId, { image: null });
      
      // Update local state
      setProducts(prev => prev.map(product => 
        product.id === productId 
          ? { ...product, image: null }
          : product
      ));
    } catch (error) {
      console.error('Error removing product image:', error);
    }
  };

  const handleTextChange = async (productId: string, field: string, value: string) => {
    try {
      const updateData: any = {};
      if (field === 'name') updateData.name = value;
      if (field === 'price') updateData.price = value;
      if (field === 'originalPrice') updateData.originalPrice = value;
      
      await updateProduct(productId, updateData);
      
      // Update local state
      setProducts(prev => prev.map(product => 
        product.id === productId 
          ? { ...product, ...updateData }
          : product
      ));
    } catch (error) {
      console.error('Error updating product text:', error);
    }
  };

  const resetTexts = async (productId: string) => {
    try {
      const product = products.find(p => p.id === productId);
      if (product) {
        // Reset to original values
        await updateProduct(productId, {
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice
        });
        
        // Reload products to get updated data
        const updatedProducts = await getProducts();
        setProducts(updatedProducts);
      }
    } catch (error) {
      console.error('Error resetting product texts:', error);
    }
  };

  const handleTitleChange = async (value: string) => {
    try {
      setSectionTitle(value);
      await updateSectionContent('huiles_auto', {
        sectionType: 'huiles_auto',
        title: value,
        description: sectionDescription
      });
    } catch (error) {
      console.error('Error updating title:', error);
    }
  };

  const handleDescriptionChange = async (value: string) => {
    try {
      setSectionDescription(value);
      await updateSectionContent('huiles_auto', {
        sectionType: 'huiles_auto',
        title: sectionTitle,
        description: value
      });
    } catch (error) {
      console.error('Error updating description:', error);
    }
  };

  const resetTitle = async () => {
    try {
      const defaultTitle = "Huiles Auto";
      setSectionTitle(defaultTitle);
      await updateSectionContent('huiles_auto', {
        sectionType: 'huiles_auto',
        title: defaultTitle,
        description: sectionDescription
      });
    } catch (error) {
      console.error('Error resetting title:', error);
    }
  };

  const resetDescription = async () => {
    try {
      const defaultDescription = "Découvrez notre gamme complète d'huiles automobiles et d'eau radiateur de qualité supérieure pour maintenir votre véhicule en parfait état.";
      setSectionDescription(defaultDescription);
      await updateSectionContent('huiles_auto', {
        sectionType: 'huiles_auto',
        title: sectionTitle,
        description: defaultDescription
      });
    } catch (error) {
      console.error('Error resetting description:', error);
    }
  };

  const handleDiscountChange = async (productId: string, value: string) => {
    try {
      await updateProduct(productId, { discount: value });
      
      // Update local state
      setProducts(prev => prev.map(product => 
        product.id === productId 
          ? { ...product, discount: value }
          : product
      ));
    } catch (error) {
      console.error('Error updating product discount:', error);
    }
  };

  const removeDiscount = async (productId: string) => {
    try {
      await updateProduct(productId, { discount: null });
      
      // Update local state
      setProducts(prev => prev.map(product => 
        product.id === productId 
          ? { ...product, discount: null }
          : product
      ));
    } catch (error) {
      console.error('Error removing product discount:', error);
    }
  };

  return (
    <div className="mobile-min-vh bg-gray-50 no-scroll-x">
      <Header />
      
      {/* Main Content */}
      <main className="pt-32 sm:pt-36 md:pt-40">
        <div className="container-responsive py-responsive">
          {/* Hero Section */}
          <section className="text-center mb-8 sm:mb-12">
            {user && user.role === 'admin' ? (
              <div className="space-y-4">
                <div className="mobile-stack items-center justify-center">
                  <Input
                    value={sectionTitle}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="text-responsive-xl font-bold text-center text-gray-900 bg-transparent border-orange-500 mobile-input"
                    placeholder="Titre de la section"
                  />
                  <Button
                    onClick={resetTitle}
                    variant="outline"
                    size="sm"
                    className="mobile-button text-xs"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Reset
                  </Button>
                </div>
                <div className="mobile-stack items-center justify-center">
                  <Textarea
                    value={sectionDescription}
                    onChange={(e) => handleDescriptionChange(e.target.value)}
                    className="text-responsive-lg text-gray-600 max-w-3xl mx-auto bg-transparent border-orange-500 min-h-[60px] mobile-input"
                    placeholder="Description de la section"
                  />
                  <Button
                    onClick={resetDescription}
                    variant="outline"
                    size="sm"
                    className="mobile-button text-xs"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Reset
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-responsive-xl font-bold text-gray-900 mb-4">
                  {sectionTitle}
                </h1>
                <p className="text-responsive-lg text-gray-600 max-w-3xl mx-auto">
                  {sectionDescription}
                </p>
              </>
            )}
          </section>

          {/* Products Grid */}
          <section className="mb-8 sm:mb-12">
            {loading ? (
              <div className="text-center py-8">
                <div className="text-responsive-lg text-gray-600">Chargement des produits...</div>
              </div>
            ) : (
              <div className="mobile-grid lg:grid-cols-3 gap-responsive">
                {products.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow rounded-responsive">
                  <div className="relative">
                    <div 
                      className="h-40 sm:h-48 bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors mobile-tap"
                      onClick={() => navigate(`/product-detail/${product.id}`)}
                    >
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-gray-700 text-center">
                          <div className="text-4xl mb-2">🛢️</div>
                          <div className="text-sm font-semibold">{product.brand}</div>
                        </div>
                      )}
                    </div>
                    
                    {/* Admin Image Controls */}
                    {user && user.role === 'admin' && (
                      <div className="absolute top-2 right-2 flex gap-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(product.id, e)}
                          className="hidden"
                          id={`image-upload-${product.id}`}
                        />
                        <label
                          htmlFor={`image-upload-${product.id}`}
                          className="bg-orange-500 hover:bg-orange-600 text-white p-1 rounded cursor-pointer"
                          title="Changer l'image"
                        >
                          <Upload className="h-3 w-3" />
                        </label>
                        {product.image && (
                          <button
                            onClick={() => handleRemoveImage(product.id)}
                            className="bg-red-500 hover:bg-red-600 text-white p-1 rounded"
                            title="Supprimer l'image"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    )}

                    {/* Admin Discount Controls */}
                    {user && user.role === 'admin' ? (
                      <div className="absolute top-2 left-2">
                        <div className="flex items-center gap-1">
                          <div className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-semibold">
                            <input
                              type="text"
                              value={product.discount || ''}
                              onChange={(e) => handleDiscountChange(product.id, e.target.value)}
                              className="bg-transparent text-white placeholder-white/70 text-xs w-12 text-center border-none outline-none"
                              placeholder="%"
                              maxLength={4}
                            />
                          </div>
                          {product.discount && (
                            <button
                              onClick={() => removeDiscount(product.id)}
                              className="bg-red-500 hover:bg-red-600 text-white p-1 rounded text-xs"
                              title="Supprimer le discount"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* Discount Badge for regular users */
                      product.discount && (
                        <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-semibold">
                          {product.discount}
                        </div>
                      )
                    )}

                  </div>
                  
                  <div className="mobile-card">
                    {user && user.role === 'admin' ? (
                      <div className="space-y-3">
                        <div className="relative">
                          <Input
                            value={product.name}
                            onChange={(e) => handleTextChange(product.id, 'name', e.target.value)}
                            className="text-responsive-sm font-medium bg-transparent border-orange-500 mobile-input"
                            placeholder="Nom du produit"
                          />
                          {product.name && (
                            <button
                              type="button"
                              onClick={() => handleTextChange(product.id, 'name', '')}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 text-sm mobile-tap"
                              title="Effacer le nom"
                            >
                              ×
                            </button>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="relative">
                            <Input
                              value={product.price}
                              onChange={(e) => handleTextChange(product.id, 'price', e.target.value)}
                              className="text-responsive-lg font-bold text-orange-500 bg-transparent border-orange-500 mobile-input"
                              placeholder="Prix"
                            />
                            {product.price && (
                              <button
                                type="button"
                                onClick={() => handleTextChange(product.id, 'price', '')}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 text-sm mobile-tap"
                                title="Effacer le prix"
                              >
                                ×
                              </button>
                            )}
                          </div>

                          {product.originalPrice && (
                            <div className="relative">
                              <Input
                                value={product.originalPrice}
                                onChange={(e) => handleTextChange(product.id, 'originalPrice', e.target.value)}
                                className="text-responsive-sm text-gray-500 bg-transparent border-gray-300 mobile-input"
                                placeholder="Prix original"
                              />
                              {product.originalPrice && (
                                <button
                                  type="button"
                                  onClick={() => handleTextChange(product.id, 'originalPrice', '')}
                                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 text-sm mobile-tap"
                                  title="Effacer le prix original"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        <Button
                          onClick={() => resetTexts(product.id)}
                          variant="outline"
                          size="sm"
                          className="mobile-button text-xs w-full"
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Reset
                        </Button>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-responsive-sm font-medium text-gray-900 mb-2">{product.name}</h3>
                        <div className="flex items-center mb-3">
                          {product.originalPrice && (
                            <span className="text-responsive-sm text-gray-500 line-through mr-2">{product.originalPrice}</span>
                          )}
                          <span className="text-responsive-lg font-bold text-orange-500">{product.price}</span>
                        </div>
                      </>
                    )}
                    
                    <button className="w-full bg-orange-500 hover:bg-orange-600 text-white mobile-button mobile-tap">
                      Ajouter au panier
                    </button>
                  </div>
                </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            <div className="flex justify-center items-center mt-8 space-x-2">
              <button className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50" disabled>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button className="w-8 h-8 bg-orange-500 text-white rounded-full text-sm font-medium">1</button>
              <button className="w-8 h-8 text-gray-600 hover:bg-gray-100 rounded-full text-sm font-medium">2</button>
              <button className="w-8 h-8 text-gray-600 hover:bg-gray-100 rounded-full text-sm font-medium">3</button>
              <button className="w-8 h-8 text-gray-600 hover:bg-gray-100 rounded-full text-sm font-medium">4</button>
              <button className="p-2 text-gray-600 hover:text-gray-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </section>

          {/* Features Section */}
          <section className="bg-white rounded-lg shadow-md mobile-card mb-8 sm:mb-12">
            <h2 className="text-responsive-lg font-bold text-center text-gray-900 mb-6 sm:mb-8">
              Pourquoi choisir nos huiles et liquides ?
            </h2>
            <div className="mobile-grid md:grid-cols-3 gap-responsive">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl mb-4">🏆</div>
                <h3 className="text-responsive-lg font-semibold text-gray-900 mb-2">Qualité Premium</h3>
                <p className="text-responsive-sm text-gray-600">
                  Tous nos produits sont de marques reconnues et certifiées pour leur qualité exceptionnelle.
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl mb-4">🚗</div>
                <h3 className="text-responsive-lg font-semibold text-gray-900 mb-2">Compatible Tous Véhicules</h3>
                <p className="text-responsive-sm text-gray-600">
                  Nos huiles et liquides conviennent à tous types de véhicules, des voitures aux camions.
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl mb-4">⚡</div>
                <h3 className="text-responsive-lg font-semibold text-gray-900 mb-2">Performance Optimale</h3>
                <p className="text-responsive-sm text-gray-600">
                  Améliorez les performances de votre véhicule et réduisez la consommation de carburant.
                </p>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center bg-orange-500 rounded-lg mobile-card">
            <h2 className="text-responsive-lg font-bold text-white mb-4">
              Besoin de conseils pour choisir vos huiles ?
            </h2>
            <p className="text-responsive-sm text-orange-100 mb-6 max-w-2xl mx-auto">
              Notre équipe d'experts est là pour vous aider à choisir les produits les plus adaptés à votre véhicule.
            </p>
            <button className="bg-white text-orange-500 hover:bg-gray-100 mobile-button mobile-tap">
              Contactez-nous
            </button>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HuilesAuto;
