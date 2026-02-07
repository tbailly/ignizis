import { Shield } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';

export default function AdminDashboard() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          {t('admin.title')}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t('admin.description')}
        </p>
      </div>

      <div className="rounded-lg border bg-card p-8 text-center">
        <Shield className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <h2 className="text-xl font-semibold mb-2">{t('admin.dashboard')}</h2>
        <p className="text-muted-foreground">
          {t('admin.placeholder')}
        </p>
      </div>
    </div>
  );
}
