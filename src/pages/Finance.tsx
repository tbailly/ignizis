import { TrendingUp, ExternalLink, Lock } from 'lucide-react';
import { useCompany } from '@/contexts/CompanyContext';
import { useTranslation } from '@/i18n/useTranslation';
import { Button } from '@/components/ui/button';

export default function Finance() {
  const { currentCompany, hasPermission } = useCompany();
  const { t } = useTranslation();

  if (!hasPermission('finance')) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('finance.title')}</h1>
          <p className="text-muted-foreground">{currentCompany?.company.name}</p>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed rounded-lg bg-muted/20">
          <Lock className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold text-muted-foreground">{t('common.lockedTitle')}</h2>
          <p className="text-muted-foreground text-center max-w-md mt-2">{t('common.lockedDescription')}</p>
        </div>
      </div>
    );
  }

  const softwareUrl = currentCompany?.company.finance_software_url;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('finance.title')}</h1>
        <p className="text-muted-foreground">{currentCompany?.company.name}</p>
      </div>
      <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed rounded-lg bg-muted/20">
        {softwareUrl ? (
          <>
            <TrendingUp className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center max-w-md mb-6">{t('finance.softwareDescription')}</p>
            <Button size="lg" asChild>
              <a href={softwareUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-5 w-5" />
                {t('finance.openSoftware')}
              </a>
            </Button>
          </>
        ) : (
          <>
            <TrendingUp className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-muted-foreground">{t('finance.sectionTitle')}</h2>
            <p className="text-muted-foreground text-center max-w-md mt-2">{t('finance.noSoftwareUrl')}</p>
          </>
        )}
      </div>
    </div>
  );
}
