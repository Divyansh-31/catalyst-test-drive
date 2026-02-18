import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Checkout from "./pages/Checkout";
import Dashboard from "./pages/Dashboard";
import DashboardOverview from "./pages/DashboardOverview";
import DashboardOrders from "./pages/DashboardOrders";
import DashboardPayments from "./pages/DashboardPayments";
import DashboardSecurity from "./pages/DashboardSecurity";
import DashboardSettings from "./pages/DashboardSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

import { useFraudXSocket } from "@/hooks/useFraudXSocket";

const App = () => {
  useFraudXSocket(); // Global FraudX listener

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <CartProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/checkout" element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }>
                  <Route index element={<DashboardOverview />} />
                  <Route path="orders" element={<DashboardOrders />} />
                  <Route path="payments" element={<DashboardPayments />} />
                  <Route path="security" element={<DashboardSecurity />} />
                  <Route path="settings" element={<DashboardSettings />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
