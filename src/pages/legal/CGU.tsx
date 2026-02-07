import { FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/i18n/useTranslation';

export default function CGU() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('terms.title')}</h1>
        <p className="text-muted-foreground">
          {t('terms.lastUpdated')} {new Date().toLocaleDateString('en-US')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t('terms.article1Title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          <p>{t('terms.article1Text')}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('terms.article2Title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>{t('terms.article2Text1')}</p>
          <p>{t('terms.article2Text2')}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('terms.article3Title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            <strong className="text-foreground">{t('terms.article3Publisher')}</strong>
            {t('terms.article3PublisherText')}
          </p>
          <p>
            <strong className="text-foreground">{t('terms.article3User')}</strong>
            {t('terms.article3UserText')}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('terms.article4Title')}</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          <p>{t('terms.article4Text')}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('terms.article5Title')}</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          <p>{t('terms.article5Text')}</p>
        </CardContent>
      </Card>
    </div>
  );
}
