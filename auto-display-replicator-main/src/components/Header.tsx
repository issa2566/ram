import React from "react";
import { Search, ChevronDown, ChevronUp, Heart, ShoppingCart, User, Menu, X, MessageCircle, Settings, Disc, Filter, Lock, Snowflake, Zap, Fuel, Shield, Car, ThermometerSnowflake, Wind, Wrench, Lightbulb, FileText, Eye, Gauge, Compass, Link2, Sparkles, Droplets, AirVent, Wind as WindIcon, Circle, Activity, Sparkles as SparkPlug, Battery, Cog as Engine, Feather, Wrench as Wrench2, DoorOpen, Thermometer, Cog, Fan, Minus, Hammer, Sun, Circle as Generic, Fuel as FuelPump, Thermometer as Heat, Navigation, Cog as Maintenance, CreditCard, Truck, Globe, RotateCcw, Tag, PenTool, Mail, Star, Wrench as WrenchIcon, Wind as Wiper, Wind as WindshieldWiper, Cog as CogIcon, Gauge as GaugeIcon, Sparkles as SparkPlugIcon, Minus as ExhaustIcon, Car as CarIcon, Zap as ZapIcon, Cog as CogIcon2, Battery as BatteryIcon, Fuel as FuelIcon, Cog as CogIcon3, Settings as SettingsIcon, Wind as WindIcon2, Lightbulb as LightbulbIcon, Fan as FanIcon, Snowflake as SnowflakeIcon, Cog as CogIcon4, Zap as ZapIcon2, Wrench as WrenchIcon2, DoorOpen as DoorOpenIcon, Wrench as WrenchIcon3, Car as CarIcon2, Droplets as DropletsIcon, Sparkles as SparklesIcon, Car as CarIcon3, Wrench as WrenchIcon4, Lightbulb as LightbulbIcon2, Clock, LogOut, Home, ArrowRight, Facebook, Instagram, Phone, Info, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { getSearchOptions, createSearchOption, deleteSearchOptionByValue } from "@/api/search";
import SearchBar from "./Header/SearchBar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";

const Header = () => {
  const [user, setUser] = useState<any>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchInputs, setSearchInputs] = useState({
    marque: '',
    modele: '',
    annee: ''
  });
  const [savedOptions, setSavedOptions] = useState({
    marques: ['Honda', 'Volkswagen', 'Infiniti', 'Kia'],
    modeles: [],
    annees: []
  });
  
  // State for filter names management (admin only)
  const [filterNames, setFilterNames] = useState({
    'Filtre à huile': 'Filtre à huile',
    'Filtre à air': 'Filtre à air', 
    'Filtre d\'habitacle': 'Filtre d\'habitacle',
    'Filtre à carburant': 'Filtre à carburant'
  });
  
  // State for editing filter names
  const [editingFilter, setEditingFilter] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  
  // State for deleted filters
  const [deletedFilters, setDeletedFilters] = useState<string[]>([]);
  
  // State for custom filters (new filters added by admin)
  const [customFilters, setCustomFilters] = useState<any[]>([]);
  
  // State for adding new filter with image
  const [showAddFilterForm, setShowAddFilterForm] = useState(false);
  const [newFilterData, setNewFilterData] = useState({
    name: '',
    image: ''
  });
  const [selectedFilterImage, setSelectedFilterImage] = useState<File | null>(null);
  const [filterImagePreview, setFilterImagePreview] = useState<string>('');
  
  // State for adding links to each filter
  const [showAddLinkForm, setShowAddLinkForm] = useState<string | null>(null);
  const [newFilterLinkData, setNewFilterLinkData] = useState({
    name: '',
    image: ''
  });
  const [selectedLinkImage, setSelectedLinkImage] = useState<File | null>(null);
  const [linkImagePreview, setLinkImagePreview] = useState<string>('');
  
  // State for adding new link
  const [showAddLinkModal, setShowAddLinkModal] = useState(false);
  const [newLinkData, setNewLinkData] = useState({
    name: '',
    image: '',
    url: ''
  });
  
  // State for inline add link form
  const [showInlineForm, setShowInlineForm] = useState(false);
  const [inlineLinkData, setInlineLinkData] = useState({
    name: '',
    image: '',
    url: ''
  });
  const [customLinks, setCustomLinks] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  
  // State for editing custom links
  const [editingLink, setEditingLink] = useState<string | null>(null);
  const [editLinkData, setEditLinkData] = useState({
    name: '',
    image: ''
  });
  const [editImagePreview, setEditImagePreview] = useState<string>('');
  const [dropdownOpen, setDropdownOpen] = useState({
    marque: false,
    modele: false,
    annee: false
  });
  const [showSearchFields, setShowSearchFields] = useState(true);
  const [showMobileSearch, setShowMobileSearch] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [filtresDropdownOpen, setFiltresDropdownOpen] = useState(false);
  const [freinDropdownOpen, setFreinDropdownOpen] = useState(false);
  const [cartCount, setCartCount] = useState(3);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  // Dropdown hover delay ref for better UX on large screens
  const closeTimeoutRef = useRef<number | null>(null);
  
  // Dropdown handlers with delay for better hover behavior
  const openFiltres = () => {
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setFiltresDropdownOpen(true);
  };
  
  const closeFiltres = () => {
    closeTimeoutRef.current = window.setTimeout(() => {
      setFiltresDropdownOpen(false);
      closeTimeoutRef.current = null;
    }, 220);
  };
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        window.clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
    };
  }, []);
  
  // State for Frein section editing
  const [freinFilterNames, setFreinFilterNames] = useState({
    'Disque de frein': 'Disque de frein',
    'Plaquette de frein': 'Plaquette de frein',
    'Flexible de frein': 'Flexible de frein',
    'Étrier de frein': 'Étrier de frein',
    'Câble de frein à main': 'Câble de frein à main',
    'Mâchoires de frein': 'Mâchoires de frein',
    'Cylindre de roue': 'Cylindre de roue',
    'Témoin d\'usure plaquette de frein': 'Témoin d\'usure plaquette de frein',
    'Kit de réparation d\'étrier de frein': 'Kit de réparation d\'étrier de frein'
  });
  const [editingFreinFilter, setEditingFreinFilter] = useState<string | null>(null);
  const [freinEditValue, setFreinEditValue] = useState('');
  const [deletedFreinFilters, setDeletedFreinFilters] = useState<string[]>([]);
  const [suspensionDropdownOpen, setSuspensionDropdownOpen] = useState(false);
  
  // State for Suspension section editing
  const [suspensionFilterNames, setSuspensionFilterNames] = useState({
    'Amortisseur': 'Amortisseur',
    'Ressort': 'Ressort',
    'Bras de suspension': 'Bras de suspension',
    'Roulement de roue': 'Roulement de roue',
    'Biellette de direction': 'Biellette de direction'
  });
  const [editingSuspensionFilter, setEditingSuspensionFilter] = useState<string | null>(null);
  const [suspensionEditValue, setSuspensionEditValue] = useState('');
  const [deletedSuspensionFilters, setDeletedSuspensionFilters] = useState<string[]>([]);
  const [courroieDropdownOpen, setCourroieDropdownOpen] = useState(false);
  
  // State for Commande à courroie / chaine section editing
  const [courroieFilterNames, setCourroieFilterNames] = useState({
    'Courroie de distribution': 'Courroie de distribution',
    'Courroie accessoire': 'Courroie accessoire',
    'Tendeur de courroie': 'Tendeur de courroie',
    'Galet tendeur': 'Galet tendeur',
    'Poulie de vilebrequin': 'Poulie de vilebrequin',
    'Poulie de pompe à eau': 'Poulie de pompe à eau'
  });
  const [editingCourroieFilter, setEditingCourroieFilter] = useState<string | null>(null);
  const [courroieEditValue, setCourroieEditValue] = useState('');
  const [deletedCourroieFilters, setDeletedCourroieFilters] = useState<string[]>([]);
  const [carrosserieDropdownOpen, setCarrosserieDropdownOpen] = useState(false);
  
  // State for Carrosserie section editing
  const [carrosserieFilterNames, setCarrosserieFilterNames] = useState({
    'Pare-chocs': 'Pare-chocs',
    'Aile': 'Aile',
    'Porte': 'Porte',
    'Capot': 'Capot',
    'Coffre': 'Coffre',
    'Rétroviseur': 'Rétroviseur'
  });
  const [editingCarrosserieFilter, setEditingCarrosserieFilter] = useState<string | null>(null);
  const [carrosserieEditValue, setCarrosserieEditValue] = useState('');
  const [deletedCarrosserieFilters, setDeletedCarrosserieFilters] = useState<string[]>([]);
  const [moteurDropdownOpen, setMoteurDropdownOpen] = useState(false);
  
  // State for Moteur section editing
  const [moteurFilterNames, setMoteurFilterNames] = useState({
    'Bloc moteur': 'Bloc moteur',
    'Cylindre': 'Cylindre',
    'Piston': 'Piston',
    'Bielle': 'Bielle',
    'Vilebrequin': 'Vilebrequin',
    'Arbre à cames': 'Arbre à cames'
  });
  const [editingMoteurFilter, setEditingMoteurFilter] = useState<string | null>(null);
  const [moteurEditValue, setMoteurEditValue] = useState('');
  const [deletedMoteurFilters, setDeletedMoteurFilters] = useState<string[]>([]);
  const [amortissementDropdownOpen, setAmortissementDropdownOpen] = useState(false);
  
  // State for Amortissement section editing
  const [amortissementFilterNames, setAmortissementFilterNames] = useState({
    'Amortisseur avant': 'Amortisseur avant',
    'Amortisseur arrière': 'Amortisseur arrière',
    'Ressort hélicoïdal': 'Ressort hélicoïdal',
    'Ressort à lames': 'Ressort à lames',
    'Silentbloc': 'Silentbloc',
    'Bras de suspension': 'Bras de suspension'
  });
  const [editingAmortissementFilter, setEditingAmortissementFilter] = useState<string | null>(null);
  const [amortissementEditValue, setAmortissementEditValue] = useState('');
  const [deletedAmortissementFilters, setDeletedAmortissementFilters] = useState<string[]>([]);
  const [essuieGlacesDropdownOpen, setEssuieGlacesDropdownOpen] = useState(false);
  const [directionDropdownOpen, setDirectionDropdownOpen] = useState(false);
  const [jointsDropdownOpen, setJointsDropdownOpen] = useState(false);
  const [refroidissementDropdownOpen, setRefroidissementDropdownOpen] = useState(false);
  const [allumageDropdownOpen, setAllumageDropdownOpen] = useState(false);
  const [echappementDropdownOpen, setEchappementDropdownOpen] = useState(false);
  const [interieurDropdownOpen, setInterieurDropdownOpen] = useState(false);
  const [capteursDropdownOpen, setCapteursDropdownOpen] = useState(false);
  const [embrayageDropdownOpen, setEmbrayageDropdownOpen] = useState(false);
  const [electriciteDropdownOpen, setElectriciteDropdownOpen] = useState(false);
  const [carburantDropdownOpen, setCarburantDropdownOpen] = useState(false);
  const [transmissionDropdownOpen, setTransmissionDropdownOpen] = useState(false);
  const [boiteVitesseDropdownOpen, setBoiteVitesseDropdownOpen] = useState(false);
  const [duritesDropdownOpen, setDuritesDropdownOpen] = useState(false);
  const [ampoulesDropdownOpen, setAmpoulesDropdownOpen] = useState(false);
  const [chauffageDropdownOpen, setChauffageDropdownOpen] = useState(false);
  const [climatisationDropdownOpen, setClimatisationDropdownOpen] = useState(false);
  const [pouliesDropdownOpen, setPouliesDropdownOpen] = useState(false);
  const [relaisDropdownOpen, setRelaisDropdownOpen] = useState(false);
  const [kitsReparationDropdownOpen, setKitsReparationDropdownOpen] = useState(false);
  const [portesDropdownOpen, setPortesDropdownOpen] = useState(false);
  const [tuningDropdownOpen, setTuningDropdownOpen] = useState(false);

  // دالة تسجيل الخروج
  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('userLogout'));
    window.location.href = '/';
  };

  // دالة بدء تعديل اسم الفلتر
  const handleEditFilter = (filterKey: string) => {
    console.log('🔧 محاولة تعديل الفلتر:', filterKey);
    console.log('👤 المستخدم الحالي:', user);
    console.log('🔑 دور المستخدم:', user?.role);
    setEditingFilter(filterKey);
    setEditValue(filterNames[filterKey as keyof typeof filterNames]);
  };

  // دالة حفظ اسم الفلتر الجديد
  const handleSaveFilter = () => {
    if (editingFilter && editValue.trim()) {
      const newFilterNames = {
        ...filterNames,
        [editingFilter]: editValue.trim()
      };
      setFilterNames(newFilterNames);
      localStorage.setItem('filterNames', JSON.stringify(newFilterNames));
      setEditingFilter(null);
      setEditValue('');
    }
  };

  // دالة إلغاء تعديل اسم الفلتر
  const handleCancelEdit = () => {
    setEditingFilter(null);
    setEditValue('');
  };

  // دالة حذف الفلتر
  const handleDeleteFilter = (filterKey: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الفلتر؟')) {
      // إضافة الفلتر إلى قائمة المحذوفة
      const newDeletedFilters = [...deletedFilters, filterKey];
      setDeletedFilters(newDeletedFilters);
      localStorage.setItem('deletedFilters', JSON.stringify(newDeletedFilters));
    }
  };

  // دالة استعادة الفلتر المحذوف
  const handleRestoreFilter = (filterKey: string) => {
    const newDeletedFilters = deletedFilters.filter(filter => filter !== filterKey);
    setDeletedFilters(newDeletedFilters);
    localStorage.setItem('deletedFilters', JSON.stringify(newDeletedFilters));
  };

  // دالة إضافة رابط جديد
  const handleAddNewLink = () => {
    if (newLinkData.name.trim() && newLinkData.url.trim()) {
      // حفظ الرابط الجديد في localStorage
      const existingLinks = JSON.parse(localStorage.getItem('customLinks') || '[]');
      const newLink = {
        id: Date.now().toString(),
        name: newLinkData.name.trim(),
        image: newLinkData.image.trim(),
        url: newLinkData.url.trim(),
        createdAt: new Date().toISOString()
      };
      
      const updatedLinks = [...existingLinks, newLink];
      localStorage.setItem('customLinks', JSON.stringify(updatedLinks));
      
      // إعادة تعيين النموذج
      setNewLinkData({ name: '', image: '', url: '' });
      setShowAddLinkModal(false);
      
      alert('تم إضافة الرابط بنجاح!');
    } else {
      alert('يرجى ملء جميع الحقول المطلوبة');
    }
  };

  // دالة معالجة رفع الصور
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // التحقق من نوع الملف
      if (!file.type.startsWith('image/')) {
        alert('يرجى اختيار ملف صورة صالح');
        return;
      }
      
      // التحقق من حجم الملف (5MB كحد أقصى)
      if (file.size > 5 * 1024 * 1024) {
        alert('حجم الصورة كبير جداً. الحد الأقصى 5MB');
        return;
      }
      
      setSelectedImage(file);
      
      // إنشاء معاينة للصورة
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // دالة مساعدة لحفظ البيانات في localStorage مع معالجة الأخطاء
  const safeLocalStorageSet = (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        // محاولة مسح البيانات القديمة
        try {
          localStorage.removeItem(key);
          localStorage.setItem(key, JSON.stringify(value));
          alert('تم مسح البيانات القديمة وحفظ البيانات الجديدة.');
          return true;
        } catch (retryError) {
          // محاولة مسح جميع البيانات المتعلقة بالفلاتر
          try {
            localStorage.removeItem('customFilters');
            localStorage.removeItem('customLinks');
            localStorage.removeItem('filterNames');
            localStorage.setItem(key, JSON.stringify(value));
            alert('تم مسح جميع البيانات القديمة وحفظ البيانات الجديدة.');
            return true;
          } catch (finalError) {
            alert('تم امتلاء مساحة التخزين. يرجى حذف بعض البيانات أو استخدام صور أصغر.');
            return false;
          }
        }
      } else {
        console.error('خطأ في حفظ البيانات:', error);
      }
      return false;
    }
  };

  // دالة معالجة رفع صورة الفلتر
  const handleFilterImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // التحقق من نوع الملف
      if (!file.type.startsWith('image/')) {
        alert('يرجى اختيار ملف صورة صالح');
        return;
      }
      
      // التحقق من حجم الملف (5MB كحد أقصى)
      if (file.size > 5 * 1024 * 1024) {
        alert('حجم الصورة كبير جداً. الحد الأقصى 5MB');
        return;
      }
      
      setSelectedFilterImage(file);
      
      // إنشاء معاينة للصورة
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilterImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // دالة معالجة رفع الصور للتعديل
  const handleEditImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // التحقق من نوع الملف
      if (!file.type.startsWith('image/')) {
        alert('يرجى اختيار ملف صورة صالح');
        return;
      }
      
      // التحقق من حجم الملف (5MB كحد أقصى)
      if (file.size > 5 * 1024 * 1024) {
        alert('حجم الصورة كبير جداً. الحد الأقصى 5MB');
        return;
      }
      
      // إنشاء معاينة للصورة
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // دالة معالجة رفع صورة الرابط
  const handleLinkImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // التحقق من نوع الملف
      if (!file.type.startsWith('image/')) {
        alert('يرجى اختيار ملف صورة صالح');
        return;
      }
      
      // التحقق من حجم الملف (1MB كحد أقصى لتجنب امتلاء localStorage)
      if (file.size > 1 * 1024 * 1024) {
        alert('حجم الصورة كبير جداً. الحد الأقصى 1MB');
        return;
      }
      
      setSelectedLinkImage(file);
      
      // إنشاء معاينة للصورة مع ضغط
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // تحديد أبعاد الصورة المضغوطة
          const maxWidth = 200;
          const maxHeight = 200;
          let { width, height } = img;
          
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
          
          ctx?.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setLinkImagePreview(compressedDataUrl);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  // دالة إضافة رابط مباشر
  const handleAddInlineLink = () => {
    if (inlineLinkData.name.trim()) {
      // استخدام معرف واحد لـ id و url
      const linkId = Date.now().toString();
      const newLink = {
        id: linkId,
        name: inlineLinkData.name.trim(),
        image: imagePreview || '', // استخدام معاينة الصورة أو رابط الصورة
        url: `/filter/${linkId}`, // توجيه ديناميكي لكل فلتر بنفس المعرف
        createdAt: new Date().toISOString()
      };
      
      const updatedLinks = [...customLinks, newLink];
      setCustomLinks(updatedLinks);
      localStorage.setItem('customLinks', JSON.stringify(updatedLinks));
      
      console.log('✅ New link added:', newLink);
      
      // إعادة تعيين النموذج
      setInlineLinkData({ name: '', image: '', url: '' });
      setSelectedImage(null);
      setImagePreview('');
      setShowInlineForm(false);
    } else {
      alert('يرجى ملء اسم الرابط');
    }
  };

  // دالة بدء تعديل الرابط
  const handleEditLink = (linkId: string) => {
    const link = customLinks.find(l => l.id === linkId);
    if (link) {
      setEditingLink(linkId);
      setEditLinkData({
        name: link.name,
        image: link.image
      });
      setEditImagePreview(link.image);
    }
  };

  // دالة حفظ التعديل
  const handleSaveEdit = () => {
    if (editingLink && editLinkData.name.trim()) {
      const updatedLinks = customLinks.map(link => 
        link.id === editingLink 
          ? { ...link, name: editLinkData.name.trim(), image: editImagePreview }
          : link
      );
      setCustomLinks(updatedLinks);
      localStorage.setItem('customLinks', JSON.stringify(updatedLinks));
      
      // إعادة تعيين حالة التعديل
      setEditingLink(null);
      setEditLinkData({ name: '', image: '' });
      setEditImagePreview('');
    } else {
      alert('يرجى ملء اسم الرابط');
    }
  };

  // دالة حفظ الفلتر الجديد
  const handleSaveNewFilter = () => {
    if (newFilterData.name.trim()) {
      // استخدام معرف واحد لـ id و url
      const filterId = Date.now().toString();
      const newFilter = {
        id: filterId,
        name: newFilterData.name.trim(),
        image: filterImagePreview,
        url: `/filter/${filterId}`, // إضافة URL بنفس المعرف
        icon: 'Filter',
        color: 'text-orange-500',
        dropdownOpen: false
      };
      
      console.log('✅ New filter added:', newFilter);
      
      setCustomFilters(prev => {
        const updatedFilters = [...prev, newFilter];
        if (!safeLocalStorageSet('customFilters', updatedFilters)) {
          return prev; // إرجاع البيانات السابقة في حالة فشل الحفظ
        }
        return updatedFilters;
      });
      
      // إعادة تعيين النموذج
      setNewFilterData({ name: '', image: '' });
      setSelectedFilterImage(null);
      setFilterImagePreview('');
      setShowAddFilterForm(false);
    } else {
      alert('يرجى ملء اسم الفلتر');
    }
  };

  // دالة إلغاء تعديل الرابط
  const handleCancelLinkEdit = () => {
    setEditingLink(null);
    setEditLinkData({ name: '', image: '' });
    setEditImagePreview('');
  };

  // دالة حفظ الرابط الجديد للفلتر
  const handleSaveNewFilterLink = (filterId: string) => {
    if (newFilterLinkData.name.trim()) {
      // استخدام معرف واحد لـ id و url
      const linkId = Date.now().toString();
      const newLink = {
        id: linkId,
        name: newFilterLinkData.name.trim(),
        image: linkImagePreview,
        url: `/filter/${linkId}` // نفس المعرف!
      };
      
      console.log('✅ New filter link added:', newLink);
      
      // إضافة الرابط إلى الفلتر وحفظ في localStorage
      setCustomFilters(prev => {
        const updatedFilters = prev.map(filter => 
          filter.id === filterId 
            ? { ...filter, links: [...(filter.links || []), newLink] }
            : filter
        );
        
        if (!safeLocalStorageSet('customFilters', updatedFilters)) {
          return prev; // إرجاع البيانات السابقة في حالة فشل الحفظ
        }
        
        return updatedFilters;
      });
      
      // إعادة تعيين النموذج
      setNewFilterLinkData({ name: '', image: '' });
      setSelectedLinkImage(null);
      setLinkImagePreview('');
      setShowAddLinkForm(null);
    } else {
      alert('يرجى ملء اسم الرابط');
    }
  };

  // دوال تعديل وحذف فلاتر Frein
  const handleEditFreinFilter = (filterKey: string) => {
    setEditingFreinFilter(filterKey);
    setFreinEditValue(freinFilterNames[filterKey as keyof typeof freinFilterNames]);
  };

  const handleSaveFreinFilter = () => {
    if (editingFreinFilter && freinEditValue.trim()) {
      const newFreinFilterNames = {
        ...freinFilterNames,
        [editingFreinFilter]: freinEditValue.trim()
      };
      setFreinFilterNames(newFreinFilterNames);
      localStorage.setItem('freinFilterNames', JSON.stringify(newFreinFilterNames));
      setEditingFreinFilter(null);
      setFreinEditValue('');
    }
  };

  const handleCancelFreinEdit = () => {
    setEditingFreinFilter(null);
    setFreinEditValue('');
  };

  const handleDeleteFreinFilter = (filterKey: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الفلتر؟')) {
      const newDeletedFreinFilters = [...deletedFreinFilters, filterKey];
      setDeletedFreinFilters(newDeletedFreinFilters);
      localStorage.setItem('deletedFreinFilters', JSON.stringify(newDeletedFreinFilters));
    }
  };

  // دوال تعديل وحذف فلاتر Suspension
  const handleEditSuspensionFilter = (filterKey: string) => {
    setEditingSuspensionFilter(filterKey);
    setSuspensionEditValue(suspensionFilterNames[filterKey as keyof typeof suspensionFilterNames]);
  };

  const handleSaveSuspensionFilter = () => {
    if (editingSuspensionFilter && suspensionEditValue.trim()) {
      const newSuspensionFilterNames = {
        ...suspensionFilterNames,
        [editingSuspensionFilter]: suspensionEditValue.trim()
      };
      setSuspensionFilterNames(newSuspensionFilterNames);
      localStorage.setItem('suspensionFilterNames', JSON.stringify(newSuspensionFilterNames));
      setEditingSuspensionFilter(null);
      setSuspensionEditValue('');
    }
  };

  const handleCancelSuspensionEdit = () => {
    setEditingSuspensionFilter(null);
    setSuspensionEditValue('');
  };

  const handleDeleteSuspensionFilter = (filterKey: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الفلتر؟')) {
      const newDeletedSuspensionFilters = [...deletedSuspensionFilters, filterKey];
      setDeletedSuspensionFilters(newDeletedSuspensionFilters);
      localStorage.setItem('deletedSuspensionFilters', JSON.stringify(newDeletedSuspensionFilters));
    }
  };

  // دوال تعديل وحذف فلاتر Courroie
  const handleEditCourroieFilter = (filterKey: string) => {
    setEditingCourroieFilter(filterKey);
    setCourroieEditValue(courroieFilterNames[filterKey as keyof typeof courroieFilterNames]);
  };

  const handleSaveCourroieFilter = () => {
    if (editingCourroieFilter && courroieEditValue.trim()) {
      const newCourroieFilterNames = {
        ...courroieFilterNames,
        [editingCourroieFilter]: courroieEditValue.trim()
      };
      setCourroieFilterNames(newCourroieFilterNames);
      localStorage.setItem('courroieFilterNames', JSON.stringify(newCourroieFilterNames));
      setEditingCourroieFilter(null);
      setCourroieEditValue('');
    }
  };

  const handleCancelCourroieEdit = () => {
    setEditingCourroieFilter(null);
    setCourroieEditValue('');
  };

  const handleDeleteCourroieFilter = (filterKey: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الفلتر؟')) {
      const newDeletedCourroieFilters = [...deletedCourroieFilters, filterKey];
      setDeletedCourroieFilters(newDeletedCourroieFilters);
      localStorage.setItem('deletedCourroieFilters', JSON.stringify(newDeletedCourroieFilters));
    }
  };

  // دوال تعديل وحذف فلاتر Carrosserie
  const handleEditCarrosserieFilter = (filterKey: string) => {
    setEditingCarrosserieFilter(filterKey);
    setCarrosserieEditValue(carrosserieFilterNames[filterKey as keyof typeof carrosserieFilterNames]);
  };

  const handleSaveCarrosserieFilter = () => {
    if (editingCarrosserieFilter && carrosserieEditValue.trim()) {
      const newCarrosserieFilterNames = {
        ...carrosserieFilterNames,
        [editingCarrosserieFilter]: carrosserieEditValue.trim()
      };
      setCarrosserieFilterNames(newCarrosserieFilterNames);
      localStorage.setItem('carrosserieFilterNames', JSON.stringify(newCarrosserieFilterNames));
      setEditingCarrosserieFilter(null);
      setCarrosserieEditValue('');
    }
  };

  const handleCancelCarrosserieEdit = () => {
    setEditingCarrosserieFilter(null);
    setCarrosserieEditValue('');
  };

  const handleDeleteCarrosserieFilter = (filterKey: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الفلتر؟')) {
      const newDeletedCarrosserieFilters = [...deletedCarrosserieFilters, filterKey];
      setDeletedCarrosserieFilters(newDeletedCarrosserieFilters);
      localStorage.setItem('deletedCarrosserieFilters', JSON.stringify(newDeletedCarrosserieFilters));
    }
  };

  // دوال تعديل وحذف فلاتر Moteur
  const handleEditMoteurFilter = (filterKey: string) => {
    setEditingMoteurFilter(filterKey);
    setMoteurEditValue(moteurFilterNames[filterKey as keyof typeof moteurFilterNames]);
  };

  const handleSaveMoteurFilter = () => {
    if (editingMoteurFilter && moteurEditValue.trim()) {
      const newMoteurFilterNames = {
        ...moteurFilterNames,
        [editingMoteurFilter]: moteurEditValue.trim()
      };
      setMoteurFilterNames(newMoteurFilterNames);
      localStorage.setItem('moteurFilterNames', JSON.stringify(newMoteurFilterNames));
      setEditingMoteurFilter(null);
      setMoteurEditValue('');
    }
  };

  const handleCancelMoteurEdit = () => {
    setEditingMoteurFilter(null);
    setMoteurEditValue('');
  };

  const handleDeleteMoteurFilter = (filterKey: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الفلتر؟')) {
      const newDeletedMoteurFilters = [...deletedMoteurFilters, filterKey];
      setDeletedMoteurFilters(newDeletedMoteurFilters);
      localStorage.setItem('deletedMoteurFilters', JSON.stringify(newDeletedMoteurFilters));
    }
  };

  // دوال تعديل وحذف فلاتر Amortissement
  const handleEditAmortissementFilter = (filterKey: string) => {
    setEditingAmortissementFilter(filterKey);
    setAmortissementEditValue(amortissementFilterNames[filterKey as keyof typeof amortissementFilterNames]);
  };

  const handleSaveAmortissementFilter = () => {
    if (editingAmortissementFilter && amortissementEditValue.trim()) {
      const newAmortissementFilterNames = {
        ...amortissementFilterNames,
        [editingAmortissementFilter]: amortissementEditValue.trim()
      };
      setAmortissementFilterNames(newAmortissementFilterNames);
      localStorage.setItem('amortissementFilterNames', JSON.stringify(newAmortissementFilterNames));
      setEditingAmortissementFilter(null);
      setAmortissementEditValue('');
    }
  };

  const handleCancelAmortissementEdit = () => {
    setEditingAmortissementFilter(null);
    setAmortissementEditValue('');
  };

  const handleDeleteAmortissementFilter = (filterKey: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الفلتر؟')) {
      const newDeletedAmortissementFilters = [...deletedAmortissementFilters, filterKey];
      setDeletedAmortissementFilters(newDeletedAmortissementFilters);
      localStorage.setItem('deletedAmortissementFilters', JSON.stringify(newDeletedAmortissementFilters));
    }
  };

  useEffect(() => {
    // تحميل الروابط المحذوفة من localStorage
    const savedDeletedFilters = localStorage.getItem('deletedFilters');
    if (savedDeletedFilters) {
      setDeletedFilters(JSON.parse(savedDeletedFilters));
    }
    
    // تحميل الروابط المخصصة من localStorage
    const savedCustomLinks = localStorage.getItem('customLinks');
    if (savedCustomLinks) {
      setCustomLinks(JSON.parse(savedCustomLinks));
    }
    
    // تحميل الفلاتر المخصصة من localStorage
    const savedCustomFilters = localStorage.getItem('customFilters');
    if (savedCustomFilters) {
      setCustomFilters(JSON.parse(savedCustomFilters));
    }
    
    // تحميل فلاتر Frein المحذوفة
    const savedDeletedFreinFilters = localStorage.getItem('deletedFreinFilters');
    if (savedDeletedFreinFilters) {
      setDeletedFreinFilters(JSON.parse(savedDeletedFreinFilters));
    }
    
    // تحميل أسماء فلاتر Frein
    const savedFreinFilterNames = localStorage.getItem('freinFilterNames');
    if (savedFreinFilterNames) {
      setFreinFilterNames(JSON.parse(savedFreinFilterNames));
    }
    
    // تحميل فلاتر Suspension المحذوفة
    const savedDeletedSuspensionFilters = localStorage.getItem('deletedSuspensionFilters');
    if (savedDeletedSuspensionFilters) {
      setDeletedSuspensionFilters(JSON.parse(savedDeletedSuspensionFilters));
    }
    
    // تحميل أسماء فلاتر Suspension
    const savedSuspensionFilterNames = localStorage.getItem('suspensionFilterNames');
    if (savedSuspensionFilterNames) {
      setSuspensionFilterNames(JSON.parse(savedSuspensionFilterNames));
    }
    
    // تحميل فلاتر Courroie المحذوفة
    const savedDeletedCourroieFilters = localStorage.getItem('deletedCourroieFilters');
    if (savedDeletedCourroieFilters) {
      setDeletedCourroieFilters(JSON.parse(savedDeletedCourroieFilters));
    }
    
    // تحميل أسماء فلاتر Courroie
    const savedCourroieFilterNames = localStorage.getItem('courroieFilterNames');
    if (savedCourroieFilterNames) {
      setCourroieFilterNames(JSON.parse(savedCourroieFilterNames));
    }
    
    // تحميل فلاتر Carrosserie المحذوفة
    const savedDeletedCarrosserieFilters = localStorage.getItem('deletedCarrosserieFilters');
    if (savedDeletedCarrosserieFilters) {
      setDeletedCarrosserieFilters(JSON.parse(savedDeletedCarrosserieFilters));
    }
    
    // تحميل أسماء فلاتر Carrosserie
    const savedCarrosserieFilterNames = localStorage.getItem('carrosserieFilterNames');
    if (savedCarrosserieFilterNames) {
      setCarrosserieFilterNames(JSON.parse(savedCarrosserieFilterNames));
    }
    
    // تحميل فلاتر Moteur المحذوفة
    const savedDeletedMoteurFilters = localStorage.getItem('deletedMoteurFilters');
    if (savedDeletedMoteurFilters) {
      setDeletedMoteurFilters(JSON.parse(savedDeletedMoteurFilters));
    }
    
    // تحميل أسماء فلاتر Moteur
    const savedMoteurFilterNames = localStorage.getItem('moteurFilterNames');
    if (savedMoteurFilterNames) {
      setMoteurFilterNames(JSON.parse(savedMoteurFilterNames));
    }
    
    // تحميل فلاتر Amortissement المحذوفة
    const savedDeletedAmortissementFilters = localStorage.getItem('deletedAmortissementFilters');
    if (savedDeletedAmortissementFilters) {
      setDeletedAmortissementFilters(JSON.parse(savedDeletedAmortissementFilters));
    }
    
    // تحميل أسماء فلاتر Amortissement
    const savedAmortissementFilterNames = localStorage.getItem('amortissementFilterNames');
    if (savedAmortissementFilterNames) {
      setAmortissementFilterNames(JSON.parse(savedAmortissementFilterNames));
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Check if user is logged in
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          console.log('👤 تم تحميل بيانات المستخدم:', parsedUser);
          console.log('🔑 دور المستخدم:', parsedUser.role);
          setUser(parsedUser);
        } else {
          console.log('❌ لا يوجد مستخدم مسجل الدخول');
        }
        
        // Load saved filter names
        const savedFilterNames = localStorage.getItem('filterNames');
        if (savedFilterNames) {
          setFilterNames(JSON.parse(savedFilterNames));
        }
        
        // Load search options from database
        const [marquesData, modelesData, anneesData] = await Promise.all([
          getSearchOptions('marque'),
          getSearchOptions('modele'),
          getSearchOptions('annee')
        ]);

        const marques = marquesData.map(opt => opt.value);
        const modeles = modelesData.map(opt => opt.value);
        const annees = anneesData.map(opt => opt.value);

        setSavedOptions({ marques, modeles, annees });
      } catch (error) {
        console.error('Error loading search options:', error);
        // Fallback to localStorage
        const savedSearchOptions = JSON.parse(localStorage.getItem('savedSearchOptions') || '[]');
        if (savedSearchOptions.length > 0) {
          const marques = [...new Set(savedSearchOptions.map((option: any) => option.marque).filter(Boolean))] as string[];
          const modeles = [...new Set(savedSearchOptions.map((option: any) => option.modele).filter(Boolean))] as string[];
          const annees = [...new Set(savedSearchOptions.map((option: any) => option.annee).filter(Boolean))] as string[];
          
          setSavedOptions(prev => ({
            marques: [...prev.marques, ...marques],
            modeles: [...prev.modeles, ...modeles],
            annees: [...prev.annees, ...annees]
          }));
        }
      }
    };

    loadData();
  }, []);

  // Listen for changes in localStorage to update user state
  useEffect(() => {
    const handleStorageChange = () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      } else {
        setUser(null);
      }
    };

    // Listen for storage events (when localStorage changes in other tabs)
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events (when localStorage changes in same tab)
    window.addEventListener('userLogin', handleStorageChange);
    window.addEventListener('userLogout', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLogin', handleStorageChange);
      window.removeEventListener('userLogout', handleStorageChange);
    };
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setDropdownOpen({
          marque: false,
          modele: false,
          annee: false
        });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // إغلاق قائمة PIÈCES DÉTACHÉES عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const button = target.closest('button[type="button"]');
      const dropdown = target.closest('.filtres-dropdown');
      
      // إذا كان النقر على الزر نفسه، لا نفعل شيئاً (سيتم التعامل معه في onClick)
      if (button && button.textContent?.includes('PIÈCES DÉTACHÉES')) {
        return;
      }
      
      // إذا كان النقر خارج القائمة والزر، نغلق القائمة
      if (!dropdown && filtresDropdownOpen) {
        setFiltresDropdownOpen(false);
      }
    };

    if (filtresDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [filtresDropdownOpen]);

  // Scroll behavior for header - compact on scroll
  const [scrollProgress, setScrollProgress] = useState(0);
  const particlesCanvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = 200;
      
      // Binary state for class changes
      setIsScrolled(scrollY > 20);
      
      // Continuous value for smooth transitions
      const progress = Math.min(scrollY / maxScroll, 1);
      setScrollProgress(progress);

      // Update header class for scrolled state
      const header = document.querySelector('.luxury-header-ultimate');
      if (header) {
        if (scrollY > 50) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }

      // Calculate scroll progress for progress line
      const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgressValue = scrollY / windowHeight;
      setScrollProgress(scrollProgressValue);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Canvas particles effect
  useEffect(() => {
    const canvas = particlesCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = 100;

    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      reset: () => void;
      update: () => void;
      draw: () => void;
    }> = [];

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;

      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * -0.5 - 0.2;
        this.opacity = Math.random() * 0.3 + 0.1;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.y < 0 || this.x < 0 || this.x > canvas.width) {
          this.reset();
          this.y = canvas.height;
        }
      }

      draw() {
        ctx.fillStyle = `rgba(212, 175, 55, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(212, 175, 55, 0.5)';
      }
    }

    // Initialize particles
    for (let i = 0; i < 30; i++) {
      particles.push(new Particle());
    }

    // Animation loop
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      requestAnimationFrame(animate);
    }

    animate();

    // Resize handler
    const handleResize = () => {
      canvas.width = window.innerWidth;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Click outside to close mega menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filtresDropdownOpen) {
        const megaMenu = document.querySelector('.mega-menu-refined');
        const navButton = document.querySelector('.nav-item');
        
        if (megaMenu && navButton && !megaMenu.contains(e.target as Node) && !navButton.contains(e.target as Node)) {
          setFiltresDropdownOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [filtresDropdownOpen]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      // ⌘K or Ctrl+K pour focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('.search-input') as HTMLInputElement;
        searchInput?.focus();
      }

      // Escape pour fermer mega menu
      if (e.key === 'Escape') {
        setFiltresDropdownOpen(false);
        setActiveDropdown(null);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyboard);
    return () => document.removeEventListener('keydown', handleKeyboard);
  }, [filtresDropdownOpen]);

  // Sticky header behavior
  useEffect(() => {
    const mainHeader = document.querySelector('.main-header-white');
    const navBar = document.querySelector('.navigation-bar-black');
    
    const handleScroll = () => {
      const currentScroll = window.pageYOffset;
      
      if (mainHeader && navBar) {
        if (currentScroll > 32) {
          mainHeader.classList.add('scrolled');
          navBar.classList.add('scrolled');
        } else {
          mainHeader.classList.remove('scrolled');
          navBar.classList.remove('scrolled');
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cart count update
  useEffect(() => {
    const updateCartCount = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const count = cart.reduce((total: number, item: any) => total + (item.quantity || 0), 0);
        setCartCount(count);
      } catch (e) {
        setCartCount(0);
      }
    };

    updateCartCount();
    window.addEventListener('cartUpdated', updateCartCount);
    return () => window.removeEventListener('cartUpdated', updateCartCount);
  }, []);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.nav-dropdown') && !target.closest('.nav-link')) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSearchFields = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log('Button clicked! Current state:', showSearchFields);
    setShowSearchFields(prev => {
      const newState = !prev;
      console.log('Changing to new state:', newState);
      return newState;
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setSearchInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSelectOption = (field: string, value: string) => {
    setSearchInputs(prev => ({
      ...prev,
      [field]: value
    }));
    setDropdownOpen(prev => ({
      ...prev,
      [field]: false
    }));
  };

  const toggleDropdown = (field: string) => {
    setDropdownOpen(prev => ({
      ...prev,
      [field]: !prev[field as keyof typeof prev]
    }));
  };

  const handleSaveOptions = () => {
    // Check if any new options were entered
    const hasNewOptions = Object.values(searchInputs).some(value => value.trim() !== '');
    
    if (!hasNewOptions) {
      alert('Veuillez entrer au moins une option à sauvegarder.');
      return;
    }

    // Save to localStorage
    const savedSearchOptions = JSON.parse(localStorage.getItem('savedSearchOptions') || '[]');
    const newOption = {
      id: Date.now().toString(),
      ...searchInputs,
      createdAt: new Date().toISOString()
    };
    savedSearchOptions.push(newOption);
    localStorage.setItem('savedSearchOptions', JSON.stringify(savedSearchOptions));
    
    // Update the saved options state to include new values
    setSavedOptions(prev => ({
      marques: searchInputs.marque ? [...new Set([...prev.marques, searchInputs.marque])] : prev.marques,
      modeles: searchInputs.modele ? [...new Set([...prev.modeles, searchInputs.modele])] : prev.modeles,
      annees: searchInputs.annee ? [...new Set([...prev.annees, searchInputs.annee])] : prev.annees
    }));
    
    alert('Les nouvelles options ont été sauvegardées avec succès! Redirection vers la page des filtres...');
    
    // Reset the inputs after saving
    setSearchInputs({
      marque: '',
      modele: '',
      annee: ''
    });
    
    // Redirect to admin filters page
    setTimeout(() => {
      window.location.href = '/admin-filters';
    }, 1000);
  };

  const handleDeleteOption = async (type: 'marques' | 'modeles' | 'annees', value: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer "${value}" ?`)) {
      try {
        // Delete from database
        const field = type.slice(0, -1); // Remove 's' from the end
        await deleteSearchOptionByValue(field, value);
        
        // Update state
        setSavedOptions(prev => ({
          ...prev,
          [type]: prev[type].filter(item => item !== value)
        }));
        
        alert(`"${value}" a été supprimé avec succès!`);
      } catch (error) {
        console.error('Error deleting option:', error);
        alert('Erreur lors de la suppression. Utilisation du stockage local.');
        
        // Fallback to localStorage
        setSavedOptions(prev => ({
          ...prev,
          [type]: prev[type].filter(item => item !== value)
        }));
        
        const savedSearchOptions = JSON.parse(localStorage.getItem('savedSearchOptions') || '[]');
        const updatedOptions = savedSearchOptions.filter((option: any) => option[type.slice(0, -1)] !== value);
        localStorage.setItem('savedSearchOptions', JSON.stringify(updatedOptions));
        
        alert(`"${value}" a été supprimé avec succès!`);
      }
    }
  };

  return (
    <>
      {/* 🎯 HEADER STYLE BIESSA AUTO - BORDEAUX & NOIR */}
      
      {/* ═══════════ SECTION 2: MAIN HEADER BLANC ═══════════ */}
      <div className="hidden lg:block main-header-white">
        <div className="main-header-container">
            
          {/* Logo Section */}
          <div className="header-logo-section">
            <Link to="/" className="logo-link">
                <img 
                  src="/ramm.png" 
                alt="RAM Premium Parts"
                className="logo-main"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/ram.png';
                  }}
                />
              </Link>
            </div>
            
          {/* Search Section - Center */}
          <div className="header-search-section">
            <div className="search-wrapper">
              <SearchBar className="w-full" />
            </div>
          </div>

          {/* Right Actions */}
          <div className="header-actions-section">
            
            {/* Mes favoris */}
            <button className="header-action-btn">
              <Heart className="action-icon" />
              <span className="action-badge">0</span>
              <span className="action-text">Mes favoris</span>
                </button>
                
            {/* Se connecter / User */}
            {user ? (
              <Link to="/account" className="header-action-btn">
                <User className="action-icon" />
                <span className="action-text">Mon compte</span>
              </Link>
            ) : (
              <Link to="/login" className="header-action-btn">
                <User className="action-icon" />
                <span className="action-text">Se connecter</span>
              </Link>
            )}

            {/* Admin Dashboard (si admin) */}
            {user && (user.role === 'admin' || user.is_admin === true) && (
              <Link to="/admin-dashboard" className="header-action-btn admin-btn">
                <Settings className="action-icon" />
                <span className="admin-badge-text">ADMIN</span>
                <span className="action-text">Dashboard</span>
              </Link>
            )}

            {/* Mon panier */}
            <Link to="/cart" className="header-action-btn cart-btn">
              <ShoppingCart className="action-icon" />
              <span className="action-badge cart-badge">{cartCount}</span>
              <span className="action-text">Mon panier</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ═══════════ SECTION 3: NAVIGATION BAR NOIR ═══════════ */}
      {/* Navigation bar removed */}

      {/* OLD HEADER CODE - HIDDEN */}
      <div className="hidden">
        {/* Old header code hidden */}
        {/* Background avec effet de profondeur */}
        <div className="header-backdrop">
          {/* Gradient radial subtil */}
          <div className="backdrop-gradient" />
          
          {/* Grille de luxe ultra-subtile */}
          <div className="backdrop-grid" />
          
          {/* Particules dorées flottantes (Canvas) */}
          <canvas ref={particlesCanvasRef} id="luxury-particles" className="backdrop-particles" />
        </div>
        {/* Container principal - Spacing parfait */}
        <div className="header-container">
          
          {/* ═══════════ LOGO SECTION ═══════════ */}
          <div className="header-logo-zone">
            <Link to="/" className="logo-ultimate">
              {/* Cercle doré animé derrière */}
              <div className="logo-halo">
                <div className="halo-ring ring-1" />
                <div className="halo-ring ring-2" />
              </div>
              
              {/* Image logo avec effets */}
              <div className="logo-image-wrapper">
                                <img 
                  src="/ramm.png" 
                  alt="RAM Premium Parts"
                  className="logo-img"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/ram.png';
                  }}
                />
                {/* Shine effect */}
                <div className="logo-shine" />
                              </div>
              
              {/* Texte sous le logo */}
              <div className="logo-caption">
                <div className="caption-line" />
                <span className="caption-text">EXCELLENCE</span>
                <div className="caption-line" />
                              </div>
                          </Link>
                      </div>
                    
          {/* ═══════════ NAVIGATION SECTION ═══════════ */}
          <nav className="header-nav-zone">
            <div className="nav-items">
              
              {/* PIÈCES DÉTACHÉES */}
              <div className="nav-item">
                <button 
                  className="nav-button"
                  onClick={() => setFiltresDropdownOpen(!filtresDropdownOpen)}
                  onMouseEnter={openFiltres}
                        >
                  <div className="nav-btn-content">
                    <Settings className="nav-icon" />
                    <span className="nav-text">PIÈCES</span>
                    <ChevronDown className={`nav-chevron ${filtresDropdownOpen ? 'open' : ''}`} />
                          </div>
                  <div className="nav-underline" />
                </button>

                {/* MEGA MENU SIMPLIFIÉ ET ÉLÉGANT */}
                {filtresDropdownOpen && (
                  <div className="mega-menu-refined" onMouseEnter={openFiltres} onMouseLeave={closeFiltres}>
                    {/* Background glassmorphism */}
                    <div className="mega-glass-bg" />
                    
                    {/* Contenu */}
                    <div className="mega-inner">
                      
                      {/* Titre élégant */}
                      <div className="mega-title-section">
                        <h3 className="mega-heading">CATÉGORIES</h3>
                        <div className="mega-title-line" />
                          </div>
                      
                      {/* Grid ultra-clean */}
                      <div className="mega-grid">
                        {customFilters.map((filter, i) => (
                        <Link 
                            key={filter.id}
                            to={filter.url || '#'}
                            className="mega-card"
                            style={{ '--index': i } as React.CSSProperties}
                          onClick={() => setFiltresDropdownOpen(false)}
                        >
                            {/* Card background */}
                            <div className="card-bg" />
                            
                            {/* Icône */}
                            <div className="card-icon-zone">
                              {filter.image ? (
                                <img src={filter.image} alt={filter.name} className="card-img" />
                              ) : (
                                <Filter className="card-icon" />
                              )}
                          </div>
                            
                            {/* Label */}
                            <span className="card-label">{filter.name}</span>
                            
                            {/* Hover border */}
                            <div className="card-border" />
                        </Link>
                        ))}
                      
                        {/* Default filters */}
                        {!deletedFilters.includes('Filtre à huile') && (
                        <Link 
                          to={`/filter/${Date.now()}`}
                            className="mega-card"
                            style={{ '--index': customFilters.length } as React.CSSProperties}
                          onClick={() => setFiltresDropdownOpen(false)}
                        >
                            <div className="card-bg" />
                            <div className="card-icon-zone">
                              <Droplets className="card-icon" />
                          </div>
                            <span className="card-label">{filterNames['Filtre à huile']}</span>
                            <div className="card-border" />
                        </Link>
                      )}
                      </div>

                      {/* CTA footer */}
                      <div className="mega-footer">
                        <Link to="/catalogue" className="mega-cta" onClick={() => setFiltresDropdownOpen(false)}>
                          <span>VOIR TOUT</span>
                          <ArrowRight className="cta-arrow" />
                      </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* DIVIDER */}
              <div className="nav-divider">
                <div className="divider-dot" />
              </div>

              {/* MENU */}
              <div className="nav-item">
                <button className="nav-button" onClick={() => setMenuOpen(true)}>
                  <div className="nav-btn-content">
                    <Menu className="nav-icon" />
                    <span className="nav-text">MENU</span>
                  </div>
                  <div className="nav-underline" />
              </button>
              </div>
            </div>
            </nav>

          {/* ═══════════ SEARCH SECTION ═══════════ */}
          <div className="header-search-zone">
            <div className="search-refined">
              {/* Icône */}
              <div className="search-icon-zone">
                <Search className="search-icon" />
              </div>
              
              {/* SearchBar Component */}
              <div className="search-input-wrapper">
                <SearchBar className="w-full" />
              </div>
              
              {/* Keyboard shortcut */}
              <div className="search-kbd">
                <kbd>⌘K</kbd>
            </div>

              {/* Border focus */}
              <div className="search-focus-border" />
            </div>
          </div>

          {/* ═══════════ ACTIONS SECTION ═══════════ */}
          <div className="header-actions-zone">
            <div className="actions-refined">
              
              {/* PANIER */}
              <Link to="/cart" className="action-refined action-cart">
                <div className="action-content">
                  <div className="action-icon-zone">
                    <ShoppingCart className="action-icon" />
                    <span className="cart-count">3</span>
                  </div>
                  <span className="action-label">PANIER</span>
                </div>
                <div className="action-glow" />
              </Link>
              
              {/* ADMIN (si applicable) */}
              {user && (user.role === 'admin' || user.is_admin) && (
                <Link to="/admin-dashboard" className="action-refined action-admin">
                  <div className="action-content">
                    <div className="action-icon-zone">
                      <Settings className="action-icon" />
                      <span className="admin-dot" />
                    </div>
                    <span className="action-label">ADMIN</span>
                  </div>
                  <div className="action-glow" />
                </Link>
              )}
              
              {/* LOGIN/LOGOUT */}
              {user ? (
                <button onClick={handleLogout} className="action-refined action-logout">
                  <div className="action-content">
                    <div className="action-icon-zone">
                      <LogOut className="action-icon" />
                    </div>
                    <span className="action-label">LOGOUT</span>
                  </div>
                  <div className="action-glow" />
                </button>
              ) : (
                <Link to="/login" className="action-refined action-login">
                  <div className="action-content">
                    <div className="action-icon-zone">
                      <User className="action-icon" />
                    </div>
                    <span className="action-label">LOGIN</span>
                  </div>
                  <div className="action-glow" />
                </Link>
              )}
            </div>
            </div>
          </div>
          
        {/* Progress Line Or */}
        <div className="progress-line-wrapper">
          <div 
            className="progress-fill-gold"
            style={{ width: `${scrollProgress * 100}%` }}
          >
            <div className="progress-shine" />
          </div>
          <div 
            className="progress-glow-cursor"
            style={{ left: `${scrollProgress * 100}%` }}
          />
        </div>
      </div>

      {/* OLD HEADER CODE - HIDDEN */}
      <div className="hidden">
        {/* Old header code removed */}
      </div>

      {/* ═══════════ SECONDARY LINKS BAR ═══════════ */}
      <div className="hidden lg:block secondary-links-bar">
        <div className="links-container">
          <div className="links-wrapper">
            
            {/* Accueil */}
            <Link to="/" className="secondary-link">
              <Home className="link-icon" />
              <span className="link-text">Accueil</span>
              <div className="link-underline" />
              </Link>

            {/* Divider */}
            <div className="link-divider" />
              
              {/* Catalogue */}
            <Link to="/catalogue" className="secondary-link">
              <FileText className="link-icon" />
              <span className="link-text">Catalogue</span>
              <div className="link-underline" />
              </Link>
              
            <div className="link-divider" />

            {/* Promotions - Badge HOT */}
            <Link to="#promotions" className="secondary-link">
              <Tag className="link-icon" />
              <span className="link-text">Promotions</span>
              <span className="hot-badge">HOT</span>
              <div className="link-underline" />
              </Link>

            <div className="link-divider" />
              
              {/* Favoris */}
            <button className="secondary-link">
              <Heart className="link-icon" />
              <span className="link-text">Favoris</span>
              <div className="link-underline" />
              </button>

            <div className="link-divider" />
              
              {/* Contact */}
            <Link to="#contact" className="secondary-link">
              <MessageCircle className="link-icon" />
              <span className="link-text">Contact</span>
              <div className="link-underline" />
              </Link>
              
            {/* Custom Links dynamiques */}
              {customLinks.map((link) => (
              <React.Fragment key={link.id}>
                <div className="link-divider" />
                <Link to={link.url || '#'} className="secondary-link">
                  {link.image ? (
                    <img src={link.image} alt={link.name} className="link-custom-icon" />
                  ) : (
                    <FileText className="link-icon" />
                  )}
                  <span className="link-text">{link.name}</span>
                  <div className="link-underline" />
                </Link>
              </React.Fragment>
              ))}
            </div>
          </div>
        </div>

      {/* OLD HEADER CODE - HIDDEN */}
      <div className="hidden">
        {/* Old header code removed */}
      </div>


      {/* 📱 Mobile Header - للشاشات الصغيرة */}
      <header className="lg:hidden w-full relative sticky top-0 z-40 luxury-glass-dark overflow-visible luxury-shadow-header" style={{ height: 'calc(100px + 1rem)' }}>
        {/* Header Image */}
        <div className="relative h-48 flex flex-col items-center justify-start pt-0">
          <img 
            src="/ramm.png" 
            alt="RAM Logo" 
            className="max-w-[70%] max-h-[70%] md:max-w-[60%] md:max-h-[60%] lg:max-w-[50%] lg:max-h-[50%] xl:max-w-[45%] xl:max-h-[45%] object-contain -mt-8"
            onError={(e) => {
              console.error('Error loading ramm.png:', e);
              const target = e.target as HTMLImageElement;
              target.src = '/ram.png'; // fallback to ram.png
            }}
          />
        </div>
        
        {/* White Line */}
        <div className="absolute top-14 left-0 w-full border-b-4 border-white z-0"></div>
        
        {/* ✅ تحسينات الأيقونات للشاشات الكبيرة */}
        <div className="absolute top-16 left-0 right-0 lg:left-20 xl:left-24 2xl:left-28 flex justify-around items-center px-2 lg:justify-start lg:gap-28 xl:gap-36 2xl:gap-44 z-10">
          <div className="flex flex-col items-center cursor-pointer flex-1 lg:flex-none" onClick={() => setMenuOpen(true)}>
            {/* ✅ تكبير الأيقونات تدريجياً للشاشات الكبيرة */}
            <Menu className="w-6 h-6 md:w-7 md:h-7 lg:w-12 lg:h-12 xl:w-14 xl:h-14 2xl:w-16 2xl:h-16 text-orange-500 hover:scale-110 transition-transform cursor-pointer mb-1" />
            {/* ✅ تكبير النصوص للشاشات الكبيرة */}
            <span className="text-[10px] md:text-xs lg:text-base xl:text-lg 2xl:text-xl text-orange-500 font-medium whitespace-nowrap">Menu</span>
          </div>
          
          {/* ✅ زر إخفاء/إظهار خانة البحث - للشاشات الصغيرة والهواتف فقط */}
          <div className="lg:hidden flex flex-col items-center cursor-pointer flex-1" onClick={() => setShowMobileSearch(!showMobileSearch)}>
            {showMobileSearch ? (
              <>
                <ChevronUp className="w-6 h-6 md:w-7 md:h-7 text-orange-500 hover:scale-110 transition-transform cursor-pointer mb-1" />
                <span className="text-[10px] md:text-xs text-orange-500 font-medium whitespace-nowrap">Masquer</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-6 h-6 md:w-7 md:h-7 text-orange-500 hover:scale-110 transition-transform cursor-pointer mb-1" />
                <span className="text-[10px] md:text-xs text-orange-500 font-medium whitespace-nowrap">Recherche</span>
              </>
            )}
          </div>
          <div className="flex flex-col items-center flex-1 lg:flex-none">
            <Heart className="w-6 h-6 md:w-7 md:h-7 lg:w-12 lg:h-12 xl:w-14 xl:h-14 2xl:w-16 2xl:h-16 text-orange-500 hover:scale-110 transition-transform cursor-pointer mb-1" />
            <span className="text-[10px] md:text-xs lg:text-base xl:text-lg 2xl:text-xl text-orange-500 font-medium whitespace-nowrap">Mes favoris</span>
          </div>
          
          {/* زر تسجيل الدخول / تسجيل الخروج */}
          {user ? (
            <div onClick={handleLogout} className="flex flex-col items-center group cursor-pointer flex-1 lg:flex-none">
              <div className="relative">
                <LogOut className="w-6 h-6 md:w-7 md:h-7 lg:w-12 lg:h-12 xl:w-14 xl:h-14 2xl:w-16 2xl:h-16 text-red-500 group-hover:scale-110 transition-transform mb-1" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
              </div>
              <span className="text-[10px] md:text-xs lg:text-base xl:text-lg 2xl:text-xl text-red-500 font-medium whitespace-nowrap group-hover:text-red-600 transition-colors">Se déconnecter</span>
            </div>
          ) : (
            <Link to="/login" className="flex flex-col items-center group flex-1 lg:flex-none">
              <div className="relative">
                <User className="w-6 h-6 md:w-7 md:h-7 lg:w-12 lg:h-12 xl:w-14 xl:h-14 2xl:w-16 2xl:h-16 text-orange-500 group-hover:scale-110 transition-transform cursor-pointer mb-1" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-white"></div>
              </div>
              <span className="text-[10px] md:text-xs lg:text-base xl:text-lg 2xl:text-xl text-orange-500 font-medium whitespace-nowrap group-hover:text-orange-600 transition-colors">Se connecter</span>
            </Link>
          )}

          {/* ✅ أيقونة السلة - ضمن نفس الصف */}
        <Link 
          to="/cart"
            className="flex flex-col items-center flex-1 lg:flex-none lg:absolute lg:right-20 xl:right-24 2xl:right-28"
        >
            <ShoppingCart className="w-6 h-6 md:w-7 md:h-7 lg:w-12 lg:h-12 xl:w-14 xl:h-14 2xl:w-16 2xl:h-16 text-orange-500 hover:scale-110 transition-transform cursor-pointer mb-1" />
            <span className="text-[10px] md:text-xs lg:text-base xl:text-lg 2xl:text-xl text-orange-500 font-medium whitespace-nowrap">Mon panier</span>
        </Link>
        </div>
      </header>

      {/* ✅ حقل البحث للهواتف والشاشات الصغيرة فقط */}
      {showMobileSearch && (
      <div className="lg:hidden w-full bg-white border-b border-gray-200 shadow-sm sticky top-[calc(100px+1rem)] z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <SearchBar className="w-full" />
            </div>
                </div>
                </div>
              </div>
      )}

      {/* القائمة الجانبية */}
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent 
          side="left" 
          className="w-[300px] sm:w-[420px] lg:w-full lg:max-w-[1100px] lg:h-[calc(100vh-80px)] lg:top-[80px] overflow-y-auto overflow-x-clip mx-auto
                   bg-black/95 backdrop-blur-xl text-white 
                   border-r-4 lg:border-r-0 lg:border-t-4 border-[#F97316] 
                   lg:rounded-t-3xl lg:shadow-2xl"
        >
          <SheetHeader className="pb-4 mb-8 relative lg:mb-12">
            <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
            <SheetDescription className="sr-only">Menu principal de navigation du site</SheetDescription>
            {/* شعار الموقع */}
            <div className="flex justify-center mb-0 -mt-12 relative lg:-mt-16 xl:-mt-20 2xl:-mt-24">
              {/* الخط البرتقالي فوق الشعار */}
              <div className="absolute top-20 lg:top-16 xl:top-12 2xl:top-8 left-0 w-full border-b-2 border-[#F97316]/40 z-10"></div>
              <img 
                src="/ramm.png" 
                alt="RAM Logo" 
                className="max-w-[70%] lg:max-w-[60%] xl:max-w-[70%] 2xl:max-w-[80%] max-h-[120px] lg:max-h-[180px] xl:max-h-[220px] 2xl:max-h-[260px] object-contain relative z-20 drop-shadow-lg lg:drop-shadow-2xl"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/ram.png';
                }}
              />
              {/* User status with absolute positioning */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-2 flex items-center gap-2 z-30 lg:translate-y-4">
                <User className="w-5 h-5 lg:w-6 lg:h-6 text-[#F97316] flex-shrink-0" />
                {user ? (
                  <span className="text-sm lg:text-base text-gray-300 whitespace-nowrap font-medium">
                    Welcome {user.name || user.username || 'Admin'} | 
                    <span 
                      onClick={handleLogout} 
                      className="text-[#F97316] hover:text-[#ea580c] transition-colors cursor-pointer ml-1 font-semibold"
                    >
                      Log out
                    </span>
                  </span>
                ) : (
                  <span className="text-sm lg:text-base text-gray-300 whitespace-nowrap font-medium">
                    Client visitant | 
                    <Link to="/login" className="text-[#F97316] hover:text-[#ea580c] transition-colors ml-1 font-semibold">
                      Login
                    </Link>
                  </span>
                )}
              </div>
            </div>
          </SheetHeader>
          
          {/* Responsive layout: vertical on mobile, horizontal on desktop */}
          <div className="space-y-2 lg:flex lg:flex-row lg:space-y-0 lg:gap-8 lg:overflow-x-auto lg:pb-6 lg:px-4">
            {/* PIÈCES DÉTACHÉES Section */}
            <div className="border-b lg:border-b-0 lg:border-r border-[#F97316]/30 pb-4 mb-4 lg:pb-0 lg:mb-0 lg:pr-8 lg:w-auto lg:flex-shrink-0 lg:min-w-[220px] transition-all duration-300 ease-in-out min-w-0">
              <h3 className="text-[#F97316] font-bold text-lg lg:text-xl mb-4 lg:mb-6 flex items-center gap-3">
                <Settings className="w-6 h-6 lg:w-7 lg:h-7" />
                PIÈCES DÉTACHÉES
              </h3>
              
              <div className="space-y-1">
                {/* أيقونة إضافة فلتر جديد - للمديرين فقط - في القائمة الرئيسية */}
                {user && (user.role === 'admin' || user.is_admin === true) && (
                  <>
                  <div className="px-4 py-2 border border-orange-200 rounded-lg bg-orange-25">
                    {!showAddFilterForm ? (
                      <button
                        onClick={() => setShowAddFilterForm(true)}
                        className="w-full flex items-center gap-3 py-3 px-3 hover:bg-orange-50 rounded-lg cursor-pointer group border-2 border-dashed border-orange-300 hover:border-orange-400 transition-all duration-200 bg-orange-50 shadow-md"
                      >
                        <div className="w-6 h-6 bg-orange-200 rounded flex items-center justify-center">
                          <span className="text-orange-600 text-lg font-bold">➕</span>
                        </div>
                        <span className="text-sm text-orange-600 font-medium">add url</span>
                        <div className="ml-auto text-xs text-orange-500 bg-orange-100 px-2 py-1 rounded">Admin</div>
                      </button>
                    ) : (
                      <div className="space-y-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={newFilterData.name}
                            onChange={(e) => setNewFilterData({...newFilterData, name: e.target.value})}
                            placeholder="Name url"
                            className="flex-1 px-3 py-2 text-sm text-black border border-orange-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <label className="flex-1 px-3 py-2 text-sm border border-orange-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500 cursor-pointer bg-white hover:bg-orange-50 transition-colors">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFilterImageUpload}
                              className="hidden"
                            />
                                  <span className="text-gray-600">
                                    {selectedFilterImage ? 'Image selected' : 'Add Photo'}
                                  </span>
                          </label>
                        </div>
                        
                        {/* معاينة الصورة */}
                        {filterImagePreview && (
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-12 border border-orange-300 rounded overflow-hidden">
                              <img
                                src={filterImagePreview}
                                alt="معاينة"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="text-xs text-gray-600">Image Preview Delete</span>
                            <button
                              onClick={() => {
                                setSelectedFilterImage(null);
                                setFilterImagePreview('');
                              }}
                              className="text-red-500 hover:text-red-700 text-xs"
                            >
                              حذف
                            </button>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleSaveNewFilter}
                            className="flex-1 px-3 py-2 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 transition-colors"
                          >
                            yes
                          </button>
                          <button
                            onClick={() => {
                              setShowAddFilterForm(false);
                              setNewFilterData({ name: '', image: '' });
                              setSelectedFilterImage(null);
                              setFilterImagePreview('');
                            }}
                            className="px-3 py-2 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 transition-colors"
                          >
                            No
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  </>
                )}
                
                {/* عرض الفلاتر الجديدة المضافة */}
                {customFilters.map((filter) => (
                  <MenuItem 
                    key={filter.id}
                    icon={
                      filter.image ? (
                        <div className="w-5 h-5 rounded overflow-hidden">
                          <img 
                            src={filter.image} 
                            alt={filter.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                              if (nextElement) {
                                nextElement.style.display = 'flex';
                              }
                            }}
                          />
                          <div className="w-full h-full bg-orange-200 rounded flex items-center justify-center" style={{display: filter.image ? 'none' : 'flex'}}>
                            <Filter className="w-4 h-4 text-orange-600" />
                          </div>
                        </div>
                      ) : (
                        <Filter className="w-5 h-5 text-orange-500" />
                      )
                    } 
                    label={filter.name}
                    hasDropdown={true}
                    dropdownOpen={filter.dropdownOpen}
                    onToggleDropdown={() => {
                      setCustomFilters(prev => prev.map(f => 
                        f.id === filter.id ? {...f, dropdownOpen: !f.dropdownOpen} : f
                      ));
                    }}
                  >
                    {/* UPDATED: Show empty state for new filters with only "add New" button */}
                    {(!filter.links || filter.links.length === 0) ? (
                      <div className="bg-white rounded-lg p-3">
                        {/* Empty state - Show only "add New" button for admin */}
                        {(user && (user.role === 'admin' || user.is_admin === true)) && (
                          <div>
                            {showAddLinkForm !== filter.id ? (
                              <button
                                onClick={() => setShowAddLinkForm(filter.id)}
                                className="w-full flex items-center gap-2 py-2 px-3 hover:bg-blue-50 rounded-lg cursor-pointer group border border-blue-300 hover:border-blue-400 transition-all duration-200 bg-blue-50"
                              >
                                <div className="w-5 h-5 bg-blue-200 rounded flex items-center justify-center">
                                  <span className="text-blue-600 text-sm font-bold">➕</span>
                                </div>
                                <span className="text-sm text-blue-600 font-medium">add New</span>
                              </button>
                            ) : (
                              <div className="space-y-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={newFilterLinkData.name}
                                    onChange={(e) => setNewFilterLinkData({...newFilterLinkData, name: e.target.value})}
                                    placeholder="Name url"
                                    className="flex-1 px-3 py-2 text-sm text-black border border-blue-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <label className="flex-1 px-3 py-2 text-sm border border-blue-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer bg-white hover:bg-blue-50 transition-colors">
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={handleLinkImageUpload}
                                      className="hidden"
                                    />
                                    <span className="text-gray-600">
                                      {selectedLinkImage ? 'Image selected' : 'add photo'}
                                    </span>
                                  </label>
                                </div>
                                
                                {/* معاينة الصورة */}
                                {linkImagePreview && (
                                  <div className="flex items-center gap-2">
                                    <div className="w-12 h-12 border border-blue-300 rounded overflow-hidden">
                                      <img
                                        src={linkImagePreview}
                                        alt="معاينة"
                                  className="w-full h-full object-cover"
                                      />
                              </div>
                                    <span className="text-xs text-gray-600">معاينة الصورة</span>
                                    <button
                                      onClick={() => {
                                        setSelectedLinkImage(null);
                                        setLinkImagePreview('');
                                      }}
                                      className="text-red-500 hover:text-red-700 text-xs"
                                    >
                                      حذف
                                    </button>
                            </div>
                                )}
                                
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleSaveNewFilterLink(filter.id)}
                                    className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                                  >
                                    add
                                  </button>
                                  <button
                                    onClick={() => {
                                      setShowAddLinkForm(null);
                                      setNewFilterLinkData({ name: '', image: '' });
                                      setSelectedLinkImage(null);
                                      setLinkImagePreview('');
                                    }}
                                    className="px-3 py-2 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 transition-colors"
                                  >
                                    delete
                                  </button>
                          </div>
                              </div>
                      )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-white rounded-lg p-3 space-y-1">
                      
                      {/* عرض الروابط المضافة - تظهر لجميع المستخدمين */}
                      {filter.links && filter.links.length > 0 && (
                        <div className="space-y-1">
                          {filter.links.map((link) => (
                            <Link key={link.id} to={link.url} className="block" onClick={() => setMenuOpen(false)}>
                              <div className="flex items-center gap-3 py-2 px-2 hover:bg-gray-100 rounded cursor-pointer">
                                <div className="w-6 h-6 bg-blue-200 rounded flex items-center justify-center overflow-hidden">
                                  {link.image ? (
                                    <img 
                                      src={link.image} 
                                      alt={link.name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                                        if (nextElement) {
                                          nextElement.style.display = 'flex';
                                        }
                                      }}
                                    />
                                  ) : null}
                                  <div className="w-full h-full bg-blue-300 rounded flex items-center justify-center" style={{display: link.image ? 'none' : 'flex'}}>
                                    <Filter className="w-4 h-4 text-blue-600" />
                                  </div>
                                </div>
                                <span className="text-sm text-gray-800">{link.name}</span>
                                
                                {/* أزرار التعديل والحذف للرابط */}
                                {(user && (user.role === 'admin' || user.is_admin === true)) && (
                                  <div className="flex items-center gap-1 ml-auto">
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        const newName = prompt('أدخل الاسم الجديد:', link.name);
                                        if (newName && newName.trim()) {
                                          setCustomFilters(prev => prev.map(f => 
                                            f.id === filter.id 
                                              ? {...f, links: f.links?.map(l => 
                                                  l.id === link.id ? {...l, name: newName.trim()} : l
                                                ) || []}
                                              : f
                                          ));
                                          localStorage.setItem('customFilters', JSON.stringify(
                                            customFilters.map(f => 
                                              f.id === filter.id 
                                                ? {...f, links: f.links?.map(l => 
                                                    l.id === link.id ? {...l, name: newName.trim()} : l
                                                  ) || []}
                                                : f
                                            )
                                          ));
                                        }
                                      }}
                                      className="bg-blue-500 text-white px-1 py-1 rounded text-xs hover:bg-blue-600 transition-colors"
                                      title="تعديل اسم الرابط"
                                    >
                                      ✏️
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (confirm('هل أنت متأكد من حذف هذا الرابط؟')) {
                                          setCustomFilters(prev => prev.map(f => 
                                            f.id === filter.id 
                                              ? {...f, links: f.links?.filter(l => l.id !== link.id) || []}
                                              : f
                                          ));
                                          localStorage.setItem('customFilters', JSON.stringify(
                                            customFilters.map(f => 
                                              f.id === filter.id 
                                                ? {...f, links: f.links?.filter(l => l.id !== link.id) || []}
                                                : f
                                            )
                                          ));
                                        }
                                      }}
                                      className="bg-red-500 text-white px-1 py-1 rounded text-xs hover:bg-red-600 transition-colors"
                                      title="حذف الرابط"
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                )}
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                      <Link to="/filters-catalogue" className="block" onClick={() => setMenuOpen(false)}>
                        <div className="text-xs text-gray-500 mt-2 cursor-pointer hover:text-orange-500">
                          Voir plus de catégories
                        </div>
                      </Link>
                      
                      {/* أزرار التعديل والحذف للمديرين */}
                      {(user && (user.role === 'admin' || user.is_admin === true)) && (
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const newName = prompt('أدخل الاسم الجديد:', filter.name);
                              if (newName && newName.trim()) {
                                setCustomFilters(prev => prev.map(f => 
                                  f.id === filter.id ? {...f, name: newName.trim()} : f
                                ));
                                localStorage.setItem('customFilters', JSON.stringify(
                                  customFilters.map(f => 
                                    f.id === filter.id ? {...f, name: newName.trim()} : f
                                  )
                                ));
                              }
                            }}
                            className="bg-orange-500 text-white px-2 py-1 rounded text-sm hover:bg-orange-600 transition-colors"
                            title="تعديل اسم الفلتر"
                          >
                            Modifications
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (confirm('هل أنت متأكد من حذف هذا الفلتر؟')) {
                                setCustomFilters(prev => prev.filter(f => f.id !== filter.id));
                                localStorage.setItem('customFilters', JSON.stringify(
                                  customFilters.filter(f => f.id !== filter.id)
                                ));
                              }
                            }}
                            className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                            title="حذف الفلتر"
                          >
                            delete
                          </button>
                        </div>
                      )}
                      
                      {/* حقل إضافة رابط جديد للمديرين */}
                      {(user && (user.role === 'admin' || user.is_admin === true)) && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          {showAddLinkForm !== filter.id ? (
                            <button
                              onClick={() => setShowAddLinkForm(filter.id)}
                              className="w-full flex items-center gap-2 py-2 px-3 hover:bg-blue-50 rounded-lg cursor-pointer group border border-blue-300 hover:border-blue-400 transition-all duration-200 bg-blue-50"
                            >
                              <div className="w-5 h-5 bg-blue-200 rounded flex items-center justify-center">
                                <span className="text-blue-600 text-sm font-bold">➕</span>
                              </div>
                              <span className="text-sm text-blue-600 font-medium">add New</span>
                            </button>
                          ) : (
                            <div className="space-y-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={newFilterLinkData.name}
                                  onChange={(e) => setNewFilterLinkData({...newFilterLinkData, name: e.target.value})}
                                  placeholder="Name url"
                                  className="flex-1 px-3 py-2 text-sm text-black border border-blue-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <label className="flex-1 px-3 py-2 text-sm border border-blue-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer bg-white hover:bg-blue-50 transition-colors">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLinkImageUpload}
                                    className="hidden"
                                  />
                                  <span className="text-gray-600">
                                    {selectedLinkImage ? 'Image selected' : 'add photo'}
                                  </span>
                                </label>
                              </div>
                              
                              {/* معاينة الصورة */}
                              {linkImagePreview && (
                                <div className="flex items-center gap-2">
                                  <div className="w-12 h-12 border border-blue-300 rounded overflow-hidden">
                                    <img
                                      src={linkImagePreview}
                                      alt="معاينة"
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <span className="text-xs text-gray-600">معاينة الصورة</span>
                                  <button
                                    onClick={() => {
                                      setSelectedLinkImage(null);
                                      setLinkImagePreview('');
                                    }}
                                    className="text-red-500 hover:text-red-700 text-xs"
                                  >
                                    حذف
                                  </button>
                                </div>
                              )}
                              
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleSaveNewFilterLink(filter.id)}
                                  className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                                >
                                  add
                                </button>
                                <button
                                  onClick={() => {
                                    setShowAddLinkForm(null);
                                    setNewFilterLinkData({ name: '', image: '' });
                                    setSelectedLinkImage(null);
                                    setLinkImagePreview('');
                                  }}
                                  className="px-3 py-2 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 transition-colors"
                                >
                                  delete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    )}
                  </MenuItem>
                ))}
                
                <MenuItem 
                  icon={<Filter className="w-5 h-5 text-orange-500" />} 
                  label="Filtre" 
                  hasDropdown={true}
                  dropdownOpen={filtresDropdownOpen}
                  onToggleDropdown={() => setFiltresDropdownOpen(!filtresDropdownOpen)}
                >
                  <div className="bg-white rounded-lg p-3 space-y-1">
                    {!deletedFilters.includes('Filtre à huile') && (
                    <Link to={`/filter/${Date.now()}`} className="block" onClick={() => setMenuOpen(false)}>
                      <div className="flex items-center gap-3 py-2 px-2 hover:bg-gray-100 rounded cursor-pointer group">
                        <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center">
                          <Droplets className="w-4 h-4 text-gray-600" />
                        </div>
                        {editingFilter === 'Filtre à huile' ? (
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="text-sm text-gray-800 border border-orange-300 rounded px-2 py-1 flex-1"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveFilter();
                                if (e.key === 'Escape') handleCancelEdit();
                              }}
                            />
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleSaveFilter();
                              }}
                              className="text-green-600 hover:text-green-800 text-xs"
                            >
                              ✓
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleCancelEdit();
                              }}
                              className="text-red-600 hover:text-red-800 text-xs"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between flex-1">
                            <span className="text-sm text-gray-800">{filterNames['Filtre à huile']}</span>
                            {(user && (user.role === 'admin' || user.is_admin === true)) && (
                              <div className="flex items-center gap-2 ml-2">
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleEditFilter('Filtre à huile');
                                  }}
                                  className="bg-orange-500 text-white px-2 py-1 rounded text-sm hover:bg-orange-600 transition-colors"
                                  title="تعديل اسم الفلتر"
                                >
                                  تعديل
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleDeleteFilter('Filtre à huile');
                                  }}
                                  className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                                  title="حذف الفلتر"
                                >
                                  حذف
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </Link>
                    )}
                    {!deletedFilters.includes('Filtre à air') && (
                    <Link to={`/filter/${Date.now()}`} className="block" onClick={() => setMenuOpen(false)}>
                      <div className="flex items-center gap-3 py-2 px-2 hover:bg-gray-100 rounded cursor-pointer group">
                        <div className="w-6 h-6 bg-orange-200 rounded flex items-center justify-center">
                          <AirVent className="w-4 h-4 text-orange-600" />
                        </div>
                        {editingFilter === 'Filtre à air' ? (
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="text-sm text-gray-800 border border-orange-300 rounded px-2 py-1 flex-1"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveFilter();
                                if (e.key === 'Escape') handleCancelEdit();
                              }}
                            />
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleSaveFilter();
                              }}
                              className="text-green-600 hover:text-green-800 text-xs"
                            >
                              ✓
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleCancelEdit();
                              }}
                              className="text-red-600 hover:text-red-800 text-xs"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between flex-1">
                            <span className="text-sm text-gray-800">{filterNames['Filtre à air']}</span>
                            {(user && (user.role === 'admin' || user.is_admin === true)) && (
                              <div className="flex items-center gap-1 ml-2">
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleEditFilter('Filtre à air');
                                  }}
                                  className="bg-orange-500 text-white px-2 py-1 rounded text-sm hover:bg-orange-600 transition-colors"
                                  title="تعديل اسم الفلتر"
                                >
                                  تعديل
                                </button>
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleDeleteFilter('Filtre à air');
                                    }}
                                  className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                                  title="حذف الفلتر"
                                >
                                  حذف
                                  </button>
                                </div>
                            )}
                          </div>
                        )}
                      </div>
                    </Link>
                    )}
                    {!deletedFilters.includes('Filtre d\'habitacle') && (
                    <Link to={`/filter/${Date.now()}`} className="block" onClick={() => setMenuOpen(false)}>
                      <div className="flex items-center gap-3 py-2 px-2 hover:bg-gray-100 rounded cursor-pointer group">
                        <div className="w-6 h-6 bg-gray-300 rounded flex items-center justify-center">
                          <WindIcon className="w-4 h-4 text-gray-600" />
                        </div>
                        {editingFilter === 'Filtre d\'habitacle' ? (
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="text-sm text-gray-800 border border-orange-300 rounded px-2 py-1 flex-1"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveFilter();
                                if (e.key === 'Escape') handleCancelEdit();
                              }}
                            />
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleSaveFilter();
                              }}
                              className="text-green-600 hover:text-green-800 text-xs"
                            >
                              ✓
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleCancelEdit();
                              }}
                              className="text-red-600 hover:text-red-800 text-xs"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between flex-1">
                            <span className="text-sm text-gray-800">{filterNames['Filtre d\'habitacle']}</span>
                            {(user && (user.role === 'admin' || user.is_admin === true)) && (
                              <div className="flex items-center gap-1 ml-2">
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleEditFilter('Filtre d\'habitacle');
                                  }}
                                  className="bg-orange-500 text-white px-2 py-1 rounded text-sm hover:bg-orange-600 transition-colors"
                                  title="تعديل اسم الفلتر"
                                >
                                  تعديل
                                </button>
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleDeleteFilter('Filtre d\'habitacle');
                                    }}
                                  className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                                  title="حذف الفلتر"
                                >
                                  حذف
                                  </button>
                                </div>
                            )}
                          </div>
                        )}
                      </div>
                    </Link>
                    )}
                    {!deletedFilters.includes('Filtre à carburant') && (
                    <Link to={`/filter/${Date.now()}`} className="block" onClick={() => setMenuOpen(false)}>
                      <div className="flex items-center gap-3 py-2 px-2 hover:bg-gray-100 rounded cursor-pointer group">
                        <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center">
                          <Fuel className="w-4 h-4 text-gray-600" />
                        </div>
                        {editingFilter === 'Filtre à carburant' ? (
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="text-sm text-gray-800 border border-orange-300 rounded px-2 py-1 flex-1"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveFilter();
                                if (e.key === 'Escape') handleCancelEdit();
                              }}
                            />
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleSaveFilter();
                              }}
                              className="text-green-600 hover:text-green-800 text-xs"
                            >
                              ✓
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleCancelEdit();
                              }}
                              className="text-red-600 hover:text-red-800 text-xs"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between flex-1">
                            <span className="text-sm text-gray-800">{filterNames['Filtre à carburant']}</span>
                            {(user && (user.role === 'admin' || user.is_admin === true)) && (
                              <div className="flex items-center gap-1 ml-2">
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleEditFilter('Filtre à carburant');
                                  }}
                                  className="bg-orange-500 text-white px-2 py-1 rounded text-sm hover:bg-orange-600 transition-colors"
                                  title="تعديل اسم الفلتر"
                                >
                                  تعديل
                                </button>
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleDeleteFilter('Filtre à carburant');
                                    }}
                                  className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                                  title="حذف الفلتر"
                                >
                                  حذف
                                  </button>
                                </div>
                            )}
                      </div>
                        )}
                      </div>
                    </Link>
                    )}
                    
                    {/* حقل إضافة رابط جديد - للمديرين فقط */}
                    {(user && (user.role === 'admin' || user.is_admin === true)) && (
                      <div className="border-t border-gray-200 pt-2 mt-2">
                        {!showInlineForm ? (
                          <button
                            onClick={() => setShowInlineForm(true)}
                            className="w-full flex items-center gap-3 py-2 px-2 hover:bg-orange-50 rounded cursor-pointer group border-2 border-dashed border-orange-300 hover:border-orange-400 transition-all duration-200"
                          >
                            <div className="w-6 h-6 bg-orange-100 rounded flex items-center justify-center">
                              <span className="text-orange-600 text-lg">➕</span>
                        </div>
                            <span className="text-sm text-orange-600 font-medium">add New</span>
                          </button>
                        ) : (
                          <div className="space-y-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={inlineLinkData.name}
                                onChange={(e) => setInlineLinkData({...inlineLinkData, name: e.target.value})}
                                placeholder="اسم الرابط"
                                className="flex-1 px-2 py-1 text-sm border border-orange-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                              />
                              <label className="flex-1 px-2 py-1 text-sm border border-orange-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500 cursor-pointer bg-white hover:bg-orange-50 transition-colors">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleImageUpload}
                                  className="hidden"
                                />
                                <span className="text-gray-600">
                                  {selectedImage ? 'Image selected' : 'اختر صورة'}
                                </span>
                              </label>
                      </div>
                            
                            {/* معاينة الصورة */}
                            {imagePreview && (
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 border border-orange-300 rounded overflow-hidden">
                                  <img
                                    src={imagePreview}
                                    alt="معاينة"
                                    className="w-full h-full object-cover"
                                  />
                        </div>
                                <span className="text-xs text-gray-600">معاينة الصورة</span>
                                <button
                                  onClick={() => {
                                    setSelectedImage(null);
                                    setImagePreview('');
                                  }}
                                  className="text-red-500 hover:text-red-700 text-xs"
                                >
                                  حذف
                                </button>
                        </div>
                            )}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={handleAddInlineLink}
                                className="flex-1 px-3 py-1 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 transition-colors"
                              >
                                إضافة إلى صفحة sihem
                              </button>
                              <button
                                onClick={() => {
                                  setShowInlineForm(false);
                                  setInlineLinkData({ name: '', image: '', url: '' });
                                  setSelectedImage(null);
                                  setImagePreview('');
                                }}
                                className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 transition-colors"
                              >
                                إلغاء
                              </button>
                        </div>
                      </div>
                        )}
                        </div>
                    )}
                    
                    {/* عرض الروابط المضافة مع الروابط القديمة */}
                    {customLinks.map((link) => (
                      <div key={link.id}>
                        {editingLink === link.id ? (
                          // وضع التعديل
                          <div className="space-y-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editLinkData.name}
                                onChange={(e) => setEditLinkData({...editLinkData, name: e.target.value})}
                                placeholder="اسم الرابط"
                                className="flex-1 px-2 py-1 text-sm border border-orange-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                              />
                              <label className="flex-1 px-2 py-1 text-sm border border-orange-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500 cursor-pointer bg-white hover:bg-orange-50 transition-colors">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleEditImageUpload}
                                  className="hidden"
                                />
                                <span className="text-gray-600">
                                  {editImagePreview ? 'Image selected' : 'اختر صورة'}
                                </span>
                              </label>
                      </div>
                            
                            {/* معاينة الصورة للتعديل */}
                            {editImagePreview && (
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 border border-orange-300 rounded overflow-hidden">
                                  <img
                                    src={editImagePreview}
                                    alt="معاينة"
                                    className="w-full h-full object-cover"
                                  />
                        </div>
                                <span className="text-xs text-gray-600">معاينة الصورة</span>
                                <button
                                  onClick={() => {
                                    setEditImagePreview('');
                                  }}
                                  className="text-red-500 hover:text-red-700 text-xs"
                                >
                                  حذف
                                </button>
                        </div>
                            )}
                            
                            <div className="flex items-center gap-2">
                              <button
                                onClick={handleSaveEdit}
                                className="flex-1 px-3 py-1 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 transition-colors"
                              >
                                حفظ
                              </button>
                              <button
                                onClick={handleCancelLinkEdit}
                                className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 transition-colors"
                              >
                                إلغاء
                              </button>
                        </div>
                      </div>
                        ) : (
                          // وضع العرض العادي
                          <Link 
                            to={`/filter/${Date.now()}`} 
                            className="block" 
                            onClick={() => setMenuOpen(false)}
                          >
                            <div className="flex items-center gap-3 py-2 px-2 hover:bg-gray-100 rounded cursor-pointer group">
                              <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center overflow-hidden">
                                {link.image ? (
                                  <img 
                                    src={link.image} 
                                    alt={link.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                      const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                                      if (nextElement) {
                                        nextElement.style.display = 'flex';
                                      }
                                    }}
                                  />
                                ) : null}
                                <div className="w-full h-full bg-gray-300 rounded flex items-center justify-center" style={{display: link.image ? 'none' : 'flex'}}>
                                  <span className="text-gray-600 text-xs">🔗</span>
                        </div>
                      </div>
                              <div className="flex items-center justify-between flex-1">
                                <span className="text-sm text-gray-800 group-hover:text-orange-500 transition-colors">
                                  {link.name}
                                </span>
                                {(user && (user.role === 'admin' || user.is_admin === true)) && (
                                  <div className="flex items-center gap-1">
                                      <button
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          handleEditLink(link.id);
                                        }}
                                  className="bg-orange-500 text-white px-2 py-1 rounded text-sm hover:bg-orange-600 transition-colors"
                                  title="تعديل الرابط"
                                >
                                  تعديل
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          if (confirm('هل أنت متأكد من حذف هذا الرابط؟')) {
                                            const updatedLinks = customLinks.filter(l => l.id !== link.id);
                                            setCustomLinks(updatedLinks);
                                            localStorage.setItem('customLinks', JSON.stringify(updatedLinks));
                                          }
                                        }}
                                  className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                                  title="حذف الرابط"
                                >
                                  حذف
                                      </button>
                          </div>
                                )}
                      </div>
                      </div>
                    </Link>
                        )}
                        </div>
                    ))}
                    
                    {/* عرض الفلاتر الجديدة المضافة */}
                    {Object.entries(filterNames).map(([key, value]) => {
                      // تجاهل الفلاتر الأساسية المعروفة
                      const basicFilters = ['Filtre à huile', 'Filtre à air', 'Filtre d\'habitacle', 'Filtre à carburant'];
                      if (basicFilters.includes(key)) return null;
                      
                      return (
                        <div key={key}>
                          {!deletedFilters.includes(key) && (
                    <Link to={`/filter/${Date.now()}`} className="block" onClick={() => setMenuOpen(false)}>
                              <div className="flex items-center gap-3 py-2 px-2 hover:bg-gray-100 rounded cursor-pointer group">
                        <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center">
                          <Filter className="w-4 h-4 text-gray-600" />
                        </div>
                                {editingFilter === key ? (
                                  <div className="flex items-center gap-2 flex-1">
                                    <input
                                      type="text"
                                      value={editValue}
                                      onChange={(e) => setEditValue(e.target.value)}
                                      className="text-sm text-gray-800 border border-orange-300 rounded px-2 py-1 flex-1"
                                      autoFocus
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveFilter();
                                        if (e.key === 'Escape') handleCancelEdit();
                                      }}
                                    />
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleSaveFilter();
                                      }}
                                      className="text-green-600 hover:text-green-800 text-xs"
                                    >
                                      ✓
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleCancelEdit();
                                      }}
                                      className="text-red-600 hover:text-red-800 text-xs"
                                    >
                                      ✕
                                    </button>
                        </div>
                                ) : (
                                  <div className="flex items-center justify-between flex-1">
                                    <span className="text-sm text-gray-800">{value}</span>
                                    {(user && (user.role === 'admin' || user.is_admin === true)) && (
                                      <div className="flex items-center gap-2 ml-2">
                                        <button
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleEditFilter(key);
                                          }}
                                          className="bg-orange-500 text-white px-2 py-1 rounded text-sm hover:bg-orange-600 transition-colors"
                                          title="تعديل اسم الفلتر"
                                        >
                                          تعديل
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleDeleteFilter(key);
                                          }}
                                          className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                                          title="حذف الفلتر"
                                        >
                                          حذف
                                        </button>
                        </div>
                                    )}
                      </div>
                                )}
                      </div>
                    </Link>
                          )}
                        </div>
                      );
                    })}
                    
                    {/* أيقونة إضافة رابط جديد - للمديرين فقط */}
                    {(() => {
                      console.log('فحص user:', user, 'role:', user?.role, 'is_admin:', user?.is_admin);
                      return user && (user.role === 'admin' || user.is_admin === true);
                    })() && (
                      <div className="border-t border-gray-200 pt-2 mt-2">
                        <button
                          onClick={() => {
                            console.log('تم الضغط على إضافة فلتر جديد');
                            // إضافة رابط جديد مثل "Filtre"
                            const newFilterName = prompt('أدخل اسم الفلتر الجديد:');
                            if (newFilterName && newFilterName.trim()) {
                              const newFilterKey = newFilterName.trim();
                              console.log('إضافة فلتر جديد:', newFilterKey);
                              setFilterNames(prev => ({
                                ...prev,
                                [newFilterKey]: newFilterKey
                              }));
                              // حفظ في localStorage
                              localStorage.setItem('filterNames', JSON.stringify({
                                ...filterNames,
                                [newFilterKey]: newFilterKey
                              }));
                            }
                          }}
                          className="w-full flex items-center gap-3 py-2 px-2 hover:bg-orange-50 rounded cursor-pointer group border-2 border-dashed border-orange-300 hover:border-orange-400 transition-all duration-200"
                        >
                          <div className="w-6 h-6 bg-orange-100 rounded flex items-center justify-center">
                            <span className="text-orange-600 text-lg">➕</span>
                        </div>
                          <span className="text-sm text-orange-600 font-medium">إضافة فلتر جديد</span>
                        </button>
                      </div>
                    )}
                    
                    <Link to="/filters-catalogue" className="block" onClick={() => setMenuOpen(false)}>
                      <div className="text-xs text-gray-500 mt-2 cursor-pointer hover:text-orange-500">
                        Voir plus de catégories
                      </div>
                    </Link>
                  </div>
                </MenuItem>
              </div>
            </div>

            {/* Admin Dashboard Link - Only for Admin */}
            {user && (user.role === 'admin' || user.is_admin === true) && (
              <div className="border-b lg:border-b-0 lg:border-r border-[#F97316]/30 pb-4 mb-4 lg:pb-0 lg:mb-0 lg:pr-8 lg:w-auto lg:flex-shrink-0 lg:min-w-[220px] min-w-0">
                <Link to="/admin-dashboard" onClick={() => setMenuOpen(false)}>
                  <div className="bg-gradient-to-r from-[#F97316] to-[#ea580c] rounded-xl lg:rounded-2xl p-4 lg:p-6 hover:from-[#ea580c] hover:to-[#dc2626] transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105">
                    <div className="flex items-center gap-3 lg:gap-4">
                      <div className="bg-white/20 p-2.5 lg:p-3 rounded-full">
                        <Settings className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-bold text-lg lg:text-xl">Dashboard Admin</p>
                        <p className="text-white/80 text-xs lg:text-sm">Tableau de bord administrateur</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* زر تسجيل الدخول / تسجيل الخروج */}
            <div className="border-b lg:border-b-0 lg:border-r border-[#F97316]/30 pb-4 mb-4 lg:pb-0 lg:mb-0 lg:pr-8 lg:w-auto lg:flex-shrink-0 lg:min-w-[220px] min-w-0">
              {user ? (
                <div onClick={() => { handleLogout(); setMenuOpen(false); }} className="cursor-pointer">
                  <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl lg:rounded-2xl p-4 lg:p-6 hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105">
                    <div className="flex items-center gap-3 lg:gap-4">
                      <div className="bg-white/20 p-2.5 lg:p-3 rounded-full">
                        <LogOut className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-bold text-lg lg:text-xl">Se déconnecter</p>
                        <p className="text-white/80 text-xs lg:text-sm">Déconnexion de {user.name || user.email}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Link to="/login" onClick={() => setMenuOpen(false)}>
                  <div className="bg-gradient-to-r from-[#F97316] to-[#ea580c] rounded-xl lg:rounded-2xl p-4 lg:p-6 hover:from-[#ea580c] hover:to-[#dc2626] transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105">
                    <div className="flex items-center gap-3 lg:gap-4">
                      <div className="bg-white/20 p-2.5 lg:p-3 rounded-full">
                        <User className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-bold text-lg lg:text-xl">Se connecter</p>
                        <p className="text-white/80 text-xs lg:text-sm">Accédez à votre compte</p>
                      </div>
                    </div>
                  </div>
                </Link>
              )}
            </div>

            {/* LIENS UTILES Section */}
            <div className="border-b lg:border-b-0 lg:border-r border-[#F97316]/30 pb-4 mb-4 lg:pb-0 lg:mb-0 lg:pr-8 lg:w-auto lg:flex-shrink-0 lg:min-w-[220px] min-w-0 transition-all duration-300 ease-in-out">
              <h3 className="text-[#F97316] font-bold text-base lg:text-lg mb-4 lg:mb-6">LIENS UTILES</h3>
              <div className="space-y-1 lg:space-y-2">
                <MenuItem icon={<FileText className="w-5 h-5 lg:w-6 lg:h-6 text-[#F97316]" />} label="Livraison" simple />
                <MenuItem icon={<FileText className="w-5 h-5 lg:w-6 lg:h-6 text-[#F97316]" />} label="Politique de confidentialité" simple />
                <MenuItem icon={<FileText className="w-5 h-5 lg:w-6 lg:h-6 text-[#F97316]" />} label="Paramètres des cookies" simple />
                <MenuItem icon={<FileText className="w-5 h-5 lg:w-6 lg:h-6 text-[#F97316]" />} label="Échange d'article" simple />
                <MenuItem icon={<FileText className="w-5 h-5 lg:w-6 lg:h-6 text-[#F97316]" />} label="Fabricants" simple />
                <MenuItem icon={<FileText className="w-5 h-5 lg:w-6 lg:h-6 text-[#F97316]" />} label="Modes de télépaiement" simple />
                <MenuItem icon={<FileText className="w-5 h-5 lg:w-6 lg:h-6 text-[#F97316]" />} label="Contact" simple />
                <MenuItem icon={<FileText className="w-5 h-5 lg:w-6 lg:h-6 text-[#F97316]" />} label="CGV" simple />
                <MenuItem icon={<FileText className="w-5 h-5 lg:w-6 lg:h-6 text-[#F97316]" />} label="Liste de souhaits" simple />
                <MenuItem icon={<FileText className="w-5 h-5 lg:w-6 lg:h-6 text-[#F97316]" />} label="Déclaration d'accessibilité" simple />
                <MenuItem icon={<FileText className="w-5 h-5 lg:w-6 lg:h-6 text-[#F97316]" />} label="Blog" simple />
                <MenuItem icon={<FileText className="w-5 h-5 lg:w-6 lg:h-6 text-[#F97316]" />} label="Acheter en fonction de la marque" simple />
                <MenuItem icon={<FileText className="w-5 h-5 lg:w-6 lg:h-6 text-[#F97316]" />} label="Acheter en fonction du modèle" simple />
              </div>
            </div>

            {/* Service client */}
            <div className="pb-4 lg:pr-6 lg:w-auto lg:flex-shrink-0 lg:min-w-[220px] min-w-0 transition-all duration-300 ease-in-out">
              <h3 className="text-[#F97316] font-bold text-base lg:text-lg mb-4 lg:mb-6">Service client</h3>
              <div className="space-y-3 lg:space-y-4 text-sm lg:text-base">
                <div className="flex items-start gap-3 lg:gap-4 p-3 lg:p-4 rounded-xl lg:rounded-2xl bg-[#1a1a1a]/50 border border-[#F97316]/20 hover:border-[#F97316]/40 transition-all duration-300">
                  <span className="text-green-500 text-lg lg:text-xl mt-1">●</span>
                  <div>
                    <p className="text-gray-300 lg:text-gray-200 font-medium mb-2">Heures d'ouverture du service client pour la langue:</p>
                    <p className="text-gray-400 lg:text-gray-300">Lundi - Jeudi 8 h 30 à 17 h 00<br />Vendredi 8 h 30 à 16 h 00</p>
                  </div>
                </div>
                <div className="p-3 lg:p-4 rounded-xl lg:rounded-2xl bg-[#1a1a1a]/50 border border-[#F97316]/20">
                  <p className="text-gray-400 lg:text-gray-300 font-medium">Délai de réponse</p>
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* نافذة إضافة رابط جديد */}
      {showAddLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">add New</h3>
              <button
                onClick={() => setShowAddLinkModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              {/* حقل اسم الرابط */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  اسم الرابط *
                </label>
                <input
                  type="text"
                  value={newLinkData.name}
                  onChange={(e) => setNewLinkData({...newLinkData, name: e.target.value})}
                  placeholder="أدخل اسم الرابط"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              {/* حقل رابط الصورة */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  رابط الصورة
                </label>
                <input
                  type="url"
                  value={newLinkData.image}
                  onChange={(e) => setNewLinkData({...newLinkData, image: e.target.value})}
                  placeholder="أدخل رابط الصورة (اختياري)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              {/* حقل رابط الوجهة */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  رابط الوجهة *
                </label>
                <input
                  type="url"
                  value={newLinkData.url}
                  onChange={(e) => setNewLinkData({...newLinkData, url: e.target.value})}
                  placeholder="أدخل رابط الوجهة"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              {/* معاينة الصورة */}
              {newLinkData.image && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    معاينة الصورة
                  </label>
                  <div className="w-16 h-16 border border-gray-300 rounded-md overflow-hidden">
                    <img
                      src={newLinkData.image}
                      alt="معاينة"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* أزرار الإجراءات */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddNewLink}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-md transition-colors"
              >
                إضافة الرابط
              </button>
              <button
                onClick={() => setShowAddLinkModal(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// MenuItem Component
const MenuItem = ({ icon, label, simple = false, hasDropdown = false, dropdownOpen = false, onToggleDropdown, children }: { 
  icon: React.ReactNode; 
  label: string; 
  simple?: boolean; 
  hasDropdown?: boolean;
  dropdownOpen?: boolean;
  onToggleDropdown?: () => void;
  children?: React.ReactNode;
}) => {
  return (
    <div>
      <div 
        className="flex items-center justify-between py-2.5 lg:py-3 px-3 lg:px-4 hover:bg-[#F97316]/20 hover:border-[#F97316]/40 border border-transparent rounded-xl lg:rounded-2xl cursor-pointer transition-all duration-300 ease-in-out group"
        onClick={hasDropdown ? onToggleDropdown : undefined}
      >
        <div className="flex items-center gap-3 lg:gap-4">
          {icon}
          <span className={`${simple ? 'text-sm lg:text-base' : 'text-base lg:text-lg'} text-white group-hover:text-[#F97316] transition-colors font-medium`}>
            {label}
          </span>
        </div>
        {!simple && (
          hasDropdown ? (
            dropdownOpen ? <ChevronUp className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400 group-hover:text-[#F97316] transition-colors" /> : <ChevronDown className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400 group-hover:text-[#F97316] transition-colors" />
          ) : (
            <ChevronDown className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400 group-hover:text-[#F97316] transition-colors" />
          )
        )}
      </div>
      {hasDropdown && dropdownOpen && children && (
        <div className="ml-6 lg:ml-8 mt-2 lg:mt-3 space-y-1 lg:space-y-2">
          {children}
        </div>
      )}
    </div>
  );
};

export default Header;