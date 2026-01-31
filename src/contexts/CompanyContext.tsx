import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface Company {
  id: string;
  name: string;
  owner_id: string;
}

interface UserCompany {
  id: string;
  company_id: string;
  permissions: {
    entreprise: boolean;
    contrats: boolean;
    juridique: boolean;
    comptabilite: boolean;
    finance: boolean;
  };
  company: Company;
}

interface CompanyContextType {
  companies: UserCompany[];
  currentCompany: UserCompany | null;
  setCurrentCompany: (company: UserCompany) => void;
  loading: boolean;
  hasPermission: (section: keyof UserCompany['permissions']) => boolean;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

const CURRENT_COMPANY_KEY = 'current_company_id';

export function CompanyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<UserCompany[]>([]);
  const [currentCompany, setCurrentCompanyState] = useState<UserCompany | null>(null);
  const [loading, setLoading] = useState(true);

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
          permissions,
          company:companies (
            id,
            name,
            owner_id
          )
        `);

      if (error) {
        console.error('Error fetching companies:', error);
        return;
      }

      const userCompanies = (data || []).map((item: any) => ({
        id: item.id,
        company_id: item.company_id,
        permissions: item.permissions,
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

  const setCurrentCompany = (company: UserCompany) => {
    setCurrentCompanyState(company);
    localStorage.setItem(CURRENT_COMPANY_KEY, company.company_id);
  };

  const hasPermission = (section: keyof UserCompany['permissions']): boolean => {
    if (!currentCompany) return false;
    return currentCompany.permissions[section] === true;
  };

  return (
    <CompanyContext.Provider value={{ 
      companies, 
      currentCompany, 
      setCurrentCompany, 
      loading,
      hasPermission 
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
