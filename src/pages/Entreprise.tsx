import { useEffect, useState } from 'react';
import { Building2, Copy, Check, Users } from 'lucide-react';
import { useCompany } from '@/contexts/CompanyContext';
import { useTranslation } from '@/i18n/useTranslation';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface Officer {
  id: string;
  last_name: string;
  first_name: string;
  date_of_birth: string | null;
  position: string;
}

const COUNTRY_MAP: Record<string, string> = {
  FR: 'France',
  AE: 'UAE',
  HK: 'Hong Kong',
  CH: 'Switzerland',
  BE: 'Belgium',
  US: 'United States',
};

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const { t } = useTranslation();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success(t('company.copied'));
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="ml-2 inline-flex items-center justify-center rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      aria-label="Copy"
    >
      {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
    </button>
  );
}

function isoToDisplay(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

export default function Entreprise() {
  const { currentCompany } = useCompany();
  const { t } = useTranslation();
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loadingOfficers, setLoadingOfficers] = useState(true);

  useEffect(() => {
    if (!currentCompany?.company_id) {
      setOfficers([]);
      setLoadingOfficers(false);
      return;
    }

    const fetchOfficers = async () => {
      setLoadingOfficers(true);
      const { data, error } = await supabase
        .from('company_officers')
        .select('id, last_name, first_name, date_of_birth, position')
        .eq('company_id', currentCompany.company_id);

      if (!error && data) {
        setOfficers(data);
      }
      setLoadingOfficers(false);
    };

    fetchOfficers();
  }, [currentCompany?.company_id]);

  const company = currentCompany?.company;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('company.title')}</h1>
        <p className="text-muted-foreground">{company?.name}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Company details card */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5 text-primary" />
              {t('company.details')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Name */}
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('admin.companies.name')}</p>
              <p className="text-sm mt-0.5">{company?.name || '—'}</p>
            </div>

            <Separator />

            {/* Address */}
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('admin.companies.address')}</p>
              <div className="flex items-center mt-0.5">
                <p className="text-sm">{company?.address || '—'}</p>
                {company?.address && <CopyButton value={company.address} />}
              </div>
            </div>

            <Separator />

            {/* Company number */}
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('admin.companies.companyNumber')}</p>
              <div className="flex items-center mt-0.5">
                <p className="text-sm">{company?.company_number || '—'}</p>
                {company?.company_number && <CopyButton value={company.company_number} />}
              </div>
            </div>

            <Separator />

            {/* Country */}
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('admin.companies.country')}</p>
              <p className="text-sm mt-0.5">
                {company?.country ? COUNTRY_MAP[company.country] || company.country : '—'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Officers card */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-primary" />
              {t('admin.companies.officers')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingOfficers ? (
              <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
            ) : officers.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('admin.companies.noOfficers')}</p>
            ) : (
              <div className="space-y-4">
                {officers.map((officer, idx) => (
                  <div key={officer.id}>
                    {idx > 0 && <Separator className="mb-4" />}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {t('admin.companies.officerLastName')}
                        </p>
                        <p className="text-sm mt-0.5">{officer.last_name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {t('admin.companies.officerFirstName')}
                        </p>
                        <p className="text-sm mt-0.5">{officer.first_name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {t('admin.companies.officerDob')}
                        </p>
                        <p className="text-sm mt-0.5">
                          {officer.date_of_birth ? isoToDisplay(officer.date_of_birth) : '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {t('admin.companies.officerPosition')}
                        </p>
                        <p className="text-sm mt-0.5">{officer.position}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
