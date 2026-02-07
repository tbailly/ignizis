import { Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/i18n/useTranslation';

export default function Confidentialite() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('privacy.title')}</h1>
        <p className="text-muted-foreground">
          {t('privacy.subtitle')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {t('privacy.dataCollectionTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>{t('privacy.dataCollectionIntro')}</p>
          <ul className="list-disc list-inside space-y-1">
            <li>{t('privacy.dataEmail')}</li>
            <li>{t('privacy.dataName')}</li>
            <li>{t('privacy.dataTheme')}</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('privacy.dataUsageTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>{t('privacy.dataUsageIntro')}</p>
          <ul className="list-disc list-inside space-y-1">
            <li>{t('privacy.dataUsageAuth')}</li>
            <li>{t('privacy.dataUsagePersonalize')}</li>
            <li>{t('privacy.dataUsageAccess')}</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('privacy.dataRetentionTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          <p>{t('privacy.dataRetentionText')}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('privacy.rightsTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>{t('privacy.rightsIntro')}</p>
          <ul className="list-disc list-inside space-y-1">
            <li>{t('privacy.rightAccess')}</li>
            <li>{t('privacy.rightRectification')}</li>
            <li>{t('privacy.rightErasure')}</li>
            <li>{t('privacy.rightPortability')}</li>
            <li>{t('privacy.rightObjection')}</li>
          </ul>
          <p className="mt-4">{t('privacy.rightsContact')}</p>
        </CardContent>
      </Card>
    </div>
  );
}
