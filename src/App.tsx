import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";

import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet, useParams, useNavigate, useLocation, Navigate } from "react-router-dom";

import { AuthProvider } from "@/contexts/AuthContext";
import { CompanyProvider, useCompany } from "@/contexts/CompanyContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { I18nProvider } from "@/i18n/I18nContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminRoute } from "@/components/AdminRoute";
import { MainLayout } from "@/components/layout/MainLayout";

// Pages
import Auth from "./pages/Auth";

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

import AdminCompanies from "./pages/admin/AdminCompanies";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminOfficers from "./pages/admin/AdminOfficers";
import AdminDocuments from "./pages/admin/AdminDocuments";
import AdminRequests from "./pages/admin/AdminRequests";

const queryClient = new QueryClient();

/** Layout for all authenticated routes: auth guard + company context + sidebar shell */
function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <CompanyProvider>
        <MainLayout>
          <Outlet />
        </MainLayout>
      </CompanyProvider>
    </ProtectedRoute>
  );
}

/** Reads :companySlug from the URL and syncs it with CompanyContext */
function CompanySlugSync() {
  const { companySlug } = useParams<{ companySlug: string }>();
  const { companies, currentCompany, setCurrentCompany, loading } = useCompany();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || !companySlug || companies.length === 0) return;

    // Already on the right company
    if (currentCompany?.company?.slug === companySlug) return;

    const match = companies.find(c => c.company.slug === companySlug);
    if (match) {
      setCurrentCompany(match);
    } else {
      // Invalid slug → redirect to first company
      navigate(`/${companies[0].company.slug}`, { replace: true });
    }
  }, [companySlug, companies, loading, currentCompany?.company?.slug, setCurrentCompany, navigate]);

  return <Outlet />;
}

/** Redirects `/` to the current (or first) company dashboard */
function RootRedirect() {
  const { companies, currentCompany, loading } = useCompany();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    const target = currentCompany || companies[0];
    if (target?.company?.slug) {
      navigate(`/${target.company.slug}`, { replace: true });
    }
  }, [loading, currentCompany, companies, navigate]);

  return null;
}

function IosSafariPointerFix() {
  useEffect(() => {
    const noop = () => {};
    document.body.addEventListener('pointerdown', noop);
    return () => document.body.removeEventListener('pointerdown', noop);
  }, []);
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <I18nProvider>
            <TooltipProvider>
              <IosSafariPointerFix />
              <Toaster />
              <Sonner />
              <Routes>
                {/* Public route */}
                <Route path="/auth" element={<Auth />} />

                {/* Protected routes with layout */}
                <Route element={<ProtectedLayout />}>
                  {/* Root → redirect to company dashboard */}
                  <Route path="/" element={<RootRedirect />} />

                  {/* Company-scoped routes */}
                  <Route path="/:companySlug" element={<CompanySlugSync />}>
                    <Route index element={<Navigate to="company" replace />} />
                    <Route path="company" element={<Entreprise />} />
                    <Route path="contracts" element={<Contrats />} />
                    <Route path="legal" element={<Juridique />} />
                    <Route path="accounting" element={<Comptabilite />} />
                    <Route path="finance" element={<Finance />} />
                  </Route>

                  {/* User-scoped routes (no slug) */}
                  <Route path="/settings" element={<Parametres />} />
                  <Route path="/help" element={<Aide />} />
                  <Route path="/legal-notice" element={<MentionsLegales />} />
                  <Route path="/privacy" element={<Confidentialite />} />
                  <Route path="/terms" element={<CGU />} />

                  {/* Admin routes */}
                  <Route path="/admin" element={<AdminRoute><Outlet /></AdminRoute>}>
                    <Route index element={<Navigate to="/admin/companies" replace />} />
                    <Route path="companies" element={<AdminCompanies />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="officers" element={<AdminOfficers />} />
                    <Route path="documents" element={<AdminDocuments />} />
                    <Route path="requests" element={<AdminRequests />} />
                  </Route>
                </Route>

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </TooltipProvider>
          </I18nProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
