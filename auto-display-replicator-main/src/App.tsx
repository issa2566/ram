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
import HuilesAuto from "./pages/HuilesAuto";
import ProductDetail from "./pages/ProductDetail";
import StockManagement from "./pages/StockManagement";
import FiltresPage from "./pages/FiltresPage";
import Sihem from "./pages/Sihem";
import FiltersCatalogue from "./pages/FiltersCatalogue";
import AdminFiltersPage from "./pages/AdminFiltersPage";
import FilterPage from "./pages/FilterPage";
import AdminDashboard from "./pages/AdminDashboard";
import Cart from "./pages/Cart";
import NotFound from "./pages/NotFound";
import BrandPartsPage from "./pages/BrandPartsPage";
import CategoryPage from "./pages/CategoryPage";
import SearchResults from "./pages/SearchResults";
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
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
        <SearchProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/catalogue" element={<Catalogue />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/huiles-auto" element={<HuilesAuto />} />
            <Route path="/product-detail/:productId" element={<ProductDetail />} />
            <Route path="/stock-management" element={<StockManagement />} />
            <Route path="/filtres" element={<FiltresPage />} />
            <Route path="/sihem" element={<Sihem />} />
            <Route path="/filters-catalogue" element={<FiltersCatalogue />} />
            <Route path="/admin-filters" element={<AdminFiltersPage />} />
            <Route path="/filter/:filterId" element={<FilterPage />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/panier" element={<Cart />} />
            <Route path="/brand/:brandName/parts" element={<BrandPartsPage />} />
            <Route path="/category/:categoryName" element={<CategoryPage />} />
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
