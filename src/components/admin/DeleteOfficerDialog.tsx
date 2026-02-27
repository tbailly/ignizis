import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/i18n/useTranslation';
import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface DeleteOfficerDialogProps {
  officer: { id: string; first_name: string; last_name: string };
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteOfficerDialog({ officer, onClose, onSuccess }: DeleteOfficerDialogProps) {
  const { t } = useTranslation();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);

    try {
      const { error } = await supabase
        .from('company_officers')
        .update({ deleted_at: new Date().toISOString() } as any)
        .eq('id', officer.id);

      if (error) throw error;

      toast.success(t('admin.officers.deleteSuccess'));
      onSuccess();
    } catch (error: any) {
      console.error('Error deleting officer:', error);
      toast.error(error.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AlertDialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('admin.officers.deleteConfirmTitle')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('admin.officers.deleteConfirmDesc')}
            <br />
            <strong className="mt-1 block">{officer.first_name} {officer.last_name}</strong>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>{t('common.cancel')}</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {t('admin.officers.deleteConfirmButton')}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
