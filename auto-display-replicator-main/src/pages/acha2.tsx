import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL, saveAcha2Product, createOrder } from "@/api/database";
import {
  ChevronLeft,
  ChevronRight,
  Edit3,
  Save,
  X,
  Trash2,
  Plus,
  Package,
  Tag,
  ImagePlus,
  Upload,
  ShoppingCart,
  Zap,
} from "lucide-react";

const Acha2 = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Get product name from query params
  const searchParams = new URLSearchParams(location.search);
  const productName = searchParams.get("name") || "Produit";

  // User state
  const [user, setUser] = useState<any>(null);
  const isAdmin = user?.role === "admin";

  // Product data state (using fields ending with "2")
  const [quantity2, setQuantity2] = useState<number>(0);
  const [references2, setReferences2] = useState<string[]>([]);
  const [description2, setDescription2] = useState<string>("");
  const [price2, setPrice2] = useState<string>("0.000");
  const [images2, setImages2] = useState<string[]>([]);
  const [modeles, setModeles] = useState<string[]>([]);
  const [newModele, setNewModele] = useState("");
  const [showModeles, setShowModeles] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  
  // Order modal state
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState("");
  const [orderForm, setOrderForm] = useState({
    nom: "",
    prenom: "",
    telephone: "",
    wilaya: "",
    delegation: "",
    quantite: 1,
  });
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderErrors, setOrderErrors] = useState<Partial<Record<keyof typeof orderForm, string>>>({});

  // Editing states
  const [isEditingQuantity, setIsEditingQuantity] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [newReference, setNewReference] = useState("");
  const [tempQuantity, setTempQuantity] = useState(quantity2);
  const [tempDescription, setTempDescription] = useState(description2);
  const [tempPrice, setTempPrice] = useState(price2);
  const [isSaving, setIsSaving] = useState(false);

  // Image carousel state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Load global modele list
  useEffect(() => {
    const loadModeles = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/modeles`);
        if (response.ok) {
          const data = await response.json();
          setModeles(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Error loading modeles:", error);
      }
    };
    loadModeles();
  }, []);

  // Load product data from API
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setIsLoading(true);
        const url = `${API_BASE_URL}/acha2?name=${encodeURIComponent(productName)}`;
        const response = await fetch(url, { cache: "no-store" });

        if (!response.ok) {
          const text = await response.text();
          console.error("❌ Failed to load acha2 product", response.status, text);
          toast({
            title: "Erreur",
            description: `Impossible de charger le produit (${response.status})`,
            variant: "destructive",
          });
          return;
        }

        const result = await response.json();
        
        if (result.success && result.data) {
          setQuantity2(result.data.quantity2 ?? 0);
          setReferences2(Array.isArray(result.data.references2) ? result.data.references2 : []);
          setDescription2(result.data.description2 ?? "");
          setPrice2(result.data.price2?.toString() ?? "0.000");
          setImages2(Array.isArray(result.data.images2) ? result.data.images2 : []);
          // Note: modeles are loaded from global_settings, not from product
          setTempQuantity(result.data.quantity2 ?? 0);
          setTempDescription(result.data.description2 ?? "");
          setTempPrice(result.data.price2?.toString() ?? "0.000");
        }
      } catch (error) {
        console.error("❌ Error loading product:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger le produit",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (productName) {
      loadProduct();
    }
  }, [productName, toast]);

  // Save to database
  const saveToDatabase = async (updates?: {
    quantity2?: number;
    description2?: string;
    price2?: string;
    references2?: string[];
    images2?: string[];
    modele2?: string[];
  }) => {
    if (!isAdmin || isSaving) return;

    try {
      setIsSaving(true);
      const dataToSave = {
        quantity2: updates?.quantity2 !== undefined ? updates.quantity2 : quantity2,
        description2: updates?.description2 !== undefined ? updates.description2 : description2,
        price2: updates?.price2 !== undefined ? updates.price2 : price2,
        references2: updates?.references2 !== undefined ? updates.references2 : references2,
        images2: updates?.images2 !== undefined ? updates.images2 : images2,
        modele2: updates?.modele2 !== undefined ? updates.modele2 : modeles,
      };

      const url = `${API_BASE_URL}/acha2/${encodeURIComponent(productName)}`;
      const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSave),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("❌ Failed to save acha2 product", response.status, text);
        throw new Error(`HTTP ${response.status}: ${text}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Update state with saved data
        if (updates?.quantity2 !== undefined) setQuantity2(updates.quantity2);
        if (updates?.description2 !== undefined) setDescription2(updates.description2);
        if (updates?.price2 !== undefined) setPrice2(updates.price2);
        if (updates?.references2 !== undefined) setReferences2(updates.references2);
        if (updates?.images2 !== undefined) setImages2(updates.images2);
        if (updates?.modele2 !== undefined) setModeles(updates.modele2);
        
        toast({
          title: "Succès",
          description: "Modifications enregistrées",
        });
      } else {
        throw new Error(result.error || "Failed to save");
      }
    } catch (error) {
      console.error("❌ Error saving product:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer les modifications",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Image navigation
  const handleNextImage = useCallback(() => {
    if (images2.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % images2.length);
    }
  }, [images2.length]);

  const handlePrevImage = useCallback(() => {
    if (images2.length > 0) {
      setCurrentImageIndex((prev) =>
        (prev - 1 + images2.length) % images2.length
      );
    }
  }, [images2.length]);

  const handleDotClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  // Touch gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 50) handleNextImage();
    if (distance < -50) handlePrevImage();
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrevImage();
      if (e.key === "ArrowRight") handleNextImage();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleNextImage, handlePrevImage]);

  // Admin handlers
  const handleSaveQuantity = async () => {
    setIsEditingQuantity(false);
    await saveToDatabase({ quantity2: tempQuantity });
  };

  const handleOfflineSale = async () => {
    if (!isAdmin || quantity2 <= 0) return;

    try {
      const newQuantity = Math.max(0, quantity2 - 1);
      await saveToDatabase({ quantity2: newQuantity });
      toast({
        title: "Succès",
        description: "Quantité mise à jour (vente hors ligne)",
      });
    } catch (error) {
      console.error("Error performing offline sale:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la quantité",
        variant: "destructive",
      });
    }
  };

  const handleSaveDescription = async () => {
    setIsEditingDescription(false);
    await saveToDatabase({ description2: tempDescription });
  };

  const handleSavePrice = async () => {
    setIsEditingPrice(false);
    await saveToDatabase({ price2: tempPrice });
  };

  const handleAddReference = async () => {
    if (newReference.trim()) {
      const updated = [...references2, newReference.trim()];
      setNewReference("");
      await saveToDatabase({ references2: updated });
    }
  };

  const handleRemoveReference = async (refToRemove: string) => {
    const updated = references2.filter((r) => r !== refToRemove);
    await saveToDatabase({ references2: updated });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [];

    for (const file of Array.from(files).slice(0, 5 - images2.length)) {
      const reader = new FileReader();
      await new Promise<void>((resolve) => {
        reader.onloadend = () => {
          newImages.push(reader.result as string);
          resolve();
        };
        reader.readAsDataURL(file);
      });
    }

    const updated = [...images2, ...newImages];
    e.target.value = "";
    await saveToDatabase({ images2: updated });
  };

  const handleDeleteImage = async (index: number) => {
    const updated = images2.filter((_, i) => i !== index);
    if (currentImageIndex >= updated.length) {
      setCurrentImageIndex(Math.max(0, updated.length - 1));
    }
    await saveToDatabase({ images2: updated });
  };

  // Handle add modele
  const handleAddModele = async () => {
    if (!newModele.trim()) return;
    
    // Check if already exists
    if (modeles.includes(newModele.trim())) {
      toast({
        title: "Attention",
        description: "Ce modèle existe déjà",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/modeles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add",
          value: newModele.trim()
        })
      });
      
      if (response.ok) {
        const updatedList = await response.json();
        setModeles(Array.isArray(updatedList) ? updatedList : modeles);
        setNewModele("");
        toast({
          title: "Succès",
          description: "Modèle ajouté avec succès",
        });
      } else {
        throw new Error("Failed to add modele");
      }
    } catch (error) {
      console.error("Error adding modele:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le modèle",
        variant: "destructive",
      });
    }
  };

  // Handle delete modele
  const handleDeleteModele = async (modeleName: string) => {
    if (!isAdmin) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/modeles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          value: modeleName
        })
      });
      
      if (response.ok) {
        const updatedList = await response.json();
        setModeles(Array.isArray(updatedList) ? updatedList : modeles);
        toast({
          title: "Succès",
          description: "Modèle supprimé avec succès",
        });
      } else {
        throw new Error("Failed to delete modele");
      }
    } catch (error) {
      console.error("Error deleting modele:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le modèle",
        variant: "destructive",
      });
    }
  };

  const handleAddToDashboard = async () => {
    if (!isAdmin || !productName) return;

    try {
      // Collect all product data
      const productData = {
        name: productName,
        quantity2: quantity2 || 0,
        price2: parseFloat(price2) || 0,
        description2: description2 || '',
        references2: references2 || [],
        images2: images2 || [],
        modele2: modeles || [], // Use the global modeles list
      };

      // Save to dashboard (UPSERT - will update if exists, insert if new)
      await saveAcha2Product(productData);

      toast({
        title: "Succès",
        description: "Produit ajouté au dashboard",
      });
    } catch (error) {
      console.error('Error adding product to dashboard:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le produit au dashboard",
        variant: "destructive",
      });
    }
  };

  // Cart and checkout handlers
  const addToCart = () => {
    console.log("Added to cart:", productName);
    toast({
      title: "Succès",
      description: "Produit ajouté au panier",
    });
  };

  // Tunisian governorates and delegations
  const governorates: Record<string, string[]> = {
    "Tunis": ["Bab El Bhar", "Bab Souika", "Carthage", "Cité El Khadra", "El Kabaria", "El Menzah", "El Omrane", "Ettahrir", "La Goulette", "Le Bardo", "Sidi El Béchir", "Sidi Hassine"],
    "Ariana": ["Ariana Ville", "Ettadhamen", "Mnihla", "Raoued", "Sidi Thabet", "La Soukra"],
    "Ben Arous": ["Ben Arous", "Bou Mhel el-Bassatine", "El Mourouj", "Ezzahra", "Fouchana", "Hammam Chott", "Hammam Lif", "Mohamedia", "Mornag", "Radès", "Mégrine"],
    "Manouba": ["Borj El Amri", "Douar Hicher", "El Battan", "La Manouba", "Mornaguia", "Oued Ellil", "Tebourba"],
    "Bizerte": ["Bizerte Nord", "Bizerte Sud", "El Alia", "Ghar El Melh", "Mateur", "Menzel Bourguiba", "Menzel Jemil", "Ras Jebel", "Sejnane", "Tinja", "Utique", "Zarzouna"],
    "Nabeul": ["Béni Khalled", "Béni Khiar", "Bou Argoub", "Dar Chaabane", "El Haouaria", "El Mida", "Grombalia", "Hammamet", "Kelibia", "Korba", "Menzel Bouzelfa", "Menzel Temime", "Nabeul", "Soliman", "Takelsa"],
    "Zaghouan": ["Bir Mcherga", "El Fahs", "Nadhour", "Saouaf", "Zaghouan", "Zriba"],
    "Sousse": ["Akouda", "Bouficha", "Enfidha", "Hammam Sousse", "Hergla", "Kalâa Kebira", "Kalâa Seghira", "Kondar", "Msaken", "Sidi Bou Ali", "Sidi El Hani", "Sousse Jawhara", "Sousse Medina", "Sousse Riadh", "Sousse Sidi Abdelhamid"],
    "Monastir": ["Bekalta", "Bembla", "Beni Hassen", "Jemmal", "Ksar Hellal", "Ksibet el-Médiouni", "Moknine", "Monastir", "Ouerdanine", "Sahline", "Sayada-Lamta-Bou Hajar", "Téboulba", "Zéramdine"],
    "Mahdia": ["Bou Merdes", "Chebba", "Chorbane", "El Jem", "Essouassi", "Hebira", "Ksour Essef", "Mahdia", "Melloulèche", "Ouled Chamekh", "Sidi Alouane", "Zouila"],
    "Sfax": ["Agareb", "Bir Ali Ben Khalifa", "El Amra", "El Hencha", "Graïba", "Jebiniana", "Kerkenah", "Mahares", "Menzel Chaker", "Sakiet Eddaier", "Sakiet Ezzit", "Sfax Est", "Sfax Ouest", "Sfax Sud", "Skhira", "Thyna"],
    "Kairouan": ["Bou Hajla", "Chebika", "Echrarda", "El Alâa", "Haffouz", "Hajeb El Ayoun", "Kairouan Nord", "Kairouan Sud", "Nasrallah", "Oueslatia", "Sbikha"],
    "Kasserine": ["El Ayoun", "Ezzouhour", "Fériana", "Foussana", "Haïdra", "Hassi El Ferid", "Jedelienne", "Kasserine Nord", "Kasserine Sud", "Majel Bel Abbès", "Sbeïtla", "Sbiba", "Thala"],
    "Sidi Bouzid": ["Bir El Hafey", "Cebbala Ouled Asker", "Jilma", "Meknassy", "Menzel Bouzaiane", "Mezzouna", "Ouled Haffouz", "Regueb", "Sidi Ali Ben Aoun", "Sidi Bouzid Est", "Sidi Bouzid Ouest", "Souk Jedid"],
    "Siliana": ["Bargou", "Bou Arada", "El Aroussa", "El Krib", "Gaâfour", "Kesra", "Makthar", "Rouhia", "Siliana Nord", "Siliana Sud"],
    "Kef": ["Dahmani", "El Ksour", "Jérissa", "Kalâat Khasba", "Kalâat Senan", "Kef Est", "Kef Ouest", "Nebeur", "Sakiet Sidi Youssef", "Sers", "Tajerouine"],
    "Jendouba": ["Aïn Draham", "Balta-Bou Aouane", "Bou Salem", "Fernana", "Ghardimaou", "Jendouba", "Oued Melliz", "Tabarka"],
    "Béja": ["Amdoun", "Béja Nord", "Béja Sud", "Goubellat", "Medjez el-Bab", "Nefza", "Téboursouk", "Testour", "Thibar"],
    "Gafsa": ["El Guettar", "El Ksar", "Gafsa Nord", "Gafsa Sud", "Mdhilla", "Métlaoui", "Oum El Araies", "Redeyef", "Sened", "Sidi Aïch"],
    "Tozeur": ["Degache", "Hazoua", "Nefta", "Tameghza", "Tozeur"],
    "Kebili": ["Douz Nord", "Douz Sud", "Faouar", "Kebili Nord", "Kebili Sud", "Souk Lahad"],
    "Gabès": ["Gabès Médina", "Gabès Ouest", "Gabès Sud", "Ghannouch", "El Hamma", "Mareth", "Matmata", "Menzel El Habib", "Nouvelle Matmata"],
    "Médenine": ["Ben Gardane", "Beni Khedache", "Djerba - Ajim", "Djerba - Houmt Souk", "Djerba - Midoun", "Médenine Nord", "Médenine Sud", "Sidi Makhlouf", "Zarzis"],
    "Tataouine": ["Bir Lahmar", "Dhehiba", "Ghomrassen", "Remada", "Smâr", "Tataouine Nord", "Tataouine Sud"]
  };

  const goToCheckout = () => {
    setIsOrderModalOpen(true);
    // Set default selected model if available
    if (modeles.length > 0 && !selectedModel) {
      setSelectedModel(modeles[0]);
    }
  };

  const handleOrderFormChange = (field: string, value: string | number) => {
    setOrderForm(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (orderErrors[field as keyof typeof orderForm]) {
      setOrderErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as keyof typeof orderForm];
        return newErrors;
      });
    }
  };

  const validateOrderForm = (): boolean => {
    const errors: Partial<Record<keyof typeof orderForm, string>> = {};
    
    if (!orderForm.nom.trim()) {
      errors.nom = "Le nom est obligatoire";
    }
    if (!orderForm.prenom.trim()) {
      errors.prenom = "Le prénom est obligatoire";
    }
    if (!orderForm.telephone.trim()) {
      errors.telephone = "Le téléphone est obligatoire";
    } else if (!/^[0-9]{8}$/.test(orderForm.telephone.replace(/\s/g, ""))) {
      errors.telephone = "Numéro invalide (8 chiffres)";
    }
    if (!orderForm.wilaya) {
      errors.wilaya = "La wilaya est obligatoire";
    }
    if (!orderForm.delegation) {
      errors.delegation = "La délégation est obligatoire";
    }
    if (orderForm.quantite < 1) {
      errors.quantite = "1";
    }
    
    setOrderErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitOrder = async () => {
    if (!validateOrderForm()) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Prepare order data - EXACTLY like Acha.tsx
      const productImage = images2 && images2.length > 0 
        ? images2[0] 
        : null;

      // Validate required fields before sending
      if (!orderForm.wilaya || !orderForm.delegation || !orderForm.nom || !orderForm.prenom || !orderForm.telephone) {
        toast({
          title: "Erreur",
          description: "Veuillez remplir tous les champs obligatoires.",
          variant: "destructive",
        });
        return;
      }

      const orderData = {
        product_id: productName || null,
        product_name: productName,
        product_image: productImage,
        product_price: price2 || "0.000",
        product_references: references2 || [],
        quantity: orderForm.quantite,
        customer_nom: orderForm.nom.trim(),
        customer_prenom: orderForm.prenom.trim(),
        customer_phone: orderForm.telephone.trim(),
        customer_wilaya: orderForm.wilaya.trim(),
        customer_delegation: orderForm.delegation.trim()
      };

      // Debug: Log payload before sending
      console.log('📦 Frontend (Acha2): Order payload being sent:', JSON.stringify(orderData, null, 2));

      // Submit order to API using the same function as Acha.tsx
      await createOrder(orderData);

      // Show success toast (same message as Acha.tsx)
      toast({
        title: "Commande envoyée!",
        description: `Merci ${orderForm.prenom}! Nous vous contacterons bientôt.`,
      });

      setIsOrderModalOpen(false);
      
      // Reset form
      setOrderForm({
        nom: "",
        prenom: "",
        telephone: "",
        wilaya: "",
        delegation: "",
        quantite: 1
      });
      setSelectedModel("");
      setOrderErrors({});
    } catch (error) {
      console.error("Error submitting order:", error);
      toast({
        title: "Erreur",
        description: `Échec de l'envoi de la commande: ${error instanceof Error ? error.message : "Veuillez réessayer."}`,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8 lg:py-10 max-sm:pt-20">
          <div className="flex justify-center py-20">
            <div className="animate-spin h-12 w-12 border-b-2 border-orange-500 rounded-full"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

        <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8 lg:py-10 max-sm:pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-10">
          {/* ========== LEFT SIDE IMAGES ========== */}
          <section className="space-y-3 sm:space-y-4">
            {/* Main Image Carousel */}
            <div
              className="relative h-[260px] sm:h-[320px] lg:aspect-square lg:h-auto bg-white rounded-xl shadow overflow-hidden"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {images2.length > 0 ? (
                <>
                  {images2.map((image, index) => (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-opacity duration-500 ${
                        index === currentImageIndex ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      <img
                        src={image}
                        className="object-contain w-full h-full p-2 sm:p-4"
                        alt="Product"
                      />

                      {/* DELETE IMAGE (Admin only) */}
                      {isAdmin && index === currentImageIndex && (
                        <button
                          onClick={() => handleDeleteImage(index)}
                          className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-red-500 text-white p-1.5 sm:p-2 rounded-full shadow"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      )}
                    </div>
                  ))}

                  {images2.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevImage}
                        className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 sm:p-3 rounded-full hover:bg-black/70 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>

                      <button
                        onClick={handleNextImage}
                        className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 sm:p-3 rounded-full hover:bg-black/70 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="flex flex-col justify-center items-center h-full text-gray-400">
                  <ImagePlus className="w-8 h-8 sm:w-10 sm:h-10 mb-2 sm:mb-3" />
                  <span className="text-sm">Aucune image</span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images2.length > 1 && (
              <div className="flex gap-1.5 sm:gap-2 justify-center overflow-x-auto">
                {images2.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => handleDotClick(i)}
                    className={`w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 ${
                      currentImageIndex === i
                        ? "border-orange-500"
                        : "border-gray-200"
                    }`}
                  >
                    <img src={img} className="object-cover w-full h-full" alt={`Thumbnail ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}

            {/* Upload Images (Admin only) */}
            {isAdmin && images2.length < 5 && (
              <label className="border-2 border-dashed border-orange-400 p-3 sm:p-4 rounded-xl block text-center cursor-pointer hover:bg-orange-50 transition-colors">
                <Upload className="w-5 h-5 sm:w-6 sm:h-6 mx-auto text-orange-600" />
                <p className="text-xs sm:text-sm text-orange-600 mt-1">
                  Ajouter des images ({images2.length}/5)
                </p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </section>

          {/* ========== RIGHT SIDE PRODUCT INFO ========== */}
          <section className="space-y-4 sm:space-y-6">
            {/* Title */}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 break-words">
              {productName}
            </h1>

            {/* Quantity Block - Admin Only */}
            {isAdmin && (
            <div className="bg-white border rounded-xl shadow-sm">
              <div className="flex justify-between items-center px-3 sm:px-4 py-2 sm:py-3 border-b">
                <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2">
                  <Package className="w-4 h-4 sm:w-5 sm:h-5" /> Quantité du produit
                </h3>
                {isAdmin && !isEditingQuantity && (
                  <button
                    onClick={() => {
                      setTempQuantity(quantity2);
                      setIsEditingQuantity(true);
                    }}
                    className="text-orange-500 hover:text-orange-600 flex items-center gap-1 text-xs sm:text-sm"
                  >
                    <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                )}
              </div>

              <div className="p-3 sm:p-4">
                {isEditingQuantity ? (
                  <div className="space-y-3">
                    <Input
                      type="number"
                      value={tempQuantity}
                      min={0}
                      onChange={(e) => setTempQuantity(parseInt(e.target.value) || 0)}
                      className="w-24 text-center font-bold h-10"
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setTempQuantity(quantity2);
                          setIsEditingQuantity(false);
                        }}
                        className="h-9 text-sm"
                        disabled={isSaving}
                      >
                        <X className="w-3 h-3 sm:w-4 sm:h-4" /> Annuler
                      </Button>
                      <Button
                        onClick={handleSaveQuantity}
                        className="bg-orange-500 text-white h-9 text-sm"
                        disabled={isSaving}
                      >
                        <Save className="w-3 h-3 sm:w-4 sm:h-4" /> Enregistrer
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-lg sm:text-xl font-semibold text-gray-800">{quantity2}</p>
                    <Button
                      onClick={handleOfflineSale}
                      disabled={quantity2 <= 0 || isSaving}
                      variant="outline"
                      className="border-orange-500 text-orange-600 hover:bg-orange-50 hover:text-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4"
                    >
                      Vente hors ligne
                    </Button>
                  </div>
                )}
              </div>
            </div>
            )}

            {/* References Block */}
            <div className="bg-white border rounded-xl shadow-sm">
              <div className="flex justify-between items-center px-3 sm:px-4 py-2 sm:py-3 border-b">
                <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2">
                  <Tag className="w-4 h-4 sm:w-5 sm:h-5" /> Références
                </h3>
                {isAdmin && (
                  <button
                    onClick={handleAddReference}
                    disabled={!newReference.trim()}
                    className="text-orange-500 hover:text-orange-600 disabled:opacity-50 flex items-center gap-1 text-xs sm:text-sm"
                  >
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                )}
              </div>

              <div className="p-3 sm:p-4">
                {references2.length === 0 ? (
                  <p className="text-xs sm:text-sm text-gray-500 italic">
                    Aucune référence
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {references2.map((ref, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1.5 sm:gap-2 bg-gray-100 border border-gray-200 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm"
                      >
                        <span className="truncate max-w-[100px] sm:max-w-none">{ref}</span>
                        {isAdmin && (
                          <button
                            onClick={() => handleRemoveReference(ref)}
                            className="text-red-500 hover:text-red-700 flex-shrink-0"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Reference Input (Admin only) */}
                {isAdmin && (
                  <div className="flex gap-2 mt-3 sm:mt-4">
                    <Input
                      type="text"
                      placeholder="Nouvelle référence"
                      value={newReference}
                      onChange={(e) => setNewReference(e.target.value)}
                      className="flex-1 h-10 text-sm"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddReference();
                        }
                      }}
                    />
                    <Button
                      onClick={handleAddReference}
                      disabled={!newReference.trim()}
                      className="bg-green-600 hover:bg-green-700 text-white h-10 px-3"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Description Block */}
            <div className="bg-white border rounded-xl shadow-sm">
              <div className="flex justify-between items-center px-3 sm:px-4 py-2 sm:py-3 border-b">
                <h3 className="font-semibold text-sm sm:text-base">DESCRIPTION</h3>
                {isAdmin && !isEditingDescription && (
                  <button
                    onClick={() => {
                      setTempDescription(description2);
                      setIsEditingDescription(true);
                    }}
                    className="text-orange-500 hover:text-orange-600 flex items-center gap-1 text-xs sm:text-sm"
                  >
                    <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                )}
              </div>

              <div className="p-3 sm:p-4">
                {isEditingDescription ? (
                  <>
                    <Textarea
                      value={tempDescription}
                      onChange={(e) => setTempDescription(e.target.value)}
                      className="min-h-[100px] sm:min-h-[140px] text-sm"
                    />
                    <div className="flex gap-2 mt-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setTempDescription(description2);
                          setIsEditingDescription(false);
                        }}
                        className="h-9 text-sm"
                        disabled={isSaving}
                      >
                        <X className="w-3 h-3 sm:w-4 sm:h-4" /> Annuler
                      </Button>
                      <Button
                        onClick={handleSaveDescription}
                        className="bg-orange-500 text-white h-9 text-sm"
                        disabled={isSaving}
                      >
                        <Save className="w-3 h-3 sm:w-4 sm:h-4" /> Sauvegarder
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-700 whitespace-pre-wrap break-words text-sm sm:text-base leading-relaxed">
                    {description2 || "Aucune description disponible."}
                  </p>
                )}
              </div>
            </div>

            {/* Price Block */}
            <div className="bg-orange-50 border-2 border-orange-200 p-3 sm:p-5 rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Prix</h3>
                {isAdmin && !isEditingPrice && (
                  <button
                    onClick={() => {
                      setTempPrice(price2);
                      setIsEditingPrice(true);
                    }}
                    className="text-orange-500 hover:text-orange-600 flex items-center gap-1 text-xs sm:text-sm"
                  >
                    <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                )}
              </div>

              {isEditingPrice ? (
                <>
                  <div className="flex items-center gap-2">
                    <Input
                      value={tempPrice}
                      onChange={(e) => setTempPrice(e.target.value)}
                      className="text-xl sm:text-2xl font-bold w-32 sm:w-40 h-10"
                    />
                    <span className="text-lg sm:text-xl">DT</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setTempPrice(price2);
                        setIsEditingPrice(false);
                      }}
                      className="h-9 text-sm"
                      disabled={isSaving}
                    >
                      <X className="w-3 h-3 sm:w-4 sm:h-4" /> Annuler
                    </Button>
                    <Button
                      onClick={handleSavePrice}
                      className="bg-orange-500 text-white h-9 text-sm"
                      disabled={isSaving}
                    >
                      <Save className="w-3 h-3 sm:w-4 sm:h-4" /> Sauvegarder
                    </Button>
                  </div>
                </>
              ) : (
                <div className="p-4 border rounded-lg bg-white shadow-sm mt-4">
                  <p className="text-3xl font-bold text-orange-700">
                    {parseFloat(price2).toFixed(3)} DT
                  </p>
                </div>
              )}
            </div>

            {/* Modèle Block */}
            <div className="bg-white border rounded-xl shadow-sm">
              <div 
                className="flex justify-between items-center px-3 sm:px-4 py-2 sm:py-3 border-b cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                onClick={() => setShowModeles(!showModeles)}
              >
                <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2">
                  <Tag className="w-4 h-4 sm:w-5 sm:h-5" /> Modèle
                </h3>
                <span className="text-gray-500 text-sm">
                  {showModeles ? "▲" : "▼"}
                </span>
              </div>

              {showModeles && (
              <div className="p-3 sm:p-4 transition-all duration-300 ease-in-out">
                {/* Input and Add Button */}
                {isAdmin && (
                  <div className="flex gap-2 mb-4">
                    <Input
                      type="text"
                      placeholder="Nouveau modèle"
                      value={newModele}
                      onChange={(e) => setNewModele(e.target.value)}
                      className="flex-1 h-10 text-sm"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddModele();
                        }
                      }}
                    />
                    <Button
                      onClick={handleAddModele}
                      disabled={!newModele.trim() || isSaving}
                      className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-4"
                    >
                      <Plus className="w-4 h-4 mr-1" /> Ajouter
                    </Button>
                  </div>
                )}

                {/* List of Modeles */}
                {modeles.length === 0 ? (
                  <p className="text-xs sm:text-sm text-gray-500 italic">
                    Aucun modèle
                  </p>
                ) : (
                  <div className="space-y-2">
                    {modeles.map((modele, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <span className="text-sm text-gray-800 flex-1">{modele}</span>
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteModele(modele)}
                            className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded transition-colors ml-2"
                            disabled={isSaving}
                            title="Supprimer le modèle"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              )}
            </div>

            {/* Cart and Checkout Buttons */}
            <div className="flex flex-col gap-4 mt-6 w-full max-w-md">
              <Button
                onClick={addToCart}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold h-12 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
              >
                Ajouter au panier
              </Button>
              <Button
                onClick={goToCheckout}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold h-12 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
              >
                Commander
              </Button>
            </div>

            {/* Add to Dashboard Button (Admin only) */}
            {isAdmin && (
              <Button
                onClick={handleAddToDashboard}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 sm:py-5 text-sm sm:text-base lg:text-lg h-auto"
              >
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> Add to Dashboard
              </Button>
            )}
          </section>
        </div>
      </main>

      <Footer />

      {/* Order Modal */}
      <Dialog open={isOrderModalOpen} onOpenChange={setIsOrderModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Commander ce produit</DialogTitle>
            <DialogDescription>
              Remplissez vos informations pour passer commande.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Summary Box */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Produit:</span>
                <span className="font-semibold">{productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Marque:</span>
                <span className="font-semibold">-</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Modèle:</span>
                <span className="font-semibold">{selectedModel || modeles[0] || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Réf:</span>
                <span className="font-semibold">{references2.join(", ") || "-"}</span>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom <span className="text-red-500">*</span>
                </label>
                <Input
                  value={orderForm.nom}
                  onChange={(e) => handleOrderFormChange("nom", e.target.value)}
                  className={orderErrors.nom ? "border-red-500" : ""}
                  placeholder="Nom"
                />
                {orderErrors.nom && (
                  <p className="text-xs text-red-500 mt-0.5">{orderErrors.nom}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom <span className="text-red-500">*</span>
                </label>
                <Input
                  value={orderForm.prenom}
                  onChange={(e) => handleOrderFormChange("prenom", e.target.value)}
                  className={orderErrors.prenom ? "border-red-500" : ""}
                  placeholder="Prénom"
                />
                {orderErrors.prenom && (
                  <p className="text-xs text-red-500 mt-0.5">{orderErrors.prenom}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone <span className="text-red-500">*</span>
                </label>
                <Input
                  type="tel"
                  value={orderForm.telephone}
                  onChange={(e) => handleOrderFormChange("telephone", e.target.value)}
                  className={orderErrors.telephone ? "border-red-500" : ""}
                  placeholder="XX XXX XXX"
                />
                {orderErrors.telephone && (
                  <p className="text-xs text-red-500 mt-0.5">{orderErrors.telephone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gouvernorat <span className="text-red-500">*</span>
                </label>
                <Select
                  value={orderForm.wilaya}
                  onValueChange={(value) => {
                    handleOrderFormChange("wilaya", value);
                    handleOrderFormChange("delegation", ""); // Reset delegation when wilaya changes
                  }}
                >
                  <SelectTrigger className={orderErrors.wilaya ? "border-red-500" : ""}>
                    <SelectValue placeholder="Sélectionner un gouvernorat" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(governorates).map((gov) => (
                      <SelectItem key={gov} value={gov}>{gov}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {orderErrors.wilaya && (
                  <p className="text-xs text-red-500 mt-0.5">{orderErrors.wilaya}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Délégation <span className="text-red-500">*</span>
                </label>
                <Select
                  value={orderForm.delegation}
                  onValueChange={(value) => handleOrderFormChange("delegation", value)}
                  disabled={!orderForm.wilaya}
                >
                  <SelectTrigger className={orderErrors.delegation ? "border-red-500" : ""}>
                    <SelectValue placeholder={orderForm.wilaya ? "Sélectionner une délégation" : "Gouvernorat d'abord"} />
                  </SelectTrigger>
                  <SelectContent>
                    {orderForm.wilaya && governorates[orderForm.wilaya]?.map((del) => (
                      <SelectItem key={del} value={del}>{del}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {orderErrors.delegation && (
                  <p className="text-xs text-red-500 mt-0.5">{orderErrors.delegation}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantité <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  min="1"
                  value={orderForm.quantite}
                  onChange={(e) => handleOrderFormChange("quantite", parseInt(e.target.value) || 1)}
                  className={orderErrors.quantite ? "border-red-500" : ""}
                />
                {orderErrors.quantite && (
                  <p className="text-xs text-red-500 mt-0.5">La quantité doit être d'au moins 1</p>
                )}
              </div>
            </div>

            {/* Price Summary */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Prix unitaire (original):</span>
                <span className="font-semibold">{parseFloat(price2).toFixed(3)} DT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Prix unitaire (promo):</span>
                <span className="font-semibold">{parseFloat(price2).toFixed(3)} DT</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-orange-300">
                <span className="text-lg font-bold text-gray-900">Total estimé:</span>
                <span className="text-lg font-bold text-orange-600">
                  {(parseFloat(price2) * orderForm.quantite).toFixed(3)} DT
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-3">
            <Button
              onClick={() => setIsOrderModalOpen(false)}
              className="bg-white text-gray-700 border border-gray-300 rounded-xl h-12 hover:bg-gray-100"
              disabled={isSubmittingOrder}
            >
              Fermer
            </Button>
            <Button
              onClick={handleSubmitOrder}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl h-12 flex items-center gap-2"
              disabled={isSubmittingOrder}
            >
              {isSubmittingOrder ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Envoi...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Valider la commande</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Acha2;

