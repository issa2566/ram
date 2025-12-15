import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  ChevronRight,
} from "lucide-react";

import FamilleCard from "./FamilleCard";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getSectionContent,
  updateSectionContent,
  type SectionContentData,
} from "@/api/database";

type FamilleItem = {
  id: string;
  title: string;
  image: string;
  subcategories: string[];
};

const DEFAULT_FAMILLES: FamilleItem[] = [
  {
    id: "famille-moteur",
    title: "PIÈCES MOTEUR",
    image: "/images/moteur.png",
    subcategories: [
      "Kit de distribution",
      "Bougie d'allumage",
      "Pompe à eau",
      "Joint de culasse",
      "Support moteur",
      "Courroie trapézoïdale à nervures",
    ],
  },
  {
    id: "famille-suspension",
    title: "DIRECTIONS SUSPENSION TRAIN",
    image: "/images/suspension.png",
    subcategories: [],
  },
  {
    id: "famille-filtration",
    title: "FILTRATION",
    image: "/images/filtre.png",
    subcategories: [],
  },
  {
    id: "famille-freinage",
    title: "FREINAGE",
    image: "/images/freinage.png",
    subcategories: [],
  },
  {
    id: "famille-embrayage",
    title: "EMBRAYAGE ET BOÎTE DE VITESSE",
    image: "/images/embrayage.png",
    subcategories: [],
  },
  {
    id: "famille-clim",
    title: "PIÈCES THERMIQUES ET CLIMATISATION",
    image: "/images/climatisation.png",
    subcategories: [],
  },
  {
    id: "famille-demarrage",
    title: "DÉMARRAGE ET CHARGE",
    image: "/images/demarrage.png",
    subcategories: [],
  },
  {
    id: "famille-carrosserie",
    title: "CARROSSERIE",
    image: "/images/carrosserie.png",
    subcategories: [],
  },
  {
    id: "famille-habitacle",
    title: "PIÈCES HABITACLE",
    image: "/images/habitacle.png",
    subcategories: [],
  },
  {
    id: "famille-essuie",
    title: "BALAI D'ESSUIE-GLACE",
    image: "/images/essuie-glace.png",
    subcategories: [],
  },
  {
    id: "famille-phares",
    title: "OPTIQUES, PHARES ET AMPOULES",
    image: "/images/phares.png",
    subcategories: [],
  },
  {
    id: "famille-echappement",
    title: "ÉCHAPPEMENT",
    image: "/images/echappement.png",
    subcategories: [],
  },
];

const FamilleSection = () => {
  const { toast } = useToast();

  const [familles, setFamilles] = useState<FamilleItem[]>(DEFAULT_FAMILLES);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const [addSubIndex, setAddSubIndex] = useState<number | null>(null);
  const [newSubText, setNewSubText] = useState("");
  const [editSub, setEditSub] = useState<{
    familleIndex: number;
    subIndex: number;
  } | null>(null);
  const [editSubText, setEditSubText] = useState("");

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const isAdmin = user && user.role === "admin";

  const saveFamillesToDB = async (nextFamilles: FamilleItem[]) => {
    try {
      const section = await getSectionContent("famille_categories");

      const newSection: SectionContentData = section
        ? {
            id: section.id,
            sectionType: "famille_categories",
            title: "FAMILLES DES PIÈCES",
            content: nextFamilles,
          }
        : {
            sectionType: "famille_categories",
            title: "FAMILLES DES PIÈCES",
            content: nextFamilles,
          };

      await updateSectionContent("famille_categories", newSection);
      setFamilles(nextFamilles);
    } catch (error) {
      console.error("Error saving famille_categories:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer les sous-catégories",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const section = await getSectionContent("famille_categories");

        if (section && section.content) {
          const content =
            typeof section.content === "string"
              ? JSON.parse(section.content)
              : section.content;

          if (Array.isArray(content) && content.length > 0) {
            setFamilles(content as FamilleItem[]);
          } else {
            await saveFamillesToDB(DEFAULT_FAMILLES);
          }
        } else {
          await saveFamillesToDB(DEFAULT_FAMILLES);
        }
      } catch (error) {
        console.error("Error loading famille_categories:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les familles de pièces",
          variant: "destructive",
        });
        setFamilles(DEFAULT_FAMILLES);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [toast]);

  const handleToggleCard = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
    setAddSubIndex(null);
    setEditSub(null);
  };

  const startAddSub = (index: number) => {
    if (!isAdmin) return;
    setAddSubIndex(index);
    setNewSubText("");
    setEditSub(null);
  };

  const confirmAddSub = async () => {
    if (addSubIndex === null || !newSubText.trim()) return;

    const next = [...familles];
    const target = next[addSubIndex];
    const list = Array.isArray(target.subcategories)
      ? [...target.subcategories]
      : [];

    list.push(newSubText.trim());
    next[addSubIndex] = { ...target, subcategories: list };

    try {
      await saveFamillesToDB(next);
      setAddSubIndex(null);
      setNewSubText("");
      toast({
        title: "Succès",
        description: "Sous-catégorie ajoutée avec succès",
      });
    } catch {}
  };

  const cancelAddSub = () => {
    setAddSubIndex(null);
    setNewSubText("");
  };

  const startEditSub = (familleIndex: number, subIndex: number) => {
    if (!isAdmin) return;
    const value = familles[familleIndex].subcategories[subIndex];
    setEditSub({ familleIndex, subIndex });
    setEditSubText(value);
    setAddSubIndex(null);
  };

  const confirmEditSub = async () => {
    if (!editSub || !editSubText.trim()) return;

    const next = [...familles];
    const list = [...next[editSub.familleIndex].subcategories];

    list[editSub.subIndex] = editSubText.trim();
    next[editSub.familleIndex] = {
      ...next[editSub.familleIndex],
      subcategories: list,
    };

    try {
      await saveFamillesToDB(next);
      setEditSub(null);
      setEditSubText("");
      toast({
        title: "Succès",
        description: "Sous-catégorie modifiée avec succès",
      });
    } catch {}
  };

  const cancelEditSub = () => {
    setEditSub(null);
    setEditSubText("");
  };

  const handleDeleteSub = async (familleIndex: number, subIndex: number) => {
    if (!isAdmin) return;
    if (!confirm("Supprimer cette sous-catégorie ?")) return;

    const next = [...familles];
    const list = [...next[familleIndex].subcategories];
    list.splice(subIndex, 1);
    next[familleIndex] = { ...next[familleIndex], subcategories: list };

    try {
      await saveFamillesToDB(next);
      toast({
        title: "Succès",
        description: "Sous-catégorie supprimée avec succès",
      });
    } catch {}
  };

  return (
    <section className="py-8 sm:py-12 md:py-16 bg-gray-100">
      <div className="max-w-7xl mx-auto px-0 sm:px-4 md:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6 sm:mb-8 md:mb-12 text-gray-900 uppercase tracking-wide">
          FAMILLES DES PIÈCES
        </h2>

        {loading ? (
          <div className="py-16 text-center">
            <div className="inline-block h-8 w-8 rounded-full border-b-2 border-orange-500 animate-spin" />
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        ) : (
          <div className="
            grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6
            max-md:flex max-md:overflow-x-auto max-md:overflow-y-hidden max-md:snap-x max-md:snap-mandatory max-md:scroll-smooth max-md:pl-4 max-md:gap-4 max-md:justify-start
            max-md:-mx-4 md:mx-0
            [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]
          ">
            {familles.map((famille, index) => {
              const isExpanded = expandedIndex === index;

              return (
                <div key={famille.id} className="bg-transparent flex flex-col max-md:snap-start max-md:min-w-[250px] max-md:flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleCard(index)}
                    className="text-left"
                  >
                    <FamilleCard
                      title={famille.title}
                      image={famille.image}
                      isExpanded={isExpanded}
                    />
                  </button>

                  <div
                    className={`mt-1 overflow-hidden bg-white rounded-b-xl shadow-sm border border-t-0 border-gray-200 transition-all duration-300 ${
                      isExpanded ? "max-h-80 py-3 px-4" : "max-h-0 py-0 px-4"
                    }`}
                  >
                    {isExpanded && (
                      <>
                        {famille.subcategories.length === 0 ? (
                          <p className="text-sm text-gray-500 mb-2">
                            Aucune sous-catégorie pour le moment.
                          </p>
                        ) : (
                          <ul className="space-y-1 mb-2">
                            {famille.subcategories.map((sub, subIndex) => {
                              const isEditingSub =
                                editSub &&
                                editSub.familleIndex === index &&
                                editSub.subIndex === subIndex;

                              if (isEditingSub) {
                                return (
                                  <li
                                    key={subIndex}
                                    className="flex items-center gap-2"
                                  >
                                    <ChevronRight className="h-4 w-4 text-orange-500" />
                                    <Input
                                      value={editSubText}
                                      onChange={(e) =>
                                        setEditSubText(e.target.value)
                                      }
                                      className="h-8 text-sm flex-1"
                                    />
                                    <Button
                                      size="icon"
                                      className="h-8 w-8 bg-green-600 hover:bg-green-700"
                                      onClick={confirmEditSub}
                                    >
                                      <Save className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="outline"
                                      className="h-8 w-8"
                                      onClick={cancelEditSub}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </li>
                                );
                              }

                              return (
                                <li
                                  key={subIndex}
                                  className="flex items-center gap-2 text-sm text-gray-700 border-b border-gray-100 pb-1 last:border-0"
                                >
                                  <ChevronRight className="h-4 w-4 text-orange-500" />
                                  <a
                                    href={`/acha2?name=${encodeURIComponent(sub)}`}
                                    className="flex-1 text-blue-700 hover:text-orange-600 transition-colors"
                                    onClick={(e) => {
                                      // Allow link navigation only when clicking the text
                                      // Admin edit/delete buttons will stop propagation
                                    }}
                                  >
                                    {sub}
                                  </a>

                                  {isAdmin && (
                                    <div className="flex items-center gap-1">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          e.preventDefault();
                                          startEditSub(index, subIndex);
                                        }}
                                        className="p-1 rounded hover:bg-gray-100 text-blue-600"
                                      >
                                        <Edit3 className="h-4 w-4" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          e.preventDefault();
                                          handleDeleteSub(index, subIndex);
                                        }}
                                        className="p-1 rounded hover:bg-gray-100 text-red-600"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        )}

                        {isAdmin && (
                          <div className="pt-2 border-t border-gray-100">
                            {addSubIndex === index ? (
                              <div className="flex items-center gap-2">
                                <Input
                                  value={newSubText}
                                  onChange={(e) =>
                                    setNewSubText(e.target.value)
                                  }
                                  placeholder="Nom de la sous-catégorie"
                                  className="h-8 text-sm"
                                />
                                <Button
                                  size="icon"
                                  className="h-8 w-8 bg-orange-500 hover:bg-orange-600"
                                  onClick={confirmAddSub}
                                  disabled={!newSubText.trim()}
                                >
                                  <Save className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-8 w-8"
                                  onClick={cancelAddSub}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => startAddSub(index)}
                                className="flex items-center gap-1 text-xs sm:text-sm text-orange-600 hover:text-orange-700 font-medium"
                              >
                                <Plus className="h-4 w-4" />
                                Ajouter une sous-catégorie
                              </button>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default FamilleSection;
