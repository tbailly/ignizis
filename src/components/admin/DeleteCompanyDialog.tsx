import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/i18n/useTranslation';
import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DeleteCompanyDialogProps {
  company: { id: string; name: string; slug: string };
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteCompanyDialog({ company, onClose, onSuccess }: DeleteCompanyDialogProps) {
  const { t } = useTranslation();
  const [confirmSlug, setConfirmSlug] = useState('');
  const [deleting, setDeleting] = useState(false);

  const canDelete = confirmSlug === company.slug;

  const handleDelete = async () => {
    if (!canDelete) return;
    setDeleting(true);

    try {
      const { error } = await supabase.rpc('soft_delete_company' as any, {
        p_company_id: company.id,
      });

      if (error) throw error;

      toast.success(t('admin.companies.deleteSuccess'));
      onSuccess();
    } catch (error: any) {
      console.error('Error deleting company:', error);
      toast.error(error.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AlertDialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('admin.companies.deleteConfirmTitle')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('admin.companies.deleteConfirmDesc')}
            <code className="ml-1 rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
              {company.slug}
            </code>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Input
          value={confirmSlug}
          onChange={(e) => setConfirmSlug(e.target.value)}
          placeholder={company.slug}
        />

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>{t('admin.companies.cancel')}</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!canDelete || deleting}
          >
            {t('admin.companies.deleteConfirmButton')}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
