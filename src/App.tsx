import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CompanyProvider } from "@/contexts/CompanyContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { MainLayout } from "@/components/layout/MainLayout";

// Pages
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Entreprise from "./pages/Entreprise";
import Contrats from "./pages/Contrats";
import Juridique from "./pages/Juridique";
import Comptabilite from "./pages/Comptabilite";
import Finance from "./pages/Finance";
import Parametres from "./pages/Parametres";
import Aide from "./pages/Aide";
import MentionsLegales from "./pages/legal/MentionsLegales";
import Confidentialite from "./pages/legal/Confidentialite";
import CGU from "./pages/legal/CGU";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <CompanyProvider>
        <MainLayout>{children}</MainLayout>
      </CompanyProvider>
    </ProtectedRoute>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              {/* Public route */}
              <Route path="/auth" element={<Auth />} />
              
              {/* Protected routes with layout */}
              <Route path="/" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
              <Route path="/entreprise" element={<ProtectedLayout><Entreprise /></ProtectedLayout>} />
              <Route path="/contrats" element={<ProtectedLayout><Contrats /></ProtectedLayout>} />
              <Route path="/juridique" element={<ProtectedLayout><Juridique /></ProtectedLayout>} />
              <Route path="/comptabilite" element={<ProtectedLayout><Comptabilite /></ProtectedLayout>} />
              <Route path="/finance" element={<ProtectedLayout><Finance /></ProtectedLayout>} />
              <Route path="/parametres" element={<ProtectedLayout><Parametres /></ProtectedLayout>} />
              <Route path="/aide" element={<ProtectedLayout><Aide /></ProtectedLayout>} />
              <Route path="/mentions-legales" element={<ProtectedLayout><MentionsLegales /></ProtectedLayout>} />
              <Route path="/confidentialite" element={<ProtectedLayout><Confidentialite /></ProtectedLayout>} />
              <Route path="/cgu" element={<ProtectedLayout><CGU /></ProtectedLayout>} />
              
              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
