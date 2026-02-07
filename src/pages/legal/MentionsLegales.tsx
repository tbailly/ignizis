import { Scale } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/i18n/useTranslation';

export default function MentionsLegales() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('legalNotice.title')}</h1>
        <p className="text-muted-foreground">
          {t('legalNotice.subtitle')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            {t('legalNotice.publisherTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p><strong className="text-foreground">{t('legalNotice.companyName')}</strong> [Company Name]</p>
          <p><strong className="text-foreground">{t('legalNotice.legalForm')}</strong> [Legal Form]</p>
          <p><strong className="text-foreground">{t('legalNotice.shareCapital')}</strong> [Capital] €</p>
          <p><strong className="text-foreground">{t('legalNotice.headquarters')}</strong> [Full Address]</p>
          <p><strong className="text-foreground">{t('legalNotice.rcs')}</strong> [RCS Number]</p>
          <p><strong className="text-foreground">{t('legalNotice.siret')}</strong> [SIRET Number]</p>
          <p><strong className="text-foreground">{t('legalNotice.vatNumber')}</strong> [VAT Number]</p>
          <p><strong className="text-foreground">{t('legalNotice.publicationDirector')}</strong> [Director Name]</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('legalNotice.hostingTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p><strong className="text-foreground">{t('legalNotice.hostingName')}</strong> [Hosting Provider]</p>
          <p><strong className="text-foreground">{t('legalNotice.hostingAddress')}</strong> [Hosting Address]</p>
        </CardContent>
      </Card>
    </div>
  );
}
