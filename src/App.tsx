import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import { AnimatePresence, motion } from "framer-motion";
import ProtectedRoute from "@/components/ProtectedRoute";
import ProtectedAdminRoute from "@/components/ProtectedAdminRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import DashboardLayout from "./components/DashboardLayout";
import DashboardHome from "./pages/DashboardHome";
import AIRecommendation from "./pages/AIRecommendation";
import Weather from "./pages/Weather";
import MarketPrices from "./pages/MarketPrices";
import Marketplace from "./pages/Marketplace";
import Chatbot from "./pages/Chatbot";
import Community from "./pages/Community";
import Storage from "./pages/Storage";
import Orders from "./pages/Orders";
import Settings from "./pages/Settings";
import FarmerToMarket from "./pages/FarmerToMarket";
import KnowledgeBase from "./pages/KnowledgeBase";
import MyFarms from "./pages/MyFarms";
import ExpertConsultancy from "./pages/ExpertConsultancy";
import NotFound from "./pages/NotFound";
import AdminAuth from "./pages/AdminAuth";
import AdminPanel from "./pages/AdminPanel";
import AdminSuperDashboard from "./pages/AdminSuperDashboard";
import ShopDashboard from "./pages/ShopDashboard";
import ColdStorageManagement from "./pages/ColdStorageManagement";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
});

/* Page transition wrapper */
const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.18, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
};

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div {...pageTransition}>
      {children}
    </motion.div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="sync">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Index /></PageWrapper>} />
        <Route path="/auth" element={<PageWrapper><Auth /></PageWrapper>} />
        
        {/* Admin & Business Routes */}
        <Route path="/admin/auth" element={<PageWrapper><AdminAuth /></PageWrapper>} />
        <Route path="/admin/panel" element={<ProtectedAdminRoute requiredRole="admin"><AdminPanel /></ProtectedAdminRoute>} />
        <Route path="/admin/super-dashboard" element={<ProtectedAdminRoute requiredRole="admin"><AdminSuperDashboard /></ProtectedAdminRoute>} />
        <Route path="/shop/dashboard" element={<ProtectedAdminRoute requiredRole="shop"><ShopDashboard /></ProtectedAdminRoute>} />
        <Route path="/cold-storage/management" element={<ProtectedAdminRoute requiredRole="coldStorage"><ColdStorageManagement /></ProtectedAdminRoute>} />
        
        {/* Farmer Dashboard Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<PageWrapper><DashboardHome /></PageWrapper>} />
          <Route path="farms" element={<PageWrapper><MyFarms /></PageWrapper>} />
          <Route path="ai" element={<PageWrapper><AIRecommendation /></PageWrapper>} />
          <Route path="weather" element={<PageWrapper><Weather /></PageWrapper>} />
          <Route path="market" element={<PageWrapper><MarketPrices /></PageWrapper>} />
          <Route path="shop" element={<PageWrapper><Marketplace /></PageWrapper>} />
          <Route path="storage" element={<PageWrapper><Storage /></PageWrapper>} />
          <Route path="sell" element={<PageWrapper><FarmerToMarket /></PageWrapper>} />
          <Route path="chat" element={<PageWrapper><Chatbot /></PageWrapper>} />
          <Route path="community" element={<PageWrapper><Community /></PageWrapper>} />
          <Route path="learn" element={<PageWrapper><KnowledgeBase /></PageWrapper>} />
          <Route path="experts" element={<PageWrapper><ExpertConsultancy /></PageWrapper>} />
          <Route path="orders" element={<PageWrapper><Orders /></PageWrapper>} />
          <Route path="settings" element={<PageWrapper><Settings /></PageWrapper>} />
        </Route>
        
        <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AdminAuthProvider>
          <AuthProvider>
            <AnimatedRoutes />
          </AuthProvider>
        </AdminAuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
