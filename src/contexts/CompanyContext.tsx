import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

type PermissionKey = 'entreprise' | 'contrats' | 'legal' | 'accounting' | 'finance';

interface Company {
  id: string;
  name: string;
  slug: string;
  perm_legal: boolean;
  perm_accounting: boolean;
  perm_finance: boolean;
}

interface UserCompany {
  id: string;
  company_id: string;
  company: Company;
}

interface CompanyContextType {
  companies: UserCompany[];
  currentCompany: UserCompany | null;
  setCurrentCompany: (company: UserCompany) => void;
  loading: boolean;
  switching: boolean;
  hasPermission: (section: PermissionKey) => boolean;
  companyPath: (path: string) => string;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

const CURRENT_COMPANY_KEY = 'current_company_id';

export function CompanyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<UserCompany[]>([]);
  const [currentCompany, setCurrentCompanyState] = useState<UserCompany | null>(null);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);
  const currentCompanyRef = useRef<UserCompany | null>(null);

  useEffect(() => {
    if (user) {
      fetchCompanies();
    } else {
      setCompanies([]);
      setCurrentCompanyState(null);
      setLoading(false);
    }
  }, [user]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('user_companies')
        .select(`
          id,
          company_id,
          company:companies (
            id,
            name,
            slug,
            perm_legal,
            perm_accounting,
            perm_finance
          )
        `);

      if (error) {
        console.error('Error fetching companies:', error);
        return;
      }

      const userCompanies = (data || []).map((item: any) => ({
        id: item.id,
        company_id: item.company_id,
        company: item.company,
      }));

      setCompanies(userCompanies);

      // Restore last selected company from localStorage
      const savedCompanyId = localStorage.getItem(CURRENT_COMPANY_KEY);
      const savedCompany = userCompanies.find(c => c.company_id === savedCompanyId);
      
      if (savedCompany) {
        setCurrentCompanyState(savedCompany);
      } else if (userCompanies.length > 0) {
        setCurrentCompanyState(userCompanies[0]);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  // Keep ref in sync
  useEffect(() => {
    currentCompanyRef.current = currentCompany;
  }, [currentCompany]);

  const setCurrentCompany = useCallback((company: UserCompany) => {
    if (company.company_id === currentCompanyRef.current?.company_id) return;
    setSwitching(true);
    setCurrentCompanyState(company);
    localStorage.setItem(CURRENT_COMPANY_KEY, company.company_id);
    setTimeout(() => setSwitching(false), 800);
  }, []);

  const hasPermission = useCallback((section: PermissionKey): boolean => {
    if (!currentCompany?.company) return false;
    switch (section) {
      case 'entreprise':
      case 'contrats':
        return true;
      case 'legal':
        return currentCompany.company.perm_legal === true;
      case 'accounting':
        return currentCompany.company.perm_accounting === true;
      case 'finance':
        return currentCompany.company.perm_finance === true;
      default:
        return false;
    }
  }, [currentCompany]);

  const companyPath = useCallback((path: string): string => {
    if (!currentCompany?.company?.slug) return path;
    return `/${currentCompany.company.slug}${path}`;
  }, [currentCompany]);

  return (
    <CompanyContext.Provider value={{ 
      companies, 
      currentCompany, 
      setCurrentCompany, 
      loading,
      switching,
      hasPermission,
      companyPath,
    }}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
}
