import { useEffect, useState } from 'react';
import { format, parseISO, isFuture, differenceInCalendarDays } from 'date-fns';
import { Building2, Copy, Check, Users } from 'lucide-react';
import { useCompany } from '@/contexts/CompanyContext';
import { useTranslation } from '@/i18n/useTranslation';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import DocumentsSection from '@/components/company/DocumentsSection';

interface Officer {
  id: string;
  last_name: string;
  first_name: string;
  date_of_birth: string | null;
  birth_city: string;
  position: string;
  compliant_until: string | null;
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

function isoToMonthYear(iso: string): string {
  return format(parseISO(iso), 'MMMM yyyy');
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
      try {
        // Load officers assigned to this company via junction table
        const { data, error } = await (supabase
          .from('officer_company_assignments' as any)
          .select('officer_id, company_officers:officer_id(id, last_name, first_name, date_of_birth, birth_city, position, compliant_until)')
          .eq('company_id', currentCompany.company_id) as any);

        if (error) {
          console.error('Error fetching officers:', error);
          setOfficers([]);
          return;
        }

        const result: Officer[] = (data || [])
          .map((a: any) => a.company_officers)
          .filter(Boolean);

        setOfficers(result);
      } catch (err) {
        console.error('Error fetching officers:', err);
        setOfficers([]);
      } finally {
        setLoadingOfficers(false);
      }
    };

    fetchOfficers();
  }, [currentCompany?.company_id]);

  const company = currentCompany?.company;

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{t('company.title')}</h1>
        <p className="text-muted-foreground">{company?.name}</p>
      </div>

      <div className="grid gap-4 md:gap-6 md:grid-cols-2">
        {/* Company details card */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between text-lg">
              <span className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                {t('company.details')}
              </span>
              {company?.compliant_until && isFuture(parseISO(company.compliant_until as string)) ? (
                <Badge variant="success">
                  {t('admin.companies.compliant')}
                </Badge>
              ) : (
                <Badge variant="danger">
                  {t('admin.companies.nonCompliant')}
                </Badge>
              )}
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
                    <div className="space-y-0.5">
                        <div className="flex items-start justify-between gap-2">
                         <p className="text-sm font-medium min-w-0">
                           <span className="font-semibold">{officer.last_name.toUpperCase()}</span>{' '}
                           {officer.first_name}
                         </p>
                         {officer.compliant_until && isFuture(parseISO(officer.compliant_until)) ? (
                           <Badge variant="success" className="shrink-0">
                             {t('admin.officers.compliant')} ({differenceInCalendarDays(parseISO(officer.compliant_until), new Date())}j)
                           </Badge>
                         ) : (
                           <Badge variant="danger" className="shrink-0">
                             {t('admin.officers.nonCompliant')}
                           </Badge>
                         )}
                      </div>
                      <p className="text-sm text-muted-foreground">{officer.position}</p>
                      <p className="text-sm text-muted-foreground">
                        {officer.date_of_birth && officer.birth_city?.trim()
                          ? `Born on ${isoToMonthYear(officer.date_of_birth)} in ${officer.birth_city.trim()}`
                          : officer.date_of_birth
                            ? `Born on ${isoToMonthYear(officer.date_of_birth)}`
                            : officer.birth_city?.trim()
                              ? `Born in ${officer.birth_city.trim()}`
                              : '—'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <DocumentsSection companyId={company?.id} />
    </div>
  );
}
