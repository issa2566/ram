import { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { uploadImage } from "@/services/uploadService";
import { getSectionContent, updateSectionContent } from "@/api/database";
import { Edit2, Save, X, Upload, Camera } from "lucide-react";

interface HuileCard {
  id: number;
  title: string;
  image: string;
}

const DEFAULT_CARDS: HuileCard[] = [
  {
    id: 1,
    title: "Huile Moteur Premium",
    image: "/pp.jpg"
  },
  {
    id: 2,
    title: "Additifs Performance",
    image: "/pp.jpg"
  },
  {
    id: 3,
    title: "Huile Transmission",
    image: "/pp.jpg"
  }
];

const HuilePage = () => {
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [cards, setCards] = useState<HuileCard[]>(DEFAULT_CARDS);
  const [editingCardId, setEditingCardId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  const isAdmin = user && (user.role === "admin" || user.isAdmin === true);

  // Load cards from database
  useEffect(() => {
    const loadCards = async () => {
      try {
        const section = await getSectionContent("huile_cards");
        if (section && section.content) {
          const content = typeof section.content === "string" 
            ? JSON.parse(section.content) 
            : section.content;
          
          if (Array.isArray(content) && content.length > 0) {
            setCards(content);
          }
        }
      } catch (error) {
        console.error("Error loading huile cards:", error);
      }
    };

    loadCards();
  }, []);

  // Check admin status
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setUser(parsed);
      } catch (e) {
        // Ignore
      }
    }
  }, []);

  // Save cards to database
  const saveCards = async (updatedCards: HuileCard[]) => {
    try {
      await updateSectionContent("huile_cards", {
        sectionType: "huile_cards",
        title: "Huiles & Additifs Premium",
        content: updatedCards
      });
      setCards(updatedCards);
      toast({
        title: "Succès",
        description: "Modifications enregistrées avec succès",
      });
    } catch (error) {
      console.error("Error saving cards:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer les modifications",
        variant: "destructive",
      });
    }
  };

  // Enter edit mode
  const handleEdit = (cardId: number) => {
    const card = cards.find(c => c.id === cardId);
    if (card) {
      setEditingCardId(cardId);
      setEditTitle(card.title);
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingCardId(null);
    setEditTitle("");
  };

  // Save title
  const handleSaveTitle = async (cardId: number) => {
    if (!editTitle.trim()) {
      toast({
        title: "Erreur",
        description: "Le titre ne peut pas être vide",
        variant: "destructive",
      });
      return;
    }

    const updatedCards = cards.map(card =>
      card.id === cardId ? { ...card, title: editTitle.trim() } : card
    );
    await saveCards(updatedCards);
    setEditingCardId(null);
    setEditTitle("");
  };

  // Handle image upload
  const handleImageUpload = async (cardId: number, file: File) => {
    setIsUploading(true);
    try {
      const uploadedUrl = await uploadImage(file);
      const updatedCards = cards.map(card =>
        card.id === cardId ? { ...card, image: uploadedUrl } : card
      );
      await saveCards(updatedCards);
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger l'image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Trigger file input
  const triggerFileInput = (cardId: number) => {
    fileInputRefs.current[cardId]?.click();
  };

  // Handle file change
  const handleFileChange = (cardId: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(cardId, file);
    }
    // Reset input
    if (fileInputRefs.current[cardId]) {
      fileInputRefs.current[cardId].value = "";
    }
  };

  return (
    <>
      <Header />
      
      {/* Main Content */}
      <div className="min-h-screen bg-[#f5f5f5]">
        {/* Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-12 sm:py-16 md:py-20 lg:py-24">
          
          {/* Page Header */}
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#111827] mb-4 sm:mb-5">
              Huiles & Additifs Premium
            </h1>
            {/* Small Orange Accent Line */}
            <div className="w-20 h-[2px] bg-[#f97316] mx-auto mb-5 sm:mb-6" />
            <p className="text-base sm:text-lg text-[#6b7280] max-w-2xl mx-auto leading-relaxed">
              Découvrez nos meilleures huiles et additifs pour votre véhicule
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10 lg:gap-12">
            {cards.map((card, index) => {
              const isEditing = editingCardId === card.id;

              return (
                <div
                  key={card.id}
                  className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-[#e5e7eb]"
                >
                  {/* Image Container - Clean, No Overlays for Users */}
                  <div className="relative h-48 sm:h-56 md:h-64 lg:h-72 overflow-hidden bg-gray-100">
                    <img
                      src={card.image || "/pp.jpg"}
                      alt={card.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/pp.jpg";
                      }}
                    />
                    
                    {/* Orange Accent Line Below Image */}
                    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#f97316]" />
                    
                    {/* Admin Edit Icon - Small, Discreet, Only on Hover */}
                    {isAdmin && !isEditing && (
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                        <button
                          onClick={() => triggerFileInput(card.id)}
                          className="bg-white/90 rounded-full p-2 shadow-sm border border-[#f97316] hover:bg-white transition-colors duration-200"
                          aria-label="Changer l'image"
                        >
                          <Camera className="w-3.5 h-3.5 text-[#f97316]" />
                        </button>
                      </div>
                    )}

                    {/* Hidden File Input */}
                    {isAdmin && (
                      <input
                        ref={(el) => {
                          fileInputRefs.current[card.id] = el;
                        }}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(card.id, e)}
                        className="hidden"
                      />
                    )}

                    {/* Upload Loading Overlay */}
                    {isUploading && isEditing && editingCardId === card.id && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                        <div className="bg-white rounded-full p-4 shadow-lg">
                          <div className="w-6 h-6 border-2 border-[#f97316] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-6 sm:p-7 md:p-8">
                    {/* Title Section */}
                    {isEditing ? (
                      <div className="space-y-4">
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          placeholder="Titre de la carte"
                          className="text-lg font-semibold border-2 border-[#f97316] focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/20"
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleSaveTitle(card.id)}
                            disabled={isUploading || !editTitle.trim()}
                            className="flex-1 bg-[#111827] hover:bg-[#111827]/90 text-white"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Enregistrer
                          </Button>
                          <Button
                            onClick={handleCancelEdit}
                            variant="outline"
                            disabled={isUploading}
                            className="flex-1 border-[#e5e7eb] text-[#6b7280] hover:bg-[#f5f5f5]"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Annuler
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Title - Clean Typography */}
                        <h3 className="text-xl sm:text-2xl font-semibold text-[#111827] mb-6 sm:mb-7 min-h-[3rem] leading-relaxed">
                          {card.title}
                        </h3>

                        {/* Admin Edit Button - Hidden by Default, Appears on Hover */}
                        {isAdmin && (
                          <div className="mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Button
                              onClick={() => handleEdit(card.id)}
                              variant="outline"
                              size="sm"
                              className="w-full border border-[#f97316] text-[#f97316] hover:bg-[#f97316] hover:text-white text-xs py-1.5 h-auto font-medium transition-colors duration-200"
                            >
                              <Edit2 className="w-3 h-3 mr-1.5" />
                              Modifier
                            </Button>
                          </div>
                        )}

                        {/* Voir Plus Button - Black Background, Orange on Hover */}
                        <Button
                          className="w-full bg-[#111827] hover:bg-[#f97316] text-white font-medium py-4 rounded-xl uppercase tracking-wide transition-colors duration-200 hover:text-[#111827]"
                        >
                          Voir plus
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>


      <Footer />
    </>
  );
};

export default HuilePage;
