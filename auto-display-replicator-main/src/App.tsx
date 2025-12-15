import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { SearchProvider } from "./contexts/SearchContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Catalogue from "./pages/Catalogue";
import StockManagement from "./pages/StockManagement";
import FiltresPage from "./pages/FiltresPage";
import Sihem from "./pages/Sihem";
import FiltersCatalogue from "./pages/FiltersCatalogue";
import AdminFiltersPage from "./pages/AdminFiltersPage";
import FilterPage from "./pages/FilterPage";
import AdminDashboard from "./pages/AdminDashboard";
import ProductsPage from "./pages/ProductsPage";
import AdminProducts from "./pages/admin/AdminProducts";
import Produits2 from "./pages/admin/Produits2";
import Cart from "./pages/Cart";
import NotFound from "./pages/NotFound";
import BrandPartsPage from "./pages/BrandPartsPage";
import CategoryPage from "./pages/CategoryPage";
import SearchResults from "./pages/SearchResults";
import Catalogue2 from "./pages/catalogue2";
import PiecesDispo from "./pages/PiecesDispo";
import Acha from "./pages/Acha";
import Acha2 from "./pages/acha2";
import HuilePage from "./pages/huile";
import WhatsAppButton from "./components/WhatsAppButton";
// Database initialization removed - using localStorage instead

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on AbortError
        if (error?.name === 'AbortError') {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      // Disable stale time for subcategories - always fresh
      staleTime: 0,
    },
    mutations: {
      retry: (failureCount, error) => {
        // Don't retry on AbortError
        if (error?.name === 'AbortError') {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});

// Listen for subcategory/category updates and invalidate React Query cache
if (typeof window !== 'undefined') {
  // Same-tab events
  window.addEventListener('subcategories-updated', () => {
    console.log('🔄 React Query: Invalidating subcategories cache');
    queryClient.invalidateQueries({ queryKey: ['subcategories'] });
  });
  
  window.addEventListener('categories-updated', () => {
    console.log('🔄 React Query: Invalidating categories cache');
    queryClient.invalidateQueries({ queryKey: ['categories'] });
    queryClient.invalidateQueries({ queryKey: ['subcategories'] });
  });
  
  // Cross-tab communication via BroadcastChannel
  try {
    const subcategoriesChannel = new BroadcastChannel('subcategories-updates');
    subcategoriesChannel.addEventListener('message', (event) => {
      if (event.data?.type === 'refresh') {
        console.log('🔄 React Query: Cross-tab subcategories refresh');
        queryClient.invalidateQueries({ queryKey: ['subcategories'] });
      }
    });
    
    const categoriesChannel = new BroadcastChannel('categories-updates');
    categoriesChannel.addEventListener('message', (event) => {
      if (event.data?.type === 'refresh') {
        console.log('🔄 React Query: Cross-tab categories refresh');
        queryClient.invalidateQueries({ queryKey: ['categories'] });
        queryClient.invalidateQueries({ queryKey: ['subcategories'] });
      }
    });
  } catch (e) {
    console.warn('BroadcastChannel not supported in App.tsx');
  }
}

const App = () => {
  // App initialization - using localStorage for data persistence
  
  // Handle unhandled promise rejections
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Ignore AbortError from media elements
      if (event.reason?.name === 'AbortError') {
        event.preventDefault();
        return;
      }
      
      // Log other errors for debugging
      console.warn('Unhandled promise rejection:', event.reason);
    };

    const handleError = (event: ErrorEvent) => {
      // Ignore AbortError from media elements
      if (event.error?.name === 'AbortError') {
        event.preventDefault();
        return;
      }
      
      // Log other errors for debugging
      console.warn('Unhandled error:', event.error);
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <SearchProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/catalogue" element={<Catalogue />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/stock-management" element={<StockManagement />} />
              <Route path="/filtres" element={<FiltresPage />} />
              <Route path="/sihem" element={<Sihem />} />
              <Route path="/filters-catalogue" element={<FiltersCatalogue />} />
              <Route path="/admin-filters" element={<AdminFiltersPage />} />
              <Route path="/filter/:filterId" element={<FilterPage />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/admin-produits2" element={<Produits2 />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/panier" element={<Cart />} />
              <Route path="/brand/:brandName/parts" element={<BrandPartsPage />} />
              <Route path="/category/:categoryName" element={<CategoryPage />} />
              <Route path="/catalogue2/:marque" element={<Catalogue2 />} />
              <Route path="/pieces-dispo/:modelId" element={<PiecesDispo />} />
              <Route path="/acha/:subId" element={<Acha />} />
              <Route path="/acha2" element={<Acha2 />} />
              <Route path="/huile" element={<HuilePage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            {/* WhatsApp Floating Button - يظهر في جميع الصفحات */}
            <WhatsAppButton />
          </SearchProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
