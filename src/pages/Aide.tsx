import { HelpCircle, Mail, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/i18n/useTranslation';

export default function Aide() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('help.title')}</h1>
        <p className="text-muted-foreground">
          {t('help.subtitle')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            {t('help.faq')}
          </CardTitle>
          <CardDescription>
            {t('help.faqSubtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">{t('help.faq1Question')}</h3>
            <p className="text-muted-foreground text-sm">
              {t('help.faq1Answer')}
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">{t('help.faq2Question')}</h3>
            <p className="text-muted-foreground text-sm">
              {t('help.faq2Answer')}
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">{t('help.faq3Question')}</h3>
            <p className="text-muted-foreground text-sm">
              {t('help.faq3Answer')}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            {t('help.contactTitle')}
          </CardTitle>
          <CardDescription>
            {t('help.contactSubtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <span>{t('help.contactEmail')}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
