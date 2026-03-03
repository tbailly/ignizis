import { useEffect, useState } from 'react';
import { Scale } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/i18n/useTranslation';

export default function MentionsLegales() {
  const { t } = useTranslation();
  const [html, setHtml] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('legal_pages')
        .select('content_html')
        .eq('id', 'legal-notice')
        .single();
      setHtml(data?.content_html || '');
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('legalNotice.title')}</h1>
        <p className="text-muted-foreground">{t('legalNotice.subtitle')}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            {t('legalNotice.publisherTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-40 w-full" />
          ) : html ? (
            <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: html }} />
          ) : (
            <p className="text-muted-foreground italic">{t('adminLegal.noContent')}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
