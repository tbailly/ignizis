import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/i18n/useTranslation';
import { format } from 'date-fns';

export default function Help() {
  const { t } = useTranslation();
  const [html, setHtml] = useState('');
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('legal_pages')
        .select('content_html, updated_at')
        .eq('id', 'help')
        .single();
      setHtml(data?.content_html || '');
      setUpdatedAt(data?.updated_at || null);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('help.title')}</h1>
        {updatedAt && (
          <p className="text-muted-foreground">
            {t('common.lastUpdate')} {format(new Date(updatedAt), 'MMMM dd, yyyy')}
          </p>
        )}
      </div>
      <Card>
        <CardContent className="pt-6">
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
