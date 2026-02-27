import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/i18n/useTranslation';
import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface DeleteDocumentDialogProps {
  document: { id: string; display_name: string; storage_path: string };
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteDocumentDialog({ document, onClose, onSuccess }: DeleteDocumentDialogProps) {
  const { t } = useTranslation();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);

    try {
      // Soft delete (keep storage file for potential restoration)
      const { error: dbError } = await supabase
        .from('documents')
        .update({ deleted_at: new Date().toISOString() } as any)
        .eq('id', document.id);

      if (dbError) throw dbError;

      toast.success(t('admin.documents.deleteSuccess'));
      onSuccess();
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast.error(error.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AlertDialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('admin.documents.deleteConfirmTitle')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('admin.documents.deleteConfirmDesc')}
            <br />
            <strong className="mt-1 block">{document.display_name}</strong>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>{t('common.cancel')}</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {t('admin.documents.deleteConfirmButton')}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
