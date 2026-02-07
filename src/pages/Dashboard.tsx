import { useCompany } from '@/contexts/CompanyContext';
import { Building2, FileText, Scale, Calculator, TrendingUp } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/i18n/useTranslation';

export default function Dashboard() {
  const { currentCompany, hasPermission, companyPath } = useCompany();
  const { t } = useTranslation();

  const sections = [
    { title: t('dashboard.sectionCompany'), path: '/company', icon: Building2, permission: 'entreprise' as const, description: t('dashboard.sectionCompanyDesc') },
    { title: t('dashboard.sectionContracts'), path: '/contracts', icon: FileText, permission: 'contrats' as const, description: t('dashboard.sectionContractsDesc') },
    { title: t('dashboard.sectionLegal'), path: '/legal', icon: Scale, permission: 'legal' as const, description: t('dashboard.sectionLegalDesc') },
    { title: t('dashboard.sectionAccounting'), path: '/accounting', icon: Calculator, permission: 'accounting' as const, description: t('dashboard.sectionAccountingDesc') },
    { title: t('dashboard.sectionFinance'), path: '/finance', icon: TrendingUp, permission: 'finance' as const, description: t('dashboard.sectionFinanceDesc') },
  ];

  const visibleSections = sections.filter(s => hasPermission(s.permission));

  if (!currentCompany) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.welcome')}</h1>
          <p className="text-muted-foreground">
            {t('dashboard.noCompany')}
          </p>
        </div>
        
        <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed rounded-lg bg-muted/20">
          <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold text-muted-foreground">
            {t('dashboard.noCompanyTitle')}
          </h2>
          <p className="text-muted-foreground text-center max-w-md mt-2">
            {t('dashboard.noCompanyDescription')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {currentCompany.company.name}
        </h1>
        <p className="text-muted-foreground">
          {t('dashboard.accessSections')}
        </p>
      </div>

      {visibleSections.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visibleSections.map((section) => (
            <NavLink key={section.path} to={companyPath(section.path)}>
              <Card className="h-full transition-colors hover:bg-muted/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <section.icon className="h-5 w-5" />
                    {section.title}
                  </CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
              </Card>
            </NavLink>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed rounded-lg bg-muted/20">
          <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold text-muted-foreground">
            {t('dashboard.noAccess')}
          </h2>
          <p className="text-muted-foreground text-center max-w-md mt-2">
            {t('dashboard.noAccessDescription')}
          </p>
        </div>
      )}
    </div>
  );
}
