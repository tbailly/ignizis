import { Calculator } from 'lucide-react';
import { useCompany } from '@/contexts/CompanyContext';
import { useTranslation } from '@/i18n/useTranslation';

export default function Comptabilite() {
  const { currentCompany } = useCompany();
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('accounting.title')}</h1>
        <p className="text-muted-foreground">
          {currentCompany?.company.name}
        </p>
      </div>
      
      <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed rounded-lg bg-muted/20">
        <Calculator className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold text-muted-foreground">
          {t('accounting.sectionTitle')}
        </h2>
        <p className="text-muted-foreground text-center max-w-md mt-2">
          {t('accounting.sectionDescription')}
        </p>
      </div>
    </div>
  );
}
